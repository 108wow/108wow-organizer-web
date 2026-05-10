import { useState, useCallback } from 'react';
import { companyInfo } from '../../data/mockData';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

export default function AdminSettings() {
  const [form, setForm] = useState({ name: companyInfo.name, tagline: companyInfo.tagline, logoUrl: '', faviconUrl: '', primaryColor: '#a3d900' });
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); };
  const exec = useCallback((action) => { setConfirm(p=>({...p,show:false})); setLoading(true); setTimeout(() => { action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกการตั้งค่าเรียบร้อย' }); }, 1200); }, []);

  const handleSave = () => {
    setConfirm({ show: true, type: 'info', title: 'บันทึกการตั้งค่า', message: 'ยืนยันบันทึกการตั้งค่าเว็บไซต์?', action: () => { /* In future: API call */ } });
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} />
      <LoadingOverlay show={loading} message="กำลังบันทึกการตั้งค่า..." />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">ตั้งค่าทั่วไป (Settings)</h3><p className="text-muted m-0">จัดการโลโก้ ชื่อเว็บไซต์ และการตั้งค่าพื้นฐาน</p></div>
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
              />
              {/* Preview */}
              <div className="mt-3 p-3 rounded-3" style={{ background: '#0a0f0d' }}>
                <div className="d-flex align-items-center gap-2">
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="logo" style={{ maxHeight: 36, maxWidth: 150 }} onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <span className="fw-bold text-white" style={{ fontSize: '1.2rem', fontStyle: 'italic' }}>{form.name}</span>
                  )}
                </div>
                <small className="text-white" style={{ opacity: 0.4 }}>ตัวอย่างการแสดงผลบน Navbar</small>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0"><i className="bi bi-palette me-2 text-primary"></i>สี Primary</h5></div>
            <div className="card-body p-4">
              <div className="admin-form-group">
                <label>สีหลัก (Primary Color)</label>
                <div className="d-flex align-items-center gap-3">
                  <input type="color" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ width: 50, height: 40, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                  <input type="text" name="primaryColor" value={form.primaryColor} onChange={handleChange} style={{ flex: 1 }} />
                </div>
                <small className="text-muted">ใช้สำหรับปุ่ม, ลิงก์, และ accent color ทั่วเว็บ</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
