import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'suspended-tech-secret-key-2026')
    JWT_SECRET = os.environ.get('JWT_SECRET', 'jwt-suspended-tech-2026')
    JWT_EXPIRATION_HOURS = 24

    # MySQL — support both custom env vars and Railway's default env vars
    MYSQL_USER = os.environ.get('MYSQL_USER') or os.environ.get('MYSQLUSER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD') or os.environ.get('MYSQLPASSWORD', '1234')
    MYSQL_HOST = os.environ.get('MYSQL_HOST') or os.environ.get('MYSQLHOST', 'localhost')
    MYSQL_PORT = os.environ.get('MYSQL_PORT') or os.environ.get('MYSQLPORT', '3306')
    MYSQL_DB = os.environ.get('MYSQL_DB') or os.environ.get('MYSQLDATABASE', 'suspended_tech')

    SQLALCHEMY_DATABASE_URI = (
        f"mysql+mysqldb://{MYSQL_USER}:{MYSQL_PASSWORD}"
        f"@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DB}?charset=utf8mb4"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Upload
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}
