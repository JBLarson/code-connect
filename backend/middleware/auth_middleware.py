# backend/middleware/auth_middleware.py

import jwt
import os
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

load_dotenv()

def verify_token(f):
    """Middleware to verify Supabase JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        try:
            # Decode and verify Supabase JWT
            payload = jwt.decode(
                token,
                os.getenv('SUPABASE_JWT_SECRET'),
                algorithms=['HS256'],
                audience='authenticated'
            )
            
            # Attach user ID to request object
            request.user_id = payload['sub']
            
            return f(*args, **kwargs)
        
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        
        except jwt.InvalidTokenError as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        
        except Exception as e:
            return jsonify({'error': f'Authentication failed: {str(e)}'}), 401
    
    return decorated