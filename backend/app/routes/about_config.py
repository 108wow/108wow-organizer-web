from flask import Blueprint, request, jsonify
from app import db
from app.models.about_config import AboutConfig
import json

about_config_bp = Blueprint('about_config', __name__)

@about_config_bp.route('/', methods=['GET'])
def get_about_config():
    config = AboutConfig.query.first()
    if not config:
        config = AboutConfig(id=1)
        db.session.add(config)
        db.session.commit()
    return jsonify(config.to_dict())

@about_config_bp.route('/', methods=['PUT'])
def update_about_config():
    data = request.json
    config = AboutConfig.query.first()
    if not config:
        config = AboutConfig(id=1)
        db.session.add(config)

    if 'videoThumbnail' in data:
        config.video_thumbnail = data['videoThumbnail']
    if 'videoUrl' in data:
        config.video_url = data['videoUrl']
    if 'coreValues' in data:
        config.core_values = json.dumps(data['coreValues'])
    if 'teamImages' in data:
        config.team_images = json.dumps(data['teamImages'])
    if 'banners' in data:
        config.banners = json.dumps(data['banners'])
    if 'timeline' in data:
        config.timeline = json.dumps(data['timeline'])

    db.session.commit()
    return jsonify(config.to_dict())
