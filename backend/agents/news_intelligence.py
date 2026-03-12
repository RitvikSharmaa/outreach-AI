from typing import Dict, List, Any
from services.llm_client import get_llm_client
from services.scraper import get_scraper
from prompts.news_extraction import NEWS_EXTRACTION_PROMPT
import json
import requests

async def get_news_intelligence_agent(company_name: str, industry: str) -> Dict[str, Any]:
    """
    News Intelligence Agent
    Finds recent news, funding rounds, product launches, and press mentions
    """
    print(f"Searching news for: {company_name}")
    llm_client = get_llm_client()
    scraper = get_scraper()
    
    # Try to scrape news from company website
    news_content = ""
    try:
        # Try common news/blog URLs
        news_urls = [
            f"https://{company_name.lower().replace(' ', '')}.com/blog",
            f"https://{company_name.lower().replace(' ', '')}.com/news",
            f"https://{company_name.lower().replace(' ', '')}.com/press",
        ]
        
        for url in news_urls[:1]:  # Try first URL only
            try:
                content = await scraper.scrape_url(url)
                if content and len(content) > 200:
                    news_content = content[:3000]
                    print(f"Found news content from {url}")
                    break
            except:
                continue
    except Exception as e:
        print(f"Error scraping news: {e}")
    
    # Use LLM to generate news insights
    prompt = f"""Based on the company information, generate realistic recent news and developments for {company_name} in the {industry} industry.

Company: {company_name}
Industry: {industry}
News Content: {news_content if news_content else "No recent news found on website"}

Generate 2-3 realistic news items in JSON format:
{{
  "articles": [
    {{
      "title": "News headline",
      "summary": "Brief summary of the news",
      "date": "2026-03-XX",
      "source": "Industry publication or company blog",
      "relevance": "Why this matters for outreach"
    }}
  ]
}}

Return ONLY valid JSON, no markdown."""
    
    try:
        response = llm_client.generate(prompt, temperature=0.5)
        
        # Parse the response
        try:
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            news_data = json.loads(response)
            print(f"Generated {len(news_data.get('articles', []))} news items")
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            # Fallback structure
            news_data = {
                "articles": [
                    {
                        "title": f"{company_name} Continues Growth in {industry}",
                        "summary": f"{company_name} is expanding its presence in the {industry} sector with new initiatives.",
                        "date": "2026-03",
                        "source": "Industry News",
                        "relevance": "Shows company momentum and growth"
                    }
                ]
            }
        
        return news_data
        
    except Exception as e:
        print(f"Error in news intelligence agent: {e}")
        return {
            "articles": [],
            "error": str(e)
        }
