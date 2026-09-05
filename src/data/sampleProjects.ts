import { ArchitecturalProject } from '../types/architecture';

export const SAMPLE_PROJECTS: ArchitecturalProject[] = [
  {
    id: 'proj_capetown_villa',
    name: 'Cape Town Coastal Eco-Villa (Prompt Canonical)',
    description: 'Contemporary 4-bedroom two-storey bioclimatic villa on a 600 m² site in Camps Bay, Cape Town. Features double garage, open-plan living, home office, guest suite on ground, 3 ocean-facing bedrooms on level 1, pool, and EDGE green design with 34% energy savings.',
    buildingType: 'Residential',
    style: 'Biophilic Modern',
    jurisdiction: 'ZA',
    createdAt: '2026-08-28T10:00:00Z',
    updatedAt: '2026-09-01T07:30:00Z',
    status: 'schematic',
    isShared: true,
    isTemplate: true,
    targetBudgetUSD: 385000,
    intendedOccupancy: 5,
    architectName: 'Elena Van Der Merwe, Pr.Arch',
    clientName: 'Julian & Sarah Vance',
    companyName: 'Lora Architectural Studio',
    drawingNumberPrefix: 'LA-CPT-01',

    site: {
      siteAreaM2: 600,
      widthM: 20,
      depthM: 30,
      setbackFrontM: 4.5,
      setbackRearM: 3.0,
      setbackSidesM: 2.0,
      orientationNorthDeg: 15,
      slopePct: 4,
      soilType: 'Granite Table Mountain Sandstone',
      maxBuildingHeightM: 8.5,
      maxSiteCoveragePct: 50,
      maxFAR: 0.8,
      accessRoadFacing: 'South',
      existingTrees: 3,
    },

    climate: {
      location: 'Camps Bay, Cape Town, South Africa',
      latitude: -33.95,
      longitude: 18.37,
      climateZone: 'Mediterranean Coastal (Zone 4)',
      averageSummerTempC: 27,
      averageWinterTempC: 14,
      annualRainfallMm: 650,
      solarIrradianceKwhM2Day: 5.8,
      prevailingWindDirection: 'SE (Summer Cape Doctor) / NW (Winter)',
      passiveDesignRecommendations: [
        'Orient primary living and master suite toward North for optimal solar gain in winter',
        'Incorporate deep 1.2m overhangs on northern facades to prevent summer solar overheating',
        'Utilize cross-ventilation flues catching prevailing SE coastal breezes',
        'Implement double glazing with solar control on western facing windows',
        'Install 8.5 kWp Solar PV with 10,000L rainwater harvesting tanks under terrace',
      ],
    },

    levels: [
      { id: 'lvl_0', name: 'Ground Floor (Level 0)', elevation: 0.0, height: 3.0, floorPlanVisible: true },
      { id: 'lvl_1', name: 'First Floor (Level 1)', elevation: 3.0, height: 2.8, floorPlanVisible: true },
      { id: 'lvl_roof', name: 'Roof & Solar Array', elevation: 5.8, height: 0.8, floorPlanVisible: false },
    ],
    activeLevelId: 'lvl_0',

    // Ground Floor & Level 1 Walls
    walls: [
      // Ground floor external perimeter (20m x 15m building on 20x30 site)
      { id: 'w_g_01', levelId: 'lvl_0', start: { x: 3, y: 5 }, end: { x: 17, y: 5 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete', fireRatingMinutes: 120, uValue: 0.45 },
      { id: 'w_g_02', levelId: 'lvl_0', start: { x: 17, y: 5 }, end: { x: 17, y: 19 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete', fireRatingMinutes: 120, uValue: 0.45 },
      { id: 'w_g_03', levelId: 'lvl_0', start: { x: 17, y: 19 }, end: { x: 3, y: 19 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete', fireRatingMinutes: 120, uValue: 0.45 },
      { id: 'w_g_04', levelId: 'lvl_0', start: { x: 3, y: 19 }, end: { x: 3, y: 5 }, thickness: 0.22, height: 3.0, type: 'external', materialId: 'mat_low_carbon_concrete', fireRatingMinutes: 120, uValue: 0.45 },

      // Ground floor internal partitions
      // Garage partition (Left front: x:3..9, y:13..19)
      { id: 'w_g_05', levelId: 'lvl_0', start: { x: 9, y: 13 }, end: { x: 9, y: 19 }, thickness: 0.22, height: 3.0, type: 'internal', materialId: 'mat_clay_brick', fireRatingMinutes: 90 },
      { id: 'w_g_06', levelId: 'lvl_0', start: { x: 3, y: 13 }, end: { x: 9, y: 13 }, thickness: 0.22, height: 3.0, type: 'internal', materialId: 'mat_clay_brick', fireRatingMinutes: 90 },

      // Guest Suite & Bath (Right front: x:12..17, y:13..19)
      { id: 'w_g_07', levelId: 'lvl_0', start: { x: 12, y: 13 }, end: { x: 12, y: 19 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
      { id: 'w_g_08', levelId: 'lvl_0', start: { x: 12, y: 13 }, end: { x: 17, y: 13 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
      { id: 'w_g_09', levelId: 'lvl_0', start: { x: 14.5, y: 16 }, end: { x: 17, y: 16 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },

      // Home Office partition (Left rear: x:3..8, y:5..9)
      { id: 'w_g_10', levelId: 'lvl_0', start: { x: 8, y: 5 }, end: { x: 8, y: 9.5 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },
      { id: 'w_g_11', levelId: 'lvl_0', start: { x: 3, y: 9.5 }, end: { x: 8, y: 9.5 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },

      // Open Plan Kitchen divider (Scullery/Pantry zone: x:3..8, y:9.5..13)
      { id: 'w_g_12', levelId: 'lvl_0', start: { x: 8, y: 9.5 }, end: { x: 8, y: 13 }, thickness: 0.11, height: 3.0, type: 'internal', materialId: 'mat_clay_brick' },

      // Level 1 Walls (Upstairs 3 Bedrooms + Bathrooms + Lounge)
      { id: 'w_1_01', levelId: 'lvl_1', start: { x: 3, y: 5 }, end: { x: 17, y: 5 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_02', levelId: 'lvl_1', start: { x: 17, y: 5 }, end: { x: 17, y: 18 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_03', levelId: 'lvl_1', start: { x: 17, y: 18 }, end: { x: 3, y: 18 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },
      { id: 'w_1_04', levelId: 'lvl_1', start: { x: 3, y: 18 }, end: { x: 3, y: 5 }, thickness: 0.22, height: 2.8, type: 'external', materialId: 'mat_mass_timber_clt' },

      // Level 1 partitions
      // Master Bedroom suite (North garden view x:3..10, y:5..11)
      { id: 'w_1_05', levelId: 'lvl_1', start: { x: 10, y: 5 }, end: { x: 10, y: 11 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' },
      { id: 'w_1_06', levelId: 'lvl_1', start: { x: 3, y: 11 }, end: { x: 10, y: 11 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' },
      { id: 'w_1_07', levelId: 'lvl_1', start: { x: 7.5, y: 8 }, end: { x: 10, y: 8 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' }, // Master Ensuite

      // Bedroom 2 (x:10..17, y:5..11)
      { id: 'w_1_08', levelId: 'lvl_1', start: { x: 10, y: 11 }, end: { x: 17, y: 11 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' },

      // Bedroom 3 (x:11..17, y:11..18)
      { id: 'w_1_09', levelId: 'lvl_1', start: { x: 11, y: 11 }, end: { x: 11, y: 18 }, thickness: 0.11, height: 2.8, type: 'internal', materialId: 'mat_timber_partition' },
    ],

    doors: [
      // Ground floor doors
      { id: 'd_g_01', levelId: 'lvl_0', wallId: 'w_g_03', position: 0.75, width: 1.2, height: 2.4, swingDirection: 'pivot', doorType: 'pivot', material: 'Solid Iroko Timber' }, // Main Entrance
      { id: 'd_g_02', levelId: 'lvl_0', wallId: 'w_g_03', position: 0.25, width: 4.8, height: 2.4, swingDirection: 'sliding', doorType: 'garage_double', material: 'Insulated Aluminum Slat' }, // Double Garage Door
      { id: 'd_g_03', levelId: 'lvl_0', wallId: 'w_g_06', position: 0.6, width: 0.9, height: 2.1, swingDirection: 'inward_left', doorType: 'single', material: 'Fire-rated Solid Core' }, // Garage internal entry
      { id: 'd_g_04', levelId: 'lvl_0', wallId: 'w_g_01', position: 0.6, width: 4.2, height: 2.6, swingDirection: 'sliding', doorType: 'sliding', material: 'Thermally broken aluminum & double glass' }, // Living to Garden/Pool
      { id: 'd_g_05', levelId: 'lvl_0', wallId: 'w_g_11', position: 0.7, width: 0.9, height: 2.1, swingDirection: 'inward_right', doorType: 'single', material: 'Timber flush' }, // Office Door
      { id: 'd_g_06', levelId: 'lvl_0', wallId: 'w_g_08', position: 0.3, width: 0.9, height: 2.1, swingDirection: 'inward_left', doorType: 'single', material: 'Timber flush' }, // Guest Suite Door
      { id: 'd_g_07', levelId: 'lvl_0', wallId: 'w_g_09', position: 0.5, width: 0.8, height: 2.1, swingDirection: 'inward_left', doorType: 'single', material: 'Frosted Glass Timber' }, // Guest Bath

      // Level 1 doors
      { id: 'd_1_01', levelId: 'lvl_1', wallId: 'w_1_06', position: 0.65, width: 0.9, height: 2.1, swingDirection: 'inward_left', doorType: 'single', material: 'Timber flush' }, // Master Suite
      { id: 'd_1_02', levelId: 'lvl_1', wallId: 'w_1_07', position: 0.5, width: 0.85, height: 2.1, swingDirection: 'sliding', doorType: 'sliding', material: 'Fluted Glass Pocket' }, // Master Ensuite
      { id: 'd_1_03', levelId: 'lvl_1', wallId: 'w_1_08', position: 0.25, width: 0.9, height: 2.1, swingDirection: 'inward_right', doorType: 'single', material: 'Timber flush' }, // Bed 2
      { id: 'd_1_04', levelId: 'lvl_1', wallId: 'w_1_09', position: 0.3, width: 0.9, height: 2.1, swingDirection: 'inward_left', doorType: 'single', material: 'Timber flush' }, // Bed 3
      { id: 'd_1_05', levelId: 'lvl_1', wallId: 'w_1_01', position: 0.35, width: 2.4, height: 2.4, swingDirection: 'sliding', doorType: 'sliding', material: 'Low-E Aluminum Slider' }, // Master to Balcony
    ],

    windows: [
      // Ground floor windows
      { id: 'win_g_01', levelId: 'lvl_0', wallId: 'w_g_01', position: 0.2, width: 2.2, height: 1.8, sillHeight: 0.6, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'overhang', operable: true }, // Kitchen North Window
      { id: 'win_g_02', levelId: 'lvl_0', wallId: 'w_g_04', position: 0.3, width: 1.8, height: 1.5, sillHeight: 0.9, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'louvers', operable: true }, // Office West Window (Louvers for low sun)
      { id: 'win_g_03', levelId: 'lvl_0', wallId: 'w_g_02', position: 0.7, width: 1.6, height: 1.5, sillHeight: 0.9, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'none', operable: true }, // Guest Bedroom East window
      { id: 'win_g_04', levelId: 'lvl_0', wallId: 'w_g_02', position: 0.25, width: 3.2, height: 2.2, sillHeight: 0.3, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'overhang', operable: true }, // Dining Area East Garden Window

      // Level 1 windows
      { id: 'win_1_01', levelId: 'lvl_1', wallId: 'w_1_01', position: 0.75, width: 2.6, height: 1.8, sillHeight: 0.6, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'overhang', operable: true }, // Bed 2 North Window
      { id: 'win_1_02', levelId: 'lvl_1', wallId: 'w_1_02', position: 0.7, width: 2.0, height: 1.6, sillHeight: 0.8, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'none', operable: true }, // Bed 3 East Window
      { id: 'win_1_03', levelId: 'lvl_1', wallId: 'w_1_04', position: 0.3, width: 1.2, height: 1.2, sillHeight: 1.2, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', shadingType: 'louvers', operable: true }, // Master Ensuite Window
    ],

    columns: [
      { id: 'col_01', levelId: 'lvl_0', position: { x: 10, y: 9.5 }, shape: 'rectangular', width: 0.3, depth: 0.3, material: 'Reinforced Concrete' },
      { id: 'col_02', levelId: 'lvl_0', position: { x: 14, y: 9.5 }, shape: 'rectangular', width: 0.3, depth: 0.3, material: 'Reinforced Concrete' },
      { id: 'col_03', levelId: 'lvl_0', position: { x: 10, y: 5 }, shape: 'circular', width: 0.3, depth: 0.3, material: 'Steel architectural column' },
    ],

    stairs: [
      { id: 'stair_01', levelId: 'lvl_0', start: { x: 9.5, y: 13.5 }, end: { x: 9.5, y: 17.5 }, width: 1.1, treadsCount: 16, stairType: 'straight' },
    ],

    rooms: [
      // Ground Floor Rooms
      {
        id: 'rm_g_living',
        levelId: 'lvl_0',
        name: 'Open-Plan Living & Dining',
        type: 'open_plan_living',
        points: [{ x: 8, y: 5 }, { x: 17, y: 5 }, { x: 17, y: 13 }, { x: 12, y: 13 }, { x: 12, y: 13.5 }, { x: 8, y: 13.5 }],
        floorArea: 58.5,
        ceilingHeight: 3.0,
        occupancyCapacity: 10,
        minRequiredArea: 20.0,
        naturalLightScore: 'Excellent',
        ventilationScore: 'Excellent',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#0284c7',
      },
      {
        id: 'rm_g_kitchen',
        levelId: 'lvl_0',
        name: 'Chef Kitchen & Scullery',
        type: 'kitchen',
        points: [{ x: 3, y: 9.5 }, { x: 8, y: 9.5 }, { x: 8, y: 13 }, { x: 3, y: 13 }],
        floorArea: 17.5,
        ceilingHeight: 3.0,
        occupancyCapacity: 4,
        minRequiredArea: 10.0,
        naturalLightScore: 'Good',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'Recycled Glass Terrazzo',
        colorHex: '#0d9488',
      },
      {
        id: 'rm_g_office',
        levelId: 'lvl_0',
        name: 'Home Executive Office',
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
        id: 'rm_g_garage',
        levelId: 'lvl_0',
        name: 'Double Garage & EV Charger',
        type: 'garage',
        points: [{ x: 3, y: 13 }, { x: 9, y: 13 }, { x: 9, y: 19 }, { x: 3, y: 19 }],
        floorArea: 36.0,
        ceilingHeight: 3.0,
        occupancyCapacity: 2,
        minRequiredArea: 32.0,
        naturalLightScore: 'Moderate',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'Polished Low-Carbon Concrete',
        colorHex: '#64748b',
      },
      {
        id: 'rm_g_guest_bed',
        levelId: 'lvl_0',
        name: 'Guest Bedroom (Downstairs)',
        type: 'bedroom',
        points: [{ x: 12, y: 13 }, { x: 17, y: 13 }, { x: 17, y: 16 }, { x: 12, y: 16 }],
        floorArea: 15.0,
        ceilingHeight: 3.0,
        occupancyCapacity: 2,
        minRequiredArea: 10.0,
        naturalLightScore: 'Good',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#8b5cf6',
      },
      {
        id: 'rm_g_guest_bath',
        levelId: 'lvl_0',
        name: 'Guest Bathroom & Powder Room',
        type: 'bathroom',
        points: [{ x: 12, y: 16 }, { x: 17, y: 16 }, { x: 17, y: 19 }, { x: 12, y: 19 }],
        floorArea: 9.5,
        ceilingHeight: 3.0,
        occupancyCapacity: 1,
        minRequiredArea: 4.5,
        naturalLightScore: 'Moderate',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'Recycled Glass Terrazzo',
        colorHex: '#06b6d4',
      },

      // Level 1 Rooms
      {
        id: 'rm_1_master_bed',
        levelId: 'lvl_1',
        name: 'Master Suite Sanctuary',
        type: 'bedroom_master',
        points: [{ x: 3, y: 5 }, { x: 7.5, y: 5 }, { x: 7.5, y: 11 }, { x: 3, y: 11 }],
        floorArea: 27.0,
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
        id: 'rm_1_master_ensuite',
        levelId: 'lvl_1',
        name: 'Master Ensuite Spa Bath',
        type: 'bathroom_ensuite',
        points: [{ x: 7.5, y: 5 }, { x: 10, y: 5 }, { x: 10, y: 8 }, { x: 7.5, y: 8 }],
        floorArea: 7.5,
        ceilingHeight: 2.8,
        occupancyCapacity: 1,
        minRequiredArea: 5.0,
        naturalLightScore: 'Good',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'Recycled Terrazzo',
        colorHex: '#14b8a6',
      },
      {
        id: 'rm_1_bed2',
        levelId: 'lvl_1',
        name: 'Bedroom 2 (Ocean View)',
        type: 'bedroom',
        points: [{ x: 10, y: 5 }, { x: 17, y: 5 }, { x: 17, y: 11 }, { x: 10, y: 11 }],
        floorArea: 21.0,
        ceilingHeight: 2.8,
        occupancyCapacity: 2,
        minRequiredArea: 10.0,
        naturalLightScore: 'Excellent',
        ventilationScore: 'Excellent',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#ec4899',
      },
      {
        id: 'rm_1_bed3',
        levelId: 'lvl_1',
        name: 'Bedroom 3 / Studio',
        type: 'bedroom',
        points: [{ x: 11, y: 11 }, { x: 17, y: 11 }, { x: 17, y: 18 }, { x: 11, y: 18 }],
        floorArea: 21.0,
        ceilingHeight: 2.8,
        occupancyCapacity: 2,
        minRequiredArea: 10.0,
        naturalLightScore: 'Good',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#a855f7',
      },
      {
        id: 'rm_1_lounge',
        levelId: 'lvl_1',
        name: 'Upper Pyjama Lounge & Gallery',
        type: 'living',
        points: [{ x: 3, y: 11 }, { x: 11, y: 11 }, { x: 11, y: 18 }, { x: 3, y: 18 }],
        floorArea: 28.0,
        ceilingHeight: 2.8,
        occupancyCapacity: 6,
        minRequiredArea: 12.0,
        naturalLightScore: 'Good',
        ventilationScore: 'Good',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'FSC Engineered Oak',
        colorHex: '#3b82f6',
      },
    ],

    furniture: [
      // Ground furniture
      { id: 'f_01', levelId: 'lvl_0', roomId: 'rm_g_living', type: 'sofa_sectional', position: { x: 13, y: 8 }, rotation: 0, width: 3.2, depth: 2.4 },
      { id: 'f_02', levelId: 'lvl_0', roomId: 'rm_g_living', type: 'dining_table_6', position: { x: 14.5, y: 11.5 }, rotation: 90, width: 2.0, depth: 1.0 },
      { id: 'f_03', levelId: 'lvl_0', roomId: 'rm_g_kitchen', type: 'kitchen_island', position: { x: 5.5, y: 11 }, rotation: 0, width: 2.6, depth: 1.1 },
      { id: 'f_04', levelId: 'lvl_0', roomId: 'rm_g_office', type: 'desk_office', position: { x: 5.5, y: 7.5 }, rotation: 0, width: 2.0, depth: 0.9 },
      { id: 'f_05', levelId: 'lvl_0', roomId: 'rm_g_garage', type: 'car_suv', position: { x: 5, y: 16 }, rotation: 0, width: 2.0, depth: 4.6 },
      { id: 'f_06', levelId: 'lvl_0', roomId: 'rm_g_garage', type: 'car_sedan', position: { x: 7.2, y: 16 }, rotation: 0, width: 1.8, depth: 4.4 },
      { id: 'f_07', levelId: 'lvl_0', roomId: 'rm_g_guest_bed', type: 'bed_king', position: { x: 14.5, y: 14.5 }, rotation: 0, width: 2.0, depth: 2.1 },
      { id: 'f_08', levelId: 'lvl_0', position: { x: 10, y: 2 }, rotation: 0, width: 8.0, depth: 3.5, type: 'swimming_pool' }, // Outdoor pool

      // Level 1 furniture
      { id: 'f_10', levelId: 'lvl_1', roomId: 'rm_1_master_bed', type: 'bed_king', position: { x: 5.2, y: 8 }, rotation: 0, width: 2.0, depth: 2.1 },
      { id: 'f_11', levelId: 'lvl_1', roomId: 'rm_1_bed2', type: 'bed_king', position: { x: 13.5, y: 8 }, rotation: 0, width: 2.0, depth: 2.1 },
      { id: 'f_12', levelId: 'lvl_1', roomId: 'rm_1_bed3', type: 'bed_single', position: { x: 14, y: 14.5 }, rotation: 90, width: 1.2, depth: 2.0 },
      { id: 'f_13', levelId: 'lvl_1', roomId: 'rm_1_master_ensuite', type: 'bathtub', position: { x: 8.7, y: 6.5 }, rotation: 0, width: 1.7, depth: 0.8 },
      { id: 'f_14', levelId: 'lvl_roof', position: { x: 10, y: 10 }, rotation: 0, width: 10, depth: 6, type: 'solar_panel_array' },
    ],

    dimensions: [
      { id: 'dim_01', levelId: 'lvl_0', start: { x: 3, y: 4.2 }, end: { x: 17, y: 4.2 }, offset: 0.8, label: '14.00 m (North Facade)' },
      { id: 'dim_02', levelId: 'lvl_0', start: { x: 17.8, y: 5 }, end: { x: 17.8, y: 19 }, offset: 0.8, label: '14.00 m (East Facade)' },
      { id: 'dim_03', levelId: 'lvl_0', start: { x: 3, y: 5 }, end: { x: 8, y: 5 }, offset: -0.8, label: '5.00 m (Home Office)' },
      { id: 'dim_04', levelId: 'lvl_0', start: { x: 8, y: 5 }, end: { x: 17, y: 5 }, offset: -0.8, label: '9.00 m (Living & Dining)' },
    ],

    annotations: [
      { id: 'ann_01', levelId: 'lvl_0', position: { x: 10, y: 1.2 }, text: 'NORTH GARDEN & ECO-POOL', fontSize: 14, type: 'label' },
      { id: 'ann_02', levelId: 'lvl_0', position: { x: 6, y: 20 }, text: 'ROAD ACCESS / VEHICULAR ENTRY', fontSize: 12, type: 'note' },
      { id: 'ann_03', levelId: 'lvl_0', position: { x: 17, y: 10 }, text: 'PREVAILING SE BREEZES', fontSize: 11, type: 'note' },
    ],

    sustainability: {
      energySavingsPct: 34.2,
      waterSavingsPct: 38.6,
      embodiedCarbonSavingsPct: 26.4,
      edgeEligible: true,
      annualEnergyKwhPerM2: 46.8,
      annualWaterM3PerOccupant: 24.5,
      embodiedCarbonKgCO2ePerM2: 245,
      solarPvCapacityKwp: 8.5,
      solarAnnualGenerationKwh: 14850,
      rainwaterHarvestingCapacityLiters: 10000,
      windowToWallRatioPct: 28.5,
      naturalVentilationRatioPct: 82.0,
      permeableSiteAreaPct: 45.0,
      activeStrategies: [
        '8.5 kWp Monocrystalline Solar PV with smart inverter storage',
        '10,000L Underground rainwater harvesting for toilet flushing & irrigation',
        'FSC Certified CLT Mass Timber internal structure',
        'Argon-filled double Low-E spectrally selective glazing',
        'Deep 1.2m solar overhangs on northern exposure',
        'Cross-ventilation architectural flues with stack-effect thermal chimneys',
        'Low-flow aerated sanitary fittings (4.5 L/min showers, dual 3/4.5L flush)',
        'Drought-tolerant indigenous Cape Fynbos landscaping',
      ],
    },

    cost: {
      totalEstimatedCostUSD: 374800,
      costPerM2: 1414,
      currency: 'USD',
      confidence: 'Schematic',
      regionalFactor: 1.05,
      breakdown: [
        { category: 'Substructure & Foundations', description: 'Reinforced concrete strip footings & engineered slab on grade', amountUSD: 42000, pctOfTotal: 11.2 },
        { category: 'Superstructure & Walls', description: 'Low-carbon concrete blockwork & mass timber CLT upstairs', amountUSD: 98000, pctOfTotal: 26.1 },
        { category: 'Windows & Glazing', description: 'Thermally broken aluminum double Low-E glazing & sliders', amountUSD: 52000, pctOfTotal: 13.9 },
        { category: 'Roofing & Solar PV', description: 'Insulated standing seam roof with 8.5kWp solar array', amountUSD: 36500, pctOfTotal: 9.7 },
        { category: 'Interior Finishes', description: 'Engineered oak flooring, terrazzo tiles, lime plasters', amountUSD: 48000, pctOfTotal: 12.8 },
        { category: 'Plumbing & Rainwater Harvesting', description: 'Low-flow fixtures, solar thermal geyser, 10kL rainwater tanks', amountUSD: 24500, pctOfTotal: 6.5 },
        { category: 'Electrical & Smart Lighting', description: 'LED architectural fixtures, home automation, EV charger', amountUSD: 22800, pctOfTotal: 6.1 },
        { category: 'Pool & Landscaping', description: 'Chlorine-free eco swimming pool, permeable paving, fynbos', amountUSD: 29000, pctOfTotal: 7.7 },
        { category: 'Professional & Preliminaries', description: 'Architectural, engineering, and compliance management', amountUSD: 22000, pctOfTotal: 5.9 },
      ],
    },

    validationErrors: [],

    versions: [
      {
        id: 'ver_1',
        versionNumber: 1,
        name: 'Version 1 — Initial AI Concept Generation',
        timestamp: '2026-08-28T10:00:00Z',
        author: 'Lora AI Engine',
        changeSummary: 'Generated base 4-bedroom two-storey layout from user prompt specification.',
        modelSnapshot: null,
      },
      {
        id: 'ver_2',
        versionNumber: 2,
        name: 'Version 2 — Sustainable / EDGE Optimization',
        timestamp: '2026-08-30T14:30:00Z',
        author: 'Elena Van Der Merwe',
        changeSummary: 'Added 8.5kWp solar array, enlarged North overhangs, replaced conventional blocks with CLT Mass timber on Level 1.',
        modelSnapshot: null,
      },
      {
        id: 'ver_3',
        versionNumber: 3,
        name: 'Version 3 — Client Revisions (Ensuite & Office)',
        timestamp: '2026-09-01T07:30:00Z',
        author: 'Elena Van Der Merwe',
        changeSummary: 'Enlarged master ensuite spa and added custom executive home office desk layout.',
        modelSnapshot: null,
      },
    ],

    comments: [
      {
        id: 'c_01',
        author: 'Julian Vance',
        authorRole: 'Client',
        timestamp: '2026-08-31T11:20:00Z',
        text: 'We love the flow from the open-plan living room directly out onto the pool deck! The natural light in the morning is wonderful.',
        resolved: true,
      },
      {
        id: 'c_02',
        author: 'Dr. Tariq Ndlovu',
        authorRole: 'Sustainability Consultant',
        timestamp: '2026-09-01T06:15:00Z',
        text: 'The 1.2m North overhangs will provide 100% solar cut-off during December peak heat while admitting full winter sun in June. EDGE compliance confirmed at 34.2% energy savings.',
        resolved: false,
      },
    ],
  },
  {
    id: 'proj_nairobi_office',
    name: 'Nairobi Biophilic Innovation Hub',
    description: 'A 3-storey sustainable commercial and collaborative workspace in Westlands, Nairobi. Designed with central naturally ventilated atrium, solar glass facade, and native equatorial gardens.',
    buildingType: 'Office',
    style: 'Biophilic Modern',
    jurisdiction: 'KE',
    createdAt: '2026-08-20T08:00:00Z',
    updatedAt: '2026-08-31T16:00:00Z',
    status: 'in_review',
    isShared: true,
    isTemplate: true,
    targetBudgetUSD: 920000,
    intendedOccupancy: 80,
    architectName: 'Kipchoge Architects',
    clientName: 'Savannah Tech Ventures',
    companyName: 'Lora Architectural Studio',
    drawingNumberPrefix: 'LA-NBO-02',

    site: {
      siteAreaM2: 1200,
      widthM: 30,
      depthM: 40,
      setbackFrontM: 6.0,
      setbackRearM: 4.0,
      setbackSidesM: 3.0,
      orientationNorthDeg: 0,
      slopePct: 2,
      soilType: 'Red Volcanic Clay',
      maxBuildingHeightM: 14.0,
      maxSiteCoveragePct: 60,
      maxFAR: 1.8,
      accessRoadFacing: 'East',
      existingTrees: 6,
    },

    climate: {
      location: 'Westlands, Nairobi, Kenya',
      latitude: -1.27,
      longitude: 36.80,
      climateZone: 'Equatorial Highland (Zone 1)',
      averageSummerTempC: 25,
      averageWinterTempC: 18,
      annualRainfallMm: 950,
      solarIrradianceKwhM2Day: 6.1,
      prevailingWindDirection: 'E / NE Monsoons',
      passiveDesignRecommendations: [
        'Equatorial location allows maximum passive daylight with zero summer overheating using vertical east-west louvers',
        'Central atrium generates natural thermal stack ventilation for 100% mechanical cooling elimination',
        'Harvest 25,000L rainwater from extensive roof array',
      ],
    },

    levels: [
      { id: 'lvl_n0', name: 'Ground Reception & Cafe', elevation: 0.0, height: 3.6, floorPlanVisible: true },
      { id: 'lvl_n1', name: 'First Floor Open Studios', elevation: 3.6, height: 3.4, floorPlanVisible: true },
      { id: 'lvl_n2', name: 'Executive Board & Terrace', elevation: 7.0, height: 3.4, floorPlanVisible: true },
    ],
    activeLevelId: 'lvl_n0',

    walls: [
      { id: 'wn_01', levelId: 'lvl_n0', start: { x: 5, y: 5 }, end: { x: 25, y: 5 }, thickness: 0.22, height: 3.6, type: 'curtain_glass', materialId: 'mat_double_low_e_glass' },
      { id: 'wn_02', levelId: 'lvl_n0', start: { x: 25, y: 5 }, end: { x: 25, y: 25 }, thickness: 0.22, height: 3.6, type: 'external', materialId: 'mat_low_carbon_concrete' },
      { id: 'wn_03', levelId: 'lvl_n0', start: { x: 25, y: 25 }, end: { x: 5, y: 25 }, thickness: 0.22, height: 3.6, type: 'curtain_glass', materialId: 'mat_double_low_e_glass' },
      { id: 'wn_04', levelId: 'lvl_n0', start: { x: 5, y: 25 }, end: { x: 5, y: 5 }, thickness: 0.22, height: 3.6, type: 'external', materialId: 'mat_low_carbon_concrete' },
    ],

    doors: [
      { id: 'dn_01', levelId: 'lvl_n0', wallId: 'wn_01', position: 0.5, width: 2.4, height: 2.8, swingDirection: 'sliding', doorType: 'sliding', material: 'Automated Glass' },
    ],

    windows: [
      { id: 'winn_01', levelId: 'lvl_n0', wallId: 'wn_01', position: 0.2, width: 4.0, height: 2.8, sillHeight: 0.2, glazingType: 'double_low_e', frameMaterial: 'thermal_aluminum', operable: true },
    ],

    columns: [],
    stairs: [],
    rooms: [
      {
        id: 'rm_n_hub',
        levelId: 'lvl_n0',
        name: 'Central Innovation Atrium & Co-Work Hub',
        type: 'open_plan_living',
        points: [{ x: 5, y: 5 }, { x: 25, y: 5 }, { x: 25, y: 25 }, { x: 5, y: 25 }],
        floorArea: 400.0,
        ceilingHeight: 3.6,
        occupancyCapacity: 60,
        minRequiredArea: 100.0,
        naturalLightScore: 'Excellent',
        ventilationScore: 'Excellent',
        accessibilityStatus: 'Compliant',
        finishFloorMaterial: 'Recycled Glass Terrazzo',
        colorHex: '#059669',
      },
    ],
    furniture: [],
    dimensions: [],
    annotations: [],

    sustainability: {
      energySavingsPct: 41.5,
      waterSavingsPct: 45.0,
      embodiedCarbonSavingsPct: 32.0,
      edgeEligible: true,
      annualEnergyKwhPerM2: 38.0,
      annualWaterM3PerOccupant: 18.0,
      embodiedCarbonKgCO2ePerM2: 210,
      solarPvCapacityKwp: 24.0,
      solarAnnualGenerationKwh: 42000,
      rainwaterHarvestingCapacityLiters: 25000,
      windowToWallRatioPct: 35.0,
      naturalVentilationRatioPct: 90.0,
      permeableSiteAreaPct: 52.0,
      activeStrategies: [
        'Central solar chimney atrium powering zero-energy passive ventilation',
        '24 kWp Rooftop bifacial photovoltaic system with net-metering',
        '25,000L Rainwater filtration and greywater recycling',
        'Cross-Laminated Timber internal floor plates',
      ],
    },

    cost: {
      totalEstimatedCostUSD: 890000,
      costPerM2: 1112,
      currency: 'USD',
      confidence: 'Schematic',
      regionalFactor: 0.95,
      breakdown: [
        { category: 'Superstructure & Atrium Frame', description: 'Low-carbon concrete & exposed timber glulam', amountUSD: 280000, pctOfTotal: 31.4 },
        { category: 'High-Performance Facades', description: 'Spectrally selective solar control double curtain wall', amountUSD: 195000, pctOfTotal: 21.9 },
        { category: 'Solar PV & Sustainable Systems', description: '24 kWp solar, 25kL tanks, smart BMS', amountUSD: 110000, pctOfTotal: 12.3 },
        { category: 'Interior Fitout & Acoustics', description: 'Sustainable acoustic wood paneling & terrazzo', amountUSD: 160000, pctOfTotal: 18.0 },
        { category: 'Preliminaries & Professional Fees', description: 'Engineering, architectural, EDGE verification', amountUSD: 145000, pctOfTotal: 16.3 },
      ],
    },

    validationErrors: [],
    versions: [],
    comments: [],
  },
];
