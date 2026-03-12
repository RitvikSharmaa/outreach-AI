from typing import Dict, List, Any
from services.llm_client import get_llm_client
from services.scraper import get_scraper
import json
import re
from urllib.parse import urlparse

async def get_contact_discovery_agent(company_name: str, company_url: str, company_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Contact Discovery Agent - Finds REAL people ONLY
    NO FAKE CONTACTS - Only returns people we can actually find
    """
    print(f"=== FINDING REAL CONTACTS for: {company_name} ===")
    
    domain = urlparse(company_url).netloc.replace('www.', '')
    
    real_contacts = []
    
    # Method 1: Scrape company website
    print("Method 1: Scraping company website...")
    scraped_contacts = await scrape_company_website(company_url, domain)
    real_contacts.extend(scraped_contacts)
    print(f"✓ Found {len(scraped_contacts)} people from website")
    
    # Method 2: Use LLM to find known people
    print("Method 2: Searching for known leadership...")
    llm_contacts = await search_for_real_people(company_name, domain, company_data)
    real_contacts.extend(llm_contacts)
    print(f"✓ Found {len(llm_contacts)} people from search")
    
    # Deduplicate
    unique_contacts = deduplicate_contacts(real_contacts)
    print(f"✓ Total unique REAL contacts: {len(unique_contacts)}")
    
    # If we found NO real people, return generic contact
    if len(unique_contacts) == 0:
        print("⚠️  Could not find real people - returning generic contact")
        return {
            "contacts": [
                {
                    "name": f"Contact at {company_name}",
                    "title": "Decision Maker",
                    "email": f"contact@{domain}",
                    "department": "General"
                }
            ]
        }
    
    return {"contacts": unique_contacts[:15]}


async def scrape_company_website(base_url: str, domain: str) -> List[Dict[str, Any]]:
    """Scrape company website for REAL people"""
    contacts = []
    scraper = get_scraper()
    
    # Try common team page URLs
    team_urls = [
        f"{base_url}/team",
        f"{base_url}/about",
        f"{base_url}/about-us",
        f"{base_url}/leadership",
        f"{base_url}/people",
        f"{base_url}/company/team",
        f"{base_url}/about/team",
    ]
    
    for url in team_urls:
        try:
            html = await scraper.scrape(url)
            if html and len(html) > 500:
                people = await extract_people_from_html(html, domain)
                if len(people) > 0:
                    contacts.extend(people)
                    print(f"  ✓ Found {len(people)} at {url}")
        except:
            continue
    
    return contacts


async def extract_people_from_html(html: str, domain: str) -> List[Dict[str, Any]]:
    """Extract REAL people from HTML using LLM"""
    llm_client = get_llm_client()
    
    # Truncate HTML
    if len(html) > 20000:
        html = html[:20000]
    
    prompt = f"""Extract REAL people from this team page HTML.

HTML:
{html}

Find people with FULL NAMES (first + last) and job titles.

Return in JSON:
{{
  "people": [
    {{
      "name": "Full Name",
      "title": "Job Title"
    }}
  ]
}}

Rules:
- ONLY people with full names (first + last name)
- Skip generic entries like "Team", "Staff"
- Return empty array if no real people found

Return ONLY valid JSON."""

    try:
        response = llm_client.generate(prompt, temperature=0.1)
        
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
        
        data = json.loads(response)
        people = data.get('people', [])
        
        contacts = []
        for person in people:
            name = person.get('name', '').strip()
            title = person.get('title', '').strip()
            
            if name and len(name.split()) >= 2:
                email = generate_email(name, domain)
                contacts.append({
                    "name": name,
                    "title": title,
                    "email": email,
                    "department": infer_department(title)
                })
        
        return contacts
    except Exception as e:
        print(f"  Error extracting people: {e}")
        return []


async def search_for_real_people(company_name: str, domain: str, company_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Use LLM to find REAL known people at the company"""
    llm_client = get_llm_client()
    
    company_info = f"Company: {company_name}\nWebsite: https://{domain}"
    if company_data:
        company_info += f"\nIndustry: {company_data.get('industry', '')}"
    
    prompt = f"""Based on public knowledge, who are the REAL, KNOWN people at this company?

{company_info}

Return ONLY people you can verify exist from:
- Public news articles
- Press releases
- Company announcements
- Well-known founders/executives

Return in JSON:
{{
  "contacts": [
    {{
      "name": "Full name (ONLY if you can verify)",
      "title": "Job title",
      "email": "firstname.lastname@{domain}"
    }}
  ]
}}

IMPORTANT: If you cannot verify ANY real people, return: {{"contacts": []}}

Return ONLY valid JSON."""

    try:
        response = llm_client.generate(prompt, temperature=0.1)
        
        if "```json" in response:
            response = response.split("```json")[1].split("```")[0].strip()
        elif "```" in response:
            response = response.split("```")[1].split("```")[0].strip()
        
        data = json.loads(response)
        contacts = []
        
        for person in data.get('contacts', []):
            name = person.get('name', '').strip()
            # Validate it's a real name (not a title)
            if name and len(name.split()) >= 2:
                name_lower = name.lower()
                # Skip if name contains job title words
                if not any(word in name_lower for word in ['ceo', 'vp', 'director', 'head', 'manager', 'chief']):
                    contacts.append({
                        "name": name,
                        "title": person.get('title', ''),
                        "email": person.get('email', ''),
                        "department": infer_department(person.get('title', ''))
                    })
        
        return contacts
    except Exception as e:
        print(f"  Error searching for people: {e}")
        return []


def generate_email(name: str, domain: str) -> str:
    """Generate email from name"""
    parts = name.lower().strip().split()
    if len(parts) >= 2:
        first = re.sub(r'[^a-z]', '', parts[0])
        last = re.sub(r'[^a-z]', '', parts[-1])
        return f"{first}.{last}@{domain}"
    return f"contact@{domain}"


def infer_department(title: str) -> str:
    """Infer department from job title"""
    title_lower = title.lower()
    
    if any(word in title_lower for word in ['ceo', 'cto', 'cfo', 'chief', 'president', 'founder']):
        return "Executive"
    elif any(word in title_lower for word in ['sales', 'revenue', 'account']):
        return "Sales"
    elif any(word in title_lower for word in ['marketing', 'growth', 'brand']):
        return "Marketing"
    elif any(word in title_lower for word in ['product', 'pm']):
        return "Product"
    elif any(word in title_lower for word in ['engineering', 'developer', 'tech', 'software']):
        return "Engineering"
    elif any(word in title_lower for word in ['partnership', 'business development', 'bd', 'bizdev']):
        return "Partnerships"
    else:
        return "Other"


def deduplicate_contacts(contacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicate contacts"""
    seen_emails = set()
    seen_names = set()
    unique = []
    
    for contact in contacts:
        email = contact.get('email', '').lower()
        name = contact.get('name', '').lower()
        
        # Skip duplicates
        if email in seen_emails or name in seen_names:
            continue
        
        # Skip if no real name
        if not name or len(name.split()) < 2:
            continue
        
        seen_emails.add(email)
        seen_names.add(name)
        unique.append(contact)
    
    return unique
