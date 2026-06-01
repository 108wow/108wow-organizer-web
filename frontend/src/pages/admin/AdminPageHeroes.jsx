import { useState, useCallback, useEffect } from 'react';
import { pageHeroAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

export default function AdminPageHeroes() {
  const [heroes, setHeroes] = useState({});

  useEffect(() => {
    pageHeroAPI.list().then(d => setHeroes(d)).catch(() => {});
  }, []);

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });
  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);

  const handleChange = (page, field, value) => {
    setHeroes(prev => ({
      ...prev,
      [page]: {
        ...prev[page],
        [field]: value
      }
    }));
  };

  const pagesList = [
    { id: 'about', name: 'เกี่ยวกับเรา (About Us)' },
    { id: 'services', name: 'บริการ (Services)' },
    { id: 'gallery', name: 'ผลงาน (Gallery)' },
    { id: 'blog', name: 'บทความ (Blog)' },
    { id: 'team', name: 'ทีมงาน (Team)' },
    { id: 'clients', name: 'ลูกค้า (Clients)' },
    { id: 'contact', name: 'ติดต่อเรา (Contact)' },
  ];

  const [activePage, setActivePage] = useState(pagesList.length > 0 ? pagesList[0].id : null);

  if (Object.keys(heroes).length === 0) return <LoadingOverlay show={true} />;

  const activeData = heroes[activePage];

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />
      
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 bg-white p-3 px-4 rounded-4 shadow-sm">
        <div>
          <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-card-heading text-primary"></i>
            จัดการแบนเนอร์หน้าย่อย (Page Heroes)
          </h4>
          <p className="text-muted m-0 mt-1" style={{ fontSize: '0.85rem' }}>แก้ไขรูปภาพ หัวข้อ และคำอธิบายส่วนบนสุดของแต่ละหน้า</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => setConfirm({ show: true, type: 'info', title: 'บันทึก', message: 'ยืนยันบันทึกข้อมูล Page Heroes?', action: async () => { for (const [key, val] of Object.entries(heroes)) { await pageHeroAPI.update(key, val); } } })}>
          <i className="bi bi-save"></i> บันทึกข้อมูลทั้งหมด
        </button>
      </div>

      <div className="row g-4">
        {/* Left Column: Master List */}
        <div className="col-12 col-lg-4">
          <div className="bg-white rounded-4 shadow-sm p-3">
            <h6 className="fw-bold text-muted mb-3 px-2">เลือกหน้าเพื่อแก้ไข</h6>
            
            {/* Mobile horizontal scroll / Desktop vertical list */}
            <div className="d-flex flex-row flex-lg-column gap-2 overflow-auto hide-scrollbar pb-2 pb-lg-0" style={{ WebkitOverflowScrolling: 'touch', margin: '0 -10px', padding: '0 10px' }}>
              {pagesList.map(page => {
                const isActive = activePage === page.id;
                const pageHero = heroes[page.id];
                return (
                  <button
                    key={page.id}
                    onClick={() => setActivePage(page.id)}
                    className={`btn border-0 text-start rounded-3 d-flex flex-shrink-0 flex-lg-shrink-1 align-items-center gap-3 p-2 ${isActive ? 'shadow-sm' : ''}`}
                    style={{
                      background: isActive ? '#ffffff' : 'transparent',
                      border: isActive ? '1px solid var(--primary)' : '1px solid transparent',
                      transition: 'all 0.2s',
                      width: 'auto',
                      minWidth: '240px'
                    }}
                  >
                    <div className="rounded-2 overflow-hidden flex-shrink-0 bg-light border d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: '#f8fafc' }}>
                      {pageHero?.image ? (
                        <img src={pageHero.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="bi bi-image text-muted"></i>
                      )}
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.95rem' }}>{page.name.split(' (')[0]}</div>
                      <div className="text-muted small text-truncate">{page.name.split('(')[1]?.replace(')','')}</div>
                    </div>
                    {isActive && <i className="bi bi-check-circle-fill text-primary fs-5 pe-2 d-none d-lg-block"></i>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detail View */}
        <div className="col-12 col-lg-8">
          <div className="bg-white rounded-4 shadow-sm p-4 h-100 anim-slide-up" key={activePage}>
            
            <div className="d-flex align-items-center gap-2 mb-4">
              <span className="badge bg-primary text-navy px-3 py-2 rounded-pill fw-bold">กำลังแก้ไข:</span>
              <h5 className="fw-bold m-0 text-dark">{pagesList.find(p=>p.id===activePage)?.name}</h5>
            </div>

            {/* Hero Preview */}
            <div className="mb-4 position-relative rounded-4 overflow-hidden border shadow-sm" style={{ height: '240px', background: '#0a0f0d' }}>
              {activeData?.image ? (
                <img src={activeData.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                  <i className="bi bi-images text-white opacity-25" style={{ fontSize: '4rem' }}></i>
                </div>
              )}
              
              {/* Gradient Overlay & Text */}
              <div className="position-absolute inset-0 d-flex flex-column justify-content-center px-4 px-md-5" style={{ background: 'linear-gradient(to right, rgba(10,15,13,0.85) 0%, rgba(10,15,13,0.3) 100%)', inset: 0 }}>
                <h2 className="fw-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', maxWidth: '80%' }}>
                  {activeData?.title || 'หัวข้อหลัก (Title)'}
                </h2>
                <p className="text-light m-0 fs-6" style={{ opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.5)', maxWidth: '70%' }}>
                  {activeData?.subtitle || 'คำบรรยายสั้นๆ (Subtitle) จะแสดงที่นี่'}
                </p>
              </div>
            </div>

            <div className="alert alert-light border rounded-3 mb-4 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-info-circle-fill fs-5 text-primary"></i>
              <span><strong>แนะนำขนาดรูปภาพ:</strong> 1920 x 600 px (แนวยาวพาโนรามา)</span>
            </div>

            <div className="row g-4">
              <div className="col-md-6">
                <ImageUploader
                  value={activeData?.image || ''}
                  onChange={(url) => handleChange(activePage, 'image', url)}
                  label="รูปภาพแบนเนอร์ (Hero Image)"
                  aspectRatio={16 / 5}
                />
              </div>
              <div className="col-md-6 d-flex flex-column gap-3">
                <div className="admin-form-group m-0">
                  <label className="fw-bold text-dark mb-2">หัวข้อ (Title)</label>
                  <input type="text" className="form-control bg-light" style={{ borderRadius: '10px', padding: '12px' }} value={activeData?.title || ''} onChange={(e) => handleChange(activePage, 'title', e.target.value)} placeholder="เช่น ผลงานของเรา" />
                </div>
                <div className="admin-form-group m-0 flex-grow-1 d-flex flex-column">
                  <label className="fw-bold text-dark mb-2">คำบรรยายสั้นๆ (Subtitle)</label>
                  <textarea className="form-control bg-light flex-grow-1" style={{ borderRadius: '10px', padding: '12px', minHeight: '100px' }} value={activeData?.subtitle || ''} onChange={(e) => handleChange(activePage, 'subtitle', e.target.value)} placeholder="รายละเอียดสั้นๆ อธิบายหน้านี้..."></textarea>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
