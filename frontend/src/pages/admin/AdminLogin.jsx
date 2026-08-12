import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, companyAPI } from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

  const logoSrc = companyInfo.logoUrl || '/favicon.svg';

  return (
    <>
      <style>{`
        @keyframes loginFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes loginSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', 'Noto Sans Thai', sans-serif;
        }
        /* ── Left branded panel ── */
        .login-brand {
          flex: 1.1;
          background: linear-gradient(160deg, #0a0f1a 0%, #111827 40%, #0f172a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 40px;
        }
        .login-brand::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(163,217,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163,217,0,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .login-brand .orb {
          position: absolute; border-radius: 50%;
          filter: blur(60px); pointer-events: none;
        }
        .login-brand .orb-1 {
          width: 400px; height: 400px;
          background: rgba(163,217,0,0.12);
          top: -15%; left: -10%;
          animation: loginFloat 12s ease-in-out infinite;
        }
        .login-brand .orb-2 {
          width: 300px; height: 300px;
          background: rgba(139,92,246,0.1);
          bottom: -10%; right: -5%;
          animation: loginFloat 15s ease-in-out infinite reverse;
        }
        .login-brand .orb-3 {
          width: 200px; height: 200px;
          background: rgba(56,189,248,0.08);
          top: 50%; left: 60%;
          animation: loginFloat 10s ease-in-out infinite 2s;
        }
        .login-brand-content {
          position: relative; z-index: 1;
          text-align: center;
          animation: loginSlideUp 0.8s ease-out;
        }
        .login-brand-logo {
          max-height: 100px; max-width: 320px;
          object-fit: contain;
          filter: drop-shadow(0 4px 24px rgba(0,0,0,0.4));
          margin-bottom: 24px;
        }
        .login-brand-tagline {
          color: rgba(255,255,255,0.35);
          font-size: 0.85rem;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 8px;
        }
        .login-brand-divider {
          width: 48px; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, var(--primary), transparent);
          margin: 20px auto 0;
        }

        /* ── Right form panel ── */
        .login-form-panel {
          flex: 0.9;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          padding: 48px 40px;
          position: relative;
          overflow: hidden;
        }
        .login-form-panel::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 1px; height: 100%;
          background: linear-gradient(180deg, transparent, rgba(163,217,0,0.2), transparent);
        }
        .login-form-wrapper {
          width: 100%; max-width: 380px;
          animation: loginSlideUp 0.8s ease-out 0.2s both;
        }
        .login-form-header {
          margin-bottom: 36px;
        }
        .login-form-header h2 {
          color: #fff; font-size: 1.6rem; font-weight: 700;
          margin: 0 0 6px 0;
        }
        .login-form-header p {
          color: rgba(255,255,255,0.4); font-size: 0.85rem; margin: 0;
        }

        .login-field { margin-bottom: 22px; }
        .login-field label {
          display: block; color: rgba(255,255,255,0.5);
          font-size: 0.78rem; font-weight: 600;
          margin-bottom: 8px; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .login-input-wrap {
          position: relative;
          display: flex; align-items: center;
        }
        .login-input-wrap .icon-left {
          position: absolute; left: 16px;
          color: rgba(255,255,255,0.3);
          font-size: 1.1rem;
          transition: color 0.2s;
          pointer-events: none;
        }
        .login-input-wrap input {
          width: 100%;
          padding: 14px 44px 14px 46px;
          background: rgba(30,41,59,0.5);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff; font-size: 0.95rem;
          outline: none;
          transition: all 0.25s;
          box-sizing: border-box;
        }
        .login-input-wrap input:focus {
          border-color: rgba(163,217,0,0.5);
          background: rgba(30,41,59,0.8);
          box-shadow: 0 0 0 3px rgba(163,217,0,0.1);
        }
        .login-input-wrap input:focus + .icon-left,
        .login-input-wrap input:focus ~ .icon-left {
          color: var(--primary);
        }
        .toggle-pw {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none;
          color: rgba(255,255,255,0.4);
          cursor: pointer; font-size: 1.2rem;
          padding: 4px;
          transition: color 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .toggle-pw:hover { color: rgba(255,255,255,0.8); }

        .login-error {
          display: flex; align-items: center; gap: 8px;
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px;
          padding: 12px 16px; margin-bottom: 22px;
          color: #f87171; font-size: 0.85rem;
          animation: loginSlideUp 0.3s ease-out;
        }

        .login-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, var(--primary), var(--primary-hover));
          border: none; border-radius: 12px;
          color: var(--navy);
          font-size: 0.95rem; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 0.15s, box-shadow 0.25s;
          box-shadow: 0 4px 20px rgba(163,217,0,0.25);
          position: relative; overflow: hidden;
          margin-top: 10px;
        }
        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(163,217,0,0.35);
        }
        .login-btn:active { transform: translateY(0); }
        .login-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: loginShimmer 2.5s ease-in-out infinite;
        }
        .login-btn:disabled {
          opacity: 0.6; cursor: wait;
          transform: none !important;
        }

        .login-footer {
          text-align: center; margin-top: 32px;
          color: rgba(255,255,255,0.2);
          font-size: 0.75rem;
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .login-page { flex-direction: column; }
          .login-brand {
            flex: none; min-height: 220px;
            padding: 40px 20px;
            justify-content: flex-end;
          }
          .login-brand-logo { max-height: 70px; margin-bottom: 16px; }
          .login-brand-tagline { font-size: 0.75rem; letter-spacing: 2px; }
          .login-form-panel {
            flex: 1; padding: 40px 24px;
            justify-content: flex-start;
          }
          .login-form-panel::before { display: none; }
          .login-form-header h2 { font-size: 1.4rem; }
          .login-form-wrapper { max-width: 100%; }
        }
      `}</style>

      <div className="login-page">
        {/* ── Left brand panel ── */}
        <div className="login-brand">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />

          <div className="login-brand-content">
            <img src={logoSrc} alt="Logo" className="login-brand-logo" />
            <div className="login-brand-tagline">Admin Management System</div>
            <div className="login-brand-divider" />
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div className="login-form-panel">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h2>เข้าสู่ระบบ</h2>
              <p>กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบจัดการ</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="login-error">
                  <i className="bi bi-exclamation-circle-fill" />
                  {error}
                </div>
              )}

              <div className="login-field">
                <label>ชื่อผู้ใช้</label>
                <div className="login-input-wrap">
                  <i className="bi bi-person icon-left" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label>รหัสผ่าน</label>
                <div className="login-input-wrap">
                  <i className="bi bi-lock icon-left" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(v => !v)}
                    tabIndex={-1}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-lock" />
                    เข้าสู่ระบบ
                  </>
                )}
              </button>
            </form>

            <div className="login-footer">
              © {new Date().getFullYear()} {companyInfo.name || 'Admin'} — Admin Panel
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
