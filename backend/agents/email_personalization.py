from services.llm_client import get_llm_client
from prompts.email_generation import EMAIL_SEQUENCE_PROMPT
import json

class EmailPersonalizationAgent:
    def __init__(self):
        self.llm = get_llm_client()
    
    def generate_sequence(
        self,
        company_data: dict,
        product_description: str,
        sender_name: str = "Sales Team",
        sender_company: str = "AutoPilot"
    ) -> list:
        """Generate a 5-email personalized sequence"""
        print(f"Generating email sequence for {company_data.get('name', 'Unknown')}")
        
        # Get first contact if available
        prospect_name = "there"
        prospect_title = "Decision Maker"
        
        # Generate prompt
        prompt = EMAIL_SEQUENCE_PROMPT.format(
            sender_name=sender_name,
            sender_company=sender_company,
            product_description=product_description,
            prospect_name=prospect_name,
            prospect_title=prospect_title,
            company_name=company_data.get('name', 'your company'),
            company_research_json=json.dumps(company_data, indent=2)
        )
        
        # Get LLM response
        result = self.llm.generate_json(prompt)
        
        emails = result.get('emails', [])
        
        # Ensure we have 5 emails
        if len(emails) < 5:
            print(f"Warning: Only generated {len(emails)} emails")
            # Add default emails if needed
            default_emails = [
                {
                    "step": 1,
                    "type": "intro",
                    "subject": f"Quick question about {company_data.get('name', 'your company')}",
                    "body": f"Hi,\n\nI noticed {company_data.get('name', 'your company')} and wanted to reach out.\n\nWe help companies like yours with {product_description}.\n\nWorth a quick chat?\n\nBest,\n{sender_name}",
                    "send_delay_days": 0
                },
                {
                    "step": 2,
                    "type": "value",
                    "subject": "Following up",
                    "body": f"Hi,\n\nJust following up on my previous email.\n\nWe've helped similar companies achieve great results.\n\nInterested in learning more?\n\nBest,\n{sender_name}",
                    "send_delay_days": 3
                },
                {
                    "step": 3,
                    "type": "social_proof",
                    "subject": "Case study",
                    "body": f"Hi,\n\nThought you might find this interesting.\n\nWe recently helped a company in your industry.\n\nHappy to share details.\n\nBest,\n{sender_name}",
                    "send_delay_days": 7
                },
                {
                    "step": 4,
                    "type": "reminder",
                    "subject": "Quick check-in",
                    "body": f"Hi,\n\nJust checking if you're still interested.\n\nLet me know!\n\nBest,\n{sender_name}",
                    "send_delay_days": 12
                },
                {
                    "step": 5,
                    "type": "breakup",
                    "subject": "Closing your file",
                    "body": f"Hi,\n\nI haven't heard back, so I'll close your file.\n\nFeel free to reach out if things change.\n\nBest,\n{sender_name}",
                    "send_delay_days": 18
                }
            ]
            emails = default_emails[:5]
        
        print(f"Email sequence generated: {len(emails)} emails")
        return emails

def get_email_personalization_agent() -> EmailPersonalizationAgent:
    return EmailPersonalizationAgent()
