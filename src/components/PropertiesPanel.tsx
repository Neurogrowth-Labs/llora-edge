import React, { useState } from 'react';
import {
  ArchitecturalProject,
  Wall,
  Room,
  Door,
  Window,
  Furniture,
} from '../types/architecture';
import { MATERIALS_DATABASE } from '../data/materialsDatabase';
import {
  Sliders,
  Layers,
  Maximize2,
  Leaf,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Sparkles,
  Compass,
  ArrowLeft,
  Activity,
} from 'lucide-react';
import { DataStateBadge } from './DataStateBadge';
import { SpatialCopilot } from './SpatialCopilot';

interface PropertiesPanelProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  selectedEntity: { type: 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'site'; id: string } | null;
  setSelectedEntity: (entity: { type: 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'site'; id: string } | null) => void;
  onOpenMaterialsCatalog?: () => void;
  onOpenDigitalTwin?: () => void;
  activeSpatialTab?: 'copilot' | 'params';
  onSpatialTabChange?: (tab: 'copilot' | 'params') => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  project,
  setProject,
  selectedEntity,
  setSelectedEntity,
  onOpenMaterialsCatalog,
  onOpenDigitalTwin,
  activeSpatialTab,
  onSpatialTabChange,
}) => {
  const [internalSpatialTab, setInternalSpatialTab] = useState<'copilot' | 'params'>('copilot');
  const currentSpatialTab = activeSpatialTab ?? internalSpatialTab;
  const setSpatialTab = (tab: 'copilot' | 'params') => {
    setInternalSpatialTab(tab);
    onSpatialTabChange?.(tab);
  };

  // If nothing or site is selected, show Project & Site Spatial Column
  if (!selectedEntity || selectedEntity.type === 'site') {
    const totalArea = project.rooms.reduce((acc, r) => acc + r.floorArea, 0);
    return (
      <div className="w-80 lg:w-96 bg-[#0A0A0A] border-l border-[#222222] flex flex-col h-full overflow-hidden text-xs text-[#E0E0E0] shrink-0">
        {/* Column Header */}
        <div className="p-3 border-b border-[#222222] flex items-center justify-between bg-[#0F0F0F] shrink-0">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2DD4BF]" />
            <div>
              <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">Project & Site Spatial</h3>
              <span className="text-[9px] text-gray-400 font-mono">BIM • GIS • Copilot • Setbacks</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <DataStateBadge state="SYNCED" size="xs" />
          </div>
        </div>

        {/* Column Sub-Tabs: Spatial Copilot vs Site & BIM Parameters */}
        <div className="flex items-center p-1 bg-[#121212] border-b border-[#222222] shrink-0 gap-1">
          <button
            onClick={() => setSpatialTab('copilot')}
            className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
              currentSpatialTab === 'copilot'
                ? 'bg-[#2DD4BF] text-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Spatial Copilot</span>
          </button>
          <button
            onClick={() => setSpatialTab('params')}
            className={`flex-1 py-1.5 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
              currentSpatialTab === 'params'
                ? 'bg-[#2DD4BF] text-black shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Site & BIM</span>
          </button>
        </div>

        {/* TAB 1: SPATIAL COPILOT (In-Column Interactive Assistant) */}
        {currentSpatialTab === 'copilot' ? (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <SpatialCopilot
              isEmbedded
              project={project}
              setProject={setProject}
              onOpenDigitalTwin={onOpenDigitalTwin}
            />
          </div>
        ) : (
          /* TAB 2: SITE & BIM PARAMETERS */
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Copilot Jump Banner */}
            <button
              onClick={() => setSpatialTab('copilot')}
              className="w-full p-2.5 rounded-lg bg-gradient-to-r from-[#142322] to-[#161616] border border-[#2DD4BF]/40 hover:border-[#2DD4BF] flex items-center justify-between text-left transition group"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF] group-hover:rotate-12 transition-transform" />
                <div>
                  <div className="text-[11px] font-bold text-white">Ask Spatial Copilot</div>
                  <div className="text-[9px] text-gray-400">Demolition scan, circular salvage & robot radar</div>
                </div>
              </div>
              <span className="text-[10px] text-[#2DD4BF] font-mono font-bold">Open →</span>
            </button>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] uppercase font-bold text-gray-400">Project Name</label>
              <DataStateBadge state="VERIFIED" label="VERIFIED" size="xs" />
            </div>
            <input
              type="text"
              value={project.name}
              onChange={(e) => setProject((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-[#141414] border border-[#333333] rounded px-2.5 py-1.5 text-[#E0E0E0] font-medium focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Building Type</label>
              <span className="block bg-[#141414] border border-[#333333] rounded px-2 py-1.5 text-[#E0E0E0] font-mono text-center">
                {project.buildingType}
              </span>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Style</label>
              <span className="block bg-[#141414] border border-[#333333] rounded px-2 py-1.5 text-[#E0E0E0] font-mono text-center">
                {project.style}
              </span>
            </div>
          </div>

          {/* Site Boundary Controls */}
          <div className="p-3 bg-[#141414] border border-[#222222] rounded-md space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-[#E0E0E0] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                Site & Setback Boundary
              </h4>
              <DataStateBadge state="VERIFIED" label="GIS VERIFIED" size="xs" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Site Area (m²)</label>
                <input
                  type="number"
                  value={project.site.siteAreaM2}
                  onChange={(e) =>
                    setProject((p) => ({
                      ...p,
                      site: { ...p.site, siteAreaM2: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className="w-full bg-[#0F0F0F] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">North Angle (°)</label>
                <input
                  type="number"
                  value={project.site.orientationNorthDeg}
                  onChange={(e) =>
                    setProject((p) => ({
                      ...p,
                      site: { ...p.site, orientationNorthDeg: parseInt(e.target.value) || 0 },
                    }))
                  }
                  className="w-full bg-[#0F0F0F] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-[9px] text-gray-400">Front (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={project.site.setbackFrontM}
                  onChange={(e) =>
                    setProject((p) => ({
                      ...p,
                      site: { ...p.site, setbackFrontM: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className="w-full bg-[#0F0F0F] border border-[#333333] rounded px-1.5 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-400">Sides (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={project.site.setbackSidesM}
                  onChange={(e) =>
                    setProject((p) => ({
                      ...p,
                      site: { ...p.site, setbackSidesM: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className="w-full bg-[#0F0F0F] border border-[#333333] rounded px-1.5 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-400">Rear (m)</label>
                <input
                  type="number"
                  step="0.5"
                  value={project.site.setbackRearM}
                  onChange={(e) =>
                    setProject((p) => ({
                      ...p,
                      site: { ...p.site, setbackRearM: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className="w-full bg-[#0F0F0F] border border-[#333333] rounded px-1.5 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Quantities Summary */}
          <div className="p-3 bg-[#141414] border border-[#222222] rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-white">Building Program Totals</h4>
              <DataStateBadge state="ESTIMATED" label="ESTIMATE" size="xs" />
            </div>
            <div className="flex justify-between py-1 border-b border-[#222222]">
              <span className="text-gray-400">Gross Floor Area:</span>
              <strong className="text-[#E0E0E0] font-mono">{totalArea.toFixed(1)} m²</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#222222]">
              <span className="text-gray-400">Total Rooms:</span>
              <strong className="text-[#E0E0E0] font-mono">{project.rooms.length} Spaces</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-[#222222]">
              <span className="text-gray-400">Total Storeys:</span>
              <strong className="text-[#E0E0E0] font-mono">{project.levels.length} Levels</strong>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-400">Est. Cost:</span>
              <strong className="text-[#2DD4BF] font-mono">
                ${project.cost.totalEstimatedCostUSD.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
        )}
      </div>
    );
  }

  // WALL SELECTED
  if (selectedEntity.type === 'wall') {
    const wall = project.walls.find((w) => w.id === selectedEntity.id);
    if (!wall) return null;
    const length = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
    const selectedMat = MATERIALS_DATABASE.find((m) => m.id === wall.materialId) || MATERIALS_DATABASE[0];

    const updateWall = (updater: (w: Wall) => Wall) => {
      setProject((p) => ({
        ...p,
        walls: p.walls.map((w) => (w.id === wall.id ? updater(w) : w)),
      }));
    };

    return (
      <div className="w-80 bg-[#0A0A0A] border-l border-[#222222] flex flex-col h-full overflow-y-auto text-xs text-[#E0E0E0]">
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2DD4BF]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">Wall BIM Properties</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <DataStateBadge state="SYNCED" size="xs" />
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-gray-400 hover:text-white text-xs ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Wall Type</label>
            <select
              value={wall.type}
              onChange={(e) => updateWall((w) => ({ ...w, type: e.target.value as any }))}
              className="w-full bg-[#141414] border border-[#333333] rounded px-2.5 py-1.5 text-[#E0E0E0] font-medium focus:outline-none focus:border-[#2DD4BF]"
            >
              <option value="external">External Load-Bearing Wall</option>
              <option value="internal">Internal Partition Wall</option>
              <option value="curtain_glass">Curtain Glass Wall</option>
              <option value="retaining">Retaining Earth Wall</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="p-2.5 bg-[#121212] border border-[#222222] rounded-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-gray-400">Dimensions</span>
              <DataStateBadge state="VERIFIED" label="VERIFIED" size="xs" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-gray-400">Length (m)</label>
                <div className="bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center">
                  {length.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Thickness (m)</label>
                <input
                  type="number"
                  step="0.01"
                  value={wall.thickness}
                  onChange={(e) => updateWall((w) => ({ ...w, thickness: parseFloat(e.target.value) || 0.1 }))}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400">Height (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={wall.height}
                  onChange={(e) => updateWall((w) => ({ ...w, height: parseFloat(e.target.value) || 2.4 }))}
                  className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Material & Thermal Performance */}
          <div className="p-3 bg-[#141414] border border-[#222222] rounded-md space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Material & Thermal
              </h4>
              <DataStateBadge state="ESTIMATED" label="EPD ESTIMATE" size="xs" />
            </div>

            <div>
              <label className="text-[10px] text-gray-400 mb-1 block">Material Spec</label>
              <select
                value={wall.materialId}
                onChange={(e) => {
                  const mat = MATERIALS_DATABASE.find((m) => m.id === e.target.value);
                  updateWall((w) => ({
                    ...w,
                    materialId: e.target.value,
                    uValue: mat?.uValue || w.uValue,
                  }));
                }}
                className="w-full bg-[#0F0F0F] border border-[#333333] rounded px-2 py-1.5 text-[#E0E0E0] text-xs focus:border-[#2DD4BF] focus:outline-none"
              >
                {MATERIALS_DATABASE.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#111] text-white">
                    {m.name} (U={m.uValue} W/m²K)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#0F0F0F] rounded border border-[#222222]">
                <span className="text-gray-400 text-[10px] block">Thermal U-Value:</span>
                <strong className="text-[#2DD4BF] font-mono">{selectedMat.uValue} W/m²K</strong>
              </div>
              <div className="p-2 bg-[#0F0F0F] rounded border border-[#222222]">
                <span className="text-gray-400 text-[10px] block">Embodied Carbon:</span>
                <strong className="text-[#E0E0E0] font-mono">{selectedMat.embodiedCarbonKgCO2e} kg/m²</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Fire Rating:</span>
              </span>
              <strong className="text-white">{wall.fireRatingMinutes || 90} mins (SANS 10400-T)</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ROOM SELECTED
  if (selectedEntity.type === 'room') {
    const room = project.rooms.find((r) => r.id === selectedEntity.id);
    if (!room) return null;

    const updateRoom = (updater: (r: Room) => Room) => {
      setProject((p) => ({
        ...p,
        rooms: p.rooms.map((r) => (r.id === room.id ? updater(r) : r)),
      }));
    };

    return (
      <div className="w-80 bg-[#0A0A0A] border-l border-[#222222] flex flex-col h-full overflow-y-auto text-xs text-[#E0E0E0]">
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="w-4 h-4 text-[#2DD4BF]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">Room Space Inspector</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <DataStateBadge state="SYNCED" size="xs" />
            <button
              onClick={() => setSelectedEntity(null)}
              className="text-gray-400 hover:text-white text-xs ml-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Space Name</label>
            <input
              type="text"
              value={room.name}
              onChange={(e) => updateRoom((r) => ({ ...r, name: e.target.value }))}
              className="w-full bg-[#141414] border border-[#333333] rounded px-2.5 py-1.5 text-[#E0E0E0] font-medium focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Room Type</label>
              <select
                value={room.type}
                onChange={(e) => updateRoom((r) => ({ ...r, type: e.target.value as any }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1.5 text-[#E0E0E0] focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="living">Living Room</option>
                <option value="open_plan_living">Open-Plan Living</option>
                <option value="kitchen">Kitchen</option>
                <option value="bedroom">Bedroom</option>
                <option value="bedroom_master">Master Bedroom</option>
                <option value="bathroom">Bathroom</option>
                <option value="bathroom_ensuite">Ensuite Bath</option>
                <option value="office">Home Office</option>
                <option value="garage">Garage</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Ceiling Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={room.ceilingHeight}
                onChange={(e) => updateRoom((r) => ({ ...r, ceilingHeight: parseFloat(e.target.value) || 2.4 }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>

          {/* Area & Occupancy */}
          <div className="p-3 bg-[#141414] border border-[#222222] rounded-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Calculated Floor Area:</span>
              <div className="flex items-center gap-1.5">
                <strong className="text-[#2DD4BF] text-sm font-mono">{room.floorArea.toFixed(1)} m²</strong>
                <DataStateBadge state="VERIFIED" label="VERIFIED" size="xs" />
              </div>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[#222222]">
              <span className="text-gray-400">Target Code Minimum:</span>
              <strong className="text-gray-300 font-mono">{room.minRequiredArea} m²</strong>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-[#222222]">
              <span className="text-gray-400">Occupancy Capacity:</span>
              <strong className="text-gray-300 font-mono">{room.occupancyCapacity} Persons</strong>
            </div>
          </div>

          {/* Environmental Performance */}
          <div className="p-3 bg-[#141414] border border-[#222222] rounded-md space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                Daylight & Comfort Assessment
              </h4>
              <DataStateBadge state="ESTIMATED" label="SIM ESTIMATE" size="xs" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-[#0F0F0F] rounded border border-[#222222]">
                <span className="text-gray-400 text-[10px] block">Natural Light:</span>
                <strong className="text-[#2DD4BF]">{room.naturalLightScore}</strong>
              </div>
              <div className="p-2 bg-[#0F0F0F] rounded border border-[#222222]">
                <span className="text-gray-400 text-[10px] block">Ventilation:</span>
                <strong className="text-[#2DD4BF]">{room.ventilationScore}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#2DD4BF]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Universal Accessibility:</span>
              </span>
              <strong>{room.accessibilityStatus}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DOOR SELECTED
  if (selectedEntity.type === 'door') {
    const door = project.doors.find((d) => d.id === selectedEntity.id);
    if (!door) return null;

    const updateDoor = (updater: (d: Door) => Door) => {
      setProject((p) => ({
        ...p,
        doors: p.doors.map((d) => (d.id === door.id ? updater(d) : d)),
      }));
    };

    return (
      <div className="w-80 bg-[#0A0A0A] border-l border-[#222222] flex flex-col h-full overflow-y-auto text-xs text-[#E0E0E0]">
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">Door Opening Properties</h3>
          <div className="flex items-center gap-1.5">
            <DataStateBadge state="VERIFIED" label="SPEC VERIFIED" size="xs" />
            <button onClick={() => setSelectedEntity(null)} className="text-gray-400 hover:text-white text-xs ml-1">✕</button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 mb-1 block">Door Type</label>
            <select
              value={door.doorType}
              onChange={(e) => updateDoor((d) => ({ ...d, doorType: e.target.value as any }))}
              className="w-full bg-[#141414] border border-[#333333] rounded px-2.5 py-1.5 text-[#E0E0E0] focus:border-[#2DD4BF] focus:outline-none"
            >
              <option value="single">Single Hinged Door</option>
              <option value="double">Double French Doors</option>
              <option value="sliding">Sliding Patio Door</option>
              <option value="pivot">Modern Architectural Pivot</option>
              <option value="garage_double">Double Garage Door</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Clear Width (m)</label>
              <input
                type="number"
                step="0.05"
                value={door.width}
                onChange={(e) => updateDoor((d) => ({ ...d, width: parseFloat(e.target.value) || 0.8 }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={door.height}
                onChange={(e) => updateDoor((d) => ({ ...d, height: parseFloat(e.target.value) || 2.1 }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WINDOW SELECTED
  if (selectedEntity.type === 'window') {
    const win = project.windows.find((w) => w.id === selectedEntity.id);
    if (!win) return null;

    const updateWindow = (updater: (w: Window) => Window) => {
      setProject((p) => ({
        ...p,
        windows: p.windows.map((w) => (w.id === win.id ? updater(w) : w)),
      }));
    };

    return (
      <div className="w-80 bg-[#0A0A0A] border-l border-[#222222] flex flex-col h-full overflow-y-auto text-xs text-[#E0E0E0]">
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <h3 className="font-bold text-white uppercase tracking-wider text-[11px]">Window Glazing Properties</h3>
          <div className="flex items-center gap-1.5">
            <DataStateBadge state="VERIFIED" label="SPEC VERIFIED" size="xs" />
            <button onClick={() => setSelectedEntity(null)} className="text-gray-400 hover:text-white text-xs ml-1">✕</button>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-gray-400">Width (m)</label>
              <input
                type="number"
                step="0.1"
                value={win.width}
                onChange={(e) => updateWindow((w) => ({ ...w, width: parseFloat(e.target.value) || 1.0 }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Height (m)</label>
              <input
                type="number"
                step="0.1"
                value={win.height}
                onChange={(e) => updateWindow((w) => ({ ...w, height: parseFloat(e.target.value) || 1.2 }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400">Sill Ht (m)</label>
              <input
                type="number"
                step="0.1"
                value={win.sillHeight}
                onChange={(e) => updateWindow((w) => ({ ...w, sillHeight: parseFloat(e.target.value) || 0.9 }))}
                className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1 text-[#E0E0E0] font-mono text-center focus:border-[#2DD4BF] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 mb-1 block">Glazing Type</label>
            <select
              value={win.glazingType}
              onChange={(e) => updateWindow((w) => ({ ...w, glazingType: e.target.value as any }))}
              className="w-full bg-[#141414] border border-[#333333] rounded px-2.5 py-1.5 text-[#E0E0E0] focus:border-[#2DD4BF] focus:outline-none"
            >
              <option value="double_low_e">Double Glazed Low-E (U=1.4)</option>
              <option value="triple">Triple Glazed Argon (U=0.8)</option>
              <option value="double_clear">Double Clear (U=2.8)</option>
              <option value="single_clear">Single Clear (U=5.8)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 mb-1 block">Solar Shading</label>
            <select
              value={win.shadingType || 'none'}
              onChange={(e) => updateWindow((w) => ({ ...w, shadingType: e.target.value as any }))}
              className="w-full bg-[#141414] border border-[#333333] rounded px-2.5 py-1.5 text-[#E0E0E0] focus:border-[#2DD4BF] focus:outline-none"
            >
              <option value="overhang">1.2m Architectural Overhang</option>
              <option value="louvers">Adjustable Solar Louvers</option>
              <option value="fins">Vertical Shading Fins</option>
              <option value="none">No External Shading</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
