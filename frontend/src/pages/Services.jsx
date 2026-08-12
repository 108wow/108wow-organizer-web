import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import HeroSection from '../components/common/HeroSection';
import { serviceAPI, pageHeroAPI, galleryAPI } from '../api';

const EASE = [0.16, 1, 0.3, 1];

// Section headers reveal their label / title / copy one after another
const headerGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const headerItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};
const headerViewport = { once: true, amount: 0.4 };

export default function Services() {
  const [services, setServices] = useState([]);
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [galleryItems, setGalleryItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const sliderRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    Promise.all([serviceAPI.list(), pageHeroAPI.list(), galleryAPI.list()])
      .then(([svc, heroes, gallery]) => {
        setServices(svc);
        setHero(heroes.services || {});
        setGalleryItems(gallery);
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [loaded, location.hash]);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      if (slider.scrollLeft <= 0) {
        slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: -400, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: 400, behavior: 'smooth' });
      }
    }
  };

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  const activeServices = services.filter(s => s.isActive !== false);

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />

      {/* Services Bento Grid (Modern Creative Layout) */}
      <section className="section-padding overflow-hidden" style={{ background: '#f4f6f3' }}>
        <div className="container">
          <motion.div
            className="section-header text-center mb-5"
            variants={headerGroup}
            initial="hidden"
            whileInView="show"
            viewport={headerViewport}
          >
            <motion.span className="section-label" variants={headerItem}>บริการของเรา</motion.span>
            <motion.h2 className="section-title text-uppercase" style={{ color: 'var(--primary)', fontSize: '2.5rem' }} variants={headerItem}>OUR SERVICES</motion.h2>
            <motion.p className="mt-3 text-muted mx-auto" style={{ maxWidth: '600px' }} variants={headerItem}>
              โซลูชันครบวงจรที่ตอบโจทย์ทุกความต้องการทางธุรกิจของคุณ
            </motion.p>
          </motion.div>

          <div className="bento-services-grid mb-5">
            {activeServices.map((svc, i) => {
              let theme = 'bento-img';

              if (!svc.image) {
                if (i % 3 === 0) theme = 'bento-dark';
                else if (i % 3 === 1) theme = 'bento-lime';
                else theme = 'bento-white';
              }

              return (
                <motion.div
                  key={svc.id}
                  id={`service-${svc.id}`}
                  className={`bento-item ${theme}`}
                  initial={{ opacity: 0, y: 44, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.65, ease: EASE, delay: (i % 3) * 0.09 }}
                  whileHover={{ y: -8, transition: { duration: 0.3, ease: EASE } }}
                >
                  {svc.image && (
                    <img src={svc.image} alt={svc.title} className="bento-bg-img" />
                  )}
                  <div className="bento-overlay">
                    <div className="bento-header">
                      <div className="bento-icon">
                        <i className={`bi ${svc.icon || 'bi-lightning-charge-fill'}`}></i>
                      </div>
                      <span className="bento-number">0{i + 1}</span>
                    </div>
                    <div className="bento-content">
                      <h3>{svc.title}</h3>
                      <p>{svc.description}</p>
                      <Link to="/contact" className="bento-btn"><i className="bi bi-arrow-right"></i></Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Promo Banner */}
          <motion.div
            className="promo-banner-wrap mt-5"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <motion.div
              className="promo-content"
              variants={headerGroup}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 variants={headerItem}>Ready to Start?</motion.h2>
              <motion.p variants={headerItem}>ติดต่อเราวันนี้ เพื่อรับข้อเสนอและดีลสุดพิเศษที่คัดสรรมาเพื่อคุณ</motion.p>
            </motion.div>
            <motion.div
              className="promo-action"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.24 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link to="/contact" className="btn rounded-pill shadow-lg">สอบถามเพิ่มเติม</Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects (ความสำเร็จของเรา) */}
      {galleryItems.length > 0 && (
        <section className="section-padding overflow-hidden" style={{ background: 'var(--bg-white)' }}>
          <div className="container">
            <motion.div
              className="section-header text-center mb-5"
              variants={headerGroup}
              initial="hidden"
              whileInView="show"
              viewport={headerViewport}
            >
              <motion.span className="section-label" style={{ fontSize: '1.2rem', fontWeight: 700 }} variants={headerItem}>ความสำเร็จของเรา</motion.span>
              <motion.h2 className="section-title text-uppercase" style={{ color: 'var(--primary)', fontSize: '2.5rem' }} variants={headerItem}>OUR FEATURED PROJECTS</motion.h2>
            </motion.div>

            <div className="position-relative feat-slider-wrapper">
              {/* Real Slider Arrows */}
              <motion.button
                className="feat-arrow left d-none d-md-flex"
                onClick={scrollLeft}
                aria-label="เลื่อนไปทางซ้าย"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <i className="bi bi-chevron-left"></i>
              </motion.button>
              <motion.button
                className="feat-arrow right d-none d-md-flex"
                onClick={scrollRight}
                aria-label="เลื่อนไปทางขวา"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2, ease: EASE }}
              >
                <i className="bi bi-chevron-right"></i>
              </motion.button>

              <div className="feat-slider-container" ref={sliderRef}>
                {galleryItems.map((project, i) => (
                  <motion.div
                    key={project.id}
                    className="feat-slide-item"
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.09 }}
                    whileHover={{ y: -8, transition: { duration: 0.3, ease: EASE } }}
                  >
                    <div className="feat-project-card">
                      <img src={project.image} alt={project.title} />
                      <div className="feat-overlay">
                        <span className="badge feat-badge mb-2">{project.category}</span>
                        <h4>{project.title}</h4>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
