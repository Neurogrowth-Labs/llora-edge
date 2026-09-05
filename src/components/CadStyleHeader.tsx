import React, { useState, useRef, useEffect } from 'react';
import {
  FilePlus,
  FolderOpen,
  Save,
  Undo2,
  Redo2,
  Printer,
  Search,
  Bell,
  Users,
  HelpCircle,
  User,
  Minus,
  Square,
  X,
  ChevronDown,
  Command,
  Sparkles,
  Layers,
  Box,
  Activity,
  TrendingUp,
  Leaf,
  FileText,
  Sliders,
  Maximize2,
  Minimize2,
  ShieldCheck,
  SplitSquareVertical,
  BookOpen,
  Compass,
  Trash2,
  Bot,
  Recycle,
  HardHat,
  Sun,
  Cloud,
  Ruler,
  Type,
  Check,
  ExternalLink,
  Share2,
  Settings,
  Grid,
  Magnet,
  DoorOpen,
  Columns,
  Footprints,
  Sofa,
  Eye,
  Download,
  Upload,
  AlertTriangle,
  Info,
  LayoutGrid,
  EyeOff,
  CheckCircle2,
  RotateCcw,
  Volume2,
  Play,
  Hammer,
  ShieldAlert,
  MapPin,
  Globe,
  Radio,
  Workflow,
  Cpu,
  RefreshCw,
  Clock,
  CheckSquare,
} from 'lucide-react';
import { ArchitecturalProject, DrawingTool, Level } from '../types/architecture';
import { SAMPLE_PROJECTS } from '../data/sampleProjects';
import { DataStateBadge } from './DataStateBadge';
import { APP_LOGO, APP_LOGO_STATIC_URL } from '../assets/logo';

export type RibbonTabType =
  | 'home'
  | 'map'
  | 'demolition'
  | 'materials'
  | 'waste'
  | 'robots'
  | 'annotate'
  | 'analysis'
  | 'view'
  | 'output';

export type WorkspaceType =
  | 'BIM Architecture'
  | 'Structural & MEP'
  | 'Sustainability & Carbon'
  | 'Construction Robotics'
  | 'Site & Civil GIS';

export interface DrawingTab {
  id: string;
  title: string;
  type: '2d_plan' | '3d_bim' | 'site_gis' | 'section' | 'schedule' | 'render';
  levelId?: string;
  isModified?: boolean;
}

interface CadStyleHeaderProps {
  project: ArchitecturalProject;
  setProject: (p: ArchitecturalProject | ((prev: ArchitecturalProject) => ArchitecturalProject)) => void;
  onSelectProject: (p: ArchitecturalProject) => void;
  // Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  // Quick Actions & Modals
  onNewProject: () => void;
  onOpenSaveModal?: () => void;
  onPrintPlot: () => void;
  onOpenCommandCenter: () => void;
  onOpenAiCopilot: () => void;
  onOpenAuditModal: () => void;
  onOpenAlternatives: () => void;
  onOpenMaterials: () => void;
  onOpenDesignDna: () => void;
  onOpenClientMode: () => void;
  onOpenDataStateInspector?: () => void;
  // CAD Tools & Navigation
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  activeLevelId: string;
  setActiveLevelId: (levelId: string) => void;
  onAddLevel: () => void;
  snapToGrid: boolean;
  setSnapToGrid: (val: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  // Primary Studio View Tab
  activeStudioTab: '2d' | '3d' | 'intelligence' | 'developer' | 'sustainability' | 'render' | 'docs' | 'digital_twin';
  setActiveStudioTab: (tab: '2d' | '3d' | 'intelligence' | 'developer' | 'sustainability' | 'render' | 'docs' | 'digital_twin') => void;
  buildingScore: number;
  // Granular UI Visibility Controls (Top Header is ALWAYS visible)
  showRibbonBar?: boolean;
  setShowRibbonBar?: React.Dispatch<React.SetStateAction<boolean>>;
  showRibbonTools?: boolean;
  setShowRibbonTools?: React.Dispatch<React.SetStateAction<boolean>>;
  showDrawingTabs?: boolean;
  setShowDrawingTabs?: React.Dispatch<React.SetStateAction<boolean>>;
  showCommandConsole?: boolean;
  setShowCommandConsole?: React.Dispatch<React.SetStateAction<boolean>>;
  showStatusBar?: boolean;
  setShowStatusBar?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CadStyleHeader: React.FC<CadStyleHeaderProps> = ({
  project,
  setProject,
  onSelectProject,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNewProject,
  onOpenSaveModal,
  onPrintPlot,
  onOpenCommandCenter,
  onOpenAiCopilot,
  onOpenAuditModal,
  onOpenAlternatives,
  onOpenMaterials,
  onOpenDesignDna,
  onOpenClientMode,
  onOpenDataStateInspector,
  activeTool,
  setActiveTool,
  activeLevelId,
  setActiveLevelId,
  onAddLevel,
  snapToGrid,
  setSnapToGrid,
  gridSize,
  setGridSize,
  activeStudioTab,
  setActiveStudioTab,
  buildingScore,
  showRibbonBar = true,
  setShowRibbonBar,
  showRibbonTools = true,
  setShowRibbonTools,
  showDrawingTabs = true,
  setShowDrawingTabs,
  showCommandConsole = true,
  setShowCommandConsole,
  showStatusBar = true,
  setShowStatusBar,
}) => {
  // UI Layout Menu Open State
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState<boolean>(false);

  // Ribbon Tab State
  const [activeRibbonTab, setActiveRibbonTab] = useState<RibbonTabType>('home');
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('BIM Architecture');

  // Open Drawing File Tabs
  const [drawingTabs, setDrawingTabs] = useState<DrawingTab[]>([
    { id: 'tab_plan_0', title: 'Plan - Ground Floor (L0)', type: '2d_plan', levelId: 'lvl_0' },
    { id: 'tab_plan_1', title: 'Plan - First Floor (L1)', type: '2d_plan', levelId: 'lvl_1' },
    { id: 'tab_3d_master', title: '3D BIM Master Model', type: '3d_bim' },
    { id: 'tab_site_gis', title: 'Site & Microclimate GIS', type: 'site_gis' },
  ]);
  const [activeDrawingTabId, setActiveDrawingTabId] = useState<string>('tab_plan_0');

  // Dropdowns & Popovers
  const [isAppMenuOpen, setIsAppMenuOpen] = useState<boolean>(false);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState<boolean>(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isCollabOpen, setIsCollabOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState<boolean>(false);
  const [commandInput, setCommandInput] = useState<string>('');

  // Sample Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 'notif_1',
      title: 'Structural Span Optimization',
      message: 'Living Room span (6.2m) successfully reinforced with CLT spine beam.',
      time: '2m ago',
      type: 'success',
      unread: true,
    },
    {
      id: 'notif_2',
      title: 'SANS 10400-XA Daylighting Alert',
      message: 'North-facing glazing exceeds minimum 10% floor area requirement (18.4% achieved).',
      time: '14m ago',
      type: 'info',
      unread: true,
    },
    {
      id: 'notif_3',
      title: 'Circular Waste Diversion',
      message: '92.4% construction waste diversion target validated for SANS ESG standard.',
      time: '1h ago',
      type: 'warning',
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Active collaborators
  const collaborators = [
    { name: 'Simao L. (You)', role: 'Lead Architect', color: '#2DD4BF', active: true },
    { name: 'Elena R.', role: 'Structural Engineer', color: '#38BDF8', active: true },
    { name: 'Marcus K.', role: 'Sustainability & ESG', color: '#10B981', active: false },
  ];

  // Close popovers on outside click
  const headerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsAppMenuOpen(false);
        setIsProjectSelectorOpen(false);
        setIsWorkspaceOpen(false);
        setIsNotificationsOpen(false);
        setIsCollabOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Quick Save
  const handleQuickSave = () => {
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2400);
  };

  // Switch Drawing Tab
  const handleSelectDrawingTab = (tab: DrawingTab) => {
    setActiveDrawingTabId(tab.id);
    if (tab.type === '2d_plan') {
      setActiveStudioTab('2d');
      if (tab.levelId) setActiveLevelId(tab.levelId);
    } else if (tab.type === '3d_bim') {
      setActiveStudioTab('3d');
    } else if (tab.type === 'site_gis') {
      setActiveStudioTab('intelligence');
    }
  };

  // Close Tab
  const handleCloseDrawingTab = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    if (drawingTabs.length <= 1) return;
    const remaining = drawingTabs.filter((t) => t.id !== tabId);
    setDrawingTabs(remaining);
    if (activeDrawingTabId === tabId) {
      handleSelectDrawingTab(remaining[0]);
    }
  };

  // Add New Tab
  const handleAddNewDrawingTab = () => {
    const newIdx = drawingTabs.length + 1;
    const newTab: DrawingTab = {
      id: `tab_custom_${Date.now()}`,
      title: `Drawing Sheet ${newIdx}`,
      type: '2d_plan',
      levelId: 'lvl_0',
    };
    setDrawingTabs([...drawingTabs, newTab]);
    setActiveDrawingTabId(newTab.id);
  };

  // Quick Command Execution
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toUpperCase();
    if (!cmd) return;

    if (cmd === 'WALL' || cmd === 'W') setActiveTool('wall');
    else if (cmd === 'DOOR' || cmd === 'D') setActiveTool('door');
    else if (cmd === 'WINDOW' || cmd === 'G') setActiveTool('window');
    else if (cmd === 'COLUMN' || cmd === 'C') setActiveTool('column');
    else if (cmd === 'ROOM' || cmd === 'R') setActiveTool('room');
    else if (cmd === 'DIM' || cmd === 'M') setActiveTool('dimension');
    else if (cmd === 'SELECT' || cmd === 'V') setActiveTool('select');
    else if (cmd === '3D' || cmd === 'BIM') setActiveStudioTab('3d');
    else if (cmd === '2D' || cmd === 'CAD') setActiveStudioTab('2d');
    else if (cmd === 'SAVE') handleQuickSave();
    else if (cmd === 'PRINT' || cmd === 'PLOT') onPrintPlot();
    else if (cmd === 'AUDIT' || cmd === 'SCORE') onOpenAuditModal();
    else if (cmd === 'AI' || cmd === 'COPILOT') onOpenAiCopilot();
    else if (cmd === 'RENDER') setActiveStudioTab('render');
    else {
      // Open general command center with query
      onOpenCommandCenter();
    }
    setCommandInput('');
  };

  // Fullscreen / Window Toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsWindowMaximized(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsWindowMaximized(false);
      }
    }
  };

  return (
    <div ref={headerRef} className="flex flex-col bg-[#080808] border-b border-[#222222] select-none z-30 font-sans shadow-md">
      {/* ========================================================================= */}
      {/* 1. TOP-LEVEL APPLICATION TITLEBAR (CAD BRAND, QUICK ACCESS, SEARCH, PROFILE, WINDOW CONTROLS) */}
      {/* ========================================================================= */}
      <div className="h-9 px-2 bg-[#050505] border-b border-[#1A1A1A] flex items-center justify-between text-xs text-gray-300">
        {/* Left Section: Application Menu & Quick Access Toolbar */}
        <div className="flex items-center gap-1">
          {/* APPLICATION MENU ICON (BRAND LOGO BUTTON) */}
          <div className="relative">
            <button
              onClick={() => setIsAppMenuOpen(!isAppMenuOpen)}
              className="h-7 pl-1.5 pr-2 bg-gradient-to-br from-[#0D9488] to-[#0F766E] hover:from-[#14B8A6] hover:to-[#0D9488] text-white font-black text-xs rounded flex items-center gap-1.5 shadow-md shadow-[#0D9488]/30 transition transform active:scale-95 border border-[#2DD4BF]/40"
              title="Lora Edge Application Menu"
            >
              <div className="w-5 h-5 rounded bg-black/40 border border-white/20 overflow-hidden flex items-center justify-center">
                <img
                  src={APP_LOGO}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                  }}
                  alt="Lora Edge Brand Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </button>

            {/* APPLICATION MENU DROPDOWN */}
            {isAppMenuOpen && (
              <div className="absolute top-8 left-0 w-80 bg-[#0C0C0C] border border-[#262626] rounded-lg shadow-2xl z-50 py-1 text-xs text-gray-200 backdrop-blur-xl animate-in fade-in duration-100">
                <div className="px-3 py-2 border-b border-[#1F1F1F] bg-[#141414] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-[#05070B] border border-[#2DD4BF]/50 p-0.5 flex items-center justify-center overflow-hidden shadow">
                      <img
                        src={APP_LOGO}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                        }}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">Lora Edge 2026</div>
                      <div className="text-[10px] text-gray-400">Enterprise AI Architecture & BIM Studio</div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] rounded text-[9px] font-mono font-bold">
                    PRO
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAppMenuOpen(false);
                      onNewProject();
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FilePlus className="w-4 h-4 text-[#2DD4BF]" />
                      <span>New Project / Drawing</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Ctrl+N</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAppMenuOpen(false);
                      setIsProjectSelectorOpen(true);
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderOpen className="w-4 h-4 text-amber-400" />
                      <span>Open Recent Project...</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Ctrl+O</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAppMenuOpen(false);
                      handleQuickSave();
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Save className="w-4 h-4 text-blue-400" />
                      <span>Save Project</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Ctrl+S</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAppMenuOpen(false);
                      onPrintPlot();
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Printer className="w-4 h-4 text-cyan-400" />
                      <span>Plot / Print Blueprint PDF</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">Ctrl+P</span>
                  </button>
                </div>

                <div className="my-1 border-t border-[#1F1F1F]" />

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsAppMenuOpen(false);
                      setActiveStudioTab('docs');
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Download className="w-4 h-4 text-emerald-400" />
                      <span>Export IFC 4x3 / DXF / CSV BOM</span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 -rotate-90" />
                  </button>

                  <button
                    onClick={() => {
                      setIsAppMenuOpen(false);
                      onOpenClientMode();
                    }}
                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#1A1A1A] transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Eye className="w-4 h-4 text-purple-400" />
                      <span>Publish to Client Presentation</span>
                    </div>
                  </button>
                </div>

                <div className="my-1 border-t border-[#1F1F1F]" />

                <div className="px-3 py-2 text-[10px] text-gray-500 flex items-center justify-between bg-[#080808]">
                  <span>Climate: {project.climate.location}</span>
                  <span>Grid: {gridSize}m</span>
                </div>
              </div>
            )}
          </div>

          {/* APPLICATION LOGO / PRODUCT NAME */}
          <div className="flex items-center gap-2 px-2 border-r border-[#1F1F1F]">
            <div className="w-5 h-5 rounded bg-[#0A0E17] border border-[#2DD4BF]/50 p-0.5 flex items-center justify-center overflow-hidden shadow-sm">
              <img
                src={APP_LOGO}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                }}
                alt="Lora Edge Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold tracking-wider text-white text-xs bg-gradient-to-r from-white via-gray-200 to-[#2DD4BF] bg-clip-text text-transparent">
              LORA
            </span>
            <span className="text-[10px] font-semibold text-[#2DD4BF] tracking-widest uppercase">EDGE</span>
          </div>

          {/* QUICK ACCESS TOOLBAR (New, Open, Save, Undo, Redo, Print/Plot) */}
          <div className="flex items-center gap-0.5 px-1 bg-[#101010] rounded border border-[#222222]">
            <button
              onClick={onNewProject}
              className="p-1 hover:bg-[#202020] text-gray-300 hover:text-white rounded transition"
              title="New Project (Ctrl+N)"
            >
              <FilePlus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
              className="p-1 hover:bg-[#202020] text-gray-300 hover:text-white rounded transition"
              title="Open Project (Ctrl+O)"
            >
              <FolderOpen className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleQuickSave}
              className="p-1 hover:bg-[#202020] text-gray-300 hover:text-white rounded transition relative"
              title="Save Project (Ctrl+S)"
            >
              <Save className="w-3.5 h-3.5" />
              {isSavedToast && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-[#10B981] text-[#050505] text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap z-50 animate-bounce">
                  Saved!
                </span>
              )}
            </button>

            <div className="w-[1px] h-3 bg-[#262626] mx-0.5" />

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1 rounded transition ${
                canUndo ? 'hover:bg-[#202020] text-gray-300 hover:text-white' : 'text-gray-600 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1 rounded transition ${
                canRedo ? 'hover:bg-[#202020] text-gray-300 hover:text-white' : 'text-gray-600 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-3 bg-[#262626] mx-0.5" />

            <button
              onClick={onPrintPlot}
              className="p-1 hover:bg-[#202020] text-gray-300 hover:text-white rounded transition"
              title="Plot / Print Blueprint (Ctrl+P)"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* PROJECT / DRAWING SELECTOR DROPDOWN */}
          <div className="relative ml-1">
            <button
              onClick={() => setIsProjectSelectorOpen(!isProjectSelectorOpen)}
              className="h-6 px-2.5 bg-[#121212] hover:bg-[#1C1C1C] border border-[#262626] rounded flex items-center gap-2 text-[11px] font-semibold text-gray-200 transition"
              title="Switch Active Project / Drawing"
            >
              <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span className="max-w-[130px] truncate">{project.name}</span>
              <span className="text-[10px] text-gray-400 font-mono">({project.jurisdiction})</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* PROJECT LIST DROPDOWN */}
            {isProjectSelectorOpen && (
              <div className="absolute top-7 left-0 w-72 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 py-1.5 backdrop-blur-md">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1F1F1F] flex items-center justify-between">
                  <span>Active Workspace Projects</span>
                  <button
                    onClick={() => {
                      setIsProjectSelectorOpen(false);
                      onNewProject();
                    }}
                    className="text-[#2DD4BF] hover:underline flex items-center gap-1"
                  >
                    <FilePlus className="w-3 h-3" /> New
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto py-1">
                  {SAMPLE_PROJECTS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p);
                        setIsProjectSelectorOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#1A1A1A] transition text-xs ${
                        p.id === project.id ? 'bg-[#182322] text-[#2DD4BF] font-bold' : 'text-gray-300'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {p.climate.location} · {p.buildingType}
                        </div>
                      </div>
                      {p.id === project.id && <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DATA STATE PIPELINE INSPECTOR TRIGGER */}
          {onOpenDataStateInspector && (
            <button
              onClick={onOpenDataStateInspector}
              className="hidden md:flex items-center gap-1.5 h-6 px-2 bg-[#101010] hover:bg-[#1A1A1A] border border-[#282828] hover:border-[#2DD4BF]/40 rounded text-[10px] text-gray-300 transition"
              title="Open Live Data State Pipeline Inspector"
            >
              <DataStateBadge state="SYNCED" label="PIPELINES: SYNCED" size="xs" showPulse={false} />
            </button>
          )}
        </div>

        {/* Center: Command / Search Field (InfoCenter Search & AI Commands) */}
        <div className="flex-1 max-w-xl mx-3">
          <form onSubmit={handleCommandSubmit} className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#2DD4BF] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Type a command, tool, or building query (e.g. WALL, SOLAR, U-VALUE, AUDIT)..."
              className="w-full h-6 pl-8 pr-16 bg-[#111111] hover:bg-[#161616] focus:bg-[#141414] border border-[#262626] focus:border-[#2DD4BF] rounded text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition shadow-inner font-mono text-[11px]"
            />
            <button
              type="button"
              onClick={onOpenCommandCenter}
              className="absolute right-1 px-1.5 py-0.5 bg-[#1F1F1F] hover:bg-[#2A2A2A] rounded text-[9px] font-mono text-gray-400 border border-[#333] flex items-center gap-0.5"
              title="Universal AI Command Center (Cmd+K)"
            >
              <Command className="w-2.5 h-2.5" />
              <span>K</span>
            </button>
          </form>
        </div>

        {/* Right Section: Workspace Selector, Notifications, Collab, Help, Profile, Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* WORKSPACE SELECTOR */}
          <div className="relative">
            <button
              onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
              className="h-6 px-2 bg-[#121212] hover:bg-[#1C1C1C] border border-[#262626] rounded flex items-center gap-1.5 text-[10px] font-bold text-gray-300 transition"
              title="Switch Workspace Profile"
            >
              <Workflow className="w-3 h-3 text-[#2DD4BF]" />
              <span className="hidden xl:inline">{activeWorkspace}</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>

            {isWorkspaceOpen && (
              <div className="absolute top-7 right-0 w-56 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 py-1 text-xs">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#1F1F1F]">
                  Switch Workspace
                </div>
                {(
                  [
                    'BIM Architecture',
                    'Structural & MEP',
                    'Sustainability & Carbon',
                    'Construction Robotics',
                    'Site & Civil GIS',
                  ] as WorkspaceType[]
                ).map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceOpen(false);
                      if (ws === 'BIM Architecture') setActiveStudioTab('2d');
                      if (ws === 'Structural & MEP') setActiveStudioTab('3d');
                      if (ws === 'Sustainability & Carbon') setActiveStudioTab('sustainability');
                      if (ws === 'Site & Civil GIS') setActiveStudioTab('intelligence');
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-[#1A1A1A] transition ${
                      activeWorkspace === ws ? 'text-[#2DD4BF] font-bold bg-[#141414]' : 'text-gray-300'
                    }`}
                  >
                    <span>{ws}</span>
                    {activeWorkspace === ws && <Check className="w-3 h-3 text-[#2DD4BF]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLLABORATION & LIVE SYNC STATUS */}
          <div className="relative">
            <button
              onClick={() => setIsCollabOpen(!isCollabOpen)}
              className="h-6 px-2 bg-[#121212] hover:bg-[#1C1C1C] border border-[#262626] rounded flex items-center gap-1.5 text-[10px] font-semibold text-gray-300 transition"
              title="Cloud Collaboration & Presence"
            >
              <Radio className="w-3 h-3 text-[#10B981] animate-pulse" />
              <span className="hidden lg:inline text-gray-300">Live Sync</span>
              <div className="flex -space-x-1.5 items-center">
                {collaborators.map((c, i) => (
                  <div
                    key={i}
                    style={{ backgroundColor: c.color }}
                    className="w-4 h-4 rounded-full border border-[#0A0A0A] flex items-center justify-center text-[8px] font-bold text-black"
                  >
                    {c.name[0]}
                  </div>
                ))}
              </div>
            </button>

            {isCollabOpen && (
              <div className="absolute top-7 right-0 w-64 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 p-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1F1F1F]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Real-Time Team</span>
                  </span>
                  <span className="text-[10px] text-[#10B981] font-mono">● 2 Online</span>
                </div>
                <div className="space-y-1.5 mb-2">
                  {collaborators.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between p-1.5 bg-[#141414] rounded">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ backgroundColor: c.color }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                        >
                          {c.name[0]}
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-gray-200">{c.name}</div>
                          <div className="text-[9px] text-gray-400">{c.role}</div>
                        </div>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.active ? 'bg-[#10B981]' : 'bg-gray-500'}`} />
                    </div>
                  ))}
                </div>
                <button
                  onClick={onOpenClientMode}
                  className="w-full py-1.5 bg-[#2DD4BF] text-black font-bold rounded text-[11px] flex items-center justify-center gap-1.5 hover:brightness-110 transition"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Share Live Client Review Link</span>
                </button>
              </div>
            )}
          </div>

          {/* NOTIFICATIONS BELL */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="p-1 hover:bg-[#1C1C1C] text-gray-300 hover:text-white rounded transition relative"
              title="Design Audits & Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white font-bold rounded-full text-[8px] flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute top-7 right-0 w-80 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 py-2 text-xs">
                <div className="px-3 pb-2 border-b border-[#1F1F1F] flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Notifications & Critic</span>
                  </span>
                  <button
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                    }}
                    className="text-[10px] text-[#2DD4BF] hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-[#1A1A1A]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 hover:bg-[#141414] transition cursor-pointer ${
                        n.unread ? 'bg-[#121A1A]/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-semibold text-gray-200 text-[11px]">{n.title}</span>
                        <span className="text-[9px] text-gray-500 font-mono">{n.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-tight">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* HELP & SHORTCUTS MODAL TRIGGER */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-1 hover:bg-[#1C1C1C] text-gray-300 hover:text-white rounded transition"
            title="Help & CAD Keyboard Shortcuts"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* USER ACCOUNT / PROFILE */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 bg-[#121212] hover:bg-[#1C1C1C] border border-[#262626] rounded text-[11px] text-gray-200 transition"
              title="Architect User Account"
            >
              <div className="w-4 h-4 rounded-full bg-[#2DD4BF] text-black font-bold text-[9px] flex items-center justify-center">
                S
              </div>
              <span className="hidden md:inline font-semibold">Simao</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-7 right-0 w-56 bg-[#0E0E0E] border border-[#262626] rounded-lg shadow-2xl z-50 py-1.5 text-xs">
                <div className="px-3 py-2 border-b border-[#1F1F1F]">
                  <div className="font-bold text-white">Simao Lusimadio</div>
                  <div className="text-[10px] text-[#2DD4BF]">Senior BIM Architect Lead</div>
                  <div className="text-[9px] text-gray-500 font-mono mt-0.5">SACAP Reg. No. 2026-4829</div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenDesignDna();
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#1A1A1A] text-gray-300"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Design DNA Preferences</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuditModal();
                    }}
                    className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-[#1A1A1A] text-gray-300"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Building Intelligence Score</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-3 bg-[#262626] mx-0.5" />

          {/* UI PANES & VISIBILITY TOGGLE (Allows user to hide/show each header and footer separately) */}
          <div className="relative">
            <button
              onClick={() => setIsLayoutMenuOpen(!isLayoutMenuOpen)}
              className={`h-6 px-2 rounded flex items-center gap-1.5 transition text-xs border ${
                isLayoutMenuOpen || !showRibbonBar || !showRibbonTools || !showDrawingTabs || !showCommandConsole || !showStatusBar
                  ? 'bg-[#1C2E2B] text-[#2DD4BF] border-[#2DD4BF]/50'
                  : 'bg-[#121212] hover:bg-[#1C1C1C] text-gray-300 border-[#262626]'
              }`}
              title="Workspace UI Panes & Visibility Controls"
            >
              <LayoutGrid className="w-3 h-3 text-[#2DD4BF]" />
              <span className="hidden sm:inline font-semibold text-[11px]">View Layout</span>
              <ChevronDown className="w-2.5 h-2.5 text-gray-400" />
            </button>

            {isLayoutMenuOpen && (
              <div className="absolute top-7 right-0 w-72 bg-[#0F0F0F] border border-[#2E2E2E] rounded-lg shadow-2xl p-2.5 z-50 text-xs">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#222]">
                  <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <LayoutGrid className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Workspace Panes Visibility</span>
                  </span>
                  <span className="text-[9px] text-[#2DD4BF] font-mono font-bold bg-[#1C2E2B] px-1.5 py-0.5 rounded">
                    Top Bar Locked
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-[10px] uppercase font-bold text-gray-400 px-1 pt-0.5">Headers</div>
                  <button
                    onClick={() => setShowRibbonBar?.((v) => !v)}
                    className="w-full px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#1A1A1A] text-left transition"
                  >
                    <span className="text-gray-200">Ribbon Navigation Bar</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showRibbonBar ? 'bg-[#2DD4BF] text-black font-bold' : 'border border-gray-600 text-transparent'}`}>✓</span>
                  </button>

                  <button
                    onClick={() => setShowRibbonTools?.((v) => !v)}
                    className="w-full px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#1A1A1A] text-left transition"
                  >
                    <span className="text-gray-200">Ribbon Action Tools Panel</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showRibbonTools ? 'bg-[#2DD4BF] text-black font-bold' : 'border border-gray-600 text-transparent'}`}>✓</span>
                  </button>

                  <button
                    onClick={() => setShowDrawingTabs?.((v) => !v)}
                    className="w-full px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#1A1A1A] text-left transition"
                  >
                    <span className="text-gray-200">Drawing File Tabs Bar</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showDrawingTabs ? 'bg-[#2DD4BF] text-black font-bold' : 'border border-gray-600 text-transparent'}`}>✓</span>
                  </button>

                  <div className="my-1 border-t border-[#222]" />
                  <div className="text-[10px] uppercase font-bold text-gray-400 px-1 pt-0.5">Footers</div>

                  <button
                    onClick={() => setShowCommandConsole?.((v) => !v)}
                    className="w-full px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#1A1A1A] text-left transition"
                  >
                    <span className="text-gray-200">Command Prompt & Console</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showCommandConsole ? 'bg-[#2DD4BF] text-black font-bold' : 'border border-gray-600 text-transparent'}`}>✓</span>
                  </button>

                  <button
                    onClick={() => setShowStatusBar?.((v) => !v)}
                    className="w-full px-2 py-1.5 rounded flex items-center justify-between hover:bg-[#1A1A1A] text-left transition"
                  >
                    <span className="text-gray-200">Status Bar & OSNAP Toggles</span>
                    <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${showStatusBar ? 'bg-[#2DD4BF] text-black font-bold' : 'border border-gray-600 text-transparent'}`}>✓</span>
                  </button>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#222] flex items-center justify-between gap-1">
                  <button
                    onClick={() => {
                      setShowRibbonBar?.(true);
                      setShowRibbonTools?.(true);
                      setShowDrawingTabs?.(true);
                      setShowCommandConsole?.(true);
                      setShowStatusBar?.(true);
                    }}
                    className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] rounded text-[10px] text-gray-300 hover:text-white transition"
                  >
                    Show All
                  </button>
                  <button
                    onClick={() => {
                      setShowRibbonBar?.(false);
                      setShowRibbonTools?.(false);
                      setShowDrawingTabs?.(true);
                      setShowCommandConsole?.(false);
                      setShowStatusBar?.(true);
                    }}
                    className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] rounded text-[10px] text-gray-300 hover:text-white transition"
                  >
                    Drafting Focus
                  </button>
                  <button
                    onClick={() => {
                      setShowRibbonBar?.(false);
                      setShowRibbonTools?.(false);
                      setShowDrawingTabs?.(false);
                      setShowCommandConsole?.(false);
                      setShowStatusBar?.(false);
                    }}
                    className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] rounded text-[10px] text-[#2DD4BF] font-semibold transition"
                  >
                    Zen Viewport
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-[1px] h-3 bg-[#262626] mx-0.5" />

          {/* WINDOW CONTROLS (Minimize, Maximize/Restore, Close) */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => {}}
              className="p-1 hover:bg-[#202020] text-gray-400 hover:text-white rounded transition"
              title="Minimize Window"
            >
              <Minus className="w-3 h-3" />
            </button>

            <button
              onClick={toggleFullScreen}
              className="p-1 hover:bg-[#202020] text-gray-400 hover:text-white rounded transition"
              title={isWindowMaximized ? 'Restore Window' : 'Maximize Window'}
            >
              {isWindowMaximized ? <Minimize2 className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>

            <button
              onClick={() => {
                if (confirm('Close Lora Edge session?')) {
                  window.close();
                }
              }}
              className="p-1 hover:bg-rose-600 hover:text-white text-gray-400 rounded transition"
              title="Close Session"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. RIBBON TABS BAR (Home, Map, Demolition, Materials, Waste Analysis, Robots, Annotate, Analysis, View, Output) */}
      {/* ========================================================================= */}
      {showRibbonBar && (
        <div className="h-8 px-2 bg-[#0C0C0C] border-b border-[#1F1F1F] flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-0.5">
            {(
              [
                { id: 'home', label: 'Home', icon: Layers },
                { id: 'map', label: 'Map / GIS', icon: MapPin },
                { id: 'demolition', label: 'Demolition', icon: Hammer },
                { id: 'materials', label: 'Materials', icon: BookOpen },
                { id: 'waste', label: 'Waste Analysis', icon: Recycle },
                { id: 'robots', label: 'Robotics', icon: Bot },
                { id: 'annotate', label: 'Annotate', icon: Type },
                { id: 'analysis', label: 'Analysis', icon: Activity },
                { id: 'view', label: 'View & 3D', icon: Box },
                { id: 'output', label: 'Output / Plot', icon: FileText },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeRibbonTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveRibbonTab(tab.id);
                    if (tab.id === 'view') setActiveStudioTab('3d');
                    if (tab.id === 'home') setActiveStudioTab('2d');
                    if (tab.id === 'materials') onOpenMaterials();
                    if (tab.id === 'analysis') setActiveStudioTab('intelligence');
                    if (tab.id === 'waste') setActiveStudioTab('sustainability');
                    if (tab.id === 'output') setActiveStudioTab('docs');
                  }}
                  className={`h-7 px-3 rounded-t font-semibold text-xs flex items-center gap-1.5 transition-all relative ${
                    isActive
                      ? 'bg-[#181818] text-[#2DD4BF] border-t-2 border-[#2DD4BF] font-bold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#121212]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Studio Mode Badges & Hide Ribbon Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded border border-[#222222]">
              {(
                [
                  { id: '2d', label: '2D CAD', icon: Layers },
                  { id: '3d', label: '3D BIM', icon: Box },
                  { id: 'digital_twin', label: 'LIVING TWIN', icon: Activity },
                  { id: 'intelligence', label: 'INTELLIGENCE', icon: Globe },
                  { id: 'sustainability', label: 'ESG / EDGE', icon: Leaf },
                  { id: 'render', label: 'AI RENDER', icon: Sparkles },
                  { id: 'docs', label: 'DOCS', icon: FileText },
                ] as const
              ).map((sTab) => {
                const Icon = sTab.icon;
                const isSel = activeStudioTab === sTab.id;
                return (
                  <button
                    key={sTab.id}
                    onClick={() => setActiveStudioTab(sTab.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      isSel ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{sTab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowRibbonBar?.(false)}
              className="p-1 text-gray-500 hover:text-gray-300 hover:bg-[#1C1C1C] rounded transition"
              title="Hide Ribbon Bar (Restore from View Layout menu)"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTEXT-SENSITIVE RIBBON TOOL PANEL (Changes based on active Ribbon Tab) */}
      {/* ========================================================================= */}
      {showRibbonTools && (
        <div className="min-h-[52px] bg-[#141414] border-b border-[#222222] px-3 py-1.5 flex items-center justify-between gap-4 overflow-x-auto text-xs">
          {/* HOME RIBBON: Core CAD Drawing & Modeling Tools */}
        {activeRibbonTab === 'home' && (
          <div className="flex items-center gap-3">
            {/* Draw Tools Group */}
            <div className="flex items-center gap-1 pr-3 border-r border-[#262626]">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mr-1">Draw:</span>
              <button
                onClick={() => setActiveTool('select')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'select' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                Select (V)
              </button>
              <button
                onClick={() => setActiveTool('wall')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'wall' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                <Square className="w-3.5 h-3.5" /> Wall (W)
              </button>
              <button
                onClick={() => setActiveTool('door')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'door' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                <DoorOpen className="w-3.5 h-3.5" /> Door (D)
              </button>
              <button
                onClick={() => setActiveTool('window')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'window' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" /> Window (G)
              </button>
              <button
                onClick={() => setActiveTool('column')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'column' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                <Columns className="w-3.5 h-3.5" /> Column (C)
              </button>
              <button
                onClick={() => setActiveTool('room')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'room' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                Room (R)
              </button>
              <button
                onClick={() => setActiveTool('furniture')}
                className={`px-2 py-1 rounded flex items-center gap-1 text-[11px] font-semibold ${
                  activeTool === 'furniture' ? 'bg-[#262626] text-[#2DD4BF] border border-[#333]' : 'text-gray-300 hover:bg-[#1E1E1E]'
                }`}
              >
                <Sofa className="w-3.5 h-3.5" /> Furniture
              </button>
            </div>

            {/* Snapping & Levels */}
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Level:</span>
              <select
                value={activeLevelId}
                onChange={(e) => setActiveLevelId(e.target.value)}
                className="bg-[#1C1C1C] border border-[#333] text-gray-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-[#2DD4BF]"
              >
                {project.levels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} ({lvl.elevation}m)
                  </option>
                ))}
              </select>

              <button
                onClick={onAddLevel}
                className="p-1 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333] rounded text-[#2DD4BF]"
                title="Add New Storey Level"
              >
                +
              </button>

              <label className="flex items-center gap-1.5 text-[11px] text-gray-300 ml-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded accent-[#2DD4BF]"
                />
                <Magnet className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Snap ({gridSize}m)</span>
              </label>
            </div>

            {/* AI Generator CTA */}
            <button
              onClick={onOpenAiCopilot}
              className="bg-gradient-to-r from-[#0F766E] to-[#0D9488] hover:from-[#14B8A6] hover:to-[#0F766E] text-white px-3 py-1 rounded text-xs font-bold flex items-center shadow"
            >
              <span>AI Architect Copilot</span>
            </button>
          </div>
        )}

        {/* MAP / GIS RIBBON */}
        {activeRibbonTab === 'map' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <span className="text-[9px] font-bold text-gray-500 uppercase">Site Bounds:</span>
              <span className="px-2 py-0.5 bg-[#1F1F1F] rounded text-[11px] text-gray-300 font-mono">
                {project.site.widthM}m × {project.site.depthM}m ({project.site.widthM * project.site.depthM} m²)
              </span>
            </div>
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <Compass className="w-4 h-4 text-[#2DD4BF]" />
              <span className="text-[11px] text-gray-300">
                Orientation North: <strong>{project.site.orientationNorthDeg}°</strong>
              </span>
            </div>
            <button
              onClick={() => setActiveStudioTab('intelligence')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-[#2DD4BF] rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> Solar Azimuth & Daylight Heatmap
            </button>
          </div>
        )}

        {/* DEMOLITION RIBBON */}
        {activeRibbonTab === 'demolition' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <Hammer className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-gray-300">Demolition Phase Tagging & Salvage Recovery</span>
            </div>
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded text-[10px] font-bold">
              Existing Structure Retained: 78%
            </span>
            <button
              onClick={() => setActiveStudioTab('sustainability')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-gray-200 rounded text-xs font-semibold flex items-center gap-1"
            >
              <Recycle className="w-3.5 h-3.5 text-emerald-400" /> Material Reuse Audit
            </button>
          </div>
        )}

        {/* MATERIALS RIBBON */}
        {activeRibbonTab === 'materials' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <BookOpen className="w-4 h-4 text-[#2DD4BF]" />
              <span className="text-[11px] text-gray-300">Sustainable Materials Specification & EPD</span>
            </div>
            <button
              onClick={onOpenMaterials}
              className="px-3 py-1 bg-[#2DD4BF] text-black rounded text-xs font-bold flex items-center gap-1.5 hover:brightness-110"
            >
              <Sparkles className="w-3.5 h-3.5" /> Open Materials Catalog
            </button>
            <span className="text-[11px] text-gray-400">CLT Timber, Low-Carbon Concrete, High-Performance Low-E Glass</span>
          </div>
        )}

        {/* WASTE ANALYSIS RIBBON */}
        {activeRibbonTab === 'waste' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <Recycle className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] text-gray-300 font-bold">C&D Waste Diversion Rate: 92.4%</span>
            </div>
            <button
              onClick={() => setActiveStudioTab('sustainability')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-emerald-400 rounded text-xs font-semibold flex items-center gap-1"
            >
              <Leaf className="w-3.5 h-3.5" /> Circular Economy & Carbon LCA
            </button>
          </div>
        )}

        {/* ROBOTS RIBBON */}
        {activeRibbonTab === 'robots' && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pr-3 border-r border-[#262626]">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] text-gray-300">Autonomous Construction Robotics & 3D Printing Paths</span>
            </div>
            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-mono">
              Rover Survey Lidar: READY
            </span>
            <button
              onClick={() => setActiveStudioTab('developer')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-gray-200 rounded text-xs font-semibold"
            >
              Robotic Prefabrication Matrix
            </button>
          </div>
        )}

        {/* ANNOTATE RIBBON */}
        {activeRibbonTab === 'annotate' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTool('dimension')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-xs font-semibold ${
                activeTool === 'dimension' ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-300 hover:bg-[#1E1E1E]'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" /> Linear Dimension (M)
            </button>
            <button
              onClick={() => setActiveTool('text')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 text-xs font-semibold ${
                activeTool === 'text' ? 'bg-[#262626] text-[#2DD4BF]' : 'text-gray-300 hover:bg-[#1E1E1E]'
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Text Annotation (T)
            </button>
            <span className="text-[10px] text-gray-400 font-mono">Standards: SANS 10400 / ISO 128 CAD</span>
          </div>
        )}

        {/* ANALYSIS RIBBON */}
        {activeRibbonTab === 'analysis' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveStudioTab('intelligence')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-[#2DD4BF] rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5" /> Building Intelligence Studio
            </button>
            <button
              onClick={onOpenAuditModal}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-amber-400 rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> SANS 10400 & Structural Critic
            </button>
            <span className="px-2 py-0.5 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded text-[10px] font-bold">
              Score: {buildingScore}/100
            </span>
          </div>
        )}

        {/* VIEW RIBBON */}
        {activeRibbonTab === 'view' && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveStudioTab('3d')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-[#2DD4BF] rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5" /> Ultra-Realistic 3D BIM & Weather
            </button>
            <button
              onClick={() => setActiveStudioTab('2d')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-gray-300 rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" /> 2D CAD Plan View
            </button>
            <button
              onClick={() => setActiveStudioTab('render')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-cyan-400 rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Photorealistic AI Render
            </button>
          </div>
        )}

        {/* OUTPUT RIBBON */}
        {activeRibbonTab === 'output' && (
          <div className="flex items-center gap-3">
            <button
              onClick={onPrintPlot}
              className="px-3 py-1 bg-[#2DD4BF] text-black font-bold rounded text-xs flex items-center gap-1.5 hover:brightness-110"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Plot PDF Blueprint
            </button>
            <button
              onClick={() => setActiveStudioTab('docs')}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-gray-200 rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Export IFC 4x3 & DXF
            </button>
            <button
              onClick={onOpenClientMode}
              className="px-2.5 py-1 bg-[#1F1F1F] hover:bg-[#282828] text-purple-400 rounded text-xs font-semibold flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" /> Client Presentation Deck
            </button>
          </div>
        )}

        {/* Right Corner Design Critic Score & Alternatives */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAlternatives}
            className="px-2 py-1 bg-[#1E1E1E] hover:bg-[#282828] border border-[#333] rounded text-xs font-semibold text-gray-300 flex items-center gap-1"
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span className="hidden xl:inline">Alternatives Matrix</span>
          </button>

          <button
            onClick={onOpenAuditModal}
            className="px-2.5 py-1 bg-[#1E1E1E] hover:bg-[#282828] border border-[#2DD4BF]/40 rounded text-xs font-bold text-[#2DD4BF] flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Score: {buildingScore}/100</span>
          </button>

          <button
            onClick={() => setShowRibbonTools?.(false)}
            className="p-1 text-gray-500 hover:text-gray-300 hover:bg-[#1C1C1C] rounded transition ml-1"
            title="Hide Ribbon Tools Panel (Restore from View Layout menu)"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DRAWING FILE TABS (Active Floor Plans, 3D BIM, Sections, Site GIS + Tab Add/Close) */}
      {/* ========================================================================= */}
      {showDrawingTabs && (
      <div className="h-7 px-2 bg-[#090909] border-b border-[#1A1A1A] flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1">
          {drawingTabs.map((tab) => {
            const isActive = activeDrawingTabId === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => handleSelectDrawingTab(tab)}
                className={`h-6 px-2.5 rounded-t flex items-center gap-2 cursor-pointer transition text-[11px] font-medium border-t border-x ${
                  isActive
                    ? 'bg-[#181818] text-gray-100 border-[#333333] border-t-2 border-t-[#2DD4BF] font-semibold'
                    : 'bg-[#0E0E0E] text-gray-400 hover:text-gray-200 hover:bg-[#141414] border-transparent'
                }`}
              >
                {tab.type === '2d_plan' && <Layers className="w-3 h-3 text-[#2DD4BF]" />}
                {tab.type === '3d_bim' && <Box className="w-3 h-3 text-cyan-400" />}
                {tab.type === 'site_gis' && <MapPin className="w-3 h-3 text-amber-400" />}
                <span>{tab.title}</span>
                {drawingTabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseDrawingTab(e, tab.id)}
                    className="p-0.5 hover:bg-rose-500/20 hover:text-rose-400 rounded text-gray-500 transition"
                    title="Close Drawing Tab"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add New Drawing Tab Button */}
          <button
            onClick={handleAddNewDrawingTab}
            className="p-1 hover:bg-[#1E1E1E] text-gray-400 hover:text-white rounded transition"
            title="Open New Drawing Sheet / View"
          >
            <FilePlus className="w-3 h-3" />
          </button>
        </div>

        {/* Right Tab Status Info & Hide Tabs Toggle */}
        <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
          <span className="hidden sm:inline">Project: {project.id}</span>
          <span className="hidden md:inline">Units: METRIC (m)</span>
          <span className="hidden lg:inline">Drafting: ISO 128 / SANS 10400</span>

          <button
            onClick={() => setShowDrawingTabs?.(false)}
            className="p-0.5 text-gray-500 hover:text-gray-300 hover:bg-[#1C1C1C] rounded transition"
            title="Hide Drawing Tabs Bar (Restore from View Layout menu)"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* 5. HELP & CAD SHORTCUTS MODAL */}
      {/* ========================================================================= */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[#262626] rounded-xl max-w-2xl w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#222] mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#2DD4BF]" />
                <h3 className="text-base font-bold text-white">Lora Edge Studio Help & Shortcuts</h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#222]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-bold text-[#2DD4BF] mb-2 uppercase text-[10px] tracking-wider">Drawing Shortcuts</h4>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Wall Tool</span>
                    <span className="text-[#2DD4BF] font-bold">W</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Door Tool</span>
                    <span className="text-[#2DD4BF] font-bold">D</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Window Tool</span>
                    <span className="text-[#2DD4BF] font-bold">G</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Column Tool</span>
                    <span className="text-[#2DD4BF] font-bold">C</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Dimension</span>
                    <span className="text-[#2DD4BF] font-bold">M</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Select Tool</span>
                    <span className="text-[#2DD4BF] font-bold">V / Esc</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#2DD4BF] mb-2 uppercase text-[10px] tracking-wider">System & Navigation</h4>
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Universal Command Center</span>
                    <span className="text-cyan-400 font-bold">Cmd + K</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Save Project</span>
                    <span className="text-cyan-400 font-bold">Ctrl + S</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Plot / Print Blueprint</span>
                    <span className="text-cyan-400 font-bold">Ctrl + P</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">Undo / Redo</span>
                    <span className="text-cyan-400 font-bold">Ctrl+Z / Ctrl+Y</span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-[#141414] rounded">
                    <span className="text-gray-300">3D Orbit / Pan</span>
                    <span className="text-cyan-400 font-bold">Left Drag / Right Drag</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 bg-[#141414] rounded-lg border border-[#222] text-xs text-gray-400">
              <div className="font-bold text-gray-200 mb-1">Building Code Compliance</div>
              <p>
                Calculations are continuously audited against <strong>SANS 10400-XA (Energy Usage in Buildings)</strong>,{' '}
                <strong>SANS 10400-O (Natural Light & Ventilation)</strong>, and <strong>LEED v4.1 / EDGE Carbon</strong> standards.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
