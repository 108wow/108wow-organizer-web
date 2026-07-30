import { useState, useEffect } from 'react';
import HeroSection from '../components/common/HeroSection';
import { clientAPI, pageHeroAPI } from '../api';
import useScrollReveal from '../hooks/useScrollReveal';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [hero, setHero] = useState({ title: '', subtitle: '', image: '' });
  const [loaded, setLoaded] = useState(false);

  useScrollReveal([loaded, clients]);

  useEffect(() => {
    Promise.all([clientAPI.list(), pageHeroAPI.list()])
      .then(([cli, heroes]) => {
        setClients(cli);
        setHero(heroes.clients || {});
        setLoaded(true);
      }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;

  const categories = [...new Set(clients.map(c => c.category))];

  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding overflow-hidden" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center reveal-up">
            <span className="section-label">Our Clients</span>
            <h2 className="section-title">ลูกค้าที่ไว้วางใจเรา</h2>
            <div className="underline mx-auto"></div>
          </div>
          {categories.map((cat, ci) => (
            <div key={cat} className={`mb-5 reveal-up delay-${(ci % 4) + 1}`}>
              <h5 className="fw-bold text-muted mb-3"><i className="bi bi-grid-3x3-gap-fill me-2"></i>{cat}</h5>
              <div className="row g-3">
                {clients.filter(c => c.category === cat).map(c => (
                  <div key={c.id} className="col-4 col-md-2">
                    <div className="card border-0 shadow-sm text-center py-3 h-100" style={{ borderRadius: 'var(--radius-md)' }}>
                      <img src={c.logo} alt={c.name} style={{ width: 40, height: 40, margin: '0 auto 8px', objectFit: 'contain' }} />
                      <small className="text-muted" style={{ fontSize: '.75rem' }}>{c.name}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
