from django.core.exceptions import ValidationError
import re


def validate_e164_phone(value):
    """
    Validates phone number in E.164 format
    Format: +[country code][number], e.g., +14155552671
    """
    pattern = r"^\+[1-9]\d{1,14}$"
    if not re.match(pattern, value):
        raise ValidationError(
            "Phone number must be in E.164 format (e.g., +14155552671)"
        )


