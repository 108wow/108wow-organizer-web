"""
Outbound email over SMTP.

Uses the standard library (smtplib + email.message) so no extra dependency is
needed. Every public function returns (ok, error_message) instead of raising,
because a mail failure must never break the visitor-facing contact form.
"""
import smtplib
import ssl
import threading
from email.message import EmailMessage
from email.utils import formataddr
from html import escape

from app.services.message_format import (
    admin_message_url, equipment_image, lookup_equipment, split_message,
)

SMTP_TIMEOUT = 20


def _build_message(settings, subject, text_body, html_body, to_addrs, reply_to=None):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = formataddr((settings.from_name or '', settings.from_email))
    msg['To'] = ', '.join(to_addrs)
    if reply_to:
        msg['Reply-To'] = reply_to
    msg.set_content(text_body)
    if html_body:
        msg.add_alternative(html_body, subtype='html')
    return msg


def send_mail(settings, subject, text_body, html_body=None, to_addrs=None, reply_to=None):
    """
    Send one message. Returns (ok: bool, error: str).
    Never raises — callers decide what to do with the failure.
    """
    to_addrs = to_addrs or settings.recipients()
    if not to_addrs:
        return False, 'ยังไม่ได้ตั้งค่าอีเมลผู้รับ'
    if not settings.smtp_host:
        return False, 'ยังไม่ได้ตั้งค่า SMTP host'
    if not settings.from_email:
        return False, 'ยังไม่ได้ตั้งค่าอีเมลผู้ส่ง'

    msg = _build_message(settings, subject, text_body, html_body, to_addrs, reply_to)
    port = settings.smtp_port or 587

    try:
        # Port 465 is implicit TLS; everything else starts plain and upgrades
        if port == 465:
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(settings.smtp_host, port, timeout=SMTP_TIMEOUT, context=context) as server:
                if settings.smtp_user:
                    server.login(settings.smtp_user, settings.smtp_password or '')
                server.send_message(msg)
        else:
            with smtplib.SMTP(settings.smtp_host, port, timeout=SMTP_TIMEOUT) as server:
                server.ehlo()
                if settings.use_tls:
                    server.starttls(context=ssl.create_default_context())
                    server.ehlo()
                if settings.smtp_user:
                    server.login(settings.smtp_user, settings.smtp_password or '')
                server.send_message(msg)
        return True, ''
    except smtplib.SMTPAuthenticationError:
        return False, 'เข้าสู่ระบบ SMTP ไม่สำเร็จ — ตรวจสอบชื่อผู้ใช้และรหัสผ่าน (Gmail ต้องใช้ App Password)'
    except smtplib.SMTPRecipientsRefused:
        return False, 'เซิร์ฟเวอร์ปฏิเสธอีเมลผู้รับ — ตรวจสอบว่าที่อยู่ถูกต้อง'
    except smtplib.SMTPSenderRefused:
        return False, 'เซิร์ฟเวอร์ปฏิเสธอีเมลผู้ส่ง — ผู้ส่งมักต้องตรงกับบัญชี SMTP'
    except (smtplib.SMTPConnectError, OSError) as e:
        return False, f'เชื่อมต่อ SMTP ไม่ได้ ({settings.smtp_host}:{port}) — {e}'
    except Exception as e:
        return False, f'{type(e).__name__}: {e}'


# ─── Contact form notification ───

def _label(text):
    return (f'<p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#94a3b8;'
            f'letter-spacing:.6px">{escape(text)}</p>')


def _equipment_row(index, name, equip):
    """One product card: 72px photo on the left, name + category on the right."""
    cover = equipment_image(equip)
    category = (equip.category or '') if equip is not None else ''

    if cover:
        thumb = (
            f'<img src="{escape(cover)}" width="72" height="72" alt=""'
            f' style="display:block;width:72px;height:72px;object-fit:cover;'
            f'border-radius:10px;background:#e2e8f0;border:0" />'
        )
    else:
        # No photo on file — a neutral tile keeps the row rhythm intact
        thumb = (
            f'<table width="72" height="72" cellpadding="0" cellspacing="0"'
            f' style="width:72px;height:72px;background:#e2e8f0;border-radius:10px">'
            f'<tr><td align="center" style="font-size:22px;color:#94a3b8">&#9634;</td></tr>'
            f'</table>'
        )

    category_line = (
        f'<p style="margin:5px 0 0;font-size:12px;color:#94a3b8">{escape(category)}</p>'
        if category else ''
    )

    return (
        f'<tr><td style="padding:0 0 10px">'
        f'<table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;'
        f'border:1px solid #e2e8f0;border-radius:12px">'
        f'<tr>'
        f'<td width="88" style="padding:10px 0 10px 10px;vertical-align:top">{thumb}</td>'
        f'<td style="padding:12px 14px 12px 12px;vertical-align:middle">'
        f'<p style="margin:0;font-size:11px;font-weight:700;color:#a3d900;'
        f'letter-spacing:.5px">รายการที่ {index}</p>'
        f'<p style="margin:3px 0 0;font-size:15px;font-weight:700;color:#0f172a;'
        f'line-height:1.45">{escape(name)}</p>'
        f'{category_line}'
        f'</td>'
        f'</tr></table></td></tr>'
    )


def build_contact_notification(msg, settings):
    """Returns (subject, text_body, html_body) for a new ContactMessage."""
    items, notes, preamble, sent_at = split_message(msg)

    # ── Subject: lead first, so it is obvious in a crowded inbox ──
    if items:
        headline = items[0] if len(items) == 1 else f'{items[0]} และอีก {len(items) - 1} รายการ'
        subject = f'ลูกค้าสนใจอุปกรณ์: {headline} — {msg.name}'
    else:
        subject = f'ข้อความใหม่จากเว็บไซต์: {msg.subject or "ไม่มีหัวข้อ"} — {msg.name}'

    # ── Plain-text version ──
    lines = ['มีลูกค้าสนใจอุปกรณ์และติดต่อผ่านฟอร์มบนเว็บไซต์' if items
             else 'มีข้อความใหม่จากฟอร์มติดต่อบนเว็บไซต์', '']
    if items:
        lines.append(f'รายการอุปกรณ์ที่สนใจ ({len(items)} รายการ)')
        lines += [f'  {i}. {name}' for i, name in enumerate(items, 1)]
        lines.append('')
    lines += ['ข้อมูลผู้ติดต่อ',
              f'  ชื่อ  : {msg.name}',
              f'  อีเมล : {msg.email}']
    if sent_at:
        lines.append(f'  เวลา  : {sent_at}')
    lines.append('')
    for note in notes:
        lines += [note['title'], f'  {note["text"]}', '']
    if preamble:
        lines += [preamble, '']

    # ── HTML version (table-based for Outlook) ──
    if items:
        catalogue = lookup_equipment(items)
        rows = ''.join(
            _equipment_row(i, name, catalogue.get(name.strip().lower()))
            for i, name in enumerate(items, 1)
        )
        equip_block = (
            f'<tr><td style="padding:26px 26px 4px;background:#f8fafc">'
            f'{_label(f"รายการอุปกรณ์ที่สนใจ · {len(items)} รายการ")}'
            f'<table width="100%" cellpadding="0" cellspacing="0">{rows}</table>'
            f'</td></tr>'
        )
    else:
        equip_block = ''

    notes_block = ''
    for note in notes:
        notes_block += (
            f'<tr><td style="padding:18px 26px 0">{_label(note["title"])}'
            f'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;'
            f'padding:14px 16px;font-size:14px;line-height:1.8;color:#334155;'
            f'white-space:pre-wrap">{escape(note["text"])}</div></td></tr>'
        )
    if preamble:
        notes_block += (
            f'<tr><td style="padding:18px 26px 0">{_label("ข้อความ")}'
            f'<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;'
            f'padding:14px 16px;font-size:14px;line-height:1.8;color:#334155;'
            f'white-space:pre-wrap">{escape(preamble)}</div></td></tr>'
        )

    # Primary action: open the message in the admin site. Falls back to a
    # mailto button when no site URL is configured, so the email is never
    # left without something to click.
    url = admin_message_url(settings, msg.id)
    if url:
        lines.append(f'เปิดดูข้อความในระบบจัดการ: {url}')
        primary_cta = (
            f'<a href="{escape(url)}" style="display:block;padding:14px;background:#a3d900;'
            f'color:#0f172a;text-decoration:none;border-radius:10px;font-weight:800;'
            f'font-size:15px;text-align:center">เปิดดูข้อความในระบบจัดการ</a>'
        )
    else:
        primary_cta = (
            f'<a href="mailto:{escape(msg.email)}'
            f'?subject={escape("Re: " + (msg.subject or ""))}"'
            f' style="display:block;padding:14px;background:#a3d900;color:#0f172a;'
            f'text-decoration:none;border-radius:10px;font-weight:800;font-size:15px;'
            f'text-align:center">ตอบกลับลูกค้าทางอีเมล</a>'
        )

    eyebrow = 'ลูกค้าสนใจสินค้า' if items else 'ข้อความใหม่จากเว็บไซต์'
    subject_line = (
        f'<tr><td style="padding:18px 26px 0">{_label("หัวข้อที่ลูกค้าระบุ")}'
        f'<p style="margin:0;font-size:15px;color:#334155;line-height:1.5">'
        f'{escape(msg.subject)}</p></td></tr>'
    ) if msg.subject else ''

    html_body = f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:24px 12px;background:#eef2f6;
  font-family:'Segoe UI',Tahoma,'Noto Sans Thai',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;
  background:#fff;border-radius:16px;overflow:hidden">

  <tr><td style="background:#0f172a;padding:26px">
    <p style="margin:0 0 10px;display:inline-block;padding:5px 12px;background:#a3d900;
      color:#0f172a;border-radius:999px;font-size:11px;font-weight:800;
      letter-spacing:.8px">{eyebrow}</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:21px;line-height:1.4">
      {escape(msg.name)}</h1>
    <p style="margin:5px 0 0;color:#94a3b8;font-size:13px">
      ติดต่อเข้ามาผ่านฟอร์มบนเว็บไซต์{f' · {escape(sent_at)}' if sent_at else ''}</p>
  </td></tr>

  {equip_block}
  {subject_line}
  {notes_block}

  <tr><td style="padding:22px 26px 0">
    {_label('ติดต่อกลับลูกค้า')}
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;
      border:1px solid #e2e8f0;border-radius:10px">
      <tr><td style="padding:14px 16px">
        <p style="margin:0 0 3px;font-size:15px;font-weight:700;color:#0f172a">
          {escape(msg.name)}</p>
        <a href="mailto:{escape(msg.email)}" style="font-size:14px;color:#5c7f00;
          text-decoration:none">{escape(msg.email)}</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:14px 26px 0">
    {primary_cta}
  </td></tr>

  <tr><td style="padding:24px 26px 26px">
    <p style="margin:0;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;
      color:#94a3b8;line-height:1.7">
      อีเมลนี้ส่งอัตโนมัติเมื่อมีผู้กรอกฟอร์มติดต่อบนเว็บไซต์<br>
      กด "ตอบกลับ" (Reply) ในโปรแกรมอีเมลได้เลย ระบบตั้งค่าให้ตอบไปหาลูกค้าโดยตรงแล้ว
    </p>
  </td></tr>

</table>
</td></tr></table>
</body></html>"""

    return subject, '\n'.join(lines), html_body


def send_contact_notification_async(app, message_id):
    """
    Fire the notification on a background thread so a slow SMTP server never
    delays the visitor's form submission. Records the outcome on MailSettings.
    """
    def worker():
        with app.app_context():
            from app import db
            from app.models.contact import ContactMessage
            from app.models.mail_settings import MailSettings

            try:
                settings = MailSettings.get_or_create()
                if not settings.is_ready():
                    return
                msg = db.session.get(ContactMessage, message_id)
                if not msg:
                    return

                subject, text_body, html_body = build_contact_notification(msg, settings)
                ok, error = send_mail(
                    settings, subject, text_body, html_body,
                    reply_to=msg.email or None,
                )
                settings.record_result(ok, error)
                db.session.commit()
                if not ok:
                    app.logger.warning('Contact notification failed: %s', error)
            except Exception as e:
                app.logger.exception('Contact notification crashed: %s', e)

    threading.Thread(target=worker, daemon=True).start()
