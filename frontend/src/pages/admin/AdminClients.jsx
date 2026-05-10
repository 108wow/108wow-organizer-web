import { useState, useCallback } from 'react';
import { clients as mockClients } from '../../data/mockData';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const cats = ['Technology','Social & Media','Enterprise & Cloud','Hardware & Automotive'];
const emptyForm = { name: '', logo: '', category: 'Technology' };

export default function AdminClients() {
  const [items, setItems] = useState(mockClients);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); };
  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c) => { setEditId(c.id); setForm({ name: c.name, logo: c.logo, category: c.category }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); };
  const exec = useCallback((action) => { setConfirm(p=>({...p,show:false})); setLoading(true); setTimeout(() => { action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); }, 1200); }, []);

  const handleSave = () => {
    if (!form.name.trim()) { setStatusM({ show: true, status: 'error', message: 'กรุณากรอกชื่อลูกค้า' }); return; }
    setConfirm({ show: true, type: 'info', title: editId ? 'ยืนยันการแก้ไข' : 'เพิ่มลูกค้า', message: `${editId?'แก้ไข':'เพิ่ม'} "${form.name}" ?`,
      action: () => { if (editId) setItems(p=>p.map(i=>i.id===editId?{...i,...form}:i)); else setItems(p=>[...p,{id:Math.max(...p.map(i=>i.id),0)+1,...form}]); closeModal(); }
    });
  };
  const handleDelete = (item) => { setConfirm({ show: true, type: 'danger', title: 'ยืนยันการลบ', message: `ลบ "${item.name}" ?`, action: () => setItems(p=>p.filter(i=>i.id!==item.id)) }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">จัดการลูกค้า (Clients)</h3><p className="text-muted m-0">อัปเดตโลโก้และรายชื่อลูกค้า ({items.length} ราย)</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" onClick={openAdd}><i className="bi bi-plus-circle me-2"></i>เพิ่มลูกค้า</button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden"><div className="card-body p-0"><div className="table-responsive">
        <table className="table table-hover align-middle m-0">
          <thead className="table-light"><tr><th className="px-4 py-3 border-bottom-0" style={{width:100}}>โลโก้</th><th className="py-3 border-bottom-0">ชื่อลูกค้า</th><th className="py-3 border-bottom-0">หมวดหมู่</th><th className="px-4 py-3 border-bottom-0 text-end" style={{width:140}}>จัดการ</th></tr></thead>
          <tbody>{items.map(c=>(
            <tr key={c.id}><td className="px-4 py-3"><div className="rounded-3 shadow-sm border bg-light d-flex align-items-center justify-content-center p-2" style={{width:70,height:45}}><img src={c.logo} alt={c.name} style={{maxWidth:'100%',maxHeight:'100%',opacity:0.7,filter:'grayscale(100%)'}} /></div></td><td className="py-3 fw-bold text-dark">{c.name}</td><td className="py-3"><span className="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">{c.category}</span></td><td className="px-4 py-3 text-end"><button className="btn btn-sm btn-light text-primary border rounded-3 me-2" onClick={()=>openEdit(c)}><i className="bi bi-pencil-square"></i></button><button className="btn btn-sm btn-light text-danger border rounded-3" onClick={()=>handleDelete(c)}><i className="bi bi-trash"></i></button></td></tr>
          ))}</tbody>
        </table>
      </div></div></div>

      <ModalBackdrop show={showModal} onClose={closeModal}>
            <div className="d-flex justify-content-between align-items-center mb-4"><h5 className="fw-bold m-0">{editId?'แก้ไขลูกค้า':'เพิ่มลูกค้าใหม่'}</h5><button onClick={closeModal} style={{background:'none',border:'none',fontSize:'1.3rem',color:'#94a3b8',cursor:'pointer'}}><i className="bi bi-x-lg"></i></button></div>
            <div className="admin-form-group"><label>ชื่อลูกค้า *</label><input type="text" name="name" value={form.name} onChange={handleChange}/></div>
            <ImageUploader value={form.logo} onChange={(url) => setForm(p => ({ ...p, logo: url }))} label="โลโก้ *" aspectRatio={3/2} />
            <div className="admin-form-group"><label>หมวดหมู่ *</label><select name="category" value={form.category} onChange={handleChange}>{cats.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
            <div className="d-flex gap-3 justify-content-end mt-4"><button onClick={closeModal} style={{padding:'10px 24px',borderRadius:'12px',border:'1.5px solid #e2e8f0',background:'#fff',color:'#64748b',fontWeight:700,cursor:'pointer'}}>ยกเลิก</button><button onClick={handleSave} style={{padding:'10px 28px',borderRadius:'12px',border:'none',background:'#3b82f6',color:'#fff',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 15px rgba(59,130,246,0.3)'}}><i className="bi bi-save me-2"></i>{editId?'บันทึก':'เพิ่ม'}</button></div>
      </ModalBackdrop>
    </div>
  );
}
