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
  const [collapsed, setCollapsed] = useState({
    contact: false,
    map: false,
    social: false,
    mail: false,
    line: false,
  });

  const toggleSection = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

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
        // Empty credential fields mean "keep the stored ones"
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

  // Fetch the Official Account's add-friend link and render it as a QR to scan
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
      // Save first so the test uses exactly what's on screen
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
        // An empty password field means "keep the stored one"
        const updated = await mailSettingsAPI.update({ ...mail, smtpPassword: mailPassword });
        setMail(updated);
        setMailPassword('');
      }
    });
  };

  const sendTestMail = async () => {
    setTesting(true);
    try {
      // Save first so the test uses exactly what's on screen
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

  // Extract map embed src from iframe or plain URL — only allow embed URLs
  const getMapPreviewSrc = () => {
    const val = info.googleMapEmbed || '';
    if (!val.trim()) return '';
    // Extract src from iframe tag
    const match = val.match(/src="([^"]+)"/);
    const url = match ? match[1] : val.trim();
    // Only allow Google Maps embed URLs
    if (url.includes('/maps/embed') || url.includes('maps.google.com/maps?') || url.includes('google.com/maps?')) {
      return url;
    }
    return '';
  };

  const isInvalidMapUrl = () => {
    const val = (info.googleMapEmbed || '').trim();
    if (!val) return false;
    // Has content but getMapPreviewSrc returns empty = invalid URL
    return !getMapPreviewSrc();
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm sticky-top" style={{ top: '80px', zIndex: 10 }}>
        <div>
          <h3 className="fw-bold m-0 text-dark">ติดต่อเรา (Contact)</h3>
          <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>จัดการข้อมูลติดต่อ, Google Map, โซเชียลมีเดีย และดูข้อความจากลูกค้า</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={saveInfo}>
          <i className="bi bi-save"></i>บันทึกข้อมูล
        </button>
      </div>

      {/* 1. Contact Info Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          onClick={() => toggleSection('contact')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <i className="bi bi-telephone fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">ข้อมูลติดต่อพื้นฐาน</h5>
              <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>อีเมล, โทรศัพท์, ที่อยู่ของบริษัท</p>
            </div>
          </div>
          <i className={`bi bi-chevron-${collapsed.contact ? 'down' : 'up'} fs-5 text-secondary`}></i>
        </div>
        {!collapsed.contact && (
          <div className="card-body p-4">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="admin-form-group"><label>อีเมล</label><input type="email" name="email" value={info.email || ''} onChange={handleInfoChange}/></div>
              </div>
              <div className="col-md-6">
                <div className="admin-form-group"><label>โทรศัพท์</label><input type="text" name="phone" value={info.phone || ''} onChange={handleInfoChange}/></div>
              </div>
              <div className="col-12">
                <div className="admin-form-group"><label>ที่อยู่</label><textarea name="address" rows="3" value={info.address || ''} onChange={handleInfoChange}></textarea></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Google Map Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          onClick={() => toggleSection('map')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <i className="bi bi-geo-alt fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">Google Map</h5>
              <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>วาง Embed Code หรือ URL จาก Google Maps เพื่อแสดงแผนที่ในหน้าติดต่อ</p>
            </div>
          </div>
          <i className={`bi bi-chevron-${collapsed.map ? 'down' : 'up'} fs-5 text-secondary`}></i>
        </div>
        {!collapsed.map && (
          <div className="card-body p-4">
            <div className="admin-form-group mb-3">
              <label className="d-flex align-items-center gap-2">
                Google Maps Embed Code หรือ URL
                <span className="badge bg-info bg-opacity-10 text-info" style={{ fontSize: '0.65rem', fontWeight: 600 }}>วิธีใช้: เปิด Google Maps &gt; แชร์ &gt; ฝังแผนที่ &gt; คัดลอก HTML</span>
              </label>
              <textarea
                name="googleMapEmbed"
                rows="4"
                value={info.googleMapEmbed || ''}
                onChange={handleInfoChange}
                placeholder='วาง <iframe src="https://www.google.com/maps/embed?..." ...></iframe> หรือ URL ตรงๆ'
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
              ></textarea>
            </div>

            {/* Warning for invalid URL */}
            {isInvalidMapUrl() && (
              <div className="alert alert-warning border-0 rounded-3 mb-3 py-3 px-4" style={{ fontSize: '0.85rem' }}>
                <div className="d-flex align-items-start gap-2">
                  <i className="bi bi-exclamation-triangle-fill text-warning fs-5 mt-1"></i>
                  <div>
                    <strong className="d-block mb-1">URL ที่วางไม่ใช่ Embed URL ของ Google Maps</strong>
                    <p className="m-0 mb-2">คุณวาง URL ปกติ (เช่น google.com/maps/place/...) ซึ่ง Google ไม่อนุญาตให้แสดงผ่าน iframe ได้</p>
                    <div className="bg-white rounded-3 p-3 border">
                      <strong className="text-dark d-block mb-1">📌 วิธีการรับ Embed Code ที่ถูกต้อง:</strong>
                      <ol className="m-0 ps-3" style={{ lineHeight: 2 }}>
                        <li>เปิด <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer">Google Maps</a> → ค้นหาสถานที่</li>
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
              <div>
                <label className="fw-bold mb-2 text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-eye text-primary"></i> ตัวอย่างแผนที่ (Preview)
                </label>
                <div className="rounded-4 overflow-hidden border shadow-sm" style={{ height: '300px' }}>
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
        )}
      </div>

      {/* 3. Social Media Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          onClick={() => toggleSection('social')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <i className="bi bi-share fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">โซเชียลมีเดีย (Social Media)</h5>
              <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>Facebook, LINE, Instagram — เปิด/ปิดแสดงผลได้แต่ละช่องทาง</p>
            </div>
          </div>
          <i className={`bi bi-chevron-${collapsed.social ? 'down' : 'up'} fs-5 text-secondary`}></i>
        </div>
        {!collapsed.social && (
          <div className="card-body p-4">
            <div className="d-flex flex-column gap-4">
              {/* Facebook */}
              <div className="bg-light rounded-4 p-4 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: '#1877f2', color: '#fff' }}>
                      <i className="bi bi-facebook fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold m-0">Facebook</h6>
                      <small className="text-muted">ลิงก์เพจ Facebook ของบริษัท</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-pill px-2 py-1 ${info.showFacebook ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                      {info.showFacebook ? 'แสดง' : 'ซ่อน'}
                    </span>
                    <div className="form-check form-switch fs-5 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={info.showFacebook || false} onChange={() => handleToggleField('showFacebook')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group mb-0">
                  <input type="url" name="facebook" value={info.facebook || ''} onChange={handleInfoChange} placeholder="https://www.facebook.com/yourpage" disabled={!info.showFacebook} />
                </div>
              </div>

              {/* LINE */}
              <div className="bg-light rounded-4 p-4 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: '#06c755', color: '#fff' }}>
                      <i className="bi bi-line fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold m-0">LINE</h6>
                      <small className="text-muted">LINE ID หรือลิงก์ LINE Official Account</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-pill px-2 py-1 ${info.showLine ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                      {info.showLine ? 'แสดง' : 'ซ่อน'}
                    </span>
                    <div className="form-check form-switch fs-5 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={info.showLine || false} onChange={() => handleToggleField('showLine')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group mb-0">
                  <input type="text" name="lineId" value={info.lineId || ''} onChange={handleInfoChange} placeholder="@yourlineid หรือ https://line.me/R/ti/p/~@yourlineid" disabled={!info.showLine} />
                </div>
              </div>

              {/* Instagram */}
              <div className="bg-light rounded-4 p-4 border">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 38, height: 38, background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff' }}>
                      <i className="bi bi-instagram fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold m-0">Instagram</h6>
                      <small className="text-muted">ลิงก์โปรไฟล์ Instagram ของบริษัท</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-pill px-2 py-1 ${info.showInstagram ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                      {info.showInstagram ? 'แสดง' : 'ซ่อน'}
                    </span>
                    <div className="form-check form-switch fs-5 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={info.showInstagram || false} onChange={() => handleToggleField('showInstagram')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                <div className="admin-form-group mb-0">
                  <input type="url" name="instagram" value={info.instagram || ''} onChange={handleInfoChange} placeholder="https://www.instagram.com/yourprofile" disabled={!info.showInstagram} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Email notification settings */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          onClick={() => toggleSection('mail')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <i className="bi bi-bell fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">แจ้งเตือนทางอีเมล</h5>
              <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่งอีเมลหาคุณทุกครั้งที่มีคนกรอกฟอร์มติดต่อ</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            {mail && (
              <span className={`badge rounded-pill px-3 py-2 ${mail.isReady ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {mail.isReady ? 'เปิดใช้งานอยู่' : 'ยังไม่เปิดใช้งาน'}
              </span>
            )}
            <i className={`bi bi-chevron-${collapsed.mail ? 'down' : 'up'} fs-5 text-secondary`}></i>
          </div>
        </div>

        {!collapsed.mail && (
          <div className="card-body p-4">
            {!mail ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" style={{ width: 28, height: 28 }}></div>
                <div className="text-muted mt-2 small">กำลังโหลดการตั้งค่า...</div>
              </div>
            ) : (
              <>
                {/* Last send result — answers "did it actually reach my inbox?" */}
                {mail.lastStatus && (
                  <div
                    className={`alert border-0 rounded-3 d-flex align-items-start gap-3 py-3 px-4 ${mail.lastStatus === 'success' ? 'alert-success' : 'alert-danger'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <i className={`bi ${mail.lastStatus === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
                    <div>
                      <strong className="d-block mb-1">
                        {mail.lastStatus === 'success' ? 'ส่งอีเมลสำเร็จล่าสุด' : 'ส่งอีเมลไม่สำเร็จล่าสุด'}
                        {mail.lastSentAt && <span className="fw-normal ms-2 opacity-75">{formatSentAt(mail.lastSentAt)}</span>}
                      </strong>
                      {mail.lastStatus === 'error'
                        ? <span>{mail.lastError}</span>
                        : <span className="opacity-75">ระบบส่งอีเมลออกไปได้ตามปกติ</span>}
                    </div>
                  </div>
                )}

                {/* Master switch */}
                <div className="bg-light rounded-4 p-3 px-4 border d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h6 className="fw-bold m-0">เปิดการแจ้งเตือน</h6>
                    <small className="text-muted">ปิดไว้ได้ ข้อความยังถูกบันทึกในกล่องข้อความเหมือนเดิม</small>
                  </div>
                  <div className="form-check form-switch fs-5 m-0">
                    <input className="form-check-input" type="checkbox" role="switch"
                      checked={!!mail.enabled}
                      onChange={() => handleMailChange('enabled', !mail.enabled)}
                      style={{ cursor: 'pointer' }} />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label>ส่งการแจ้งเตือนไปที่อีเมล * <span className="fw-normal text-muted">(หลายอีเมลคั่นด้วยจุลภาค)</span></label>
                      <input type="text" value={mail.toEmail || ''} placeholder="you@example.com, team@example.com"
                        onChange={e => handleMailChange('toEmail', e.target.value)} />
                    </div>
                  </div>

                  {/* Provider presets */}
                  <div className="col-12">
                    <label className="d-block" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                      เลือกผู้ให้บริการเพื่อกรอกค่าอัตโนมัติ
                    </label>
                    <div className="d-flex flex-wrap gap-2 mb-1">
                      {SMTP_PRESETS.map(preset => (
                        <button key={preset.label} type="button"
                          className={`btn btn-sm rounded-3 border px-3 ${mail.smtpHost === preset.host ? 'btn-primary fw-bold' : 'btn-light text-muted'}`}
                          onClick={() => applyPreset(preset)}>
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    {SMTP_PRESETS.find(p => p.host === mail.smtpHost)?.hint && (
                      <div className="alert alert-warning border-0 rounded-3 mt-2 mb-0 py-2 px-3" style={{ fontSize: '0.8rem' }}>
                        <i className="bi bi-info-circle me-1"></i>
                        {SMTP_PRESETS.find(p => p.host === mail.smtpHost).hint}
                      </div>
                    )}
                  </div>

                  <div className="col-md-8">
                    <div className="admin-form-group">
                      <label>SMTP Host *</label>
                      <input type="text" value={mail.smtpHost || ''} placeholder="smtp.gmail.com"
                        onChange={e => handleMailChange('smtpHost', e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="admin-form-group">
                      <label>พอร์ต *</label>
                      <input type="number" value={mail.smtpPort ?? 587}
                        onChange={e => handleMailChange('smtpPort', e.target.value)} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>ชื่อผู้ใช้ SMTP</label>
                      <input type="text" value={mail.smtpUser || ''} placeholder="you@gmail.com"
                        autoComplete="off"
                        onChange={e => handleMailChange('smtpUser', e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>
                        รหัสผ่าน / App Password
                        {mail.hasPassword && <span className="badge bg-success bg-opacity-10 text-success ms-2" style={{ fontSize: '0.65rem' }}>บันทึกไว้แล้ว</span>}
                      </label>
                      <input type="password" value={mailPassword}
                        placeholder={mail.hasPassword ? 'เว้นว่างไว้ = ใช้รหัสเดิม' : 'กรอกรหัสผ่าน'}
                        autoComplete="new-password"
                        onChange={e => setMailPassword(e.target.value)} />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>อีเมลผู้ส่ง *</label>
                      <input type="email" value={mail.fromEmail || ''} placeholder="you@gmail.com"
                        onChange={e => handleMailChange('fromEmail', e.target.value)} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>ชื่อผู้ส่งที่แสดง</label>
                      <input type="text" value={mail.fromName || ''} placeholder="เว็บไซต์บริษัท"
                        onChange={e => handleMailChange('fromName', e.target.value)} />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="admin-form-group mb-0">
                      <label>URL เว็บไซต์ <span className="fw-normal text-muted">(ใช้สร้างปุ่ม &quot;เปิดดูข้อความในระบบจัดการ&quot; ในอีเมล)</span></label>
                      <input type="url" value={mail.siteUrl || ''} placeholder="http://localhost:5173"
                        onChange={e => handleMailChange('siteUrl', e.target.value)} />
                    </div>
                    {!mail.siteUrl?.trim() ? (
                      <div className="alert alert-warning border-0 rounded-3 mt-2 mb-0 py-2 px-3" style={{ fontSize: '0.8rem' }}>
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        ยังไม่ได้ใส่ — อีเมลจะแสดงปุ่ม &quot;ตอบกลับลูกค้าทางอีเมล&quot; แทนปุ่มลิงก์เข้าระบบจัดการ
                      </div>
                    ) : (
                      <div className="text-muted mt-2" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-link-45deg me-1"></i>
                        ปุ่มในอีเมลจะลิงก์ไปที่ <code>{mail.siteUrl.replace(/\/$/, '')}/admin/messages/<span className="text-muted">(เลขข้อความ)</span></code>
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" id="mail-tls"
                        checked={!!mail.useTls}
                        onChange={() => handleMailChange('useTls', !mail.useTls)}
                        style={{ cursor: 'pointer' }} />
                      <label className="form-check-label" htmlFor="mail-tls" style={{ fontSize: '0.85rem' }}>
                        ใช้การเข้ารหัส STARTTLS <span className="text-muted">(พอร์ต 587 ควรเปิด — พอร์ต 465 ระบบจะใช้ SSL ให้อัตโนมัติ)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
                  <button className="btn btn-primary fw-bold px-4 rounded-3 d-flex align-items-center gap-2" onClick={saveMail}>
                    <i className="bi bi-save"></i>บันทึกการตั้งค่าอีเมล
                  </button>
                  <button className="btn btn-light border fw-bold px-4 rounded-3 d-flex align-items-center gap-2"
                    onClick={sendTestMail} disabled={testing}>
                    {testing
                      ? (<><span className="spinner-border spinner-border-sm"></span>กำลังส่ง...</>)
                      : (<><i className="bi bi-send-check"></i>บันทึกแล้วส่งอีเมลทดสอบ</>)}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 5. LINE notification settings */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          onClick={() => toggleSection('line')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, background: '#06c755', color: '#fff' }}>
              <i className="bi bi-line fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">แจ้งเตือนทาง LINE</h5>
              <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่งข้อความเดียวกับอีเมลเข้า LINE ของผู้รับที่เลือกไว้</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            {line && (
              <span className={`badge rounded-pill px-3 py-2 ${line.isReady ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                {line.isReady ? `เปิดใช้งาน · ผู้รับ ${line.activeRecipients} คน` : 'ยังไม่เปิดใช้งาน'}
              </span>
            )}
            <i className={`bi bi-chevron-${collapsed.line ? 'down' : 'up'} fs-5 text-secondary`}></i>
          </div>
        </div>

        {!collapsed.line && (
          <div className="card-body p-4">
            {!line ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" style={{ width: 28, height: 28 }}></div>
                <div className="text-muted mt-2 small">กำลังโหลดการตั้งค่า...</div>
              </div>
            ) : (
              <>
                {line.lastStatus && (
                  <div className={`alert border-0 rounded-3 d-flex align-items-start gap-3 py-3 px-4 ${line.lastStatus === 'success' ? 'alert-success' : 'alert-danger'}`} style={{ fontSize: '0.85rem' }}>
                    <i className={`bi ${line.lastStatus === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} fs-5`}></i>
                    <div>
                      <strong className="d-block mb-1">
                        {line.lastStatus === 'success' ? 'ส่ง LINE สำเร็จล่าสุด' : 'ส่ง LINE ไม่สำเร็จล่าสุด'}
                        {line.lastSentAt && <span className="fw-normal ms-2 opacity-75">{formatSentAt(line.lastSentAt)}</span>}
                      </strong>
                      {line.lastError ? <span>{line.lastError}</span> : <span className="opacity-75">ระบบส่งข้อความออกไปได้ตามปกติ</span>}
                    </div>
                  </div>
                )}

                <div className="bg-light rounded-4 p-3 px-4 border d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h6 className="fw-bold m-0">เปิดการแจ้งเตือน LINE</h6>
                    <small className="text-muted">ทำงานแยกจากอีเมล เปิดพร้อมกันหรืออย่างใดอย่างหนึ่งก็ได้</small>
                  </div>
                  <div className="form-check form-switch fs-5 m-0">
                    <input className="form-check-input" type="checkbox" role="switch"
                      checked={!!line.enabled}
                      onChange={() => handleLineChange('enabled', !line.enabled)}
                      style={{ cursor: 'pointer' }} />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label>
                        Channel Access Token *
                        {line.hasAccessToken && <span className="badge bg-success bg-opacity-10 text-success ms-2" style={{ fontSize: '0.65rem' }}>บันทึกไว้แล้ว</span>}
                      </label>
                      <input type="password" value={lineToken} autoComplete="new-password"
                        placeholder={line.hasAccessToken ? 'เว้นว่างไว้ = ใช้ค่าเดิม' : 'วาง Channel access token (long-lived)'}
                        onChange={e => setLineToken(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label>
                        Channel Secret <span className="fw-normal text-muted">(ใส่เมื่อจะใช้ webhook ให้คนแอดบอทแล้วขึ้นรายชื่อเอง)</span>
                        {line.hasChannelSecret && <span className="badge bg-success bg-opacity-10 text-success ms-2" style={{ fontSize: '0.65rem' }}>บันทึกไว้แล้ว</span>}
                      </label>
                      <input type="password" value={lineSecret} autoComplete="new-password"
                        placeholder={line.hasChannelSecret ? 'เว้นว่างไว้ = ใช้ค่าเดิม' : 'วาง Channel secret'}
                        onChange={e => setLineSecret(e.target.value)} />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="admin-form-group mb-0">
                      <label>URL เว็บไซต์ <span className="fw-normal text-muted">(ใช้สร้างปุ่มลิงก์ในข้อความ LINE)</span></label>
                      <input type="url" value={line.siteUrl || ''} placeholder="http://localhost:5173"
                        onChange={e => handleLineChange('siteUrl', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Webhook URL to paste into the LINE Developers console */}
                <div className="bg-light rounded-4 p-3 px-4 border mt-3">
                  <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-link-45deg me-1"></i>Webhook URL (ไม่บังคับ)
                  </div>
                  <p className="text-muted m-0 mb-2" style={{ fontSize: '0.78rem' }}>
                    นำไปวางใน LINE Developers → Messaging API → Webhook URL แล้วเปิด &quot;Use webhook&quot;
                    เพื่อให้คนที่แอดบอทขึ้นในรายชื่อผู้รับอัตโนมัติ (ต้องเป็น HTTPS ที่เข้าถึงจากภายนอกได้)
                  </p>
                  <code className="d-block bg-white border rounded-3 p-2" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {(line.siteUrl || 'https://your-backend-domain').replace(/\/$/, '')}/api/line/webhook
                  </code>
                </div>

                {/* ── Self-registration: scan the QR, type the code ── */}
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold m-0 text-dark">วิธีเพิ่มผู้รับแจ้งเตือน</h6>
                  <small className="text-muted d-block mb-3">ส่ง QR และรหัสนี้ให้ทีมงาน — เขาลงทะเบียนเองได้เลย</small>

                  <div className="row g-3 align-items-stretch">
                    <div className="col-md-5">
                      <div className="border rounded-4 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center">
                        {qrDataUrl ? (
                          <>
                            <img src={qrDataUrl} alt="QR เพิ่มเพื่อน LINE" style={{ width: 160, height: 160 }} />
                            <div className="fw-bold text-dark mt-2" style={{ fontSize: '0.85rem' }}>{botInfo?.displayName}</div>
                            <a href={botInfo?.addFriendUrl} target="_blank" rel="noopener noreferrer"
                              className="text-decoration-none" style={{ fontSize: '0.75rem' }}>
                              {botInfo?.basicId}
                            </a>
                          </>
                        ) : (
                          <>
                            <i className="bi bi-qr-code text-muted" style={{ fontSize: '2.5rem', opacity: 0.4 }}></i>
                            <p className="text-muted mt-2 mb-2" style={{ fontSize: '0.8rem' }}>
                              {botInfoError || 'กดเพื่อดึง QR ของบัญชี LINE'}
                            </p>
                            <button className="btn btn-light border btn-sm rounded-3" onClick={loadBotInfo}
                              disabled={!line.hasAccessToken}>
                              <i className="bi bi-arrow-clockwise me-1"></i>ดึง QR
                            </button>
                            {!line.hasAccessToken && (
                              <small className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>ต้องบันทึก Access Token ก่อน</small>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="col-md-7">
                      <div className="border rounded-4 h-100 p-3 px-4 d-flex flex-column justify-content-center">
                        <div className="text-muted mb-1" style={{ fontSize: '0.78rem', fontWeight: 700 }}>รหัสลงทะเบียน</div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <span className="fw-bold text-dark" style={{ fontSize: '1.9rem', letterSpacing: '5px', fontFamily: 'monospace' }}>
                            {line.registerCode || '------'}
                          </span>
                          <button className="btn btn-light border btn-sm rounded-3" onClick={regenerateCode} title="สร้างรหัสใหม่">
                            <i className="bi bi-arrow-repeat"></i>
                          </button>
                        </div>
                        <ol className="text-muted m-0 ps-3" style={{ fontSize: '0.82rem', lineHeight: 2 }}>
                          <li>ให้ทีมงานสแกน QR เพื่อแอดบัญชีเป็นเพื่อน</li>
                          <li>พิมพ์รหัส <strong className="text-dark">{line.registerCode || '------'}</strong> ส่งในแชท</li>
                          <li>บอทตอบยืนยัน แล้วชื่อจะขึ้นด้านล่างอัตโนมัติ</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {!line.hasChannelSecret && (
                    <div className="alert alert-warning border-0 rounded-3 mt-3 mb-0 py-2 px-3" style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      วิธีนี้ต้องตั้ง <strong>Channel Secret</strong> และ <strong>Webhook URL</strong> ด้านบนก่อน ไม่งั้นบอทจะไม่รู้ว่ามีคนพิมพ์รหัสเข้ามา
                    </div>
                  )}
                </div>

                {/* ── Recipient list ── */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div>
                      <h6 className="fw-bold m-0 text-dark">
                        รายชื่อผู้รับ
                        {line.pendingRecipients > 0 && (
                          <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill ms-2" style={{ fontSize: '0.68rem' }}>
                            รออนุมัติ {line.pendingRecipients}
                          </span>
                        )}
                      </h6>
                      <small className="text-muted">เฉพาะคนที่ติ๊กไว้เท่านั้นที่จะได้รับข้อความ</small>
                    </div>
                    <button className="btn btn-light border btn-sm rounded-3 d-flex align-items-center gap-2" onClick={refreshLine}>
                      <i className="bi bi-arrow-clockwise"></i>รีเฟรช
                    </button>
                  </div>

                  {lineRecipients.length === 0 ? (
                    <div className="text-center text-muted border rounded-4 py-4" style={{ fontSize: '0.85rem' }}>
                      <i className="bi bi-person-plus d-block fs-3 mb-2 opacity-50"></i>
                      ยังไม่มีใครลงทะเบียน
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {lineRecipients.map(r => (
                        <div key={r.id}
                          className="d-flex align-items-center gap-3 border rounded-4 p-2 px-3"
                          style={{ background: r.isActive ? 'rgba(163,217,0,0.06)' : '#fff' }}>
                          <div className="form-check m-0">
                            <input className="form-check-input" type="checkbox" checked={r.isActive}
                              onChange={() => toggleLineRecipient(r)}
                              title={r.isActive ? 'กำลังรับแจ้งเตือน' : 'ยังไม่ได้รับแจ้งเตือน'}
                              style={{ cursor: 'pointer', width: 18, height: 18 }} />
                          </div>
                          {r.pictureUrl
                            ? <img src={r.pictureUrl} alt="" className="rounded-circle flex-shrink-0" style={{ width: 36, height: 36, objectFit: 'cover' }} />
                            : <div className="rounded-circle bg-light border d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 36, height: 36 }}>
                                <i className="bi bi-person text-muted"></i>
                              </div>}
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>{r.displayName}</div>
                            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>{r.lineUserId}</div>
                          </div>
                          {r.isBlocked ? (
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 flex-shrink-0" style={{ fontSize: '0.68rem' }}>บล็อกบอท</span>
                          ) : (
                            <span className={`badge rounded-pill px-2 py-1 flex-shrink-0 ${r.isActive ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ fontSize: '0.68rem' }}>
                              {r.isActive ? 'รับแจ้งเตือน' : 'รออนุมัติ'}
                            </span>
                          )}
                          <button className="btn btn-sm btn-light border text-danger rounded-3 flex-shrink-0"
                            onClick={() => deleteLineRecipient(r)} title="ลบผู้รับ">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Manual entry stays available for setups without a webhook */}
                  <button className="btn btn-link btn-sm text-muted text-decoration-none px-0 mt-2"
                    onClick={() => setShowManualAdd(v => !v)}>
                    <i className={`bi bi-chevron-${showManualAdd ? 'up' : 'down'} me-1`}></i>
                    เพิ่มด้วย LINE User ID เอง (กรณียังไม่ได้ตั้ง webhook)
                  </button>
                  {showManualAdd && (
                    <div className="d-flex gap-2 mt-1">
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

                <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
                  <button className="btn btn-primary fw-bold px-4 rounded-3 d-flex align-items-center gap-2" onClick={saveLine}>
                    <i className="bi bi-save"></i>บันทึกการตั้งค่า LINE
                  </button>
                  <button className="btn btn-light border fw-bold px-4 rounded-3 d-flex align-items-center gap-2"
                    onClick={sendTestLine} disabled={lineTesting}>
                    {lineTesting
                      ? (<><span className="spinner-border spinner-border-sm"></span>กำลังส่ง...</>)
                      : (<><i className="bi bi-send-check"></i>บันทึกแล้วส่งข้อความทดสอบ</>)}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 6. Inbox shortcut — the messages themselves live on their own page now */}
      <Link
        to="/admin/messages"
        className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden text-decoration-none d-block"
      >
        <div className="card-body p-4 d-flex align-items-center gap-3">
          <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 40, height: 40 }}>
            <i className="bi bi-envelope fs-5"></i>
          </div>
          <div className="flex-grow-1">
            <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
              กล่องข้อความ (Inbox)
              {unreadCount > 0 && <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.7rem' }}>{unreadCount} ใหม่</span>}
            </h5>
            <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>
              ดูข้อความที่ส่งมาจากฟอร์มในหน้าติดต่อ — ทั้งหมด {messages.length} รายการ
            </p>
          </div>
          <i className="bi bi-arrow-right fs-5 text-secondary flex-shrink-0"></i>
        </div>
      </Link>
    </div>
  );
}
