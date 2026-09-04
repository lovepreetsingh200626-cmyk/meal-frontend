import React, { useState } from 'react';
import { Building2, ShieldAlert } from 'lucide-react';

export default function GovtHeader({ title, subtitle }) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="bg-white border-b-4 border-orange-600 shadow-sm px-4 py-3 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 z-40 print:hidden font-sans">
      <div className="flex items-center gap-4 w-full md:w-auto">
        
        {/* Government Emblem / University Crest with Enhanced Fallback */}
        <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-orange-500 shrink-0 relative overflow-hidden shadow-inner">
          {!logoLoaded && !logoError && (
            <div className="absolute inset-0 bg-blue-950 animate-pulse flex items-center justify-center text-[9px] uppercase tracking-wider text-orange-300">
              Loading
            </div>
          )}
          
          {!logoError ? (
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Guru_Nanak_Dev_University_logo.png/220px-Guru_Nanak_Dev_University_logo.png" 
              alt="GNDU Emblem" 
              className={`w-full h-full object-contain p-1 transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-1">
              <span className="text-[10px] font-black tracking-tighter text-orange-400">GNDU</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black bg-blue-950 text-white px-1.5 py-0.5 uppercase tracking-widest">Govt. of Punjab</span>
            <span className="text-[9px] font-black bg-orange-600 text-white px-1.5 py-0.5 uppercase tracking-widest">NAAC A++</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-blue-900 uppercase tracking-tight mt-1">Guru Nanak Dev University, Amritsar</h1>
          <h2 className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wide">{title || "Directorate of Hostels & Mess Operations"}</h2>
          {subtitle && <p className="text-[10px] font-semibold text-orange-700 uppercase mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="hidden lg:flex flex-col items-end border-l-2 border-gray-300 pl-4 text-right">
        <span className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" /> Secure Institutional Gateway
        </span>
        <span className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Higher Education Department • Punjab</span>
      </div>
    </div>
  );
}