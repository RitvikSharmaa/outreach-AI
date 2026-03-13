from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime
import uuid
from typing import Optional

from config import get_settings
from models import *
from database.supabase_client import get_supabase
from agents.company_research import get_company_research_agent
from agents.email_personalization import get_email_personalization_agent
from agents.news_intelligence import get_news_intelligence_agent
from agents.contact_discovery import get_contact_discovery_agent
from services.email_sender import get_email_sender

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 Starting {settings.app_name}")
    print(f"📍 Environment: {settings.environment}")
    yield
    # Shutdown
    print("👋 Shutting down")

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        settings.app_url
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.environment,
        "timestamp": datetime.now().isoformat()
    }

# Auth Helper
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current user from Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Extract token from "Bearer <token>" format
        token = authorization.replace("Bearer ", "")
        
        # Decode JWT token to get user_id without calling Supabase API
        # This is more reliable and faster
        import jwt
        import json
        
        # Decode without verification (Supabase already verified it when issuing)
        # We just need to extract the user_id
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub")  # 'sub' contains the user ID in JWT
            
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token: no user ID")
            
            print(f"✅ Authenticated user: {user_id}")
            return user_id
            
        except jwt.DecodeError:
            raise HTTPException(status_code=401, detail="Invalid token format")
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=401, detail="Authentication failed")

# Campaign Endpoints
@app.post("/api/campaigns")
async def create_campaign(campaign: CampaignCreate, user_id: str = Depends(get_current_user)):
    """Create a new campaign"""
    try:
        print(f"=== CREATE CAMPAIGN for user: {user_id} ===")
        supabase = get_supabase()
        
        if supabase is None:
            raise HTTPException(status_code=503, detail="Database not available")
        
        campaign_id = str(uuid.uuid4())
        
        data = {
            "id": campaign_id,
            "user_id": user_id,
            "name": campaign.name,
            "status": "draft",
            "target_url": campaign.target_url,
            "company_data": {},
            "news_data": {},
            "contacts_data": [],
            "total_prospects": 0,
            "emails_sent": 0,
            "emails_opened": 0,
            "emails_replied": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        print(f"Creating campaign with user_id: {user_id}")
        result = supabase.table("campaigns").insert(data).execute()
        
        if not result.data:
            print(f"❌ Failed to create campaign: {result}")
            raise HTTPException(status_code=500, detail="Failed to create campaign in database")
            
        print(f"✅ Campaign created: {result.data[0]['id']}")
        return result.data[0]
    except Exception as e:
        print(f"❌ Error creating campaign: {e}")
        import traceback
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/campaigns")
async def list_campaigns(user_id: str = Depends(get_current_user)):
    """List all campaigns for the current user"""
    try:
        supabase = get_supabase()
        result = supabase.table("campaigns").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        print(f"Error listing campaigns: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/campaigns/{campaign_id}")
async def get_campaign(campaign_id: str, user_id: str = Depends(get_current_user)):
    """Get campaign details"""
    if campaign_id == "undefined" or not campaign_id:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")
    
    supabase = get_supabase()
    result = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    return result.data[0]

@app.post("/api/campaigns/{campaign_id}/research")
async def research_campaign(campaign_id: str, user_id: str = Depends(get_current_user)):
    """Trigger AI research pipeline for a campaign"""
    try:
        print(f"=== RESEARCH CAMPAIGN {campaign_id} for user: {user_id} ===")
        if campaign_id == "undefined":
            print("❌ Received 'undefined' campaign_id")
            raise HTTPException(status_code=400, detail="Invalid campaign ID")

        supabase = get_supabase()
        # Verify campaign belongs to user
        campaign_result = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
        
        if not campaign_result.data:
            print(f"❌ Campaign {campaign_id} not found for user {user_id}")
            raise HTTPException(status_code=404, detail="Campaign not found")
            
        campaign = campaign_result.data[0]
        print(f"Researching URL: {campaign['target_url']}")
        
        # Update status to researching
        supabase.table("campaigns").update({
            "status": "researching",
            "updated_at": datetime.now().isoformat()
        }).eq("id", campaign_id).execute()
        
        # Step 1: Run company research agent
        print("Step 1: Company research...")
        research_agent = get_company_research_agent()
        company_data = await research_agent.research(campaign["target_url"])
        print(f"Company research complete: {company_data.get('name', 'Unknown')}")
        
        # Step 2: Run news intelligence agent
        print("Step 2: News intelligence...")
        from agents.news_intelligence import get_news_intelligence_agent
        news_data = await get_news_intelligence_agent(
            company_data.get('name', 'Unknown Company'),
            company_data.get('industry', 'Unknown')
        )
        print(f"Found {len(news_data.get('articles', []))} news articles")
        
        # Step 3: Run contact discovery agent
        print("Step 3: Contact discovery...")
        from agents.contact_discovery import get_contact_discovery_agent
        contacts_data = await get_contact_discovery_agent(
            company_data.get('name', 'Unknown Company'),
            campaign["target_url"],
            company_data  # Pass company data for better context
        )
        print(f"Found {len(contacts_data.get('contacts', []))} contacts")
        
        # Step 4: Create prospects in database
        print("Step 4: Creating prospects...")
        prospects_created = 0
        for contact in contacts_data.get('contacts', []):
            try:
                # Support both 'email' and 'email_pattern' fields
                email = contact.get('email') or contact.get('email_pattern', '')
                
                prospect_data = {
                    "id": str(uuid.uuid4()),
                    "campaign_id": campaign_id,
                    "user_id": campaign["user_id"],  # Add user_id from campaign
                    "name": contact.get('name', 'Unknown'),
                    "email": email,
                    "title": contact.get('title', ''),
                    "department": contact.get('department', ''),
                    "company_name": company_data.get('name', 'Unknown'),
                    "status": "new",
                    "current_step": 0,
                    "created_at": datetime.now().isoformat()
                }
                
                supabase.table("prospects").insert(prospect_data).execute()
                prospects_created += 1
                print(f"Created prospect: {contact.get('name')} ({email})")
            except Exception as e:
                print(f"Error creating prospect {contact.get('name')}: {e}")
                continue
        
        print(f"Created {prospects_created} prospects")
        
        # Update campaign with all research data
        supabase.table("campaigns").update({
            "status": "draft",
            "company_data": company_data,
            "news_data": news_data,
            "contacts_data": contacts_data.get('contacts', []),
            "total_prospects": prospects_created,
            "updated_at": datetime.now().isoformat()
        }).eq("id", campaign_id).execute()
        
        return {
            "status": "completed",
            "company_data": company_data,
            "news_data": news_data,
            "contacts_data": contacts_data
        }
    except Exception as e:
        print(f"ERROR in research: {e}")
        import traceback
        traceback.print_exc()
        # Update campaign status to error
        try:
            supabase.table("campaigns").update({
                "status": "error",
                "updated_at": datetime.now().isoformat()
            }).eq("id", campaign_id).execute()
        except:
            pass
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/campaigns/{campaign_id}/generate")
async def generate_emails(campaign_id: str, request: EmailGenerateRequest, user_id: str = Depends(get_current_user)):
    """Generate email sequence for a campaign"""
    try:
        print(f"=== GENERATE EMAILS for campaign {campaign_id} ===")
        
        if campaign_id == "undefined" or not campaign_id:
            raise HTTPException(status_code=400, detail="Invalid campaign ID")
        
        supabase = get_supabase()
        
        # Get campaign and verify ownership
        campaign_result = supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = campaign_result.data[0]
        company_data = campaign.get("company_data", {})
        
        if not company_data:
            raise HTTPException(status_code=400, detail="No company data available. Run research first.")
        
        print(f"Generating email sequence for {company_data.get('name', 'Unknown')}")
        
        # Generate emails
        email_agent = get_email_personalization_agent()
        emails = email_agent.generate_sequence(
            company_data=company_data,
            product_description=request.product_description
        )
        
        print(f"Email sequence generated: {len(emails)} emails")
        
        # Delete existing emails for this campaign (if any)
        supabase.table("email_sequences").delete().eq("campaign_id", campaign_id).execute()
        
        # Batch insert all emails at once (much faster than one by one)
        email_records = []
        for email in emails:
            email_records.append({
                "id": str(uuid.uuid4()),
                "campaign_id": campaign_id,
                "user_id": campaign["user_id"],
                "step_number": email["step"],
                "email_type": email["type"],
                "subject": email["subject"],
                "body": email["body"],
                "send_delay_days": email["send_delay_days"],
                "is_edited": False,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat()
            })
        
        # Single batch insert instead of 5 separate inserts
        if email_records:
            supabase.table("email_sequences").insert(email_records).execute()
            print(f"✅ Inserted {len(email_records)} emails in batch")
        
        # Update campaign status
        supabase.table("campaigns").update({
            "status": "ready",
            "updated_at": datetime.now().isoformat()
        }).eq("id", campaign_id).execute()
        
        return {"emails": emails}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR generating emails: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/campaigns/{campaign_id}/emails")
async def get_campaign_emails(campaign_id: str, user_id: str = Depends(get_current_user)):
    """Get email sequence for a campaign"""
    if campaign_id == "undefined" or not campaign_id:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")
    
    supabase = get_supabase()
    
    # Verify campaign belongs to user
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).eq("user_id", user_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    result = supabase.table("email_sequences").select("*").eq("campaign_id", campaign_id).order("step_number").execute()
    return result.data

@app.put("/api/campaigns/{campaign_id}/emails/{step}")
async def update_email(campaign_id: str, step: int, email: EmailUpdate, user_id: str = Depends(get_current_user)):
    """Update an email in the sequence"""
    if campaign_id == "undefined" or not campaign_id:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")
    
    supabase = get_supabase()
    
    # Verify campaign belongs to user
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).eq("user_id", user_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    result = supabase.table("email_sequences").update({
        "subject": email.subject,
        "body": email.body,
        "is_edited": True,
        "updated_at": datetime.now().isoformat()
    }).eq("campaign_id", campaign_id).eq("step_number", step).execute()
    
    return result.data[0] if result.data else {}

@app.post("/api/campaigns/{campaign_id}/send-test")
async def send_test_email(campaign_id: str, request: dict, user_id: str = Depends(get_current_user)):
    """Send a test email"""
    try:
        print(f"=== SEND TEST EMAIL for campaign {campaign_id} ===")
        supabase = get_supabase()
        
        # Get campaign and email data
        campaign_result = supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        campaign = campaign_result.data[0]
        step_number = request.get("step_number", 1)
        
        # Get the email for this step
        emails_result = supabase.table("email_sequences").select("*").eq("campaign_id", campaign_id).eq("step_number", step_number).execute()
        
        if not emails_result.data:
            raise HTTPException(status_code=404, detail="Email not found")
        
        email_data = emails_result.data[0]
        
        # Get user's SMTP email for testing
        test_email = settings.smtp_email  # Send to yourself for testing
        
        print(f"Sending test email to: {test_email}")
        print(f"Subject: {email_data['subject']}")
        
        # Send the email
        email_sender = get_email_sender()
        result = await email_sender.send_email(
            to_email=test_email,
            subject=f"[TEST] {email_data['subject']}",
            body=email_data['body']
        )
        
        if result.get("success"):
            print(f"Test email sent successfully to {test_email}")
            return {
                "sent": True,
                "message": f"Test email sent to {test_email}",
                "to": test_email
            }
        else:
            print(f"Failed to send test email: {result.get('error')}")
            raise HTTPException(status_code=500, detail=result.get("error", "Failed to send email"))
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERROR sending test email: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Analytics Endpoints
@app.get("/api/analytics/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(user_id: str = Depends(get_current_user)):
    """Get analytics overview with real-time data for current user"""
    try:
        supabase = get_supabase()
        
        # Get all campaigns for this user only
        campaigns_result = supabase.table("campaigns").select("*").eq("user_id", user_id).execute()
        campaigns = campaigns_result.data if campaigns_result.data else []
        
        # Get total prospects count from prospects table for this user (REAL-TIME)
        prospects_result = supabase.table("prospects").select("id", count="exact").eq("user_id", user_id).execute()
        total_prospects = prospects_result.count if prospects_result.count else 0
        
        # Calculate totals from campaigns
        total_sent = sum(c.get('emails_sent', 0) for c in campaigns)
        total_opened = sum(c.get('emails_opened', 0) for c in campaigns)
        total_replied = sum(c.get('emails_replied', 0) for c in campaigns)
        
        # Calculate rates
        open_rate = (total_opened / total_sent * 100) if total_sent > 0 else 0.0
        reply_rate = (total_replied / total_sent * 100) if total_sent > 0 else 0.0
        
        # Find best performing campaign
        best_campaign = None
        if campaigns:
            best = max(campaigns, key=lambda c: c.get('emails_opened', 0))
            if best.get('emails_opened', 0) > 0:
                best_campaign = {
                    "name": best.get('name'),
                    "emails_sent": best.get('emails_sent', 0),
                    "open_rate": (best.get('emails_opened', 0) / best.get('emails_sent', 1) * 100)
                }
        
        print(f"Analytics for user {user_id}: {len(campaigns)} campaigns, {total_prospects} prospects, {total_sent} sent")
        
        return AnalyticsOverview(
            total_sent=total_sent,
            total_opened=total_opened,
            total_clicked=0,  # Not tracking clicks yet
            total_replied=total_replied,
            total_prospects=total_prospects,  # Real-time count from prospects table
            open_rate=round(open_rate, 1),
            click_rate=0.0,
            reply_rate=round(reply_rate, 1),
            best_campaign=best_campaign
        )
    except Exception as e:
        print(f"Error getting analytics: {e}")
        import traceback
        traceback.print_exc()
        # Return empty analytics on error
        return AnalyticsOverview(
            total_sent=0,
            total_opened=0,
            total_clicked=0,
            total_replied=0,
            total_prospects=0,
            open_rate=0.0,
            click_rate=0.0,
            reply_rate=0.0
        )

# Settings Endpoints
@app.get("/api/settings")
async def get_settings_endpoint(user_id: str = Depends(get_current_user)):
    """Get user settings"""
    try:
        supabase = get_supabase()
        
        # Get settings from database
        result = supabase.table("settings").select("*").eq("user_id", user_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        else:
            # Return empty settings if none exist
            return {
                "user_id": user_id,
                "full_name": "",
                "company_name": "",
                "product_description": "",
                "calendar_link": "",
                "smtp_email": "",
                "smtp_app_password": "",
                "smtp_host": "smtp.gmail.com",
                "smtp_port": 587
            }
    except Exception as e:
        print(f"Error getting settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/settings")
async def update_settings_endpoint(settings_update: SettingsUpdate, user_id: str = Depends(get_current_user)):
    """Update user settings"""
    try:
        supabase = get_supabase()
        
        # Check if settings exist
        existing = supabase.table("settings").select("*").eq("user_id", user_id).execute()
        
        settings_data = {
            "user_id": user_id,
            "full_name": settings_update.full_name,
            "company_name": settings_update.company_name,
            "product_description": settings_update.product_description,
            "calendar_link": settings_update.calendar_link,
            "smtp_email": settings_update.smtp_email,
            "smtp_app_password": settings_update.smtp_app_password,
            "smtp_host": settings_update.smtp_host,
            "smtp_port": settings_update.smtp_port,
            "updated_at": datetime.now().isoformat()
        }
        
        if existing.data and len(existing.data) > 0:
            # Update existing settings
            result = supabase.table("settings").update(settings_data).eq("user_id", user_id).execute()
        else:
            # Insert new settings
            settings_data["created_at"] = datetime.now().isoformat()
            result = supabase.table("settings").insert(settings_data).execute()
        
        return {"message": "Settings updated successfully", "data": result.data[0] if result.data else None}
    except Exception as e:
        print(f"Error updating settings: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Prospects Endpoints
@app.get("/api/prospects/all")
async def get_all_prospects(user_id: str = Depends(get_current_user)):
    """Get all prospects for the current user across all campaigns"""
    supabase = get_supabase()
    result = supabase.table("prospects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return result.data

@app.get("/api/campaigns/{campaign_id}/prospects")
async def get_campaign_prospects(campaign_id: str, user_id: str = Depends(get_current_user)):
    """Get prospects for a campaign"""
    if campaign_id == "undefined" or not campaign_id:
        raise HTTPException(status_code=400, detail="Invalid campaign ID")
    
    supabase = get_supabase()
    # Verify campaign belongs to user
    campaign = supabase.table("campaigns").select("id").eq("id", campaign_id).eq("user_id", user_id).execute()
    if not campaign.data:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    result = supabase.table("prospects").select("*").eq("campaign_id", campaign_id).eq("user_id", user_id).execute()
    return result.data

@app.post("/api/prospects")
async def create_prospect(prospect: ProspectCreate):
    """Create a new prospect manually"""
    try:
        supabase = get_supabase()
        
        # Get campaign to get user_id
        campaign_result = supabase.table("campaigns").select("user_id").eq("id", prospect.campaign_id).execute()
        if not campaign_result.data:
            raise HTTPException(status_code=404, detail="Campaign not found")
        
        user_id = campaign_result.data[0]["user_id"]
        
        prospect_data = {
            "id": str(uuid.uuid4()),
            "campaign_id": prospect.campaign_id,
            "user_id": user_id,  # Add user_id from campaign
            "name": prospect.name,
            "email": prospect.email,
            "title": prospect.title,
            "department": prospect.department,
            "company_name": prospect.company_name,
            "status": "new",
            "current_step": 0,
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("prospects").insert(prospect_data).execute()
        
        # Update campaign total_prospects count
        campaign = supabase.table("campaigns").select("total_prospects").eq("id", prospect.campaign_id).execute()
        if campaign.data:
            new_count = (campaign.data[0].get("total_prospects") or 0) + 1
            supabase.table("campaigns").update({"total_prospects": new_count}).eq("id", prospect.campaign_id).execute()
        
        return result.data[0]
    except Exception as e:
        print(f"Error creating prospect: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test-email")
async def test_email_connection(request: dict, user_id: str = Depends(get_current_user)):
    """Test email connection by sending a test email"""
    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        supabase = get_supabase()
        
        # Get user's SMTP settings from database
        settings_result = supabase.table("settings").select("*").eq("user_id", user_id).execute()
        
        if not settings_result.data or len(settings_result.data) == 0:
            raise HTTPException(status_code=400, detail="SMTP settings not configured. Please save your settings first.")
        
        settings = settings_result.data[0]
        
        smtp_host = settings.get("smtp_host")
        smtp_port = settings.get("smtp_port")
        smtp_email = settings.get("smtp_email")
        smtp_password = settings.get("smtp_app_password")
        
        if not all([smtp_host, smtp_port, smtp_email, smtp_password]):
            raise HTTPException(status_code=400, detail="Incomplete SMTP settings. Please fill in all fields.")
        
        test_email = request.get("email") or smtp_email
        
        print(f"Testing email with: {smtp_host}:{smtp_port} from {smtp_email}")
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = smtp_email
        msg['To'] = test_email
        msg['Subject'] = "[TEST] AutoPilot Outreach - Email Configuration Test"
        
        html_body = """
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">✅ Email Configuration Successful!</h2>
            <p>This is a test email from AutoPilot Outreach.</p>
            <p>Your SMTP settings are configured correctly and working as expected.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
                You can now send personalized email campaigns to your prospects.
            </p>
        </body>
        </html>
        """
        
        html_part = MIMEText(html_body, 'html')
        msg.attach(html_part)
        
        # Connect to SMTP server and send
        with smtplib.SMTP(smtp_host, int(smtp_port)) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
        
        print(f"Test email sent successfully to {test_email}")
        return {"status": "success", "message": f"Test email sent to {test_email}"}
            
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
        raise HTTPException(status_code=400, detail="SMTP authentication failed. Please check your email and app password.")
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {e}")
        raise HTTPException(status_code=400, detail=f"SMTP error: {str(e)}")
    except Exception as e:
        print(f"Error testing email: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
