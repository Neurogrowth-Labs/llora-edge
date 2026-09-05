import React from 'react';
import { ArchitecturalProject } from '../types/architecture';
import { APP_LOGO, APP_LOGO_STATIC_URL, BRAND_NAME } from '../assets/logo';
import { ShieldCheck, Award } from 'lucide-react';

interface ArchitecturalLetterheadProps {
  project: ArchitecturalProject;
  sheetCode?: string;
  sheetTitle?: string;
  scale?: string;
  revision?: string;
  compact?: boolean;
  className?: string;
}

export const ArchitecturalLetterhead: React.FC<ArchitecturalLetterheadProps> = ({
  project,
  sheetCode = 'A-101',
  sheetTitle = 'Architectural Working Drawing',
  scale = '1:100 @ A1',
  revision = 'Rev 03',
  compact = false,
  className = '',
}) => {
  const currentDate = new Date().toISOString().slice(0, 10);

  if (compact) {
    return (
      <div className={`w-full bg-[#0A0E17] border border-[#222B3D] rounded-t p-3 flex items-center justify-between text-xs font-mono select-none ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
            <img
              src={APP_LOGO}
              onError={(e) => {
                (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
              }}
              alt="Firm Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="font-bold text-white text-[11px] tracking-wide flex items-center gap-1.5">
              <span>{project.companyName || 'LORA ARCHITECTS'}</span>
              <span className="text-[9px] text-[#2DD4BF] font-semibold px-1 py-0.2 bg-[#2DD4BF]/10 rounded border border-[#2DD4BF]/30">
                OFFICIAL LETTERHEAD
              </span>
            </div>
            <div className="text-[10px] text-gray-400">
              {project.architectName || 'Lead Architect'} • {project.jurisdiction} Registered Practice
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[9px] text-gray-500 uppercase block font-sans">Sheet Identifier</span>
          <div className="text-[#2DD4BF] font-bold text-xs">
            {sheetCode} • {sheetTitle}
          </div>
        </div>
      </div>
    );
  }

  return (
    <header className={`w-full bg-[#080B11] border-b-2 border-[#2DD4BF] pb-4 mb-6 select-none font-sans ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Practice Logo & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 flex items-center justify-center">
            <img
              src={APP_LOGO}
              onError={(e) => {
                (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
              }}
              alt="Architectural Practice Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
                {project.companyName || 'LORA ARCHITECTURAL & BIM STUDIO'}
              </h2>
              <span className="text-[9px] font-mono font-bold text-[#2DD4BF] px-1.5 py-0.5 rounded bg-[#2DD4BF]/15 border border-[#2DD4BF]/30">
                SACAP / AIA REG.
              </span>
            </div>
            <div className="text-xs text-gray-300 font-medium">
              Architect of Record: <strong className="text-white">{project.architectName}</strong>
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
              Practice ID: #LA-2026-BIM • Sustainable Parametric Design & EDGE Engineering
            </div>
          </div>
        </div>

        {/* Center: Project & Client Specifications */}
        <div className="hidden lg:block text-center border-x border-[#1F2937] px-6">
          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">Project Assignment</span>
          <strong className="text-white text-sm tracking-wide block truncate max-w-xs">{project.name}</strong>
          <span className="text-[11px] text-[#2DD4BF] font-mono block">
            Client: {project.clientName} • {project.climate.location}
          </span>
        </div>

        {/* Right: Document Control & Sheet Metadata */}
        <div className="flex items-center gap-4 text-right">
          <div className="text-right">
            <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block">Drawing Document</span>
            <div className="text-lg font-black text-[#2DD4BF] font-mono tracking-tight">{sheetCode}</div>
            <div className="text-[11px] text-gray-200 font-semibold truncate max-w-[200px]">{sheetTitle}</div>
          </div>

          <div className="pl-3 border-l border-[#1F2937] text-left text-[10px] font-mono text-gray-400 space-y-0.5">
            <div>Scale: <span className="text-white">{scale}</span></div>
            <div>Date: <span className="text-white">{currentDate}</span></div>
            <div>Rev: <span className="text-[#38BDF8] font-bold">{revision}</span></div>
          </div>
        </div>
      </div>
    </header>
  );
};
