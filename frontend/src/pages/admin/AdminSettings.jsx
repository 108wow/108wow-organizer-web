import { useState, useCallback, useEffect } from 'react';
import { companyAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

export default function AdminSettings() {
  const [form, setForm] = useState({ name: '', tagline: '', logoUrl: '', faviconUrl: '', primaryColor: '#a3d900', navyColor: '#0f172a', about: '', address: '', email: '', officeHours: '', footerName: '', ctaTitle: '', ctaSubtitle: '', ctaButtonText: '' });

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
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); };
  const exec = useCallback(async (action) => { setConfirm(p=>({...p,show:false})); setLoading(true); try { await action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกการตั้งค่าเรียบร้อย' }); } catch(e) { setLoading(false); setStatusM({ show: true, status: 'error', message: e.message }); } }, []);

  const handleSave = () => {
    setConfirm({
      show: true,
      type: 'info',
      title: 'บันทึกการตั้งค่า',
      message: 'ยืนยันบันทึกการตั้งค่าเว็บไซต์?',
      action: async () => {
        await companyAPI.update({
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

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} message="กำลังบันทึกการตั้งค่า..." />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">ตั้งค่าทั่วไป (Settings)</h3><p className="text-muted m-0">จัดการโลโก้ ชื่อเว็บไซต์ และธีมดีไซน์ระบบ</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm d-flex align-items-center gap-2" onClick={handleSave}><i className="bi bi-save"></i>บันทึกการตั้งค่า</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0">ข้อมูลเว็บไซต์</h5></div>
            <div className="card-body p-4">
              <div className="admin-form-group"><label>ชื่อเว็บไซต์ (Site Name)</label><input type="text" name="name" value={form.name} onChange={handleChange} /><small className="text-muted">แสดงบน Navbar และ Title ของเว็บ</small></div>
              <div className="admin-form-group"><label>Tagline / สโลแกน</label><input type="text" name="tagline" value={form.tagline} onChange={handleChange} /><small className="text-muted">คำอธิบายสั้นๆ ของเว็บไซต์</small></div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 mt-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0"><i className="bi bi-megaphone me-2 text-primary"></i>การตั้งค่า Call To Action (ก่อน Footer)</h5></div>
            <div className="card-body p-4">
              <div className="admin-form-group">
                <label>หัวข้อ (CTA Title)</label>
                <input type="text" name="ctaTitle" value={form.ctaTitle} onChange={handleChange} className="form-control" placeholder="พร้อมเปลี่ยนไอเดียให้เป็นงานสุดว้าวหรือยัง?" />
              </div>
              <div className="admin-form-group mt-3">
                <label>ข้อความรอง (CTA Subtitle)</label>
                <textarea name="ctaSubtitle" value={form.ctaSubtitle} onChange={handleChange} rows="2" className="form-control" placeholder="ไม่ว่าจะเป็นงานกีฬาปาร์ตี้ สัมมนา..."></textarea>
              </div>
              <div className="row mt-3">
                <div className="col-md-12">
                  <div className="admin-form-group">
                    <label>ข้อความปุ่ม (Button Text)</label>
                    <input type="text" name="ctaButtonText" value={form.ctaButtonText} onChange={handleChange} className="form-control" placeholder="ทักมาคุยกับเรา" />
                    <small className="text-muted">ปุ่มนี้จะลิงก์ไปยังหน้าติดต่อเรา (/contact) เสมอ</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4 mt-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0"><i className="bi bi-layout-text-window-reverse me-2 text-primary"></i>การตั้งค่า Footer</h5></div>
            <div className="card-body p-4">
              <div className="admin-form-group">
                <label>ชื่อบริษัท (แสดงที่ Footer)</label>
                <input type="text" name="footerName" value={form.footerName} onChange={handleChange} className="form-control" placeholder="ชื่อที่จะแสดงใน Footer" />
                <small className="text-muted">หากเว้นว่างไว้ จะใช้ "ชื่อเว็บไซต์ (Site Name)" แทน</small>
              </div>
              <div className="admin-form-group mt-3">
                <label>คำบรรยายบริษัท (About)</label>
                <textarea name="about" value={form.about} onChange={handleChange} rows="3" className="form-control" placeholder="เราคือ Organizer สายครีเอทีฟ..."></textarea>
                <small className="text-muted">ข้อความแนะนำตัวสั้นๆ แสดงใต้โลโก้ที่ Footer</small>
              </div>
              <div className="admin-form-group mt-3">
                <label>ที่อยู่ (Address)</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows="2" className="form-control" placeholder="123 อาคาร..."></textarea>
              </div>
              <div className="admin-form-group mt-3">
                <label>อีเมล (Email)</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" placeholder="contact@example.com" />
              </div>
              <div className="admin-form-group mt-3">
                <label>เวลาทำการ (Office Hours)</label>
                <textarea name="officeHours" value={form.officeHours} onChange={handleChange} rows="2" className="form-control" placeholder="จันทร์ - ศุกร์ 09:00 - 18:00"></textarea>
                <small className="text-muted">พิมพ์เวลาทำการของคุณได้เลย (เคาะบรรทัดใหม่ได้)</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0"><i className="bi bi-image me-2 text-primary"></i>โลโก้เว็บไซต์</h5></div>
            <div className="card-body p-4">
              <ImageUploader
                value={form.logoUrl}
                onChange={(url) => setForm(p => ({ ...p, logoUrl: url }))}
                label="Logo URL (รูปภาพ)"
                aspectRatio={3}
                recommendedSize="แนะนำขนาด: 300 x 100 px (สัดส่วน 3:1)"
              />
              {/* Preview */}
              <div className="mt-3 p-3 rounded-3" style={{ background: form.navyColor }}>
                <div className="d-flex align-items-center gap-2">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="logo" style={{ maxHeight: 36, maxWidth: 150 }} onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <span className="fw-bold text-white" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>{form.name}</span>
                  )}
                </div>
                <small className="text-white" style={{ opacity: 0.5 }}>ตัวอย่างการแสดงผลบน Navbar</small>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0"><i className="bi bi-palette me-2 text-primary"></i>ธีมและสีเว็บไซต์ (Dynamic Theme Tokens)</h5></div>
            <div className="card-body p-4">
              <div className="admin-form-group">
                <label>สีหลัก (Primary Brand Color)</label>
                <div className="d-flex align-items-center gap-3">
                  <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" name="primaryColor" value={form.primaryColor} onChange={handleChange} className="form-control" style={{ flex: 1 }} />
                </div>
                <small className="text-muted d-block mt-1">ใช้สำหรับปุ่ม, ไอคอนไฮไลต์, และแอกเซนท์ทั่วเว็บ</small>
              </div>

              <div className="admin-form-group mt-4">
                <label>สีเข้ม/พื้นหลังหลัก (Navy / Dark Theme Color)</label>
                <div className="d-flex align-items-center gap-3">
                  <input type="color" name="navyColor" value={form.navyColor} onChange={handleChange} style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" name="navyColor" value={form.navyColor} onChange={handleChange} className="form-control" style={{ flex: 1 }} />
                </div>
                <small className="text-muted d-block mt-1">ใช้สำหรับส่วน Navbar, Hero caption, และการ์ดสไตล์เข้ม</small>
              </div>

              <hr className="my-4" />

              <label className="fw-bold mb-2 small text-uppercase text-muted">ชุดสีแนะนำสำเร็จรูป (Theme Presets)</label>
              <div className="d-flex flex-column gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-light border d-flex align-items-center justify-content-between p-2 rounded-3"
                    onClick={() => applyPreset(p.primary, p.navy)}
                    style={{ transition: 'all 0.2s' }}
                  >
                    <span className="small fw-bold">{p.name}</span>
                    <div className="d-flex align-items-center gap-1">
                      <span className="d-inline-block rounded-circle" style={{ width: 18, height: 18, background: p.primary, border: '1px solid rgba(0,0,0,0.1)' }}></span>
                      <span className="d-inline-block rounded-circle" style={{ width: 18, height: 18, background: p.navy }}></span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
