import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * StatusModal — แสดงผลลัพธ์ สำเร็จ / ผิดพลาด
 * Rendered via portal to document.body so it covers the ENTIRE viewport.
 */
export default function StatusModal({ show, onClose, status = 'success', message = '' }) {
  const backdropRef = useRef(null);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => onClose(), 2500);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = status === 'success';

  const modal = (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100001,
        background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'adminFadeIn .2s ease'
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '2.5rem',
        maxWidth: '380px', width: '90%', textAlign: 'center',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
        animation: 'adminScaleIn .25s ease'
      }}>
        {/* Animated icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.2rem',
          animation: 'adminBounceIn .4s ease'
        }}>
          <i
            className={`bi ${isSuccess ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}
            style={{ fontSize: '2.5rem', color: isSuccess ? '#10b981' : '#ef4444' }}
          ></i>
        </div>

        <h5 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '.5rem', fontSize: '1.15rem' }}>
          {isSuccess ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
        </h5>
        <p style={{ color: '#64748b', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {message || (isSuccess ? 'ดำเนินการเรียบร้อยแล้ว' : 'กรุณาลองใหม่อีกครั้ง')}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 36px', borderRadius: '12px', border: 'none',
            background: isSuccess ? '#10b981' : '#ef4444',
            color: '#fff', fontWeight: 700, fontSize: '.88rem',
            cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: `0 4px 15px ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
          }}
        >
          ตกลง
        </button>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
