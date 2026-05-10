import { Link } from 'react-router-dom';
import HeroSection from '../components/common/HeroSection';
import { blogPosts, pageHeroes } from '../data/mockData';

export default function Blog() {
  const hero = pageHeroes.blog;
  return (
    <>
      <HeroSection title={hero.title} subtitle={hero.subtitle} image={hero.image} />
      <section className="section-padding" style={{ background: 'var(--bg-white)' }}>
        <div className="container">
          <div className="section-header text-center"><span className="section-label">Blog</span><h2 className="section-title">บทความล่าสุด</h2><div className="underline mx-auto"></div></div>
          <div className="row g-4">{blogPosts.map((post, i) => (
            <div key={post.id} className={`col-md-6 col-lg-4 anim d${i + 1}`}><Link to={`/blog/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}><div className="blog-card h-100"><div className="b-img"><img src={post.image} alt={post.title} /></div><div className="b-body"><span className="b-tag">{post.tag}</span><h5>{post.title}</h5><p>{post.excerpt.substring(0, 80)}...</p></div><div className="b-meta"><span><i className="bi bi-calendar3 me-1"></i>{post.date}</span><span><i className="bi bi-person me-1"></i>{post.author}</span></div></div></Link></div>
          ))}</div>
        </div>
      </section>
    </>
  );
}
