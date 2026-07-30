import { useState, useEffect } from 'react';
import HeroSection from '../components/common/HeroSection';
import { galleryAPI, pageHeroAPI, galleryCategoryAPI } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [active, setActive] = useState('All');
  const [isAnimating, setIsAnimating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [categories, setCategories] = useState([]);

  useScrollReveal([loaded, active, galleryItems]);

  useEffect(() => {
    Promise.all([galleryAPI.list(), pageHeroAPI.list(), galleryCategoryAPI.list()])
      .then(([items, heroes, cats]) => {
        setGalleryItems(items);
        setHero(heroes.gallery || {});
        
        // Add 'All' as the first category option
        setCategories([{ name: 'All', icon: 'bi-grid-fill' }, ...cats]);
        
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  const handleFilter = (c) => {
    if (c === active) return;
    setIsAnimating(true);
    setTimeout(() => { setActive(c); setIsAnimating(false); }, 300);
  };

  const filtered = active === 'All' ? galleryItems : galleryItems.filter((g) => g.category === active);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding overflow-hidden" style={{ background: '#f4f6f3' }}>
        <div className="container">
          <div className="section-header text-center mb-5 reveal-up">
            <span className="section-label" style={{ letterSpacing: '2px', fontWeight: 700, color: 'var(--primary)' }}>OUR GALLERY</span>
            <h2 className="section-title text-uppercase mt-2" style={{ color: '#0a0f0d', fontSize: '2.5rem', fontWeight: 900 }}>แกลลอรี่ กิจกรรม</h2>
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4 mb-5 reveal-up">
            {categories.map((c) => {
              const count = c.name === 'All'
                ? galleryItems.length
                : galleryItems.filter((g) => g.category === c.name).length;
              const isDisabled = count === 0;

              return (
                <button
                  key={c.name}
                  disabled={isDisabled}
                  className={`gallery-ref-filter ${active === c.name ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && handleFilter(c.name)}
                  title={isDisabled ? 'ไม่มีผลงานในหมวดหมู่นี้' : ''}
                >
                  <div className="filter-icon-box"><i className={`bi ${c.icon}`}></i></div>
                  <span className="filter-text">{c.name === 'All' ? 'ทั้งหมด' : c.name}</span>
                </button>
              );
            })}
          </div>
          <div className={`gallery-grid ${isAnimating ? 'filtering' : ''}`}>
            {filtered.map((item, i) => (
              <div key={item.id} className={`gallery-grid-item anim d${(i % 6) + 1}`}
                onClick={() => item.albumUrl && window.open(item.albumUrl, '_blank')}
                style={{ cursor: item.albumUrl ? 'pointer' : 'default' }}>
                <img src={item.image} alt={item.title} />
                <div className="gm-overlay">
                  <div className="gm-content">
                    <span className="badge mb-2 rounded-pill px-3">{item.category}</span>
                    <h4>{item.title}</h4>
                    <p className="gm-desc">{item.description}</p>
                    {item.albumUrl && <small className="text-white-50"><i className="bi bi-box-arrow-up-right me-1"></i>View Album</small>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
