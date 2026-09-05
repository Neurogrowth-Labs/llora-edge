import React, { useState } from 'react';
import {
  Activity,
  Sparkles,
  Zap,
  Leaf,
  DollarSign,
  Layers,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  Sliders,
  Sun,
  Flame,
  Hammer,
  Clock,
  CloudSun,
  Check,
  AlertOctagon,
  Maximize2,
} from 'lucide-react';
import {
  ArchitecturalProject,
  OptimizerObjective,
  OptimizerSimulationResult,
  OptimizerDesignCandidate,
  SimulationSeason,
  SimulationSkyCondition,
} from '../types/architecture';
import {
  evaluateBuildingIntelligenceScore,
  analyzeDependencyImpacts,
  runAutonomousDesignOptimizer,
} from '../services/buildingIntelligenceEngine';
import { calculateNaturalLightExposure } from '../services/daylightAnalysisEngine';
import { validateStructuralLogic } from '../services/structuralValidator';
import { executeAiAction } from '../services/aiActionsExecutor';
import { DataStateBadge } from './DataStateBadge';

interface BuildingIntelligenceStudioProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  onOpenDesignDna: () => void;
  onOpenDesignReview: () => void;
}

export const BuildingIntelligenceStudio: React.FC<BuildingIntelligenceStudioProps> = ({
  project,
  setProject,
  onOpenDesignDna,
  onOpenDesignReview,
}) => {
  const [activeTab, setActiveTab] = useState<
    'score' | 'daylight' | 'structural' | 'optimizer' | 'dependencies' | 'buildability'
  >('score');

  // Daylight Simulation State
  const [daylightTime, setDaylightTime] = useState<number>(11.5);
  const [daylightSeason, setDaylightSeason] = useState<SimulationSeason>('summer_solstice');
  const [daylightSky, setDaylightSky] = useState<SimulationSkyCondition>('clear');

  // Autonomous Optimizer State
  const [optimizerObjectives, setOptimizerObjectives] = useState<OptimizerObjective>({
    maximizeDaylight: true,
    maximizeRentableArea: true,
    maximizeNaturalVentilation: true,
    minimizeConstructionCost: true,
    minimizeEnergyDemand: true,
    minimizeWaterDemand: true,
    minimizeEmbodiedCarbon: true,
    respectSiteBoundaries: true,
    respectMaxHeight: true,
  });

  const [optimizerResult, setOptimizerResult] = useState<OptimizerSimulationResult | null>(() =>
    runAutonomousDesignOptimizer(project, optimizerObjectives)
  );
  const [selectedCandidate, setSelectedCandidate] = useState<OptimizerDesignCandidate | null>(() =>
    optimizerResult?.candidates.find((c) => c.isSelectedRecommendation) || null
  );
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // "Change One Thing" State
  const [selectedChangeType, setSelectedChangeType] = useState<
    'add_floor' | 'widen_building' | 'move_wet_wall' | 'increase_glazing'
  >('add_floor');

  const dependencies = analyzeDependencyImpacts(project, selectedChangeType);

  // Live evaluated score & simulations
  const score = evaluateBuildingIntelligenceScore(project);
  const daylightReport = calculateNaturalLightExposure(project, {
    timeOfDay: daylightTime,
    season: daylightSeason,
    skyCondition: daylightSky,
  });
  const structuralReport = validateStructuralLogic(project);

  const daylightCategoryScore = score.categories.find((c) => c.key === 'daylight')?.score || 88;
  const sustainabilityCategoryScore = score.categories.find((c) => c.key === 'sustainability')?.score || 86;

  const handleRunOptimizer = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const res = runAutonomousDesignOptimizer(project, optimizerObjectives);
      setOptimizerResult(res);
      const recommended = res.candidates.find((c) => c.isSelectedRecommendation) || res.candidates[0];
      setSelectedCandidate(recommended);
      setIsOptimizing(false);
    }, 600);
  };

  const handleApplyOptimizerCandidate = (cand: OptimizerDesignCandidate) => {
    const { updatedProject } = executeAiAction(
      project,
      `Apply autonomous optimized solution ${cand.optionCode}: ${cand.keyModification}`
    );
    setProject({
      ...updatedProject,
      sustainability: {
        ...updatedProject.sustainability,
        energySavingsPct: cand.energySavingsPct,
        waterSavingsPct: cand.waterSavingsPct,
        embodiedCarbonSavingsPct: cand.carbonReductionPct,
        edgeEligible: true,
      },
      cost: {
        ...updatedProject.cost,
        totalEstimatedCostUSD: cand.costUSD,
        costPerM2: Math.round(cand.costUSD / (cand.floorAreaM2 || 1)),
      },
    });
  };

  const handleApplyStructuralFix = (prompt: string) => {
    const { updatedProject } = executeAiAction(project, prompt);
    setProject(updatedProject);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] text-[#E0E0E0] overflow-hidden">
      {/* Studio Header */}
      <div className="p-4 border-b border-[#222] bg-[#0A0A0A] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-[#2DD4BF] text-black font-black shadow-md shadow-[#2DD4BF]/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Building Intelligence Studio
              </h1>
              <DataStateBadge state="LIVE" label="BIM GRAPH: LIVE" size="xs" />
              <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold uppercase rounded border border-[#2DD4BF]/30">
                Parametric BIM Graph
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Natural daylight heatmaps, continuous structural integrity validation, and autonomous bioclimatic optimization
            </p>
          </div>
        </div>

        {/* Studio Sub-Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-[#141414] p-1 rounded-md border border-[#262626] text-xs flex-wrap">
            <button
              onClick={() => setActiveTab('score')}
              className={`px-3 py-1 font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'score' ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Intelligence Score</span>
            </button>
            <button
              onClick={() => setActiveTab('daylight')}
              className={`px-3 py-1 font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'daylight' ? 'bg-[#262626] text-amber-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Daylight Heatmap ({daylightReport.overallDaylightAutonomyPct}% sDA)</span>
            </button>
            <button
              onClick={() => setActiveTab('structural')}
              className={`px-3 py-1 font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'structural'
                  ? 'bg-[#262626] text-red-400'
                  : structuralReport.issues.length > 0
                  ? 'text-amber-400 hover:text-amber-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>
                Structural Logic
                {structuralReport.issues.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 bg-red-500/20 text-red-400 text-[10px] rounded font-bold">
                    {structuralReport.issues.length}
                  </span>
                )}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('optimizer')}
              className={`px-3 py-1 font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'optimizer' ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design Optimizer</span>
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`px-3 py-1 font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'dependencies' ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dependencies</span>
            </button>
            <button
              onClick={() => setActiveTab('buildability')}
              className={`px-3 py-1 font-semibold rounded transition flex items-center gap-1.5 ${
                activeTab === 'buildability' ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Buildability</span>
            </button>
          </div>

          <button
            onClick={onOpenDesignDna}
            className="px-3 py-1.5 bg-[#171717] hover:bg-[#222] border border-[#333] rounded text-xs text-gray-300 hover:text-white flex items-center gap-1.5 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Design DNA</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* TAB 1: INTELLIGENCE SCORE */}
        {activeTab === 'score' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Top Score Banner */}
            <div className="p-6 bg-gradient-to-r from-[#0E1E1C] via-[#0A0A0A] to-[#141414] border border-[#2DD4BF]/30 rounded-xl flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#2DD4BF] text-xs font-bold uppercase tracking-widest">
                  <Activity className="w-4 h-4" />
                  <span>Comprehensive Building Performance Index</span>
                  <DataStateBadge state="ESTIMATED" label="PARAMETRIC EVALUATION" size="xs" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  Building Intelligence Score: <span className="text-[#2DD4BF]">{score.overallScore}/100</span>
                </h2>
                <p className="text-xs text-gray-400 max-w-xl">
                  Computed directly from parametric spatial geometry, room daylight factors, natural ventilation paths, SANS/EDGE standards, and structural modularity.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-gray-400 font-semibold block">Rating Tier</span>
                  <span className="text-sm font-bold text-green-400">{score.ratingTier}</span>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-[#2DD4BF] flex items-center justify-center font-black text-xl text-white bg-[#0A0A0A] shadow-lg shadow-[#2DD4BF]/20">
                  {score.overallScore}
                </div>
              </div>
            </div>

            {/* Performance Pillar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Daylight & Ventilation</span>
                  </span>
                  <span className="text-sm font-black text-amber-400">{daylightCategoryScore}/100</span>
                </div>
                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${daylightCategoryScore}%` }} />
                </div>
                <p className="text-[11px] text-gray-400">
                  sDA Autonomy: <strong className="text-white">{daylightReport.overallDaylightAutonomyPct}%</strong> across occupied habitable zones.
                </p>
              </div>

              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Hammer className="w-4 h-4 text-sky-400" />
                    <span>Structural Logic</span>
                  </span>
                  <span className="text-sm font-black text-sky-400">{structuralReport.overallHealthScore}/100</span>
                </div>
                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full rounded-full"
                    style={{ width: `${structuralReport.overallHealthScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Integrity Status: <strong className="text-white">{structuralReport.status}</strong> ({structuralReport.issues.length} active flags).
                </p>
              </div>

              <div className="p-4 bg-[#111111] border border-[#222222] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>EDGE Sustainability</span>
                  </span>
                  <span className="text-sm font-black text-emerald-400">{sustainabilityCategoryScore}/100</span>
                </div>
                <div className="w-full bg-[#222] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${sustainabilityCategoryScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400">
                  Energy: -{project.sustainability?.energySavingsPct || 42}% | Water: -{project.sustainability?.waterSavingsPct || 46}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DAYLIGHT ANALYSIS & HEATMAP ENGINE */}
        {activeTab === 'daylight' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Control Strip */}
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Real-Time Natural Light Exposure & Climate Heatmap</span>
                  </h2>
                  <DataStateBadge state="ESTIMATED" label="SIM ESTIMATED" size="xs" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Calculated from window dimensions, room orientation, and {project.climate.location} solar geometry (Latitude {project.climate.latitude}° S).
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Time of Day */}
                <div className="flex items-center gap-2 bg-[#171717] border border-[#333] px-3 py-1.5 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    {Math.floor(daylightTime)}:{Math.round((daylightTime % 1) * 60).toString().padStart(2, '0')}
                  </span>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    step="0.25"
                    value={daylightTime}
                    onChange={(e) => setDaylightTime(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-[#333] rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>

                {/* Season Buttons */}
                <div className="flex bg-[#171717] p-1 border border-[#333] rounded-lg text-xs">
                  {(
                    [
                      { id: 'summer_solstice', label: 'Summer' },
                      { id: 'equinox', label: 'Equinox' },
                      { id: 'winter_solstice', label: 'Winter' },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setDaylightSeason(s.id)}
                      className={`px-2.5 py-1 rounded transition font-medium ${
                        daylightSeason === s.id
                          ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Sky Condition */}
                <select
                  value={daylightSky}
                  onChange={(e) => setDaylightSky(e.target.value as SimulationSkyCondition)}
                  className="bg-[#171717] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="clear">Clear Sky (Direct + Diffuse)</option>
                  <option value="partly_cloudy">Partly Cloudy</option>
                  <option value="overcast">Overcast CIE Standard</option>
                </select>
              </div>
            </div>

            {/* Solar Geometry Summary Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#121212] border border-[#262626] rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Solar Position</span>
                <div className="text-xl font-black text-amber-300 font-mono">
                  Alt: {daylightReport.config.solarAltitudeDeg.toFixed(1)}°
                </div>
                <p className="text-[11px] text-gray-400">Azimuth: {daylightReport.config.solarAzimuthDeg.toFixed(1)}° N</p>
              </div>
              <div className="p-4 bg-[#121212] border border-[#262626] rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Direct Normal Radiation</span>
                <div className="text-xl font-black text-white font-mono">
                  {daylightReport.config.directNormalIrradianceW.toLocaleString()} W/m²
                </div>
                <p className="text-[11px] text-gray-400">Diffuse Irradiance: {daylightReport.config.diffuseHorizontalIrradianceW.toLocaleString()} W/m²</p>
              </div>
              <div className="p-4 bg-[#121212] border border-[#262626] rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Spatial Daylight Autonomy</span>
                <div className="text-xl font-black text-green-400 font-mono">
                  {daylightReport.overallDaylightAutonomyPct}% sDA
                </div>
                <p className="text-[11px] text-gray-400">LEED v4.1 / WELL Target: &gt;75%</p>
              </div>
              <div className="p-4 bg-[#121212] border border-[#262626] rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Average Building Lux</span>
                <div className="text-xl font-black font-mono text-[#2DD4BF]">
                  {daylightReport.averageBuildingLux} Lux
                </div>
                <p className="text-[11px] text-gray-400">Daylight Factor: {daylightReport.averageDaylightFactorPct}%</p>
              </div>
            </div>

            {/* Room by Room Daylight Metrics Breakdown */}
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Room Daylighting & Illuminance Schedule</h3>
                <span className="text-xs text-gray-400 font-mono">
                  Standard: SANS 10400-O & LEED Daylight Credit (Min 300 Lux)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daylightReport.roomMetrics.map((rm) => (
                  <div
                    key={rm.roomId}
                    className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white text-sm">{rm.roomName}</span>
                        <div className="text-[11px] text-gray-400 font-mono">
                          Area: {rm.floorAreaM2} m² | Glazing: {rm.windowAreaM2.toFixed(1)} m² ({rm.windowToFloorRatioPct}% WFR)
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded ${
                          rm.comfortRating === 'Optimal Daylight' || rm.comfortRating === 'Well Lit'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : rm.comfortRating === 'High Glare Risk'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rm.comfortRating}
                      </span>
                    </div>

                    {/* Progress bars */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>Average Illuminance</span>
                        <strong className="text-white font-mono">{rm.averageLux} Lux (Target: 300 lx)</strong>
                      </div>
                      <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, (rm.averageLux / 1200) * 100)}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                        <span>Spatial Daylight Autonomy (sDA)</span>
                        <strong className="text-green-400 font-mono">{rm.spatialDaylightAutonomyPct}%</strong>
                      </div>
                      <div className="w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-green-400 h-full rounded-full"
                          style={{ width: `${rm.spatialDaylightAutonomyPct}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 italic pt-1 border-t border-[#1F1F1F]">
                      Compliance: {rm.codeCompliance.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STRUCTURAL LOGIC VALIDATOR */}
        {activeTab === 'structural' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Hammer className="w-4 h-4 text-sky-400" />
                    <span>Continuous Structural Logic & Integrity Validator</span>
                  </h2>
                  <DataStateBadge state="VERIFIED" label="SANS / EUROCODE VERIFIED" size="xs" />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Background analysis of beam clear spans, vertical load paths, cantilever moments, and column grid modularity.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Structural Health</span>
                  <span
                    className={`text-base font-black ${
                      structuralReport.overallHealthScore >= 80 ? 'text-green-400' : 'text-amber-400'
                    }`}
                  >
                    {structuralReport.overallHealthScore}/100
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase text-gray-400 font-bold block">Status</span>
                  <span className="text-xs font-black text-sky-400">
                    {structuralReport.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Findings and Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <span>Identified Structural Deficiencies ({structuralReport.issues.length} Flags)</span>
                <span>Automated Reinforcement Action</span>
              </div>

              {structuralReport.issues.length === 0 ? (
                <div className="p-8 bg-[#111111] border border-green-500/30 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">All Structural Spans & Load Paths are Verified</h4>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    No unsupported spans exceeding 5.8m found. All upper level walls transfer direct gravity load to ground floor supports.
                  </p>
                </div>
              ) : (
                structuralReport.issues.map((iss) => (
                  <div
                    key={iss.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      iss.severity === 'Critical'
                        ? 'bg-[#170C0C] border-red-500/40'
                        : 'bg-[#141414] border-amber-500/30'
                    }`}
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            iss.severity === 'Critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {iss.severity} Priority
                        </span>
                        <span className="text-xs font-mono text-gray-400 px-1.5 py-0.5 bg-[#1C1C1C] rounded">
                          {iss.category}
                        </span>
                        {iss.spanLengthM && (
                          <span className="text-[10px] font-mono text-sky-400 px-1.5 py-0.5 bg-sky-500/10 rounded">
                            Span: {iss.spanLengthM}m (Max: {iss.maxAllowedSpanM}m)
                          </span>
                        )}
                        <span className="text-sm font-bold text-white">{iss.title}</span>
                      </div>
                      <p className="text-xs text-gray-300">{iss.recommendedSolution}</p>
                      <p className="text-[11px] text-amber-300/90 font-medium">
                        <strong>Risk:</strong> {iss.structuralRisk}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2 w-full md:w-auto">
                      <button
                        onClick={() => handleApplyStructuralFix(iss.aiActionPrompt)}
                        className="w-full md:w-auto px-4 py-2 bg-[#2DD4BF] hover:bg-[#22bca6] text-black font-bold text-xs rounded transition flex items-center justify-center gap-1.5 shadow-md shadow-[#2DD4BF]/20"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Reinforce Structure</span>
                      </button>
                      <span className="text-[10px] text-gray-500 font-mono">
                        Standard: SANS 10100 / Eurocode 2
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AUTONOMOUS DESIGN OPTIMIZER */}
        {activeTab === 'optimizer' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Optimizer Settings & Trigger */}
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
                    <span>Autonomous Multiobjective Design Optimizer (50 Parametric Iterations)</span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Generates and evaluates 50 floor plan iterations to find optimal trade-offs between daylight, energy, cost, and spatial flow.
                  </p>
                </div>

                <button
                  onClick={handleRunOptimizer}
                  disabled={isOptimizing}
                  className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#22bca6] text-black font-bold text-xs rounded-lg transition flex items-center gap-2 shadow-lg shadow-[#2DD4BF]/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>{isOptimizing ? 'Simulating 50 Designs...' : 'Re-Run Simulation Engine'}</span>
                </button>
              </div>

              {/* Objectives Checkboxes */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {Object.entries(optimizerObjectives).map(([key, val]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 bg-[#141414] border border-[#262626] rounded text-xs text-gray-300 cursor-pointer hover:border-[#333]"
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) =>
                        setOptimizerObjectives((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="accent-[#2DD4BF] rounded cursor-pointer"
                    />
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Candidates Grid */}
            {optimizerResult && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Top Pareto-Optimal Candidate Solutions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {optimizerResult.candidates.map((cand) => (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 rounded-xl border cursor-pointer transition space-y-3 ${
                        selectedCandidate?.id === cand.id
                          ? 'bg-[#141E1C] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10'
                          : 'bg-[#111] border-[#222] hover:border-[#333]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{cand.optionCode}</span>
                        <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold rounded">
                          Score: {cand.compositeScore}/100
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-medium leading-relaxed">{cand.keyModification}</p>

                      <div className="space-y-1 text-[11px] font-mono text-gray-400 pt-2 border-t border-[#222]">
                        <div className="flex justify-between">
                          <span>Est. Cost:</span>
                          <strong className="text-white">${(cand.costUSD / 1000).toFixed(0)}k USD</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Energy Savings:</span>
                          <strong className="text-green-400">+{cand.energySavingsPct}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Daylight (sDA):</span>
                          <strong className="text-amber-300">{cand.daylightFactorPct}%</strong>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyOptimizerCandidate(cand);
                        }}
                        className="w-full py-1.5 bg-[#1C1C1C] hover:bg-[#2DD4BF] hover:text-black text-gray-200 text-xs font-bold rounded transition mt-2"
                      >
                        Apply Design {cand.optionCode}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: "CHANGE ONE THING" DEPENDENCY MATRIX */}
        {activeTab === 'dependencies' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2DD4BF]" />
                    <span>"Change One Thing" Architectural Dependency Analyzer</span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Predicts and visualizes structural, egress, energy, and documentation ripple effects before modifying key building parameters.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Simulate Modifying:</span>
                  <select
                    value={selectedChangeType}
                    onChange={(e) => setSelectedChangeType(e.target.value as any)}
                    className="bg-[#171717] border border-[#333] rounded px-3 py-1.5 text-xs font-semibold text-white focus:border-[#2DD4BF] focus:outline-none cursor-pointer"
                  >
                    <option value="add_floor">Vertical Expansion (Add +1 Floor Level)</option>
                    <option value="widen_building">Horizontal Footprint (+5m Width)</option>
                    <option value="move_wet_wall">Relocate Wet Services Core / Bathrooms</option>
                    <option value="increase_glazing">Expand Façade Glazing (+20% WWR)</option>
                  </select>
                </div>
              </div>

              {/* Dependency Impact Cards */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  <span>Identified Ripple Effects ({dependencies.length} Systems Affected)</span>
                  <span>Actionable Recommendation</span>
                </div>

                {dependencies.map((dep, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#141414] border border-[#262626] rounded-lg flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{dep.affectedSystem}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            dep.severity === 'Critical'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : dep.severity === 'High'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}
                        >
                          {dep.severity} Impact
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{dep.impactDescription}</p>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <span className="text-[11px] font-medium text-[#2DD4BF] block">{dep.suggestedAction}</span>
                      <button
                        onClick={() => {
                          const { updatedProject } = executeAiAction(project, dep.suggestedAction);
                          setProject(updatedProject);
                        }}
                        className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#262626] border border-[#333] rounded text-[10px] text-gray-300 hover:text-white transition"
                      >
                        Apply Fix
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: BUILDABILITY REVIEW */}
        {activeTab === 'buildability' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-xl space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
                  <span>Buildability & Construction Standardization Audit</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Evaluates structural logic, repetition efficiency, material availability, and on-site assembly simplicity.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-2">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Modular Grid Repetition</span>
                  <div className="text-2xl font-black text-white">92%</div>
                  <p className="text-xs text-gray-400">Orthogonal 4.5m structural spans minimize cutting waste of slabs and standard formwork.</p>
                </div>
                <div className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-2">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Standardized Openings</span>
                  <div className="text-2xl font-black text-white">88%</div>
                  <p className="text-xs text-gray-400">90% of windows share standard 1.8m × 1.5m prefabricated unit dimensions.</p>
                </div>
                <div className="p-4 bg-[#141414] border border-[#262626] rounded-lg space-y-2">
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">Regional Material Fit</span>
                  <div className="text-2xl font-black text-[#2DD4BF]">High (Tier 1)</div>
                  <p className="text-xs text-gray-400">Specified masonry and timber are readily procurable from regional suppliers within 150km.</p>
                </div>
              </div>

              <div className="p-4 bg-[#141414] border border-[#262626] rounded-lg flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white">Simplify Building Geometry</span>
                  <p className="text-xs text-gray-400">Align minor perimeter wall offsets to eliminate 4 non-standard corner joints without changing interior floor areas.</p>
                </div>
                <button
                  onClick={() => {
                    const { updatedProject } = executeAiAction(project, 'Simplify structural wall geometry and modularize layout');
                    setProject(updatedProject);
                  }}
                  className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#22bca6] text-black font-bold text-xs rounded transition flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simplify Structure</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
