// Shared helpers for the admin inbox (list + detail views)

const AVATAR_COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#ef4444', '#6366f1', '#14b8a6',
];

/** Stable colour per sender so the same person always gets the same avatar. */
export function avatarColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function senderInitial(name = '') {
  const trimmed = name.trim();
  return trimmed ? trimmed[0] : '?';
}

/**
 * Short relative label for the list; falls back to the server's preformatted
 * `date` string when `created_at` is missing (older rows).
 */
export function formatMessageDate(msg) {
  if (!msg?.created_at) return msg?.date || '—';
  const d = new Date(msg.created_at);
  if (Number.isNaN(d.getTime())) return msg.date || '—';

  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'เมื่อสักครู่';
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;

  const diffHr = Math.floor(diffMin / 60);
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `${diffHr} ชั่วโมงที่แล้ว`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return `เมื่อวาน ${d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
  }

  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

/** Full timestamp for the detail view. */
export function formatMessageDateFull(msg) {
  if (!msg?.created_at) return msg?.date || '—';
  const d = new Date(msg.created_at);
  if (Number.isNaN(d.getTime())) return msg.date || '—';
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    + ' เวลา ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
}

/**
 * The public contact form composes the body as headed blocks:
 *
 *   [รายการอุปกรณ์ที่สนใจสอบถาม]
 *   • ชุดลำโพง...
 *   • ซุ้มประตูพองลม...
 *
 *   [รายละเอียดข้อความเพิ่มเติม]
 *   ...
 *
 * Split that back apart so the admin can render it as real sections. Written
 * generically (any `[Heading]` line starts a block) so it survives wording changes,
 * and falls back to `plain` for messages that were not composed by the form.
 */
export function parseMessageBody(body = '') {
  const text = (body || '').replace(/\r\n/g, '\n');
  const headingRe = /^\[(.+?)\]\s*$/;

  const preamble = [];
  const blocks = [];
  let current = null;

  for (const line of text.split('\n')) {
    const match = line.match(headingRe);
    if (match) {
      current = { title: match[1].trim(), lines: [] };
      blocks.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      preamble.push(line);
    }
  }

  const sections = blocks.map(block => {
    const raw = block.lines.join('\n').trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const isBulletList = lines.length > 0 && lines.every(l => /^[•\-*]\s+/.test(l));
    return {
      title: block.title,
      items: isBulletList ? lines.map(l => l.replace(/^[•\-*]\s+/, '')) : null,
      text: isBulletList ? null : raw,
    };
  }).filter(s => s.items || s.text);

  return { sections, plain: preamble.join('\n').trim() };
}

/** True when a section looks like the equipment picker's output. */
export function isEquipmentSection(section) {
  return !!section.items && /อุปกรณ์|equipment/i.test(section.title);
}

/** How many equipment items a message carries (0 when it has none). */
export function equipmentCount(body = '') {
  const { sections } = parseMessageBody(body);
  const equip = sections.find(isEquipmentSection);
  return equip ? equip.items.length : 0;
}

/**
 * Single-line preview for the list rows — prefers the customer's own note over
 * the machine-generated equipment block, which is shown as a chip instead.
 */
export function messagePreview(body = '') {
  const { sections, plain } = parseMessageBody(body);
  const note = sections.find(s => s.text && !isEquipmentSection(s));
  const source = note ? note.text : (plain || body);
  return source.replace(/\s+/g, ' ').trim() || '(ไม่มีเนื้อหา)';
}
