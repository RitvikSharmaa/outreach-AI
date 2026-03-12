import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
from config import get_settings

settings = get_settings()

class EmailSender:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_email = settings.smtp_email
        self.smtp_password = settings.smtp_app_password
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        body: str,
        tracking_pixel_url: str = None
    ) -> Dict[str, Any]:
        """
        Send an email via SMTP
        """
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.smtp_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add tracking pixel if enabled
            html_body = body
            if tracking_pixel_url and settings.enable_open_tracking:
                html_body += f'<img src="{tracking_pixel_url}" width="1" height="1" style="display:none;" />'
            
            # Attach HTML body
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Connect to SMTP server and send
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_email, self.smtp_password)
                server.send_message(msg)
            
            return {
                "success": True,
                "message": f"Email sent to {to_email}"
            }
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return {
                "success": False,
                "error": str(e)
            }

def get_email_sender() -> EmailSender:
    return EmailSender()
