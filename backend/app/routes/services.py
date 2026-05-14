from flask import Blueprint, request, jsonify
from app import db
from app.models.service import Service
from app.routes.auth import token_required

services_bp = Blueprint('services', __name__)


@services_bp.route('', methods=['GET'])
def list_services():
    items = Service.query.order_by(Service.sort_order).all()
    return jsonify([s.to_dict() for s in items])


@services_bp.route('/<int:id>', methods=['GET'])
def get_service(id):
    item = db.session.get(Service, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(item.to_dict())


@services_bp.route('', methods=['POST'])
@token_required
def create_service(current_user):
    data = request.get_json()
    item = Service(
        title=data.get('title', ''),
        description=data.get('description', ''),
        icon=data.get('icon', 'bi-code-slash'),
        image=data.get('image', ''),
        is_active=data.get('isActive', True),
        sort_order=data.get('sortOrder', 0),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@services_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_service(current_user, id):
    item = db.session.get(Service, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('title', 'title'), ('description', 'description'), ('icon', 'icon'),
                      ('image', 'image'), ('isActive', 'is_active'), ('sortOrder', 'sort_order')]:
        if key in data:
            setattr(item, attr, data[key])
    db.session.commit()
    return jsonify(item.to_dict())


@services_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_service(current_user, id):
    item = db.session.get(Service, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
