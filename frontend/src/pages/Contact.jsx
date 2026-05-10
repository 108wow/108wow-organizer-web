import { useState } from 'react';
import HeroSection from '../components/common/HeroSection';
import { companyInfo, pageHeroes } from '../data/mockData';

export default function Contact() {
  const hero = pageHeroes.contact;
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); };

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding" style={{ background: '#f4f6f3' }}>
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="section-label" style={{ letterSpacing: '2px', fontWeight: 700, color: 'var(--primary)' }}>GET IN TOUCH</span>
            <h2 className="section-title text-uppercase mt-2" style={{ color: '#0a0f0d', fontSize: '2.5rem', fontWeight: 900 }}>ติดต่อเรา</h2>
          </div>

          <div className="row g-4">
            {/* Contact Info (Dark Bento Theme) */}
            <div className="col-lg-4">
              <div className="bento-dark h-100 p-4 p-md-5" style={{ borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                <h3 className="mb-4" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.6rem' }}>ข้อมูลติดต่อ</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2.5rem', lineHeight: '1.6' }}>ไม่ว่าคุณจะมีโปรเจกต์ใหม่หรือต้องการปรึกษา เราพร้อมช่วยเหลือและรับฟัง</p>
                
                <div className="d-flex flex-column gap-4">
                  {[
                    { icon: 'bi-geo-alt', label: 'ที่อยู่', value: companyInfo.address }, 
                    { icon: 'bi-telephone', label: 'โทรศัพท์', value: companyInfo.phone }, 
                    { icon: 'bi-envelope', label: 'อีเมล', value: companyInfo.email }, 
                    { icon: 'bi-clock', label: 'เวลาทำการ', value: 'จันทร์ - ศุกร์ 9:00 - 18:00' }
                  ].map((info, i) => (
                    <div key={i} className="d-flex align-items-start gap-3">
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(163,217,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)', fontSize: '1.3rem' }}>
                        <i className={`bi ${info.icon}`}></i>
                      </div>
                      <div>
                        <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{info.label}</small>
                        <div style={{ color: '#fff', fontSize: '.95rem', fontWeight: 500, marginTop: '2px' }}>{info.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form (White Bento Theme) */}
            <div className="col-lg-8">
              <div className="bento-white h-100 p-4 p-md-5" style={{ borderRadius: '24px', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                <h3 className="mb-4" style={{ color: '#0a0f0d', fontWeight: 800, fontSize: '1.6rem' }}>ส่งข้อความถึงเรา</h3>
                {submitted && <div className="alert alert-success py-3 fw-bold mb-4" style={{ fontSize: '.95rem', backgroundColor: 'var(--primary-soft)', color: '#0a0f0d', border: 'none', borderRadius: '12px' }}><i className="bi bi-check-circle-fill me-2" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}></i>ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับโดยเร็วที่สุด</div>}
                
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>ชื่อ-นามสกุล</label>
                      <input type="text" className="form-control px-3 py-3" placeholder="ชื่อของคุณ" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>อีเมล</label>
                      <input type="email" className="form-control px-3 py-3" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>โทรศัพท์</label>
                      <input type="tel" className="form-control px-3 py-3" placeholder="0x-xxx-xxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}/>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>หัวข้อ</label>
                      <select className="form-control px-3 py-3" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}>
                        <option value="">เลือกหัวข้อ</option>
                        <option>สอบถามบริการ</option>
                        <option>ขอใบเสนอราคา</option>
                        <option>อื่นๆ</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold" style={{ fontSize: '0.85rem' }}>ข้อความ</label>
                      <textarea className="form-control px-3 py-3" rows="5" placeholder="รายละเอียดโปรเจกต์หรือสิ่งที่คุณต้องการให้เราช่วยเหลือ..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required style={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }}></textarea>
                    </div>
                    <div className="col-12 mt-4">
                      <button type="submit" className="btn btn-premium-dark px-4 py-3 fw-bold w-100" style={{ fontSize: '1rem' }}>
                        <i className="bi bi-send-fill me-2"></i> ส่งข้อความ
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Google Map (Full Width Bento Box) */}
            <div className="col-12 mt-3">
              <div className="overflow-hidden p-0" style={{ borderRadius: '24px', height: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.06)', background: '#fff', position: 'relative' }}>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15502.839064030794!2d100.5583568!3d13.7367174!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e29f0290516fc1%3A0xcb1b681907fc2980!2sSukhumvit%2C%20Bangkok!5e0!3m2!1sen!2sth!4v1714000000000!5m2!1sen!2sth" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Map Location"
                ></iframe>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
