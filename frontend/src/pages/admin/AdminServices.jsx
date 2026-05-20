import { useState, useCallback, useEffect } from 'react';
import { serviceAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const iconOptions = [
  'bi-calendar-event', 'bi-music-note-beamed', 'bi-camera-reels', 'bi-people',
  'bi-cup-hot', 'bi-mic', 'bi-gift', 'bi-stars',
  'bi-trophy', 'bi-balloon', 'bi-shop', 'bi-megaphone',
  'bi-display', 'bi-geo-alt', 'bi-ticket-perforated', 'bi-chat-quote', 'bi-magic', 'bi-palette'
];

const emptyForm = { title: '', description: '', icon: 'bi-calendar-event', image: '', isActive: true };

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    serviceAPI.list().then(data => setItems(data)).catch(() => {});
  }, []);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Confirm / Loading / Status flow
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ title: item.title, description: item.description, icon: item.icon, image: item.image || '', isActive: item.isActive !== false });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const executeAction = useCallback(async (action) => {
    setConfirm(prev => ({ ...prev, show: false }));
    setLoading(true);
    try {
      await action();
      setLoading(false);
      setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' });
    } catch (err) {
      setLoading(false);
      setStatus({ show: true, status: 'error', message: err.message || 'เกิดข้อผิดพลาด' });
    }
  }, []);

  const handleSave = () => {
    if (!form.title.trim() || !form.description.trim()) {
      setStatus({ show: true, status: 'error', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }
    setConfirm({
      show: true, type: 'info',
      title: editId ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่มบริการ',
      message: editId ? `แก้ไขข้อมูลบริการ "${form.title}" ?` : `เพิ่มบริการ "${form.title}" ?`,
      action: async () => {
        try {
          if (editId) {
            const updated = await serviceAPI.update(editId, form);
            setItems(prev => prev.map(item => item.id === editId ? updated : item));
          } else {
            const created = await serviceAPI.create(form);
            setItems(prev => [...prev, created]);
          }
          closeModal();
        } catch (err) {
          setStatus({ show: true, status: 'error', message: err.message });
        }
      }
    });
  };

  const handleDelete = (item) => {
    setConfirm({
      show: true, type: 'danger',
      title: 'ยืนยันการลบ',
      message: `ลบบริการ "${item.title}" ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      action: async () => {
        try {
          await serviceAPI.delete(item.id);
          setItems(prev => prev.filter(i => i.id !== item.id));
        } catch (err) {
          setStatus({ show: true, status: 'error', message: err.message });
        }
      }
    });
  };

  const handleToggle = (item) => {
    setConfirm({
      show: true, type: 'warning',
      title: item.isActive ? 'ปิดการแสดงผล' : 'เปิดการแสดงผล',
      message: `${item.isActive ? 'ซ่อน' : 'แสดง'}บริการ "${item.title}" บนหน้าเว็บไซต์?`,
      action: async () => {
        try {
          const updated = await serviceAPI.update(item.id, { isActive: !item.isActive });
          setItems(prev => prev.map(i => i.id === item.id ? updated : i));
        } catch (err) {
          setStatus({ show: true, status: 'error', message: err.message });
        }
      }
    });
  };

  return (
    <div className="anim d1">
      <ConfirmModal
        show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message}
        onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(prev => ({ ...prev, show: false }))}
        confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'}
      />
      <LoadingOverlay show={loading} message="กำลังบันทึกข้อมูล..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(prev => ({ ...prev, show: false }))} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">จัดการบริการ (Services)</h3>
          <p className="text-muted m-0">แก้ไขข้อมูลบริการที่แสดงบนหน้าเว็บไซต์</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={openAdd}>
          <i className="bi bi-plus-lg"></i>เพิ่มบริการใหม่
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 border-bottom-0" style={{ width: 70 }}>ไอคอน</th>
                  <th className="py-3 border-bottom-0" style={{ width: 100 }}>รูปภาพ</th>
                  <th className="py-3 border-bottom-0">ชื่อบริการ</th>
                  <th className="py-3 border-bottom-0 d-none d-lg-table-cell">รายละเอียด</th>
                  <th className="py-3 border-bottom-0 text-center" style={{ width: 90 }}>สถานะ</th>
                  <th className="px-4 py-3 border-bottom-0 text-end" style={{ width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ opacity: item.isActive ? 1 : 0.5 }}>
                    <td className="px-4 py-3 text-center">
                      <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
                        <i className={`bi ${item.icon} fs-5`}></i>
                      </div>
                    </td>
                    <td className="py-3">
                      {item.image && (
                        <div className="rounded-3 border" style={{ width: 70, height: 45, backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      )}
                    </td>
                    <td className="py-3 fw-bold text-dark">{item.title}</td>
                    <td className="py-3 text-muted small d-none d-lg-table-cell" style={{ maxWidth: 280 }}>
                      {(item.description || item.desc || '').substring(0, 60)}...
                    </td>
                    <td className="py-3 text-center">
                      <div className="form-check form-switch d-flex justify-content-center m-0">
                        <input className="form-check-input" type="checkbox" checked={item.isActive} onChange={() => handleToggle(item)} style={{ cursor: 'pointer' }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-sm btn-light text-primary border rounded-3 me-2" title="แก้ไข" onClick={() => openEdit(item)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-sm btn-light text-danger border rounded-3" title="ลบ" onClick={() => handleDelete(item)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">ยังไม่มีข้อมูลบริการ</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ModalBackdrop show={showModal} onClose={closeModal}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0">{editId ? 'แก้ไขบริการ' : 'เพิ่มบริการใหม่'}</h5>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
            </div>

            <div className="admin-form-group">
              <label>ชื่อบริการ *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="เช่น Web Development" />
            </div>
            <div className="admin-form-group">
              <label>คำอธิบาย *</label>
              <textarea name="description" rows="3" value={form.description} onChange={handleChange} placeholder="อธิบายบริการโดยย่อ..."></textarea>
            </div>
            <div className="row g-3">
              <div className="col-6">
                <div className="admin-form-group">
                  <label>ไอคอน</label>
                  <div className="dropdown">
                    <button 
                      className="d-flex justify-content-between align-items-center bg-white" 
                      type="button" 
                      data-bs-toggle="dropdown" 
                      style={{ width: '90px', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0 14px', height: '44px', cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center text-primary">
                        <i className={`bi ${form.icon} fs-5`}></i>
                      </div>
                      <i className="bi bi-chevron-down text-muted small"></i>
                    </button>
                    <ul className="dropdown-menu shadow w-100 border-0 p-3" style={{ borderRadius: '16px', zIndex: 1050 }}>
                      <div className="d-flex flex-wrap gap-2">
                        {iconOptions.map(ico => (
                          <button 
                            type="button"
                            key={ico}
                            className={`btn ${form.icon === ico ? 'btn-primary' : 'btn-light border'} p-0 d-flex align-items-center justify-content-center`}
                            style={{ width: 42, height: 42, borderRadius: '10px' }}
                            onClick={() => setForm(p => ({...p, icon: ico}))}
                          >
                            <i className={`bi ${ico} fs-5`}></i>
                          </button>
                        ))}
                      </div>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="admin-form-group">
                  <label>สถานะ</label>
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <div className="form-check form-switch m-0">
                      <input className="form-check-input" type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} style={{ cursor: 'pointer' }} />
                    </div>
                    <span className="small text-muted">{form.isActive ? 'แสดงผล' : 'ซ่อน'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Image uploader with crop */}
            <ImageUploader
              value={form.image}
              onChange={(url) => setForm(p => ({ ...p, image: url }))}
              label="รูปภาพบริการ"
              aspectRatio={16 / 9}
            />

            <div className="d-flex gap-3 justify-content-end mt-4">
              <button onClick={closeModal} style={{ padding: '10px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>
                ยกเลิก
              </button>
              <button onClick={handleSave} style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--navy)', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(163,217,0,0.3)' }}>
                <i className="bi bi-save me-2"></i>{editId ? 'บันทึกการแก้ไข' : 'เพิ่มบริการ'}
              </button>
            </div>
      </ModalBackdrop>
    </div>
  );
}
