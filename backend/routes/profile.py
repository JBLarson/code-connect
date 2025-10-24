from flask import Blueprint, request, jsonify
from models import db, UserProfile
from middleware.auth_middleware import verify_token
from sqlalchemy.exc import IntegrityError

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('', methods=['GET'])
@verify_token
def get_profile():
    """Get current user's profile"""
    try:
        profile = UserProfile.query.get(request.user_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(profile.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@profile_bp.route('/<uuid:user_id>', methods=['GET'])
def get_profile_by_id(user_id):
    """Get any user's profile (public view)"""
    try:
        profile = UserProfile.query.get(user_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        return jsonify(profile.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@profile_bp.route('', methods=['POST'])
@verify_token
def create_profile():
    """Create profile for authenticated user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('role') or data['role'] not in ['developer', 'idea_generator', 'both']:
            return jsonify({'error': 'Valid role is required (developer, idea_generator, or both)'}), 400
        
        # Check if profile already exists
        existing = UserProfile.query.get(request.user_id)
        if existing:
            return jsonify({'error': 'Profile already exists'}), 409
        
        # Create new profile
        profile = UserProfile(
            id=request.user_id,
            role=data['role'],
            name=data.get('name'),
            location=data.get('location'),
            bio=data.get('bio'),
            skills=data.get('skills', []),
            github_url=data.get('github_url'),
            linkedin_url=data.get('linkedin_url')
        )
        
        db.session.add(profile)
        db.session.commit()
        
        return jsonify(profile.to_dict()), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Profile already exists'}), 409
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@profile_bp.route('', methods=['PUT'])
@verify_token
def update_profile():
    """Update current user's profile"""
    try:
        profile = UserProfile.query.get(request.user_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        data = request.get_json()
        
        # Validate role if provided
        if 'role' in data and data['role'] not in ['developer', 'idea_generator', 'both']:
            return jsonify({'error': 'Valid role is required (developer, idea_generator, or both)'}), 400
        
        # Update allowed fields
        allowed_fields = ['role', 'name', 'location', 'bio', 'skills', 'github_url', 'linkedin_url']
        for field in allowed_fields:
            if field in data:
                setattr(profile, field, data[field])
        
        db.session.commit()
        
        return jsonify(profile.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@profile_bp.route('', methods=['DELETE'])
@verify_token
def delete_profile():
    """Delete current user's profile (soft delete - just remove data but keep user in auth)"""
    try:
        profile = UserProfile.query.get(request.user_id)
        
        if not profile:
            return jsonify({'error': 'Profile not found'}), 404
        
        db.session.delete(profile)
        db.session.commit()
        
        return jsonify({'message': 'Profile deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500