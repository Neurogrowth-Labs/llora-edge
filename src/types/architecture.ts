export type BuildingType =
  | 'Residential'
  | 'Apartment'
  | 'Office'
  | 'Retail'
  | 'Restaurant'
  | 'Hotel'
  | 'School'
  | 'Hospital'
  | 'Clinic'
  | 'Warehouse'
  | 'Industrial'
  | 'Mixed-use'
  | 'Religious building'
  | 'Community building'
  | 'Sports facility'
  | 'Government building'
  | 'Custom building';

export type ArchitecturalStyle =
  | 'Contemporary'
  | 'Minimalist'
  | 'Biophilic Modern'
  | 'Tropical Modern'
  | 'Scandinavian'
  | 'Industrial Loft'
  | 'Vernacular / Earth'
  | 'Brutalist'
  | 'Traditional';

export type JurisdictionCode =
  | 'ZA' // South Africa (SANS 10400 / SANS 204)
  | 'KE' // Kenya (National Building Code / Green Building Standard)
  | 'NG' // Nigeria (National Building Code / West Africa Green Standard)
  | 'GH' // Ghana (Ghana Building Code GS 1207)
  | 'RW' // Rwanda (Rwanda Green Building Minimum Compliance)
  | 'TZ' // Tanzania (National Building Act & Regulations)
  | 'ZM' // Zambia (Building Regulations & ZABS)
  | 'UG' // Uganda (Building Control Act)
  | 'AO' // Angola (Regulamento de Edificações Urbanas)
  | 'GB' // United Kingdom (Approved Documents Part L & O)
  | 'US' // United States (IBC / IECC / LEED)
  | 'EU'; // European Union (Eurocodes)

export interface JurisdictionRule {
  code: JurisdictionCode;
  name: string;
  country: string;
  buildingCodeName: string;
  minHabitableRoomArea: number; // m²
  minCeilingHeight: number; // m
  minCorridorWidth: number; // m
  minDoorWidth: number; // m
  minWindowToFloorRatio: number; // %
  defaultClimateZone: string;
  prevailingWind: string;
  solarLatitude: number;
}

export type DrawingTool =
  | 'select'
  | 'pan'
  | 'wall'
  | 'door'
  | 'window'
  | 'column'
  | 'stair'
  | 'room'
  | 'furniture'
  | 'dimension'
  | 'text'
  | 'measure'
  | 'line'
  | 'polyline'
  | 'circle'
  | 'arc'
  | 'rectangle'
  | 'polygon'
  | 'ellipse'
  | 'spline'
  | 'point'
  | 'hatch'
  | 'ray'
  | 'xline';

export interface Point2D {
  x: number;
  y: number;
}

/** Lightweight 2D CAD entities retained alongside the architectural BIM model. */
export interface DraftingEntity {
  id: string;
  levelId: string;
  kind: 'line' | 'polyline' | 'circle' | 'arc' | 'rectangle' | 'polygon' | 'ellipse' | 'spline' | 'point' | 'hatch' | 'ray' | 'xline';
  points: Point2D[];
  radius?: number;
  rotation?: number;
}

export interface Wall {
  id: string;
  levelId: string;
  start: Point2D;
  end: Point2D;
  thickness: number; // in meters (e.g. 0.22m for external, 0.11m for internal)
  height: number; // in meters (e.g. 2.8m or 3.0m)
  type: 'external' | 'internal' | 'curtain_glass' | 'retaining' | 'timber_partition';
  materialId: string;
  fireRatingMinutes?: number;
  uValue?: number; // W/m²K
}

export interface Door {
  id: string;
  levelId: string;
  wallId: string;
  position: number; // 0 to 1 along wall segment
  width: number; // in meters (e.g. 0.9m)
  height: number; // in meters (e.g. 2.1m)
  swingDirection: 'inward_left' | 'inward_right' | 'outward_left' | 'outward_right' | 'sliding' | 'double' | 'pivot';
  doorType: 'single' | 'double' | 'sliding' | 'pivot' | 'garage_double' | 'bifold';
  material: string;
  fireRatingMinutes?: number;
}

export interface Window {
  id: string;
  levelId: string;
  wallId: string;
  position: number; // 0 to 1 along wall segment
  width: number; // in meters (e.g. 1.8m)
  height: number; // in meters (e.g. 1.5m)
  sillHeight: number; // in meters from floor (e.g. 0.9m)
  glazingType: 'double_low_e' | 'triple_insulated' | 'single_clear' | 'tinted_solar_control';
  frameMaterial: 'timber' | 'thermal_aluminum' | 'upvc' | 'steel';
  shadingType?: 'none' | 'overhang' | 'louvers' | 'solar_screen';
  operable: boolean;
}

export interface Column {
  id: string;
  levelId: string;
  position: Point2D;
  shape: 'rectangular' | 'circular';
  width: number; // meters
  depth: number; // meters
  material: string;
}

export interface Stair {
  id: string;
  levelId: string;
  start: Point2D;
  end: Point2D;
  width: number;
  treadsCount: number;
  stairType: 'straight' | 'l_shaped' | 'u_shaped' | 'spiral';
}

export interface Furniture {
  id: string;
  levelId: string;
  roomId?: string;
  type:
    | 'bed_king'
    | 'bed_single'
    | 'sofa_3seater'
    | 'sofa_sectional'
    | 'dining_table_6'
    | 'kitchen_island'
    | 'desk_office'
    | 'toilet'
    | 'shower'
    | 'bathtub'
    | 'vanity'
    | 'car_sedan'
    | 'car_suv'
    | 'solar_panel_array'
    | 'plant_pot'
    | 'swimming_pool'
    | 'patio_table';
  position: Point2D;
  rotation: number; // degrees
  width: number;
  depth: number;
}

export interface Room {
  id: string;
  levelId: string;
  name: string;
  type:
    | 'living'
    | 'kitchen'
    | 'dining'
    | 'bedroom_master'
    | 'bedroom'
    | 'bathroom_ensuite'
    | 'bathroom'
    | 'office'
    | 'garage'
    | 'hallway'
    | 'terrace'
    | 'utility'
    | 'balcony'
    | 'open_plan_living'
    | 'custom';
  points: Point2D[]; // Polygon vertices in clockwise or counterclockwise
  floorArea: number; // m²
  ceilingHeight: number; // meters
  occupancyCapacity: number;
  minRequiredArea: number; // m² based on code
  naturalLightScore: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
  ventilationScore: 'Poor' | 'Moderate' | 'Good' | 'Excellent';
  accessibilityStatus: 'Compliant' | 'Needs Review' | 'Non-Compliant';
  finishFloorMaterial: string;
  colorHex?: string;
}

export interface DimensionLine {
  id: string;
  levelId: string;
  start: Point2D;
  end: Point2D;
  offset: number; // perpendicular offset distance
  label?: string;
}

export interface TextAnnotation {
  id: string;
  levelId: string;
  position: Point2D;
  text: string;
  fontSize: number;
  type: 'label' | 'dimension' | 'note' | 'elevation_mark' | 'section_mark';
}

export interface Level {
  id: string;
  name: string; // e.g. "Ground Floor", "First Floor", "Roof Level"
  elevation: number; // meters (e.g. 0.0, 3.2, 6.4)
  height: number; // meters
  floorPlanVisible: boolean;
  floorFinishMaterial?: string;
  floorFinishColor?: string;
  slabThickness?: number;
  ceilingHeight?: number;
  structuralType?: 'post_tensioned_concrete' | 'mass_timber_clt' | 'steel_deck' | 'reinforced_concrete';
  tilePattern?: 'herringbone_parquet' | 'travertine_stone' | 'polished_terrazzo' | 'concrete_slab' | 'acoustic_carpet';
  targetOccupancy?: string;
}

export interface MaterialDef {
  id: string;
  name: string;
  category:
    | 'Concrete'
    | 'Brick'
    | 'Block'
    | 'Timber'
    | 'Steel'
    | 'Glass'
    | 'Aluminium'
    | 'Stone'
    | 'Tiles'
    | 'Insulation'
    | 'Roofing'
    | 'Flooring'
    | 'Paint'
    | 'Landscaping'
    | 'Solar';
  description: string;
  costPerM2: number; // USD / unit
  embodiedCarbonKgCO2e: number; // kg CO2e per kg or m²
  uValue: number; // Thermal conductivity W/m²K
  recycledContentPct: number;
  colorHex: string;
  roughness: number;
  metalness: number;
  texturePattern?: string;
  isEcoPreferred: boolean;
}

export interface SustainabilityMetrics {
  energySavingsPct: number; // e.g. 32%
  waterSavingsPct: number; // e.g. 38%
  embodiedCarbonSavingsPct: number; // e.g. 24%
  edgeEligible: boolean; // >= 20% in all 3 categories
  annualEnergyKwhPerM2: number;
  annualWaterM3PerOccupant: number;
  embodiedCarbonKgCO2ePerM2: number;
  solarPvCapacityKwp: number;
  solarAnnualGenerationKwh: number;
  rainwaterHarvestingCapacityLiters: number;
  windowToWallRatioPct: number;
  naturalVentilationRatioPct: number;
  permeableSiteAreaPct: number;
  activeStrategies: string[];
}

export interface CostBreakdownItem {
  category: string;
  description: string;
  amountUSD: number;
  pctOfTotal: number;
}

export interface CostEstimate {
  totalEstimatedCostUSD: number;
  costPerM2: number;
  currency: string;
  breakdown: CostBreakdownItem[];
  regionalFactor: number;
  confidence: 'Preliminary Concept' | 'Schematic' | 'Detailed';
}

export interface SiteData {
  siteAreaM2: number; // e.g. 600 m²
  widthM: number;
  depthM: number;
  setbackFrontM: number;
  setbackRearM: number;
  setbackSidesM: number;
  orientationNorthDeg: number; // 0 to 360 deg
  slopePct: number;
  soilType: string;
  maxBuildingHeightM: number;
  maxSiteCoveragePct: number; // e.g. 50%
  maxFAR: number; // Floor Area Ratio e.g. 1.0
  accessRoadFacing: 'North' | 'South' | 'East' | 'West';
  existingTrees: number;
}

export interface ClimateData {
  location: string;
  latitude: number;
  longitude: number;
  climateZone: string;
  averageSummerTempC: number;
  averageWinterTempC: number;
  annualRainfallMm: number;
  solarIrradianceKwhM2Day: number;
  prevailingWindDirection: string;
  passiveDesignRecommendations: string[];
}

export interface SpaceValidationError {
  id: string;
  severity: 'warning' | 'error' | 'info';
  type:
    | 'no_door'
    | 'no_window'
    | 'tight_corridor'
    | 'insufficient_daylight'
    | 'insufficient_ventilation'
    | 'door_collision'
    | 'accessibility_violation'
    | 'setback_violation'
    | 'travel_distance';
  message: string;
  location?: Point2D;
  roomId?: string;
  suggestedFix: string;
}

export interface DesignOption {
  id: string;
  name: string;
  tagline: string;
  focus: 'space' | 'sustainability' | 'cost' | 'architectural' | 'passive';
  floorAreaM2: number;
  estimatedCostUSD: number;
  energySavingsPct: number;
  waterSavingsPct: number;
  materialEfficiencyScore: number; // 0-100
  daylightScorePct: number;
  ventilationScorePct: number;
  sustainabilityRating: string;
  previewDescription: string;
}

export interface VersionSnapshot {
  id: string;
  versionNumber: number;
  name: string;
  timestamp: string;
  author: string;
  changeSummary: string;
  modelSnapshot?: any;
  metrics?: {
    floorAreaM2: number;
    totalCostUSD: number;
    energySavingsPct: number;
    waterSavingsPct: number;
    intelligenceScore: number;
    roomCount: number;
    wallCount: number;
  };
}

export interface RoomDaylightMetrics {
  roomId: string;
  roomName: string;
  roomType: string;
  levelId: string;
  floorAreaM2: number;
  windowAreaM2: number;
  windowToFloorRatioPct: number;
  primaryOrientation: 'North' | 'South' | 'East' | 'West' | 'Interior';
  averageLux: number;
  peakLux: number;
  minLux: number;
  daylightFactorPct: number; // DF % e.g. 2.8%
  spatialDaylightAutonomyPct: number; // sDA % (>= 300 lux for >50% hours)
  annualSunlightExposurePct: number; // ASE % (potential glare >1000 lux)
  uniformityRatio: number; // min/avg
  comfortRating: 'Optimal Daylight' | 'Well Lit' | 'Moderate' | 'Undersupplied' | 'High Glare Risk';
  codeCompliance: {
    standard: string;
    isCompliant: boolean;
    requiredDFPct: number;
    requiredWFR: number;
    note: string;
  };
  recommendation?: string;
}

export interface DaylightHeatmapCell {
  x: number; // world coord X in meters
  y: number; // world coord Y in meters
  lux: number;
  normalizedLux: number; // 0.0 to 1.0 for color ramp
  colorHex: string;
  isSDACompliant: boolean;
  roomId?: string;
}

export type SimulationSeason = 'summer_solstice' | 'equinox' | 'winter_solstice';
export type SimulationSkyCondition = 'clear' | 'partly_cloudy' | 'overcast';

export interface DaylightSimulationConfig {
  timeOfDay: number; // 6.0 to 18.0 (hours)
  season: SimulationSeason;
  skyCondition: SimulationSkyCondition;
  directNormalIrradianceW: number;
  diffuseHorizontalIrradianceW: number;
  solarAltitudeDeg: number;
  solarAzimuthDeg: number;
}

export interface DaylightAnalysisResult {
  config: DaylightSimulationConfig;
  overallDaylightAutonomyPct: number; // Average sDA
  averageBuildingLux: number;
  averageDaylightFactorPct: number;
  leedCompliancePct: number;
  breeamCompliancePct: number;
  edgeComplianceStatus: 'Passed' | 'Review Required';
  roomMetrics: RoomDaylightMetrics[];
  heatmapGrid: DaylightHeatmapCell[];
  facadeSolarExposure: {
    northKwhM2: number;
    southKwhM2: number;
    eastKwhM2: number;
    westKwhM2: number;
  };
}

export interface StructuralIssue {
  id: string;
  code: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Unsupported Span' | 'Excessive Load' | 'Missing Support' | 'Cantilever Overhang' | 'Grid Discontinuity';
  levelId: string;
  levelName: string;
  roomId?: string;
  roomName?: string;
  position?: Point2D;
  spanLengthM?: number;
  maxAllowedSpanM?: number;
  loadDescription?: string;
  structuralRisk: string;
  recommendedSolution: string;
  aiActionPrompt: string;
  status: 'pending' | 'applied';
}

export interface StructuralAnalysisReport {
  overallHealthScore: number; // 0 to 100
  status: 'Sound Structural Integrity' | 'Minor Non-Compliances' | 'Critical Structural Risks';
  totalIssuesCount: number;
  criticalIssuesCount: number;
  highIssuesCount: number;
  mediumIssuesCount: number;
  maxDetectedSpanM: number;
  criticalSpansCount: number;
  unsupportedWallCount: number;
  cantileverWarningsCount: number;
  issues: StructuralIssue[];
  lastEvaluated: string;
}

export interface CommentItem {
  id: string;
  author: string;
  authorRole: 'Architect' | 'Client' | 'Structural Engineer' | 'Sustainability Consultant' | 'Contractor';
  timestamp: string;
  text: string;
  resolved: boolean;
  position?: Point2D;
  levelId?: string;
}

export interface DesignDNA {
  projectTypology: string; // e.g. "Mixed-Use Sustainable Development", "Biophilic Residence"
  architecturalLanguage: string; // e.g. "Contemporary African Biophilic"
  priorities: {
    sustainabilityPct: number; // e.g. 40
    costPct: number; // e.g. 25
    aestheticsPct: number; // e.g. 20
    speedPct: number; // e.g. 15
  };
  climateContext: string; // e.g. "Warm Temperate / Mediterranean (Cape Town)"
  targetCertification: 'EDGE Advanced' | 'EDGE Certified' | 'Green Star SA 5-Star' | 'LEED Platinum' | 'Net Zero Carbon' | 'Standard Code';
  targetStoreys: number;
  occupancyTarget: number;
  materialPhilosophy: string;
}

export interface IntelligenceScoreCategory {
  name: string;
  key:
    | 'spatialEfficiency'
    | 'daylight'
    | 'ventilation'
    | 'energy'
    | 'water'
    | 'materials'
    | 'accessibility'
    | 'costEfficiency'
    | 'constructability'
    | 'sustainability';
  score: number; // 0 to 100
  weightPct: number;
  status: 'Critical' | 'Needs Review' | 'Good' | 'Optimal';
  diagnosticSummary: string;
  keyMetrics: string;
}

export interface BuildingIntelligenceScore {
  overallScore: number; // 0 to 100
  ratingTier: 'A+ High Performance' | 'A High Efficiency' | 'B Standard Code' | 'C Needs Optimization';
  categories: IntelligenceScoreCategory[];
  lastEvaluated: string;
  changeDelta: number; // e.g. +4 since last change
}

export interface DependencyImpact {
  affectedSystem:
    | 'Structure & Framing'
    | 'Stairs & Vertical Egress'
    | 'Elevators & Accessibility'
    | 'Fire & Smoke Strategy'
    | 'Parking & Site Capacity'
    | 'Gross Floor Area (GFA)'
    | 'Energy & HVAC Load'
    | 'Water & Plumbing Ingress'
    | 'Façade Solar Exposure'
    | 'Daylight & Solar Exposure'
    | 'Roof & Drainage'
    | 'Documentation & Schedules';
  impactDescription: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  suggestedAction: string;
}

export interface ExplainableDecision {
  id: string;
  title: string;
  whatChanged: string;
  whyItChanged: string;
  whatItAffects: string[];
  expectedBenefit: string;
  possibleTradeoffs: string;
  timestamp: string;
}

export interface AIActionLogItem {
  id: string;
  actionType: string;
  title: string;
  explanation: ExplainableDecision;
  dependencies: DependencyImpact[];
  timestamp: string;
  status: 'applied' | 'pending_approval' | 'rejected' | 'reverted';
}

export interface DeveloperIntelligenceMetrics {
  grossFloorAreaM2: number; // GFA
  netFloorAreaM2: number; // NFA
  rentableAreaM2: number; // Rentable Area
  buildingEfficiencyPct: number; // NFA / GFA ratio e.g. 84.5%
  estimatedUnitsCount: number;
  parkingSpacesProvided: number;
  parkingSpacesRequired: number;
  capitalCostPerM2USD: number;
  totalCapExUSD: number;
  projectedAnnualRentalYieldUSD: number;
  estimatedRoiPct: number;
  paybackPeriodYears: number;
}

export interface OptimizerObjective {
  maximizeDaylight: boolean;
  maximizeRentableArea: boolean;
  maximizeNaturalVentilation: boolean;
  minimizeConstructionCost: boolean;
  minimizeEnergyDemand: boolean;
  minimizeWaterDemand: boolean;
  minimizeEmbodiedCarbon: boolean;
  respectSiteBoundaries: boolean;
  respectMaxHeight: boolean;
}

export interface OptimizerDesignCandidate {
  iterationNumber: number;
  optionCode: string;
  name: string;
  compositeScore: number;
  floorAreaM2: number;
  costUSD: number;
  energySavingsPct: number;
  waterSavingsPct: number;
  daylightFactorPct: number;
  ventilationPct: number;
  constructabilityScore: number;
  carbonReductionPct: number;
  keyModification: string;
  isParetoOptimal: boolean;
  isSelectedRecommendation?: boolean;
}

export interface OptimizerSimulationResult {
  totalIterationsRun: number;
  recommendedOptionCode: string;
  recommendedReasoning: string;
  candidates: OptimizerDesignCandidate[];
  baselineScore: number;
  optimizedScore: number;
  improvementPct: number;
}

export interface ClientProposalRequest {
  id: string;
  clientName: string;
  timestamp: string;
  userPrompt: string;
  aiInterpretation: string;
  status: 'pending_review' | 'approved_and_applied' | 'rejected';
  estimatedCostImpactUSD: number;
  estimatedDaylightImpact: string;
  suggestedActionType: string;
}

export interface ArchitecturalProject {
  /** Native 2D geometry used for CAD drafting tools. */
  draftingEntities?: DraftingEntity[];
  id: string;
  name: string;
  description: string;
  buildingType: BuildingType;
  style: ArchitecturalStyle;
  jurisdiction: JurisdictionCode;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'schematic' | 'in_review' | 'completed';
  isShared: boolean;
  isTemplate?: boolean;

  // Design DNA
  dna?: DesignDNA;

  // Spatial & Site
  site: SiteData;
  climate: ClimateData;
  targetBudgetUSD: number;
  intendedOccupancy: number;

  // Levels & Geometry
  levels: Level[];
  activeLevelId: string;
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  columns: Column[];
  stairs: Stair[];
  rooms: Room[];
  furniture: Furniture[];
  dimensions: DimensionLine[];
  annotations: TextAnnotation[];

  // Analysis & Performance
  sustainability: SustainabilityMetrics;
  cost: CostEstimate;
  validationErrors: SpaceValidationError[];
  intelligenceScore?: BuildingIntelligenceScore;
  developerMetrics?: DeveloperIntelligenceMetrics;

  // AI & Action History
  actionLogs?: AIActionLogItem[];
  clientProposals?: ClientProposalRequest[];

  // Metadata & Collaboration
  versions: VersionSnapshot[];
  comments: CommentItem[];
  architectName: string;
  clientName: string;
  companyName: string;
  drawingNumberPrefix: string;
}

export type DataState =
  | 'LIVE'
  | 'SYNCED'
  | 'ESTIMATED'
  | 'VERIFIED'
  | 'STALE'
  | 'ERROR';

export interface DataStateMetadata {
  state: DataState;
  lastUpdated?: string;
  source?: string;
  verificationAgent?: string;
  confidenceScore?: number;
  errorMessage?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text: string;
  actionsExecuted?: {
    type: string;
    description: string;
  }[];
  suggestions?: string[];
  generatingState?:
    | 'idle'
    | 'interpreting'
    | 'generating_spaces'
    | 'creating_geometry'
    | 'validating'
    | 'analyzing_sustainability'
    | 'creating_3d'
    | 'complete';
}
