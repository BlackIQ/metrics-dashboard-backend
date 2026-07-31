# SMTP
import smtplib
from email.message import EmailMessage

# Application
from core.settings import settings


# Send email
def send_email(subject: str, sender: str, to: str, content: str):
    msg = EmailMessage()

    msg["Subject"] = subject
    msg["From"] = send_email
    msg["To"] = to
    msg.set_content(content)

    try:
        with smtplib.SMTP_SSL(settings.email_endpoint, settings.email_port) as server:
            server.login(settings.email_username, settings.email_password)
            server.send_message(msg)

        print("Email sent successfully!")
    except Exception as e:
        print(f"Error occurred: {e}")
