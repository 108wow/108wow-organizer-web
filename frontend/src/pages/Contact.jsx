import { useState, useEffect } from 'react';
import HeroSection from '../components/common/HeroSection';
import { companyAPI, pageHeroAPI, contactAPI } from '../api';

export default function Contact() {
  const [companyInfo, setCompanyInfo] = useState({});
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-5 anim d1">
              <h4 className="fw-bold mb-4">ข้อมูลติดต่อ</h4>
              <div className="d-flex gap-3 mb-3"><i className="bi bi-geo-alt-fill text-primary fs-4"></i><div><h6 className="fw-bold mb-1">ที่อยู่</h6><p className="text-muted m-0">{companyInfo.address}</p></div></div>
              <div className="d-flex gap-3 mb-3"><i className="bi bi-telephone-fill text-primary fs-4"></i><div><h6 className="fw-bold mb-1">โทรศัพท์</h6><p className="text-muted m-0">{companyInfo.phone}</p></div></div>
              <div className="d-flex gap-3 mb-3"><i className="bi bi-envelope-fill text-primary fs-4"></i><div><h6 className="fw-bold mb-1">อีเมล</h6><p className="text-muted m-0">{companyInfo.email}</p></div></div>
            </div>
            <div className="col-lg-7 anim d2">
              <h4 className="fw-bold mb-4">ส่งข้อความถึงเรา</h4>
              {sent ? (
                <div className="alert alert-success"><i className="bi bi-check-circle-fill me-2"></i>ส่งข้อความเรียบร้อยแล้ว ขอบคุณครับ!</div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6"><input type="text" className="form-control" placeholder="ชื่อ" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required /></div>
                    <div className="col-md-6"><input type="email" className="form-control" placeholder="อีเมล" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required /></div>
                  </div>
                  <div className="mb-3"><input type="text" className="form-control" placeholder="หัวข้อ" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} required /></div>
                  <div className="mb-3"><textarea className="form-control" rows="5" placeholder="ข้อความ" value={form.body} onChange={e => setForm(p => ({...p, body: e.target.value}))} required /></div>
                  <button type="submit" className="btn btn-primary px-4" disabled={sending}>{sending ? 'กำลังส่ง...' : 'ส่งข้อความ'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
