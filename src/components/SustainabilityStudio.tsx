import React, { useState } from 'react';
import { ArchitecturalProject } from '../types/architecture';
import {
  Leaf,
  Sun,
  Droplets,
  Wind,
  CheckCircle2,
  Award,
  Zap,
  Download,
} from 'lucide-react';
import { computeSustainabilityScore } from '../services/aiGenerator';
import { downloadFile } from '../services/exporter';
import { DataStateBadge } from './DataStateBadge';

interface SustainabilityStudioProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
}

export const SustainabilityStudio: React.FC<SustainabilityStudioProps> = ({
  project,
  setProject,
}) => {
  const [solarPvKwp, setSolarPvKwp] = useState<number>(project.sustainability.solarPvCapacityKwp || 8.5);
  const [rainwaterLiters, setRainwaterLiters] = useState<number>(project.sustainability.rainwaterHarvestingCapacityLiters || 10000);
  const [hasDoubleLowE, setHasDoubleLowE] = useState<boolean>(true);
  const [hasOverhangs, setHasOverhangs] = useState<boolean>(true);
  const [hasMassTimber, setHasMassTimber] = useState<boolean>(true);

  // Recalculate metrics based on sliders
  const currentMetrics = computeSustainabilityScore(
    project,
    solarPvKwp,
    rainwaterLiters,
    hasDoubleLowE,
    hasOverhangs
  );

  const handleApplyToProject = () => {
    setProject((prev) => ({
      ...prev,
      sustainability: currentMetrics,
    }));
  };

  const handleExportEDGE = () => {
    let report = `EDGE GREEN BUILDING COMPLIANCE AUDIT\n`;
    report += `Project: ${project.name}\n`;
    report += `Location: ${project.climate.location}\n`;
    report += `Climate Zone: ${project.climate.climateZone}\n`;
    report += `Audit Date: ${new Date().toLocaleDateString()}\n\n`;

    report += `EDGE CERTIFICATION STATUS: ${currentMetrics.edgeEligible ? 'QUALIFIED FOR EDGE CERTIFICATION' : 'NOT YET QUALIFIED (Requires 20% across all 3 pillars)'}\n\n`;
    report += `1. ENERGY SAVINGS: ${currentMetrics.energySavingsPct}% (Baseline Target: 20%)\n`;
    report += `   - Annual Operational Energy: ${currentMetrics.annualEnergyKwhPerM2} kWh/m²/year\n`;
    report += `   - Rooftop Solar PV: ${solarPvKwp} kWp (Estimated ${currentMetrics.solarAnnualGenerationKwh} kWh/year)\n\n`;

    report += `2. WATER SAVINGS: ${currentMetrics.waterSavingsPct}% (Baseline Target: 20%)\n`;
    report += `   - Annual Water Consumption: ${currentMetrics.annualWaterM3PerOccupant} m³/occupant/year\n`;
    report += `   - Rainwater Harvesting Capacity: ${rainwaterLiters.toLocaleString()} Liters\n\n`;

    report += `3. EMBODIED CARBON REDUCTION: ${currentMetrics.embodiedCarbonSavingsPct}% (Baseline Target: 20%)\n`;
    report += `   - Embodied Carbon: ${currentMetrics.embodiedCarbonKgCO2ePerM2} kgCO2e/m²\n\n`;

    report += `ACTIVE PASSIVE & ACTIVE STRATEGIES:\n`;
    currentMetrics.activeStrategies.forEach((s) => {
      report += ` - ${s}\n`;
    });

    downloadFile(report, `${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_EDGE_Report.txt`, 'text/plain');
  };

  return (
    <div className="flex-1 bg-[#050505] p-6 overflow-y-auto text-[#E0E0E0]">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-[#0A0A0A] border border-[#222222] rounded-md p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded-md">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">EDGE-Inspired Green Building Studio</h2>
                <DataStateBadge state="ESTIMATED" label="SIM ESTIMATED" size="sm" />
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20">
                  IFC Standard
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Bioclimatic energy simulation, water conservation, and embodied carbon optimization for {project.climate.location}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportEDGE}
              className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#333333] hover:border-gray-500 text-gray-300 text-xs font-semibold rounded-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Export EDGE Audit</span>
            </button>
            <button
              onClick={handleApplyToProject}
              className="flex items-center gap-2 px-4 py-2 bg-[#2DD4BF] hover:brightness-110 text-[#050505] text-xs font-bold rounded-md shadow-md shadow-[#2DD4BF]/20 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Parameters to Project</span>
            </button>
          </div>
        </div>

        {/* 3 Core EDGE Pillars Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Energy Pillar */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-md p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Energy Savings
              </span>
              <DataStateBadge state="ESTIMATED" size="xs" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {currentMetrics.energySavingsPct}%
              </span>
              <span className="text-xs text-gray-400">vs Base Code</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-[#141414] rounded-full mt-3 overflow-hidden border border-[#222222]">
              <div
                className="h-full bg-[#2DD4BF] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentMetrics.energySavingsPct * 1.5)}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#222222] flex justify-between text-xs text-gray-400">
              <span>Annual Intensity:</span>
              <strong className="text-[#E0E0E0] font-mono">{currentMetrics.annualEnergyKwhPerM2} kWh/m²/yr</strong>
            </div>
          </div>

          {/* Water Pillar */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-md p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                Water Savings
              </span>
              <DataStateBadge state="ESTIMATED" size="xs" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {currentMetrics.waterSavingsPct}%
              </span>
              <span className="text-xs text-gray-400">vs Base Code</span>
            </div>

            <div className="w-full h-2 bg-[#141414] rounded-full mt-3 overflow-hidden border border-[#222222]">
              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentMetrics.waterSavingsPct * 1.5)}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#222222] flex justify-between text-xs text-gray-400">
              <span>Water Intensity:</span>
              <strong className="text-[#E0E0E0] font-mono">{currentMetrics.annualWaterM3PerOccupant} m³/person/yr</strong>
            </div>
          </div>

          {/* Embodied Carbon Pillar */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-md p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4" />
                Embodied Carbon
              </span>
              <DataStateBadge state="ESTIMATED" label="EPD ESTIMATE" size="xs" />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono">
                {currentMetrics.embodiedCarbonSavingsPct}%
              </span>
              <span className="text-xs text-gray-400">vs Base Code</span>
            </div>

            <div className="w-full h-2 bg-[#141414] rounded-full mt-3 overflow-hidden border border-[#222222]">
              <div
                className="h-full bg-[#2DD4BF] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentMetrics.embodiedCarbonSavingsPct * 1.5)}%` }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-[#222222] flex justify-between text-xs text-gray-400">
              <span>Embodied Carbon:</span>
              <strong className="text-[#E0E0E0] font-mono">{currentMetrics.embodiedCarbonKgCO2ePerM2} kgCO2e/m²</strong>
            </div>
          </div>
        </div>

        {/* Interactive Bioclimatic Strategy Tuning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Energy & Water Systems */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#2DD4BF]" />
              Renewables & Active Sustainable Systems
            </h3>

            {/* Solar PV Slider */}
            <div className="p-3.5 bg-[#141414] border border-[#222222] rounded-md space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300">Rooftop Solar PV Array Capacity</span>
                <strong className="text-[#2DD4BF] font-mono text-sm">{solarPvKwp} kWp</strong>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={solarPvKwp}
                onChange={(e) => setSolarPvKwp(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-[#2DD4BF]"
              />
              <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                <span>0 kWp (Grid only)</span>
                <span className="text-[#2DD4BF] font-medium">Est. Gen: {Math.round(solarPvKwp * 1750).toLocaleString()} kWh/yr</span>
                <span>25 kWp (Net-Positive)</span>
              </div>
            </div>

            {/* Rainwater Harvesting Slider */}
            <div className="p-3.5 bg-[#141414] border border-[#222222] rounded-md space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-300">Rainwater Storage Tank Capacity</span>
                <strong className="text-cyan-400 font-mono text-sm">{rainwaterLiters.toLocaleString()} Liters</strong>
              </div>
              <input
                type="range"
                min="0"
                max="30000"
                step="1000"
                value={rainwaterLiters}
                onChange={(e) => setRainwaterLiters(parseInt(e.target.value))}
                className="w-full h-2 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                <span>0 L</span>
                <span className="text-cyan-300 font-medium">Covers Toilet + Garden Irrigation</span>
                <span>30,000 L</span>
              </div>
            </div>

            {/* Passive Architectural Toggles */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between p-3 bg-[#141414] border border-[#222222] rounded-md cursor-pointer hover:border-[#333333] transition">
                <span className="text-xs text-gray-300 font-medium">Double Low-E Spectrally Selective Glazing</span>
                <input
                  type="checkbox"
                  checked={hasDoubleLowE}
                  onChange={(e) => setHasDoubleLowE(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2DD4BF] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#141414] border border-[#222222] rounded-md cursor-pointer hover:border-[#333333] transition">
                <span className="text-xs text-gray-300 font-medium">1.2m Deep Solar Overhangs on North Facades</span>
                <input
                  type="checkbox"
                  checked={hasOverhangs}
                  onChange={(e) => setHasOverhangs(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2DD4BF] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-[#141414] border border-[#222222] rounded-md cursor-pointer hover:border-[#333333] transition">
                <span className="text-xs text-gray-300 font-medium">FSC Mass Timber CLT Floor & Roof Slabs</span>
                <input
                  type="checkbox"
                  checked={hasMassTimber}
                  onChange={(e) => setHasMassTimber(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#2DD4BF] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Climate Context & Passive Design Recommendations */}
          <div className="bg-[#0A0A0A] border border-[#222222] rounded-md p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-[#2DD4BF]" />
              Location Climate Intelligence ({project.climate.location})
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#141414] border border-[#222222] rounded-md">
                <span className="text-[10px] text-gray-400 block uppercase">Solar Irradiance</span>
                <strong className="text-[#2DD4BF] text-sm font-mono">{project.climate.solarIrradianceKwhM2Day} kWh/m²/day</strong>
              </div>
              <div className="p-3 bg-[#141414] border border-[#222222] rounded-md">
                <span className="text-[10px] text-gray-400 block uppercase">Annual Rainfall</span>
                <strong className="text-cyan-400 text-sm font-mono">{project.climate.annualRainfallMm} mm / yr</strong>
              </div>
              <div className="p-3 bg-[#141414] border border-[#222222] rounded-md">
                <span className="text-[10px] text-gray-400 block uppercase">Avg Summer / Winter</span>
                <strong className="text-[#E0E0E0] text-sm font-mono">{project.climate.averageSummerTempC}°C / {project.climate.averageWinterTempC}°C</strong>
              </div>
              <div className="p-3 bg-[#141414] border border-[#222222] rounded-md">
                <span className="text-[10px] text-gray-400 block uppercase">Prevailing Breeze</span>
                <strong className="text-[#2DD4BF] text-xs font-mono">{project.climate.prevailingWindDirection}</strong>
              </div>
            </div>

            <div className="p-4 bg-[#141414] border border-[#222222] rounded-md space-y-2">
              <h4 className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">
                Passive Bioclimatic Architectural Directives:
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {project.climate.passiveDesignRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF] mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
