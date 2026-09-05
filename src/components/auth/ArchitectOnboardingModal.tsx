import React, { useState } from 'react';
import { ArchitectProfile } from '../../types/auth';
import { APP_LOGO, APP_LOGO_STATIC_URL, BRAND_NAME } from '../../assets/logo';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Layers,
  Leaf,
  Sliders,
  Compass,
  Building2,
  Home,
  Hotel,
  Activity,
  GraduationCap,
  Landmark,
  Factory,
  Trees,
  Box,
  Cpu,
  Zap,
  Globe,
  Award,
} from 'lucide-react';

interface ArchitectOnboardingModalProps {
  initialProfile: ArchitectProfile;
  onComplete: (updatedProfile: ArchitectProfile) => void;
  onCancel?: () => void;
}

export const ArchitectOnboardingModal: React.FC<ArchitectOnboardingModalProps> = ({
  initialProfile,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 10;

  // Form calibration state
  const [studioName, setStudioName] = useState(initialProfile.studioName || 'LORA ARCHITECTURAL & BIM STUDIO');
  const [roles, setRoles] = useState<string[]>(initialProfile.roles || ['Architect']);
  const [disciplines, setDisciplines] = useState<string[]>(
    initialProfile.disciplines || ['Residential', 'Sustainable Architecture']
  );
  const [experienceLevel, setExperienceLevel] = useState<ArchitectProfile['experienceLevel']>(
    initialProfile.experienceLevel || 'professional'
  );
  const [priorities, setPriorities] = useState<string[]>(
    initialProfile.designPriorities || ['Sustainability', 'Energy efficiency', 'Passive design', 'AI-assisted design']
  );
  const [tools, setTools] = useState<string[]>(
    initialProfile.tools || ['Revit', 'Rhino', 'AutoCAD']
  );
  const [sustainabilityLevel, setSustainabilityLevel] = useState<ArchitectProfile['sustainabilityLevel']>(
    initialProfile.sustainabilityLevel || 'advanced'
  );
  const [climateRegion, setClimateRegion] = useState(
    initialProfile.climateRegion || 'Temperate Oceanic (Cfb)'
  );
  const [firstProject, setFirstProject] = useState(
    initialProfile.firstProjectType || 'Residential'
  );
  const [aiPrefs, setAiPrefs] = useState({
    creativity: initialProfile.aiPreferences?.creativity ?? 45,
    guidance: initialProfile.aiPreferences?.guidance ?? 65,
    sustainability: initialProfile.aiPreferences?.sustainability ?? 90,
    costAwareness: initialProfile.aiPreferences?.costAwareness ?? 60,
  });

  // Toggle helpers
  const toggleArrayItem = (list: string[], item: string, max?: number) => {
    if (list.includes(item)) {
      return list.filter((i) => i !== item);
    } else {
      if (max && list.length >= max) {
        return [...list.slice(1), item];
      }
      return [...list, item];
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    const finalProfile: ArchitectProfile = {
      ...initialProfile,
      studioName,
      roles,
      disciplines,
      experienceLevel,
      designPriorities: priorities,
      tools,
      sustainabilityLevel,
      climateRegion,
      firstProjectType: firstProject,
      aiPreferences: aiPrefs,
      isLoggedIn: true,
    };
    onComplete(finalProfile);
  };

  // Curated architectural imagery for Design Disciplines (Step 3)
  const DISCIPLINE_TILES = [
    {
      id: 'Residential',
      title: 'Residential',
      desc: 'Single-family, multi-unit villas, eco-penthouses',
      img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Commercial',
      title: 'Commercial',
      desc: 'Headquarters, high-rises, agile workplace hubs',
      img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Hospitality',
      title: 'Hospitality',
      desc: 'Boutique eco-resorts, wellness pavilions, hotels',
      img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Healthcare',
      title: 'Healthcare',
      desc: 'Biophilic clinics, healing gardens, medical centers',
      img: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Education',
      title: 'Education',
      desc: 'University faculties, libraries, research campuses',
      img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Civic / Public',
      title: 'Civic / Public',
      desc: 'Museums, performance centers, civic halls',
      img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Urban Planning',
      title: 'Urban Planning',
      desc: 'Master plans, transit districts, walkable eco-cities',
      img: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Interior',
      title: 'Interior',
      desc: 'High-end residential, acoustic detailing, materials',
      img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'Sustainable Architecture',
      title: 'Sustainable Architecture',
      desc: 'Net-zero carbon, mass timber, passive passivhaus',
      img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#030508]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 md:p-10 font-sans text-[#E2E8F0] select-none overflow-y-auto">
      {/* ========================================================================= */}
      {/* TOP HEADER: LOGO, STEP NUMBER (e.g. 03 / 10), AND CLOSE/CANCEL             */}
      {/* ========================================================================= */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center">
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
            <span className="text-xs font-bold tracking-widest text-white uppercase block">
              {BRAND_NAME}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">
              STUDIO CALIBRATION SYSTEM
            </span>
          </div>
        </div>

        {/* Center Progress Track */}
        <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 === step
                  ? 'w-6 bg-[#2DD4BF]'
                  : i + 1 < step
                  ? 'w-2 bg-[#2DD4BF]/40'
                  : 'w-2 bg-[#1E293B]'
              }`}
            />
          ))}
        </div>

        {/* Step Counter Indicator */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-[#0A0E17] border border-[#1E293B] rounded text-xs font-mono text-[#2DD4BF] font-bold">
            {step < 10 ? `0${step}` : step} / {totalSteps < 10 ? `0${totalSteps}` : totalSteps}
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-xs font-mono text-gray-400 hover:text-white px-2 py-1 transition"
            >
              Exit Setup
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MAIN STEP CONTENT AREA                                                    */}
      {/* ========================================================================= */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8">
        {/* STEP 01 — Welcome */}
        {step === 1 && (
          <div className="text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <img
                src={APP_LOGO}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                }}
                alt="Studio Core"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-mono">
                <Sparkles className="w-3 h-3" />
                <span>WORKSPACE INITIALIZATION</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Let's build your studio.
              </h1>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg mx-auto">
                We'll configure your workspace around the way you design, build, and collaborate — synthesizing your design philosophy with real-time BIM and AI models.
              </p>
            </div>

            <div className="pt-4 max-w-sm mx-auto">
              <label className="block text-left text-xs font-mono text-gray-400 mb-1.5 uppercase font-semibold">
                Studio or Architectural Practice Name
              </label>
              <input
                type="text"
                value={studioName}
                onChange={(e) => setStudioName(e.target.value)}
                placeholder="e.g. LORA ARCHITECTS & BIM PARTNERS"
                className="w-full h-11 px-3.5 bg-[#0A0E17] border border-[#1E293B] focus:border-[#2DD4BF] rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#2DD4BF] transition shadow-inner font-mono text-center"
              />
            </div>
          </div>
        )}

        {/* STEP 02 — Professional Identity */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What best describes you?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Choose the architectural roles that define your daily practice (multiple selections allowed).
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto pt-2">
              {[
                'Architect',
                'Architectural Designer',
                'Interior Architect',
                'Urban Designer',
                'Landscape Architect',
                'Architectural Technologist',
                'Structural Engineer',
                'Real Estate Developer',
                'Architecture Student',
                'Other Specialist',
              ].map((role) => {
                const isSelected = roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setRoles(toggleArrayItem(roles, role))}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between h-24 transition group ${
                      isSelected
                        ? 'bg-[#2DD4BF]/15 border-[#2DD4BF] text-white shadow-lg shadow-[#2DD4BF]/10'
                        : 'bg-[#0A0E17] border-[#1E293B] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="w-2 h-2 rounded-full bg-gray-500 group-hover:bg-[#2DD4BF] transition" />
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                    </div>
                    <span className="text-xs font-semibold leading-tight">{role}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 03 — Design Discipline */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What do you design?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Choose your primary disciplines to calibrate template geometries, daylighting physics, and codes.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-4xl mx-auto pt-2 max-h-[55vh] overflow-y-auto pr-1">
              {DISCIPLINE_TILES.map((tile) => {
                const isSelected = disciplines.includes(tile.id);
                return (
                  <div
                    key={tile.id}
                    onClick={() => setDisciplines(toggleArrayItem(disciplines, tile.id))}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer group h-36 transition-all ${
                      isSelected
                        ? 'border-[#2DD4BF] ring-2 ring-[#2DD4BF]/30 shadow-xl'
                        : 'border-[#1E293B] hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={tile.img}
                      alt={tile.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-75 contrast-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070B] via-[#05070B]/50 to-transparent" />

                    <div className="absolute top-2.5 right-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition ${
                          isSelected ? 'bg-[#2DD4BF] text-[#050505] font-bold' : 'bg-black/50 border border-white/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5">
                      <span className="text-xs font-bold text-white block">{tile.title}</span>
                      <span className="text-[10px] text-gray-300 line-clamp-1">{tile.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 04 — Experience Level */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Where are you in your architectural journey?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Calibrates how technical, automated, or prescriptive the AI assistance is across your sheets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-4">
              {[
                {
                  id: 'emerging',
                  title: 'Emerging',
                  subtitle: '0–3 years',
                  desc: 'Building foundational portfolio, licensing preparation, high curiosity.',
                },
                {
                  id: 'professional',
                  title: 'Professional',
                  subtitle: '4–10 years',
                  desc: 'Project architect, coordinating consultants, rigorous technical execution.',
                },
                {
                  id: 'senior',
                  title: 'Senior',
                  subtitle: '10+ years',
                  desc: 'Principal designer, client presentations, high-level masterplanning.',
                },
                {
                  id: 'practice',
                  title: 'Studio / Practice',
                  subtitle: 'Multidisciplinary',
                  desc: 'Full firm coordination, standard office templates, multi-license scaling.',
                },
              ].map((lvl) => {
                const isSelected = experienceLevel === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => setExperienceLevel(lvl.id as any)}
                    className={`p-5 rounded-xl border cursor-pointer flex flex-col justify-between h-44 transition ${
                      isSelected
                        ? 'bg-[#2DD4BF]/15 border-[#2DD4BF] text-white shadow-xl shadow-[#2DD4BF]/10'
                        : 'bg-[#0A0E17] border-[#1E293B] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{lvl.title}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#2DD4BF]" />}
                      </div>
                      <span className="text-[11px] font-mono text-[#2DD4BF] block mb-2">{lvl.subtitle}</span>
                      <p className="text-xs text-gray-400 leading-relaxed">{lvl.desc}</p>
                    </div>
                    <div className="w-full bg-[#1A2333] h-1 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          lvl.id === 'emerging'
                            ? 'w-1/4 bg-[#2DD4BF]'
                            : lvl.id === 'professional'
                            ? 'w-2/4 bg-[#2DD4BF]'
                            : lvl.id === 'senior'
                            ? 'w-3/4 bg-[#2DD4BF]'
                            : 'w-full bg-[#2DD4BF]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 05 — Design Priorities */}
        {step === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What matters most in your architecture?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Select 3–5 core design priorities to prioritize in your AI copilot and sustainability scorecards.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 max-w-3xl mx-auto justify-center pt-3">
              {[
                'Sustainability',
                'Energy efficiency',
                'Material innovation',
                'Cost optimization',
                'Constructability',
                'Aesthetics',
                'Functionality',
                'Urban context',
                'Passive design',
                'Biophilic design',
                'Climate resilience',
                'Accessibility',
                'Parametric design',
                'AI-assisted design',
              ].map((p) => {
                const isSelected = priorities.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriorities(toggleArrayItem(priorities, p, 5))}
                    className={`px-4 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition ${
                      isSelected
                        ? 'bg-[#2DD4BF] text-[#050505] border-[#2DD4BF] font-bold shadow-md shadow-[#2DD4BF]/20'
                        : 'bg-[#0A0E17] text-gray-300 border-[#1E293B] hover:border-gray-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{p}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-center text-xs font-mono text-gray-400">
              Selected: <span className="text-[#2DD4BF] font-bold">{priorities.length}</span> / 5 priorities
            </div>
          </div>
        )}

        {/* STEP 06 — Your Tools */}
        {step === 6 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How do you currently design?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Select the software ecosystems you frequently export to or import from.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-3xl mx-auto pt-3">
              {[
                { name: 'AutoCAD', ext: '.dwg / .dxf' },
                { name: 'Revit', ext: '.rvt / IFC' },
                { name: 'Archicad', ext: '.pln / IFC' },
                { name: 'Rhino', ext: '.3dm / NURBS' },
                { name: 'Grasshopper', ext: 'Algorithmic' },
                { name: 'SketchUp', ext: '.skp' },
                { name: 'Vectorworks', ext: '.vwx' },
                { name: 'Adobe Suite', ext: 'Ps / Ai / Id' },
                { name: 'Blender', ext: 'Cycles / OBJ' },
                { name: 'Other BIM', ext: 'OpenBIM' },
              ].map((tool) => {
                const isSelected = tools.includes(tool.name);
                return (
                  <button
                    key={tool.name}
                    type="button"
                    onClick={() => setTools(toggleArrayItem(tools, tool.name))}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between h-20 transition ${
                      isSelected
                        ? 'bg-[#2DD4BF]/15 border-[#2DD4BF] text-white shadow-lg'
                        : 'bg-[#0A0E17] border-[#1E293B] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{tool.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4BF]" />}
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">{tool.ext}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 07 — Sustainability Profile */}
        {step === 7 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How do you approach sustainable design?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Powers your baseline EDGE green ratings, solar simulations, and thermal envelope calculations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 max-w-3xl mx-auto pt-2">
              {[
                {
                  id: 'exploring',
                  title: 'Exploring',
                  desc: '“I’m beginning my sustainability journey.”',
                },
                {
                  id: 'practicing',
                  title: 'Practicing',
                  desc: '“I regularly integrate sustainable strategies.”',
                },
                {
                  id: 'advanced',
                  title: 'Advanced',
                  desc: '“Sustainability is central to my practice.”',
                },
                {
                  id: 'expert',
                  title: 'Expert',
                  desc: '“I specialize in sustainable net-zero architecture.”',
                },
              ].map((s) => {
                const isSelected = sustainabilityLevel === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSustainabilityLevel(s.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-32 transition ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-400 text-white shadow-lg'
                        : 'bg-[#0A0E17] border-[#1E293B] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{s.title}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-xs text-gray-300 italic">{s.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Climate / Region Dropdown */}
            <div className="max-w-md mx-auto pt-2">
              <label className="block text-xs font-mono text-gray-400 mb-1.5 uppercase font-semibold">
                Primary Climate / Köppen Region
              </label>
              <select
                value={climateRegion}
                onChange={(e) => setClimateRegion(e.target.value)}
                className="w-full h-11 px-3 bg-[#0A0E17] border border-[#1E293B] focus:border-[#2DD4BF] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#2DD4BF] transition font-mono"
              >
                <option value="Temperate Oceanic (Cfb)">Temperate Oceanic (Cfb) — London, Seattle, Melbourne</option>
                <option value="Mediterranean (Csa)">Mediterranean (Csa) — Barcelona, Rome, Cape Town</option>
                <option value="Humid Subtropical (Cfa)">Humid Subtropical (Cfa) — Tokyo, Milan, Sydney</option>
                <option value="Tropical Rainforest (Af)">Tropical Rainforest (Af) — Singapore, Jakarta, Manaus</option>
                <option value="Semi-Arid / Desert (BWh)">Semi-Arid / Hot Desert (BWh) — Dubai, Phoenix, Cairo</option>
                <option value="Continental (Dfb)">Continental (Dfb) — Berlin, Toronto, Chicago</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 08 — What Are You Building? */}
        {step === 8 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What would you like to work on first?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                We'll seed your active project with an intelligent floor plan template ready for editing.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto pt-3">
              {[
                { id: 'Residential', label: 'Residential Villa', icon: Home, desc: '4-Bed Contemporary Biophilic' },
                { id: 'Commercial', label: 'Commercial Hub', icon: Building2, desc: 'Mid-Rise Cross-Laminated Timber' },
                { id: 'Hospitality', label: 'Eco-Resort Suite', icon: Hotel, desc: 'Passive Solar Courtyard Pavilion' },
                { id: 'Healthcare', label: 'Wellness Clinic', icon: Activity, desc: 'Acoustically Isolated Wing' },
                { id: 'Education', label: 'Design Academy', icon: GraduationCap, desc: 'Open Studio & Atrium' },
                { id: 'Civic', label: 'Cultural Center', icon: Landmark, desc: 'Exhibition Hall & Amphitheatre' },
                { id: 'Sustainable', label: 'Net-Zero Passive', icon: Leaf, desc: 'Mass Timber + Solar Canopy' },
                { id: 'Custom', label: 'Blank Canvas', icon: Box, desc: 'Empty CAD Grid & Coordinate Zero' },
              ].map((p) => {
                const isSelected = firstProject === p.id;
                const IconComponent = p.icon;
                return (
                  <div
                    key={p.id}
                    onClick={() => setFirstProject(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between h-36 transition ${
                      isSelected
                        ? 'bg-[#2DD4BF]/15 border-[#2DD4BF] text-white shadow-xl'
                        : 'bg-[#0A0E17] border-[#1E293B] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#141E2E] flex items-center justify-center text-[#2DD4BF]">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#2DD4BF]" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-white">{p.label}</span>
                      <span className="text-[10px] text-gray-400 block leading-tight">{p.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 09 — AI Design Preferences */}
        {step === 9 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How should your AI work with you?
              </h2>
              <p className="text-xs sm:text-sm text-gray-400">
                Calibrate the intelligence balance between algorithmic precision and experimental creativity.
              </p>
            </div>

            <div className="space-y-5 max-w-xl mx-auto pt-2 bg-[#0A0E17] border border-[#1E293B] p-6 rounded-2xl">
              {/* Slider 1: Creativity */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300 font-semibold">AI Creativity</span>
                  <span className="text-[#2DD4BF] font-bold">{aiPrefs.creativity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiPrefs.creativity}
                  onChange={(e) => setAiPrefs({ ...aiPrefs, creativity: Number(e.target.value) })}
                  className="w-full accent-[#2DD4BF]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>Precise / Rational</span>
                  <span>Experimental / Parametric</span>
                </div>
              </div>

              {/* Slider 2: Guidance */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300 font-semibold">Design Guidance</span>
                  <span className="text-[#2DD4BF] font-bold">{aiPrefs.guidance}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiPrefs.guidance}
                  onChange={(e) => setAiPrefs({ ...aiPrefs, guidance: Number(e.target.value) })}
                  className="w-full accent-[#2DD4BF]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>Minimal / On-demand</span>
                  <span>Proactive Suggestions</span>
                </div>
              </div>

              {/* Slider 3: Sustainability */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300 font-semibold">Sustainability Weighting</span>
                  <span className="text-emerald-400 font-bold">{aiPrefs.sustainability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiPrefs.sustainability}
                  onChange={(e) => setAiPrefs({ ...aiPrefs, sustainability: Number(e.target.value) })}
                  className="w-full accent-emerald-400"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>Standard Benchmark</span>
                  <span>Always Enforce Net-Zero</span>
                </div>
              </div>

              {/* Slider 4: Cost Awareness */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-gray-300 font-semibold">Cost & BoQ Awareness</span>
                  <span className="text-amber-400 font-bold">{aiPrefs.costAwareness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={aiPrefs.costAwareness}
                  onChange={(e) => setAiPrefs({ ...aiPrefs, costAwareness: Number(e.target.value) })}
                  className="w-full accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>Design-First</span>
                  <span>Strict Cost Limits</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 10 — "YOUR STUDIO IS READY" */}
        {step === 10 && (
          <div className="text-center space-y-6 max-w-2xl mx-auto animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>CALIBRATION COMPLETE</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                YOUR STUDIO IS READY
              </h1>
              <p className="text-sm text-gray-300">
                Workspace successfully configured and stamped with your architectural identity.
              </p>
            </div>

            {/* Configured Studio Manifest Card */}
            <div className="bg-[#0A0E17]/90 border border-[#2DD4BF]/40 rounded-2xl p-6 text-left space-y-4 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center">
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
                    <h3 className="font-extrabold text-white text-base tracking-wide">{studioName}</h3>
                    <span className="text-[11px] text-[#2DD4BF] font-mono">
                      Lead Architect: {initialProfile.fullName || 'Simao Lusimadio'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  CALIBRATED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[10px]">ROLES</span>
                  <span className="text-gray-200 font-semibold">{roles.slice(0, 2).join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">EXPERIENCE</span>
                  <span className="text-gray-200 font-semibold uppercase">{experienceLevel}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">SUSTAINABILITY</span>
                  <span className="text-emerald-400 font-semibold uppercase">{sustainabilityLevel}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">FIRST PROJECT</span>
                  <span className="text-gray-200 font-semibold">{firstProject}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">AI CREATIVITY</span>
                  <span className="text-[#2DD4BF] font-semibold">{aiPrefs.creativity}%</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px]">TOOLS</span>
                  <span className="text-gray-200 font-semibold">{tools.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM ACTION CONTROLS: BACK & CONTINUE / ENTER STUDIO                     */}
      {/* ========================================================================= */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between pt-4 border-t border-[#1E293B]">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="h-10 px-4 bg-[#0A0E17] hover:bg-[#141B29] border border-[#1E293B] text-gray-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="h-11 px-6 bg-[#2DD4BF] hover:brightness-110 text-[#050505] font-extrabold rounded-lg text-xs flex items-center gap-2 transition shadow-lg shadow-[#2DD4BF]/20 ml-auto"
          >
            <span>{step === 1 ? 'Start Setup' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="h-12 px-8 bg-[#2DD4BF] hover:brightness-110 text-[#050505] font-black rounded-lg text-sm flex items-center gap-2.5 transition shadow-xl shadow-[#2DD4BF]/30 ml-auto animate-pulse"
          >
            <span>Enter Studio</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
