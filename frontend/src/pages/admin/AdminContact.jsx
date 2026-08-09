import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { companyAPI, contactAPI, mailSettingsAPI, lineAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

// Common providers, so the host/port fields don't have to be looked up
const SMTP_PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: 587, tls: true, hint: 'ต้องเปิด 2-Step Verification แล้วสร้าง App Password มาใช้แทนรหัสผ่านปกติ' },
  { label: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, tls: true, hint: '' },
  { label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, tls: true, hint: '' },
];

/** Panel heading — styled with unified brand theme icon badge. */
function SectionHeader({ icon, color, title, desc, right }) {
  return (
    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-light-subtle">
      <div className="d-flex align-items-center gap-3">
        <div 
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm" 
          style={{ width: 46, height: 46, background: color ? `${color}18` : 'rgba(163, 217, 0, 0.2)', color: color || 'var(--navy)' }}
        >
          <i className={`bi ${icon} fs-4`}></i>
        </div>
        <div>
          <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '1.15rem' }}>{title}</h5>
          <p className="text-muted m-0 mt-1" style={{ fontSize: '0.82rem' }}>{desc}</p>
        </div>
      </div>
      {right && <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">{right}</div>}
    </div>
  );
}

function formatSentAt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminContact() {
  const [info, setInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [mail, setMail] = useState(null);
  const [mailPassword, setMailPassword] = useState('');
  const [testing, setTesting] = useState(false);
  const [line, setLine] = useState(null);
  const [lineRecipients, setLineRecipients] = useState([]);
  const [lineToken, setLineToken] = useState('');
  const [lineSecret, setLineSecret] = useState('');
  const [newLineUserId, setNewLineUserId] = useState('');
  const [lineTesting, setLineTesting] = useState(false);
  const [botInfo, setBotInfo] = useState(null);
  const [botInfoError, setBotInfoError] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [activeSection, setActiveSection] = useState('contact');
  // Which credential fields are currently unmasked
  const [revealed, setRevealed] = useState({ mailPassword: false, lineToken: false, lineSecret: false });

  /**
   * Toggle a credential field between hidden and visible. Revealing pulls the
   * stored value from the dedicated endpoint and drops it into the input, so the
   * admin can read or copy it; hiding clears the field again, which the save
   * handlers read as "keep the stored value".
   */
  const revealMail = async (field) => {
    if (revealed[field]) {
      setMailPassword('');
      setRevealed(p => ({ ...p, [field]: false }));
      return;
    }
    try {
      const data = await mailSettingsAPI.reveal();
      setMailPassword(data.smtpPassword || '');
      setRevealed(p => ({ ...p, [field]: true }));
    } catch (e) {
      setStatusM({ show: true, status: 'error', message: e.message || 'ดึงค่าที่บันทึกไว้ไม่สำเร็จ' });
    }
  };

  const revealLine = async (field) => {
    if (revealed[field]) {
      if (field === 'lineToken') setLineToken('');
      else setLineSecret('');
      setRevealed(p => ({ ...p, [field]: false }));
      return;
    }
    try {
      const data = await lineAPI.revealSettings();
      if (field === 'lineToken') setLineToken(data.channelAccessToken || '');
      else setLineSecret(data.channelSecret || '');
      setRevealed(p => ({ ...p, [field]: true }));
    } catch (e) {
      setStatusM({ show: true, status: 'error', message: e.message || 'ดึงค่าที่บันทึกไว้ไม่สำเร็จ' });
    }
  };

  useEffect(() => {
    companyAPI.get().then(d => setInfo(d)).catch(() => {});
    contactAPI.listMessages().then(d => setMessages(d || [])).catch(() => {});
    mailSettingsAPI.get().then(d => setMail(d)).catch(() => {});
    lineAPI.getSettings().then(d => setLine(d)).catch(() => {});
    lineAPI.listRecipients().then(d => setLineRecipients(d || [])).catch(() => {});
  }, []);

  const handleLineChange = (field, value) => setLine(p => ({ ...p, [field]: value }));

  const saveLine = () => {
    setConfirm({
      show: true, type: 'info', title: 'บันทึกการตั้งค่า LINE',
      message: 'บันทึกการตั้งค่าการแจ้งเตือนทาง LINE?',
      action: async () => {
        const updated = await lineAPI.updateSettings({
          ...line, channelAccessToken: lineToken, channelSecret: lineSecret,
        });
        setLine(updated);
        setLineToken('');
        setLineSecret('');
      }
    });
  };

  const refreshLine = () => {
    lineAPI.getSettings().then(d => setLine(d)).catch(() => {});
    lineAPI.listRecipients().then(d => setLineRecipients(d || [])).catch(() => {});
  };

  const loadBotInfo = useCallback(async () => {
    setBotInfoError('');
    try {
      const info = await lineAPI.getBotInfo();
      setBotInfo(info);
      if (info.addFriendUrl) {
        const url = await QRCode.toDataURL(info.addFriendUrl, {
          width: 320, margin: 1, color: { dark: '#0f172a', light: '#ffffff' },
        });
        setQrDataUrl(url);
      }
    } catch (e) {
      setBotInfo(null);
      setQrDataUrl('');
      setBotInfoError(e.message || 'ดึงข้อมูลบอทไม่สำเร็จ');
    }
  }, []);

  const regenerateCode = () => {
    setConfirm({
      show: true, type: 'warning', title: 'สร้างรหัสใหม่',
      message: 'รหัสเดิมจะใช้ไม่ได้ทันที คนที่ลงทะเบียนไปแล้วยังได้รับแจ้งเตือนตามปกติ ยืนยันหรือไม่?',
      action: async () => {
        const updated = await lineAPI.regenerateCode();
        setLine(updated);
      }
    });
  };

  const sendTestLine = async () => {
    setLineTesting(true);
    try {
      const updated = await lineAPI.updateSettings({
        ...line, channelAccessToken: lineToken, channelSecret: lineSecret,
      });
      setLine(updated);
      setLineToken('');
      setLineSecret('');
      const res = await lineAPI.sendTest();
      if (res.settings) setLine(res.settings);
      setStatusM({ show: true, status: 'success', message: res.message || 'ส่งข้อความทดสอบแล้ว' });
    } catch (e) {
      setLineToken('');
      setLineSecret('');
      refreshLine();
      setStatusM({ show: true, status: 'error', message: e.message || 'ส่งข้อความทดสอบไม่สำเร็จ' });
    }
    setLineTesting(false);
  };

  const addLineRecipient = async () => {
    try {
      const created = await lineAPI.addRecipient({ lineUserId: newLineUserId.trim() });
      setLineRecipients(p => [created, ...p]);
      setNewLineUserId('');
      refreshLine();
    } catch (e) {
      setStatusM({ show: true, status: 'error', message: e.message || 'เพิ่มผู้รับไม่สำเร็จ' });
    }
  };

  const toggleLineRecipient = (r) => {
    const next = !r.isActive;
    setLineRecipients(p => p.map(x => x.id === r.id ? { ...x, isActive: next } : x));
    lineAPI.updateRecipient(r.id, { isActive: next })
      .then(refreshLine)
      .catch(() => setLineRecipients(p => p.map(x => x.id === r.id ? { ...x, isActive: r.isActive } : x)));
  };

  const deleteLineRecipient = (r) => {
    setConfirm({
      show: true, type: 'danger', title: 'ลบผู้รับ',
      message: `ลบ "${r.displayName}" ออกจากรายชื่อผู้รับแจ้งเตือน?`,
      action: async () => {
        await lineAPI.deleteRecipient(r.id);
        setLineRecipients(p => p.filter(x => x.id !== r.id));
        refreshLine();
      }
    });
  };

  const handleMailChange = (field, value) => setMail(p => ({ ...p, [field]: value }));

  const applyPreset = (preset) => {
    setMail(p => ({ ...p, smtpHost: preset.host, smtpPort: preset.port, useTls: preset.tls }));
  };

  const saveMail = () => {
    setConfirm({
      show: true, type: 'info', title: 'บันทึกการตั้งค่าอีเมล',
      message: 'บันทึกการตั้งค่าการแจ้งเตือนทางอีเมล?',
      action: async () => {
        const updated = await mailSettingsAPI.update({ ...mail, smtpPassword: mailPassword });
        setMail(updated);
        setMailPassword('');
      }
    });
  };

  const sendTestMail = async () => {
    setTesting(true);
    try {
      const updated = await mailSettingsAPI.update({ ...mail, smtpPassword: mailPassword });
      setMail(updated);
      setMailPassword('');
      const res = await mailSettingsAPI.sendTest();
      if (res.settings) setMail(res.settings);
      setStatusM({ show: true, status: 'success', message: res.message || 'ส่งอีเมลทดสอบแล้ว' });
    } catch (e) {
      setMailPassword('');
      mailSettingsAPI.get().then(d => setMail(d)).catch(() => {});
      setStatusM({ show: true, status: 'error', message: e.message || 'ส่งอีเมลทดสอบไม่สำเร็จ' });
    }
    setTesting(false);
  };

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);
  const handleInfoChange = (e) => { setInfo(p => ({ ...p, [e.target.name]: e.target.value })); };
  const handleToggleField = (field) => { setInfo(p => ({ ...p, [field]: !p[field] })); };
  const saveInfo = () => { setConfirm({ show: true, type: 'info', title: 'บันทึก', message: 'บันทึกข้อมูลติดต่อ?', action: async () => { const u = await companyAPI.update(info); setInfo(u); } }); };

  const getMapPreviewSrc = () => {
    const val = info.googleMapEmbed || '';
    if (!val.trim()) return '';
    const match = val.match(/src="([^"]+)"/);
    const url = match ? match[1] : val.trim();
    if (url.includes('/maps/embed') || url.includes('maps.google.com/maps?') || url.includes('google.com/maps?')) {
      return url;
    }
    return '';
  };

  const isInvalidMapUrl = () => {
    const val = (info.googleMapEmbed || '').trim();
    if (!val) return false;
    return !getMapPreviewSrc();
  };

  const sections = [
    { key: 'contact', label: 'ข้อมูลติดต่อ', icon: 'bi-telephone-fill', save: saveInfo },
    { key: 'map', label: 'แผนที่', icon: 'bi-geo-alt-fill', save: saveInfo },
    { key: 'social', label: 'โซเชียลมีเดีย', icon: 'bi-share-fill', save: saveInfo },
    {
      key: 'mail', label: 'แจ้งเตือนอีเมล', icon: 'bi-envelope-paper-fill', save: saveMail,
      badge: mail ? { on: mail.isReady, text: mail.isReady ? 'ON' : 'OFF' } : null,
    },
    {
      key: 'line', label: 'แจ้งเตือน LINE', icon: 'bi-line', save: saveLine,
      badge: line ? { on: line.isReady, text: line.isReady ? 'ON' : 'OFF' } : null,
    },
    {
      key: 'inbox', label: 'กล่องข้อความ', icon: 'bi-inbox-fill', save: null,
      badge: unreadCount > 0 ? { on: true, text: String(unreadCount) } : null,
    },
  ];
  const currentSection = sections.find(s => s.key === activeSection) || sections[0];

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 bg-white p-3 px-4 rounded-4 shadow-sm border border-light-subtle">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-primary bg-opacity-25 text-dark p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
            <i className="bi bi-headset fs-4"></i>
          </div>
          <div>
            <h4 className="fw-bold m-0 text-dark">ระบบจัดการการติดต่อ</h4>
            <p className="text-muted m-0" style={{ fontSize: '0.82rem' }}>จัดการข้อมูลติดต่อ, แผนที่ Google Maps, โซเชียลมีเดีย และระบบแจ้งเตือน</p>
          </div>
        </div>
        {currentSection.save && (
          <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift" onClick={currentSection.save}>
            <i className="bi bi-save-fill"></i>บันทึกข้อมูล
          </button>
        )}
      </div>

      {/* ===== TOP: Horizontal Pill Navigator ===== */}
      <div className="mb-4 admin-pill-nav hide-scrollbar">
        {sections.map(s => {
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 flex-shrink-0 fw-bold admin-pill-item ${isActive ? 'active' : ''}`}
              style={{ color: isActive ? 'var(--navy)' : '#64748b' }}
            >
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.05rem' }}></i>
              {s.label}
              {s.badge && (
                <span className="badge rounded-pill ms-1" style={{ fontSize: '.65rem', padding: '4px 8px', background: s.badge.on ? (isActive ? 'var(--navy)' : '#e2e8f0') : 'transparent', color: s.badge.on ? (isActive ? 'var(--primary)' : '#64748b') : '#94a3b8', border: s.badge.on ? 'none' : '1px solid #cbd5e1' }}>
                  {s.badge.text}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="row">
        <div className="col-12">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 anim-slide-up border border-light-subtle" key={activeSection} style={{ minHeight: '500px' }}>

      {/* ---- 1. Contact Info ---- */}
      {activeSection === 'contact' && (
        <div>
          <SectionHeader icon="bi-telephone-fill" color="var(--navy)" title="ข้อมูลติดต่อพื้นฐาน" desc="อีเมล, เบอร์โทรศัพท์ และที่อยู่หลักของบริษัท" />
          <div className="row g-4">
            <div className="col-md-6">
              <div className="admin-form-group">
                <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  <i className="bi bi-envelope-at-fill text-primary me-2"></i>อีเมลบริษัท
                </label>
                <input type="email" name="email" className="form-control" value={info.email || ''} onChange={handleInfoChange} placeholder="contact@example.com" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="admin-form-group">
                <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  <i className="bi bi-telephone-fill text-primary me-2"></i>เบอร์โทรศัพท์ติดต่อ
                </label>
                <input type="text" name="phone" className="form-control" value={info.phone || ''} onChange={handleInfoChange} placeholder="02-XXX-XXXX" />
              </div>
            </div>
            <div className="col-12">
              <div className="admin-form-group mb-0">
                <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                  <i className="bi bi-geo-alt-fill text-primary me-2"></i>ที่อยู่สำนักงาน
                </label>
                <textarea name="address" className="form-control" rows="3" value={info.address || ''} onChange={handleInfoChange} placeholder="ระบุที่อยู่ของบริษัท..."></textarea>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- 2. Google Map ---- */}
      {activeSection === 'map' && (
        <div>
          <SectionHeader icon="bi-geo-alt-fill" color="#dc3545" title="Google Maps Embed" desc="วาง Embed Code หรือ URL จาก Google Maps เพื่อแสดงตำแหน่งที่ตั้งบนเว็บไซต์" />
          <div>
            <div className="admin-form-group mb-3">
              <label className="d-flex align-items-center justify-content-between gap-2 mb-2 fw-bold text-dark">
                <span><i className="bi bi-code-slash text-primary me-1.5"></i>Google Maps Embed Code หรือ URL</span>
                <span className="badge bg-primary bg-opacity-25 text-dark px-3 py-1 rounded-pill" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  วิธีใช้งาน: เปิด Google Maps &gt; แชร์ &gt; ฝังแผนที่ &gt; คัดลอก HTML
                </span>
              </label>
              <textarea
                name="googleMapEmbed"
                rows="4"
                className="form-control font-monospace"
                value={info.googleMapEmbed || ''}
                onChange={handleInfoChange}
                placeholder='วาง <iframe src="https://www.google.com/maps/embed?..." ...></iframe> หรือ URL ตรงๆ'
                style={{ fontSize: '0.88rem', borderRadius: '14px', border: '1.5px solid #cbd5e1' }}
              ></textarea>
            </div>

            {/* Warning for invalid URL */}
            {isInvalidMapUrl() && (
              <div className="alert alert-warning border-0 rounded-4 mb-3 py-3 px-4 shadow-sm" style={{ fontSize: '0.88rem' }}>
                <div className="d-flex align-items-start gap-3">
                  <i className="bi bi-exclamation-triangle-fill text-warning fs-4 mt-1"></i>
                  <div>
                    <strong className="d-block mb-1 text-dark">URL ที่วางไม่ใช่ Embed URL ของ Google Maps</strong>
                    <p className="m-0 mb-2 text-secondary">คุณวาง URL ปกติ (เช่น google.com/maps/place/...) ซึ่ง Google ไม่อนุญาตให้แสดงผ่าน iframe ได้</p>
                    <div className="bg-white rounded-3 p-3 border">
                      <strong className="text-dark d-block mb-1">📌 วิธีการรับ Embed Code ที่ถูกต้อง:</strong>
                      <ol className="m-0 ps-3" style={{ lineHeight: 2 }}>
                        <li>เปิด <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="fw-bold">Google Maps</a> → ค้นหาสถานที่</li>
                        <li>กดปุ่ม <strong>"แชร์" (Share)</strong></li>
                        <li>เลือกแท็บ <strong>"ฝังแผนที่" (Embed a map)</strong></li>
                        <li>กด <strong>"คัดลอก HTML"</strong> → นำมาวางในช่องด้านบน</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {getMapPreviewSrc() && (
              <div className="mt-4">
                <label className="fw-bold mb-2 text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.92rem' }}>
                  <i className="bi bi-eye-fill text-primary"></i> ตัวอย่างตำแหน่งแผนที่บนหน้าเว็บ (Live Preview)
                </label>
                <div className="rounded-4 overflow-hidden border shadow-sm" style={{ height: '360px', borderRadius: '20px' }}>
                  <iframe
                    src={getMapPreviewSrc()}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Google Map Preview"
                  ></iframe>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- 3. Social Media ---- */}
      {activeSection === 'social' && (
        <div>
          <SectionHeader icon="bi-share-fill" color="#198754" title="โซเชียลมีเดีย (Social Media)" desc="จัดการลิงก์ Facebook, LINE, Instagram และการเปิด/ปิดแสดงผลบนหน้าเว็บ" />
          <div>
            <div className="d-flex flex-column gap-3">
              {/* Facebook */}
              <div className="p-4 rounded-4 border bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: 42, height: 42, background: '#1877f2' }}>
                      <i className="bi bi-facebook fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold m-0 text-dark">Facebook Page</h6>
                      <small className="text-muted">ลิงก์แฟนเพจ Facebook ขององค์กร</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`admin-status-pill ${info.showFacebook ? 'is-on' : 'is-off'}`}>
                      <i className={`bi ${info.showFacebook ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                      {info.showFacebook ? 'แสดงบนเว็บ' : 'ซ่อนอยู่'}
                    </span>
                    <div className="form-check form-switch fs-5 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={info.showFacebook || false} onChange={() => handleToggleField('showFacebook')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group mb-0">
                  <input type="url" name="facebook" className="form-control" value={info.facebook || ''} onChange={handleInfoChange} placeholder="https://www.facebook.com/yourpage" disabled={!info.showFacebook} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                </div>
              </div>

              {/* LINE */}
              <div className="p-4 rounded-4 border bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: 42, height: 42, background: '#06c755' }}>
                      <i className="bi bi-line fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold m-0 text-dark">LINE Official Account</h6>
                      <small className="text-muted">LINE ID หรือลิงก์เพิ่มเพื่อน</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`admin-status-pill ${info.showLine ? 'is-on' : 'is-off'}`}>
                      <i className={`bi ${info.showLine ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                      {info.showLine ? 'แสดงบนเว็บ' : 'ซ่อนอยู่'}
                    </span>
                    <div className="form-check form-switch fs-5 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={info.showLine || false} onChange={() => handleToggleField('showLine')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group mb-0">
                  <input type="text" name="lineId" className="form-control" value={info.lineId || ''} onChange={handleInfoChange} placeholder="@yourlineid หรือ https://line.me/R/ti/p/~@yourlineid" disabled={!info.showLine} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                </div>
              </div>

              {/* Instagram */}
              <div className="p-4 rounded-4 border bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 d-flex align-items-center justify-content-center text-white" style={{ width: 42, height: 42, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                      <i className="bi bi-instagram fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold m-0 text-dark">Instagram Profile</h6>
                      <small className="text-muted">ลิงก์บัญชี Instagram</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`admin-status-pill ${info.showInstagram ? 'is-on' : 'is-off'}`}>
                      <i className={`bi ${info.showInstagram ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                      {info.showInstagram ? 'แสดงบนเว็บ' : 'ซ่อนอยู่'}
                    </span>
                    <div className="form-check form-switch fs-5 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={info.showInstagram || false} onChange={() => handleToggleField('showInstagram')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group mb-0">
                  <input type="url" name="instagram" className="form-control" value={info.instagram || ''} onChange={handleInfoChange} placeholder="https://www.instagram.com/yourprofile" disabled={!info.showInstagram} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- 4. Email notification ---- */}
      {activeSection === 'mail' && (
        <div>
          <SectionHeader
            icon="bi-envelope-paper-fill" color="#0891b2"
            title="การแจ้งเตือนทางอีเมล (Email Notification)" desc="ตั้งค่าระบบส่งอีเมลแจ้งเตือนทีมงาน เมื่อมีลูกค้าส่งแบบฟอร์มเข้ามา"
            right={mail && (
              <span className={`admin-status-pill lg ${mail.isReady ? 'is-on' : 'is-off'}`}>
                <i className={`bi ${mail.isReady ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                {mail.isReady ? 'เปิดใช้งานแล้ว' : 'ยังไม่เปิดใช้งาน'}
              </span>
            )}
          />
          <div>
            {!mail ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: 32, height: 32 }}></div>
                <div className="text-muted mt-2 small">กำลังโหลดการตั้งค่า...</div>
              </div>
            ) : (
              <>
                {/* Last send result alert */}
                {mail.lastStatus && (
                  <div
                    className={`alert border-0 rounded-4 d-flex align-items-start gap-3 py-3.5 px-4 mb-4 shadow-sm ${mail.lastStatus === 'success' ? 'alert-success' : 'alert-danger'}`}
                    style={{ fontSize: '0.88rem' }}
                  >
                    <i className={`bi ${mail.lastStatus === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-4`}></i>
                    <div>
                      <strong className="d-block mb-1 text-dark">
                        {mail.lastStatus === 'success' ? 'ส่งอีเมลสำเร็จล่าสุด' : 'ส่งอีเมลไม่สำเร็จล่าสุด'}
                        {mail.lastSentAt && <span className="fw-normal ms-2 opacity-75">{formatSentAt(mail.lastSentAt)}</span>}
                      </strong>
                      {mail.lastStatus === 'error'
                        ? <span>{mail.lastError}</span>
                        : <span className="opacity-75">ระบบส่งอีเมลออกไปได้ตามปกติเรียบร้อย</span>}
                    </div>
                  </div>
                )}

                {/* Master switch */}
                <div className="p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center gap-3 mb-4">
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>เปิดใช้งานการแจ้งเตือนทางอีเมล</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.84rem' }}>
                      หากปิดไว้ ข้อความจากลูกค้าจะยังคงถูกบันทึกลงในกล่องข้อความเหมือนเดิม
                    </div>
                  </div>
                  <div className="form-check form-switch fs-4 m-0 flex-shrink-0">
                    <input className="form-check-input" type="checkbox" role="switch"
                      checked={!!mail.enabled}
                      onChange={() => handleMailChange('enabled', !mail.enabled)}
                      style={{ cursor: 'pointer' }} />
                  </div>
                </div>

                <div className="row g-4 admin-settings-grid">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-envelope-check-fill text-primary me-2"></i>ส่งการแจ้งเตือนไปที่อีเมล <span className="text-danger">*</span>
                        <span className="fw-normal text-muted ms-2" style={{ fontSize: '0.8rem' }}>(หากมีหลายอีเมล ให้คั่นด้วยเครื่องหมายจุลภาค ,)</span>
                      </label>
                      <input type="text" className="form-control" value={mail.toEmail || ''} placeholder="you@example.com, team@example.com"
                        onChange={e => handleMailChange('toEmail', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>

                  {/* Provider presets */}
                  <div className="col-12">
                    <label className="d-block fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                      <i className="bi bi-lightning-charge-fill text-warning me-2"></i>เลือกผู้ให้บริการอัตโนมัติ (Preset SMTP)
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                      {SMTP_PRESETS.map(preset => (
                        <button key={preset.label} type="button"
                          className={`btn rounded-3 border px-4 py-2 fw-bold transition-all ${mail.smtpHost === preset.host ? 'btn-primary' : 'btn-light text-dark'}`}
                          style={{ fontSize: '0.88rem' }}
                          onClick={() => applyPreset(preset)}>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {SMTP_PRESETS.find(p => p.host === mail.smtpHost)?.hint && (
                      <div className="alert alert-warning border-0 rounded-4 mt-3 mb-0 p-4 d-flex align-items-start gap-3">
                        {/* Fixed-size icon tile so the text column starts on a straight edge */}
                        <span
                          className="d-flex align-items-center justify-content-center flex-shrink-0 rounded-3"
                          style={{ width: 32, height: 32, background: 'rgba(255,193,7,0.35)' }}
                        >
                          <i className="bi bi-info-circle-fill" style={{ fontSize: '0.95rem' }}></i>
                        </span>
                        <div style={{ fontSize: '0.9rem', lineHeight: 1.85 }}>
                          <div className="fw-bold mb-1">ข้อควรรู้สำหรับ {SMTP_PRESETS.find(p => p.host === mail.smtpHost).label}</div>
                          {SMTP_PRESETS.find(p => p.host === mail.smtpHost).hint}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-8">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-hdd-network-fill text-primary me-2"></i>SMTP Host *
                      </label>
                      <input type="text" className="form-control" value={mail.smtpHost || ''} placeholder="smtp.gmail.com"
                        onChange={e => handleMailChange('smtpHost', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-ethernet text-primary me-2"></i>พอร์ต (Port) *
                      </label>
                      <input type="number" className="form-control" value={mail.smtpPort ?? 587}
                        onChange={e => handleMailChange('smtpPort', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-person-badge-fill text-primary me-2"></i>ชื่อผู้ใช้ SMTP (Username)
                      </label>
                      <input type="text" className="form-control" value={mail.smtpUser || ''} placeholder="you@gmail.com"
                        autoComplete="off"
                        onChange={e => handleMailChange('smtpUser', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="d-flex align-items-center justify-content-between gap-2 fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <span><i className="bi bi-key-fill text-primary me-2"></i>รหัสผ่าน / App Password</span>
                        {mail.hasPassword && <span className="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>✔ บันทึกแล้ว</span>}
                      </label>
                      <div className="input-group flex-nowrap">
                        <input type={revealed.mailPassword ? 'text' : 'password'} className="form-control" value={mailPassword} autoComplete="new-password"
                          placeholder={mail.hasPassword ? 'เว้นว่างไว้ = ใช้ค่าเดิม' : 'กรอกรหัสผ่าน SMTP หรือ App Password'}
                          onChange={e => setMailPassword(e.target.value)} style={{ borderRadius: '12px 0 0 12px', padding: '12px 16px' }} />
                        <button type="button" className="btn btn-light border" style={{ borderRadius: '0 12px 12px 0' }}
                          title={revealed.mailPassword ? 'ซ่อน' : 'แสดงค่าที่บันทึกไว้'}
                          onClick={() => revealMail('mailPassword')}>
                          <i className={`bi ${revealed.mailPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                      {mail.hasPassword && !mailPassword && (
                        <div className="text-muted mt-2 d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.78rem' }}>
                          <span>ค่าที่บันทึกไว้:</span>
                          <code className="text-dark">{mail.passwordMasked}</code>
                          <span className="text-black-50">({mail.passwordLength} ตัวอักษร)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-envelope-paper-fill text-primary me-2"></i>อีเมลผู้ส่ง (From Email) *
                      </label>
                      <input type="email" className="form-control" value={mail.fromEmail || ''} placeholder="you@gmail.com"
                        onChange={e => handleMailChange('fromEmail', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-person-lines-fill text-primary me-2"></i>ชื่อผู้ส่งที่แสดง (From Name)
                      </label>
                      <input type="text" className="form-control" value={mail.fromName || ''} placeholder="108 WOW Sport Day"
                        onChange={e => handleMailChange('fromName', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="admin-form-group mb-0">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-link-45deg text-primary me-2"></i>URL เว็บไซต์ระบบ <span className="fw-normal text-muted me-2" style={{ fontSize: '0.8rem' }}>(สร้างปุ่มเปิดดูข้อความในอีเมล)</span>
                      </label>
                      <input type="url" className="form-control" value={mail.siteUrl || ''} placeholder="http://localhost:5173"
                        onChange={e => handleMailChange('siteUrl', e.target.value)} style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center gap-3">
                      <label htmlFor="mail-tls" className="m-0 cursor-pointer">
                        <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                          <i className="bi bi-shield-lock-fill text-primary me-2"></i>เปิดใช้การเข้ารหัส STARTTLS
                        </div>
                        <div className="text-muted mt-1" style={{ fontSize: '0.83rem', lineHeight: 1.6 }}>
                          พอร์ต 587 ควรเปิดไว้ — หากเป็นพอร์ต 465 ระบบจะสลับไปใช้ SSL ให้อัตโนมัติ
                        </div>
                      </label>
                      <div className="form-check form-switch fs-4 m-0 flex-shrink-0">
                        <input className="form-check-input" type="checkbox" role="switch" id="mail-tls"
                          checked={!!mail.useTls}
                          onChange={() => handleMailChange('useTls', !mail.useTls)}
                          style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={saveMail}>
                    <i className="bi bi-save-fill"></i>บันทึกการตั้งค่าอีเมล
                  </button>
                  <button className="btn btn-light border fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                    onClick={sendTestMail} disabled={testing}>
                    {testing
                      ? (<><span className="spinner-border spinner-border-sm me-1"></span>กำลังส่งอีเมล...</>)
                      : (<><i className="bi bi-send-check-fill text-primary"></i>บันทึกและทดสอบส่งอีเมล</>)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- 5. LINE notification ---- */}
      {activeSection === 'line' && (
        <div>
          <SectionHeader
            icon="bi-line" color="#06c755"
            title="การแจ้งเตือนทาง LINE Official" desc="ส่งข้อความแจ้งเตือนแบบ Flex Message เข้าแชท LINE ของทีมงานเมื่อมีคนติดต่อเข้ามา"
            right={line && (
              <span className={`admin-status-pill lg ${line.isReady ? 'is-on' : 'is-off'}`}>
                <i className={`bi ${line.isReady ? 'bi-check-circle-fill' : 'bi-dash-circle'}`}></i>
                {line.isReady ? `เปิดใช้งาน · ผู้รับ ${line.activeRecipients} คน` : 'ยังไม่เปิดใช้งาน'}
              </span>
            )}
          />
          <div>
            {!line ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: 32, height: 32 }}></div>
                <div className="text-muted mt-2 small">กำลังโหลดการตั้งค่า...</div>
              </div>
            ) : (
              <>
                {line.lastStatus && (
                  <div className={`alert border-0 rounded-4 d-flex align-items-start gap-3 py-3.5 px-4 mb-4 shadow-sm ${line.lastStatus === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '0.88rem' }}>
                    <i className={`bi ${line.lastStatus === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-4`}></i>
                    <div>
                      <strong className="d-block mb-1 text-dark">
                        {line.lastStatus === 'success' ? 'ส่ง LINE สำเร็จล่าสุด' : 'ส่ง LINE ไม่สำเร็จล่าสุด'}
                        {line.lastSentAt && <span className="fw-normal ms-2 opacity-75">{formatSentAt(line.lastSentAt)}</span>}
                      </strong>
                      {line.lastError ? <span>{line.lastError}</span> : <span className="opacity-75">ระบบส่งข้อความออกไปได้ตามปกติเรียบร้อย</span>}
                    </div>
                  </div>
                )}

                {/* Master switch */}
                <div className="p-4 rounded-4 border bg-white shadow-sm d-flex justify-content-between align-items-center gap-3 mb-4">
                  <div>
                    <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>เปิดใช้งานการแจ้งเตือนทาง LINE</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.84rem' }}>
                      ทำงานอิสระแยกจากอีเมล สามารถเปิดใช้งานพร้อมกันหรือเลือกอย่างใดอย่างหนึ่งได้
                    </div>
                  </div>
                  <div className="form-check form-switch fs-4 m-0 flex-shrink-0">
                    <input className="form-check-input" type="checkbox" role="switch"
                      checked={!!line.enabled}
                      onChange={() => handleLineChange('enabled', !line.enabled)}
                      style={{ cursor: 'pointer' }} />
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="d-flex align-items-center justify-content-between gap-2 fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <span><i className="bi bi-shield-lock-fill text-success me-2"></i>Channel Access Token *</span>
                        {line.hasAccessToken && <span className="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>✔ บันทึกแล้ว</span>}
                      </label>
                      <div className="input-group flex-nowrap">
                        <input type={revealed.lineToken ? 'text' : 'password'} className="form-control" value={lineToken} autoComplete="new-password"
                          placeholder={line.hasAccessToken ? 'เว้นว่างไว้ = ใช้ค่าเดิม' : 'วาง Channel access token (long-lived)'}
                          onChange={e => setLineToken(e.target.value)} style={{ borderRadius: '12px 0 0 12px', padding: '12px 16px' }} />
                        <button type="button" className="btn btn-light border" style={{ borderRadius: '0 12px 12px 0' }}
                          title={revealed.lineToken ? 'ซ่อน' : 'แสดงค่าที่บันทึกไว้'}
                          onClick={() => revealLine('lineToken')}>
                          <i className={`bi ${revealed.lineToken ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                      {line.hasAccessToken && !lineToken && (
                        <div className="text-muted mt-2 d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.78rem' }}>
                          <span>ค่าที่บันทึกไว้:</span>
                          <code className="text-dark">{line.accessTokenMasked}</code>
                          <span className="text-black-50">({line.accessTokenLength} ตัวอักษร)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="d-flex align-items-center justify-content-between gap-2 fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <span><i className="bi bi-key-fill text-success me-2"></i>Channel Secret <span className="fw-normal text-muted me-2" style={{ fontSize: '0.8rem' }}>(สำหรับใช้ Webhook ลงทะเบียนอัตโนมัติ)</span></span>
                        {line.hasChannelSecret && <span className="badge bg-success bg-opacity-10 text-success px-3 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>✔ บันทึกแล้ว</span>}
                      </label>
                      <div className="input-group flex-nowrap">
                        <input type={revealed.lineSecret ? 'text' : 'password'} className="form-control" value={lineSecret} autoComplete="new-password"
                          placeholder={line.hasChannelSecret ? 'เว้นว่างไว้ = ใช้ค่าเดิม' : 'วาง Channel secret'}
                          onChange={e => setLineSecret(e.target.value)} style={{ borderRadius: '12px 0 0 12px', padding: '12px 16px' }} />
                        <button type="button" className="btn btn-light border" style={{ borderRadius: '0 12px 12px 0' }}
                          title={revealed.lineSecret ? 'ซ่อน' : 'แสดงค่าที่บันทึกไว้'}
                          onClick={() => revealLine('lineSecret')}>
                          <i className={`bi ${revealed.lineSecret ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                      {line.hasChannelSecret && !lineSecret && (
                        <div className="text-muted mt-2 d-flex align-items-center gap-2 flex-wrap" style={{ fontSize: '0.78rem' }}>
                          <span>ค่าที่บันทึกไว้:</span>
                          <code className="text-dark">{line.channelSecretMasked}</code>
                          <span className="text-black-50">({line.channelSecretLength} ตัวอักษร)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Self-registration: scan the QR, type the code ── */}
                <div className="mt-4 pt-4 border-top border-light-subtle">
                  <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: '1rem' }}>
                    <i className="bi bi-qr-code-scan text-success me-2"></i>วิธีเพิ่มทีมงานผู้รับแจ้งเตือน LINE
                  </h6>
                  <small className="text-muted d-block mb-3">แชร์ QR Code และรหัสลงทะเบียนนี้ให้ทีมงาน เพื่อให้ลงทะเบียนรับแจ้งเตือนได้ด้วยตนเอง</small>

                  <div className="row g-4 align-items-stretch">
                    <div className="col-md-5">
                      <div className="border rounded-4 h-100 d-flex flex-column align-items-center justify-content-center p-4 text-center bg-white shadow-sm">
                        {qrDataUrl ? (
                          <>
                            <img src={qrDataUrl} alt="QR เพิ่มเพื่อน LINE" style={{ width: 170, height: 170, borderRadius: '12px' }} />
                            <div className="fw-bold text-dark mt-3" style={{ fontSize: '0.92rem' }}>{botInfo?.displayName}</div>
                            <a href={botInfo?.addFriendUrl} target="_blank" rel="noopener noreferrer"
                              className="text-decoration-none fw-semibold" style={{ fontSize: '0.8rem', color: '#06c755' }}>
                              {botInfo?.basicId}
                            </a>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-qr-code text-muted" style={{ fontSize: '2.8rem', opacity: 0.35 }}></i>
                            <p className="text-muted mt-2 mb-3" style={{ fontSize: '0.85rem' }}>
                              {botInfoError || 'กดปุ่มด้านล่างเพื่อดึง QR Code'}
                            </p>
                            <button className="btn btn-light border fw-bold rounded-pill px-4 py-2" onClick={loadBotInfo}
                              disabled={!line.hasAccessToken}>
                              <i className="bi bi-arrow-clockwise me-1.5"></i>ดึง QR Code
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="col-md-7">
                      <div className="border rounded-4 h-100 p-4 d-flex flex-column justify-content-center bg-white shadow-sm">
                        <div className="text-muted mb-1 fw-bold" style={{ fontSize: '0.82rem' }}>รหัสลงทะเบียน (Register Code)</div>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <span className="fw-black text-dark px-3 py-2 bg-light border rounded-3" style={{ fontSize: '2rem', letterSpacing: '6px', fontFamily: 'monospace', fontWeight: 900 }}>
                            {line.registerCode || '------'}
                          </span>
                          <button className="btn btn-light border rounded-circle p-2 d-flex align-items-center justify-content-center" onClick={regenerateCode} title="สร้างรหัสใหม่" style={{ width: 42, height: 42 }}>
                            <i className="bi bi-arrow-repeat fs-5"></i>
                          </button>
                        </div>
                        <ol className="text-muted m-0 ps-3" style={{ fontSize: '0.88rem', lineHeight: 1.9 }}>
                          <li>ให้ทีมงานสแกน QR เพื่อแอดเป็นเพื่อนกับบัญชี LINE Official</li>
                          <li>พิมพ์ส่งรหัส <strong className="text-dark font-monospace fw-bold">{line.registerCode || '------'}</strong> ในแชท</li>
                          <li>ระบบจะอนุมัติและเพิ่มชื่อเข้าในรายชื่อผู้รับด้านล่างให้อัตโนมัติ</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Recipient list ── */}
                <div className="mt-4 pt-4 border-top border-light-subtle">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h6 className="fw-bold m-0 text-dark" style={{ fontSize: '1rem' }}>
                        <i className="bi bi-people-fill text-primary me-2"></i>รายชื่อผู้รับแจ้งเตือน
                        {line.pendingRecipients > 0 && (
                          <span className="badge bg-warning bg-opacity-25 text-dark rounded-pill ms-2" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                            รออนุมัติ {line.pendingRecipients} คน
                          </span>
                        )}
                      </h6>
                    </div>
                    <button className="btn btn-light border btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2" onClick={refreshLine}>
                      <i className="bi bi-arrow-clockwise"></i>รีเฟรชรายชื่อ
                    </button>
                  </div>

                  {lineRecipients.length === 0 ? (
                    <div className="text-center text-muted border rounded-4 py-5 bg-light" style={{ fontSize: '0.88rem' }}>
                      <i className="bi bi-person-plus d-block fs-2 mb-2 text-black-50"></i>
                      ยังไม่มีทีมงานลงทะเบียนรับแจ้งเตือน
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {lineRecipients.map(r => (
                        <div key={r.id}
                          className="d-flex align-items-center gap-3 border rounded-4 p-3 bg-white shadow-sm"
                          style={{ borderColor: r.isActive ? 'var(--primary)' : '#e2e8f0' }}>
                          <div className="form-check m-0">
                            <input className="form-check-input cursor-pointer" type="checkbox" checked={r.isActive}
                              onChange={() => toggleLineRecipient(r)}
                              title={r.isActive ? 'กำลังรับแจ้งเตือน' : 'ยังไม่ได้รับแจ้งเตือน'}
                              style={{ cursor: 'pointer', width: 20, height: 20 }} />
                          </div>
                          {r.pictureUrl
                            ? <img src={r.pictureUrl} alt="" className="rounded-circle flex-shrink-0 border" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                            : <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
                                <i className="bi bi-person-fill text-muted fs-5"></i>
                              </div>}
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.92rem' }}>{r.displayName}</div>
                            <div className="text-muted text-truncate font-monospace" style={{ fontSize: '0.75rem' }}>{r.lineUserId}</div>
                          </div>
                          {r.isBlocked ? (
                            <span className="admin-status-pill is-blocked flex-shrink-0">
                              <i className="bi bi-slash-circle-fill"></i>บล็อกบอท
                            </span>
                          ) : (
                            <span className={`admin-status-pill flex-shrink-0 ${r.isActive ? 'is-on' : 'is-pending'}`}>
                              <i className={`bi ${r.isActive ? 'bi-bell-fill' : 'bi-hourglass-split'}`}></i>
                              {r.isActive ? 'รับแจ้งเตือนอยู่' : 'รอเปิดรับ'}
                            </span>
                          )}
                          <button className="btn btn-sm btn-light border text-danger rounded-circle p-2 flex-shrink-0 d-flex align-items-center justify-content-center"
                            onClick={() => deleteLineRecipient(r)} title="ลบผู้รับ" style={{ width: 34, height: 34 }}>
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Without a public webhook this is the only way to enrol anyone,
                      so it stays available — just tucked away. */}
                  <button className="btn btn-link btn-sm text-muted text-decoration-none px-0 mt-3"
                    onClick={() => setShowManualAdd(v => !v)}>
                    <i className={`bi bi-chevron-${showManualAdd ? 'up' : 'down'} me-1`}></i>
                    เพิ่มด้วย LINE User ID เอง (กรณียังไม่ได้ตั้ง Webhook)
                  </button>
                  {showManualAdd && (
                    <div className="d-flex gap-2 mt-2">
                      <input type="text" className="form-control" value={newLineUserId}
                        placeholder="User ID ขึ้นต้นด้วย U... (ดูได้ที่ LINE Developers → Basic settings)"
                        onChange={e => setNewLineUserId(e.target.value)}
                        style={{ borderRadius: '12px', fontSize: '0.88rem', border: '1.5px solid #e2e8f0' }} />
                      <button className="btn btn-primary rounded-3 px-3 fw-bold flex-shrink-0"
                        disabled={!newLineUserId.trim()} onClick={addLineRecipient}>
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                  )}
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={saveLine}>
                    <i className="bi bi-save-fill"></i>บันทึกการตั้งค่า LINE
                  </button>
                  <button className="btn btn-light border fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                    onClick={sendTestLine} disabled={lineTesting}>
                    {lineTesting
                      ? (<><span className="spinner-border spinner-border-sm me-1"></span>กำลังส่ง LINE...</>)
                      : (<><i className="bi bi-send-check-fill text-success"></i>บันทึกและทดสอบส่ง LINE</>)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ---- 6. Inbox ---- */}
      {activeSection === 'inbox' && (
        <div>
          <SectionHeader
            icon="bi-inbox-fill" color="#d97706"
            title="กล่องข้อความสอบถาม (Inbox)" desc="ดูข้อความและคำขอเช่าอุปกรณ์ทั้งหมดที่ถูกส่งเข้ามาจากผู้เข้าชมเว็บไซต์"
            right={unreadCount > 0 && (
              <span className="badge bg-danger rounded-pill px-3 py-2" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{unreadCount} ข้อความใหม่</span>
            )}
          />
          
          <div className="row g-4 mb-4">
            {[
              { label: 'ข้อความทั้งหมด', value: messages.length, icon: 'bi-envelope-fill', color: '#0891b2' },
              { label: 'ยังไม่อ่าน', value: unreadCount, icon: 'bi-envelope-exclamation-fill', color: '#dc3545' },
              { label: 'อ่านแล้ว', value: messages.length - unreadCount, icon: 'bi-envelope-open-fill', color: '#16a34a' },
            ].map(stat => (
              <div key={stat.label} className="col-12 col-md-4">
                <div className="p-4 rounded-4 border bg-white h-100 d-flex align-items-center gap-3 shadow-sm">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: `${stat.color}18`, color: stat.color }}>
                    <i className={`bi ${stat.icon} fs-4`}></i>
                  </div>
                  <div>
                    <div className="fw-black text-dark" style={{ fontSize: '1.6rem', lineHeight: 1.1, fontWeight: 900 }}>{stat.value}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.82rem', fontWeight: 600 }}>{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-4 border bg-light">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h6 className="fw-bold m-0 text-dark" style={{ fontSize: '1rem' }}>ข้อความล่าสุดจากผู้เข้าชม</h6>
                <small className="text-muted">คลิกปุ่มเพื่อเปิดเข้าสู่ระบบจัดการกล่องข้อความเต็มรูปแบบ</small>
              </div>
              <Link to="/admin/messages" className="btn btn-primary fw-bold px-4 py-2 rounded-pill d-inline-flex align-items-center gap-2 shadow-sm">
                <i className="bi bi-box-arrow-up-right me-1"></i>เปิดกล่องข้อความทั้งหมด ({messages.length})
              </Link>
            </div>

            {messages.length === 0 ? (
              <div className="text-center py-5 bg-white rounded-4 border text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2 text-black-50"></i>
                ยังไม่มีข้อความส่งเข้ามาในระบบ
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {messages.slice(0, 5).map(m => (
                  <div key={m.id} className="p-3 bg-white rounded-3 border d-flex justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center gap-3 text-truncate">
                      <span className={`badge rounded-circle p-2 ${m.status === 'unread' ? 'bg-danger' : 'bg-secondary'}`} style={{ width: 10, height: 10, padding: 0 }}></span>
                      <div>
                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{m.name} ({m.email})</div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.82rem' }}>{m.subject || 'ไม่มีหัวข้อ'}</div>
                      </div>
                    </div>
                    <div className="text-end flex-shrink-0">
                      <span className="badge bg-light text-dark border px-3 py-1 mb-1 d-block" style={{ fontSize: '0.72rem' }}>{formatSentAt(m.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

          </div>
        </div>
      </div>

      <style>{`
        .admin-field-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #475569;
          margin-bottom: 8px;
        }
        .admin-settings-grid .admin-form-group { margin-bottom: 0; }

        /* ── Status pill ──
           Uses the site's own lime/navy pair rather than Bootstrap's green, so
           "on" reads the same here as the active pill-nav tab and the front-end CTAs. */
        .admin-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 15px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 0.78rem;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
          transition: background 0.25s ease, color 0.25s ease,
                      border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .admin-status-pill.lg {
          padding: 9px 18px;
          font-size: 0.85rem;
        }
        /* Sized in em so the icon keeps its ratio in both the normal and .lg pill */
        .admin-status-pill i {
          font-size: 1.25em;
          line-height: 1;
        }

        .admin-status-pill.is-on {
          background: var(--primary, #a3d900);
          color: var(--navy, #0f172a);
          box-shadow: 0 3px 10px rgba(163, 217, 0, 0.35);
        }
        .admin-status-pill.is-off {
          background: #f1f5f9;
          color: #94a3b8;
          border-color: #e2e8f0;
        }
        .admin-status-pill.is-pending {
          background: #fff8e6;
          color: #b45309;
          border-color: #fde3a7;
        }
        .admin-status-pill.is-blocked {
          background: #fef2f2;
          color: #dc2626;
          border-color: #fecaca;
        }
      `}</style>
    </div>
  );
}


