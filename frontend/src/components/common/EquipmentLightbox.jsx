import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1];

const IMG_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="%230f172a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="11">No Image</text></svg>';

// Direction-aware slide for the gallery: +1 = next, -1 = previous
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 70 : -70, scale: 0.96 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -70 : 70, scale: 0.96 }),
};

// Info panel children stagger in behind the modal's own entrance
const panelStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } },
};
const panelItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

const DEFAULT_FEATURES = [
  { icon: 'bi-truck', text: 'จัดส่งถึงหน้างานทั่วประเทศ' },
  { icon: 'bi-tools', text: 'ทีมงานติดตั้งและเก็บงานให้' },
  { icon: 'bi-shield-check', text: 'ตรวจสอบสภาพอุปกรณ์ก่อนส่งทุกครั้ง' },
];

/**
 * Split gallery / detail lightbox for a single equipment item.
 *
 * Shared by the public catalogue and the admin inbox. The public page passes
 * `footer` (the enquiry CTAs); the admin passes none, which drops the action bar
 * entirely — everything else, including keyboard and swipe handling, behaves
 * identically in both places.
 *
 * @param {object|null} item  equipment record; renders nothing when null
 * @param {() => void} onClose
 * @param {{x:number,y:number}} [zoomOrigin]  offset of the clicked element from
 *        screen centre, so the modal appears to grow out of it
 * @param {React.ReactNode} [footer]  action bar contents; bar is omitted when absent
 * @param {Array<{icon:string,text:string}>} [features]  info list under the description
 * @param {boolean} [compact]  shorter panels, for hosts that render no action bar
 */
export default function EquipmentLightbox({
  item,
  onClose,
  zoomOrigin = { x: 0, y: 0 },
  footer,
  features = DEFAULT_FEATURES,
  compact = false,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const images = item
    ? (item.images && item.images.length > 0 ? item.images : [item.coverImage].filter(Boolean))
    : [];
  const imageCount = images.length;

  // Restart the gallery whenever a different item is opened. Adjusted during
  // render (React's documented pattern) rather than in an effect, so the first
  // paint of a new item already shows image 1 instead of the previous index.
  const itemId = item?.id;
  const [renderedItemId, setRenderedItemId] = useState(itemId);
  if (itemId !== renderedItemId) {
    setRenderedItemId(itemId);
    setActiveIndex(0);
    setDirection(0);
  }

  const showPrev = useCallback(() => {
    if (imageCount < 2) return;
    setDirection(-1);
    setActiveIndex(i => (i === 0 ? imageCount - 1 : i - 1));
  }, [imageCount]);

  const showNext = useCallback(() => {
    if (imageCount < 2) return;
    setDirection(1);
    setActiveIndex(i => (i === imageCount - 1 ? 0 : i + 1));
  }, [imageCount]);

  const showAt = (idx) => {
    if (idx === activeIndex) return;
    setDirection(idx > activeIndex ? 1 : -1);
    setActiveIndex(idx);
  };

  // Lock body scroll and wire up Escape / arrow keys while open
  const isOpen = !!item;
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') showPrev();
      else if (e.key === 'ArrowRight') showNext();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose, showPrev, showNext]);

  // Rendered into <body>: admin pages wrap their content in `.anim`, whose
  // fill-mode:both animation leaves a transform on the element permanently —
  // that would make this `position: fixed` overlay resolve against the page
  // wrapper instead of the viewport, boxing the backdrop into the content area.
  return createPortal(
    <>
      <AnimatePresence>
        {item && (
        <motion.div
          className="modal d-block"
          tabIndex="-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            background: 'rgba(9, 13, 22, 0.78)',
            backdropFilter: 'blur(14px)',
            zIndex: 1060,
            overflowY: 'auto',
          }}
          onClick={onClose}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <motion.div
              className={`modal-content border-0 overflow-hidden eq-modal ${compact ? 'is-compact' : ''}`}
              initial={{ opacity: 0, scale: 0.38, x: zoomOrigin.x, y: zoomOrigin.y }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24, transition: { duration: 0.22, ease: 'easeIn' } }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {/* Floating close button, sits above both panels */}
              <motion.button
                type="button"
                className="eq-modal-close d-flex align-items-center justify-content-center"
                onClick={onClose}
                title="ปิดหน้าต่าง (Esc)"
                aria-label="ปิดหน้าต่าง"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0, transition: { delay: 0.3, duration: 0.35, ease: EASE } }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className="bi bi-x-lg"></i>
              </motion.button>

              <div className="row g-0">

                {/* ── LEFT: Gallery ── */}
                <div className="col-lg-7">
                  <div className="eq-modal-gallery d-flex flex-column h-100">

                    <div className="eq-modal-stage position-relative flex-grow-1 overflow-hidden">
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                          key={activeIndex}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{
                            x: { duration: 0.45, ease: EASE },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.45, ease: EASE },
                          }}
                          className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-4"
                          drag={imageCount > 1 ? 'x' : false}
                          dragConstraints={{ left: 0, right: 0 }}
                          dragElastic={0.18}
                          onDragEnd={(e, info) => {
                            if (info.offset.x < -80) showNext();
                            else if (info.offset.x > 80) showPrev();
                          }}
                          style={{ cursor: imageCount > 1 ? 'grab' : 'default' }}
                        >
                          {images[activeIndex] ? (
                            <img
                              src={images[activeIndex]}
                              alt={item.name}
                              className="mw-100 mh-100 object-fit-contain"
                              draggable={false}
                              style={{ filter: 'drop-shadow(0 18px 32px rgba(0,0,0,0.45))' }}
                              onError={(e) => { e.target.src = IMG_FALLBACK; }}
                            />
                          ) : (
                            <div className="d-flex flex-column align-items-center text-white-50">
                              <i className="bi bi-image display-4 opacity-50 mb-2"></i>
                              <span className="small">ไม่มีรูปภาพ</span>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>

                      {/* Image counter */}
                      {imageCount > 1 && (
                        <div className="eq-modal-counter position-absolute top-0 start-0 m-3 d-flex align-items-center gap-2">
                          <i className="bi bi-images"></i>
                          <span>
                            <motion.span
                              key={activeIndex}
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ display: 'inline-block' }}
                            >
                              {activeIndex + 1}
                            </motion.span>
                            {` / ${imageCount}`}
                          </span>
                        </div>
                      )}

                      {/* Prev / next */}
                      {imageCount > 1 && (
                        <>
                          <motion.button
                            className="eq-modal-nav start-0 ms-3"
                            onClick={showPrev}
                            title="รูปก่อนหน้า (←)"
                            aria-label="รูปก่อนหน้า"
                            whileHover={{ scale: 1.12, x: -3 }}
                            whileTap={{ scale: 0.92 }}
                          >
                            <i className="bi bi-chevron-left"></i>
                          </motion.button>
                          <motion.button
                            className="eq-modal-nav end-0 me-3"
                            onClick={showNext}
                            title="รูปถัดไป (→)"
                            aria-label="รูปถัดไป"
                            whileHover={{ scale: 1.12, x: 3 }}
                            whileTap={{ scale: 0.92 }}
                          >
                            <i className="bi bi-chevron-right"></i>
                          </motion.button>
                        </>
                      )}
                    </div>

                    {/* Thumbnail rail */}
                    {imageCount > 1 && (
                      <div className="eq-modal-thumbs d-flex gap-2 px-3 py-3 flex-shrink-0">
                        {images.map((imgUrl, idx) => (
                          <motion.button
                            key={idx}
                            onClick={() => showAt(idx)}
                            className={`eq-modal-thumb flex-shrink-0 ${activeIndex === idx ? 'is-active' : ''}`}
                            aria-label={`ดูรูปที่ ${idx + 1}`}
                            aria-current={activeIndex === idx}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.94 }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + idx * 0.05, duration: 0.35, ease: EASE } }}
                          >
                            <span className="eq-modal-thumb-img">
                              <img
                                src={imgUrl}
                                alt={`ภาพย่อที่ ${idx + 1}`}
                                className="w-100 h-100 object-fit-cover"
                                draggable={false}
                                onError={(e) => { e.target.src = IMG_FALLBACK; }}
                              />
                            </span>
                            {activeIndex === idx && (
                              <motion.span layoutId="eq-thumb-ring" className="eq-modal-thumb-ring" transition={{ duration: 0.3, ease: EASE }} />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── RIGHT: Details ── */}
                <motion.div
                  className="col-lg-5 d-flex flex-column eq-modal-info"
                  variants={panelStagger}
                  initial="hidden"
                  animate="show"
                >
                  <div className="eq-modal-info-scroll flex-grow-1 p-4 pe-3">
                    {item.category && (
                      <motion.div variants={panelItem}>
                        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-pill border border-primary border-opacity-20" style={{ fontSize: '0.76rem', letterSpacing: '0.3px' }}>
                          <i className="bi bi-tag-fill me-1"></i> {item.category}
                        </span>
                      </motion.div>
                    )}

                    <motion.h4 variants={panelItem} className="fw-black text-dark mt-3 mb-3" style={{ fontWeight: 800, fontSize: '1.5rem', lineHeight: 1.3 }}>
                      {item.name}
                    </motion.h4>

                    <motion.div variants={panelItem} className="eq-modal-divider mb-3" />

                    <motion.div variants={panelItem}>
                      <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                        <i className="bi bi-info-circle-fill text-primary"></i> รายละเอียดอุปกรณ์
                      </h6>
                      <p className="mb-4" style={{ whiteSpace: 'pre-line', lineHeight: 1.75, fontSize: '0.94rem', color: '#475569' }}>
                        {item.description || 'ไม่มีรายละเอียดเพิ่มเติมสำหรับอุปกรณ์ชิ้นนี้'}
                      </p>
                    </motion.div>

                    {features.length > 0 && (
                      <motion.ul variants={panelItem} className="list-unstyled mb-0">
                        {features.map((f) => (
                          <li key={f.icon} className="eq-modal-feature d-flex align-items-center gap-3 mb-2">
                            <span className="eq-modal-feature-icon d-flex align-items-center justify-content-center flex-shrink-0">
                              <i className={`bi ${f.icon}`}></i>
                            </span>
                            <span style={{ fontSize: '0.89rem', color: '#475569' }}>{f.text}</span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </div>

                  {/* Sticky action bar — only when the host supplies actions */}
                  {footer && (
                    <motion.div variants={panelItem} className="eq-modal-actions p-4 pt-3 flex-shrink-0 d-flex flex-column flex-sm-row gap-2">
                      {footer}
                    </motion.div>
                  )}
                </motion.div>

              </div>
            </motion.div>
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* ─── Product Lightbox ─── */
        .eq-modal {
          border-radius: 26px;
          background: #fff;
          box-shadow: 0 40px 80px -20px rgba(9, 13, 22, 0.55);
        }

        .eq-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 20;
          width: 38px;
          height: 38px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 50%;
          background: rgba(9, 13, 22, 0.55);
          backdrop-filter: blur(10px);
          color: #fff;
          font-size: 0.85rem;
          cursor: pointer;
        }

        /* Gallery panel */
        .eq-modal-gallery {
          background: radial-gradient(circle at 50% 35%, #1b2a45 0%, #090d16 72%);
          min-height: 560px;
        }
        .eq-modal-stage {
          min-height: 0;
          touch-action: pan-y;
        }
        .eq-modal-stage img {
          user-select: none;
          -webkit-user-drag: none;
        }
        .eq-modal-stage:active {
          cursor: grabbing;
        }

        .eq-modal-counter {
          z-index: 6;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(9, 13, 22, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 0.76rem;
          font-weight: 700;
        }

        .eq-modal-nav {
          position: absolute;
          top: 50%;
          translate: 0 -50%;
          z-index: 6;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 50%;
          background: rgba(9, 13, 22, 0.6);
          backdrop-filter: blur(10px);
          color: #fff;
          font-size: 1.05rem;
          cursor: pointer;
          transition: background 0.25s ease, color 0.25s ease;
        }
        .eq-modal-nav:hover {
          background: var(--primary, #a3d900);
          color: #0f172a;
        }

        /* Thumbnail rail */
        .eq-modal-thumbs {
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
        }
        .eq-modal-thumbs::-webkit-scrollbar { height: 5px; }
        .eq-modal-thumbs::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 999px;
        }
        .eq-modal-thumb {
          position: relative;
          width: 64px;
          height: 64px;
          padding: 0;
          border: 0;
          border-radius: 12px;
          background: transparent;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.25s ease;
        }
        .eq-modal-thumb:hover { opacity: 0.85; }
        .eq-modal-thumb.is-active { opacity: 1; }
        /* Clipping lives on the inner wrapper so the shared-layout ring isn't cut off mid-travel */
        .eq-modal-thumb-img {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: #090d16;
        }
        .eq-modal-thumb-ring {
          position: absolute;
          inset: 0;
          border: 2px solid var(--primary, #a3d900);
          border-radius: 12px;
          box-shadow: 0 0 0 3px rgba(163, 217, 0, 0.18);
          pointer-events: none;
        }

        /* Detail panel */
        .eq-modal-info {
          max-height: 560px;
          background: #fff;
        }
        .eq-modal-info-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .eq-modal-info-scroll::-webkit-scrollbar { width: 6px; }
        .eq-modal-info-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }
        .eq-modal-divider {
          height: 3px;
          width: 46px;
          border-radius: 999px;
          background: var(--primary, #a3d900);
        }
        .eq-modal-feature-icon {
          width: 30px;
          height: 30px;
          border-radius: 9px;
          background: #f1f5f9;
          color: var(--navy, #0f172a);
          font-size: 0.85rem;
        }
        .eq-modal-actions {
          border-top: 1px solid #e2e8f0;
          background: #fff;
        }

        /* Compact variant — for hosts with no action bar, so the detail panel
           isn't left with a large empty area below the text */
        .eq-modal.is-compact .eq-modal-gallery { min-height: 430px; }
        .eq-modal.is-compact .eq-modal-info { max-height: 430px; }

        @media (max-width: 991.98px) {
          .eq-modal-gallery,
          .eq-modal.is-compact .eq-modal-gallery { min-height: 300px; }
          .eq-modal-info,
          .eq-modal.is-compact .eq-modal-info { max-height: none; }
          .eq-modal-info-scroll { overflow-y: visible; }
        }
      `}</style>
    </>,
    document.body
  );
}
