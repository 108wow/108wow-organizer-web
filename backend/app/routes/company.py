from flask import Blueprint, request, jsonify
from app import db
from app.models.company import CompanyInfo, CompanyStat
from app.routes.auth import token_required

company_bp = Blueprint('company', __name__)


# ─── Company Info (singleton) ───
@company_bp.route('', methods=['GET'])
def get_company():
    info = db.session.get(CompanyInfo, 1)
    if not info:
        return jsonify({}), 404
    return jsonify(info.to_dict())


@company_bp.route('', methods=['PUT'])
@token_required
def update_company(current_user):
    info = db.session.get(CompanyInfo, 1)
    if not info:
        info = CompanyInfo(id=1)
        db.session.add(info)
    data = request.get_json()
    for key, attr in [('name', 'name'), ('footerName', 'footer_name'), ('tagline', 'tagline'), ('about', 'about'),
                      ('mission', 'mission'), ('vision', 'vision'), ('address', 'address'),
                      ('phone', 'phone'), ('email', 'email'), ('logoUrl', 'logo_url'),
                      ('officeHours', 'office_hours'),
                      ('googleMapEmbed', 'google_map_embed'),
                      ('facebook', 'facebook'), ('showFacebook', 'show_facebook'),
                      ('lineId', 'line_id'), ('showLine', 'show_line'),
                      ('instagram', 'instagram'), ('showInstagram', 'show_instagram'),
                      ('ctaTitle', 'cta_title'), ('ctaSubtitle', 'cta_subtitle'),
                      ('ctaButtonText', 'cta_button_text'), ('ctaButtonLink', 'cta_button_link'),
                      ('primaryColor', 'primary_color'), ('navyColor', 'navy_color')]:
        if key in data:
            setattr(info, attr, data[key])
    db.session.commit()
    return jsonify(info.to_dict())


# ─── Company Stats ───
@company_bp.route('/stats', methods=['GET'])
def list_stats():
    stats = CompanyStat.query.order_by(CompanyStat.sort_order).all()
    return jsonify([s.to_dict() for s in stats])


@company_bp.route('/stats', methods=['POST'])
@token_required
def create_stat(current_user):
    data = request.get_json()
    s = CompanyStat(
        label=data.get('label', ''),
        value=data.get('value', '0'),
        sort_order=data.get('sortOrder', 0),
    )
    db.session.add(s)
    db.session.commit()
    return jsonify(s.to_dict()), 201


@company_bp.route('/stats/<int:id>', methods=['PUT'])
@token_required
def update_stat(current_user, id):
    s = db.session.get(CompanyStat, id)
    if not s:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    for key, attr in [('label', 'label'), ('value', 'value'), ('sortOrder', 'sort_order')]:
        if key in data:
            setattr(s, attr, data[key])
    db.session.commit()
    return jsonify(s.to_dict())


@company_bp.route('/stats/<int:id>', methods=['DELETE'])
@token_required
def delete_stat(current_user, id):
    s = db.session.get(CompanyStat, id)
    if not s:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(s)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
