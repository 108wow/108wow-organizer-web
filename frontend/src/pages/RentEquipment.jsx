import { useState, useEffect } from 'react';
import HeroSection from '../components/common/HeroSection';
import { equipmentAPI, pageHeroAPI, companyAPI } from '../api';

export default function RentEquipment() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [hero, setHero] = useState({ title: 'EQUIPMENT SHOWCASE', subtitle: 'อุปกรณ์คุณภาพสูงสำหรับจัดงานกิจกรรมและสปอร์ตเดย์ทุกรูปแบบ', image: '' });
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});

  // Modal Lightbox state & click origin tracking for zoom-up animation
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [clickOrigin, setClickOrigin] = useState({ x: 0, y: 0 });

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

  // Filter items
  const filteredItems = equipmentList.filter(item => {
    const matchCategory = activeCategory === 'ทั้งหมด' || item.category === activeCategory;
    const matchSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const openLightbox = (item, e) => {
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setClickOrigin({ x: centerX, y: centerY });
    } else {
      setClickOrigin({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    setSelectedItem(item);
    setActiveImageIndex(0);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    setActiveImageIndex(0);
  };

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

      <section className="py-5" style={{ background: '#f8fafc', minHeight: '60vh' }}>
        <div className="container py-4">
          
          {/* Header Title */}
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-15 text-primary px-3 py-2 rounded-pill fw-bold text-uppercase mb-2" style={{ letterSpacing: '2px', fontSize: '0.82rem' }}>
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
          <div className="bg-white p-4 rounded-4 shadow-sm border border-light-subtle mb-5">
            <div className="row g-3 align-items-center">
              
              {/* Search input */}
              <div className="col-lg-4">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                  <input
                    type="text"
                    className="form-control ps-5 py-2.5 rounded-pill border-light-subtle shadow-none"
                    placeholder="ค้นหาชื่ออุปกรณ์..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ background: '#f8fafc', fontSize: '0.95rem' }}
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

              {/* Category Pills */}
              <div className="col-lg-8">
                <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className="btn rounded-pill px-3.5 py-2 fw-semibold transition-all text-nowrap"
                      style={{
                        fontSize: '0.88rem',
                        background: activeCategory === cat ? 'var(--navy, #0f172a)' : '#f1f5f9',
                        color: activeCategory === cat ? '#fff' : '#475569',
                        border: activeCategory === cat ? '1px solid var(--navy, #0f172a)' : '1px solid #e2e8f0',
                        boxShadow: activeCategory === cat ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Equipment Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm my-4">
              <i className="bi bi-box-seam text-muted" style={{ fontSize: '3.5rem' }}></i>
              <h4 className="fw-bold mt-3 text-dark">ไม่พบอุปกรณ์ที่ค้นหา</h4>
              <p className="text-muted mb-3">ลองเปลี่ยนคำค้นหาหรือหมวดหมู่เพื่อค้นหาอุปกรณ์ที่คุณต้องการ</p>
              <button className="btn btn-outline-dark rounded-pill px-4" onClick={() => { setActiveCategory('ทั้งหมด'); setSearchQuery(''); }}>
                ล้างการค้นหาทั้งหมด
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {filteredItems.map((item) => {
                const imgList = item.images && item.images.length > 0 ? item.images : [item.coverImage].filter(Boolean);
                const mainImg = item.coverImage || (imgList[0] || '');
                const photoCount = imgList.length;

                return (
                  <div key={item.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
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
                              className="badge bg-black bg-opacity-65 text-white backdrop-blur px-2.5 py-1 rounded-pill fw-bold d-flex align-items-center gap-1 border border-white border-opacity-10" 
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
                            className="badge bg-secondary bg-opacity-10 text-dark border border-secondary border-opacity-20 px-3 py-1.5 rounded-pill fw-semibold" 
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
                          <span className="fw-bold small text-dark d-flex align-items-center gap-1.5" style={{ fontSize: '0.85rem' }}>
                            ดูรายละเอียด
                          </span>
                          <div className="eq-arrow-circle rounded-circle d-flex align-items-center justify-content-center bg-light text-dark transition-all" style={{ width: '32px', height: '32px' }}>
                            <i className="bi bi-arrow-right fs-6"></i>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Redesigned Premium Lightbox Modal with Card-Zoom Expansion Animation */}
      {selectedItem && (
        <div 
          className="modal show d-block modal-backdrop-anim" 
          tabIndex="-1"
          style={{ 
            background: 'rgba(15, 23, 42, 0.82)', 
            backdropFilter: 'blur(12px)', 
            zIndex: 1060,
            overflowY: 'auto'
          }}
          onClick={closeLightbox}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
            style={{
              '--click-x': `${clickOrigin.x}px`,
              '--click-y': `${clickOrigin.y}px`,
            }}
          >
            <div 
              className="modal-content border-0 shadow-2xl overflow-hidden modal-expand-anim" 
              style={{ 
                background: '#ffffff',
                borderRadius: '24px',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)'
              }}
            >
              
              {/* Modal Header */}
              <div className="modal-header border-0 px-4 pt-4 pb-2 d-flex justify-content-between align-items-start position-relative">
                <div className="pe-4">
                  <span className="badge bg-primary bg-opacity-15 text-primary fw-bold px-3 py-1.5 rounded-pill mb-2 border border-primary border-opacity-20" style={{ fontSize: '0.78rem', letterSpacing: '0.3px' }}>
                    <i className="bi bi-tag-fill me-1"></i> {selectedItem.category}
                  </span>
                  <h4 className="modal-title fw-black text-dark" style={{ fontWeight: 800, fontSize: '1.45rem', lineHeight: 1.3 }}>
                    {selectedItem.name}
                  </h4>
                </div>
                <button 
                  type="button" 
                  className="btn-close shadow-none p-2.5 bg-light hover-bg-dark rounded-circle transition-all flex-shrink-0"
                  onClick={closeLightbox}
                  title="ปิดหน้าต่าง"
                ></button>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4">
                {/* Main Large Image Display - FIXED FRAME SIZE (Height 430px Constant) */}
                {(() => {
                  const imgs = selectedItem.images && selectedItem.images.length > 0 
                    ? selectedItem.images 
                    : [selectedItem.coverImage].filter(Boolean);
                  
                  const currentImgUrl = imgs[activeImageIndex] || selectedItem.coverImage || '';

                  return (
                    <div className="mb-4">
                      {/* Fixed Frame Box: Exactly 430px height at all times */}
                      <div 
                        className="position-relative rounded-4 overflow-hidden d-flex align-items-center justify-content-center shadow-sm border border-light-subtle" 
                        style={{ height: '430px', width: '100%', background: '#090d16' }}
                      >
                        {currentImgUrl ? (
                          <img 
                            src={currentImgUrl} 
                            alt={selectedItem.name} 
                            className="w-100 h-100 object-fit-contain p-3 transition-all" 
                            style={{ transition: 'all 0.4s ease' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const fallback = e.target.nextSibling;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}

                        {/* Fallback Container if Image is broken or missing */}
                        <div 
                          className="w-100 h-100 flex-column align-items-center justify-content-center text-white-50 p-4 text-center" 
                          style={{ display: currentImgUrl ? 'none' : 'flex' }}
                        >
                          <i className="bi bi-image fs-1 opacity-40 mb-2"></i>
                          <span className="small">ไม่สามารถโหลดรูปภาพได้</span>
                        </div>

                        {/* Prev / Next Glassmorphism Buttons if multiple images */}
                        {imgs.length > 1 && (
                          <>
                            <button 
                              className="btn text-white rounded-circle position-absolute top-50 start-0 translate-middle-y ms-3 p-0 d-flex align-items-center justify-content-center border-0 modal-nav-btn"
                              onClick={() => setActiveImageIndex((prev) => (prev === 0 ? imgs.length - 1 : prev - 1))}
                              style={{ 
                                zIndex: 5, 
                                width: '46px', 
                                height: '46px',
                                background: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.25s ease'
                              }}
                              title="รูปก่อนหน้า"
                            >
                              <i className="bi bi-chevron-left fs-5"></i>
                            </button>
                            <button 
                              className="btn text-white rounded-circle position-absolute top-50 end-0 translate-middle-y me-3 p-0 d-flex align-items-center justify-content-center border-0 modal-nav-btn"
                              onClick={() => setActiveImageIndex((prev) => (prev === imgs.length - 1 ? 0 : prev + 1))}
                              style={{ 
                                zIndex: 5, 
                                width: '46px', 
                                height: '46px',
                                background: 'rgba(15, 23, 42, 0.65)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.25s ease'
                              }}
                              title="รูปถัดไป"
                            >
                              <i className="bi bi-chevron-right fs-5"></i>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Thumbnail Strip (if multiple images) */}
                      {imgs.length > 1 && (
                        <div className="d-flex gap-2.5 overflow-x-auto py-2.5 px-1 mt-2">
                          {imgs.map((imgUrl, idx) => (
                            <button
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`btn p-0 rounded-3 border-2 overflow-hidden flex-shrink-0 transition-all ${activeImageIndex === idx ? 'border-primary shadow scale-105' : 'border-transparent opacity-50 hover-opacity-100'}`}
                              style={{ width: '72px', height: '72px', background: '#090d16' }}
                            >
                              <img 
                                src={imgUrl} 
                                alt={`thumb-${idx}`} 
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70"><rect width="70" height="70" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23ffffff" font-size="10">No Image</text></svg>';
                                }}
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Description Card */}
                <div className="p-4 rounded-4 mb-2" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.98rem' }}>
                    <i className="bi bi-info-circle-fill text-primary"></i> รายละเอียดอุปกรณ์
                  </h6>
                  <p className="text-secondary mb-0" style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '0.95rem', color: '#475569' }}>
                    {selectedItem.description || "ไม่มีรายละเอียดเพิ่มเติมสำหรับอุปกรณ์ชิ้นนี้"}
                  </p>
                </div>
              </div>

              {/* Modal Footer Bar */}
              <div className="modal-footer border-top border-light-subtle px-4 py-3 bg-white d-flex justify-content-between align-items-center">
                <span className="text-muted small d-none d-sm-inline-flex align-items-center gap-1">
                  <i className="bi bi-shield-check text-success fs-6"></i> บริการจัดส่งและติดตั้งอุปกรณ์ถึงหน้างาน
                </span>
                <div className="d-flex gap-2.5 ms-auto">
                  <button className="btn btn-light rounded-pill px-4 fw-semibold border" onClick={closeLightbox}>
                    ปิด
                  </button>
                  <a 
                    href={getLineLink()} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-success rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2 text-white shadow-sm hover-scale"
                    style={{ background: '#06C755', borderColor: '#06C755' }}
                  >
                    <i className="bi bi-line fs-5"></i> สอบถาม / เช่าอุปกรณ์นี้
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hover & Card Zoom Expansion Animations CSS */}
      <style>{`
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
        
        .modal-nav-btn:hover {
          background: var(--primary, #a3d900) !important;
          color: #0f172a !important;
          transform: translateY(-50%) scale(1.1) !important;
        }

        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(6, 199, 85, 0.3) !important;
        }

        /* Backdrop Blur Fade In */
        @keyframes backdropFadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(12px); }
        }
        .modal-backdrop-anim {
          animation: backdropFadeIn 0.35s ease forwards;
        }

        /* Card Zoom Expansion Keyframes */
        @keyframes modalZoomFromCard {
          0% {
            opacity: 0;
            transform: translate(calc(var(--click-x, 50vw) - 50vw), calc(var(--click-y, 50vh) - 50vh)) scale(0.2);
            border-radius: 36px;
          }
          65% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
            border-radius: 24px;
          }
        }
        .modal-expand-anim {
          animation: modalZoomFromCard 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
