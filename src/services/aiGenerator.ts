import {
  ArchitecturalProject,
  BuildingType,
  ArchitecturalStyle,
  JurisdictionCode,
  Level,
  Room,
  Wall,
  Door,
  Window,
  Furniture,
  DimensionLine,
  TextAnnotation,
  SpaceValidationError,
  SustainabilityMetrics,
  CostEstimate,
  DesignOption,
} from '../types/architecture';
import { JURISDICTIONS } from '../data/jurisdictions';

export function calculateRoomPolygonArea(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area / 2);
}

export function validateSpaceDesign(project: ArchitecturalProject): SpaceValidationError[] {
  const errors: SpaceValidationError[] = [];
  const jurisdiction = JURISDICTIONS[project.jurisdiction] || JURISDICTIONS.ZA;

  // 1. Room check: Doors and Windows
  project.rooms.forEach((room) => {
    // Check if room has at least one door connected to its boundary walls
    const isOutdoorTerrace = room.type === 'terrace' || room.type === 'balcony';
    
    // Check area vs code requirement
    if (room.floorArea < jurisdiction.minHabitableRoomArea && room.type !== 'bathroom' && room.type !== 'utility') {
      errors.push({
        id: `err_area_${room.id}`,
        severity: 'warning',
        type: 'tight_corridor',
        roomId: room.id,
        message: `${room.name} area (${room.floorArea.toFixed(1)} m²) is below ${jurisdiction.name} minimum standard (${jurisdiction.minHabitableRoomArea} m²).`,
        suggestedFix: `Resize room by expanding perimeter walls outward by at least 1.0m.`,
      });
    }

    // Check natural light/window requirement for habitable rooms
    if (['living', 'bedroom', 'bedroom_master', 'office', 'open_plan_living'].includes(room.type)) {
      if (room.naturalLightScore === 'Poor') {
        errors.push({
          id: `err_light_${room.id}`,
          severity: 'warning',
          type: 'insufficient_daylight',
          roomId: room.id,
          message: `${room.name} has insufficient natural daylight (< ${jurisdiction.minWindowToFloorRatio}% window-to-floor ratio).`,
          suggestedFix: `Add an external window of at least 1.8m width or add a skylight opening.`,
        });
      }
    }
  });

  // 2. Setback check
  project.walls.forEach((wall) => {
    if (wall.start.x < project.site.setbackSidesM || wall.start.y < project.site.setbackFrontM) {
      // Setback warning
    }
  });

  return errors;
}

export function computeSustainabilityScore(
  project: Partial<ArchitecturalProject>,
  solarPvKwp: number = 8.5,
  rainwaterLiters: number = 10000,
  hasDoubleLowE: boolean = true,
  hasOverhangs: boolean = true
): SustainabilityMetrics {
  // Baseline energy is approx 75 kWh/m²/yr for standard code
  const totalFloorArea = (project.rooms || []).reduce((acc, r) => acc + r.floorArea, 0) || 180;
  
  let energyPct = 18; // Base passive design
  if (solarPvKwp > 5) energyPct += 12;
  if (solarPvKwp >= 10) energyPct += 8;
  if (hasDoubleLowE) energyPct += 7;
  if (hasOverhangs) energyPct += 5;

  let waterPct = 15; // Low-flow fixtures
  if (rainwaterLiters >= 5000) waterPct += 15;
  if (rainwaterLiters >= 10000) waterPct += 10;

  const embodiedCarbonPct = 24.5;

  const annualEnergy = Math.max(25, 75 * (1 - energyPct / 100));
  const annualWater = Math.max(15, 45 * (1 - waterPct / 100));

  const isEdge = energyPct >= 20 && waterPct >= 20 && embodiedCarbonPct >= 20;

  return {
    energySavingsPct: Math.min(65, Math.round(energyPct * 10) / 10),
    waterSavingsPct: Math.min(60, Math.round(waterPct * 10) / 10),
    embodiedCarbonSavingsPct: Math.round(embodiedCarbonPct * 10) / 10,
    edgeEligible: isEdge,
    annualEnergyKwhPerM2: Math.round(annualEnergy * 10) / 10,
    annualWaterM3PerOccupant: Math.round(annualWater * 10) / 10,
    embodiedCarbonKgCO2ePerM2: 235,
    solarPvCapacityKwp: solarPvKwp,
    solarAnnualGenerationKwh: Math.round(solarPvKwp * 1750),
    rainwaterHarvestingCapacityLiters: rainwaterLiters,
    windowToWallRatioPct: 29.5,
    naturalVentilationRatioPct: 85.0,
    permeableSiteAreaPct: 48.0,
    activeStrategies: [
      `${solarPvKwp} kWp High-Efficiency Solar PV Array`,
      `${rainwaterLiters.toLocaleString()}L Rainwater Harvesting & Filtration System`,
      'Thermally broken double Low-E spectrally selective glazing',
      'Engineered cross-ventilation flues catching prevailing breezes',
      'Architectural solar overhangs and louvers',
      'Low-flow aerated fixtures with dual-flush systems',
      'Low-carbon geopolymer concrete and FSC timber integration',
    ],
  };
}

export function computeCostEstimate(
  totalAreaM2: number,
  buildingType: BuildingType,
  style: ArchitecturalStyle,
  jurisdiction: JurisdictionCode
): CostEstimate {
  const baseRatePerM2 = 1350;
  const factor = jurisdiction === 'GB' || jurisdiction === 'US' || jurisdiction === 'EU' ? 1.4 : 1.0;
  const totalArea = Math.max(50, totalAreaM2);
  const totalCost = Math.round(totalArea * baseRatePerM2 * factor);

  return {
    totalEstimatedCostUSD: totalCost,
    costPerM2: Math.round(baseRatePerM2 * factor),
    currency: 'USD',
    confidence: 'Schematic',
    regionalFactor: factor,
    breakdown: [
      { category: 'Foundations & Ground Works', description: 'Engineered footings, sub-slab insulation & waterproofing', amountUSD: Math.round(totalCost * 0.12), pctOfTotal: 12 },
      { category: 'Superstructure & Walls', description: 'Structural framing, load-bearing walls & lintels', amountUSD: Math.round(totalCost * 0.27), pctOfTotal: 27 },
      { category: 'Glazing & External Doors', description: 'Double Low-E aluminum windows, patio sliders, main pivot door', amountUSD: Math.round(totalCost * 0.14), pctOfTotal: 14 },
      { category: 'Roofing & Solar PV', description: 'Insulated roof deck & renewable solar PV system', amountUSD: Math.round(totalCost * 0.11), pctOfTotal: 11 },
      { category: 'Interior Finishes & Joinery', description: 'Flooring, drywall/plaster, bespoke kitchen & wardrobes', amountUSD: Math.round(totalCost * 0.15), pctOfTotal: 15 },
      { category: 'Plumbing & MEP Services', description: 'Water harvesting, solar geysers, electrical distribution', amountUSD: Math.round(totalCost * 0.13), pctOfTotal: 13 },
      { category: 'Preliminaries & Professional Fees', description: 'Architectural, engineering, and compliance certifications', amountUSD: Math.round(totalCost * 0.08), pctOfTotal: 8 },
    ],
  };
}

// Parametric Architectural Generator for New User Prompts
export function generateProjectFromPrompt(
  prompt: string,
  params?: {
    name?: string;
    buildingType?: BuildingType;
    style?: ArchitecturalStyle;
    jurisdiction?: JurisdictionCode;
    location?: string;
    siteArea?: number;
    floors?: number;
  }
): ArchitecturalProject {
  const lowerPrompt = prompt.toLowerCase();

  const isCapeTown = lowerPrompt.includes('cape town') || (params?.location?.toLowerCase().includes('cape town'));
  const isNairobi = lowerPrompt.includes('nairobi') || (params?.location?.toLowerCase().includes('nairobi'));
  const isLagos = lowerPrompt.includes('lagos') || (params?.location?.toLowerCase().includes('lagos'));
  const isKigali = lowerPrompt.includes('kigali') || (params?.location?.toLowerCase().includes('kigali'));

  const jurisdiction: JurisdictionCode = params?.jurisdiction || (isNairobi ? 'KE' : isLagos ? 'NG' : isKigali ? 'RW' : 'ZA');
  const style: ArchitecturalStyle = params?.style || (lowerPrompt.includes('minimalist') ? 'Minimalist' : lowerPrompt.includes('scandinavian') ? 'Scandinavian' : 'Biophilic Modern');
  const buildingType: BuildingType = params?.buildingType || (lowerPrompt.includes('office') ? 'Office' : lowerPrompt.includes('apartment') ? 'Apartment' : 'Residential');

  const siteArea = params?.siteArea || (lowerPrompt.includes('600') ? 600 : lowerPrompt.includes('800') ? 800 : lowerPrompt.includes('1000') ? 1000 : 600);
  const location = params?.location || (isNairobi ? 'Nairobi, Kenya' : isLagos ? 'Lagos, Nigeria' : isKigali ? 'Kigali, Rwanda' : 'Cape Town, South Africa');

  const isTwoStorey = lowerPrompt.includes('two-storey') || lowerPrompt.includes('2-storey') || lowerPrompt.includes('two floors') || (params?.floors === 2);

  // Generate building footprint & layout
  const level0Id = 'lvl_g';
  const level1Id = 'lvl_1';
  const levelRoofId = 'lvl_roof';
  const levels: Level[] = [
    {
      id: level0Id,
      name: 'Ground Floor (Level 0)',
      elevation: 0.0,
      height: 3.0,
      floorPlanVisible: true,
      floorFinishMaterial: 'FSC Engineered Herringbone Oak',
      floorFinishColor: '#b45309',
      slabThickness: 0.30,
      ceilingHeight: 3.0,
      structuralType: 'post_tensioned_concrete',
      tilePattern: 'herringbone_parquet',
      targetOccupancy: 'Living, Kitchen & Dining Lounge',
    },
  ];
  if (isTwoStorey) {
    levels.push({
      id: level1Id,
      name: 'First Floor (Level 1)',
      elevation: 3.0,
      height: 2.8,
      floorPlanVisible: true,
      floorFinishMaterial: 'Polished Travertine Marble',
      floorFinishColor: '#e2e8f0',
      slabThickness: 0.28,
      ceilingHeight: 2.8,
      structuralType: 'mass_timber_clt',
      tilePattern: 'travertine_stone',
      targetOccupancy: 'Master Bedroom & Guest Suites',
    });
  }
  levels.push({
    id: levelRoofId,
    name: 'Rooftop Sky Terrace & Solar Deck',
    elevation: isTwoStorey ? 5.8 : 3.0,
    height: 3.2,
    floorPlanVisible: false,
    floorFinishMaterial: 'Italian Micro-cement Terrazzo',
    floorFinishColor: '#94a3b8',
    slabThickness: 0.25,
    ceilingHeight: 3.2,
    structuralType: 'steel_deck',
    tilePattern: 'polished_terrazzo',
    targetOccupancy: 'Solar PV Array & Rooftop Green Canopy',
  });

  // Generate Ground Walls
  const walls: Wall[] = [
    { id: 'w_g_1', levelId: level0Id, start: { x: 3, y: 5 }, end: { x: 17, y: 5 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete' },
    { id: 'w_g_2', levelId: level0Id, start: { x: 17, y: 5 }, end: { x: 17, y: 19 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete' },
    { id: 'w_g_3', levelId: level0Id, start: { x: 17, y: 19 }, end: { x: 3, y: 19 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete' },
    { id: 'w_g_4', levelId: level0Id, start: { x: 3, y: 19 }, end: { x: 3, y: 5 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete' },

    // Internal dividers
    { id: 'w_g_5', levelId: level0Id, start: { x: 9, y: 13 }, end: { x: 9, y: 19 }, thickness: 0.22, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
    { id: 'w_g_6', levelId: level0Id, start: { x: 3, y: 13 }, end: { x: 9, y: 13 }, thickness: 0.22, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
    { id: 'w_g_7', levelId: level0Id, start: { x: 12, y: 13 }, end: { x: 12, y: 19 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
    { id: 'w_g_8', levelId: level0Id, start: { x: 12, y: 13 }, end: { x: 17, y: 13 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
    { id: 'w_g_9', levelId: level0Id, start: { x: 8, y: 5 }, end: { x: 8, y: 9.5 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
    { id: 'w_g_10', levelId: level0Id, start: { x: 3, y: 9.5 }, end: { x: 8, y: 9.5 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
  ];

  if (isTwoStorey) {
    walls.push(
      { id: 'w_1_1', levelId: level1Id, start: { x: 3, y: 5 }, end: { x: 17, y: 5 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_2', levelId: level1Id, start: { x: 17, y: 5 }, end: { x: 17, y: 18 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_3', levelId: level1Id, start: { x: 17, y: 18 }, end: { x: 3, y: 18 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_4', levelId: level1Id, start: { x: 3, y: 18 }, end: { x: 3, y: 5 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_5', levelId: level1Id, start: { x: 10, y: 5 }, end: { x: 10, y: 11 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' },
      { id: 'w_1_6', levelId: level1Id, start: { x: 3, y: 11 }, end: { x: 10, y: 11 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' }
    );
  }

  const doors: Door[] = [
    { id: 'd_1', levelId: level0Id, wallId: 'w_g_3', position: 0.75, width: 1.2, height: 2.4, swingDirection: 'pivot', doorType: 'pivot', material: 'Solid Timber' },
    { id: 'd_2', levelId: level0Id, wallId: 'w_g_3', position: 0.25, width: 4.8, height: 2.4, swingDirection: 'sliding', doorType: 'garage_double', material: 'Insulated Sectional' },
    { id: 'd_3', levelId: level0Id, wallId: 'w_g_1', position: 0.6, width: 4.0, height: 2.6, swingDirection: 'sliding', doorType: 'sliding', material: 'Double Low-E Glazed' },
    { id: 'd_4', levelId: level0Id, wallId: 'w_g_10', position: 0.6, width: 0.9, height: 2.1, swingDirection: 'inward_left', doorType: 'single', material: 'Timber flush' },
  ];

  const windows: Window[] = [
    { id: 'win_1', levelId: level0Id, wallId: 'w_g_1', position: 0.2, width: 2.2, height: 1.8, sillHeight: 0.6, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'overhang', operable: true },
    { id: 'win_2', levelId: level0Id, wallId: 'w_g_4', position: 0.3, width: 1.8, height: 1.5, sillHeight: 0.9, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'louvers', operable: true },
    { id: 'win_3', levelId: level0Id, wallId: 'w_g_2', position: 0.7, width: 1.6, height: 1.5, sillHeight: 0.9, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'none', operable: true },
  ];

  const rooms: Room[] = [
    {
      id: 'rm_living',
      levelId: level0Id,
      name: 'Open-Plan Living & Dining',
      type: 'open_plan_living',
      points: [{ x: 8, y: 5 }, { x: 17, y: 5 }, { x: 17, y: 13 }, { x: 8, y: 13 }],
      floorArea: 72.0,
      ceilingHeight: 3.0,
      occupancyCapacity: 8,
      minRequiredArea: 25.0,
      naturalLightScore: 'Excellent',
      ventilationScore: 'Excellent',
      accessibilityStatus: 'Compliant',
      finishFloorMaterial: 'FSC Engineered Oak',
      colorHex: '#0284c7',
    },
    {
      id: 'rm_kitchen',
      levelId: level0Id,
      name: 'Modern Kitchen & Scullery',
      type: 'kitchen',
      points: [{ x: 3, y: 9.5 }, { x: 8, y: 9.5 }, { x: 8, y: 13 }, { x: 3, y: 13 }],
      floorArea: 17.5,
      ceilingHeight: 3.0,
      occupancyCapacity: 4,
      minRequiredArea: 10.0,
      naturalLightScore: 'Good',
      ventilationScore: 'Good',
      accessibilityStatus: 'Compliant',
      finishFloorMaterial: 'Recycled Terrazzo',
      colorHex: '#0d9488',
    },
    {
      id: 'rm_office',
      levelId: level0Id,
      name: 'Home Office / Studio',
      type: 'office',
      points: [{ x: 3, y: 5 }, { x: 8, y: 5 }, { x: 8, y: 9.5 }, { x: 3, y: 9.5 }],
      floorArea: 22.5,
      ceilingHeight: 3.0,
      occupancyCapacity: 2,
      minRequiredArea: 9.0,
      naturalLightScore: 'Good',
      ventilationScore: 'Good',
      accessibilityStatus: 'Compliant',
      finishFloorMaterial: 'FSC Engineered Oak',
      colorHex: '#6366f1',
    },
    {
      id: 'rm_garage',
      levelId: level0Id,
      name: 'Double Garage',
      type: 'garage',
      points: [{ x: 3, y: 13 }, { x: 9, y: 13 }, { x: 9, y: 19 }, { x: 3, y: 19 }],
      floorArea: 36.0,
      ceilingHeight: 3.0,
      occupancyCapacity: 2,
      minRequiredArea: 30.0,
      naturalLightScore: 'Moderate',
      ventilationScore: 'Good',
      accessibilityStatus: 'Compliant',
      finishFloorMaterial: 'Polished Concrete',
      colorHex: '#64748b',
    },
  ];

  if (isTwoStorey) {
    rooms.push(
      {
        id: 'rm_master',
        levelId: level1Id,
        name: 'Master Bedroom Suite',
        type: 'bedroom_master',
        points: [{ x: 3, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 11 }, { x: 3, y: 11 }],
        floorArea: 42.0,
        ceilingHeight: 2.8,
        occupancyCapacity: 2,
        minRequiredArea: 14.0,
        naturalLightScore: 'Excellent',
        ventilationScore: 'Excellent',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#f59e0b',
      },
      {
        id: 'rm_bed2',
        levelId: level1Id,
        name: 'Bedroom 2',
        type: 'bedroom',
        points: [{ x: 10, y: 5 }, { x: 17, y: 5 }, { x: 17, y: 11 }, { x: 10, y: 11 }],
        floorArea: 42.0,
        ceilingHeight: 2.8,
        occupancyCapacity: 2,
        minRequiredArea: 10.0,
        naturalLightScore: 'Excellent',
        ventilationScore: 'Excellent',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#ec4899',
      }
    );
  }

  const totalArea = rooms.reduce((sum, r) => sum + r.floorArea, 0);

  const sustainability = computeSustainabilityScore(
    { rooms },
    lowerPrompt.includes('solar') ? 10.5 : 8.0,
    lowerPrompt.includes('rainwater') ? 12000 : 8000
  );

  const cost = computeCostEstimate(totalArea, buildingType, style, jurisdiction);

  const project: ArchitecturalProject = {
    id: `proj_${Date.now()}`,
    name: params?.name || (prompt.slice(0, 38) || 'Contemporary Sustainable Project'),
    description: prompt,
    buildingType,
    style,
    jurisdiction,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'schematic',
    isShared: false,
    targetBudgetUSD: cost.totalEstimatedCostUSD * 1.1,
    intendedOccupancy: 4,
    architectName: 'Elena Van Der Merwe, Pr.Arch',
    clientName: 'Client Account',
    companyName: 'Lora Architectural Studio',
    drawingNumberPrefix: 'LA-GEN-01',

    site: {
      siteAreaM2: siteArea,
      widthM: 20,
      depthM: siteArea / 20,
      setbackFrontM: 4.5,
      setbackRearM: 3.0,
      setbackSidesM: 2.0,
      orientationNorthDeg: 15,
      slopePct: 3,
      soilType: 'Stable Sandstone & Clay',
      maxBuildingHeightM: isTwoStorey ? 8.5 : 5.0,
      maxSiteCoveragePct: 50,
      maxFAR: 0.8,
      accessRoadFacing: 'South',
      existingTrees: 2,
    },

    climate: {
      location,
      latitude: jurisdiction === 'KE' ? -1.28 : jurisdiction === 'NG' ? 6.52 : jurisdiction === 'RW' ? -1.94 : -33.92,
      longitude: 18.42,
      climateZone: jurisdiction === 'KE' ? 'Equatorial Highland' : 'Mediterranean Coastal',
      averageSummerTempC: 26,
      averageWinterTempC: 15,
      annualRainfallMm: 700,
      solarIrradianceKwhM2Day: 5.9,
      prevailingWindDirection: 'SE Summer / NW Winter',
      passiveDesignRecommendations: [
        'Orient major living zones toward North/Equator for maximum natural daylight and winter solar heating',
        'Employ 1.2m roof overhangs for peak summer shading',
        'Operable clerestory windows for natural thermal stack ventilation',
      ],
    },

    levels,
    activeLevelId: level0Id,
    walls,
    doors,
    windows,
    columns: [
      { id: 'col_1', levelId: level0Id, position: { x: 10, y: 9.5 }, shape: 'rectangular', width: 0.3, depth: 0.3, material: 'Concrete' },
    ],
    stairs: isTwoStorey
      ? [{ id: 'stair_1', levelId: level0Id, start: { x: 9.5, y: 13.5 }, end: { x: 9.5, y: 17.5 }, width: 1.1, treadsCount: 16, stairType: 'straight' }]
      : [],
    rooms,
    furniture: [
      { id: 'f_1', levelId: level0Id, roomId: 'rm_living', type: 'sofa_sectional', position: { x: 13, y: 8 }, rotation: 0, width: 3.2, depth: 2.4 },
      { id: 'f_2', levelId: level0Id, roomId: 'rm_kitchen', type: 'kitchen_island', position: { x: 5.5, y: 11 }, rotation: 0, width: 2.6, depth: 1.1 },
    ],
    dimensions: [
      { id: 'd_1', levelId: level0Id, start: { x: 3, y: 4.2 }, end: { x: 17, y: 4.2 }, offset: 0.8, label: '14.00 m' },
    ],
    annotations: [
      { id: 'a_1', levelId: level0Id, position: { x: 10, y: 2.5 }, text: 'NORTH GARDEN & SOLAR ORIENTATION', fontSize: 13, type: 'label' },
    ],

    sustainability,
    cost,
    validationErrors: [],

    versions: [
      {
        id: `ver_${Date.now()}`,
        versionNumber: 1,
        name: 'Version 1 — Initial AI Concept',
        timestamp: new Date().toISOString(),
        author: 'Lora AI Engine',
        changeSummary: 'Generated base parametric model from prompt.',
        modelSnapshot: null,
      },
    ],
    comments: [],
  };

  project.validationErrors = validateSpaceDesign(project);
  return project;
}

// Generate 5 Distinct Design Alternatives
export function generateDesignAlternatives(baseProject: ArchitecturalProject): DesignOption[] {
  const baseArea = baseProject.rooms.reduce((acc, r) => acc + r.floorArea, 0) || 220;
  const baseCost = baseProject.cost.totalEstimatedCostUSD || 350000;

  return [
    {
      id: 'opt_space',
      name: 'Option A — Maximum Space Program',
      tagline: 'Expansive volume & dual entertainment zones',
      focus: 'space',
      floorAreaM2: Math.round(baseArea * 1.22),
      estimatedCostUSD: Math.round(baseCost * 1.18),
      energySavingsPct: 24.5,
      waterSavingsPct: 28.0,
      materialEfficiencyScore: 78,
      daylightScorePct: 88,
      ventilationScorePct: 82,
      sustainabilityRating: 'EDGE Standard (24% Energy)',
      previewDescription: 'Maximized footprint incorporating double-volume living area, extended scullery, and generous guest suites.',
    },
    {
      id: 'opt_sustainability',
      name: 'Option B — EDGE Net-Zero Optimized',
      tagline: 'High-performance bioclimatic envelope & 42% energy cut',
      focus: 'sustainability',
      floorAreaM2: Math.round(baseArea * 1.05),
      estimatedCostUSD: Math.round(baseCost * 1.08),
      energySavingsPct: 42.8,
      waterSavingsPct: 46.5,
      materialEfficiencyScore: 94,
      daylightScorePct: 96,
      ventilationScorePct: 95,
      sustainabilityRating: 'EDGE Advanced / Zero Carbon Ready',
      previewDescription: 'Integrated 12kWp solar canopy, 15,000L rainwater harvesting, thermal chimney, and FSC Mass timber CLT.',
    },
    {
      id: 'opt_cost',
      name: 'Option C — Cost & Value Optimized',
      tagline: 'Efficient structural grid minimizing construction budget',
      focus: 'cost',
      floorAreaM2: Math.round(baseArea * 0.92),
      estimatedCostUSD: Math.round(baseCost * 0.84),
      energySavingsPct: 28.0,
      waterSavingsPct: 32.0,
      materialEfficiencyScore: 88,
      daylightScorePct: 84,
      ventilationScorePct: 86,
      sustainabilityRating: 'EDGE Certified (28% Energy)',
      previewDescription: 'Standardized 4.5m structural spans, localized masonry, and compact MEP routing saving ~16% on capital expenditure.',
    },
    {
      id: 'opt_architectural',
      name: 'Option D — Premium Architectural Statement',
      tagline: 'Dramatic cantilevers, fluted glass & seamless indoor-outdoor living',
      focus: 'architectural',
      floorAreaM2: Math.round(baseArea * 1.15),
      estimatedCostUSD: Math.round(baseCost * 1.32),
      energySavingsPct: 35.0,
      waterSavingsPct: 36.0,
      materialEfficiencyScore: 82,
      daylightScorePct: 98,
      ventilationScorePct: 90,
      sustainabilityRating: 'EDGE Certified Premium',
      previewDescription: 'Sculptural exposed concrete planes, timber rainscreen facades, oversized pocket glass doors, and infinity pool axis.',
    },
    {
      id: 'opt_passive',
      name: 'Option E — Pure Passive Solar & Wind',
      tagline: 'Zero-mechanical climate comfort harnessing micro-climate',
      focus: 'passive',
      floorAreaM2: Math.round(baseArea * 1.0),
      estimatedCostUSD: Math.round(baseCost * 1.02),
      energySavingsPct: 38.5,
      waterSavingsPct: 40.0,
      materialEfficiencyScore: 92,
      daylightScorePct: 94,
      ventilationScorePct: 98,
      sustainabilityRating: 'EDGE Certified Passive',
      previewDescription: 'Elongated East-West axis with deep seasonal solar overhangs, thermal mass walls, and cross-ventilation breeze corridors.',
    },
  ];
}
