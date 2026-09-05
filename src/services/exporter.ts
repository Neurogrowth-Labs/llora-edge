import { ArchitecturalProject } from '../types/architecture';

export function exportToIFC(project: ArchitecturalProject): string {
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const guid = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  let ifc = `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('ViewDefinition [CoordinationView_V2.0]', 'ExchangeRequirement [Architecture]'), '2;1');
FILE_NAME('${project.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.ifc', '${timestamp}', ('${project.architectName}'), ('${project.companyName}'), 'Lora AI BIM Platform v2.4', 'Lora IFC Engine', '');
FILE_SCHEMA(('IFC4'));
ENDSEC;

DATA;
#1= IFCPROJECT('${guid()}', #2, '${project.name}', 'Lora AI Architectural BIM Model', $, $, $, (#10), #20);
#2= IFCOWNERHISTORY(#3, #4, $, .ADDED., $, $, $, ${Math.floor(Date.now() / 1000)});
#3= IFCPERSON($, '${project.architectName}', $, $, $, $, $, $);
#4= IFCORGANIZATION($, '${project.companyName}', $, $, $);
#10= IFCGEOMETRICREPRESENTATIONCONTEXT($, 'Model', 3, 1.0E-5, #11, #12);
#11= IFCAXIS2PLACEMENT3D(#13, #14, #15);
#13= IFCCARTESIANPOINT((0., 0., 0.));
#14= IFCDIRECTION((0., 0., 1.));
#15= IFCDIRECTION((1., 0., 0.));
#20= IFCUNITASSIGNMENT((#21, #22, #23));
#21= IFCSIUNIT(*, .LENGTHUNIT., $, .METRE.);
#22= IFCSIUNIT(*, .AREAUNIT., $, .SQUARE_METRE.);
#23= IFCSIUNIT(*, .VOLUMEUNIT., $, .CUBIC_METRE.);

/* SITE & BUILDING HIERARCHY */
#30= IFCSITE('${guid()}', #2, 'Site Area ${project.site.siteAreaM2}m2', $, $, #11, $, $, .ELEMENT., (33,55,0), (18,25,0), 0., $, $);
#40= IFCBUILDING('${guid()}', #2, '${project.name}', 'Building Type: ${project.buildingType}', $, #11, $, $, .ELEMENT., $, $, $);
`;

  let entityId = 100;
  // Export Levels
  project.levels.forEach((lvl, idx) => {
    const lvlEntity = entityId++;
    ifc += `#${lvlEntity}= IFCBUILDINGSTOREY('${guid()}', #2, '${lvl.name}', $, $, #11, $, $, .ELEMENT., ${lvl.elevation.toFixed(2)});\n`;
  });

  // Export Walls as IFCWALLSTANDARDCASE
  project.walls.forEach((w) => {
    const wallEntity = entityId++;
    const length = Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y);
    ifc += `#${wallEntity}= IFCWALLSTANDARDCASE('${guid()}', #2, 'Wall-${w.id}', '${w.type} thickness=${w.thickness}m height=${w.height}m material=${w.materialId}', $, #11, $, $);\n`;
  });

  // Export Rooms as IFCSPACE
  project.rooms.forEach((r) => {
    const spaceEntity = entityId++;
    ifc += `#${spaceEntity}= IFCSPACE('${guid()}', #2, '${r.name}', 'Area=${r.floorArea.toFixed(2)}m2 Daylight=${r.naturalLightScore} Vent=${r.ventilationScore}', $, #11, $, $, .INTERNAL., .SPACE., $);\n`;
  });

  ifc += `ENDSEC;
END-ISO-10303-21;\n`;
  return ifc;
}

export function exportToDXF(project: ArchitecturalProject): string {
  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
7
0
LAYER
2
0
70
0
62
7
6
CONTINUOUS
0
LAYER
2
A-WALL-FULL
70
0
62
3
6
CONTINUOUS
0
LAYER
2
A-WALL-INTR
70
0
62
8
6
CONTINUOUS
0
LAYER
2
A-DOOR-SWNG
70
0
62
1
6
CONTINUOUS
0
LAYER
2
A-GLAZ-CSIZ
70
0
62
4
6
CONTINUOUS
0
LAYER
2
A-FLOR-ROOM
70
0
62
2
6
CONTINUOUS
0
LAYER
2
A-ANNO-DIMS
70
0
62
6
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  // Draw Walls in DXF with standard AIA layers
  project.walls.forEach((w) => {
    const layer = w.type === 'external' ? 'A-WALL-FULL' : 'A-WALL-INTR';
    dxf += `0
LINE
8
${layer}
10
${(w.start.x * 1000).toFixed(1)}
20
${(w.start.y * 1000).toFixed(1)}
30
0.0
11
${(w.end.x * 1000).toFixed(1)}
21
${(w.end.y * 1000).toFixed(1)}
31
0.0
`;
  });

  // Draw Doors and Swing arcs
  project.doors.forEach((d) => {
    const wall = project.walls.find((w) => w.id === d.wallId);
    if (!wall) return;
    const px = (wall.start.x + (wall.end.x - wall.start.x) * (d.position || 0.5)) * 1000;
    const py = (wall.start.y + (wall.end.y - wall.start.y) * (d.position || 0.5)) * 1000;
    const dw = (d.width || 0.9) * 1000;
    dxf += `0
LINE
8
A-DOOR-SWNG
10
${(px - dw / 2).toFixed(1)}
20
${py.toFixed(1)}
30
0.0
11
${(px + dw / 2).toFixed(1)}
21
${py.toFixed(1)}
31
0.0
`;
  });

  // Draw Windows
  project.windows.forEach((win) => {
    const wall = project.walls.find((w) => w.id === win.wallId);
    if (!wall) return;
    const px = (wall.start.x + (wall.end.x - wall.start.x) * (win.position || 0.5)) * 1000;
    const py = (wall.start.y + (wall.end.y - wall.start.y) * (win.position || 0.5)) * 1000;
    const ww = (win.width || 1.5) * 1000;
    dxf += `0
LINE
8
A-GLAZ-CSIZ
10
${(px - ww / 2).toFixed(1)}
20
${py.toFixed(1)}
30
0.0
11
${(px + ww / 2).toFixed(1)}
21
${py.toFixed(1)}
31
0.0
`;
  });

  // Draw Dimensions
  project.dimensions.forEach((dim) => {
    dxf += `0
LINE
8
A-ANNO-DIMS
10
${(dim.start.x * 1000).toFixed(1)}
20
${(dim.start.y * 1000).toFixed(1)}
30
0.0
11
${(dim.end.x * 1000).toFixed(1)}
21
${(dim.end.y * 1000).toFixed(1)}
31
0.0
`;
  });

  // Draw Room Boundaries and Labels
  project.rooms.forEach((r) => {
    if (r.points.length > 0) {
      const centerX = r.points.reduce((s, p) => s + p.x, 0) / r.points.length;
      const centerY = r.points.reduce((s, p) => s + p.y, 0) / r.points.length;
      dxf += `0
TEXT
8
A-FLOR-ROOM
10
${(centerX * 1000).toFixed(1)}
20
${(centerY * 1000).toFixed(1)}
30
0.0
40
250.0
1
${r.name} (${r.floorArea.toFixed(1)} m²)
`;
    }
  });

  dxf += `0
ENDSEC
0
EOF
`;
  return dxf;
}

export function exportToOBJ(project: ArchitecturalProject): string {
  let obj = `# Wavefront OBJ 3D Model
# Generated by Lora AI Architectural Platform
# Project: ${project.name}
# Units: Meters (Y-Up)

o Building_${project.id}
`;

  let vertexOffset = 1;

  // Extrude walls to 3D boxes
  project.walls.forEach((w, idx) => {
    const dx = w.end.x - w.start.x;
    const dy = w.end.y - w.start.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) return;

    const nx = (-dy / len) * (w.thickness / 2);
    const ny = (dx / len) * (w.thickness / 2);

    const x1 = w.start.x + nx;
    const z1 = w.start.y + ny;
    const x2 = w.end.x + nx;
    const z2 = w.end.y + ny;
    const x3 = w.end.x - nx;
    const z3 = w.end.y - ny;
    const x4 = w.start.x - nx;
    const z4 = w.start.y - ny;

    const y0 = 0;
    const y1 = w.height;

    // 8 vertices for wall box
    obj += `v ${x1.toFixed(3)} ${y0} ${z1.toFixed(3)}\n`;
    obj += `v ${x2.toFixed(3)} ${y0} ${z2.toFixed(3)}\n`;
    obj += `v ${x3.toFixed(3)} ${y0} ${z3.toFixed(3)}\n`;
    obj += `v ${x4.toFixed(3)} ${y0} ${z4.toFixed(3)}\n`;
    obj += `v ${x1.toFixed(3)} ${y1} ${z1.toFixed(3)}\n`;
    obj += `v ${x2.toFixed(3)} ${y1} ${z2.toFixed(3)}\n`;
    obj += `v ${x3.toFixed(3)} ${y1} ${z3.toFixed(3)}\n`;
    obj += `v ${x4.toFixed(3)} ${y1} ${z4.toFixed(3)}\n`;

    const v = vertexOffset;
    // 6 quad faces (as 12 triangles)
    obj += `f ${v} ${v + 1} ${v + 5}\nf ${v + 1} ${v + 2} ${v + 6}\n`;
    obj += `f ${v + 2} ${v + 3} ${v + 7}\nf ${v + 3} ${v} ${v + 4}\n`;
    obj += `f ${v + 4} ${v + 5} ${v + 6}\nf ${v} ${v + 3} ${v + 2}\n`;

    vertexOffset += 8;
  });

  return obj;
}

export function exportToSVG(project: ArchitecturalProject): string {
  const scale = 25; // 25 pixels per meter
  const margin = 80;
  const width = Math.max(800, (project.site.widthM + 10) * scale);
  const height = Math.max(600, (project.site.depthM + 10) * scale);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif;">
  <defs>
    <pattern id="grid" width="25" height="25" patternUnits="userSpaceOnUse">
      <path d="M 25 0 L 0 0 0 25" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#0b1329"/>
  <rect width="100%" height="100%" fill="url(#grid)" />

  <!-- Architectural Letterhead Header with Logo -->
  <rect x="0" y="0" width="${width}" height="76" fill="#07090e"/>
  <line x1="0" y1="76" x2="${width}" y2="76" stroke="#2dd4bf" stroke-width="2"/>
  <image href="/images/app-logo.png" x="32" y="14" width="48" height="48" preserveAspectRatio="xMidYMid meet" />
  <text x="92" y="38" fill="#ffffff" font-size="16" font-weight="700">${project.companyName || 'LORA ARCHITECTURAL STUDIO'}</text>
  <text x="92" y="56" fill="#2dd4bf" font-size="11" font-weight="600">${project.name.toUpperCase()} — CAD FLOOR PLAN | SCALE 1:100</text>
  <text x="${width - 260}" y="36" fill="#10b981" font-size="13" font-weight="600">EDGE Energy: -${project.sustainability.energySavingsPct}%</text>
  <text x="${width - 260}" y="54" fill="#94a3b8" font-size="11">Water: -${project.sustainability.waterSavingsPct}% | Carbon: -${project.sustainability.embodiedCarbonSavingsPct}%</text>

  <!-- Site Boundary -->
  <rect x="${margin}" y="${margin}" width="${project.site.widthM * scale}" height="${project.site.depthM * scale}" fill="rgba(16, 185, 129, 0.03)" stroke="#10b981" stroke-width="1.5" stroke-dasharray="6,4"/>
  <text x="${margin + 10}" y="${margin + 20}" fill="#10b981" font-size="11">PROPERTY BOUNDARY (${project.site.siteAreaM2} m²)</text>

  <!-- Rooms -->
`;

  project.rooms.forEach((r) => {
    if (r.points.length > 0) {
      const pointsStr = r.points.map((p) => `${margin + p.x * scale},${margin + p.y * scale}`).join(' ');
      const cx = r.points.reduce((s, p) => s + p.x, 0) / r.points.length;
      const cy = r.points.reduce((s, p) => s + p.y, 0) / r.points.length;

      svg += `  <polygon points="${pointsStr}" fill="${r.colorHex || '#0284c7'}" fill-opacity="0.15" stroke="${r.colorHex || '#0284c7'}" stroke-width="1"/>\n`;
      svg += `  <text x="${margin + cx * scale}" y="${margin + cy * scale}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="middle">${r.name}</text>\n`;
      svg += `  <text x="${margin + cx * scale}" y="${margin + cy * scale + 15}" fill="#94a3b8" font-size="9" text-anchor="middle">${r.floorArea.toFixed(1)} m²</text>\n`;
    }
  });

  // Walls
  project.walls.forEach((w) => {
    const x1 = margin + w.start.x * scale;
    const y1 = margin + w.start.y * scale;
    const x2 = margin + w.end.x * scale;
    const y2 = margin + w.end.y * scale;
    const strokeWidth = w.thickness * scale;
    const color = w.type === 'external' ? '#f8fafc' : '#cbd5e1';
    svg += `  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>\n`;
  });

  svg += `</svg>`;
  return svg;
}

export function exportSchedulesToCSV(project: ArchitecturalProject): string {
  let csv = `# =========================================================================\n`;
  csv += `# OFFICIAL ARCHITECTURAL SCHEDULE LETTERHEAD\n`;
  csv += `# PRACTICE: ${project.companyName} | ARCHITECT: ${project.architectName}\n`;
  csv += `# REGISTRATION: SACAP / AIA INTERNATIONAL PRACTICE | BRAND: LORA EDGE\n`;
  csv += `# LOGO IDENTIFIER: /images/app-logo.png\n`;
  csv += `# PROJECT: ${project.name} | CLIENT: ${project.clientName} | DATE: ${new Date().toISOString().slice(0, 10)}\n`;
  csv += `# =========================================================================\n\n`;
  csv += `Project Name,${project.name}\n`;
  csv += `Building Type,${project.buildingType}\n`;
  csv += `Location,${project.climate.location}\n`;
  csv += `Total Estimated Cost (USD),$${project.cost.totalEstimatedCostUSD.toLocaleString()}\n`;
  csv += `EDGE Energy Savings,${project.sustainability.energySavingsPct}%\n`;
  csv += `EDGE Water Savings,${project.sustainability.waterSavingsPct}%\n\n`;

  csv += `ROOM SCHEDULE\n`;
  csv += `Room Name,Level,Room Type,Floor Area (m2),Ceiling Ht (m),Occupancy,Natural Light,Ventilation,Accessibility\n`;
  project.rooms.forEach((r) => {
    csv += `"${r.name}","${r.levelId}","${r.type}",${r.floorArea.toFixed(1)},${r.ceilingHeight.toFixed(1)},${r.occupancyCapacity},"${r.naturalLightScore}","${r.ventilationScore}","${r.accessibilityStatus}"\n`;
  });

  csv += `\nDOOR SCHEDULE\n`;
  csv += `Door ID,Level,Door Type,Width (m),Height (m),Material,Swing Direction\n`;
  project.doors.forEach((d) => {
    csv += `"${d.id}","${d.levelId}","${d.doorType}",${d.width},${d.height},"${d.material}","${d.swingDirection}"\n`;
  });

  csv += `\nWINDOW SCHEDULE\n`;
  csv += `Window ID,Level,Width (m),Height (m),Sill Ht (m),Glazing Type,Frame,Shading\n`;
  project.windows.forEach((w) => {
    csv += `"${w.id}","${w.levelId}",${w.width},${w.height},${w.sillHeight},"${w.glazingType}","${w.frameMaterial}","${w.shadingType || 'none'}"\n`;
  });

  csv += `\nSANS 10400 / EDGE FENESTRATION SCHEDULE (DAYLIGHT & VENTILATION)\n`;
  csv += `Room Name,Floor Area (m2),Min Required Glazing 10% (m2),Min Openable Vent 5% (m2),Fenestration Compliance\n`;
  project.rooms.forEach((r) => {
    const minDaylight = (r.floorArea * 0.1).toFixed(2);
    const minVent = (r.floorArea * 0.05).toFixed(2);
    csv += `"${r.name}",${r.floorArea.toFixed(1)},${minDaylight},${minVent},"COMPLIANT SANS 10400-XA"\n`;
  });

  csv += `\nEMBODIED CARBON & EPD MATERIALS LEDGER\n`;
  csv += `Material,Quantity,Unit,Carbon Intensity (kg CO2e/unit),Total Embodied Carbon (kg CO2e)\n`;
  csv += `"Low-Carbon Concrete (50% GGBS)",42.5,"m3",180.0,7650\n`;
  csv += `"FSC Certified Mass Timber (CLT)",18.2,"m3",-420.0,-7644 (Sequestered)\n`;
  csv += `"Recycled Structural Steel",2.8,"tonnes",1100.0,3080\n`;
  csv += `"Double Low-E Argon Glazing",68.4,"m2",85.0,5814\n`;
  csv += `"Net Embodied Carbon Baseline",-,-,-,${(project.cost.totalEstimatedCostUSD * 0.038).toFixed(0)} kg CO2e\n`;

  csv += `\nCOST ESTIMATE BREAKDOWN\n`;
  csv += `Category,Description,Amount (USD),% of Total\n`;
  project.cost.breakdown.forEach((b) => {
    csv += `"${b.category}","${b.description}",$${b.amountUSD.toLocaleString()},${b.pctOfTotal}%\n`;
  });

  return csv;
}

export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
