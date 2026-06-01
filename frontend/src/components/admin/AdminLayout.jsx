import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, logout as apiLogout, companyAPI } from '../../api';
import ConfirmModal from './ConfirmModal';
import LoadingOverlay from './LoadingOverlay';
import StatusModal from './StatusModal';

// Context for admin modals — renders modals at layout root (outside scrollable content)
const AdminModalContext = createContext(null);

function useAdminModal() {
  return useContext(AdminModalContext);
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const user = getUser();

  const [companyInfo, setCompanyInfo] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.admin-sidebar-footer')) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="admin-layout d-flex" style={{ minHeight: '100vh', backgroundColor: '#f0f4f8', overflow: 'hidden' }}>
        <style>{`
          .admin-sidebar {
            width: 260px;
            z-index: 1040;
            background: var(--navy);
            border-right: 1px solid rgba(255,255,255,0.05);
            color: #fff;
            flex-shrink: 0;
            transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          /* Desktop behavior */
          @media (min-width: 769px) {
            .admin-sidebar.collapsed {
              width: 80px;
            }
            .admin-sidebar.collapsed .sidebar-text,
            .admin-sidebar.collapsed .sidebar-title,
            .admin-sidebar.collapsed .sidebar-logo-container {
              display: none !important;
            }
            .admin-sidebar.collapsed .sidebar-header-box {
              flex-direction: column;
              padding: 1rem 0 !important;
              gap: 15px !important;
            }
            .admin-sidebar.collapsed .sidebar-toggle-btn {
              margin: 0 !important;
            }
            .admin-sidebar.collapsed .nav-link {
              justify-content: center;
              padding: 0.8rem 0 !important;
            }
            .admin-sidebar.collapsed .nav-link i {
              font-size: 1.3rem !important;
            }
            .admin-sidebar.collapsed .sidebar-footer-btn {
              justify-content: center !important;
              padding: 0.8rem 0 !important;
            }
            .admin-sidebar.collapsed .dropdown-menu {
              left: 100% !important;
              bottom: 0 !important;
              margin-left: 10px;
            }
          }
          
          /* Mobile behavior */
          @media (max-width: 768px) {
            .admin-sidebar {
              position: fixed;
              top: 0;
              bottom: 0;
              left: 0;
              transform: translateX(-100%);
              margin-left: 0 !important;
            }
            .admin-sidebar.mobile-open {
              transform: translateX(0);
            }
            .admin-sidebar-overlay {
              position: fixed;
              inset: 0;
              background: rgba(15,23,42,0.6);
              backdrop-filter: blur(2px);
              z-index: 1030;
              opacity: 0;
              visibility: hidden;
              transition: all 0.3s ease;
            }
            .admin-sidebar-overlay.open {
              opacity: 1;
              visibility: visible;
            }
            
            /* Adjust header on mobile */
            .admin-header-title { font-size: 1rem !important; }
            .admin-header-badge { display: none !important; }
            .admin-main-content { padding: 1.5rem !important; }
            .admin-user-info { display: none !important; }
            
            /* Staggered Fade In for Mobile */
            .admin-sidebar.mobile-open .nav-item {
              animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
              opacity: 0;
            }
            .admin-sidebar.mobile-open .nav-item:nth-child(1) { animation-delay: 0.05s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(2) { animation-delay: 0.1s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(3) { animation-delay: 0.15s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(4) { animation-delay: 0.2s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(5) { animation-delay: 0.25s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(6) { animation-delay: 0.3s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(7) { animation-delay: 0.35s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(8) { animation-delay: 0.4s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(9) { animation-delay: 0.45s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(10) { animation-delay: 0.5s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(11) { animation-delay: 0.55s; }
            .admin-sidebar.mobile-open .nav-item:nth-child(12) { animation-delay: 0.6s; }
          }
          
          @keyframes slideInRight {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }

          /* Animated Toggle Button */
          .sidebar-toggle-btn {
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: #fff;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar-toggle-btn:hover {
            background: var(--primary);
            color: var(--navy);
            border-color: var(--primary);
            transform: scale(1.05);
          }
          .sidebar-toggle-btn i {
            transition: transform 0.3s ease;
          }
          .admin-sidebar.collapsed .sidebar-toggle-btn i {
            transform: rotate(180deg);
          }
        `}</style>

        {/* Mobile Overlay */}
        <div
          className={`admin-sidebar-overlay ${sidebarOpen && window.innerWidth <= 768 ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar - Dark Premium Theme */}
        <div className={`admin-sidebar d-flex flex-column shadow-lg ${!sidebarOpen ? 'collapsed' : 'mobile-open'}`}>
          <div className="sidebar-header-box p-3 d-flex align-items-center justify-content-between position-relative">
            <div className="sidebar-logo-container flex-grow-1 d-flex align-items-center justify-content-center" style={{ maxHeight: 50 }}>
              <img src={companyInfo.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '50px', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
              <div className="bg-primary rounded-3 align-items-center justify-content-center" style={{ width: 40, height: 40, display: 'none' }}>
                <i className="bi bi-gear-fill text-dark" style={{ fontSize: '1.2rem' }}></i>
              </div>
            </div>

            {/* Desktop Toggle Button */}
            <button
              className="sidebar-toggle-btn flex-shrink-0 ms-2 d-none d-md-flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="พับ/กาง เมนู"
            >
              <i className={`bi ${sidebarOpen ? 'bi-layout-sidebar-inset' : 'bi-layout-sidebar'}`}></i>
            </button>
            {/* Mobile Close Button */}
            <button
              className="btn btn-link d-md-none p-1 ms-2"
              onClick={() => setSidebarOpen(false)}
              style={{ fontSize: '1.5rem', lineHeight: 1, color: 'var(--primary)' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="px-3 mt-3 flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
            <div className="sidebar-title small fw-bold text-uppercase mb-2 px-2" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', fontSize: '.65rem' }}>เมนูหลัก</div>
            <ul className="nav flex-column gap-1">
              {menuItems.map((item, i) => {
                const isActive = path === item.path || (path.startsWith(item.path) && item.path !== '/admin');
                return (
                  <li className="nav-item" key={i} title={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => { if (window.innerWidth <= 768) setSidebarOpen(false); }}
                      className="nav-link rounded-3 px-3 py-2 d-flex align-items-center gap-3"
                      style={{
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '.82rem',
                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                        background: isActive ? 'linear-gradient(90deg, rgba(163,217,0,0.15) 0%, rgba(163,217,0,0) 100%)' : 'transparent',
                        borderLeft: isActive ? '3.5px solid var(--primary)' : '3.5px solid transparent',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <i className={`bi ${item.icon} ${isActive ? 'text-primary' : ''}`} style={{ fontSize: '1.05rem', marginTop: '-2px' }}></i>
                      <span className="sidebar-text">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="admin-sidebar-footer p-3 mt-auto border-top position-relative" style={{ borderColor: 'rgba(255,255,255,0.05) !important', background: 'var(--navy)' }}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="sidebar-footer-btn btn w-100 d-flex gap-3 p-2 align-items-center rounded-3 shadow-none border-0"
              style={{ background: userDropdownOpen ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'all 0.2s', color: '#fff' }}
              title={user?.displayName || 'Admin'}
            >
              <div className="bg-primary bg-opacity-25 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 38, height: 38 }}>
                <i className="bi bi-person-fill fs-5"></i>
              </div>
              <div className="sidebar-text small text-start flex-grow-1 text-truncate d-flex flex-column">
                <span className="fw-bold text-white" style={{ fontSize: '.85rem' }}>{user?.displayName || 'Admin'}</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{user?.username || 'admin'}</span>
              </div>
              <i className="sidebar-text bi bi-three-dots-vertical" style={{ color: 'rgba(255,255,255,0.4)' }}></i>
            </button>

            {/* Dropdown Menu (Drop-up style) */}
            {userDropdownOpen && (
              <div
                className="dropdown-menu show shadow-lg border-0 rounded-4 p-2 w-100"
                style={{
                  position: 'absolute', bottom: '100%', left: 0, marginBottom: '10px',
                  background: '#1e293b',
                  animation: 'adminFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1050
                }}
              >
                <div className="px-3 py-2 mb-2 d-flex gap-3 align-items-center border-bottom pb-3" style={{ borderColor: 'rgba(255,255,255,0.1) !important' }}>
                  <div className="bg-primary text-navy rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" style={{ width: 42, height: 42 }}>
                    <i className="bi bi-person-fill fs-5"></i>
                  </div>
                  <div className="small text-start flex-grow-1 text-truncate">
                    <div className="fw-bold text-white" style={{ fontSize: '.9rem' }}>{user?.displayName || 'Admin'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{user?.username || 'admin'}</div>
                  </div>
                </div>
                <Link to="/admin/settings" className="dropdown-item rounded-3 py-2 px-3 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <i className="bi bi-person-gear fs-6" style={{ color: '#94a3b8' }}></i> ตั้งค่าบัญชี
                </Link>
                <Link to="/" className="dropdown-item rounded-3 py-2 px-3 fw-semibold d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <i className="bi bi-box-arrow-up-right fs-6" style={{ color: '#94a3b8' }}></i> หน้าเว็บไซต์หลัก
                </Link>
                <hr className="dropdown-divider my-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                <button onClick={handleLogout} className="dropdown-item rounded-3 py-2 px-3 text-danger fw-bold d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-power fs-6"></i> ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="admin-content flex-grow-1 d-flex flex-column" style={{ overflowY: 'auto', height: '100vh', transition: 'width 0.3s ease' }}>
          {/* Top Navbar */}
          <header className="bg-white px-4 py-3 d-flex justify-content-between align-items-center shadow-sm" style={{ zIndex: 9, position: 'sticky', top: 0 }}>
            <div className="d-flex align-items-center gap-3">
              <button
                className="d-md-none d-flex align-items-center justify-content-center border-0"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{ 
                  width: 38, height: 38, 
                  background: 'var(--navy)',
                  color: 'var(--primary)',
                  borderRadius: '10px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: sidebarOpen ? '0 0 15px rgba(163,217,0,0.4)' : '0 4px 10px rgba(10, 15, 13, 0.1)'
                }}
              >
                <i 
                  className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`} 
                  style={{ 
                    fontSize: '1.4rem',
                    transition: 'transform 0.3s ease',
                    transform: sidebarOpen ? 'rotate(90deg)' : 'rotate(0)'
                  }}
                ></i>
              </button>
              <h5 className="admin-header-title m-0 fw-bold text-dark d-flex align-items-center gap-2">
                <span className="admin-header-badge bg-primary text-white rounded-pill px-3 py-1 small" style={{ fontSize: '0.75rem' }}>BETA</span>
                ระบบจัดการเนื้อหา
              </h5>
            </div>
          </header>

          {/* Page Content Outlet */}
          <main className="admin-main-content p-5 flex-grow-1">
            <div className="container-fluid p-0" style={{ maxWidth: '1400px' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminModalContext.Provider>
  );
}
