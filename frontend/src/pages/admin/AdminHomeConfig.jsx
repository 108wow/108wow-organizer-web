import { useState, useCallback, useEffect } from 'react';
import { homeConfigAPI, serviceAPI, clientAPI } from '../../api';
import ImageUploader from '../../components/admin/ImageUploader';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

export default function AdminHomeConfig() {
  const [config, setConfig] = useState({ showAbout: true, showServices: true, showWhyUs: true, showStats: true, showCustomers: true, showCTA: true, selectedServices: [], servicesLimit: 4, customersRows: 3, selectedClients: [], aboutSection: {} });
  const [allServices, setAllServices] = useState([]);
  const [allClients, setAllClients] = useState([]);

  useEffect(() => {
    homeConfigAPI.get().then(d => setConfig(prev => ({ ...prev, ...d }))).catch(() => {});
    serviceAPI.list().then(d => setAllServices(d)).catch(() => {});
    clientAPI.list().then(d => setAllClients(d)).catch(() => {});
  }, []);

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });
  const [collapsed, setCollapsed] = useState({
    about: false,
    services: false,
    whyUs: true,
    stats: true,
    customers: true,
    cta: true
  });
  
  const toggleSection = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);

  const handleToggle = (key) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleServiceSelect = (id) => {
    setConfig(prev => {
      const selected = prev.selectedServices || [];
      if (selected.includes(id)) {
        return { ...prev, selectedServices: selected.filter(sid => sid !== id) };
      } else {
        return { ...prev, selectedServices: [...selected, id] };
      }
    });
  };

  const handleClientSelect = (id) => {
    setConfig(prev => {
      const selected = prev.selectedClients || [];
      if (selected.includes(id)) {
        return { ...prev, selectedClients: selected.filter(sid => sid !== id) };
      } else {
        return { ...prev, selectedClients: [...selected, id] };
      }
    });
  };

  const handleSelectAllClients = () => {
    const allIds = allClients.map(c => c.id);
    const allSelected = allIds.every(id => (config.selectedClients || []).includes(id));
    setConfig(prev => ({ ...prev, selectedClients: allSelected ? [] : allIds }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleAboutChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, aboutSection: { ...(prev.aboutSection || {}), [name]: value } }));
  };

  const handleAboutImage = (url) => {
    setConfig(prev => ({ ...prev, aboutSection: { ...(prev.aboutSection || {}), image: url } }));
  };

  const handleListChange = (index, value) => {
    setConfig(prev => {
      const newList = [...(prev.aboutSection?.listItems || [])];
      newList[index] = value;
      return { ...prev, aboutSection: { ...prev.aboutSection, listItems: newList } };
    });
  };

  const handleAddListItem = () => {
    setConfig(prev => {
      const newList = [...(prev.aboutSection?.listItems || []), ''];
      return { ...prev, aboutSection: { ...prev.aboutSection, listItems: newList } };
    });
  };

  const handleRemoveListItem = (index) => {
    setConfig(prev => {
      const newList = [...(prev.aboutSection?.listItems || [])];
      newList.splice(index, 1);
      return { ...prev, aboutSection: { ...prev.aboutSection, listItems: newList } };
    });
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm sticky-top" style={{ top: '80px', zIndex: 10 }}>
        <div>
          <h3 className="fw-bold m-0 text-dark">จัดการส่วนประกอบหน้าแรก (Home Layout)</h3>
          <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>เปิด/ปิด และกำหนดข้อมูลที่จะแสดงในแต่ละส่วนของหน้า Home</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={() => setConfirm({ show: true, type: 'info', title: 'บันทึกการตั้งค่า', message: 'ยืนยันบันทึกการตั้งค่าหน้าแรก?', action: async () => { await homeConfigAPI.update(config); } })}>
          <i className="bi bi-save"></i>บันทึกการตั้งค่า
        </button>
      </div>

      <div className="row">
        <div className="col-12">
          {/* 1. About Us Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('about')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-info-circle fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-dark">เกี่ยวกับเรา (About Us)</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่วนแนะนำบริษัทด้านล่าง Hero Banner</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3" onClick={e => e.stopPropagation()}>
                <span className={`badge rounded-pill px-2.5 py-1 ${config.showAbout ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {config.showAbout ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showAbout} onChange={() => handleToggle('showAbout')} style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className="btn btn-link text-secondary p-0 ms-2" onClick={() => toggleSection('about')}>
                  <i className={`bi bi-chevron-${collapsed.about ? 'down' : 'up'} fs-5`}></i>
                </button>
              </div>
            </div>
            {!collapsed.about && (
              <div className="card-body p-4">
                {!config.showAbout && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}
                <div className="row g-4">
                  <div className="col-md-5">
                    <ImageUploader 
                      value={config.aboutSection?.image || ''} 
                      onChange={handleAboutImage} 
                      label="รูปภาพประกอบ" 
                      recommendedSize="600x750px (แนวตั้ง 4:5 แบบโพลารอยด์)"
                      aspectRatio={4/5}
                    />
                    <div className="admin-form-group mt-3">
                      <label>วิดีโอ YouTube/Vimeo (ถ้ามี)</label>
                      <input type="text" name="videoUrl" value={config.aboutSection?.videoUrl || ''} onChange={handleAboutChange} placeholder="วางลิงก์วิดีโอเพื่อแสดงปุ่ม Play บนรูป" />
                    </div>
                    
                    <div className="row g-2 mt-2">
                      <div className="col-6">
                        <div className="admin-form-group">
                          <label>ป้ายข้อความบน (เช่น เลข)</label>
                          <input type="text" name="badgeTopText" value={config.aboutSection?.badgeTopText || ''} onChange={handleAboutChange} placeholder="14" />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="admin-form-group">
                          <label>ป้ายข้อความล่าง</label>
                          <input type="text" name="badgeBottomText" value={config.aboutSection?.badgeBottomText || ''} onChange={handleAboutChange} placeholder="ปีแห่งความสำเร็จ" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-7">
                    <div className="admin-form-group">
                      <label>หัวข้อหลัก (Title)</label>
                      <input type="text" name="title" value={config.aboutSection?.title || ''} onChange={handleAboutChange} placeholder="เปลี่ยนทุกไอเดียให้เป็นความประทับใจไปกับ 108" />
                    </div>
                    <div className="admin-form-group">
                      <label>คำอธิบาย (Description)</label>
                      <textarea name="description" rows="3" value={config.aboutSection?.description || ''} onChange={handleAboutChange} placeholder="ข้อความแนะนำบริษัท..."></textarea>
                    </div>
                    
                    <div className="admin-form-group">
                      <label className="d-flex justify-content-between align-items-center mb-2">
                        รายการจุดเด่น (List Items)
                        <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.75rem' }} onClick={handleAddListItem}>
                          <i className="bi bi-plus-lg"></i> เพิ่มรายการ
                        </button>
                      </label>
                      <div className="d-flex flex-column gap-2">
                        {(config.aboutSection?.listItems || []).map((item, idx) => (
                          <div key={idx} className="d-flex gap-2 align-items-center">
                            <input 
                              type="text" 
                              className="form-control form-control-sm rounded-3" 
                              value={item} 
                              onChange={(e) => handleListChange(idx, e.target.value)} 
                              placeholder={`รายการที่ ${idx + 1}`} 
                            />
                            <button type="button" className="btn btn-sm btn-outline-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }} onClick={() => handleRemoveListItem(idx)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                        {(!config.aboutSection?.listItems || config.aboutSection?.listItems.length === 0) && (
                          <div className="text-muted small text-center bg-white border p-3 rounded-4">ยังไม่มีรายการ จุดเด่นนี้จะถูกซ่อนอยู่ คุณสามารถกดปุ่มเพิ่มรายการด้านบนได้</div>
                        )}
                      </div>
                    </div>

                    <div className="row g-2 mt-2">
                      <div className="col-6">
                        <div className="admin-form-group">
                          <label>ข้อความปุ่ม CTA</label>
                          <input type="text" name="buttonText" value={config.aboutSection?.buttonText || ''} onChange={handleAboutChange} placeholder="ติดต่อร่วมงานกับเรา" />
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="admin-form-group">
                          <label>ลิงก์ปุ่ม CTA</label>
                          <input type="text" name="buttonLink" value={config.aboutSection?.buttonLink || ''} onChange={handleAboutChange} placeholder="/contact" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Services Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('services')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-success bg-opacity-10 text-success d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-briefcase fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-dark">บริการของเรา (Services)</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>เลือกบริการที่จะแสดงในหน้าแรก</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3" onClick={e => e.stopPropagation()}>
                <span className={`badge rounded-pill px-2.5 py-1 ${config.showServices ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {config.showServices ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showServices} onChange={() => handleToggle('showServices')} style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className="btn btn-link text-secondary p-0 ms-2" onClick={() => toggleSection('services')}>
                  <i className={`bi bi-chevron-${collapsed.services ? 'down' : 'up'} fs-5`}></i>
                </button>
              </div>
            </div>
            {!collapsed.services && (
              <div className="card-body p-4">
                {!config.showServices && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}
                <div className="mb-3 text-muted small">* คลิกเลือกบริการที่ต้องการนำไปแสดงผลบนหน้าแรก (สัดส่วนหน้าจะปรับจัด Layout สมดุลให้โดยอัตโนมัติ)</div>
                <div className="row g-3">
                  {allServices.map(svc => {
                    const isSelected = (config.selectedServices || []).includes(svc.id);
                    return (
                      <div key={svc.id} className="col-6 col-md-4 col-lg-3">
                        <div 
                          onClick={() => handleServiceSelect(svc.id)}
                          className={`p-3 rounded-4 border text-center h-100 d-flex flex-column align-items-center justify-content-center position-relative`}
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            borderColor: isSelected ? 'var(--primary)' : '#e2e8f0',
                            borderWidth: isSelected ? '2px' : '1px',
                            background: isSelected ? 'rgba(163,217,0,0.05)' : '#fff',
                            boxShadow: isSelected ? '0 8px 24px rgba(163,217,0,0.08)' : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#cbd5e1';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.borderColor = '#e2e8f0';
                          }}
                        >
                          {isSelected && (
                            <span className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center m-2 shadow" style={{ width: 22, height: 22 }}>
                              <i className="bi bi-check-lg" style={{ fontSize: '0.75rem' }}></i>
                            </span>
                          )}
                          {svc.image ? (
                            <img src={svc.image} alt={svc.title} className="rounded-3 mb-2 shadow-sm" style={{ width: '48px', height: '48px', objectFit: 'cover' }} />
                          ) : (
                            <div className="bg-light text-secondary rounded-3 mb-2 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                              <i className="bi bi-image fs-5"></i>
                            </div>
                          )}
                          <div className="fw-bold text-dark text-truncate w-100 mt-1" style={{ fontSize: '0.82rem' }}>{svc.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3. Why Us Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('whyUs')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-warning bg-opacity-10 text-warning d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-star fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-dark">ทำไมต้องเลือกเรา (Why Choose Us)</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่วนเหตุผลที่ควรใช้บริการและภาพประกอบ</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3" onClick={e => e.stopPropagation()}>
                <span className={`badge rounded-pill px-2.5 py-1 ${config.showWhyUs ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {config.showWhyUs ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showWhyUs} onChange={() => handleToggle('showWhyUs')} style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className="btn btn-link text-secondary p-0 ms-2" onClick={() => toggleSection('whyUs')}>
                  <i className={`bi bi-chevron-${collapsed.whyUs ? 'down' : 'up'} fs-5`}></i>
                </button>
              </div>
            </div>
            {!collapsed.whyUs && (
              <div className="card-body p-4">
                {!config.showWhyUs && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-0 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}
                {config.showWhyUs && (
                  <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-info-circle-fill text-primary me-2"></i> ส่วนนี้จะแสดงผลอัตโนมัติโดยดึงจุดเด่นของบริษัท 3 ข้อ (ทีมผู้เชี่ยวชาญ, คุณภาพมาตรฐานสากล, ซัพพอร์ตตลอด 24/7) ไปโชว์คู่กับรูปภาพแบนเนอร์ทีมงานในหน้าแรกของเว็บไซต์
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 4. Stats Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('stats')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-info bg-opacity-10 text-info d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-bar-chart-steps fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-dark">แถบตัวเลขสถิติ (Stats Bar)</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>แถบสีเข้มแสดงตัวเลขผลงานและประสบการณ์</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3" onClick={e => e.stopPropagation()}>
                <span className={`badge rounded-pill px-2.5 py-1 ${config.showStats ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {config.showStats ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showStats} onChange={() => handleToggle('showStats')} style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className="btn btn-link text-secondary p-0 ms-2" onClick={() => toggleSection('stats')}>
                  <i className={`bi bi-chevron-${collapsed.stats ? 'down' : 'up'} fs-5`}></i>
                </button>
              </div>
            </div>
            {!collapsed.stats && (
              <div className="card-body p-4">
                {!config.showStats && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-0 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}
                {config.showStats && (
                  <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-info-circle-fill text-primary me-2"></i> ส่วนนี้จะแสดงสถิติทั้งหมดที่สร้างขึ้นเรียงต่อกันในแถบแบนเนอร์สีเข้ม คุณสามารถไปจัดเรียงหรือแก้ไขข้อความสถิติได้ที่เมนู <strong>"เกี่ยวกับเรา &gt; ตัวเลขสถิติ"</strong>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 5. Customers Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('customers')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-secondary bg-opacity-10 text-secondary d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-building fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-dark">ลูกค้าของเรา (Customers / Clients)</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่วนแสดงโลโก้แบรนด์ลูกค้าวิ่งสไลด์</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3" onClick={e => e.stopPropagation()}>
                <span className={`badge rounded-pill px-2.5 py-1 ${config.showCustomers ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {config.showCustomers ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showCustomers} onChange={() => handleToggle('showCustomers')} style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className="btn btn-link text-secondary p-0 ms-2" onClick={() => toggleSection('customers')}>
                  <i className={`bi bi-chevron-${collapsed.customers ? 'down' : 'up'} fs-5`}></i>
                </button>
              </div>
            </div>
            {!collapsed.customers && (
              <div className="card-body p-4">
                {!config.showCustomers && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-4 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}

                {/* Layout Settings */}
                <div className="bg-light rounded-4 p-4 mb-4 border">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-grid-3x3-gap text-primary"></i> ตั้งค่าเลย์เอาท์ (Layout Settings)
                  </h6>
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
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
                    <i className="bi bi-check2-square text-success"></i> เลือกแบรนด์ลูกค้าที่จะแสดง
                    <span className="badge bg-primary bg-opacity-10 text-primary ms-2" style={{ fontSize: '0.7rem' }}>
                      {(config.selectedClients || []).length} / {allClients.length} แบรนด์
                    </span>
                  </h6>
                  <button type="button" className="btn btn-sm btn-outline-primary rounded-pill px-3" style={{ fontSize: '0.78rem' }} onClick={handleSelectAllClients}>
                    {allClients.length > 0 && allClients.every(c => (config.selectedClients || []).includes(c.id)) ? (
                      <><i className="bi bi-x-circle me-1"></i>ยกเลิกทั้งหมด</>
                    ) : (
                      <><i className="bi bi-check-all me-1"></i>เลือกทั้งหมด</>
                    )}
                  </button>
                </div>

                {allClients.length === 0 ? (
                  <div className="text-center text-muted bg-light p-4 rounded-4 border">
                    <i className="bi bi-building fs-1 d-block mb-2 opacity-25"></i>
                    <p className="m-0">ยังไม่มีข้อมูลลูกค้า กรุณาเพิ่มข้อมูลลูกค้าที่เมนู <strong>"ลูกค้าของเรา"</strong> ก่อน</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {allClients.map(cli => {
                      const isSelected = (config.selectedClients || []).includes(cli.id);
                      return (
                        <div key={cli.id} className="col-6 col-md-4 col-lg-3">
                          <div
                            onClick={() => handleClientSelect(cli.id)}
                            className="p-3 rounded-4 border text-center h-100 d-flex flex-column align-items-center justify-content-center position-relative"
                            style={{
                              cursor: 'pointer',
                              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                              borderColor: isSelected ? 'var(--primary)' : '#e2e8f0',
                              borderWidth: isSelected ? '2px' : '1px',
                              background: isSelected ? 'rgba(163,217,0,0.05)' : '#fff',
                              boxShadow: isSelected ? '0 8px 24px rgba(163,217,0,0.08)' : 'none',
                              minHeight: '100px',
                            }}
                          >
                            {isSelected && (
                              <span className="position-absolute top-0 end-0 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center m-2 shadow" style={{ width: 22, height: 22 }}>
                                <i className="bi bi-check-lg" style={{ fontSize: '0.75rem' }}></i>
                              </span>
                            )}
                            {cli.logo ? (
                              <img src={cli.logo} alt={cli.name} className="mb-2" style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', background: '#f8fafc', padding: '4px' }} />
                            ) : (
                              <div className="bg-light text-secondary rounded-3 mb-2 d-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                                <i className="bi bi-building fs-4"></i>
                              </div>
                            )}
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

          {/* 6. CTA Card */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ transition: 'all 0.3s ease' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('cta')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <div className="d-flex align-items-center gap-3">
                <div className="p-2 rounded-3 bg-danger bg-opacity-10 text-danger d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                  <i className="bi bi-megaphone fs-5"></i>
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-dark">ป้ายประกาศด้านล่าง (Call to Action)</h5>
                  <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>ส่วน "พร้อมเริ่มโปรเจกต์ใหม่?" ก่อนถึง Footer</p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3" onClick={e => e.stopPropagation()}>
                <span className={`badge rounded-pill px-2.5 py-1 ${config.showCTA ? 'bg-success bg-opacity-10 text-success' : 'bg-secondary bg-opacity-10 text-secondary'}`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                  {config.showCTA ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
                <div className="form-check form-switch fs-4 m-0 d-flex align-items-center">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showCTA} onChange={() => handleToggle('showCTA')} style={{ cursor: 'pointer' }} />
                </div>
                <button type="button" className="btn btn-link text-secondary p-0 ms-2" onClick={() => toggleSection('cta')}>
                  <i className={`bi bi-chevron-${collapsed.cta ? 'down' : 'up'} fs-5`}></i>
                </button>
              </div>
            </div>
            {!collapsed.cta && (
              <div className="card-body p-4">
                {!config.showCTA && (
                  <div className="alert alert-secondary border-0 rounded-3 mb-0 py-2 px-3 d-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                    <i className="bi bi-eye-slash-fill"></i>
                    <span>ส่วนนี้ถูกปิดใช้งานอยู่และจะไม่แสดงบนหน้าแรกของเว็บไซต์</span>
                  </div>
                )}
                {config.showCTA && (
                  <p className="text-muted m-0" style={{ fontSize: '0.85rem' }}>
                    <i className="bi bi-info-circle-fill text-primary me-2"></i> ส่วนแบนเนอร์พื้นสีไล่ระดับ (Gradient) ท้ายเพจที่จะกระตุ้นการตัดสินใจของผู้เข้าชมเพื่อกดปุ่มติดต่อและลิงก์ไปยังหน้า /contact ทันที
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
