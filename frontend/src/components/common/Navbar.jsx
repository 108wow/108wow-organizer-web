import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { companyAPI } from '../../api';

export default function Navbar() {
  const { pathname } = useLocation();
  const [companyInfo, setCompanyInfo] = useState({ name: 'SUSPENDED TECH', logoUrl: '' });

  useEffect(() => {
    companyAPI.get().then(d => { 
      const newName = d.name || 'SUSPENDED TECH';
      setCompanyInfo({ name: newName, logoUrl: d.logoUrl || '' }); 
      document.title = newName;
    }).catch(() => {});
  }, []);
  const links = [
    { to: '/', label: 'HOME' },
    { to: '/about', label: 'ABOUT US' },
    { to: '/team', label: 'TEAM' },
    { to: '/services', label: 'SERVICES' },
    { to: '/gallery', label: 'GALLERY' },
    { to: '/clients', label: 'CLIENTS' },
    { to: '/blog', label: 'BLOG' },
    { to: '/contact', label: 'CONTACT US' },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-custom fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          {companyInfo.logoUrl ? (
            <img src={companyInfo.logoUrl} alt={companyInfo.name} style={{ maxHeight: '40px', maxWidth: '200px' }} onError={e => e.target.style.display = 'none'} />
          ) : (
            companyInfo.name
          )}
        </Link>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <i className="bi bi-list text-white fs-4"></i>
        </button>
        <div className="collapse navbar-collapse justify-content-end" id="mainNav">
          <ul className="navbar-nav">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <Link className={`nav-link ${pathname === l.to ? 'active' : ''}`} to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}
