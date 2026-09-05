import React, { useState } from 'react';
import { ArchitecturalProject } from '../types/architecture';
import { Viewer3D } from './Viewer3D';
import { APP_LOGO, APP_LOGO_STATIC_URL } from '../assets/logo';
import {
  Sparkles,
  Minimize2,
  Award,
  Leaf,
  Sun,
  Droplets,
  ShieldCheck,
} from 'lucide-react';

interface PresentationModeProps {
  project: ArchitecturalProject;
  onExit: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({ project, onExit }) => {
  const [activeSlide, setActiveSlide] = useState<'3d' | 'render' | 'sustainability'>('3d');

  const totalArea = project.rooms.reduce((acc, r) => acc + r.floorArea, 0);

  return (
    <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col text-[#E0E0E0] select-none">
      {/* Top Presentation Bar */}
      <div className="h-16 border-b border-[#222222] px-6 flex items-center justify-between bg-[#0A0A0A]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 flex items-center justify-center">
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
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">{project.name}</h1>
              <span className="text-[9px] text-[#2DD4BF] font-mono font-bold px-1.5 py-0.2 bg-[#2DD4BF]/15 rounded border border-[#2DD4BF]/30">
                {project.companyName || 'LORA ARCHITECTS'}
              </span>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              Client Architectural Presentation • {project.climate.location} • {project.clientName}
            </span>
          </div>
        </div>

        {/* Slide Switcher */}
        <div className="flex items-center bg-[#141414] border border-[#222222] p-1 rounded">
          <button
            onClick={() => setActiveSlide('3d')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition ${
              activeSlide === '3d' ? 'bg-[#2DD4BF] text-[#050505] font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Interactive 3D Model
          </button>
          <button
            onClick={() => setActiveSlide('render')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition ${
              activeSlide === 'render' ? 'bg-[#2DD4BF] text-[#050505] font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Photorealistic Render
          </button>
          <button
            onClick={() => setActiveSlide('sustainability')}
            className={`px-4 py-1.5 rounded text-xs font-semibold transition ${
              activeSlide === 'sustainability' ? 'bg-[#2DD4BF] text-[#050505] font-bold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            EDGE Green Performance
          </button>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-4 py-2 bg-[#141414] hover:bg-[#222222] border border-[#333333] text-xs font-semibold text-white rounded transition"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Exit Presentation</span>
        </button>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Visual Stage (3D or Render) */}
        <div className="flex-1 relative bg-[#050505]">
          {activeSlide === '3d' && <Viewer3D project={project} />}

          {activeSlide === 'render' && (
            <div className="w-full h-full flex items-center justify-center p-8 relative">
              <div className="relative max-h-full max-w-full rounded overflow-hidden shadow-2xl border border-[#222222] group">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=85"
                  alt="Presentation Render"
                  className="max-h-[80vh] w-auto object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Letterhead Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                  <div className="bg-[#05070B]/90 backdrop-blur-md border border-[#2DD4BF]/50 rounded-lg p-2.5 flex items-center gap-3 shadow-2xl">
                    <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={APP_LOGO}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                        }}
                        alt="Firm Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-white text-xs font-bold tracking-wide flex items-center gap-2">
                        <span>{project.companyName || 'LORA ARCHITECTURAL & BIM STUDIO'}</span>
                        <span className="text-[9px] text-[#2DD4BF] font-semibold px-1.5 py-0.2 bg-[#2DD4BF]/20 rounded border border-[#2DD4BF]/30">
                          LETTERHEAD
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-300">
                        {project.name} • Master Exterior Perspective • {project.climate.location}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#05070B]/90 backdrop-blur-md border border-[#222222] px-3 py-1.5 rounded text-[10px] text-[#2DD4BF] font-mono hidden md:flex items-center gap-2 shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                    <span>CLIENT PRESENTATION BOARD</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSlide === 'sustainability' && (
            <div className="w-full h-full p-10 overflow-y-auto flex items-center justify-center">
              <div className="max-w-3xl w-full space-y-6 bg-[#0A0A0A] border border-[#222222] p-8 rounded shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded">
                    <Award className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">EDGE Green Building Certified</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      World Bank / IFC Verified Resource Efficiency Standards
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-[#141414] rounded border border-[#222222] text-center">
                    <Sun className="w-6 h-6 text-[#2DD4BF] mx-auto mb-2" />
                    <span className="text-2xl font-black text-[#2DD4BF] font-mono">-{project.sustainability.energySavingsPct}%</span>
                    <span className="text-[11px] text-gray-400 block mt-1">Operational Energy</span>
                  </div>
                  <div className="p-4 bg-[#141414] rounded border border-[#222222] text-center">
                    <Droplets className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <span className="text-2xl font-black text-cyan-400 font-mono">-{project.sustainability.waterSavingsPct}%</span>
                    <span className="text-[11px] text-gray-400 block mt-1">Potable Water</span>
                  </div>
                  <div className="p-4 bg-[#141414] rounded border border-[#222222] text-center">
                    <Leaf className="w-6 h-6 text-[#2DD4BF] mx-auto mb-2" />
                    <span className="text-2xl font-black text-[#2DD4BF] font-mono">-{project.sustainability.embodiedCarbonSavingsPct}%</span>
                    <span className="text-[11px] text-gray-400 block mt-1">Embodied Carbon</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Key Environmental Strategies:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    {project.sustainability.activeStrategies.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-[#141414] rounded border border-[#222222]">
                        <ShieldCheck className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                        <span className="text-[11px] truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Project Story & Specification Drawer */}
        <div className="w-96 bg-[#0A0A0A] border-l border-[#222222] p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#2DD4BF] uppercase tracking-widest block">
                PROJECT SUMMARY
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{project.name}</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">{project.description}</p>
            </div>

            <div className="p-4 bg-[#141414] rounded border border-[#222222] space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#222222]">
                <span className="text-gray-400">Total Floor Area:</span>
                <strong className="text-white font-mono">{totalArea.toFixed(1)} m²</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222222]">
                <span className="text-gray-400">Site Area:</span>
                <strong className="text-white font-mono">{project.site.siteAreaM2} m²</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#222222]">
                <span className="text-gray-400">Architectural Style:</span>
                <strong className="text-[#2DD4BF]">{project.style}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400">Target Budget:</span>
                <strong className="text-[#2DD4BF] font-mono">${project.cost.totalEstimatedCostUSD.toLocaleString()} USD</strong>
              </div>
            </div>

            {/* Room Breakdown */}
            <div>
              <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-2">Space Distribution</h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {project.rooms.map((r) => (
                  <div key={r.id} className="flex justify-between items-center p-2 bg-[#141414] rounded text-xs border border-[#222222]">
                    <span className="text-gray-300 truncate max-w-[180px]">{r.name}</span>
                    <strong className="text-gray-200 font-mono">{r.floorArea.toFixed(1)} m²</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#222222] text-center">
            <span className="text-[10px] text-gray-500 font-mono block">
              Designed with Lora AI Architectural Platform
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
