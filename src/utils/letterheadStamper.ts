import { APP_LOGO_STATIC_URL, APP_LOGO } from '../assets/logo';

export interface LetterheadMeta {
  projectName: string;
  viewTitle: string;
  category?: string;
  architectName?: string;
  companyName?: string;
  location?: string;
  engine?: string;
  date?: string;
  scale?: string;
  stage?: string;
}

/**
 * Loads an image from URL or dataURL into an HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    // If it's a remote URL (not data: or relative), route through proxy if needed
    if (src.startsWith('http') && !src.includes(window.location.host)) {
      img.src = `/api/image-proxy?url=${encodeURIComponent(src)}`;
    } else {
      img.src = src;
    }
  });
}

/**
 * Stamps an architectural letterhead header and titleblock directly onto an image canvas.
 * Guarantees every generated and exported image in the platform features the official logo.
 */
export async function stampLetterheadOnImage(
  imageUrl: string,
  meta: LetterheadMeta
): Promise<string> {
  try {
    const [baseImg, logoImg] = await Promise.all([
      loadImage(imageUrl),
      loadImage(APP_LOGO || APP_LOGO_STATIC_URL).catch(() => null),
    ]);

    const canvas = document.createElement('canvas');
    const width = baseImg.naturalWidth || baseImg.width || 1600;
    const height = baseImg.naturalHeight || baseImg.height || 1000;

    // We add a top letterhead header (height ~80px relative to 1000px) and bottom titleblock (~60px)
    const topBarHeight = Math.round(height * 0.08); // 8% of height
    const bottomBarHeight = Math.round(height * 0.065); // 6.5% of height

    canvas.width = width;
    canvas.height = height + topBarHeight + bottomBarHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    // 1. Fill full canvas background (dark architectural slate)
    ctx.fillStyle = '#07090E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Top Letterhead Header Bar
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, 0, width, topBarHeight);

    // Accent line at bottom of top header
    ctx.fillStyle = '#2DD4BF';
    ctx.fillRect(0, topBarHeight - 2, width, 2);

    // Draw Logo in top header
    const logoPadding = Math.round(topBarHeight * 0.15);
    const logoSize = topBarHeight - logoPadding * 2;
    const logoX = Math.round(width * 0.025);
    const logoY = logoPadding;

    if (logoImg) {
      // Draw rounded container / subtle shadow for logo
      ctx.save();
      ctx.beginPath();
      const radius = 6;
      ctx.roundRect(logoX, logoY, logoSize, logoSize, radius);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // Border around logo
      ctx.strokeStyle = '#2DD4BF88';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 6);
      ctx.stroke();
    }

    // Text metrics & typography
    const textStartX = logoImg ? logoX + logoSize + 16 : logoX;
    const fontSizeTitle = Math.max(14, Math.round(topBarHeight * 0.28));
    const fontSizeSub = Math.max(11, Math.round(topBarHeight * 0.18));

    // Studio & Practice Name
    ctx.font = `bold ${fontSizeTitle}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(meta.companyName || 'LORA ARCHITECTURAL & BIM STUDIO', textStartX, logoY + fontSizeTitle * 0.95);

    ctx.font = `500 ${fontSizeSub}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(
      `${meta.stage || 'SCHEMATIC BIM DESIGN'} • ${meta.architectName || 'LEAD ARCHITECTURAL PRACTICE'} • REG: SACAP / AIA INT.`,
      textStartX,
      logoY + fontSizeTitle + fontSizeSub * 1.3
    );

    // Top Right: Project Information & Location
    ctx.textAlign = 'right';
    const rightMargin = width - Math.round(width * 0.025);
    ctx.font = `bold ${fontSizeTitle}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#2DD4BF';
    ctx.fillText(meta.projectName.toUpperCase(), rightMargin, logoY + fontSizeTitle * 0.95);

    ctx.font = `500 ${fontSizeSub}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#CBD5E1';
    ctx.fillText(`${meta.location || 'SITE'} • ${meta.date || new Date().toISOString().slice(0, 10)}`, rightMargin, logoY + fontSizeTitle + fontSizeSub * 1.3);

    ctx.textAlign = 'left';

    // 3. Draw the Main Image in Center
    ctx.drawImage(baseImg, 0, topBarHeight, width, height);

    // Subtle dark gradient vignette at the bottom of the image for contrast
    const grad = ctx.createLinearGradient(0, topBarHeight + height - 80, 0, topBarHeight + height);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(7,9,14,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, topBarHeight + height - 80, width, 80);

    // 4. Draw Bottom Titleblock Bar
    const bottomBarY = topBarHeight + height;
    ctx.fillStyle = '#0B0F17';
    ctx.fillRect(0, bottomBarY, width, bottomBarHeight);

    // Border line above bottom bar
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, bottomBarY, width, 1.5);

    const bFontSize = Math.max(11, Math.round(bottomBarHeight * 0.26));
    const bSubSize = Math.max(9, Math.round(bottomBarHeight * 0.20));
    const bPaddingY = Math.round(bottomBarHeight * 0.22);

    // Bottom Left: View Title & Category
    ctx.font = `bold ${bFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`VIEW: ${meta.viewTitle.toUpperCase()}`, logoX, bottomBarY + bPaddingY + bFontSize * 0.85);

    ctx.font = `normal ${bSubSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#2DD4BF';
    ctx.fillText(
      `CATEGORY: ${meta.category || 'ARCHITECTURAL VISUALIZATION'} • SYNTHESIS: ${meta.engine || 'GEMINI 3.1 FLASH IMAGE'}`,
      logoX,
      bottomBarY + bPaddingY + bFontSize + bSubSize * 1.2
    );

    // Bottom Right: Verification Stamp
    ctx.textAlign = 'right';
    ctx.font = `bold ${bFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('LORA EDGE CERTIFIED ARCHITECTURAL ASSET', rightMargin, bottomBarY + bPaddingY + bFontSize * 0.85);

    ctx.font = `normal ${bSubSize}px monospace, sans-serif`;
    ctx.fillStyle = '#64748B';
    ctx.fillText(
      `SCALE: ${meta.scale || 'NTS'} | AUTH: ${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      rightMargin,
      bottomBarY + bPaddingY + bFontSize + bSubSize * 1.2
    );

    return canvas.toDataURL('image/jpeg', 0.94);
  } catch (err) {
    console.error('Failed to stamp letterhead onto image:', err);
    return imageUrl;
  }
}

/**
 * Downloads an image after stamping it with the official platform letterhead and user logo
 */
export async function downloadBrandedImage(
  imageUrl: string,
  fileName: string,
  meta: LetterheadMeta
) {
  const stampedDataUrl = await stampLetterheadOnImage(imageUrl, meta);
  const link = document.createElement('a');
  link.href = stampedDataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
