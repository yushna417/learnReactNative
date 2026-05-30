from django.utils import timezone
from datetime import timedelta
from ..models import OTPRequestLog, OTPAttemptLog


class OTPRateLimiter:
    """
    Handles all rate limiting for OTP operations
    """
    
    @staticmethod
    def check_otp_request_limit(email, ip_address):
        """
        Check if user can request a new OTP
        Rule: Maximum 3 requests per email per 10 minutes
        
        Returns: (is_allowed, error_message)
        """
        # Calculate time window (last 10 minutes)
        time_window = timezone.now() - timedelta(minutes=10)
        
        # Count requests for this email in last 10 minutes
        recent_requests = OTPRequestLog.objects.filter(
            email=email,
            requested_at__gte=time_window
        ).count()
        
        # Check if limit exceeded
        if recent_requests >= 3:
            wait_time = 10  # minutes
            return False, f"Too many OTP requests. Please wait {wait_time} minutes before requesting again."
        
        # check IP-based rate limiting (3 per minute)
        ip_requests = OTPRequestLog.objects.filter(
            ip_address=ip_address,
            requested_at__gte=timezone.now() - timedelta(minutes=1)
        ).count()
        
        if ip_requests >= 3:
            return False, "Too many requests from your IP. Please wait a minute."
        
        return True, None
    
    @staticmethod
    def check_otp_verification_limit(email, ip_address):
        """
        Check if user has exceeded failed attempt limit
        Rule: Lockout after 5 consecutive incorrect OTP attempts
        
        Returns: (is_allowed, error_message, remaining_attempts)
        """
        # Calculate time window (last 10 minutes)
        time_window = timezone.now() - timedelta(minutes=10)
        
        # Count failed attempts in last 10 minutes
        failed_attempts = OTPAttemptLog.objects.filter(
            email=email,
            attempted_at__gte=time_window,
            was_successful=False
        ).count()
        
        # Check if locked out (5 or more failures)
        if failed_attempts >= 5:
            return False, "Too many failed attempts. Account temporarily locked for 10 minutes.", 0
        
        # Calculate remaining attempts
        remaining_attempts = 5 - failed_attempts
        
        return True, None, remaining_attempts
    
    @staticmethod
    def log_otp_request(email, ip_address, success=True):
        """
        Log OTP request for rate limiting
        """
        OTPRequestLog.objects.create(
            email=email,
            ip_address=ip_address,
            success=success
        )
    
    @staticmethod
    def log_otp_attempt(email, ip_address, was_successful):
        """
        Log OTP verification attempt for lockout mechanism
        """
        OTPAttemptLog.objects.create(
            email=email,
            ip_address=ip_address,
            was_successful=was_successful
        )
    
    @staticmethod
    def get_failed_attempts_count(email):
        """
        Get current failed attempts count for a user
        Useful for providing feedback
        """
        time_window = timezone.now() - timedelta(minutes=10)
        return OTPAttemptLog.objects.filter(
            email=email,
            attempted_at__gte=time_window,
            was_successful=False
        ).count()