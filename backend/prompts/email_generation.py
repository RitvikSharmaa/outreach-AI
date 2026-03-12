EMAIL_SEQUENCE_PROMPT = """You are an elite cold email copywriter. Generate a 5-email outreach sequence for the following prospect.

SENDER INFO:
- Name: {sender_name}
- Company: {sender_company}
- Product: {product_description}

PROSPECT INFO:
- Name: {prospect_name}
- Title: {prospect_title}
- Company: {company_name}

COMPANY RESEARCH:
{company_research_json}

Generate exactly 5 emails as JSON:
{{
  "emails": [
    {{
      "step": 1,
      "type": "intro",
      "subject": "Subject line (max 60 chars, no spam words)",
      "body": "Email body (plain text, 80-120 words)",
      "send_delay_days": 0
    }},
    {{
      "step": 2,
      "type": "value",
      "subject": "Subject line",
      "body": "Email body (80-120 words)",
      "send_delay_days": 3
    }},
    {{
      "step": 3,
      "type": "social_proof",
      "subject": "Subject line",
      "body": "Email body (80-100 words)",
      "send_delay_days": 7
    }},
    {{
      "step": 4,
      "type": "reminder",
      "subject": "Subject line",
      "body": "Email body (40-60 words)",
      "send_delay_days": 12
    }},
    {{
      "step": 5,
      "type": "breakup",
      "subject": "Subject line",
      "body": "Email body (40-60 words)",
      "send_delay_days": 18
    }}
  ]
}}

RULES:
- Every email MUST reference specific details from the company research
- NO generic phrases like "I came across your company"
- Subject lines: short, specific, no ALL CAPS, no exclamation marks
- Email 1: Lead with a specific observation about THEIR company
- Email 2: Connect their pain point to your solution
- Email 3: Reference a result relevant to their industry
- Email 4: Keep it under 50 words, casual tone
- Email 5: Respectful close, under 50 words
- Use prospect's first name only
- Return ONLY valid JSON"""
