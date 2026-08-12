import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import HeroSection from '../components/common/HeroSection';
import EquipmentLightbox from '../components/common/EquipmentLightbox';
import { equipmentAPI, pageHeroAPI, companyAPI } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

const SORT_OPTIONS = [
  { value: 'default', label: 'ค่าเริ่มต้น', icon: 'bi-grid' },
  { value: 'name-asc', label: 'ชื่ออุปกรณ์ (ก - ฮ)', icon: 'bi-sort-alpha-down' },
  { value: 'name-desc', label: 'ชื่ออุปกรณ์ (ฮ - ก)', icon: 'bi-sort-alpha-up-alt' },
];

const SEARCH_DEBOUNCE_MS = 220;
const EASE = [0.16, 1, 0.3, 1];

// Shared motion config for both filter dropdowns
const menuMotion = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15, ease: 'easeIn' } },
  transition: { duration: 0.28, ease: EASE },
};

const menuItemMotion = (i) => ({
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: EASE, delay: 0.03 + i * 0.045 },
});




export default function RentEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [hero, setHero] = useState({ title: 'EQUIPMENT SHOWCASE', subtitle: 'อุปกรณ์คุณภาพสูงสำหรับจัดงานกิจกรรมและสปอร์ตเดย์ทุกรูปแบบ', image: '' });
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  // Debounced copy of searchQuery so the grid doesn't re-filter on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});

  // Lightbox: zoomOrigin holds the clicked card's offset from screen centre so the
  // modal can appear to grow out of that card. Gallery state lives in the component.
  const [selectedItem, setSelectedItem] = useState(null);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 0, y: 0 });

  // Filter dropdowns — AnimatePresence handles the exit animation, so no closing state or timers
  const [sortOpen, setSortOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const sortRef = useRef(null);
  const catRef = useRef(null);

  // Close whichever menu is open on outside click / Escape
  useEffect(() => {
    if (!sortOpen && !catOpen) return;
    const handlePointerDown = (e) => {
      if (sortOpen && sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
      if (catOpen && catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setSortOpen(false);
      setCatOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortOpen, catOpen]);

  const handleCategoryChange = (cat) => {
    setCatOpen(false);
    setActiveCategory(cat);
  };

  const handleSortChange = (value) => {
    setSortOpen(false);
    setSortBy(value);
  };

  const handleResetFilters = () => {
    setActiveCategory('ทั้งหมด');
    setSortBy('default');
    setSearchQuery('');
  };

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useScrollReveal([loaded, equipmentList]);

  useEffect(() => {
    Promise.all([
      equipmentAPI.list(),
      pageHeroAPI.list().catch(() => ({})),
      companyAPI.get().catch(() => ({}))
    ]).then(([items, heroes, company]) => {
      setEquipmentList(items || []);
      if (heroes && heroes.equipment) {
        setHero(heroes.equipment);
      }
      setCompanyInfo(company || {});
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  // Extract unique categories
  const categories = ['ทั้งหมด', ...Array.from(new Set(equipmentList.map(item => item.category).filter(Boolean)))];

  // Filter items — Motion animates the difference, so this can read straight from state
  const filteredItems = equipmentList.filter(item => {
    const matchCategory = activeCategory === 'ทั้งหมด' || item.category === activeCategory;
    const matchSearch = !debouncedSearch ||
      item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'th');
    if (sortBy === 'name-desc') return b.name.localeCompare(a.name, 'th');
    return 0;
  });

  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy) || SORT_OPTIONS[0];

  const openLightbox = (item, e) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      setZoomOrigin({
        x: rect.left + rect.width / 2 - window.innerWidth / 2,
        y: rect.top + rect.height / 2 - window.innerHeight / 2,
      });
    } else {
      setZoomOrigin({ x: 0, y: 0 });
    }
    setSelectedItem(item);
  };

  const closeLightbox = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const getLineLink = () => {
    if (companyInfo.lineUrl) return companyInfo.lineUrl;
    if (companyInfo.lineId) {
      const cleanLine = companyInfo.lineId.replace('@', '');
      return `https://line.me/R/ti/p/@${cleanLine}`;
    }
    return '/contact';
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  return (
    <>
      <HeroSection 
        title={hero.title || "EQUIPMENT SHOWCASE"} 
        subtitle={hero.subtitle || "อุปกรณ์คุณภาพสูงสำหรับจัดงานกิจกรรมและสปอร์ตเดย์ทุกรูปแบบ"} 
        image={hero.image} 
      />

      <section className="py-5 overflow-hidden" style={{ background: '#f8fafc', minHeight: '60vh' }}>
        <div className="container py-4">
          
          {/* Header Title */}
          <div className="text-center mb-5 reveal-up">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px', fontSize: '0.82rem' }}>
              OUR RENTAL CATALOG
            </span>
            <h2 className="display-6 fw-black text-dark text-uppercase mt-1 mb-3" style={{ fontWeight: 900, color: '#0f172a' }}>
              อุปกรณ์สำหรับจัดงาน
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px', fontSize: '1.05rem' }}>
              เรามีอุปกรณ์สำหรับงานสปอร์ตเดย์ งานอีเวนต์ เวที เสียง แสง และอุปกรณ์การแข่งขันครบครัน พร้อมบริการส่งถึงหน้างาน
            </p>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light-subtle mb-5 reveal-up" style={{ position: 'relative', zIndex: 10 }}>
            <div className="row g-3 align-items-center">
              
              {/* Search input */}
              <div className="col-lg-5 col-12">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                  <input
                    type="text"
                    className="form-control ps-5 rounded-pill shadow-none eq-search-input"
                    placeholder="ค้นหาชื่ออุปกรณ์..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: '#f8fafc', fontSize: '0.95rem', height: '46px', border: '1px solid #e2e8f0' }}
                  />
                  {searchQuery && (
                    <button 
                      className="btn btn-link text-muted position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 shadow-none"
                      onClick={() => setSearchQuery('')}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Category Selector */}
              <div className="col-lg-4 col-md-6">
                <div className="dropdown eq-sort w-100" ref={catRef}>
                  <motion.button
                    type="button"
                    className="eq-sort-toggle w-100 d-flex align-items-center justify-content-between rounded-pill px-3"
                    onClick={() => setCatOpen(o => !o)}
                    aria-expanded={catOpen}
                    aria-haspopup="listbox"
                    whileTap={{ scale: 0.985 }}
                  >
                    <span className="d-flex align-items-center gap-2 overflow-hidden">
                      <i className="bi bi-collection text-muted"></i>
                      <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>หมวดหมู่</span>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={activeCategory}
                          className="fw-semibold text-dark text-truncate"
                          style={{ fontSize: '0.9rem' }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: EASE }}
                        >
                          {activeCategory}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <motion.i
                      className="bi bi-chevron-down text-muted"
                      style={{ fontSize: '0.75rem' }}
                      animate={{ rotate: catOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  </motion.button>
                  <AnimatePresence>
                    {catOpen && (
                      <motion.ul
                        className="dropdown-menu eq-sort-menu show border-0 p-2 w-100"
                        style={{ borderRadius: '16px', zIndex: 1050, transformOrigin: 'top center' }}
                        role="listbox"
                        {...menuMotion}
                      >
                        {categories.map((cat, i) => {
                          const count = cat === 'ทั้งหมด'
                            ? equipmentList.length
                            : equipmentList.filter(item => item.category === cat).length;
                          const isDisabled = count === 0;

                          return (
                            <motion.li key={cat} {...menuItemMotion(i)}>
                              <button
                                type="button"
                                role="option"
                                disabled={isDisabled}
                                aria-selected={activeCategory === cat}
                                className={`dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 ${activeCategory === cat ? 'bg-primary bg-opacity-10 text-primary fw-bold' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                                style={{ opacity: isDisabled ? 0.5 : 1 }}
                              >
                                <i className={`bi ${cat === 'ทั้งหมด' ? 'bi-grid-fill' : 'bi-folder2'} ${activeCategory === cat ? 'text-primary' : 'text-muted'}`}></i>
                                <span className="flex-grow-1 text-start" style={{ fontSize: '0.9rem' }}>{cat}</span>
                                <span className="badge rounded-pill ms-2" style={{ background: activeCategory === cat ? 'rgba(163,217,0,0.2)' : '#f1f5f9', color: activeCategory === cat ? 'var(--primary)' : '#64748b', fontSize: '0.75rem' }}>{count}</span>
                              </button>
                            </motion.li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Sort Selector */}
              <div className="col-lg-3 col-md-6">
                <div className="dropdown eq-sort w-100" ref={sortRef}>
                  <motion.button
                    type="button"
                    className="eq-sort-toggle w-100 d-flex align-items-center justify-content-between rounded-pill px-3"
                    onClick={() => setSortOpen(o => !o)}
                    aria-expanded={sortOpen}
                    aria-haspopup="listbox"
                    whileTap={{ scale: 0.985 }}
                  >
                    <span className="d-flex align-items-center gap-2 overflow-hidden">
                      <i className="bi bi-sort-down text-muted"></i>
                      <span className="text-muted d-none d-sm-inline" style={{ fontSize: '0.85rem' }}>เรียงตาม</span>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={sortBy}
                          className="fw-semibold text-dark text-truncate"
                          style={{ fontSize: '0.9rem' }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: EASE }}
                        >
                          {currentSort.label}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <motion.i
                      className="bi bi-chevron-down text-muted"
                      style={{ fontSize: '0.75rem' }}
                      animate={{ rotate: sortOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    />
                  </motion.button>
                  <AnimatePresence>
                    {sortOpen && (
                      <motion.ul
                        className="dropdown-menu eq-sort-menu show border-0 p-2 w-100"
                        style={{ borderRadius: '16px', zIndex: 1050, transformOrigin: 'top center' }}
                        role="listbox"
                        {...menuMotion}
                      >
                        {SORT_OPTIONS.map((opt, i) => (
                          <motion.li key={opt.value} {...menuItemMotion(i)}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={sortBy === opt.value}
                              className={`dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 ${sortBy === opt.value ? 'bg-primary bg-opacity-10 text-primary fw-bold' : ''}`}
                              onClick={() => handleSortChange(opt.value)}
                            >
                              <i className={`bi ${opt.icon} ${sortBy === opt.value ? 'text-primary' : 'text-muted'}`}></i>
                              <span className="flex-grow-1 text-start" style={{ fontSize: '0.9rem' }}>{opt.label}</span>
                              {sortBy === opt.value && <i className="bi bi-check2 text-primary"></i>}
                            </button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>



            </div>
          </div>

          {/* Equipment Items Grid */}
          <div className="eq-grid">
            <AnimatePresence>
              {sortedItems.length === 0 && (
                <motion.div
                  key="empty"
                  className="text-center py-5 bg-white rounded-4 shadow-sm my-4"
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.98, transition: { duration: 0.2, ease: 'easeIn' } }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <i className="bi bi-box-seam text-muted" style={{ fontSize: '3.5rem' }}></i>
                  <h4 className="fw-bold mt-3 text-dark">ไม่พบอุปกรณ์ที่ค้นหา</h4>
                  <p className="text-muted mb-3">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่เพื่อค้นหาอุปกรณ์ที่คุณต้องการ</p>
                  <button className="btn btn-outline-dark rounded-pill px-4" onClick={handleResetFilters}>
                    ล้างการค้นหาทั้งหมด
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="row g-4">
              {/* popLayout pulls exiting cards out of flow so the survivors glide to their new slots */}
              <AnimatePresence mode="popLayout">
              {sortedItems.map((item, index) => {
                const imgList = item.images && item.images.length > 0 ? item.images : [item.coverImage].filter(Boolean);
                const mainImg = item.coverImage || (imgList[0] || '');
                const photoCount = imgList.length;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    exit={{ opacity: 0, scale: 0.88, filter: 'blur(4px)', transition: { duration: 0.22, ease: 'easeIn' } }}
                    transition={{ layout: { duration: 0.5, ease: EASE } }}
                    className="col-12 col-md-6 col-lg-4 col-xl-3"
                    style={{ perspective: 1200 }}
                  >
                    {/* Inner wrapper carries the scroll-reveal so its transforms never fight `layout` */}
                    <motion.div
                      className="h-100"
                      initial={{ opacity: 0, y: 45, scale: 0.94, rotateX: 12, filter: 'blur(7px)' }}
                      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.6, ease: EASE, delay: (index % 4) * 0.07 }}
                      style={{ transformOrigin: 'center bottom' }}
                    >
                    <div
                      className="card h-100 border-0 rounded-4 overflow-hidden eq-card position-relative shadow-sm d-flex flex-column"
                      onClick={(e) => openLightbox(item, e)}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: '#ffffff',
                        border: '1px solid rgba(226, 232, 240, 0.8)'
                      }}
                    >
                      {/* TOP SECTION: IMAGE CONTAINER (Full-Width Top Cover) */}
                      <div className="position-relative overflow-hidden" style={{ height: '230px', background: '#0f172a' }}>
                        {mainImg ? (
                          <img 
                            src={mainImg} 
                            alt={item.name} 
                            className="w-100 h-100 object-fit-cover eq-card-img"
                            style={{ transition: 'transform 0.6s cubic-bezier(0.2, 1, 0.2, 1)' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white-50 p-3 text-center" style={{ display: mainImg ? 'none' : 'flex' }}>
                          <i className="bi bi-image fs-1 opacity-40 mb-1"></i>
                          <span style={{ fontSize: '0.8rem' }}>ไม่มีรูปภาพ</span>
                        </div>

                        {/* Top Right Photo Count Badge */}
                        {photoCount > 1 && (
                          <div className="position-absolute top-0 end-0 m-3 z-2">
                            <span 
                              className="badge bg-black bg-opacity-65 text-white backdrop-blur px-3 py-1 rounded-pill fw-bold d-flex align-items-center gap-1 border border-white border-opacity-10" 
                              style={{ fontSize: '0.72rem', backdropFilter: 'blur(8px)' }}
                            >
                              <i className="bi bi-images text-primary"></i> {photoCount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* BOTTOM SECTION: Card Content Body */}
                      <div className="card-body p-4 d-flex flex-column flex-grow-1" style={{ background: '#fff' }}>
                        {/* Category Badge Below Image */}
                        <div className="mb-2">
                          <span 
                            className="badge bg-secondary bg-opacity-10 text-dark border border-secondary border-opacity-20 px-3 py-2 rounded-pill fw-semibold" 
                            style={{ fontSize: '0.73rem', letterSpacing: '0.3px' }}
                          >
                            {item.category}
                          </span>
                        </div>

                        <h5 
                          className="fw-bold text-dark mb-2 text-truncate-2" 
                          title={item.name}
                          style={{ 
                            fontSize: '1.08rem', 
                            lineHeight: '1.4', 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden',
                            height: '3rem'
                          }}
                        >
                          {item.name}
                        </h5>
                        
                        <p 
                          className="text-secondary small mb-4 flex-grow-1" 
                          style={{ 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden', 
                            lineHeight: 1.6,
                            fontSize: '0.88rem',
                            color: '#64748b'
                          }}
                        >
                          {item.description || "อุปกรณ์คุณภาพดีสำหรับจัดกิจกรรมและการแข่งขันสปอร์ตเดย์"}
                        </p>
                        
                        {/* Footer Action Area - Clean Button */}
                        <div className="pt-3 border-top border-light-subtle d-flex justify-content-between align-items-center mt-auto">
                          <span className="fw-bold small text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
                            ดูรายละเอียด
                          </span>
                          <div className="eq-arrow-circle rounded-circle d-flex align-items-center justify-content-center bg-light text-dark transition-all" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-arrow-right fs-6"></i>
                          </div>
                        </div>
                      </div>

                    </div>
                    </motion.div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* Product lightbox — shared with the admin inbox */}
      <EquipmentLightbox
        item={selectedItem}
        onClose={closeLightbox}
        zoomOrigin={zoomOrigin}
        footer={selectedItem && (
          <>
            <motion.a
              href={`/contact?equipment=${encodeURIComponent(selectedItem.name)}`}
              className="btn rounded-pill flex-grow-1 py-2 px-3 fw-bold d-flex align-items-center justify-content-center gap-2 text-dark shadow-sm"
              style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(163, 217, 0, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="bi bi-envelope-fill fs-6"></i> สอบถาม / ขอเช่าอุปกรณ์นี้
            </motion.a>
            <motion.a
              href={getLineLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn rounded-pill py-2 px-4 fw-bold d-flex align-items-center justify-content-center gap-2 text-white"
              style={{ background: '#06C755', borderColor: '#06C755' }}
              whileHover={{ scale: 1.02, boxShadow: '0 8px 20px rgba(6, 199, 85, 0.32)' }}
              whileTap={{ scale: 0.98 }}
              title="สอบถามทาง LINE"
            >
              <i className="bi bi-line fs-5"></i> LINE
            </motion.a>
          </>
        )}
      />

      {/* Hover & Card Zoom Expansion Animations CSS */}
      <style>{`
        /* ── Search input (kept visually in step with the sort dropdown) ── */
        .eq-search-input {
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .eq-search-input:focus {
          background: #fff !important;
          border-color: var(--primary, #a3d900) !important;
          box-shadow: 0 0 0 3px rgba(163, 217, 0, 0.15) !important;
        }

        /* ── Sort Dropdown (matches the custom dropdowns used across the system) ── */
        .eq-sort-toggle {
          height: 46px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }
        .eq-sort-toggle:hover {
          border-color: #cbd5e1;
          background: #fff;
        }
        .eq-sort-toggle[aria-expanded="true"] {
          background: #fff;
          border-color: var(--primary, #a3d900);
          box-shadow: 0 0 0 3px rgba(163, 217, 0, 0.15);
        }
        /* Menu positioning only — Motion owns the open/close animation */
        .eq-sort-menu {
          top: 100%;
          left: 0;
          margin-top: 8px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.14) !important;
        }

        .eq-sort-menu .dropdown-item {
          transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
        }
        .eq-sort-menu .dropdown-item:hover {
          transform: translateX(3px);
        }
        .eq-sort-menu .dropdown-item:active {
          background: rgba(163, 217, 0, 0.18);
          color: #0f172a;
          transform: scale(0.98);
        }

        .eq-card {
          border-radius: 20px !important;
        }
        .eq-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12) !important;
          border-color: rgba(163, 217, 0, 0.4) !important;
        }
        .eq-card:hover .eq-card-img {
          transform: scale(1.08);
        }
        .eq-card:hover .eq-arrow-circle {
          background-color: var(--primary, #a3d900) !important;
          color: #0f172a !important;
          transform: translateX(3px);
        }
        
      `}</style>
    </>
  );
}
