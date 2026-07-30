import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HeroSection from '../components/common/HeroSection';
import { galleryAPI, pageHeroAPI, galleryCategoryAPI } from '../api';

const EASE = [0.16, 1, 0.3, 1];

// Section header reveals its label then its title
const headerGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const headerItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Filter buttons cascade in from the centre outwards
const filterGroup = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const filterItem = {
  hidden: { opacity: 0, y: 20, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [active, setActive] = useState('All');
  const [loaded, setLoaded] = useState(false);

  const [categories, setCategories] = useState([]);

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

  const filtered = active === 'All' ? galleryItems : galleryItems.filter((g) => g.category === active);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding overflow-hidden" style={{ background: '#f4f6f3' }}>
        <div className="container">
          <motion.div
            className="section-header text-center mb-5"
            variants={headerGroup}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.span className="section-label" style={{ letterSpacing: '2px', fontWeight: 700, color: 'var(--primary)' }} variants={headerItem}>OUR GALLERY</motion.span>
            <motion.h2 className="section-title text-uppercase mt-2" style={{ color: '#0a0f0d', fontSize: '2.5rem', fontWeight: 900 }} variants={headerItem}>แกลลอรี่ กิจกรรม</motion.h2>
          </motion.div>

          <motion.div
            className="d-flex flex-wrap justify-content-center gap-3 gap-md-4 mb-5"
            variants={filterGroup}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {categories.map((c) => {
              const count = c.name === 'All'
                ? galleryItems.length
                : galleryItems.filter((g) => g.category === c.name).length;
              const isDisabled = count === 0;

              return (
                <motion.button
                  key={c.name}
                  disabled={isDisabled}
                  className={`gallery-ref-filter ${active === c.name ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                  onClick={() => !isDisabled && setActive(c.name)}
                  title={isDisabled ? 'ไม่มีผลงานในหมวดหมู่นี้' : ''}
                  variants={filterItem}
                  whileHover={isDisabled ? undefined : { y: -4, transition: { duration: 0.25, ease: EASE } }}
                  whileTap={isDisabled ? undefined : { scale: 0.95 }}
                >
                  <div className="filter-icon-box"><i className={`bi ${c.icon}`}></i></div>
                  <span className="filter-text">{c.name === 'All' ? 'ทั้งหมด' : c.name}</span>
                  <span className="filter-count">{count}</span>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="gallery-grid">
            {/* popLayout lifts exiting tiles out of flow so the rest can glide into place */}
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  exit={{ opacity: 0, scale: 0.86, filter: 'blur(4px)', transition: { duration: 0.24, ease: 'easeIn' } }}
                  transition={{ layout: { duration: 0.5, ease: EASE } }}
                  style={{ perspective: 1200 }}
                >
                  {/* Inner wrapper carries the scroll reveal so its transforms never fight `layout` */}
                  <motion.div
                    initial={{ opacity: 0, y: 44, scale: 0.94, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.6, ease: EASE, delay: (i % 3) * 0.08 }}
                    whileHover={{ y: -8, transition: { duration: 0.3, ease: EASE } }}
                    style={{ transformOrigin: 'center bottom' }}
                  >
                    <div
                      className="gallery-grid-item"
                      onClick={() => item.albumUrl && window.open(item.albumUrl, '_blank')}
                      style={{ cursor: item.albumUrl ? 'pointer' : 'default' }}
                    >
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
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </>
  );
}
