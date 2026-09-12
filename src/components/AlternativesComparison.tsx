import React, { useState } from 'react';
import { ArchitecturalProject, DesignOption } from '../types/architecture';
import { generateDesignAlternatives } from '../services/aiGenerator';
import {
  Sparkles,
  Check,
  Zap,
  Droplets,
  DollarSign,
  Maximize2,
  Leaf,
  Sun,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface AlternativesComparisonProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  onClose: () => void;
}

export const AlternativesComparison: React.FC<AlternativesComparisonProps> = ({
  project,
  setProject,
  onClose,
}) => {
  const alternatives = generateDesignAlternatives(project);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(alternatives[1].id); // default to Option B (EDGE)

  const handleApplyAlternative = (option: DesignOption) => {
    setProject((prev) => ({
      ...prev,
      sustainability: {
        ...prev.sustainability,
        energySavingsPct: option.energySavingsPct,
        waterSavingsPct: option.waterSavingsPct,
        edgeEligible: option.energySavingsPct >= 20 && option.waterSavingsPct >= 20,
      },
      cost: {
        ...prev.cost,
        totalEstimatedCostUSD: option.estimatedCostUSD,
      },
      updatedAt: new Date().toISOString(),
    }));
    onClose();
  };

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2DD4BF] text-[#050505] rounded font-bold shadow-md shadow-[#2DD4BF]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Design Design Alternatives & Trade-Off Matrix</h2>
              <p className="text-xs text-gray-400 mt-1">
                Lora Design synthesized 5 distinct architectural configurations optimizing spatial volume, capital cost, and EDGE sustainability.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#141414] border border-[#222222] hover:border-[#333333] rounded text-xs text-gray-300 transition"
          >
            Back to Editor
          </button>
        </div>

        {/* 5 Options Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {alternatives.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`rounded p-4 border flex flex-col justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#141414] border-[#2DD4BF] ring-1 ring-[#2DD4BF]/40 shadow-2xl scale-[1.02]'
                    : 'bg-[#0A0A0A] border-[#222222] hover:border-[#333333] hover:bg-[#141414]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF] font-mono">
                      {opt.focus}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#2DD4BF] text-[#050505] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-white">{opt.name.split('—')[0]}</h3>
                    <span className="text-xs text-[#2DD4BF] font-medium block">{opt.name.split('—')[1]}</span>
                    <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-3">{opt.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-[#222222] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gross Area:</span>
                      <strong className="text-white font-mono">{opt.floorAreaM2} m²</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Est. Budget:</span>
                      <strong className="text-[#2DD4BF] font-mono">${(opt.estimatedCostUSD / 1000).toFixed(0)}k</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Energy Cut:</span>
                      <strong className="text-amber-400 font-mono">-{opt.energySavingsPct}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Water Cut:</span>
                      <strong className="text-cyan-400 font-mono">-{opt.waterSavingsPct}%</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyAlternative(opt);
                  }}
                  className={`w-full mt-4 py-2 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#2DD4BF] hover:brightness-110 text-[#050505] shadow-md shadow-[#2DD4BF]/20'
                      : 'bg-[#141414] hover:bg-[#222222] text-[#E0E0E0] border border-[#222222]'
                  }`}
                >
                  <span>Select & Apply</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Deep Comparative Analysis Matrix Table */}
        <div className="bg-[#0A0A0A] border border-[#222222] rounded p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
            Full Multi-Criteria Performance Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#222222] text-gray-400 font-mono text-[10px] uppercase">
                  <th className="py-3 px-3">Design Metric</th>
                  {alternatives.map((opt) => (
                    <th key={opt.id} className="py-3 px-3">
                      {opt.name.split('—')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-gray-300">
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-400 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    Gross Floor Area (m²)
                  </td>
                  {alternatives.map((opt) => (
                    <td key={opt.id} className="py-3 px-3 font-mono font-bold text-white">
                      {opt.floorAreaM2} m²
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-400 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    Capital Construction Cost (USD)
                  </td>
                  {alternatives.map((opt) => (
                    <td key={opt.id} className="py-3 px-3 font-mono font-bold text-[#2DD4BF]">
                      ${opt.estimatedCostUSD.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Operational Energy Reduction
                  </td>
                  {alternatives.map((opt) => (
                    <td key={opt.id} className="py-3 px-3 font-mono font-bold text-amber-400">
                      -{opt.energySavingsPct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-400 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    Potable Water Reduction
                  </td>
                  {alternatives.map((opt) => (
                    <td key={opt.id} className="py-3 px-3 font-mono font-bold text-cyan-400">
                      -{opt.waterSavingsPct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-400 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    Natural Daylight Autonomy
                  </td>
                  {alternatives.map((opt) => (
                    <td key={opt.id} className="py-3 px-3 font-mono text-[#E0E0E0]">
                      {opt.daylightScorePct}%
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-400 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    EDGE Certification Tier
                  </td>
                  {alternatives.map((opt) => (
                    <td key={opt.id} className="py-3 px-3 text-[#2DD4BF] font-semibold">
                      {opt.sustainabilityRating}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
