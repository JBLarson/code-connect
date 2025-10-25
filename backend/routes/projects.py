from flask import Blueprint, request, jsonify
from models import db, Project, UserProfile, Interest
from middleware.auth_middleware import verify_token
from sqlalchemy.exc import IntegrityError
from sqlalchemy import desc



projects_bp = Blueprint('projects', __name__)



@projects_bp.route('', methods=['GET'])
def get_projects():
    """Get all projects with optional filters"""
    try:
        # Get query parameters
        status = request.args.get('status', 'open')
        location = request.args.get('location')
        skill_level = request.args.get('skill_level')
        tech_stack = request.args.get('tech_stack')  # comma-separated
        
        # Build query
        query = Project.query
        
        # Apply filters
        if status:
            query = query.filter(Project.status == status)
        
        if location:
            query = query.filter(Project.location.ilike(f'%{location}%'))
        
        if skill_level:
            query = query.filter(Project.skill_level == skill_level)
        
        if tech_stack:
            # Filter by tech stack (contains any of the specified technologies)
            techs = [t.strip() for t in tech_stack.split(',')]
            for tech in techs:
                query = query.filter(Project.tech_stack.contains([tech]))
        
        # Order by most recent
        projects = query.order_by(desc(Project.created_at)).all()
        
        return jsonify([p.to_dict(include_creator=True) for p in projects]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@projects_bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """Get single project by ID with additional details"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Get interest count
        interest_count = Interest.query.filter_by(project_id=project_id).count()
        
        project_data = project.to_dict(include_creator=True)
        project_data['interest_count'] = interest_count
        
        return jsonify(project_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@projects_bp.route('', methods=['POST'])
@verify_token
def create_project():
    """Create a new project"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'tech_stack']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate tech_stack is array
        if not isinstance(data['tech_stack'], list) or len(data['tech_stack']) == 0:
            return jsonify({'error': 'tech_stack must be a non-empty array'}), 400
        
        # Validate skill_level if provided
        valid_skill_levels = ['beginner', 'intermediate', 'advanced']
        if data.get('skill_level') and data['skill_level'] not in valid_skill_levels:
            return jsonify({'error': f'skill_level must be one of: {", ".join(valid_skill_levels)}'}), 400
        
        # Validate time_commitment if provided
        valid_commitments = ['part-time', 'full-time', 'flexible']
        if data.get('time_commitment') and data['time_commitment'] not in valid_commitments:
            return jsonify({'error': f'time_commitment must be one of: {", ".join(valid_commitments)}'}), 400
        
        # Check if user has a profile
        profile = UserProfile.query.get(request.user_id)
        if not profile:
            return jsonify({'error': 'You must create a profile before posting projects'}), 403
        
        # Create project
        project = Project(
            creator_id=request.user_id,
            title=data['title'],
            description=data['description'],
            tech_stack=data['tech_stack'],
            location=data.get('location'),
            time_commitment=data.get('time_commitment', 'flexible'),
            skill_level=data.get('skill_level', 'intermediate'),
            repo_url=data.get('repo_url')
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify(project.to_dict(include_creator=True)), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500





@projects_bp.route('/<int:project_id>', methods=['PUT'])
@verify_token
def update_project(project_id):
    """Update a project (only by creator)"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user is the creator
        if str(project.creator_id) != request.user_id:
            return jsonify({'error': 'You can only update your own projects'}), 403
        
        data = request.get_json()
        
        # Validate tech_stack if provided
        if 'tech_stack' in data:
            if not isinstance(data['tech_stack'], list) or len(data['tech_stack']) == 0:
                return jsonify({'error': 'tech_stack must be a non-empty array'}), 400
        
        # Validate skill_level if provided
        valid_skill_levels = ['beginner', 'intermediate', 'advanced']
        if 'skill_level' in data and data['skill_level'] not in valid_skill_levels:
            return jsonify({'error': f'skill_level must be one of: {", ".join(valid_skill_levels)}'}), 400
        
        # Validate time_commitment if provided
        valid_commitments = ['part-time', 'full-time', 'flexible']
        if 'time_commitment' in data and data['time_commitment'] not in valid_commitments:
            return jsonify({'error': f'time_commitment must be one of: {", ".join(valid_commitments)}'}), 400
        
        # Validate status if provided
        valid_statuses = ['open', 'in_progress', 'completed', 'cancelled']
        if 'status' in data and data['status'] not in valid_statuses:
            return jsonify({'error': f'status must be one of: {", ".join(valid_statuses)}'}), 400
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'tech_stack', 'location', 
                         'time_commitment', 'skill_level', 'status', 'repo_url']
        for field in allowed_fields:
            if field in data:
                setattr(project, field, data[field])
        
        db.session.commit()
        
        return jsonify(project.to_dict(include_creator=True)), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500





@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@verify_token
def delete_project(project_id):
    """Delete a project (only by creator)"""
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Check if user is the creator
    except Exception as uh:
        print(uh)






@projects_bp.route('/my-projects', methods=['GET'])
@verify_token
def get_my_projects():
    """Get all projects created by the current user"""
    try:
        projects = Project.query.filter_by(creator_id=request.user_id).order_by(desc(Project.created_at)).all()
        
        return jsonify([p.to_dict(include_creator=False) for p in projects]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500





@projects_bp.route('/user/<uuid:user_id>', methods=['GET'])
def get_user_projects(user_id):
    """Get all projects created by a specific user (public)"""
    try:
        projects = Project.query.filter_by(creator_id=user_id).order_by(desc(Project.created_at)).all()
        
        return jsonify([p.to_dict(include_creator=False) for p in projects]), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500