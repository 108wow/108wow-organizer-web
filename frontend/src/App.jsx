import { Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Team from './pages/Team';
import Services from './pages/Services';
import Gallery from './pages/Gallery';
import Clients from './pages/Clients';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminHero from './pages/admin/AdminHero';
import AdminServices from './pages/admin/AdminServices';
import AdminGallery from './pages/admin/AdminGallery';
import AdminBlog from './pages/admin/AdminBlog';
import AdminTeam from './pages/admin/AdminTeam';
import AdminClients from './pages/admin/AdminClients';
import AdminAbout from './pages/admin/AdminAbout';
import AdminContact from './pages/admin/AdminContact';
import AdminHomeConfig from './pages/admin/AdminHomeConfig';
import AdminPageHeroes from './pages/admin/AdminPageHeroes';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogin from './pages/admin/AdminLogin';

import { getToken } from './api';

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
          <Route path="services" element={<AdminServices />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/services" element={<Services />} />
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
