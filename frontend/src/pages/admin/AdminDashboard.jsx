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
    { title: 'บริการทั้งหมด', value: counts.services, icon: 'bi-briefcase', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
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
      <div className="mb-4 p-4 rounded-4" style={{ background: 'linear-gradient(135deg, #3b82f6, #1e40af)', color: '#fff' }}>
        <h4 className="fw-bold m-0">ยินดีต้อนรับสู่ระบบจัดการ</h4>
        <p className="m-0 mt-1 opacity-75">จัดการเนื้อหาเว็บไซต์ได้จากที่นี่</p>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((s, i) => (
          <div key={i} className="col-md-6 col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body d-flex align-items-center gap-3 p-3">
                <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 50, height: 50, background: s.bg }}><i className={`bi ${s.icon}`} style={{ fontSize: '1.3rem', color: s.color }}></i></div>
                <div><h3 className="fw-bold m-0" style={{ color: s.color }}>{s.value}</h3><small className="text-muted">{s.title}</small></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h5 className="fw-bold mb-3">ลัดไปจัดการ</h5>
      <div className="row g-3">
        {quickLinks.map((q, i) => (
          <div key={i} className="col-md-4 col-lg">
            <Link to={q.to} className="card border-0 shadow-sm rounded-4 text-decoration-none h-100" style={{ transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
              <div className="card-body text-center p-3">
                <div className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2" style={{ width: 44, height: 44, background: `${q.color}15` }}><i className={`bi ${q.icon}`} style={{ color: q.color, fontSize: '1.2rem' }}></i></div>
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '.85rem' }}>{q.title}</h6>
                <small className="text-muted" style={{ fontSize: '.72rem' }}>{q.desc}</small>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
