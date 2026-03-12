from services.scraper import get_scraper
from services.llm_client import get_llm_client
from prompts.company_research import COMPANY_RESEARCH_PROMPT
import asyncio

class CompanyResearchAgent:
    def __init__(self):
        self.scraper = get_scraper()
        self.llm = get_llm_client()
    
    async def research(self, company_url: str) -> dict:
        """Research a company from their website URL"""
        print(f"Researching company: {company_url}")
        
        # Scrape the website
        scraped_content = await self.scraper.scrape_url(company_url)
        
        if not scraped_content:
            print("No content scraped, returning default data")
            return {
                "name": "Unknown Company",
                "industry": "Unknown",
                "description": "Unable to scrape company information",
                "products": [],
                "company_size": "unknown",
                "headquarters": None,
                "founded": None,
                "website": company_url,
                "tagline": None,
                "pain_points": [],
                "tech_stack_hints": [],
                "recent_initiatives": []
            }
        
        print(f"Scraped {len(scraped_content)} characters, sending to LLM...")
        
        # Generate prompt
        prompt = COMPANY_RESEARCH_PROMPT.format(
            scraped_content=scraped_content,
            url=company_url
        )
        
        # Get LLM response
        company_data = self.llm.generate_json(prompt)
        
        # Ensure required fields exist
        if not company_data.get('name'):
            # Try to extract from URL
            from urllib.parse import urlparse
            domain = urlparse(company_url).netloc
            company_data['name'] = domain.replace('www.', '').split('.')[0].title()
        
        if not company_data.get('website'):
            company_data['website'] = company_url
        
        # Ensure all fields exist with defaults
        defaults = {
            "industry": "Unknown",
            "description": "No description available",
            "products": [],
            "company_size": "unknown",
            "headquarters": None,
            "founded": None,
            "tagline": None,
            "pain_points": [],
            "tech_stack_hints": [],
            "recent_initiatives": []
        }
        
        for key, default_value in defaults.items():
            if key not in company_data or company_data[key] is None:
                company_data[key] = default_value
        
        print(f"Company research complete: {company_data.get('name', 'Unknown')}")
        return company_data

def get_company_research_agent() -> CompanyResearchAgent:
    return CompanyResearchAgent()
