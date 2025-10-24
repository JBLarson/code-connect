# backend/middleware/auth_middleware.py
import jwt
from functools import wraps
from flask import request, jsonify
import os

def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Verify Supabase JWT
            payload = jwt.decode(
                token,
                os.getenv('SUPABASE_JWT_SECRET'),
                algorithms=['HS256'],
                audience='authenticated'
            )
            request.user_id = payload['sub']  # Supabase user ID
            return f(*args, **kwargs)
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated