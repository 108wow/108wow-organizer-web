from flask import Blueprint, request, jsonify
from app import db
from app.models.line_settings import LineSettings, LineRecipient, generate_register_code
from app.routes.auth import token_required
from app.services import line_bot as svc

line_bp = Blueprint('line_bot', __name__)


# ─── Public webhook ───

def _upsert_recipient(settings, user_id):
    """
    Record whoever is talking to the bot, but leave them switched OFF.

    The Official Account is customer-facing, so a follower is NOT automatically
    a notification recipient — they become one only by sending the registration
    code, or by an admin ticking them in the panel.
    """
    recipient = LineRecipient.query.filter_by(line_user_id=user_id).first()
    profile = svc.get_profile(settings.channel_access_token, user_id) \
        if settings.channel_access_token else {}

    if recipient:
        recipient.is_blocked = False
        if profile.get('displayName'):
            recipient.display_name = profile['displayName']
            recipient.picture_url = profile.get('pictureUrl', '')
    else:
        recipient = LineRecipient(
            line_user_id=user_id,
            display_name=profile.get('displayName', ''),
            picture_url=profile.get('pictureUrl', ''),
            is_active=False,
            source='follow',
        )
        db.session.add(recipient)
    return recipient


@line_bp.route('/webhook', methods=['POST'])
def webhook():
    """
    Receives events from LINE.

    Anyone who adds the Official Account is recorded as a *pending* recipient.
    Typing the registration code switches them on, so enquiry details never get
    pushed to customers who merely added the account.
    """
    settings = LineSettings.get_or_create()
    signature = request.headers.get('X-Line-Signature', '')

    # Reject anything not signed with our channel secret
    if not svc.verify_signature(settings.channel_secret, request.get_data(), signature):
        return jsonify({'error': 'Invalid signature'}), 403

    payload = request.get_json(silent=True) or {}
    token = settings.channel_access_token

    for event in payload.get('events', []):
        user_id = (event.get('source') or {}).get('userId')
        if not user_id:
            continue

        event_type = event.get('type')
        reply_token = event.get('replyToken')

        if event_type == 'unfollow':
            recipient = LineRecipient.query.filter_by(line_user_id=user_id).first()
            if recipient:
                recipient.is_blocked = True
                recipient.is_active = False
            continue

        if event_type == 'follow':
            recipient = _upsert_recipient(settings, user_id)
            if token and reply_token:
                svc.reply(token, reply_token, [{
                    'type': 'text',
                    'text': 'ขอบคุณที่เพิ่มเราเป็นเพื่อน\n\n'
                            'หากคุณเป็นทีมงานและต้องการรับแจ้งเตือนเมื่อมีลูกค้าติดต่อเข้ามา '
                            'กรุณาพิมพ์ "รหัสลงทะเบียน 6 หลัก" ที่ได้รับจากผู้ดูแลระบบ '
                            'ส่งมาในแชทนี้ได้เลย',
                }])
            continue

        if event_type != 'message':
            continue

        message = event.get('message') or {}
        if message.get('type') != 'text':
            continue
        text = (message.get('text') or '').strip()

        # Correct code -> enrol the sender
        if settings.register_code and text == settings.register_code:
            recipient = _upsert_recipient(settings, user_id)
            recipient.is_active = True
            db.session.commit()
            if token and reply_token:
                name = recipient.display_name or 'คุณ'
                svc.reply(token, reply_token, [{
                    'type': 'text',
                    'text': f'✅ ลงทะเบียนเรียบร้อยแล้ว\n\n{name} '
                            'จะได้รับแจ้งเตือนที่นี่ทุกครั้งที่มีลูกค้าติดต่อผ่านฟอร์มบนเว็บไซต์',
                }])
            continue

        # A 6-digit attempt that doesn't match — tell them, so they don't wait in vain.
        # Anything else is left alone: this account also talks to real customers.
        if len(text) == 6 and text.isdigit():
            _upsert_recipient(settings, user_id)
            if token and reply_token:
                svc.reply(token, reply_token, [{
                    'type': 'text',
                    'text': 'รหัสลงทะเบียนไม่ถูกต้อง กรุณาตรวจสอบกับผู้ดูแลระบบอีกครั้ง',
                }])

    db.session.commit()
    return jsonify({'ok': True})


# ─── Admin: settings ───

@line_bp.route('/settings', methods=['GET'])
@token_required
def get_settings(current_user):
    return jsonify(LineSettings.get_or_create().to_dict())


@line_bp.route('/settings', methods=['PUT'])
@token_required
def update_settings(current_user):
    settings = LineSettings.get_or_create()
    data = request.get_json() or {}

    if 'enabled' in data:
        settings.enabled = bool(data['enabled'])
    if 'siteUrl' in data:
        settings.site_url = (data['siteUrl'] or '').strip()

    # Empty means "keep the stored value" — credentials are never sent to the client
    if data.get('channelAccessToken'):
        settings.channel_access_token = data['channelAccessToken'].strip()
    if data.get('channelSecret'):
        settings.channel_secret = data['channelSecret'].strip()

    db.session.commit()
    return jsonify(settings.to_dict())


@line_bp.route('/settings/reveal', methods=['GET'])
@token_required
def reveal_settings(current_user):
    """
    Full credentials, for an admin who needs to check what is stored.

    Kept out of the normal GET so the secrets aren't sitting in every settings
    response — they are only sent when explicitly asked for.
    """
    settings = LineSettings.get_or_create()
    return jsonify({
        'channelAccessToken': settings.channel_access_token or '',
        'channelSecret': settings.channel_secret or '',
    })


@line_bp.route('/register-code/regenerate', methods=['POST'])
@token_required
def regenerate_code(current_user):
    """New code — invalidates the old one for anyone who still has it."""
    settings = LineSettings.get_or_create()
    settings.register_code = generate_register_code()
    db.session.commit()
    return jsonify(settings.to_dict())


@line_bp.route('/bot-info', methods=['GET'])
@token_required
def bot_info(current_user):
    """Official Account details, used to build the add-friend link and QR."""
    settings = LineSettings.get_or_create()
    if not settings.channel_access_token:
        return jsonify({'error': 'ยังไม่ได้ตั้งค่า Channel Access Token'}), 400

    info = svc.get_bot_info(settings.channel_access_token)
    if not info:
        return jsonify({'error': 'ดึงข้อมูลบอทไม่สำเร็จ — ตรวจสอบ Channel Access Token'}), 400

    basic_id = info.get('basicId', '')
    return jsonify({
        'displayName': info.get('displayName', ''),
        'basicId': basic_id,
        'pictureUrl': info.get('pictureUrl', ''),
        # Opening this link (or scanning it as a QR) adds the account as a friend
        'addFriendUrl': f'https://line.me/R/ti/p/{basic_id}' if basic_id else '',
    })


@line_bp.route('/test', methods=['POST'])
@token_required
def send_test(current_user):
    settings = LineSettings.get_or_create()
    if not settings.channel_access_token:
        return jsonify({'error': 'ยังไม่ได้ตั้งค่า Channel Access Token'}), 400

    ok, error = svc.send_to_active_recipients(settings, [svc.build_test_flex(settings)])
    settings.record_result(ok, error)
    db.session.commit()

    if not ok:
        return jsonify({'error': error, 'settings': settings.to_dict()}), 400
    count = LineRecipient.query.filter_by(is_active=True).count()
    return jsonify({
        'message': f'ส่งข้อความทดสอบไปยังผู้รับ {count} คนแล้ว'
                   + (f' ({error})' if error else ''),
        'settings': settings.to_dict(),
    })


# ─── Admin: recipients ───

@line_bp.route('/recipients', methods=['GET'])
@token_required
def list_recipients(current_user):
    rows = LineRecipient.query.order_by(LineRecipient.created_at.desc()).all()
    return jsonify([r.to_dict() for r in rows])


@line_bp.route('/recipients', methods=['POST'])
@token_required
def add_recipient(current_user):
    """Add by userId — lets the setup work before a webhook URL exists."""
    data = request.get_json() or {}
    user_id = (data.get('lineUserId') or '').strip()

    if not user_id:
        return jsonify({'error': 'กรุณากรอก LINE User ID'}), 400
    if not user_id.startswith('U') or len(user_id) < 30:
        return jsonify({'error': 'LINE User ID ต้องขึ้นต้นด้วย U และยาว 33 ตัวอักษร'}), 400
    if LineRecipient.query.filter_by(line_user_id=user_id).first():
        return jsonify({'error': 'มีผู้รับรายนี้อยู่แล้ว'}), 400

    settings = LineSettings.get_or_create()
    profile = svc.get_profile(settings.channel_access_token, user_id) \
        if settings.channel_access_token else {}

    recipient = LineRecipient(
        line_user_id=user_id,
        display_name=profile.get('displayName', '') or (data.get('displayName') or '').strip(),
        picture_url=profile.get('pictureUrl', ''),
        is_active=True,
        source='manual',
    )
    db.session.add(recipient)
    db.session.commit()
    return jsonify(recipient.to_dict()), 201


@line_bp.route('/recipients/<int:rid>', methods=['PUT'])
@token_required
def update_recipient(current_user, rid):
    recipient = db.session.get(LineRecipient, rid)
    if not recipient:
        return jsonify({'error': 'Not found'}), 404
    data = request.get_json() or {}
    if 'isActive' in data:
        recipient.is_active = bool(data['isActive'])
    db.session.commit()
    return jsonify(recipient.to_dict())


@line_bp.route('/recipients/<int:rid>', methods=['DELETE'])
@token_required
def delete_recipient(current_user, rid):
    recipient = db.session.get(LineRecipient, rid)
    if not recipient:
        return jsonify({'error': 'Not found'}), 404
    db.session.delete(recipient)
    db.session.commit()
    return jsonify({'message': 'Deleted'})
