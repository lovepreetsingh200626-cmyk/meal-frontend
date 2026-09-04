import React, { useState } from 'react';
import API from '../services/api';
import { 
    X, Camera, User as UserIcon, Phone, 
    Mail, AlertCircle, CheckCircle2, Save, GraduationCap, 
    BookOpen, Layers, ShieldCheck, Users, MapPin, Building, 
    IdCard, Calendar, Globe, Compass 
} from 'lucide-react';

export default function ProfileModal({ user, onClose, onUpdateUser }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [formData, setFormData] = useState({
        mobileNo: user.mobileNo || '',
        email: user.email || '',
        profilePhoto: user.profilePhoto || ''
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg('Official photograph must be under 2MB.');
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const endpoint = user.role === 'admin' ? `/auth/admins/${user._id}` : `/auth/users/${user._id}`;
            const { data } = await API.put(endpoint, formData);
            
            setSuccessMsg('Institutional identity records updated successfully.');
            if (onUpdateUser) onUpdateUser(user.role === 'admin' ? data.admin : data.user);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-950/80 backdrop-blur-sm p-4 font-sans text-gray-900">
            <div className="bg-white w-full max-w-lg shadow-2xl relative border-t-4 border-orange-600 rounded-sm overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* MODAL HEADER */}
                <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Official Profile Manager</h3>
                        <p className="text-[9px] font-bold text-gray-500 mt-0.5 uppercase tracking-wide">
                            {user.role === 'admin' ? 'Executive Administrator Clearance' : 'Student Academic Dossier'}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-6 h-6 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 transition cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* SCROLLABLE CONTENT AREA */}
                <div className="p-6 overflow-y-auto">
                    {errorMsg && <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-900 px-4 py-3 text-xs font-bold uppercase mb-5 flex items-start gap-3"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{errorMsg}</span></div>}
                    {successMsg && <div className="bg-green-50 border border-green-300 border-l-4 border-l-green-700 text-green-900 px-4 py-3 text-xs font-bold uppercase mb-5 flex items-start gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{successMsg}</span></div>}

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        {/* PHOTOGRAPH UPLOAD & DETAILS CARD */}
                        <div className="flex flex-col items-center justify-center border border-gray-300 p-4 bg-gray-50 mb-2">
                            <div className="relative group cursor-pointer border-2 border-blue-900 p-1 bg-white">
                                <div className="w-24 h-24 bg-gray-200 overflow-hidden flex items-center justify-center">
                                    {formData.profilePhoto ? <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-gray-400" />}
                                </div>
                                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-5 h-5 mb-1" />
                                    <span className="text-[8px] font-bold uppercase">Upload Photo</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>
                            <h4 className="font-black text-blue-900 text-xs uppercase mt-3">{user.name}</h4>
                            <p className="text-[10px] font-bold text-gray-600 uppercase mt-0.5">
                                {user.role === 'student' ? `Roll No: ${user.rollNo} | ID: ${user.studentId}` : 'Chief Warden Authority'}
                            </p>
                        </div>

                        {/* INSTITUTIONAL DOSSIER METADATA */}
                        {user.role === 'student' && (
                            <div className="space-y-2.5 bg-white border border-gray-200 p-3 text-xs uppercase font-bold">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Building className="w-3.5 h-3.5 text-blue-900" /> Assigned Hostel:</span>
                                    <span className="text-blue-900">{user.hostelNo || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><IdCard className="w-3.5 h-3.5 text-blue-900" /> Student ID:</span>
                                    <span className="text-gray-800">{user.studentId || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-900" /> Father's Name:</span>
                                    <span className="text-gray-800 text-right">{user.fatherName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-900" /> Mother's Name:</span>
                                    <span className="text-gray-800 text-right">{user.motherName || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-blue-900" /> Faculty:</span>
                                    <span className="text-gray-800 text-right">{user.facultyName || user.faculty || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-blue-900" /> Course / Program:</span>
                                    <span className="text-gray-800 text-right">{user.university || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-blue-900" /> Department:</span>
                                    <span className="text-gray-800 text-right">{user.department || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-blue-900" /> Session:</span>
                                    <span className="text-gray-800">{user.session || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-900" /> Date of Birth:</span>
                                    <span className="text-gray-800">{user.dob || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><UserIcon className="w-3.5 h-3.5 text-blue-900" /> Gender:</span>
                                    <span className="text-gray-800">{user.gender || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><Globe className="w-3.5 h-3.5 text-blue-900" /> Nationality:</span>
                                    <span className="text-gray-800">{user.nationality || 'India'}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-900" /> Domicile State:</span>
                                    <span className="text-gray-800">{user.domicileState || 'Punjab'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-900" /> Category:</span>
                                    <span className="text-orange-700">{user.category || 'General'}</span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Registered Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                    <input required type="tel" maxLength="10" value={formData.mobileNo} onChange={(e) => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-gray-400 pl-9 pr-3 py-2 text-xs font-bold outline-none focus:border-blue-900" />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Official Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
                                    <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border border-gray-400 pl-9 pr-3 py-2 text-xs font-bold outline-none focus:border-blue-900" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 text-[11px] uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-4 shadow-sm">
                            <Save className="w-4 h-4" /> <span>{loading ? 'Processing...' : 'Commit Record Updates'}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}