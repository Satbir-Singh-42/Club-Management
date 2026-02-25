import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os


async def send_verification_email(to_email: str, otp: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL")

    if not all([smtp_server, smtp_username, smtp_password, from_email]):
        raise ValueError("SMTP configuration is missing")

    smtp_server = str(smtp_server)
    smtp_port = int(smtp_port)
    smtp_username = str(smtp_username)
    smtp_password = str(smtp_password)
    from_email = str(from_email)

    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = "Verify your email address"

    body = f"""
    Your verification code is: {otp}

    This code will expire in 15 minutes.
    """
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(message)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise

async def send_password_reset_email(to_email: str, reset_link: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL")

    if not all([smtp_server, smtp_username, smtp_password, from_email]):
        raise ValueError("SMTP configuration is missing")

    message = MIMEMultipart()
    message["From"] = from_email
    message["To"] = to_email
    message["Subject"] = "Password Reset Request"

    body = f"""
    You have requested to reset your password.

    Click the following link to reset your password:
    {reset_link}

    This link will expire in 1 hour.

    If you did not request this password reset, please ignore this email.
    """
    message.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(message)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise
