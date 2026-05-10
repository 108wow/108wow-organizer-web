export default function HeroSection({ title, subtitle, image }) {
  return (
    <section className="hero-section">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'})` }}
      />
      <div className="hero-overlay" />
      <div className="hero-content animate-fadeInUp">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </section>
  );
}
