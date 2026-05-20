import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { serviceAPI, galleryAPI, blogAPI, teamAPI, clientAPI } from '../../api';

export default function AdminDashboard() {
  const [counts, setCounts] = useState({ services: 0, gallery: 0, blog: 0, team: 0 });

  useEffect(() => {
    Promise.all([serviceAPI.list(), galleryAPI.list(), blogAPI.listAll().catch(() => blogAPI.listPublished()), teamAPI.list()])
      .then(([svc, gal, blog, team]) => {
        setCounts({ services: svc.length, gallery: gal.length, blog: blog.length, team: team.length });
      }).catch(() => {});
  }, []);

  const stats = [
    { title: 'บริการทั้งหมด', value: counts.services, icon: 'bi-briefcase', color: 'var(--primary-dark)', bg: 'rgba(163,217,0,0.1)' },
    { title: 'ผลงาน Gallery', value: counts.gallery, icon: 'bi-collection', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'บทความ Blog', value: counts.blog, icon: 'bi-journal-text', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { title: 'ทีมงาน', value: counts.team, icon: 'bi-people', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  const quickLinks = [
    { to: '/admin/hero', icon: 'bi-image', color: '#3b82f6', title: 'อัปเดตแบนเนอร์', desc: 'แก้ไขข้อความและรูปภาพฮีโร่' },
    { to: '/admin/services', icon: 'bi-briefcase', color: '#10b981', title: 'จัดการบริการ', desc: 'เพิ่มหรือแก้ไขบริการ' },
    { to: '/admin/gallery', icon: 'bi-collection', color: '#f59e0b', title: 'จัดการแกลลอรี่', desc: 'อัปเดตผลงาน' },
    { to: '/admin/blog', icon: 'bi-journal-text', color: '#8b5cf6', title: 'จัดการบทความ', desc: 'เขียนหรือแก้ไขบทความ' },
    { to: '/admin/settings', icon: 'bi-gear', color: '#64748b', title: 'ตั้งค่าเว็บไซต์', desc: 'เปลี่ยนโลโก้และชื่อเว็บ' },
  ];

  return (
    <div className="anim d1">
      <div className="mb-4 p-4 rounded-4 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'var(--navy)' }}>
        <h4 className="fw-bold m-0">ยินดีต้อนรับสู่ระบบจัดการ</h4>
        <p className="m-0 mt-1" style={{ opacity: 0.85 }}>จัดการเนื้อหาเว็บไซต์ได้จากที่นี่</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Stats List */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold m-0">ภาพรวมข้อมูล</h5>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {stats.map((s, i) => (
                  <div key={i} className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: 'var(--bg-light)', border: '1px solid var(--border)' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 42, height: 42, background: s.bg }}>
                        <i className={`bi ${s.icon}`} style={{ fontSize: '1.2rem', color: s.color }}></i>
                      </div>
                      <div className="fw-bold text-dark">{s.title}</div>
                    </div>
                    <div className="fw-bold fs-4" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links List */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold m-0">ลัดไปจัดการ (Quick Links)</h5>
            </div>
            <div className="card-body p-4">
              <div className="list-group list-group-flush gap-2">
                {quickLinks.map((q, i) => (
                  <Link 
                    key={i} 
                    to={q.to} 
                    className="list-group-item list-group-item-action d-flex align-items-center gap-4 p-3 rounded-3 border-0 transition-all hover-lift"
                    style={{ background: '#fff', border: '1px solid var(--border)' }}
                  >
                    <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: `${q.color}15` }}>
                      <i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: '1.3rem' }}></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="fw-bold text-dark mb-1">{q.title}</h6>
                      <small className="text-muted">{q.desc}</small>
                    </div>
                    <div className="text-muted">
                      <i className="bi bi-chevron-right"></i>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
