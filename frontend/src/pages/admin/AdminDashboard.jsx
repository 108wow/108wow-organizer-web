import { Link } from 'react-router-dom';
import { services, galleryItems, blogPosts, teamMembers, clients } from '../../data/mockData';

export default function AdminDashboard() {
  const stats = [
    { title: 'บริการทั้งหมด', value: services.length, icon: 'bi-briefcase', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { title: 'ผลงาน Gallery', value: galleryItems.length, icon: 'bi-collection', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { title: 'บทความ Blog', value: blogPosts.length, icon: 'bi-journal-text', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { title: 'ทีมงาน', value: teamMembers.length, icon: 'bi-people', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  ];

  const activities = [
    { icon: 'bi-pencil-square', text: 'แก้ไขบริการ "Web Development"', time: '2 นาทีที่แล้ว', color: '#3b82f6' },
    { icon: 'bi-plus-circle', text: 'เพิ่มบทความ "เทรนด์ AI 2026"', time: '1 ชั่วโมงที่แล้ว', color: '#10b981' },
    { icon: 'bi-trash', text: 'ลบรูปภาพใน Gallery', time: '3 ชั่วโมงที่แล้ว', color: '#ef4444' },
    { icon: 'bi-person-plus', text: 'เพิ่มทีมงาน "คุณวิชัย"', time: 'เมื่อวาน', color: '#8b5cf6' },
    { icon: 'bi-images', text: 'อัปเดต Hero Banner หน้าแรก', time: '2 วันที่แล้ว', color: '#f59e0b' },
  ];

  const quickLinks = [
    { to: '/admin/hero', icon: 'bi-image', color: '#3b82f6', title: 'อัปเดตแบนเนอร์หน้าแรก', desc: 'แก้ไขข้อความและรูปภาพฮีโร่' },
    { to: '/admin/services', icon: 'bi-briefcase', color: '#10b981', title: 'จัดการบริการ', desc: 'เพิ่มหรือแก้ไขบริการ' },
    { to: '/admin/gallery', icon: 'bi-collection', color: '#f59e0b', title: 'จัดการแกลลอรี่', desc: 'อัปเดตผลงานและ Google Photos' },
    { to: '/admin/blog', icon: 'bi-journal-text', color: '#8b5cf6', title: 'จัดการบทความ', desc: 'เขียนหรือแก้ไขบทความ' },
    { to: '/admin/settings', icon: 'bi-gear', color: '#64748b', title: 'ตั้งค่าเว็บไซต์', desc: 'เปลี่ยนโลโก้และชื่อเว็บ' },
  ];

  return (
    <div className="anim d1">
      {/* Welcome Banner */}
      <div className="card border-0 rounded-4 overflow-hidden mb-5 shadow-sm position-relative" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div className="position-absolute top-0 end-0 p-4 opacity-25"><i className="bi bi-bar-chart-steps text-white" style={{ fontSize: '10rem', transform: 'rotate(-15deg)', marginTop: '-40px', marginRight: '-20px', display: 'block' }}></i></div>
        <div className="card-body p-5 position-relative" style={{ zIndex: 1 }}>
          <span className="badge bg-primary bg-opacity-25 text-primary rounded-pill px-3 py-2 mb-3 border border-primary border-opacity-25">Overview</span>
          <h2 className="fw-bold text-white mb-2">ยินดีต้อนรับกลับมา, Admin! 👋</h2>
          <p className="text-white text-opacity-75 mb-0" style={{ fontSize: '1.1rem' }}>นี่คือภาพรวมระบบจัดการเนื้อหาเว็บไซต์ของคุณ</p>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-5">
        {stats.map((stat, i) => (
          <div className="col-md-3" key={i}>
            <div className="card border-0 shadow-sm rounded-4 h-100" style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48, background: stat.bg, color: stat.color }}><i className={`bi ${stat.icon} fs-4`}></i></div>
                </div>
                <h6 className="text-muted mb-1 fw-bold" style={{ fontSize: '0.9rem' }}>{stat.title}</h6>
                <h2 className="m-0 fw-bold" style={{ color: '#1e293b' }}>{stat.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Quick Actions */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4"><h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>จัดการเนื้อหาด่วน</h5></div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {quickLinks.map((link, i) => (
                  <Link to={link.to} key={i} className="btn btn-light d-flex align-items-center justify-content-between text-start p-3 rounded-4 border" style={{ transition: 'all 0.2s' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-white shadow-sm rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}><i className={`bi ${link.icon} fs-5`} style={{ color: link.color }}></i></div>
                      <div><h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '.9rem' }}>{link.title}</h6><small className="text-muted">{link.desc}</small></div>
                    </div>
                    <i className="bi bi-chevron-right text-muted"></i>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-bottom-0 pt-4 pb-2 px-4"><h5 className="fw-bold m-0" style={{ color: '#1e293b' }}>กิจกรรมล่าสุด</h5></div>
            <div className="card-body p-4">
              <div className="d-flex flex-column gap-3">
                {activities.map((act, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 pb-3" style={{ borderBottom: i < activities.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36, background: act.color + '15', color: act.color, flexShrink: 0 }}>
                      <i className={`bi ${act.icon}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="text-dark" style={{ fontSize: '.88rem' }}>{act.text}</div>
                      <div className="text-muted" style={{ fontSize: '.75rem' }}>{act.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
