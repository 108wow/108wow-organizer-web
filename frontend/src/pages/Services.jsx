import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/common/HeroSection';
import { serviceAPI, pageHeroAPI, galleryAPI } from '../api';

export default function Services() {
  const [services, setServices] = useState([]);
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [galleryItems, setGalleryItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    Promise.all([serviceAPI.list(), pageHeroAPI.list(), galleryAPI.list()])
      .then(([svc, heroes, gallery]) => {
        setServices(svc);
        setHero(heroes.services || {});
        setGalleryItems(gallery);
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  const scrollLeft = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      if (slider.scrollLeft <= 0) {
        // หมุนวนกลับไปท้ายสุด
        slider.scrollTo({ left: slider.scrollWidth, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: -400, behavior: 'smooth' });
      }
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      const slider = sliderRef.current;
      // เช็กว่าเลื่อนไปจนสุดทางขวาหรือยัง (เผื่อค่าทศนิยมเล็กน้อย 10px)
      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
        // หมุนวนกลับไปเริ่มต้น
        slider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        slider.scrollBy({ left: 400, behavior: 'smooth' });
      }
    }
  };

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      
      {/* Services Bento Grid (Modern Creative Layout) */}
      <section className="section-padding" style={{ background: '#f4f6f3' }}>
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="section-label">บริการของเรา</span>
            <h2 className="section-title text-uppercase" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>OUR SERVICES</h2>
            <p className="mt-3 text-muted mx-auto" style={{ maxWidth: '600px' }}>
              โซลูชันครบวงจรที่ตอบโจทย์ทุกความต้องการทางธุรกิจของคุณ
            </p>
          </div>
          
          <div className="bento-services-grid mb-5">
            {services.map((svc, i) => {
              let theme = 'bento-img';
              if (i === 1) theme = 'bento-dark';
              if (i === 2) theme = 'bento-lime';
              if (i === 4) theme = 'bento-white';
              if (i > 4) theme = i % 2 === 0 ? 'bento-dark' : 'bento-img'; // Fallback for extra services
              
              return (
                <div key={svc.id} className={`bento-item anim d${(i % 6) + 1} ${theme}`}>
                  {theme === 'bento-img' && (
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
                </div>
              );
            })}
          </div>

          {/* Promo Banner */}
          <div className="promo-banner-wrap mt-5 anim d2">
            <div className="promo-content">
              <h2>Ready to Start?</h2>
              <p>ติดต่อเราวันนี้ เพื่อรับข้อเสนอและดีลสุดพิเศษที่คัดสรรมาเพื่อคุณ</p>
            </div>
            <div className="promo-action">
              <Link to="/contact" className="btn rounded-pill shadow-lg">สอบถามเพิ่มเติม</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects (ความสำเร็จของเรา) */}
      {galleryItems.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--bg-white)' }}>
          <div className="container">
            <div className="section-header text-center mb-5">
              <span className="section-label" style={{ fontSize: '1.2rem', fontWeight: 700 }}>ความสำเร็จของเรา</span>
              <h2 className="section-title text-uppercase" style={{ color: 'var(--primary)', fontSize: '2.5rem' }}>OUR FEATURED PROJECTS</h2>
            </div>
            
            <div className="position-relative feat-slider-wrapper">
              {/* Real Slider Arrows */}
              <button className="feat-arrow left d-none d-md-flex" onClick={scrollLeft}><i className="bi bi-chevron-left"></i></button>
              <button className="feat-arrow right d-none d-md-flex" onClick={scrollRight}><i className="bi bi-chevron-right"></i></button>
              
              <div className="feat-slider-container" ref={sliderRef}>
                {galleryItems.map((project, i) => (
                  <div key={project.id} className="feat-slide-item">
                    <div className="feat-project-card">
                      <img src={project.image} alt={project.title} />
                      <div className="feat-overlay">
                        <span className="badge feat-badge mb-2">{project.category}</span>
                        <h4>{project.title}</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
