import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { companyAPI, homeConfigAPI, serviceAPI } from '../../api';

export default function Navbar() {
  const { pathname } = useLocation();
  const [companyInfo, setCompanyInfo] = useState({ name: '', logoUrl: '' });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navbarConfig, setNavbarConfig] = useState({});
  const [services, setServices] = useState([]);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    let lastScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      
      if (currentScroll <= 60) {
        setNavVisible(true);
      } else if (currentScroll > lastScroll && currentScroll > 100) {
        // Scrolling down -> hide navbar
        setNavVisible(false);
      } else if (currentScroll < lastScroll) {
        // Scrolling up -> show navbar
        setNavVisible(true);
      }
      
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    companyAPI.get().then(d => {
      const newName = d.name || '';
      setCompanyInfo({ name: newName, logoUrl: d.logoUrl || '' });
      document.title = newName;
    }).catch(() => { });

    homeConfigAPI.get().then(d => {
      if (d && d.navbarConfig) setNavbarConfig(d.navbarConfig);
    }).catch(() => { });

    serviceAPI.list().then(d => {
      setServices(d.filter(s => s.isActive !== false));
    }).catch(() => { });

    const offcanvasEl = document.getElementById('mainNav');
    const handleShow = () => setIsMenuOpen(true);
    const handleHide = () => setIsMenuOpen(false);

    if (offcanvasEl) {
      offcanvasEl.addEventListener('show.bs.offcanvas', handleShow);
      offcanvasEl.addEventListener('hide.bs.offcanvas', handleHide);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (offcanvasEl) {
        offcanvasEl.removeEventListener('show.bs.offcanvas', handleShow);
        offcanvasEl.removeEventListener('hide.bs.offcanvas', handleHide);
      }
    };
  }, []);

  const allLinks = [
    { to: '/', label: 'HOME', key: 'home' },
    { to: '/about', label: 'ABOUT US', key: 'about' },
    { to: '/team', label: 'TEAM', key: 'team' },
    { to: '/gallery', label: 'GALLERY', key: 'gallery' },
    { to: '/clients', label: 'CLIENTS', key: 'clients' },
    { to: '/blog', label: 'BLOG', key: 'blog' },
    { to: '/contact', label: 'CONTACT US', key: 'contact' },
  ];

  const links = allLinks.filter(l => navbarConfig[l.key] !== false);

  const handleLinkClick = () => {
    if (isMenuOpen) {
      const toggleBtn = document.querySelector('.navbar-toggler');
      if (toggleBtn) toggleBtn.click();
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-custom fixed-top ${!navVisible && !isMenuOpen ? 'nav-hidden' : ''}`}>
      <div className="container">
        <Link className="navbar-brand d-none d-lg-block" to="/">
          {companyInfo.logoUrl ? (
            <img src={companyInfo.logoUrl} alt={companyInfo.name} className="nav-logo" style={{ maxHeight: '70px', maxWidth: '250px' }} onError={e => e.target.style.display = 'none'} />
          ) : (
            companyInfo.name
          )}
        </Link>
        <button className={`navbar-toggler border-0 animated-toggler ${isMenuOpen ? 'open' : ''}`} type="button" data-bs-toggle="offcanvas" data-bs-target="#mainNav">
          <div className="hamburger-lines">
            <span className="line line1"></span>
            <span className="line line2"></span>
            <span className="line line3"></span>
          </div>
        </button>
        <div className="offcanvas-lg offcanvas-end offcanvas-mobile-custom" tabIndex="-1" id="mainNav">
          <div className="offcanvas-header border-bottom border-light border-opacity-10 d-lg-none py-3 px-4">
            <h5 className="offcanvas-title text-white fw-bold mb-0" style={{ fontSize: '1.2rem' }}>
              {companyInfo.logoUrl ? (
                <img src={companyInfo.logoUrl} alt={companyInfo.name} style={{ maxHeight: '40px', maxWidth: '200px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
              ) : (
                companyInfo.name
              )}
            </h5>
            {/* The animated hamburger now acts as the close button because it's fixed on top */}
          </div>
          <div className="offcanvas-body px-4 py-4 px-lg-0 py-lg-0">
            <ul className="navbar-nav justify-content-end flex-grow-1 pe-lg-0">
              {links.map((l, index) => {
                if (l.key === 'about') {
                  return (
                    <li className="nav-item dropdown dropdown-hover mobile-nav-item" key={l.to} style={{ '--delay': `${index * 0.08}s` }}>
                      <Link className="nav-link mobile-nav-link" to={l.to} onClick={handleLinkClick}>
                        {l.label} <i className="bi bi-chevron-down ms-1" style={{ fontSize: '0.75rem' }}></i>
                      </Link>
                      <ul className="dropdown-menu border-0 shadow-lg dropdown-menu-dark-custom">
                        <li>
                          <Link className="dropdown-item py-2 px-3 dropdown-item-custom" to="/about" onClick={handleLinkClick}>
                            ABOUT US
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 px-3 dropdown-item-custom" to="/services" onClick={handleLinkClick}>
                            SERVICES
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 px-3 dropdown-item-custom" to="/rent-equipment" onClick={handleLinkClick}>
                            RENT EQUIPMENT
                          </Link>
                        </li>
                      </ul>
                    </li>
                  );
                }

                return (
                  <li className="nav-item mobile-nav-item" key={l.to} style={{ '--delay': `${index * 0.08}s` }}>
                    <Link className={`nav-link mobile-nav-link ${pathname === l.to ? 'active' : ''}`} to={l.to} onClick={handleLinkClick}>{l.label}</Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
