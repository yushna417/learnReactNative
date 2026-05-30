# models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .validators import validate_e164_phone
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model for email-based authentication with OTP
    """

    email = models.EmailField(unique=True, db_index=True)

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return self.email


class OTP(models.Model):
    """
    OTP model for email-based authentication with security features
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otps")
    otp_code = models.CharField(max_length=6)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = "otps"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_used"]),
            models.Index(fields=["expires_at"]),
        ]

    def is_valid(self):
        """Check if OTP is still valid (not expired and not used)"""
        return not self.is_used and timezone.now() <= self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            # OTP expires in 5 minutes
            self.expires_at = timezone.now() + timedelta(minutes=5)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"OTP for {self.user.email} - {self.otp_code}"


class OTPRequestLog(models.Model):
    """
    Track OTP requests for rate limiting and abuse prevention
    """

    email = models.EmailField(db_index=True)
    requested_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    success = models.BooleanField(default=False)

    class Meta:
        db_table = "otp_request_logs"
        indexes = [
            models.Index(fields=["email", "requested_at"]),
            models.Index(fields=["ip_address", "requested_at"]),
        ]


class OTPAttemptLog(models.Model):
    """
    Track OTP verification attempts for lockout mechanism
    """

    email = models.EmailField(db_index=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    was_successful = models.BooleanField(default=False)

    class Meta:
        db_table = "otp_attempt_logs"
        indexes = [
            models.Index(fields=["email", "attempted_at"]),
            models.Index(fields=["ip_address", "attempted_at"]),
        ]


class BusinessListing(models.Model):
    """
    Business listing model for service providers
    Based on SRS Feature 2 requirements
    """

    title = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Official trading name of the business (max 100 characters)",
    )

    service_detail = models.TextField(
        max_length=2000,
        help_text="Comprehensive description of services, operational specialties, and offerings (max 2000 characters)",
    )

    business_category = models.CharField(
        max_length=50,
        db_index=True,
        blank=True,
        help_text="Category of the business (e.g., Restaurant, Plumbing, Cleaning)",
    )
    phone_no = models.CharField(
        max_length=20,
        validators=[validate_e164_phone],
        help_text="Primary contact number for customer inquiries (E.164 format, e.g., +1234567890)",
    )

    email = models.EmailField(
        help_text="Public contact email address for business correspondence"
    )

    latitude = models.DecimalField(
        max_digits=10, 
        decimal_places=7, 
        null=True, 
        blank=True,
        db_index=True
    )

    longitude = models.DecimalField(
        max_digits=10, 
        decimal_places=7, 
        null=True, 
        blank=True,
        db_index=True
    )

    address = models.TextField(blank=True, help_text="Structured address (geocoded)")

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "business_listings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["business_category"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["latitude", "longitude"]),
        ]
        verbose_name = "Business Listing"
        verbose_name_plural = "Business Listings"

    def save(self, *args, **kwargs):
        """Sanitize inputs before saving"""
        self.title = self.title.strip()
        self.business_category = self.business_category.strip()
        self.service_detail = self.service_detail.strip()
        self.email = self.email.lower().strip()
        super().save(*args, **kwargs)


    

