from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.contact import ContactMessage
from app.routes.auth import token_required
from app.services.mailer import send_contact_notification_async
from app.services.line_bot import send_contact_notification_async as send_line_notification_async

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('', methods=['POST'])
def submit_message():
    """Public: submit a contact message"""
    data = request.get_json()
    msg = ContactMessage(
        name=data.get('name', ''),
        email=data.get('email', ''),
        subject=data.get('subject', ''),
        body=data.get('body', ''),
    )
    db.session.add(msg)
    db.session.commit()

    # Notify the site owner. Both channels run on their own background thread and
    # swallow their own errors, so a slow or misconfigured provider can never make
    # the visitor's submission fail — the message is already saved either way.
    flask_app = current_app._get_current_object()
    send_contact_notification_async(flask_app, msg.id)
    send_line_notification_async(flask_app, msg.id)

    return jsonify({'message': 'Message sent successfully'}), 201


@contact_bp.route('/messages', methods=['GET'])
@token_required
def list_messages(current_user):
    """Admin: list all messages"""
    msgs = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([m.to_dict() for m in msgs])


@contact_bp.route('/messages/<int:id>', methods=['PUT'])
@token_required
def update_message(current_user, id):
    """Admin: mark as read"""
    msg = db.session.get(ContactMessage, id)
    if not msg:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json()
    if 'status' in data:
        msg.status = data['status']
    db.session.commit()
    return jsonify(msg.to_dict())


@contact_bp.route('/messages/<int:id>', methods=['DELETE'])
@token_required
def delete_message(current_user, id):
    """Admin: delete message"""
    msg = db.session.get(ContactMessage, id)
    if not msg:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(msg)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
