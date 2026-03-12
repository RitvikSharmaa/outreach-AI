from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import asyncio
import requests
from config import get_settings

settings = get_settings()

class ScraperService:
    def __init__(self):
        self.timeout = settings.scraper_timeout * 1000  # Convert to ms
        self.user_agent = settings.scraper_user_agent
    
    async def scrape_with_playwright(self, url: str) -> str:
        """Scrape using Playwright (handles JavaScript)"""
        try:
            print(f"Trying Playwright for: {url}")
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(user_agent=self.user_agent)
                page = await context.new_page()
                
                await page.goto(url, timeout=self.timeout, wait_until="domcontentloaded")
                await page.wait_for_timeout(3000)
                
                content = await page.content()
                await browser.close()
                
                return content
        except Exception as e:
            print(f"Playwright error: {e}")
            return ""
    
    def scrape_with_requests(self, url: str) -> str:
        """Scrape using requests (faster, no JavaScript)"""
        try:
            print(f"Trying requests for: {url}")
            headers = {
                'User-Agent': self.user_agent,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            return response.text
        except Exception as e:
            print(f"Requests error: {e}")
            return ""
    
    def scrape_with_jina(self, url: str) -> str:
        """Scrape using Jina AI Reader (best for content extraction)"""
        try:
            print(f"Trying Jina AI Reader for: {url}")
            # Jina AI Reader API - free and works great for web scraping
            jina_url = f"https://r.jina.ai/{url}"
            headers = {
                'User-Agent': self.user_agent,
            }
            
            response = requests.get(jina_url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Jina returns clean markdown text
            return response.text
        except Exception as e:
            print(f"Jina AI error: {e}")
            return ""
    
    async def scrape_url(self, url: str) -> str:
        """Scrape a URL and return cleaned text content"""
        print(f"Scraping URL: {url}")
        
        # Try Method 1: Jina AI Reader (fastest and most reliable)
        text_content = self.scrape_with_jina(url)
        if text_content and len(text_content) > 500:
            print(f"Jina AI succeeded: {len(text_content)} characters")
            return text_content[:8000]
        
        # Try Method 2: Playwright (for JS-heavy sites)
        html_content = await self.scrape_with_playwright(url)
        
        # Try Method 3: Requests (fallback)
        if not html_content or len(html_content) < 500:
            print("Playwright failed, trying requests...")
            html_content = self.scrape_with_requests(url)
        
        if not html_content:
            print("All scraping methods failed")
            return ""
        
        print(f"Got HTML content ({len(html_content)} chars), parsing...")
        
        # Parse with BeautifulSoup
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Remove unwanted elements
        for element in soup(["script", "style", "nav", "footer", "header", "iframe", "noscript"]):
            element.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        print(f"Extracted {len(text)} characters of text")
        
        # Limit to 8000 characters
        return text[:8000]

def get_scraper() -> ScraperService:
    return ScraperService()
