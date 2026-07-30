import { useState, useEffect } from 'react';
import HeroSection from '../components/common/HeroSection';
import { companyAPI, pageHeroAPI, contactAPI } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Contact() {
  const [companyInfo, setCompanyInfo] = useState({});
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useScrollReveal([loaded]);

  useEffect(() => {
    Promise.all([companyAPI.get(), pageHeroAPI.list()])
      .then(([info, heroes]) => {
        setCompanyInfo(info);
        setHero(heroes.contact || {});
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await contactAPI.submit(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', body: '' });
    } catch { /* ignore */ }
    setSending(false);
  };

  const getMapSrc = () => {
    const val = companyInfo.googleMapEmbed || '';
    if (!val.trim()) return '';
    const match = val.match(/src="([^"]+)"/);
    const url = match ? match[1] : val.trim();
    if (url.includes('/maps/embed') || url.includes('maps.google.com/maps?') || url.includes('google.com/maps?')) return url;
    return '';
  };

  const socials = [
    companyInfo.showFacebook && companyInfo.facebook && { icon: 'bi-facebook', label: 'Facebook', url: companyInfo.facebook, bg: '#1877f2' },
    companyInfo.showLine && companyInfo.lineId && { icon: 'bi-line', label: 'LINE', url: companyInfo.lineId.startsWith('http') ? companyInfo.lineId : `https://line.me/R/ti/p/~${companyInfo.lineId}`, bg: '#06c755' },
    companyInfo.showInstagram && companyInfo.instagram && { icon: 'bi-instagram', label: 'Instagram', url: companyInfo.instagram, bg: '#e4405f' },
  ].filter(Boolean);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      {/* ─── Main Content: Contact Info & Form ─── */}
      <section className="section-padding position-relative overflow-hidden" style={{ background: 'var(--bg-light)' }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            
            {/* ─── Left Column: Info & Socials ─── */}
            <div className="col-lg-5 reveal-left">
              <div className="pe-lg-4">
                <div className="mb-4">
                  <span className="section-label">Get In Touch</span>
                  <h2 className="fw-bold mb-3" style={{ color: 'var(--navy)', fontSize: '2.5rem' }}>ช่องทางการติดต่อ</h2>
                  <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
                    เราพร้อมให้คำปรึกษาและบริการคุณ สามารถติดต่อเราได้ตามช่องทางด้านล่างนี้ หรือส่งข้อความผ่านแบบฟอร์ม ทางทีมงานจะรีบตอบกลับโดยเร็วที่สุด
                  </p>
                </div>

                {/* Contact Card */}
                <div className="p-4 rounded-4 shadow-sm mb-4" style={{ background: '#fff', border: '1px solid var(--border)' }}>
                  <div className="d-flex flex-column gap-4">
                    {[
                      { icon: 'bi-geo-alt-fill', title: 'ที่อยู่', text: companyInfo.address, color: 'var(--primary-dark)' },
                      { icon: 'bi-telephone-fill', title: 'โทรศัพท์', text: companyInfo.phone, href: companyInfo.phone ? `tel:${companyInfo.phone}` : null, color: '#0891b2' },
                      { icon: 'bi-envelope-at-fill', title: 'อีเมล', text: companyInfo.email, href: companyInfo.email ? `mailto:${companyInfo.email}` : null, color: '#d97706' },
                    ].map((item, i) => (
                      <div key={i} className="d-flex align-items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <i className={`bi ${item.icon}`} style={{ fontSize: '1.25rem', color: item.color }}></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1" style={{ color: 'var(--navy)', fontSize: '0.95rem' }}>{item.title}</h6>
                          {item.href ? (
                            <a href={item.href} className="text-decoration-none text-muted" style={{ fontSize: '0.9rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--primary-dark)'} onMouseLeave={e => e.target.style.color = ''}>{item.text}</a>
                          ) : (
                            <p className="text-muted m-0" style={{ fontSize: '0.9rem' }}>{item.text}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Socials */}
                {socials.length > 0 && (
                  <div>
                    <h5 className="fw-bold mb-3" style={{ color: 'var(--navy)', fontSize: '1rem' }}>ช่องทางอื่นๆ</h5>
                    <div className="d-flex gap-3 flex-wrap">
                      {socials.map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-2 px-4 py-2 rounded-pill text-decoration-none fw-bold shadow-sm" style={{ background: '#fff', color: s.bg, border: '1px solid var(--border)', transition: 'all 0.3s', fontSize: '0.9rem' }} onMouseEnter={e => { e.currentTarget.style.background = s.bg; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${s.bg}40`; }} onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = s.bg; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                          <i className={`bi ${s.icon}`} style={{ fontSize: '1.1rem' }}></i>
                          {s.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right Column: Form ─── */}
            <div className="col-lg-7 reveal-right">
              <div className="contact-form-card shadow-sm" style={{ border: '1px solid var(--border)', background: '#fff' }}>
                <div className="contact-form-header mb-4">
                  <div>
                    <h3 className="fw-bold m-0" style={{ color: 'var(--navy)' }}>ส่งข้อความถึงเรา</h3>
                    <p className="m-0 mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>กรุณากรอกข้อมูลให้ครบถ้วน เพื่อความรวดเร็วในการติดต่อกลับ</p>
                  </div>
                </div>

                {sent ? (
                  <div className="text-center py-5">
                    <div className="contact-success-circle mx-auto mb-4">
                      <i className="bi bi-check-lg text-white"></i>
                    </div>
                    <h4 className="fw-bold mb-2" style={{ color: 'var(--navy)' }}>ส่งข้อความเรียบร้อยแล้ว!</h4>
                    <p style={{ color: 'var(--text-muted)' }}>ขอบคุณที่ติดต่อเรา ทีมงานจะตอบกลับท่านผ่านทางอีเมลโดยเร็วที่สุด</p>
                    <button className="btn btn-outline mt-4" onClick={() => setSent(false)}>
                      <i className="bi bi-arrow-counterclockwise me-2"></i>ส่งข้อความอีกครั้ง
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="contact-label"><i className="bi bi-person me-2 text-primary"></i>ชื่อ-นามสกุล <span className="text-danger">*</span></label>
                        <input type="text" className="contact-input" placeholder="กรอกชื่อของคุณ" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required />
                      </div>
                      <div className="col-md-6">
                        <label className="contact-label"><i className="bi bi-envelope me-2 text-primary"></i>อีเมล <span className="text-danger">*</span></label>
                        <input type="email" className="contact-input" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
                      </div>
                      <div className="col-12">
                        <label className="contact-label"><i className="bi bi-chat-left-text me-2 text-primary"></i>หัวข้อ <span className="text-danger">*</span></label>
                        <input type="text" className="contact-input" placeholder="หัวข้อที่ต้องการสอบถาม" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} required />
                      </div>
                      <div className="col-12">
                        <label className="contact-label"><i className="bi bi-pencil-square me-2 text-primary"></i>ข้อความ <span className="text-danger">*</span></label>
                        <textarea className="contact-input" rows="5" placeholder="รายละเอียดที่ต้องการติดต่อ..." value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} required style={{ resize: 'vertical' }} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-main w-100 mt-4 py-3 rounded-3" disabled={sending} style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                      {sending ? (<><span className="spinner-border spinner-border-sm me-2"></span>กำลังส่ง...</>) : (<><i className="bi bi-send-fill me-2"></i>ส่งข้อความ</>)}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Bottom: Map ─── */}
      {getMapSrc() && (
        <section className="section-padding bg-white">
          <div className="container">
            <div className="text-center mb-4">
              <h3 className="fw-bold" style={{ color: 'var(--navy)' }}>แผนที่และการเดินทาง</h3>
              <p className="text-muted">คุณสามารถเดินทางมายังสำนักงานของเราได้ตามแผนที่ด้านล่าง</p>
            </div>
            <div className="shadow-sm anim d3" style={{ height: '400px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe 
                src={getMapSrc()} 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(5%)' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade" 
                title="Google Map"
              ></iframe>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
