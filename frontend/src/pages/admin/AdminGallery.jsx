import { useState, useCallback, useEffect } from 'react';
import { galleryAPI, galleryCategoryAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const emptyForm = { title: '', description: '', category: '', image: '', albumUrl: '' };

export default function AdminGallery() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([galleryAPI.list(), galleryCategoryAPI.list()])
      .then(([iData, cData]) => {
        setItems(iData);
        setCategories(cData);
      }).catch(() => { });
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  // Category Modal States
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCatId, setEditCatId] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', icon: 'bi-images' });

  const [draggedCatIndex, setDraggedCatIndex] = useState(null);

  const handleCatDragStart = (index) => setDraggedCatIndex(index);

  const handleCatDragEnter = (index) => {
    if (draggedCatIndex === null || draggedCatIndex === index) return;
    setCategories(prev => {
      const newCats = [...prev];
      const draggedItem = newCats[draggedCatIndex];
      newCats.splice(draggedCatIndex, 1);
      newCats.splice(index, 0, draggedItem);
      return newCats;
    });
    setDraggedCatIndex(index);
  };

  const handleCatDragEnd = async () => {
    setDraggedCatIndex(null);
    try {
      const reorderedData = categories.map((cat, idx) => ({ id: cat.id, sortOrder: idx + 1 }));
      await galleryCategoryAPI.reorder(reorderedData);
    } catch (e) {
      setStatus({ show: true, status: 'error', message: 'จัดเรียงไม่สำเร็จ: ' + e.message });
    }
  };

  // Gallery Item Drag States
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const handleItemDragStart = (index) => setDraggedItemIndex(index);
  
  const handleItemDragEnter = (index) => {
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    setItems(prev => {
      const newItems = [...prev];
      const draggedItem = newItems[draggedItemIndex];
      newItems.splice(draggedItemIndex, 1);
      newItems.splice(index, 0, draggedItem);
      return newItems;
    });
    setDraggedItemIndex(index);
  };

  const handleItemDragEnd = async () => {
    setDraggedItemIndex(null);
    try {
      const reorderedData = items.map((item, idx) => ({ id: item.id, sortOrder: idx + 1 }));
      await galleryAPI.reorder(reorderedData);
    } catch (e) {
      setStatus({ show: true, status: 'error', message: 'จัดเรียงผลงานไม่สำเร็จ: ' + e.message });
    }
  };

  const handleCatChange = (e) => setCatForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return;
    setLoading(true);
    try {
      if (editCatId) {
        const u = await galleryCategoryAPI.update(editCatId, catForm);
        setCategories(prev => prev.map(c => c.id === editCatId ? u : c));
      } else {
        const c = await galleryCategoryAPI.create({ ...catForm, sortOrder: categories.length + 1 });
        setCategories(prev => [...prev, c]);
      }
      setEditCatId(null);
      setCatForm({ name: '', icon: 'bi-images' });
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setStatus({ show: true, status: 'error', message: e.message });
    }
  };

  const handleDeleteCategory = (cat) => {
    setConfirm({
      show: true, type: 'danger', title: 'ยืนยันการลบหมวดหมู่', message: `ลบหมวดหมู่ "${cat.name}" ?`,
      action: async () => {
        await galleryCategoryAPI.delete(cat.id);
        setCategories(prev => prev.filter(c => c.id !== cat.id));
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  const openAdd = () => { setEditId(null); setForm({ ...emptyForm, category: categories[0]?.name || '' }); setShowModal(true); };
  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ title: item.title, description: item.description || '', category: item.category, image: item.image, albumUrl: item.albumUrl || '' });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };

  const executeAction = useCallback(async (action) => {
    setConfirm(prev => ({ ...prev, show: false }));
    setLoading(true);
    try { await action(); setLoading(false); setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' }); }
    catch (e) { setLoading(false); setStatus({ show: true, status: 'error', message: e.message }); }
  }, []);

  const handleSave = () => {
    if (!form.title.trim() || !form.image.trim()) {
      setStatus({ show: true, status: 'error', message: 'กรุณากรอกชื่อผลงานและรูปปก' }); return;
    }
    setConfirm({
      show: true, type: 'info',
      title: editId ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่มผลงาน',
      message: editId ? `แก้ไข "${form.title}" ?` : `เพิ่มผลงาน "${form.title}" ?`,
      action: async () => {
        if (editId) { const u = await galleryAPI.update(editId, form); setItems(prev => prev.map(i => i.id === editId ? u : i)); }
        else { const c = await galleryAPI.create(form); setItems(prev => [...prev, c]); }
        closeModal();
      }
    });
  };

  const handleDelete = (item) => {
    setConfirm({ show: true, type: 'danger', title: 'ยืนยันการลบ', message: `ลบผลงาน "${item.title}" ?`, action: async () => { await galleryAPI.delete(item.id); setItems(prev => prev.filter(i => i.id !== item.id)); } });
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
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowCatModal(true)}>
            <i className="bi bi-tags"></i>จัดการหมวดหมู่
          </button>
          <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={openAdd}>
            <i className="bi bi-plus-lg"></i>เพิ่มผลงานใหม่
          </button>
        </div>
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
                {items.map((item, index) => (
                  <tr 
                    key={item.id}
                    draggable
                    onDragStart={() => handleItemDragStart(index)}
                    onDragEnter={() => handleItemDragEnter(index)}
                    onDragEnd={handleItemDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ cursor: draggedItemIndex === index ? 'grabbing' : 'grab', opacity: draggedItemIndex === index ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-grip-vertical text-muted me-3 fs-5"></i>
                        <div className="rounded-3 shadow-sm border" style={{ width: 90, height: 60, backgroundImage: `url(${item.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      </div>
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
          <div className="dropdown">
            <button
              className="d-flex justify-content-between align-items-center bg-white w-100"
              type="button"
              data-bs-toggle="dropdown"
              style={{ border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '0 14px', height: '44px', cursor: 'pointer' }}
            >
              <div className="d-flex align-items-center text-dark">
                <i className={`bi ${categories.find(c => c.name === form.category)?.icon || 'bi-images'} text-primary me-2`}></i>
                {form.category || 'เลือกหมวดหมู่'}
              </div>
              <i className="bi bi-chevron-down text-muted small"></i>
            </button>
            <ul className="dropdown-menu shadow w-100 border-0 p-2" style={{ borderRadius: '16px', zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
              {categories.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                    className={`dropdown-item d-flex align-items-center rounded-3 py-2 ${form.category === c.name ? 'bg-primary bg-opacity-10 text-primary fw-bold' : ''}`}
                    onClick={() => setForm(p => ({ ...p, category: c.name }))}
                  >
                    <i className={`bi ${c.icon} me-3 fs-5 ${form.category === c.name ? 'text-primary' : 'text-muted'}`}></i>
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
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
          <button onClick={handleSave} style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--navy)', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(163,217,0,0.3)' }}>
            <i className="bi bi-save me-2"></i>{editId ? 'บันทึก' : 'เพิ่มผลงาน'}
          </button>
        </div>
      </ModalBackdrop>

      {/* Category Manager Modal */}
      <ModalBackdrop show={showCatModal} onClose={() => setShowCatModal(false)}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold m-0">จัดการหมวดหมู่ (Categories)</h5>
          <button onClick={() => setShowCatModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
        </div>

        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-0">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-2 border-bottom-0">ไอคอน</th>
                  <th className="py-2 border-bottom-0">ชื่อหมวดหมู่</th>
                  <th className="px-4 py-2 border-bottom-0 text-end">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    draggable
                    onDragStart={() => handleCatDragStart(index)}
                    onDragEnter={() => handleCatDragEnter(index)}
                    onDragEnd={handleCatDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ cursor: draggedCatIndex === index ? 'grabbing' : 'grab', opacity: draggedCatIndex === index ? 0.5 : 1, transition: 'opacity 0.2s' }}
                  >
                    <td className="px-4 py-2">
                      <i className="bi bi-grip-vertical text-muted me-3"></i>
                      <i className={`bi ${cat.icon} fs-5 text-primary`}></i>
                    </td>
                    <td className="py-2 fw-bold text-dark">{cat.name}</td>
                    <td className="px-4 py-2 text-end">
                      <button className="btn btn-sm btn-light text-primary border rounded-3 me-2" onClick={() => { setEditCatId(cat.id); setCatForm({ name: cat.name, icon: cat.icon }); }}><i className="bi bi-pencil-square"></i></button>
                      <button className="btn btn-sm btn-light text-danger border rounded-3" onClick={() => handleDeleteCategory(cat)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan="3" className="text-center py-4 text-muted">ยังไม่มีหมวดหมู่</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 bg-light rounded-4 border">
          <h6 className="fw-bold mb-3">{editCatId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</h6>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold">ชื่อหมวดหมู่</label>
              <input type="text" className="form-control" name="name" value={catForm.name} onChange={handleCatChange} placeholder="ใส่หมวดหมู่ตรงนี้" />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">เลือกไอคอน</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {['bi-images', 'bi-laptop', 'bi-phone', 'bi-palette', 'bi-people', 'bi-calendar-event', 'bi-building', 'bi-easel', 'bi-camera', 'bi-mic', 'bi-shop', 'bi-code-slash', 'bi-star', 'bi-award', 'bi-globe', 'bi-heart', 'bi-gear', 'bi-check-circle', 'bi-info-circle'].map(icon => (
                  <div
                    key={icon}
                    onClick={() => setCatForm(prev => ({ ...prev, icon }))}
                    className={`rounded border shadow-sm d-flex justify-content-center align-items-center flex-shrink-0 ${catForm.icon === icon ? 'border-primary bg-primary bg-opacity-25' : 'bg-white'}`}
                    style={{ width: 38, height: 38, cursor: 'pointer', transition: 'all 0.2s' }}
                    title={icon}
                  >
                    <i className={`bi ${icon} fs-5 ${catForm.icon === icon ? 'text-primary' : 'text-secondary'}`}></i>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-12 text-end mt-3">
              {editCatId && <button className="btn btn-sm btn-outline-secondary me-2 px-3 rounded-3" onClick={() => { setEditCatId(null); setCatForm({ name: '', icon: 'bi-images' }); }}>ยกเลิกแก้ไข</button>}
              <button className="btn btn-sm btn-primary px-4 rounded-3 fw-bold" onClick={handleSaveCategory}>{editCatId ? 'บันทึก' : 'เพิ่มหมวดหมู่'}</button>
            </div>
          </div>
        </div>
      </ModalBackdrop>
    </div>
  );
}
