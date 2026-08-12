"""
LINE Messaging API notifications.

Uses urllib from the standard library so no extra dependency is needed. As with
the mailer, every public function returns (ok, error) rather than raising — a
LINE failure must never break the visitor-facing contact form.
"""
import base64
import hashlib
import hmac
import json
import threading
import urllib.error
import urllib.request

from app.services.message_format import (
    admin_message_url, equipment_image, lookup_equipment, split_message,
)

API_BASE = 'https://api.line.me/v2/bot'
HTTP_TIMEOUT = 15

LIME = '#A3D900'
NAVY = '#0F172A'
MUTED = '#94A3B8'
BODY = '#334155'


def _request(path, token, payload=None, method='POST'):
    """Call the LINE API. Returns (ok, error_message)."""
    url = f'{API_BASE}{path}'
    data = json.dumps(payload).encode('utf-8') if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', f'Bearer {token}')
    req.add_header('Content-Type', 'application/json')

    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as res:
            return True, res.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        detail = ''
        try:
            body = json.loads(e.read().decode('utf-8'))
            detail = body.get('message', '')
            if body.get('details'):
                detail += ' — ' + '; '.join(
                    f"{d.get('property', '')} {d.get('message', '')}".strip()
                    for d in body['details']
                )
        except Exception:
            pass
        if e.code == 401:
            return False, 'Channel Access Token ไม่ถูกต้องหรือหมดอายุ'
        if e.code == 403:
            return False, f'ไม่มีสิทธิ์เรียก API นี้ — ตรวจสอบว่าใช้ช่องทาง Messaging API ({detail})'
        if e.code == 429:
            return False, 'ส่งเกินโควตาข้อความของบัญชี LINE แล้ว'
        return False, f'LINE API ตอบกลับ {e.code}: {detail or e.reason}'
    except urllib.error.URLError as e:
        return False, f'เชื่อมต่อ LINE API ไม่ได้ — {e.reason}'
    except Exception as e:
        return False, f'{type(e).__name__}: {e}'


def verify_signature(channel_secret, body_bytes, signature):
    """Validate the X-Line-Signature header so the webhook can't be spoofed."""
    if not channel_secret or not signature:
        return False
    digest = hmac.new(channel_secret.encode('utf-8'), body_bytes, hashlib.sha256).digest()
    expected = base64.b64encode(digest).decode('utf-8')
    return hmac.compare_digest(expected, signature)


def get_profile(token, user_id):
    """Fetch a user's display name / picture. Returns dict or {}."""
    ok, payload = _request(f'/profile/{user_id}', token, method='GET')
    if not ok:
        return {}
    try:
        return json.loads(payload)
    except Exception:
        return {}


def push(token, user_id, messages):
    """Push up to 5 message objects to one user."""
    return _request('/message/push', token, {'to': user_id, 'messages': messages})


def reply(token, reply_token, messages):
    """Reply within a webhook event — free of charge, unlike push."""
    if not reply_token:
        return False, 'ไม่มี replyToken'
    return _request('/message/reply', token, {'replyToken': reply_token, 'messages': messages})


def get_bot_info(token):
    """Official Account profile — used to build the add-friend link. {} on failure."""
    ok, payload = _request('/info', token, method='GET')
    if not ok:
        return {}
    try:
        return json.loads(payload)
    except Exception:
        return {}


# ─── Message building ───

def _text(text, **kw):
    node = {'type': 'text', 'text': text or ' ', 'wrap': True}
    node.update(kw)
    return node


def _equipment_row(index, name, equip):
    """One product row: thumbnail on the left, name + category on the right."""
    image = equipment_image(equip)
    category = (equip.category or '') if equip is not None else ''

    left = {
        'type': 'image', 'url': image, 'size': '60px', 'aspectRatio': '1:1',
        'aspectMode': 'cover', 'flex': 0,
    } if image else {
        'type': 'box', 'layout': 'vertical', 'width': '60px', 'height': '60px',
        'backgroundColor': '#E2E8F0', 'cornerRadius': '8px', 'flex': 0,
        'contents': [_text('?', size='xl', color=MUTED, align='center', gravity='center')],
    }

    right_contents = [
        _text(f'รายการที่ {index}', size='xxs', color=LIME, weight='bold'),
        _text(name, size='sm', weight='bold', color=NAVY, margin='xs'),
    ]
    if category:
        right_contents.append(_text(category, size='xxs', color=MUTED, margin='xs'))

    return {
        'type': 'box', 'layout': 'horizontal', 'spacing': 'md', 'margin': 'md',
        'contents': [
            {'type': 'box', 'layout': 'vertical', 'flex': 0, 'width': '60px',
             'cornerRadius': '8px', 'contents': [left]},
            {'type': 'box', 'layout': 'vertical', 'contents': right_contents},
        ],
    }


def build_contact_flex(msg, settings):
    """A Flex bubble mirroring the notification email."""
    items, notes, preamble, sent_at = split_message(msg)
    catalogue = lookup_equipment(items)
    url = admin_message_url(settings, msg.id)

    header_label = 'ลูกค้าสนใจสินค้า' if items else 'ข้อความใหม่จากเว็บไซต์'

    body = [
        _text(header_label, size='xxs', weight='bold', color=LIME),
        _text(msg.name, size='lg', weight='bold', color=NAVY, margin='sm'),
    ]
    if sent_at:
        body.append(_text(sent_at, size='xxs', color=MUTED, margin='xs'))

    if items:
        body.append({'type': 'separator', 'margin': 'lg'})
        body.append(_text(f'รายการอุปกรณ์ที่สนใจ · {len(items)} รายการ',
                          size='xxs', weight='bold', color=MUTED, margin='lg'))
        for i, name in enumerate(items, 1):
            body.append(_equipment_row(i, name, catalogue.get(name.strip().lower())))

    if msg.subject:
        body.append({'type': 'separator', 'margin': 'lg'})
        body.append(_text('หัวข้อที่ลูกค้าระบุ', size='xxs', weight='bold', color=MUTED, margin='lg'))
        body.append(_text(msg.subject, size='sm', color=BODY, margin='xs'))

    for note in notes:
        body.append(_text(note['title'], size='xxs', weight='bold', color=MUTED, margin='lg'))
        body.append(_text(note['text'], size='sm', color=BODY, margin='xs'))
    if preamble:
        body.append(_text('ข้อความ', size='xxs', weight='bold', color=MUTED, margin='lg'))
        body.append(_text(preamble, size='sm', color=BODY, margin='xs'))

    body.append({'type': 'separator', 'margin': 'lg'})
    body.append(_text('ติดต่อกลับลูกค้า', size='xxs', weight='bold', color=MUTED, margin='lg'))
    body.append(_text(msg.email or '(ไม่ระบุอีเมล)', size='sm', color=BODY, margin='xs'))

    bubble = {
        'type': 'bubble',
        'size': 'mega',
        'body': {'type': 'box', 'layout': 'vertical', 'paddingAll': '18px', 'contents': body},
    }

    if url:
        bubble['footer'] = {
            'type': 'box', 'layout': 'vertical', 'paddingAll': '14px',
            'contents': [{
                'type': 'button', 'style': 'primary', 'color': LIME, 'height': 'sm',
                'action': {'type': 'uri', 'label': 'เปิดดูข้อความในระบบจัดการ', 'uri': url},
            }],
        }

    alt_text = (f'ลูกค้าสนใจอุปกรณ์ {len(items)} รายการ — {msg.name}' if items
                else f'ข้อความใหม่จากเว็บไซต์ — {msg.name}')
    return {'type': 'flex', 'altText': alt_text[:400], 'contents': bubble}


def build_test_flex(settings):
    contents = {
        'type': 'bubble',
        'body': {
            'type': 'box', 'layout': 'vertical', 'paddingAll': '20px', 'contents': [
                _text('ทดสอบการแจ้งเตือน', size='xxs', weight='bold', color=LIME),
                _text('LINE แจ้งเตือนทำงานปกติ', size='lg', weight='bold', color=NAVY, margin='sm'),
                _text('ถ้าคุณเห็นข้อความนี้ แปลว่าตั้งค่าถูกต้องแล้ว '
                      'ข้อความใหม่จากฟอร์มติดต่อจะถูกส่งมาที่นี่',
                      size='sm', color=BODY, margin='lg'),
            ],
        },
    }
    return {'type': 'flex', 'altText': 'ทดสอบ: LINE แจ้งเตือนทำงานปกติ', 'contents': contents}


# ─── Sending ───

def send_to_active_recipients(settings, messages):
    """
    Push to every selected recipient. Returns (ok, error) where ok is True if at
    least one delivery succeeded — one blocked user shouldn't mask the rest.
    """
    from app.models.line_settings import LineRecipient

    recipients = LineRecipient.query.filter_by(is_active=True).all()
    if not recipients:
        return False, 'ยังไม่ได้เลือกผู้รับ LINE'
    if not settings.channel_access_token:
        return False, 'ยังไม่ได้ตั้งค่า Channel Access Token'

    sent, errors = 0, []
    for r in recipients:
        ok, err = push(settings.channel_access_token, r.line_user_id, messages)
        if ok:
            sent += 1
            if r.is_blocked:
                r.is_blocked = False
        else:
            errors.append(f'{r.display_name or r.line_user_id}: {err}')
            # 403 on push means the user blocked the Official Account
            if 'ไม่มีสิทธิ์' in err or 'blocked' in err.lower():
                r.is_blocked = True

    if sent:
        return True, ('' if not errors else 'บางรายส่งไม่สำเร็จ — ' + ' | '.join(errors))
    return False, ' | '.join(errors) or 'ส่งไม่สำเร็จ'


def send_contact_notification_async(app, message_id):
    """
    Notify LINE on a background thread so a slow API never delays the visitor's
    form submission. Records the outcome on LineSettings.
    """
    def worker():
        with app.app_context():
            from app import db
            from app.models.contact import ContactMessage
            from app.models.line_settings import LineSettings

            try:
                settings = LineSettings.get_or_create()
                if not settings.is_ready():
                    return
                msg = db.session.get(ContactMessage, message_id)
                if not msg:
                    return

                ok, error = send_to_active_recipients(settings, [build_contact_flex(msg, settings)])
                settings.record_result(ok, error)
                db.session.commit()
                if not ok:
                    app.logger.warning('LINE notification failed: %s', error)
            except Exception as e:
                app.logger.exception('LINE notification crashed: %s', e)

    threading.Thread(target=worker, daemon=True).start()
