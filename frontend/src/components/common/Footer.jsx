import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { companyAPI } from '../../api';

export default function Footer() {
  const [info, setInfo] = useState({ name: 'SUSPENDED TECH', about: '', address: '', phone: '', email: '' });
  const [sdOpen, setSdOpen] = useState(false);

  useEffect(() => {
    companyAPI.get().then(d => setInfo(d)).catch(() => { });
  }, []);

  return (
    <>
      <footer className="footer-main">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <Link to="/" className="d-inline-block mb-2" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', textDecoration: 'none' }}>{info.name}</Link>
              <p style={{ lineHeight: 1.8 }}>{(info.about || '').substring(0, 90)}...</p>
              <div className="d-flex gap-2 mt-2">
                {['facebook', 'instagram', 'youtube', 'line'].map((s) => (
                  <Link key={s} to="/contact" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '.78rem', transition: 'var(--transition)' }}><i className={`bi bi-${s}`}></i></Link>
                ))}
              </div>
            </div>
            <div className="col-6 col-lg-2"><h6>Navigation</h6><ul className="f-links">{[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/gallery', 'Gallery']].map(([to, lbl]) => (<li key={to}><Link to={to}>{lbl}</Link></li>))}</ul></div>
            <div className="col-6 col-lg-2"><h6>Company</h6><ul className="f-links">{[['/team', 'Team'], ['/clients', 'Clients'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, lbl]) => (<li key={to}><Link to={to}>{lbl}</Link></li>))}</ul></div>
            <div className="col-lg-4"><h6>Contact</h6><ul className="f-links"><li><i className="bi bi-geo-alt me-2" style={{ color: 'var(--primary)' }}></i>{info.address}</li><li><i className="bi bi-telephone me-2" style={{ color: 'var(--primary)' }}></i>{info.phone}</li><li><i className="bi bi-envelope me-2" style={{ color: 'var(--primary)' }}></i>{info.email}</li></ul></div>
          </div>
          <div className="footer-bottom"><span>© 2026 {info.name}. All rights reserved.</span></div>
        </div>
      </footer>
      <div className="speed-dial-container">
        <div className={`speed-dial-menu ${sdOpen ? '' : 'hidden'}`}>
          {info.showLine && info.lineId && (
            <a href={info.lineId.startsWith('http') ? info.lineId : `https://line.me/ti/p/~${info.lineId}`} target="_blank" rel="noreferrer" className="speed-dial-item sd-line" title="LINE">
              <i className="bi bi-line"></i>
            </a>
          )}
          {info.showFacebook && info.facebook && (
            <a href={info.facebook} target="_blank" rel="noreferrer" className="speed-dial-item sd-facebook" title="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
          )}
          {info.showInstagram && info.instagram && (
            <a href={info.instagram} target="_blank" rel="noreferrer" className="speed-dial-item sd-instagram" title="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
          )}
          <Link to="/contact" className="speed-dial-item sd-contact" title="Contact Us" onClick={() => setSdOpen(false)}>
            <i className="bi bi-envelope-fill"></i>
          </Link>
        </div>
        
        <button className="speed-dial-btn" onClick={() => setSdOpen(!sdOpen)}>
          <i className={`bi ${sdOpen ? 'bi-x-lg' : 'bi-chat-dots-fill'}`} style={{ transition: 'all 0.3s ease', transform: sdOpen ? 'rotate(90deg)' : 'rotate(0)' }}></i>
        </button>
      </div>
    </>
  );
}
