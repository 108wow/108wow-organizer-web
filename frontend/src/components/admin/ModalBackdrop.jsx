import { createPortal } from 'react-dom';

/**
 * ModalBackdrop — Wraps modal content and renders via portal to document.body
 * This ensures the modal covers the ENTIRE viewport, not just the parent container.
 */
export default function ModalBackdrop({ show, onClose, children }) {
  if (!show) return null;

  const modal = (
    <div
      onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 99998,
        background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'adminFadeIn .2s ease'
      }}
    >
      <div
        className="admin-modal-form"
        style={{
          background: '#fff', borderRadius: '20px', padding: '2rem',
          maxWidth: '600px', width: '95%',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          animation: 'adminScaleIn .25s ease'
        }}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
