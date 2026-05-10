import { useParams, Link } from 'react-router-dom';
import { blogPosts } from '../data/mockData';

export default function BlogPost() {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === parseInt(id));
  if (!post) return (<div style={{ paddingTop: 120, textAlign: 'center' }}><h2 style={{ color: 'var(--primary)' }}>ไม่พบบทความ</h2><Link to="/blog" className="btn btn-main mt-3">กลับหน้าบทความ</Link></div>);

  return (
    <>
      <section className="hero-section" style={{ minHeight: '36vh' }}><div className="hero-bg" style={{ backgroundImage: `url(${post.image})` }} /><div className="hero-overlay" /><div className="hero-content"><span style={{ background: 'var(--primary-soft)', color: 'var(--primary)', padding: '3px 12px', borderRadius: 'var(--radius)', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{post.tag}</span><h1 style={{ marginTop: 8 }}>{post.title}</h1><div className="d-flex justify-content-center gap-3 mt-2" style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem' }}><span><i className="bi bi-calendar3 me-1"></i>{post.date}</span><span><i className="bi bi-person me-1"></i>{post.author}</span></div></div></section>
      <section className="section-padding" style={{ background: 'var(--bg-white)' }}><div className="container"><div className="row justify-content-center"><div className="col-lg-8"><div className="card-white" style={{ padding: '2rem' }}><p style={{ lineHeight: 2 }}>{post.excerpt}</p><p style={{ lineHeight: 2, color: 'var(--text-muted)' }}>เนื้อหาฉบับเต็มจะแสดงเมื่อเชื่อมต่อกับ Backend API</p><hr style={{ borderColor: 'var(--border)', margin: '1.5rem 0' }} /><Link to="/blog" className="btn btn-outline"><i className="bi bi-arrow-left me-2"></i>กลับหน้าบทความ</Link></div></div></div></div></section>
    </>
  );
}
