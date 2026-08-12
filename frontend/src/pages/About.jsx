import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/common/HeroSection';
import { companyAPI, pageHeroAPI, aboutConfigAPI } from '../api';
import { motion } from 'motion/react';

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
      <section className="section-padding overflow-hidden" style={{ background: 'var(--bg-white)', paddingTop: '90px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="row g-5 align-items-center">
            <motion.div 
              className="col-lg-6"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="about-hero-img-wrap w-100">
                <div className="position-relative shadow-lg" style={{ borderRadius: '50% 50% 16px 16px', overflow: 'hidden', height: '520px', cursor: 'pointer' }} onClick={() => setIsPlaying(true)}>
                  <img
                    src={aboutConfig?.videoThumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'}
                    alt="Team Building Video Thumbnail"
                    className="img-fluid w-100 h-100"
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                  <div className="video-play-btn">
                    <i className="bi bi-play-fill"></i>
                  </div>
                </div>

                <motion.div 
                  className="about-exp-box"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.6, type: "spring", bounce: 0.4 }}
                  style={{ borderRadius: '12px' }}
                >
                  <div className="num">{stats.length > 0 ? stats[0].value : '24'}</div>
                  <div className="text" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                    {stats.length > 0 ? stats[0].label : 'Years Of\nExperience'}
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="col-lg-6 ps-lg-5"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="fw-bold text-primary mb-3" style={{ fontSize: '2.2rem', lineHeight: '1.3' }}>
                {companyInfo.tagline || 'รับจัดกิจกรรม Team Building สร้างสัมพันธ์ในองค์กร'}
              </h2>
              <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                {companyInfo.about} เราสร้างสรรค์กิจกรรมที่สอดคล้องกับความต้องการและวัฒนธรรมขององค์กร ส่งเสริมความตระหนักรู้ ภาวะผู้นำ และการทำงานเป็นทีม
              </p>

              <motion.ul
                className="about-val-list mb-5"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
              >
                {(aboutConfig?.coreValues || []).map((cv, idx) => (
                  <motion.li
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                    }}
                  >
                    <i className={`bi ${cv.icon}`}></i> {cv.title}
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                <Link to="/contact" className="btn-main shadow-lg">ติดต่อร่วมงานกับเรา</Link>
              </motion.div>
            </motion.div>
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
      <section className="container-fluid px-0 overflow-hidden">
        <div className="row g-0">
          <motion.div
            className="col-lg-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
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
          </motion.div>
          <motion.div
            className="col-lg-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={aboutConfig?.teamImages?.[0] || "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80"} alt="Team 1" className="img-fluid w-100 h-100" style={{ objectFit: 'cover', minHeight: '400px' }} />
          </motion.div>
          <motion.div
            className="col-lg-4"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <img src={aboutConfig?.teamImages?.[1] || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80"} alt="Team 2" className="img-fluid w-100 h-100" style={{ objectFit: 'cover', minHeight: '400px' }} />
          </motion.div>
        </div>
      </section>

      {/* Bottom Section: Call to Action Banners */}
      <section className="container-fluid px-0 overflow-hidden">
        <div className="row g-0">
          {(aboutConfig?.banners || []).map((banner, idx) => (
            <motion.div
              className={`col-lg-6 ${idx === 0 ? 'about-banner-left' : 'about-banner-right'}`}
              key={idx}
              initial={{ opacity: 0, x: idx === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="about-banner-wrap">
                <img src={banner.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80'} alt={`Banner ${idx + 1}`} />
                <div className="about-banner-overlay">
                  <h3 className="about-banner-title">{banner.title}</h3>
                  {idx === 0 ? (
                    <div className="about-socials">
                      <Link to="/contact"><i className="bi bi-facebook"></i></Link>
                      <Link to="/contact"><i className="bi bi-line"></i></Link>
                      <Link to="/contact"><i className="bi bi-telephone-fill"></i></Link>
                      <Link to="/contact"><i className="bi bi-envelope-fill"></i></Link>
                    </div>
                  ) : (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link to="/contact" className="btn-main shadow-lg" style={{ border: '2px solid #fff' }}>ติดต่อร่วมงานกับเรา</Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Legacy Timeline Section at the bottom */}
      <section className="section-padding overflow-hidden" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <motion.div
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="section-label">Timeline</span><h2 className="section-title">เส้นทางของเรา</h2><div className="underline mx-auto"></div>
          </motion.div>

          <motion.div
            className="row g-4"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {(aboutConfig?.timeline || []).map((t, i) => (
              <motion.div
                key={i}
                className="col-md-3"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring" } }
                }}
              >
                <div className="card-white text-center h-100 shadow-sm" style={{ transition: 'all 0.3s ease', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginBottom: 4 }}>{t.year}</div>
                  <h6 style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.title}</h6>
                  <small>{t.desc}</small>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
