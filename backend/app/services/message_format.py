"""
Shared parsing/formatting for contact-form messages.

Both the email notifier and the LINE notifier need the same view of a message,
so the parsing lives here rather than in either channel.
"""
from datetime import timedelta, timezone

# Timestamps are stored as UTC; the audience for these notifications is in Thailand.
BANGKOK_TZ = timezone(timedelta(hours=7))

THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
               'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']


def parse_body(body):
    """
    The contact form composes `[Heading]` blocks:

        [รายการอุปกรณ์ที่สนใจสอบถาม]
        • ชุดลำโพง...

        [รายละเอียดข้อความเพิ่มเติม]
        ...

    Returns (sections, preamble). Written generically so it survives wording
    changes and still handles messages that were not composed by the form.
    """
    text = (body or '').replace('\r\n', '\n')
    preamble, blocks, current = [], [], None

    for line in text.split('\n'):
        stripped = line.strip()
        if stripped.startswith('[') and stripped.endswith(']') and len(stripped) > 2:
            current = {'title': stripped[1:-1].strip(), 'lines': []}
            blocks.append(current)
        elif current is not None:
            current['lines'].append(line)
        else:
            preamble.append(line)

    sections = []
    for block in blocks:
        lines = [l.strip() for l in block['lines'] if l.strip()]
        if not lines:
            continue
        is_list = all(l[0] in '•-*' and l[1:].strip() for l in lines)
        sections.append({
            'title': block['title'],
            'items': [l[1:].strip() for l in lines] if is_list else None,
            'text': None if is_list else '\n'.join(block['lines']).strip(),
        })

    return sections, '\n'.join(preamble).strip()


def is_equipment_section(section):
    return bool(section['items']) and (
        'อุปกรณ์' in section['title'] or 'equipment' in section['title'].lower()
    )


def thai_datetime(dt):
    """UTC datetime -> '9 ส.ค. 2569 เวลา 11:30 น.'"""
    if not dt:
        return ''
    local = dt.replace(tzinfo=timezone.utc).astimezone(BANGKOK_TZ)
    return f'{local.day} {THAI_MONTHS[local.month - 1]} {local.year + 543} เวลา {local:%H:%M} น.'


def split_message(msg):
    """
    One pass over a ContactMessage, returning everything a notifier needs:
    (equipment item names, note sections, preamble text, formatted timestamp).
    """
    sections, preamble = parse_body(msg.body)
    equip = next((s for s in sections if is_equipment_section(s)), None)
    notes = [s for s in sections if s is not equip and s['text']]
    items = equip['items'] if equip else []
    return items, notes, preamble, thai_datetime(getattr(msg, 'created_at', None))


def lookup_equipment(names):
    """
    Match names captured in the body back to catalogue rows, so notifications
    can show each item's real photo. Returns {lowercased name: Equipment}.
    Degrades to {} outside an app context or on any DB trouble.
    """
    if not names:
        return {}
    try:
        from app.models.equipment import Equipment
        wanted = {n.strip().lower() for n in names}
        return {
            e.name.strip().lower(): e
            for e in Equipment.query.all()
            if e.name and e.name.strip().lower() in wanted
        }
    except Exception:
        return {}


def equipment_image(equip):
    """Best available image URL for a catalogue row, or ''."""
    if equip is None:
        return ''
    return equip.cover_image or (equip.images[0] if equip.images else '')


def admin_message_url(settings, message_id):
    """Deep link into the admin inbox, or '' when no site URL is configured."""
    if not getattr(settings, 'site_url', ''):
        return ''
    return f'{settings.site_url.rstrip("/")}/admin/messages/{message_id}'
