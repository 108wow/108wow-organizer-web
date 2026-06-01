import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { heroAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

export default function AdminHeroEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    ghostText: '',
    image: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '' });
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '', onHide: null });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      heroAPI.get(id).then(data => {
        setForm(data);
        setLoading(false);
      }).catch(err => {
        setLoading(false);
        setStatusM({ show: true, status: 'error', message: err.message, onHide: () => navigate('/admin/hero') });
      });
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    setConfirm({
      show: true,
      title: isEditing ? 'บันทึกการแก้ไข' : 'สร้างสไลด์ใหม่',
      message: `ยืนยันการ${isEditing ? 'แก้ไข' : 'สร้าง'}สไลด์ "${form.title}" ?`,
      action: async () => {
        setConfirm(p => ({...p, show: false}));
        setLoading(true);
        try {
          if (isEditing) {
            await heroAPI.update(id, form);
          } else {
            await heroAPI.create(form);
          }
          setLoading(false);
          setStatusM({
            show: true,
            status: 'success',
            message: 'บันทึกข้อมูลเรียบร้อย',
            onHide: () => navigate('/admin/hero')
          });
        } catch (err) {
          setLoading(false);
          setStatusM({ show: true, status: 'error', message: err.message });
        }
      }
    });
  };

  return (
    <div className="anim-slide-up d1">
      <ConfirmModal show={confirm.show} title={confirm.title} message={confirm.message} onConfirm={confirm.action} onCancel={() => setConfirm(p => ({...p, show: false}))} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={() => { setStatusM(p => ({...p, show: false})); if(statusM.onHide) statusM.onHide(); }} />

      <div className="bg-white p-3 px-4 rounded-4 shadow-sm mb-4 d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light border rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 hover-lift" style={{ width: 40, height: 40 }} onClick={() => navigate('/admin/hero')} title="กลับไปหน้าจัดการแบนเนอร์">
            <i className="bi bi-arrow-left text-dark"></i>
          </button>
          <div>
            <p className="text-muted m-0" style={{ fontSize: '0.75rem' }}>กลับไปหน้าจัดการแบนเนอร์</p>
            <h4 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
              <i className={`bi ${isEditing ? 'bi-pencil-square' : 'bi-plus-lg'} text-primary`}></i>
              {isEditing ? 'แก้ไขสไลด์แบนเนอร์' : 'สร้างสไลด์แบนเนอร์ใหม่'}
            </h4>
          </div>
        </div>
        
        {/* Status Switch */}
        <div className="d-flex align-items-center gap-3 bg-light px-3 py-2 rounded-pill border">
          <span className="fw-bold text-muted small">สถานะ:</span>
          <div className="form-check form-switch fs-5 m-0 d-flex align-items-center">
            <input className="form-check-input shadow-none" type="checkbox" id="isActiveSwitchTop" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} style={{cursor:'pointer'}}/>
          </div>
          <span className={`fw-bold small ${form.isActive ? 'text-success' : 'text-danger'}`}>{form.isActive ? 'เปิดใช้งาน' : 'ซ่อนอยู่'}</span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left/Top: Live Preview */}
        <div className="col-12 col-xl-7">
          <div className="bg-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-laptop text-primary fs-5"></i> Live Preview (จำลองหน้าเว็บจริง)
            </h6>
            
            {/* Scoped preview overrides — shrink text to match smaller box */}
            <style>{`
              .hero-preview-box .home-carousel .carousel-caption h1 {
                font-size: 1.4rem !important;
                margin-bottom: 0.4rem !important;
              }
              .hero-preview-box .home-carousel .carousel-caption p {
                font-size: 0.55rem !important;
                margin-bottom: 0.6rem !important;
                max-width: 280px !important;
                line-height: 1.6 !important;
              }
              .hero-preview-box .home-carousel .carousel-caption .container {
                max-width: 360px !important;
                margin-left: 6% !important;
              }
              .hero-preview-box .ghost-text {
                font-size: 1.6rem !important;
              }
              .hero-preview-box .btn-main,
              .hero-preview-box .btn-ghost {
                font-size: 0.55rem !important;
                padding: 5px 14px !important;
              }
              .hero-preview-box .carousel-control-prev,
              .hero-preview-box .carousel-control-next {
                width: 24px !important;
                height: 24px !important;
              }
              .hero-preview-box .carousel-control-prev-icon,
              .hero-preview-box .carousel-control-next-icon {
                width: 12px !important;
                height: 12px !important;
              }
            `}</style>

            {/* Scaled-down replica: render at real size, then shrink with CSS */}
            <div className="hero-preview-box rounded-4 overflow-hidden border shadow-sm w-100" style={{ position: 'relative', paddingTop: '56.25%', background: '#0a0f0d' }}>
              <div className="home-carousel" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <div className="carousel-item active" style={{ height: '100%' }}>
                  <div className="hero-bg" style={{ backgroundImage: `url(${form.image})` }} />
                  <div className="hero-overlay" />
                  <div className="carousel-caption">
                    <div className="container position-relative">
                      {/* Ghost Text */}
                      <div className="ghost-text" aria-hidden="true">{form.ghostText || form.title || 'GHOST'}</div>
                      <div className="position-relative" style={{ zIndex: 3 }}>
                        <p style={{ fontSize: '.45rem', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', marginBottom: 4 }}>
                          108 WOWSPORT DAY ORGANIZER
                        </p>
                        <h1>{form.title || 'หัวข้อหลัก (Title)'}</h1>
                        <p>{form.subtitle || 'คำบรรยายสั้นๆ (Subtitle) จะแสดงที่นี่'}</p>
                        <div className="d-flex gap-2 hero-btn-wrap">
                          <span className="btn btn-main" style={{ pointerEvents: 'none' }}>ดูบริการ</span>
                          <span className="btn btn-ghost" style={{ pointerEvents: 'none' }}>ติดต่อเรา</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Fake carousel controls for visual fidelity */}
                  <button className="carousel-control-prev" type="button" style={{ pointerEvents: 'none' }}><span className="carousel-control-prev-icon" /></button>
                  <button className="carousel-control-next" type="button" style={{ pointerEvents: 'none' }}><span className="carousel-control-next-icon" /></button>
                </div>
              </div>
            </div>
            
            <div className="alert alert-light border rounded-3 mt-4 mb-0 d-flex align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-info-circle-fill fs-5 text-primary"></i>
              <span><strong>คำแนะนำ:</strong> ภาพที่อัปโหลดควรเป็นแนวนอน (16:9) เพื่อให้พอดีกับหน้าจอ และข้อความไม่ควรยาวเกินไปเพื่อความสวยงาม</span>
            </div>
          </div>
        </div>

        {/* Right/Bottom: Edit Form */}
        <div className="col-12 col-xl-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom py-3 px-4">
              <h6 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-input-cursor-text text-primary fs-5"></i> ข้อมูลแบนเนอร์
              </h6>
            </div>
            <div className="card-body p-4 bg-light">
              <form id="heroForm" onSubmit={handleSave}>
                <div className="row g-4">
                  
                  <div className="col-12">
                    <div className="admin-form-group m-0 bg-white p-3 rounded-4 border shadow-sm">
                      <label className="fw-bold text-dark mb-2">รูปภาพพื้นหลัง <span className="text-danger">*</span></label>
                      <ImageUploader value={form.image} onChange={(url) => setForm(p => ({...p, image: url}))} aspectRatio={16/9} />
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="admin-form-group m-0">
                      <label className="fw-bold text-dark mb-2">หัวข้อหลัก (Title) <span className="text-danger">*</span></label>
                      <input type="text" className="form-control bg-white shadow-sm border-0" name="title" value={form.title || ''} onChange={handleChange} required style={{ borderRadius: '10px', padding: '14px' }} placeholder="ตัวอย่าง: กิจกรรมสุดมันส์"/>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="admin-form-group m-0">
                      <label className="fw-bold text-dark mb-2">คำบรรยายสั้นๆ (Subtitle)</label>
                      <textarea className="form-control bg-white shadow-sm border-0" name="subtitle" rows="3" value={form.subtitle || ''} onChange={handleChange} style={{ borderRadius: '10px', padding: '14px' }} placeholder="เพิ่มคำบรรยายเพื่อขยายความหัวข้อ..."></textarea>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="admin-form-group m-0">
                      <label className="fw-bold text-dark mb-2">ข้อความจางๆ พื้นหลัง (Ghost Text)</label>
                      <input type="text" className="form-control bg-white shadow-sm border-0 text-uppercase fw-bold text-muted" name="ghostText" value={form.ghostText || ''} onChange={handleChange} style={{ borderRadius: '10px', padding: '14px' }} placeholder="เช่น WOW, SALE, NEW"/>
                      <div className="form-text mt-2"><i className="bi bi-lightbulb text-warning me-1"></i>อักษรตัวใหญ่ที่จะซ่อนอยู่ข้างหลังหัวข้อหลัก (ดูที่ Live Preview)</div>
                    </div>
                  </div>
                  
                  {/* Mobile Only Status Switch */}
                  <div className="col-12 d-xl-none">
                    <div className="bg-white p-3 rounded-4 border shadow-sm d-flex justify-content-between align-items-center">
                      <label className="fw-bold text-dark m-0" htmlFor="isActiveSwitchMobile">สถานะแสดงผล</label>
                      <div className="form-check form-switch fs-4 m-0">
                        <input className="form-check-input shadow-none" type="checkbox" id="isActiveSwitchMobile" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})}/>
                      </div>
                    </div>
                  </div>

                </div>
              </form>
            </div>
            <div className="card-footer bg-white border-top p-4 d-flex justify-content-end gap-3 rounded-bottom-4">
              <button type="button" className="btn btn-light px-4 rounded-pill fw-bold border text-muted hover-lift" onClick={() => navigate('/admin/hero')}>ยกเลิก</button>
              <button type="submit" form="heroForm" className="btn btn-primary px-5 rounded-pill shadow-sm fw-bold d-flex align-items-center gap-2 hover-lift">
                <i className="bi bi-save"></i> {isEditing ? 'บันทึกการแก้ไข' : 'สร้างสไลด์ใหม่'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
