from flask import Blueprint, request, jsonify
from app import db
from app.models.hero import HeroSlide
from app.routes.auth import token_required

heroes_bp = Blueprint('heroes', __name__)


@heroes_bp.route('', methods=['GET'])
def list_heroes():
    slides = HeroSlide.query.order_by(HeroSlide.sort_order).all()
    return jsonify([s.to_dict() for s in slides])


@heroes_bp.route('/<int:id>', methods=['GET'])
def get_hero(id):
    slide = db.session.get(HeroSlide, id)
    if not slide:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(slide.to_dict())


@heroes_bp.route('', methods=['POST'])
@token_required
def create_hero(current_user):
    data = request.get_json()
    slide = HeroSlide(
        title=data.get('title', ''),
        ghost_text=data.get('ghostText', ''),
        subtitle=data.get('subtitle', ''),
        image=data.get('image', ''),
        is_active=data.get('isActive', True),
        sort_order=data.get('sortOrder', 0),
    )
    db.session.add(slide)
    db.session.commit()
    return jsonify(slide.to_dict()), 201


@heroes_bp.route('/<int:id>', methods=['PUT'])
@token_required
def update_hero(current_user, id):
    slide = db.session.get(HeroSlide, id)
    if not slide:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('title', 'title'), ('ghostText', 'ghost_text'), ('subtitle', 'subtitle'),
                      ('image', 'image'), ('isActive', 'is_active'), ('sortOrder', 'sort_order')]:
        if key in data:
            setattr(slide, attr, data[key])
    db.session.commit()
    return jsonify(slide.to_dict())


@heroes_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_hero(current_user, id):
    slide = db.session.get(HeroSlide, id)
    if not slide:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(slide)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
