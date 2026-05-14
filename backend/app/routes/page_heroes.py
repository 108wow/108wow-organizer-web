from flask import Blueprint, request, jsonify
from app import db
from app.models.page_hero import PageHero
from app.routes.auth import token_required

page_heroes_bp = Blueprint('page_heroes', __name__)


@page_heroes_bp.route('', methods=['GET'])
def list_page_heroes():
    heroes = PageHero.query.all()
    # Return as dict keyed by page_key for easy frontend use
    result = {}
    for h in heroes:
        result[h.page_key] = h.to_dict()
    return jsonify(result)


@page_heroes_bp.route('/<string:page_key>', methods=['PUT'])
@token_required
def update_page_hero(current_user, page_key):
    hero = PageHero.query.filter_by(page_key=page_key).first()
    if not hero:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('title', 'title'), ('subtitle', 'subtitle'), ('image', 'image')]:
        if key in data:
            setattr(hero, attr, data[key])
    db.session.commit()
    return jsonify(hero.to_dict())
