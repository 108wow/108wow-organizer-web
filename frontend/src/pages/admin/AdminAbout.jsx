import { useState, useCallback } from 'react';
import { companyInfo, companyStats } from '../../data/mockData';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';

export default function AdminAbout() {
  const [info, setInfo] = useState(companyInfo);
  const [stats, setStats] = useState(companyStats.map((s,i) => ({...s, id: i+1})));
  const [editStatId, setEditStatId] = useState(null);
  const [statForm, setStatForm] = useState({ label: '', value: '' });
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'info' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const exec = useCallback((action) => { setConfirm(p=>({...p,show:false})); setLoading(true); setTimeout(() => { action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'บันทึกเรียบร้อย' }); }, 1200); }, []);
  const handleInfoChange = (e) => { setInfo(p => ({ ...p, [e.target.name]: e.target.value })); };

  const handleSaveInfo = () => { setConfirm({ show: true, type: 'info', title: 'บันทึกข้อมูล', message: 'ยืนยันบันทึกข้อมูลบริษัท?', action: () => {} }); };
  const handleAddStat = () => { setConfirm({ show: true, type: 'info', title: 'เพิ่มสถิติ', message: 'เพิ่มตัวเลขสถิติใหม่?', action: () => setStats(p => [...p, { id: Math.max(...p.map(s=>s.id),0)+1, label: 'สถิติใหม่', value: '0' }]) }); };
  const handleEditStat = (stat) => { setEditStatId(stat.id); setStatForm({ label: stat.label, value: stat.value }); };
  const handleSaveStat = () => { setConfirm({ show: true, type: 'info', title: 'บันทึกสถิติ', message: `บันทึก "${statForm.label}" ?`, action: () => { setStats(p => p.map(s => s.id === editStatId ? { ...s, ...statForm } : s)); setEditStatId(null); } }); };
  const handleDeleteStat = (stat) => { setConfirm({ show: true, type: 'danger', title: 'ลบสถิติ', message: `ลบ "${stat.label}" ?`, action: () => setStats(p => p.filter(s => s.id !== stat.id)) }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h3 className="fw-bold m-0 text-dark">เกี่ยวกับเรา (About Us)</h3><p className="text-muted m-0">จัดการข้อมูลบริษัท วิสัยทัศน์ และตัวเลขสถิติ</p></div>
        <button className="btn btn-primary fw-bold px-4 rounded-3 shadow-sm" onClick={handleSaveInfo}><i className="bi bi-save me-2"></i>บันทึกข้อมูล</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4"><div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0">ข้อมูลบริษัททั่วไป</h5></div><div className="card-body p-4"><form><div className="row g-3">
            <div className="col-md-6"><div className="admin-form-group"><label>ชื่อบริษัท</label><input type="text" name="name" value={info.name} onChange={handleInfoChange}/></div></div>
            <div className="col-md-6"><div className="admin-form-group"><label>สโลแกน</label><input type="text" name="tagline" value={info.tagline} onChange={handleInfoChange}/></div></div>
            <div className="col-12"><div className="admin-form-group"><label>เกี่ยวกับเรา</label><textarea name="about" rows="3" value={info.about} onChange={handleInfoChange}></textarea></div></div>
            <div className="col-md-6"><div className="admin-form-group"><label>พันธกิจ</label><textarea name="mission" rows="3" value={info.mission} onChange={handleInfoChange}></textarea></div></div>
            <div className="col-md-6"><div className="admin-form-group"><label>วิสัยทัศน์</label><textarea name="vision" rows="3" value={info.vision} onChange={handleInfoChange}></textarea></div></div>
          </div></form></div></div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4"><div className="card-header bg-white border-bottom pt-4 pb-3 px-4 d-flex justify-content-between align-items-center"><h5 className="fw-bold m-0">ตัวเลขสถิติ</h5><button className="btn btn-sm btn-primary rounded-3" onClick={handleAddStat}><i className="bi bi-plus"></i></button></div><div className="card-body p-0">
            <ul className="list-group list-group-flush rounded-4">
              {stats.map(stat => (
                <li className="list-group-item px-4 py-3" key={stat.id}>
                  {editStatId === stat.id ? (
                    <div className="d-flex gap-2 align-items-end">
                      <div className="flex-grow-1"><input className="form-control form-control-sm" placeholder="Label" value={statForm.label} onChange={e => setStatForm(p=>({...p,label:e.target.value}))}/></div>
                      <div style={{width:80}}><input className="form-control form-control-sm" placeholder="Value" value={statForm.value} onChange={e => setStatForm(p=>({...p,value:e.target.value}))}/></div>
                      <button className="btn btn-sm btn-primary" onClick={handleSaveStat}><i className="bi bi-check"></i></button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={()=>setEditStatId(null)}><i className="bi bi-x"></i></button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between align-items-center">
                      <div><div className="fw-bold text-dark">{stat.label}</div><div className="text-primary fw-bold fs-5">{stat.value}</div></div>
                      <div><button className="btn btn-sm btn-light text-muted border rounded-3 me-1" onClick={()=>handleEditStat(stat)}><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-light text-danger border rounded-3" onClick={()=>handleDeleteStat(stat)}><i className="bi bi-trash"></i></button></div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div></div>
        </div>
      </div>
    </div>
  );
}
