const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, pixels) {
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let pOff = 0;
  for (let y = 0; y < height; y++) {
    rawData[pOff++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      rawData[pOff++] = pixels[srcIdx];
      rawData[pOff++] = pixels[srcIdx + 1];
      rawData[pOff++] = pixels[srcIdx + 2];
      rawData[pOff++] = pixels[srcIdx + 3];
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

class CanvasHelper {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8Array(width * height * 4);
  }

  setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const idx = (y * this.width + x) * 4;
    this.pixels[idx] = r;
    this.pixels[idx + 1] = g;
    this.pixels[idx + 2] = b;
    this.pixels[idx + 3] = a;
  }

  fillRect(x0, y0, w, h, r, g, b, a = 255) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    w = Math.round(w);
    h = Math.round(h);
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        this.setPixel(x, y, r, g, b, a);
      }
    }
  }

  toPNG() {
    return encodePNG(this.width, this.height, this.pixels);
  }
}

/**
 * Renders a full 12-frame HD spritesheet (768x64) for a given outfit.
 * Frames:
 * 0..3: Idle
 * 4..9: Run
 * 10: Jump
 * 11: Fall
 */
function generateOutfitSpriteSheet(outfit) {
  const WIDTH = 64 * 12;
  const HEIGHT = 64;
  const c = new CanvasHelper(WIDTH, HEIGHT);

  for (let f = 0; f < 12; f++) {
    const ox = f * 64;
    const isIdle = f < 4;
    const isRun = f >= 4 && f < 10;
    const isJump = f === 10;
    const isFall = f === 11;

    // Running / jumping / falling bob (Idle is rock-solid stationary)
    let torsoBob = 0;
    if (isIdle) {
      torsoBob = 0;
    } else if (isRun) {
      const runFrame = f - 4;
      torsoBob = (runFrame % 3 === 1) ? 1 : 0;
    } else if (isJump) {
      torsoBob = -3;
    } else if (isFall) {
      torsoBob = 1;
    }

    const cx = ox + 32;
    const cy = 29 + torsoBob;

    // --- HEAD & FACE ---
    if (outfit === 'classic') {
      // Red Baseball Cap
      c.fillRect(cx - 10, cy - 23, 20, 10, 220, 20, 30);
      c.fillRect(cx - 8, cy - 25, 16, 3, 255, 60, 60); // Cap dome highlight
      c.fillRect(cx - 10, cy - 19, 26, 4, 180, 10, 20); // Visor brim
      c.fillRect(cx - 10, cy - 17, 28, 2, 140, 0, 10);  // Visor shadow

      // Brown Hair tuft
      c.fillRect(cx - 11, cy - 15, 5, 8, 120, 60, 25);
      c.fillRect(cx - 9, cy - 13, 4, 6, 150, 80, 40);

      // Peachy Face
      c.fillRect(cx - 6, cy - 15, 16, 14, 255, 215, 185);
      c.fillRect(cx + 8, cy - 11, 3, 4, 255, 195, 165); // Nose

      // Eyes (Rock-solid, steady open gaze)
      c.fillRect(cx + 1, cy - 12, 6, 5, 255, 255, 255);
      c.fillRect(cx + 3, cy - 12, 4, 4, 20, 120, 255); // Cyan/blue iris
      c.fillRect(cx + 4, cy - 11, 2, 2, 10, 30, 80);
      c.fillRect(cx + 1, cy - 14, 6, 2, 110, 50, 20); // Eyebrow

      // Smirk
      c.fillRect(cx + 2, cy - 4, 6, 2, 190, 60, 50);
      c.fillRect(cx + 3, cy - 5, 4, 1, 255, 255, 255);
    } else if (outfit === 'winter') {
      // Teal/Navy Winter Beanie with fluffy white pom-pom
      c.fillRect(cx - 3, cy - 28, 6, 5, 250, 250, 255); // White pom-pom
      c.fillRect(cx - 10, cy - 23, 20, 11, 28, 80, 110); // Beanie knit dome
      c.fillRect(cx - 8, cy - 25, 16, 4, 45, 110, 150); // Beanie top highlight
      c.fillRect(cx - 11, cy - 17, 22, 5, 20, 60, 85);  // Folded knit rim

      // Hair
      c.fillRect(cx - 11, cy - 14, 4, 7, 120, 60, 25);

      // Face with rosy winter cheeks
      c.fillRect(cx - 6, cy - 14, 16, 13, 255, 215, 185);
      c.fillRect(cx + 8, cy - 11, 3, 4, 255, 195, 165);
      c.fillRect(cx - 1, cy - 8, 4, 3, 255, 150, 150); // Rosy cheek blush
      c.fillRect(cx + 6, cy - 8, 4, 3, 255, 150, 150);

      // Eyes (Rock-solid, steady open gaze)
      c.fillRect(cx + 1, cy - 12, 6, 5, 255, 255, 255);
      c.fillRect(cx + 3, cy - 12, 4, 4, 0, 150, 220); // Ice-blue iris
      c.fillRect(cx + 4, cy - 11, 2, 2, 10, 40, 70);
      c.fillRect(cx + 1, cy - 14, 6, 2, 90, 50, 20);

      // Red Winter Scarf wrapped around neck
      c.fillRect(cx - 8, cy - 3, 19, 5, 220, 30, 40);
      c.fillRect(cx + 2, cy + 2, 6, 7, 190, 20, 30); // Scarf tail down front
      c.fillRect(cx + 3, cy + 9, 5, 2, 240, 200, 50); // Gold fringe
    } else {
      // Stealth Ninja Shinobi Cowl & Mask
      c.fillRect(cx - 10, cy - 24, 20, 22, 22, 22, 32); // Dark cowl base
      c.fillRect(cx - 8, cy - 25, 16, 3, 35, 35, 48); // Cowl crown

      // Trailing Crimson Headband / Ribbon
      c.fillRect(cx - 11, cy - 16, 22, 4, 220, 20, 55); // Crimson headband
      // Streaming red ribbons behind head
      const ribbonWave = isRun ? Math.sin((f - 4) * 1.2) * 3 : 0;
      c.fillRect(cx - 18, cy - 16 + ribbonWave, 8, 3, 190, 15, 45);
      c.fillRect(cx - 24, cy - 15 + ribbonWave, 7, 2, 160, 10, 35);

      // Mask slit showing intense focused eyes
      c.fillRect(cx - 3, cy - 12, 13, 5, 255, 215, 185); // Exposed eye zone
      c.fillRect(cx + 1, cy - 12, 6, 4, 255, 255, 255);
      c.fillRect(cx + 3, cy - 12, 4, 4, 255, 30, 60); // Piercing red glowing iris
      c.fillRect(cx + 4, cy - 11, 2, 2, 20, 0, 0);
      c.fillRect(cx + 1, cy - 14, 6, 2, 15, 15, 20); // Dark ninja brow

      // Lower ninja face mask
      c.fillRect(cx - 5, cy - 7, 16, 7, 18, 18, 26);
    }

    // --- TORSO ---
    if (outfit === 'classic') {
      // White Tank Top
      c.fillRect(cx - 8, cy - 1, 16, 15, 245, 245, 245);
      c.fillRect(cx - 6, cy + 5, 12, 9, 225, 225, 230);
      // Belt
      c.fillRect(cx - 8, cy + 14, 16, 3, 50, 30, 20);
      c.fillRect(cx - 2, cy + 14, 4, 3, 220, 200, 80); // Gold buckle
    } else if (outfit === 'winter') {
      // Navy Parka Coat with fur trim
      c.fillRect(cx - 9, cy + 2, 18, 14, 28, 45, 66);
      c.fillRect(cx - 7, cy + 4, 14, 12, 35, 55, 80);
      c.fillRect(cx - 1, cy + 2, 2, 14, 200, 210, 220); // Fur zipper trim
      // Belt
      c.fillRect(cx - 9, cy + 14, 18, 3, 30, 30, 35);
      c.fillRect(cx - 2, cy + 14, 4, 3, 160, 165, 175);
    } else {
      // Stealth Shinobi Gi
      c.fillRect(cx - 8, cy - 1, 16, 15, 26, 26, 38);
      c.fillRect(cx - 6, cy + 2, 12, 12, 20, 20, 30);
      // Crimson Sash / Obi
      c.fillRect(cx - 8, cy + 12, 16, 5, 180, 20, 50);
      c.fillRect(cx - 1, cy + 13, 5, 6, 220, 30, 65); // Sash knot
    }

    // --- ARMS ---
    if (outfit === 'classic') {
      // Bare Muscular Arms
      if (isJump) {
        c.fillRect(cx - 14, cy - 7, 6, 12, 255, 215, 185);
        c.fillRect(cx + 8, cy - 7, 6, 12, 255, 215, 185);
      } else if (isFall) {
        c.fillRect(cx - 15, cy - 1, 6, 14, 255, 215, 185);
        c.fillRect(cx + 9, cy - 1, 6, 14, 255, 215, 185);
      } else if (isRun) {
        const runFrame = f - 4;
        const armSwing = Math.sin((runFrame / 6) * Math.PI * 2) * 5;
        c.fillRect(cx - 14, cy - 1 - armSwing, 6, 13, 255, 215, 185);
        c.fillRect(cx + 8, cy - 1 + armSwing, 6, 13, 255, 215, 185);
      } else {
        c.fillRect(cx - 13, cy - 1, 5, 14, 255, 215, 185);
        c.fillRect(cx + 8, cy - 1, 5, 14, 255, 215, 185);
      }
    } else if (outfit === 'winter') {
      // Parka Sleeves + Brown Leather Mittens
      const drawArm = (ax, ay) => {
        c.fillRect(ax, ay, 6, 9, 28, 45, 66);
        c.fillRect(ax, ay + 9, 6, 5, 95, 60, 35);
      };
      if (isJump) {
        drawArm(cx - 14, cy - 7);
        drawArm(cx + 8, cy - 7);
      } else if (isFall) {
        drawArm(cx - 15, cy - 1);
        drawArm(cx + 9, cy - 1);
      } else if (isRun) {
        const runFrame = f - 4;
        const armSwing = Math.sin((runFrame / 6) * Math.PI * 2) * 5;
        drawArm(cx - 14, cy - 1 - armSwing);
        drawArm(cx + 8, cy - 1 + armSwing);
      } else {
        drawArm(cx - 13, cy - 1);
        drawArm(cx + 8, cy - 1);
      }
    } else {
      // Stealth Ninja Sleeves + Crimson Arm Wraps
      const drawArm = (ax, ay) => {
        c.fillRect(ax, ay, 6, 6, 22, 22, 32);
        c.fillRect(ax, ay + 6, 6, 6, 180, 20, 50);
        c.fillRect(ax, ay + 12, 6, 2, 22, 22, 32);
      };
      if (isJump) {
        drawArm(cx - 14, cy - 7);
        drawArm(cx + 8, cy - 7);
      } else if (isFall) {
        drawArm(cx - 15, cy - 1);
        drawArm(cx + 9, cy - 1);
      } else if (isRun) {
        const runFrame = f - 4;
        const armSwing = Math.sin((runFrame / 6) * Math.PI * 2) * 5;
        drawArm(cx - 14, cy - 1 - armSwing);
        drawArm(cx + 8, cy - 1 + armSwing);
      } else {
        drawArm(cx - 13, cy - 1);
        drawArm(cx + 8, cy - 1);
      }
    }

    // --- LEGS & SHOES ---
    let legColorA, legColorB, shoeColor, soleColor;
    if (outfit === 'classic') {
      legColorA = [0, 120, 220];
      legColorB = [0, 140, 240];
      shoeColor = [250, 250, 250];
      soleColor = [30, 30, 30];
    } else if (outfit === 'winter') {
      legColorA = [44, 50, 60];
      legColorB = [56, 64, 76];
      shoeColor = [110, 68, 35];
      soleColor = [25, 25, 25];
    } else {
      legColorA = [22, 22, 32];
      legColorB = [32, 32, 45];
      shoeColor = [18, 18, 24];
      soleColor = [10, 10, 14];
    }

    if (isRun) {
      const runFrame = f - 4;
      const legPhase = (runFrame / 6) * Math.PI * 2;
      const legL = Math.sin(legPhase) * 6;
      const legR = -legL;

      // Left Leg
      c.fillRect(cx - 8, 45, 7, 8, ...legColorA);
      c.fillRect(cx - 8 + legL * 0.5, 53, 7, 5, ...legColorA);

      // Right Leg
      c.fillRect(cx + 1, 45, 7, 8, ...legColorB);
      c.fillRect(cx + 1 + legR * 0.5, 53, 7, 5, ...legColorB);

      // Left Shoe
      const shoeLY = Math.min(58, 58 + Math.max(0, -legL * 0.4));
      c.fillRect(cx - 10 + legL, shoeLY, 9, 3, ...shoeColor);
      c.fillRect(cx - 10 + legL, shoeLY + 3, 9, 1, ...soleColor);

      // Right Shoe
      const shoeRY = Math.min(58, 58 + Math.max(0, -legR * 0.4));
      c.fillRect(cx + 1 + legR, shoeRY, 9, 3, ...shoeColor);
      c.fillRect(cx + 1 + legR, shoeRY + 3, 9, 1, ...soleColor);
    } else if (isJump) {
      // Tucked airborne legs
      c.fillRect(cx - 8, 44, 7, 8, ...legColorA);
      c.fillRect(cx + 1, 44, 7, 8, ...legColorB);
      c.fillRect(cx - 9, 52, 8, 4, ...shoeColor);
      c.fillRect(cx + 1, 52, 8, 4, ...shoeColor);
      c.fillRect(cx - 9, 56, 8, 1, ...soleColor);
      c.fillRect(cx + 1, 56, 8, 1, ...soleColor);
    } else if (isFall) {
      // Extended airborne legs
      c.fillRect(cx - 9, 45, 7, 9, ...legColorA);
      c.fillRect(cx + 2, 45, 7, 9, ...legColorB);
      c.fillRect(cx - 10, 54, 8, 4, ...shoeColor);
      c.fillRect(cx + 2, 54, 8, 4, ...shoeColor);
      c.fillRect(cx - 10, 58, 8, 1, ...soleColor);
      c.fillRect(cx + 2, 58, 8, 1, ...soleColor);
    } else {
      // Idle legs: firmly grounded with soles at y = 60..62
      c.fillRect(cx - 8, 45, 7, 10, ...legColorA);
      c.fillRect(cx + 1, 45, 7, 10, ...legColorB);
      c.fillRect(cx - 9, 55, 8, 5, ...shoeColor);
      c.fillRect(cx - 9, 60, 8, 2, ...soleColor);
      c.fillRect(cx + 1, 55, 8, 5, ...shoeColor);
      c.fillRect(cx + 1, 60, 8, 2, ...soleColor);
    }
  }

  return c.toPNG();
}

/**
 * Generates an HD 32x32 Head Icon for HUD life counter.
 */
function generateHDHeadIcon(outfit) {
  const c = new CanvasHelper(32, 32);
  const cx = 16;
  const cy = 16;

  if (outfit === 'classic') {
    // Red Cap
    c.fillRect(cx - 10, cy - 13, 20, 10, 220, 20, 30);
    c.fillRect(cx - 8, cy - 15, 16, 3, 255, 60, 60);
    c.fillRect(cx - 10, cy - 9, 24, 4, 180, 10, 20);
    c.fillRect(cx - 10, cy - 7, 26, 2, 140, 0, 10);

    // Hair
    c.fillRect(cx - 11, cy - 5, 5, 8, 120, 60, 25);

    // Face
    c.fillRect(cx - 6, cy - 5, 16, 14, 255, 215, 185);
    c.fillRect(cx + 8, cy - 1, 3, 4, 255, 195, 165);

    // Eye & Eyebrow
    c.fillRect(cx + 1, cy - 2, 6, 5, 255, 255, 255);
    c.fillRect(cx + 3, cy - 2, 4, 4, 20, 120, 255);
    c.fillRect(cx + 4, cy - 1, 2, 2, 10, 30, 80);
    c.fillRect(cx + 1, cy - 4, 6, 2, 110, 50, 20);

    // Smirk
    c.fillRect(cx + 2, cy + 5, 6, 2, 190, 60, 50);
    c.fillRect(cx + 3, cy + 4, 4, 1, 255, 255, 255);
  } else if (outfit === 'winter') {
    // Pom-pom
    c.fillRect(cx - 3, cy - 16, 6, 4, 250, 250, 255);
    // Beanie
    c.fillRect(cx - 10, cy - 13, 20, 11, 28, 80, 110);
    c.fillRect(cx - 8, cy - 15, 16, 3, 45, 110, 150);
    c.fillRect(cx - 11, cy - 7, 22, 4, 20, 60, 85);

    // Hair
    c.fillRect(cx - 11, cy - 4, 4, 7, 120, 60, 25);

    // Face
    c.fillRect(cx - 6, cy - 4, 16, 13, 255, 215, 185);
    c.fillRect(cx + 8, cy - 1, 3, 4, 255, 195, 165);
    c.fillRect(cx - 1, cy + 2, 4, 3, 255, 150, 150);
    c.fillRect(cx + 6, cy + 2, 4, 3, 255, 150, 150);

    // Eyes
    c.fillRect(cx + 1, cy - 2, 6, 5, 255, 255, 255);
    c.fillRect(cx + 3, cy - 2, 4, 4, 0, 150, 220);
    c.fillRect(cx + 4, cy - 1, 2, 2, 10, 40, 70);
    c.fillRect(cx + 1, cy - 4, 6, 2, 90, 50, 20);

    // Scarf
    c.fillRect(cx - 8, cy + 8, 19, 6, 220, 30, 40);
  } else {
    // Shinobi Ninja Cowl
    c.fillRect(cx - 10, cy - 14, 20, 22, 22, 22, 32);
    c.fillRect(cx - 8, cy - 15, 16, 3, 35, 35, 48);

    // Crimson Headband
    c.fillRect(cx - 11, cy - 7, 22, 4, 220, 20, 55);
    c.fillRect(cx - 16, cy - 7, 6, 3, 190, 15, 45);

    // Eye Slit
    c.fillRect(cx - 3, cy - 3, 13, 5, 255, 215, 185);
    c.fillRect(cx + 1, cy - 3, 6, 4, 255, 255, 255);
    c.fillRect(cx + 3, cy - 3, 4, 4, 255, 30, 60);
    c.fillRect(cx + 4, cy - 2, 2, 2, 20, 0, 0);

    // Lower mask
    c.fillRect(cx - 5, cy + 2, 16, 8, 18, 18, 26);
  }

  return c.toPNG();
}

const outDir = path.resolve(__dirname, '..', 'assets', 'sprites');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate Outfits
const outfits = ['classic', 'winter', 'ninja'];
for (const outfit of outfits) {
  const buf = generateOutfitSpriteSheet(outfit);
  const filePath = path.join(outDir, `dave_hd_${outfit}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated HD Dave ${outfit} spritesheet at:`, filePath);

  if (outfit === 'classic') {
    const legacyPath = path.join(outDir, 'dave_hd_64x64.png');
    fs.writeFileSync(legacyPath, buf);
  }

  // Head icon
  const headBuf = generateHDHeadIcon(outfit);
  const headPath = path.join(outDir, `dave_hd_head_${outfit}.png`);
  fs.writeFileSync(headPath, headBuf);
  console.log(`Generated HD Dave ${outfit} head icon at:`, headPath);
}

console.log('All HD Dave assets generated successfully!');
