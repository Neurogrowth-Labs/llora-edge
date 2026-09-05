import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Layers,
  Eye,
  EyeOff,
  Compass,
  Maximize2,
  Grid,
  Magnet,
  Crosshair,
  Move,
  Lock,
  Cpu,
  Activity,
  Wifi,
  Bot,
  Bell,
  Sliders,
  ChevronUp,
  ChevronDown,
  Clock,
  Sparkles,
  MapPin,
  Globe,
  Radio,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  HardDrive,
  Box,
  Map as MapIcon,
  Sun,
  Ruler,
  Maximize,
  HelpCircle,
  Check,
  ChevronRight,
  List,
  Flame,
  Zap,
  LayoutGrid,
  FolderSync,
} from 'lucide-react';
import { ArchitecturalProject, DrawingTool } from '../types/architecture';
import { RoboticsControlModal } from './RoboticsControlModal';
import { DataStateBadge } from './DataStateBadge';

export interface CadStyleFooterProps {
  project: ArchitecturalProject;
  setProject: (p: ArchitecturalProject | ((prev: ArchitecturalProject) => ArchitecturalProject)) => void;
  activeStudioTab: '2d' | '3d' | 'intelligence' | 'developer' | 'sustainability' | 'render' | 'docs' | 'digital_twin';
  setActiveStudioTab: (tab: '2d' | '3d' | 'intelligence' | 'developer' | 'sustainability' | 'render' | 'docs' | 'digital_twin') => void;
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  snapToGrid: boolean;
  setSnapToGrid: (v: boolean) => void;
  gridSize: number;
  setGridSize: (s: number) => void;
  activeLevelId: string;
  setActiveLevelId: (lvl: string) => void;
  onOpenCommandCenter: () => void;
  onOpenAiCopilot: () => void;
  onOpenAuditModal: () => void;
  onOpenDataStateInspector?: () => void;
  buildingScore: number;
  isSpatialCopilotVisible?: boolean;
  onToggleSpatialCopilot?: () => void;
  showCommandConsole?: boolean;
  setShowCommandConsole?: React.Dispatch<React.SetStateAction<boolean>>;
  showStatusBar?: boolean;
  setShowStatusBar?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LayerConfig {
  name: string;
  color: string;
  visible: boolean;
  locked: boolean;
}

export const CadStyleFooter: React.FC<CadStyleFooterProps> = ({
  project,
  setProject,
  activeStudioTab,
  setActiveStudioTab,
  activeTool,
  setActiveTool,
  snapToGrid,
  setSnapToGrid,
  gridSize,
  setGridSize,
  activeLevelId,
  setActiveLevelId,
  onOpenCommandCenter,
  onOpenAiCopilot,
  onOpenAuditModal,
  onOpenDataStateInspector,
  buildingScore,
  isSpatialCopilotVisible,
  onToggleSpatialCopilot,
  showCommandConsole = true,
  setShowCommandConsole,
  showStatusBar = true,
  setShowStatusBar,
}) => {
  // 1 & 2. Command Console & History State
  const [commandInput, setCommandInput] = useState<string>('');
  const [isConsoleExpanded, setIsConsoleExpanded] = useState<boolean>(false);
  const [commandHistory, setCommandHistory] = useState<Array<{ text: string; type: 'cmd' | 'output' | 'system' | 'ai'; time: string }>>([
    { text: 'Lora Edge 2026 Core Architectural Kernel v2.4.8 initialized.', type: 'system', time: '12:00:00' },
    { text: `Active Project: ${project.name} | Climate: ${project.climate.location}`, type: 'system', time: '12:00:01' },
    { text: 'Type HELP, WALL, DOOR, ROOM, SOLAR, or AI for instant BIM commands.', type: 'output', time: '12:00:02' },
  ]);

  // 3 & 4. Model Space vs Paper Space Layout Tabs
  const [activeSpaceTab, setActiveSpaceTab] = useState<'Model' | 'Layout 1 (A1 Plan)' | 'Layout 2 (A0 Master)' | 'Layout 3 (Section & Schedule)'>('Model');

  // 5, 6, 7. Map, Satellite, and 3D View Toggles
  const [mapViewMode, setMapViewMode] = useState<'vector' | 'satellite' | 'terrain' | 'none'>('vector');

  // 8 & 9. Active Layer & Visibility Controls
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<string>('A-WALL');
  const [layersVisibility, setLayersVisibility] = useState<Record<string, LayerConfig>>({
    A_WALL: { name: 'A-WALL-EXTR & INTR', color: '#FFFFFF', visible: true, locked: false },
    A_DOOR: { name: 'A-DOOR-SWING', color: '#2DD4BF', visible: true, locked: false },
    A_GLAZ: { name: 'A-GLAZ-WINDOW', color: '#38BDF8', visible: true, locked: false },
    A_COLS: { name: 'S-COLS-STRUCTURAL', color: '#F59E0B', visible: true, locked: false },
    A_ROOM: { name: 'A-ROOM-HATCH & TAG', color: '#A78BFA', visible: true, locked: false },
    A_FURN: { name: 'A-FURN-INTERIOR', color: '#10B981', visible: true, locked: false },
    A_DIMS: { name: 'A-ANNO-DIMENSIONS', color: '#9CA3AF', visible: true, locked: false },
  });

  // 10. Cursor Coordinates (X, Y, Z)
  const [cursorCoords, setCursorCoords] = useState<{ x: number; y: number; z: number }>({ x: 12.45, y: 8.30, z: 0.00 });

  // 11 & 12. Map Scale & Zoom Level Indicators
  const [mapScale, setMapScale] = useState<string>('1:100 (10mm = 1m)');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // 13-21. CAD Precision Drawing Toggles
  const [isOrthoMode, setIsOrthoMode] = useState<boolean>(false); // F8
  const [isOsnap, setIsOsnap] = useState<boolean>(true); // F3
  const [isOsnapTracking, setIsOsnapTracking] = useState<boolean>(true); // F11
  const [isPolarTracking, setIsPolarTracking] = useState<boolean>(true); // F10
  const [isDynamicInput, setIsDynamicInput] = useState<boolean>(true); // F12
  const [isSelectionCycling, setIsSelectionCycling] = useState<boolean>(false);
  const [showLineweights, setShowLineweights] = useState<boolean>(true);

  // 22-24. Annotation Scale, Measurement Units & Coordinate Systems
  const [annotationScale, setAnnotationScale] = useState<string>('1:100');
  const [measurementUnits, setMeasurementUnits] = useState<'Metric (m)' | 'Metric (mm)' | 'Imperial (ft)'>('Metric (m)');
  const [coordSystem, setCoordSystem] = useState<'WCS (World)' | 'UCS (Building)' | 'UTM Zone 34S'>('WCS (World)');

  // 25-29. Live Data Sync, Robot, Network, Tasks, Notifications
  const [liveSyncStatus, setLiveSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const [robotStatus, setRobotStatus] = useState<'connected' | 'idle' | 'surveying'>('connected');
  const [isRoboticsModalOpen, setIsRoboticsModalOpen] = useState<boolean>(false);
  const [networkLatency, setNetworkLatency] = useState<number>(24);
  const [activeBackgroundTasks, setActiveBackgroundTasks] = useState<number>(0);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // 30. Workspace Switcher
  const [activeWorkspace, setActiveWorkspace] = useState<string>('BIM Architecture');
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState<boolean>(false);

  // 31 & 32. Performance (FPS) & Memory/Resource Usage
  const [fps, setFps] = useState<number>(60);
  const [memoryUsage, setMemoryUsage] = useState<string>('42.8 MB');

  // 33. Date & Time Indicator
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  // 34. Customization / Status Bar Settings Menu
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState<boolean>(false);
  const [isUnitsMenuOpen, setIsUnitsMenuOpen] = useState<boolean>(false);
  const [isCoordMenuOpen, setIsCoordMenuOpen] = useState<boolean>(false);

  // Live timer & FPS/coords tracking
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleMouseMove = (e: MouseEvent) => {
      const relX = ((e.clientX - 100) / 30).toFixed(2);
      const relY = ((e.clientY - 100) / 30).toFixed(2);
      setCursorCoords({
        x: Math.max(0, parseFloat(relX) || 0),
        y: Math.max(0, parseFloat(relY) || 0),
        z: project.levels.find((l) => l.id === activeLevelId)?.elevation || 0,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [project.levels, activeLevelId]);

  // Execute Command from bottom console
  const handleExecuteCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString();
    const cleanCmd = cmd.toUpperCase();
    const newHistory = [...commandHistory, { text: `COMMAND: ${cmd}`, type: 'cmd' as const, time }];

    if (cleanCmd === 'HELP' || cleanCmd === '?') {
      newHistory.push({
        text: 'AVAILABLE CAD COMMANDS: WALL(W), DOOR(D), WINDOW(G), COLUMN(C), ROOM(R), DIM(M), SELECT(V), 3D, 2D, SNAP, ORTHO, OSNAP, LAYER, AUDIT, COPILOT, CLEAR',
        type: 'system',
        time,
      });
    } else if (cleanCmd === 'WALL' || cleanCmd === 'W') {
      setActiveTool('wall');
      setActiveStudioTab('2d');
      newHistory.push({ text: 'Tool activated: WALL (Continuous Extrusion Mode)', type: 'output', time });
    } else if (cleanCmd === 'DOOR' || cleanCmd === 'D') {
      setActiveTool('door');
      setActiveStudioTab('2d');
      newHistory.push({ text: 'Tool activated: DOOR (Select host wall to insert)', type: 'output', time });
    } else if (cleanCmd === 'WINDOW' || cleanCmd === 'G') {
      setActiveTool('window');
      setActiveStudioTab('2d');
      newHistory.push({ text: 'Tool activated: WINDOW (High performance Low-E glazing)', type: 'output', time });
    } else if (cleanCmd === 'COLUMN' || cleanCmd === 'C') {
      setActiveTool('column');
      setActiveStudioTab('2d');
      newHistory.push({ text: 'Tool activated: STRUCTURAL COLUMN (Timber CLT / RC)', type: 'output', time });
    } else if (cleanCmd === 'ROOM' || cleanCmd === 'R') {
      setActiveTool('room');
      setActiveStudioTab('2d');
      newHistory.push({ text: 'Tool activated: ROOM POLYGON (Auto boundary detection)', type: 'output', time });
    } else if (cleanCmd === 'SELECT' || cleanCmd === 'V') {
      setActiveTool('select');
      newHistory.push({ text: 'Tool activated: SELECTION CURSOR', type: 'output', time });
    } else if (cleanCmd === 'ORTHO') {
      setIsOrthoMode(!isOrthoMode);
      newHistory.push({ text: `ORTHOMODE toggled: ${!isOrthoMode ? '<ON>' : '<OFF>'}`, type: 'output', time });
    } else if (cleanCmd === 'SNAP') {
      setSnapToGrid(!snapToGrid);
      newHistory.push({ text: `GRID SNAP toggled: ${!snapToGrid ? '<ON>' : '<OFF>'} (${gridSize}m)`, type: 'output', time });
    } else if (cleanCmd === 'OSNAP') {
      setIsOsnap(!isOsnap);
      newHistory.push({ text: `OSNAP toggled: ${!isOsnap ? '<ON>' : '<OFF>'} (Endpoint, Midpoint, Center)`, type: 'output', time });
    } else if (cleanCmd === '3D' || cleanCmd === 'BIM') {
      setActiveStudioTab('3d');
      newHistory.push({ text: 'Switched viewport to 3D BIM Master View', type: 'output', time });
    } else if (cleanCmd === '2D' || cleanCmd === 'CAD') {
      setActiveStudioTab('2d');
      newHistory.push({ text: 'Switched viewport to 2D CAD Plan View', type: 'output', time });
    } else if (cleanCmd === 'AUDIT' || cleanCmd === 'SCORE') {
      onOpenAuditModal();
      newHistory.push({ text: `Building Intelligence Score: ${buildingScore}/100 (Audit Modal Opened)`, type: 'output', time });
    } else if (cleanCmd === 'AI' || cleanCmd === 'COPILOT') {
      onOpenAiCopilot();
      newHistory.push({ text: 'AI Architect Copilot drawer opened', type: 'ai', time });
    } else if (cleanCmd === 'CLEAR' || cleanCmd === 'CLS') {
      setCommandHistory([{ text: 'Lora Edge Command Console cleared.', type: 'system', time }]);
      setCommandInput('');
      return;
    } else {
      newHistory.push({
        text: `Unknown command "${cmd}". Type "HELP" for listing or press Cmd+K for AI search.`,
        type: 'output',
        time,
      });
    }

    setCommandHistory(newHistory);
    setCommandInput('');
  };

  const historyEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isConsoleExpanded && historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commandHistory, isConsoleExpanded]);

  const toggleLayerVisibility = (layerKey: string) => {
    setLayersVisibility((prev) => ({
      ...prev,
      [layerKey]: { ...prev[layerKey], visible: !prev[layerKey].visible },
    }));
  };

  const toggleLayerLock = (layerKey: string) => {
    setLayersVisibility((prev) => ({
      ...prev,
      [layerKey]: { ...prev[layerKey], locked: !prev[layerKey].locked },
    }));
  };

  return (
    <div className="flex flex-col bg-[#080808] border-t border-[#1F1F1F] select-none z-30 font-sans shadow-2xl shrink-0">
      {/* ========================================================================= */}
      {/* 1 & 2. COMMAND LINE / COMMAND CONSOLE & COMMAND HISTORY PANEL */}
      {/* ========================================================================= */}
      {showCommandConsole && (
        <>
          {isConsoleExpanded && (
        <div className="h-36 bg-[#0A0A0A] border-b border-[#222222] p-2 flex flex-col font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#1A1A1A] text-[10px] text-gray-500 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span className="text-gray-300 font-bold">Lora Edge Interactive Command Console</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">History: {commandHistory.length} events</span>
              <button
                onClick={() => setCommandHistory([{ text: 'Lora Edge Console Reset.', type: 'system', time: new Date().toLocaleTimeString() }])}
                className="text-[#2DD4BF] hover:underline"
              >
                Clear
              </button>
              <button
                onClick={() => setIsConsoleExpanded(false)}
                className="text-gray-400 hover:text-white p-0.5"
                title="Collapse Console"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-[#222]">
            {commandHistory.map((item, idx) => (
              <div
                key={idx}
                className={`text-[11px] leading-relaxed flex items-start gap-2 ${
                  item.type === 'cmd'
                    ? 'text-yellow-400 font-semibold'
                    : item.type === 'ai'
                    ? 'text-[#2DD4BF]'
                    : item.type === 'system'
                    ? 'text-gray-500'
                    : 'text-gray-300'
                }`}
              >
                <span className="text-[9px] text-gray-600 font-mono select-none">{item.time}</span>
                <span className="select-none font-bold text-gray-600">&gt;</span>
                <span className="break-all">{item.text}</span>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        </div>
      )}

      {/* COMMAND LINE DOCK */}
      <div className="h-7 px-2 bg-[#0D0D0D] border-b border-[#1C1C1C] flex items-center justify-between text-xs font-mono">
        <form onSubmit={handleExecuteCommand} className="flex-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsConsoleExpanded(!isConsoleExpanded)}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-[#171717] hover:bg-[#222222] border border-[#2E2E2E] rounded text-[10px] text-gray-300 font-bold transition"
            title="Toggle Command Console History (F2)"
          >
            <Terminal className="w-3 h-3 text-[#2DD4BF]" />
            <span>COMMAND:</span>
            {isConsoleExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>

          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type a CAD command (e.g. WALL, DOOR, 3D, ORTHO, OSNAP, AUDIT) or press Enter to execute..."
            className="flex-1 h-5 bg-transparent border-none focus:outline-none text-[11px] text-gray-200 placeholder-gray-600 font-mono"
          />

          <button
            type="submit"
            className="px-2 py-0.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] text-gray-300 hover:text-white rounded text-[10px] font-bold transition border border-[#333]"
          >
            EXEC
          </button>
        </form>

        {/* Quick Recent Log Snip */}
        <div className="hidden xl:flex items-center gap-2 text-[10px] text-gray-500 pl-4 border-l border-[#222]">
          <span className="truncate max-w-[280px]">
            {commandHistory[commandHistory.length - 1]?.text || 'Ready'}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-9. MODEL SPACE TAB, LAYOUT TABS, MAP/SATELLITE/3D TOGGLES, ACTIVE LAYER */}
      {/* ========================================================================= */}
      <div className="h-7 px-2 bg-[#090909] border-b border-[#1A1A1A] flex items-center justify-between text-[11px] overflow-x-auto">
        {/* Left: Model Space vs Paper Space Layout Tabs */}
        <div className="flex items-center gap-1">
          {(
            [
              'Model',
              'Layout 1 (A1 Plan)',
              'Layout 2 (A0 Master)',
              'Layout 3 (Section & Schedule)',
            ] as const
          ).map((tabName) => {
            const isSel = activeSpaceTab === tabName;
            return (
              <button
                key={tabName}
                onClick={() => {
                  setActiveSpaceTab(tabName);
                  if (tabName === 'Model') setActiveStudioTab('2d');
                  else setActiveStudioTab('docs');
                }}
                className={`h-6 px-3 rounded-t text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSel
                    ? 'bg-[#181818] text-[#2DD4BF] border-t-2 border-[#2DD4BF] font-bold shadow'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#121212]'
                }`}
              >
                <Box className="w-3 h-3 opacity-80" />
                <span>{tabName}</span>
              </button>
            );
          })}
        </div>

        {/* Center: Map View, Satellite View, and 3D View Toggles */}
        <div className="flex items-center gap-1 bg-[#121212] px-1 py-0.5 rounded border border-[#222]">
          <button
            onClick={() => {
              setMapViewMode(mapViewMode === 'vector' ? 'none' : 'vector');
              setActiveStudioTab('intelligence');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
              mapViewMode === 'vector' ? 'bg-[#222] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Vector GIS Map Layer"
          >
            <MapIcon className="w-3 h-3" />
            <span>Map View</span>
          </button>

          <button
            onClick={() => {
              setMapViewMode(mapViewMode === 'satellite' ? 'none' : 'satellite');
              setActiveStudioTab('intelligence');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
              mapViewMode === 'satellite' ? 'bg-[#222] text-amber-400' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle Aerial Satellite Underlay"
          >
            <Globe className="w-3 h-3" />
            <span>Satellite View</span>
          </button>

          <div className="w-[1px] h-3 bg-[#2A2A2A] mx-0.5" />

          <button
            onClick={() => setActiveStudioTab(activeStudioTab === '3d' ? '2d' : '3d')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
              activeStudioTab === '3d' ? 'bg-[#2DD4BF] text-black font-black' : 'text-gray-400 hover:text-white'
            }`}
            title="Toggle 3D BIM Viewer"
          >
            <Box className="w-3 h-3" />
            <span>3D View</span>
          </button>
        </div>

        {/* Right: Active Layer Indicator & Layer Visibility Controls & Hide Console */}
        <div className="relative flex items-center gap-1.5">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className="h-5 px-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#282828] rounded flex items-center gap-1.5 text-[10px] font-semibold text-gray-300 transition"
            title="Layer Manager & Visibility Controls"
          >
            <Layers className="w-3 h-3 text-[#2DD4BF]" />
            <span>Active Layer: <strong className="text-white">{activeLayer}</strong></span>
            <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
          </button>

          <button
            onClick={() => setShowCommandConsole?.(false)}
            className="p-1 text-gray-500 hover:text-gray-300 hover:bg-[#1C1C1C] rounded transition"
            title="Hide Command Prompt (Restore from View Layout menu)"
          >
            <EyeOff className="w-3 h-3" />
          </button>

          {isLayerMenuOpen && (
            <div className="absolute bottom-7 right-0 w-72 bg-[#0E0E0E] border border-[#282828] rounded-lg shadow-2xl z-50 p-2 text-xs">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#1F1F1F]">
                <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                  <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>CAD Layer Visibility</span>
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{Object.keys(layersVisibility).length} Layers</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {(Object.entries(layersVisibility) as [string, LayerConfig][]).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between p-1 hover:bg-[#161616] rounded">
                    <button
                      onClick={() => setActiveLayer(val.name.split('-')[1] || val.name)}
                      className="flex items-center gap-2 text-left flex-1"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: val.color }} />
                      <span className={`text-[11px] font-medium ${val.visible ? 'text-gray-200' : 'text-gray-500 line-through'}`}>
                        {val.name}
                      </span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleLayerLock(key)}
                        className={`p-1 rounded hover:bg-[#242424] ${val.locked ? 'text-amber-400' : 'text-gray-500'}`}
                        title={val.locked ? 'Layer Locked' : 'Layer Unlocked'}
                      >
                        <Lock className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => toggleLayerVisibility(key)}
                        className={`p-1 rounded hover:bg-[#242424] ${val.visible ? 'text-[#2DD4BF]' : 'text-gray-600'}`}
                        title={val.visible ? 'Hide Layer' : 'Show Layer'}
                      >
                        {val.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
      )}

      {/* ========================================================================= */}
      {/* 10-34. PRIMARY CAD STATUS BAR WITH PRECISION TOGGLES, TELEMETRY & METRICS */}
      {/* ========================================================================= */}
      {showStatusBar && (
      <div className="min-h-[28px] px-2 py-0.5 bg-[#050505] flex items-center justify-between text-[11px] font-mono text-gray-400 overflow-x-auto gap-2">
        {/* Left Section: 10. Coordinates, 11. Map Scale, 12. Zoom Level */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 10. CURSOR COORDINATES DISPLAY (X, Y, Z) */}
          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0F0F0F] rounded border border-[#222] text-gray-300 text-[10px]">
            <Crosshair className="w-3 h-3 text-[#2DD4BF]" />
            <span>X: <strong className="text-white">{cursorCoords.x.toFixed(2)}m</strong></span>
            <span className="text-gray-600">|</span>
            <span>Y: <strong className="text-white">{cursorCoords.y.toFixed(2)}m</strong></span>
            <span className="text-gray-600">|</span>
            <span>Z: <strong className="text-white">{cursorCoords.z.toFixed(2)}m</strong></span>
          </div>

          {/* 11. MAP SCALE INDICATOR */}
          <div className="relative">
            <button
              onClick={() => setIsScaleMenuOpen(!isScaleMenuOpen)}
              className="px-1.5 py-0.5 bg-[#0F0F0F] hover:bg-[#1A1A1A] border border-[#222] rounded flex items-center gap-1 text-[10px] text-gray-300"
              title="Viewport Scale / Paper Scale"
            >
              <Ruler className="w-3 h-3 text-cyan-400" />
              <span>{annotationScale}</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
            </button>

            {isScaleMenuOpen && (
              <div className="absolute bottom-6 left-0 w-32 bg-[#0E0E0E] border border-[#262626] rounded shadow-xl z-50 py-1 text-xs">
                {['1:1', '1:50', '1:100', '1:200', '1:500'].map((scale) => (
                  <button
                    key={scale}
                    onClick={() => {
                      setAnnotationScale(scale);
                      setIsScaleMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-left flex items-center justify-between hover:bg-[#1A1A1A] ${
                      annotationScale === scale ? 'text-[#2DD4BF] font-bold' : 'text-gray-300'
                    }`}
                  >
                    <span>{scale}</span>
                    {annotationScale === scale && <Check className="w-3 h-3 text-[#2DD4BF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 12. ZOOM LEVEL INDICATOR */}
          <span className="text-[10px] text-gray-500">Zoom: {zoomLevel}%</span>
        </div>

        {/* Center: 13-21. CAD Precision Drawing Toggles */}
        <div className="flex items-center gap-0.5 shrink-0 bg-[#0E0E0E] p-0.5 rounded border border-[#1E1E1E]">
          {/* 13. GRID TOGGLE (F7) */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              snapToGrid ? 'bg-[#2DD4BF] text-black shadow' : 'text-gray-400 hover:bg-[#1A1A1A]'
            }`}
            title="Grid Display / Snap (F7 / F9)"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">GRID</span>
          </button>

          {/* 14. SNAP TOGGLE */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              snapToGrid ? 'bg-[#1C2E2B] text-[#2DD4BF] border border-[#2DD4BF]/40' : 'text-gray-400 hover:bg-[#1A1A1A]'
            }`}
            title="Snap to Grid (F9)"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">SNAP ({gridSize}m)</span>
          </button>

          {/* 15. OBJECT SNAP (OSNAP) TOGGLE (F3) */}
          <button
            onClick={() => setIsOsnap(!isOsnap)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              isOsnap ? 'bg-[#1C2E2B] text-[#2DD4BF] border border-[#2DD4BF]/40' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Object Snap (OSNAP F3) - Endpoint, Midpoint, Perpendicular"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">OSNAP</span>
          </button>

          {/* 16. OBJECT SNAP TRACKING (F11) */}
          <button
            onClick={() => setIsOsnapTracking(!isOsnapTracking)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              isOsnapTracking ? 'bg-[#1C2E2B] text-[#2DD4BF] border border-[#2DD4BF]/40' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Object Snap Tracking (F11)"
          >
            <Move className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">OTRACK</span>
          </button>

          {/* 17. ORTHO MODE TOGGLE (F8) */}
          <button
            onClick={() => {
              setIsOrthoMode(!isOrthoMode);
              if (!isOrthoMode) setIsPolarTracking(false);
            }}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              isOrthoMode ? 'bg-[#2DD4BF] text-black shadow' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Ortho Mode (F8) - Restrict cursor to 90° Orthogonal Angles"
          >
            <span>ORTHO</span>
          </button>

          {/* 18. POLAR TRACKING TOGGLE (F10) */}
          <button
            onClick={() => {
              setIsPolarTracking(!isPolarTracking);
              if (!isPolarTracking) setIsOrthoMode(false);
            }}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              isPolarTracking ? 'bg-[#1C2E2B] text-[#2DD4BF] border border-[#2DD4BF]/40' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Polar Tracking (F10) - 30°, 45°, 90° Increments"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">POLAR</span>
          </button>

          {/* 19. DYNAMIC INPUT (DYN) TOGGLE (F12) */}
          <button
            onClick={() => setIsDynamicInput(!isDynamicInput)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              isDynamicInput ? 'bg-[#1C2E2B] text-[#2DD4BF] border border-[#2DD4BF]/40' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Dynamic Input (F12) - On-screen length & angle HUD"
          >
            <span>DYN</span>
          </button>

          {/* 20. SELECTION CYCLING */}
          <button
            onClick={() => setIsSelectionCycling(!isSelectionCycling)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              isSelectionCycling ? 'bg-[#2DD4BF] text-black' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Selection Cycling for Overlapping BIM Geometry"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          {/* 21. LINEWEIGHT DISPLAY (LWT) */}
          <button
            onClick={() => setShowLineweights(!showLineweights)}
            className={`p-1 rounded transition text-[10px] flex items-center gap-1 font-bold ${
              showLineweights ? 'bg-[#1C2E2B] text-[#2DD4BF] border border-[#2DD4BF]/40' : 'text-gray-500 hover:bg-[#1A1A1A]'
            }`}
            title="Show / Hide CAD Lineweight Thickness (LWT)"
          >
            <span>LWT</span>
          </button>
        </div>

        {/* Right Section: 22-34. Annotations, Units, Coordinates, Sync, Robot, Network, Tasks, Notifications, Workspace, Perf, RAM, Clock, Settings */}
        <div className="flex items-center gap-2 shrink-0">
          {/* 22. ANNOTATION SCALE INDICATOR */}
          <span className="text-[10px] text-gray-500 hidden 2xl:inline">ANNO: {annotationScale}</span>

          {/* 23. MEASUREMENT UNITS INDICATOR */}
          <div className="relative">
            <button
              onClick={() => setIsUnitsMenuOpen(!isUnitsMenuOpen)}
              className="px-1.5 py-0.5 bg-[#0F0F0F] hover:bg-[#1A1A1A] border border-[#222] rounded flex items-center gap-1 text-[10px] text-gray-300"
              title="Project Measurement Units"
            >
              <span>{measurementUnits}</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
            </button>

            {isUnitsMenuOpen && (
              <div className="absolute bottom-6 right-0 w-36 bg-[#0E0E0E] border border-[#262626] rounded shadow-xl z-50 py-1 text-xs">
                {(['Metric (m)', 'Metric (mm)', 'Imperial (ft)'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => {
                      setMeasurementUnits(unit);
                      setIsUnitsMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-left flex items-center justify-between hover:bg-[#1A1A1A] ${
                      measurementUnits === unit ? 'text-[#2DD4BF] font-bold' : 'text-gray-300'
                    }`}
                  >
                    <span>{unit}</span>
                    {measurementUnits === unit && <Check className="w-3 h-3 text-[#2DD4BF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 24. COORDINATE SYSTEM / PROJECTION */}
          <div className="relative">
            <button
              onClick={() => setIsCoordMenuOpen(!isCoordMenuOpen)}
              className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-[#0F0F0F] hover:bg-[#1A1A1A] border border-[#222] rounded text-[10px] text-gray-300"
              title="Coordinate System / Projection Reference"
            >
              <Globe className="w-3 h-3 text-[#2DD4BF]" />
              <span>{coordSystem}</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
            </button>

            {isCoordMenuOpen && (
              <div className="absolute bottom-6 right-0 w-44 bg-[#0E0E0E] border border-[#262626] rounded shadow-xl z-50 py-1 text-xs">
                {(['WCS (World)', 'UCS (Building)', 'UTM Zone 34S'] as const).map((cs) => (
                  <button
                    key={cs}
                    onClick={() => {
                      setCoordSystem(cs);
                      setIsCoordMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-left flex items-center justify-between hover:bg-[#1A1A1A] ${
                      coordSystem === cs ? 'text-[#2DD4BF] font-bold' : 'text-gray-300'
                    }`}
                  >
                    <span>{cs}</span>
                    {coordSystem === cs && <Check className="w-3 h-3 text-[#2DD4BF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SPATIAL COPILOT & LIVING TWIN STATUS */}
          {onToggleSpatialCopilot && (
            <button
              onClick={onToggleSpatialCopilot}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold transition ${
                isSpatialCopilotVisible
                  ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border-[#2DD4BF]/60 shadow-[0_0_8px_rgba(45,212,191,0.25)]'
                  : 'bg-[#0F0F0F] text-gray-400 border-[#2A2A2A] hover:text-white'
              }`}
              title="Toggle LORA AI Spatial Copilot (In-CAD Grounded Assistant)"
            >
              <Sparkles className="w-3 h-3 text-[#2DD4BF]" />
              <span>SPATIAL COPILOT</span>
            </button>
          )}

          <button
            onClick={() => setActiveStudioTab('digital_twin')}
            className={`hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold transition ${
              activeStudioTab === 'digital_twin'
                ? 'bg-[#2DD4BF] text-black border-[#2DD4BF]'
                : 'bg-[#0F0F0F] text-gray-300 border-[#2A2A2A] hover:border-[#2DD4BF]/50'
            }`}
            title="Switch to Living Digital Twin Studio"
          >
            <Activity className="w-3 h-3 text-[#2DD4BF]" />
            <span>LIVING TWIN</span>
          </button>

          {/* 25. LIVE DATA SYNC STATUS */}
          <button
            onClick={() => onOpenDataStateInspector?.()}
            className="flex items-center gap-1 hover:brightness-125 transition"
            title="Data State Integrity Pipeline (Click to inspect all real-time pipelines)"
          >
            <DataStateBadge state="SYNCED" size="xs" />
          </button>

          {/* 26. ROBOT CONNECTION STATUS */}
          <button
            onClick={() => setIsRoboticsModalOpen(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 bg-[#0F0F0F] hover:bg-[#1A1A1A] rounded border border-amber-500/30 text-[10px] text-amber-400 transition"
            title="Open Autonomous Construction Robotics Fleet & LiDAR Drone Mission Control"
          >
            <Bot className="w-3 h-3 text-amber-400" />
            <span className="hidden xl:inline font-bold">ROBOT: ONLINE</span>
          </button>

          {/* 27. NETWORK CONNECTION STATUS */}
          <div
            className="hidden md:flex items-center gap-1 px-1.5 py-0.5 bg-[#0F0F0F] rounded border border-[#222] text-[10px] text-gray-300"
            title={`Network Connection: Latency ${networkLatency}ms`}
          >
            <Wifi className="w-3 h-3 text-[#10B981]" />
            <span>{networkLatency}ms</span>
          </div>

          {/* 28. BACKGROUND TASK STATUS */}
          <div
            className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 bg-[#0F0F0F] rounded border border-[#222] text-[10px] text-gray-400"
            title="Background Tasks & Simulation Queue"
          >
            <FolderSync className="w-3 h-3 text-cyan-400" />
            <span>Tasks: 0 Idle</span>
          </div>

          {/* 29. NOTIFICATIONS SHORTCUT */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (unreadNotifications > 0) setUnreadNotifications(0);
              }}
              className="p-1 hover:bg-[#1A1A1A] text-gray-400 hover:text-white rounded transition relative"
              title="System Notifications & Design Warnings"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute bottom-6 right-0 w-64 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 p-2 text-xs">
                <div className="font-bold text-white border-b border-[#222] pb-1 mb-1.5 flex items-center justify-between">
                  <span>Notifications</span>
                  <span className="text-[10px] text-emerald-400">All Systems Nominal</span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  <div className="p-1.5 bg-[#141414] rounded border border-[#222] text-gray-300">
                    <div className="font-bold text-emerald-400">SANS 10400 Compliance: 94%</div>
                    <div className="text-gray-400">Daylight factor verified across all 4 habitable zones.</div>
                  </div>
                  <div className="p-1.5 bg-[#141414] rounded border border-[#222] text-gray-300">
                    <div className="font-bold text-[#2DD4BF]">CLT Column Grid Synced</div>
                    <div className="text-gray-400">Structural bay dimensions optimized for zero offcut waste.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 30. WORKSPACE SWITCHER */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-[#121212] hover:bg-[#1E1E1E] border border-[#2A2A2A] rounded text-[10px] font-bold text-gray-200"
              title="Switch Active CAD/BIM Workspace"
            >
              <LayoutGrid className="w-3 h-3 text-[#2DD4BF]" />
              <span>{activeWorkspace}</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-500" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute bottom-6 right-0 w-48 bg-[#0E0E0E] border border-[#262626] rounded shadow-xl z-50 py-1 text-xs">
                {[
                  'BIM Architecture',
                  'Structural & MEP',
                  'Sustainability & Carbon',
                  'Construction Robotics',
                  'Site & Civil GIS',
                ].map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full px-2.5 py-1 text-left flex items-center justify-between hover:bg-[#1A1A1A] ${
                      activeWorkspace === ws ? 'text-[#2DD4BF] font-bold' : 'text-gray-300'
                    }`}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <Check className="w-3 h-3 text-[#2DD4BF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 31 & 32. PERFORMANCE INDICATOR & MEMORY/RESOURCE USAGE */}
          <div className="hidden 2xl:flex items-center gap-2 text-[10px] text-gray-500">
            <span className="text-[#10B981] font-bold">{fps} FPS</span>
            <span>MEM: {memoryUsage}</span>
          </div>

          {/* 33. DATE & TIME INDICATOR */}
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
            <Clock className="w-3 h-3 text-gray-500" />
            <span>{currentTime || '12:00:00'}</span>
          </div>

          {/* 34. CUSTOMIZATION / STATUS BAR SETTINGS MENU */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              className="p-1 hover:bg-[#1A1A1A] text-gray-400 hover:text-white rounded transition"
              title="Status Bar Customization Menu"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {isSettingsMenuOpen && (
              <div className="absolute bottom-6 right-0 w-60 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 p-2 text-xs">
                <div className="px-1 py-1 font-bold text-white border-b border-[#222] mb-1.5 flex items-center justify-between">
                  <span>Status Bar Elements</span>
                  <span className="text-[10px] text-[#2DD4BF]">Customization</span>
                </div>
                <div className="space-y-1 text-gray-300 text-[11px]">
                  {[
                    'Cursor Coordinates',
                    'Model / Layout Tabs',
                    'Map & Satellite Toggles',
                    'Active Layer Indicator',
                    'Grid & Snap Modes',
                    'Dynamic Input (DYN)',
                    'Lineweight Display (LWT)',
                    'Robotics Telemetry',
                    'Network & Latency HUD',
                    'Performance & FPS HUD',
                  ].map((label, i) => (
                    <label key={i} className="flex items-center justify-between px-1.5 py-1 hover:bg-[#171717] rounded cursor-pointer">
                      <span>{label}</span>
                      <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowStatusBar?.(false)}
            className="p-1 text-gray-500 hover:text-gray-300 hover:bg-[#1C1C1C] rounded transition"
            title="Hide Status Bar (Restore from View Layout menu)"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>
      )}

      {/* Robotics Fleet & Construction Drone Mission Control Modal */}
      {isRoboticsModalOpen && (
        <RoboticsControlModal
          isOpen={isRoboticsModalOpen}
          onClose={() => setIsRoboticsModalOpen(false)}
        />
      )}
    </div>
  );
};
