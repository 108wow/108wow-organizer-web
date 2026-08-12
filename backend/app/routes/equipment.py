from flask import Blueprint, request, jsonify
from app import db
from app.models.equipment import Equipment
from app.routes.auth import token_required

equipment_bp = Blueprint('equipment', __name__)


@equipment_bp.route('', methods=['GET'])
def list_equipment():
    category = request.args.get('category')
    search = request.args.get('search')
    
    query = Equipment.query
    if category and category != 'ทั้งหมด':
        query = query.filter(Equipment.category == category)
    if search:
        query = query.filter(Equipment.name.ilike(f'%{search}%') | Equipment.description.ilike(f'%{search}%'))
        
    items = query.order_by(Equipment.sort_order.asc(), Equipment.created_at.desc()).all()
    return jsonify([eq.to_dict() for eq in items])


@equipment_bp.route('/<string:id>', methods=['GET'])
def get_equipment(id):
    item = db.session.get(Equipment, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(item.to_dict())


@equipment_bp.route('', methods=['POST'])
@token_required
def create_equipment(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'กรุณาระบุชื่ออุปกรณ์'}), 400

    images = data.get('images', [])
    cover_image = data.get('coverImage', '') or (images[0] if images else '')

    item = Equipment(
        name=name,
        category=data.get('category', 'ทั่วไป').strip() or 'ทั่วไป',
        description=data.get('description', '').strip(),
        cover_image=cover_image,
        images=images,
        sort_order=data.get('sortOrder', 0),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@equipment_bp.route('/reorder', methods=['PUT'])
@token_required
def reorder_equipment(current_user):
    data = request.get_json() or []
    # Data expected: [{ id: 'uuid-string', sortOrder: 0 }, ...]
    for item_data in data:
        eq_id = item_data.get('id')
        new_order = item_data.get('sortOrder')
        if eq_id is not None and new_order is not None:
            eq = db.session.get(Equipment, eq_id)
            if eq:
                eq.sort_order = new_order
    db.session.commit()
    return jsonify({'message': 'Reordered successfully'})


@equipment_bp.route('/<string:id>', methods=['PUT'])
@token_required
def update_equipment(current_user, id):
    item = db.session.get(Equipment, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
        
    data = request.get_json() or {}
    if 'name' in data:
        item.name = data['name'].strip()
    if 'category' in data:
        item.category = data['category'].strip() or 'ทั่วไป'
    if 'description' in data:
        item.description = data['description'].strip()
    if 'images' in data:
        item.images = data['images']
    if 'coverImage' in data:
        item.cover_image = data['coverImage']
    elif item.images and not item.cover_image:
        item.cover_image = item.images[0]
    if 'sortOrder' in data:
        item.sort_order = data['sortOrder']
        
    db.session.commit()
    return jsonify(item.to_dict())


@equipment_bp.route('/<string:id>', methods=['DELETE'])
@token_required
def delete_equipment(current_user, id):
    item = db.session.get(Equipment, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
        
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Deleted successfully'})
