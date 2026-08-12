import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import HeroSection from '../components/common/HeroSection';
import { companyAPI, pageHeroAPI, contactAPI, equipmentAPI } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

const EASE = [0.16, 1, 0.3, 1];

export default function Contact() {
  const [searchParams] = useSearchParams();
  const [companyInfo, setCompanyInfo] = useState({});
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [form, setForm] = useState({ name: '', email: '', subject: '', body: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Equipment Multi-Select State
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipments, setSelectedEquipments] = useState([]);
  const [equipDropdownOpen, setEquipDropdownOpen] = useState(false);
  const [equipSearchQuery, setEquipSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useScrollReveal([loaded]);

  useEffect(() => {
    Promise.all([
      companyAPI.get().catch(() => ({})),
      pageHeroAPI.list().catch(() => ({})),
      equipmentAPI.list().catch(() => [])
    ])
      .then(([info, heroes, equipData]) => {
        setCompanyInfo(info || {});
        setHero(heroes.contact || {});
        const list = equipData || [];
        setEquipmentList(list);

        // Pre-select equipment if passed via URL parameter e.g. /contact?equipment=Name
        const eqParam = searchParams.get('equipment');
        if (eqParam) {
          const matched = list.find(item => item.name === eqParam || item.id === Number(eqParam));
          const targetName = matched ? matched.name : eqParam;
          setSelectedEquipments([targetName]);
          setForm(prev => ({
            ...prev,
            subject: prev.subject || `สอบถามรายละเอียดเช่าอุปกรณ์: ${targetName}`
          }));
        }

        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, [searchParams]);

  // Handle outside click for equipment dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setEquipDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleEquipment = (equipName) => {
    setSelectedEquipments(prev => {
      const exists = prev.includes(equipName);
      const updated = exists ? prev.filter(name => name !== equipName) : [...prev, equipName];

      if (updated.length > 0) {
        setForm(f => ({
          ...f,
          subject: (f.subject && !f.subject.startsWith('สอบถามเช่าอุปกรณ์') && !f.subject.startsWith('สอบถามรายละเอียดเช่าอุปกรณ์'))
            ? f.subject
            : `สอบถามเช่าอุปกรณ์ (${updated.length} รายการ)`
        }));
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    let finalBody = form.body;
    if (selectedEquipments.length > 0) {
      const equipListText = selectedEquipments.map(item => `• ${item}`).join('\n');
      finalBody = `[รายการอุปกรณ์ที่สนใจสอบถาม]\n${equipListText}\n\n[รายละเอียดข้อความเพิ่มเติม]\n${form.body}`;
    }

    try {
      await contactAPI.submit({
        name: form.name,
        email: form.email,
        subject: form.subject || (selectedEquipments.length > 0 ? `สอบถามเช่าอุปกรณ์ (${selectedEquipments.length} รายการ)` : 'สอบถามทั่วไป'),
        body: finalBody
      });
      setSent(true);
      setForm({ name: '', email: '', subject: '', body: '' });
      setSelectedEquipments([]);
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

  // One source of truth for the dropdown list and its empty state (the two used to disagree:
  // the list matched name OR category, the empty check matched name only)
  const equipQuery = equipSearchQuery.trim().toLowerCase();
  const filteredEquipment = equipmentList.filter(item =>
    !equipQuery ||
    item.name.toLowerCase().includes(equipQuery) ||
    (item.category && item.category.toLowerCase().includes(equipQuery))
  );

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
                      {/* Name Input */}
                      <div className="col-md-6">
                        <label className="contact-field-label">
                          <i className="bi bi-person-fill"></i>
                          <span>ชื่อ-นามสกุล <span className="text-danger">*</span></span>
                        </label>
                        <input
                          type="text"
                          className="contact-field-input"
                          placeholder="กรอกชื่อ-นามสกุลของคุณ"
                          value={form.name}
                          onChange={e => setForm(p => ({...p, name: e.target.value}))}
                          required
                        />
                      </div>

                      {/* Email Input */}
                      <div className="col-md-6">
                        <label className="contact-field-label">
                          <i className="bi bi-envelope-fill"></i>
                          <span>อีเมลติดต่อ <span className="text-danger">*</span></span>
                        </label>
                        <input
                          type="email"
                          className="contact-field-input"
                          placeholder="yourname@email.com"
                          value={form.email}
                          onChange={e => setForm(p => ({...p, email: e.target.value}))}
                          required
                        />
                      </div>

                      {/* ─── Equipment Multi-Select Section (Integrated Tag-Input Layout) ─── */}
                      {equipmentList.length > 0 && (
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                            <label className="contact-field-label mb-0">
                              <i className="bi bi-box-seam-fill"></i>
                              <span>เลือกอุปกรณ์ที่สนใจ <span className="text-muted fw-normal">(เลือกได้หลายรายการ)</span></span>
                            </label>
                            {selectedEquipments.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedEquipments([])}
                                className="btn btn-link btn-sm text-danger text-decoration-none p-0 fw-bold flex-shrink-0"
                                style={{ fontSize: '0.85rem' }}
                              >
                                <i className="bi bi-x-circle me-1"></i>ล้างทั้งหมด ({selectedEquipments.length})
                              </button>
                            )}
                          </div>

                          <div className="position-relative" ref={dropdownRef}>
                            {/* Integrated Multi-Select Tag Input Box */}
                            <div
                              className={`contact-multiselect ${equipDropdownOpen ? 'is-open' : ''}`}
                              onClick={() => setEquipDropdownOpen(!equipDropdownOpen)}
                            >
                              <div className="contact-chips">
                                {selectedEquipments.length === 0 ? (
                                  <span className="d-inline-flex align-items-center gap-2 text-muted" style={{ fontSize: '0.93rem' }}>
                                    <i className="bi bi-plus-circle" style={{ color: 'var(--primary-dark)' }}></i>
                                    คลิกเพื่อเลือกอุปกรณ์ที่สนใจ...
                                  </span>
                                ) : (
                                  <AnimatePresence initial={false} mode="popLayout">
                                    {selectedEquipments.map((name) => (
                                      <motion.span
                                        key={name}
                                        layout
                                        className="contact-chip"
                                        title="คลิกเพื่อนำออก"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleEquipment(name);
                                        }}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                                        transition={{ duration: 0.25, ease: EASE }}
                                      >
                                        <i className="bi bi-box-seam" style={{ color: 'var(--primary-dark)', fontSize: '0.85rem' }}></i>
                                        <span className="contact-chip-text">{name}</span>
                                        <i className="bi bi-x-lg"></i>
                                      </motion.span>
                                    ))}
                                  </AnimatePresence>
                                )}
                              </div>
                              <div className="contact-multiselect-meta">
                                {selectedEquipments.length > 0 && (
                                  <motion.span
                                    key={selectedEquipments.length}
                                    className="badge rounded-pill"
                                    style={{ background: 'var(--primary)', color: 'var(--navy)', fontSize: '0.75rem', fontWeight: 800, padding: '4px 9px' }}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.25, ease: EASE }}
                                  >
                                    {selectedEquipments.length}
                                  </motion.span>
                                )}
                                <motion.i
                                  className="bi bi-chevron-down text-muted"
                                  style={{ fontSize: '0.8rem' }}
                                  animate={{ rotate: equipDropdownOpen ? 180 : 0 }}
                                  transition={{ duration: 0.25, ease: EASE }}
                                />
                              </div>
                            </div>

                            {/* Floating Multi-Select Dropdown Menu */}
                            <AnimatePresence>
                              {equipDropdownOpen && (
                                <motion.div
                                  className="position-absolute start-0 end-0 mt-2 bg-white shadow-lg p-3 border"
                                  style={{ maxHeight: '310px', overflowY: 'auto', zIndex: 1050, borderRadius: 'var(--radius)', transformOrigin: 'top center' }}
                                  initial={{ opacity: 0, y: -10, scale: 0.97 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } }}
                                  transition={{ duration: 0.25, ease: EASE }}
                                >
                                  {/* Search box inside dropdown */}
                                  <div className="position-relative mb-3">
                                    <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" style={{ fontSize: '0.85rem' }}></i>
                                    <input
                                      type="text"
                                      className="form-control form-control-sm ps-5 py-2 border"
                                      placeholder="พิมพ์ค้นหาชื่ออุปกรณ์หรือหมวดหมู่..."
                                      value={equipSearchQuery}
                                      onChange={(e) => setEquipSearchQuery(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ fontSize: '0.9rem', borderRadius: '10px' }}
                                    />
                                  </div>

                                  {/* Equipment Checkbox List */}
                                  <div className="d-flex flex-column gap-1">
                                    {filteredEquipment.map(item => {
                                      const isSelected = selectedEquipments.includes(item.name);
                                      return (
                                        <div
                                          key={item.id}
                                          className={`contact-equip-option ${isSelected ? 'is-selected' : ''}`}
                                          onClick={() => toggleEquipment(item.name)}
                                        >
                                          <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ minWidth: 0 }}>
                                            <input
                                              type="checkbox"
                                              className="form-check-input m-0 flex-shrink-0"
                                              checked={isSelected}
                                              readOnly
                                              style={{ width: 18, height: 18, cursor: 'pointer' }}
                                            />
                                            {item.coverImage && (
                                              <img src={item.coverImage} alt="" className="rounded-2 object-fit-cover flex-shrink-0 border" style={{ width: 34, height: 34 }} />
                                            )}
                                            <span className="text-truncate" style={{ fontSize: '0.92rem', color: 'var(--text-dark)' }}>{item.name}</span>
                                          </div>
                                          {item.category && (
                                            <span className="badge bg-white text-dark border flex-shrink-0" style={{ fontSize: '0.72rem', fontWeight: 600, borderRadius: '8px', padding: '5px 9px' }}>
                                              {item.category}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}

                                    {filteredEquipment.length === 0 && (
                                      <div className="text-center py-4 text-muted" style={{ fontSize: '0.9rem' }}>
                                        <i className="bi bi-inbox fs-4 d-block mb-1 text-black-50"></i>
                                        ไม่พบอุปกรณ์ที่ค้นหา
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Subject Input */}
                      <div className="col-12">
                        <label className="contact-field-label">
                          <i className="bi bi-chat-left-text-fill"></i>
                          <span>หัวข้อเรื่อง <span className="text-danger">*</span></span>
                        </label>
                        <input
                          type="text"
                          className="contact-field-input"
                          placeholder="ระบุหัวข้อที่ต้องการติดต่อ"
                          value={form.subject}
                          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                          required
                        />
                      </div>

                      {/* Body Input */}
                      <div className="col-12">
                        <label className="contact-field-label">
                          <i className="bi bi-pencil-square"></i>
                          <span>รายละเอียดข้อความเพิ่มเติม <span className="text-danger">*</span></span>
                        </label>
                        <textarea
                          className="contact-field-input"
                          rows="4"
                          placeholder="ระบุรายละเอียด เช่น วันเวลาจัดงาน สถานที่ จำนวนผู้เข้าร่วม หรือข้อสอบถามเพิ่มเติม..."
                          value={form.body}
                          onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      className="btn btn-main w-100 mt-4 py-3 rounded-pill fw-bold shadow"
                      disabled={sending}
                      style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}
                      whileHover={sending ? undefined : { scale: 1.015 }}
                      whileTap={sending ? undefined : { scale: 0.985 }}
                      transition={{ duration: 0.2, ease: EASE }}
                    >
                      {sending ? (<><span className="spinner-border spinner-border-sm me-2"></span>กำลังส่ง...</>) : (<><i className="bi bi-send-fill me-2"></i>ส่งข้อความติดต่อเรา</>)}
                    </motion.button>
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
