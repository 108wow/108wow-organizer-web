import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * ConfirmModal — ยืนยันการกระทำก่อนดำเนินการ
 * Rendered via portal to document.body so it covers the ENTIRE viewport.
 */
export default function ConfirmModal({ show, onConfirm, onCancel, title = 'ยืนยันการดำเนินการ', message = 'คุณต้องการดำเนินการนี้หรือไม่?', type = 'warning', confirmText = 'ยืนยัน' }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (show) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [show]);

  if (!show) return null;

  const icons = {
    danger: { icon: 'bi-exclamation-triangle-fill', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    warning: { icon: 'bi-question-circle-fill', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    info: { icon: 'bi-info-circle-fill', color: 'var(--primary-dark)', bg: 'rgba(163,217,0,0.1)' },
  };
  const cfg = icons[type] || icons.warning;

  const modal = (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'adminFadeIn .2s ease'
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '2.5rem',
        maxWidth: '420px', width: '90%', textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        animation: 'adminScaleIn .25s ease'
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: cfg.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.2rem', fontSize: '1.8rem', color: cfg.color
        }}>
          <i className={`bi ${cfg.icon}`}></i>
        </div>
        <h5 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '.5rem', fontSize: '1.15rem' }}>{title}</h5>
        <p style={{ color: '#64748b', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1.8rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 28px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
              background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '.88rem',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
            onMouseOver={e => e.target.style.borderColor = '#94a3b8'}
            onMouseOut={e => e.target.style.borderColor = '#e2e8f0'}
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 28px', borderRadius: '12px', border: 'none',
              background: type === 'danger' ? '#ef4444' : 'var(--primary)',
              color: type === 'danger' ? '#fff' : 'var(--navy)', fontWeight: 700, fontSize: '.88rem',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: `0 4px 15px ${type === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(163,217,0,0.3)'}`
            }}
            onMouseOver={e => { e.target.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.target.style.transform = 'translateY(0)'; }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
