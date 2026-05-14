from flask import Blueprint, request, jsonify
from app import db
from app.models.team import TeamMember
from app.routes.auth import token_required

team_bp = Blueprint('team', __name__)


@team_bp.route('', methods=['GET'])
def list_team():
    members = TeamMember.query.order_by(TeamMember.sort_order).all()
    return jsonify([m.to_dict() for m in members])


@team_bp.route('', methods=['POST'])
@token_required
def create_member(current_user):
    data = request.get_json()
    m = TeamMember(
        name=data.get('name', ''),
        position=data.get('position', ''),
        bio=data.get('bio', ''),
        photo=data.get('photo', ''),
        facebook=data.get('facebook', ''),
        linkedin=data.get('linkedin', ''),
        sort_order=data.get('sortOrder', 0),
    )
    db.session.add(m)
    db.session.commit()
    return jsonify(m.to_dict()), 201


@team_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_member(current_user, id):
    m = db.session.get(TeamMember, id)
    if not m:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('name', 'name'), ('position', 'position'), ('bio', 'bio'),
                      ('photo', 'photo'), ('facebook', 'facebook'), ('linkedin', 'linkedin'),
                      ('sortOrder', 'sort_order')]:
        if key in data:
            setattr(m, attr, data[key])
    db.session.commit()
    return jsonify(m.to_dict())


@team_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_member(current_user, id):
    m = db.session.get(TeamMember, id)
    if not m:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(m)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
