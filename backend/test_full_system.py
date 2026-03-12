"""
Comprehensive system test
"""
import asyncio
import httpx
from database.supabase_client import get_supabase
from services.llm_client import get_llm_client
from services.scraper import get_scraper
from agents.company_research import get_company_research_agent

async def test_database():
    """Test Supabase connection"""
    print("\n🗄️  Testing Database Connection...")
    try:
        supabase = get_supabase()
        if supabase is None:
            print("❌ Supabase client not initialized")
            return False
        
        # Try to query campaigns table
        response = supabase.table('campaigns').select('*').limit(1).execute()
        print(f"✅ Database connected! Found {len(response.data)} campaigns")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

async def test_llm():
    """Test LLM client"""
    print("\n🤖 Testing LLM Client...")
    try:
        llm = get_llm_client()
        response = llm.generate("Say 'Hello, I am working!' in exactly 5 words.")
        print(f"✅ LLM working! Response: {response[:100]}")
        return True
    except Exception as e:
        print(f"❌ LLM error: {e}")
        return False

async def test_scraper():
    """Test web scraper"""
    print("\n🕷️  Testing Web Scraper...")
    try:
        scraper = get_scraper()
        content = await scraper.scrape_url("https://example.com")
        if content and len(content) > 50:
            print(f"✅ Scraper working! Scraped {len(content)} characters")
            return True
        else:
            print("⚠️  Scraper returned minimal content")
            return False
    except Exception as e:
        print(f"❌ Scraper error: {e}")
        return False

async def test_company_research():
    """Test company research agent"""
    print("\n🔍 Testing Company Research Agent...")
    try:
        agent = get_company_research_agent()
        result = await agent.research("https://example.com")
        if result and 'name' in result:
            print(f"✅ Research agent working! Found company: {result.get('name', 'Unknown')}")
            return True
        else:
            print("⚠️  Research agent returned incomplete data")
            return False
    except Exception as e:
        print(f"❌ Research agent error: {e}")
        return False

async def test_api_endpoints():
    """Test API endpoints"""
    print("\n🌐 Testing API Endpoints...")
    try:
        async with httpx.AsyncClient() as client:
            # Test health
            response = await client.get("http://localhost:8000/api/health")
            if response.status_code == 200:
                print("✅ Health endpoint working")
            else:
                print(f"❌ Health endpoint failed: {response.status_code}")
                return False
            
            # Test campaigns endpoint (should require auth)
            response = await client.get("http://localhost:8000/api/campaigns")
            if response.status_code in [401, 403]:
                print("✅ Campaigns endpoint protected (requires auth)")
            else:
                print(f"⚠️  Campaigns endpoint status: {response.status_code}")
            
            return True
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

async def main():
    print("=" * 60)
    print("🧪 COMPREHENSIVE SYSTEM TEST")
    print("=" * 60)
    
    results = {
        "Database": await test_database(),
        "LLM Client": await test_llm(),
        "Web Scraper": await test_scraper(),
        "Company Research": await test_company_research(),
        "API Endpoints": await test_api_endpoints()
    }
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name:.<40} {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed ({passed/total*100:.0f}%)")
    
    if passed == total:
        print("\n🎉 All systems operational!")
    else:
        print("\n⚠️  Some systems need attention")

if __name__ == "__main__":
    asyncio.run(main())
