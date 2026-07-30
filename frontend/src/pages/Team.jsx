import { useState, useEffect } from 'react';
import HeroSection from '../components/common/HeroSection';
import { teamAPI, pageHeroAPI } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [loaded, setLoaded] = useState(false);

  useScrollReveal([loaded, teamMembers]);

  useEffect(() => {
    Promise.all([teamAPI.list(), pageHeroAPI.list()])
      .then(([team, heroes]) => {
        setTeamMembers(team);
        setHero(heroes.team || {});
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding overflow-hidden" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center reveal-up">
            <span className="section-label">Our Team</span>
            <h2 className="section-title">พบกับทีมของเรา</h2>
            <div className="underline mx-auto"></div>
            <p className="section-desc center mt-2">ทีมผู้เชี่ยวชาญที่มีประสบการณ์และความหลงใหลในเทคโนโลยี</p>
          </div>
          <div className="row g-4">
            {teamMembers.map((m, i) => (
              <div key={m.id} className={`col-md-6 col-lg-4 reveal-scale delay-${(i % 4) + 1}`}>
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
                      {m.facebook && <a href={m.facebook}><i className="bi bi-facebook"></i></a>}
                      {m.linkedin && <a href={m.linkedin}><i className="bi bi-linkedin"></i></a>}
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
