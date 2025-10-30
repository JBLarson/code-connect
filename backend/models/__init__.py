from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid

db = SQLAlchemy()

class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = db.Column(db.String(20), nullable=False)  # 'developer' | 'idea_generator' | 'both'
    name = db.Column(db.String(255))
    location = db.Column(db.String(255))
    bio = db.Column(db.Text)
    skills = db.Column(JSONB)  # ['Python', 'React', etc.]
    github_url = db.Column(db.String(255))
    linkedin_url = db.Column(db.String(255))
    contact_email = db.Column(db.String(255)) # <-- NEW: User-provided contact email
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_projects = db.relationship('Project', back_populates='creator', lazy='dynamic')
    interests = db.relationship('Interest', back_populates='developer', lazy='dynamic')
    
    def to_dict(self, include_contact=False):
        """
        Convert to dictionary.
        Only include contact_email if include_contact is True.
        """
        data = {
            'id': str(self.id),
            'role': self.role,
            'name': self.name,
            'location': self.location,
            'bio': self.bio,
            'skills': self.skills or [],
            'github_url': self.github_url,
            'linkedin_url': self.linkedin_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_contact:
            data['contact_email'] = self.contact_email
            
        return data


class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    creator_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user_profiles.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    tech_stack = db.Column(JSONB, nullable=False)  # ['Python', 'Flask', etc.]
    location = db.Column(db.String(255))
    time_commitment = db.Column(db.String(50))  # 'part-time' | 'full-time' | 'flexible'
    skill_level = db.Column(db.String(20))  # 'beginner' | 'intermediate' | 'advanced'
    status = db.Column(db.String(20), default='open')  # 'open' | 'in_progress' | 'completed' | 'cancelled'
    repo_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    creator = db.relationship('UserProfile', back_populates='created_projects')
    interests = db.relationship('Interest', back_populates='project', cascade='all, delete-orphan')
    
    def to_dict(self, include_creator=False, include_creator_contact=False):
        """
        Convert to dictionary.
        include_creator_contact determines if the creator's contact info is included.
        """
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'tech_stack': self.tech_stack or [],
            'location': self.location,
            'time_commitment': self.time_commitment,
            'skill_level': self.skill_level,
            'status': self.status,
            'repo_url': self.repo_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_creator and self.creator:
            data['creator'] = self.creator.to_dict(include_contact=include_creator_contact)
        return data


class Interest(db.Model):
    __tablename__ = 'interests'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    developer_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user_profiles.id', ondelete='CASCADE'), nullable=False)
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # 'pending' | 'accepted' | 'declined'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    project = db.relationship('Project', back_populates='interests')
    developer = db.relationship('UserProfile', back_populates='interests')
    
    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('project_id', 'developer_id', name='unique_project_developer'),
    )
    
    def to_dict(self, include_project=False, include_developer=False, include_project_contact=False, include_developer_contact=False):
        """
        Convert to dictionary.
        Conditionally include project and developer details, including contact info.
        """
        data = {
            'id': self.id,
            'project_id': self.project_id,
            'developer_id': str(self.developer_id),
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_project and self.project:
            data['project'] = self.project.to_dict(include_creator=True, include_creator_contact=include_project_contact)
        if include_developer and self.developer:
            data['developer'] = self.developer.to_dict(include_contact=include_developer_contact)
        return data
