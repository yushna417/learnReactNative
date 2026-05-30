import random
import requests
from django.conf import settings
from datetime import timedelta
from ..models import User, OTP
from .security import create_token, decrypt_token
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


class OTPService:
    """Handles OTP generation, sending, and verification logic"""

    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return str(random.randint(100000, 999999))

    @staticmethod
    def create_otp_record(user, otp_code, ip_address, user_agent):
        """Create OTP record in database"""
        # Delete any unused OTPs for this user
        OTP.objects.filter(user=user, is_used=False).delete()

        # Create new OTP
        otp = OTP.objects.create(
            user=user, otp_code=otp_code, ip_address=ip_address, user_agent=user_agent
        )
        return otp

    @staticmethod
    def send_otp_email(email, otp_code):
        """Send OTP via styled HTML email"""

        url = "https://api.brevo.com/v3/smtp/email"

        try:
            html_content = render_to_string(
                "otp_email.html",
                {
                    "otp": otp_code,
                    "email": email,
                },
            )

            text_content = (
                f"Your OTP code is: {otp_code}\n\n"
                f"This code will expire in 5 minutes.\n"
                f"Do not share this code with anyone."
            )

            payload = {
                "sender": {
                    "name": "Tianna App",
                    "email": settings.FROM_EMAIL,  # your verified sender email
                },
                "to": [
                    {
                        "email": email
                    }
                ],
                "subject": "Your OTP Code",
                "htmlContent": html_content,
                "textContent": text_content,
            }

            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": settings.BREVO_API_KEY,
            }

            response = requests.post(url, json=payload, headers=headers)

            if response.status_code in [200, 201, 202]:
                return True, None

            return False, response.text

        except Exception as e:
            return False, str(e)

    @staticmethod
    def create_session_token(email, otp_id):
        """Create session token for OTP verification"""
        from datetime import datetime as dt

        payload = {
            "email": email,
            "otp_id": otp_id,
            "exp": dt.now() + timedelta(minutes=10),  # Session valid for 10 minutes
        }
        return create_token(payload)


class OTPVerificationService:
    """Handles OTP verification logic"""

    @staticmethod
    def validate_session_token(session_token):
        """Decrypt and validate session token"""
        decrypted_data = decrypt_token(session_token)

        if not decrypted_data["status"]:
            return None, None, decrypted_data.get("error", "Invalid session")

        payload = decrypted_data["payload"]
        email = payload.get("email")
        otp_id = payload.get("otp_id")

        if not email or not otp_id:
            return None, None, "Invalid session token data"

        return email, otp_id, None

    @staticmethod
    def get_valid_otp(otp_id, email, otp_code):
        """Retrieve and validate OTP from database"""
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.get(id=otp_id, user=user, is_used=False)

            # Check if OTP is expired
            if not otp.is_valid():
                return None, None, "OTP has expired"

            # Check if OTP matches
            if otp.otp_code != otp_code:
                return None, None, "Invalid OTP"

            return user, otp, None

        except User.DoesNotExist:
            return None, None, "User not found"
        except OTP.DoesNotExist:
            return None, None, "Invalid OTP session"

    @staticmethod
    def mark_otp_as_used(otp):
        """Mark OTP as used to prevent replay attacks"""
        otp.is_used = True
        otp.save()
