"""
Email Verification Service
Verifies emails are REAL and exist using multiple methods
"""
import aiohttp
import asyncio
import dns.resolver
import socket
from typing import Dict, Optional
import re

class EmailVerifier:
    """Verify email addresses are real"""
    
    async def verify_email(self, email: str) -> Dict[str, any]:
        """
        Verify if an email address is real and deliverable
        Returns: {
            "email": "email@domain.com",
            "valid": True/False,
            "deliverable": True/False,
            "confidence": "high|medium|low",
            "reason": "explanation"
        }
        """
        # Basic format check
        if not self._is_valid_format(email):
            return {
                "email": email,
                "valid": False,
                "deliverable": False,
                "confidence": "low",
                "reason": "Invalid email format"
            }
        
        domain = email.split('@')[1]
        
        # Check if domain has MX records (can receive email)
        has_mx = await self._check_mx_records(domain)
        if not has_mx:
            return {
                "email": email,
                "valid": False,
                "deliverable": False,
                "confidence": "low",
                "reason": "Domain cannot receive emails (no MX records)"
            }
        
        # Try free email verification APIs
        api_result = await self._try_verification_apis(email)
        if api_result:
            return api_result
        
        # If we got here, domain is valid but we can't verify the specific email
        return {
            "email": email,
            "valid": True,
            "deliverable": "unknown",
            "confidence": "medium",
            "reason": "Domain valid, email not verified"
        }
    
    def _is_valid_format(self, email: str) -> bool:
        """Check if email format is valid"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    async def _check_mx_records(self, domain: str) -> bool:
        """Check if domain has MX records (can receive email)"""
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            return len(mx_records) > 0
        except:
            return False
    
    async def _try_verification_apis(self, email: str) -> Optional[Dict]:
        """Try free email verification APIs"""
        
        # Method 1: EmailListVerify (free tier)
        result = await self._try_emaillistverify(email)
        if result:
            return result
        
        # Method 2: MailboxValidator (free tier)
        result = await self._try_mailboxvalidator(email)
        if result:
            return result
        
        return None
    
    async def _try_emaillistverify(self, email: str) -> Optional[Dict]:
        """Try EmailListVerify free API"""
        try:
            # Free endpoint - no key needed
            url = f"https://apps.emaillistverify.com/api/verifyEmail?email={email}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('status') == 'ok':
                            return {
                                "email": email,
                                "valid": True,
                                "deliverable": True,
                                "confidence": "high",
                                "reason": "Email verified as deliverable"
                            }
                        elif data.get('status') == 'invalid':
                            return {
                                "email": email,
                                "valid": False,
                                "deliverable": False,
                                "confidence": "high",
                                "reason": "Email does not exist"
                            }
        except Exception as e:
            print(f"EmailListVerify failed: {e}")
        
        return None
    
    async def _try_mailboxvalidator(self, email: str) -> Optional[Dict]:
        """Try MailboxValidator free API"""
        try:
            # Free endpoint
            url = f"https://api.mailboxvalidator.com/v1/validation/single?email={email}&format=json"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('status') == 'True':
                            return {
                                "email": email,
                                "valid": True,
                                "deliverable": True,
                                "confidence": "high",
                                "reason": "Email verified"
                            }
        except Exception as e:
            print(f"MailboxValidator failed: {e}")
        
        return None


# Singleton
_verifier = None

def get_email_verifier() -> EmailVerifier:
    """Get email verifier instance"""
    global _verifier
    if _verifier is None:
        _verifier = EmailVerifier()
    return _verifier
