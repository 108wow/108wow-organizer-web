import { useState, useCallback, useEffect } from 'react';
import { companyAPI, aboutConfigAPI } from '../../api';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ImageUploader from '../../components/admin/ImageUploader';

const iconOptions = [
  'bi-calendar-event', 'bi-music-note-beamed', 'bi-camera-reels', 'bi-people',
  'bi-cup-hot', 'bi-mic', 'bi-gift', 'bi-stars', 'bi-trophy', 'bi-balloon', 
  'bi-shop', 'bi-megaphone', 'bi-display', 'bi-geo-alt', 'bi-ticket-perforated', 
  'bi-chat-quote', 'bi-magic', 'bi-palette', 'bi-heart-fill', 'bi-star-fill', 
  'bi-lightbulb', 'bi-lightning-charge'
];

export default function AdminAbout() {
  const [info, setInfo] = useState({});
  const [stats, setStats] = useState([]);
  const [aboutConfig, setAboutConfig] = useState({
    videoThumbnail: '',
    videoUrl: '',
    coreValues: [],
    teamImages: [],
    banners: [],
    timeline: []
  });

  useEffect(() => {
    companyAPI.get().then(d => setInfo(d)).catch(() => {});
    companyAPI.listStats().then(d => setStats(d)).catch(() => {});
    aboutConfigAPI.get().then(d => setAboutConfig({
      videoThumbnail: d.videoThumbnail || '',
      videoUrl: d.videoUrl || '',
      coreValues: d.coreValues || [],
      teamImages: d.teamImages || [],
      banners: d.banners || [],
      timeline: d.timeline || []
    })).catch(() => {});
  }, []);

  const [editStatId, setEditStatId] = useState(null);
  const [statForm, setStatForm] = useState({ label: '', value: '' });
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });
  const [collapsed, setCollapsed] = useState({
    text: false,
    video: false,
    values: false,
    team: false,
    banners: false,
    timeline: false,
    stats: false
  });
  const toggleSection = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  const exec = useCallback(async (action) => { 
    setConfirm(p=>({...p,show:false})); 
    setLoading(true); 
    try { 
      await action(); 
      setLoading(false); 
      setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' }); 
    } catch(e) { 
      setLoading(false); 
      setStatusM({ show: true, status: 'error', message: e.message }); 
    } 
  }, []);

  const handleInfoChange = (e) => { setInfo(p => ({ ...p, [e.target.name]: e.target.value })); };
  
  const handleAboutConfigChange = (key, value) => {
    setAboutConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => { 
    setConfirm({ 
      show: true, 
      type: 'info', 
      title: 'บันทึกข้อมูล', 
      message: 'ยืนยันบันทึกข้อมูลทั้งหมดในหน้านี้?', 
      action: async () => { 
        const [uInfo, uConfig] = await Promise.all([
          companyAPI.update(info),
          aboutConfigAPI.update(aboutConfig)
        ]);
        setInfo(uInfo); 
        setAboutConfig(uConfig);
      } 
    }); 
  };

  // Stats
  const handleAddStat = () => { setConfirm({ show: true, type: 'info', title: 'เพิ่มสถิติ', message: 'เพิ่มตัวเลขสถิติใหม่?', action: async () => { const c = await companyAPI.createStat({ label: 'สถิติใหม่', value: '0' }); setStats(p => [...p, c]); } }); };
  const handleEditStat = (stat) => { setEditStatId(stat.id); setStatForm({ label: stat.label, value: stat.value }); };
  const handleSaveStat = () => { setConfirm({ show: true, type: 'info', title: 'บันทึกสถิติ', message: `บันทึก "${statForm.label}" ?`, action: async () => { const u = await companyAPI.updateStat(editStatId, statForm); setStats(p => p.map(s => s.id === editStatId ? u : s)); setEditStatId(null); } }); };
  const handleDeleteStat = (stat) => { setConfirm({ show: true, type: 'danger', title: 'ลบสถิติ', message: `ลบ "${stat.label}" ?`, action: async () => { await companyAPI.deleteStat(stat.id); setStats(p => p.filter(s => s.id !== stat.id)); } }); };

  // Core Values
  const handleAddCoreValue = () => {
    handleAboutConfigChange('coreValues', [...aboutConfig.coreValues, { icon: 'bi-star-fill', title: 'ค่านิยมใหม่' }]);
  };
  const updateCoreValue = (index, field, val) => {
    const newValues = [...aboutConfig.coreValues];
    newValues[index][field] = val;
    handleAboutConfigChange('coreValues', newValues);
  };
  const deleteCoreValue = (index) => {
    handleAboutConfigChange('coreValues', aboutConfig.coreValues.filter((_, i) => i !== index));
  };

  // Timeline
  const handleAddTimeline = () => {
    handleAboutConfigChange('timeline', [...aboutConfig.timeline, { year: '2026', title: 'เหตุการณ์ใหม่', desc: 'รายละเอียด' }]);
  };
  const updateTimeline = (index, field, val) => {
    const newTimeline = [...aboutConfig.timeline];
    newTimeline[index][field] = val;
    handleAboutConfigChange('timeline', newTimeline);
  };
  const deleteTimeline = (index) => {
    handleAboutConfigChange('timeline', aboutConfig.timeline.filter((_, i) => i !== index));
  };

  // Banners
  const handleAddBanner = () => {
    handleAboutConfigChange('banners', [...aboutConfig.banners, { image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1000&q=80', title: 'แบนเนอร์ใหม่' }]);
  };
  const updateBanner = (index, field, val) => {
    const newBanners = [...aboutConfig.banners];
    newBanners[index][field] = val;
    handleAboutConfigChange('banners', newBanners);
  };
  const deleteBanner = (index) => {
    handleAboutConfigChange('banners', aboutConfig.banners.filter((_, i) => i !== index));
  };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4 sticky-top bg-white p-3 shadow-sm rounded-4" style={{ zIndex: 10 }}>
        <div>
          <h3 className="fw-bold m-0 text-dark">หน้าเกี่ยวกับเรา (About Page)</h3>
          <p className="text-muted m-0">จัดการเนื้อหา รูปภาพ และดีไซน์ในหน้า About ทั้งหมด</p>
        </div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" onClick={handleSaveAll}>
          <i className="bi bi-save me-2"></i>บันทึกข้อมูลทั้งหมด
        </button>
      </div>

      <div className="row g-4">
        {/* เลนส์ซ้าย */}
        <div className="col-lg-8">
          
          {/* ข้อมูลบริษัททั่วไป */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('text')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-text text-primary"></i> ข้อความหลัก (Text & Headers)
              </h5>
              <i className={`bi bi-chevron-${collapsed.text ? 'down' : 'up'} text-secondary fs-5`}></i>
            </div>
            {!collapsed.text && (
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-md-12">
                    <div className="admin-form-group">
                      <label>สโลแกนหน้า About (แทนที่ "รับจัดกิจกรรม Team Building...")</label>
                      <input type="text" name="tagline" value={info.tagline || ''} onChange={handleInfoChange}/>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="admin-form-group">
                      <label>เกี่ยวกับเรา (About Us Description)</label>
                      <textarea name="about" rows="3" value={info.about || ''} onChange={handleInfoChange}></textarea>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>วิสัยทัศน์ (นำไปแสดงเป็นคำคม / Quote)</label>
                      <textarea name="vision" rows="3" value={info.vision || ''} onChange={handleInfoChange}></textarea>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group">
                      <label>พันธกิจ (ผู้แต่งคำคม / Author)</label>
                      <textarea name="mission" rows="3" value={info.mission || ''} onChange={handleInfoChange}></textarea>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ส่วนวิดีโอ (Video Section) */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('video')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-youtube text-danger"></i> วิดีโอนำเสนอ (Video Presentation)
              </h5>
              <i className={`bi bi-chevron-${collapsed.video ? 'down' : 'up'} text-secondary fs-5`}></i>
            </div>
            {!collapsed.video && (
              <div className="card-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="fw-bold mb-2">ภาพปกวิดีโอ (Video Thumbnail)</label>
                    <ImageUploader 
                      value={aboutConfig.videoThumbnail} 
                      onChange={(url) => handleAboutConfigChange('videoThumbnail', url)}
                      recommendedSize="800x800px (รูปจะถูกตัดเป็นครึ่งวงกลม)"
                      aspectRatio={1}
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="admin-form-group mb-3">
                      <label>ลิงก์วิดีโอ YouTube Embed (เช่น https://www.youtube.com/embed/...)</label>
                      <input type="text" value={aboutConfig.videoUrl || ''} onChange={(e) => handleAboutConfigChange('videoUrl', e.target.value)} />
                      <small className="text-muted d-block mt-1">ใส่วิดีโอที่จะเล่นเมื่อกดปุ่ม Play บนรูปภาพ</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Values */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('values')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-gem text-warning"></i> ค่านิยม / จุดเด่น (Core Values)
              </h5>
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-1 py-1 px-2 fw-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCoreValue();
                  }}
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-plus-lg"></i> เพิ่ม
                </button>
                <i className={`bi bi-chevron-${collapsed.values ? 'down' : 'up'} text-secondary fs-5`}></i>
              </div>
            </div>
            {!collapsed.values && (
              <div className="card-body p-4">
                {aboutConfig.coreValues.map((cv, idx) => (
                  <div key={idx} className="d-flex gap-3 align-items-center mb-3 bg-light p-3 rounded-3 border">
                    <div style={{ width: '80px' }}>
                      <label className="small fw-bold mb-1 d-block">ไอคอน</label>
                      <div className="dropdown">
                        <button 
                          className="d-flex justify-content-between align-items-center bg-white" 
                          type="button" 
                          data-bs-toggle="dropdown" 
                          style={{ width: '80px', border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '0 10px', height: '31px', cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center text-primary">
                            <i className={`bi ${cv.icon}`}></i>
                          </div>
                          <i className="bi bi-chevron-down text-muted" style={{fontSize: '0.75rem'}}></i>
                        </button>
                        <ul className="dropdown-menu shadow border-0 p-2" style={{ borderRadius: '12px', zIndex: 1050, width: '220px' }}>
                          <div className="d-flex flex-wrap gap-1">
                            {iconOptions.map(ico => (
                              <button 
                                type="button"
                                key={ico}
                                className={`btn ${cv.icon === ico ? 'btn-primary' : 'btn-light border'} p-0 d-flex align-items-center justify-content-center`}
                                style={{ width: 34, height: 34, borderRadius: '8px' }}
                                onClick={() => updateCoreValue(idx, 'icon', ico)}
                              >
                                <i className={`bi ${ico}`}></i>
                              </button>
                            ))}
                          </div>
                        </ul>
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <label className="small fw-bold">ข้อความ (Title)</label>
                      <input type="text" className="form-control form-control-sm" value={cv.title} onChange={(e) => updateCoreValue(idx, 'title', e.target.value)} />
                    </div>
                    <button className="btn btn-outline-danger mt-4" onClick={() => deleteCoreValue(idx)}><i className="bi bi-trash"></i></button>
                  </div>
                ))}
                {aboutConfig.coreValues.length === 0 && <p className="text-muted mb-0">ไม่มีข้อมูลค่านิยม</p>}
              </div>
            )}
          </div>

          {/* Team Images Middle Section */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('team')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-people text-info"></i> รูปภาพประกอบทีมงาน (ตรงกลางเพจข้างๆ Quote)
              </h5>
              <i className={`bi bi-chevron-${collapsed.team ? 'down' : 'up'} text-secondary fs-5`}></i>
            </div>
            {!collapsed.team && (
              <div className="card-body p-4">
                <div className="row g-4">
                  {[0, 1].map(idx => (
                    <div className="col-md-6" key={idx}>
                      <label className="fw-bold mb-2">รูปภาพที่ {idx + 1}</label>
                      <ImageUploader 
                        value={aboutConfig.teamImages[idx] || ''} 
                        onChange={(url) => {
                          const newImgs = [...aboutConfig.teamImages];
                          newImgs[idx] = url;
                          handleAboutConfigChange('teamImages', newImgs);
                        }}
                        recommendedSize="800x800px (สัดส่วน 1:1 หรือ 3:4)"
                        aspectRatio={3/4}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Banners */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('banners')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-image text-success"></i> แบนเนอร์ด้านล่างสุด (Bottom Banners)
              </h5>
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-1 py-1 px-2 fw-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddBanner();
                  }}
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-plus-lg"></i> เพิ่มแบนเนอร์
                </button>
                <i className={`bi bi-chevron-${collapsed.banners ? 'down' : 'up'} text-secondary fs-5`}></i>
              </div>
            </div>
            {!collapsed.banners && (
              <div className="card-body p-4">
                {aboutConfig.banners.map((banner, idx) => (
                  <div key={idx} className="row mb-4 bg-light p-3 rounded-3 border g-3 align-items-center">
                    <div className="col-md-4">
                      <ImageUploader 
                        value={banner.image} 
                        onChange={(url) => updateBanner(idx, 'image', url)}
                        recommendedSize="1000x800px"
                        aspectRatio={5/4}
                      />
                    </div>
                    <div className="col-md-7">
                      <div className="admin-form-group mb-0">
                        <label>ข้อความพาดหัวแบนเนอร์ (Banner Title)</label>
                        <input type="text" className="form-control" value={banner.title} onChange={(e) => updateBanner(idx, 'title', e.target.value)} />
                      </div>
                    </div>
                    <div className="col-md-1 text-end">
                      <button className="btn btn-danger" onClick={() => deleteBanner(idx)}><i className="bi bi-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('timeline')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-calendar3" style={{ color: '#6366f1' }}></i> เส้นทางของเรา (Timeline)
              </h5>
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-sm btn-primary rounded-3 d-flex align-items-center gap-1 py-1 px-2 fw-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddTimeline();
                  }}
                  style={{ fontSize: '0.8rem' }}
                >
                  <i className="bi bi-plus-lg"></i> เพิ่มเหตุการณ์
                </button>
                <i className={`bi bi-chevron-${collapsed.timeline ? 'down' : 'up'} text-secondary fs-5`}></i>
              </div>
            </div>
            {!collapsed.timeline && (
              <div className="card-body p-4">
                {aboutConfig.timeline.map((item, idx) => (
                  <div key={idx} className="d-flex gap-3 align-items-center mb-3 bg-light p-3 rounded-3 border">
                    <div style={{ width: '100px' }}>
                      <label className="small fw-bold">ปี (Year)</label>
                      <input type="text" className="form-control form-control-sm" value={item.year} onChange={(e) => updateTimeline(idx, 'year', e.target.value)} placeholder="2026" />
                    </div>
                    <div style={{ width: '200px' }}>
                      <label className="small fw-bold">หัวข้อ (Title)</label>
                      <input type="text" className="form-control form-control-sm" value={item.title} onChange={(e) => updateTimeline(idx, 'title', e.target.value)} />
                    </div>
                    <div className="flex-grow-1">
                      <label className="small fw-bold">รายละเอียด (Description)</label>
                      <input type="text" className="form-control form-control-sm" value={item.desc} onChange={(e) => updateTimeline(idx, 'desc', e.target.value)} />
                    </div>
                    <button className="btn btn-outline-danger mt-4" onClick={() => deleteTimeline(idx)}><i className="bi bi-trash"></i></button>
                  </div>
                ))}
                {aboutConfig.timeline.length === 0 && <p className="text-muted mb-0">ไม่มีข้อมูล Timeline</p>}
              </div>
            )}
          </div>

        </div>

        {/* เลนส์ขวา */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 position-sticky overflow-hidden" style={{ top: '100px' }}>
            <div 
              className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"
              style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => toggleSection('stats')}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
            >
              <h5 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
                <i className="bi bi-bar-chart-line" style={{ color: '#3b82f6' }}></i> ตัวเลขสถิติ (ลอยบนรูป)
              </h5>
              <div className="d-flex align-items-center gap-3">
                <button 
                  className="btn btn-sm btn-primary rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 28, height: 28 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddStat();
                  }}
                >
                  <i className="bi bi-plus-lg"></i>
                </button>
                <i className={`bi bi-chevron-${collapsed.stats ? 'down' : 'up'} text-secondary fs-5`}></i>
              </div>
            </div>
            {!collapsed.stats && (
              <div className="card-body p-0">
                <div className="px-4 py-2 text-muted small bg-light border-bottom">
                  * สถิติอันดับแรกสุด จะถูกนำไปแสดงทับรูปภาพวิดีโอด้านซ้ายบน
                </div>
                <ul className="list-group list-group-flush rounded-bottom-4">
                  {stats.map((stat, idx) => (
                    <li className={`list-group-item px-4 py-3 ${idx === 0 ? 'bg-primary bg-opacity-10' : ''}`} key={stat.id}>
                      {editStatId === stat.id ? (
                        <div className="d-flex gap-2 align-items-end">
                          <div className="flex-grow-1"><input className="form-control form-control-sm" placeholder="Label" value={statForm.label} onChange={e => setStatForm(p=>({...p,label:e.target.value}))}/></div>
                          <div style={{width:80}}><input className="form-control form-control-sm" placeholder="Value" value={statForm.value} onChange={e => setStatForm(p=>({...p,value:e.target.value}))}/></div>
                          <button className="btn btn-sm btn-primary" onClick={handleSaveStat}><i className="bi bi-check"></i></button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={()=>setEditStatId(null)}><i className="bi bi-x"></i></button>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-dark">{stat.label}</div>
                            <div className="text-primary fw-bold fs-5">{stat.value}</div>
                          </div>
                          <div>
                            <button className="btn btn-sm btn-light text-muted border rounded-3 me-1" onClick={()=>handleEditStat(stat)}><i className="bi bi-pencil"></i></button>
                            <button className="btn btn-sm btn-light text-danger border rounded-3" onClick={()=>handleDeleteStat(stat)}><i className="bi bi-trash"></i></button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
