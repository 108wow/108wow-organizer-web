import { useState, useCallback, useEffect } from 'react';
import { companyAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

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

export default function AdminSettings() {
  const [form, setForm] = useState({
    name: '', tagline: '', logoUrl: '', faviconUrl: '',
    primaryColor: '#a3d900', navyColor: '#0f172a',
    about: '', address: '', email: '', officeHours: '',
    footerName: '', ctaTitle: '', ctaSubtitle: '', ctaButtonText: ''
  });

  const [activeSection, setActiveSection] = useState('general');
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  useEffect(() => {
    companyAPI.get().then(d => setForm(p => ({
      ...p,
      name: d.name || '',
      tagline: d.tagline || '',
      logoUrl: d.logoUrl || '',
      primaryColor: d.primaryColor || '#a3d900',
      navyColor: d.navyColor || '#0f172a',
      about: d.about || '',
      address: d.address || '',
      email: d.email || '',
      officeHours: d.officeHours || '',
      footerName: d.footerName || '',
      ctaTitle: d.ctaTitle || '',
      ctaSubtitle: d.ctaSubtitle || '',
      ctaButtonText: d.ctaButtonText || ''
    }))).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const exec = useCallback(async (action) => {
    setConfirm(p => ({ ...p, show: false }));
    setLoading(true);
    try {
      await action();
      setLoading(false);
      setStatusM({ show: true, status: 'success', message: 'บันทึกการตั้งค่าเรียบร้อย' });
    } catch (e) {
      setLoading(false);
      setStatusM({ show: true, status: 'error', message: e.message || 'บันทึกการตั้งค่าไม่สำเร็จ' });
    }
  }, []);

  const handleSave = () => {
    setConfirm({
      show: true,
      type: 'info',
      title: 'บันทึกการตั้งค่า',
      message: 'ยืนยันบันทึกการตั้งค่าเว็บไซต์?',
      action: async () => {
        const updated = await companyAPI.update({
          name: form.name,
          tagline: form.tagline,
          logoUrl: form.logoUrl,
          primaryColor: form.primaryColor,
          navyColor: form.navyColor,
          about: form.about,
          address: form.address,
          email: form.email,
          officeHours: form.officeHours,
          footerName: form.footerName,
          ctaTitle: form.ctaTitle,
          ctaSubtitle: form.ctaSubtitle,
          ctaButtonText: form.ctaButtonText
        });
        if (updated) {
          setForm(p => ({ ...p, ...updated }));
        }

        // Apply dynamic CSS variables immediately on save
        document.documentElement.style.setProperty('--primary', form.primaryColor);
        document.documentElement.style.setProperty('--navy', form.navyColor);
      }
    });
  };

  const applyPreset = (primary, navy) => {
    setForm(p => ({ ...p, primaryColor: primary, navyColor: navy }));
  };

  const presets = [
    { name: 'Neon Lime (Default)', primary: '#a3d900', navy: '#0f172a' },
    { name: 'Cyber Blue', primary: '#0070f3', navy: '#0a1128' },
    { name: 'Crimson Red', primary: '#ff2a5f', navy: '#180812' },
    { name: 'Royal Gold', primary: '#f59e0b', navy: '#1c150c' },
    { name: 'Emerald Green', primary: '#10b981', navy: '#062016' },
    { name: 'Sunset Purple', primary: '#8b5cf6', navy: '#130924' },
  ];

  const sections = [
    { key: 'general', label: 'ข้อมูลเว็บไซต์', icon: 'bi-globe2' },
    { key: 'theme', label: 'โลโก้และสีธีม', icon: 'bi-palette-fill' },
    { key: 'cta', label: 'ส่วน Call to Action', icon: 'bi-megaphone-fill' },
    { key: 'footer', label: 'ข้อมูล Footer', icon: 'bi-layout-text-window-reverse' },
  ];

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={() => exec(confirm.action)} onCancel={() => setConfirm(p => ({ ...p, show: false }))} />
      <LoadingOverlay show={loading} message="กำลังบันทึกการตั้งค่า..." />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={() => setStatusM(p => ({ ...p, show: false }))} />

      {/* Header Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3 mb-4 bg-white p-3 px-4 rounded-4 shadow-sm border border-light-subtle">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-3 bg-primary bg-opacity-25 text-dark p-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48 }}>
            <i className="bi bi-gear-wide-connected fs-4"></i>
          </div>
          <div>
            <h4 className="fw-bold m-0 text-dark">ตั้งค่าทั่วไป (Settings)</h4>
            <p className="text-muted m-0" style={{ fontSize: '0.82rem' }}>จัดการโลโก้ ชื่อเว็บไซต์ ธีมสีระบบ ส่วน Call To Action และ Footer</p>
          </div>
        </div>
        <button className="btn btn-primary fw-bold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2 hover-lift" onClick={handleSave}>
          <i className="bi bi-save-fill"></i>บันทึกการตั้งค่า
        </button>
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

            {/* ===== SECTION 1: General Info ===== */}
            {activeSection === 'general' && (
              <div>
                <SectionHeader
                  icon="bi-globe2" color="var(--navy)"
                  title="ข้อมูลเว็บไซต์พื้นฐาน" desc="ชื่อระบบ สโลแกน และการตั้งค่าที่จะปรากฏใน Navbar และ Title ของเบราว์เซอร์"
                />
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-browser-chrome text-primary me-2"></i>ชื่อเว็บไซต์ (Site Name)
                      </label>
                      <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="เช่น 108 WOW Sport Day" style={{ borderRadius: '12px', padding: '12px 16px' }} />
                      <small className="text-muted mt-1.5 d-block" style={{ fontSize: '0.8rem' }}>แสดงบนแถบ Navigation Bar ด้านบน และ Title แท็บเบราว์เซอร์</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-chat-quote-fill text-primary me-2"></i>Tagline / สโลแกน
                      </label>
                      <input type="text" name="tagline" className="form-control" value={form.tagline} onChange={handleChange} placeholder="เช่น SPORTSDAY & ACTIVITY EXPERT" style={{ borderRadius: '12px', padding: '12px 16px' }} />
                      <small className="text-muted mt-1.5 d-block" style={{ fontSize: '0.8rem' }}>คำอธิบายสั้นๆ เกี่ยวกับแบรนด์หรือบริการหลัก</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSave}>
                    <i className="bi bi-save-fill"></i>บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            )}

            {/* ===== SECTION 2: Branding & Theme Colors ===== */}
            {activeSection === 'theme' && (
              <div>
                <SectionHeader
                  icon="bi-palette-fill" color="#8b5cf6"
                  title="โลโก้และระบบสีหลัก (Theme Tokens)" desc="ตั้งค่าโลโก้เว็บไซต์ ปรับโทนสีหลัก (Primary & Navy) และเลือกธีมสำเร็จรูป"
                />
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="p-4 rounded-4 border bg-light bg-opacity-50 shadow-2xs h-100">
                      <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>
                        <i className="bi bi-image text-primary me-2"></i>อัปโหลดโลโก้เว็บไซต์
                      </h6>
                      <ImageUploader
                        value={form.logoUrl}
                        onChange={(url) => setForm(p => ({ ...p, logoUrl: url }))}
                        label="Logo URL (รูปภาพ)"
                        aspectRatio={3}
                        recommendedSize="แนะนำขนาด: 300 x 100 px (สัดส่วน 3:1)"
                      />
                      <div className="mt-4 p-3 rounded-4 shadow-2xs" style={{ background: form.navyColor, transition: 'all 0.3s ease' }}>
                        <div className="d-flex align-items-center justify-content-between gap-3 mb-2">
                          <span className="badge rounded-pill bg-white bg-opacity-20 text-white px-2.5 py-1" style={{ fontSize: '0.72rem' }}>Navbar Preview</span>
                          <span className="badge rounded-pill px-2.5 py-1" style={{ background: form.primaryColor, color: '#0f172a', fontWeight: 700, fontSize: '0.72rem' }}>Brand Active</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 py-1">
                          {form.logoUrl ? (
                            <img src={form.logoUrl} alt="logo preview" style={{ maxHeight: 38, maxWidth: 160, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                          ) : (
                            <span className="fw-bold text-white fs-5" style={{ fontStyle: 'italic', letterSpacing: '0.5px' }}>{form.name || 'Site Logo'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="p-4 rounded-4 border bg-light bg-opacity-50 shadow-2xs h-100">
                      <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem' }}>
                        <i className="bi bi-sliders text-primary me-2"></i>ปรับแต่งโทนสีหลัก (Brand Colors)
                      </h6>
                      <div className="admin-form-group mb-3">
                        <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>สีหลัก (Primary Accent Color)</label>
                        <div className="d-flex align-items-center gap-3">
                          <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ width: 52, height: 44, border: '1.5px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', padding: 3 }} />
                          <input type="text" name="primaryColor" value={form.primaryColor} onChange={handleChange} className="form-control" style={{ borderRadius: '12px', padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }} />
                        </div>
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>ใช้สำหรับปุ่มกด, ไอคอนไฮไลต์ และสีเน้นในทุกหน้า</small>
                      </div>

                      <div className="admin-form-group mb-4">
                        <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>สีเข้ม/พื้นหลังหลัก (Navy / Dark Theme Color)</label>
                        <div className="d-flex align-items-center gap-3">
                          <input type="color" name="navyColor" value={form.navyColor} onChange={handleChange} style={{ width: 52, height: 44, border: '1.5px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', padding: 3 }} />
                          <input type="text" name="navyColor" value={form.navyColor} onChange={handleChange} className="form-control" style={{ borderRadius: '12px', padding: '10px 14px', fontFamily: 'monospace', fontWeight: 600 }} />
                        </div>
                        <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>ใช้สำหรับส่วน Navbar แบกกราวด์ส่วน Hero และการ์ดโทนเข้ม</small>
                      </div>

                      <label className="fw-bold text-dark mb-2 d-block" style={{ fontSize: '0.84rem' }}>
                        <i className="bi bi-lightning-charge-fill text-warning me-1.5"></i>ชุดสีแนะนำสำเร็จรูป (Theme Presets)
                      </label>
                      <div className="row g-2">
                        {presets.map((p, idx) => (
                          <div key={idx} className="col-6">
                            <button
                              type="button"
                              className={`btn w-100 border d-flex align-items-center justify-content-between p-2.5 rounded-3 transition-all ${form.primaryColor.toLowerCase() === p.primary.toLowerCase() ? 'border-primary bg-primary bg-opacity-10 fw-bold' : 'btn-light text-dark'}`}
                              onClick={() => applyPreset(p.primary, p.navy)}
                              style={{ fontSize: '0.82rem' }}
                            >
                              <span className="text-truncate">{p.name.split(' ')[0]}</span>
                              <div className="d-flex align-items-center gap-1 flex-shrink-0">
                                <span className="d-inline-block rounded-circle shadow-2xs" style={{ width: 16, height: 16, background: p.primary, border: '1px solid rgba(0,0,0,0.1)' }}></span>
                                <span className="d-inline-block rounded-circle shadow-2xs" style={{ width: 16, height: 16, background: p.navy }}></span>
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSave}>
                    <i className="bi bi-save-fill"></i>บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            )}

            {/* ===== SECTION 3: Call To Action ===== */}
            {activeSection === 'cta' && (
              <div>
                <SectionHeader
                  icon="bi-megaphone-fill" color="#f59e0b"
                  title="การตั้งค่าส่วน Call To Action (ก่อน Footer)" desc="ข้อความเชิญชวนและปุ่มกดเพื่อกระตุ้นให้ลูกค้าทักเข้ามาติดต่อ"
                />
                <div className="row g-4">
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-type-h1 text-primary me-2"></i>หัวข้อหลัก (CTA Title)
                      </label>
                      <input type="text" name="ctaTitle" value={form.ctaTitle} onChange={handleChange} className="form-control" placeholder="พร้อมเปลี่ยนไอเดียให้เป็นงานสุดว้าวหรือยัง?" style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-text-paragraph text-primary me-2"></i>ข้อความรอง (CTA Subtitle)
                      </label>
                      <textarea name="ctaSubtitle" value={form.ctaSubtitle} onChange={handleChange} rows="2" className="form-control" placeholder="ไม่ว่าจะเป็นงานกีฬาปาร์ตี้ สัมมนา..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-menu-button-wide-fill text-primary me-2"></i>ข้อความบนปุ่มกด (Button Text)
                      </label>
                      <input type="text" name="ctaButtonText" value={form.ctaButtonText} onChange={handleChange} className="form-control" placeholder="ทักมาคุยกับเรา" style={{ borderRadius: '12px', padding: '12px 16px' }} />
                      <small className="text-muted mt-1.5 d-block" style={{ fontSize: '0.8rem' }}>ปุ่มนี้จะลิงก์ไปยังหน้าติดต่อเรา (/contact) โดยอัตโนมัติ</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSave}>
                    <i className="bi bi-save-fill"></i>บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            )}

            {/* ===== SECTION 4: Footer Info ===== */}
            {activeSection === 'footer' && (
              <div>
                <SectionHeader
                  icon="bi-layout-text-window-reverse" color="#0891b2"
                  title="การตั้งค่าข้อมูล Footer" desc="ข้อมูลบริษัท คำบรรยาย ที่อยู่ อีเมล และเวลาทำการในส่วนล่างสุดของเว็บไซต์"
                />
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-building-fill text-primary me-2"></i>ชื่อบริษัท (แสดงที่ Footer)
                      </label>
                      <input type="text" name="footerName" value={form.footerName} onChange={handleChange} className="form-control" placeholder="เช่น 108 WOW SPORT DAY CO., LTD." style={{ borderRadius: '12px', padding: '12px 16px' }} />
                      <small className="text-muted mt-1.5 d-block" style={{ fontSize: '0.8rem' }}>หากเว้นว่างไว้ ระบบจะใช้ "ชื่อเว็บไซต์ (Site Name)" แทน</small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-envelope-at-fill text-primary me-2"></i>อีเมลสำหรับแสดงที่ Footer
                      </label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="contact@example.com" style={{ borderRadius: '12px', padding: '12px 16px' }} />
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-info-circle-fill text-primary me-2"></i>คำบรรยายบริษัท (About)
                      </label>
                      <textarea name="about" value={form.about} onChange={handleChange} rows="3" className="form-control" placeholder="เราคือ Organizer สายครีเอทีฟ ผู้เชี่ยวชาญการจัดงานกีฬาสี..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                      <small className="text-muted mt-1.5 d-block" style={{ fontSize: '0.8rem' }}>ข้อความแนะนำตัวสั้นๆ ที่แสดงใต้โลโก้บริเวณ Footer</small>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-geo-alt-fill text-primary me-2"></i>ที่อยู่บริษัท (Address)
                      </label>
                      <textarea name="address" value={form.address} onChange={handleChange} rows="3" className="form-control" placeholder="ระบุที่อยู่ของบริษัท..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                        <i className="bi bi-clock-fill text-primary me-2"></i>เวลาทำการ (Office Hours)
                      </label>
                      <textarea name="officeHours" value={form.officeHours} onChange={handleChange} rows="3" className="form-control" placeholder="จันทร์ - ศุกร์ 09:00 - 18:00..." style={{ borderRadius: '12px', padding: '12px 16px' }}></textarea>
                      <small className="text-muted mt-1.5 d-block" style={{ fontSize: '0.8rem' }}>สามารถกด Enter เพื่อเว้นบรรทัดสำหรับแต่ละวันได้</small>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 mt-4 pt-3 border-top border-light-subtle">
                  <button className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 d-flex align-items-center gap-2 shadow-sm" onClick={handleSave}>
                    <i className="bi bi-save-fill"></i>บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
