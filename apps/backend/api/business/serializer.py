from rest_framework import serializers
from ..models import BusinessListing


class BusinessListingGetSerializer(serializers.ModelSerializer):
    location_url = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField() 

    class Meta:
        model = BusinessListing
        fields = [
            "id",
            "title",
            "business_category",
            "service_detail",
            "phone_no",
            "email",
            "latitude",
            "longitude",
            "address",
            "location_url",
            "distance_km",  
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_location_url(self, obj):
        if obj.latitude and obj.longitude:
            return f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
        return None

    def get_distance_km(self, obj):
        """Present annotated distance only when a radius search was done."""
        distance = getattr(obj, "distance_km", None)
        if distance is not None:
            return round(distance, 2)
        return None


class BusinessListingCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for Business Listing with validation
    """

    class Meta:
        model = BusinessListing
        fields = [
            "id",
            "title",
            "business_category",
            "service_detail",
            "phone_no",
            "email",
            "latitude",
            "longitude",
            "address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_phone_no(self, value):
        """Validate phone number format (E.164)"""
        import re

        if not re.match(r"^\+\d{1,15}$", value):
            raise serializers.ValidationError(
                "Phone number must be in E.164 format (e.g., +1234567890)"
            )
        return value

    def validate_latitude(self, value):
        """Validate latitude range"""
        if value is not None:
            if not -90 <= value <= 90:
                raise serializers.ValidationError("Latitude must be between -90 and 90")
        return value

    def validate_longitude(self, value):
        """Validate longitude range"""
        if value is not None:
            if not -180 <= value <= 180:
                raise serializers.ValidationError(
                    "Longitude must be between -180 and 180"
                )
        return value

    def validate_request(self, data):
        """
        Validate that if latitude is provided, longitude must also be provided
        """
        if data.get("latitude") and not data.get("longitude"):
            raise serializers.ValidationError(
                {"longitude": "Longitude is required when latitude is provided"}
            )

        if data.get("longitude") and not data.get("latitude"):
            raise serializers.ValidationError(
                {"latitude": "Latitude is required when longitude is provided"}
            )

        return data


class BusinessListingUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating business listing
    """

    class Meta:
        model = BusinessListing
        fields = [
            "title",
            "business_category",
            "service_detail",
            "phone_no",
            "email",
            "latitude",
            "longitude",
            "address",
        ]

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(
                "Business title must be at least 3 characters long"
            )
        return value.strip()

    def validate_business_category(self, value):
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError(
                "Business category must be at least 2 characters long"
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "Business category cannot exceed 50 characters"
            )
        return value.strip()

    def validate_service_detail(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError(
                "Service detail must be at least 20 characters long"
            )
        return value.strip()

    def validate_phone_no(self, value):
        import re

        if not re.match(r"^\+\d{1,15}$", value):
            raise serializers.ValidationError("Phone number must be in E.164 format")
        return value

    def validate_latitude(self, value):
        if value is not None:
            if not -90 <= value <= 90:
                raise serializers.ValidationError("Latitude must be between -90 and 90")
        return value

    def validate_longitude(self, value):
        if value is not None:
            if not -180 <= value <= 180:
                raise serializers.ValidationError(
                    "Longitude must be between -180 and 180"
                )
        return value

    def validate_request(self, data):
        """
        Validate that if latitude is provided, longitude must also be provided
        """
        if data.get("latitude") and not data.get("longitude"):
            raise serializers.ValidationError(
                {"longitude": "Longitude is required when latitude is provided"}
            )

        if data.get("longitude") and not data.get("latitude"):
            raise serializers.ValidationError(
                {"latitude": "Latitude is required when longitude is provided"}
            )

        return data
