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

  if (Object.keys(heroes).length === 0) return <LoadingOverlay show={true} />;

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">จัดการแบนเนอร์หน้าย่อย (Page Heroes)</h3>
          <p className="text-muted m-0">แก้ไขรูปภาพ หัวข้อ และคำอธิบายส่วนบนสุดของแต่ละหน้า</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={() => setConfirm({ show: true, type: 'info', title: 'บันทึก', message: 'ยืนยันบันทึกข้อมูล Page Heroes?', action: async () => { for (const [key, val] of Object.entries(heroes)) { await pageHeroAPI.update(key, val); } } })}>
          <i className="bi bi-save"></i>บันทึกข้อมูลทั้งหมด
        </button>
      </div>

      <div className="alert alert-info border-0 rounded-4 shadow-sm mb-4 d-flex align-items-center gap-3">
        <i className="bi bi-info-circle-fill fs-3 text-info"></i>
        <div>
          <strong>คำแนะนำขนาดรูปภาพ:</strong> เพื่อความสวยงามและคมชัดสูงสุด แนะนำให้ใช้รูปภาพขนาด <strong>1920 x 600 px</strong> (แนวยาวพาโนรามา) สำหรับแบนเนอร์ส่วนบนของทุกหน้า
        </div>
      </div>

      <div className="row g-4">
        {pagesList.map((page) => (
          <div key={page.id} className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0">{page.name}</h5>
                <span className="badge bg-light text-muted border">/{page.id}</span>
              </div>
              <div className="card-body p-4">
                <div className="mb-3 position-relative rounded-3 overflow-hidden border" style={{ height: '140px', background: '#f8fafc' }}>
                  <img src={heroes[page.id].image} alt={page.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="position-absolute inset-0 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.5)', inset: 0 }}>
                    <div className="text-center text-white p-3">
                      <h5 className="fw-bold mb-1">{heroes[page.id].title}</h5>
                      <small style={{ opacity: 0.8 }}>{heroes[page.id].subtitle}</small>
                    </div>
                  </div>
                </div>

                <ImageUploader
                  value={heroes[page.id].image}
                  onChange={(url) => handleChange(page.id, 'image', url)}
                  label="รูปภาพแบนเนอร์"
                  aspectRatio={16 / 5}
                />
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-muted small">หัวข้อ (Title)</label>
                  <input type="text" className="form-control" value={heroes[page.id].title} onChange={(e) => handleChange(page.id, 'title', e.target.value)} />
                </div>
                
                <div>
                  <label className="form-label fw-bold text-muted small">คำบรรยายสั้นๆ (Subtitle)</label>
                  <textarea className="form-control" rows="2" value={heroes[page.id].subtitle} onChange={(e) => handleChange(page.id, 'subtitle', e.target.value)}></textarea>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
