import * as THREE from 'three';

export type WeatherType = 'clear' | 'overcast' | 'rain' | 'snow' | 'fog' | 'wind';

export type BimScenarioType =
  | 'architectural'      // Ultra-realistic luxury materials, realistic glass, landscaping, soft shadows
  | 'solar_heatmap'      // False-color solar irradiance (kWh/m²), 3D sun vectors, azimuth arc
  | 'structural_xray'    // Transparent skin showing reinforced columns, CLT slabs, beams & load paths
  | 'thermal_envelope'   // U-value insulation gradient and thermal bridging inspection
  | 'night_lighting'     // Twilight/night architectural illumination, warm interior coves & pool glow
  | 'exploded_bim';      // Vertical level separation for axonometric floor-by-floor inspection

export interface WeatherPreset {
  id: WeatherType;
  name: string;
  description: string;
  skyTopColor: string;
  skyBottomColor: string;
  fogColor: string;
  fogDensity: number;
  sunIntensity: number;
  sunColor: string;
  ambientIntensity: number;
  ambientColor: string;
  rainDensity: number;
  snowDensity: number;
  windSpeedMs: number;
  windGustAngleDeg: number;
  groundRoughnessOffset: number; // Wet ground gets more specular/reflective
  ambientTempC: number;
}

export const WEATHER_PRESETS: Record<WeatherType, WeatherPreset> = {
  clear: {
    id: 'clear',
    name: 'Clear Sunlight',
    description: 'Crisp direct solar radiation, sharp contact shadows, blue sky dome',
    skyTopColor: '#0284c7',
    skyBottomColor: '#bae6fd',
    fogColor: '#93c5fd',
    fogDensity: 0.003,
    sunIntensity: 2.4,
    sunColor: '#fffbeb',
    ambientIntensity: 0.55,
    ambientColor: '#e0f2fe',
    rainDensity: 0,
    snowDensity: 0,
    windSpeedMs: 3.2,
    windGustAngleDeg: 135,
    groundRoughnessOffset: 0,
    ambientTempC: 26,
  },
  overcast: {
    id: 'overcast',
    name: 'Overcast & Diffuse',
    description: '100% diffuse daylight factor, soft uniform shadows, high natural light efficiency',
    skyTopColor: '#475569',
    skyBottomColor: '#cbd5e1',
    fogColor: '#94a3b8',
    fogDensity: 0.012,
    sunIntensity: 0.6,
    sunColor: '#f1f5f9',
    ambientIntensity: 1.1,
    ambientColor: '#cbd5e1',
    rainDensity: 0,
    snowDensity: 0,
    windSpeedMs: 5.5,
    windGustAngleDeg: 180,
    groundRoughnessOffset: 0,
    ambientTempC: 19,
  },
  rain: {
    id: 'rain',
    name: 'Storm & Heavy Rain',
    description: 'Dynamic 3D falling raindrops, wet glistening surface reflections, dark storm atmosphere',
    skyTopColor: '#0f172a',
    skyBottomColor: '#334155',
    fogColor: '#1e293b',
    fogDensity: 0.024,
    sunIntensity: 0.35,
    sunColor: '#94a3b8',
    ambientIntensity: 0.7,
    ambientColor: '#475569',
    rainDensity: 2800,
    snowDensity: 0,
    windSpeedMs: 12.4,
    windGustAngleDeg: 210,
    groundRoughnessOffset: -0.45, // wet surface reflective boost
    ambientTempC: 15,
  },
  snow: {
    id: 'snow',
    name: 'Winter Snow & Frost',
    description: 'Drifting 3D snowflake particles, cool crisp blue ambient tone, frosted roof surfaces',
    skyTopColor: '#334155',
    skyBottomColor: '#e2e8f0',
    fogColor: '#cbd5e1',
    fogDensity: 0.018,
    sunIntensity: 1.2,
    sunColor: '#e0f2fe',
    ambientIntensity: 0.9,
    ambientColor: '#f8fafc',
    rainDensity: 0,
    snowDensity: 2200,
    windSpeedMs: 4.8,
    windGustAngleDeg: 90,
    groundRoughnessOffset: 0.1,
    ambientTempC: -2,
  },
  fog: {
    id: 'fog',
    name: 'Dense Coastal Fog',
    description: 'High volumetric atmospheric mist, diffused architectural luminaire glow, reduced glare',
    skyTopColor: '#64748b',
    skyBottomColor: '#e2e8f0',
    fogColor: '#cbd5e1',
    fogDensity: 0.045,
    sunIntensity: 0.4,
    sunColor: '#f8fafc',
    ambientIntensity: 0.85,
    ambientColor: '#94a3b8',
    rainDensity: 0,
    snowDensity: 0,
    windSpeedMs: 1.8,
    windGustAngleDeg: 45,
    groundRoughnessOffset: -0.2,
    ambientTempC: 13,
  },
  wind: {
    id: 'wind',
    name: 'Aerodynamic Wind Flow',
    description: '3D animated particle streamlines visualizing microclimate airflow and cross-ventilation',
    skyTopColor: '#0369a1',
    skyBottomColor: '#7dd3fc',
    fogColor: '#bae6fd',
    fogDensity: 0.005,
    sunIntensity: 2.0,
    sunColor: '#ffffff',
    ambientIntensity: 0.6,
    ambientColor: '#e0f2fe',
    rainDensity: 0,
    snowDensity: 0,
    windSpeedMs: 14.2,
    windGustAngleDeg: 140,
    groundRoughnessOffset: 0,
    ambientTempC: 22,
  },
};

// Scenario metadata definitions
export interface ScenarioDefinition {
  id: BimScenarioType;
  title: string;
  badge: string;
  description: string;
  iconName: string;
  colorHex: string;
}

export const SCENARIO_DEFINITIONS: Record<BimScenarioType, ScenarioDefinition> = {
  architectural: {
    id: 'architectural',
    title: 'Ultra-Realistic Architectural',
    badge: 'Photorealistic PBR',
    description: 'High-fidelity mass timber CLT, fair-faced concrete, Low-E architectural glass, lush landscape, realistic water pool reflections, and soft contact shadows.',
    iconName: 'Sparkles',
    colorHex: '#2DD4BF',
  },
  solar_heatmap: {
    id: 'solar_heatmap',
    title: 'Solar Radiation Heatmap',
    badge: 'Insolation (kWh/m²)',
    description: 'False-color thermal irradiance mapping on facades & roofs with 3D solar azimuth vectors, shadow penumbras, and PV potential readouts.',
    iconName: 'Sun',
    colorHex: '#F59E0B',
  },
  structural_xray: {
    id: 'structural_xray',
    title: 'Structural BIM & Engineering',
    badge: 'Load Paths & Spans',
    description: 'X-Ray framing view highlighting reinforced concrete columns (cyan), load-bearing walls, structural steel lintels, CLT floor diaphragm, and unsupported spans.',
    iconName: 'Layers',
    colorHex: '#38BDF8',
  },
  thermal_envelope: {
    id: 'thermal_envelope',
    title: 'Thermal Envelope & U-Value',
    badge: 'U-Value (W/m²K)',
    description: 'Color-coded thermal transmittance study identifying thermal bridges, glazing U-values, and super-insulated external envelope performance.',
    iconName: 'ShieldAlert',
    colorHex: '#10B981',
  },
  night_lighting: {
    id: 'night_lighting',
    title: 'Night Illumination & Lux',
    badge: 'Lux Study (2700K)',
    description: 'Architectural lighting design simulation with recessed 2700K warm interior downlights, facade grazing luminaires, step lights, and underwater pool glow.',
    iconName: 'Moon',
    colorHex: '#A855F7',
  },
  exploded_bim: {
    id: 'exploded_bim',
    title: 'Exploded Axonometric BIM',
    badge: 'Axonometric Split',
    description: 'Dynamic vertical level separation for full floor-by-floor spatial, structural, and interior partition inspection in 3D perspective.',
    iconName: 'Maximize2',
    colorHex: '#EC4899',
  },
};
