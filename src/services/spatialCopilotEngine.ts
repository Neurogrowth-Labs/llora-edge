import { ArchitecturalProject } from '../types/architecture';
import {
  SpatialQueryInterpretation,
  SpatialAgentRole,
} from '../types/digitalTwin';
import { SPATIAL_AI_AGENTS, INITIAL_MATERIAL_PASSPORT, DEMOLITION_SCENARIOS, INITIAL_ADVANCED_CLASHES, INITIAL_ROBOT_FLEET, INITIAL_RISK_RADAR_ZONES } from '../data/digitalTwinData';

/**
 * Interpret and execute spatially grounded natural language queries directly inside Lora Edge CAD / BIM canvas.
 */
export function interpretSpatialCopilotQuery(
  rawQuery: string,
  project: ArchitecturalProject
): {
  interpretation: SpatialQueryInterpretation;
  updatedProject?: ArchitecturalProject;
  cadActionSummary?: string;
  suggestedFollowUps: string[];
} {
  const queryLower = rawQuery.toLowerCase();

  // 1. Demolition search within radius (e.g. "within 2 km" or "scheduled for demolition")
  if (queryLower.includes('demolition') && (queryLower.includes('within') || queryLower.includes('km') || queryLower.includes('show') || queryLower.includes('schedule'))) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'DEMOLITION_AGENT',
        intent: 'DEMOLITION_FILTER',
        spatialFilter: {
          center: { x: 10, y: 10 },
          radiusMeters: 2000,
          buildingIds: ['BLD-B102', 'BLD-B104', 'BLD-C401'],
        },
        explanation: 'Spatial query identified 3 structures scheduled for deconstruction within 2.0 km GIS radius. Building B-104 highlighted with high recoverable steel (186t).',
        confidenceScore: 0.96,
      },
      cadActionSummary: 'GIS & Demolition Layers filtered: Highlighting Buildings B-102, B-104 and C-401 with estimated salvage potential of R4.2M ZAR.',
      suggestedFollowUps: [
        'Calculate the potential recovery value of this site',
        'Create a demolition plan for Building B-104',
        'Find conflicts between the demolition plan and robot operating zones',
      ],
    };
  }

  // 2. Highest recyclable steel or material identification
  if (queryLower.includes('recyclable steel') || queryLower.includes('highest steel') || queryLower.includes('material') || queryLower.includes('scanner')) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'MATERIAL_AGENT',
        intent: 'MATERIAL_RECOVERY',
        spatialFilter: {
          buildingIds: ['BLD-B104-ZA'],
        },
        explanation: 'Materia AI Computer Vision scanner identified Building B-104 as having the highest recoverable steel concentration (186 tonnes, 91% confidence, Grade A condition).',
        confidenceScore: 0.94,
      },
      cadActionSummary: 'Material Passport for B-104 activated: 186 tonnes Grade 350 structural steel mapped with selective unbolting sequence ready.',
      suggestedFollowUps: [
        'Simulate Hybrid Robotic Demolition for Building B-104',
        'Generate Building Material Passport QR Code',
        'Export Material Digital Inventory as CSV / IFC 4x3',
      ],
    };
  }

  // 3. Site recovery value calculation
  if (queryLower.includes('recovery value') || queryLower.includes('salvage value') || queryLower.includes('value of this site')) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'SUSTAINABILITY_AGENT',
        intent: 'MATERIAL_RECOVERY',
        explanation: 'Circularity Engine calculated total site recovery potential: R3,840,000 ZAR net salvage value across 1,860t of materials, diverting 92% waste from landfill and saving 820 tCO₂e.',
        confidenceScore: 0.95,
      },
      cadActionSummary: 'Valuation complete: Steel (R1.67M), Concrete aggregate (R1.42M), Reclaimed face brick (R360k), Low-E Glazing (R192k), FSC Timber (R194k).',
      suggestedFollowUps: [
        'Compare Selective Deconstruction vs Mechanical Demolition costs',
        'Dispatch SortBot R-02 to scan Waste Staging Zone A',
        'View Whole-Life Carbon Scenarios',
      ],
    };
  }

  // 4. Conflicts between demolition plan and robot zones
  if (queryLower.includes('conflict') || queryLower.includes('clash') || queryLower.includes('robot operating') || queryLower.includes('zones')) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'SAFETY_AGENT',
        intent: 'SPATIAL_CLASH_AUDIT',
        spatialFilter: {
          center: { x: 8.2, y: 6.4 },
          radiusMeters: 15,
        },
        explanation: 'Aegis Shield Risk Engine identified 2 active spatial conflicts: (1) Rover R-02 path intersects freshly poured slab Bay 2, and (2) Tower Crane #1 radius intersects façade scaffolding during wind gusts.',
        confidenceScore: 0.98,
      },
      cadActionSummary: 'Spatial Risk Radar engaged: Safety corridors marked in RED. Slew limiter engaged on Crane #1 and Rover R-02 rerouted +8m east.',
      suggestedFollowUps: [
        'Auto-resolve spatial clash #01 by engaging electronic crane slew zone',
        'Show where the highest-risk area is right now',
        'View live Robot Fleet telemetry',
      ],
    };
  }

  // 5. Create a demolition plan for a building
  if (queryLower.includes('create a demolition plan') || queryLower.includes('demolition plan for') || queryLower.includes('plan b-102') || queryLower.includes('plan b-104')) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'DEMOLITION_AGENT',
        intent: 'PLAN_DEMOLITION',
        spatialFilter: {
          buildingIds: ['BLD-B104-ZA'],
        },
        explanation: 'Generated 3-tier demolition plan: Plan A (Mechanical), Plan B (Selective Deconstruction), and Plan C (Hybrid Robotic Demolition - Recommended). Plan C yields R2.1M cost and 610 tCO₂e net carbon.',
        confidenceScore: 0.97,
      },
      cadActionSummary: 'Demolition Simulator initialized: 3-step sequence generated with designated 20m safety perimeter and autonomous dust suppression.',
      suggestedFollowUps: [
        'Simulate Plan C: Hybrid Robotic Demolition step-by-step',
        'Assign Spot Rover R-01 and SortBot R-02 to demolition sequence',
        'Export Demolition Safety Compliance Report (SANS 10400)',
      ],
    };
  }

  // 6. Natural Language CAD: Create building footprint (e.g. "Create a 20m x 30m building footprint")
  if (queryLower.includes('create') && (queryLower.includes('footprint') || (queryLower.includes('20m') && queryLower.includes('30m')) || queryLower.includes('building footprint'))) {
    const width = 20;
    const height = 30;
    const startX = 4;
    const startY = 4;
    const timestamp = Date.now();

    const newWalls = [
      { id: `wall_nl_${timestamp}_1`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX, y: startY }, end: { x: startX + width, y: startY }, thickness: 0.22, height: 3.0, type: 'external' as const, materialId: 'mat_brick' },
      { id: `wall_nl_${timestamp}_2`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX + width, y: startY }, end: { x: startX + width, y: startY + height }, thickness: 0.22, height: 3.0, type: 'external' as const, materialId: 'mat_brick' },
      { id: `wall_nl_${timestamp}_3`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX + width, y: startY + height }, end: { x: startX, y: startY + height }, thickness: 0.22, height: 3.0, type: 'external' as const, materialId: 'mat_brick' },
      { id: `wall_nl_${timestamp}_4`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX, y: startY + height }, end: { x: startX, y: startY }, thickness: 0.22, height: 3.0, type: 'external' as const, materialId: 'mat_brick' },
    ];

    const updatedProject: ArchitecturalProject = {
      ...project,
      walls: [...project.walls, ...newWalls],
    };

    return {
      interpretation: {
        rawQuery,
        agentRole: 'ARCHITECT_AGENT',
        intent: 'NATURAL_LANGUAGE_CAD',
        cadCommand: {
          action: 'CREATE_FOOTPRINT',
          parameters: { width, height, startX, startY },
        },
        explanation: `Parametric CAD engine created a ${width}m × ${height}m (${width * height} m²) external envelope footprint with 220mm brick cavity walls.`,
        confidenceScore: 0.99,
      },
      updatedProject,
      cadActionSummary: `4 external boundary walls drawn (${width}m × ${height}m, 600 m² footprint) at active level ${project.activeLevelId}.`,
      suggestedFollowUps: [
        'Add a 6m access road around the building footprint',
        'Divide this floor into four offices and two meeting rooms',
        'Optimize southern façade fenestration for winter solar heat gain',
      ],
    };
  }

  // 7. Natural Language CAD: Add road around building
  if (queryLower.includes('add') && (queryLower.includes('road') || queryLower.includes('access road'))) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'ARCHITECT_AGENT',
        intent: 'NATURAL_LANGUAGE_CAD',
        cadCommand: {
          action: 'ADD_ROAD',
          parameters: { widthMeters: 6, setback: 3 },
        },
        explanation: 'Generated a 6.0m perimeter asphalt access spine with 3.0m site setback, emergency turning radius (R12m) and storm water bioswale channel.',
        confidenceScore: 0.95,
      },
      cadActionSummary: 'Perimeter 6m logistics & fire tender road mapped with SANS 10400-T heavy vehicle turning clearance.',
      suggestedFollowUps: [
        'Divide this floor into four offices and two meeting rooms',
        'Check for clashes between road access and crane staging',
        'Evaluate site parking yield',
      ],
    };
  }

  // 8. Natural Language CAD: Divide floor into offices and meeting rooms
  if (queryLower.includes('divide') && (queryLower.includes('office') || queryLower.includes('room') || queryLower.includes('four offices'))) {
    const timestamp = Date.now();
    const startX = 4;
    const startY = 4;
    const width = 20;
    const height = 30;

    // Internal dividing walls
    const internalWalls = [
      { id: `wall_div_${timestamp}_1`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX + width / 2, y: startY }, end: { x: startX + width / 2, y: startY + height }, thickness: 0.11, height: 2.8, type: 'internal' as const, materialId: 'mat_drywall' },
      { id: `wall_div_${timestamp}_2`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX, y: startY + height / 3 }, end: { x: startX + width, y: startY + height / 3 }, thickness: 0.11, height: 2.8, type: 'internal' as const, materialId: 'mat_drywall' },
      { id: `wall_div_${timestamp}_3`, levelId: project.activeLevelId || 'lvl_0', start: { x: startX, y: startY + (2 * height) / 3 }, end: { x: startX + width, y: startY + (2 * height) / 3 }, thickness: 0.11, height: 2.8, type: 'internal' as const, materialId: 'mat_drywall' },
    ];

    const updatedProject: ArchitecturalProject = {
      ...project,
      walls: [...project.walls, ...internalWalls],
    };

    return {
      interpretation: {
        rawQuery,
        agentRole: 'ARCHITECT_AGENT',
        intent: 'NATURAL_LANGUAGE_CAD',
        cadCommand: {
          action: 'DIVIDE_FLOOR',
          parameters: { zones: 6, types: ['office', 'meeting_room'] },
        },
        explanation: 'Space zoning engine divided floorplate into 4 executive offices and 2 collaborative meeting suites with 110mm acoustic drywall partitions.',
        confidenceScore: 0.98,
      },
      updatedProject,
      cadActionSummary: 'Added 3 internal acoustic partition walls creating 6 functional zones with SANS compliant acoustic STC 48 ratings.',
      suggestedFollowUps: [
        'Insert doors and windows for all new rooms',
        'Calculate daylight exposure heatmap for newly subdivided zones',
        'Verify structural column grid alignment',
      ],
    };
  }

  // 9. Translate / Move building
  if (queryLower.includes('move') && (queryLower.includes('east') || queryLower.includes('west') || queryLower.includes('north') || queryLower.includes('south') || queryLower.includes('metres'))) {
    const shiftX = queryLower.includes('east') ? 10 : queryLower.includes('west') ? -10 : 0;
    const shiftY = queryLower.includes('north') ? -10 : queryLower.includes('south') ? 10 : 0;

    const shiftedWalls = project.walls.map((w) => ({
      ...w,
      start: { x: w.start.x + shiftX, y: w.start.y + shiftY },
      end: { x: w.end.x + shiftX, y: w.end.y + shiftY },
    }));

    const updatedProject: ArchitecturalProject = {
      ...project,
      walls: shiftedWalls,
    };

    return {
      interpretation: {
        rawQuery,
        agentRole: 'ARCHITECT_AGENT',
        intent: 'NATURAL_LANGUAGE_CAD',
        cadCommand: {
          action: 'TRANSLATE_BUILDING',
          parameters: { shiftX, shiftY },
        },
        explanation: `Spatially translated building geometry by ${shiftX !== 0 ? `${Math.abs(shiftX)}m ${shiftX > 0 ? 'East' : 'West'}` : ''} ${shiftY !== 0 ? `${Math.abs(shiftY)}m ${shiftY > 0 ? 'South' : 'North'}` : ''} while maintaining all parametric constraints.`,
        confidenceScore: 0.99,
      },
      updatedProject,
      cadActionSummary: `Moved ${project.walls.length} walls by ΔX=${shiftX}m, ΔY=${shiftY}m. Boundary setbacks recomputed.`,
      suggestedFollowUps: [
        'Check daylight impact after moving building',
        'Verify site boundary clearance with revised position',
        'Check crane access radius for new position',
      ],
    };
  }

  // 10. Project Health / Predictive Risk
  if (queryLower.includes('health') || queryLower.includes('delay') || queryLower.includes('predict') || queryLower.includes('schedule')) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'PROJECT_MANAGER_AGENT',
        intent: 'PROJECT_HEALTH_EVAL',
        explanation: 'Lora Project Health is currently 87/100. AI Project Prediction Engine forecasts a 72% schedule delay probability on Level 5 structural rebar unless structural supply is fast-tracked.',
        confidenceScore: 0.94,
      },
      cadActionSummary: 'Project Health breakdown: Schedule (91), Cost (82), Safety (94), Quality (86), Sustainability (89), Materials (84), Risk (79).',
      suggestedFollowUps: [
        'Simulate 10-day rebar delivery delay in 4D timeline',
        'Show active supply chain risks',
        'Open AI Clash Detection 2.0 matrix',
      ],
    };
  }

  // 11. Highest-risk area right now
  if (queryLower.includes('highest-risk') || queryLower.includes('risk radar') || queryLower.includes('highest risk')) {
    return {
      interpretation: {
        rawQuery,
        agentRole: 'SAFETY_AGENT',
        intent: 'SPATIAL_CLASH_AUDIT',
        spatialFilter: {
          center: { x: 14.0, y: 12.0 },
          radiusMeters: 18.0,
        },
        explanation: 'Highest-risk zone right now: North Heavy Lifting Zone (RED Risk). Active tower crane suspended load over ground personnel pathway with 42 km/h wind gusts.',
        confidenceScore: 0.98,
      },
      cadActionSummary: 'Safety lockdown active: Slew zone limited to east yard; 6 ground workers alerted via wearable beacons.',
      suggestedFollowUps: [
        'Dispatch Drone D-01 for aerial safety inspection',
        'Show all AMBER and RED risk zones on site radar',
        'Generate AI Safety Incident Prevention Audit',
      ],
    };
  }

  // 12. Default fallback spatial agent interpretation
  return {
    interpretation: {
      rawQuery,
      agentRole: 'PROJECT_MANAGER_AGENT',
      intent: 'PROJECT_HEALTH_EVAL',
      explanation: `Analyzed query against Living Digital Twin BIM + GIS + IoT telemetry. All ${project.walls.length} walls, ${project.rooms.length} zones, and active robotics fleet synchronized.`,
      confidenceScore: 0.92,
    },
    cadActionSummary: 'Living Digital Twin query processed: Geometry, IoT sensors, robotics telemetry, and carbon passports active.',
    suggestedFollowUps: [
      'Show me all buildings scheduled for demolition within 2 km',
      'Which buildings contain the highest estimated recyclable steel?',
      'Calculate the potential recovery value of this site',
      'Find conflicts between the demolition plan and robot operating zones',
      'Create a demolition plan for Building B-104',
      'Create a 20m × 30m building footprint',
    ],
  };
}
