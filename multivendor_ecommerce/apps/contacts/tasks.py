from django.core.mail import send_mail
from django.conf import settings
from config.celery import app
import logging

logger = logging.getLogger("myapp")

@app.task
def send_contact_confirmation_email(email, full_name):
    """
    Sends a confirmation email to the user after submitting a contact form.
    """

    subject = "Thank You for Contacting Eezzymart!"
    message = f"""
    Dear {full_name},

    Thank you for reaching out.

    We’ve successfully received your message and our support team will review it shortly.
    One of our representatives will get back to you as soon as possible.

    If you need urgent assistance, please don’t hesitate to reply to this email.

    Best regards,  
    The Eezzymart Team  
    support@eezzymart.com  
    """

    sender = settings.DEFAULT_FROM_EMAIL
    recipients = [email]

    try:
        send_mail(
            message=message,
            from_email=sender,
            recipient_list=recipients,
            fail_silently=False,
        )
        logger.info(f"Contact confirmation email sent successfully to {email}")
        return f"Confirmation email sent to {email}"
    except Exception as e:
        logger.error(f"Failed to send contact confirmation email to {email}. Error: {str(e)}")
        return f"Error sending email to {email}: {str(e)}"
