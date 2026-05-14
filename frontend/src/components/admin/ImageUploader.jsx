import { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { uploadImage } from '../../api';

/**
 * ImageUploader — Upload + URL + Crop
 * @param {string} value — current image URL or data URI
 * @param {function} onChange — (newUrl) => void
 * @param {string} label — field label
 * @param {number} aspectRatio — crop aspect ratio (default 16/9)
 * @param {boolean} circle — if true, shows circular crop area
 */
export default function ImageUploader({ value = '', onChange, label = 'รูปภาพ', aspectRatio = 16 / 9, circle = false, recommendedSize = '' }) {
  const [mode, setMode] = useState('url'); // 'url' or 'upload'
  const [cropSrc, setCropSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [currentAspect, setCurrentAspect] = useState(aspectRatio);
  const [croppedArea, setCroppedArea] = useState(null);
  const fileRef = useRef(null);

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
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

  return (
    <div className="admin-form-group">
      <label>{label}</label>

      {/* Mode toggle */}
      <div className="d-flex gap-1 mb-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          style={{
            padding: '4px 14px', borderRadius: '8px', border: '1.5px solid',
            borderColor: mode === 'url' ? '#3b82f6' : '#e2e8f0',
            background: mode === 'url' ? 'rgba(59,130,246,0.08)' : '#fff',
            color: mode === 'url' ? '#3b82f6' : '#94a3b8',
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
            borderColor: mode === 'upload' ? '#3b82f6' : '#e2e8f0',
            background: mode === 'upload' ? 'rgba(59,130,246,0.08)' : '#fff',
            color: mode === 'upload' ? '#3b82f6' : '#94a3b8',
            fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
          }}
        >
          <i className="bi bi-cloud-arrow-up me-1"></i>อัปโหลด
        </button>
      </div>

      {/* URL mode */}
      {mode === 'url' && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '1.2rem',
            textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
            background: '#f8fafc'
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59,130,246,0.03)'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
        >
          <i className="bi bi-cloud-arrow-up-fill" style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
          <div className="text-muted mt-1" style={{ fontSize: '.78rem' }}>คลิกเพื่อเลือกรูปภาพ</div>
          <div className="text-muted" style={{ fontSize: '.65rem' }}>JPG, PNG, WebP (สูงสุด 5MB)</div>
          {recommendedSize && <div className="text-primary mt-2" style={{ fontSize: '.75rem', fontWeight: 600 }}>{recommendedSize}</div>}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {/* Preview */}
      {value && !cropSrc && (
        <div className="mt-2 position-relative" style={{ display: 'inline-block' }}>
          <img
            src={value}
            alt="preview"
            className="img-preview"
            style={circle ? { width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' } : {}}
            onError={e => e.target.style.display = 'none'}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 4, right: 4,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: '.65rem'
            }}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Crop Modal */}
      {cropSrc && (
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
              
              {!circle && (
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
                    background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: '.85rem',
                    cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.3)'
                  }}
                >
                  <i className="bi bi-check-lg me-1"></i>ตัดภาพ & ใช้งาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper: create cropped image from canvas
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );
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
