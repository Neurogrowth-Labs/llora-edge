import React, { useState } from 'react';
import {
  ArchitecturalProject,
  BuildingType,
  ArchitecturalStyle,
  JurisdictionCode,
} from '../types/architecture';
import {
  Sparkles,
  Leaf,
  Loader2,
} from 'lucide-react';
import { generateProjectFromPrompt } from '../services/aiGenerator';
import { JURISDICTIONS } from '../data/jurisdictions';

interface ProjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: ArchitecturalProject) => void;
}

export const ProjectCreationModal: React.FC<ProjectCreationModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [prompt, setPrompt] = useState<string>(
    'Design a contemporary 4-bedroom two-storey house on a 600 m² site in Cape Town. Include a double garage, open-plan kitchen and living area, home office, guest bedroom downstairs, three bedrooms upstairs, a swimming pool and landscaped garden. Optimize the design for natural ventilation, daylight and reduced energy consumption.'
  );

  const [projectName, setProjectName] = useState<string>('Cape Town Coastal Eco-Villa');
  const [buildingType, setBuildingType] = useState<BuildingType>('Residential');
  const [style, setStyle] = useState<ArchitecturalStyle>('Biophilic Modern');
  const [jurisdiction, setJurisdiction] = useState<JurisdictionCode>('ZA');
  const [siteAreaM2, setSiteAreaM2] = useState<number>(600);
  const [floorsCount, setFloorsCount] = useState<number>(2);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const samplePrompts = [
    {
      label: 'Cape Town Coastal Villa',
      text: 'Design a contemporary 4-bedroom two-storey house on a 600 m² site in Cape Town. Include a double garage, open-plan kitchen and living area, home office, guest bedroom downstairs, three bedrooms upstairs, a swimming pool and landscaped garden. Optimize the design for natural ventilation, daylight and reduced energy consumption.',
      jurisdiction: 'ZA' as JurisdictionCode,
      type: 'Residential' as BuildingType,
      floors: 2,
    },
    {
      label: 'Nairobi Biophilic Innovation Hub',
      text: 'Design a 3-storey sustainable commercial tech hub in Westlands, Nairobi on a 1200 m² site. Include naturally ventilated atrium, open-plan co-working studios, executive boardrooms, and rooftop solar terrace.',
      jurisdiction: 'KE' as JurisdictionCode,
      type: 'Office' as BuildingType,
      floors: 3,
    },
    {
      label: 'Lagos Waterfront Creative Studio',
      text: 'Design a 2-storey contemporary creative design studio in Victoria Island, Lagos. Feature double-volume exhibition gallery, material library, meeting pods, and cross-ventilation catching coastal breezes.',
      jurisdiction: 'NG' as JurisdictionCode,
      type: 'Studio' as BuildingType,
      floors: 2,
    },
    {
      label: 'Kigali Green Community Clinic',
      text: 'Design a single-storey eco healthcare clinic in Kigali on an 800 m² site. Include 6 consultation rooms, pharmacy, recovery ward, central healing courtyard, and EDGE zero-energy passive cooling.',
      jurisdiction: 'RW' as JurisdictionCode,
      type: 'Healthcare' as BuildingType,
      floors: 1,
    },
  ];

  const handleCreate = async () => {
    setIsGenerating(true);
    try {
      await fetch('/api/ai/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'generate_plan',
          projectContext: {
            name: projectName,
            buildingType,
            style,
            jurisdiction,
            siteArea: siteAreaM2,
            floors: floorsCount,
          },
          userPrompt: prompt,
        }),
      });
    } catch {
      // Fallback
    }

    // Parametric BIM Generation
    const newProj = generateProjectFromPrompt(prompt, {
      name: projectName,
      buildingType,
      style,
      jurisdiction,
      siteArea: siteAreaM2,
      floors: floorsCount,
    });

    setIsGenerating(false);
    onProjectCreated(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#050505]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-[#222222] rounded-md w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#E0E0E0] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[#222222] bg-[#0A0A0A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2DD4BF] text-[#050505] rounded font-bold shadow-md shadow-[#2DD4BF]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Create New Architectural Project</h2>
              <p className="text-xs text-gray-400">
                Create a parametric 2D floor plan, 3D BIM model, and EDGE green building metrics from your brief.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded text-sm">
            Close
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Sample Prompts Pills */}
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block">
              Quick Inspiration Prompts
            </label>
            <div className="grid grid-cols-2 gap-2">
              {samplePrompts.map((sp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(sp.text);
                    setProjectName(sp.label);
                    setJurisdiction(sp.jurisdiction);
                    setBuildingType(sp.type);
                    setFloorsCount(sp.floors);
                  }}
                  className="p-2.5 rounded bg-[#141414] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#2DD4BF]/40 text-left transition"
                >
                  <strong className="text-xs text-[#2DD4BF] block">{sp.label}</strong>
                  <span className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{sp.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language Prompt */}
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block">
              Natural Language Architectural Brief
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-[#141414] border border-[#222222] rounded p-3.5 text-xs text-[#E0E0E0] focus:outline-none focus:border-[#2DD4BF] leading-relaxed resize-none"
              placeholder="Describe requirements: bedrooms, storeys, site area, orientation, sustainability goals..."
            />
          </div>

          {/* Structured Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#141414] border border-[#222222] rounded px-2.5 py-2 text-[#E0E0E0] text-xs focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Building Type</label>
              <select
                value={buildingType}
                onChange={(e) => setBuildingType(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#222222] rounded px-2.5 py-2 text-[#E0E0E0] text-xs focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="Residential">Residential Villa</option>
                <option value="Apartment">Multi-Unit Apartment</option>
                <option value="Office">Commercial Office</option>
                <option value="Hospitality">Eco Resort / Hotel</option>
                <option value="Healthcare">Health Clinic</option>
                <option value="Educational">School / Academy</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#222222] rounded px-2.5 py-2 text-[#E0E0E0] text-xs focus:outline-none focus:border-[#2DD4BF]"
              >
                <option value="Biophilic Modern">Biophilic Modern</option>
                <option value="Contemporary Tropical">Contemporary Tropical</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Scandinavian">Scandinavian Wood</option>
                <option value="Afro-Modern">Afro-Modern</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Jurisdiction Code</label>
              <select
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#222222] rounded px-2.5 py-2 text-[#2DD4BF] text-xs focus:outline-none focus:border-[#2DD4BF] font-medium"
              >
                {Object.values(JURISDICTIONS).map((j) => (
                  <option key={j.code} value={j.code}>
                    {j.name} ({j.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Site Area (m²)</label>
              <input
                type="number"
                value={siteAreaM2}
                onChange={(e) => setSiteAreaM2(parseFloat(e.target.value) || 500)}
                className="w-full bg-[#141414] border border-[#222222] rounded px-2.5 py-2 text-[#E0E0E0] text-xs font-mono focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-400 mb-1 block">Number of Storeys</label>
              <input
                type="number"
                min="1"
                max="6"
                value={floorsCount}
                onChange={(e) => setFloorsCount(parseInt(e.target.value) || 1)}
                className="w-full bg-[#141414] border border-[#222222] rounded px-2.5 py-2 text-[#E0E0E0] text-xs font-mono focus:outline-none focus:border-[#2DD4BF]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222222] bg-[#0A0A0A] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Leaf className="w-4 h-4 text-[#2DD4BF]" />
            <span>Automatic EDGE & Code Verification Active</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2DD4BF] hover:brightness-110 disabled:opacity-50 text-[#050505] font-bold text-xs rounded shadow-md shadow-[#2DD4BF]/20 transition active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Architectural BIM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Complete Building Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
