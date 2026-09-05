import * as THREE from 'three';

// Procedural Canvas-based High-Res Textures for Ultra-Realistic PBR Architecture
class BIMTextureGenerator {
  private cache: Map<string, THREE.CanvasTexture> = new Map();

  // 1. Fair-Faced Architectural Concrete with formwork seams & tie-holes
  public getConcreteTexture(): THREE.CanvasTexture {
    if (this.cache.has('concrete')) return this.cache.get('concrete')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Base concrete gray
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 512, 512);

    // Micro-speckle noise
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 18;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Formwork horizontal panel lines
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.25)';
    ctx.lineWidth = 2;
    for (let y = 128; y < 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Tie-bolt anchor points
    ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
    const tiePoints = [
      [64, 64], [448, 64], [64, 192], [448, 192],
      [64, 320], [448, 320], [64, 448], [448, 448]
    ];
    tiePoints.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    this.cache.set('concrete', texture);
    return texture;
  }

  // 2. Warm Mass Timber CLT / Oak Slat Grain
  public getTimberTexture(): THREE.CanvasTexture {
    if (this.cache.has('timber')) return this.cache.get('timber')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Warm timber base
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 512, 512);

    // Wood planks & grain stripes
    const plankWidth = 64;
    for (let x = 0; x < 512; x += plankWidth) {
      const tint = (Math.random() - 0.5) * 20;
      ctx.fillStyle = `rgba(180, 83, 9, ${0.15 + Math.random() * 0.15})`;
      ctx.fillRect(x, 0, plankWidth, 512);

      // Slat seam divider
      ctx.strokeStyle = 'rgba(69, 26, 3, 0.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();

      // Subtle grain lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.lineWidth = 1;
      for (let g = 0; g < 6; g++) {
        const gx = x + Math.random() * plankWidth;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.bezierCurveTo(gx + 8, 170, gx - 8, 340, gx, 512);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    this.cache.set('timber', texture);
    return texture;
  }

  // 3. Monocrystalline Solar PV Cell Matrix
  public getSolarPVTexture(): THREE.CanvasTexture {
    if (this.cache.has('solarpv')) return this.cache.get('solarpv')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Dark silicon blue-black
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 512);

    const cellSize = 64;
    for (let x = 0; x < 512; x += cellSize) {
      for (let y = 0; y < 512; y += cellSize) {
        // PV Wafer
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

        // Anti-reflective diamond corner clips
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(x + 10, y + 2);
        ctx.lineTo(x + 2, y + 10);
        ctx.fill();

        // Silver Busbar grid lines
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + cellSize / 3, y + 2);
        ctx.lineTo(x + cellSize / 3, y + cellSize - 2);
        ctx.moveTo(x + (2 * cellSize) / 3, y + 2);
        ctx.lineTo(x + (2 * cellSize) / 3, y + cellSize - 2);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set('solarpv', texture);
    return texture;
  }

  // 4. Luxury Stone Terrace Pavers
  public getStonePaversTexture(): THREE.CanvasTexture {
    if (this.cache.has('pavers')) return this.cache.get('pavers')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 128;
    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 3, y + 3, tileSize - 6, tileSize - 6);

        // Stone texture grain
        ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
        for (let i = 0; i < 40; i++) {
          ctx.fillRect(x + Math.random() * tileSize, y + Math.random() * tileSize, 2, 2);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set('pavers', texture);
    return texture;
  }

  // 5. Landscaped Turf Grass
  public getGrassTexture(): THREE.CanvasTexture {
    if (this.cache.has('grass')) return this.cache.get('grass')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 512, 512);

    // Natural grass speckles
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const shift = (Math.random() - 0.5) * 35;
      data[i] = Math.min(255, Math.max(0, 21 + shift * 0.4)); // R
      data[i + 1] = Math.min(255, Math.max(0, 128 + shift));   // G
      data[i + 2] = Math.min(255, Math.max(0, 61 + shift * 0.3)); // B
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    this.cache.set('grass', texture);
    return texture;
  }

  // 6. Solar Radiation / Thermal Heatmap Gradient Texture
  public getSolarHeatmapTexture(): THREE.CanvasTexture {
    if (this.cache.has('solarHeatmap')) return this.cache.get('solarHeatmap')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Dynamic radial/linear false-color heat gradient (Blue -> Cyan -> Green -> Yellow -> Red)
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0.0, '#1e3a8a'); // < 400 kWh/m² (deep shadow)
    grad.addColorStop(0.25, '#06b6d4'); // 650 kWh/m²
    grad.addColorStop(0.5, '#10b981'); // 900 kWh/m²
    grad.addColorStop(0.75, '#f59e0b'); // 1200 kWh/m²
    grad.addColorStop(1.0, '#ef4444'); // > 1550 kWh/m² (high radiation peak)

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('solarHeatmap', texture);
    return texture;
  }

  // 7. Thermal Insulation U-Value Heatmap
  public getThermalHeatmapTexture(): THREE.CanvasTexture {
    if (this.cache.has('thermalHeatmap')) return this.cache.get('thermalHeatmap')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0.0, '#10b981'); // Ultra insulated (U < 0.28)
    grad.addColorStop(0.4, '#38bdf8'); // High performance glazing (U = 1.1)
    grad.addColorStop(0.7, '#f59e0b'); // Moderate wall (U = 1.8)
    grad.addColorStop(1.0, '#ef4444'); // Thermal bridge / heat loss (U > 3.5)

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('thermalHeatmap', texture);
    return texture;
  }

  // 8. FSC Engineered Oak Herringbone Parquet
  public getParquetTexture(): THREE.CanvasTexture {
    if (this.cache.has('parquet')) return this.cache.get('parquet')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 512, 512);

    const pw = 64;
    const ph = 128;
    for (let y = 0; y < 512; y += ph) {
      for (let x = 0; x < 512; x += pw) {
        const shade = Math.sin(x * 12 + y * 7) * 25;
        ctx.fillStyle = `rgb(${180 + shade * 0.4}, ${100 + shade * 0.3}, ${35 + shade * 0.2})`;
        ctx.fillRect(x + 1, y + 1, pw - 2, ph - 2);

        // Wood grain
        ctx.strokeStyle = 'rgba(78, 30, 4, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + pw / 2, y);
        ctx.lineTo(x + pw / 2, y + ph);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set('parquet', texture);
    return texture;
  }

  // 9. Italian Roman Travertine Marble
  public getTravertineTexture(): THREE.CanvasTexture {
    if (this.cache.has('travertine')) return this.cache.get('travertine')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 512, 512);

    // Marble veins & mineral deposits
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 2;
    for (let v = 0; v < 8; v++) {
      ctx.beginPath();
      ctx.moveTo(0, v * 64 + Math.random() * 20);
      ctx.bezierCurveTo(150, v * 64 + 40, 350, v * 64 - 30, 512, v * 64 + Math.random() * 20);
      ctx.stroke();
    }

    // Grout lines
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.6)';
    ctx.lineWidth = 2;
    for (let x = 128; x < 512; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 512);
      ctx.stroke();
    }
    for (let y = 128; y < 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    this.cache.set('travertine', texture);
    return texture;
  }

  // 10. Recycled Aggregate Terrazzo
  public getTerrazzoTexture(): THREE.CanvasTexture {
    if (this.cache.has('terrazzo')) return this.cache.get('terrazzo')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0f766e';
    ctx.fillRect(0, 0, 512, 512);

    // Marble & quartz aggregate flakes
    const colors = ['#f8fafc', '#d97706', '#0284c7', '#334155', '#ec4899'];
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = colors[i % colors.length];
      const rx = Math.random() * 512;
      const ry = Math.random() * 512;
      const r = 2 + Math.random() * 5;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    this.cache.set('terrazzo', texture);
    return texture;
  }
}

export const bimTextures = new BIMTextureGenerator();
