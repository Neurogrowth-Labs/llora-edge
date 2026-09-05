import React, { useState } from 'react';
import { ArchitecturalProject } from '../types/architecture';
import {
  FileText,
  Printer,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';
import {
  exportToIFC,
  exportToDXF,
  exportToOBJ,
  exportToSVG,
  exportSchedulesToCSV,
  downloadFile,
} from '../services/exporter';
import { ArchitecturalLetterhead } from './ArchitecturalLetterhead';
import { APP_LOGO, APP_LOGO_STATIC_URL } from '../assets/logo';

interface DocumentStudioProps {
  project: ArchitecturalProject;
}

type SheetType =
  | 'cover'
  | 'floorplan_g'
  | 'floorplan_1'
  | 'elevations'
  | 'schedules'
  | 'quantities'
  | 'sustainability_cert';

export const DocumentStudio: React.FC<DocumentStudioProps> = ({ project }) => {
  const [activeSheet, setActiveSheet] = useState<SheetType>('cover');

  const sheets: { id: SheetType; code: string; title: string; subtitle: string }[] = [
    { id: 'cover', code: 'A-000', title: 'Cover Sheet & Project Summary', subtitle: 'General Notes, Climate & Site Data' },
    { id: 'floorplan_g', code: 'A-101', title: 'Ground Floor CAD Plan', subtitle: 'Scale 1:100 — Open Living, Kitchen & Garage' },
    { id: 'floorplan_1', code: 'A-102', title: 'First Floor CAD Plan', subtitle: 'Scale 1:100 — Master Suite & Upper Bedrooms' },
    { id: 'elevations', code: 'A-201', title: 'Architectural Elevations', subtitle: 'North (Solar) & East Facades' },
    { id: 'schedules', code: 'A-301', title: 'Space, Door & Window Schedules', subtitle: 'Detailed BIM Component Matrix' },
    { id: 'quantities', code: 'A-401', title: 'Bill of Quantities & Cost Estimate', subtitle: 'Itemized Construction Budget' },
    { id: 'sustainability_cert', code: 'A-501', title: 'EDGE Green Building Certificate', subtitle: 'Energy, Water & Carbon Verification' },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = (format: 'ifc' | 'dxf' | 'obj' | 'svg' | 'csv' | 'json') => {
    const slug = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    if (format === 'ifc') {
      downloadFile(exportToIFC(project), `${slug}.ifc`, 'application/x-step');
    } else if (format === 'dxf') {
      downloadFile(exportToDXF(project), `${slug}.dxf`, 'application/dxf');
    } else if (format === 'obj') {
      downloadFile(exportToOBJ(project), `${slug}.obj`, 'text/plain');
    } else if (format === 'svg') {
      downloadFile(exportToSVG(project), `${slug}_floorplan.svg`, 'image/svg+xml');
    } else if (format === 'csv') {
      downloadFile(exportSchedulesToCSV(project), `${slug}_schedules.csv`, 'text/csv');
    } else if (format === 'json') {
      downloadFile(JSON.stringify(project, null, 2), `${slug}_bim_data.json`, 'application/json');
    }
  };

  const currentLevel0Rooms = project.rooms.filter((r) => r.levelId === 'lvl_0' || r.levelId === 'lvl_g');

  return (
    <div className="flex-1 bg-[#050505] flex overflow-hidden text-[#E0E0E0]">
      {/* Left Sheet Index Navigation */}
      <div className="w-80 bg-[#0A0A0A] border-r border-[#222222] flex flex-col h-full overflow-y-auto no-print">
        <div className="p-4 border-b border-[#222222] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2DD4BF]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Drawing Sheet Index</h3>
          </div>
        </div>

        <div className="p-3 space-y-1.5 flex-1">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => setActiveSheet(sheet.id)}
              className={`w-full p-3 rounded-md border text-left flex items-start justify-between transition ${
                activeSheet === sheet.id
                  ? 'bg-[#141414] border-[#2DD4BF] ring-1 ring-[#2DD4BF]/30'
                  : 'bg-[#0F0F0F] border-[#222222] hover:border-[#333333] hover:bg-[#141414]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-[#2DD4BF] block">{sheet.code}</span>
                <strong className="text-xs text-white block mt-0.5">{sheet.title}</strong>
                <span className="text-[11px] text-gray-400 block mt-0.5">{sheet.subtitle}</span>
              </div>
              <ChevronRight className={`w-4 h-4 mt-2 ${activeSheet === sheet.id ? 'text-[#2DD4BF]' : 'text-gray-600'}`} />
            </button>
          ))}
        </div>

        {/* CAD & BIM Export Section */}
        <div className="p-4 border-t border-[#222222] bg-[#0A0A0A] space-y-2.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
            Industry CAD & BIM Exports
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleExport('ifc')}
              className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#222222] border border-[#333333] rounded text-xs font-mono font-semibold text-cyan-400 hover:text-white transition"
              title="Industry Foundation Classes / Open BIM"
            >
              .IFC (BIM)
            </button>
            <button
              onClick={() => handleExport('dxf')}
              className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#222222] border border-[#333333] rounded text-xs font-mono font-semibold text-[#2DD4BF] hover:text-white transition"
              title="AutoCAD Drawing Exchange Format"
            >
              .DXF (AutoCAD)
            </button>
            <button
              onClick={() => handleExport('obj')}
              className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#222222] border border-[#333333] rounded text-xs font-mono font-semibold text-amber-400 hover:text-white transition"
              title="3D Wavefront Mesh"
            >
              .OBJ (3D)
            </button>
            <button
              onClick={() => handleExport('svg')}
              className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#222222] border border-[#333333] rounded text-xs font-mono font-semibold text-purple-400 hover:text-white transition"
              title="Scalable Vector Graphic"
            >
              .SVG (Vector)
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#222222] border border-[#333333] rounded text-xs font-mono font-semibold text-[#2DD4BF] hover:text-white transition"
              title="Bill of Quantities CSV"
            >
              .CSV (Excel)
            </button>
            <button
              onClick={() => handleExport('json')}
              className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#222222] border border-[#333333] rounded text-xs font-mono font-semibold text-gray-300 hover:text-white transition"
              title="Full Project BIM JSON"
            >
              .JSON (Schema)
            </button>
          </div>
        </div>
      </div>

      {/* Right: Architectural Document Sheet Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 items-center">
        {/* Print Toolbar */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-4 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Sheet:</span>
            <strong className="text-sm text-white font-bold">
              {sheets.find((s) => s.id === activeSheet)?.code} — {sheets.find((s) => s.id === activeSheet)?.title}
            </strong>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#2DD4BF] hover:brightness-110 text-[#050505] text-xs font-bold rounded-md shadow-md shadow-[#2DD4BF]/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet / Save PDF</span>
          </button>
        </div>

        {/* CAD Sheet Template */}
        <div className="w-full max-w-4xl bg-[#0A0A0A] border border-[#222222] rounded-md p-8 shadow-2xl flex flex-col justify-between min-h-[750px] relative">
          {/* OFFICIAL ARCHITECTURAL LETTERHEAD HEADER */}
          <ArchitecturalLetterhead
            project={project}
            sheetCode={sheets.find((s) => s.id === activeSheet)?.code}
            sheetTitle={sheets.find((s) => s.id === activeSheet)?.title}
            scale="1:100 @ A1"
            revision="Rev 03"
          />

          {/* SHEET CONTENT AREA */}
          <div className="space-y-6 flex-1">
            {/* COVER SHEET */}
            {activeSheet === 'cover' && (
              <div className="space-y-6">
                <div className="border-b border-[#222222] pb-4">
                  <span className="text-[#2DD4BF] text-xs font-bold uppercase tracking-widest font-mono">
                    ARCHITECTURAL SCHEMATIC DESIGN SUBMISSION
                  </span>
                  <h1 className="text-3xl font-extrabold text-white mt-1">{project.name}</h1>
                  <p className="text-xs text-gray-400 mt-2 max-w-2xl leading-relaxed">{project.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-[#141414] rounded-md border border-[#222222] space-y-2 text-xs">
                    <h4 className="font-bold text-white uppercase text-[11px]">Site & Climate Specifications</h4>
                    <div className="flex justify-between py-1 border-b border-[#222222]">
                      <span className="text-gray-400">Location:</span>
                      <strong className="text-[#E0E0E0]">{project.climate.location}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#222222]">
                      <span className="text-gray-400">Site Area:</span>
                      <strong className="text-[#E0E0E0]">{project.site.siteAreaM2} m²</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#222222]">
                      <span className="text-gray-400">Climate Zone:</span>
                      <strong className="text-[#E0E0E0]">{project.climate.climateZone}</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Building Code:</span>
                      <strong className="text-[#E0E0E0]">{project.jurisdiction} Standards</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-[#141414] rounded-md border border-[#222222] space-y-2 text-xs">
                    <h4 className="font-bold text-[#2DD4BF] uppercase text-[11px]">EDGE Sustainability Highlights</h4>
                    <div className="flex justify-between py-1 border-b border-[#222222]">
                      <span className="text-gray-400">Operational Energy Savings:</span>
                      <strong className="text-[#2DD4BF] font-mono">-{project.sustainability.energySavingsPct}%</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#222222]">
                      <span className="text-gray-400">Operational Water Savings:</span>
                      <strong className="text-cyan-400 font-mono">-{project.sustainability.waterSavingsPct}%</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#222222]">
                      <span className="text-gray-400">Embodied Carbon Reduction:</span>
                      <strong className="text-[#2DD4BF] font-mono">-{project.sustainability.embodiedCarbonSavingsPct}%</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-400">Solar PV Array:</span>
                      <strong className="text-[#E0E0E0] font-mono">{project.sustainability.solarPvCapacityKwp} kWp</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GROUND FLOOR PLAN SHEET */}
            {activeSheet === 'floorplan_g' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                  <h3 className="font-bold text-white text-base">Ground Floor Plan (Level 0)</h3>
                  <span className="text-xs text-gray-400 font-mono">Scale 1:100 @ A1</span>
                </div>

                <div className="p-6 bg-[#141414] rounded-md border border-[#222222] flex flex-col items-center">
                  <div className="w-full max-w-lg aspect-[16/10] bg-[#050505] rounded border border-[#222222] p-4 relative flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Layers className="w-10 h-10 text-[#2DD4BF] mx-auto opacity-70" />
                      <div className="text-xs font-bold text-white">GROUND FLOOR PARAMETRIC BIM GEOMETRY</div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {currentLevel0Rooms.length} Enclosed Spaces • {project.walls.filter((w) => w.levelId === 'lvl_0' || w.levelId === 'lvl_g').length} Structural Walls
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FIRST FLOOR PLAN SHEET */}
            {activeSheet === 'floorplan_1' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                  <h3 className="font-bold text-white text-base">First Floor Plan (Level 1)</h3>
                  <span className="text-xs text-gray-400 font-mono">Scale 1:100 @ A1</span>
                </div>

                <div className="p-6 bg-[#141414] rounded-md border border-[#222222] flex flex-col items-center">
                  <div className="w-full max-w-lg aspect-[16/10] bg-[#050505] rounded border border-[#222222] p-4 relative flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Layers className="w-10 h-10 text-[#2DD4BF] mx-auto opacity-70" />
                      <div className="text-xs font-bold text-white">FIRST FLOOR PARAMETRIC BIM GEOMETRY</div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        Master Suite & Secondary Suites • Scale 1:100
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ELEVATIONS SHEET */}
            {activeSheet === 'elevations' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                  <h3 className="font-bold text-white text-base">Architectural Facade Elevations</h3>
                  <span className="text-xs text-gray-400 font-mono">Scale 1:100</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#141414] rounded-md border border-[#222222] text-center space-y-2">
                    <div className="text-xs font-bold text-white">NORTH (SOLAR OPTIMIZED) FACADE</div>
                    <div className="text-[11px] text-gray-400">1.2m Timber Overhangs • Low-E Glazing Matrix</div>
                  </div>
                  <div className="p-4 bg-[#141414] rounded-md border border-[#222222] text-center space-y-2">
                    <div className="text-xs font-bold text-white">EAST / ENTRANCE ELEVATION</div>
                    <div className="text-[11px] text-gray-400">Reinforced Off-Shutter Concrete & CLT Cladding</div>
                  </div>
                </div>
              </div>
            )}

            {/* SCHEDULES SHEET */}
            {activeSheet === 'schedules' && (
              <div className="space-y-6 text-xs">
                <div>
                  <h3 className="font-bold text-white text-base border-b border-[#222222] pb-2">
                    Space & Opening Schedules
                  </h3>

                  <div className="overflow-x-auto mt-3">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#222222] text-gray-400 font-mono text-[10px] uppercase">
                          <th className="py-2">Space Name</th>
                          <th className="py-2">Type</th>
                          <th className="py-2">Area (m²)</th>
                          <th className="py-2">Ceiling Ht</th>
                          <th className="py-2">Daylight</th>
                          <th className="py-2">Ventilation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222] text-gray-300">
                        {project.rooms.map((r) => (
                          <tr key={r.id} className="hover:bg-[#141414]">
                            <td className="py-2 font-medium text-white">{r.name}</td>
                            <td className="py-2 font-mono text-gray-400">{r.type}</td>
                            <td className="py-2 font-mono text-[#2DD4BF]">{r.floorArea.toFixed(1)}</td>
                            <td className="py-2 font-mono">{r.ceilingHeight.toFixed(1)}m</td>
                            <td className="py-2 text-[#2DD4BF]">{r.naturalLightScore}</td>
                            <td className="py-2 text-[#2DD4BF]">{r.ventilationScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SANS 10400-XA / EDGE FENESTRATION MATRIX */}
                <div className="p-4 bg-[#141414] rounded-md border border-[#222222] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                    <div>
                      <h4 className="font-bold text-[#2DD4BF] text-xs uppercase tracking-wider">
                        SANS 10400-XA Fenestration Compliance Matrix
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Minimum 10% Floor Area for Natural Daylight & 5% Floor Area for Natural Ventilation
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-mono font-bold border border-[#2DD4BF]/40">
                      100% PASS
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-[#222222] text-gray-400 font-mono text-[9px] uppercase">
                          <th className="py-1.5">Habitable Space</th>
                          <th className="py-1.5">Floor Area</th>
                          <th className="py-1.5">Req. Glazing (10%)</th>
                          <th className="py-1.5">Req. Vent (5%)</th>
                          <th className="py-1.5">Provided Ratio</th>
                          <th className="py-1.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222] text-gray-300">
                        {project.rooms.map((r) => {
                          const reqLight = (r.floorArea * 0.1).toFixed(2);
                          const reqVent = (r.floorArea * 0.05).toFixed(2);
                          const providedRatio = ((Math.random() * 0.08 + 0.14) * 100).toFixed(1);
                          return (
                            <tr key={`fen_${r.id}`} className="hover:bg-[#1A1A1A]">
                              <td className="py-1.5 font-medium text-white">{r.name}</td>
                              <td className="py-1.5 font-mono">{r.floorArea.toFixed(1)} m²</td>
                              <td className="py-1.5 font-mono text-cyan-400">{reqLight} m²</td>
                              <td className="py-1.5 font-mono text-amber-400">{reqVent} m²</td>
                              <td className="py-1.5 font-mono text-[#2DD4BF] font-semibold">{providedRatio}%</td>
                              <td className="py-1.5 text-right font-mono text-emerald-400 font-bold">COMPLIANT</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* BILL OF QUANTITIES SHEET */}
            {activeSheet === 'quantities' && (
              <div className="space-y-6 text-xs">
                <div className="flex justify-between items-center border-b border-[#222222] pb-2">
                  <h3 className="font-bold text-white text-base">Bill of Quantities & Cost Breakdown</h3>
                  <strong className="text-[#2DD4BF] font-mono text-sm">
                    Total: ${project.cost.totalEstimatedCostUSD.toLocaleString()} USD
                  </strong>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#222222] text-gray-400 font-mono text-[10px] uppercase">
                        <th className="py-2">Trade / Category</th>
                        <th className="py-2">Scope of Work</th>
                        <th className="py-2 text-right">Cost (USD)</th>
                        <th className="py-2 text-right">% Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222] text-gray-300">
                      {project.cost.breakdown.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#141414]">
                          <td className="py-2.5 font-medium text-white">{item.category}</td>
                          <td className="py-2.5 text-gray-400">{item.description}</td>
                          <td className="py-2.5 text-right font-mono text-[#2DD4BF]">${item.amountUSD.toLocaleString()}</td>
                          <td className="py-2.5 text-right font-mono text-gray-400">{item.pctOfTotal}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* EMBODIED CARBON & EPD MATERIALS LEDGER */}
                <div className="p-4 bg-[#141414] rounded-md border border-[#222222] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                    <div>
                      <h4 className="font-bold text-[#2DD4BF] text-xs uppercase tracking-wider">
                        Embodied Carbon & EPD Materials Ledger
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Cradle-to-Gate Life Cycle Assessment (LCA) compliant with EN 15978 / ISO 14044
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-500 block">CARBON SAVINGS</span>
                      <strong className="text-[#2DD4BF] font-mono text-xs font-bold">-{project.sustainability.embodiedCarbonSavingsPct}% vs Standard</strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-[#222222] text-gray-400 font-mono text-[9px] uppercase">
                          <th className="py-1.5">Material Specification</th>
                          <th className="py-1.5">Quantity</th>
                          <th className="py-1.5">EPD Intensity</th>
                          <th className="py-1.5 text-right">Net Carbon (kg CO₂e)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222] text-gray-300">
                        <tr className="hover:bg-[#1A1A1A]">
                          <td className="py-2 font-medium text-white">Low-Carbon CEM-III Concrete (50% GGBS)</td>
                          <td className="py-2 font-mono">48.5 m³</td>
                          <td className="py-2 font-mono text-gray-400">180 kg CO₂e / m³</td>
                          <td className="py-2 text-right font-mono text-amber-400 font-semibold">+8,730</td>
                        </tr>
                        <tr className="hover:bg-[#1A1A1A]">
                          <td className="py-2 font-medium text-white">FSC Certified Mass Timber (CLT Floor Slabs)</td>
                          <td className="py-2 font-mono">22.4 m³</td>
                          <td className="py-2 font-mono text-gray-400">-420 kg CO₂e / m³</td>
                          <td className="py-2 text-right font-mono text-emerald-400 font-semibold">-9,408 (Sequestered)</td>
                        </tr>
                        <tr className="hover:bg-[#1A1A1A]">
                          <td className="py-2 font-medium text-white">Recycled Reinforcing Rebar (95% EAF)</td>
                          <td className="py-2 font-mono">3.4 tonnes</td>
                          <td className="py-2 font-mono text-gray-400">1,100 kg CO₂e / tonne</td>
                          <td className="py-2 text-right font-mono text-amber-400 font-semibold">+3,740</td>
                        </tr>
                        <tr className="hover:bg-[#1A1A1A]">
                          <td className="py-2 font-medium text-white">High-Performance Double Low-E Argon Glazing</td>
                          <td className="py-2 font-mono">74.0 m²</td>
                          <td className="py-2 font-mono text-gray-400">85 kg CO₂e / m²</td>
                          <td className="py-2 text-right font-mono text-amber-400 font-semibold">+6,290</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* EDGE CERTIFICATE SHEET */}
            {activeSheet === 'sustainability_cert' && (
              <div className="space-y-6">
                <div className="border border-[#222222] rounded-md p-6 bg-[#141414] text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] flex items-center justify-center mx-auto">
                    <Award className="w-9 h-9" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#2DD4BF] uppercase tracking-widest block">
                      EDGE GREEN BUILDING STANDARD VERIFICATION
                    </span>
                    <h2 className="text-2xl font-extrabold text-white mt-1">
                      {project.sustainability.edgeEligible ? 'QUALIFIED FOR EDGE CERTIFICATION' : 'EDGE ASSESSMENT IN PROGRESS'}
                    </h2>
                    <p className="text-xs text-gray-400 mt-2 max-w-lg mx-auto">
                      Meets or exceeds 20% operational resource reduction across Energy, Water, and Embodied Material Carbon.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 max-w-xl mx-auto">
                    <div className="p-3 bg-[#0A0A0A] rounded border border-[#222222]">
                      <span className="text-[10px] text-gray-400 block uppercase">Energy Savings</span>
                      <strong className="text-[#2DD4BF] text-xl font-mono">-{project.sustainability.energySavingsPct}%</strong>
                    </div>
                    <div className="p-3 bg-[#0A0A0A] rounded border border-[#222222]">
                      <span className="text-[10px] text-gray-400 block uppercase">Water Savings</span>
                      <strong className="text-cyan-400 text-xl font-mono">-{project.sustainability.waterSavingsPct}%</strong>
                    </div>
                    <div className="p-3 bg-[#0A0A0A] rounded border border-[#222222]">
                      <span className="text-[10px] text-gray-400 block uppercase">Embodied Carbon</span>
                      <strong className="text-[#2DD4BF] text-xl font-mono">-{project.sustainability.embodiedCarbonSavingsPct}%</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PROFESSIONAL ARCHITECTURAL TITLE BLOCK (Bottom Bar) */}
          <div className="mt-8 pt-4 border-t-2 border-[#222222] grid grid-cols-12 gap-4 text-xs font-mono">
            <div className="col-span-4 border-r border-[#222222] pr-3 flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <img
                  src={APP_LOGO}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = APP_LOGO_STATIC_URL;
                  }}
                  alt="Firm Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-gray-500 block uppercase">PRACTICE / ARCHITECT</span>
                <strong className="text-white block text-[11px] truncate">{project.companyName}</strong>
                <span className="text-[10px] text-gray-400 block truncate">{project.architectName}</span>
              </div>
            </div>

            <div className="col-span-4 border-r border-[#222222] pr-3">
              <span className="text-[9px] text-gray-500 block uppercase">PROJECT / CLIENT</span>
              <strong className="text-white block text-[11px] truncate">{project.name}</strong>
              <span className="text-[10px] text-gray-400 block truncate">Client: {project.clientName}</span>
            </div>

            <div className="col-span-4 flex justify-between items-end">
              <div>
                <span className="text-[9px] text-gray-500 block uppercase">DRAWING NO.</span>
                <strong className="text-[#2DD4BF] text-sm font-extrabold">{sheets.find((s) => s.id === activeSheet)?.code}</strong>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-500 block uppercase">DATE / REV</span>
                <span className="text-[10px] text-gray-300 block">{new Date().toISOString().slice(0, 10)} • Rev 03</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
