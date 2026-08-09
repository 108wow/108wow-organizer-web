import { useState, useCallback, useEffect } from 'react';
import { equipmentAPI, uploadImage } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const emptyForm = {
  name: '',
  category: 'อุปกรณ์กีฬา',
  description: '',
  coverImage: '',
  images: [],
};

const categoryList = [
  { name: 'อุปกรณ์กีฬา', icon: 'bi-dribbble' },
  { name: 'เครื่องเสียง / ลำโพง', icon: 'bi-speaker-fill' },
  { name: 'เวที / โครงสร้าง / เต็นท์', icon: 'bi-building' },
  { name: 'อุปกรณ์เกม / สันทนาการ', icon: 'bi-controller' },
  { name: 'อุปกรณ์เซฟตี้ / พยาบาล', icon: 'bi-shield-check' },
  { name: 'อุปกรณ์ตกแต่ง / ซุ้มประตู', icon: 'bi-balloon-fill' },
  { name: 'ทั่วไป', icon: 'bi-box-seam' }
];

const getCategoryIcon = (catName) => {
  const match = categoryList.find(c => c.name === catName);
  return match ? match.icon : 'bi-tag-fill';
};

export default function AdminEquipment() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ทั้งหมด');

  // Confirm / Loading / Status flow
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  const loadData = useCallback(() => {
    equipmentAPI.list()
      .then(data => setItems(data || []))
      .catch(err => setStatus({ show: true, status: 'error', message: err.message || 'โหลดข้อมูลล้มเหลว' }));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm);
    setCustomCategoryInput('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    const itemImgs = item.images && item.images.length > 0 ? item.images : (item.coverImage ? [item.coverImage] : []);
    setForm({
      name: item.name || '',
      category: item.category || 'ทั่วไป',
      description: item.description || '',
      coverImage: item.coverImage || (itemImgs[0] || ''),
      images: itemImgs,
    });
    setCustomCategoryInput('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const executeAction = useCallback(async (action) => {
    setConfirm(prev => ({ ...prev, show: false }));
    setLoading(true);
    try {
      if (action) await action();
      setLoading(false);
      setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' });
    } catch (err) {
      setLoading(false);
      setStatus({ show: true, status: 'error', message: err.message || 'เกิดข้อผิดพลาด' });
    }
  }, []);

  // Multi-image file upload handler
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(file => uploadImage(file));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);

      setForm(prev => {
        const updatedImages = [...prev.images, ...newUrls];
        const updatedCover = prev.coverImage || updatedImages[0] || '';
        return {
          ...prev,
          images: updatedImages,
          coverImage: updatedCover
        };
      });
    } catch (err) {
      setStatus({ show: true, status: 'error', message: 'อัปโหลดรูปภาพล้มเหลว: ' + err.message });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setForm(prev => {
      const updatedImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let updatedCover = prev.coverImage;
      if (prev.coverImage === prev.images[indexToRemove]) {
        updatedCover = updatedImages[0] || '';
      }
      return {
        ...prev,
        images: updatedImages,
        coverImage: updatedCover
      };
    });
  };

  const handleSetCover = (imgUrl) => {
    setForm(prev => ({ ...prev, coverImage: imgUrl }));
  };

  const handleSave = () => {
    const finalCategory = customCategoryInput.trim() || form.category || 'ทั่วไป';
    if (!form.name.trim()) {
      setStatus({ show: true, status: 'error', message: 'กรุณาระบุชื่ออุปกรณ์' });
      return;
    }

    const payload = {
      ...form,
      category: finalCategory,
      coverImage: form.coverImage || (form.images[0] || ''),
    };

    setConfirm({
      show: true,
      type: 'info',
      title: editId ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่มอุปกรณ์',
      message: editId ? `แก้ไขข้อมูลอุปกรณ์ "${payload.name}" ?` : `เพิ่มอุปกรณ์ใหม่ "${payload.name}" ?`,
      action: async () => {
        if (editId) {
          await equipmentAPI.update(editId, payload);
        } else {
          await equipmentAPI.create(payload);
        }
        loadData();
        closeModal();
      }
    });
  };

  const handleDelete = (item) => {
    setConfirm({
      show: true,
      type: 'danger',
      title: 'ยืนยันการลบอุปกรณ์',
      message: `ลบอุปกรณ์ "${item.name}" ออกจากระบบ? ข้อมูลภาพและเนื้อหาจะถูกลบทันที`,
      action: async () => {
        await equipmentAPI.delete(item.id);
        loadData();
      }
    });
  };

  // Reorder items
  const handleMove = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Recalculate sort_order
    const reorderedData = newItems.map((item, i) => ({
      id: item.id,
      sortOrder: i
    }));

    setItems(newItems);
    try {
      await equipmentAPI.reorder(reorderedData);
    } catch (err) {
      loadData(); // Revert on failure
      setStatus({ show: true, status: 'error', message: 'เรียงลำดับล้มเหลว' });
    }
  };

  // Category filter options
  const uniqueCategories = ['ทั้งหมด', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))];

  const filteredItems = items.filter(item => {
    const matchCat = filterCategory === 'ทั้งหมด' || item.category === filterCategory;
    const matchSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="anim d1">
      <ConfirmModal
        show={confirm.show}
        type={confirm.type}
        title={confirm.title}
        message={confirm.message}
        onConfirm={() => executeAction(confirm.action)}
        onCancel={() => setConfirm(prev => ({ ...prev, show: false }))}
        confirmText={confirm.type === 'danger' ? 'ลบอุปกรณ์' : 'ยืนยัน'}
      />
      <LoadingOverlay show={loading} message="กำลังบันทึกข้อมูล..." />
      <StatusModal
        show={status.show}
        status={status.status}
        message={status.message}
        onClose={() => setStatus(prev => ({ ...prev, show: false }))}
      />

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <i className="bi bi-box-seam text-primary"></i> จัดการอุปกรณ์ (Equipment)
          </h3>
          <p className="text-muted m-0 small mt-1">
            เพิ่ม แก้ไข ลบ และจัดเรียงรายการอุปกรณ์ให้เช่า/แสดงบนหน้าเว็บไซต์
          </p>
        </div>
        <button 
          className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 shadow-sm d-flex align-items-center gap-2 align-self-start align-self-md-auto"
          onClick={openAdd}
        >
          <i className="bi bi-plus-circle-fill fs-5"></i> เพิ่มอุปกรณ์ใหม่
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="position-relative">
              <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control ps-5 py-2 rounded-3 border-light-subtle"
                placeholder="ค้นหาอุปกรณ์ตามชื่อหรือรายละเอียด..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ fontSize: '0.9rem' }}
              />
            </div>
          </div>
          <div className="col-md-7 d-flex justify-content-md-end gap-2 overflow-x-auto py-1">
            {uniqueCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`btn btn-sm rounded-pill px-3 fw-semibold text-nowrap ${filterCategory === cat ? 'btn-dark' : 'btn-light text-secondary border'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-3 py-3 border-bottom-0 text-center" style={{ width: 80 }}>เรียงลำดับ</th>
                  <th className="py-3 border-bottom-0" style={{ width: 90 }}>รูปปก</th>
                  <th className="py-3 border-bottom-0">ชื่ออุปกรณ์</th>
                  <th className="py-3 border-bottom-0" style={{ width: 160 }}>หมวดหมู่</th>
                  <th className="py-3 border-bottom-0 d-none d-lg-table-cell">รายละเอียด</th>
                  <th className="py-3 border-bottom-0 text-center" style={{ width: 100 }}>จำนวนรูป</th>
                  <th className="px-4 py-3 border-bottom-0 text-end" style={{ width: 130 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, index) => {
                  const imgs = item.images && item.images.length > 0 ? item.images : (item.coverImage ? [item.coverImage] : []);
                  const cover = item.coverImage || (imgs[0] || '');

                  return (
                    <tr key={item.id}>
                      {/* Move Up/Down */}
                      <td className="px-2 py-3 text-center">
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            className="btn btn-sm btn-light border p-1 text-secondary"
                            disabled={index === 0 || filterCategory !== 'ทั้งหมด' || !!searchQuery}
                            onClick={() => handleMove(index, -1)}
                            title="เลื่อนขึ้น"
                          >
                            <i className="bi bi-arrow-up"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-light border p-1 text-secondary"
                            disabled={index === items.length - 1 || filterCategory !== 'ทั้งหมด' || !!searchQuery}
                            onClick={() => handleMove(index, 1)}
                            title="เลื่อนลง"
                          >
                            <i className="bi bi-arrow-down"></i>
                          </button>
                        </div>
                      </td>

                      {/* Cover Photo */}
                      <td className="py-3">
                        <div 
                          className="rounded-3 border bg-light overflow-hidden position-relative" 
                          style={{ width: 70, height: 50, backgroundSize: 'cover', backgroundPosition: 'center', backgroundImage: cover ? `url(${cover})` : 'none' }}
                        >
                          {!cover && (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                              <i className="bi bi-image"></i>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3">
                        <div className="fw-bold text-dark">{item.name}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3">
                        <span className="badge bg-secondary bg-opacity-10 text-dark border px-2.5 py-1.5 rounded-pill fw-semibold" style={{ fontSize: '0.78rem' }}>
                          {item.category}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-3 text-muted small d-none d-lg-table-cell" style={{ maxWidth: 260 }}>
                        {item.description ? (
                          item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description
                        ) : (
                          <span className="text-black-50 fst-italic">ไม่มีคำอธิบาย</span>
                        )}
                      </td>

                      {/* Photo Count */}
                      <td className="py-3 text-center">
                        <span className="badge bg-primary bg-opacity-15 text-primary fw-bold px-2.5 py-1 rounded-3">
                          <i className="bi bi-camera-fill me-1"></i> {imgs.length} รูป
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-end">
                        <button 
                          className="btn btn-sm btn-light text-primary border rounded-3 me-2" 
                          title="แก้ไข" 
                          onClick={() => openEdit(item)}
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-light text-danger border rounded-3" 
                          title="ลบ" 
                          onClick={() => handleDelete(item)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-2 d-block mb-2 text-black-50"></i>
                      ไม่พบข้อมูลอุปกรณ์
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Equipment Modal */}
      <ModalBackdrop show={showModal} onClose={closeModal}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold m-0 text-dark">
            <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-plus-circle'} text-primary me-2`}></i>
            {editId ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่'}
          </h5>
          <button 
            onClick={closeModal} 
            className="btn-close shadow-none" 
            style={{ fontSize: '1rem' }}
          ></button>
        </div>

        {/* Equipment Name */}
        <div className="admin-form-group mb-3">
          <label className="fw-bold text-dark small mb-1">ชื่ออุปกรณ์ *</label>
          <input 
            type="text" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="เช่น ชุดลำโพงพกพา 500W, ลูกบอลยักษ์สปอร์ตเดย์" 
            className="form-control rounded-3"
          />
        </div>

        {/* Category Selection */}
        <div className="admin-form-group mb-3">
          <label className="fw-bold text-dark small mb-1">หมวดหมู่อุปกรณ์ *</label>
          <div className="row g-2">
            <div className="col-md-6">
              <div className="dropdown">
                <button
                  className="btn bg-white border w-100 d-flex justify-content-between align-items-center px-3 rounded-3 text-start shadow-sm"
                  type="button"
                  data-bs-toggle="dropdown"
                  style={{ borderColor: '#e2e8f0', minHeight: '44px' }}
                >
                  <div className="d-flex align-items-center text-dark text-truncate">
                    <i className={`bi ${getCategoryIcon(form.category)} text-primary me-2 fs-6`}></i>
                    <span className="fw-semibold text-truncate" style={{ fontSize: '0.88rem' }}>
                      {customCategoryInput ? customCategoryInput : (form.category || 'เลือกหมวดหมู่')}
                    </span>
                  </div>
                  <i className="bi bi-chevron-down text-muted small ms-2"></i>
                </button>
                <ul className="dropdown-menu admin-dropdown-menu shadow-lg w-100 border-0 p-2" style={{ maxHeight: '260px', overflowY: 'auto', zIndex: 1050 }}>
                  {categoryList.map(c => (
                    <li key={c.name}>
                      <button
                        type="button"
                        className={`dropdown-item d-flex align-items-center gap-2 rounded-2 py-2 ${form.category === c.name && !customCategoryInput ? 'bg-primary bg-opacity-20 text-dark fw-bold' : ''}`}
                        onClick={() => {
                          setForm(prev => ({ ...prev, category: c.name }));
                          setCustomCategoryInput('');
                        }}
                      >
                        <i className={`bi ${c.icon} ${form.category === c.name && !customCategoryInput ? 'text-dark' : 'text-primary'}`}></i>
                        <span>{c.name}</span>
                        {form.category === c.name && !customCategoryInput && <i className="bi bi-check-circle-fill ms-auto text-dark"></i>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="position-relative">
                <i className="bi bi-pencil position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input 
                  type="text" 
                  value={customCategoryInput} 
                  onChange={(e) => setCustomCategoryInput(e.target.value)} 
                  placeholder="หรือพิมพ์ชื่อหมวดหมู่ใหม่..." 
                  className="form-control rounded-3 ps-5"
                  style={{ minHeight: '44px', borderColor: '#e2e8f0', fontSize: '0.88rem' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="admin-form-group mb-3">
          <label className="fw-bold text-dark small mb-1">รายละเอียดอุปกรณ์</label>
          <textarea 
            name="description" 
            rows="3" 
            value={form.description} 
            onChange={handleChange} 
            placeholder="ใส่รายละเอียด ขนาด คุณสมบัติ หรือคำแนะนำของอุปกรณ์..."
            className="form-control rounded-3"
          ></textarea>
        </div>

        {/* Multi-Image Upload Section */}
        <div className="mb-4 p-3 bg-light rounded-4 border">
          <label className="fw-bold text-dark small mb-2 d-flex justify-content-between align-items-center">
            <span><i className="bi bi-images text-primary me-1"></i> อัลบั้มรูปภาพอุปกรณ์ (อัปโหลดได้หลายรูป)</span>
            <span className="badge bg-secondary">{form.images.length} รูป</span>
          </label>

          {/* Upload Button */}
          <div className="mb-3">
            <label className="btn btn-outline-primary w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2 fw-semibold" style={{ borderStyle: 'dashed', cursor: 'pointer' }}>
              <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
              {isUploading ? 'กำลังอัปโหลดรูปภาพ...' : 'คลิกเพื่อเลือกอัปโหลดรูปภาพ (เลือกพร้อมกันได้หลายรูป)'}
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileUpload} 
                disabled={isUploading} 
                className="d-none" 
              />
            </label>
          </div>

          {/* Uploaded Images List Grid */}
          {form.images.length > 0 && (
            <div className="row g-2">
              {form.images.map((imgUrl, idx) => {
                const isCover = form.coverImage === imgUrl || (!form.coverImage && idx === 0);
                return (
                  <div key={idx} className="col-4 col-sm-3 col-md-3">
                    <div className={`position-relative rounded-3 overflow-hidden border-2 transition-all ${isCover ? 'border-primary shadow-sm' : 'border-light'}`} style={{ height: '90px', background: '#000' }}>
                      <img src={imgUrl} alt={`uploaded-${idx}`} className="w-100 h-100 object-fit-cover opacity-90" />
                      
                      {/* Is Cover Indicator */}
                      {isCover && (
                        <span className="position-absolute top-0 start-0 m-1 badge bg-primary text-dark font-weight-bold" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-star-fill me-1"></i>รูปปก
                        </span>
                      )}

                      {/* Action buttons inside thumbnail */}
                      <div className="position-absolute bottom-0 inset-x-0 p-1 bg-dark bg-opacity-75 d-flex justify-content-between align-items-center">
                        <button
                          type="button"
                          onClick={() => handleSetCover(imgUrl)}
                          className={`btn btn-xs p-0 border-0 ${isCover ? 'text-warning' : 'text-white-50'}`}
                          title="ตั้งเป็นรูปปกหลัก"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className={`bi ${isCover ? 'bi-star-fill' : 'bi-star'}`}></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="btn btn-xs text-danger p-0 border-0 ms-auto"
                          title="ลบรูปนี้"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="d-flex gap-2 justify-content-end mt-4">
          <button 
            type="button" 
            onClick={closeModal} 
            className="btn btn-light rounded-3 px-4 fw-semibold text-secondary"
          >
            ยกเลิก
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            className="btn btn-primary rounded-3 px-4 fw-bold shadow-sm d-flex align-items-center gap-2"
          >
            <i className="bi bi-check-circle-fill"></i>
            {editId ? 'บันทึกการแก้ไข' : 'บันทึกอุปกรณ์'}
          </button>
        </div>
      </ModalBackdrop>
    </div>
  );
}
