import { useState, useCallback } from 'react';
import { companyInfo } from '../../data/mockData';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingOverlay from '../../components/admin/LoadingOverlay';
import StatusModal from '../../components/admin/StatusModal';
import ModalBackdrop from '../../components/admin/ModalBackdrop';

const mockMessages = [
  { id: 1, name: 'คุณสมศักดิ์', email: 'somsak@example.com', subject: 'สอบถามบริการ Web Development', date: '26 เม.ย. 2026', status: 'unread', body: 'สวัสดีครับ ผมสนใจบริการพัฒนาเว็บไซต์ อยากได้ข้อมูลเพิ่มเติมและใบเสนอราคาครับ ขอบคุณครับ' },
  { id: 2, name: 'คุณนฤมล', email: 'naru@example.com', subject: 'อยากให้ทำแอปพลิเคชัน', date: '25 เม.ย. 2026', status: 'read', body: 'สวัสดีค่ะ สนใจพัฒนาแอปมือถือสำหรับร้านอาหาร อยากปรึกษารายละเอียดค่ะ' },
  { id: 3, name: 'บริษัท ABC', email: 'contact@abc.com', subject: 'ขอใบเสนอราคาระบบ Cloud', date: '23 เม.ย. 2026', status: 'read', body: 'เรียน ทีมงาน ทางบริษัทเราสนใจระบบ Cloud Infrastructure ขอรายละเอียดและใบเสนอราคาครับ' },
];

export default function AdminContact() {
  const [info, setInfo] = useState(companyInfo);
  const [messages, setMessages] = useState(mockMessages);
  const [viewMsg, setViewMsg] = useState(null);
  const [confirm, setConfirm] = useState({ show: false, action: null, title: '', message: '', type: 'warning' });
  const [loading, setLoading] = useState(false);
  const [statusM, setStatusM] = useState({ show: false, status: 'success', message: '' });

  const exec = useCallback((action) => { setConfirm(p=>({...p,show:false})); setLoading(true); setTimeout(() => { action(); setLoading(false); setStatusM({ show: true, status: 'success', message: 'ดำเนินการเรียบร้อย' }); }, 1200); }, []);
  const handleInfoChange = (e) => { setInfo(p => ({ ...p, [e.target.name]: e.target.value })); };
  const saveInfo = () => { setConfirm({ show: true, type: 'info', title: 'บันทึก', message: 'บันทึกข้อมูลติดต่อ?', action: () => {} }); };
  const openMsg = (msg) => { setViewMsg(msg); setMessages(p => p.map(m => m.id === msg.id ? { ...m, status: 'read' } : m)); };
  const deleteMsg = (msg) => { setConfirm({ show: true, type: 'danger', title: 'ลบข้อความ', message: `ลบข้อความจาก "${msg.name}" ?`, action: () => { setMessages(p => p.filter(m => m.id !== msg.id)); setViewMsg(null); } }); };

  return (
    <div className="anim d1">
      <ConfirmModal show={confirm.show} type={confirm.type} title={confirm.title} message={confirm.message} onConfirm={()=>exec(confirm.action)} onCancel={()=>setConfirm(p=>({...p,show:false}))} confirmText={confirm.type==='danger'?'ลบเลย':'ยืนยัน'} />
      <LoadingOverlay show={loading} />
      <StatusModal show={statusM.show} status={statusM.status} message={statusM.message} onClose={()=>setStatusM(p=>({...p,show:false}))} />

      <div className="mb-4"><h3 className="fw-bold m-0 text-dark">ติดต่อเรา (Contact)</h3><p className="text-muted m-0">จัดการข้อมูลติดต่อและดูข้อความจากลูกค้า</p></div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4"><div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0">ข้อมูลติดต่อ</h5></div><div className="card-body p-4">
            <div className="admin-form-group"><label>อีเมล</label><input type="email" name="email" value={info.email} onChange={handleInfoChange}/></div>
            <div className="admin-form-group"><label>โทรศัพท์</label><input type="text" name="phone" value={info.phone} onChange={handleInfoChange}/></div>
            <div className="admin-form-group"><label>ที่อยู่</label><textarea name="address" rows="3" value={info.address} onChange={handleInfoChange}></textarea></div>
            <button className="btn btn-primary w-100 rounded-3" onClick={saveInfo}>บันทึก</button>
          </div></div>
        </div>

        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4"><div className="card-header bg-white border-bottom pt-4 pb-3 px-4"><h5 className="fw-bold m-0">กล่องข้อความ <span className="badge bg-danger rounded-pill ms-2">{messages.filter(m=>m.status==='unread').length}</span></h5></div><div className="card-body p-0"><div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light"><tr><th className="px-4 py-3 border-bottom-0" style={{width:50}}>สถานะ</th><th className="py-3 border-bottom-0">จาก</th><th className="py-3 border-bottom-0">หัวข้อ</th><th className="py-3 border-bottom-0 text-end px-4" style={{width:140}}>วันที่</th></tr></thead>
              <tbody>{messages.map(msg=>(
                <tr key={msg.id} style={{backgroundColor:msg.status==='unread'?'#f8fafc':'transparent',cursor:'pointer'}} onClick={()=>openMsg(msg)}>
                  <td className="px-4 py-3 text-center">{msg.status==='unread'?<span className="badge bg-primary rounded-circle p-2"><span className="visually-hidden">New</span></span>:<i className="bi bi-envelope-open text-muted"></i>}</td>
                  <td className="py-3"><div className={`text-dark ${msg.status==='unread'?'fw-bold':''}`}>{msg.name}</div><div className="text-muted small">{msg.email}</div></td>
                  <td className="py-3">{msg.subject}</td>
                  <td className="py-3 text-end px-4 text-muted small">{msg.date}</td>
                </tr>
              ))}</tbody>
            </table>
          </div></div></div>
        </div>
      </div>

      <ModalBackdrop show={!!viewMsg} onClose={() => setViewMsg(null)}>
            <div className="d-flex justify-content-between align-items-center mb-3"><h5 className="fw-bold m-0">ข้อความ</h5><button onClick={()=>setViewMsg(null)} style={{background:'none',border:'none',fontSize:'1.3rem',color:'#94a3b8',cursor:'pointer'}}><i className="bi bi-x-lg"></i></button></div>
            {viewMsg && (<>
            <div className="mb-3 pb-3 border-bottom">
              <div className="fw-bold text-dark">{viewMsg.name} <span className="text-muted fw-normal small">({viewMsg.email})</span></div>
              <div className="text-muted small"><i className="bi bi-calendar3 me-1"></i>{viewMsg.date}</div>
            </div>
            <h6 className="fw-bold mb-2">{viewMsg.subject}</h6>
            <p className="text-muted" style={{lineHeight:1.8}}>{viewMsg.body}</p>
            <div className="d-flex gap-2 justify-content-end mt-4">
              <button className="btn btn-outline-danger rounded-3 px-4" onClick={()=>deleteMsg(viewMsg)}><i className="bi bi-trash me-2"></i>ลบ</button>
              <a href={`mailto:${viewMsg.email}`} className="btn btn-primary rounded-3 px-4"><i className="bi bi-reply me-2"></i>ตอบกลับ</a>
            </div>
            </>)}
      </ModalBackdrop>
    </div>
  );
}
