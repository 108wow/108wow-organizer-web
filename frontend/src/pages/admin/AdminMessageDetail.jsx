import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { contactAPI, equipmentAPI } from '../../api';
import EquipmentLightbox from '../../components/common/EquipmentLightbox';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import { formatMessageDateFull, senderInitial, avatarColor, parseMessageBody, isEquipmentSection } from './messageUtils';

const EASE = [0.16, 1, 0.3, 1];

/** Section card matching the header style used across the admin pages. */
function SectionCard({ icon, tone = 'primary', title, subtitle, badge, children, className = '' }) {
  return (
    <div className={`card border-0 shadow-sm rounded-4 overflow-hidden ${className}`}>
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center gap-2">
        <div className="d-flex align-items-center gap-3">
          <div
            className={`p-2 rounded-3 bg-${tone} bg-opacity-10 text-${tone} d-flex align-items-center justify-content-center flex-shrink-0`}
            style={{ width: 38, height: 38 }}
          >
            <i className={`bi ${icon}`} style={{ fontSize: '1.05rem' }}></i>
          </div>
          <div>
            <h6 className="fw-bold m-0 text-dark" style={{ fontSize: '0.95rem' }}>{title}</h6>
            {subtitle && <p className="text-muted m-0" style={{ fontSize: '0.75rem' }}>{subtitle}</p>}
          </div>
        </div>
        {badge}
      </div>
      <div className="card-body p-4">{children}</div>
    </div>
  );
}

/** Label / value row for the sender panel. */
function MetaRow({ icon, label, children }) {
  return (
    <div className="msg-meta-row">
      <span className="msg-meta-label">
        <i className={`bi ${icon}`}></i>{label}
      </span>
      <span className="msg-meta-value">{children}</span>
    </div>
  );
}

export default function AdminMessageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const msgId = Number(id);

  // The API has no single-message endpoint, so load the list and pick from it —
  // this also gives us the neighbours for prev/next navigation.
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Equipment catalogue, so attached items can show their real thumbnail and
  // open in the same lightbox the public site uses
  const [equipment, setEquipment] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  useEffect(() => {
    contactAPI.listMessages()
      .then(d => { setMessages(d || []); setLoaded(true); })
      .catch(() => setLoaded(true));
    equipmentAPI.list().then(d => setEquipment(d || [])).catch(() => {});
  }, []);

  const message = messages.find(m => m.id === msgId);
  const index = messages.findIndex(m => m.id === msgId);
  const prev = index > 0 ? messages[index - 1] : null;
  const next = index >= 0 && index < messages.length - 1 ? messages[index + 1] : null;

  // Opening a message marks it read
  const isUnread = message?.status === 'unread';
  useEffect(() => {
    if (!isUnread) return;
    let cancelled = false;
    contactAPI.updateMessage(msgId, { status: 'read' })
      .then(() => {
        if (!cancelled) setMessages(p => p.map(m => m.id === msgId ? { ...m, status: 'read' } : m));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [msgId, isUnread]);

  // Attached items are stored by name, so match on name
  const findEquipment = (name) =>
    equipment.find(e => e.name.trim().toLowerCase() === name.trim().toLowerCase()) || null;

  const openPreview = (item, e) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setZoomOrigin({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    } else {
      setZoomOrigin({ x: 0, y: 0 });
    }
    setPreviewItem(item);
  };

  const closePreview = useCallback(() => setPreviewItem(null), []);

  const previewImageCount = previewItem
    ? (previewItem.images?.length || (previewItem.coverImage ? 1 : 0))
    : 0;

  const executeAction = useCallback(async (action) => {
    setConfirm(p => ({ ...p, show: false }));
    setLoading(true);
    try {
      await action();
      setLoading(false);
      setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' });
    } catch (e) {
      setLoading(false);
      setStatus({ show: true, status: 'error', message: e.message });
    }
  }, []);

  const handleDelete = () => {
    setConfirm({
      show: true, type: 'danger', title: 'ลบข้อความ',
      message: `ลบข้อความจาก "${message.name}" ?`,
      action: async () => {
        await contactAPI.deleteMessage(message.id);
        navigate('/admin/messages');
      }
    });
  };

  const markUnread = () => {
    contactAPI.updateMessage(message.id, { status: 'unread' })
      .then(() => navigate('/admin/messages'))
      .catch(() => setStatus({ show: true, status: 'error', message: 'ไม่สามารถอัปเดตสถานะได้' }));
  };

  if (!loaded) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: 32, height: 32 }}></div>
        <div className="text-muted mt-2 small">กำลังโหลด...</div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="anim d1">
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body text-center py-5">
            <i className="bi bi-envelope-x text-muted" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
            <h5 className="fw-bold mt-3 text-dark">ไม่พบข้อความนี้</h5>
            <p className="text-muted">ข้อความอาจถูกลบไปแล้ว</p>
            <Link to="/admin/messages" className="btn btn-primary rounded-3 px-4 mt-2">
              <i className="bi bi-arrow-left me-2"></i>กลับไปกล่องข้อความ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const replySubject = encodeURIComponent(`Re: ${message.subject || ''}`);
  const { sections, plain } = parseMessageBody(message.body);
  const equipSection = sections.find(isEquipmentSection);
  const textSections = sections.filter(s => !isEquipmentSection(s));

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'} />
      <LoadingOverlay show={loading} message="กำลังดำเนินการ..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(p => ({ ...p, show: false }))} />

      {/* Sticky page header — same shell as the other admin pages */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 bg-white p-3 rounded-4 shadow-sm sticky-top" style={{ top: '80px', zIndex: 10 }}>
        <div className="d-flex align-items-center gap-3">
          <Link to="/admin/messages" className="btn btn-light border rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 38, height: 38 }} title="กลับไปกล่องข้อความ">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h3 className="fw-bold m-0 text-dark" style={{ fontSize: '1.25rem' }}>รายละเอียดข้อความ</h3>
            <p className="text-muted m-0" style={{ fontSize: '0.8rem' }}>
              <Link to="/admin/messages" className="text-muted text-decoration-none">กล่องข้อความ</Link>
              <i className="bi bi-chevron-right mx-1" style={{ fontSize: '0.65rem' }}></i>
              ข้อความ #{message.id}
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small me-1">{index + 1} / {messages.length}</span>
          <button className="btn btn-light border rounded-3" disabled={!prev} onClick={() => prev && navigate(`/admin/messages/${prev.id}`)} title="ข้อความก่อนหน้า">
            <i className="bi bi-chevron-up"></i>
          </button>
          <button className="btn btn-light border rounded-3" disabled={!next} onClick={() => next && navigate(`/admin/messages/${next.id}`)} title="ข้อความถัดไป">
            <i className="bi bi-chevron-down"></i>
          </button>
        </div>
      </div>

      <motion.div
        key={message.id}
        className="row g-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {/* ── Main column ── */}
        <div className="col-lg-8">
          <SectionCard
            icon="bi-chat-left-text-fill"
            title="หัวข้อและเนื้อหา"
            subtitle="ข้อความที่ลูกค้ากรอกเข้ามา"
            className="mb-4"
          >
            <h4 className="fw-bold text-dark mb-4 pb-3 border-bottom" style={{ fontSize: '1.2rem', lineHeight: 1.5 }}>
              {message.subject || '(ไม่มีหัวข้อ)'}
            </h4>

            {plain && <div className="msg-block mb-3">{plain}</div>}

            {textSections.length === 0 && !plain && sections.length === 0 && (
              <div className="msg-block">{message.body || '(ไม่มีเนื้อหา)'}</div>
            )}

            {textSections.map((section, i) => (
              <div key={`${section.title}-${i}`} className={i > 0 ? 'mt-3' : ''}>
                <div className="admin-field-label">{section.title}</div>
                <div className="msg-block">{section.text}</div>
              </div>
            ))}
          </SectionCard>

          {/* Attached equipment */}
          {equipSection && (
            <SectionCard
              icon="bi-box-seam-fill"
              tone="success"
              title="อุปกรณ์ที่สนใจ"
              subtitle="กดที่รายการเพื่อดูรายละเอียดอุปกรณ์"
              badge={<span className="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2" style={{ fontSize: '0.75rem' }}>{equipSection.items.length} รายการ</span>}
            >
              <ul className="msg-item-list">
                {equipSection.items.map((name, idx) => {
                  const equip = findEquipment(name);
                  const thumb = equip?.coverImage || equip?.images?.[0] || '';
                  return (
                    <li
                      key={idx}
                      className={`msg-item ${equip ? 'is-clickable' : ''}`}
                      onClick={equip ? (e) => openPreview(equip, e) : undefined}
                      role={equip ? 'button' : undefined}
                      tabIndex={equip ? 0 : undefined}
                      title={equip ? 'ดูรายละเอียดอุปกรณ์' : 'ไม่พบอุปกรณ์นี้ในระบบแล้ว'}
                      onKeyDown={equip ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPreview(equip, e); }
                      } : undefined}
                    >
                      <span className="msg-item-no">{idx + 1}</span>
                      <span className="msg-item-thumb">
                        {thumb ? <img src={thumb} alt="" loading="lazy" /> : <i className={`bi ${equip ? 'bi-image' : 'bi-question-lg'}`}></i>}
                      </span>
                      <span className="msg-item-text">
                        <span className="msg-item-name">{name}</span>
                        {equip ? (
                          equip.category && <span className="msg-item-cat">{equip.category}</span>
                        ) : (
                          <span className="msg-item-missing">
                            <i className="bi bi-exclamation-triangle-fill me-1"></i>ไม่พบในคลังอุปกรณ์
                          </span>
                        )}
                      </span>
                      {equip && <i className="bi bi-arrow-right-short msg-item-go"></i>}
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          )}
        </div>

        {/* ── Side column ── */}
        <div className="col-lg-4">
          <SectionCard icon="bi-person-fill" title="ผู้ส่ง" subtitle="ข้อมูลติดต่อกลับ" className="mb-4">
            <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
              <span
                className="d-flex align-items-center justify-content-center flex-shrink-0 text-white fw-bold"
                style={{ width: 46, height: 46, borderRadius: 13, background: avatarColor(message.name), fontSize: '1.1rem', textTransform: 'uppercase' }}
              >
                {senderInitial(message.name)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.95rem' }}>{message.name}</div>
                <a href={`mailto:${message.email}`} className="text-decoration-none text-muted d-block text-truncate" style={{ fontSize: '0.82rem' }}>
                  {message.email}
                </a>
              </div>
            </div>

            <MetaRow icon="bi-clock" label="ส่งเมื่อ">{formatMessageDateFull(message)}</MetaRow>
            <MetaRow icon="bi-check2-circle" label="สถานะ">
              <span
                className={`badge rounded-pill px-2 py-1 ${isUnread ? 'bg-danger bg-opacity-10 text-danger' : 'bg-success bg-opacity-10 text-success'}`}
                style={{ fontSize: '0.7rem' }}
              >
                {isUnread ? 'ยังไม่อ่าน' : 'อ่านแล้ว'}
              </span>
            </MetaRow>
            <MetaRow icon="bi-hash" label="รหัสข้อความ">#{message.id}</MetaRow>
          </SectionCard>

          <SectionCard icon="bi-lightning-charge-fill" tone="warning" title="การจัดการ" subtitle="ตอบกลับหรือจัดการข้อความนี้">
            <div className="d-flex flex-column gap-2">
              <a
                href={`mailto:${message.email}?subject=${replySubject}`}
                className="btn btn-primary rounded-3 fw-bold w-100 py-2 d-flex align-items-center justify-content-center gap-2"
              >
                <i className="bi bi-reply-fill"></i>ตอบกลับทางอีเมล
              </a>
              <button className="btn btn-light border rounded-3 w-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={markUnread}>
                <i className="bi bi-envelope"></i>ทำเครื่องหมายว่ายังไม่อ่าน
              </button>
              <button className="btn btn-light border text-danger rounded-3 w-100 py-2 d-flex align-items-center justify-content-center gap-2" onClick={handleDelete}>
                <i className="bi bi-trash"></i>ลบข้อความ
              </button>
            </div>
          </SectionCard>
        </div>
      </motion.div>

      {/* Same lightbox the public catalogue uses, minus the enquiry buttons.
          The selling-points list is swapped for catalogue facts an admin cares about. */}
      <EquipmentLightbox
        item={previewItem}
        onClose={closePreview}
        zoomOrigin={zoomOrigin}
        compact
        features={previewItem ? [
          { icon: 'bi-images', text: `รูปภาพ ${previewImageCount} รูป` },
          { icon: 'bi-hash', text: `รหัสอุปกรณ์ ${previewItem.id}` },
        ] : []}
      />

      <style>{`
        /* Matches .admin-form-group label so the page reads like the rest of admin */
        .admin-field-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 6px;
        }

        .msg-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 18px;
          white-space: pre-wrap;
          word-break: break-word;
          line-height: 1.85;
          font-size: 0.9rem;
          color: #334155;
        }

        /* Sender meta rows */
        .msg-meta-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
        }
        .msg-meta-row + .msg-meta-row { border-top: 1px dashed #e2e8f0; }
        .msg-meta-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
        }
        .msg-meta-label i { color: #cbd5e1; }
        .msg-meta-value {
          font-size: 0.82rem;
          color: #1e293b;
          text-align: right;
          word-break: break-word;
        }

        /* Attached equipment */
        .msg-item-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .msg-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .msg-item.is-clickable { cursor: pointer; }
        .msg-item.is-clickable:hover {
          border-color: var(--primary, #a3d900);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
          transform: translateY(-1px);
        }
        .msg-item.is-clickable:focus-visible {
          outline: 2px solid var(--primary, #a3d900);
          outline-offset: 2px;
        }
        .msg-item-no {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .msg-item-thumb {
          flex-shrink: 0;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          overflow: hidden;
          background: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 1rem;
        }
        .msg-item-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .msg-item.is-clickable:hover .msg-item-thumb img { transform: scale(1.08); }

        .msg-item-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
          flex-grow: 1;
          min-width: 0;
        }
        .msg-item-name {
          font-size: 0.89rem;
          font-weight: 600;
          color: #0f172a;
          word-break: break-word;
        }
        .msg-item-cat { font-size: 0.73rem; color: #64748b; }
        .msg-item-missing { font-size: 0.73rem; color: #d97706; }
        .msg-item-go {
          flex-shrink: 0;
          font-size: 1.25rem;
          color: #cbd5e1;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .msg-item.is-clickable:hover .msg-item-go {
          color: var(--primary, #a3d900);
          transform: translateX(3px);
        }
      `}</style>
    </div>
  );
}
