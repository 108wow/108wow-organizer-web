import { useState, useCallback, useEffect } from 'react';
import { companyAPI, contactAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

export default function AdminContact() {
  const [info, setInfo] = useState({});
  const [messages, setMessages] = useState([]);
  const [collapsed, setCollapsed] = useState({
    contact: false,
    map: false,
    social: false,
    inbox: false,
  });

  const toggleSection = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  useEffect(() => {
    companyAPI.get().then(d => setInfo(d)).catch(() => {});
    contactAPI.listMessages().then(d => setMessages(d)).catch(() => {});
  }, []);
  const [viewMsg, setViewMsg] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);
  const handleInfoChange = (e) => { setInfo(p => ({ ...p, [e.target.name]: e.target.value })); };
  const handleToggleField = (field) => { setInfo(p => ({ ...p, [field]: !p[field] })); };
  const saveInfo = () => { setConfirm({ show: true, type: 'info', title: 'บันทึก', message: 'บันทึกข้อมูลติดต่อ?', action: async () => { const u = await companyAPI.update(info); setInfo(u); } }); };
  const openMsg = (msg) => { setViewMsg(msg); contactAPI.updateMessage(msg.id, { status: 'read' }).catch(() => {}); setMessages(p => p.map(m => m.id === msg.id ? { ...m, status: 'read' } : m)); };
  const deleteMsg = (msg) => { setConfirm({ show: true, type: 'danger', title: 'ลบข้อความ', message: `ลบข้อความจาก "${msg.name}" ?`, action: async () => { await contactAPI.deleteMessage(msg.id); setMessages(p => p.filter(m => m.id !== msg.id)); setViewMsg(null); } }); };

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

      {/* 4. Inbox Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div
          className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
          style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
          onClick={() => toggleSection('inbox')}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <i className="bi bi-envelope fs-5"></i>
            </div>
            <div>
              <h5 className="fw-bold m-0 text-dark">กล่องข้อความ (Inbox)</h5>
              <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ข้อความที่ส่งมาจากฟอร์มในหน้าติดต่อ</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            {messages.filter(m=>m.status==='unread').length > 0 && (
              <span className="badge bg-danger rounded-pill px-2 py-1">{messages.filter(m=>m.status==='unread').length} ใหม่</span>
            )}
            <i className={`bi bi-chevron-${collapsed.inbox ? 'down' : 'up'} fs-5 text-secondary`}></i>
          </div>
        </div>
        {!collapsed.inbox && (
          <div className="card-body p-0">
            {messages.length === 0 ? (
              <div className="text-center text-muted p-5">
                <i className="bi bi-inbox fs-1 d-block mb-2 opacity-25"></i>
                <p className="m-0">ยังไม่มีข้อความ</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle m-0">
                  <thead className="table-light"><tr><th className="px-4 py-3 border-bottom-0" style={{width:50}}>สถานะ</th><th className="py-3 border-bottom-0">จาก</th><th className="py-3 border-bottom-0">หัวข้อ</th><th className="py-3 border-bottom-0 text-end px-4" style={{width:140}}>วันที่</th></tr></thead>
                  <tbody>{messages.map(msg=>(
                    <tr key={msg.id} style={{backgroundColor:msg.status==='unread'?'#f8fafc':'transparent',cursor:'pointer'}} onClick={()=>openMsg(msg)}>
                      <td className="px-4 py-3 text-center">{msg.status==='unread'?<span className="badge bg-primary rounded-circle p-2"><span className="visually-hidden">New</span></span>:<i className="bi bi-envelope-open text-muted"></i>}</td>
                      <td className="py-3"><div className={`text-dark ${msg.status==='unread'?'fw-bold':''}`}>{msg.name}</div><div className="text-muted small">{msg.email}</div></td>
                      <td className="py-3">{msg.subject}</td>
                      <td className="py-3 text-end px-4 text-muted small">{msg.date}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalBackdrop show={!!viewMsg} onClose={() => setViewMsg(null)}>
            <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold m-0">ข้อความ</h5><button onClick={()=>setViewMsg(null)} style={{background:'none',border:'none',fontSize:'1.3rem',color:'#94a3b8',cursor:'pointer'}}><i className="bi bi-x-lg"></i></button></div>
            {viewMsg && (<>
            <div className="mb-3 pb-3 border-bottom">
              <div className="fw-bold text-dark">{viewMsg.name} <span className="text-muted fw-normal small">({viewMsg.email})</span></div>
              <div className="text-muted small"><i className="bi bi-calendar3 me-1"></i>{viewMsg.date}</div>
            </div>
            <h6 className="fw-bold mb-2">{viewMsg.subject}</h6>
            <p className="text-muted" style={{lineHeight:1.8}}>{viewMsg.body}</p>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button className="btn btn-outline-danger rounded-3 px-4" onClick={()=>deleteMsg(viewMsg)}><i className="bi bi-trash me-2"></i>ลบ</button>
              <a href={`mailto:${viewMsg.email}`} className="btn btn-primary rounded-3 px-4"><i className="bi bi-reply me-2"></i>ตอบกลับ</a>
            </div>
            </>)}
      </ModalBackdrop>
    </div>
  );
}
