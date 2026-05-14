from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class AdminUser(db.Model):
    __tablename__ = 'admin_users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # can be plain or hashed
    display_name = db.Column(db.String(255), default='Admin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def check_password(self, raw_password):
        """
        Dual-mode login:
        1. Try plain-text comparison first
        2. If that fails, try werkzeug hash comparison
        """
        # 1) Plain text comparison
        if self.password == raw_password:
            return True
        # 2) Hashed comparison (werkzeug pbkdf2)
        try:
            return check_password_hash(self.password, raw_password)
        except Exception:
            return False

    def set_password_hashed(self, raw_password):
        """Hash the password with werkzeug"""
        self.password = generate_password_hash(raw_password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'displayName': self.display_name,
        }
