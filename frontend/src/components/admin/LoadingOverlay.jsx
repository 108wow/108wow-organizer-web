import { createPortal } from 'react-dom';

/**
 * LoadingOverlay — Premium loading animation overlay
 * Rendered via portal to document.body so it covers the ENTIRE viewport.
 */
export default function LoadingOverlay({ show, message = 'กำลังดำเนินการ...' }) {
  if (!show) return null;

  const overlay = (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'adminFadeIn .2s ease'
    }}>
      {/* Orbit spinner */}
      <div className="admin-loader" style={{ marginBottom: '1.5rem' }}>
        <div className="orbit-ring"></div>
        <div className="orbit-ring orbit-ring-2"></div>
        <div className="orbit-dot"></div>
      </div>

      <p style={{
        color: '#fff', fontSize: '1rem', fontWeight: 600,
        letterSpacing: '.5px', textShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        {message}
      </p>
    </div>
  );

  return createPortal(overlay, document.body);
}
