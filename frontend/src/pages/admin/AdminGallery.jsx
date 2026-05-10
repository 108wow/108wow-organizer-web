import { useState, useCallback } from 'react';
import { galleryItems as mockGallery } from '../../data/mockData';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const categoryOptions = ['Web', 'Mobile', 'Design', 'Team Building', 'Seminar', 'Other'];
const emptyForm = { title: '', description: '', category: 'Web', image: '', albumUrl: '' };

export default function AdminGallery() {
  const [items, setItems] = useState(mockGallery.map(g => ({ ...g, albumUrl: g.albumUrl || '' })));
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ title: item.title, description: item.description || '', category: item.category, image: item.image, albumUrl: item.albumUrl || '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const executeAction = useCallback((action) => {
    setConfirm(prev => ({ ...prev, show: false }));
    setLoading(true);
    setTimeout(() => { action(); setLoading(false); setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' }); }, 1200);
  }, []);

  const handleSave = () => {
    if (!form.title.trim() || !form.image.trim()) {
      setStatus({ show: true, status: 'error', message: 'กรุณากรอกชื่อผลงานและรูปปก' }); return;
    }
    setConfirm({
      show: true, type: 'info',
      title: editId ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่มผลงาน',
      message: editId ? `แก้ไข "${form.title}" ?` : `เพิ่มผลงาน "${form.title}" ?`,
      action: () => {
        if (editId) setItems(prev => prev.map(i => i.id === editId ? { ...i, ...form } : i));
        else setItems(prev => [...prev, { id: Math.max(...prev.map(i => i.id), 0) + 1, ...form }]);
        closeModal();
      }
    });
  };

  const handleDelete = (item) => {
    setConfirm({ show: true, type: 'danger', title: 'ยืนยันการลบ', message: `ลบผลงาน "${item.title}" ?`, action: () => setItems(prev => prev.filter(i => i.id !== item.id)) });
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'} />
      <LoadingOverlay show={loading} message="กำลังบันทึกข้อมูล..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(p => ({ ...p, show: false }))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">จัดการแกลลอรี่ (Gallery)</h3>
          <p className="text-muted m-0">เพิ่ม ลบ หรือแก้ไขผลงาน — รองรับลิงก์ Google Photos Album</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={openAdd}>
          <i className="bi bi-plus-lg"></i>เพิ่มผลงานใหม่
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 border-bottom-0">รูปปก</th>
                  <th className="py-3 border-bottom-0">ชื่อผลงาน</th>
                  <th className="py-3 border-bottom-0">หมวดหมู่</th>
                  <th className="py-3 border-bottom-0 d-none d-lg-table-cell">Google Photos</th>
                  <th className="px-4 py-3 border-bottom-0 text-end" style={{ width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="rounded-3 shadow-sm border" style={{ width: 90, height: 60, backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    </td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{item.title}</div>
                      {item.description && <div className="text-muted small text-truncate" style={{ maxWidth: 220 }}>{item.description}</div>}
                    </td>
                    <td className="py-3">
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border px-2 py-1">{item.category}</span>
                    </td>
                    <td className="py-3 d-none d-lg-table-cell">
                      {item.albumUrl ? (
                        <a href={item.albumUrl} target="_blank" rel="noopener noreferrer" className="text-primary small">
                          <i className="bi bi-box-arrow-up-right me-1"></i>เปิด Album
                        </a>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-sm btn-light text-primary border rounded-3 me-2" onClick={() => openEdit(item)}><i className="bi bi-pencil-square"></i></button>
                      <button className="btn btn-sm btn-light text-danger border rounded-3" onClick={() => handleDelete(item)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan="5" className="text-center py-5 text-muted">ยังไม่มีข้อมูลผลงาน</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ModalBackdrop show={showModal} onClose={closeModal}>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0">{editId ? 'แก้ไขผลงาน' : 'เพิ่มผลงานใหม่'}</h5>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
            </div>

            <div className="admin-form-group">
              <label>ชื่อผลงาน *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="เช่น Team Building 2024" />
            </div>
            <div className="admin-form-group">
              <label>คำอธิบาย</label>
              <textarea name="description" rows="2" value={form.description} onChange={handleChange} placeholder="รายละเอียดเพิ่มเติม..."></textarea>
            </div>
            <div className="admin-form-group">
              <label>หมวดหมู่ *</label>
              <select name="category" value={form.category} onChange={handleChange}>
                {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm(p => ({ ...p, image: url }))}
              label="รูปปก Thumbnail *"
              aspectRatio={16 / 9}
            />

            {/* Google Photos Album Link */}
            <div className="admin-form-group">
              <label><i className="bi bi-google me-1 text-primary"></i>Google Photos Album URL</label>
              <input type="text" name="albumUrl" value={form.albumUrl} onChange={handleChange} placeholder="https://photos.google.com/share/..." />
              <small className="text-muted d-block mt-1">ลิงก์จาก Google Photos ที่ share เป็น public — เมื่อ user คลิกจะเปิดในแท็บใหม่</small>
            </div>

            <div className="d-flex gap-3 justify-content-end mt-4">
              <button onClick={closeModal} style={{ padding: '10px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSave} style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}>
                <i className="bi bi-save me-2"></i>{editId ? 'บันทึก' : 'เพิ่มผลงาน'}
              </button>
            </div>
      </ModalBackdrop>
    </div>
  );
}
