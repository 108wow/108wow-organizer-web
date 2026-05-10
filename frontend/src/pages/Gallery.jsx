import { useState } from 'react';
import HeroSection from '../components/common/HeroSection';
import { galleryItems, pageHeroes } from '../data/mockData';

// Helper to map categories to icons
const getCategoryIcon = (cat) => {
  const map = {
    'All': 'bi-grid-fill',
    'Corporate': 'bi-building',
    'Event': 'bi-calendar-event-fill',
    'Web': 'bi-laptop',
    'App': 'bi-phone',
  };
  return map[cat] || 'bi-images';
}

export default function Gallery() {
  const hero = pageHeroes.gallery;
  const categories = ['All', ...new Set(galleryItems.map((g) => g.category))];
  const [active, setActive] = useState('All');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFilter = (c) => {
    if (c === active) return;
    setIsAnimating(true);
    setTimeout(() => {
      setActive(c);
      setIsAnimating(false);
    }, 300); // รอจังหวะเฟดเอ้าท์ 300ms แล้วเปลี่ยนข้อมูล
  };

  const filtered = active === 'All' ? galleryItems : galleryItems.filter((g) => g.category === active);

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding" style={{ background: '#f4f6f3' }}>
        <div className="container">
          <div className="section-header text-center mb-5">
            <span className="section-label" style={{ letterSpacing: '2px', fontWeight: 700, color: 'var(--primary)' }}>OUR GALLERY</span>
            <h2 className="section-title text-uppercase mt-2" style={{ color: '#0a0f0d', fontSize: '2.5rem', fontWeight: 900 }}>แกลลอรี่ กิจกรรม</h2>
          </div>
          
          {/* Reference Style Filter Cards */}
          <div className="d-flex flex-wrap justify-content-center gap-3 gap-md-4 mb-5">
            {categories.map((c) => (
              <button 
                key={c} 
                className={`gallery-ref-filter ${active === c ? 'active' : ''}`} 
                onClick={() => handleFilter(c)}
              >
                <div className="filter-icon-box">
                  <i className={`bi ${getCategoryIcon(c)}`}></i>
                </div>
                <span className="filter-text">{c === 'All' ? 'ทั้งหมด' : c}</span>
              </button>
            ))}
          </div>

          {/* Clean CSS Grid */}
          <div className={`gallery-grid ${isAnimating ? 'filtering' : ''}`}>
            {filtered.map((item, i) => (
              <div key={item.id} className={`gallery-grid-item anim d${(i % 6) + 1}`}>
                <img src={item.image} alt={item.title} />
                <div className="gm-overlay">
                  <div className="gm-content">
                    <span className="badge mb-2 rounded-pill px-3">{item.category}</span>
                    <h4>{item.title}</h4>
                    <p className="gm-desc">{item.description}</p>
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
