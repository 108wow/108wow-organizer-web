from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
import os

db = SQLAlchemy()
migrate = Migrate()


def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object('app.config.Config')

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.routes.heroes import heroes_bp
    from app.routes.services import services_bp
    from app.routes.gallery import gallery_bp
    from app.routes.gallery_categories import gallery_category_bp
    from app.routes.blog import blog_bp
    from app.routes.team import team_bp
    from app.routes.clients import clients_bp
    from app.routes.company import company_bp
    from app.routes.page_heroes import page_heroes_bp
    from app.routes.home_config import home_config_bp
    from app.routes.contact import contact_bp
    from app.routes.upload import upload_bp
    from app.routes.auth import auth_bp
    from app.routes.about_config import about_config_bp
    from app.routes.equipment import equipment_bp
    app.register_blueprint(heroes_bp, url_prefix='/api/heroes')
    app.register_blueprint(services_bp, url_prefix='/api/services')
    app.register_blueprint(gallery_bp, url_prefix='/api/gallery')
    app.register_blueprint(gallery_category_bp, url_prefix='/api/gallery-categories')
    app.register_blueprint(blog_bp, url_prefix='/api/blog')
    app.register_blueprint(team_bp, url_prefix='/api/team')
    app.register_blueprint(clients_bp, url_prefix='/api/clients')
    app.register_blueprint(company_bp, url_prefix='/api/company')
    app.register_blueprint(page_heroes_bp, url_prefix='/api/page-heroes')
    app.register_blueprint(home_config_bp, url_prefix='/api/home-config')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(about_config_bp, url_prefix='/api/about-config')
    app.register_blueprint(equipment_bp, url_prefix='/api/equipment')

    # Serve uploaded files
    from flask import send_from_directory

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'SUSPENDED TECH API is running'}

    return app
