COMPANY_RESEARCH_PROMPT = """You are a company research analyst. Analyze the following website content and extract structured company information.

WEBSITE CONTENT:
{scraped_content}

URL: {url}

Extract the following information as JSON. If a field cannot be determined, use null.

IMPORTANT: Return ONLY valid JSON with no markdown formatting, no code blocks, no explanation.

{{
  "name": "Company legal name (REQUIRED - extract from content or URL)",
  "industry": "Primary industry (e.g., SaaS, FinTech, Healthcare, E-commerce)",
  "description": "2-3 sentence company description",
  "products": ["List of main products or services"],
  "company_size": "Estimated size (startup/small/medium/large/enterprise)",
  "headquarters": "City, Country",
  "founded": "Year or null",
  "website": "{url}",
  "tagline": "Company tagline or slogan",
  "pain_points": ["3-5 likely business pain points based on their industry and size"],
  "tech_stack_hints": ["Any technologies mentioned on the site"],
  "recent_initiatives": ["Any recent projects, launches, or focus areas mentioned"]
}}

Rules:
- The "name" field is REQUIRED - extract it from the page title, content, or URL
- Only extract information that is explicitly stated or strongly implied by the content
- Pain points should be realistic for their industry and company size
- Do not fabricate specific numbers or metrics
- Return ONLY valid JSON, no markdown code blocks, no explanation text"""
