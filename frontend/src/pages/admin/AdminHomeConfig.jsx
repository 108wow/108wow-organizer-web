import { useState, useCallback } from 'react';
import { homeConfig, services } from '../../data/mockData';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

export default function AdminHomeConfig() {
  const [config, setConfig] = useState(homeConfig);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });
  const exec = useCallback((action) => { setConfirm(p=>({...p,show:false})); setLoading(true); setTimeout(() => { action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' }); }, 1200); }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">จัดการส่วนประกอบหน้าแรก (Home Layout)</h3>
          <p className="text-muted m-0">เปิด/ปิด และกำหนดข้อมูลที่จะแสดงในแต่ละส่วนของหน้า Home</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={() => setConfirm({ show: true, type: 'info', title: 'บันทึกการตั้งค่า', message: 'ยืนยันบันทึกการตั้งค่าหน้าแรก?', action: () => {} })}>
          <i className="bi bi-save"></i>บันทึกการตั้งค่า
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white border-bottom pt-4 pb-3 px-4">
          <h5 className="fw-bold m-0">เปิด/ปิด การแสดงผล (Visibility)</h5>
        </div>
        <div className="card-body p-0">
          <ul className="list-group list-group-flush">
            {/* About Us */}
            <li className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-info-circle text-primary"></i> เกี่ยวกับเรา (About Us)
                </div>
                <small className="text-muted">ส่วนแนะนำบริษัทด้านล่าง Hero Banner</small>
              </div>
              <div className="form-check form-switch fs-4 m-0">
                <input className="form-check-input" type="checkbox" role="switch" checked={config.showAbout} onChange={() => handleToggle('showAbout')} style={{ cursor: 'pointer' }} />
              </div>
            </li>

            {/* Services */}
            <li className="list-group-item px-4 py-3 flex-column align-items-stretch">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <div className="fw-bold text-dark d-flex align-items-center gap-2">
                    <i className="bi bi-briefcase text-success"></i> บริการของเรา (Services)
                  </div>
                  <small className="text-muted">เลือกบริการที่จะแสดงในหน้า Home</small>
                </div>
                <div className="form-check form-switch fs-4 m-0">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showServices} onChange={() => handleToggle('showServices')} style={{ cursor: 'pointer' }} />
                </div>
              </div>
              
              {config.showServices && (
                <div className="bg-light p-3 rounded-3 border">
                  <div className="row g-2">
                    {services.map(svc => (
                      <div key={svc.id} className="col-md-4">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            id={`svc-${svc.id}`} 
                            checked={(config.selectedServices || []).includes(svc.id)}
                            onChange={() => handleServiceSelect(svc.id)}
                            style={{ cursor: 'pointer' }}
                          />
                          <label className="form-check-label text-dark" htmlFor={`svc-${svc.id}`} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                            {svc.title}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </li>

            {/* Why Us */}
            <li className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-star text-warning"></i> ทำไมต้องเลือกเรา (Why Choose Us)
                </div>
                <small className="text-muted">ส่วนเหตุผลที่ควรใช้บริการและภาพประกอบ</small>
              </div>
              <div className="form-check form-switch fs-4 m-0">
                <input className="form-check-input" type="checkbox" role="switch" checked={config.showWhyUs} onChange={() => handleToggle('showWhyUs')} style={{ cursor: 'pointer' }} />
              </div>
            </li>

            {/* Stats Bar */}
            <li className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-steps text-info"></i> แถบตัวเลขสถิติ (Stats Bar)
                </div>
                <small className="text-muted">แถบสีเข้มแสดงตัวเลขผลงานและประสบการณ์</small>
              </div>
              <div className="form-check form-switch fs-4 m-0">
                <input className="form-check-input" type="checkbox" role="switch" checked={config.showStats} onChange={() => handleToggle('showStats')} style={{ cursor: 'pointer' }} />
              </div>
            </li>

            {/* Customers */}
            <li className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-building text-secondary"></i> ลูกค้าของเรา (Customers / Clients)
                </div>
                <small className="text-muted">ส่วนแสดงโลโก้แบรนด์ลูกค้า</small>
              </div>
              <div className="d-flex align-items-center gap-4">
                <div className="input-group input-group-sm" style={{ width: '120px' }}>
                  <span className="input-group-text bg-light border">แสดง</span>
                  <input type="number" className="form-control text-center" name="customersLimit" value={config.customersLimit} onChange={handleChange} min="1" max="24" disabled={!config.showCustomers} />
                  <span className="input-group-text bg-light border">โลโก้</span>
                </div>
                <div className="form-check form-switch fs-4 m-0">
                  <input className="form-check-input" type="checkbox" role="switch" checked={config.showCustomers} onChange={() => handleToggle('showCustomers')} style={{ cursor: 'pointer' }} />
                </div>
              </div>
            </li>

            {/* CTA */}
            <li className="list-group-item px-4 py-3 d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="bi bi-megaphone text-danger"></i> ป้ายประกาศด้านล่าง (Call to Action)
                </div>
                <small className="text-muted">ส่วน "พร้อมเริ่มโปรเจกต์ใหม่?" ก่อนถึง Footer</small>
              </div>
              <div className="form-check form-switch fs-4 m-0">
                <input className="form-check-input" type="checkbox" role="switch" checked={config.showCTA} onChange={() => handleToggle('showCTA')} style={{ cursor: 'pointer' }} />
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
