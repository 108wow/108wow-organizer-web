import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, logout as apiLogout, companyAPI } from '../../api';
import ConfirmModal from './ConfirmModal';
import LoadingOverlay from './LoadingOverlay';
import StatusModal from './StatusModal';

// Context for admin modals — renders modals at layout root (outside scrollable content)
const AdminModalContext = createContext(null);

export function useAdminModal() {
  return useContext(AdminModalContext);
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const user = getUser();
  
  const [companyInfo, setCompanyInfo] = useState({});

  useEffect(() => {
    companyAPI.get().then(setCompanyInfo).catch(console.error);
  }, []);

  const handleLogout = () => {
    apiLogout();
    navigate('/admin/login');
  };

  // Global modal state — rendered at root level, outside scrollable content
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const executeAction = useCallback(async (action) => {
    setConfirm(p => ({ ...p, show: false }));
    setLoading(true);
    try {
      if (action) await action();
      setLoading(false);
      setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อยแล้ว' });
    } catch (err) {
      setLoading(false);
      setStatusM({ show: true, status: 'error', message: err.message || 'เกิดข้อผิดพลาด' });
    }
  }, []);

  const showConfirm = useCallback((opts) => setConfirm({ show: true, ...opts }), []);
  const showLoading = useCallback((msg) => setLoading(msg || true), []);
  const hideLoading = useCallback(() => setLoading(false), []);
  const showStatus = useCallback((status, message) => setStatusM({ show: true, status, message }), []);

  const modalCtx = { showConfirm, showLoading, hideLoading, showStatus, executeAction, setConfirm, setLoading, setStatusM };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'bi-grid' },
    { name: 'จัดการหน้าแรก (Home)', path: '/admin/home-settings', icon: 'bi-house-gear' },
    { name: 'แบนเนอร์หลัก (Main Hero)', path: '/admin/hero', icon: 'bi-images' },
    { name: 'แบนเนอร์ย่อย (Page Heroes)', path: '/admin/page-heroes', icon: 'bi-card-heading' },
    { name: 'บริการ (Services)', path: '/admin/services', icon: 'bi-briefcase' },
    { name: 'แกลลอรี่ (Gallery)', path: '/admin/gallery', icon: 'bi-collection' },
    { name: 'บทความ (Blog)', path: '/admin/blog', icon: 'bi-journal-text' },
    { name: 'ทีมงาน (Team)', path: '/admin/team', icon: 'bi-people' },
    { name: 'ลูกค้า (Clients)', path: '/admin/clients', icon: 'bi-building' },
    { name: 'เกี่ยวกับเรา (About Us)', path: '/admin/about', icon: 'bi-info-circle' },
    { name: 'ติดต่อเรา (Contact)', path: '/admin/contact', icon: 'bi-envelope' },
    { name: 'ตั้งค่าทั่วไป (Settings)', path: '/admin/settings', icon: 'bi-gear' },
  ];

  return (
    <AdminModalContext.Provider value={modalCtx}>
      <div className="admin-layout d-flex" style={{ minHeight: '100vh', backgroundColor: '#f0f4f8' }}>
        {/* Sidebar - Dark Premium Theme */}
        <div className="admin-sidebar d-flex flex-column shadow-lg" style={{ width: '250px', zIndex: 10, background: 'var(--navy)', color: '#fff', flexShrink: 0 }}>
          <div className="p-3 pb-2 d-flex align-items-center gap-2">
            <div className="d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <img src="/logo-white.png" alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="bg-primary rounded-3 align-items-center justify-content-center" style={{ width: 36, height: 36, display: 'none' }}>
                <i className="bi bi-emoji-smile text-white" style={{ fontSize: '1.2rem' }}></i>
              </div>
            </div>
            <div>
              <h6 className="m-0 fw-bold text-white text-truncate" style={{ fontSize: '.85rem', lineHeight: 1.2, maxWidth: '170px' }}>{companyInfo.name || 'ระบบจัดการ'}</h6>
            </div>
          </div>
          
          <div className="px-2 flex-grow-1" style={{ overflowY: 'auto' }}>
            <div className="small fw-bold text-uppercase mb-2 px-3 pt-2" style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '1px', fontSize: '.6rem' }}>เมนูหลัก</div>
            <ul className="nav flex-column gap-0">
              {menuItems.map((item, i) => {
                const isActive = path === item.path || (path.startsWith(item.path) && item.path !== '/admin');
                return (
                  <li className="nav-item" key={i}>
                    <Link 
                      to={item.path} 
                      className="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                      style={{ 
                        fontWeight: isActive ? 700 : 500, 
                        fontSize: '.78rem',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                        background: isActive ? 'linear-gradient(90deg, rgba(163,217,0,0.15) 0%, rgba(163,217,0,0) 100%)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <i className={`bi ${item.icon} ${isActive ? 'text-primary' : ''}`} style={{ fontSize: '.9rem' }}></i>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-3 mt-auto border-top" style={{ borderColor: 'rgba(255,255,255,0.05) !important' }}>
            <Link to="/" className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 mb-2" style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '.78rem' }}>
              <i className="bi bi-box-arrow-left"></i> กลับไปเว็บไซต์หลัก
            </Link>
            <button onClick={handleLogout} className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3" style={{ padding: '8px', fontSize: '.78rem' }}>
              <i className="bi bi-power"></i> ออกจากระบบ
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto', height: '100vh' }}>
          {/* Top Navbar */}
          <header className="bg-white px-5 py-3 d-flex justify-content-between align-items-center shadow-sm" style={{ zIndex: 9, position: 'sticky', top: 0 }}>
            <h5 className="m-0 fw-bold text-dark d-flex align-items-center gap-2">
              <span className="bg-primary text-white rounded-pill px-3 py-1 small" style={{ fontSize: '0.75rem' }}>BETA</span>
              ระบบจัดการเนื้อหาเว็บไซต์
            </h5>
            <div className="d-flex align-items-center gap-4">
              <button className="btn btn-light rounded-circle p-2 position-relative">
                <i className="bi bi-bell fs-5 text-secondary"></i>
                <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
              </button>
              <div className="d-flex align-items-center gap-3 border-start ps-4">
                <div className="text-end">
                  <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>{user?.displayName || 'Admin'}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{user?.username || 'admin'}</div>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: 45, height: 45 }}>
                  <i className="bi bi-person-fill fs-4"></i>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content Outlet */}
          <main className="p-5 flex-grow-1">
            <div className="container-fluid p-0" style={{ maxWidth: '1400px' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminModalContext.Provider>
  );
}
