import React, { useState } from 'react';
import {
  ShieldCheck,
  Landmark
} from 'lucide-react';

export default function GovtHeader({ title, subtitle }) {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm px-4 py-3 md:px-8 print:hidden font-sans">
      <div className="max-w-[1600px] mx-auto">

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Left: University Identity */}
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">

            {/* University Logo */}
            <div className="
              w-14 h-14 sm:w-16 sm:h-16
              rounded-2xl
              bg-slate-50
              border border-slate-200
              flex items-center justify-center
              shrink-0
              overflow-hidden
              relative
              shadow-sm
            ">
              {!logoLoaded && !logoError && (
                <div className="
                  absolute inset-0
                  flex items-center justify-center
                  bg-slate-100
                  animate-pulse
                ">
                  <Landmark className="w-6 h-6 text-slate-300" />
                </div>
              )}

              {!logoError ? (
                <img
                  src="https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Guru_Nanak_Dev_University_logo.png/220px-Guru_Nanak_Dev_University_logo.png"
                  alt="Guru Nanak Dev University emblem"
                  className={`
                    w-full h-full
                    object-contain
                    p-1.5
                    transition-opacity duration-300
                    ${logoLoaded ? 'opacity-100' : 'opacity-0'}
                  `}
                  onLoad={() => setLogoLoaded(true)}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Landmark className="w-6 h-6 text-blue-700" />
                  <span className="text-[8px] font-black text-blue-800 mt-0.5">
                    GNDU
                  </span>
                </div>
              )}
            </div>

            {/* University Text */}
            <div className="min-w-0">

              {/* Institution Tags */}
              <div className="flex flex-wrap items-center gap-1.5 mb-1">

                <span className="
                  inline-flex items-center
                  px-2 py-0.5
                  rounded-md
                  bg-blue-50
                  border border-blue-100
                  text-blue-700
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                ">
                  Government Institution
                </span>

                <span className="
                  inline-flex items-center
                  px-2 py-0.5
                  rounded-md
                  bg-slate-100
                  border border-slate-200
                  text-slate-600
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-wide
                ">
                  NAAC A++
                </span>

              </div>

              <h1 className="
                text-base sm:text-lg md:text-xl
                font-bold
                text-slate-900
                leading-tight
              ">
                Guru Nanak Dev University
              </h1>

              <p className="
                text-[11px] sm:text-xs
                font-medium
                text-slate-500
                mt-0.5
              ">
                Amritsar, Punjab
              </p>

              {title && (
                <p className="
                  text-xs sm:text-sm
                  font-semibold
                  text-blue-700
                  mt-1
                  truncate
                ">
                  {title}
                </p>
              )}

              {subtitle && (
                <p className="
                  text-[10px] sm:text-[11px]
                  text-slate-500
                  mt-0.5
                  truncate
                ">
                  {subtitle}
                </p>
              )}

            </div>
          </div>

          {/* Right: Portal Status */}
          <div className="
            hidden lg:flex
            items-center gap-3
            pl-5
            border-l border-slate-200
          ">

            <div className="
              w-9 h-9
              rounded-xl
              bg-blue-50
              border border-blue-100
              flex items-center justify-center
            ">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>

            <div>
              <p className="
                text-xs
                font-bold
                text-slate-800
              ">
                Secure Institutional Portal
              </p>

              <p className="
                text-[10px]
                text-slate-500
                mt-0.5
              ">
                Hostel & Mess Management System
              </p>
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}