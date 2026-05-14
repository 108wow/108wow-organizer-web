import { useState, useCallback, useEffect } from 'react';
import { heroAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

export default function AdminHero() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    heroAPI.list().then(data => setSlides(data)).catch(() => {});
  }, []);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);

  const handleEdit = (slide) => { setEditingId(slide.id); setEditForm({...slide}); };
  const handleCancel = () => { setEditingId(null); };
  const handleChange = (e) => { setEditForm(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handleSave = (e) => {
    e.preventDefault();
    setConfirm({ show: true, type: 'info', title: 'บันทึกการแก้ไข', message: `บันทึกสไลด์ "${editForm.title}" ?`,
      action: async () => { const u = await heroAPI.update(editingId, editForm); setSlides(p => p.map(s => s.id === editingId ? u : s)); setEditingId(null); }
    });
  };
  const handleAdd = () => {
    const newSlide = { title: 'สไลด์ใหม่', subtitle: '', ghostText: 'NEW', image: '', isActive: true };
    setConfirm({ show: true, type: 'info', title: 'เพิ่มสไลด์', message: 'เพิ่มสไลด์ใหม่?',
      action: async () => { const c = await heroAPI.create(newSlide); setSlides(p => [...p, c]); setEditingId(c.id); setEditForm(c); }
    });
  };
  const handleDelete = (slide) => { setConfirm({ show: true, type: 'danger', title: 'ลบสไลด์', message: `ลบ "${slide.title}" ?`, action: async () => { await heroAPI.delete(slide.id); setSlides(p => p.filter(s => s.id !== slide.id)); } }); };
  const handleToggle = (slide) => { setConfirm({ show: true, type: 'warning', title: slide.isActive?'ซ่อนสไลด์':'แสดงสไลด์', message: `${slide.isActive?'ซ่อน':'แสดง'} "${slide.title}" ?`, action: async () => { const u = await heroAPI.update(slide.id, { isActive: !slide.isActive }); setSlides(p => p.map(s => s.id === slide.id ? u : s)); } }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0">จัดการแบนเนอร์ (Hero)</h3><p className="text-muted m-0">แก้ไขสไลด์หน้าแรก</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" onClick={handleAdd}><i className="bi bi-plus-lg me-2"></i>เพิ่มสไลด์ใหม่</button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle m-0">
          <thead className="table-light"><tr><th className="px-4 py-3 border-bottom-0">รูปภาพ</th><th className="py-3 border-bottom-0">หัวข้อ</th><th className="py-3 border-bottom-0">Ghost Text</th><th className="py-3 border-bottom-0 text-center" style={{width:80}}>สถานะ</th><th className="px-4 py-3 border-bottom-0 text-end" style={{width:160}}>จัดการ</th></tr></thead>
          <tbody>
            {slides.map(slide => (
              <tr key={slide.id} style={{ opacity: slide.isActive ? 1 : 0.45 }}>
                {editingId === slide.id ? (
                  <td colSpan="5" className="p-0">
                    <div className="p-4 bg-light border-bottom">
                      <h6 className="fw-bold mb-3">แก้ไขสไลด์ #{slide.id}</h6>
                      <form onSubmit={handleSave}>
                        <div className="row g-3">
                          <div className="col-md-6"><div className="admin-form-group"><label>หัวข้อ</label><input type="text" name="title" value={editForm.title} onChange={handleChange} required/></div></div>
                          <div className="col-md-3"><div className="admin-form-group"><label>Ghost Text</label><input type="text" name="ghostText" value={editForm.ghostText||''} onChange={handleChange}/></div></div>
                          <div className="col-md-12"><ImageUploader value={editForm.image} onChange={(url) => setEditForm(p => ({...p, image: url}))} recommendedSize="1920x1080px (อัตราส่วน 16:9)" aspectRatio={16/9} /></div>
                          <div className="col-12"><div className="admin-form-group"><label>รายละเอียด</label><textarea name="subtitle" rows="2" value={editForm.subtitle} onChange={handleChange}></textarea></div></div>
                          <div className="col-12 d-flex justify-content-end gap-2"><button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={handleCancel}>ยกเลิก</button><button type="submit" className="btn btn-primary px-4 rounded-3 shadow-sm">บันทึก</button></div>
                        </div>
                      </form>
                    </div>
                  </td>
                ) : (<>
                  <td className="px-4 py-3"><div className="rounded-3" style={{width:110,height:55,backgroundImage:`url(${slide.image})`,backgroundSize:'cover',backgroundPosition:'center'}}></div></td>
                  <td className="py-3 fw-bold">{slide.title}</td>
                  <td className="py-3"><span className="badge bg-dark bg-opacity-10 text-dark border px-2 py-1">{slide.ghostText}</span></td>
                  <td className="py-3 text-center"><div className="form-check form-switch d-flex justify-content-center m-0"><input className="form-check-input" type="checkbox" checked={slide.isActive} onChange={()=>handleToggle(slide)} style={{cursor:'pointer'}}/></div></td>
                  <td className="px-4 py-3 text-end">
                    <button className="btn btn-sm btn-light text-primary border rounded-3 me-1" onClick={()=>handleEdit(slide)}><i className="bi bi-pencil-square"></i></button>
                    <button className="btn btn-sm btn-light text-danger border rounded-3" onClick={()=>handleDelete(slide)}><i className="bi bi-trash"></i></button>
                  </td>
                </>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div></div></div>
    </div>
  );
}
