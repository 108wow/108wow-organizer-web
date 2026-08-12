import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { contactAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import { formatMessageDate, messagePreview, senderInitial, avatarColor, equipmentCount } from './messageUtils';

const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  { key: 'all', label: 'ทั้งหมด', icon: 'bi-inbox' },
  { key: 'unread', label: 'ยังไม่อ่าน', icon: 'bi-envelope' },
  { key: 'read', label: 'อ่านแล้ว', icon: 'bi-envelope-open' },
];

export default function AdminMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  useEffect(() => {
    contactAPI.listMessages()
      .then(d => { setMessages(d || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  // Changing a filter resets paging — done in the handlers so no effect has to chase state
  const changeTab = (t) => { setTab(t); setCurrentPage(1); };
  const changeQuery = (v) => { setQuery(v); setCurrentPage(1); };
  const changePerPage = (n) => { setItemsPerPage(n); setCurrentPage(1); };

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

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const q = query.trim().toLowerCase();
  const filtered = messages.filter(m => {
    if (tab === 'unread' && m.status !== 'unread') return false;
    if (tab === 'read' && m.status === 'unread') return false;
    if (!q) return true;
    return [m.name, m.email, m.subject, m.body]
      .some(field => field && field.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  // Clamp during render so deleting the last row on the last page can't strand us on an empty page
  const page = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDelete = (msg) => {
    setConfirm({
      show: true, type: 'danger', title: 'ลบข้อความ',
      message: `ลบข้อความจาก "${msg.name}" ?`,
      action: async () => {
        await contactAPI.deleteMessage(msg.id);
        setMessages(p => p.filter(m => m.id !== msg.id));
      }
    });
  };

  const toggleRead = (msg) => {
    const next = msg.status === 'unread' ? 'read' : 'unread';
    setMessages(p => p.map(m => m.id === msg.id ? { ...m, status: next } : m));
    contactAPI.updateMessage(msg.id, { status: next }).catch(() => {
      // Roll back if the server rejected it
      setMessages(p => p.map(m => m.id === msg.id ? { ...m, status: msg.status } : m));
    });
  };

  const markAllRead = () => {
    const unread = messages.filter(m => m.status === 'unread');
    if (unread.length === 0) return;
    setConfirm({
      show: true, type: 'info', title: 'ทำเครื่องหมายว่าอ่านแล้ว',
      message: `ทำเครื่องหมายข้อความที่ยังไม่อ่านทั้ง ${unread.length} รายการว่าอ่านแล้ว?`,
      action: async () => {
        await Promise.all(unread.map(m => contactAPI.updateMessage(m.id, { status: 'read' })));
        setMessages(p => p.map(m => ({ ...m, status: 'read' })));
      }
    });
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'} />
      <LoadingOverlay show={loading} message="กำลังดำเนินการ..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(p => ({ ...p, show: false }))} />

      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            กล่องข้อความ (Inbox)
            {unreadCount > 0 && (
              <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.75rem' }}>{unreadCount} ใหม่</span>
            )}
          </h3>
          <p className="text-muted m-0">ข้อความที่ลูกค้าส่งเข้ามาจากฟอร์มในหน้าติดต่อเรา</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-light border fw-bold px-4 rounded-3 d-flex align-items-center gap-2" onClick={markAllRead}>
            <i className="bi bi-check2-all"></i>อ่านทั้งหมด
          </button>
        )}
      </div>

      {/* Toolbar: tabs + search */}
      <div className="card border-0 shadow-sm rounded-4 mb-3">
        <div className="card-body p-3 d-flex flex-wrap align-items-center gap-3">
          <div className="d-flex gap-2 flex-wrap">
            {TABS.map(t => {
              const count = t.key === 'all' ? messages.length
                : t.key === 'unread' ? unreadCount
                  : messages.length - unreadCount;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => changeTab(t.key)}
                  className={`btn btn-sm rounded-3 fw-bold d-flex align-items-center gap-2 px-3 py-2 ${isActive ? 'btn-primary' : 'btn-light border text-muted'}`}
                >
                  <i className={`bi ${t.icon}`}></i>
                  {t.label}
                  <span className={`badge rounded-pill ${isActive ? 'bg-white text-dark' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem' }}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="position-relative ms-auto" style={{ minWidth: 240, flex: '1 1 240px', maxWidth: 380 }}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.9rem' }}></i>
            <input
              type="text"
              className="form-control ps-5 bg-light border-0 shadow-none"
              placeholder="ค้นหาชื่อ, อีเมล, หัวข้อ หรือเนื้อหา..."
              value={query}
              onChange={e => changeQuery(e.target.value)}
              style={{ borderRadius: '10px', fontSize: '0.9rem' }}
            />
            {query && (
              <button
                className="btn btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 shadow-none"
                onClick={() => changeQuery('')}
                title="ล้างคำค้นหา"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Message list */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        {!loaded ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: 32, height: 32 }}></div>
            <div className="text-muted mt-2 small">กำลังโหลด...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5">
            <i className={`bi ${messages.length === 0 ? 'bi-inbox' : 'bi-search'} text-muted`} style={{ fontSize: '3rem', opacity: 0.3 }}></i>
            <div className="text-muted mt-2">
              {messages.length === 0 ? 'ยังไม่มีข้อความเข้ามา' : 'ไม่พบข้อความที่ตรงกับเงื่อนไข'}
            </div>
            {messages.length > 0 && (
              <button className="btn btn-light border btn-sm mt-3 rounded-pill px-4" onClick={() => { changeQuery(''); changeTab('all'); }}>
                ล้างตัวกรอง
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="msg-list">
              <AnimatePresence initial={false} mode="popLayout">
                {pageItems.map(msg => {
                  const isUnread = msg.status === 'unread';
                  const equipCount = equipmentCount(msg.body);
                  return (
                    <motion.div
                      key={msg.id}
                      layout
                      exit={{ opacity: 0, height: 0, transition: { duration: 0.22, ease: 'easeIn' } }}
                      transition={{ layout: { duration: 0.35, ease: EASE } }}
                      className={`msg-row ${isUnread ? 'is-unread' : ''}`}
                      onClick={() => navigate(`/admin/messages/${msg.id}`)}
                    >
                      {/* Unread dot */}
                      <span className="msg-dot-slot">
                        {isUnread && <span className="msg-dot" />}
                      </span>

                      {/* Avatar */}
                      <span className="msg-avatar" style={{ background: avatarColor(msg.name) }}>
                        {senderInitial(msg.name)}
                      </span>

                      {/* Sender + subject + preview */}
                      <div className="msg-body">
                        <div className="msg-line-top">
                          <span className={`msg-name ${isUnread ? 'fw-bold' : ''}`}>{msg.name}</span>
                          <span className="msg-email">{msg.email}</span>
                        </div>
                        <div className={`msg-subject ${isUnread ? 'fw-bold text-dark' : ''}`}>{msg.subject || '(ไม่มีหัวข้อ)'}</div>
                        <div className="msg-preview-line">
                          {equipCount > 0 && (
                            <span className="msg-equip-chip" title={`แนบอุปกรณ์ ${equipCount} รายการ`}>
                              <i className="bi bi-box-seam"></i>{equipCount} รายการ
                            </span>
                          )}
                          <span className="msg-preview">{messagePreview(msg.body)}</span>
                        </div>
                      </div>

                      {/* Date + row actions */}
                      <div className="msg-meta">
                        <span className="msg-date">{formatMessageDate(msg)}</span>
                        <div className="msg-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-sm btn-light border rounded-3 text-secondary"
                            onClick={() => toggleRead(msg)}
                            title={isUnread ? 'ทำเครื่องหมายว่าอ่านแล้ว' : 'ทำเครื่องหมายว่ายังไม่อ่าน'}
                          >
                            <i className={`bi ${isUnread ? 'bi-envelope-open' : 'bi-envelope'}`}></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light border rounded-3 text-danger"
                            onClick={() => handleDelete(msg)}
                            title="ลบข้อความ"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            <div className="card-footer bg-white border-top py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-2 text-muted small">
                <span>แสดง</span>
                <select
                  className="form-select form-select-sm shadow-none border-0 bg-light fw-bold text-dark"
                  style={{ width: 'auto', cursor: 'pointer', borderRadius: '8px' }}
                  value={itemsPerPage}
                  onChange={(e) => changePerPage(Number(e.target.value))}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
                <span>รายการ</span>
                <span className="ms-3 border-start ps-3">
                  พบ <strong className="text-dark">{filtered.length}</strong> รายการ
                </span>
              </div>

              {totalPages > 1 && (
                <div className="d-flex align-items-center gap-1">
                  <button className="btn btn-sm btn-light border rounded-2" disabled={page === 1} onClick={() => setCurrentPage(page - 1)}>
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      className={`btn btn-sm rounded-2 ${page === n ? 'btn-primary fw-bold' : 'btn-light border text-muted'}`}
                      style={{ width: 32 }}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button className="btn btn-sm btn-light border rounded-2" disabled={page === totalPages} onClick={() => setCurrentPage(page + 1)}>
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .msg-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 20px;
          border-bottom: 1px solid #eef2f6;
          cursor: pointer;
          background: #fff;
          transition: background 0.18s ease;
          overflow: hidden;
        }
        .msg-row:last-child { border-bottom: 0; }
        .msg-row:hover { background: #f8fafc; }
        .msg-row.is-unread { background: #fbfdf5; }
        .msg-row.is-unread:hover { background: #f5f9ea; }

        .msg-dot-slot {
          width: 8px;
          flex-shrink: 0;
          display: flex;
          justify-content: center;
          padding-top: 16px;
        }
        .msg-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary, #a3d900);
          box-shadow: 0 0 0 3px rgba(163, 217, 0, 0.22);
        }

        .msg-avatar {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 1rem;
          text-transform: uppercase;
        }

        .msg-body { flex: 1 1 auto; min-width: 0; }
        .msg-line-top {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }
        .msg-name { color: #0f172a; font-size: 0.92rem; }
        .msg-email { color: #94a3b8; font-size: 0.78rem; }
        .msg-subject {
          color: #475569;
          font-size: 0.9rem;
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .msg-preview-line {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 4px;
          min-width: 0;
        }
        .msg-preview {
          color: #94a3b8;
          font-size: 0.82rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .msg-equip-chip {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 9px;
          border-radius: 999px;
          background: rgba(163, 217, 0, 0.16);
          color: #5c7f00;
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .msg-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          flex-shrink: 0;
        }
        .msg-date {
          color: #94a3b8;
          font-size: 0.76rem;
          white-space: nowrap;
        }
        .msg-actions {
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .msg-row:hover .msg-actions { opacity: 1; }

        @media (max-width: 767px) {
          .msg-row { padding: 14px; gap: 10px; }
          .msg-avatar { width: 36px; height: 36px; font-size: 0.9rem; }
          .msg-preview { display: none; }
          .msg-preview-line:empty { display: none; }
          .msg-actions { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
