import React, { useState, useEffect } from 'react';
import {
  ArchitecturalProject,
  DrawingTool,
  Level,
} from './types/architecture';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { CADCanvas2D } from './components/CADCanvas2D';
import { Viewer3D } from './components/Viewer3D';
import { CADToolbar } from './components/CADToolbar';
import { CadStyleHeader } from './components/CadStyleHeader';
import { CadStyleFooter } from './components/CadStyleFooter';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SustainabilityStudio } from './components/SustainabilityStudio';
import { AiVisualizer } from './components/AiVisualizer';
import { DocumentStudio } from './components/DocumentStudio';
import { AiCopilotDrawer } from './components/AiCopilotDrawer';
import { ProjectCreationModal } from './components/ProjectCreationModal';
import { DesignReviewModal } from './components/DesignReviewModal';
import { AlternativesComparison } from './components/AlternativesComparison';
import { MaterialsCatalog } from './components/MaterialsCatalog';
import { CommandCenterModal } from './components/CommandCenterModal';
import { DesignDnaModal } from './components/DesignDnaModal';
import { BuildingIntelligenceStudio } from './components/BuildingIntelligenceStudio';
import { DeveloperIntelligenceStudio } from './components/DeveloperIntelligenceStudio';
import { ClientModeView } from './components/ClientModeView';
import { DataStateInspectorModal } from './components/DataStateInspectorModal';
import { LivingDigitalTwinStudio } from './components/LivingDigitalTwinStudio';
import { evaluateBuildingIntelligenceScore } from './services/buildingIntelligenceEngine';
import { ArchitectProfile, DEFAULT_ARCHITECT_PROFILE, loadSavedProfile, saveProfile } from './types/auth';
import { SignUpView } from './components/auth/SignUpView';
import { SignInView } from './components/auth/SignInView';
import { ArchitectOnboardingModal } from './components/auth/ArchitectOnboardingModal';
import {
  Layers,
  Box,
  Leaf,
  Sparkles,
  FileText,
  Plus,
  Play,
  ShieldCheck,
  SplitSquareVertical,
  BookOpen,
  FolderOpen,
  CheckCircle2,
  Zap,
  Activity,
  TrendingUp,
  Search,
  Sliders,
  Command,
} from 'lucide-react';

type StudioTab = '2d' | '3d' | 'intelligence' | 'developer' | 'sustainability' | 'render' | 'docs' | 'digital_twin';

export function App() {
  // Active Project State
  const [project, setProject] = useState<ArchitecturalProject>(SAMPLE_PROJECTS[0]);
  const [history, setHistory] = useState<ArchitecturalProject[]>([SAMPLE_PROJECTS[0]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const [activeTab, setActiveTab] = useState<StudioTab>('2d');
  const [activeTool, setActiveTool] = useState<DrawingTool>('select');
  const [activeLevelId, setActiveLevelId] = useState<string>('lvl_0');
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'site'; id: string } | null>(null);

  // Snapping & Grid
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(0.5);

  // Modals & Drawers
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [spatialColumnTab, setSpatialColumnTab] = useState<'copilot' | 'params'>('copilot');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isAlternativesOpen, setIsAlternativesOpen] = useState<boolean>(false);
  const [isMaterialsOpen, setIsMaterialsOpen] = useState<boolean>(false);
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState<boolean>(false);
  const [isDesignDnaOpen, setIsDesignDnaOpen] = useState<boolean>(false);
  const [isClientModeActive, setIsClientModeActive] = useState<boolean>(false);
  const [isDataStateInspectorOpen, setIsDataStateInspectorOpen] = useState<boolean>(false);

  // Architectural Identity, Authentication & Studio Calibration State
  const [authView, setAuthView] = useState<'studio' | 'sign_up' | 'sign_in' | 'onboarding'>('sign_in');
  const [architectProfile, setArchitectProfile] = useState<ArchitectProfile>(() => loadSavedProfile());

  const handleSignUpComplete = (newProfile: ArchitectProfile) => {
    setArchitectProfile(newProfile);
    saveProfile(newProfile);
    // Proceed directly into the 10-step studio calibration onboarding
    setAuthView('onboarding');
  };

  const handleSignInSuccess = (profileData: Partial<ArchitectProfile>) => {
    setArchitectProfile((prev) => {
      const updated = { ...prev, ...profileData, isLoggedIn: true };
      saveProfile(updated);
      return updated;
    });
    setAuthView('studio');
  };

  const handleSignOut = () => {
    setArchitectProfile((prev) => {
      const updated = { ...prev, isLoggedIn: false };
      saveProfile(updated);
      return updated;
    });
    setAuthView('sign_in');
  };

  const handleOnboardingComplete = (updatedProfile: ArchitectProfile) => {
    setArchitectProfile(updatedProfile);
    saveProfile(updatedProfile);
    // Dynamically synchronize the project metadata & letterhead with the configured studio
    if (updatedProfile.studioName) {
      setProject((prev) => ({
        ...prev,
        companyName: updatedProfile.studioName,
        architectName: updatedProfile.fullName,
      }));
    }
    setAuthView('studio');
  };

  // Granular UI Header & Footer Visibility (Top Header is ALWAYS visible)
  const [showRibbonBar, setShowRibbonBar] = useState<boolean>(true);
  const [showRibbonTools, setShowRibbonTools] = useState<boolean>(true);
  const [showDrawingTabs, setShowDrawingTabs] = useState<boolean>(true);
  const [showCommandConsole, setShowCommandConsole] = useState<boolean>(true);
  const [showStatusBar, setShowStatusBar] = useState<boolean>(true);

  // Clipboard State for Copy, Paste, Duplicate
  const [clipboard, setClipboard] = useState<{
    type: 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'column';
    data: any;
  } | null>(null);

  // Copy Selected Element
  const handleCopySelected = () => {
    if (!selectedEntity) return;
    if (selectedEntity.type === 'furniture') {
      const item = project.furniture.find((f) => f.id === selectedEntity.id);
      if (item) setClipboard({ type: 'furniture', data: JSON.parse(JSON.stringify(item)) });
    } else if (selectedEntity.type === 'wall') {
      const item = project.walls.find((w) => w.id === selectedEntity.id);
      if (item) setClipboard({ type: 'wall', data: JSON.parse(JSON.stringify(item)) });
    } else if (selectedEntity.type === 'room') {
      const item = project.rooms.find((r) => r.id === selectedEntity.id);
      if (item) setClipboard({ type: 'room', data: JSON.parse(JSON.stringify(item)) });
    } else if (selectedEntity.type === 'door') {
      const item = project.doors.find((d) => d.id === selectedEntity.id);
      if (item) setClipboard({ type: 'door', data: JSON.parse(JSON.stringify(item)) });
    } else if (selectedEntity.type === 'window') {
      const item = project.windows.find((w) => w.id === selectedEntity.id);
      if (item) setClipboard({ type: 'window', data: JSON.parse(JSON.stringify(item)) });
    } else if ((selectedEntity.type as any) === 'column') {
      const item = project.columns.find((c) => c.id === selectedEntity.id);
      if (item) setClipboard({ type: 'column', data: JSON.parse(JSON.stringify(item)) });
    }
  };

  // Paste from Clipboard with offset
  const handlePasteClipboard = () => {
    if (!clipboard) return;
    const offset = 1.0; // 1m offset
    const timestamp = Date.now();

    if (clipboard.type === 'furniture') {
      const newFurn = {
        ...clipboard.data,
        id: `furn_${timestamp}`,
        levelId: activeLevelId,
        position: {
          x: (clipboard.data.position?.x || 0) + offset,
          y: (clipboard.data.position?.y || 0) + offset,
        },
      };
      updateProjectWithHistory((p) => ({
        ...p,
        furniture: [...p.furniture, newFurn],
      }));
      setSelectedEntity({ type: 'furniture', id: newFurn.id });
    } else if (clipboard.type === 'wall') {
      const newWall = {
        ...clipboard.data,
        id: `wall_${timestamp}`,
        levelId: activeLevelId,
        start: { x: clipboard.data.start.x + offset, y: clipboard.data.start.y + offset },
        end: { x: clipboard.data.end.x + offset, y: clipboard.data.end.y + offset },
      };
      updateProjectWithHistory((p) => ({
        ...p,
        walls: [...p.walls, newWall],
      }));
      setSelectedEntity({ type: 'wall', id: newWall.id });
    } else if (clipboard.type === 'room') {
      const newRoom = {
        ...clipboard.data,
        id: `room_${timestamp}`,
        name: `${clipboard.data.name} (Copy)`,
        levelId: activeLevelId,
        points: clipboard.data.points.map((pt: { x: number; y: number }) => ({
          x: pt.x + offset,
          y: pt.y + offset,
        })),
      };
      updateProjectWithHistory((p) => ({
        ...p,
        rooms: [...p.rooms, newRoom],
      }));
      setSelectedEntity({ type: 'room', id: newRoom.id });
    } else if (clipboard.type === 'door') {
      const parentWall = project.walls.find((w) => w.id === clipboard.data.wallId);
      const curPos = clipboard.data.position || 0.5;
      const nextPos = curPos + 0.15 > 0.9 ? 0.2 : curPos + 0.15;
      const newDoor = {
        ...clipboard.data,
        id: `door_${timestamp}`,
        levelId: activeLevelId,
        wallId: parentWall ? parentWall.id : (project.walls[0]?.id || 'w_g_1'),
        position: parseFloat(nextPos.toFixed(2)),
      };
      updateProjectWithHistory((p) => ({
        ...p,
        doors: [...p.doors, newDoor],
      }));
      setSelectedEntity({ type: 'door', id: newDoor.id });
    } else if (clipboard.type === 'window') {
      const parentWall = project.walls.find((w) => w.id === clipboard.data.wallId);
      const curPos = clipboard.data.position || 0.5;
      const nextPos = curPos + 0.15 > 0.9 ? 0.25 : curPos + 0.15;
      const newWin = {
        ...clipboard.data,
        id: `win_${timestamp}`,
        levelId: activeLevelId,
        wallId: parentWall ? parentWall.id : (project.walls[0]?.id || 'w_g_1'),
        position: parseFloat(nextPos.toFixed(2)),
      };
      updateProjectWithHistory((p) => ({
        ...p,
        windows: [...p.windows, newWin],
      }));
      setSelectedEntity({ type: 'window', id: newWin.id });
    } else if (clipboard.type === 'column') {
      const newCol = {
        ...clipboard.data,
        id: `col_${timestamp}`,
        levelId: activeLevelId,
        position: {
          x: (clipboard.data.position?.x || 0) + offset,
          y: (clipboard.data.position?.y || 0) + offset,
        },
      };
      updateProjectWithHistory((p) => ({
        ...p,
        columns: [...p.columns, newCol],
      }));
      setSelectedEntity({ type: 'wall', id: newCol.id });
    }
  };

  // Duplicate Selected Element Directly
  const handleDuplicateSelected = () => {
    if (!selectedEntity) return;
    handleCopySelected();
    const offset = 1.0;
    const timestamp = Date.now();

    if (selectedEntity.type === 'furniture') {
      const item = project.furniture.find((f) => f.id === selectedEntity.id);
      if (item) {
        const newFurn = {
          ...item,
          id: `furn_${timestamp}`,
          levelId: activeLevelId,
          position: { x: (item.position?.x || 0) + offset, y: (item.position?.y || 0) + offset },
        };
        updateProjectWithHistory((p) => ({
          ...p,
          furniture: [...p.furniture, newFurn],
        }));
        setSelectedEntity({ type: 'furniture', id: newFurn.id });
      }
    } else if (selectedEntity.type === 'wall') {
      const item = project.walls.find((w) => w.id === selectedEntity.id);
      if (item) {
        const newWall = {
          ...item,
          id: `wall_${timestamp}`,
          levelId: activeLevelId,
          start: { x: item.start.x + offset, y: item.start.y + offset },
          end: { x: item.end.x + offset, y: item.end.y + offset },
        };
        updateProjectWithHistory((p) => ({
          ...p,
          walls: [...p.walls, newWall],
        }));
        setSelectedEntity({ type: 'wall', id: newWall.id });
      }
    } else if (selectedEntity.type === 'room') {
      const item = project.rooms.find((r) => r.id === selectedEntity.id);
      if (item) {
        const newRoom = {
          ...item,
          id: `room_${timestamp}`,
          name: `${item.name} (Copy)`,
          levelId: activeLevelId,
          points: item.points.map((pt) => ({ x: pt.x + offset, y: pt.y + offset })),
        };
        updateProjectWithHistory((p) => ({
          ...p,
          rooms: [...p.rooms, newRoom],
        }));
        setSelectedEntity({ type: 'room', id: newRoom.id });
      }
    } else if (selectedEntity.type === 'door') {
      const item = project.doors.find((d) => d.id === selectedEntity.id);
      if (item) {
        const nextPos = item.position + 0.15 > 0.9 ? 0.2 : item.position + 0.15;
        const newDoor = {
          ...item,
          id: `door_${timestamp}`,
          levelId: activeLevelId,
          position: parseFloat(nextPos.toFixed(2)),
        };
        updateProjectWithHistory((p) => ({
          ...p,
          doors: [...p.doors, newDoor],
        }));
        setSelectedEntity({ type: 'door', id: newDoor.id });
      }
    } else if (selectedEntity.type === 'window') {
      const item = project.windows.find((w) => w.id === selectedEntity.id);
      if (item) {
        const nextPos = item.position + 0.15 > 0.9 ? 0.25 : item.position + 0.15;
        const newWin = {
          ...item,
          id: `win_${timestamp}`,
          levelId: activeLevelId,
          position: parseFloat(nextPos.toFixed(2)),
        };
        updateProjectWithHistory((p) => ({
          ...p,
          windows: [...p.windows, newWin],
        }));
        setSelectedEntity({ type: 'window', id: newWin.id });
      }
    }
  };

  // Keyboard shortcuts for Command Center, Undo/Redo, Copy, Paste, Duplicate, Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing shortcuts when focused in inputs or textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandCenterOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopySelected();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePasteClipboard();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEntity) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntity, clipboard, project, activeLevelId, historyIndex, history]);

  // Project update with history recording
  const updateProjectWithHistory = (updater: React.SetStateAction<ArchitecturalProject>) => {
    setProject((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(next);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return next;
    });
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setProject(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setProject(history[newIndex]);
    }
  };

  const handleAddLevel = () => {
    const nextIdx = project.levels.length;
    const newElevation = (project.levels[project.levels.length - 1]?.elevation || 0) + 3.0;
    const newLevel: Level = {
      id: `lvl_${nextIdx}`,
      name: `Level ${nextIdx}`,
      elevation: newElevation,
      height: 3.0,
      floorPlanVisible: true,
    };
    updateProjectWithHistory((p) => ({
      ...p,
      levels: [...p.levels, newLevel],
      activeLevelId: newLevel.id,
    }));
    setActiveLevelId(newLevel.id);
  };

  const handleDeleteSelected = () => {
    if (!selectedEntity) return;
    updateProjectWithHistory((p) => {
      if (selectedEntity.type === 'wall') {
        return {
          ...p,
          walls: p.walls.filter((w) => w.id !== selectedEntity.id),
          doors: p.doors.filter((d) => d.wallId !== selectedEntity.id),
          windows: p.windows.filter((w) => w.wallId !== selectedEntity.id),
        };
      }
      if (selectedEntity.type === 'room') {
        return {
          ...p,
          rooms: p.rooms.filter((r) => r.id !== selectedEntity.id),
        };
      }
      if (selectedEntity.type === 'door') {
        return {
          ...p,
          doors: p.doors.filter((d) => d.id !== selectedEntity.id),
        };
      }
      if (selectedEntity.type === 'window') {
        return {
          ...p,
          windows: p.windows.filter((w) => w.id !== selectedEntity.id),
        };
      }
      if (selectedEntity.type === 'furniture') {
        return {
          ...p,
          furniture: p.furniture.filter((f) => f.id !== selectedEntity.id),
        };
      }
      return p;
    });
    setSelectedEntity(null);
  };

  // Switch between sample projects
  const handleSelectProject = (projectId: string) => {
    const found = SAMPLE_PROJECTS.find((p) => p.id === projectId);
    if (found) {
      setProject(found);
      setHistory([found]);
      setHistoryIndex(0);
      setActiveLevelId(found.levels[0]?.id || 'lvl_0');
      setSelectedEntity(null);
    }
  };

  const handleProjectCreated = (newProject: ArchitecturalProject) => {
    setProject(newProject);
    setHistory([newProject]);
    setHistoryIndex(0);
    setActiveLevelId(newProject.levels[0]?.id || 'lvl_0');
    setSelectedEntity(null);
    setActiveTab('2d');
  };

  // Live evaluated intelligence score
  const liveScore = evaluateBuildingIntelligenceScore(project);

  if (authView === 'sign_up') {
    return (
      <SignUpView
        onSignUpComplete={handleSignUpComplete}
        onNavigateToSignIn={() => setAuthView('sign_in')}
      />
    );
  }

  if (authView === 'sign_in') {
    return (
      <SignInView
        onSignInSuccess={handleSignInSuccess}
        onNavigateToSignUp={() => setAuthView('sign_up')}
      />
    );
  }

  if (isClientModeActive) {
    return (
      <ClientModeView
        project={project}
        setProject={setProject}
        onExitClientMode={() => setIsClientModeActive(false)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050505] text-[#E0E0E0] font-sans overflow-hidden select-none">
      {/* TOP CAD/BIM STYLE HEADER WITH FULL 14 SUBSYSTEMS */}
      <CadStyleHeader
        project={project}
        setProject={updateProjectWithHistory}
        onSelectProject={(p) => {
          setProject(p);
          setHistory([p]);
          setHistoryIndex(0);
          setActiveLevelId(p.levels[0]?.id || 'lvl_0');
          setSelectedEntity(null);
        }}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onNewProject={() => setIsCreateModalOpen(true)}
        onPrintPlot={() => setActiveTab('docs')}
        onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        onOpenAiCopilot={() => setIsCopilotOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenAlternatives={() => setIsAlternativesOpen(true)}
        onOpenMaterials={() => setIsMaterialsOpen(true)}
        onOpenDesignDna={() => setIsDesignDnaOpen(true)}
        onOpenClientMode={() => setIsClientModeActive(true)}
        onOpenDataStateInspector={() => setIsDataStateInspectorOpen(true)}
        architectProfile={architectProfile}
        onOpenSignIn={() => setAuthView('sign_in')}
        onOpenSignUp={() => setAuthView('sign_up')}
        onOpenOnboarding={() => setAuthView('onboarding')}
        onSignOut={handleSignOut}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeLevelId={activeLevelId}
        setActiveLevelId={setActiveLevelId}
        onAddLevel={handleAddLevel}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        gridSize={gridSize}
        setGridSize={setGridSize}
        activeStudioTab={activeTab}
        setActiveStudioTab={setActiveTab}
        buildingScore={liveScore.overallScore}
        showRibbonBar={showRibbonBar}
        setShowRibbonBar={setShowRibbonBar}
        showRibbonTools={showRibbonTools}
        setShowRibbonTools={setShowRibbonTools}
        showDrawingTabs={showDrawingTabs}
        setShowDrawingTabs={setShowDrawingTabs}
        showCommandConsole={showCommandConsole}
        setShowCommandConsole={setShowCommandConsole}
        showStatusBar={showStatusBar}
        setShowStatusBar={setShowStatusBar}
      />

      {/* MAIN VIEWPORT AREA */}
      <div className="flex-1 flex overflow-hidden relative bg-[#0F0F0F]">
        {/* 2D CAD Viewport */}
        {activeTab === '2d' && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <CADToolbar
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              levels={project.levels}
              activeLevelId={activeLevelId}
              setActiveLevelId={setActiveLevelId}
              onAddLevel={handleAddLevel}
              snapToGrid={snapToGrid}
              setSnapToGrid={setSnapToGrid}
              gridSize={gridSize}
              setGridSize={setGridSize}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < history.length - 1}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onOpenAiCopilot={() => setIsCopilotOpen(true)}
              onDeleteSelected={handleDeleteSelected}
              hasSelection={!!selectedEntity}
              onCopySelected={handleCopySelected}
              onPasteClipboard={handlePasteClipboard}
              onDuplicateSelected={handleDuplicateSelected}
              canPaste={!!clipboard}
            />

            <div className="flex-1 flex overflow-hidden relative">
              <CADCanvas2D
                project={project}
                setProject={updateProjectWithHistory}
                activeTool={activeTool}
                setActiveTool={setActiveTool}
                selectedEntity={selectedEntity}
                setSelectedEntity={setSelectedEntity}
                snapToGrid={snapToGrid}
                gridSize={gridSize}
                onCopySelected={handleCopySelected}
                onPasteClipboard={handlePasteClipboard}
                onDuplicateSelected={handleDuplicateSelected}
                hasClipboardContent={!!clipboard}
              />

              <PropertiesPanel
                project={project}
                setProject={updateProjectWithHistory}
                selectedEntity={selectedEntity}
                setSelectedEntity={setSelectedEntity}
                onOpenMaterialsCatalog={() => setIsMaterialsOpen(true)}
                onOpenDigitalTwin={() => setActiveTab('digital_twin')}
                activeSpatialTab={spatialColumnTab}
                onSpatialTabChange={setSpatialColumnTab}
                onCopySelected={handleCopySelected}
                onDuplicateSelected={handleDuplicateSelected}
                onDeleteSelected={handleDeleteSelected}
                activeLevelId={activeLevelId}
                setActiveLevelId={setActiveLevelId}
              />
            </div>
          </div>
        )}

        {/* 3D BIM Viewport */}
        {activeTab === '3d' && (
          <div className="flex-1 relative h-full">
            <Viewer3D project={project} onOpenAiRender={() => setActiveTab('render')} />
          </div>
        )}

        {/* Building Intelligence Studio */}
        {activeTab === 'intelligence' && (
          <BuildingIntelligenceStudio
            project={project}
            setProject={setProject}
            onOpenDesignDna={() => setIsDesignDnaOpen(true)}
            onOpenDesignReview={() => setIsAuditModalOpen(true)}
          />
        )}

        {/* Developer Intelligence Studio */}
        {activeTab === 'developer' && (
          <DeveloperIntelligenceStudio
            project={project}
            setProject={setProject}
          />
        )}

        {/* EDGE Sustainability Studio */}
        {activeTab === 'sustainability' && (
          <SustainabilityStudio project={project} setProject={setProject} />
        )}

        {/* Design Photorealistic Render Studio */}
        {activeTab === 'render' && <AiVisualizer project={project} />}

        {/* Drawing Sheets & Construction Documentation Studio */}
        {activeTab === 'docs' && <DocumentStudio project={project} />}

        {/* Living Digital Twin Studio */}
        {activeTab === 'digital_twin' && (
          <div className="flex-1 relative h-full overflow-hidden">
            <LivingDigitalTwinStudio project={project} setProject={updateProjectWithHistory} />
          </div>
        )}
      </div>

      {/* BOTTOM CAD/BIM STYLE STATUS BAR FOOTER WITH COMMAND CONSOLE & FULL PRECISION TOGGLES */}
      <CadStyleFooter
        project={project}
        setProject={updateProjectWithHistory}
        activeStudioTab={activeTab}
        setActiveStudioTab={setActiveTab}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
        gridSize={gridSize}
        setGridSize={setGridSize}
        activeLevelId={activeLevelId}
        setActiveLevelId={setActiveLevelId}
        onOpenCommandCenter={() => setIsCommandCenterOpen(true)}
        onOpenAiCopilot={() => setIsCopilotOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenDataStateInspector={() => setIsDataStateInspectorOpen(true)}
        buildingScore={liveScore.overallScore}
        isSpatialCopilotVisible={activeTab === '2d' && !selectedEntity && spatialColumnTab === 'copilot'}
        onToggleSpatialCopilot={() => {
          if (activeTab !== '2d') {
            setActiveTab('2d');
            setSelectedEntity(null);
            setSpatialColumnTab('copilot');
          } else if (selectedEntity) {
            setSelectedEntity(null);
            setSpatialColumnTab('copilot');
          } else {
            setSpatialColumnTab((prev) => (prev === 'copilot' ? 'params' : 'copilot'));
          }
        }}
        showCommandConsole={showCommandConsole}
        setShowCommandConsole={setShowCommandConsole}
        showStatusBar={showStatusBar}
        setShowStatusBar={setShowStatusBar}
      />

      {/* DIALOGS & OVERLAYS */}
      <DataStateInspectorModal
        isOpen={isDataStateInspectorOpen}
        onClose={() => setIsDataStateInspectorOpen(false)}
      />
      <CommandCenterModal
        isOpen={isCommandCenterOpen}
        onClose={() => setIsCommandCenterOpen(false)}
        project={project}
        setProject={setProject}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenDesignReview={() => setIsAuditModalOpen(true)}
        onOpenDesignDna={() => setIsDesignDnaOpen(true)}
      />

      <DesignDnaModal
        isOpen={isDesignDnaOpen}
        onClose={() => setIsDesignDnaOpen(false)}
        project={project}
        setProject={setProject}
      />

      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        project={project}
        setProject={setProject}
      />

      <ProjectCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <DesignReviewModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        project={project}
        setProject={setProject}
      />

      {isAlternativesOpen && (
        <div className="fixed inset-0 z-50 flex">
          <AlternativesComparison
            project={project}
            setProject={setProject}
            onClose={() => setIsAlternativesOpen(false)}
          />
        </div>
      )}

      <MaterialsCatalog
        isOpen={isMaterialsOpen}
        onClose={() => setIsMaterialsOpen(false)}
      />

      {/* 10-STEP ARCHITECT STUDIO CALIBRATION MODAL */}
      {authView === 'onboarding' && (
        <ArchitectOnboardingModal
          initialProfile={architectProfile}
          onComplete={handleOnboardingComplete}
          onCancel={() => setAuthView('studio')}
        />
      )}
    </div>
  );
}

export default App;
