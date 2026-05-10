import { Link } from 'react-router-dom';
import { heroSlides, companyInfo, companyStats, services, clients, homeConfig } from '../data/mockData';

export default function Home() {
  return (
    <>
      {/* ──── Hero ──── */}
      <div id="homeCarousel" className="carousel slide home-carousel" data-bs-ride="carousel" data-bs-interval="5000">
        <div className="carousel-indicators">
          {heroSlides.map((_, i) => <button key={i} type="button" data-bs-target="#homeCarousel" data-bs-slide-to={i} className={i === 0 ? 'active' : ''} />)}
        </div>
        <div className="carousel-inner">
          {heroSlides.map((s, i) => (
            <div key={s.id} className={`carousel-item ${i === 0 ? 'active' : ''}`}>
              <div className="hero-bg" style={{ backgroundImage: `url(${s.image})` }} />
              <div className="hero-overlay" />
              <div className="carousel-caption">
                <div className="container position-relative">
                  {/* Ghost Text — large faded text behind title */}
                  <div className="ghost-text" aria-hidden="true">{s.title}</div>
                  <div className="position-relative" style={{ zIndex: 3 }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8 }}>{companyInfo.name}</p>
                    <h1>{s.title}</h1>
                    <p>{s.subtitle}</p>
                    <div className="d-flex gap-3">
                      <Link to="/services" className="btn btn-main">ดูบริการ</Link>
                      <Link to="/contact" className="btn btn-ghost">ติดต่อเรา</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#homeCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon" /></button>
        <button className="carousel-control-next" type="button" data-bs-target="#homeCarousel" data-bs-slide="next"><span className="carousel-control-next-icon" /></button>
      </div>

      {/* ──── About ──── */}
      {homeConfig.showAbout && (
        <section className="d-flex align-items-center py-5 pattern-dots" style={{ backgroundColor: 'var(--bg-white)', minHeight: '100vh' }}>
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <div className="position-relative">
                  <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80" alt="About" className="img-fluid" style={{ borderRadius: 'var(--radius-lg)' }} />
                  <div className="exp-badge">25<small>Years Exp</small></div>
                </div>
              </div>
              <div className="col-lg-6">
                <span className="section-label">About Us</span>
                <h2 className="section-title">{companyInfo.name}</h2>
                <div className="underline mb-3"></div>
                <p style={{ lineHeight: 1.9, fontSize: '.9rem' }}>{companyInfo.about}</p>
                <ul className="value-list mt-3 mb-4">
                  {['มีความรัก ความเข้าใจต่อกัน', 'ซื่อสัตย์ สามัคคี รักในองค์กร', 'ทำงานด้วยความสุข มุ่งสู่ความสำเร็จ', 'สร้างสรรค์และพัฒนาตนเองอยู่เสมอ'].map((v, i) => (
                    <li key={i}><i className="bi bi-check-circle-fill"></i>{v}</li>
                  ))}
                </ul>
                <Link to="/about" className="btn btn-main">เรียนรู้เพิ่มเติม</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──── Course Promotion / Announcement ──── */}
      <section className="d-flex align-items-center py-5 pattern-grid" style={{ backgroundColor: '#f4f6f3', minHeight: '100vh' }}>
        <div className="container">
          <div className="bento-white overflow-hidden p-0" style={{ borderRadius: '24px', background: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'relative' }}>
            <div className="row g-0">
              {/* Image Side */}
              <div className="col-lg-5 position-relative">
                <img src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80" alt="Game Master Facilitation" style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '100%' }} />
                {/* Floating overlay to match the reference poster vibe */}
                <div className="position-absolute bottom-0 start-0 w-100 p-3" style={{ background: 'linear-gradient(to top, rgba(10,15,13,0.95), transparent)' }}>
                  <span className="badge mb-2 px-2 py-1 rounded-pill fw-bold" style={{ background: 'var(--primary)', color: '#0a0f0d', fontSize: '0.7rem' }}>HOT COURSE</span>
                  <p className="text-white mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>25 ปีของประสบการณ์ ย่อลงในคอร์สครบวงจร</p>
                </div>
              </div>
              
              {/* Content Side */}
              <div className="col-lg-7 p-4 d-flex flex-column justify-content-center">
                <span className="fw-bold mb-1" style={{ color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>GAME MASTER FACILITATION</span>
                <h2 className="fw-bold mb-2" style={{ color: '#0a0f0d', fontSize: '1.75rem', lineHeight: '1.2' }}>
                  เปลี่ยนการเล่น เป็นการเรียนรู้<br/>
                  <span style={{ fontSize: '1.3rem', color: 'rgba(10,15,13,0.6)' }}>(Playing with Purpose)</span>
                </h2>
                <p style={{ color: 'var(--text-body)', fontSize: '0.88rem', marginBottom: '1.2rem', lineHeight: '1.5' }}>
                  Game Master Facilitation เปลี่ยน "การเล่น" ให้เป็น "การเรียนรู้ที่ทรงพลัง!" รวม 25 ปีของประสบการณ์ สู่คอร์สเข้มข้น 2 วัน ที่จะเปลี่ยนคุณให้เป็น Game Master มืออาชีพ!
                </p>
                
                <div className="mb-3">
                  <h6 className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}><i className="bi bi-star-fill me-2" style={{ color: 'var(--primary)' }}></i>ไฮไลต์เด็ด:</h6>
                  <div className="row g-2">
                    {[
                      'ทดลองเล่น+เรียนรู้กว่า 15 เกมส์',
                      'เทคนิค 4D Framework',
                      'ออกแบบเกมส์จริง + รับ Feedback',
                      'ฝึกภาคสนาม + On-the-job Training',
                      'สร้างชุมชน Game Master'
                    ].map((highlight, idx) => (
                      <div className="col-sm-6" key={idx}>
                        <div className="d-flex align-items-start gap-2">
                          <i className="bi bi-check-circle-fill mt-1" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}></i>
                          <span style={{ fontSize: '0.85rem', color: '#0a0f0d', fontWeight: 500 }}>{highlight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-light p-3 rounded-3 mb-4" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="row g-2" style={{ fontSize: '0.85rem', color: '#0a0f0d' }}>
                    <div className="col-12"><strong style={{ color: 'var(--primary)' }}><i className="bi bi-person-badge-fill me-2"></i>วิทยากร:</strong> อ.เคี้ยง อนันต์ (ผู้เชี่ยวชาญด้าน Team Building)</div>
                    <div className="col-sm-6"><strong style={{ color: 'var(--primary)' }}><i className="bi bi-calendar3 me-2"></i>วันที่:</strong> 9 - 10 ส.ค. 2568</div>
                    <div className="col-sm-6"><strong style={{ color: 'var(--primary)' }}><i className="bi bi-geo-alt-fill me-2"></i>สถานที่:</strong> กรุงเทพฯ</div>
                    <div className="col-12"><strong style={{ color: 'var(--primary)' }}><i className="bi bi-people-fill me-2"></i>รับเพียง:</strong> 25 คนเท่านั้น!</div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-2 mt-auto">
                  <Link to="#" className="btn btn-premium-dark px-3 py-2 fw-bold" style={{ fontSize: '0.85rem' }}>ดูรายละเอียดเพิ่มเติม</Link>
                  <Link to="#" className="btn px-3 py-2 fw-bold" style={{ background: '#fff', color: '#0a0f0d', border: '2px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '0.85rem', transition: 'all 0.3s' }} onMouseOver={(e) => {e.target.style.borderColor='#0a0f0d'}} onMouseOut={(e) => {e.target.style.borderColor='rgba(0,0,0,0.1)'}}>ลงทะเบียนสมัครเรียน</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Services ──── */}
      {homeConfig.showServices && (
        <section className="d-flex align-items-center py-5" style={{ backgroundColor: 'var(--bg-section)', minHeight: '100vh' }}>
          <div className="w-100">
            <div className="container">
              <div className="section-header text-center">
                <span className="section-label">Our Services</span>
                <h2 className="section-title">สิ่งที่เราทำได้</h2>
                <div className="underline mx-auto"></div>
              </div>
            </div>
            
            {/* Full-width seamless grid */}
            <div className="container-fluid px-0 mt-4">
              <div className="row g-0">
                {(() => {
                  const activeServices = services.filter(svc => (homeConfig.selectedServices || []).includes(svc.id));
                  const total = activeServices.length;
                  
                  return activeServices.map((svc, index) => {
                    // Dynamic Grid Auto-Balance Logic
                    let colClass = "col-12 col-md-6 col-lg-3"; 
                    if (total === 1) colClass = "col-12";
                    else if (total === 2) colClass = "col-12 col-md-6";
                    else if (total === 3) colClass = "col-12 col-md-4";
                    else if (total === 5) {
                      colClass = index < 3 ? "col-12 col-md-4" : "col-12 col-md-6";
                    } else if (total === 6) {
                      colClass = "col-12 col-md-4";
                    } else if (total === 7) {
                      colClass = index < 4 ? "col-12 col-md-6 col-lg-3" : "col-12 col-md-4";
                    }
                    
                    return (
                      <div key={svc.id} className={colClass}>
                        <div className="svc-grid-full">
                          <img src={svc.image} alt={svc.title} />
                          <div className="svc-content">
                            <h5>{svc.title}</h5>
                            <p>{svc.description.substring(0, 50)}...</p>
                            <Link to="/contact" className="svc-btn">สอบถามรายละเอียดเพิ่มเติม</Link>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {services.length > (homeConfig.selectedServices || []).length && (
              <div className="text-center py-4 mt-3">
                <Link to="/services" className="btn btn-outline">ดูบริการทั้งหมด →</Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ──── Why Us ──── */}
      {homeConfig.showWhyUs && (
        <section className="d-flex align-items-center py-5 pattern-diagonal" style={{ backgroundColor: 'var(--bg-white)', minHeight: '100vh' }}>
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <span className="section-label">Why Choose Us</span>
                <h2 className="section-title">ทำไมต้องเลือกเรา?</h2>
                <div className="row g-3 mt-2">
                  {[
                    { icon: 'bi-lightbulb-fill', title: 'Edutainment', desc: 'เติมเต็มความรู้ เพิ่มความบันเทิง' },
                    { icon: 'bi-people-fill', title: 'Participate', desc: 'ทุกคนมีส่วนร่วม 100%' },
                    { icon: 'bi-check-circle-fill', title: 'Practical', desc: 'ทันสมัย ใช้งานได้จริง' },
                    { icon: 'bi-shield-check', title: 'Unity', desc: 'สร้างทีมที่เข้มแข็ง' },
                  ].map((f, i) => (
                    <div key={i} className="col-sm-6">
                      <div className="feat-card-premium">
                        <div className="f-number">0{i + 1}</div>
                        <div className="f-icon-wrap"><i className={`bi ${f.icon}`}></i></div>
                        <div>
                          <h6>{f.title}</h6>
                          <p>{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-lg-6">
                <div className="position-relative ms-lg-4 mt-5 mt-lg-0">
                  {/* Decorative Background Blobs */}
                  <div className="position-absolute" style={{ width: '300px', height: '300px', background: 'rgba(163, 217, 0, 0.15)', filter: 'blur(50px)', top: '-50px', right: '-20px', zIndex: 0, borderRadius: '50%' }}></div>
                  <div className="position-absolute" style={{ width: '250px', height: '250px', background: 'rgba(10, 15, 13, 0.06)', filter: 'blur(40px)', bottom: '-30px', left: '-30px', zIndex: 0, borderRadius: '50%' }}></div>
                  
                  {/* Main Image */}
                  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80" alt="Why Choose Us" className="img-fluid position-relative w-100" style={{ borderRadius: '24px', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.08)', objectFit: 'cover', height: '500px' }} />
                  
                  {/* Floating Satisfaction Badge */}
                  <div className="position-absolute bg-white px-4 py-3" style={{ bottom: '40px', left: '-20px', borderRadius: '16px', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', zIndex: 2, display: 'flex', alignItems: 'center', gap: '15px', animation: 'float 6s ease-in-out infinite' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#0a0f0d' }}>
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#0a0f0d', lineHeight: 1 }}>100%</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>Satisfaction</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──── Stats Bar ──── */}
      {homeConfig.showStats && (
        <div className="stats-bar">
          <div className="container">
            <div className="row g-0">
              {companyStats.map((s, i) => (
                <div key={i} className="col-6 col-md-3 stat-col">
                  <div className="s-num">{s.value}</div>
                  <div className="s-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──── Customers ──── */}
      {homeConfig.showCustomers && (
        <section className="d-flex align-items-center py-5 pattern-dots" style={{ backgroundColor: 'var(--bg-white)', overflow: 'hidden', minHeight: '100vh' }}>
          <div className="w-100">
            <div className="container">
              <div className="section-header text-center">
                <span className="section-label">Part of Our Success</span>
                <h2 className="section-title">OUR BELOVED CUSTOMERS</h2>
                <div className="underline mx-auto"></div>
              </div>
            </div>

            {/* Row 1 — scroll left */}
            <div className="marquee-wrap">
              <div className="marquee-track scroll-left">
                {[...clients.slice(0, 12), ...clients.slice(0, 12)].map((c, i) => (
                  <div key={`r1-${i}`} className="marquee-item">
                    <img src={c.logo} alt={c.name} />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2 — scroll right */}
            <div className="marquee-wrap">
              <div className="marquee-track scroll-right">
                {[...clients.slice(12, 24), ...clients.slice(12, 24)].map((c, i) => (
                  <div key={`r2-${i}`} className="marquee-item">
                    <img src={c.logo} alt={c.name} />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 3 — scroll left (slower) */}
            <div className="marquee-wrap">
              <div className="marquee-track scroll-left-slow">
                {[...clients.slice(24, 36), ...clients.slice(24, 36)].map((c, i) => (
                  <div key={`r3-${i}`} className="marquee-item">
                    <img src={c.logo} alt={c.name} />
                    <span>{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="container mt-5">
              <div className="d-flex justify-content-center gap-3">
                <Link to="/clients" className="btn btn-main"><i className="bi bi-people me-2"></i>OUR CUSTOMERS</Link>
                <Link to="/contact" className="btn btn-outline"><i className="bi bi-briefcase me-2"></i>WORK WITH US</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──── CTA ──── */}
      {homeConfig.showCTA && (
        <section style={{ background: 'var(--navy)', padding: '50px 0' }}>
          <div className="container text-center">
            <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', marginBottom: '.4rem' }}>พร้อมเริ่มโปรเจกต์ใหม่?</h3>
            <p style={{ color: 'rgba(255,255,255,.45)', marginBottom: '1.3rem', fontSize: '.88rem' }}>ติดต่อเราวันนี้เพื่อปรึกษาโปรเจกต์ของคุณ ฟรี!</p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/contact" className="btn btn-accent"><i className="bi bi-arrow-right me-2"></i>เริ่มเลย</Link>
              <Link to="/services" className="btn btn-ghost">ดูบริการ</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
