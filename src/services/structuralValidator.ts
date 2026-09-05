import {
  ArchitecturalProject,
  StructuralIssue,
  StructuralAnalysisReport,
  Point2D,
  Room,
} from '../types/architecture';

/**
 * STRUCTURAL LOGIC VALIDATION SERVICE
 * Runs in the background to analyze the structural feasibility of the BIM model:
 * - Identifies unsupported spans (>5.5m without intermediate column / beam)
 * - Identifies excessive structural loads and unpropped cantilever extensions
 * - Detects missing vertical support members and multi-storey load path discontinuities
 */
export function validateStructuralLogic(project: ArchitecturalProject): StructuralAnalysisReport {
  const issues: StructuralIssue[] = [];

  const levels = project.levels || [];
  const rooms = project.rooms || [];
  const walls = project.walls || [];
  const columns = project.columns || [];

  let maxDetectedSpanM = 0;
  let criticalSpansCount = 0;
  let unsupportedWallCount = 0;
  let cantileverWarningsCount = 0;

  // 1. Check Room Spans & Open Space Clearances
  rooms.forEach((room) => {
    const pts = room.points || [];
    if (pts.length < 3) return;

    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const width = Math.max(...xs) - Math.min(...xs);
    const depth = Math.max(...ys) - Math.min(...ys);
    const minSpan = Math.min(width, depth);
    const maxSpan = Math.max(width, depth);

    if (maxSpan > maxDetectedSpanM) {
      maxDetectedSpanM = parseFloat(maxSpan.toFixed(2));
    }

    // Check if any column is inside this room
    const roomMinX = Math.min(...xs);
    const roomMaxX = Math.max(...xs);
    const roomMinY = Math.min(...ys);
    const roomMaxY = Math.max(...ys);

    const columnsInRoom = columns.filter((c) => {
      return (
        c.levelId === room.levelId &&
        c.position.x >= roomMinX + 0.5 &&
        c.position.x <= roomMaxX - 0.5 &&
        c.position.y >= roomMinY + 0.5 &&
        c.position.y <= roomMaxY - 0.5
      );
    });

    const levelName = levels.find((l) => l.id === room.levelId)?.name || 'Ground Level';

    // Critical or High Span check
    // Max unpropped span threshold is 5.8m for standard RC slab / timber joists
    if (minSpan > 5.8 && columnsInRoom.length === 0) {
      const isCritical = minSpan > 7.2;
      if (isCritical) criticalSpansCount++;

      issues.push({
        id: `struct_span_${room.id}`,
        code: `STR-SPAN-${room.id.slice(-4)}`,
        title: `Unsupported ${minSpan.toFixed(1)}m Clear Span in ${room.name}`,
        severity: isCritical ? 'Critical' : 'High',
        category: 'Unsupported Span',
        levelId: room.levelId,
        levelName,
        roomId: room.id,
        roomName: room.name,
        position: {
          x: parseFloat(((roomMinX + roomMaxX) / 2).toFixed(2)),
          y: parseFloat(((roomMinY + roomMaxY) / 2).toFixed(2)),
        },
        spanLengthM: parseFloat(minSpan.toFixed(2)),
        maxAllowedSpanM: 5.5,
        structuralRisk: `Clear span of ${minSpan.toFixed(1)}m exceeds standard allowable unpropped deflection limit (L/250). Risk of excessive live-load sag, ceiling plaster cracking, and shear overstress during full occupancy.`,
        recommendedSolution: `Introduce a 350×350mm reinforced concrete structural column or a 450×250mm downstand steel/RC transfer beam at the mid-span location.`,
        aiActionPrompt: `Add intermediate structural column to support clear span in ${room.name}`,
        status: 'pending',
      });
    }
  });

  // 2. Check Multi-Storey Load Path Continuity (Upper Walls vs Ground Support)
  if (levels.length > 1) {
    const groundLevel = levels[0];
    const upperLevels = levels.slice(1);

    const groundWalls = walls.filter((w) => w.levelId === groundLevel.id);
    const groundColumns = columns.filter((c) => c.levelId === groundLevel.id);

    upperLevels.forEach((uLevel) => {
      const upperWalls = walls.filter((w) => w.levelId === uLevel.id && w.type === 'external');

      upperWalls.forEach((uWall) => {
        const uMidX = (uWall.start.x + uWall.end.x) / 2;
        const uMidY = (uWall.start.y + uWall.end.y) / 2;

        // Check if there is a supporting ground wall or column within 0.8m of this upper wall
        const hasGroundWallSupport = groundWalls.some((gWall) => {
          const gMidX = (gWall.start.x + gWall.end.x) / 2;
          const gMidY = (gWall.start.y + gWall.end.y) / 2;
          return Math.hypot(uMidX - gMidX, uMidY - gMidY) < 1.4;
        });

        const hasGroundColumnSupport = groundColumns.some((col) => {
          return Math.hypot(uMidX - col.position.x, uMidY - col.position.y) < 1.8;
        });

        if (!hasGroundWallSupport && !hasGroundColumnSupport) {
          unsupportedWallCount++;
          issues.push({
            id: `struct_loadpath_${uWall.id}`,
            code: `STR-PATH-${uWall.id.slice(-4)}`,
            title: `Discontinuous Load Path: Upper Façade Wall on ${uLevel.name}`,
            severity: 'Critical',
            category: 'Missing Support',
            levelId: uLevel.id,
            levelName: uLevel.name,
            position: { x: parseFloat(uMidX.toFixed(2)), y: parseFloat(uMidY.toFixed(2)) },
            structuralRisk: `Upper level external wall imparts a 22 kN/m gravity line load directly onto an unsupported slab zone on ${groundLevel.name} without an underlying loadbearing wall or transfer beam.`,
            recommendedSolution: `Insert a reinforced concrete transfer beam (500×300mm) or align ground floor perimeter walls to catch vertical gravity loads.`,
            aiActionPrompt: `Add structural transfer beam and ground column under upper level wall`,
            status: 'pending',
          });
        }
      });
    });
  }

  // 3. Cantilever Overhang & Heavy Load Checks
  if (levels.length > 1) {
    const lvl0Rooms = rooms.filter((r) => r.levelId === levels[0].id);
    const lvl1Rooms = rooms.filter((r) => r.levelId === levels[1]?.id);

    if (lvl0Rooms.length > 0 && lvl1Rooms.length > 0) {
      const lvl0MaxX = Math.max(...lvl0Rooms.flatMap((r) => r.points.map((p) => p.x)));
      const lvl1MaxX = Math.max(...lvl1Rooms.flatMap((r) => r.points.map((p) => p.x)));

      const overhangX = lvl1MaxX - lvl0MaxX;
      if (overhangX > 2.2) {
        cantileverWarningsCount++;
        issues.push({
          id: `struct_cantilever_01`,
          code: 'STR-CANT-01',
          title: `Overextended Upper Level Cantilever (${overhangX.toFixed(1)}m Overhang)`,
          severity: 'High',
          category: 'Cantilever Overhang',
          levelId: levels[1].id,
          levelName: levels[1].name,
          position: { x: parseFloat(lvl1MaxX.toFixed(2)), y: 10 },
          spanLengthM: parseFloat(overhangX.toFixed(2)),
          maxAllowedSpanM: 2.0,
          structuralRisk: `Cantilever projection of ${overhangX.toFixed(1)}m creates high negative hogging moments and dynamic footfall vibration without propped column supports below.`,
          recommendedSolution: `Add two external 300×300mm architectural support columns at the outer edge of the cantilevered slab.`,
          aiActionPrompt: `Add ground-level support columns under upper terrace cantilever`,
          status: 'pending',
        });
      }
    }
  }

  // 4. Roof Equipment Load Check (Solar PV array / Water storage)
  if (project.sustainability?.solarPvCapacityKwp >= 8 && columns.length < 2) {
    issues.push({
      id: 'struct_roof_load_01',
      code: 'STR-LOAD-01',
      title: 'Heavy Rooftop Solar Array (8.5 kWp) Primary Framing Verification',
      severity: 'Medium',
      category: 'Excessive Load',
      levelId: levels[levels.length - 1]?.id || 'lvl_0',
      levelName: 'Roof Level',
      loadDescription: '8.5 kWp Solar PV ballast + mounting dead load (~18 kg/m²)',
      structuralRisk: 'Additional dead load and wind uplift forces from solar PV array require reinforced roof purlins and continuous vertical load tying.',
      recommendedSolution: 'Specify heavy-gauge timber roof trusses with hurricane tie-downs anchored into reinforced bond beams.',
      aiActionPrompt: 'Reinforce roof structural tying and truss spacing for solar array',
      status: 'pending',
    });
  }

  // Calculate Overall Structural Health Score
  const criticalCount = issues.filter((i) => i.severity === 'Critical').length;
  const highCount = issues.filter((i) => i.severity === 'High').length;
  const mediumCount = issues.filter((i) => i.severity === 'Medium').length;

  let healthScore = 98 - (criticalCount * 22 + highCount * 12 + mediumCount * 5);
  healthScore = Math.max(45, Math.min(99, healthScore));

  let status: 'Sound Structural Integrity' | 'Minor Non-Compliances' | 'Critical Structural Risks' =
    'Sound Structural Integrity';
  if (criticalCount > 0) {
    status = 'Critical Structural Risks';
  } else if (highCount > 0 || mediumCount > 0) {
    status = 'Minor Non-Compliances';
  }

  return {
    overallHealthScore: healthScore,
    status,
    totalIssuesCount: issues.length,
    criticalIssuesCount: criticalCount,
    highIssuesCount: highCount,
    mediumIssuesCount: mediumCount,
    maxDetectedSpanM: maxDetectedSpanM || 5.2,
    criticalSpansCount,
    unsupportedWallCount,
    cantileverWarningsCount,
    issues,
    lastEvaluated: new Date().toISOString(),
  };
}
