from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class OTPRequestSerializer(serializers.Serializer):
    """Serializer for requesting OTP"""
    email = serializers.EmailField(max_length=255)
    
    def validate_email(self, value):
        if not value or '@' not in value:
            raise serializers.ValidationError("Valid email is required")
        return value


class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    otp = serializers.CharField(min_length=6, max_length=6)
    session_token = serializers.CharField()
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits")
        return value


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration"""
    email = serializers.EmailField(max_length=255)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value