from flask import Blueprint, request, jsonify
from app import db
from app.models.mail_settings import MailSettings
from app.routes.auth import token_required
from app.services.mailer import send_mail

mail_settings_bp = Blueprint('mail_settings', __name__)


@mail_settings_bp.route('', methods=['GET'])
@token_required
def get_settings(current_user):
    return jsonify(MailSettings.get_or_create().to_dict())


@mail_settings_bp.route('', methods=['PUT'])
@token_required
def update_settings(current_user):
    settings = MailSettings.get_or_create()
    data = request.get_json() or {}

    if 'enabled' in data:
        settings.enabled = bool(data['enabled'])
    if 'smtpHost' in data:
        settings.smtp_host = (data['smtpHost'] or '').strip()
    if 'smtpPort' in data:
        try:
            settings.smtp_port = int(data['smtpPort'])
        except (TypeError, ValueError):
            return jsonify({'error': 'พอร์ตต้องเป็นตัวเลข'}), 400
    if 'smtpUser' in data:
        settings.smtp_user = (data['smtpUser'] or '').strip()
    if 'useTls' in data:
        settings.use_tls = bool(data['useTls'])
    if 'fromEmail' in data:
        settings.from_email = (data['fromEmail'] or '').strip()
    if 'fromName' in data:
        settings.from_name = (data['fromName'] or '').strip()
    if 'toEmail' in data:
        settings.to_email = (data['toEmail'] or '').strip()
    if 'siteUrl' in data:
        settings.site_url = (data['siteUrl'] or '').strip()

    # An omitted or empty password means "keep the stored one" — the client never
    # receives the current password, so it cannot echo it back.
    if data.get('smtpPassword'):
        settings.smtp_password = data['smtpPassword']
    elif data.get('clearPassword'):
        settings.smtp_password = ''

    db.session.commit()
    return jsonify(settings.to_dict())


@mail_settings_bp.route('/reveal', methods=['GET'])
@token_required
def reveal_settings(current_user):
    """
    Full password, for an admin who needs to check what is stored.

    Kept out of the normal GET so it isn't sitting in every settings response —
    it is only sent when explicitly asked for.
    """
    settings = MailSettings.get_or_create()
    return jsonify({'smtpPassword': settings.smtp_password or ''})


@mail_settings_bp.route('/test', methods=['POST'])
@token_required
def send_test(current_user):
    """Send a test email now and report the real result to the admin."""
    settings = MailSettings.get_or_create()

    recipients = settings.recipients()
    if not recipients:
        return jsonify({'error': 'ยังไม่ได้ตั้งค่าอีเมลผู้รับ'}), 400
    if not settings.smtp_host or not settings.from_email:
        return jsonify({'error': 'ยังตั้งค่า SMTP ไม่ครบ'}), 400

    subject = '[ทดสอบ] การแจ้งเตือนอีเมลทำงานปกติ'
    text_body = (
        'นี่คืออีเมลทดสอบจากระบบจัดการเว็บไซต์\n\n'
        'ถ้าคุณได้รับอีเมลฉบับนี้ แปลว่าการตั้งค่า SMTP ถูกต้องแล้ว\n'
        'ข้อความใหม่จากฟอร์มติดต่อจะถูกส่งมาที่อีเมลนี้\n'
    )
    html_body = """<!doctype html>
<html><body style="margin:0;padding:24px;background:#f1f5f9;
  font-family:'Segoe UI',Tahoma,'Noto Sans Thai',sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;
    padding:32px;text-align:center;box-shadow:0 4px 20px rgba(15,23,42,.08)">
    <div style="width:60px;height:60px;margin:0 auto 18px;border-radius:50%;
      background:#a3d900;line-height:60px;font-size:28px">&#10003;</div>
    <h1 style="margin:0 0 10px;font-size:20px;color:#0f172a">
      การแจ้งเตือนอีเมลทำงานปกติ</h1>
    <p style="margin:0;font-size:14px;line-height:1.8;color:#475569">
      ถ้าคุณได้รับอีเมลฉบับนี้ แปลว่าการตั้งค่า SMTP ถูกต้องแล้ว<br>
      ข้อความใหม่จากฟอร์มติดต่อจะถูกส่งมาที่อีเมลนี้
    </p>
  </div>
</body></html>"""

    ok, error = send_mail(settings, subject, text_body, html_body)
    settings.record_result(ok, error)
    db.session.commit()

    if not ok:
        return jsonify({'error': error, 'settings': settings.to_dict()}), 400
    return jsonify({
        'message': f'ส่งอีเมลทดสอบไปที่ {", ".join(recipients)} แล้ว',
        'settings': settings.to_dict(),
    })
