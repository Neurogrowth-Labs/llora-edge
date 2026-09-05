import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Check,
  Globe,
  Leaf,
  DollarSign,
  Zap,
  Eye,
  Layers,
  X,
} from 'lucide-react';
import { ArchitecturalProject, DesignDNA } from '../types/architecture';

interface DesignDnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
}

export const DesignDnaModal: React.FC<DesignDnaModalProps> = ({
  isOpen,
  onClose,
  project,
  setProject,
}) => {
  const initialDna: DesignDNA = project.dna || {
    projectTypology: `${project.buildingType} Bioclimatic Development`,
    architecturalLanguage: `${project.style} Regional Modernism`,
    priorities: {
      sustainabilityPct: 40,
      costPct: 25,
      aestheticsPct: 20,
      speedPct: 15,
    },
    climateContext: `${project.climate.climateZone} (${project.climate.location})`,
    targetCertification: 'EDGE Advanced',
    targetStoreys: project.levels.length || 2,
    occupancyTarget: project.intendedOccupancy || 6,
    materialPhilosophy: 'Low-embodied carbon, locally sourced earth & timber, high thermal mass envelopes with spectrally selective double glazing.',
  };

  const [dna, setDna] = useState<DesignDNA>(initialDna);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveDna = () => {
    setProject((prev) => ({
      ...prev,
      dna,
      updatedAt: new Date().toISOString(),
    }));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handlePriorityChange = (key: keyof DesignDNA['priorities'], value: number) => {
    setDna((prev) => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [key]: value,
      },
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#2DD4BF] flex items-center justify-center text-black font-black">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Project Design DNA</h2>
              <p className="text-[11px] text-gray-400">
                Persistent architectural priorities and algorithmic constraints governing AI design decisions
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-[#D1D5DB]">
          {/* Typology & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Project Typology
              </label>
              <input
                type="text"
                value={dna.projectTypology}
                onChange={(e) => setDna({ ...dna, projectTypology: e.target.value })}
                className="w-full bg-[#171717] border border-[#333] rounded px-3 py-2 text-white focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Architectural Style / Language
              </label>
              <input
                type="text"
                value={dna.architecturalLanguage}
                onChange={(e) => setDna({ ...dna, architecturalLanguage: e.target.value })}
                className="w-full bg-[#171717] border border-[#333] rounded px-3 py-2 text-white focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
          </div>

          {/* Design Priority Sliders */}
          <div className="bg-[#141414] p-4 rounded-lg border border-[#222] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <Sliders className="w-4 h-4 text-[#2DD4BF]" />
                <span>Multi-Objective Priorities</span>
              </div>
              <span className="text-[11px] text-gray-400">Total: {dna.priorities.sustainabilityPct + dna.priorities.costPct + dna.priorities.aestheticsPct + dna.priorities.speedPct}%</span>
            </div>

            {/* Sustainability Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-green-400 font-medium">
                  <Leaf className="w-3.5 h-3.5" /> Sustainability & Resource Efficiency
                </span>
                <span className="font-mono font-bold text-white">{dna.priorities.sustainabilityPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.priorities.sustainabilityPct}
                onChange={(e) => handlePriorityChange('sustainabilityPct', parseInt(e.target.value))}
                className="w-full accent-[#2DD4BF] bg-[#262626] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Cost Efficiency Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <DollarSign className="w-3.5 h-3.5" /> Capital Cost & Value Engineering
                </span>
                <span className="font-mono font-bold text-white">{dna.priorities.costPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.priorities.costPct}
                onChange={(e) => handlePriorityChange('costPct', parseInt(e.target.value))}
                className="w-full accent-amber-400 bg-[#262626] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Aesthetics Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                  <Eye className="w-3.5 h-3.5" /> Aesthetics & Architectural Expression
                </span>
                <span className="font-mono font-bold text-white">{dna.priorities.aestheticsPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.priorities.aestheticsPct}
                onChange={(e) => handlePriorityChange('aestheticsPct', parseInt(e.target.value))}
                className="w-full accent-sky-400 bg-[#262626] h-1.5 rounded cursor-pointer"
              />
            </div>

            {/* Speed / Constructability Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-purple-400 font-medium">
                  <Zap className="w-3.5 h-3.5" /> Constructability & Prefabrication Speed
                </span>
                <span className="font-mono font-bold text-white">{dna.priorities.speedPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dna.priorities.speedPct}
                onChange={(e) => handlePriorityChange('speedPct', parseInt(e.target.value))}
                className="w-full accent-purple-400 bg-[#262626] h-1.5 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Target Green Certification & Regional Climate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Target Green Standard
              </label>
              <select
                value={dna.targetCertification}
                onChange={(e) => setDna({ ...dna, targetCertification: e.target.value as any })}
                className="w-full bg-[#171717] border border-[#333] rounded px-3 py-2 text-white focus:border-[#2DD4BF] focus:outline-none"
              >
                <option value="EDGE Advanced">EDGE Advanced (≥40% Energy Savings)</option>
                <option value="EDGE Certified">EDGE Standard (≥20% Triple Baseline)</option>
                <option value="Green Star SA 5-Star">Green Star SA 5-Star (Excellence)</option>
                <option value="LEED Platinum">LEED Platinum / Gold Standard</option>
                <option value="Net Zero Carbon">Net Zero Carbon Operational</option>
                <option value="Standard Code">Standard Municipal Code</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Climate Zone Context
              </label>
              <div className="flex items-center gap-2 p-2 bg-[#171717] border border-[#333] rounded text-gray-300">
                <Globe className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <span className="truncate">{dna.climateContext}</span>
              </div>
            </div>
          </div>

          {/* Material & Construction Philosophy */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Material & Construction Philosophy
            </label>
            <textarea
              rows={3}
              value={dna.materialPhilosophy}
              onChange={(e) => setDna({ ...dna, materialPhilosophy: e.target.value })}
              className="w-full bg-[#171717] border border-[#333] rounded px-3 py-2 text-white focus:border-[#2DD4BF] focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] bg-[#141414] flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Updated DNA will automatically align AI suggestions, alternatives, and generative engines.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDna}
              className="px-4 py-1.5 bg-[#2DD4BF] hover:bg-[#22bca6] text-black font-bold text-xs rounded transition flex items-center gap-1.5 shadow-md shadow-[#2DD4BF]/20"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{savedSuccess ? 'DNA Saved' : 'Apply Design DNA'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
