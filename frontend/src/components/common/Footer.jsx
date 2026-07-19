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
          <div className="row g-4 pt-3 justify-content-lg-between">
            {/* Left Column */}
            <div className="col-lg-4 pe-lg-5">
              <div className="mb-3" style={{ marginTop: '-20px' }}>
                {info.logoUrl && (
                  <img src={info.logoUrl} alt="Logo" style={{ height: '70px', width: 'auto', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                )}
              </div>
              <Link to="/" className="d-block mb-3 text-decoration-none">
                <div style={{ fontWeight: 800, fontSize: '1.8rem', color: '#fff', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{info.footerName || info.name}</div>
              </Link>
              <p style={{ lineHeight: 1.8, fontSize: '0.9rem', marginBottom: 0 }}>{info.about}</p>
            </div>
            
            {/* Contact Columns */}
            <div className="col-md-4 col-lg-auto mt-4 mt-lg-0 footer-contact-col">
              <div className="d-flex flex-column align-items-start">
                <i className="bi bi-geo-alt mb-3" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '3rem', lineHeight: 1 }}></i>
                <div>
                  <h5 className="mb-2" style={{ color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>ADDRESS</h5>
                  <p className="mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{info.address || '123 Sport Ave, Bangkok 10110'}</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 col-lg-auto mt-4 mt-lg-0 footer-contact-col">
              <div className="d-flex flex-column align-items-start">
                <i className="bi bi-envelope mb-3" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '3rem', lineHeight: 1 }}></i>
                <div>
                  <h5 className="mb-2" style={{ color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>MAIL TO US</h5>
                  <p className="mb-1" style={{ fontSize: '0.9rem' }}>{info.email || 'contact@example.com'}</p>
                  <p className="mb-0" style={{ fontSize: '0.9rem' }}>{info.phone || '+66 2 123 4567'}</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 col-lg-auto mt-4 mt-lg-0 footer-contact-col">
              <div className="d-flex flex-column align-items-start">
                <i className="bi bi-clock mb-3" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '3rem', lineHeight: 1 }}></i>
                <div>
                  <h5 className="mb-2" style={{ color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>OFFICE HOURS</h5>
                  <p className="mb-0" style={{ fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{info.officeHours || 'จันทร์ - ศุกร์ 09:00 - 18:00\nปิดเสาร์-อาทิตย์'}</p>
                </div>
              </div>
            </div>
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
