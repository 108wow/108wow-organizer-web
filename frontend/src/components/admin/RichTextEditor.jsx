import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { uploadImage, getMediaUrl } from '../../api';

/**
 * RichTextEditor — WYSIWYG editor with image upload support
 * @param {string} value — HTML content
 * @param {function} onChange — (html) => void
 * @param {string} placeholder — placeholder text
 * @param {number} minHeight — minimum editor height in px
 */
export default function RichTextEditor({ value = '', onChange, placeholder = 'เขียนเนื้อหาบทความ...', minHeight = 300, stickyTop = 0 }) {
  const quillRef = useRef(null);
  const sentinelRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Detect when toolbar becomes sticky to add shadow
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const toolbar = sentinel.parentElement?.querySelector('.ql-toolbar');
        if (toolbar) {
          toolbar.classList.toggle('is-stuck', !entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: '0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Custom image handler: upload to server instead of base64
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const res = await uploadImage(file);
        const url = getMediaUrl(res.url);
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่');
      } finally {
        setUploading(false);
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['blockquote'],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
    clipboard: {
      matchVisual: false,
    },
  }), [imageHandler]);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list',
    'align',
    'blockquote',
    'link', 'image',
  ], []);

  return (
    <div className="rich-text-editor-wrapper" style={{ position: 'relative' }}>
      {/* Sentinel element to detect when toolbar becomes sticky */}
      <div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />
      <style>{`
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border: 1.5px solid #e2e8f0;
          border-bottom: none;
          border-radius: 14px 14px 0 0;
          background: rgba(248, 250, 252, 0.97);
          backdrop-filter: blur(10px);
          padding: 8px 12px;
          position: sticky;
          top: ${stickyTop}px;
          z-index: 20;
          transition: box-shadow 0.3s ease;
        }
        .rich-text-editor-wrapper .ql-toolbar.ql-snow.is-stuck {
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border-radius: 0;
        }
        .rich-text-editor-wrapper .ql-container.ql-snow {
          border: 1.5px solid #e2e8f0;
          border-radius: 0 0 14px 14px;
          font-size: 0.95rem;
          font-family: inherit;
          min-height: ${minHeight}px;
          background: #fff;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight - 20}px;
          line-height: 1.8;
          padding: 16px 20px;
        }
        .rich-text-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 16px 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          display: block;
        }
        .rich-text-editor-wrapper .ql-editor p {
          margin-bottom: 0.8em;
        }
        .rich-text-editor-wrapper .ql-editor h1,
        .rich-text-editor-wrapper .ql-editor h2,
        .rich-text-editor-wrapper .ql-editor h3 {
          margin-top: 1.2em;
          margin-bottom: 0.6em;
          font-weight: 700;
          color: #1e293b;
        }
        .rich-text-editor-wrapper .ql-editor blockquote {
          border-left: 4px solid var(--primary, #a3d900);
          padding-left: 16px;
          margin: 16px 0;
          color: #64748b;
          font-style: italic;
        }
        .rich-text-editor-wrapper .ql-snow .ql-tooltip {
          border-radius: 10px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.12);
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-formats button:hover,
        .rich-text-editor-wrapper .ql-toolbar .ql-formats button.ql-active {
          color: var(--primary-dark, #6b8e00) !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-formats button:hover .ql-stroke,
        .rich-text-editor-wrapper .ql-toolbar .ql-formats button.ql-active .ql-stroke {
          stroke: var(--primary-dark, #6b8e00) !important;
        }
        .rich-text-editor-wrapper .ql-toolbar .ql-formats button:hover .ql-fill,
        .rich-text-editor-wrapper .ql-toolbar .ql-formats button.ql-active .ql-fill {
          fill: var(--primary-dark, #6b8e00) !important;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
        .rte-upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(3px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          border-radius: 14px;
          animation: adminFadeIn 0.2s ease;
        }
      `}</style>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      {uploading && (
        <div className="rte-upload-overlay">
          <div className="text-center">
            <div className="spinner-border text-primary mb-2" role="status" style={{ width: 32, height: 32 }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>กำลังอัปโหลดรูปภาพ...</div>
          </div>
        </div>
      )}
    </div>
  );
}
