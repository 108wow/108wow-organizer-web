import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { uploadImage } from '../../api';

/**
 * ImageUploader — Upload + URL + Crop
 * @param {string} value — current image URL or data URI
 * @param {function} onChange — (newUrl) => void
 * @param {string} label — field label
 * @param {number} aspectRatio — crop aspect ratio (default 16/9)
 * @param {boolean} circle — if true, shows circular crop area
 * @param {boolean} lockAspect — if true, hides ratio selector buttons
 * @param {string} recommendedSize — hint text for recommended image dimensions
 */
export default function ImageUploader({ value = '', onChange, label = 'รูปภาพ', aspectRatio = 16 / 9, circle = false, lockAspect = false, recommendedSize = '' }) {
  const [mode, setMode] = useState('url'); // 'url' or 'upload'
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [currentAspect, setCurrentAspect] = useState(aspectRatio);
  const [croppedArea, setCroppedArea] = useState(null);
  const fileRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset so the same file can be selected again
  };

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const applyCrop = useCallback(async () => {
    if (!cropSrc || !croppedArea) return;
    try {
      // getCroppedImg now returns a Blob
      const croppedBlob = await getCroppedImg(cropSrc, croppedArea);
      // Upload blob to server to get real URL
      const res = await uploadImage(croppedBlob);
      onChange(res.url); // Use real uploaded URL
      setCropSrc(null);
    } catch (err) {
      console.error('Upload failed:', err);
      // Fallback
      onChange(cropSrc);
      setCropSrc(null);
    }
  }, [cropSrc, croppedArea, onChange]);

  const cancelCrop = () => { setCropSrc(null); if (fileRef.current) fileRef.current.value = ''; };

  const previewStyle = circle ? {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    border: '3px solid #fff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  } : {
    width: '100%',
    aspectRatio: currentAspect || aspectRatio || 16/9,
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    border: '1.5px solid #e2e8f0',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    background: '#f8fafc',
  };

  return (
    <div className="admin-form-group">
      <style>{`
        .premium-uploader-preview {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          transition: opacity 0.25s ease;
          border-radius: inherit;
        }
        .premium-uploader-preview:hover .preview-overlay {
          opacity: 1;
        }
        .upload-dropzone {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .upload-dropzone:hover {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.02);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.05);
        }
        .upload-dropzone i {
          font-size: 2rem;
          color: #94a3b8;
          transition: all 0.25s ease;
        }
        .upload-dropzone:hover i {
          color: #3b82f6;
          transform: translateY(-3px);
        }
      `}</style>

      {label && <label className="fw-bold mb-2 text-dark" style={{ fontSize: '0.85rem' }}>{label}</label>}

      {value && !isEditing ? (
        /* Sleek Preview Card */
        <div className="premium-uploader-preview" style={previewStyle}>
          <img
            src={value}
            alt="preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={e => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="preview-overlay">
            <button
              type="button"
              onClick={() => {
                if (mode === 'upload') {
                  fileRef.current?.click();
                } else {
                  setIsEditing(true);
                }
              }}
              className="btn btn-light btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
              style={{ fontSize: '0.78rem', transition: 'all 0.2s' }}
            >
              <i className="bi bi-pencil-fill"></i> เปลี่ยนรูป
            </button>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsEditing(false);
              }}
              className="btn btn-danger btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, transition: 'all 0.2s' }}
              title="ลบรูป"
            >
              <i className="bi bi-trash-fill fs-6"></i>
            </button>
          </div>
          {/* File input for quick change */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        /* Mode selector & Inputs when empty or editing */
        <div className="d-flex flex-column gap-2">
          {/* Mode toggle */}
          <div className="d-flex gap-1 align-items-center justify-content-between">
            <div className="d-flex gap-1">
              <button
                type="button"
                onClick={() => setMode('url')}
                style={{
                  padding: '4px 14px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: mode === 'url' ? 'var(--primary)' : '#e2e8f0',
                  background: mode === 'url' ? 'rgba(163,217,0,0.08)' : '#fff',
                  color: mode === 'url' ? 'var(--primary-dark)' : '#94a3b8',
                  fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                }}
              >
                <i className="bi bi-link-45deg me-1"></i>URL
              </button>
              <button
                type="button"
                onClick={() => setMode('upload')}
                style={{
                  padding: '4px 14px', borderRadius: '8px', border: '1.5px solid',
                  borderColor: mode === 'upload' ? 'var(--primary)' : '#e2e8f0',
                  background: mode === 'upload' ? 'rgba(163,217,0,0.08)' : '#fff',
                  color: mode === 'upload' ? 'var(--primary-dark)' : '#94a3b8',
                  fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                }}
              >
                <i className="bi bi-cloud-arrow-up me-1"></i>อัปโหลด
              </button>
            </div>
            
            {value && isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-link btn-sm text-secondary p-0 fw-bold text-decoration-none"
                style={{ fontSize: '0.75rem' }}
              >
                ยกเลิก
              </button>
            )}
          </div>

          {/* URL mode */}
          {mode === 'url' && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="form-control"
              style={{
                borderRadius: '12px',
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                fontSize: '.88rem'
              }}
            />
          )}

          {/* Upload mode */}
          {mode === 'upload' && (
            <div className="upload-dropzone" onClick={() => fileRef.current?.click()}>
              <i className="bi bi-cloud-arrow-up-fill"></i>
              <div className="text-dark fw-bold" style={{ fontSize: '.8rem' }}>คลิกเพื่อเลือกรูปภาพ</div>
              <div className="text-muted" style={{ fontSize: '.68rem' }}>JPG, PNG, WebP (สูงสุด 5MB)</div>
              {recommendedSize && <div className="text-primary mt-1" style={{ fontSize: '.75rem', fontWeight: 600 }}>{recommendedSize}</div>}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Crop Modal */}
      {cropSrc && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 10002,
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          animation: 'adminFadeIn .2s ease'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px', overflow: 'hidden',
            width: '90%', maxWidth: '550px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            animation: 'adminScaleIn .25s ease'
          }}>
            <div className="bg-light border-bottom p-3 d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold">ปรับแต่งรูปภาพ</h6>
              {recommendedSize && <span className="badge bg-primary text-white">{recommendedSize}</span>}
            </div>
            {/* Crop area */}
            <div style={{ position: 'relative', width: '100%', height: 350, background: '#1e293b' }}>
                <Cropper
                  image={cropSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={currentAspect}
                  cropShape={circle ? 'round' : 'rect'}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  minZoom={0.1}
                  restrictPosition={false}
                />
            </div>

            {/* Controls */}
            <div className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-zoom-out text-muted"></i>
                <input
                  type="range"
                  min={0.1} max={3} step={0.05}
                  value={zoom}
                  onChange={e => setZoom(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#3b82f6' }}
                />
                <i className="bi bi-zoom-in text-muted"></i>
              </div>
              
              {!circle && !lockAspect && (
                <div className="d-flex flex-wrap gap-2 mb-3 justify-content-center">
                  <span className="text-muted small align-self-center me-2">สัดส่วน:</span>
                  {[
                    { label: 'ค่าเริ่มต้น', value: aspectRatio },
                    { label: '16:9', value: 16/9 },
                    { label: '4:3', value: 4/3 },
                    { label: '1:1', value: 1 },
                    { label: '3:1', value: 3 },
                    { label: '5:4', value: 5/4 }
                  ].map(ratio => (
                    <button
                      key={ratio.label}
                      type="button"
                      onClick={() => setCurrentAspect(ratio.value)}
                      className={`btn btn-sm ${currentAspect === ratio.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{ fontSize: '0.75rem', borderRadius: '8px' }}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  onClick={cancelCrop}
                  style={{
                    padding: '8px 24px', borderRadius: '12px', border: '1.5px solid #e2e8f0',
                    background: '#fff', color: '#64748b', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  style={{
                    padding: '8px 24px', borderRadius: '12px', border: 'none',
                    background: 'var(--primary)', color: 'var(--navy)', fontWeight: 700, fontSize: '.85rem',
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(163,217,0,0.3)'
                  }}
                >
                  <i className="bi bi-check-lg me-1"></i>ตัดภาพ & ใช้งาน
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// Helper: create cropped image from canvas
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Output canvas matches the desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Fill canvas with white background (for areas outside the image when zoomed out)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // When zoomed out (zoom < 1), crop coordinates can be negative
  // or extend beyond the image. We need to calculate the overlap.
  const sx = Math.max(0, pixelCrop.x);
  const sy = Math.max(0, pixelCrop.y);
  const sx2 = Math.min(image.naturalWidth, pixelCrop.x + pixelCrop.width);
  const sy2 = Math.min(image.naturalHeight, pixelCrop.y + pixelCrop.height);
  const sw = sx2 - sx;
  const sh = sy2 - sy;

  // Where on the canvas to place the image slice
  const dx = sx - pixelCrop.x;
  const dy = sy - pixelCrop.y;

  if (sw > 0 && sh > 0) {
    ctx.drawImage(image, sx, sy, sw, sh, dx, dy, sw, sh);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas is empty')); return; }
      resolve(blob);
    }, 'image/png');
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
