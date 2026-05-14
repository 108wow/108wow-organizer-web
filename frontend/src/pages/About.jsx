import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/common/HeroSection';
import { companyAPI, pageHeroAPI, aboutConfigAPI } from '../api';

export default function About() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [loaded, setLoaded] = useState(false);

  const [stats, setStats] = useState([]);
  const [aboutConfig, setAboutConfig] = useState(null);

  useEffect(() => {
    Promise.all([companyAPI.get(), pageHeroAPI.list(), companyAPI.listStats(), aboutConfigAPI.get()])
      .then(([info, heroes, st, config]) => {
        setCompanyInfo(info);
        setHero(heroes.about || {});
        setStats(st);
        setAboutConfig(config);
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      {/* Top Section: Who We Are */}
      <section className="section-padding" style={{ background: 'var(--bg-white)', overflow: 'hidden' }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="about-hero-img-wrap">
                <div className="position-relative shadow-lg" style={{ borderRadius: '50% 50% 10px 10px', overflow: 'hidden', height: '500px', cursor: 'pointer' }} onClick={() => setIsPlaying(true)}>
                  <img src={aboutConfig?.videoThumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'} alt="Team Building Video Thumbnail" className="img-fluid w-100 h-100" style={{ objectFit: 'cover' }} />
                  <div className="video-play-btn">
                    <i className="bi bi-play-fill"></i>
                  </div>
                </div>

                <div className="about-exp-box">
                  <div className="num">{stats.length > 0 ? stats[0].value : '24'}</div>
                  <div className="text" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                    {stats.length > 0 ? stats[0].label : 'Years Of\nExperience'}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6 ps-lg-5">
              <h2 className="fw-bold text-primary mb-3" style={{ fontSize: '2.2rem', lineHeight: '1.3' }}>
                {companyInfo.tagline || 'รับจัดกิจกรรม Team Building สร้างสัมพันธ์ในองค์กร'}
              </h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                {companyInfo.about} เราสร้างสรรค์กิจกรรมที่สอดคล้องกับความต้องการและวัฒนธรรมขององค์กร ส่งเสริมความตระหนักรู้ ภาวะผู้นำ และการทำงานเป็นทีม
              </p>

              <ul className="about-val-list mb-5">
                {(aboutConfig?.coreValues || []).map((cv, idx) => (
                  <li key={idx}><i className={`bi ${cv.icon}`}></i> {cv.title}</li>
                ))}
              </ul>

              <Link to="/contact" className="btn-main shadow-lg">ติดต่อร่วมงานกับเรา</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {isPlaying && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1055 }} onClick={() => setIsPlaying(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 justify-content-end p-0 mb-3">
                <button type="button" className="btn-close btn-close-white fs-4" aria-label="Close" onClick={() => setIsPlaying(false)}></button>
              </div>
              <div className="modal-body p-0">
                <div className="ratio ratio-16x9 shadow-lg rounded overflow-hidden">
                  <iframe
                    src={aboutConfig?.videoUrl || "https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1"}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Middle Section: Quote & Images */}
      <section className="container-fluid px-0">
        <div className="row g-0">
          <div className="col-lg-4">
            <div className="about-quote-box">
              <i className="bi bi-quote about-quote-icon"></i>
              <div className="about-quote-text">
                "{companyInfo.vision || 'เราเชื่อว่าบุคลากร คือทรัพยากรที่สำคัญที่สุดภายในองค์กร'}"
              </div>
              <div className="about-quote-author">
                <strong>{companyInfo.name || 'Our'} Team</strong>
                <br />
                {companyInfo.mission || 'ทีมผู้เชี่ยวชาญด้านการพัฒนาบุคคล'}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <img src={aboutConfig?.teamImages?.[0] || "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80"} alt="Team 1" className="img-fluid w-100 h-100" style={{ objectFit: 'cover', minHeight: '400px' }} />
          </div>
          <div className="col-lg-4">
            <img src={aboutConfig?.teamImages?.[1] || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"} alt="Team 2" className="img-fluid w-100 h-100" style={{ objectFit: 'cover', minHeight: '400px' }} />
          </div>
        </div>
      </section>

      {/* Bottom Section: Call to Action Banners */}
      <section className="container-fluid px-0">
        <div className="row g-0">
          {(aboutConfig?.banners || []).map((banner, idx) => (
            <div className={`col-lg-6 ${idx === 0 ? 'about-banner-left' : 'about-banner-right'}`} key={idx}>
              <div className="about-banner-wrap">
                <img src={banner.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80'} alt={`Banner ${idx+1}`} />
                <div className="about-banner-overlay">
                  <h3 className="about-banner-title">{banner.title}</h3>
                  {idx === 0 ? (
                    <div className="about-socials">
                      <a href="#"><i className="bi bi-facebook"></i></a>
                      <a href="#"><i className="bi bi-line"></i></a>
                      <a href="#"><i className="bi bi-telephone-fill"></i></a>
                      <a href="#"><i className="bi bi-envelope-fill"></i></a>
                    </div>
                  ) : (
                    <Link to="/contact" className="btn-main shadow-lg" style={{ border: '2px solid #fff' }}>ติดต่อร่วมงานกับเรา</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Legacy Timeline Section at the bottom */}
      <section className="section-padding" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <div className="section-header text-center"><span className="section-label">Timeline</span><h2 className="section-title">เส้นทางของเรา</h2><div className="underline mx-auto"></div></div>
          <div className="row g-4">{(aboutConfig?.timeline || []).map((t, i) => (
            <div key={i} className={`col-md-3 anim d${i + 1}`}><div className="card-white text-center h-100 shadow-sm" style={{ transition: 'all 0.3s ease', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow='var(--shadow-md)'; }} onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}><div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginBottom: 4 }}>{t.year}</div><h6 style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.title}</h6><small>{t.desc}</small></div></div>
          ))}</div>
        </div>
      </section>
    </>
  );
}
