import React, { useState } from 'react';
import { MATERIALS_DATABASE } from '../data/materialsDatabase';
import { MaterialDef } from '../types/architecture';
import {
  Layers,
  Search,
} from 'lucide-react';

interface MaterialsCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMaterial?: (mat: MaterialDef) => void;
}

export const MaterialsCatalog: React.FC<MaterialsCatalogProps> = ({
  isOpen,
  onClose,
  onSelectMaterial,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Materials' },
    { id: 'structure', label: 'Structure & Framing' },
    { id: 'masonry', label: 'Masonry & Blockwork' },
    { id: 'glazing', label: 'Glazing & Windows' },
    { id: 'insulation', label: 'Insulation & Thermal' },
    { id: 'finish', label: 'Flooring & Finishes' },
    { id: 'roofing', label: 'Roofing & Solar' },
  ];

  const filteredMaterials = MATERIALS_DATABASE.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-md w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#E0E0E0] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#222222] bg-[#0A0A0A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Sustainable BIM Materials & Specifications Library</h2>
              <p className="text-xs text-gray-400">
                Verified thermal performance U-values, embodied carbon indices, and fire safety ratings.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded text-sm">
            ✕
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-[#222222] bg-[#0F0F0F] flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by material name, CLT, geopolymer, low-E glass..."
              className="w-full bg-[#141414] border border-[#222222] rounded pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#2DD4BF]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === c.id
                    ? 'bg-[#2DD4BF] text-[#050505] font-bold'
                    : 'bg-[#141414] text-gray-400 hover:text-white border border-[#222222]'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Materials Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="p-4 bg-[#141414] border border-[#222222] hover:border-[#333333] rounded flex flex-col justify-between space-y-3 transition"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-sm font-bold text-white block">{mat.name}</strong>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#222222] text-[#2DD4BF]">
                    {mat.category.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{mat.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#222222] text-[11px]">
                <div className="p-2 bg-[#0A0A0A] rounded border border-[#222222]">
                  <span className="text-gray-400 text-[10px] block">Thermal U:</span>
                  <strong className="text-[#2DD4BF] font-mono">{mat.uValue} W/m²K</strong>
                </div>
                <div className="p-2 bg-[#0A0A0A] rounded border border-[#222222]">
                  <span className="text-gray-400 text-[10px] block">CO₂e Carbon:</span>
                  <strong className="text-amber-400 font-mono">{mat.embodiedCarbonKgCO2e} kg/m²</strong>
                </div>
                <div className="p-2 bg-[#0A0A0A] rounded border border-[#222222]">
                  <span className="text-gray-400 text-[10px] block">Recycled:</span>
                  <strong className="text-[#E0E0E0] font-mono">{mat.recycledContentPct}%</strong>
                </div>
              </div>

              {onSelectMaterial && (
                <button
                  onClick={() => {
                    onSelectMaterial(mat);
                    onClose();
                  }}
                  className="w-full py-2 bg-[#0A0A0A] hover:bg-[#2DD4BF] hover:text-[#050505] border border-[#222222] font-bold text-xs text-[#E0E0E0] rounded transition"
                >
                  Assign to Selected Wall / Element
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222222] bg-[#0A0A0A] flex items-center justify-between">
          <span className="text-xs text-gray-400 font-mono">
            Showing {filteredMaterials.length} of {MATERIALS_DATABASE.length} materials in database
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#141414] hover:bg-[#222222] border border-[#333333] text-xs font-semibold text-white rounded transition"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
};
