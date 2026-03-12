from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Campaign Models
class CampaignCreate(BaseModel):
    name: str
    target_url: str

class CampaignResponse(BaseModel):
    id: str
    user_id: str
    name: str
    status: str
    target_url: str
    company_data: Dict[str, Any] = {}
    news_data: Dict[str, Any] = {}
    contacts_data: List[Dict[str, Any]] = []
    total_prospects: int = 0
    emails_sent: int = 0
    emails_opened: int = 0
    emails_replied: int = 0
    created_at: str
    updated_at: str

# Email Models
class EmailSequence(BaseModel):
    step_number: int
    email_type: str
    subject: str
    body: str
    send_delay_days: int

class EmailUpdate(BaseModel):
    subject: str
    body: str

class EmailGenerateRequest(BaseModel):
    product_description: str

# Settings Models
class SettingsUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    product_description: Optional[str] = None
    calendar_link: Optional[str] = None
    smtp_email: Optional[str] = None
    smtp_app_password: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None

# Analytics Models
class AnalyticsOverview(BaseModel):
    total_sent: int = 0
    total_opened: int = 0
    total_clicked: int = 0
    total_replied: int = 0
    total_prospects: int = 0  # Added total prospects
    open_rate: float = 0.0
    click_rate: float = 0.0
    reply_rate: float = 0.0
    best_campaign: Optional[Dict[str, Any]] = None

# Prospect Models
class ProspectCreate(BaseModel):
    campaign_id: str
    name: str
    email: str
    title: Optional[str] = None
    department: Optional[str] = None
    company_name: Optional[str] = None

class ProspectResponse(BaseModel):
    id: str
    campaign_id: str
    name: str
    email: str
    title: Optional[str]
    department: Optional[str]
    company_name: Optional[str]
    status: str
    current_step: int
    created_at: datetime
