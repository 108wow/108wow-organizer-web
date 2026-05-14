import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../api';

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    blogAPI.get(id).then(p => { setPost(p); setLoaded(true); }).catch(() => setLoaded(true));
  }, [id]);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;
  if (!post) return <div className="container py-5 text-center"><h3>ไม่พบบทความ</h3><Link to="/blog" className="btn btn-primary mt-3">กลับ</Link></div>;

  return (
    <article style={{ paddingTop: 100 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/blog" className="text-decoration-none text-muted mb-4 d-inline-block"><i className="bi bi-arrow-left me-2"></i>กลับ</Link>
        <img src={post.image} alt={post.title} className="img-fluid w-100 mb-4" style={{ borderRadius: 'var(--radius-lg)', maxHeight: 400, objectFit: 'cover' }} />
        <span className="badge bg-primary rounded-pill px-3 py-2 mb-3">{post.tag}</span>
        <h1 className="fw-bold mb-3">{post.title}</h1>
        <div className="text-muted mb-4"><i className="bi bi-calendar3 me-2"></i>{post.date} &bull; <i className="bi bi-person ms-2 me-1"></i>{post.author}</div>
        <p className="lead text-muted mb-4">{post.excerpt}</p>
        <div style={{ lineHeight: 1.8 }}>{post.content || post.excerpt}</div>
      </div>
    </article>
  );
}
