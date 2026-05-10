import { useMemo } from 'react';
import HeroSection from '../components/common/HeroSection';
import { clients, pageHeroes } from '../data/mockData';

export default function Clients() {
  const hero = pageHeroes.clients;

  // Group clients by category
  const grouped = useMemo(() => {
    const map = {};
    clients.forEach(c => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    return Object.entries(map); // [[category, items], ...]
  }, []);

  const testimonials = [
    { text: 'ทีมงานมืออาชีพมาก ส่งงานตรงเวลาและคุณภาพเกินคาด ประทับใจในการสื่อสารและการดูแลหลังส่งมอบงาน', name: 'คุณวิชัย ธนกิจ', co: 'TechCorp', role: 'CEO', photo: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { text: 'ระบบที่พัฒนาให้ช่วยลดต้นทุนได้กว่า 40% ทำให้ธุรกิจเราเติบโตอย่างก้าวกระโดด คุ้มค่าการลงทุนอย่างมาก', name: 'คุณสุรีย์ พาณิชย์', co: 'InnovateLab', role: 'CTO', photo: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { text: 'ดีไซน์สวย ใช้งานง่าย ลูกค้าเรา feedback ดีมากจนต้องกลับมาใช้บริการอีกรอบ แนะนำเลยครับ', name: 'คุณณัฐ สร้างสรรค์', co: 'FutureNet', role: 'Marketing Director', photo: 'https://randomuser.me/api/portraits/men/22.jpg' },
  ];

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      
      {/* Client Logos — Grouped by Category */}
      <section className="section-padding" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Partners</span>
            <h2 className="section-title">OUR BELOVED CUSTOMERS</h2>
            <div className="underline mx-auto"></div>
          </div>

          {grouped.map(([category, items], gi) => (
            <div key={category} className={`client-group ${gi > 0 ? 'mt-5' : 'mt-4'}`}>
              <h4 className="client-group-title">{category}</h4>
              <div className="client-circle-grid">
                {items.map(c => (
                  <div key={c.id} className="client-circle-item">
                    <div className="client-circle">
                      <img src={c.logo} alt={c.name} />
                    </div>
                    <span className="client-circle-name">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding" style={{ background: 'var(--bg-section)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Testimonials</span>
            <h2 className="section-title">เสียงจากลูกค้า</h2>
            <div className="underline mx-auto"></div>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className={`col-md-4 anim d${i + 1}`}>
                <div className="testimonial-card h-100">
                  <div className="tc-quote">
                    <i className="bi bi-quote"></i>
                  </div>
                  <p className="tc-text">"{t.text}"</p>
                  <div className="tc-author">
                    <img src={t.photo} alt={t.name} className="tc-avatar" />
                    <div>
                      <strong>{t.name}</strong>
                      <small>{t.role} — {t.co}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
