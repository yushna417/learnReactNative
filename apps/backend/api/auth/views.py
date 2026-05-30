import datetime
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .serializer import (
    OTPRequestSerializer,
    OTPVerifySerializer,
    UserRegistrationSerializer,
)
from .rate_limiter import OTPRateLimiter
from .services import OTPService, OTPVerificationService
from ..models import User
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer


class RegisterUserView(GenericAPIView):
    """Register new user with email"""

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "User with this email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create(email=email, is_active=False)

        ip_address = self.get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        otp_code = OTPService.generate_otp()

        otp = OTPService.create_otp_record(user, otp_code, ip_address, user_agent)

        email_sent, error = OTPService.send_otp_email(email, otp_code)

        if not email_sent:
            otp.delete()
            user.delete()
            return Response(
                {"error": f"Failed to send verification email: {error}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        session_token = OTPService.create_session_token(email, otp.id)

        return Response(
            {
                "message": "Verification OTP sent successfully",
                "session_token": session_token,
                "email": email,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(GenericAPIView):
    """
    Request OTP for authentication/login
    Rate Limit: Max 3 requests per email per 10 minutes
    """

    serializer_class = OTPRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check if user is active (verified email)
        if not user.is_active:
            return Response(
                {
                    "error": "Please verify your email first. Check your inbox for verification OTP."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        user.last_login = timezone.now()
        user.save()

        return Response(
            {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "email": user.email,
                    "is_active": user.is_active,
                },
            },
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(GenericAPIView):
    """
    Verify OTP and return JWT tokens
    Lockout: After 5 consecutive incorrect attempts, account locked for 10 minutes
    """

    serializer_class = OTPVerifySerializer
    permission_classes = [AllowAny]

    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        otp_code = serializer.validated_data["otp"]
        session_token = serializer.validated_data["session_token"]
        ip_address = self.get_client_ip(request)

        email, otp_id, error = OTPVerificationService.validate_session_token(
            session_token
        )

        if not email:
            return Response(
                {"error": error or "Invalid session"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        is_allowed, error_message, remaining_attempts = (
            OTPRateLimiter.check_otp_verification_limit(email, ip_address)
        )

        if not is_allowed:
            OTPRateLimiter.log_otp_attempt(email, ip_address, was_successful=False)
            return Response(
                {
                    "error": error_message,
                    "remaining_attempts": 0,
                    "locked_until": (
                        timezone.now() + datetime.timedelta(minutes=10)
                    ).isoformat(),
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        user, otp, error = OTPVerificationService.get_valid_otp(otp_id, email, otp_code)

        if error or not user:
            OTPRateLimiter.log_otp_attempt(email, ip_address, was_successful=False)

            failed_count = OTPRateLimiter.get_failed_attempts_count(email)
            remaining = 5 - failed_count

            return Response(
                {"error": error or "Invalid OTP", "remaining_attempts": remaining},
                status=status.HTTP_400_BAD_REQUEST,
            )

        OTPVerificationService.mark_otp_as_used(otp)

        user.is_active = True
        user.save()

        OTPRateLimiter.log_otp_attempt(email, ip_address, was_successful=True)

        return Response(
            {
                "message": "Email verified successfully. You can now login.",
                "email": user.email,
                "is_active": user.is_active,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """Logout user by blacklisting refresh token"""

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response(
                {"message": "Successfully logged out"}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class RefreshTokenView(GenericAPIView):
    """
    Refresh access token using refresh token
    """

    serializer_class = TokenRefreshSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class GetCurrentUserView(GenericAPIView):
    """
    Get current authenticated user data
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "is_active": user.is_active,
                "is_staff": user.is_staff,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
            },
            status=status.HTTP_200_OK,
        )