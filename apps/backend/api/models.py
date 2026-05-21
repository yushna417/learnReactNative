# models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta
from validators import validate_e164_phone


class User(models.Model):
    """
    Custom User model for email-based authentication with OTP
    """


    email = models.EmailField(unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

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
    """

    STATUS_CHOICES = [
        ("pending", "Pending Review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("suspended", "Suspended"),
    ]

    # Owner Information
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="business_listings",
        limit_choices_to={"user_type__in": ["business_owner", "both"]},
    )

    # Business Information
    title = models.CharField(
        max_length=100, db_index=True, help_text="Official trading name of the business"
    )

    service_detail = models.TextField(
        max_length=2000,
        help_text="Comprehensive description of services, operational specialties, and offerings",
    )

    phone_no = models.CharField(
        max_length=20,
        validators=[validate_e164_phone],
        help_text="Primary contact number (E.164 format)",
    )

    email = models.EmailField(
        help_text="Public contact email address for business correspondence"
    )

    address = models.TextField(blank=True, help_text="Structured address (geocoded)")

    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending", db_index=True
    )
    is_public = models.BooleanField(default=False, db_index=True)
    view_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "business_listings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["title"]),
            models.Index(fields=["status", "is_public"]),
            models.Index(fields=["latitude", "longitude"]),
        ]

    def __str__(self):
        return f"{self.title} - {self.owner.email}"

    def save(self, *args, **kwargs):
        self.title = self.title.strip()
        self.service_detail = self.service_detail.strip()

        if self.status == "approved" and not self.approved_at:
            self.approved_at = timezone.now()

        self.is_public = self.status == "approved"

        super().save(*args, **kwargs)


class BusinessImage(models.Model):
    """
    Optional: Images for business listings (future enhancement)
    """

    business = models.ForeignKey(
        BusinessListing, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="business_images/%Y/%m/")
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "business_images"
        ordering = ["-is_primary", "uploaded_at"]


class SearchHistory(models.Model):
    """
    Track user search queries for analytics and personalization
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="searches", null=True, blank=True
    )
    session_id = models.CharField(max_length=100, db_index=True)
    search_query = models.CharField(max_length=200)
    radius_km = models.PositiveIntegerField(default=10)
    results_count = models.PositiveIntegerField(default=0)
    searched_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "search_history"
        ordering = ["-searched_at"]
        indexes = [
            models.Index(fields=["session_id", "searched_at"]),
            models.Index(fields=["search_query"]),
        ]

    def __str__(self):
        return f"Search: '{self.search_query}' at {self.searched_at}"


class BusinessAnalytics(models.Model):
    """
    Track business listing performance metrics
    """

    business = models.ForeignKey(
        BusinessListing, on_delete=models.CASCADE, related_name="analytics"
    )
    date = models.DateField(db_index=True)
    profile_views = models.PositiveIntegerField(default=0)
    phone_click_count = models.PositiveIntegerField(default=0)
    location_click_count = models.PositiveIntegerField(default=0)
    search_impressions = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "business_analytics"
        unique_together = ["business", "date"]
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["business", "date"]),
        ]

    def __str__(self):
        return f"Analytics for {self.business.title} - {self.date}"