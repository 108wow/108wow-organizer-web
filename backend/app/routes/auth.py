from flask import Blueprint, request, jsonify
from app.models.user import AdminUser
from app import db
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)


def get_jwt_secret():
    from flask import current_app
    return current_app.config['JWT_SECRET']


def token_required(f):
    """Decorator to protect admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, get_jwt_secret(), algorithms=['HS256'])
            current_user = db.session.get(AdminUser, data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    user = AdminUser.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    # Generate JWT
    from flask import current_app
    exp_hours = current_app.config.get('JWT_EXPIRATION_HOURS', 24)
    token = jwt.encode(
        {
            'user_id': user.id,
            'username': user.username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=exp_hours),
        },
        get_jwt_secret(),
        algorithm='HS256',
    )

    return jsonify({
        'token': token,
        'user': user.to_dict(),
    })


@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify(current_user.to_dict())
