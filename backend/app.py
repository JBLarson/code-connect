# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from models import db
from config import Config

from routes.profile import profile_bp
from routes.projects import projects_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True
        }
    })
    
    migrate = Migrate(app, db)
    
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')

    # Health check
    @app.route('/health')
    def health():
        return {'status': 'ok'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)