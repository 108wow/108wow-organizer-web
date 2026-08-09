import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Services from './pages/Services';
import RentEquipment from './pages/RentEquipment';
import Gallery from './pages/Gallery';
import Clients from './pages/Clients';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHero from './pages/admin/AdminHero';
import AdminHeroEditor from './pages/admin/AdminHeroEditor';
import AdminServices from './pages/admin/AdminServices';
import AdminEquipment from './pages/admin/AdminEquipment';
import AdminGallery from './pages/admin/AdminGallery';

import AdminBlog from './pages/admin/AdminBlog';
import AdminBlogEditor from './pages/admin/AdminBlogEditor';
import AdminTeam from './pages/admin/AdminTeam';
import AdminClients from './pages/admin/AdminClients';
import AdminAbout from './pages/admin/AdminAbout';
import AdminContact from './pages/admin/AdminContact';
import AdminMessages from './pages/admin/AdminMessages';
import AdminMessageDetail from './pages/admin/AdminMessageDetail';
import AdminHomeConfig from './pages/admin/AdminHomeConfig';
import AdminPageHeroes from './pages/admin/AdminPageHeroes';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';

import { getToken, companyAPI, homeConfigAPI } from './api';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

// Auth guard — redirect to login if no token
function RequireAuth() {
  const token = getToken();
  if (!token) return <Navigate to="/admin/login" replace />;
  return <AdminLayout />;
}

// Layout for Public Pages
function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  const [isWakingUp, setIsWakingUp] = useState(true);

  useEffect(() => {
    // Wake up the backend and wait for essential APIs
    Promise.all([
      companyAPI.get().then(info => {
        if (info) {
          const primary = info.primaryColor || '#a3d900';
          const navy = info.navyColor || '#0f172a';
          document.documentElement.style.setProperty('--primary', primary);
          document.documentElement.style.setProperty('--navy', navy);

          const hexToRgb = (hex) => {
            let c = hex.replace('#', '');
            if (c.length === 3) c = c.split('').map(x => x + x).join('');
            const num = parseInt(c, 16);
            return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
          };

          try {
            document.documentElement.style.setProperty('--primary-rgb', hexToRgb(primary));
            document.documentElement.style.setProperty('--navy-rgb', hexToRgb(navy));
          } catch (e) {}
        }
      }).catch(() => {}),
      homeConfigAPI.get().catch(() => {})
    ]).finally(() => {
      // Add a slight delay for smooth aesthetic transition
      setTimeout(() => setIsWakingUp(false), 800);
    });
  }, []);

  if (isWakingUp) {
    return (
      <div className="global-startup-loader">
        <div className="startup-orb"></div>
        <div className="startup-orb-2"></div>
        <div className="startup-spinner"></div>
        <div className="startup-text">POWERED BY 108 WOW</div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin Login (no auth required) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes (auth required) */}
        <Route path="/admin" element={<RequireAuth />}>
          <Route index element={<AdminDashboard />} />
          <Route path="home-settings" element={<AdminHomeConfig />} />
          <Route path="page-heroes" element={<AdminPageHeroes />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="hero/new" element={<AdminHeroEditor />} />
          <Route path="hero/edit/:id" element={<AdminHeroEditor />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="equipment" element={<AdminEquipment />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/new" element={<AdminBlogEditor />} />
          <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="messages/:id" element={<AdminMessageDetail />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/services" element={<Services />} />
          <Route path="/rent-equipment" element={<RentEquipment />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

      </Routes>
    </>
  );
}
