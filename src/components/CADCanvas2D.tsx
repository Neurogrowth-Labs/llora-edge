import React, { useState, useRef, useEffect } from 'react';
import {
  ArchitecturalProject,
  DrawingTool,
  Wall,
  Door,
  Window,
  Room,
  Furniture,
  Point2D,
  DraftingEntity,
  SpaceValidationError,
  Column,
  Stair,
  SimulationSeason,
  SimulationSkyCondition,
} from '../types/architecture';
import {
  Compass,
  AlertTriangle,
  CheckCircle,
  Info,
  ZoomIn,
  ZoomOut,
  Maximize,
  Eye,
  Sun,
  Flame,
  CloudSun,
  Clock,
  Layers,
  Sparkles,
  Copy,
  CopyPlus,
  ClipboardPaste,
  Trash2,
  RotateCw,
  Move,
  Repeat,
} from 'lucide-react';
import { calculateRoomPolygonArea } from '../services/aiGenerator';
import { calculateNaturalLightExposure } from '../services/daylightAnalysisEngine';

interface CADCanvas2DProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  selectedEntity: { type: 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'site' | 'column'; id: string } | null;
  setSelectedEntity: (entity: { type: 'wall' | 'room' | 'door' | 'window' | 'furniture' | 'site' | 'column'; id: string } | null) => void;
  snapToGrid?: boolean;
  gridSize?: number;
  onFixWarning?: (error: SpaceValidationError) => void;
  onCopySelected?: () => void;
  onPasteClipboard?: () => void;
  onDuplicateSelected?: () => void;
  hasClipboardContent?: boolean;
}

export const CADCanvas2D: React.FC<CADCanvas2DProps> = ({
  project,
  setProject,
  activeTool,
  setActiveTool,
  selectedEntity,
  setSelectedEntity,
  snapToGrid = true,
  gridSize = 0.5,
  onFixWarning,
  onCopySelected,
  onPasteClipboard,
  onDuplicateSelected,
  hasClipboardContent = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(30); // pixels per meter
  const [pan, setPan] = useState<Point2D>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<Point2D>({ x: 0, y: 0 });

  // Safe numeric helpers
  const validGridSize = Number.isFinite(gridSize) && gridSize > 0 ? gridSize : 0.5;
  const validZoom = Number.isFinite(zoom) && zoom > 0 ? zoom : 30;

  // Drawing state
  const [drawingStart, setDrawingStart] = useState<Point2D | null>(null);
  const [currentMouseWorld, setCurrentMouseWorld] = useState<Point2D>({ x: 0, y: 0 });
  const [roomDrawingPoints, setRoomDrawingPoints] = useState<Point2D[]>([]);
  const [draftingStart, setDraftingStart] = useState<Point2D | null>(null);
  const [polylinePoints, setPolylinePoints] = useState<Point2D[]>([]);

  // Hovered elements & Snap system
  const [hoveredWall, setHoveredWall] = useState<Wall | null>(null);
  const [activeWarning, setActiveWarning] = useState<SpaceValidationError | null>(null);
  const [activeSnap, setActiveSnap] = useState<{ point: Point2D; type: 'Endpoint' | 'Midpoint' | 'Grid' | 'Nearest' } | null>(null);

  // Marquee Selection Box
  const [marqueeStart, setMarqueeStart] = useState<Point2D | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<Point2D | null>(null);
  const [selectedCount, setSelectedCount] = useState<number>(0);

  // Object Drag & Move state
  const [isDraggingEntity, setIsDraggingEntity] = useState<boolean>(false);
  const [dragStartWorld, setDragStartWorld] = useState<Point2D | null>(null);

  // Daylight Simulation & Heatmap State
  const [showDaylightHeatmap, setShowDaylightHeatmap] = useState<boolean>(false);
  const [simulationTime, setSimulationTime] = useState<number>(11.5);
  const [simulationSeason, setSimulationSeason] = useState<SimulationSeason>('summer_solstice');
  const [simulationSky, setSimulationSky] = useState<SimulationSkyCondition>('clear');

  // Real-time daylight exposure calculation
  const daylightAnalysis = calculateNaturalLightExposure(project, {
    timeOfDay: simulationTime,
    season: simulationSeason,
    skyCondition: simulationSky,
  });

  // Convert screen coordinates to world coordinates (in meters) with OSNAP vertex snapping
  const screenToWorld = (screenX: number, screenY: number): Point2D => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (screenX - rect.left - pan.x) / validZoom;
    const rawY = (screenY - rect.top - pan.y) / validZoom;

    // Check vertex / midpoint snap first if available
    const activeWalls = project.walls.filter((w) => w.levelId === project.activeLevelId);
    const snapThreshold = 0.4; // 0.4m radius

    for (const w of activeWalls) {
      // 1. Endpoint snap
      if (Math.hypot(rawX - w.start.x, rawY - w.start.y) < snapThreshold) {
        return { x: w.start.x, y: w.start.y };
      }
      if (Math.hypot(rawX - w.end.x, rawY - w.end.y) < snapThreshold) {
        return { x: w.end.x, y: w.end.y };
      }
      // 2. Midpoint snap
      const midX = (w.start.x + w.end.x) / 2;
      const midY = (w.start.y + w.end.y) / 2;
      if (Math.hypot(rawX - midX, rawY - midY) < snapThreshold) {
        return { x: parseFloat(midX.toFixed(2)), y: parseFloat(midY.toFixed(2)) };
      }
    }

    if (snapToGrid) {
      return {
        x: Math.round(rawX / validGridSize) * validGridSize,
        y: Math.round(rawY / validGridSize) * validGridSize,
      };
    }
    return {
      x: parseFloat(rawX.toFixed(2)),
      y: parseFloat(rawY.toFixed(2)),
    };
  };

  // Convert world coordinates to screen coordinates
  const worldToScreen = (worldX: number, worldY: number): Point2D => {
    return {
      x: (worldX || 0) * validZoom + pan.x,
      y: (worldY || 0) * validZoom + pan.y,
    };
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || activeTool === 'pan') {
      // Middle click or pan tool
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button === 0) {
      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (activeTool === 'select') {
        // Start Drag Marquee
        setMarqueeStart(worldPos);
        setMarqueeEnd(worldPos);
        return;
      }

      const draftingKinds = ['line', 'circle', 'arc', 'rectangle', 'polygon', 'ellipse', 'spline', 'hatch', 'ray', 'xline'] as const;
      if (activeTool === 'point') {
        const entity: DraftingEntity = { id: `draft_${Date.now()}`, levelId: project.activeLevelId, kind: 'point', points: [worldPos] };
        setProject((prev) => ({ ...prev, draftingEntities: [...(prev.draftingEntities || []), entity] }));
      } else if (activeTool === 'polyline') {
        // Click successive vertices; click the first vertex to close and finish the PLINE.
        if (polylinePoints.length >= 2 && Math.hypot(worldPos.x - polylinePoints[0].x, worldPos.y - polylinePoints[0].y) < validGridSize) {
          const entity: DraftingEntity = { id: `draft_${Date.now()}`, levelId: project.activeLevelId, kind: 'polyline', points: polylinePoints };
          setProject((prev) => ({ ...prev, draftingEntities: [...(prev.draftingEntities || []), entity] }));
          setPolylinePoints([]);
        } else setPolylinePoints((points) => [...points, worldPos]);
      } else if (draftingKinds.includes(activeTool as typeof draftingKinds[number])) {
        if (!draftingStart) setDraftingStart(worldPos);
        else {
          const radius = Math.hypot(worldPos.x - draftingStart.x, worldPos.y - draftingStart.y);
          if (radius > 0.01) {
            const entity: DraftingEntity = { id: `draft_${Date.now()}`, levelId: project.activeLevelId, kind: activeTool as DraftingEntity['kind'], points: [draftingStart, worldPos], radius };
            setProject((prev) => ({ ...prev, draftingEntities: [...(prev.draftingEntities || []), entity] }));
          }
          setDraftingStart(null);
        }
      } else if (activeTool === 'wall') {
        if (!drawingStart) {
          setDrawingStart(worldPos);
        } else {
          // Finish wall
          if (drawingStart.x !== worldPos.x || drawingStart.y !== worldPos.y) {
            const newWall: Wall = {
              id: `wall_${Date.now()}`,
              levelId: project.activeLevelId,
              start: drawingStart,
              end: worldPos,
              thickness: 0.22,
              height: 3.0,
              type: 'external',
              materialId: 'mat_low_carbon_concrete',
              fireRatingMinutes: 120,
              uValue: 0.45,
            };
            setProject((prev) => ({
              ...prev,
              walls: [...prev.walls, newWall],
            }));
            setSelectedEntity({ type: 'wall', id: newWall.id });
          }
          setDrawingStart(null);
        }
      } else if (activeTool === 'room') {
        if (roomDrawingPoints.length >= 3 && Math.hypot(worldPos.x - roomDrawingPoints[0].x, worldPos.y - roomDrawingPoints[0].y) < 0.5) {
          // Close room polygon
          const area = calculateRoomPolygonArea(roomDrawingPoints);
          const newRoom: Room = {
            id: `room_${Date.now()}`,
            levelId: project.activeLevelId,
            name: `New Room ${project.rooms.length + 1}`,
            type: 'living',
            points: roomDrawingPoints,
            floorArea: Math.round(area * 10) / 10,
            ceilingHeight: 3.0,
            occupancyCapacity: 4,
            minRequiredArea: 10.0,
            naturalLightScore: 'Good',
            ventilationScore: 'Good',
            accessibilityStatus: 'Compliant',
            finishFloorMaterial: 'FSC Engineered Oak',
            colorHex: '#0284c7',
          };
          setProject((prev) => ({
            ...prev,
            rooms: [...prev.rooms, newRoom],
          }));
          setSelectedEntity({ type: 'room', id: newRoom.id });
          setRoomDrawingPoints([]);
        } else {
          setRoomDrawingPoints((prev) => [...prev, worldPos]);
        }
      } else if (activeTool === 'door' && hoveredWall) {
        // Place door on hovered wall
        const newDoor: Door = {
          id: `door_${Date.now()}`,
          levelId: project.activeLevelId,
          wallId: hoveredWall.id,
          position: 0.5,
          width: 0.9,
          height: 2.1,
          swingDirection: 'inward_left',
          doorType: 'single',
          material: 'FSC Solid Timber',
        };
        setProject((prev) => ({
          ...prev,
          doors: [...prev.doors, newDoor],
        }));
        setSelectedEntity({ type: 'door', id: newDoor.id });
      } else if (activeTool === 'window' && hoveredWall) {
        // Place window on hovered wall
        const newWindow: Window = {
          id: `win_${Date.now()}`,
          levelId: project.activeLevelId,
          wallId: hoveredWall.id,
          position: 0.5,
          width: 1.8,
          height: 1.5,
          sillHeight: 0.9,
          glazingType: 'double_low_e',
          frameMaterial: 'thermal_aluminum',
          shadingType: 'overhang',
          operable: true,
        };
        setProject((prev) => ({
          ...prev,
          windows: [...prev.windows, newWindow],
        }));
        setSelectedEntity({ type: 'window', id: newWindow.id });
      } else if (activeTool === 'furniture') {
        const newFurn: Furniture = {
          id: `furn_${Date.now()}`,
          levelId: project.activeLevelId,
          type: 'sofa_sectional',
          position: worldPos,
          rotation: 0,
          width: 2.4,
          depth: 1.8,
        };
        setProject((prev) => ({
          ...prev,
          furniture: [...prev.furniture, newFurn],
        }));
        setSelectedEntity({ type: 'furniture', id: newFurn.id });
      } else if (activeTool === 'column') {
        const newCol: Column = {
          id: `col_${Date.now()}`,
          levelId: project.activeLevelId,
          position: worldPos,
          shape: 'rectangular',
          width: 0.3,
          depth: 0.3,
          material: 'Reinforced Low-Carbon Concrete',
        };
        setProject((prev) => ({
          ...prev,
          columns: [...prev.columns, newCol],
        }));
      } else if (activeTool === 'stair') {
        const newStair: Stair = {
          id: `stair_${Date.now()}`,
          levelId: project.activeLevelId,
          start: worldPos,
          end: { x: worldPos.x + 3.0, y: worldPos.y },
          width: 1.1,
          treadsCount: 16,
          stairType: 'straight',
        };
        setProject((prev) => ({
          ...prev,
          stairs: [...prev.stairs, newStair],
        }));
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);
    setCurrentMouseWorld(worldPos);

    // Dynamic OSNAP Visual Detection
    const activeWalls = project.walls.filter((w) => w.levelId === project.activeLevelId);
    let foundSnap: { point: Point2D; type: 'Endpoint' | 'Midpoint' | 'Grid' | 'Nearest' } | null = null;

    for (const w of activeWalls) {
      if (Math.hypot(worldPos.x - w.start.x, worldPos.y - w.start.y) < 0.45) {
        foundSnap = { point: w.start, type: 'Endpoint' };
        break;
      }
      if (Math.hypot(worldPos.x - w.end.x, worldPos.y - w.end.y) < 0.45) {
        foundSnap = { point: w.end, type: 'Endpoint' };
        break;
      }
      const mid = { x: (w.start.x + w.end.x) / 2, y: (w.start.y + w.end.y) / 2 };
      if (Math.hypot(worldPos.x - mid.x, worldPos.y - mid.y) < 0.45) {
        foundSnap = { point: mid, type: 'Midpoint' };
        break;
      }
    }
    setActiveSnap(foundSnap);

    // Marquee Drag Update
    if (marqueeStart) {
      setMarqueeEnd(worldPos);
      const minX = Math.min(marqueeStart.x, worldPos.x);
      const maxX = Math.max(marqueeStart.x, worldPos.x);
      const minY = Math.min(marqueeStart.y, worldPos.y);
      const maxY = Math.max(marqueeStart.y, worldPos.y);
      const enclosedWalls = activeWalls.filter(
        (w) =>
          (w.start.x >= minX && w.start.x <= maxX && w.start.y >= minY && w.start.y <= maxY) ||
          (w.end.x >= minX && w.end.x <= maxX && w.end.y >= minY && w.end.y <= maxY)
      );
      setSelectedCount(enclosedWalls.length);
    }

    // Interactive Drag / Move selected architectural entity
    if (isDraggingEntity && dragStartWorld && selectedEntity) {
      const dx = worldPos.x - dragStartWorld.x;
      const dy = worldPos.y - dragStartWorld.y;

      if (dx !== 0 || dy !== 0) {
        setProject((prev) => {
          if (selectedEntity.type === 'door') {
            const currentDoor = prev.doors.find((d) => d.id === selectedEntity.id);
            if (!currentDoor) return prev;
            // Project worldPos along the door's wall or closest adjacent wall
            const targetWall =
              activeWalls.find((w) => pointToSegmentDistance(worldPos, w.start, w.end) < 0.8) ||
              prev.walls.find((w) => w.id === currentDoor.wallId);
            if (targetWall) {
              const wdx = targetWall.end.x - targetWall.start.x;
              const wdy = targetWall.end.y - targetWall.start.y;
              const wLenSq = wdx * wdx + wdy * wdy;
              if (wLenSq > 0.01) {
                let t = ((worldPos.x - targetWall.start.x) * wdx + (worldPos.y - targetWall.start.y) * wdy) / wLenSq;
                t = Math.max(0.08, Math.min(0.92, t));
                return {
                  ...prev,
                  doors: prev.doors.map((d) =>
                    d.id === selectedEntity.id ? { ...d, wallId: targetWall.id, position: parseFloat(t.toFixed(3)) } : d
                  ),
                };
              }
            }
            return prev;
          }
          if (selectedEntity.type === 'window') {
            const currentWin = prev.windows.find((w) => w.id === selectedEntity.id);
            if (!currentWin) return prev;
            const targetWall =
              activeWalls.find((w) => pointToSegmentDistance(worldPos, w.start, w.end) < 0.8) ||
              prev.walls.find((w) => w.id === currentWin.wallId);
            if (targetWall) {
              const wdx = targetWall.end.x - targetWall.start.x;
              const wdy = targetWall.end.y - targetWall.start.y;
              const wLenSq = wdx * wdx + wdy * wdy;
              if (wLenSq > 0.01) {
                let t = ((worldPos.x - targetWall.start.x) * wdx + (worldPos.y - targetWall.start.y) * wdy) / wLenSq;
                t = Math.max(0.08, Math.min(0.92, t));
                return {
                  ...prev,
                  windows: prev.windows.map((w) =>
                    w.id === selectedEntity.id ? { ...w, wallId: targetWall.id, position: parseFloat(t.toFixed(3)) } : w
                  ),
                };
              }
            }
            return prev;
          }
          if (selectedEntity.type === 'column') {
            return {
              ...prev,
              columns: prev.columns.map((col) =>
                col.id === selectedEntity.id
                  ? { ...col, position: { x: col.position.x + dx, y: col.position.y + dy } }
                  : col
              ),
            };
          }
          if (selectedEntity.type === 'furniture') {
            return {
              ...prev,
              furniture: prev.furniture.map((f) =>
                f.id === selectedEntity.id
                  ? { ...f, position: { x: (f.position?.x || 0) + dx, y: (f.position?.y || 0) + dy } }
                  : f
              ),
            };
          }
          if (selectedEntity.type === 'wall') {
            return {
              ...prev,
              walls: prev.walls.map((w) =>
                w.id === selectedEntity.id
                  ? {
                      ...w,
                      start: { x: w.start.x + dx, y: w.start.y + dy },
                      end: { x: w.end.x + dx, y: w.end.y + dy },
                    }
                  : w
              ),
            };
          }
          if (selectedEntity.type === 'room') {
            return {
              ...prev,
              rooms: prev.rooms.map((r) =>
                r.id === selectedEntity.id
                  ? {
                      ...r,
                      points: r.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
                    }
                  : r
              ),
            };
          }
          return prev;
        });
        setDragStartWorld(worldPos);
      }
    }

    // Wall hit detection for door/window placement
    if (activeTool === 'door' || activeTool === 'window') {
      const hit = activeWalls.find((w) => {
        const dist = pointToSegmentDistance(worldPos, w.start, w.end);
        return dist < 0.6;
      });
      setHoveredWall(hit || null);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingEntity(false);
    setDragStartWorld(null);

    if (marqueeStart && marqueeEnd) {
      const activeWalls = project.walls.filter((w) => w.levelId === project.activeLevelId);
      const minX = Math.min(marqueeStart.x, marqueeEnd.x);
      const maxX = Math.max(marqueeStart.x, marqueeEnd.x);
      const minY = Math.min(marqueeStart.y, marqueeEnd.y);
      const maxY = Math.max(marqueeStart.y, marqueeEnd.y);
      const hitWall = activeWalls.find(
        (w) =>
          (w.start.x >= minX && w.start.x <= maxX && w.start.y >= minY && w.start.y <= maxY) ||
          (w.end.x >= minX && w.end.x <= maxX && w.end.y >= minY && w.end.y <= maxY)
      );
      if (hitWall) {
        setSelectedEntity({ type: 'wall', id: hitWall.id });
      }
    }
    setMarqueeStart(null);
    setMarqueeEnd(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 10), 120);

    // Zoom towards cursor
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPan((prev) => ({
        x: mouseX - (mouseX - prev.x) * (newZoom / zoom),
        y: mouseY - (mouseY - prev.y) * (newZoom / zoom),
      }));
    }
    setZoom(newZoom);
  };

  // Helper: point to line segment distance
  function pointToSegmentDistance(p: Point2D, v: Point2D, w: Point2D): number {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  const handleDuplicateInternal = () => {
    if (!selectedEntity) return;
    setProject((prev) => {
      const now = Date.now();
      if (selectedEntity.type === 'door') {
        const d = prev.doors.find((item) => item.id === selectedEntity.id);
        if (!d) return prev;
        const newD: Door = {
          ...d,
          id: `door_${now}`,
          position: Math.min(0.92, Math.max(0.08, d.position + 0.12)),
        };
        return { ...prev, doors: [...prev.doors, newD] };
      }
      if (selectedEntity.type === 'window') {
        const w = prev.windows.find((item) => item.id === selectedEntity.id);
        if (!w) return prev;
        const newW: Window = {
          ...w,
          id: `win_${now}`,
          position: Math.min(0.92, Math.max(0.08, w.position + 0.12)),
        };
        return { ...prev, windows: [...prev.windows, newW] };
      }
      if (selectedEntity.type === 'column') {
        const c = prev.columns.find((item) => item.id === selectedEntity.id);
        if (!c) return prev;
        const newC: Column = {
          ...c,
          id: `col_${now}`,
          position: { x: c.position.x + 0.8, y: c.position.y + 0.8 },
        };
        return { ...prev, columns: [...prev.columns, newC] };
      }
      if (selectedEntity.type === 'furniture') {
        const f = prev.furniture.find((item) => item.id === selectedEntity.id);
        if (!f) return prev;
        const newF: Furniture = {
          ...f,
          id: `furn_${now}`,
          position: { x: (f.position?.x || 0) + 0.8, y: (f.position?.y || 0) + 0.8 },
        };
        return { ...prev, furniture: [...prev.furniture, newF] };
      }
      if (selectedEntity.type === 'wall') {
        const w = prev.walls.find((item) => item.id === selectedEntity.id);
        if (!w) return prev;
        const newW: Wall = {
          ...w,
          id: `wall_${now}`,
          start: { x: w.start.x + 1.0, y: w.start.y + 1.0 },
          end: { x: w.end.x + 1.0, y: w.end.y + 1.0 },
        };
        return { ...prev, walls: [...prev.walls, newW] };
      }
      if (selectedEntity.type === 'room') {
        const r = prev.rooms.find((item) => item.id === selectedEntity.id);
        if (!r) return prev;
        const newR: Room = {
          ...r,
          id: `rm_${now}`,
          name: `${r.name} (Copy)`,
          points: r.points.map((p) => ({ x: p.x + 1.0, y: p.y + 1.0 })),
        };
        return { ...prev, rooms: [...prev.rooms, newR] };
      }
      return prev;
    });
  };

  const handleDeleteInternal = () => {
    if (!selectedEntity) return;
    setProject((prev) => {
      if (selectedEntity.type === 'door') {
        return { ...prev, doors: prev.doors.filter((d) => d.id !== selectedEntity.id) };
      }
      if (selectedEntity.type === 'window') {
        return { ...prev, windows: prev.windows.filter((w) => w.id !== selectedEntity.id) };
      }
      if (selectedEntity.type === 'column') {
        return { ...prev, columns: prev.columns.filter((c) => c.id !== selectedEntity.id) };
      }
      if (selectedEntity.type === 'furniture') {
        return { ...prev, furniture: prev.furniture.filter((f) => f.id !== selectedEntity.id) };
      }
      if (selectedEntity.type === 'wall') {
        return {
          ...prev,
          walls: prev.walls.filter((w) => w.id !== selectedEntity.id),
          doors: prev.doors.filter((d) => d.wallId !== selectedEntity.id),
          windows: prev.windows.filter((w) => w.wallId !== selectedEntity.id),
        };
      }
      if (selectedEntity.type === 'room') {
        return { ...prev, rooms: prev.rooms.filter((r) => r.id !== selectedEntity.id) };
      }
      return prev;
    });
    setSelectedEntity(null);
  };

  // Keyboard shortcut listener for CAD plan interaction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input fields
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        if (selectedEntity) {
          e.preventDefault();
          if (onDuplicateSelected) {
            onDuplicateSelected();
          } else {
            handleDuplicateInternal();
          }
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedEntity && onCopySelected) {
          e.preventDefault();
          onCopySelected();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (onPasteClipboard) {
          e.preventDefault();
          onPasteClipboard();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedEntity) {
          e.preventDefault();
          handleDeleteInternal();
        }
      } else if (e.key === 'Escape') {
        setDraftingStart(null);
        setPolylinePoints([]);
        setRoomDrawingPoints([]);
        if (selectedEntity) setSelectedEntity(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEntity, onDuplicateSelected, onCopySelected, onPasteClipboard]);

  // Active level elements
  const currentWalls = project.walls.filter((w) => w.levelId === project.activeLevelId);
  const currentRooms = project.rooms.filter((r) => r.levelId === project.activeLevelId);
  const currentDoors = project.doors.filter((d) => d.levelId === project.activeLevelId);
  const currentWindows = project.windows.filter((w) => w.levelId === project.activeLevelId);
  const currentFurniture = project.furniture.filter((f) => f.levelId === project.activeLevelId);
  const currentColumns = project.columns.filter((c) => c.levelId === project.activeLevelId);
  const currentStairs = project.stairs.filter((s) => s.levelId === project.activeLevelId);
  const currentDimensions = project.dimensions.filter((d) => d.levelId === project.activeLevelId);
  const currentAnnotations = project.annotations.filter((a) => a.levelId === project.activeLevelId);

  // Calculate live site metrics
  const totalGrossArea = currentRooms.reduce((sum, r) => sum + r.floorArea, 0);
  const siteCoveragePct = project.site.siteAreaM2 > 0 ? ((totalGrossArea / project.site.siteAreaM2) * 100).toFixed(1) : '0';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      className="relative w-full h-full bg-[#0F0F0F] overflow-hidden select-none cursor-crosshair"
      style={{
        cursor: activeTool === 'pan' || isPanning ? 'grab' : activeTool === 'select' ? 'default' : 'crosshair',
        backgroundImage: 'radial-gradient(#222222 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* SVG Canvas for CAD Geometry */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          {/* Snap Grid */}
          <pattern
            id="cad-grid-pattern"
            width={Math.max(1, validZoom * validGridSize)}
            height={Math.max(1, validZoom * validGridSize)}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % Math.max(1, validZoom * validGridSize)}, ${pan.y % Math.max(1, validZoom * validGridSize)})`}
          >
            <path
              d={`M ${Math.max(1, validZoom * validGridSize)} 0 L 0 0 0 ${Math.max(1, validZoom * validGridSize)}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="0.5"
            />
          </pattern>

          <pattern id="cad-hatch-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#a78bfa" strokeWidth="1" opacity="0.65" /></pattern>
          {/* Major Grid (5m) */}
          <pattern
            id="cad-major-grid-pattern"
            width={Math.max(1, validZoom * 5)}
            height={Math.max(1, validZoom * 5)}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x % Math.max(1, validZoom * 5)}, ${pan.y % Math.max(1, validZoom * 5)})`}
          >
            <path
              d={`M ${Math.max(1, validZoom * 5)} 0 L 0 0 0 ${Math.max(1, validZoom * 5)}`}
              fill="none"
              stroke="rgba(45, 212, 191, 0.08)"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>

        {/* Grid Background */}
        <rect width="100%" height="100%" fill="url(#cad-grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#cad-major-grid-pattern)" />

        {/* Site Boundary & Setbacks */}
        <g id="cad-site-layer">
          {/* Property Boundary */}
          <rect
            x={worldToScreen(0, 0).x}
            y={worldToScreen(0, 0).y}
            width={Math.max(1, (project.site?.widthM || 20) * validZoom)}
            height={Math.max(1, (project.site?.depthM || 30) * validZoom)}
            fill="rgba(45, 212, 191, 0.03)"
            stroke="#2DD4BF"
            strokeWidth="1.5"
            strokeDasharray="6,4"
          />

          {/* Setback Lines */}
          <rect
            x={worldToScreen(project.site?.setbackSidesM || 2, project.site?.setbackFrontM || 4).x}
            y={worldToScreen(project.site?.setbackSidesM || 2, project.site?.setbackFrontM || 4).y}
            width={Math.max(1, ((project.site?.widthM || 20) - (project.site?.setbackSidesM || 2) * 2) * validZoom)}
            height={Math.max(1, ((project.site?.depthM || 30) - (project.site?.setbackFrontM || 4) - (project.site?.setbackRearM || 3)) * validZoom)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.6"
          />
          <text
            x={worldToScreen((project.site?.setbackSidesM || 2) + 0.3, (project.site?.setbackFrontM || 4) + 0.8).x}
            y={worldToScreen((project.site?.setbackSidesM || 2) + 0.3, (project.site?.setbackFrontM || 4) + 0.8).y}
            fill="#f59e0b"
            fontSize="10"
            fontWeight="600"
            opacity="0.8"
          >
            BUILDABLE ENVELOPE (Setbacks: Front {project.site?.setbackFrontM || 4}m | Sides {project.site?.setbackSidesM || 2}m)
          </text>
        </g>

        {/* Daylight & Natural Light Heatmap Layer */}
        {showDaylightHeatmap && (
          <g id="cad-daylight-heatmap-layer" opacity="0.82">
            {/* Heatmap Grid Cells */}
            {daylightAnalysis.heatmapGrid.map((cell, idx) => {
              const screen = worldToScreen(cell.x, cell.y);
              const cellSize = Math.max(2, 0.5 * validZoom);
              return (
                <rect
                  key={`heat_${idx}`}
                  x={screen.x - cellSize / 2}
                  y={screen.y - cellSize / 2}
                  width={cellSize + 0.5}
                  height={cellSize + 0.5}
                  fill={cell.colorHex}
                  fillOpacity={0.65}
                />
              );
            })}

            {/* Sun Vector Indicator from windows */}
            {daylightAnalysis.config.solarAltitudeDeg > 0 &&
              currentWindows.map((win) => {
                const wall = project.walls.find((w) => w.id === win.wallId);
                if (!wall) return null;
                const wx = wall.start.x + (wall.end.x - wall.start.x) * (win.position || 0.5);
                const wy = wall.start.y + (wall.end.y - wall.start.y) * (win.position || 0.5);
                const s = worldToScreen(wx, wy);

                const sunRad = ((daylightAnalysis.config.solarAzimuthDeg - 90) * Math.PI) / 180;
                const rayLen = Math.min(60, validZoom * 1.8);
                const rx = s.x - Math.cos(sunRad) * rayLen;
                const ry = s.y - Math.sin(sunRad) * rayLen;

                return (
                  <g key={`sunray_${win.id}`} className="pointer-events-none opacity-70">
                    <line
                      x1={s.x}
                      y1={s.y}
                      x2={rx}
                      y2={ry}
                      stroke="#fde047"
                      strokeWidth="1.5"
                      strokeDasharray="3,3"
                    />
                    <circle cx={s.x} cy={s.y} r="3" fill="#fde047" />
                  </g>
                );
              })}
          </g>
        )}

        {/* Native 2D drafting layer: linework, curves, construction lines and fills */}
        <g id="cad-drafting-layer" pointerEvents="none">
          {(project.draftingEntities || []).filter((entity) => entity.levelId === project.activeLevelId).map((entity) => {
            const [a, b] = entity.points;
            const p1 = a && worldToScreen(a.x, a.y); const p2 = b && worldToScreen(b.x, b.y);
            const stroke = entity.kind === 'hatch' ? '#a78bfa' : entity.kind === 'point' ? '#f59e0b' : '#38bdf8';
            if (!p1) return null;
            if (entity.kind === 'point') return <g key={entity.id}><line x1={p1.x - 5} y1={p1.y} x2={p1.x + 5} y2={p1.y} stroke={stroke}/><line x1={p1.x} y1={p1.y - 5} x2={p1.x} y2={p1.y + 5} stroke={stroke}/></g>;
            if (!p2) return null;
            if (entity.kind === 'circle') return <circle key={entity.id} cx={p1.x} cy={p1.y} r={(entity.radius || 0) * validZoom} fill="none" stroke={stroke} strokeWidth="1.5" />;
            if (entity.kind === 'ellipse') return <ellipse key={entity.id} cx={p1.x} cy={p1.y} rx={Math.abs(p2.x-p1.x)} ry={Math.max(2, Math.abs(p2.y-p1.y) / 2)} fill="none" stroke={stroke} strokeWidth="1.5" />;
            if (entity.kind === 'rectangle' || entity.kind === 'hatch') return <rect key={entity.id} x={Math.min(p1.x,p2.x)} y={Math.min(p1.y,p2.y)} width={Math.abs(p2.x-p1.x)} height={Math.abs(p2.y-p1.y)} fill={entity.kind === 'hatch' ? 'url(#cad-hatch-pattern)' : 'none'} stroke={stroke} strokeWidth="1.5" />;
            if (entity.kind === 'polygon') { const r = Math.hypot(p2.x-p1.x,p2.y-p1.y); return <polygon key={entity.id} points={Array.from({length: 6}, (_, i) => `${p1.x + Math.cos(i*Math.PI/3)*r},${p1.y + Math.sin(i*Math.PI/3)*r}`).join(' ')} fill="none" stroke={stroke} strokeWidth="1.5" />; }
            if (entity.kind === 'arc') return <path key={entity.id} d={`M ${p1.x} ${p1.y} A ${(entity.radius || 1)*validZoom} ${(entity.radius || 1)*validZoom} 0 0 1 ${p2.x} ${p2.y}`} fill="none" stroke={stroke} strokeWidth="1.5" />;
            if (entity.kind === 'ray' || entity.kind === 'xline') { const dx=p2.x-p1.x, dy=p2.y-p1.y, d=Math.hypot(dx,dy)||1; const k=2000/d; return <line key={entity.id} x1={entity.kind === 'xline' ? p1.x-dx*k : p1.x} y1={entity.kind === 'xline' ? p1.y-dy*k : p1.y} x2={p1.x+dx*k} y2={p1.y+dy*k} stroke={stroke} strokeDasharray="8,4" />; }
            const points = entity.kind === 'polyline' || entity.kind === 'spline' ? entity.points.map((p) => { const q=worldToScreen(p.x,p.y); return `${q.x},${q.y}`; }).join(' ') : `${p1.x},${p1.y} ${p2.x},${p2.y}`;
            return <polyline key={entity.id} points={points} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />;
          })}
        </g>

        {/* Rooms Polygons Layer */}
        <g id="cad-rooms-layer">
          {currentRooms.map((room) => {
            const isSelected = selectedEntity?.type === 'room' && selectedEntity?.id === room.id;
            const pointsStr = room.points
              .map((p) => {
                const s = worldToScreen(p.x, p.y);
                return `${s.x},${s.y}`;
              })
              .join(' ');

            const center = {
              x: room.points.reduce((sum, p) => sum + p.x, 0) / (room.points.length || 1),
              y: room.points.reduce((sum, p) => sum + p.y, 0) / (room.points.length || 1),
            };
            const centerScreen = worldToScreen(center.x, center.y);
            const roomDaylight = daylightAnalysis.roomMetrics.find((m) => m.roomId === room.id);

            return (
              <g
                key={room.id}
                onMouseDown={(e) => {
                  if (e.button === 0 && activeTool === 'select') {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'room', id: room.id });
                    setIsDraggingEntity(true);
                    setDragStartWorld(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'room', id: room.id });
                }}
                className="cursor-pointer group"
              >
                <polygon
                  points={pointsStr}
                  fill={isSelected ? '#2DD4BF' : showDaylightHeatmap ? 'none' : '#141414'}
                  fillOpacity={isSelected ? 0.25 : 0.85}
                  stroke={isSelected ? '#2DD4BF' : showDaylightHeatmap ? 'rgba(255,255,255,0.4)' : '#333333'}
                  strokeWidth={isSelected ? 2 : showDaylightHeatmap ? 1.5 : 1}
                  className="transition-all hover:stroke-[#555555]"
                />

                {/* Room Name & Metrics Label */}
                <text
                  x={centerScreen.x}
                  y={centerScreen.y - 8}
                  fill={isSelected ? '#2DD4BF' : '#FFFFFF'}
                  fontSize={Math.max(11, zoom * 0.38)}
                  fontWeight="700"
                  textAnchor="middle"
                  className="pointer-events-none uppercase tracking-wider font-sans drop-shadow-md"
                >
                  {room.name}
                </text>
                <text
                  x={centerScreen.x}
                  y={centerScreen.y + 8}
                  fill={showDaylightHeatmap ? '#fde047' : '#737373'}
                  fontSize={Math.max(9, zoom * 0.3)}
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none font-mono drop-shadow-sm"
                >
                  {showDaylightHeatmap && roomDaylight ? (
                    `~${roomDaylight.averageLux} Lux • DF ${roomDaylight.daylightFactorPct}%`
                  ) : (
                    `${room.floorArea.toFixed(1)} m²`
                  )}
                </text>
                <text
                  x={centerScreen.x}
                  y={centerScreen.y + 22}
                  fill={showDaylightHeatmap ? (roomDaylight?.comfortRating === 'High Glare Risk' ? '#ef4444' : '#2DD4BF') : '#2DD4BF'}
                  fontSize={Math.max(8, zoom * 0.24)}
                  fontWeight="600"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow-sm"
                >
                  {showDaylightHeatmap && roomDaylight ? (
                    `sDA: ${roomDaylight.spatialDaylightAutonomyPct}% (${roomDaylight.comfortRating})`
                  ) : (
                    `Light: ${room.naturalLightScore} • Vent: ${room.ventilationScore}`
                  )}
                </text>
              </g>
            );
          })}
        </g>

        {/* Furniture Layer */}
        <g id="cad-furniture-layer">
          {currentFurniture.map((f) => {
            const screen = worldToScreen(f.position?.x || 0, f.position?.y || 0);
            const isSelected = selectedEntity?.type === 'furniture' && selectedEntity?.id === f.id;
            const w = Math.max(1, (f.width || 1.0) * validZoom);
            const h = Math.max(1, (f.depth || 1.0) * validZoom);

            return (
              <g
                key={f.id}
                transform={`translate(${screen.x}, ${screen.y}) rotate(${f.rotation || 0})`}
                onMouseDown={(e) => {
                  if (e.button === 0 && activeTool === 'select') {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'furniture', id: f.id });
                    setIsDraggingEntity(true);
                    setDragStartWorld(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'furniture', id: f.id });
                }}
                className="cursor-pointer"
              >
                <rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  rx="2"
                  fill={isSelected ? 'rgba(45, 212, 191, 0.25)' : 'rgba(255, 255, 255, 0.05)'}
                  stroke={isSelected ? '#2DD4BF' : '#444444'}
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                <text
                  x={0}
                  y={3}
                  fill="#A3A3A3"
                  fontSize="8"
                  textAnchor="middle"
                  className="pointer-events-none font-sans opacity-75 uppercase"
                >
                  {(f.type || 'furniture').replace(/_/g, ' ')}
                </text>
              </g>
            );
          })}
        </g>

        {/* Columns & Stairs Layer */}
        <g id="cad-structural-layer">
          {currentColumns.map((col) => {
            const screen = worldToScreen(col.position?.x || 0, col.position?.y || 0);
            const size = Math.max(1, (col.width || 0.3) * validZoom);
            const isSelected = selectedEntity?.type === 'column' && selectedEntity?.id === col.id;
            return (
              <rect
                key={col.id}
                x={screen.x - size / 2}
                y={screen.y - size / 2}
                width={size}
                height={size}
                fill={isSelected ? '#2DD4BF' : '#222222'}
                stroke={isSelected ? '#2DD4BF' : '#E0E0E0'}
                strokeWidth={isSelected ? 2 : 1}
                onMouseDown={(e) => {
                  if (e.button === 0 && activeTool === 'select') {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'column', id: col.id });
                    setIsDraggingEntity(true);
                    setDragStartWorld(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'column', id: col.id });
                }}
                className="cursor-move"
              />
            );
          })}

          {currentStairs.map((st) => {
            const p1 = worldToScreen(st.start?.x || 0, st.start?.y || 0);
            const p2 = worldToScreen(st.end?.x || 0, st.end?.y || 0);
            return (
              <g key={st.id}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#2DD4BF" strokeWidth={Math.max(1, (st.width || 1.1) * validZoom)} strokeDasharray="4,4" opacity="0.8" />
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2} fill="#2DD4BF" fontSize="10" fontWeight="600" textAnchor="middle">UP ({st.treadsCount || 16} Treads)</text>
              </g>
            );
          })}
        </g>

        {/* Walls Layer */}
        <g id="cad-walls-layer">
          {currentWalls.map((wall) => {
            const p1 = worldToScreen(wall.start?.x || 0, wall.start?.y || 0);
            const p2 = worldToScreen(wall.end?.x || 0, wall.end?.y || 0);
            const isSelected = selectedEntity?.type === 'wall' && selectedEntity?.id === wall.id;
            const isHovered = hoveredWall?.id === wall.id;
            const lengthM = Math.hypot((wall.end?.x || 0) - (wall.start?.x || 0), (wall.end?.y || 0) - (wall.start?.y || 0));

            const strokeW = Math.max(3, (wall.thickness || 0.22) * validZoom);

            return (
              <g
                key={wall.id}
                onMouseDown={(e) => {
                  if (e.button === 0 && activeTool === 'select') {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'wall', id: wall.id });
                    setIsDraggingEntity(true);
                    setDragStartWorld(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'wall', id: wall.id });
                }}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="transparent" strokeWidth={strokeW + 12} />

                {/* Wall core */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={
                    isSelected
                      ? '#2DD4BF'
                      : isHovered
                      ? '#2DD4BF'
                      : wall.type === 'external'
                      ? '#555555'
                      : '#333333'
                  }
                  strokeWidth={strokeW}
                  strokeLinecap="square"
                  className="transition-colors"
                />

                {/* Dimension label along wall */}
                {lengthM > 1.5 && (
                  <text
                    x={(p1.x + p2.x) / 2}
                    y={(p1.y + p2.y) / 2 - 8}
                    fill={isSelected ? '#2DD4BF' : '#737373'}
                    fontSize="9"
                    fontWeight="600"
                    textAnchor="middle"
                    className="pointer-events-none font-mono"
                  >
                    {lengthM.toFixed(2)}m
                  </text>
                )}
              </g>
            );
          })}
        </g>

        {/* Doors & Windows Openings Layer */}
        <g id="cad-openings-layer">
          {currentDoors.map((door) => {
            const wall = project.walls.find((w) => w.id === door.wallId);
            if (!wall) return null;

            const isSelected = selectedEntity?.type === 'door' && selectedEntity?.id === door.id;
            const posX = (wall.start?.x || 0) + ((wall.end?.x || 0) - (wall.start?.x || 0)) * (door.position || 0.5);
            const posY = (wall.start?.y || 0) + ((wall.end?.y || 0) - (wall.start?.y || 0)) * (door.position || 0.5);
            const s = worldToScreen(posX, posY);
            const doorW = Math.max(1, (door.width || 0.9) * validZoom);

            return (
              <g
                key={door.id}
                transform={`translate(${s.x}, ${s.y})`}
                onMouseDown={(e) => {
                  if (e.button === 0 && activeTool === 'select') {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'door', id: door.id });
                    setIsDraggingEntity(true);
                    setDragStartWorld(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'door', id: door.id });
                }}
                className="cursor-move group"
              >
                <circle r={doorW * 0.6} fill={isSelected ? 'rgba(45, 212, 191, 0.15)' : 'none'} stroke={isSelected ? '#F59E0B' : '#2DD4BF'} strokeWidth={isSelected ? 2 : 1} strokeDasharray="3,3" opacity={isSelected ? 1 : 0.7} />
                <line x1={-doorW / 2} y1={0} x2={doorW / 2} y2={0} stroke={isSelected ? '#F59E0B' : '#2DD4BF'} strokeWidth={isSelected ? 3.5 : 2.5} />
                <text x={0} y={-8} fill={isSelected ? '#F59E0B' : '#2DD4BF'} fontSize="9" fontWeight="700" textAnchor="middle">
                  D ({door.width}m)
                </text>
              </g>
            );
          })}

          {currentWindows.map((win) => {
            const wall = project.walls.find((w) => w.id === win.wallId);
            if (!wall) return null;

            const isSelected = selectedEntity?.type === 'window' && selectedEntity?.id === win.id;
            const posX = (wall.start?.x || 0) + ((wall.end?.x || 0) - (wall.start?.x || 0)) * (win.position || 0.5);
            const posY = (wall.start?.y || 0) + ((wall.end?.y || 0) - (wall.start?.y || 0)) * (win.position || 0.5);
            const s = worldToScreen(posX, posY);
            const winW = Math.max(1, (win.width || 1.5) * validZoom);

            return (
              <g
                key={win.id}
                transform={`translate(${s.x}, ${s.y})`}
                onMouseDown={(e) => {
                  if (e.button === 0 && activeTool === 'select') {
                    e.stopPropagation();
                    setSelectedEntity({ type: 'window', id: win.id });
                    setIsDraggingEntity(true);
                    setDragStartWorld(screenToWorld(e.clientX, e.clientY));
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntity({ type: 'window', id: win.id });
                }}
                className="cursor-move group"
              >
                <rect x={-winW / 2} y={-4} width={winW} height={8} fill={isSelected ? 'rgba(245, 158, 11, 0.4)' : '#2DD4BF'} fillOpacity="0.4" stroke={isSelected ? '#f59e0b' : '#2DD4BF'} strokeWidth={isSelected ? 2.5 : 1.5} />
                <text x={0} y={-10} fill={isSelected ? '#f59e0b' : '#2DD4BF'} fontSize="9" fontWeight="700" textAnchor="middle">
                  W ({win.width}m)
                </text>
              </g>
            );
          })}
        </g>

        {/* CAD Dimensions Lines */}
        <g id="cad-dimensions-layer">
          {currentDimensions.map((dim) => {
            const p1 = worldToScreen(dim.start.x, dim.start.y);
            const p2 = worldToScreen(dim.end.x, dim.end.y);
            return (
              <g key={dim.id}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#737373" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx={p1.x} cy={p1.y} r="2" fill="#2DD4BF" />
                <circle cx={p2.x} cy={p2.y} r="2" fill="#2DD4BF" />
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 4} fill="#A3A3A3" fontSize="9" fontWeight="600" textAnchor="middle" className="font-mono">
                  {dim.label || `${Math.hypot(dim.end.x - dim.start.x, dim.end.y - dim.start.y).toFixed(2)}m`}
                </text>
              </g>
            );
          })}
        </g>

        {/* Live Drawing Preview (Rubber band wall or polygon) */}
        {activeTool === 'wall' && drawingStart && (
          <g>
            <line
              x1={worldToScreen(drawingStart.x, drawingStart.y).x}
              y1={worldToScreen(drawingStart.x, drawingStart.y).y}
              x2={worldToScreen(currentMouseWorld.x, currentMouseWorld.y).x}
              y2={worldToScreen(currentMouseWorld.x, currentMouseWorld.y).y}
              stroke="#2DD4BF"
              strokeWidth="3"
              strokeDasharray="4,4"
            />
            <text
              x={(worldToScreen(drawingStart.x, drawingStart.y).x + worldToScreen(currentMouseWorld.x, currentMouseWorld.y).x) / 2}
              y={(worldToScreen(drawingStart.x, drawingStart.y).y + worldToScreen(currentMouseWorld.x, currentMouseWorld.y).y) / 2 - 12}
              fill="#2DD4BF"
              fontSize="11"
              fontWeight="bold"
              textAnchor="middle"
              className="font-mono"
            >
              {Math.hypot(currentMouseWorld.x - drawingStart.x, currentMouseWorld.y - drawingStart.y).toFixed(2)}m
            </text>
          </g>
        )}

        {/* Room Polygon in progress */}
        {activeTool === 'room' && roomDrawingPoints.length > 0 && (
          <g>
            <polyline
              points={[...roomDrawingPoints, currentMouseWorld].map((p) => `${worldToScreen(p.x, p.y).x},${worldToScreen(p.x, p.y).y}`).join(' ')}
              fill="rgba(45, 212, 191, 0.1)"
              stroke="#2DD4BF"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
            {roomDrawingPoints.map((p, i) => {
              const s = worldToScreen(p.x, p.y);
              return <circle key={i} cx={s.x} cy={s.y} r="4" fill="#2DD4BF" stroke="#050505" strokeWidth="1.5" />;
            })}
          </g>
        )}

        {/* Space Validation Warnings Overlays */}
        <g id="cad-warnings-layer">
          {project.validationErrors.map((err) => {
            const room = project.rooms.find((r) => r.id === err.roomId);
            if (!room || room.points.length === 0) return null;
            const cx = room.points.reduce((s, p) => s + p.x, 0) / room.points.length;
            const cy = room.points.reduce((s, p) => s + p.y, 0) / room.points.length;
            const s = worldToScreen(cx, cy);

            return (
              <g
                key={err.id}
                transform={`translate(${s.x + 35}, ${s.y - 25})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWarning(err);
                }}
                className="cursor-pointer animate-bounce"
              >
                <circle r="10" fill="#f59e0b" stroke="#050505" strokeWidth="1.5" />
                <text x="0" y="3.5" fill="#050505" fontSize="10" fontWeight="bold" textAnchor="middle">
                  !
                </text>
              </g>
            );
          })}
        </g>
        {/* OSNAP Precision Snap Glyph Indicators & Tooltips */}
        {activeSnap && (
          <g id="osnap-indicator" transform={`translate(${worldToScreen(activeSnap.point.x, activeSnap.point.y).x}, ${worldToScreen(activeSnap.point.x, activeSnap.point.y).y})`}>
            {activeSnap.type === 'Endpoint' && (
              <rect x="-6" y="-6" width="12" height="12" fill="none" stroke="#2DD4BF" strokeWidth="2" className="animate-pulse" />
            )}
            {activeSnap.type === 'Midpoint' && (
              <polygon points="0,-7 7,6 -7,6" fill="none" stroke="#38BDF8" strokeWidth="2" className="animate-pulse" />
            )}
            {activeSnap.type === 'Nearest' && (
              <circle r="6" fill="none" stroke="#F59E0B" strokeWidth="2" />
            )}
            {/* Snap Tooltip Badge */}
            <g transform="translate(12, -12)">
              <rect x="0" y="0" width="110" height="18" rx="3" fill="#141414" stroke="#2DD4BF" strokeWidth="1" />
              <text x="6" y="12" fill="#2DD4BF" fontSize="10" fontFamily="monospace" fontWeight="bold">
                {activeSnap.type} [{activeSnap.point.x.toFixed(1)}, {activeSnap.point.y.toFixed(1)}]
              </text>
            </g>
          </g>
        )}

        {/* Window & Crossing Selection Marquee */}
        {marqueeStart && marqueeEnd && (
          <g id="cad-selection-marquee">
            {(() => {
              const s1 = worldToScreen(marqueeStart.x, marqueeStart.y);
              const s2 = worldToScreen(marqueeEnd.x, marqueeEnd.y);
              const isWindow = s2.x >= s1.x; // Left-to-right is Window (blue), Right-to-left is Crossing (green)
              const x = Math.min(s1.x, s2.x);
              const y = Math.min(s1.y, s2.y);
              const w = Math.abs(s2.x - s1.x);
              const h = Math.abs(s2.y - s1.y);

              return (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    fill={isWindow ? 'rgba(59, 130, 246, 0.18)' : 'rgba(34, 197, 94, 0.18)'}
                    stroke={isWindow ? '#3B82F6' : '#22C55E'}
                    strokeWidth="1.5"
                    strokeDasharray={isWindow ? 'none' : '5,4'}
                  />
                  <text
                    x={x + 6}
                    y={y + 14}
                    fill={isWindow ? '#93C5FD' : '#86EFAC'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isWindow ? 'Window Select (Enclosed)' : 'Crossing Select (Touching)'} ({selectedCount} items)
                  </text>
                </g>
              );
            })()}
          </g>
        )}
      </svg>

      {/* Floating Selected Entity Action HUD Toolbar */}
      {selectedEntity && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0A0A0A]/95 border border-[#2DD4BF]/50 backdrop-blur-md rounded-lg shadow-2xl px-3 py-1.5 flex items-center gap-2 text-xs text-white pointer-events-auto animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-1.5 border-r border-[#262626] pr-2.5">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span className="font-semibold text-gray-200 capitalize">
              {selectedEntity.type}:{' '}
              <strong className="text-[#2DD4BF] font-mono">
                {selectedEntity.type === 'door' &&
                  `D (${project.doors.find((d) => d.id === selectedEntity.id)?.width || 0.9}m)`}
                {selectedEntity.type === 'window' &&
                  `W (${project.windows.find((w) => w.id === selectedEntity.id)?.width || 1.5}m)`}
                {selectedEntity.type === 'column' &&
                  `Col (${project.columns.find((c) => c.id === selectedEntity.id)?.width || 0.3}m)`}
                {selectedEntity.type === 'wall' &&
                  `Wall (${Math.hypot(
                    (project.walls.find((w) => w.id === selectedEntity.id)?.end.x || 0) -
                      (project.walls.find((w) => w.id === selectedEntity.id)?.start.x || 0),
                    (project.walls.find((w) => w.id === selectedEntity.id)?.end.y || 0) -
                      (project.walls.find((w) => w.id === selectedEntity.id)?.start.y || 0)
                  ).toFixed(2)}m)`}
                {selectedEntity.type === 'room' &&
                  (project.rooms.find((r) => r.id === selectedEntity.id)?.name || 'Room')}
                {selectedEntity.type === 'furniture' &&
                  (project.furniture.find((f) => f.id === selectedEntity.id)?.type || 'Item')}
              </strong>
            </span>
          </div>

          {/* Quick Duplicate */}
          <button
            onClick={() => {
              if (onDuplicateSelected) {
                onDuplicateSelected();
              } else {
                handleDuplicateInternal();
              }
            }}
            className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-200 hover:text-[#2DD4BF] rounded flex items-center gap-1 text-[11px] font-medium transition"
            title="Duplicate Object (Ctrl+D)"
          >
            <CopyPlus className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Duplicate</span>
            <kbd className="text-[9px] text-gray-500 font-mono ml-0.5">Ctrl+D</kbd>
          </button>

          {/* Quick Copy */}
          <button
            onClick={() => {
              if (onCopySelected) onCopySelected();
            }}
            className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-200 hover:text-white rounded flex items-center gap-1 text-[11px] font-medium transition"
            title="Copy to Clipboard (Ctrl+C)"
          >
            <Copy className="w-3.5 h-3.5 text-gray-400" />
            <span>Copy</span>
            <kbd className="text-[9px] text-gray-500 font-mono ml-0.5">Ctrl+C</kbd>
          </button>

          {/* Quick Paste */}
          <button
            onClick={() => {
              if (onPasteClipboard) onPasteClipboard();
            }}
            className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-gray-200 hover:text-[#10B981] rounded flex items-center gap-1 text-[11px] font-medium transition"
            title="Paste from Clipboard (Ctrl+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Paste</span>
            <kbd className="text-[9px] text-gray-500 font-mono ml-0.5">Ctrl+V</kbd>
          </button>

          {/* Contextual actions */}
          {selectedEntity.type === 'door' && (
            <button
              onClick={() => {
                setProject((prev) => ({
                  ...prev,
                  doors: prev.doors.map((d) =>
                    d.id === selectedEntity.id
                      ? {
                          ...d,
                          swingDirection:
                            d.swingDirection === 'inward_left'
                              ? 'inward_right'
                              : d.swingDirection === 'inward_right'
                              ? 'sliding'
                              : d.swingDirection === 'sliding'
                              ? 'pivot'
                              : 'inward_left',
                        }
                      : d
                  ),
                }));
              }}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-amber-300 rounded flex items-center gap-1 text-[11px] font-medium transition"
              title="Flip Swing Direction / Door Type"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Flip Swing</span>
            </button>
          )}

          {selectedEntity.type === 'furniture' && (
            <button
              onClick={() => {
                setProject((prev) => ({
                  ...prev,
                  furniture: prev.furniture.map((f) =>
                    f.id === selectedEntity.id
                      ? { ...f, rotation: ((f.rotation || 0) + 45) % 360 }
                      : f
                  ),
                }));
              }}
              className="px-2 py-1 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-sky-300 rounded flex items-center gap-1 text-[11px] font-medium transition"
              title="Rotate 45 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Rotate 45°</span>
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => handleDeleteInternal()}
            className="p-1 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded transition ml-1"
            title="Delete Entity (Del / Backspace)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSelectedEntity(null)}
            className="text-[10px] text-gray-500 hover:text-gray-300 px-1 hover:underline"
            title="Deselect (Esc)"
          >
            Esc
          </button>
        </div>
      )}

      {/* Floating Canvas Overlays (North Compass, Navigation HUD, Warnings Panel) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        {/* Project & Level Tag */}
        <div className="bg-[#141414]/90 backdrop-blur border border-[#222222] px-3.5 py-2.5 rounded-md shadow-2xl pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
            <span className="text-xs font-bold text-[#E0E0E0] uppercase tracking-wider">
              {project.levels.find((l) => l.id === project.activeLevelId)?.name || 'Ground Level'}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
            Gross Area: <strong className="text-[#2DD4BF]">{totalGrossArea.toFixed(1)} m²</strong> | Coverage: <strong className="text-gray-200">{siteCoveragePct}%</strong>
          </div>
        </div>

        {/* Cursor World Coordinates HUD */}
        <div className="bg-[#111111]/90 backdrop-blur border border-[#222222] px-2.5 py-1.5 rounded text-[10px] font-mono text-gray-300 pointer-events-auto w-fit flex items-center gap-2 shadow-lg">
          <span>X: <strong className="text-[#2DD4BF]">{currentMouseWorld.x.toFixed(2)}m</strong></span>
          <span>Y: <strong className="text-[#2DD4BF]">{currentMouseWorld.y.toFixed(2)}m</strong></span>
          <span className="text-gray-500">|</span>
          <span>Grid: {validGridSize}m</span>
          {activeSnap && (
            <>
              <span className="text-gray-500">|</span>
              <span className="px-1.5 py-0.2 bg-[#2DD4BF]/20 text-[#2DD4BF] font-bold rounded">
                OSNAP: {activeSnap.type}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right Top: North Compass & Climate Solar Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-3 pointer-events-none">
        <div className="bg-[#141414]/90 backdrop-blur border border-[#222222] p-2.5 rounded-md shadow-2xl flex flex-col items-center pointer-events-auto">
          <div
            className="w-10 h-10 rounded-full border border-[#333333] flex items-center justify-center transition-transform relative"
            style={{ transform: `rotate(${project.site.orientationNorthDeg}deg)` }}
          >
            <Compass className="w-6 h-6 text-[#2DD4BF]" />
            <span className="absolute -top-1.5 text-[9px] font-extrabold text-[#2DD4BF]">N</span>
          </div>
          <span className="text-[9px] font-mono text-gray-400 mt-1">{project.site.orientationNorthDeg}° N</span>
        </div>
      </div>

      {/* Bottom Floating Controls: Zoom In, Out, Fit */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#141414]/90 backdrop-blur border border-[#222222] p-1 rounded-md shadow-2xl z-20">
        <button
          onClick={() => setZoom((z) => Math.min(z * 1.2, 120))}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222222] rounded transition"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z * 0.8, 10))}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222222] rounded transition"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(30);
            setPan({ x: 80, y: 80 });
          }}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222222] rounded transition"
          title="Reset Zoom & Pan"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Real-Time Daylight & Heatmap HUD Controller */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20 pointer-events-auto">
        <div className="bg-[#141414]/95 backdrop-blur border border-[#262626] rounded-lg p-2.5 shadow-2xl flex flex-col gap-2 text-xs w-[360px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sun className={`w-4 h-4 ${showDaylightHeatmap ? 'text-amber-400 animate-spin-slow' : 'text-gray-400'}`} />
              <span className="font-bold text-white tracking-tight">Daylight & Sun Heatmap</span>
              {showDaylightHeatmap && (
                <span className="px-1.5 py-0.2 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-mono font-bold rounded">
                  LIVE
                </span>
              )}
            </div>

            <button
              onClick={() => setShowDaylightHeatmap((s) => !s)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                showDaylightHeatmap
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md font-bold'
                  : 'bg-[#222222] hover:bg-[#2E2E2E] text-gray-300'
              }`}
            >
              {showDaylightHeatmap ? 'Heatmap ON' : 'Show Heatmap'}
            </button>
          </div>

          {showDaylightHeatmap && (
            <div className="space-y-2 pt-1 border-t border-[#222]">
              {/* Time of Day Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-gray-300">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Solar Time:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    {Math.floor(simulationTime)}:{Math.round((simulationTime % 1) * 60).toString().padStart(2, '0')}
                    {' '}
                    <span className="text-[10px] text-gray-400 font-normal">
                      (Alt: {daylightAnalysis.config.solarAltitudeDeg.toFixed(0)}° | Az: {daylightAnalysis.config.solarAzimuthDeg.toFixed(0)}°)
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="18"
                  step="0.25"
                  value={simulationTime}
                  onChange={(e) => setSimulationTime(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#262626] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Season Selection */}
              <div className="flex items-center justify-between gap-1 text-[10px]">
                {(
                  [
                    { id: 'summer_solstice', label: 'Summer' },
                    { id: 'equinox', label: 'Equinox' },
                    { id: 'winter_solstice', label: 'Winter' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSimulationSeason(s.id)}
                    className={`flex-1 py-1 rounded transition font-medium ${
                      simulationSeason === s.id
                        ? 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/40 font-bold'
                        : 'bg-[#1C1C1C] text-gray-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Heatmap Color Legend */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[9px] text-gray-400 font-mono">
                  <span>0 lx (Dark)</span>
                  <span>300 lx (Target)</span>
                  <span>1000 lx</span>
                  <span>&gt;2000 lx (Glare)</span>
                </div>
                <div className="h-2 w-full rounded-sm overflow-hidden flex shadow-inner">
                  <div className="flex-1 bg-[#1e1b4b]" title="<100 lx" />
                  <div className="flex-1 bg-[#0284c7]" title="100-300 lx" />
                  <div className="flex-1 bg-[#059669]" title="300-600 lx (Optimal)" />
                  <div className="flex-1 bg-[#10b981]" title="600-1000 lx" />
                  <div className="flex-1 bg-[#f59e0b]" title="1000-1500 lx" />
                  <div className="flex-1 bg-[#ef4444]" title=">2000 lx (High Solar Risk)" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning Popup Detail Modal */}
      {activeWarning && (
        <div className="absolute bottom-16 left-4 max-w-sm bg-[#141414] border border-amber-500/40 rounded-md p-4 shadow-2xl backdrop-blur z-30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-amber-500/10 text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Space Validation Warning</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{activeWarning.message}</p>
              <div className="mt-2.5 p-2 bg-[#0A0A0A] rounded border border-[#222222] text-[11px] text-[#2DD4BF]">
                <strong>Design Recommendation:</strong> {activeWarning.suggestedFix}
              </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setActiveWarning(null)}
                  className="px-2.5 py-1 text-xs text-gray-400 hover:text-white transition"
                >
                  Dismiss
                </button>
                {onFixWarning && (
                  <button
                    onClick={() => {
                      onFixWarning(activeWarning);
                      setActiveWarning(null);
                    }}
                    className="px-3 py-1 bg-[#2DD4BF] hover:brightness-110 text-[#050505] text-xs font-bold rounded transition"
                  >
                    Auto-Fix with Design
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
