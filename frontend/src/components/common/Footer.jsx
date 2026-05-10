import { Link } from 'react-router-dom';
import { companyInfo } from '../../data/mockData';

export default function Footer() {
  return (
    <>
      <footer className="footer-main">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <Link to="/" className="d-inline-block mb-2" style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', textDecoration: 'none' }}>{companyInfo.name}</Link>
              <p style={{ lineHeight: 1.8 }}>{companyInfo.about.substring(0, 90)}...</p>
              <div className="d-flex gap-2 mt-2">
                {['facebook', 'instagram', 'youtube', 'line'].map((s) => (
                  <a key={s} href="#" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '.78rem', transition: 'var(--transition)' }}><i className={`bi bi-${s}`}></i></a>
                ))}
              </div>
            </div>
            <div className="col-6 col-lg-2"><h6>Navigation</h6><ul className="f-links">{[['/', 'Home'], ['/about', 'About'], ['/services', 'Services'], ['/gallery', 'Gallery']].map(([to, lbl]) => (<li key={to}><Link to={to}>{lbl}</Link></li>))}</ul></div>
            <div className="col-6 col-lg-2"><h6>Company</h6><ul className="f-links">{[['/team', 'Team'], ['/clients', 'Clients'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([to, lbl]) => (<li key={to}><Link to={to}>{lbl}</Link></li>))}</ul></div>
            <div className="col-lg-4"><h6>Contact</h6><ul className="f-links"><li><i className="bi bi-geo-alt me-2" style={{ color: 'var(--primary)' }}></i>{companyInfo.address}</li><li><i className="bi bi-telephone me-2" style={{ color: 'var(--primary)' }}></i>{companyInfo.phone}</li><li><i className="bi bi-envelope me-2" style={{ color: 'var(--primary)' }}></i>{companyInfo.email}</li></ul></div>
          </div>
          <div className="footer-bottom"><span>© 2026 {companyInfo.name}. All rights reserved.</span><span>Made with <i className="bi bi-heart-fill" style={{ color: 'var(--primary)', fontSize: '.6rem' }}></i></span></div>
        </div>
      </footer>
      <Link to="/contact" className="floating-cta"><i className="bi bi-chat-dots-fill"></i> ติดต่อเรา</Link>
    </>
  );
}
