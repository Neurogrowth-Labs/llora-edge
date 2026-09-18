import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Box,
  MapPin,
  Bot,
  Radio,
  Camera,
  Compass,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Zap,
  Hammer,
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign,
  Maximize2,
  Eye,
  Crosshair,
  Truck,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  Filter,
  FileCheck,
  QrCode,
  Recycle,
  Leaf,
  Scan,
  Cpu,
  Search,
  Plus,
} from 'lucide-react';
import { ArchitecturalProject } from '../types/architecture';
import {
  RealityCaptureDataset,
  DeviationAnomaly,
  BuildingMaterialPassport,
  DemolitionPlanScenario,
  GenerativeSiteGoal,
  GenerativeDesignOption,
  AdvancedClashItem,
  ProjectHealthMetrics,
  Timeline4DPhase,
  RobotDigitalTwin,
  SpatialWasteZone,
  ARInspectionPoint,
  SpatialRiskRadarZone,
} from '../types/digitalTwin';
import {
  INITIAL_REALITY_CAPTURE_DATASETS,
  INITIAL_DEVIATION_ANOMALIES,
  INITIAL_MATERIAL_PASSPORT,
  DEMOLITION_SCENARIOS,
  INITIAL_GENERATIVE_GOAL,
  GENERATIVE_OPTIONS_CATALOG,
  INITIAL_ADVANCED_CLASHES,
  INITIAL_PROJECT_HEALTH,
  INITIAL_4D_TIMELINE,
  INITIAL_ROBOT_FLEET,
  INITIAL_SPATIAL_WASTE_ZONES,
  INITIAL_AR_INSPECTIONS,
  INITIAL_RISK_RADAR_ZONES,
} from '../data/digitalTwinData';
import { DataStateBadge } from './DataStateBadge';
import { useToast } from './ui/Toast';

interface LivingDigitalTwinStudioProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  onClose?: () => void;
}

type TwinSubTab =
  | 'overview'
  | 'reality_capture'
  | 'material_passport'
  | 'demolition_sim'
  | 'generative_opt'
  | 'clash_radar'
  | 'timeline_4d'
  | 'robot_fleet'
  | 'ar_inspector'
  | 'lifecycle_hub';

export const LivingDigitalTwinStudio: React.FC<LivingDigitalTwinStudioProps> = ({
  project,
  setProject,
  onClose,
}) => {
  const { showFeatureToast } = useToast();
  const [activeTab, setActiveTab] = useState<TwinSubTab>('overview');

  // Reality capture state
  const [realityDatasets, setRealityDatasets] = useState<RealityCaptureDataset[]>(INITIAL_REALITY_CAPTURE_DATASETS);
  const [anomalies, setAnomalies] = useState<DeviationAnomaly[]>(INITIAL_DEVIATION_ANOMALIES);
  const [isCapturingLive, setIsCapturingLive] = useState<boolean>(false);

  // Material Passport state
  const [passport, setPassport] = useState<BuildingMaterialPassport>(INITIAL_MATERIAL_PASSPORT);
  const [isScanningMaterial, setIsScanningMaterial] = useState<boolean>(false);
  const [scannerMaterialDetected, setScannerMaterialDetected] = useState<string | null>(null);

  // Demolition Simulator state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen_hybrid_robot');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isSimulatingDemolition, setIsSimulatingDemolition] = useState<boolean>(false);

  // Generative Optioneering state
  const [generativeGoal, setGenerativeGoal] = useState<GenerativeSiteGoal>(INITIAL_GENERATIVE_GOAL);
  const [generativeOptions, setGenerativeOptions] = useState<GenerativeDesignOption[]>(GENERATIVE_OPTIONS_CATALOG);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt_alpha');
  const [isGeneratingOptions, setIsGeneratingOptions] = useState<boolean>(false);

  // Clash Detection 2.0 & Risk Radar
  const [clashes, setClashes] = useState<AdvancedClashItem[]>(INITIAL_ADVANCED_CLASHES);
  const [selectedClashId, setSelectedClashId] = useState<string | null>(null);
  const [riskZones, setRiskZones] = useState<SpatialRiskRadarZone[]>(INITIAL_RISK_RADAR_ZONES);

  // 4D Timeline & What-if simulation
  const [timelinePhases, setTimelinePhases] = useState<Timeline4DPhase[]>(INITIAL_4D_TIMELINE);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(2);
  const [whatIfDelayDays, setWhatIfDelayDays] = useState<number>(10);

  // Robot Command Center & Waste Sorting
  const [robotFleet, setRobotFleet] = useState<RobotDigitalTwin[]>(INITIAL_ROBOT_FLEET);
  const [selectedRobotId, setSelectedRobotId] = useState<string>('R-01');
  const [wasteZones, setWasteZones] = useState<SpatialWasteZone[]>(INITIAL_SPATIAL_WASTE_ZONES);

  // AR Inspector state
  const [arInspections, setArInspections] = useState<ARInspectionPoint[]>(INITIAL_AR_INSPECTIONS);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string>('ar_01');

  // Project Health Metrics
  const [healthMetrics] = useState<ProjectHealthMetrics>(INITIAL_PROJECT_HEALTH);

  // Active Demolition Scenario
  const activeScenario = DEMOLITION_SCENARIOS.find((s) => s.id === selectedScenarioId) || DEMOLITION_SCENARIOS[2];
  const selectedRobot = robotFleet.find((r) => r.id === selectedRobotId) || robotFleet[0];

  // Trigger Live Reality Capture Scan
  const handleTriggerLiveScan = () => {
    showFeatureToast('Reality Capture');
    setIsCapturingLive(true);
    setTimeout(() => {
      const newDataset: RealityCaptureDataset = {
        id: `rc_${Date.now()}`,
        name: 'Spot Rover Rapid Site Mesh Sweep',
        type: 'Mobile_LiDAR',
        capturedAt: 'Just now (Live Twin Update)',
        fileSizeMb: 1250,
        pointCount: 22400000,
        accuracyMm: 3.2,
        processedBimElementsCount: 380,
        deviationMaxMm: 9.4,
        status: 'TWIN_SYNCHRONIZED',
        coverageZone: 'All Level 1 Zones & Robot Corridors',
      };
      setRealityDatasets([newDataset, ...realityDatasets]);
      setIsCapturingLive(false);
    }, 1200);
  };

  // Trigger Design Material Scanner
  const handleTriggerMaterialScanner = () => {
    showFeatureToast('Material Scanner');
    setIsScanningMaterial(true);
    setTimeout(() => {
      setScannerMaterialDetected('Structural Steel & Low-E Glazing (Confidence: 94%)');
      setIsScanningMaterial(false);
    }, 900);
  };

  // Trigger Generative Options Synthesizer
  const handleSynthesizeGenerativeOptions = () => {
    showFeatureToast('Generative Design');
    setIsGeneratingOptions(true);
    setTimeout(() => {
      setIsGeneratingOptions(false);
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col bg-[#080808] text-gray-200 overflow-hidden font-sans">
      {/* 1. TOP HEADER & TELEMETRY STRIP */}
      <div className="px-5 py-3 bg-[#0D0D0D] border-b border-[#202020] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#2DD4BF] flex items-center justify-center text-black shadow-lg shadow-[#2DD4BF]/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white tracking-tight">
                LORA LIVING DIGITAL TWIN & SPATIAL OPERATING SYSTEM
              </h1>
              <DataStateBadge state="LIVE" label="TWIN: 30 FPS TELEMETRY" size="xs" />
              <span className="px-2 py-0.5 bg-[#2DD4BF]/10 text-[#2DD4BF] text-[10px] font-bold rounded border border-[#2DD4BF]/20 font-mono">
                BIM + GIS + IoT + ROBOTS
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Continuously synchronized physical construction site model • 9 Spatial Design Agents active • Circular Material Passport
            </p>
          </div>
        </div>

        {/* Global Key Metrics Pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg flex items-center gap-2">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Project Health:</span>
            <span className="font-mono font-bold text-white text-sm">{healthMetrics.overallHealthScore}/100</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          </div>

          <div className="px-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg flex items-center gap-2">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Circularity Score:</span>
            <span className="font-mono font-bold text-[#2DD4BF] text-sm">{passport.circularityScore}%</span>
            <Leaf className="w-3.5 h-3.5 text-[#2DD4BF]" />
          </div>

          <div className="px-3 py-1.5 bg-[#141414] border border-[#262626] rounded-lg flex items-center gap-2">
            <span className="text-gray-400 text-[10px] uppercase font-bold">Active Robots:</span>
            <span className="font-mono font-bold text-[#38BDF8] text-sm">
              {robotFleet.filter((r) => r.status.includes('ONLINE')).length} / {robotFleet.length}
            </span>
            <Bot className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION BAR */}
      <div className="px-4 bg-[#0A0A0A] border-b border-[#1F1F1F] flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
        {[
          { id: 'overview', label: '1. Twin Dashboard', icon: Activity },
          { id: 'reality_capture', label: '2. Scan-to-BIM / Reality', icon: Scan },
          { id: 'material_passport', label: '3. Material Passport & Design Scanner', icon: Sparkles },
          { id: 'demolition_sim', label: '4. Design Demolition Simulator', icon: Hammer },
          { id: 'generative_opt', label: '5. Generative Site Optioneering', icon: Box },
          { id: 'clash_radar', label: '6. Design Clash 2.0 & Risk Radar', icon: ShieldAlert },
          { id: 'timeline_4d', label: '7. 4D Timeline & What-If', icon: Calendar },
          { id: 'robot_fleet', label: '8. Robotics Command & Waste', icon: Bot },
          { id: 'ar_inspector', label: '9. AR Inspector & Site QA', icon: Camera },
          { id: 'lifecycle_hub', label: '10. Lifecycle Architecture', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TwinSubTab)}
              className={`h-9 px-3 font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-[#2DD4BF] text-[#2DD4BF] bg-[#141414]'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#101010]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#060606]">
        {/* ========================================================= */}
        {/* TAB 1: TWIN OVERVIEW & HEALTH METRICS */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Top Twin Summary Banner */}
            <div className="p-5 bg-gradient-to-r from-[#0F172A] via-[#0D1E1F] to-[#0F141C] border border-[#1E293B] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF] flex items-center gap-1.5 mb-1">
                  <Radio className="w-3.5 h-3.5 text-[#2DD4BF] animate-pulse" />
                  PHYSICAL SITE ↔ LIVE DIGITAL TWIN LINKED
                </span>
                <h2 className="text-xl font-black text-white">
                  Living Digital Twin: {project.name || 'Cape Town Sustainable Atrium'}
                </h2>
                <p className="text-xs text-gray-300 mt-1 max-w-3xl">
                  Unified spatial fabric connecting 3D BIM geometry, GIS boundaries, real-time IoT vibration/air sniffer telemetry, autonomous robot trajectories, LiDAR deviation tracking, and 4D schedule forecasts.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerLiveScan}
                  disabled={isCapturingLive}
                  className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#24b4a1] text-black font-bold text-xs rounded-xl flex items-center gap-2 transition shadow-md shadow-[#2DD4BF]/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCapturingLive ? 'animate-spin' : ''}`} />
                  <span>{isCapturingLive ? 'Syncing Reality Capture...' : 'Trigger Scan-to-Twin Sync'}</span>
                </button>
              </div>
            </div>

            {/* Comprehensive Health Score & Pillar Radar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Overall Project Health</span>
                  <Activity className="w-4 h-4 text-[#2DD4BF]" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{healthMetrics.overallHealthScore}</span>
                  <span className="text-xs text-[#10B981] font-bold">/ 100 (Optimal)</span>
                </div>
                <div className="w-full bg-[#202020] h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-[#2DD4BF] h-full rounded-full" style={{ width: `${healthMetrics.overallHealthScore}%` }} />
                </div>
              </div>

              <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Schedule Delay Probability</span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">{healthMetrics.scheduleDelayProbabilityPct}%</span>
                  <span className="text-xs text-gray-400 font-medium">Risk Factor</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 truncate">
                  Critical: {healthMetrics.criticalActivityAtRisk}
                </p>
              </div>

              <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Forecasted Cost Impact</span>
                  <DollarSign className="w-4 h-4 text-rose-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">R{(healthMetrics.forecastedCostImpactZAR / 1000000).toFixed(1)}M</span>
                  <span className="text-xs text-rose-400 font-bold">ZAR at Risk</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Mitigated via Design Spatial clash resolution
                </p>
              </div>

              <div className="p-4 bg-[#0F0F0F] border border-[#222] rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Total Recoverable Value</span>
                  <Recycle className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">R{(passport.totalEstimatedSalvageValueZAR / 1000000).toFixed(2)}M</span>
                  <span className="text-xs text-gray-400 font-medium">Circularity</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  {passport.landfillDiversionTargetPct}% target landfill diversion
                </p>
              </div>
            </div>

            {/* Live Twin Spatial Matrix Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Real-Time Telemetry Feed & Active Deviations */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Scan className="w-4 h-4 text-[#2DD4BF]" />
                      <span>Reality Capture vs Planned BIM Deviations (Scan-to-Twin)</span>
                    </h3>
                    <span className="text-[10px] font-mono text-[#2DD4BF]">
                      {anomalies.length} Active Deviations
                    </span>
                  </div>

                  <div className="space-y-2">
                    {anomalies.map((anom) => (
                      <div
                        key={anom.id}
                        className="p-3 bg-[#141414] hover:bg-[#181818] border border-[#262626] rounded-lg transition flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                                anom.severity === 'CRITICAL'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : anom.severity === 'WARNING'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                              }`}
                            >
                              {anom.severity}
                            </span>
                            <span className="text-xs font-bold text-white">{anom.elementName}</span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              ({anom.detectedBy.replace('_', ' ')})
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">{anom.remedialAction}</p>
                          <div className="text-[10px] text-gray-400 font-mono flex items-center gap-3">
                            <span>Deviation: <strong className="text-rose-400">{anom.deviationMm} mm</strong></span>
                            <span>Tolerance: ±{anom.toleranceAllowedMm} mm</span>
                            <span>Loc: ({anom.location.x.toFixed(1)}m, {anom.location.y.toFixed(1)}m)</span>
                          </div>
                        </div>

                        <button className="px-2.5 py-1 bg-[#202020] hover:bg-[#282828] text-white text-[10px] font-bold rounded border border-[#333] transition shrink-0">
                          RFI Fix
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Autonomous Robot Telemetry Strip */}
                <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#38BDF8]" />
                      <span>Robotics Mission Control & Autonomous Fleet Live Status</span>
                    </h3>
                    <span className="text-[10px] text-[#10B981] font-mono">● 3 Online</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {robotFleet.slice(0, 2).map((robot) => (
                      <div key={robot.id} className="p-3 bg-[#141414] border border-[#262626] rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                            <span className="text-xs font-bold text-white">{robot.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            Bat: <strong className="text-emerald-400">{robot.batteryPct}%</strong>
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 truncate">{robot.currentTask}</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1 border-t border-[#202020]">
                          <span>Position: ({robot.currentPosition.x}m, {robot.currentPosition.y}m)</span>
                          <span className="text-[#38BDF8]">{robot.telemetryStreamFps} FPS stream</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Digital Material Passport Quick Card & Carbon */}
              <div className="space-y-4">
                <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-[#2DD4BF]" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Building Material Passport
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-[#2DD4BF] px-1.5 py-0.5 bg-[#2DD4BF]/10 rounded">
                      QR VERIFIED
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{passport.buildingName}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">{passport.structuralType}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                      <span className="text-gray-400">Total Building Mass:</span>
                      <strong className="text-white font-mono">{passport.totalMassTonnes} Tonnes</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                      <span className="text-gray-400">Embodied Carbon:</span>
                      <strong className="text-amber-400 font-mono">{passport.totalEmbodiedCarbonTCO2e} tCO₂e</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#1A1A1A]">
                      <span className="text-gray-400">Recoverable Carbon:</span>
                      <strong className="text-[#2DD4BF] font-mono">{passport.totalRecoverableCarbonTCO2e} tCO₂e</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Est. Salvage Resale:</span>
                      <strong className="text-emerald-400 font-mono">R{(passport.totalEstimatedSalvageValueZAR / 1000000).toFixed(2)}M</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('material_passport')}
                    className="w-full py-2 bg-[#1A1A1A] hover:bg-[#222] border border-[#2D2D2D] hover:border-[#2DD4BF]/40 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Full Material Inventory</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  </button>
                </div>

                {/* Spatial Risk Radar Summary */}
                <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Live Spatial Risk Radar
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] font-bold rounded">
                      1 CRITICAL ZONE
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong>North Heavy Lifting Zone (Crane #1):</strong> Suspended precast load path intersects pedestrian corridor under 42 km/h wind gusts.
                  </p>

                  <button
                    onClick={() => setActiveTab('clash_radar')}
                    className="w-full py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Spatial Risk Radar Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SCAN-TO-BIM / REALITY CAPTURE WORKFLOW */}
        {/* ========================================================= */}
        {activeTab === 'reality_capture' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Scan className="w-5 h-5 text-[#2DD4BF]" />
                  <span>Scan-to-BIM & Reality Capture Auto-Vectorization Pipeline</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Upload LiDAR point clouds, drone photogrammetry, 360° panoramas or mobile scans. LORA neural networks automatically extract parametric walls, floors, roofs, fenestrations and detect sub-centimeter construction deviations.
                </p>
              </div>

              <button
                onClick={handleTriggerLiveScan}
                disabled={isCapturingLive}
                className="px-4 py-2 bg-[#2DD4BF] text-black font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-[#23b3a0] transition disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Reality Capture Dataset</span>
              </button>
            </div>

            {/* Workflow Pipeline Graphic */}
            <div className="p-4 bg-[#0A0A0A] border border-[#1F1F1F] rounded-xl flex items-center justify-between text-xs text-gray-300 overflow-x-auto">
              <div className="text-center px-4 py-2 bg-[#141414] rounded-lg border border-[#282828] min-w-[140px]">
                <div className="font-bold text-white">1. Capture</div>
                <div className="text-[10px] text-gray-400">LiDAR / Drones / 360°</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2DD4BF]" />
              <div className="text-center px-4 py-2 bg-[#141414] rounded-lg border border-[#282828] min-w-[140px]">
                <div className="font-bold text-white">2. Design Vectorize</div>
                <div className="text-[10px] text-gray-400">Point Cloud Segmentation</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2DD4BF]" />
              <div className="text-center px-4 py-2 bg-[#141414] rounded-lg border border-[#282828] min-w-[140px]">
                <div className="font-bold text-white">3. BIM Objects</div>
                <div className="text-[10px] text-gray-400">Walls, Columns, Slabs</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#2DD4BF]" />
              <div className="text-center px-4 py-2 bg-[#141414] rounded-lg border border-[#282828] min-w-[140px]">
                <div className="font-bold text-[#2DD4BF]">4. Digital Twin</div>
                <div className="text-[10px] text-[#2DD4BF]/80">Deviation Audit Sync</div>
              </div>
            </div>

            {/* Reality Capture Datasets Table */}
            <div className="bg-[#0E0E0E] border border-[#222] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Point Clouds & Reality Meshes ({realityDatasets.length})
                </h3>
                <span className="text-[10px] font-mono text-gray-400">Format: LAS, E57, OBJ, IFC 4x3</span>
              </div>

              <div className="divide-y divide-[#1A1A1A]">
                {realityDatasets.map((ds) => (
                  <div key={ds.id} className="p-4 hover:bg-[#141414] transition flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1A1A1A] text-gray-300 border border-[#333]">
                          {ds.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-bold text-white">{ds.name}</span>
                        <DataStateBadge state="SYNCED" size="xs" />
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-4 font-mono text-[11px]">
                        <span>Captured: {ds.capturedAt}</span>
                        <span>Points: {(ds.pointCount ? ds.pointCount / 1000000 : 0).toFixed(1)}M</span>
                        <span>Accuracy: ±{ds.accuracyMm}mm</span>
                        <span>BIM Elements: {ds.processedBimElementsCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#282828] text-white text-xs font-bold rounded-lg border border-[#333] transition">
                        View 3D Mesh
                      </button>
                      <button className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#22b8a5] text-black text-xs font-bold rounded-lg transition">
                        Run Deviation Audit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: MATERIAL PASSPORT & Design SCANNER */}
        {/* ========================================================= */}
        {activeTab === 'material_passport' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header / Scanner Bar */}
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-white">Digital Building Material Passport & Circularity Bank</h2>
                  <DataStateBadge state="VERIFIED" label="EPD VERIFIED" size="xs" />
                </div>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Transforms physical structures into quantifiable material banks. Quantifies concrete, steel, brick, timber and glass with condition ratings, embodied carbon footprint, and salvage resale value.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerMaterialScanner}
                  disabled={isScanningMaterial}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-purple-600/20 transition disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanningMaterial ? 'Scanning Material...' : 'Trigger Design Material Vision Scanner'}</span>
                </button>
              </div>
            </div>

            {scannerMaterialDetected && (
              <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl text-xs text-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span><strong>Design Vision Scanner Output:</strong> {scannerMaterialDetected}</span>
                </div>
                <button
                  onClick={() => setScannerMaterialDetected(null)}
                  className="text-purple-400 hover:text-white font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Material Inventory Table (Distinguishing Design Estimate vs Verified) */}
            <div className="bg-[#0E0E0E] border border-[#222] rounded-xl overflow-hidden">
              <div className="p-4 border-b border-[#1F1F1F] flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Material Digital Inventory Breakdown (B-104)
                </h3>
                <span className="text-xs text-[#2DD4BF] font-mono font-bold">
                  Total Salvage: R{(passport.totalEstimatedSalvageValueZAR / 1000000).toFixed(2)}M ZAR
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#141414] text-gray-400 border-b border-[#222]">
                      <th className="py-2.5 px-4 font-bold">Material</th>
                      <th className="py-2.5 px-4 font-bold">Estimated Qty</th>
                      <th className="py-2.5 px-4 font-bold">State Provenance</th>
                      <th className="py-2.5 px-4 font-bold">Confidence</th>
                      <th className="py-2.5 px-4 font-bold">Recovery Grade</th>
                      <th className="py-2.5 px-4 font-bold">Condition</th>
                      <th className="py-2.5 px-4 font-bold">Resale Value (ZAR)</th>
                      <th className="py-2.5 px-4 font-bold">Disassembly Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {passport.materials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-[#141414]/60 transition">
                        <td className="py-3 px-4 font-bold text-white">{mat.material}</td>
                        <td className="py-3 px-4 font-mono text-gray-200">{mat.estimatedQuantityTonnes} t</td>
                        <td className="py-3 px-4">
                          <DataStateBadge
                            state={mat.isVerified ? 'VERIFIED' : 'ESTIMATED'}
                            label={mat.isVerified ? 'MEASURED' : 'Design ESTIMATE'}
                            size="xs"
                          />
                        </td>
                        <td className="py-3 px-4 font-mono text-[#2DD4BF] font-bold">
                          {(mat.confidenceScore * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              mat.recoveryGrade === 'Very High'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : mat.recoveryGrade === 'High'
                                ? 'bg-[#2DD4BF]/20 text-[#2DD4BF]'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {mat.recoveryGrade}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-[11px]">{mat.conditionGrade}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          R{mat.estimatedResaleValueZAR.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-[11px]">{mat.disassemblyMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: Design DEMOLITION PLANNER & SCENARIOS */}
        {/* ========================================================= */}
        {activeTab === 'demolition_sim' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Hammer className="w-5 h-5 text-amber-400" />
                  <span>Design Demolition & Selective Deconstruction Simulator</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Simulate multi-variable demolition scenarios. Compare mechanical shearing vs selective unbolting vs hybrid autonomous robotic demolition across cost, timeline, carbon emissions, and safety risk.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulatingDemolition(!isSimulatingDemolition)}
                  className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition ${
                    isSimulatingDemolition
                      ? 'bg-rose-500 text-white'
                      : 'bg-[#2DD4BF] text-black hover:bg-[#22b8a5]'
                  }`}
                >
                  {isSimulatingDemolition ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isSimulatingDemolition ? 'Pause Simulation' : 'Run 3D Deconstruction Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Scenario Comparison Cards (Plan A vs B vs C) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMOLITION_SCENARIOS.map((scen) => {
                const isSelected = selectedScenarioId === scen.id;
                return (
                  <div
                    key={scen.id}
                    onClick={() => setSelectedScenarioId(scen.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#161616] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10'
                        : 'bg-[#0E0E0E] border-[#222] hover:border-[#333]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                          {scen.strategy.replace('_', ' ')}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-white">{scen.name}</h3>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{scen.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#202020] space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. Cost:</span>
                        <strong className="text-white font-mono">R{(scen.costEstimateZAR / 1000000).toFixed(2)}M</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <strong className="text-amber-400 font-mono">{scen.durationDays} Days</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Net Carbon:</span>
                        <strong className="text-[#2DD4BF] font-mono">{scen.netCarbonEmissionsTCO2e} tCO₂e</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Safety Risk Index:</span>
                        <strong className={scen.safetyRiskIndex < 40 ? 'text-emerald-400' : 'text-rose-400'}>
                          {scen.safetyRiskIndex}/100
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Sequence Timeline for Selected Plan */}
            <div className="p-5 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2DD4BF]" />
                <span>Simulated Deconstruction Sequence Steps ({activeScenario.name})</span>
              </h3>

              <div className="space-y-3">
                {activeScenario.sequenceSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#141414] border border-[#262626] rounded-lg flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#2DD4BF] text-black font-black text-xs flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <span className="text-xs font-bold text-white">{step.title}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({step.estimatedHours} Hours)</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Target: <span className="text-gray-200">{step.targetElement}</span>
                      </p>
                      <div className="text-[10px] text-gray-400 flex items-center gap-3 font-mono">
                        <span>Safety Zone: {step.safetyZoneRadiusMeters}m</span>
                        <span>Stream: {step.wasteStream} ({step.recoveryVolumeTonnes}t)</span>
                        <span>Dust Suppression: {step.dustSuppressionActive ? 'ON' : 'OFF'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {step.robotAssignedId && (
                        <span className="px-2 py-1 bg-[#38BDF8]/20 text-[#38BDF8] rounded font-mono font-bold">
                          Assigned: {step.robotAssignedId}
                        </span>
                      )}
                      <button className="px-3 py-1.5 bg-[#202020] hover:bg-[#2A2A2A] text-white text-xs font-bold rounded-lg border border-[#333]">
                        Inspect Zone
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: GENERATIVE SITE & BUILDING OPTIONEERING */}
        {/* ========================================================= */}
        {activeTab === 'generative_opt' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-[#2DD4BF]" />
                  <span>Generative Site & Building Optioneering Engine</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Multi-variable generative design solver. Specify site area, height, daylight target, carbon budget and capital constraints. LORA synthesizes and ranks high-performance architectural configurations.
                </p>
              </div>

              <button
                onClick={handleSynthesizeGenerativeOptions}
                disabled={isGeneratingOptions}
                className="px-4 py-2 bg-[#2DD4BF] text-black font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-[#23b3a0] transition disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingOptions ? 'Synthesizing...' : 'Re-Run Generative Optioneering'}</span>
              </button>
            </div>

            {/* Generative Parameter Controls Bar */}
            <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Site Area</span>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{generativeGoal.siteAreaM2} m²</div>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Target Height</span>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{generativeGoal.targetHeightFloors} Floors</div>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Parking Target</span>
                <div className="font-mono font-bold text-white text-sm mt-0.5">{generativeGoal.parkingSpacesTarget} Bays</div>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] uppercase font-bold">Carbon Target</span>
                <div className="font-mono font-bold text-[#2DD4BF] text-sm mt-0.5">{generativeGoal.carbonTarget}</div>
              </div>
            </div>

            {/* Options Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {generativeOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    selectedOptionId === opt.id
                      ? 'bg-[#151515] border-[#2DD4BF] shadow-lg shadow-[#2DD4BF]/10'
                      : 'bg-[#0E0E0E] border-[#222] hover:border-[#333]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold rounded font-mono">
                        Rank #{opt.overallSuitabilityRank}
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {opt.grossInternalAreaM2} m² GIA
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{opt.title}</h3>

                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#202020]">
                        <span className="text-gray-400">Daylight Score:</span>
                        <strong className="text-[#2DD4BF] font-mono">{opt.daylightFactorScore}/100</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#202020]">
                        <span className="text-gray-400">Embodied Carbon:</span>
                        <strong className="text-emerald-400 font-mono">{opt.embodiedCarbonPerM2} kg/m²</strong>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-400">Capital Cost:</span>
                        <strong className="text-white font-mono">R{(opt.estimatedCostZAR / 1000000).toFixed(1)}M</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#202020] space-y-1.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">Key Strengths:</div>
                    <ul className="text-[11px] text-gray-300 space-y-1">
                      {opt.keyStrengths.slice(0, 2).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-[#2DD4BF] mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>

                    <button className="w-full mt-3 py-1.5 bg-[#2DD4BF] text-black font-bold text-xs rounded-lg hover:brightness-110 transition">
                      Load Option into CAD Canvas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: Design CLASH DETECTION 2.0 & RISK RADAR */}
        {/* ========================================================= */}
        {activeTab === 'clash_radar' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Design Clash Detection 2.0 & Spatial Risk Engine</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Transcend basic geometry pipe-vs-beam clash detection. Unifies crane swing arcs, worker safety envelopes, robot navigation hazards, trade scheduling concurrency, and material logistics bottlenecks.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold font-mono">
                  {clashes.filter((c) => !c.isResolved).length} Unresolved Spatial Risks
                </span>
              </div>
            </div>

            {/* Spatial Risk Radar Zones Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {riskZones.map((rz) => (
                <div
                  key={rz.id}
                  className={`p-4 rounded-xl border ${
                    rz.riskLevel === 'RED'
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : rz.riskLevel === 'AMBER'
                      ? 'bg-amber-950/20 border-amber-500/40'
                      : 'bg-emerald-950/20 border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono ${
                        rz.riskLevel === 'RED'
                          ? 'bg-rose-500 text-black'
                          : rz.riskLevel === 'AMBER'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {rz.riskLevel} RISK
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Radius: {rz.radiusMeters}m
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white">{rz.name}</h3>
                  <ul className="mt-2 text-[11px] text-gray-300 space-y-1">
                    {rz.activeFactors.map((f, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span>•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-2 border-t border-white/10 flex justify-between text-[10px] text-gray-400 font-mono">
                    <span>Personnel: {rz.personnelCount}</span>
                    <span>Machinery: {rz.heavyMachineryCount}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Advanced Clashes List */}
            <div className="bg-[#0E0E0E] border border-[#222] rounded-xl divide-y divide-[#1A1A1A]">
              {clashes.map((clash) => (
                <div key={clash.id} className="p-4 hover:bg-[#141414] transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                          clash.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400'
                            : clash.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-sky-500/20 text-sky-400'
                        }`}
                      >
                        {clash.severity}
                      </span>
                      <span className="text-xs font-bold text-white">{clash.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        [{clash.category.replace('_', ' ')}]
                      </span>
                    </div>

                    <span className="text-xs font-mono font-bold text-rose-400">
                      R{clash.costRiskZAR.toLocaleString()} Risk
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 bg-[#161616] p-2.5 rounded-lg border border-[#262626]">
                    <strong>Design Resolution:</strong> {clash.suggestedResolution}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1">
                    <span>Entities: {clash.entitiesInvolved.join(' ↔ ')}</span>
                    <button className="px-3 py-1 bg-[#2DD4BF] text-black font-bold rounded hover:brightness-110 transition">
                      Auto-Apply Resolution
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: 4D TIMELINE & WHAT-IF SIMULATION */}
        {/* ========================================================= */}
        {activeTab === 'timeline_4d' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#2DD4BF]" />
                  <span>4D Construction Timeline & What-If Delay Simulator</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Slide through construction phases to watch the parametric BIM model evolve. Test real-world "What-If" scenarios (e.g. 10-day structural steel supply delay) to forecast downstream consequences.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-gray-400">Active Month:</span>
                <span className="px-2.5 py-1 bg-[#1A1A1A] text-[#2DD4BF] font-bold rounded border border-[#333]">
                  {timelinePhases[selectedMonthIndex]?.monthName}
                </span>
              </div>
            </div>

            {/* Timeline Phase Scrubber */}
            <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Construction Horizon:
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {timelinePhases[selectedMonthIndex]?.phaseName}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {timelinePhases.map((phase, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMonthIndex(idx)}
                    className={`p-3 rounded-lg border text-left transition ${
                      selectedMonthIndex === idx
                        ? 'bg-[#181818] border-[#2DD4BF] text-white'
                        : 'bg-[#111111] border-[#242424] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className="text-[10px] font-bold font-mono">{phase.monthName}</div>
                    <div className="text-xs font-bold mt-1 truncate">{phase.phaseName}</div>
                    <div className="mt-2 text-[10px] font-mono text-[#2DD4BF]">
                      Progress: {phase.actualProgressPct}%
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* What-if Simulator Panel */}
            <div className="p-5 bg-gradient-to-r from-[#121212] to-[#1E1B4B]/30 border border-[#262626] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Design "What-If" Downstream Impact Forecast</span>
                </div>
                <span className="text-xs font-mono text-gray-400">Simulation Engine</span>
              </div>

              <p className="text-xs text-gray-300">
                <strong>Simulated Condition:</strong> What happens if <strong>Structural Grade 350 Rebar</strong> is delayed by <strong>{whatIfDelayDays} days</strong>?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#202020]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">End Milestone Slip</span>
                  <div className="text-base font-black text-rose-400 font-mono mt-0.5">+14 Calendar Days</div>
                </div>
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#202020]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Idle Equipment Cost</span>
                  <div className="text-base font-black text-amber-400 font-mono mt-0.5">+R680,000 ZAR</div>
                </div>
                <div className="p-3 bg-[#0A0A0A] rounded-lg border border-[#202020]">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Design Mitigation</span>
                  <div className="text-xs font-bold text-[#2DD4BF] mt-0.5">Stagger Zone C MEP First Fix</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: ROBOTICS COMMAND & SPATIAL WASTE SORTING */}
        {/* ========================================================= */}
        {activeTab === 'robot_fleet' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#38BDF8]" />
                  <span>Robotics Command Center & Autonomous Waste Sorting</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Real-time telemetry and digital twin synchronization for Boston Dynamics Spot rovers, DJI LiDAR drones, and hydraulic automated waste sorters.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1.5 bg-[#10B981]/20 text-[#10B981] rounded-lg font-bold">
                  Fleet Status: 4 Robots Synchronized
                </span>
              </div>
            </div>

            {/* Robot Fleet Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {robotFleet.map((bot) => (
                <div key={bot.id} className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1F1F1F]">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-[#38BDF8]" />
                      <span className="text-xs font-bold text-white">{bot.name}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-[#1A1A1A] text-gray-300">
                      {bot.modelType}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300"><strong>Current Task:</strong> {bot.currentTask}</p>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 bg-[#141414] rounded border border-[#202020]">
                      <span className="text-[9px] text-gray-400 block">Battery</span>
                      <strong className="text-emerald-400">{bot.batteryPct}%</strong>
                    </div>
                    <div className="p-2 bg-[#141414] rounded border border-[#202020]">
                      <span className="text-[9px] text-gray-400 block">Position</span>
                      <strong className="text-white">({bot.currentPosition.x}m, {bot.currentPosition.y}m)</strong>
                    </div>
                    <div className="p-2 bg-[#141414] rounded border border-[#202020]">
                      <span className="text-[9px] text-gray-400 block">Stream</span>
                      <strong className="text-[#38BDF8]">{bot.telemetryStreamFps} FPS</strong>
                    </div>
                  </div>

                  <div className="text-[10px] text-gray-400 font-mono pt-1">
                    Sensors: {bot.sensorSuite.join(' • ')}
                  </div>
                </div>
              ))}
            </div>

            {/* Spatial Waste Map Grid */}
            <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Recycle className="w-4 h-4 text-emerald-400" />
                <span>Autonomous Spatial Waste Map & Sorting Zones</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wasteZones.map((wz) => (
                  <div key={wz.id} className="p-3.5 bg-[#141414] border border-[#262626] rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{wz.name}</h4>
                      <span className="text-xs font-mono font-bold text-emerald-400">{wz.totalTonnes}t Total</span>
                    </div>

                    <div className="space-y-1">
                      {wz.materialsBreakdown.map((m, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-300">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                            <span>{m.material}</span>
                          </span>
                          <strong className="font-mono">{m.tonnes}t</strong>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-gray-400 font-mono pt-2 border-t border-[#202020]">
                      Pickup: {wz.scheduledPickupTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 9: AR CONSTRUCTION MODE & SITE INSPECTOR */}
        {/* ========================================================= */}
        {activeTab === 'ar_inspector' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#2DD4BF]" />
                  <span>AR Construction Inspector & Mixed Reality Site Overlay</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 max-w-2xl">
                  Superimposes planned BIM geometry directly over physical construction site video feeds. Identifies misaligned partition walls, column leans, and missing components in real-time.
                </p>
              </div>

              <button className="px-4 py-2 bg-[#2DD4BF] text-black font-bold text-xs rounded-xl flex items-center gap-2 hover:bg-[#23b3a0] transition">
                <Scan className="w-4 h-4" />
                <span>Launch AR Camera Mode</span>
              </button>
            </div>

            {/* AR Inspection Issues List */}
            <div className="bg-[#0E0E0E] border border-[#222] rounded-xl divide-y divide-[#1A1A1A]">
              {arInspections.map((insp) => (
                <div key={insp.id} className="p-4 hover:bg-[#141414] transition space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          insp.status === 'REQUIRES_IMMEDIATE_REMEDIATION'
                            ? 'bg-rose-500/20 text-rose-400'
                            : insp.status === 'OUT_OF_TOLERANCE'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {insp.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-white">{insp.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      Deviation: {insp.deviationMm}mm
                    </span>
                  </div>

                  <p className="text-xs text-gray-300">{insp.inspectorNotes}</p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono pt-1">
                    <span>Planned: ({insp.plannedLocation.x}m, {insp.plannedLocation.y}m) ↔ Observed: ({insp.actualLocationObserved.x}m, {insp.actualLocationObserved.y}m)</span>
                    <button className="px-3 py-1 bg-[#202020] hover:bg-[#282828] text-white text-xs font-bold rounded">
                      Generate PDF Defect Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 10: LIFECYCLE COMMAND CENTER */}
        {/* ========================================================= */}
        {activeTab === 'lifecycle_hub' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="p-5 bg-[#0F0F0F] border border-[#222] rounded-2xl">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#2DD4BF]" />
                <span>Unified Building Lifecycle Command Center</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1 max-w-3xl">
                LORA connects the full continuum of construction and facility lifecycle: LAND → PLANNING → DESIGN → BIM → PROCUREMENT → CONSTRUCTION → INSPECTION → OPERATIONS → MAINTENANCE → RENOVATION → DECONSTRUCTION → RECOVERY → REUSE.
              </p>
            </div>

            {/* Lifecycle Stages Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { stage: '1. LAND & GIS', desc: 'Zoning & terrain contours', status: 'COMPLETE' },
                { stage: '2. PARAMETRIC BIM', desc: 'SANS compliant model', status: 'ACTIVE' },
                { stage: '3. PROCUREMENT', desc: 'Steel & rebar tracking', status: 'IN_PROGRESS' },
                { stage: '4. CONSTRUCTION', desc: 'Robots & reality capture', status: 'ACTIVE' },
                { stage: '5. AR INSPECTOR', desc: 'Deviation QA alerts', status: 'ACTIVE' },
                { stage: '6. OPERATIONS', desc: 'HVAC & energy twin', status: 'STANDBY' },
                { stage: '7. DECONSTRUCTION', desc: 'Selective unbolting sim', status: 'READY' },
                { stage: '8. CIRCULAR REUSE', desc: 'Material Passport bank', status: 'ACTIVE' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-[#2DD4BF] uppercase">{item.stage}</span>
                  <div className="font-bold text-white text-xs">{item.desc}</div>
                  <span className="text-[9px] font-mono text-gray-400 block pt-1">
                    State: {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
