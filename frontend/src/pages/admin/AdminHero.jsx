import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { heroAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

export default function AdminHero() {
  const [slides, setSlides] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    heroAPI.list().then(data => setSlides(data)).catch(() => {});
  }, []);
  
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const exec = useCallback(async (action) => { 
    setConfirm(p=>({...p,show:false})); 
    setLoading(true); 
    try { 
      await action(); 
      setLoading(false); 
      setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); 
    } catch(e) { 
      setLoading(false); 
      setStatusM({ show: true, status: 'error', message: e.message }); 
    } 
  }, []);

  const handleEdit = (slide) => { 
    navigate(`/admin/hero/edit/${slide.id}`);
  };
  
  const handleAdd = () => {
    navigate('/admin/hero/new');
  };
  
  const handleDelete = (slide) => { setConfirm({ show: true, type: 'danger', title: 'ลบสไลด์', message: `ลบ "${slide.title}" ?`, action: async () => { await heroAPI.delete(slide.id); setSlides(p => p.filter(s => s.id !== slide.id)); } }); };
  const handleToggle = (slide) => { setConfirm({ show: true, type: 'warning', title: slide.isActive?'ซ่อนสไลด์':'แสดงสไลด์', message: `${slide.isActive?'ซ่อน':'แสดง'} "${slide.title}" ?`, action: async () => { const u = await heroAPI.update(slide.id, { isActive: !slide.isActive }); setSlides(p => p.map(s => s.id === slide.id ? u : s)); } }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      {/* Main Page Layout */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 bg-white p-3 px-4 rounded-4 shadow-sm">
        <div>
          <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-images text-primary"></i>
            จัดการแบนเนอร์ (Main Hero)
          </h4>
          <p className="text-muted m-0 mt-1" style={{ fontSize: '0.85rem' }}>แก้ไขภาพสไลด์และข้อความสำหรับหน้าแรก</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={handleAdd}>
          <i className="bi bi-plus-lg"></i> เพิ่มสไลด์ใหม่
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0" style={{ minWidth: '800px' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th className="px-4 py-3 border-bottom-0 text-muted fw-bold" style={{ fontSize: '0.85rem', width: '200px' }}>รูปภาพแบนเนอร์</th>
                  <th className="py-3 border-bottom-0 text-muted fw-bold" style={{ fontSize: '0.85rem' }}>ข้อมูลสไลด์</th>
                  <th className="py-3 border-bottom-0 text-muted fw-bold text-center" style={{ width: 120, fontSize: '0.85rem' }}>สถานะ</th>
                  <th className="px-4 py-3 border-bottom-0 text-end text-muted fw-bold" style={{ width: 140, fontSize: '0.85rem' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {slides.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-muted">ยังไม่มีสไลด์ กรุณากดปุ่ม "เพิ่มสไลด์ใหม่"</td></tr>
                ) : slides.map(slide => (
                  <tr key={slide.id} style={{ opacity: slide.isActive ? 1 : 0.6, transition: 'all 0.2s' }}>
                    <td className="px-4 py-3">
                      {slide.image ? (
                        <div className="rounded-3 shadow-sm border overflow-hidden position-relative" style={{ width: 140, height: 78, background: '#000' }}>
                           <img src={slide.image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div className="rounded-3 border bg-light d-flex align-items-center justify-content-center text-muted" style={{ width: 140, height: 78 }}>
                           <i className="bi bi-image fs-4"></i>
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <h6 className="fw-bold text-dark m-0 mb-1">{slide.title}</h6>
                      <div className="d-flex align-items-center gap-2">
                        {slide.ghostText && <span className="badge bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.7rem' }}>{slide.ghostText}</span>}
                        <span className="text-muted text-truncate d-inline-block" style={{ maxWidth: '250px', fontSize: '0.85rem' }}>{slide.subtitle || '-'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <div className="form-check form-switch d-flex justify-content-center m-0 fs-5" title={slide.isActive ? "ซ่อนสไลด์นี้" : "แสดงสไลด์นี้"}>
                        <input className="form-check-input shadow-none" type="checkbox" checked={slide.isActive} onChange={()=>handleToggle(slide)} style={{cursor:'pointer'}}/>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-sm btn-light text-primary border rounded-3 me-2 hover-lift" style={{ width: '32px', height: '32px' }} onClick={()=>handleEdit(slide)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-sm btn-light text-danger border rounded-3 hover-lift" style={{ width: '32px', height: '32px' }} onClick={()=>handleDelete(slide)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
