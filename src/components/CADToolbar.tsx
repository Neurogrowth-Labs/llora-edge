import React from 'react';
import {
  MousePointer2,
  Hand,
  Maximize2,
  Minimize2,
  DoorOpen,
  Square,
  Columns,
  Footprints,
  Ruler,
  Type,
  Layers,
  Sparkles,
  RotateCcw,
  RotateCw,
  Plus,
  Trash2,
  Grid,
  Magnet,
  Sofa,
  Copy,
  ClipboardPaste,
  CopyPlus,
} from 'lucide-react';
import { DrawingTool, Level } from '../types/architecture';

interface CADToolbarProps {
  activeTool: DrawingTool;
  setActiveTool: (tool: DrawingTool) => void;
  levels: Level[];
  activeLevelId: string;
  setActiveLevelId: (levelId: string) => void;
  onAddLevel: () => void;
  snapToGrid: boolean;
  setSnapToGrid: (val: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenAiCopilot: () => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onCopySelected?: () => void;
  onPasteClipboard?: () => void;
  onDuplicateSelected?: () => void;
  canPaste?: boolean;
}

export const CADToolbar: React.FC<CADToolbarProps> = ({
  activeTool,
  setActiveTool,
  levels,
  activeLevelId,
  setActiveLevelId,
  onAddLevel,
  snapToGrid,
  setSnapToGrid,
  gridSize,
  setGridSize,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenAiCopilot,
  onDeleteSelected,
  hasSelection,
  onCopySelected,
  onPasteClipboard,
  onDuplicateSelected,
  canPaste = false,
}) => {
  const tools: { id: DrawingTool; label: string; icon: any; shortcut: string }[] = [
    { id: 'select', label: 'Select (V)', icon: MousePointer2, shortcut: 'V' },
    { id: 'pan', label: 'Pan Hand (H)', icon: Hand, shortcut: 'H' },
    { id: 'wall', label: 'Wall (W)', icon: Square, shortcut: 'W' },
    { id: 'door', label: 'Door (D)', icon: DoorOpen, shortcut: 'D' },
    { id: 'window', label: 'Window (G)', icon: Maximize2, shortcut: 'G' },
    { id: 'column', label: 'Column (C)', icon: Columns, shortcut: 'C' },
    { id: 'stair', label: 'Stair (S)', icon: Footprints, shortcut: 'S' },
    { id: 'room', label: 'Room Boundary (R)', icon: Square, shortcut: 'R' },
    { id: 'furniture', label: 'Furniture (F)', icon: Sofa, shortcut: 'F' },
    { id: 'dimension', label: 'Dimension (M)', icon: Ruler, shortcut: 'M' },
    { id: 'text', label: 'Annotation (T)', icon: Type, shortcut: 'T' },
  ];

  return (
    <div className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-2 flex items-center justify-between gap-3 select-none z-20">
      {/* Left: Tool Selection */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5">
        <div className="flex items-center bg-[#141414] p-1 rounded-md border border-[#222222]">
          {tools.map((t) => {
            const Icon = t.icon;
            const isActive = activeTool === t.id;
            return (
              <button
                key={t.id}
                id={`cad-tool-${t.id}`}
                onClick={() => setActiveTool(t.id)}
                title={`${t.label}`}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#333333] text-[#2DD4BF] border border-[#444444] shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#222222]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{t.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selection & Clipboard Operations */}
        {hasSelection && (
          <div className="flex items-center gap-1 bg-[#141414] p-0.5 rounded-md border border-[#222222]">
            {onCopySelected && (
              <button
                onClick={onCopySelected}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#222222] text-gray-300 hover:text-white text-xs font-semibold transition"
                title="Copy Selected Element (Ctrl+C)"
              >
                <Copy className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span className="hidden xl:inline">Copy</span>
              </button>
            )}
            {onDuplicateSelected && (
              <button
                onClick={onDuplicateSelected}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#222222] text-gray-300 hover:text-white text-xs font-semibold transition"
                title="Duplicate Selected Element (Ctrl+D)"
              >
                <CopyPlus className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Duplicate</span>
              </button>
            )}
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-1 px-2 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold transition"
              title="Delete Selected Architectural Element (Del)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Delete</span>
            </button>
          </div>
        )}

        {/* Paste from Clipboard */}
        {canPaste && onPasteClipboard && (
          <button
            onClick={onPasteClipboard}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold transition animate-pulse"
            title="Paste Clipboard Element (Ctrl+V)"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paste (Ctrl+V)</span>
          </button>
        )}
      </div>

      {/* Center: Snapping & Grid controls */}
      <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center bg-[#141414] p-1 rounded-md border border-[#222222] text-xs">
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition ${
              snapToGrid ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20' : 'text-gray-400 hover:text-gray-200'
            }`}
            title="Toggle Snap to Grid (S)"
          >
            <Magnet className="w-3 h-3" />
            <span>Snap</span>
          </button>

          <div className="h-4 w-px bg-[#222222] mx-1" />

          <div className="flex items-center gap-1 px-1 text-gray-400">
            <Grid className="w-3 h-3 text-gray-500" />
            <select
              value={gridSize}
              onChange={(e) => setGridSize(parseFloat(e.target.value))}
              className="bg-transparent text-gray-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="0.1" className="bg-[#111111] text-white">0.1m</option>
              <option value="0.5" className="bg-[#111111] text-white">0.5m</option>
              <option value="1.0" className="bg-[#111111] text-white">1.0m</option>
              <option value="2.0" className="bg-[#111111] text-white">2.0m</option>
            </select>
          </div>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-[#141414] p-1 rounded-md border border-[#222222]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition ${
              canUndo ? 'text-gray-300 hover:text-white hover:bg-[#222222]' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition ${
              canRedo ? 'text-gray-300 hover:text-white hover:bg-[#222222]' : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Floor Level Switcher & Design Assist Trigger */}
      <div className="flex items-center gap-2">
        {/* Level Switcher */}
        <div className="flex items-center bg-[#141414] px-2.5 py-1 rounded-md border border-[#222222] gap-1.5 text-xs">
          <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
          <select
            value={activeLevelId}
            onChange={(e) => setActiveLevelId(e.target.value)}
            className="bg-transparent text-gray-200 font-semibold text-xs focus:outline-none cursor-pointer pr-1"
          >
            {levels.map((lvl) => (
              <option key={lvl.id} value={lvl.id} className="bg-[#111111] text-white">
                {lvl.name} ({lvl.elevation.toFixed(1)}m)
              </option>
            ))}
          </select>
          <button
            onClick={onAddLevel}
            title="Add New Level / Storey"
            className="p-1 text-gray-400 hover:text-[#2DD4BF] hover:bg-[#222222] rounded transition"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Quick Design Assistant button */}
        <button
          id="btn-trigger-ai-copilot"
          onClick={onOpenAiCopilot}
          className="flex items-center px-3 py-1.5 rounded bg-[#2DD4BF] text-[#050505] font-bold text-xs shadow-md shadow-[#2DD4BF]/20 hover:brightness-110 active:scale-95 transition"
        >
          <span>DESIGN ASSISTANT</span>
        </button>
      </div>
    </div>
  );
};
