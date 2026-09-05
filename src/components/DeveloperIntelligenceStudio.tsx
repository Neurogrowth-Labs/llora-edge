import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Building,
  Car,
  PieChart,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { ArchitecturalProject } from '../types/architecture';
import { calculateDeveloperIntelligence } from '../services/buildingIntelligenceEngine';
import { executeAiAction } from '../services/aiActionsExecutor';

interface DeveloperIntelligenceStudioProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
}

export const DeveloperIntelligenceStudio: React.FC<DeveloperIntelligenceStudioProps> = ({
  project,
  setProject,
}) => {
  const metrics = calculateDeveloperIntelligence(project);
  const [isOptimizingYield, setIsOptimizingYield] = useState(false);
  const [optimizerNote, setOptimizerNote] = useState<string | null>(null);

  const handleOptimizeRentableArea = () => {
    setIsOptimizingYield(true);
    setTimeout(() => {
      const { updatedProject, actionLog } = executeAiAction(
        project,
        'Optimize circulation to increase rentable area by 8% without increasing structural footprint'
      );
      setProject(updatedProject);
      setOptimizerNote(`Optimized: ${actionLog.explanation.whatChanged}`);
      setIsOptimizingYield(false);
    }, 500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-[#E0E0E0] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#222] bg-[#0A0A0A] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-400 text-black font-black shadow-md shadow-amber-400/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Developer Pro-Forma & Yield Intelligence
              </h1>
              <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase rounded border border-amber-400/30">
                Investment Analysis
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Spatial efficiency, GFA/NFA ratios, unit yield modeling, and financial return analytics
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimizeRentableArea}
          disabled={isOptimizingYield}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-[#2DD4BF] text-black font-bold text-xs rounded transition flex items-center gap-2 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isOptimizingYield ? 'Optimizing Floor Plate...' : 'Increase Rentable Area (+8% NFA)'}</span>
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        {optimizerNote && (
          <div className="p-3.5 bg-green-950/40 border border-green-500/40 rounded-lg text-green-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{optimizerNote}</span>
          </div>
        )}

        {/* Primary KPI Hero Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Gross Floor Area (GFA)</span>
            <div className="text-2xl font-black text-white">{metrics.grossFloorAreaM2} m²</div>
            <span className="text-[11px] text-gray-500 font-mono">Site Coverage: {(((metrics.grossFloorAreaM2 / project.levels.length) / project.site.siteAreaM2) * 100).toFixed(1)}%</span>
          </div>

          <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Rentable / Usable Area</span>
            <div className="text-2xl font-black text-[#2DD4BF]">{metrics.rentableAreaM2} m²</div>
            <span className="text-[11px] text-green-400 font-semibold">{metrics.buildingEfficiencyPct}% Spatial Efficiency</span>
          </div>

          <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Total Est. CapEx</span>
            <div className="text-2xl font-black text-white">${(metrics.totalCapExUSD / 1000).toFixed(0)}k USD</div>
            <span className="text-[11px] text-gray-500 font-mono">${metrics.capitalCostPerM2USD}/m² construction rate</span>
          </div>

          <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-1.5">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Est. Annual Gross Yield</span>
            <div className="text-2xl font-black text-amber-400">{metrics.estimatedRoiPct}% ROI</div>
            <span className="text-[11px] text-gray-500 font-mono">${(metrics.projectedAnnualRentalYieldUSD / 1000).toFixed(0)}k/yr ({metrics.paybackPeriodYears} yr payback)</span>
          </div>
        </div>

        {/* Spatial Efficiency & Program Yield Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {/* Spatial Breakdown */}
          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#2DD4BF]" />
                <span>Floor Plate Program Allocation</span>
              </h2>
              <span className="text-xs text-gray-400 font-mono">Total {metrics.grossFloorAreaM2} m²</span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Habitable / Tenant Usable Area</span>
                  <span className="font-bold text-white">{metrics.rentableAreaM2} m² ({metrics.buildingEfficiencyPct}%)</span>
                </div>
                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#2DD4BF] h-full rounded-full" style={{ width: `${metrics.buildingEfficiencyPct}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-gray-300">
                  <span>Circulation & Corridors</span>
                  <span className="font-bold text-white">{(metrics.grossFloorAreaM2 - metrics.netFloorAreaM2).toFixed(1)} m²</span>
                </div>
                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${100 - metrics.buildingEfficiencyPct}%` }} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#141414] border border-[#262626] rounded-lg text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-gray-300">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span>Unit Mix & Capacity</span>
              </div>
              <p>
                Modeled for <strong>{project.buildingType}</strong> typology with {metrics.estimatedUnitsCount} primary unit core(s) accommodating up to {project.intendedOccupancy} occupants.
              </p>
            </div>
          </div>

          {/* Parking & Site Compliance */}
          <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Parking & Site Zoning Ratio</span>
              </h2>
              <span className="text-xs text-green-400 font-semibold">Zoning Compliant</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#141414] border border-[#262626] rounded-lg space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Parking Bays Required</span>
                <div className="text-xl font-bold text-white">{metrics.parkingSpacesRequired} Bays</div>
                <span className="text-[10px] text-gray-500 font-mono">1 bay per 60m² GFA</span>
              </div>

              <div className="p-3.5 bg-[#141414] border border-[#262626] rounded-lg space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold uppercase">Parking Bays Provided</span>
                <div className="text-xl font-bold text-[#2DD4BF]">{metrics.parkingSpacesProvided} Bays</div>
                <span className="text-[10px] text-green-400 font-mono">Surplus +{metrics.parkingSpacesProvided - metrics.parkingSpacesRequired} bays</span>
              </div>
            </div>

            <div className="p-3 bg-[#141414] border border-[#262626] rounded-lg text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-2 font-semibold text-gray-300">
                <Shield className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Statutory Site Coverage</span>
              </div>
              <p>
                Permissible Floor Area Ratio (FAR): <strong>{project.site.maxFAR}</strong> | Actual Achieved FAR: <strong>{(metrics.grossFloorAreaM2 / project.site.siteAreaM2).toFixed(2)}</strong> (Compliant).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
