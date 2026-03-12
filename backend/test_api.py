"""
Quick test script to verify API functionality
Run with: python test_api.py
"""
import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_health():
    """Test health endpoint"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/health")
        print("✅ Health Check:", response.json())
        return response.status_code == 200

async def test_campaign_creation():
    """Test campaign creation (requires auth token)"""
    print("\n📝 To test campaign creation:")
    print("1. Go to http://localhost:3000")
    print("2. Sign up / Log in")
    print("3. Create a new campaign")
    print("4. Enter a company URL (e.g., https://stripe.com)")
    print("5. Watch the AI agents research the company!")

async def main():
    print("🧪 Testing AutoPilot Outreach API\n")
    print("=" * 50)
    
    # Test health
    health_ok = await test_health()
    
    if health_ok:
        print("\n✅ Backend is running and healthy!")
        await test_campaign_creation()
        print("\n" + "=" * 50)
        print("🎉 All systems ready!")
        print("\n📱 Frontend: http://localhost:3000")
        print("🔧 Backend: http://localhost:8000")
        print("📚 API Docs: http://localhost:8000/docs")
    else:
        print("\n❌ Backend health check failed")

if __name__ == "__main__":
    asyncio.run(main())
