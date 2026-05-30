from flask import Blueprint, request, jsonify
from app import db
from app.models.home_config import HomeConfig
from app.routes.auth import token_required
import json

home_config_bp = Blueprint('home_config', __name__)


@home_config_bp.route('', methods=['GET'])
def get_config():
    config = db.session.get(HomeConfig, 1)
    if not config:
        return jsonify({}), 404
    return jsonify(config.to_dict())


@home_config_bp.route('', methods=['PUT'])
@token_required
def update_config(current_user):
    config = db.session.get(HomeConfig, 1)
    if not config:
        config = HomeConfig(id=1)
        db.session.add(config)
    data = request.get_json()

    bool_fields = [('showAbout', 'show_about'), ('showServices', 'show_services'),
                   ('showWhyUs', 'show_why_us'), ('showStats', 'show_stats'),
                   ('showCustomers', 'show_customers'), ('showCTA', 'show_cta')]
    int_fields = [('servicesLimit', 'services_limit'), ('customersLimit', 'customers_limit'),
                  ('customersRows', 'customers_rows')]

    for key, attr in bool_fields + int_fields:
        if key in data:
            setattr(config, attr, data[key])

    if 'selectedServices' in data:
        config.selected_services = json.dumps(data['selectedServices'])

    if 'selectedClients' in data:
        config.selected_clients = json.dumps(data['selectedClients'])

    if 'aboutSection' in data:
        config.about_section = json.dumps(data['aboutSection'])

    if 'navbarConfig' in data:
        config.navbar_config = json.dumps(data['navbarConfig'])

    db.session.commit()
    return jsonify(config.to_dict())
