import HeroSection from '../components/common/HeroSection';
import { teamMembers, pageHeroes } from '../data/mockData';

export default function Team() {
  const hero = pageHeroes.team;
  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-label">Our Team</span>
            <h2 className="section-title">พบกับทีมของเรา</h2>
            <div className="underline mx-auto"></div>
            <p className="section-desc center mt-2">ทีมผู้เชี่ยวชาญที่มีประสบการณ์และความหลงใหลในเทคโนโลยี</p>
          </div>
          <div className="row g-4">
            {teamMembers.map((m, i) => (
              <div key={m.id} className={`col-md-6 col-lg-4 anim d${(i % 6) + 1}`}>
                <div className="team-card-premium">
                  <div className="tc-img-wrap">
                    <img src={m.photo} alt={m.name} />
                  </div>
                  <div className="tc-content">
                    <h5 className="tc-name">{m.name}</h5>
                    <div className="tc-role">{m.position}</div>
                    <div className="tc-divider"></div>
                    <p className="tc-bio">{m.bio}</p>
                    <div className="tc-socials">
                      <a href="#"><i className="bi bi-facebook"></i></a>
                      <a href="#"><i className="bi bi-linkedin"></i></a>
                      <a href="#"><i className="bi bi-twitter-x"></i></a>
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
