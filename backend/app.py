# backend/app.py

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate

from models import db
from config import Config

from routes.profile import profile_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app)
    migrate = Migrate(app, db)
    
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    
    # Health check
    @app.route('/health')
    def health():
        return {'status': 'ok'}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)