from flask import Blueprint, request, jsonify
from app import db
from app.models.client import Client
from app.routes.auth import token_required

clients_bp = Blueprint('clients', __name__)


@clients_bp.route('', methods=['GET'])
def list_clients():
    items = Client.query.order_by(Client.category, Client.name).all()
    return jsonify([c.to_dict() for c in items])


@clients_bp.route('', methods=['POST'])
@token_required
def create_client(current_user):
    data = request.get_json()
    c = Client(
        name=data.get('name', ''),
        logo=data.get('logo', ''),
        category=data.get('category', 'Technology'),
    )
    db.session.add(c)
    db.session.commit()
    return jsonify(c.to_dict()), 201


@clients_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_client(current_user, id):
    c = db.session.get(Client, id)
    if not c:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('name', 'name'), ('logo', 'logo'), ('category', 'category')]:
        if key in data:
            setattr(c, attr, data[key])
    db.session.commit()
    return jsonify(c.to_dict())


@clients_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_client(current_user, id):
    c = db.session.get(Client, id)
    if not c:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(c)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
