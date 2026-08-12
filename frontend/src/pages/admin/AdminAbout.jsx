import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { companyAPI, aboutConfigAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

const iconOptions = [
  'bi-calendar-event', 'bi-music-note-beamed', 'bi-camera-reels', 'bi-people',
  'bi-cup-hot', 'bi-mic', 'bi-gift', 'bi-stars', 'bi-trophy', 'bi-balloon',
  'bi-shop', 'bi-megaphone', 'bi-display', 'bi-geo-alt', 'bi-ticket-perforated',
  'bi-chat-quote', 'bi-magic', 'bi-palette', 'bi-heart-fill', 'bi-star-fill',
  'bi-lightbulb', 'bi-lightning-charge'
];

/** Panel heading — styled with unified brand theme icon badge. */
function SectionHeader({ icon, color, title, desc, right }) {
  return (
    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4 pb-3 border-bottom border-light-subtle">
      <div className="d-flex align-items-center gap-3">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
          style={{ width: 46, height: 46, background: color ? `${color}18` : 'rgba(163, 217, 0, 0.2)', color: color || 'var(--navy)' }}
        >
          <i className={`bi ${icon} fs-4`}></i>
        </div>
        <div>
          <h5 className="fw-bold m-0 text-dark" style={{ fontSize: '1.15rem' }}>{title}</h5>
          <p className="text-muted m-0 mt-1" style={{ fontSize: '0.82rem' }}>{desc}</p>
        </div>
      </div>
      {right && <div className="d-flex align-items-center gap-2 mt-2 mt-sm-0">{right}</div>}
    </div>
  );
}

/** Small caption above each preview so it's clear this mirrors the live page. */
function PreviewLabel({ children }) {
  return (
    <div className="d-flex align-items-center gap-2 mb-2 text-muted" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
      <i className="bi bi-eye-fill"></i>
      <span>ตัวอย่างที่จะเห็นบนหน้าเว็บจริง</span>
      {children}
    </div>
  );
}

/**
 * Previews below mirror About.jsx / index.css exactly — same crop shape, same
 * aspect ratio, same overlays. The point is that what the admin sees here is
 * what visitors get, including how the image gets cropped.
 */
function VideoHeroPreview({ image, stat, onPlayClick }) {
  const imgSrc = image || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80';
  return (
    <div className="about-preview-hero">
      {/* .about-hero-img-wrap on the live page: dome-topped frame */}
      <div className="about-preview-dome" onClick={onPlayClick} style={{ cursor: onPlayClick ? 'pointer' : 'default' }} title={onPlayClick ? 'คลิกเพื่อทดสอบเล่นวิดีโอ' : ''}>
        {image ? (
          <img src={imgSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <div className="about-preview-empty"><i className="bi bi-image"></i><span>ยังไม่มีภาพปก</span></div>
        )}
        <span className="about-preview-play"><i className="bi bi-play-fill"></i></span>
      </div>
      {/* .about-exp-box — always shows the FIRST stat in the list */}
      <div className="about-preview-expbox">
        <div className="num">{stat?.value || '24'}</div>
        <div className="text">{stat?.label || 'Years Of\nExperience'}</div>
      </div>
    </div>
  );
}

function FullAboutPagePreviewModal({ show, onClose, info, aboutConfig, stats, onSaveAll }) {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  if (!show) return null;

  const firstStat = stats?.[0] || { value: '24', label: 'Years Of\nExperience' };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }} onClick={onClose}>
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

        {/* TOP BAR */}
        <div className="bg-dark text-white px-4 py-3 border-bottom border-secondary d-flex align-items-center justify-content-between flex-wrap gap-2 flex-shrink-0">
          <div className="d-flex align-items-center gap-3">
            <span className="badge px-3 py-2 fw-bold" style={{ background: '#a3d900', color: '#0f172a', borderRadius: '8px' }}>
              <i className="bi bi-broadcast me-1"></i>Pre-save Live Preview
            </span>
            <h5 className="modal-title fw-bold m-0 text-white" style={{ fontSize: '1.1rem' }}>
              พรีวิวตัวอย่างหน้าเว็บจริง (เกี่ยวกับเรา / About Page)
            </h5>
          </div>

          <div className="d-flex align-items-center gap-2">
            <a href="/about" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-light rounded-3 d-flex align-items-center gap-2">
              <i className="bi bi-box-arrow-up-right"></i>เปิดหน้าเว็บจริงในแท็บใหม่
            </a>
            <button type="button" className="btn btn-sm btn-primary fw-bold rounded-3 px-3 py-2 d-flex align-items-center gap-2" onClick={() => { onClose(); onSaveAll(); }}>
              <i className="bi bi-save-fill"></i>บันทึกข้อมูลทั้งหมด
            </button>
            <button type="button" className="btn-close btn-close-white ms-2" onClick={onClose} aria-label="Close"></button>
          </div>
        </div>

        {/* PAGE PREVIEW BODY */}
        <div className="flex-grow-1 overflow-auto hide-scrollbar" style={{ background: 'var(--bg-white, #ffffff)' }}>

          {/* Top Section: Who We Are */}
          <section className="section-padding overflow-hidden py-5" style={{ background: 'var(--bg-white)', paddingTop: '90px', paddingBottom: '90px' }}>
            <div className="container">
              <div className="row g-5 align-items-center">
                <div className="col-lg-6">
                  <div className="about-hero-img-wrap w-100">
                    <div className="position-relative shadow-lg" style={{ borderRadius: '50% 50% 16px 16px', overflow: 'hidden', height: '520px', cursor: 'pointer' }} onClick={() => setIsPlayingVideo(true)}>
                      <img
                        src={aboutConfig?.videoThumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80'}
                        alt="Video Thumbnail"
                        className="img-fluid w-100 h-100"
                        style={{ objectFit: 'cover', objectPosition: 'center' }}
                      />
                      <div className="video-play-btn">
                        <i className="bi bi-play-fill"></i>
                      </div>
                    </div>

                    <div className="about-exp-box" style={{ borderRadius: '12px' }}>
                      <div className="num">{firstStat.value}</div>
                      <div className="text" style={{ fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {firstStat.label}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 ps-lg-5">
                  <h2 className="fw-bold text-primary mb-3" style={{ fontSize: '2.2rem', lineHeight: '1.3' }}>
                    {info?.tagline || 'รับจัดกิจกรรม Team Building สร้างสัมพันธ์ในองค์กร'}
                  </h2>
                  <p className="text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
                    {info?.about || 'เราคือทีมงานผู้เชี่ยวชาญด้านการจัดกิจกรรมพัฒนาองค์กร...'}
                  </p>

                  <ul className="about-val-list mb-5">
                    {(aboutConfig?.coreValues || []).map((cv, idx) => (
                      <li key={idx}>
                        <i className={`bi ${cv.icon}`}></i> {cv.title}
                      </li>
                    ))}
                  </ul>

                  <div>
                    <span className="btn-main shadow-lg">ติดต่อร่วมงานกับเรา</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Video Modal Inside Preview */}
          {isPlayingVideo && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setIsPlayingVideo(false)}>
              <div style={{ width: '90%', maxWidth: '900px' }} onClick={e => e.stopPropagation()}>
                <div className="d-flex justify-content-end mb-2">
                  <button type="button" className="btn-close btn-close-white fs-4" onClick={() => setIsPlayingVideo(false)}></button>
                </div>
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
          )}

          {/* Middle Section: Quote & Images */}
          <section className="container-fluid px-0 overflow-hidden">
            <div className="row g-0">
              <div className="col-lg-4">
                <div className="about-quote-box h-100">
                  <i className="bi bi-quote about-quote-icon"></i>
                  <div className="about-quote-text">
                    "{info?.vision || 'เราเชื่อว่าบุคลากร คือทรัพยากรที่สำคัญที่สุดภายในองค์กร'}"
                  </div>
                  <div className="about-quote-author">
                    <strong>{info?.name || 'Our'} Team</strong>
                    <br />
                    {info?.mission || 'ทีมผู้เชี่ยวชาญด้านการพัฒนาบุคคล'}
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

          {/* Bottom Banners */}
          <section className="container-fluid px-0 overflow-hidden">
            <div className="row g-0">
              {(aboutConfig?.banners || []).map((banner, idx) => (
                <div className={`col-lg-6 ${idx === 0 ? 'about-banner-left' : 'about-banner-right'}`} key={idx}>
                  <div className="about-banner-wrap">
                    <img src={banner.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80'} alt={`Banner ${idx + 1}`} />
                    <div className="about-banner-overlay">
                      <h3 className="about-banner-title">{banner.title || '(ยังไม่ได้ใส่ข้อความ)'}</h3>
                      {idx === 0 ? (
                        <div className="about-socials">
                          <a href="#"><i className="bi bi-facebook"></i></a>
                          <a href="#"><i className="bi bi-line"></i></a>
                          <a href="#"><i className="bi bi-telephone-fill"></i></a>
                          <a href="#"><i className="bi bi-envelope-fill"></i></a>
                        </div>
                      ) : (
                        <div>
                          <span className="btn-main shadow-lg" style={{ border: '2px solid #fff' }}>ติดต่อร่วมงานกับเรา</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          {(aboutConfig?.timeline || []).length > 0 && (
            <section className="section-padding overflow-hidden py-5" style={{ background: 'var(--bg-section, #f8fafc)' }}>
              <div className="container">
                <div className="section-header text-center mb-5">
                  <span className="section-label">Timeline</span>
                  <h2 className="section-title fw-bold">เส้นทางของเรา</h2>
                  <div className="underline mx-auto"></div>
                </div>
                <div className="row g-4">
                  {aboutConfig.timeline.map((t, i) => (
                    <div key={i} className="col-md-3">
                      <div className="card-white text-center h-100 shadow-sm p-4 rounded-3 bg-white border">
                        <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-dark)', marginBottom: 4 }}>{t.year}</div>
                        <h6 style={{ color: 'var(--primary)', fontWeight: 700 }}>{t.title}</h6>
                        <small className="text-muted">{t.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-light px-4 py-3 border-top d-flex justify-content-between align-items-center flex-shrink-0">
          <span className="text-muted small">💡 พรีวิวจากข้อมูลที่คุณแก้ไขอยู่ หากต้องการเปิดใช้จริงกด "บันทึกข้อมูลทั้งหมด"</span>
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary fw-bold rounded-3 px-4" onClick={onClose}>ปิดพรีวิว</button>
            <button type="button" className="btn btn-primary fw-bold rounded-3 px-4" onClick={() => { onClose(); onSaveAll(); }}>
              <i className="bi bi-save-fill me-1"></i>บันทึกข้อมูลทั้งหมด
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}

function CombinedLivePreview({ info, aboutConfig }) {
  return (
    <div className="mt-5 mb-3">
      <PreviewLabel />
      <div className="bg-white shadow-sm border overflow-hidden mt-3" style={{ pointerEvents: 'none', borderRadius: '16px' }}>

        {/* Middle Section: Quote & Images (Exact Live Layout) */}
        <div className="container-fluid px-0 overflow-hidden">
          <div className="row g-0">
            <div className="col-lg-4">
              <div className="about-quote-box h-100">
                <i className="bi bi-quote about-quote-icon"></i>
                <div className="about-quote-text">
                  "{info?.vision || 'เราเชื่อว่าบุคลากร คือทรัพยากรที่สำคัญที่สุดภายในองค์กร'}"
                </div>
                <div className="about-quote-author">
                  <strong>{info?.name || 'Our'} Team</strong>
                  <br />
                  {info?.mission || 'ทีมผู้เชี่ยวชาญด้านการพัฒนาบุคคล'}
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
        </div>

        {/* Bottom Section: Call to Action Banners (Exact Live Layout) */}
        <div className="container-fluid px-0 overflow-hidden">
          <div className="row g-0">
            {(aboutConfig?.banners || []).map((banner, idx) => (
              <div className={`col-lg-6 ${idx === 0 ? 'about-banner-left' : 'about-banner-right'}`} key={idx}>
                <div className="about-banner-wrap">
                  <img src={banner.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80'} alt={`Banner ${idx + 1}`} />
                  <div className="about-banner-overlay">
                    <h3 className="about-banner-title">{banner.title || '(ยังไม่ได้ใส่ข้อความ)'}</h3>
                    {idx === 0 ? (
                      <div className="about-socials">
                        <a href="#"><i className="bi bi-facebook"></i></a>
                        <a href="#"><i className="bi bi-line"></i></a>
                        <a href="#"><i className="bi bi-telephone-fill"></i></a>
                        <a href="#"><i className="bi bi-envelope-fill"></i></a>
                      </div>
                    ) : (
                      <div>
                        <span className="btn-main shadow-lg" style={{ border: '2px solid #fff' }}>ติดต่อร่วมงานกับเรา</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {(!aboutConfig?.banners || aboutConfig.banners.length === 0) && (
              <div className="col-12 py-5 text-center text-muted bg-light">ยังไม่มีการเพิ่มแบนเนอร์ปิดท้ายเพจ</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AdminAbout() {
  const [info, setInfo] = useState({});
  const [stats, setStats] = useState([]);
  const [aboutConfig, setAboutConfig] = useState({
    videoThumbnail: '',
    videoUrl: '',
    coreValues: [],
    teamImages: [],
    banners: [],
    timeline: []
  });

  const [activeSection, setActiveSection] = useState('text');
  const [editStatId, setEditStatId] = useState(null);
  const [statForm, setStatForm] = useState({ label: '', value: '' });
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });
  const [previewVideoModal, setPreviewVideoModal] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const activeFirstStat = (editStatId && stats[0]?.id === editStatId)
    ? { ...stats[0], label: statForm.label, value: statForm.value }
    : stats[0];

  useEffect(() => {
    companyAPI.get().then(d => setInfo(d)).catch(() => { });
    companyAPI.listStats().then(d => setStats(d)).catch(() => { });
    aboutConfigAPI.get().then(d => setAboutConfig({
      videoThumbnail: d.videoThumbnail || '',
      videoUrl: d.videoUrl || '',
      coreValues: d.coreValues || [],
      teamImages: d.teamImages || [],
      banners: d.banners || [],
      timeline: d.timeline || []
    })).catch(() => { });
  }, []);

  const formatYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (trimmed.includes('youtube.com/embed/')) return trimmed;

    const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (watchMatch && watchMatch[1]) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    return trimmed;
  };

  const handleVideoUrlChange = (e) => {
    const raw = e.target.value;
    const formatted = formatYoutubeEmbedUrl(raw);
    handleAboutConfigChange('videoUrl', formatted);
  };

  const exec = useCallback(async (action) => {
    setConfirm(p => ({ ...p, show: false }));
    setLoading(true);
    try {
      await action();
      setLoading(false);
      setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' });
    } catch (e) {
      setLoading(false);
      setStatusM({ show: true, status: 'error', message: e.message || 'เกิดข้อผิดพลาดในการดำเนินการ' });
    }
  }, []);

  const handleInfoChange = (e) => { setInfo(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handleAboutConfigChange = (key, value) => {
    setAboutConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    setConfirm({
      show: true,
      type: 'info',
      title: 'บันทึกข้อมูล',
      message: 'ยืนยันบันทึกข้อมูลทั้งหมดในหน้านี้?',
      action: async () => {
        const [uInfo, uConfig] = await Promise.all([
          companyAPI.update(info),
          aboutConfigAPI.update(aboutConfig)
        ]);
        setInfo(uInfo);
        setAboutConfig(uConfig);
      }
    });
  };

  // Stats
  const handleAddStat = () => { setConfirm({ show: true, type: 'info', title: 'เพิ่มสถิติ', message: 'เพิ่มตัวเลขสถิติใหม่?', action: async () => { const c = await companyAPI.createStat({ label: 'สถิติใหม่', value: '0' }); setStats(p => [...p, c]); } }); };
  const handleAddPresetStat = (preset) => { setConfirm({ show: true, type: 'info', title: 'เพิ่มสถิติแบบด่วน', message: `เพิ่ม "${preset.label}" (${preset.value}) ?`, action: async () => { const c = await companyAPI.createStat(preset); setStats(p => [...p, c]); } }); };
  const handleEditStat = (stat) => { setEditStatId(stat.id); setStatForm({ label: stat.label, value: stat.value }); };
  const handleSaveStat = () => { setConfirm({ show: true, type: 'info', title: 'บันทึกสถิติ', message: `บันทึก "${statForm.label}" ?`, action: async () => { const u = await companyAPI.updateStat(editStatId, statForm); setStats(p => p.map(s => s.id === editStatId ? u : s)); setEditStatId(null); } }); };
  const handleDeleteStat = (stat) => { setConfirm({ show: true, type: 'danger', title: 'ลบสถิติ', message: `ลบ "${stat.label}" ?`, action: async () => { await companyAPI.deleteStat(stat.id); setStats(p => p.filter(s => s.id !== stat.id)); } }); };
  const handleMoveStat = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= stats.length) return;
    const updated = [...stats];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setStats(updated);
  };

  // Core Values
  const handleAddCoreValue = () => {
    handleAboutConfigChange('coreValues', [...aboutConfig.coreValues, { icon: 'bi-star-fill', title: 'ค่านิยมใหม่' }]);
  };
  const updateCoreValue = (index, field, val) => {
    const newValues = [...aboutConfig.coreValues];
    newValues[index][field] = val;
    handleAboutConfigChange('coreValues', newValues);
  };
  const deleteCoreValue = (index) => {
    handleAboutConfigChange('coreValues', aboutConfig.coreValues.filter((_, i) => i !== index));
  };

  // Timeline
  const handleAddTimeline = () => {
    handleAboutConfigChange('timeline', [...aboutConfig.timeline, { year: '2026', title: 'เหตุการณ์ใหม่', desc: 'รายละเอียด' }]);
  };
  const updateTimeline = (index, field, val) => {
    const newTimeline = [...aboutConfig.timeline];
    newTimeline[index][field] = val;
    handleAboutConfigChange('timeline', newTimeline);
  };
  const deleteTimeline = (index) => {
    handleAboutConfigChange('timeline', aboutConfig.timeline.filter((_, i) => i !== index));
  };

  // Banners
  const handleAddBanner = () => {
    handleAboutConfigChange('banners', [...aboutConfig.banners, { image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80', title: 'แบนเนอร์ใหม่' }]);
  };
  const updateBanner = (index, field, val) => {
    const newBanners = [...aboutConfig.banners];
    newBanners[index][field] = val;
    handleAboutConfigChange('banners', newBanners);
  };
  const deleteBanner = (index) => {
    handleAboutConfigChange('banners', aboutConfig.banners.filter((_, i) => i !== index));
  };

  const sections = [
    { key: 'text', label: 'ข้อความหลัก & วิสัยทัศน์', icon: 'bi-file-earmark-text-fill' },
    { key: 'video', label: 'วิดีโอ & ตัวเลขสถิติ', icon: 'bi-play-btn-fill' },
    { key: 'values_banners', label: 'ค่านิยม ภาพทีม & แบนเนอร์', icon: 'bi-images' },
    { key: 'timeline', label: 'เส้นทางของเรา', icon: 'bi-calendar-range-fill' },
  ];

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => exec(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} confirmText={confirm.type === 'danger' ? 'ลบเลย' : 'ยืนยัน'} />
      <LoadingOverlay show={loading} message="กำลังบันทึกข้อมูล..." />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={() => setStatusM(p => ({ ...p, show: false }))} />

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 bg-white p-3 px-4 rounded-4 shadow-sm border border-light-subtle">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-primary bg-opacity-25 text-dark p-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48 }}>
            <i className="bi bi-info-circle-fill fs-4"></i>
          </div>
          <div>
            <h4 className="fw-bold m-0 text-dark">หน้าเกี่ยวกับเรา (About Page)</h4>
            <p className="text-muted m-0" style={{ fontSize: '0.82rem' }}>จัดการเนื้อหา สโลแกน วิดีโอ ค่านิยม เส้นทางองค์กร และรูปภาพในหน้าเกี่ยวกับเรา</p>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-secondary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift"
            onClick={() => setShowFullPreview(true)}
          >
            <i className="bi bi-eye-fill text-primary"></i>ดูมุมมองหน้าเว็บจริง (พรีวิวสด)
          </button>
          <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift" onClick={handleSaveAll}>
            <i className="bi bi-save-fill"></i>บันทึกข้อมูลทั้งหมด
          </button>
        </div>
      </div>

      {/* ===== TOP: Horizontal Pill Navigator ===== */}
      <div className="mb-4 admin-pill-nav hide-scrollbar">
        {sections.map(s => {
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`btn rounded-pill px-4 py-2 d-flex align-items-center gap-2 flex-shrink-0 fw-bold admin-pill-item ${isActive ? 'active' : ''}`}
              style={{ color: isActive ? 'var(--navy)' : '#64748b' }}
            >
              <i className={`bi ${s.icon}`} style={{ fontSize: '1.05rem' }}></i>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ===== MAIN CONTENT CONTAINER WITH CARD BACKGROUND & SLIDE-UP ANIMATION ===== */}
      <div className="row">
        <div className="col-12">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5 anim-slide-up border border-light-subtle" key={activeSection} style={{ minHeight: '500px' }}>

            {/* ===== SECTION 1: Text & Headers ===== */}
            {activeSection === 'text' && (
              <div>
                <SectionHeader
                  icon="bi-file-earmark-text-fill" color="var(--navy)"
                  title="ข้อความหลักและวิสัยทัศน์ (Text & Headers)" desc="สโลแกน คำอธิบายเกี่ยวกับบริษัท วิสัยทัศน์ และผู้สร้างแรงบันดาลใจ"
                />
                <div className="row g-4">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-chat-quote-fill text-primary me-2"></i>สโลแกนหน้า About (Tagline Header)
                      </label>
                      <input type="text" name="tagline" className="form-control" value={info.tagline || ''} onChange={handleInfoChange} placeholder='เช่น "รับจัดกิจกรรม Team Building & Sport Day ครบวงจร"' style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-card-text text-primary me-2"></i>เกี่ยวกับเรา (About Us Description)
                      </label>
                      <textarea name="about" rows="4" className="form-control" value={info.about || ''} onChange={handleInfoChange} placeholder="คำอธิบายภาพรวมองค์กร ประสบการณ์ และความเชี่ยวชาญ..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-quote text-primary me-2"></i>วิสัยทัศน์ (แสดงเป็นคำคม Quote)
                      </label>
                      <textarea name="vision" rows="3" className="form-control" value={info.vision || ''} onChange={handleInfoChange} placeholder="ข้อความวิสัยทัศน์หรือปรัชญาการทำงาน..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-person-badge-fill text-primary me-2"></i>พันธกิจ (ผู้กล่าวคำคม / Author)
                      </label>
                      <textarea name="mission" rows="3" className="form-control" value={info.mission || ''} onChange={handleInfoChange} placeholder="ผู้ให้คำคม หรือคำโปรยสรุปพันธกิจ..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSaveAll}>
                    <i className="bi bi-save-fill"></i>บันทึกข้อมูลทั้งหมด
                  </button>
                </div>
              </div>
            )}

            {/* ===== SECTION 2: Video & Stats ===== */}
            {activeSection === 'video' && (
              <div>
                <SectionHeader
                  icon="bi-play-btn-fill" color="#dc3545"
                  title="วิดีโอนำเสนอและตัวเลขสถิติ (Video & Stats)" desc="อัปโหลดภาพปกวิดีโอ วาง URL YouTube และจัดการตัวเลขสถิติที่แสดงบนหน้าเว็บ"
                />

                {/* VIDEO PRESENTATION & LIVE PREVIEW (EQUAL HEIGHT 2 COLUMNS) */}
                <div className="row g-4 align-items-stretch">
                  {/* LEFT COLUMN: VIDEO SETTINGS */}
                  <div className="col-lg-6 d-flex">
                    <div className="card border shadow-sm rounded-3 overflow-hidden w-100 d-flex flex-column justify-content-between" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                      <div className="card-header bg-transparent border-bottom border-light p-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-3">
                          <div className="rounded-3 p-2 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: 'rgba(220, 53, 69, 0.1)', color: '#dc3545' }}>
                            <i className="bi bi-youtube fs-4"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold text-dark m-0" style={{ fontSize: '1rem' }}>ตั้งค่าวิดีโอนำเสนอ (Video Settings)</h6>
                            <small className="text-muted">รูปภาพปกและลิงก์ YouTube สำหรับเล่นวิดีโอ</small>
                          </div>
                        </div>
                        {aboutConfig.videoUrl?.includes('embed') && (
                          <span className="badge px-3 py-2 fw-bold" style={{ background: '#0f172a', color: '#a3d900', borderRadius: '8px', border: '1px solid #a3d900' }}>
                            <i className="bi bi-check-circle-fill me-1"></i>พร้อมใช้งาน
                          </span>
                        )}
                      </div>

                      <div className="card-body p-4 d-flex flex-column justify-content-between gap-4">
                        {/* Thumbnail uploader section */}
                        <div>
                          <label className="fw-bold text-dark mb-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.88rem' }}>
                            <span><i className="bi bi-image text-primary me-2"></i>ภาพปกวิดีโอ (Video Thumbnail)</span>
                            <span className="badge px-2 py-1 fw-bold" style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px' }}>4:5 แนวตั้ง</span>
                          </label>
                          <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
                            <ImageUploader
                              value={aboutConfig.videoThumbnail}
                              onChange={(url) => handleAboutConfigChange('videoThumbnail', url)}
                              recommendedSize="800x1000px (4:5 แนวตั้ง)"
                              aspectRatio={4 / 5}
                            />
                          </div>
                        </div>

                        {/* YouTube link input section */}
                        <div>
                          <label className="fw-bold text-dark mb-2 d-flex align-items-center justify-content-between" style={{ fontSize: '0.88rem' }}>
                            <span><i className="bi bi-link-45deg text-danger me-2"></i>ลิงก์วิดีโอ YouTube (Embed / Watch URL)</span>
                          </label>
                          <div className="input-group mb-2">
                            <span className="input-group-text bg-light text-muted border-end-0" style={{ borderRadius: '8px 0 0 8px' }}>
                              <i className="bi bi-youtube text-danger"></i>
                            </span>
                            <input
                              type="text"
                              className="form-control border-start-0"
                              value={aboutConfig.videoUrl || ''}
                              onChange={handleVideoUrlChange}
                              placeholder="วางลิงก์ YouTube เช่น https://www.youtube.com/watch?v=..."
                              style={{ borderRadius: '0 8px 8px 0', padding: '10px 14px' }}
                            />
                          </div>
                          <div className="d-flex align-items-center justify-content-between text-muted" style={{ fontSize: '0.78rem' }}>
                            <span>✨ ระบบจะแปลง URL เป็นรูปแบบ Embed อัตโนมัติ</span>
                            {aboutConfig.videoUrl && (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-decoration-none fw-bold"
                                style={{ fontSize: '0.78rem', color: '#dc3545' }}
                                onClick={() => setPreviewVideoModal(true)}
                              >
                                <i className="bi bi-play-circle-fill me-1"></i>ทดสอบวิดีโอ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: LIVE PREVIEW */}
                  <div className="col-lg-6 d-flex">
                    <div className="card border shadow-sm rounded-3 overflow-hidden w-100 d-flex flex-column justify-content-between" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                      <div className="card-header bg-transparent border-bottom border-light p-4 d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2 text-dark">
                          <i className="bi bi-eye-fill text-primary"></i>
                          <span className="fw-bold" style={{ fontSize: '1rem' }}>ตัวอย่างที่จะเห็นบนหน้าเว็บจริง (Pre-save Live Preview)</span>
                        </div>
                        <span className="badge px-3 py-1 fw-bold" style={{ background: 'rgba(163, 217, 0, 0.15)', color: '#0f172a', border: '1px solid #a3d900', borderRadius: '6px', fontSize: '0.75rem' }}>
                          <i className="bi bi-broadcast text-success me-1"></i>อัปเดตสดแบบ Real-time
                        </span>
                      </div>

                      <div className="card-body p-4 d-flex flex-column justify-content-between">
                        <div className="d-flex align-items-center justify-content-center flex-grow-1 my-2">
                          <VideoHeroPreview
                            image={aboutConfig.videoThumbnail}
                            stat={activeFirstStat}
                            onPlayClick={() => setPreviewVideoModal(true)}
                          />
                        </div>

                        <div className="p-3 rounded-3 mt-3 border d-flex align-items-start gap-2" style={{ background: '#f8fafc', fontSize: '0.85rem', lineHeight: 1.5, borderColor: '#cbd5e1' }}>
                          <i className="bi bi-stars text-warning fs-5 flex-shrink-0"></i>
                          <div>
                            <strong className="text-dark">พรีวิวตัวอย่างก่อนบันทึกจริง (Live Pre-save Preview):</strong>
                            <br />
                            <span className="text-muted">
                              เมื่อคุณพิมพ์เปลี่ยนตัวเลขหรือเลือกรูปภาพฝั่งซ้าย ผลลัพธ์ <strong>({activeFirstStat?.value || '24'} - {activeFirstStat?.label?.replace('\n', ' ') || 'Years Of Experience'})</strong> จะอัปเดตแสดงบนภาพทรงโดมตัวอย่างทันที แม้ยังไม่ได้กดบันทึกข้อมูล!
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATS OVERLAY SECTION */}
                <div className="col-12 mt-4">
                  <div className="card border shadow-sm rounded-3 overflow-hidden" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
                    <div className="card-header bg-transparent border-bottom border-light p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                          <i className="bi bi-bar-chart-line-fill fs-4"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold text-dark m-0" style={{ fontSize: '1rem' }}>จัดการตัวเลขสถิติ (Stats Cards)</h6>
                          <small className="text-muted">รายการตัวเลขสถิติและประสบการณ์ขององค์กร</small>
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button className="btn btn-primary fw-bold rounded-3 d-flex align-items-center gap-2 px-3 py-2 shadow-sm hover-lift" onClick={handleAddStat}>
                          <i className="bi bi-plus-circle-fill"></i> เพิ่มสถิติใหม่
                        </button>
                      </div>
                    </div>

                    <div className="card-body p-4">
                      {/* Quick Presets */}
                      <div className="mb-4 p-3 bg-light bg-opacity-75 rounded-3 border">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="fw-bold text-dark" style={{ fontSize: '0.82rem' }}>
                            <i className="bi bi-lightning-charge-fill text-warning me-1"></i>เพิ่มด้วยแม่แบบสำเร็จรูป (Quick Presets):
                          </span>
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {[
                            { label: 'Years Of\nExperience', value: '24+' },
                            { label: 'Events Organized', value: '500+' },
                            { label: 'Happy Clients', value: '98%' },
                            { label: 'Team Members', value: '50+' }
                          ].map((preset, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              className="btn btn-white btn-sm border fw-bold text-dark shadow-sm hover-lift d-flex align-items-center gap-2"
                              style={{ borderRadius: '8px', fontSize: '0.8rem', background: '#fff' }}
                              onClick={() => handleAddPresetStat(preset)}
                            >
                              <span className="badge px-2 py-1 fw-bold" style={{ background: '#0f172a', color: '#a3d900', fontSize: '0.75rem', borderRadius: '4px' }}>{preset.value}</span>
                              {preset.label.replace('\n', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stats Cards Grid */}
                      <div className="row g-3">
                        {stats.map((stat, idx) => {
                          const isFeatured = idx === 0;
                          const isEditing = editStatId === stat.id;

                          return (
                            <div className="col-md-6 col-lg-4" key={stat.id}>
                              <div
                                className={`card h-100 border transition-all ${isFeatured ? 'shadow-sm' : 'shadow-xs'}`}
                                style={{
                                  borderRadius: '10px',
                                  background: isFeatured ? 'linear-gradient(145deg, #f0fdf4 0%, #ffffff 100%)' : '#ffffff',
                                  borderColor: isFeatured ? '#a3d900' : '#e2e8f0',
                                  borderWidth: isFeatured ? '2px' : '1px',
                                  position: 'relative'
                                }}
                              >
                                {/* Top Badges & Order Controls */}
                                <div className="card-header bg-transparent border-0 pt-3 px-3 pb-0 d-flex align-items-center justify-content-between">
                                  {isFeatured ? (
                                    <span className="badge px-2 py-1 fw-bold" style={{ background: '#0f172a', color: '#a3d900', fontSize: '0.72rem', borderRadius: '6px', border: '1px solid #a3d900' }}>
                                      <i className="bi bi-star-fill text-warning me-1"></i>แสดงลอยทับวิดีโอ
                                    </span>
                                  ) : (
                                    <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.72rem', borderRadius: '6px' }}>
                                      ลำดับที่ {idx + 1}
                                    </span>
                                  )}

                                  <div className="d-flex align-items-center gap-1">
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light border text-muted p-1 d-flex align-items-center justify-content-center"
                                      style={{ width: 26, height: 26, borderRadius: '6px' }}
                                      disabled={idx === 0}
                                      onClick={() => handleMoveStat(idx, 'up')}
                                      title="ย้ายขึ้น"
                                    >
                                      <i className="bi bi-chevron-up"></i>
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light border text-muted p-1 d-flex align-items-center justify-content-center"
                                      style={{ width: 26, height: 26, borderRadius: '6px' }}
                                      disabled={idx === stats.length - 1}
                                      onClick={() => handleMoveStat(idx, 'down')}
                                      title="ย้ายลง"
                                    >
                                      <i className="bi bi-chevron-down"></i>
                                    </button>
                                  </div>
                                </div>

                                <div className="card-body p-3">
                                  {isEditing ? (
                                    <div className="d-flex flex-column gap-2">
                                      <div>
                                        <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: '0.75rem' }}>ตัวเลข (Value)</label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm fw-bold text-primary fs-5"
                                          value={statForm.value}
                                          onChange={e => setStatForm(p => ({ ...p, value: e.target.value }))}
                                          placeholder="เช่น 24 หรือ 500+"
                                          style={{ borderRadius: '6px' }}
                                        />
                                      </div>
                                      <div>
                                        <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: '0.75rem' }}>ชื่อสถิติ / คำอธิบาย (Label)</label>
                                        <textarea
                                          className="form-control form-control-sm"
                                          rows="2"
                                          value={statForm.label}
                                          onChange={e => setStatForm(p => ({ ...p, label: e.target.value }))}
                                          placeholder="เช่น Years Of Experience"
                                          style={{ borderRadius: '6px' }}
                                        ></textarea>
                                      </div>
                                      <div className="d-flex gap-2 mt-2">
                                        <button type="button" className="btn btn-sm btn-primary fw-bold flex-grow-1" onClick={handleSaveStat}>
                                          <i className="bi bi-check-lg me-1"></i>บันทึก
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditStatId(null)}>
                                          ยกเลิก
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="d-flex flex-column h-100 justify-content-between">
                                      <div className="mb-3">
                                        <div className="display-6 mb-1" style={{ fontWeight: 900, color: 'var(--navy)' }}>
                                          {stat.value}
                                        </div>
                                        <div className="text-muted fw-bold" style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                                          {stat.label}
                                        </div>
                                      </div>
                                      <div className="d-flex align-items-center justify-content-end gap-2 border-top pt-2 mt-2">
                                        <button type="button" className="btn btn-sm btn-light border text-muted px-2 py-1" style={{ borderRadius: '6px', fontSize: '0.78rem' }} onClick={() => handleEditStat(stat)}>
                                          <i className="bi bi-pencil-fill me-1"></i>แก้ไข
                                        </button>
                                        <button type="button" className="btn btn-sm btn-light border text-danger px-2 py-1" style={{ borderRadius: '6px', fontSize: '0.78rem' }} onClick={() => handleDeleteStat(stat)}>
                                          <i className="bi bi-trash-fill me-1"></i>ลบ
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {stats.length === 0 && (
                          <div className="col-12">
                            <div className="text-center py-5 border rounded-3 bg-light text-muted">
                              <i className="bi bi-bar-chart-line fs-1 d-block mb-2 opacity-50"></i>
                              <p className="m-0 fw-bold">ยังไม่มีข้อมูลตัวเลขสถิติ</p>
                              <small>เลือกใช้ "แม่แบบสำเร็จรูป" ด้านบน หรือกด "เพิ่มสถิติใหม่" เพื่อเริ่มต้น</small>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSaveAll}>
                    <i className="bi bi-save-fill"></i>บันทึกข้อมูลทั้งหมด
                  </button>
                </div>

                {/* Video Test Modal */}
                {previewVideoModal && createPortal(
                  <div style={{ position: 'fixed', inset: 0, zIndex: 100000, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewVideoModal(false)}>
                    <div style={{ width: '90%', maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
                      <div className="modal-content bg-dark text-white border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="modal-header border-bottom border-secondary px-4 py-3">
                          <h5 className="modal-title fw-bold text-white d-flex align-items-center gap-2">
                            <i className="bi bi-play-btn-fill text-danger"></i> ทดสอบเปิดเล่นวิดีโอ (Admin Test View)
                          </h5>
                          <button type="button" className="btn-close btn-close-white" onClick={() => setPreviewVideoModal(false)}></button>
                        </div>
                        <div className="modal-body p-0">
                          <div className="ratio ratio-16x9">
                            <iframe
                              src={aboutConfig.videoUrl || 'https://www.youtube.com/embed/tgbNymZ7vqY'}
                              title="YouTube Preview"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        </div>
                        <div className="modal-footer border-top border-secondary px-4 py-2 bg-dark">
                          <small className="text-muted me-auto" style={{ wordBreak: 'break-all' }}>URL: {aboutConfig.videoUrl}</small>
                          <button type="button" className="btn btn-secondary btn-sm rounded-pill px-3" onClick={() => setPreviewVideoModal(false)}>ปิดหน้าต่าง</button>
                        </div>
                      </div>
                    </div>
                  </div>,
                  document.body
                )}
              </div>
            )}

            {/* ===== SECTION 3: Core Values, Team Images & Banners ===== */}
            {activeSection === 'values_banners' && (
              <div>
                <SectionHeader
                  icon="bi-images" color="#f59e0b"
                  title="ค่านิยม ภาพทีม และแบนเนอร์ปิดท้ายเพจ" desc="กำหนดจุดเด่นค่านิยมองค์กร รูปภาพทีมงาน และแบนเนอร์ที่แสดงก่อนถึงส่วนล่างสุดของเว็บ"
                />

                <div className="d-flex align-items-center justify-content-between mb-3 mt-4">
                  <h6 className="fw-bold text-dark m-0" style={{ fontSize: '0.95rem' }}>
                    <i className="bi bi-stars text-warning me-2"></i>จุดเด่นค่านิยมองค์กร (Core Values)
                  </h6>
                  <button className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-2 fw-bold" onClick={handleAddCoreValue}>
                    <i className="bi bi-plus-circle-fill"></i>เพิ่มค่านิยมใหม่
                  </button>
                </div>

                <div className="row g-3 mb-4">
                  {aboutConfig.coreValues.map((cv, idx) => (
                    <div key={idx} className="col-md-6">
                      <div className="p-3 bg-light bg-opacity-50 rounded-4 border d-flex align-items-center gap-3">
                        {/* Bootstrap Icon Picker */}
                        <div className="dropdown">
                          <button
                            className="btn btn-light border d-flex align-items-center justify-content-center text-primary shadow-sm"
                            type="button"
                            data-bs-toggle="dropdown"
                            style={{ width: 48, height: 48, borderRadius: '12px' }}
                            title="คลิกเพื่อเปลี่ยนไอคอน"
                          >
                            <i className={`bi ${cv.icon} fs-4`}></i>
                          </button>
                          <ul className="dropdown-menu shadow-lg border-0 p-2" style={{ borderRadius: '14px', zIndex: 1050, width: '230px' }}>
                            <div className="d-flex flex-wrap gap-1 p-1">
                              {iconOptions.map(ico => (
                                <button
                                  type="button"
                                  key={ico}
                                  className={`btn ${cv.icon === ico ? 'btn-primary' : 'btn-light border'} p-0 d-flex align-items-center justify-content-center`}
                                  style={{ width: 34, height: 34, borderRadius: '8px' }}
                                  onClick={() => updateCoreValue(idx, 'icon', ico)}
                                >
                                  <i className={`bi ${ico}`}></i>
                                </button>
                              ))}
                            </div>
                          </ul>
                        </div>

                        <div className="flex-grow-1">
                          <label className="small fw-bold text-dark mb-1">หัวข้อค่านิยม (Title)</label>
                          <input type="text" className="form-control" value={cv.title} onChange={(e) => updateCoreValue(idx, 'title', e.target.value)} style={{ borderRadius: '10px', padding: '8px 12px' }} />
                        </div>

                        <button className="btn btn-light border text-danger rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" onClick={() => deleteCoreValue(idx)} title="ลบค่านิยม" style={{ width: 38, height: 38 }}>
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  {aboutConfig.coreValues.length === 0 && (
                    <div className="col-12">
                      <div className="text-center text-muted py-4 border rounded-4 bg-light">
                        ยังไม่มีรายการค่านิยม กดปุ่ม "เพิ่มค่านิยมใหม่" ด้านบนเพื่อสร้างรายการแรก
                      </div>
                    </div>
                  )}
                </div>

                <hr className="my-4" />

                <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>
                  <i className="bi bi-people-fill text-info me-2"></i>รูปภาพประกอบทีมงาน (ตรงกลางเพจข้าง Quote)
                </h6>
                <div className="row g-4 mb-5">
                  {[0, 1].map(idx => (
                    <div className="col-md-6" key={idx}>
                      <div className="p-3 bg-light bg-opacity-50 rounded-4 border h-100">
                        <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>รูปภาพทีมงานใบที่ {idx + 1}</label>
                        {/* Live cells are col-lg-4 at min-height 400px — a portrait 3:4 crop matches */}
                        <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                          <ImageUploader
                            value={aboutConfig.teamImages[idx] || ''}
                            onChange={(url) => {
                              const newImgs = [...aboutConfig.teamImages];
                              newImgs[idx] = url;
                              handleAboutConfigChange('teamImages', newImgs);
                            }}
                            recommendedSize="800x1060px (แนวตั้ง 3:4)"
                            aspectRatio={3 / 4}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                <div className="d-flex align-items-center justify-content-between mb-3 mt-2">
                  <h6 className="fw-bold text-dark m-0" style={{ fontSize: '0.95rem' }}>
                    <i className="bi bi-images text-success me-2"></i>แบนเนอร์ปิดท้ายเพจ (Bottom Banners)
                  </h6>
                  <button className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-2 fw-bold" onClick={handleAddBanner}>
                    <i className="bi bi-plus-circle-fill"></i>เพิ่มแบนเนอร์
                  </button>
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  {aboutConfig.banners.map((banner, idx) => (
                    <div key={idx} className="p-4 bg-light bg-opacity-50 rounded-4 border">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge rounded-pill bg-primary bg-opacity-25 text-dark px-3 py-2" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                          แบนเนอร์ที่ {idx + 1} · {idx === 0 ? 'ฝั่งซ้าย (มีไอคอนโซเชียล)' : 'ฝั่งขวา (มีปุ่มติดต่อ)'}
                        </span>
                        <button className="btn btn-light border text-danger rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" onClick={() => deleteBanner(idx)} title="ลบแบนเนอร์" style={{ width: 38, height: 38 }}>
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>

                      <div className="row g-4">
                        <div className="col-lg-6">
                          <label className="fw-bold text-dark mb-2 d-block" style={{ fontSize: '0.88rem' }}>รูปแบนเนอร์</label>
                          <div style={{ maxWidth: '400px' }}>
                            <ImageUploader
                              value={banner.image}
                              onChange={(url) => updateBanner(idx, 'image', url)}
                              recommendedSize="1200x800px (แนวนอน 3:2)"
                              aspectRatio={3 / 2}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="h-100 d-flex flex-column justify-content-center">
                            <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>ข้อความพาดหัวแบนเนอร์ (Banner Title)</label>
                            <textarea className="form-control" rows="4" value={banner.title} onChange={(e) => updateBanner(idx, 'title', e.target.value)} placeholder="พิมพ์ข้อความที่จะแสดงทับแบนเนอร์..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {aboutConfig.banners.length === 0 && (
                    <div className="text-center text-muted py-5 border rounded-4 bg-light">
                      ยังไม่มีรายการแบนเนอร์ กดปุ่ม "เพิ่มแบนเนอร์" ด้านบนเพื่อเริ่มสร้าง
                    </div>
                  )}
                </div>

                {/* COMBINED LIVE PREVIEW */}
                <CombinedLivePreview info={info} aboutConfig={aboutConfig} />

                <div className="d-flex flex-wrap gap-3 mt-4 pt-4 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSaveAll}>
                    <i className="bi bi-save-fill"></i>บันทึกข้อมูลทั้งหมด
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Full Page Live Pre-save Preview Modal */}
      <FullAboutPagePreviewModal
        show={showFullPreview}
        onClose={() => setShowFullPreview(false)}
        info={info}
        aboutConfig={aboutConfig}
        stats={stats.map((s, idx) => idx === 0 ? activeFirstStat : s)}
        onSaveAll={handleSaveAll}
      />

      <style>{`
        /* ── Front-end previews ──
           Values mirror .about-hero-img-wrap / .about-exp-box / .about-banner-wrap
           in index.css, scaled down. Keep the two in sync if the live page changes. */
        .about-preview-empty {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #eef2f6;
          color: #94a3b8;
          font-size: 0.78rem;
        }
        .about-preview-empty i { font-size: 1.6rem; opacity: 0.6; }

        /* Video hero */
        .about-preview-hero {
          position: relative;
          max-width: 260px;
          margin: 0 0 26px 22px;
        }
        .about-preview-dome {
          position: relative;
          height: 270px;
          overflow: hidden;
          /* same corner recipe as the live frame */
          border-radius: 50% 50% 12px 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          background: #eef2f6;
        }
        .about-preview-dome img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-preview-play {
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: var(--primary, #a3d900);
          color: var(--navy, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
        }
        .about-preview-expbox {
          position: absolute;
          bottom: -18px;
          left: -18px;
          background: var(--primary, #a3d900);
          color: #fff;
          border: 3px solid #fff;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          padding: 10px 14px;
          min-width: 84px;
          text-align: center;
        }
        .about-preview-expbox .num {
          font-size: 1.9rem;
          font-weight: 900;
          line-height: 1;
        }
        .about-preview-expbox .text {
          font-size: 0.58rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: pre-line;
          margin-top: 3px;
        }

        /* Team pair */
        .about-preview-team {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .about-preview-team-cell {
          position: relative;
          height: 400px;
          background: #eef2f6;
          border-radius: 4px;
          overflow: hidden;
        }
        .about-preview-team-cell img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-preview-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.75);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
        }

        /* Bottom banner */
        .about-preview-banner {
          position: relative;
          height: 420px;
          border-radius: 8px;
          overflow: hidden;
          background: #eef2f6;
        }
        .about-preview-banner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .about-preview-banner-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
          background: linear-gradient(135deg, rgba(10, 15, 13, 0.85), rgba(10, 15, 13, 0.95));
        }
        .about-preview-banner-title {
          color: #fff;
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 2rem;
          line-height: 1.4;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          white-space: pre-line;
        }
        .about-preview-socials {
          display: flex;
          gap: 15px;
        }
        .about-preview-socials i {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #fff;
          color: var(--navy, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
        }
        .about-preview-cta {
          padding: 12px 30px;
          border-radius: 999px;
          background: var(--primary, #a3d900);
          color: var(--navy, #0f172a);
          font-size: 1rem;
          font-weight: 800;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
}
