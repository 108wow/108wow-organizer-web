from flask import Blueprint, request, jsonify, current_app
from app.routes.auth import token_required
import os
import uuid

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'}


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route('', methods=['POST'])
@token_required
def upload_image(current_user):
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    try:
        import cloudinary.uploader
        
        # Upload the file to Cloudinary
        # Cloudinary will automatically use the CLOUDINARY_URL env var
        upload_result = cloudinary.uploader.upload(file)
        
        # Get the secure HTTPS URL from Cloudinary
        url = upload_result.get('secure_url')
        filename = upload_result.get('public_id')
        
        return jsonify({'url': url, 'filename': filename}), 201
        
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return jsonify({'error': 'Failed to upload image to Cloudinary. Please check configuration.'}), 500
