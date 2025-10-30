from flask import Blueprint, request, jsonify
from models import db, Interest, Project, UserProfile
from middleware.auth_middleware import verify_token
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc

interests_bp = Blueprint('interests', __name__)


@interests_bp.route('', methods=['POST'])
@verify_token
def express_interest():
    """Express interest in a project"""
    try:
        data = request.get_json()
        
        if not data.get('project_id'):
            return jsonify({'error': 'project_id is required'}), 400
        
        project_id = data['project_id']
        
        # Check if project exists
        project = Project.query.get(project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user has a profile
        profile = UserProfile.query.get(request.user_id)
        if not profile:
            return jsonify({'error': 'You must create a profile before expressing interest'}), 403
        
        # Check if user is the project creator
        if str(project.creator_id) == request.user_id:
            return jsonify({'error': 'You cannot express interest in your own project'}), 400
        
        # Check if project is open
        if project.status != 'open':
            return jsonify({'error': 'This project is not accepting new contributors'}), 400
        
        # Create interest
        interest = Interest(
            project_id=project_id,
            developer_id=request.user_id,
            message=data.get('message', '')
        )
        
        db.session.add(interest)
        db.session.commit()
        
        return jsonify(interest.to_dict(include_project=True, include_developer=True)), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'You have already expressed interest in this project'}), 409
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@interests_bp.route('/project/<int:project_id>', methods=['GET'])
@verify_token
def get_project_interests(project_id):
    """Get all interests for a project (project owner only)"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user is the project creator
        if str(project.creator_id) != request.user_id:
            return jsonify({'error': 'You can only view interests for your own projects'}), 403
        
        interests = Interest.query.filter_by(project_id=project_id).order_by(desc(Interest.created_at)).all()
        
        # NEW: Conditionally include developer contact info
        interests_data = []
        for i in interests:
            # Only include contact info if the interest has been accepted
            include_contact = i.status == 'accepted'
            interests_data.append(i.to_dict(include_developer=True, include_developer_contact=include_contact))
            
        return jsonify(interests_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@interests_bp.route('/my-interests', methods=['GET'])
@verify_token
def get_my_interests():
    """Get all interests expressed by the current user"""
    try:
        interests = Interest.query.filter_by(developer_id=request.user_id).order_by(desc(Interest.created_at)).all()
        
        # NEW: Conditionally include project creator contact info
        interests_data = []
        for i in interests:
            # Only include contact info if the interest has been accepted
            include_contact = i.status == 'accepted'
            interests_data.append(i.to_dict(include_project=True, include_project_contact=include_contact))

        return jsonify(interests_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@interests_bp.route('/<int:interest_id>', methods=['PUT'])
@verify_token
def update_interest_status(interest_id):
    """Update interest status (project owner only)"""
    try:
        interest = Interest.query.get(interest_id)
        
        if not interest:
            return jsonify({'error': 'Interest not found'}), 404
        
        # Check if user is the project creator
        if str(interest.project.creator_id) != request.user_id:
            return jsonify({'error': 'You can only update interests for your own projects'}), 403
        
        data = request.get_json()
        
        # Validate status
        valid_statuses = ['pending', 'accepted', 'declined']
        if 'status' in data and data['status'] not in valid_statuses:
            return jsonify({'error': f'status must be one of: {", ".join(valid_statuses)}'}), 400
        
        if 'status' in data:
            interest.status = data['status']
        
        db.session.commit()
        
        # NEW: Conditionally include developer contact info
        include_contact = interest.status == 'accepted'
        return jsonify(interest.to_dict(include_developer=True, include_developer_contact=include_contact)), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@interests_bp.route('/<int:interest_id>', methods=['DELETE'])
@verify_token
def withdraw_interest(interest_id):
    """Withdraw interest (developer only)"""
    try:
        interest = Interest.query.get(interest_id)
        
        if not interest:
            return jsonify({'error': 'Interest not found'}), 404
        
        # Check if user is the developer who expressed interest
        if str(interest.developer_id) != request.user_id:
            return jsonify({'error': 'You can only withdraw your own interests'}), 403
        
        db.session.delete(interest)
        db.session.commit()
        
        return jsonify({'message': 'Interest withdrawn successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@interests_bp.route('/check/<int:project_id>', methods=['GET'])
@verify_token
def check_interest(project_id):
    """Check if current user has expressed interest in a project"""
    try:
        interest = Interest.query.filter_by(
            project_id=project_id,
            developer_id=request.user_id
        ).first()
        
        if interest:
            # NEW: Conditionally include project creator contact info
            include_contact = interest.status == 'accepted'
            return jsonify({
                'has_interest': True,
                'interest': interest.to_dict(include_project_contact=include_contact)
            }), 200
        else:
            return jsonify({'has_interest': False}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
