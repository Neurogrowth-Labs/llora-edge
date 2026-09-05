import { DataState, Point2D } from './architecture';

// ==========================================
// 1. SPATIAL COPILOT & AI AGENTS
// ==========================================

export type SpatialAgentRole =
  | 'ARCHITECT_AGENT'
  | 'ENGINEER_AGENT'
  | 'CONSTRUCTION_AGENT'
  | 'SAFETY_AGENT'
  | 'MATERIAL_AGENT'
  | 'DEMOLITION_AGENT'
  | 'ROBOT_AGENT'
  | 'SUSTAINABILITY_AGENT'
  | 'PROJECT_MANAGER_AGENT';

export interface SpatialAgent {
  id: SpatialAgentRole;
  name: string;
  shortTitle: string;
  avatarIcon: string;
  specialty: string;
  color: string;
  status: 'active' | 'evaluating' | 'idle';
  lastInsight: string;
}

export interface SpatialQueryInterpretation {
  rawQuery: string;
  agentRole: SpatialAgentRole;
  intent:
    | 'DEMOLITION_FILTER'
    | 'MATERIAL_RECOVERY'
    | 'SPATIAL_CLASH_AUDIT'
    | 'GENERATIVE_OPTIONS'
    | 'PLAN_DEMOLITION'
    | 'NATURAL_LANGUAGE_CAD'
    | 'PROJECT_HEALTH_EVAL'
    | 'ROBOT_DISPATCH'
    | 'CARBON_SCENARIOS'
    | 'INSPECTION_AUDIT';
  spatialFilter?: {
    center?: Point2D;
    radiusMeters?: number;
    buildingIds?: string[];
    zoneId?: string;
    levelId?: string;
  };
  cadCommand?: {
    action: 'CREATE_FOOTPRINT' | 'ADD_ROAD' | 'DIVIDE_FLOOR' | 'TRANSLATE_BUILDING' | 'ADD_ELEMENT';
    parameters: Record<string, any>;
  };
  explanation: string;
  confidenceScore: number;
}

// ==========================================
// 2. LIVING DIGITAL TWIN & REALITY CAPTURE
// ==========================================

export type RealityCaptureType =
  | 'LiDAR'
  | 'Point_Cloud'
  | 'Drone_Photogrammetry'
  | '360_Camera'
  | 'Mobile_LiDAR'
  | 'Existing_CAD'
  | 'IFC_BIM';

export interface RealityCaptureDataset {
  id: string;
  name: string;
  type: RealityCaptureType;
  capturedAt: string;
  fileSizeMb: number;
  pointCount?: number;
  accuracyMm: number;
  processedBimElementsCount: number;
  deviationMaxMm: number;
  status: 'RAW_UPLOADED' | 'AI_VECTORIZING' | 'BIM_OBJECTIFIED' | 'TWIN_SYNCHRONIZED';
  coverageZone: string;
  downloadUrl?: string;
}

export interface DeviationAnomaly {
  id: string;
  elementId: string;
  elementName: string;
  type: 'POSITION_SHIFT' | 'MISSING_ELEMENT' | 'UNEXPECTED_OBSTACLE' | 'STRUCTURAL_DEFLECTION' | 'UNSAFE_PROXIMITY';
  deviationMm: number;
  toleranceAllowedMm: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  location: Point2D & { z?: number };
  detectedBy: RealityCaptureType;
  remedialAction: string;
}

// ==========================================
// 3. AI MATERIAL SCANNER & MATERIAL PASSPORT
// ==========================================

export type ScannableMaterialType =
  | 'Concrete'
  | 'Steel'
  | 'Brick'
  | 'Wood / Timber'
  | 'Glass'
  | 'Aluminum'
  | 'Copper'
  | 'Plastics'
  | 'Asphalt'
  | 'Gypsum'
  | 'Mixed Materials';

export interface MaterialInventoryItem {
  id: string;
  material: ScannableMaterialType;
  estimatedQuantityTonnes: number;
  verifiedQuantityTonnes?: number;
  isVerified: boolean;
  confidenceScore: number; // e.g. 0.94 -> 94%
  recoveryGrade: 'Very High' | 'High' | 'Medium' | 'Low';
  conditionGrade: 'A - Pristine' | 'B - Reusable with minor cleaning' | 'C - Recyclable aggregate' | 'D - Non-recoverable';
  embodiedCarbonKgCO2ePerTonne: number;
  recoverableCarbonKgCO2e: number;
  estimatedResaleValueZAR: number;
  hazardousNotes?: string;
  disassemblyMethod: 'Selective Unbolting' | 'Hydraulic Shear Cutting' | 'Concrete Crushing' | 'Manual Dismantling';
}

export interface BuildingMaterialPassport {
  buildingId: string;
  buildingName: string;
  constructionYear: number;
  grossFloorAreaM2: number;
  structuralType: string;
  totalMassTonnes: number;
  materials: MaterialInventoryItem[];
  circularityScore: number; // 0 - 100
  totalEmbodiedCarbonTCO2e: number;
  totalRecoverableCarbonTCO2e: number;
  totalEstimatedSalvageValueZAR: number;
  landfillDiversionTargetPct: number;
  deconstructionReadinessIndex: number; // 0 - 100
  qrPassportCode: string;
  lastInspectionDate: string;
}

// ==========================================
// 4. AI DEMOLITION & CIRCULARITY SIMULATOR
// ==========================================

export type DemolitionStrategyType =
  | 'MECHANICAL_DEMOLITION'
  | 'SELECTIVE_DECONSTRUCTION'
  | 'HYBRID_ROBOTIC_DEMOLITION';

export interface DemolitionSequenceStep {
  stepNumber: number;
  title: string;
  targetElement: string;
  safetyZoneRadiusMeters: number;
  equipmentRequired: string[];
  robotAssignedId?: string;
  estimatedHours: number;
  wasteStream: ScannableMaterialType;
  recoveryVolumeTonnes: number;
  dustSuppressionActive: boolean;
}

export interface DemolitionPlanScenario {
  id: string;
  strategy: DemolitionStrategyType;
  name: string;
  description: string;
  costEstimateZAR: number;
  durationDays: number;
  wasteToLandfillTonnes: number;
  recoveredMaterialsTonnes: number;
  netCarbonEmissionsTCO2e: number;
  safetyRiskIndex: number; // 0 - 100 (lower is safer)
  robotFleetRequiredCount: number;
  transportTruckTrips: number;
  sequenceSteps: DemolitionSequenceStep[];
}

// ==========================================
// 5. GENERATIVE SITE & BUILDING OPTIONEERING
// ==========================================

export interface GenerativeSiteGoal {
  siteAreaM2: number;
  buildingType: string;
  targetHeightFloors: number;
  parkingSpacesTarget: number;
  carbonTarget: 'Ultra-Low (Net Zero)' | 'Low (<350 kg/m²)' | 'Standard';
  budgetZAR: number;
  primaryObjective: 'MAX_NATURAL_LIGHT' | 'MAX_FAR_DENSITY' | 'MIN_CARBON' | 'BALANCED_ROI';
}

export interface GenerativeDesignOption {
  id: string;
  title: string;
  buildingFootprintM2: number;
  floorsCount: number;
  grossInternalAreaM2: number;
  parkingProvided: number;
  estimatedCostZAR: number;
  embodiedCarbonPerM2: number;
  annualEnergyKwhPerM2: number;
  daylightFactorScore: number;
  constructabilityScore: number;
  overallSuitabilityRank: number;
  geometrySnapshotKey: string;
  keyStrengths: string[];
  tradeoffs: string[];
}

// ==========================================
// 6. AI CLASH DETECTION 2.0 (SPATIAL RISK ENGINE)
// ==========================================

export type ClashCategory =
  | 'GEOMETRY_INTERFERENCE'     // Pipe vs beam
  | 'CONSTRUCTION_CRANE_PATH'   // Crane radius vs active building
  | 'SCHEDULE_TRADES_CONFLICT'  // Plumbers & ceiling installers in same room same hour
  | 'ROBOT_ZONE_HAZARD'         // Robot path intersects human active zone
  | 'SAFETY_PROXIMITY'          // Heavy equipment too close to workers
  | 'LOGISTICS_ACCESS_BLOCK';   // Concrete delivery blocks primary crane access

export interface AdvancedClashItem {
  id: string;
  title: string;
  category: ClashCategory;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: Point2D & { z?: number; zoneName?: string };
  entitiesInvolved: string[];
  tradeDisciplines: string[];
  conflictTimestamp?: string;
  delayRiskDays: number;
  costRiskZAR: number;
  aiSuggestedResolution: string;
  isResolved: boolean;
}

// ==========================================
// 7. PREDICTIVE CONSTRUCTION INTELLIGENCE & 4D TIMELINE
// ==========================================

export interface ProjectHealthMetrics {
  overallHealthScore: number; // 0 - 100
  scheduleScore: number;
  costScore: number;
  safetyScore: number;
  qualityScore: number;
  sustainabilityScore: number;
  materialsSupplyScore: number;
  spatialRiskScore: number;
  scheduleDelayProbabilityPct: number;
  criticalActivityAtRisk: string;
  forecastedCostImpactZAR: number;
  activeRiskCount: number;
}

export interface Timeline4DPhase {
  monthIndex: number;
  monthName: string;
  phaseName: string;
  plannedCompletionPct: number;
  actualProgressPct: number;
  activeTradesCount: number;
  materialsDeliveredTonnes: number;
  cumulativeCarbonTCO2e: number;
  activeEquipment: string[];
  whatIfDelayScenario?: {
    materialName: string;
    delayDays: number;
    projectedEndSlipDays: number;
    extraCostZAR: number;
  };
}

// ==========================================
// 8. AUTONOMOUS ROBOT FLEET DIGITAL TWIN & WASTE SORTING
// ==========================================

export interface RobotDigitalTwin {
  id: string;
  name: string;
  modelType: 'Spot Rover' | 'LiDAR Drone' | 'Hydraulic Waste Sorter' | 'Laser Scanner Crawler';
  status: 'ONLINE_ACTIVE' | 'RETURNING_DOCK' | 'CALIBRATING' | 'OFFLINE_STANDBY';
  batteryPct: number;
  currentTask: string;
  operatingHours: number;
  healthScorePct: number;
  payloadCapacityKg: number;
  currentPayloadKg: number;
  headingDegrees: number;
  currentPosition: Point2D;
  targetWaypoint?: Point2D;
  telemetryStreamFps: number;
  sensorSuite: string[];
  historicalTripsCompleted: number;
}

export interface SpatialWasteZone {
  id: string;
  name: string;
  boundary: Point2D[];
  materialsBreakdown: {
    material: ScannableMaterialType;
    tonnes: number;
    color: string;
  }[];
  totalTonnes: number;
  assignedRobotId?: string;
  sortingEfficiencyPct: number;
  scheduledPickupTime: string;
}

// ==========================================
// 9. AR CONSTRUCTION MODE & SPATIAL RISK RADAR
// ==========================================

export interface ARInspectionPoint {
  id: string;
  elementId: string;
  name: string;
  plannedLocation: Point2D;
  actualLocationObserved: Point2D;
  deviationMm: number;
  status: 'WITHIN_TOLERANCE' | 'OUT_OF_TOLERANCE' | 'REQUIRES_IMMEDIATE_REMEDIATION';
  inspectorNotes: string;
  photoOverlayUrl?: string;
}

export interface SpatialRiskRadarZone {
  id: string;
  name: string;
  center: Point2D;
  radiusMeters: number;
  riskLevel: 'GREEN' | 'AMBER' | 'RED';
  activeFactors: string[];
  personnelCount: number;
  heavyMachineryCount: number;
  weatherExposureRisk: 'Low' | 'Moderate' | 'High Wind' | 'Heat Warning';
}
