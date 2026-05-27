import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI } from '../api';

function formatThaiDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    blogAPI.get(id).then(p => { setPost(p); setLoaded(true); }).catch(() => setLoaded(true));
  }, [id]);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner-border text-primary" /></div>;
  if (!post) return <div className="container py-5 text-center"><h3>ไม่พบบทความ</h3><Link to="/blog" className="btn btn-primary mt-3">กลับ</Link></div>;

  const showUpdated = post.updated_at && post.created_at && post.updated_at !== post.created_at;

  return (
    <article style={{ paddingTop: 120, paddingBottom: 100 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/blog" className="text-decoration-none text-muted mb-4 d-inline-block"><i className="bi bi-arrow-left me-2"></i>กลับ</Link>
        <img src={post.image} alt={post.title} className="img-fluid w-100 mb-4" style={{ borderRadius: 'var(--radius-lg)', aspectRatio: '16/9', objectFit: 'cover' }} />
        <span className="badge bg-primary rounded-pill px-3 py-2 mb-3">{post.tag}</span>
        <h1 className="fw-bold mb-3">{post.title}</h1>

        {/* Timestamps & Author Meta */}
        <div className="d-flex flex-wrap gap-3 align-items-center mb-4 pb-3" style={{ borderBottom: '1.5px solid #f1f5f9' }}>
          <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.88rem' }}>
            <i className="bi bi-calendar3" style={{ color: 'var(--primary)' }}></i>
            <span>สร้างเมื่อ: <strong style={{ color: '#1e293b' }}>{formatThaiDate(post.created_at)}</strong></span>
          </span>
          {showUpdated && (
            <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.88rem' }}>
              <i className="bi bi-pencil-square" style={{ color: '#f59e0b' }}></i>
              <span>แก้ไขล่าสุด: <strong style={{ color: '#1e293b' }}>{formatThaiDate(post.updated_at)}</strong></span>
            </span>
          )}
          <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.88rem' }}>
            <i className="bi bi-person-fill" style={{ color: 'var(--primary)' }}></i>
            <span>{post.author}</span>
          </span>
        </div>

        <p className="lead text-muted mb-4">{post.excerpt}</p>

        {/* Render HTML content (from Rich Text Editor) */}
        {post.content ? (
          <div
            className="blog-rich-content"
            style={{ lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <div style={{ lineHeight: 1.8 }}>{post.excerpt}</div>
        )}
      </div>
    </article>
  );
}
