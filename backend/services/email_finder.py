"""
Email Finder Service
Finds REAL, VERIFIED emails using Hunter.io API
"""
import aiohttp
import asyncio
from typing import Optional, Dict, List
import re
from config import get_settings

settings = get_settings()

class EmailFinder:
    """Find real email addresses using Hunter.io"""
    
    def __init__(self):
        self.api_key = settings.hunter_api_key
        self.cache = {}
    
    async def find_company_emails(self, domain: str) -> List[Dict]:
        """
        Find ALL real emails for a company using Hunter.io
        Returns list of verified emails with names and titles
        """
        if not self.api_key:
            print("⚠️  No Hunter.io API key configured")
            return []
        
        try:
            # Hunter.io domain search - finds all emails for a domain
            # Free plan limited to 10 results
            url = f"https://api.hunter.io/v2/domain-search?domain={domain}&api_key={self.api_key}&limit=10"
            
            print(f"  🔍 Searching Hunter.io for {domain}...")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=20)) as response:
                    text = await response.text()
                    
                    if response.status == 200:
                        import json
                        data = json.loads(text)
                        
                        if data.get('data'):
                            emails_data = data['data'].get('emails', [])
                            pattern = data['data'].get('pattern', '{first}.{last}')
                            
                            print(f"  📧 Email pattern: {pattern}")
                            
                            results = []
                            for email_info in emails_data:
                                # Only include emails with decent confidence
                                confidence = email_info.get('confidence', 0)
                                if confidence >= 50:  # At least 50% confidence
                                    first = email_info.get('first_name', '')
                                    last = email_info.get('last_name', '')
                                    name = f"{first} {last}".strip()
                                    
                                    if name:  # Only if we have a name
                                        results.append({
                                            "name": name,
                                            "email": email_info.get('value', ''),
                                            "title": email_info.get('position', ''),
                                            "confidence": confidence,
                                            "source": "hunter_verified",
                                            "department": email_info.get('department', '')
                                        })
                            
                            print(f"  ✅ Found {len(results)} VERIFIED emails from Hunter.io")
                            return results
                    elif response.status == 401:
                        print("  ❌ Hunter.io API key invalid")
                    elif response.status == 429:
                        print("  ⚠️  Hunter.io rate limit reached")
                    else:
                        print(f"  ⚠️  Hunter.io returned status {response.status}")
                        print(f"  Response: {text[:200]}")
                        
        except Exception as e:
            print(f"  ❌ Hunter.io search failed: {e}")
            import traceback
            traceback.print_exc()
        
        return []
    
    async def find_email(self, name: str, domain: str, title: str = "") -> Dict[str, any]:
        """
        Find specific email for a person using Hunter.io email finder
        """
        if not self.api_key:
            return self._generate_pattern(name, domain)
        
        try:
            # Split name
            name_parts = name.strip().split()
            if len(name_parts) < 2:
                return self._generate_pattern(name, domain)
            
            first_name = name_parts[0]
            last_name = name_parts[-1]
            
            # Hunter.io email finder - finds specific person's email
            url = f"https://api.hunter.io/v2/email-finder?domain={domain}&first_name={first_name}&last_name={last_name}&api_key={self.api_key}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('data') and data['data'].get('email'):
                            email = data['data']['email']
                            confidence = data['data'].get('score', 0)
                            
                            return {
                                "email": email,
                                "confidence": "high" if confidence >= 80 else "medium",
                                "source": "hunter_verified"
                            }
        except Exception as e:
            print(f"  Email finder failed for {name}: {e}")
        
        # Fallback to pattern
        return self._generate_pattern(name, domain)
    
    def _generate_pattern(self, name: str, domain: str) -> Dict:
        """Generate email using common pattern"""
        name_parts = name.lower().strip().split()
        if len(name_parts) >= 2:
            first = re.sub(r'[^a-z]', '', name_parts[0])
            last = re.sub(r'[^a-z]', '', name_parts[-1])
            email = f"{first}.{last}@{domain}"
        else:
            email = f"contact@{domain}"
        
        return {
            "email": email,
            "confidence": "medium",
            "source": "pattern"
        }


# Singleton instance
_email_finder = None

def get_email_finder() -> EmailFinder:
    """Get email finder instance"""
    global _email_finder
    if _email_finder is None:
        _email_finder = EmailFinder()
    return _email_finder
