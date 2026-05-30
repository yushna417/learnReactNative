import jwt
from datetime import datetime
from django.conf import settings
from cryptography.fernet import Fernet

# Initialize Fernet cipher
FERNET_KEY = settings.FERNET_KEY
cipher_suite = Fernet(FERNET_KEY)
JWT_SECRET = settings.SECRET_KEY


def create_token(payload):
    """
    Create encrypted JWT token
    Converts datetime objects to timestamps for JSON serialization
    """
    # Convert datetime objects to timestamp if present
    if 'exp' in payload and isinstance(payload['exp'], datetime):
        payload['exp'] = payload['exp'].timestamp()
    
    # Create JWT token
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    
    # Encrypt the token
    encrypted_token = cipher_suite.encrypt(token.encode()).decode()
    
    return encrypted_token


def decrypt_token(enc_token):
    """
    Decrypt and verify JWT token
    Returns dict with 'status' and either 'payload' or 'error'
    """
    try:
        # Decrypt the token
        dec_token = cipher_suite.decrypt(enc_token.encode()).decode()
        
        # Decode JWT
        payload = jwt.decode(dec_token, JWT_SECRET, algorithms=['HS256'])
        
        # Check expiration if present
        if 'exp' in payload:
            exp_timestamp = payload['exp']
            if exp_timestamp < datetime.now().timestamp():
                return {
                    'status': False, 
                    'error': 'Token expired'
                }
        
        return {
            'status': True, 
            'payload': payload
        }
        
    except jwt.ExpiredSignatureError:
        return {
            'status': False, 
            'error': 'Token expired'
        }
    except jwt.InvalidTokenError:
        return {
            'status': False, 
            'error': 'Invalid token'
        }
    except Exception as e:
        return {
            'status': False, 
            'error': str(e)
        }