import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import RichTextEditor from '../../components/admin/RichTextEditor';

const emptyForm = { title: '', excerpt: '', content: '', image: '', author: '', tag: '', status: 'draft', change_summary: '' };

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}
function formatThaiDateLong(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminBlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [editHistory, setEditHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(!!id);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });
  const [slideIn, setSlideIn] = useState(false);
  const [openPanels, setOpenPanels] = useState({ settings: true, history: false });
  const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

  const togglePanel = (panel) => setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));

  useEffect(() => { requestAnimationFrame(() => setSlideIn(true)); }, []);

  useEffect(() => {
    if (!id) return;
    setPageLoading(true);
    blogAPI.get(id).then(post => {
      setForm({
        title: post.title || '', excerpt: post.excerpt || '', content: post.content || '',
        image: post.image || '', author: post.author || '', tag: post.tag || '',
        status: post.status || 'draft', change_summary: '',
      });
      setEditHistory(post.edit_history || []);
      setPageLoading(false);
    }).catch(() => { setPageLoading(false); setStatus({ show: true, status: 'error', message: 'ไม่พบบทความนี้' }); });
  }, [id]);

  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };

  const executeAction = useCallback(async (action) => {
    setConfirm(p => ({ ...p, show: false })); setLoading(true);
    try { await action(); setLoading(false); setStatus({ show: true, status: 'success', message: 'บันทึกบทความเรียบร้อยแล้ว' }); }
    catch(e) { setLoading(false); setStatus({ show: true, status: 'error', message: e.message }); }
  }, []);

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim()) { setStatus({ show: true, status: 'error', message: 'กรุณากรอกหัวข้อและเนื้อหาย่อ' }); return; }
    setConfirm({
      show: true, type: 'info', title: isEdit ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่มบทความ',
      message: `${isEdit ? 'แก้ไข' : 'เพิ่ม'}บทความ "${form.title}" ?`,
      action: async () => {
        if (isEdit) { await blogAPI.update(id, form); } else { await blogAPI.create(form); }
        setTimeout(() => navigate('/admin/blog'), 800);
      }
    });
  };

  const handleBack = () => { setSlideIn(false); setTimeout(() => navigate('/admin/blog'), 300); };

  if (pageLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }}></div>
          <div className="text-muted fw-bold">กำลังโหลดบทความ...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ opacity: slideIn ? 1 : 0, transform: slideIn ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <style>{`
        .be-sticky-bar {
          position: sticky; top: 0; z-index: 25;
          background: rgba(255,255,255,0.97); backdrop-filter: blur(12px);
          border: 1.5px solid #e2e8f0; border-radius: 16px;
          padding: 10px 16px; margin-bottom: 1.25rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 10px; flex-wrap: wrap;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
        }
        .be-section { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px; margin-bottom: 1.25rem; transition: all 0.3s ease; }
        .be-section:hover { border-color: rgba(163,217,0,0.3); }
        .be-section-clipped { overflow: hidden; }
        .be-section-body { padding: 1.5rem 2rem; }
        .be-panel-header { padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; background: #fafbfc; border-bottom: 1.5px solid #f1f5f9; transition: background 0.2s ease; }
        .be-panel-header:hover { background: #f1f5f9; }
        .be-panel-label { font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: var(--primary-dark, #6b8e00); display: flex; align-items: center; gap: 8px; margin: 0; }
        .be-panel-label i { font-size: 1rem; color: var(--primary, #a3d900); }
        .be-panel-chevron { transition: transform 0.3s ease; color: #94a3b8; font-size: 1rem; }
        .be-panel-chevron.open { transform: rotate(180deg); }
        .be-panel-body { max-height: 0; overflow: hidden; transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), padding 0.35s ease; padding: 0 2rem; }
        .be-panel-body.open { max-height: 2000px; padding: 1.5rem 2rem; }
        .be-history-item { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .be-history-item:last-child { border-bottom: none; }

        /* ── Status Chip (custom dropdown replacement) ── */
        .be-status-chip {
          display: inline-flex; align-items: center; gap: 6px; position: relative;
          padding: 6px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 700;
          cursor: pointer; user-select: none; transition: all 0.2s ease;
        }
        .be-status-chip.draft { background: #f8fafc; color: #64748b; border: 1.5px solid #e2e8f0; }
        .be-status-chip.draft:hover { border-color: #94a3b8; background: #f1f5f9; }
        .be-status-chip.published { background: rgba(34,197,94,0.08); color: #16a34a; border: 1.5px solid rgba(34,197,94,0.25); }
        .be-status-chip.published:hover { background: rgba(34,197,94,0.14); }
        .be-status-dropdown {
          position: absolute; top: calc(100% + 6px); right: 0; z-index: 50;
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.12); padding: 6px; min-width: 200px;
          animation: beDropIn 0.2s cubic-bezier(0.22,1,0.36,1);
        }
        @keyframes beDropIn { from { opacity: 0; transform: translateY(-8px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .be-status-option {
          display: flex; align-items: center; gap: 10px; padding: 10px 14px;
          border-radius: 10px; cursor: pointer; transition: background 0.15s ease; font-size: 0.84rem;
        }
        .be-status-option:hover { background: #f8fafc; }
        .be-status-option.active { background: rgba(163,217,0,0.08); }
        .be-status-option .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

        /* ── Mode Toggle ── */
        .be-mode-toggle {
          display: inline-flex; background: #f1f5f9; border-radius: 10px; padding: 3px; gap: 2px;
        }
        .be-mode-btn {
          padding: 5px 14px; border-radius: 8px; border: none; background: transparent;
          font-size: 0.78rem; font-weight: 700; color: #64748b; cursor: pointer;
          transition: all 0.2s ease; display: flex; align-items: center; gap: 5px;
        }
        .be-mode-btn.active { background: #fff; color: #1e293b; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
        .be-mode-btn:hover:not(.active) { color: #1e293b; }

        /* ── Editor Scrollable Container ── */
        .be-editor-scroll {
          max-height: calc(100vh - 260px);
          overflow-y: auto;
          border-radius: 14px;
          scrollbar-width: thin;
          scrollbar-color: var(--primary, #a3d900) #f1f5f9;
        }
        .be-editor-scroll::-webkit-scrollbar { width: 6px; }
        .be-editor-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
        .be-editor-scroll::-webkit-scrollbar-thumb { background: var(--primary, #a3d900); border-radius: 3px; }

        /* ── Preview (mirrors public blog) ── */
        .be-preview-frame {
          background: #fff; border: 1.5px solid #e2e8f0; border-radius: 18px;
          max-width: 800px; margin: 0 auto; padding: 2.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          min-height: 400px;
        }
      `}</style>

      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message}
        onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText="ยืนยัน" />
      <LoadingOverlay show={loading} message="กำลังบันทึกข้อมูล..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(p => ({ ...p, show: false }))} />

      {/* ── Sticky Action Bar ── */}
      <StickyBar
        isEdit={isEdit} form={form} mode={mode}
        onStatusChange={(val) => setForm(p => ({ ...p, status: val }))}
        onModeChange={setMode} onSave={handleSave} onBack={handleBack}
      />

      {/* ── EDIT MODE ── */}
      {mode === 'edit' && (
        <>
          {/* Title & Excerpt */}
          <div className="be-section">
            <div className="be-section-body">
              <div className="admin-form-group mb-3">
                <label>หัวข้อบทความ *</label>
                <input type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="พิมพ์หัวข้อบทความที่น่าสนใจ..."
                  style={{ fontSize: '1.15rem', fontWeight: 700, padding: '14px 18px' }} />
              </div>
              <div className="admin-form-group">
                <label>เนื้อหาย่อ (Excerpt) *</label>
                <textarea name="excerpt" rows="2" value={form.excerpt} onChange={handleChange}
                  placeholder="สรุปเนื้อหาสั้นๆ ที่จะแสดงในหน้ารายการบทความ..."></textarea>
              </div>
            </div>
          </div>

          {/* Rich Text Editor with scrollbar */}
          <div className="be-section" style={{ overflow: 'visible' }}>
            <div style={{ padding: '1rem 1.5rem' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-file-richtext" style={{ color: 'var(--primary)' }}></i>
                <span className="fw-bold" style={{ fontSize: '0.78rem', color: 'var(--primary-dark)', textTransform: 'uppercase', letterSpacing: '1px' }}>เนื้อหาเต็ม</span>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>— กดปุ่ม <i className="bi bi-image"></i> เพื่อแทรกรูปภาพ</span>
              </div>
              <div className="be-editor-scroll">
                <RichTextEditor
                  value={form.content}
                  onChange={(html) => setForm(p => ({ ...p, content: html }))}
                  placeholder="เขียนเนื้อหาบทความ... สามารถจัดรูปแบบและแทรกรูปภาพได้ตามต้องการ"
                  minHeight={500}
                  stickyTop={0}
                />
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="be-section be-section-clipped">
            <div className="be-panel-header" onClick={() => togglePanel('settings')}>
              <div className="be-panel-label"><i className="bi bi-gear"></i> ตั้งค่าบทความ &amp; ภาพปก</div>
              <i className={`bi bi-chevron-down be-panel-chevron ${openPanels.settings ? 'open' : ''}`}></i>
            </div>
            <div className={`be-panel-body ${openPanels.settings ? 'open' : ''}`}>
              <div className="row g-4">
                <div className="col-md-6">
                  <ImageUploader value={form.image} onChange={(url) => setForm(p => ({ ...p, image: url }))}
                    label="ภาพปก (Cover Image)" aspectRatio={16/9} lockAspect={true} recommendedSize="แนะนำขนาด 1200x675 px (16:9)" />
                </div>
                <div className="col-md-6">
                  <div className="admin-form-group mb-3">
                    <label>ผู้เขียน *</label>
                    <input type="text" name="author" value={form.author} onChange={handleChange} placeholder="ชื่อผู้เขียน" />
                  </div>
                  <div className="admin-form-group mb-3">
                    <label>แท็ก (Tags)</label>
                    <input type="text" name="tag" value={form.tag} onChange={handleChange} placeholder="Technology, Design" />
                  </div>
                  {isEdit && (
                    <div className="admin-form-group">
                      <label><i className="bi bi-pencil-square me-1"></i>สรุปการแก้ไข <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>(ถ้าไม่กรอก จะสร้างอัตโนมัติ)</span></label>
                      <input type="text" name="change_summary" value={form.change_summary} onChange={handleChange}
                        placeholder="เช่น แก้ไขหัวข้อ, เพิ่มรูปภาพใหม่" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit History Panel */}
          {isEdit && editHistory.length > 0 && (
            <div className="be-section be-section-clipped">
              <div className="be-panel-header" onClick={() => togglePanel('history')}>
                <div className="be-panel-label">
                  <i className="bi bi-clock-history"></i> ประวัติการแก้ไข
                  <span className="badge bg-secondary bg-opacity-10 text-secondary rounded-pill ms-2" style={{ fontSize: '0.68rem' }}>{editHistory.length}</span>
                </div>
                <i className={`bi bi-chevron-down be-panel-chevron ${openPanels.history ? 'open' : ''}`}></i>
              </div>
              <div className={`be-panel-body ${openPanels.history ? 'open' : ''}`}>
                {editHistory.map((h, idx) => (
                  <div key={h.id || idx} className="be-history-item d-flex gap-3 align-items-start">
                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 30, height: 30, background: idx === 0 ? 'rgba(163,217,0,0.15)' : '#f1f5f9', marginTop: 2 }}>
                      <i className={`bi bi-pencil-fill ${idx === 0 ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '0.65rem' }}></i>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="fw-bold text-dark" style={{ fontSize: '0.82rem' }}>{h.change_summary}</div>
                      <div className="text-muted d-flex gap-3" style={{ fontSize: '0.72rem' }}>
                        <span><i className="bi bi-person-fill me-1"></i>{h.edited_by}</span>
                        <span><i className="bi bi-clock me-1"></i>{formatDate(h.edited_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── PREVIEW MODE ── */}
      {mode === 'preview' && (
        <div className="be-preview-frame">
          {form.image && (
            <img src={form.image} alt={form.title}
              style={{ width: '100%', borderRadius: 'var(--radius-lg, 18px)', aspectRatio: '16/9', objectFit: 'cover', marginBottom: '1.5rem' }} />
          )}
          {form.tag && <span className="badge bg-primary rounded-pill px-3 py-2 mb-3" style={{ display: 'inline-block' }}>{form.tag}</span>}
          <h1 className="fw-bold mb-3" style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>{form.title || 'หัวข้อบทความ'}</h1>

          {/* Meta */}
          <div className="d-flex flex-wrap gap-3 align-items-center mb-4 pb-3" style={{ borderBottom: '1.5px solid #f1f5f9' }}>
            <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.88rem' }}>
              <i className="bi bi-calendar3" style={{ color: 'var(--primary)' }}></i>
              <span>สร้างเมื่อ: <strong style={{ color: '#1e293b' }}>{formatThaiDateLong(new Date().toISOString())}</strong></span>
            </span>
            {form.author && (
              <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.88rem' }}>
                <i className="bi bi-person-fill" style={{ color: 'var(--primary)' }}></i>
                <span>{form.author}</span>
              </span>
            )}
          </div>

          <p className="lead text-muted mb-4">{form.excerpt}</p>

          {form.content ? (
            <div className="blog-rich-content" style={{ lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: form.content }} />
          ) : (
            <div className="text-center text-muted py-5" style={{ fontSize: '0.9rem' }}>
              <i className="bi bi-file-earmark-text" style={{ fontSize: '2.5rem', opacity: 0.3 }}></i>
              <div className="mt-2">ยังไม่มีเนื้อหา — สลับไปโหมดแก้ไขเพื่อเพิ่มเนื้อหา</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/* ── Sticky Bar Sub-component ── */
function StickyBar({ isEdit, form, mode, onStatusChange, onModeChange, onSave, onBack }) {
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const close = (e) => {
      if (!e.target.closest('.be-status-wrapper')) setShowDropdown(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showDropdown]);

  return (
    <div className="be-sticky-bar">
      {/* Left side */}
      <div className="d-flex align-items-center gap-3">
        <button onClick={onBack}
          className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36, border: '1.5px solid #e2e8f0', flexShrink: 0 }}>
          <i className="bi bi-arrow-left text-dark" style={{ fontSize: '0.9rem' }}></i>
        </button>
        <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '0.95rem' }}>
          {isEdit ? 'แก้ไขบทความ' : 'เขียนบทความใหม่'}
        </h5>
      </div>

      {/* Center — Mode toggle */}
      <div className="be-mode-toggle">
        <button className={`be-mode-btn ${mode === 'edit' ? 'active' : ''}`} onClick={() => onModeChange('edit')}>
          <i className="bi bi-pencil"></i> แก้ไข
        </button>
        <button className={`be-mode-btn ${mode === 'preview' ? 'active' : ''}`} onClick={() => onModeChange('preview')}>
          <i className="bi bi-eye"></i> ดูตัวอย่าง
        </button>
      </div>

      {/* Right side */}
      <div className="d-flex align-items-center gap-2">
        {/* Status Chip */}
        <div className="be-status-wrapper" style={{ position: 'relative' }}>
          <div className={`be-status-chip ${form.status}`} onClick={() => setShowDropdown(!showDropdown)}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: form.status === 'published' ? '#22c55e' : '#94a3b8'
            }}></span>
            {form.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
            <i className="bi bi-chevron-down" style={{ fontSize: '0.65rem', marginLeft: 2, transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'none' }}></i>
          </div>

          {showDropdown && (
            <div className="be-status-dropdown">
              <div className={`be-status-option ${form.status === 'draft' ? 'active' : ''}`}
                onClick={() => { onStatusChange('draft'); setShowDropdown(false); }}>
                <span className="dot" style={{ background: '#94a3b8' }}></span>
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>แบบร่าง</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>ยังไม่แสดงบนเว็บไซต์</div>
                </div>
                {form.status === 'draft' && <i className="bi bi-check-lg ms-auto text-primary"></i>}
              </div>
              <div className={`be-status-option ${form.status === 'published' ? 'active' : ''}`}
                onClick={() => { onStatusChange('published'); setShowDropdown(false); }}>
                <span className="dot" style={{ background: '#22c55e' }}></span>
                <div>
                  <div className="fw-bold" style={{ color: '#1e293b' }}>เผยแพร่</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>แสดงบนเว็บไซต์สาธารณะ</div>
                </div>
                {form.status === 'published' && <i className="bi bi-check-lg ms-auto text-success"></i>}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button onClick={onSave} className="d-flex align-items-center gap-1"
          style={{
            padding: '7px 20px', borderRadius: '10px', border: 'none',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            color: 'var(--navy)', fontSize: '0.82rem', fontWeight: 700,
            boxShadow: '0 4px 15px rgba(163,217,0,0.25)',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>
          <i className="bi bi-check2-circle"></i> {isEdit ? 'บันทึก' : 'เผยแพร่'}
        </button>
      </div>
    </div>
  );
}
