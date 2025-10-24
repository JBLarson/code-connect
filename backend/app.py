# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from models import db
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    migrate = Migrate(app, db)
    
    # Register blueprints (routes)
    # from routes.projects import projects_bp
    # app.register_blueprint(projects_bp, url_prefix='/api/projects')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)