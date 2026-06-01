import { useState, useCallback, useEffect } from 'react';
import { homeConfigAPI, serviceAPI, clientAPI } from '../../api';
import ImageUploader from '../../components/admin/ImageUploader';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

export default function AdminHomeConfig() {
  const [config, setConfig] = useState({ showAbout: true, showServices: true, showWhyUs: true, showStats: true, showCustomers: true, showCTA: true, selectedServices: [], servicesLimit: 4, customersRows: 3, selectedClients: [], aboutSections: [], navbarConfig: { home: true, about: true, team: true, services: true, gallery: true, clients: true, blog: true, contact: true } });
  const [allServices, setAllServices] = useState([]);
  const [allClients, setAllClients] = useState([]);

  useEffect(() => {
    homeConfigAPI.get().then(d => {
      // Auto-migrate legacy aboutSection to array if needed
      let sections = d.aboutSections || [];
      if (!d.aboutSections && d.aboutSection && Object.keys(d.aboutSection).length > 0) {
        sections = [d.aboutSection];
      }
      setConfig(prev => ({ ...prev, ...d, aboutSections: sections }));
    }).catch(() => {});
    serviceAPI.list().then(d => setAllServices(d)).catch(() => {});
    clientAPI.list().then(d => setAllClients(d)).catch(() => {});
  }, []);

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });
  
  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);

  const handleToggle = (key) => setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  const handleChange = (e) => setConfig(prev => ({ ...prev, [e.target.name]: parseInt(e.target.value) || 0 }));
  
  const handleServiceSelect = (id) => setConfig(prev => { const s = prev.selectedServices || []; return { ...prev, selectedServices: s.includes(id) ? s.filter(sid => sid !== id) : [...s, id] }; });
  const handleClientSelect = (id) => setConfig(prev => { const s = prev.selectedClients || []; return { ...prev, selectedClients: s.includes(id) ? s.filter(sid => sid !== id) : [...s, id] }; });
  const handleSelectAllClients = () => { const a = allClients.map(c => c.id); setConfig(prev => ({ ...prev, selectedClients: a.every(id => (prev.selectedClients || []).includes(id)) ? [] : a })); };

  // --- About Sections Handlers ---
  const handleAddAboutSection = () => {
    setConfig(prev => ({ ...prev, aboutSections: [...(prev.aboutSections || []), { title: 'New About Section', listItems: [] }] }));
  };
  const handleRemoveAboutSection = (index) => {
    setConfirm({ show: true, type: 'danger', title: 'ลบ Section', message: `ยืนยันการลบ About Us Section ที่ ${index + 1}?`, action: async () => {
      setConfig(prev => { const s = [...(prev.aboutSections || [])]; s.splice(index, 1); return { ...prev, aboutSections: s }; });
    }});
  };
  const handleMoveAboutSection = (index, dir) => {
    setConfig(prev => {
      const s = [...(prev.aboutSections || [])];
      if (dir === -1 && index > 0) [s[index - 1], s[index]] = [s[index], s[index - 1]];
      else if (dir === 1 && index < s.length - 1) [s[index + 1], s[index]] = [s[index], s[index + 1]];
      return { ...prev, aboutSections: s };
    });
  };
  const updateAboutSection = (index, field, value) => {
    setConfig(prev => { const s = [...(prev.aboutSections || [])]; s[index] = { ...s[index], [field]: value }; return { ...prev, aboutSections: s }; });
  };
  const updateAboutList = (sIndex, lIndex, value) => {
    setConfig(prev => { const s = [...(prev.aboutSections || [])]; const l = [...(s[sIndex].listItems || [])]; l[lIndex] = value; s[sIndex] = { ...s[sIndex], listItems: l }; return { ...prev, aboutSections: s }; });
  };
  const addAboutList = (sIndex) => {
    setConfig(prev => { const s = [...(prev.aboutSections || [])]; s[sIndex] = { ...s[sIndex], listItems: [...(s[sIndex].listItems || []), ''] }; return { ...prev, aboutSections: s }; });
  };
  const removeAboutList = (sIndex, lIndex) => {
    setConfig(prev => { const s = [...(prev.aboutSections || [])]; const l = [...(s[sIndex].listItems || [])]; l.splice(lIndex, 1); s[sIndex] = { ...s[sIndex], listItems: l }; return { ...prev, aboutSections: s }; });
  };

  const [activeSection, setActiveSection] = useState('navbar');
  const [expandedAboutIndex, setExpandedAboutIndex] = useState(0); // Track which accordion is open

  const sections = [
    { key: 'navbar', label: 'เมนูนำทาง', sublabel: 'Navbar', icon: 'bi-signpost-split', color: '#0a0f0d' },
    { key: 'about', label: 'เกี่ยวกับเรา', sublabel: 'About Us', icon: 'bi-info-circle', color: '#a3d900', toggle: 'showAbout' },
    { key: 'services', label: 'บริการของเรา', sublabel: 'Services', icon: 'bi-briefcase', color: '#198754', toggle: 'showServices' },
    { key: 'whyUs', label: 'ทำไมต้องเลือกเรา', sublabel: 'Why Choose Us', icon: 'bi-star', color: '#ffc107', toggle: 'showWhyUs' },
    { key: 'stats', label: 'แถบสถิติ', sublabel: 'Stats Bar', icon: 'bi-bar-chart-steps', color: '#0dcaf0', toggle: 'showStats' },
    { key: 'customers', label: 'ลูกค้าของเรา', sublabel: 'Customers', icon: 'bi-building', color: '#6c757d', toggle: 'showCustomers' },
    { key: 'cta', label: 'ป้ายประกาศ', sublabel: 'Call to Action', icon: 'bi-megaphone', color: '#dc3545', toggle: 'showCTA' },
  ];

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 bg-white p-3 px-4 rounded-4 shadow-sm">
        <div>
          <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-sliders2 text-primary"></i>
            จัดการหน้าแรก
          </h4>
          <p className="text-muted m-0" style={{ fontSize: '0.8rem' }}>เปิด/ปิด และกำหนดข้อมูลที่จะแสดงในแต่ละส่วนของหน้า Home</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift" onClick={() => setConfirm({ show: true, type: 'info', title: 'บันทึกการตั้งค่า', message: 'ยืนยันบันทึกการตั้งค่าหน้าแรก?', action: async () => { await homeConfigAPI.update(config); } })}>
          <i className="bi bi-save"></i>บันทึก
        </button>
      </div>

      {/* ===== TOP: Horizontal Pill Navigator ===== */}
      <div className="mb-4 admin-pill-nav hide-scrollbar">
        {sections.map(s => {
          const isActive = activeSection === s.key;
          const isEnabled = s.toggle ? config[s.toggle] : true;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 flex-shrink-0 fw-bold admin-pill-item ${isActive ? 'active' : ''}`}
              style={{ color: isActive ? 'var(--navy)' : '#64748b' }}
            >
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.1rem' }}></i>
              {s.label}
              {s.toggle && (
                <span className="badge rounded-pill ms-1" style={{ fontSize: '.65rem', padding: '4px 8px', background: isEnabled ? (isActive ? 'var(--navy)' : '#e2e8f0') : 'transparent', color: isEnabled ? (isActive ? 'var(--primary)' : '#64748b') : '#94a3b8', border: isEnabled ? 'none' : '1px solid #cbd5e1' }}>
                  {isEnabled ? 'ON' : 'OFF'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="row">
        {/* ===== MAIN: Section Detail Panel ===== */}
        <div className="col-12">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 anim-slide-up" key={activeSection} style={{ minHeight: '500px' }}>

            {/* ---- Navbar Section ---- */}
            {activeSection === 'navbar' && (
              <div>
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: '#0a0f0d15' }}>
                      <i className="bi bi-signpost-split fs-4" style={{ color: '#0a0f0d' }}></i>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark">เมนูนำทาง (Navbar)</h5>
                      <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>เปิด/ปิด เมนูที่แสดงบน Navbar ฝั่งหน้าบ้าน</p>
                    </div>
                  </div>
                </div>
                <div className="alert alert-light border rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                  <i className="bi bi-info-circle-fill text-primary"></i>
                  <span>เมนูที่ปิดจะไม่แสดงใน Navbar ฝั่งหน้าบ้าน แต่ผู้ใช้ยังสามารถเข้าถึงผ่าน URL โดยตรงได้</span>
                </div>
                <div className="row g-3">
                  {[
                    { key: 'home', label: 'HOME', icon: 'bi-house-door', path: '/', locked: true },
                    { key: 'about', label: 'ABOUT US', icon: 'bi-info-circle', path: '/about' },
                    { key: 'team', label: 'TEAM', icon: 'bi-people', path: '/team' },
                    { key: 'services', label: 'SERVICES', icon: 'bi-briefcase', path: '/services' },
                    { key: 'gallery', label: 'GALLERY', icon: 'bi-images', path: '/gallery' },
                    { key: 'clients', label: 'CLIENTS', icon: 'bi-building', path: '/clients' },
                    { key: 'blog', label: 'BLOG', icon: 'bi-journal-text', path: '/blog' },
                    { key: 'contact', label: 'CONTACT US', icon: 'bi-envelope', path: '/contact' },
                  ].map(item => {
                    const navCfg = config.navbarConfig || {};
                    const isEnabled = navCfg[item.key] !== false;
                    return (
                      <div key={item.key} className="col-6 col-md-4 col-lg-3 anim-slide-up-delay-1">
                        <div
                          className="p-3 rounded-4 border text-center d-flex flex-column align-items-center justify-content-center admin-grid-item-hover"
                          style={{
                            transition: 'all 0.25s ease',
                            borderColor: isEnabled ? 'var(--primary)' : '#e2e8f0',
                            borderWidth: isEnabled ? '2px' : '1px',
                            background: isEnabled ? 'rgba(163,217,0,0.05)' : '#f8fafc',
                            opacity: isEnabled ? 1 : 0.55,
                            minHeight: '110px',
                          }}
                        >
                          <i className={`bi ${item.icon} fs-4 mb-2 ${isEnabled ? 'text-primary' : 'text-secondary'}`}></i>
                          <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.82rem' }}>{item.label}</div>
                          <div className="text-muted mb-2" style={{ fontSize: '0.65rem' }}>{item.path}</div>
                          {item.locked ? (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.65rem' }}>
                              <i className="bi bi-lock-fill me-1"></i>ล็อกเปิดเสมอ
                            </span>
                          ) : (
                            <div className="form-check form-switch m-0">
                              <input className="form-check-input" type="checkbox" role="switch" checked={isEnabled}
                                onChange={() => setConfig(prev => ({ ...prev, navbarConfig: { ...(prev.navbarConfig || {}), [item.key]: !isEnabled } }))}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- About Us Sections ---- */}
            {activeSection === 'about' && (
              <div>
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(163,217,0,0.12)' }}>
                      <i className="bi bi-info-circle fs-4 text-primary"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark">เกี่ยวกับเรา (About Us)</h5>
                      <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่วนแนะนำบริษัทด้านล่าง Hero Banner (เพิ่มได้หลาย Section แสดงสลับซ้ายขวา)</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0" onClick={e => e.stopPropagation()}>
                    <span className={`badge rounded-pill px-3 py-2 ${config.showAbout ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {config.showAbout ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                    <div className="form-check form-switch fs-4 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={config.showAbout} onChange={() => handleToggle('showAbout')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                {!config.showAbout && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}
                
                <div className="mb-4 d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold m-0">รายการ About Sections ({(config.aboutSections || []).length})</h6>
                  <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold hover-lift" onClick={handleAddAboutSection}>
                    <i className="bi bi-plus-lg me-1"></i> เพิ่ม Section ใหม่
                  </button>
                </div>

                <div className="d-flex flex-column gap-3">
                  {(config.aboutSections || []).map((section, idx) => {
                    const isExpanded = expandedAboutIndex === idx;
                    return (
                      <div key={idx} className="card border rounded-4 shadow-sm overflow-hidden">
                        {/* Accordion Header */}
                        <div 
                          className={`card-header p-3 d-flex justify-content-between align-items-center ${isExpanded ? 'bg-light border-bottom' : 'bg-white border-bottom-0'}`} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setExpandedAboutIndex(isExpanded ? -1 : idx)}
                        >
                          <div className="d-flex align-items-center gap-3">
                            <i className={`bi bi-chevron-${isExpanded ? 'up' : 'down'} text-muted`}></i>
                            <div className="fw-bold text-dark">
                              <span className="badge bg-primary bg-opacity-10 text-primary me-2">Section {idx + 1}</span>
                              {section.title || 'ไม่มีหัวข้อ'}
                            </div>
                          </div>
                          <div className="d-flex gap-2" onClick={e => e.stopPropagation()}>
                            <button className="btn btn-sm btn-light border rounded-2" disabled={idx === 0} onClick={() => handleMoveAboutSection(idx, -1)}><i className="bi bi-arrow-up"></i></button>
                            <button className="btn btn-sm btn-light border rounded-2" disabled={idx === (config.aboutSections || []).length - 1} onClick={() => handleMoveAboutSection(idx, 1)}><i className="bi bi-arrow-down"></i></button>
                            <button className="btn btn-sm btn-outline-danger rounded-2 ms-2" onClick={() => handleRemoveAboutSection(idx)}><i className="bi bi-trash"></i> ลบ</button>
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="card-body p-4 bg-white">
                            <div className="row g-4">
                              <div className="col-md-5">
                                <ImageUploader value={section.image || ''} onChange={(url) => updateAboutSection(idx, 'image', url)} label="รูปภาพประกอบ" recommendedSize="600x750px (แนวตั้ง 4:5 แบบโพลารอยด์)" aspectRatio={4/5} />
                                <div className="admin-form-group mt-3">
                                  <label>วิดีโอ YouTube/Vimeo (ถ้ามี)</label>
                                  <input type="text" className="form-control" value={section.videoUrl || ''} onChange={(e) => updateAboutSection(idx, 'videoUrl', e.target.value)} placeholder="วางลิงก์วิดีโอเพื่อแสดงปุ่ม Play บนรูป" />
                                </div>
                                <div className="row g-2 mt-2">
                                  <div className="col-6"><div className="admin-form-group"><label>ป้ายข้อความบน (เช่น เลข)</label><input type="text" className="form-control" value={section.badgeTopText || ''} onChange={(e) => updateAboutSection(idx, 'badgeTopText', e.target.value)} placeholder="14" /></div></div>
                                  <div className="col-6"><div className="admin-form-group"><label>ป้ายข้อความล่าง</label><input type="text" className="form-control" value={section.badgeBottomText || ''} onChange={(e) => updateAboutSection(idx, 'badgeBottomText', e.target.value)} placeholder="ปีแห่งความสำเร็จ" /></div></div>
                                </div>
                              </div>
                              <div className="col-md-7">
                                <div className="admin-form-group"><label>หัวข้อหลัก (Title)</label><input type="text" className="form-control" value={section.title || ''} onChange={(e) => updateAboutSection(idx, 'title', e.target.value)} placeholder="เปลี่ยนทุกไอเดียให้เป็นความประทับใจไปกับ 108" /></div>
                                <div className="admin-form-group"><label>คำอธิบาย (Description)</label><textarea className="form-control" rows="6" value={section.description || ''} onChange={(e) => updateAboutSection(idx, 'description', e.target.value)} placeholder="ข้อความแนะนำบริษัท..."></textarea></div>
                                <div className="admin-form-group">
                                  <label className="d-flex justify-content-between align-items-center mb-2">
                                    รายการจุดเด่น (List Items)
                                    <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.75rem' }} onClick={() => addAboutList(idx)}><i className="bi bi-plus-lg"></i> เพิ่มรายการ</button>
                                  </label>
                                  <div className="d-flex flex-column gap-2">
                                    {(section.listItems || []).map((item, lIdx) => (
                                      <div key={lIdx} className="d-flex gap-2 align-items-center">
                                        <input type="text" className="form-control form-control-sm rounded-3" value={item} onChange={(e) => updateAboutList(idx, lIdx, e.target.value)} placeholder={`รายการที่ ${lIdx + 1}`} />
                                        <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }} onClick={() => removeAboutList(idx, lIdx)}><i className="bi bi-trash"></i></button>
                                      </div>
                                    ))}
                                    {(!section.listItems || section.listItems.length === 0) && (
                                      <div className="text-muted small text-center bg-light border p-3 rounded-4">ยังไม่มีรายการ คุณสามารถกดปุ่มเพิ่มรายการด้านบนได้</div>
                                    )}
                                  </div>
                                </div>
                                <div className="row g-2 mt-2">
                                  <div className="col-6"><div className="admin-form-group"><label>ข้อความปุ่ม CTA</label><input type="text" className="form-control" value={section.buttonText || ''} onChange={(e) => updateAboutSection(idx, 'buttonText', e.target.value)} placeholder="ติดต่อร่วมงานกับเรา" /></div></div>
                                  <div className="col-6"><div className="admin-form-group"><label>ลิงก์ปุ่ม CTA</label><input type="text" className="form-control" value={section.buttonLink || ''} onChange={(e) => updateAboutSection(idx, 'buttonLink', e.target.value)} placeholder="/contact" /></div></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(!config.aboutSections || config.aboutSections.length === 0) && (
                    <div className="text-center p-5 bg-light rounded-4 border">
                      <i className="bi bi-file-earmark-plus fs-1 text-muted opacity-50 mb-3 d-block"></i>
                      <h6 className="fw-bold text-dark">ยังไม่มี Section</h6>
                      <p className="text-muted small">คลิก "เพิ่ม Section ใหม่" เพื่อสร้างเนื้อหาเกี่ยวกับเรา</p>
                      <button className="btn btn-primary rounded-pill px-4 mt-2" onClick={handleAddAboutSection}>เพิ่ม Section</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---- Services Section ---- */}
            {activeSection === 'services' && (
              <div>
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(25,135,84,0.1)' }}>
                      <i className="bi bi-briefcase fs-4 text-success"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark">บริการของเรา (Services)</h5>
                      <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>เลือกบริการที่จะแสดงในหน้าแรก</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                    <span className={`badge rounded-pill px-2 py-1 ${config.showServices ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                      {config.showServices ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                    <div className="form-check form-switch fs-4 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={config.showServices} onChange={() => handleToggle('showServices')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                {!config.showServices && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i><span>ส่วนนี้ถูกปิดใช้งานอยู่</span>
                  </div>
                )}
                <div className="mb-3 text-muted small">* คลิกเลือกบริการที่ต้องการนำไปแสดงผลบนหน้าแรก</div>
                <div className="row g-3">
                  {allServices.map(svc => {
                    const isSelected = (config.selectedServices || []).includes(svc.id);
                    return (
                      <div key={svc.id} className="col-6 col-md-4 col-lg-3 anim-slide-up-delay-1">
                        <div onClick={() => handleServiceSelect(svc.id)} className="p-3 rounded-4 border text-center h-100 d-flex flex-column align-items-center justify-content-center position-relative admin-grid-item-hover"
                          style={{ cursor: 'pointer', transition: 'all 0.25s ease', borderColor: isSelected ? 'var(--primary)' : '#e2e8f0', borderWidth: isSelected ? '2px' : '1px', background: isSelected ? 'rgba(163,217,0,0.05)' : '#fff', boxShadow: isSelected ? '0 8px 24px rgba(163,217,0,0.08)' : 'none' }}
                        >
                          {isSelected && (<span className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center m-2 shadow" style={{ width: 22, height: 22 }}><i className="bi bi-check-lg" style={{ fontSize: '0.75rem' }}></i></span>)}
                          {svc.image ? (<img src={svc.image} alt={svc.title} className="rounded-3 mb-2 shadow-sm" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />) : (<div className="bg-light text-secondary rounded-3 mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}><i className="bi bi-image fs-5"></i></div>)}
                          <div className="fw-bold text-dark text-truncate w-100 mt-1" style={{ fontSize: '0.82rem' }}>{svc.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---- Simple Toggle Sections (Why Us, Stats, CTA) ---- */}
            {['whyUs', 'stats', 'cta'].includes(activeSection) && (() => {
              const meta = {
                whyUs: { label: 'ทำไมต้องเลือกเรา (Why Choose Us)', desc: 'ส่วนเหตุผลที่ควรใช้บริการและภาพประกอบ', icon: 'bi-star', color: '#ffc107', toggle: 'showWhyUs', info: 'ส่วนนี้จะแสดงผลอัตโนมัติโดยดึงจุดเด่นของบริษัท 3 ข้อ ไปโชว์คู่กับรูปภาพแบนเนอร์ทีมงานในหน้าแรก' },
                stats: { label: 'แถบตัวเลขสถิติ (Stats Bar)', desc: 'แถบสีเข้มแสดงตัวเลขผลงานและประสบการณ์', icon: 'bi-bar-chart-steps', color: '#0dcaf0', toggle: 'showStats', info: 'ส่วนนี้จะแสดงสถิติทั้งหมดที่สร้างขึ้น คุณสามารถจัดการได้ที่เมนู "เกี่ยวกับเรา > ตัวเลขสถิติ"' },
                cta: { label: 'ป้ายประกาศด้านล่าง (Call to Action)', desc: 'ส่วน "พร้อมเริ่มโปรเจกต์ใหม่?" ก่อนถึง Footer', icon: 'bi-megaphone', color: '#dc3545', toggle: 'showCTA', info: 'ส่วนแบนเนอร์พื้นสีไล่ระดับท้ายเพจที่จะกระตุ้นการตัดสินใจของผู้เข้าชมเพื่อกดปุ่มติดต่อ' },
              }[activeSection];
              const isEnabled = config[meta.toggle];
              return (
                <div>
                  <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      <div className="p-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: `${meta.color}18` }}>
                        <i className={`bi ${meta.icon} fs-4`} style={{ color: meta.color }}></i>
                      </div>
                      <div>
                        <h5 className="fw-bold m-0 text-dark">{meta.label}</h5>
                        <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>{meta.desc}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                      <span className={`badge rounded-pill px-3 py-2 ${isEnabled ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                        {isEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                      <div className="form-check form-switch fs-4 m-0">
                        <input className="form-check-input" type="checkbox" role="switch" checked={isEnabled} onChange={() => handleToggle(meta.toggle)} style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>
                  {!isEnabled ? (
                    <div className="alert alert-secondary border-0 rounded-3 mb-0 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                      <i className="bi bi-eye-slash-fill"></i><span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                    </div>
                  ) : (
                    <div className="bg-light rounded-4 p-4 border d-flex align-items-start gap-3">
                      <i className="bi bi-info-circle-fill text-primary mt-1"></i>
                      <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>{meta.info}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ---- Customers Section ---- */}
            {activeSection === 'customers' && (
              <div>
                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center gap-3 flex-grow-1">
                    <div className="p-2 rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 44, height: 44, background: 'rgba(108,117,125,0.1)' }}>
                      <i className="bi bi-building fs-4 text-secondary"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold m-0 text-dark">ลูกค้าของเรา (Customers / Clients)</h5>
                      <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่วนแสดงโลโก้แบรนด์ลูกค้าวิ่งสไลด์</p>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">
                    <span className={`badge rounded-pill px-3 py-2 ${config.showCustomers ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {config.showCustomers ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                    <div className="form-check form-switch fs-4 m-0">
                      <input className="form-check-input" type="checkbox" role="switch" checked={config.showCustomers} onChange={() => handleToggle('showCustomers')} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                </div>
                {!config.showCustomers && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i><span>ส่วนนี้ถูกปิดใช้งานอยู่</span>
                  </div>
                )}
                {/* Layout Settings */}
                <div className="bg-light rounded-4 p-4 mb-4 border">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2"><i className="bi bi-grid-3x3-gap text-primary"></i> ตั้งค่าเลย์เอาท์</h6>
                  <div style={{ maxWidth: '280px' }}>
                    <label className="fw-bold mb-1" style={{ fontSize: '0.85rem' }}>จำนวนแถว (Rows)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted" style={{ borderRadius: '12px 0 0 12px' }}>แสดง</span>
                      <input type="number" className="form-control text-center fw-bold text-primary" name="customersRows" value={config.customersRows || 3} onChange={handleChange} min="1" max="5" style={{ maxWidth: '70px' }} />
                      <span className="input-group-text bg-white text-muted" style={{ borderRadius: '0 12px 12px 0' }}>แถว</span>
                    </div>
                    <small className="text-muted">แต่ละแถวจะวิ่งโลโก้ทั้งหมดที่เลือกไว้ สลับทิศซ้าย-ขวาอัตโนมัติ</small>
                  </div>
                </div>
                {/* Brand Selection */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-3">
                  <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                    <i className="bi bi-check2-square text-success"></i> เลือกแบรนด์ลูกค้า
                    <span className="badge bg-primary bg-opacity-10 text-primary ms-2" style={{ fontSize: '0.7rem' }}>{(config.selectedClients || []).length} / {allClients.length}</span>
                  </h6>
                  <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 align-self-stretch align-self-sm-auto" style={{ fontSize: '0.78rem' }} onClick={handleSelectAllClients}>
                    {allClients.length > 0 && allClients.every(c => (config.selectedClients || []).includes(c.id)) ? (<><i className="bi bi-x-circle me-1"></i>ยกเลิกทั้งหมด</>) : (<><i className="bi bi-check-all me-1"></i>เลือกทั้งหมด</>)}
                  </button>
                </div>
                {allClients.length === 0 ? (
                  <div className="text-center text-muted bg-light p-4 rounded-4 border"><i className="bi bi-building fs-1 d-block mb-2 opacity-25"></i><p className="m-0">ยังไม่มีข้อมูลลูกค้า กรุณาเพิ่มที่เมนู <strong>"ลูกค้าของเรา"</strong></p></div>
                ) : (
                  <div className="row g-3">
                    {allClients.map(cli => {
                      const isSelected = (config.selectedClients || []).includes(cli.id);
                      return (
                        <div key={cli.id} className="col-6 col-md-4 col-lg-3 anim-slide-up-delay-1">
                          <div onClick={() => handleClientSelect(cli.id)} className="p-3 rounded-4 border text-center h-100 d-flex flex-column align-items-center justify-content-center position-relative admin-grid-item-hover"
                            style={{ cursor: 'pointer', transition: 'all 0.25s ease', borderColor: isSelected ? 'var(--primary)' : '#e2e8f0', borderWidth: isSelected ? '2px' : '1px', background: isSelected ? 'rgba(163,217,0,0.05)' : '#fff', boxShadow: isSelected ? '0 8px 24px rgba(163,217,0,0.08)' : 'none', minHeight: '100px' }}
                          >
                            {isSelected && (<span className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center m-2 shadow" style={{ width: 22, height: 22 }}><i className="bi bi-check-lg" style={{ fontSize: '0.75rem' }}></i></span>)}
                            {cli.logo ? (<img src={cli.logo} alt={cli.name} className="mb-2" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', background: '#f8fafc', padding: '4px' }} />) : (<div className="bg-light text-secondary rounded-3 mb-2 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}><i className="bi bi-building fs-4"></i></div>)}
                            <div className="fw-bold text-dark text-truncate w-100" style={{ fontSize: '0.78rem' }}>{cli.name}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
