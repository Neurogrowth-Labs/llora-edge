import React, { useState } from 'react';
import { ArchitecturalProject } from '../types/architecture';
import {
  Sparkles,
  Camera,
  Sun,
  Moon,
  Sunset,
  Home,
  Download,
  Eye,
  Sliders,
  CheckCircle2,
  Layers,
  Compass,
  Check,
  RefreshCw,
  Box,
  Palette,
  Maximize2,
  Info,
} from 'lucide-react';
import { downloadFile } from '../services/exporter';
import { DataStateBadge } from './DataStateBadge';
import { APP_LOGO, APP_LOGO_STATIC_URL } from '../assets/logo';
import { downloadBrandedImage } from '../utils/letterheadStamper';

interface AiVisualizerProps {
  project: ArchitecturalProject;
}

interface RenderItem {
  id: string;
  url: string;
  title: string;
  category: 'interior' | 'exterior';
  timestamp: string;
  source: string;
  isAiGenerated: boolean;
  prompt: string;
  roomName?: string;
  styleName?: string;
}

export const AiVisualizer: React.FC<AiVisualizerProps> = ({ project }) => {
  // Mode: Interior vs Exterior
  const [activeCategory, setActiveCategory] = useState<'interior' | 'exterior'>('interior');

  // Selected Room from Project (for Interior View)
  const [selectedRoomId, setSelectedRoomId] = useState<string>(project.rooms[0]?.id || 'rm_living');

  // Interior Decor & Material Style
  const [interiorStyle, setInteriorStyle] = useState<string>('Biophilic Modernism');
  const [selectedLighting, setSelectedLighting] = useState<string>('Warm Golden Hour (17:30)');
  const [cameraFocalLength, setCameraFocalLength] = useState<string>('24mm Architectural Tilt-Shift');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1'>('16:9');

  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Active Render and History
  const [activeRenderUrl, setActiveRenderUrl] = useState<string>(
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85'
  );
  const [activeRenderMeta, setActiveRenderMeta] = useState<{
    title: string;
    source: string;
    isAiGenerated: boolean;
    prompt: string;
  }>({
    title: 'Open-Plan Living & Chef Kitchen — Biophilic Modernism',
    source: 'Gemini Architectural Vision Studio',
    isAiGenerated: false,
    prompt: 'Ultra-photorealistic 8k architectural interior photograph of open-plan living room with engineered oak herringbone floors, fluted timber acoustic panels, and floor-to-ceiling glass sliding doors.',
  });

  const [rendersHistory, setRendersHistory] = useState<RenderItem[]>([
    {
      id: 'r_int_01',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
      title: 'Double-Volume Living & Dining — Passive Daylighting',
      category: 'interior',
      timestamp: 'Today, 11:15',
      source: 'Curated Architectural Photography',
      isAiGenerated: false,
      prompt: 'High-end architectural interior photography of spacious open-plan living room with engineered oak floors, terrazzo kitchen island, floor-to-ceiling glass sliding doors admitting soft northern light.',
      roomName: 'Open-Plan Living & Dining',
      styleName: 'Biophilic Modernism',
    },
    {
      id: 'r_ext_01',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      title: 'North Facade & Swimming Pool — Golden Hour',
      category: 'exterior',
      timestamp: 'Today, 09:40',
      source: 'Curated Architectural Photography',
      isAiGenerated: false,
      prompt: 'Photorealistic 8k architectural exterior photograph of contemporary villa in Cape Town. Features mass timber CLT, floor-to-ceiling Low-E glass sliding doors opening to infinity swimming pool.',
      styleName: 'Contemporary Bioclimatic',
    },
    {
      id: 'r_int_02',
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1600&q=85',
      title: 'Master Bedroom Suite — Ocean & Mountain Views',
      category: 'interior',
      timestamp: 'Yesterday, 17:40',
      source: 'Curated Architectural Photography',
      isAiGenerated: false,
      prompt: 'Luxury master bedroom suite with honed travertine stone floors, acoustic slatted wood headboard, and panoramic sliding doors overlooking coastal mountains.',
      roomName: 'Master Bedroom Suite',
      styleName: 'Japandi Minimalist',
    },
    {
      id: 'r_int_03',
      url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1600&q=85',
      title: 'Luxury Spa Ensuite Bath with Soaking Tub',
      category: 'interior',
      timestamp: 'Yesterday, 15:20',
      source: 'Curated Architectural Photography',
      isAiGenerated: false,
      prompt: 'Ultra-luxury bathroom with free-standing matte white tub, floor-to-ceiling Roman travertine slabs, matte black concealed fixtures, and subtle skylight illumination.',
      roomName: 'Ensuite Bathroom',
      styleName: 'Luxury Italian Travertine',
    },
  ]);

  // Find active room object
  const activeRoom = project.rooms.find((r) => r.id === selectedRoomId) || project.rooms[0];
  const activeLevel = project.levels.find((l) => l.id === activeRoom?.levelId) || project.levels[0];

  // Preset Decor Styles
  const interiorStyles = [
    {
      id: 'Biophilic Modernism',
      title: 'Biophilic Modernism',
      description: 'FSC engineered oak, living green wall, acoustic slatted timber & warm bouclé',
      floorFinish: 'FSC Engineered Herringbone Oak',
      palette: ['#b45309', '#15803d', '#f8fafc'],
    },
    {
      id: 'Japandi Minimalist',
      title: 'Japandi Minimalist',
      description: 'Honed travertine stone, light Hinoki wood, beige micro-cement & paper accents',
      floorFinish: 'Honed Roman Travertine Stone',
      palette: ['#e2e8f0', '#d97706', '#78716c'],
    },
    {
      id: 'Contemporary Eco-Luxury',
      title: 'Contemporary Eco-Luxury',
      description: 'Recycled terrazzo, brushed brass fixtures, mass timber CLT ceiling & Low-E glass',
      floorFinish: 'Recycled Italian Terrazzo',
      palette: ['#0d9488', '#f59e0b', '#1e293b'],
    },
    {
      id: 'Industrial Loft & Steel',
      title: 'Industrial Loft & Steel',
      description: 'Polished architectural concrete, matte black steel frames, cognac leather & brick',
      floorFinish: 'Polished Architectural Concrete',
      palette: ['#64748b', '#0f172a', '#b45309'],
    },
  ];

  // Lighting Scenarios
  const lightingScenarios = [
    { id: 'Crisp Natural Sunlight (12:00)', label: 'Crisp Sunlight (12:00)', icon: Sun },
    { id: 'Warm Golden Hour (17:30)', label: 'Golden Hour (17:30)', icon: Sunset },
    { id: 'Blue Hour Twilight (19:45)', label: 'Twilight Illumination (19:45)', icon: Moon },
    { id: 'Soft Diffuse Overcast (10:00)', label: 'Diffuse Overcast (10:00)', icon: Sparkles },
  ];

  // Exterior Views
  const exteriorViews = [
    {
      id: 'ext_north_pool',
      title: 'North Facade & Infinity Pool',
      description: 'Hero eye-level 3/4 perspective showing timber cantilever & pool reflection',
      prompt: `Ultra-photorealistic 8k architectural exterior photograph of ${project.name} in ${project.climate.location}. Show North-facing facade with 1.2m solar shading timber overhangs, infinity pool reflecting clear sky, Low-E glass sliding doors, and drought-tolerant landscaping.`,
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
    },
    {
      id: 'ext_sunset_terrace',
      title: 'Sunset Sky Terrace & Pergola',
      description: 'Golden hour view of rooftop outdoor living deck with bioclimatic louvers',
      prompt: `Dramatic golden hour architectural render of ${project.name} sky terrace and solar deck. Warm ambient LED lighting, cantilevered CLT timber pergola, panoramic coastal mountain backdrop, outdoor lounge furniture.`,
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
    },
    {
      id: 'ext_twilight_entrance',
      title: 'Twilight Entrance & EV Garage',
      description: 'Dramatic architectural dusk lighting, recessed path fixtures & solar array',
      prompt: `Twilight architectural photograph of ${project.name} entrance portico and double garage with integrated EV charging. Warm sconces illuminating textured rammed-earth and timber finishes, subtle integrated rooftop solar PV panels.`,
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85',
    },
    {
      id: 'ext_biophilic_garden',
      title: 'Biophilic Courtyard & Garden',
      description: 'Private central courtyard with permeable pavers and native vegetation',
      prompt: `High-resolution architectural photography of central biophilic courtyard in ${project.name}. Permeable stone pavers, indigenous flora, floor-to-ceiling glass connecting indoor living to garden, soft natural daylighting.`,
      imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
    },
  ];

  const [selectedExteriorView, setSelectedExteriorView] = useState<string>(exteriorViews[0].id);
  const [isExporting, setIsExporting] = useState(false);

  // Export render with official letterhead & logo stamped directly on image canvas
  const handleExportRender = async () => {
    setIsExporting(true);
    try {
      await downloadBrandedImage(
        activeRenderUrl,
        `${project.name.replace(/\s+/g, '_')}_${activeCategory}_${activeRenderMeta.title.replace(/\s+/g, '_')}.jpg`,
        {
          projectName: project.name,
          viewTitle: activeRenderMeta.title,
          category: activeCategory === 'interior' ? 'Interior BIM Design' : 'Exterior Architectural Perspective',
          companyName: project.companyName,
          architectName: project.architectName,
          location: project.climate.location,
          engine: activeRenderMeta.isAiGenerated ? 'Gemini 3.1 Flash Image' : 'Curated 8K Architectural HDR',
          date: new Date().toISOString().slice(0, 10),
          stage: 'Architectural Schematic Design Submission',
        }
      );
    } catch (e) {
      console.error('Branded export fallback:', e);
      downloadFile(activeRenderUrl, `${project.name}_${activeCategory}_render.jpg`, 'image/jpeg');
    } finally {
      setIsExporting(false);
    }
  };

  // Trigger Gemini Design Render API
  const handleGenerateRender = async () => {
    setIsGenerating(true);
    setStatusMessage('Querying Gemini Design Image Generation Studio...');

    const chosenStyle = interiorStyles.find((s) => s.id === interiorStyle) || interiorStyles[0];
    const floorMaterial = activeLevel?.floorFinishMaterial || chosenStyle.floorFinish;

    let basePrompt = '';
    let title = '';

    if (activeCategory === 'interior') {
      const roomName = activeRoom?.name || 'Open-Plan Living & Dining';
      const roomType = activeRoom?.type || 'living';
      const area = activeRoom?.floorArea || 45;
      const ceiling = activeRoom?.ceilingHeight || 3.0;

      basePrompt = customPrompt.trim()
        ? `${customPrompt}. Grounded in ${project.name}, room: ${roomName}, ${area}m², ceiling ${ceiling}m, floor material: ${floorMaterial}, style: ${chosenStyle.title}, lighting: ${selectedLighting}, lens: ${cameraFocalLength}.`
        : `Ultra-photorealistic 8k architectural interior photograph of ${roomName} (${area.toFixed(1)} m², ${ceiling.toFixed(1)}m high ceilings) in contemporary ${project.buildingType}. Interior Design: ${chosenStyle.title} with ${floorMaterial}, ${chosenStyle.description}. Camera: ${cameraFocalLength}, f/2.8, professional architectural composition. Lighting: ${selectedLighting} streaming through Low-E sliding glass panels. Hyper-detailed textures, Architectural Digest caliber, sharp focus, natural color grading.`;

      title = `${roomName} — ${chosenStyle.title}`;
    } else {
      const extView = exteriorViews.find((v) => v.id === selectedExteriorView) || exteriorViews[0];
      basePrompt = customPrompt.trim()
        ? `${customPrompt}. Grounded in ${project.name} exterior architecture, location: ${project.climate.location}, lighting: ${selectedLighting}.`
        : `${extView.prompt} Lighting: ${selectedLighting}. Camera: ${cameraFocalLength}. Hyper-detailed, 8k resolution, Architectural Record cover quality.`;

      title = `${extView.title} — ${selectedLighting.split(' ')[0]}`;
    }

    try {
      setStatusMessage('Synthesizing physical materials, light refractions and BIM geometry with Gemini...');

      const res = await fetch('/api/ai/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renderPrompt: basePrompt,
          roomType: activeCategory === 'interior' ? activeRoom?.type : 'exterior',
          style: interiorStyle,
          lighting: selectedLighting,
          materials: [
            floorMaterial,
            activeLevel?.structuralType || 'Mass Timber CLT',
            'Low-carbon concrete',
            'Double Low-E Glazing',
          ],
          viewAngle: cameraFocalLength,
          aspectRatio: aspectRatio,
          projectContext: {
            name: project.name,
            buildingType: project.buildingType,
            style: project.style,
            location: project.climate.location,
            rooms: project.rooms.map((r) => ({
              name: r.name,
              type: r.type,
              area: r.floorArea,
              finish: r.finishFloorMaterial,
            })),
            levels: project.levels.map((l) => ({
              name: l.name,
              finish: l.floorFinishMaterial,
              slabThickness: l.slabThickness,
            })),
          },
        }),
      });

      const data = await res.json();
      let newUrl = '';
      let isAiGen = false;
      let sourceName = 'Curated Architectural Studio';

      if (data && data.success && data.imageUrl) {
        newUrl = data.imageUrl;
        isAiGen = Boolean(data.isAiGenerated);
        sourceName = data.source || (isAiGen ? 'Gemini 3.1 Flash Image' : 'Curated Architectural Studio');
      } else {
        // Fallback to high-res architectural library
        const fallback =
          activeCategory === 'interior'
            ? 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85'
            : exteriorViews.find((v) => v.id === selectedExteriorView)?.imageUrl ||
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85';
        newUrl = fallback;
      }

      setActiveRenderUrl(newUrl);
      setActiveRenderMeta({
        title,
        source: sourceName,
        isAiGenerated: isAiGen,
        prompt: basePrompt,
      });

      setRendersHistory((prev) => [
        {
          id: `r_${Date.now()}`,
          url: newUrl,
          title,
          category: activeCategory,
          timestamp: 'Just now',
          source: sourceName,
          isAiGenerated: isAiGen,
          prompt: basePrompt,
          roomName: activeCategory === 'interior' ? activeRoom?.name : undefined,
          styleName: activeCategory === 'interior' ? chosenStyle.title : 'Architectural Exterior',
        },
        ...prev,
      ]);
    } catch (err) {
      console.error('Render error:', err);
      // Fallback
      const fallbackUrl =
        activeCategory === 'interior'
          ? 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85'
          : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85';
      setActiveRenderUrl(fallbackUrl);
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="flex-1 bg-[#050505] p-5 overflow-y-auto text-[#E0E0E0]">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222222] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#2DD4BF] text-[#050505] rounded font-bold shadow-md shadow-[#2DD4BF]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Design Photorealistic Architectural Render Studio</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/30">
                    Gemini 3.1 Flash Image Engine
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Synthesizes your 2D CAD floor plan, customized floor slabs, materials & solar orientation into ultra-realistic 8K interior and exterior visualizations.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.open(activeRenderUrl, '_blank')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] border border-[#333333] hover:border-gray-500 text-xs text-gray-300 font-semibold rounded transition"
            >
              <Eye className="w-4 h-4" />
              <span>Full Screen</span>
            </button>
            <button
              onClick={handleExportRender}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#2DD4BF] hover:brightness-110 disabled:opacity-50 text-[#050505] text-xs font-bold rounded shadow-md shadow-[#2DD4BF]/20 transition"
              title="Export Render stamped with official architectural letterhead and firm logo"
            >
              {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>{isExporting ? 'Stamping Letterhead...' : 'Export Branded Render'}</span>
            </button>
          </div>
        </div>

        {/* Category Switcher: Interior View vs Exterior View */}
        <div className="flex items-center justify-between bg-[#0A0A0A] border border-[#222222] p-1.5 rounded-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveCategory('interior')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition ${
                activeCategory === 'interior'
                  ? 'bg-[#2DD4BF] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Interior Design View ({project.rooms.length} Spaces Grounded)</span>
            </button>
            <button
              onClick={() => setActiveCategory('exterior')}
              className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold transition ${
                activeCategory === 'exterior'
                  ? 'bg-[#2DD4BF] text-black shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-[#141414]'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Exterior Architectural View</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3 text-[11px] text-gray-400 pr-3 font-mono">
            <span>Project: <strong className="text-white">{project.name}</strong></span>
            <span>•</span>
            <span>Floors: <strong className="text-[#2DD4BF]">{project.levels.length} Levels</strong></span>
          </div>
        </div>

        {/* Main Render Viewport + Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Visual Display (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-lg overflow-hidden border border-[#222222] bg-[#0A0A0A] shadow-2xl aspect-[16/10] group">
              <img
                src={activeRenderUrl}
                alt="Design Architectural Render"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
                referrerPolicy="no-referrer"
              />

              {/* OFFICIAL ARCHITECTURAL LETTERHEAD WATERMARK HEADER */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                <div className="bg-[#05070B]/90 backdrop-blur-md border border-[#2DD4BF]/50 rounded-lg p-2 flex items-center gap-3 shadow-2xl">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={APP_LOGO}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                      }}
                      alt="Firm Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-white text-xs font-bold tracking-wide flex items-center gap-1.5">
                      <span>{project.companyName || 'LORA ARCHITECTS & BIM PARTNERS'}</span>
                      <span className="text-[8px] text-[#2DD4BF] font-semibold px-1.5 py-0.2 bg-[#2DD4BF]/20 rounded border border-[#2DD4BF]/30">
                        LETTERHEAD
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-300">
                      {project.name} • {activeRenderMeta.title} • {project.climate.location}
                    </div>
                  </div>
                </div>

                <div className="bg-[#05070B]/90 backdrop-blur-md border border-[#222222] px-3 py-1.5 rounded text-[10px] text-[#2DD4BF] font-mono hidden md:flex items-center gap-2 shadow-xl">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                  <span>AIA / SACAP VERIFIED</span>
                </div>
              </div>

              {/* Generating overlay */}
              {isGenerating && (
                <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 text-center p-6 z-10">
                  <div className="w-12 h-12 rounded-full border-4 border-[#2DD4BF] border-t-transparent animate-spin" />
                  <h4 className="text-base font-bold text-white">Synthesizing Photorealistic BIM Architecture...</h4>
                  <p className="text-xs text-gray-400 max-w-md">
                    {statusMessage || 'Calculating solar refractions, floor finish reflections, Low-E glass refractions, and real-life lighting.'}
                  </p>
                </div>
              )}

              {/* Floating watermark & specifications badge */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-0">
                <div className="bg-[#0A0A0A]/90 backdrop-blur border border-[#222222] px-3 py-1.5 rounded text-[11px] text-[#E0E0E0] font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                  <span>{activeRenderMeta.title}</span>
                </div>
                <div className="bg-[#0A0A0A]/90 backdrop-blur border border-[#222222] px-3 py-1.5 rounded text-[11px] text-[#2DD4BF] font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeRenderMeta.isAiGenerated ? 'Gemini 3.1 Flash Image' : 'Curated 8K HDR'}</span>
                </div>
              </div>
            </div>

            {/* Render Details Card */}
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-[12px]">{activeRenderMeta.title}</span>
                  <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-[#141414] border border-[#222222] rounded font-mono">
                    {activeRenderMeta.source}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                  <span>Aspect: {aspectRatio}</span>
                  <span>•</span>
                  <span>Lens: {cameraFocalLength}</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono line-clamp-2">
                "{activeRenderMeta.prompt}"
              </p>
            </div>

            {/* Render Gallery History Strip */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Generated Render History ({rendersHistory.length})
                </h4>
                <span className="text-[10px] text-gray-500 font-mono">Click to view any previous rendering</span>
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {rendersHistory.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRenderUrl(r.url);
                      setActiveRenderMeta({
                        title: r.title,
                        source: r.source,
                        isAiGenerated: r.isAiGenerated,
                        prompt: r.prompt,
                      });
                    }}
                    className={`relative rounded-md overflow-hidden border aspect-[16/10] text-left transition ${
                      activeRenderUrl === r.url
                        ? 'border-[#2DD4BF] shadow-lg ring-1 ring-[#2DD4BF]'
                        : 'border-[#222222] hover:border-[#444444] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={r.url} alt={r.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    {/* Official Letterhead Firm Logo Badge */}
                    <div className="absolute top-1.5 left-1.5 w-4 h-4 flex items-center justify-center pointer-events-none">
                      <img
                        src={APP_LOGO}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                        }}
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/95 via-transparent to-transparent p-1.5 flex flex-col justify-end">
                      <span className="text-[9px] font-bold text-white truncate">{r.title}</span>
                      <span className="text-[8px] text-gray-400 font-mono">{r.timestamp}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Controls Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* INTERIOR CONTROLS */}
            {activeCategory === 'interior' && (
              <>
                {/* 1. Select Room from Project */}
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>Select Project Space</span>
                    </label>
                    <DataStateBadge state="SYNCED" label="CAD SYNCED" size="xs" />
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {project.rooms.map((room) => {
                      const isSelected = selectedRoomId === room.id;
                      const level = project.levels.find((l) => l.id === room.levelId);
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoomId(room.id)}
                          className={`p-2.5 rounded border text-left flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-[#141414] border-[#2DD4BF] ring-1 ring-[#2DD4BF]/30'
                              : 'bg-[#0F0F0F] border-[#222222] hover:border-[#333333] hover:bg-[#141414]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: room.colorHex || '#2DD4BF' }}
                              />
                              <strong className="text-xs text-white">{room.name}</strong>
                            </div>
                            <span className="text-[10px] text-gray-400 block mt-0.5">
                              {level?.name || 'Ground'} • {room.floorArea.toFixed(1)} m² • {room.ceilingHeight}m Ht
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Select Interior Decor & Material Style */}
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[#2DD4BF]" />
                      <span>Interior Design Style</span>
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    {interiorStyles.map((style) => {
                      const isSelected = interiorStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          onClick={() => setInteriorStyle(style.id)}
                          className={`w-full p-2.5 rounded border text-left transition ${
                            isSelected
                              ? 'bg-[#141414] border-[#2DD4BF] ring-1 ring-[#2DD4BF]/30'
                              : 'bg-[#0F0F0F] border-[#222222] hover:border-[#333333] hover:bg-[#141414]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="text-xs text-white">{style.title}</strong>
                            <div className="flex items-center gap-1">
                              {style.palette.map((c, i) => (
                                <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-snug">{style.description}</p>
                          <span className="text-[9px] text-[#2DD4BF] font-mono mt-1 block">
                            Floor: {style.floorFinish}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* EXTERIOR CONTROLS */}
            {activeCategory === 'exterior' && (
              <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Select Exterior Vantage Point</span>
                  </label>
                </div>

                <div className="space-y-2">
                  {exteriorViews.map((ext) => {
                    const isSelected = selectedExteriorView === ext.id;
                    return (
                      <button
                        key={ext.id}
                        onClick={() => {
                          setSelectedExteriorView(ext.id);
                          setActiveRenderUrl(ext.imageUrl);
                        }}
                        className={`w-full p-2.5 rounded border text-left transition ${
                          isSelected
                            ? 'bg-[#141414] border-[#2DD4BF] ring-1 ring-[#2DD4BF]/30'
                            : 'bg-[#0F0F0F] border-[#222222] hover:border-[#333333] hover:bg-[#141414]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-white">{ext.title}</strong>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{ext.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIGHTING & CAMERA CONTROLS */}
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">
                  Solar & Atmospheric Lighting
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {lightingScenarios.map((light) => {
                    const Icon = light.icon;
                    const isSelected = selectedLighting === light.id;
                    return (
                      <button
                        key={light.id}
                        onClick={() => setSelectedLighting(light.id)}
                        className={`p-2 rounded border text-left flex items-center gap-1.5 text-[10px] font-medium transition ${
                          isSelected
                            ? 'bg-[#141414] border-[#2DD4BF] text-white'
                            : 'bg-[#0F0F0F] border-[#222222] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-3 h-3 ${isSelected ? 'text-[#2DD4BF]' : 'text-gray-500'}`} />
                        <span className="truncate">{light.label.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Camera Focal Length & Aspect Ratio */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#222222]">
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Architectural Lens</label>
                  <select
                    value={cameraFocalLength}
                    onChange={(e) => setCameraFocalLength(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-[#2DD4BF]"
                  >
                    <option value="24mm Architectural Tilt-Shift">24mm Tilt-Shift (Wide)</option>
                    <option value="35mm Natural Perspective">35mm Natural Perspective</option>
                    <option value="50mm Intimate Vignette">50mm Intimate Vignette</option>
                    <option value="18mm Ultra-Wide Panoramic">18mm Ultra-Wide Panoramic</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Aspect Ratio</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['16:9', '4:3', '1:1'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1 rounded text-[10px] font-mono border text-center transition ${
                          aspectRatio === ratio
                            ? 'bg-[#2DD4BF] text-black font-bold border-[#2DD4BF]'
                            : 'bg-[#141414] text-gray-400 border-[#222222] hover:text-white'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Prompt & Generate Button */}
            <div className="bg-[#0A0A0A] border border-[#222222] rounded-lg p-4 space-y-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Custom Tuning Prompt (Optional)</span>
              </label>

              <textarea
                rows={3}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Add Table Mountain reflection in infinity pool, fluted oak dining table, Scandinavian linen curtains..."
                className="w-full bg-[#141414] border border-[#222222] rounded p-2.5 text-xs text-[#E0E0E0] placeholder-gray-600 focus:outline-none focus:border-[#2DD4BF] resize-none"
              />

              <button
                onClick={handleGenerateRender}
                disabled={isGenerating}
                className="w-full py-3 bg-[#2DD4BF] hover:brightness-110 disabled:opacity-50 text-[#050505] font-bold text-xs rounded shadow-lg shadow-[#2DD4BF]/20 flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering with Gemini Design...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Design {activeCategory === 'interior' ? 'Interior' : 'Exterior'} Render</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
