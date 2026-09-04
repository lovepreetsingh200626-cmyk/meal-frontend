import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { MessageSquareWarning, Send } from 'lucide-react';

export default function StudentComplaintsPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [complaintCategory, setComplaintCategory] = useState('Food Quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchComplaints();
    }
  }, [user]);

  const fetchComplaints = async () => {
    try {
      const userId = user._id || user.id;
      const { data } = await API.get(`/complaints/user/${userId}`);
      setComplaints(data || []);
    } catch (err) { console.error(err); }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;

    setSubmittingComplaint(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // Safe defensive lookup for hostelId
      const resolvedHostelId = typeof user.hostelId === 'object' ? user.hostelId?._id : (user.hostelId || user.hostelNo);

      await API.post('/complaints', {
        userId: user._id || user.id,
        hostelId: resolvedHostelId,
        hostelNo: user.hostelNo || 'BH1',
        category: complaintCategory,
        subject: complaintSubject,
        description: complaintDesc,
        photoProof: complaintPhoto
      });
      setComplaintSubject('');
      setComplaintDesc('');
      setComplaintPhoto('');
      setSuccessMsg('Grievance registered successfully with the warden authority.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchComplaints();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit grievance.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-6">
        <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
          <MessageSquareWarning className="w-4 h-4 text-orange-600" /> Grievance Redressal Mechanism
        </h2>

        {errorMsg && <div className="bg-red-50 border-l-4 border-red-700 text-red-900 p-3 text-xs font-bold mb-4">{errorMsg}</div>}
        {successMsg && <div className="bg-green-50 border-l-4 border-green-700 text-green-900 p-3 text-xs font-bold mb-4">{successMsg}</div>}

        <form onSubmit={handleComplaintSubmit} className="space-y-4 mb-8 border border-gray-300 p-5 bg-gray-50">
          <h3 className="text-[11px] font-black uppercase text-gray-800 border-b border-gray-300 pb-2 mb-3 tracking-widest">Lodge New Grievance</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Grievance Category</label>
              <select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900">
                <option value="Food Quality">Food Quality</option>
                <option value="Cleanliness">Cleanliness & Hygiene</option>
                <option value="Timing">Mess Timings</option>
                <option value="Staff Behavior">Staff Behavior</option>
                <option value="Other">Other Issue</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Subject</label>
              <input required type="text" placeholder="Brief subject" value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Detailed Description</label>
            <textarea required rows="2" placeholder="Elaborate on the issue..." value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900 resize-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Evidentiary Photo (Optional)</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) { alert('Limit: 2MB.'); return; }
                const reader = new FileReader();
                reader.onloadend = () => setComplaintPhoto(reader.result);
                reader.readAsDataURL(file);
              }} className="text-[10px] file:mr-4 file:py-1.5 file:px-3 file:border file:border-gray-400 file:bg-gray-200 file:text-gray-800 file:uppercase file:font-bold hover:file:bg-gray-300 cursor-pointer w-full max-w-xs" />
              {complaintPhoto && <span className="text-[10px] text-green-700 font-bold uppercase shrink-0">Attached ✓</span>}
            </div>
          </div>

          <button type="submit" disabled={submittingComplaint} className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-sm text-[11px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70 mt-2">
            <Send className="w-3.5 h-3.5" /> <span>{submittingComplaint ? 'Transmitting...' : 'Register Grievance'}</span>
          </button>
        </form>

        <h3 className="text-[11px] font-black uppercase text-gray-800 border-b border-gray-300 pb-2 mb-4 tracking-widest">Grievance Status History</h3>
        {complaints.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs font-bold uppercase">No records found.</div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {complaints.map(c => (
              <div key={c._id} className="border border-gray-300 p-4 bg-white space-y-2">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Ref: {c.category}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 uppercase border ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-300' : c.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-red-100 text-red-800 border-red-300'}`}>{c.status}</span>
                </div>
                <div>
                  <h4 className="font-black text-gray-900 text-xs uppercase">{c.subject}</h4>
                  <p className="text-xs text-gray-700 mt-1 font-medium">{c.description}</p>
                </div>
                {c.photoProof && (
                  <div className="mt-2 pt-2 border-t border-gray-100"><a href={c.photoProof} target="_blank" rel="noreferrer"><img src={c.photoProof} alt="Proof" className="w-16 h-16 object-cover border border-gray-300" /></a></div>
                )}
                {c.adminRemark && (
                  <div className="bg-gray-100 border-l-4 border-gray-500 p-2 text-[11px] text-gray-800 mt-2 font-medium">
                    <strong className="uppercase">Authority Remark:</strong> {c.adminRemark}
                  </div>
                )}
                <p className="text-[9px] text-gray-400 text-right uppercase font-bold mt-2 pt-2 border-t border-gray-100">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}