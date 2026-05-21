from flask import Blueprint, request, jsonify
from app import db
from app.models.gallery import GalleryCategory
from app.routes.auth import token_required

gallery_category_bp = Blueprint('gallery_categories', __name__)

@gallery_category_bp.route('', methods=['GET'])
def list_categories():
    items = GalleryCategory.query.order_by(GalleryCategory.sort_order).all()
    return jsonify([c.to_dict() for c in items])

@gallery_category_bp.route('', methods=['POST'])
@token_required
def create_category(current_user):
    data = request.get_json()
    item = GalleryCategory(
        name=data.get('name', ''),
        icon=data.get('icon', 'bi-images'),
        sort_order=data.get('sortOrder', 0)
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@gallery_category_bp.route('/reorder', methods=['PUT'])
@token_required
def reorder_categories(current_user):
    data = request.get_json()
    for item in data:
        cat = db.session.get(GalleryCategory, item.get('id'))
        if cat:
            cat.sort_order = item.get('sortOrder')
    db.session.commit()
    return jsonify({'message': 'Reordered successfully'})

@gallery_category_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_category(current_user, id):
    item = db.session.get(GalleryCategory, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('name', 'name'), ('icon', 'icon'), ('sortOrder', 'sort_order')]:
        if key in data:
            setattr(item, attr, data[key])
    db.session.commit()
    return jsonify(item.to_dict())

@gallery_category_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_category(current_user, id):
    item = db.session.get(GalleryCategory, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
