import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { blogAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminBlog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Derived state for pagination
  const totalPages = Math.max(1, Math.ceil(posts.length / itemsPerPage));
  const paginatedPosts = posts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 if posts array changes significantly or if itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  useEffect(() => {
    blogAPI.listAll().catch(() => blogAPI.listPublished()).then(data => { setPosts(data); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);

  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, status: 'success', message: '' });

  const executeAction = useCallback(async (action) => { setConfirm(p => ({ ...p, show: false })); setLoading(true); try { await action(); setLoading(false); setStatus({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' }); } catch (e) { setLoading(false); setStatus({ show: true, status: 'error', message: e.message }); } }, []);

  const handleDelete = (item) => {
    setConfirm({
      show: true, type: 'danger', title: 'ยืนยันการลบ',
      message: `ลบบทความ "${item.title}" ?`,
      action: async () => { await blogAPI.delete(item.id); setPosts(p => p.filter(i => i.id !== item.id)); }
    });
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => executeAction(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'} />
      <LoadingOverlay show={loading} message="กำลังดำเนินการ..." />
      <StatusModal show={status.show} status={status.status} message={status.message} onClose={() => setStatus(p => ({ ...p, show: false }))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">จัดการบทความ (Blog)</h3><p className="text-muted m-0">จัดการข่าวสารและบทความต่างๆ บนเว็บไซต์</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2"
          onClick={() => navigate('/admin/blog/new')}>
          <i className="bi bi-pencil-square"></i>เขียนบทความใหม่
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {!loaded ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: 32, height: 32 }}></div>
              <div className="text-muted mt-2 small">กำลังโหลด...</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-journal-text text-muted" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
              <div className="text-muted mt-2">ยังไม่มีบทความ</div>
              <button className="btn btn-primary btn-sm mt-3 rounded-pill px-4"
                onClick={() => navigate('/admin/blog/new')}>
                <i className="bi bi-plus-lg me-1"></i>เขียนบทความแรก
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
              <table className="table table-hover align-middle m-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 border-bottom-0">ภาพปก</th>
                    <th className="py-3 border-bottom-0">หัวข้อบทความ</th>
                    <th className="py-3 border-bottom-0">สถานะ</th>
                    <th className="py-3 border-bottom-0">สร้างเมื่อ</th>
                    <th className="py-3 border-bottom-0">แก้ไขล่าสุด</th>
                    <th className="px-4 py-3 border-bottom-0 text-end" style={{ width: 140 }}>จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPosts.map(post => (
                    <tr key={post.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                      <td className="px-4 py-3">
                        <div className="rounded-3 shadow-sm border" style={{ width: 100, height: 60, backgroundImage: `url(${post.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                      </td>
                      <td className="py-3">
                        <div className="fw-bold text-dark mb-1">{post.title}</div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: 280 }}>{post.excerpt}</div>
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-1 ${post.status === 'published' ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-secondary border'}`}>
                          {post.status === 'published' ? 'เผยแพร่' : 'แบบร่าง'}
                        </span>
                      </td>
                      <td className="py-3"><span className="text-muted small"><i className="bi bi-calendar3 me-1"></i>{formatDate(post.created_at)}</span></td>
                      <td className="py-3"><span className="text-muted small"><i className="bi bi-pencil me-1"></i>{formatDate(post.updated_at)}</span></td>
                      <td className="px-4 py-3 text-end" onClick={(e) => e.stopPropagation()}>
                        <button className="btn btn-sm btn-light text-primary border rounded-3 me-2"
                          onClick={() => navigate(`/admin/blog/edit/${post.id}`)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-sm btn-light text-danger border rounded-3"
                          onClick={() => handleDelete(post)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* ── Pagination Controls ── */}
          <div className="card-footer bg-white border-top py-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span>แสดง</span>
              <select
                className="form-select form-select-sm shadow-none border-0 bg-light fw-bold text-dark"
                style={{ width: 'auto', cursor: 'pointer', borderRadius: '8px' }}
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span>รายการ</span>
              <span className="ms-3 border-start ps-3">
                รวมทั้งหมด <strong className="text-dark">{posts.length}</strong> รายการ
              </span>
            </div>

            {totalPages > 1 && (
              <div className="d-flex align-items-center gap-1">
                <button
                  className="btn btn-sm btn-light border rounded-2"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn btn-sm rounded-2 ${currentPage === page ? 'btn-primary fw-bold' : 'btn-light border text-muted'}`}
                    style={{ width: 32 }}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="btn btn-sm btn-light border rounded-2"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            )}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
