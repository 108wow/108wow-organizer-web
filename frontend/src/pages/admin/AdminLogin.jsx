import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, companyAPI } from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});

  useEffect(() => {
    companyAPI.get().then(setCompanyInfo).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      fontFamily: "'Inter', 'Noto Sans Thai', sans-serif",
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(163,217,0,0.15), transparent 70%)',
          top: '-10%', left: '-5%', animation: 'float 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%)',
          bottom: '-5%', right: '-5%', animation: 'float 10s ease-in-out infinite reverse',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420, padding: '0 20px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 8px 32px rgba(163,217,0,0.3)',
          }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--navy)' }}>{companyInfo.name ? companyInfo.name.charAt(0).toUpperCase() : 'A'}</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>{companyInfo.name || 'Admin Panel'}</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: 4 }}>Admin Panel — เข้าสู่ระบบ</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30,41,59,0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '36px 32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12, padding: '12px 16px', marginBottom: 20,
                color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="bi bi-exclamation-circle-fill" />
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, letterSpacing: '0.5px' }}>
                ชื่อผู้ใช้
              </label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem' }} />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                  placeholder="admin"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(163,217,0,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, letterSpacing: '0.5px' }}>
                รหัสผ่าน
              </label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem' }} />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px',
                    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, color: '#fff', fontSize: '0.95rem',
                    outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(163,217,0,0.5)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? 'rgba(163,217,0,0.5)' : 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                border: 'none', borderRadius: 12, color: 'var(--navy)',
                fontSize: '0.95rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(163,217,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" />
                  เข้าสู่ระบบ
                </>
              )}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: 24 }}>
          © 2026 {companyInfo.name || 'Admin'} — Admin Panel
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
      `}</style>
    </div>
  );
}
