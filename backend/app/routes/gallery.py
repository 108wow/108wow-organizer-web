from flask import Blueprint, request, jsonify
from app import db
from app.models.gallery import GalleryItem
from app.routes.auth import token_required

gallery_bp = Blueprint('gallery', __name__)


@gallery_bp.route('', methods=['GET'])
def list_gallery():
    items = GalleryItem.query.order_by(GalleryItem.sort_order).all()
    return jsonify([g.to_dict() for g in items])


@gallery_bp.route('/<int:id>', methods=['GET'])
def get_gallery(id):
    item = db.session.get(GalleryItem, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(item.to_dict())


@gallery_bp.route('', methods=['POST'])
@token_required
def create_gallery(current_user):
    data = request.get_json()
    item = GalleryItem(
        title=data.get('title', ''),
        description=data.get('description', ''),
        category=data.get('category', 'Web'),
        image=data.get('image', ''),
        album_url=data.get('albumUrl', ''),
        sort_order=data.get('sortOrder', 0),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@gallery_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_gallery(current_user, id):
    item = db.session.get(GalleryItem, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('title', 'title'), ('description', 'description'), ('category', 'category'),
                      ('image', 'image'), ('albumUrl', 'album_url'), ('sortOrder', 'sort_order')]:
        if key in data:
            setattr(item, attr, data[key])
    db.session.commit()
    return jsonify(item.to_dict())


@gallery_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_gallery(current_user, id):
    item = db.session.get(GalleryItem, id)
    if not item:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
