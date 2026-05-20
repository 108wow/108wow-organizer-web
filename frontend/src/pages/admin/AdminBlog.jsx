import { useState, useCallback, useEffect } from 'react';
import { blogAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const emptyForm = { title: '', excerpt: '', content: '', image: '', author: '', date: '', tag: '', status: 'draft' };

export default function AdminBlog() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    blogAPI.listAll().catch(() => blogAPI.listPublished()).then(data => setPosts(data)).catch(() => {});
  }, []);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => { const { name, value } = e.target; setForm(prev => ({ ...prev, [name]: value })); };
  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p) => { setEditId(p.id); setForm({ title: p.title, excerpt: p.excerpt, content: p.content || '', image: p.image, author: p.author, date: p.date, tag: p.tag || '', status: p.status || 'published' }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditId(null); setForm(emptyForm); };
  const executeAction = useCallback(async (action) => { setConfirm(p => ({ ...p, show: false })); setLoading(true); try { await action(); setLoading(false); setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' }); } catch(e) { setLoading(false); setStatus({ show: true, status: 'error', message: e.message }); } }, []);

  const handleSave = () => {
    if (!form.title.trim() || !form.excerpt.trim()) { setStatus({ show: true, status: 'error', message: 'กรุณากรอกหัวข้อและเนื้อหาย่อ' }); return; }
    setConfirm({ show: true, type: 'info', title: editId ? 'ยืนยันการแก้ไข' : 'ยืนยันการเพิ่มบทความ', message: `${editId ? 'แก้ไข' : 'เพิ่ม'}บทความ "${form.title}" ?`,
      action: async () => {
        if (editId) { const u = await blogAPI.update(editId, form); setPosts(prev => prev.map(i => i.id === editId ? u : i)); }
        else { const c = await blogAPI.create(form); setPosts(prev => [...prev, c]); }
        closeModal();
      }
    });
  };
  const handleDelete = (item) => { setConfirm({ show: true, type: 'danger', title: 'ยืนยันการลบ', message: `ลบบทความ "${item.title}" ?`, action: async () => { await blogAPI.delete(item.id); setPosts(p => p.filter(i => i.id !== item.id)); } }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'} />
      <LoadingOverlay show={loading} message="กำลังบันทึกข้อมูล..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(p => ({ ...p, show: false }))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">จัดการบทความ (Blog)</h3><p className="text-muted m-0">จัดการข่าวสารและบทความต่างๆ บนเว็บไซต์</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={openAdd}><i className="bi bi-pencil-square"></i>เขียนบทความใหม่</button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4 py-3 border-bottom-0">ภาพปก</th>
                  <th className="py-3 border-bottom-0">หัวข้อบทความ</th>
                  <th className="py-3 border-bottom-0">สถานะ</th>
                  <th className="py-3 border-bottom-0">วันที่</th>
                  <th className="px-4 py-3 border-bottom-0 text-end" style={{ width: 140 }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id}>
                    <td className="px-4 py-3"><div className="rounded-3 shadow-sm border" style={{ width: 100, height: 60, backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div></td>
                    <td className="py-3"><div className="fw-bold text-dark mb-1">{post.title}</div><div className="text-muted small text-truncate" style={{ maxWidth: 280 }}>{post.excerpt}</div></td>
                    <td className="py-3">
                      <span className={`badge rounded-pill px-3 py-1 ${post.status === 'published' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`}>
                        {post.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                      </span>
                    </td>
                    <td className="py-3"><span className="text-muted small"><i className="bi bi-calendar3 me-1"></i>{post.date}</span></td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-sm btn-light text-primary border rounded-3 me-2" onClick={() => openEdit(post)}><i className="bi bi-pencil-square"></i></button>
                      <button className="btn btn-sm btn-light text-danger border rounded-3" onClick={() => handleDelete(post)}><i className="bi bi-trash"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalBackdrop show={showModal} onClose={closeModal}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0">{editId ? 'แก้ไขบทความ' : 'เขียนบทความใหม่'}</h5>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#94a3b8', cursor: 'pointer' }}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="admin-form-group"><label>หัวข้อ *</label><input type="text" name="title" value={form.title} onChange={handleChange} placeholder="หัวข้อบทความ" /></div>
            <div className="admin-form-group"><label>เนื้อหาย่อ *</label><textarea name="excerpt" rows="2" value={form.excerpt} onChange={handleChange} placeholder="สรุปเนื้อหาสั้นๆ..."></textarea></div>
            <div className="admin-form-group"><label>เนื้อหาเต็ม</label><textarea name="content" rows="5" value={form.content} onChange={handleChange} placeholder="เนื้อหาบทความทั้งหมด..."></textarea></div>
            <div className="row g-3">
              <div className="col-6"><div className="admin-form-group"><label>ผู้เขียน *</label><input type="text" name="author" value={form.author} onChange={handleChange} placeholder="ชื่อผู้เขียน" /></div></div>
              <div className="col-6"><div className="admin-form-group"><label>วันที่</label><input type="text" name="date" value={form.date} onChange={handleChange} placeholder="เช่น 20 เม.ย. 2026" /></div></div>
            </div>
            <div className="row g-3">
              <div className="col-6"><div className="admin-form-group"><label>Tags</label><input type="text" name="tag" value={form.tag} onChange={handleChange} placeholder="Technology, Design" /></div></div>
              <div className="col-6"><div className="admin-form-group"><label>สถานะ</label><select name="status" value={form.status} onChange={handleChange}><option value="draft">แบบร่าง (Draft)</option><option value="published">เผยแพร่ (Published)</option></select></div></div>
            </div>
            <ImageUploader value={form.image} onChange={(url) => setForm(p => ({ ...p, image: url }))} label="รูปปก (Cover Image)" aspectRatio={16/9} />
            <div className="d-flex gap-3 justify-content-end mt-4">
              <button onClick={closeModal} style={{ padding: '10px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSave} style={{ padding: '10px 28px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: 'var(--navy)', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(163,217,0,0.3)' }}><i className="bi bi-save me-2"></i>{editId ? 'บันทึก' : 'เพิ่มบทความ'}</button>
            </div>
      </ModalBackdrop>
    </div>
  );
}
