# Resend
import resend

# Application
from core.settings import settings

# Config Resend
resend.api_key = settings.resend_apikey


# Send email
def send_email(sender: str, to: str, subject: str, content: str):
    resend.Emails.send(
        {
            "from": sender,
            "to": to,
            "subject": subject,
            "html": content,
        }
    )
