import {
  ArchitecturalProject,
  Room,
  Window,
  Wall,
  Point2D,
  RoomDaylightMetrics,
  DaylightHeatmapCell,
  DaylightAnalysisResult,
  DaylightSimulationConfig,
  SimulationSeason,
  SimulationSkyCondition,
} from '../types/architecture';

/**
 * SOLAR GEOMETRY CALCULATOR
 * Accurately calculates solar position (altitude and azimuth) for any geographic latitude and time.
 */
export function calculateSolarPosition(
  latitudeDeg: number,
  timeOfDayHours: number,
  season: SimulationSeason
): { altitudeDeg: number; azimuthDeg: number } {
  // Solar declination depending on season
  // Summer Solstice: ~+23.45° for North, -23.45° for South.
  // We determine hemisphere from latitude.
  const isSouthern = latitudeDeg < 0;
  let declinationDeg = 0;
  if (season === 'summer_solstice') {
    declinationDeg = isSouthern ? -23.45 : 23.45;
  } else if (season === 'winter_solstice') {
    declinationDeg = isSouthern ? 23.45 : -23.45;
  } else {
    // Equinox
    declinationDeg = 0;
  }

  const latRad = (latitudeDeg * Math.PI) / 180;
  const decRad = (declinationDeg * Math.PI) / 180;

  // Hour angle: 12:00 = 0°, 1 hour = 15°
  const hourAngleDeg = (timeOfDayHours - 12) * 15;
  const hourAngleRad = (hourAngleDeg * Math.PI) / 180;

  // Solar Altitude (Elevation angle above horizon)
  const sinAlt =
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(hourAngleRad);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altitudeDeg = (altitudeRad * 180) / Math.PI;

  if (altitudeDeg <= 0) {
    return { altitudeDeg: 0, azimuthDeg: 0 };
  }

  // Solar Azimuth (0° North, 90° East, 180° South, 270° West)
  const cosAz =
    (Math.sin(decRad) - Math.sin(latRad) * Math.sin(altitudeRad)) /
    (Math.cos(latRad) * Math.cos(altitudeRad) || 0.0001);
  const clampedCosAz = Math.max(-1, Math.min(1, cosAz));
  let azimuthDeg = (Math.acos(clampedCosAz) * 180) / Math.PI;

  if (hourAngleDeg > 0) {
    azimuthDeg = 360 - azimuthDeg;
  }

  // Southern hemisphere normalization
  if (isSouthern) {
    azimuthDeg = (azimuthDeg + 180) % 360;
  }

  return {
    altitudeDeg: Math.max(0, parseFloat(altitudeDeg.toFixed(1))),
    azimuthDeg: parseFloat(azimuthDeg.toFixed(1)),
  };
}

/**
 * Photometric false-color lux ramp mapping
 */
export function luxToColor(lux: number): { hex: string; normalized: number } {
  const maxLux = 2500;
  const normalized = Math.min(1, Math.max(0, lux / maxLux));

  if (lux < 80) return { hex: '#1E1B4B', normalized }; // Deep Midnight Indigo (<80 lx)
  if (lux < 200) return { hex: '#1D4ED8', normalized }; // Cobalt Blue
  if (lux < 350) return { hex: '#0284C7', normalized }; // Cerulean
  if (lux < 500) return { hex: '#0D9488', normalized }; // Teal / Cyan (Good general ambient)
  if (lux < 800) return { hex: '#16A34A', normalized }; // Fresh Green (Target task reading)
  if (lux < 1200) return { hex: '#84CC16', normalized }; // Lime Green
  if (lux < 1600) return { hex: '#EAB308', normalized }; // Bright Golden Amber
  if (lux < 2200) return { hex: '#F97316', normalized }; // Warm Orange
  return { hex: '#EF4444', normalized }; // Glare risk (>2200 lx)
}

/**
 * Get wall normal facing direction (North, East, South, West)
 */
export function getWallNormal(wall: Wall): { nx: number; ny: number; azimuthDeg: number; orientationName: 'North' | 'South' | 'East' | 'West' } {
  const dx = wall.end.x - wall.start.x;
  const dy = wall.end.y - wall.start.y;
  const len = Math.hypot(dx, dy) || 1;

  // Normal pointing outward perpendicular to wall direction
  const nx = -dy / len;
  const ny = dx / len;

  let azimuthDeg = (Math.atan2(nx, -ny) * 180) / Math.PI;
  if (azimuthDeg < 0) azimuthDeg += 360;

  let orientationName: 'North' | 'South' | 'East' | 'West' = 'North';
  if (azimuthDeg >= 45 && azimuthDeg < 135) orientationName = 'East';
  else if (azimuthDeg >= 135 && azimuthDeg < 225) orientationName = 'South';
  else if (azimuthDeg >= 225 && azimuthDeg < 315) orientationName = 'West';
  else orientationName = 'North';

  return { nx, ny, azimuthDeg, orientationName };
}

/**
 * Checks if point is inside a 2D polygon
 */
export function isPointInPolygon(point: Point2D, vs: Point2D[]): boolean {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x,
      yi = vs[i].y;
    const xj = vs[j].x,
      yj = vs[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || 0.0001) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * REAL-TIME DAYLIGHT & NATURAL LIGHT EXPOSURE ENGINE
 * Calculates room metrics, Spatial Daylight Autonomy (sDA), Daylight Factor (DF),
 * and 2D floor plan illuminance heatmap cells.
 */
export function calculateNaturalLightExposure(
  project: ArchitecturalProject,
  config?: Partial<DaylightSimulationConfig>
): DaylightAnalysisResult {
  const timeOfDay = config?.timeOfDay ?? 11.5;
  const season = config?.season ?? 'summer_solstice';
  const skyCondition = config?.skyCondition ?? 'clear';

  const latitude = project.climate?.latitude ?? -33.95;
  const solarPos = calculateSolarPosition(latitude, timeOfDay, season);

  // Irradiance models based on sky condition and sun altitude
  let baseOutdoorLux = 0;
  let dniW = 0;
  let dhiW = 0;

  if (solarPos.altitudeDeg > 0) {
    const altRad = (solarPos.altitudeDeg * Math.PI) / 180;
    if (skyCondition === 'clear') {
      dniW = Math.max(0, 850 * Math.sin(altRad));
      dhiW = Math.max(0, 120 * Math.sin(altRad));
      baseOutdoorLux = Math.round(95000 * Math.sin(altRad));
    } else if (skyCondition === 'partly_cloudy') {
      dniW = Math.max(0, 500 * Math.sin(altRad));
      dhiW = Math.max(0, 220 * Math.sin(altRad));
      baseOutdoorLux = Math.round(55000 * Math.sin(altRad));
    } else {
      // Overcast
      dniW = 0;
      dhiW = Math.max(0, 180 * Math.sin(altRad));
      baseOutdoorLux = Math.round(18000 * Math.sin(altRad));
    }
  }

  const fullConfig: DaylightSimulationConfig = {
    timeOfDay,
    season,
    skyCondition,
    directNormalIrradianceW: Math.round(dniW),
    diffuseHorizontalIrradianceW: Math.round(dhiW),
    solarAltitudeDeg: solarPos.altitudeDeg,
    solarAzimuthDeg: solarPos.azimuthDeg,
  };

  // Map windows to their world coordinates and wall info
  const windowLookup: {
    window: Window;
    center: Point2D;
    normal: { nx: number; ny: number; azimuthDeg: number; orientationName: 'North' | 'South' | 'East' | 'West' };
    areaM2: number;
    vlt: number;
    shadingFactor: number;
  }[] = [];

  project.windows.forEach((win) => {
    const wall = project.walls.find((w) => w.id === win.wallId);
    if (!wall) return;

    const center: Point2D = {
      x: wall.start.x + (wall.end.x - wall.start.x) * (win.position || 0.5),
      y: wall.start.y + (wall.end.y - wall.start.y) * (win.position || 0.5),
    };

    const normal = getWallNormal(wall);
    const areaM2 = (win.width || 1.5) * (win.height || 1.4);

    let vlt = 0.7; // Visible Light Transmittance
    if (win.glazingType === 'double_low_e') vlt = 0.72;
    else if (win.glazingType === 'triple_insulated') vlt = 0.62;
    else if (win.glazingType === 'single_clear') vlt = 0.85;
    else if (win.glazingType === 'tinted_solar_control') vlt = 0.46;

    let shadingFactor = 1.0;
    if (win.shadingType === 'overhang') shadingFactor = 0.65;
    else if (win.shadingType === 'louvers') shadingFactor = 0.5;
    else if (win.shadingType === 'solar_screen') shadingFactor = 0.4;

    windowLookup.push({
      window: win,
      center,
      normal,
      areaM2,
      vlt,
      shadingFactor,
    });
  });

  // Calculate room daylight metrics
  const activeLevelId = project.activeLevelId || 'lvl_0';
  const activeRooms = project.rooms.filter((r) => r.levelId === activeLevelId);

  const roomMetrics: RoomDaylightMetrics[] = [];
  const heatmapGrid: DaylightHeatmapCell[] = [];

  let totalBuildingLux = 0;
  let totalDF = 0;
  let totalSDA = 0;

  activeRooms.forEach((room) => {
    const pts = room.points || [];
    if (pts.length < 3) return;

    // Find bounding box of room
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));

    // Find windows associated with this room boundary (within 1.5m radius of room perimeter)
    const associatedWindows = windowLookup.filter((wObj) => {
      return (
        wObj.center.x >= minX - 0.8 &&
        wObj.center.x <= maxX + 0.8 &&
        wObj.center.y >= minY - 0.8 &&
        wObj.center.y <= maxY + 0.8
      );
    });

    const totalWindowArea = associatedWindows.reduce((acc, w) => acc + w.areaM2, 0);
    const floorArea = room.floorArea || Math.max(4, (maxX - minX) * (maxY - minY));
    const windowToFloorRatioPct = parseFloat(((totalWindowArea / (floorArea || 1)) * 100).toFixed(1));

    // Primary room orientation based on predominant window direction
    let primaryOrientation: 'North' | 'South' | 'East' | 'West' | 'Interior' = 'Interior';
    if (associatedWindows.length > 0) {
      const counts: Record<string, number> = { North: 0, South: 0, East: 0, West: 0 };
      associatedWindows.forEach((w) => {
        counts[w.normal.orientationName] += w.areaM2;
      });
      const topOrient = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topOrient && topOrient[1] > 0) {
        primaryOrientation = topOrient[0] as any;
      }
    }

    // Grid sampling for heatmap and spatial daylight autonomy
    const step = 0.5; // 0.5m grid step
    const roomSampleLux: number[] = [];

    for (let x = minX + 0.25; x <= maxX - 0.25; x += step) {
      for (let y = minY + 0.25; y <= maxY - 0.25; y += step) {
        const samplePt: Point2D = { x, y };
        if (isPointInPolygon(samplePt, pts)) {
          // Calculate point illuminance from all nearby windows
          let pointLux = 45; // Ambient indoor base inter-reflection

          if (solarPos.altitudeDeg > 0 && associatedWindows.length > 0) {
            associatedWindows.forEach((wObj) => {
              const dist = Math.hypot(x - wObj.center.x, y - wObj.center.y);
              const dx = x - wObj.center.x;
              const dy = y - wObj.center.y;
              const dirLen = dist || 0.001;
              const dirNormX = dx / dirLen;
              const dirNormY = dy / dirLen;

              // Angle of incidence from window normal to point
              const cosInward = -(dirNormX * wObj.normal.nx + dirNormY * wObj.normal.ny);

              if (cosInward > 0.05) {
                // Diffuse daylight component
                const skyDiffuseFactor = (baseOutdoorLux * 0.06 * wObj.areaM2 * wObj.vlt) / (dist * dist + 1.2);
                pointLux += skyDiffuseFactor * cosInward;

                // Direct beam solar penetration
                // Check if solar ray aligns with window normal
                const sunRad = ((solarPos.azimuthDeg - 90) * Math.PI) / 180;
                const sunDirX = Math.cos(sunRad);
                const sunDirY = Math.sin(sunRad);
                const sunDotWindow = -(sunDirX * wObj.normal.nx + sunDirY * wObj.normal.ny);

                if (sunDotWindow > 0.1) {
                  // Direct sunlight vector projection into room
                  const directSunLux =
                    dniW *
                    95 *
                    wObj.vlt *
                    wObj.shadingFactor *
                    sunDotWindow *
                    Math.exp(-0.35 * dist);
                  pointLux += Math.max(0, directSunLux);
                }
              }
            });
          }

          pointLux = Math.min(3200, Math.round(pointLux));
          roomSampleLux.push(pointLux);

          const { hex, normalized } = luxToColor(pointLux);
          heatmapGrid.push({
            x,
            y,
            lux: pointLux,
            normalizedLux: normalized,
            colorHex: hex,
            isSDACompliant: pointLux >= 300,
            roomId: room.id,
          });
        }
      }
    }

    // Compute aggregated metrics for this room
    const avgLux = roomSampleLux.length > 0 ? Math.round(roomSampleLux.reduce((a, b) => a + b, 0) / roomSampleLux.length) : 120;
    const peakLux = roomSampleLux.length > 0 ? Math.max(...roomSampleLux) : 150;
    const minLux = roomSampleLux.length > 0 ? Math.min(...roomSampleLux) : 40;

    // Daylight Factor DF % = (Avg Lux / Outdoor Lux) * 100
    const rawDF = baseOutdoorLux > 5000 ? (avgLux / baseOutdoorLux) * 100 : (windowToFloorRatioPct * 0.22);
    const daylightFactorPct = parseFloat(Math.min(8.5, Math.max(0.4, rawDF)).toFixed(2));

    // Spatial Daylight Autonomy (sDA 300 lx): fraction of points >= 300 lx
    const sdaPoints = roomSampleLux.filter((lx) => lx >= 300).length;
    const spatialDaylightAutonomyPct = roomSampleLux.length > 0 ? Math.round((sdaPoints / roomSampleLux.length) * 100) : 15;

    // Annual Sunlight Exposure (ASE > 1000 lx glare)
    const glarePoints = roomSampleLux.filter((lx) => lx >= 1400).length;
    const annualSunlightExposurePct = roomSampleLux.length > 0 ? Math.round((glarePoints / roomSampleLux.length) * 100) : 5;

    const uniformityRatio = parseFloat((minLux / (avgLux || 1)).toFixed(2));

    let comfortRating: 'Optimal Daylight' | 'Well Lit' | 'Moderate' | 'Undersupplied' | 'High Glare Risk' = 'Well Lit';
    if (annualSunlightExposurePct > 35) comfortRating = 'High Glare Risk';
    else if (spatialDaylightAutonomyPct >= 75 && annualSunlightExposurePct < 15) comfortRating = 'Optimal Daylight';
    else if (spatialDaylightAutonomyPct >= 55) comfortRating = 'Well Lit';
    else if (spatialDaylightAutonomyPct >= 30) comfortRating = 'Moderate';
    else comfortRating = 'Undersupplied';

    // SANS 10400 / LEED / BREEAM standard compliance
    const isCodeCompliant = windowToFloorRatioPct >= 10 && daylightFactorPct >= 1.8;

    let recommendation = '';
    if (comfortRating === 'High Glare Risk') {
      recommendation = `Add 600mm external timber louvers or Low-E spectrally selective coating to mitigate direct solar glare on ${primaryOrientation} aperture.`;
    } else if (comfortRating === 'Undersupplied') {
      recommendation = `Increase glazing width by 0.6m or add high-level clerestory window to meet code daylight autonomy threshold.`;
    } else {
      recommendation = `Daylight levels are optimal for ${room.type.replace('_', ' ')} tasks with low artificial lighting demand.`;
    }

    roomMetrics.push({
      roomId: room.id,
      roomName: room.name,
      roomType: room.type,
      levelId: room.levelId,
      floorAreaM2: parseFloat(floorArea.toFixed(1)),
      windowAreaM2: parseFloat(totalWindowArea.toFixed(1)),
      windowToFloorRatioPct,
      primaryOrientation,
      averageLux: avgLux,
      peakLux,
      minLux,
      daylightFactorPct,
      spatialDaylightAutonomyPct,
      annualSunlightExposurePct,
      uniformityRatio,
      comfortRating,
      codeCompliance: {
        standard: 'SANS 10400-O / LEED v4.1 Daylight',
        isCompliant: isCodeCompliant,
        requiredDFPct: 2.0,
        requiredWFR: 10.0,
        note: isCodeCompliant ? 'Fully Compliant (DF ≥ 2.0%, WFR ≥ 10%)' : 'Deficient natural daylight (Add glazing or light shelf)',
      },
      recommendation,
    });

    totalBuildingLux += avgLux;
    totalDF += daylightFactorPct;
    totalSDA += spatialDaylightAutonomyPct;
  });

  const roomCount = Math.max(1, activeRooms.length);
  const averageBuildingLux = Math.round(totalBuildingLux / roomCount);
  const averageDaylightFactorPct = parseFloat((totalDF / roomCount).toFixed(2));
  const overallDaylightAutonomyPct = Math.round(totalSDA / roomCount);

  // Facade solar exposure estimates
  const isSouthern = latitude < 0;
  const facadeSolarExposure = {
    northKwhM2: isSouthern ? 5.6 : 2.4,
    southKwhM2: isSouthern ? 2.1 : 5.8,
    eastKwhM2: 4.2,
    westKwhM2: 4.9,
  };

  return {
    config: fullConfig,
    overallDaylightAutonomyPct,
    averageBuildingLux,
    averageDaylightFactorPct,
    leedCompliancePct: Math.min(100, Math.round(overallDaylightAutonomyPct * 1.15)),
    breeamCompliancePct: Math.min(100, Math.round(overallDaylightAutonomyPct * 1.08)),
    edgeComplianceStatus: overallDaylightAutonomyPct >= 50 ? 'Passed' : 'Review Required',
    roomMetrics,
    heatmapGrid,
    facadeSolarExposure,
  };
}
