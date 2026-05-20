import { useState, useCallback, useEffect } from 'react';
import { teamAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const emptyForm = { name: '', position: '', bio: '', photo: '', facebook: '', linkedin: '' };

export default function AdminTeam() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    teamAPI.list().then(data => setMembers(data)).catch(() => {});
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); };
  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (m) => { setEditId(m.id); setForm({ name: m.name, position: m.position, bio: m.bio || '', photo: m.photo, facebook: m.facebook || '', linkedin: m.linkedin || '' }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); };
  const exec = useCallback(async (action) => { setConfirm(p => ({ ...p, show: false })); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);

  const handleSave = () => {
    if (!form.name.trim() || !form.position.trim()) { setStatusM({ show: true, status: 'error', message: 'กรุณากรอกชื่อและตำแหน่ง' }); return; }
    setConfirm({ show: true, type: 'info', title: editId ? 'ยืนยันการแก้ไข' : 'เพิ่มทีมงาน', message: `${editId?'แก้ไข':'เพิ่ม'} "${form.name}" ?`,
      action: async () => { if (editId) { const u = await teamAPI.update(editId, form); setMembers(p => p.map(i => i.id === editId ? u : i)); } else { const c = await teamAPI.create(form); setMembers(p => [...p, c]); } closeModal(); }
    });
  };
  const handleDelete = (item) => { setConfirm({ show: true, type: 'danger', title: 'ยืนยันการลบ', message: `ลบ "${item.name}" ?`, action: async () => { await teamAPI.delete(item.id); setMembers(p => p.filter(i => i.id !== item.id)); } }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => exec(confirm.action)} onCancel={() => setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={() => setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">จัดการทีมงาน (Team)</h3><p className="text-muted m-0">จัดการรายชื่อบุคลากร</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" onClick={openAdd}><i className="bi bi-person-plus me-2"></i>เพิ่มทีมงาน</button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle m-0">
          <thead className="table-light"><tr><th className="px-4 py-3 border-bottom-0" style={{width:80}}>รูปภาพ</th><th className="py-3 border-bottom-0">ชื่อ</th><th className="py-3 border-bottom-0">ตำแหน่ง</th><th className="py-3 border-bottom-0 d-none d-lg-table-cell">Bio</th><th className="px-4 py-3 border-bottom-0 text-end" style={{width:140}}>จัดการ</th></tr></thead>
          <tbody>{members.map(m=>(
            <tr key={m.id}><td className="px-4 py-3"><div className="rounded-circle shadow-sm border" style={{width:48,height:48,backgroundImage:`url(${m.photo})`,backgroundSize:'cover',backgroundPosition:'center'}}></div></td><td className="py-3 fw-bold text-dark">{m.name}</td><td className="py-3 text-muted">{m.position}</td><td className="py-3 text-muted small d-none d-lg-table-cell">{(m.bio||'').substring(0,40)}</td><td className="px-4 py-3 text-end"><button className="btn btn-sm btn-light text-primary border rounded-3 me-2" onClick={()=>openEdit(m)}><i className="bi bi-pencil-square"></i></button><button className="btn btn-sm btn-light text-danger border rounded-3" onClick={()=>handleDelete(m)}><i className="bi bi-trash"></i></button></td></tr>
          ))}</tbody>
        </table>
      </div></div></div>

      <ModalBackdrop show={showModal} onClose={closeModal}>
            <div className="d-flex justify-content-between align-items-center mb-4"><h5 className="fw-bold m-0">{editId?'แก้ไขทีมงาน':'เพิ่มทีมงานใหม่'}</h5><button onClick={closeModal} style={{background:'none',border:'none',fontSize:'1.3rem',color:'#94a3b8',cursor:'pointer'}}><i className="bi bi-x-lg"></i></button></div>
            <div className="row g-3"><div className="col-6"><div className="admin-form-group"><label>ชื่อ *</label><input type="text" name="name" value={form.name} onChange={handleChange}/></div></div><div className="col-6"><div className="admin-form-group"><label>ตำแหน่ง *</label><input type="text" name="position" value={form.position} onChange={handleChange}/></div></div></div>
            <div className="admin-form-group"><label>Bio</label><textarea name="bio" rows="2" value={form.bio} onChange={handleChange}></textarea></div>
            <ImageUploader value={form.photo} onChange={(url) => setForm(p => ({ ...p, photo: url }))} label="รูปภาพ" aspectRatio={1} circle={true} />
            <div className="row g-3"><div className="col-6"><div className="admin-form-group"><label><i className="bi bi-facebook me-1"></i>Facebook</label><input type="text" name="facebook" value={form.facebook} onChange={handleChange}/></div></div><div className="col-6"><div className="admin-form-group"><label><i className="bi bi-linkedin me-1"></i>LinkedIn</label><input type="text" name="linkedin" value={form.linkedin} onChange={handleChange}/></div></div></div>
            <div className="d-flex gap-3 justify-content-end mt-4"><button onClick={closeModal} style={{padding:'10px 24px',borderRadius:'12px',border:'1.5px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:700,cursor:'pointer'}}>ยกเลิก</button><button onClick={handleSave} style={{padding:'10px 28px',borderRadius:'12px',border:'none',background:'var(--primary)',color:'var(--navy)',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 15px rgba(163,217,0,0.3)'}}><i className="bi bi-save me-2"></i>{editId?'บันทึก':'เพิ่ม'}</button></div>
      </ModalBackdrop>
    </div>
  );
}
