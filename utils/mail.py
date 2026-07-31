# Resend
import resend

# Application
from core.settings import settings  # Settings

# Setup Resend
resend.api_key = settings.resend_apikey


# Emails (Senders)
class MailSender:
    INFO = "OpenHubble Info <info@openhubble.com>"
    SECURITY = "OpenHubble Security <security@openhubble.com>"
    SUPPORT = "OpenHubble Support <support@openhubble.com>"


def send_email(sender: str, to: str, subject: str, content: str):
    try:
        resend.Emails.send(
            {
                "from": sender,
                "to": to,
                "subject": subject,
                "html": content,
            }
        )
    except Exception as e:
        print(f"[MAIL ERROR] Failed to send email to {to}: {e}")
