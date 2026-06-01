import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { heroAPI, companyAPI, serviceAPI, clientAPI, homeConfigAPI } from '../api';

export default function Home() {
  const [heroSlides, setHeroSlides] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({});
  const [companyStats, setCompanyStats] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [homeConfig, setHomeConfig] = useState({ showAbout: true, showServices: true, showWhyUs: true, showStats: true, showCustomers: true, showCTA: true, selectedServices: [] });
  const [loaded, setLoaded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    Promise.all([
      heroAPI.list(),
      companyAPI.get(),
      companyAPI.listStats(),
      serviceAPI.list(),
      clientAPI.list(),
      homeConfigAPI.get(),
    ]).then(([heroes, info, stats, svc, cli, cfg]) => {
      setHeroSlides(heroes);
      setCompanyInfo(info);
      setCompanyStats(stats);
      setServices(svc);
      setClients(cli);
      setHomeConfig(cfg);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

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
                  <div className="ghost-text" aria-hidden="true">{s.ghostText || s.title}</div>
                  <div className="position-relative" style={{ zIndex: 3 }}>
                    <p style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 8 }}>{companyInfo.name}</p>
                    <h1>{s.title}</h1>
                    <p>{s.subtitle}</p>
                    <div className="d-flex gap-3 hero-btn-wrap">
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
      {homeConfig.showAbout && (() => {
        // Compute about sections (fallback to legacy single object)
        const aboutSections = homeConfig.aboutSections && homeConfig.aboutSections.length > 0 
          ? homeConfig.aboutSections 
          : (homeConfig.aboutSection && Object.keys(homeConfig.aboutSection).length > 0 ? [homeConfig.aboutSection] : []);

        return (
          <>
            {aboutSections.map((section, idx) => {
              const isEven = idx % 2 === 0;
              const isLast = idx === aboutSections.length - 1;
              return (
                <section key={idx} className={`d-flex align-items-center pt-5 ${!isLast ? 'pb-5' : ''} pattern-dots`} style={{ backgroundColor: 'var(--bg-white)', paddingBottom: isLast ? '12rem' : '' }}>
                  <div className="container">
                    <div className="row gy-5 gx-4 gx-lg-5 align-items-center">
                      <div className={`col-lg-6 ${!isEven ? 'order-lg-2' : ''}`}>
                        <div className="about-home-img-wrapper">
                          <img src={section.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&q=80"} alt={section.title || "About"} />
                          
                          {section.videoUrl && (
                            <div className="about-play-btn" onClick={() => setShowVideo(section.videoUrl)}>
                              <i className="bi bi-play-fill"></i>
                            </div>
                          )}

                          {(section.badgeTopText || section.badgeBottomText) && (
                            <div className="about-home-badge">
                              <h2>{section.badgeTopText}</h2>
                              <p>{section.badgeBottomText}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`col-lg-6 px-4 px-lg-3 ${!isEven ? 'order-lg-1' : ''}`}>
                        <span className="section-label">About Us</span>
                        <h2 className="section-title mb-4 d-none d-lg-block fs-1" style={{ wordBreak: 'break-word', lineHeight: '1.3' }}>
                          {section.title || `เกี่ยวกับ ${companyInfo.name}`}
                        </h2>
                        <h2 className="section-title mb-4 d-block d-lg-none" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere', hyphens: 'auto', fontSize: 'clamp(1.5rem, 7vw, 2.5rem)', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                          {section.title || `เกี่ยวกับ ${companyInfo.name}`}
                        </h2>
                        
                        {/* Desktop Description (Unchanged) */}
                        <div className="d-none d-lg-block">
                          <p className="text-muted mb-4 fs-5" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                            {section.description || companyInfo.about}
                          </p>
                          {section.listItems && section.listItems.length > 0 ? (
                            <div className="d-flex flex-column gap-4 mb-5 mt-4">
                              {section.listItems.map((item, lIdx) => (
                                <div key={lIdx} className="d-flex align-items-center gap-3">
                                  <span className="about-list-icon"><i className="bi bi-check-lg"></i></span>
                                  <span className="text-dark fw-bold fs-5">{item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="row g-4 mb-4">
                              <div className="col-sm-6 d-flex align-items-start gap-3">
                                <i className="bi bi-bullseye fs-3 text-primary"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">{section.bullet1Title || 'Mission'}</h6>
                                  <p className="text-muted small m-0" style={{ whiteSpace: 'pre-wrap' }}>{section.bullet1Desc || `${(companyInfo.mission || '').substring(0, 60)}...`}</p>
                                </div>
                              </div>
                              <div className="col-sm-6 d-flex align-items-start gap-3">
                                <i className="bi bi-eye fs-3 text-primary"></i>
                                <div>
                                  <h6 className="fw-bold mb-1">{section.bullet2Title || 'Vision'}</h6>
                                  <p className="text-muted small m-0" style={{ whiteSpace: 'pre-wrap' }}>{section.bullet2Desc || `${(companyInfo.vision || '').substring(0, 60)}...`}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Mobile Description & Lists (Editorial Redesign) */}
                        <div className="d-block d-lg-none pe-2">
                          {(() => {
                            const text = section.description || companyInfo.about || '';
                            const paragraphs = text.split('\n').filter(p => p.trim() !== '');
                            return (
                              <div className="mb-4">
                                {paragraphs.map((para, i) => {
                                  if (i === 0) {
                                    return (
                                      <div key={i} className="mb-4 position-relative">
                                        <div style={{ width: '40px', height: '4px', backgroundColor: 'var(--primary)', marginBottom: '1rem', borderRadius: '2px' }}></div>
                                        <p className="m-0 fw-bold" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '1.2rem', color: 'var(--navy)', letterSpacing: '-0.3px' }}>
                                          {para}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return (
                                    <p key={i} className="m-0 mb-3 fw-normal" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '0.95rem', color: 'var(--text-body)' }}>
                                      {para}
                                    </p>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {section.listItems && section.listItems.length > 0 ? (
                            <div className="d-flex flex-column gap-3 mb-5">
                              {section.listItems.map((item, lIdx) => (
                                <div key={lIdx} className="d-flex align-items-center gap-3 p-3 rounded-4 shadow-sm" style={{ background: 'var(--bg-white)', border: '1px solid rgba(0,0,0,0.04)' }}>
                                  <span className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'var(--navy)', flexShrink: 0 }}>
                                    <i className="bi bi-check2 fw-bold fs-5"></i>
                                  </span>
                                  <span className="text-dark fw-bold" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-3 mb-5">
                              <div className="p-4 rounded-4 shadow-sm" style={{ background: 'var(--bg-white)', border: '1px solid rgba(0,0,0,0.04)' }}>
                                <i className="bi bi-bullseye fs-2 mb-3 d-block text-primary"></i>
                                <h6 className="fw-bold mb-2 fs-5">{section.bullet1Title || 'Mission'}</h6>
                                <p className="small m-0 text-muted" style={{ lineHeight: '1.6' }}>{section.bullet1Desc || `${(companyInfo.mission || '').substring(0, 60)}...`}</p>
                              </div>
                              <div className="p-4 rounded-4 shadow-sm" style={{ background: 'var(--bg-white)', border: '1px solid rgba(0,0,0,0.04)' }}>
                                <i className="bi bi-eye fs-2 mb-3 d-block text-primary"></i>
                                <h6 className="fw-bold mb-2 fs-5">{section.bullet2Title || 'Vision'}</h6>
                                <p className="small m-0 text-muted" style={{ lineHeight: '1.6' }}>{section.bullet2Desc || `${(companyInfo.vision || '').substring(0, 60)}...`}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Link to={section.buttonLink || "/about"} className="btn btn-main px-4 py-2 mt-2 mt-lg-0">
                          {section.buttonText || "ติดต่อร่วมงานกับเรา"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })}

            {/* Video Modal */}
            {typeof showVideo === 'string' && showVideo && (
              <div className="modal-backdrop fade show d-flex align-items-center justify-content-center" style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={() => setShowVideo(null)}>
                <div className="container position-relative" style={{ maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                  <button 
                    className="btn btn-link text-white position-absolute top-0 end-0 text-decoration-none fs-1"
                    onClick={() => setShowVideo(null)}
                    style={{ zIndex: 10000, marginTop: '-50px', marginRight: '-20px' }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                  <div className="ratio ratio-16x9 shadow-lg rounded overflow-hidden bg-black">
                    <iframe 
                      src={showVideo.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/") + "?autoplay=1"} 
                      title="Video" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {/* ──── Services ──── */}
      {homeConfig.showServices && (
        <section className="d-flex align-items-center py-5" style={{ backgroundColor: 'var(--bg-section)' }}>
          <div className="w-100">
            <div className="container">
              <div className="section-header text-center">
                <span className="section-label">Our Services</span>
                <h2 className="section-title">บริการของเรา</h2>
                <div className="underline mx-auto"></div>
                <p className="section-desc center">โซลูชันครบวงจรเพื่อตอบโจทย์ทุกความต้องการทางธุรกิจของคุณ</p>
              </div>
            </div>
            
            {/* Full-width seamless grid */}
            <div className="container-fluid px-0 mt-4">
              <div className="row g-0">
                {(() => {
                  const activeServices = services.filter(svc => svc.isActive !== false && (homeConfig.selectedServices || []).includes(svc.id));
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
                            <p>{svc.description?.substring(0, 50)}...</p>
                            <Link to="/contact" className="svc-btn">สอบถามรายละเอียดเพิ่มเติม</Link>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="text-center mt-5">
              <Link to="/services" className="btn btn-outline-primary rounded-pill px-5 py-2">ดูบริการทั้งหมด <i className="bi bi-arrow-right ms-2"></i></Link>
            </div>
          </div>
        </section>
      )}

      {/* ──── Why Choose Us ──── */}
      {homeConfig.showWhyUs && (
        <section className="d-flex align-items-center py-5" style={{ background: 'var(--bg-white)' }}>
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <span className="section-label">Why Choose Us</span>
                <h2 className="section-title">ทำไมต้องเลือกเรา?</h2>
                <p className="text-muted lead mb-4">ด้วยประสบการณ์และทีมงานมืออาชีพ เราพร้อมส่งมอบผลงานที่ดีที่สุดให้คุณ</p>
                {[
                  { icon: 'bi-stars', title: 'ทีมผู้เชี่ยวชาญ', desc: 'ทีมงานผ่านโปรเจกต์มาหลายร้อยโปรเจกต์' },
                  { icon: 'bi-award', title: 'คุณภาพมาตรฐานสากล', desc: 'ใช้ Best Practices ในทุกขั้นตอน' },
                  { icon: 'bi-headset', title: 'ซัพพอร์ตตลอด 24/7', desc: 'ทีม Support พร้อมดูแลตลอดเวลา' },
                ].map((w, i) => (
                  <div key={i} className={`d-flex align-items-start gap-3 mb-3 anim d${i + 1}`}>
                    <div className="bg-primary bg-opacity-10 rounded-3 p-3"><i className={`bi ${w.icon} text-primary fs-4`}></i></div>
                    <div><h6 className="fw-bold m-0">{w.title}</h6><p className="text-muted m-0 small">{w.desc}</p></div>
                  </div>
                ))}
              </div>
              <div className="col-lg-6 mt-4 mt-lg-0">
                <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80" alt="Team" className="img-fluid" style={{ borderRadius: 'var(--radius-lg)' }} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ──── Stats ──── */}
      {homeConfig.showStats && (
        <section className="stat-bar py-5 text-center" style={{ background: 'linear-gradient(90deg,#0f172a,#1e293b)', minHeight: 200 }}>
          <div className="container">
            <div className="row g-4">
              {companyStats.map((s, i) => (
                <div key={i} className={`col-6 col-md-3 anim d${i + 1}`}>
                  <h2 className="fw-bold text-white mb-0" style={{ fontSize: '2.5rem' }}>{s.value}</h2>
                  <p className="text-white-50 m-0">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ──── Customers ──── */}
      {homeConfig.showCustomers && (
        <section className="d-flex align-items-center py-5 pattern-dots" style={{ backgroundColor: 'var(--bg-white)', overflow: 'hidden' }}>
          <div className="w-100">
            <div className="container">
              <div className="section-header text-center">
                <span className="section-label">Part of Our Success</span>
                <h2 className="section-title">OUR BELOVED CUSTOMERS</h2>
                <div className="underline mx-auto"></div>
              </div>
            </div>

            {/* Dynamic Marquee Rows */}
            {(() => {
              const selectedIds = homeConfig.selectedClients || [];
              const filteredClients = selectedIds.length > 0 
                ? clients.filter(c => selectedIds.includes(c.id))
                : clients;
              const rows = homeConfig.customersRows || 3;
              const directions = ['scroll-left', 'scroll-right', 'scroll-left-slow'];
              
              return Array.from({ length: rows }, (_, rowIdx) => {
                // Distribute clients across rows with offset
                const offset = rowIdx * Math.floor(filteredClients.length / rows);
                const rowClients = [...filteredClients.slice(offset), ...filteredClients.slice(0, offset)];
                // Repeat 4x for seamless marquee loop
                const displayClients = [...rowClients, ...rowClients, ...rowClients, ...rowClients];
                const dir = directions[rowIdx % directions.length];
                
                return (
                  <div className="marquee-wrap" key={`row-${rowIdx}`}>
                    <div className={`marquee-track ${dir}`}>
                      {displayClients.map((c, i) => (
                        <div key={`r${rowIdx}-${i}`} className="marquee-item">
                          <img src={c.logo} alt={c.name} />
                          <span>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}

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
        <section className="py-5">
          <div className="container">
            <div className="rounded-4 p-5 position-relative overflow-hidden" style={{ backgroundColor: 'var(--navy)', border: '1px solid var(--border-blue)', boxShadow: 'var(--shadow-blue)' }}>
              <div className="position-relative z-1 py-3 d-flex flex-column flex-lg-row align-items-center justify-content-between gap-4">
                <div className="text-center text-lg-start">
                  <h2 className="section-title text-white mb-2">พร้อมเปลี่ยนไอเดียให้เป็นงานสุดว้าวหรือยัง?</h2>
                  <p className="mb-0 mx-auto mx-lg-0 section-desc" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 650 }}>ไม่ว่าจะเป็นงานกีฬาสี ปาร์ตี้ สัมมนา หรือทีมบิวดิ้ง เราพร้อมดูแลทุกขั้นตอนให้งานของคุณออกมาสมบูรณ์แบบที่สุด ทักมาคุยกันได้เลย!</p>
                </div>
                <div className="flex-shrink-0 mt-3 mt-lg-0">
                  <Link to="/contact" className="btn btn-main px-5 py-3 text-nowrap">
                    ทักมาคุยกับเรา <i className="bi bi-chat-dots ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
