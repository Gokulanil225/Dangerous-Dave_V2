import Phaser from 'phaser';

export type OutfitType = 'classic' | 'winter' | 'ninja';

/**
 * Procedural Retro Pixel Art Texture Generator.
 * Generates remastered Dave sprites across 3 outfits (Classic, Winter, Ninja),
 * 10 distinct thematic level backgrounds, industrial pipes, bricks, and hazards.
 */
export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    const tm = scene.textures;

    // 1. Dave Sprites & HUD Icons for all 3 Outfits
    TextureGenerator.createAllDaveOutfits(tm);

    // 2. Ten Unique Level Thematic Backgrounds
    TextureGenerator.createAllLevelBackgrounds(tm);

    // 3. Platform Tiles: Red Bricks, Blue Bricks, Pipes, Silver Trim
    TextureGenerator.createTileTextures(tm);

    // 4. Hazards (Fire, Acid, Spikes)
    TextureGenerator.createHazardTextures(tm);

    // 5. Collectibles (Trophy, Gems, Jetpack, Gun)
    TextureGenerator.createItemTextures(tm);

    // 6. Exit Door & Gravity Switches
    TextureGenerator.createInteractiveTextures(tm);

    // 7. Combat (Spiders, Bullets, Sparks, Embers)
    TextureGenerator.createCombatTextures(tm);

    // 8. Register Animations
    TextureGenerator.registerAnimations(scene);
  }

  private static addCrispCanvas(
    tm: Phaser.Textures.TextureManager,
    key: string,
    canvas: HTMLCanvasElement
  ): void {
    if (tm.exists(key)) {
      tm.remove(key);
    }
    const ct = tm.addCanvas(key, canvas);
    if (ct) {
      ct.setFilter(Phaser.Textures.FilterMode.NEAREST);
      ct.refresh();
    }
  }

  /**
   * Generates Dave sprites for Classic, Winter, and Stealth Ninja outfits.
   */
  private static createAllDaveOutfits(tm: Phaser.Textures.TextureManager): void {
    const outfits: OutfitType[] = ['classic', 'winter', 'ninja'];

    for (const outfit of outfits) {
      // 1. HUD Head Icon (16x16)
      const headCanvas = document.createElement('canvas');
      headCanvas.width = 16;
      headCanvas.height = 16;
      const hCtx = headCanvas.getContext('2d')!;
      hCtx.imageSmoothingEnabled = false;

      if (outfit === 'classic') {
        hCtx.fillStyle = '#ff1122';
        hCtx.fillRect(2, 1, 11, 4);
        hCtx.fillStyle = '#ff4444';
        hCtx.fillRect(3, 1, 9, 1);
        hCtx.fillStyle = '#dd0011';
        hCtx.fillRect(7, 4, 8, 2);
        hCtx.fillStyle = '#884422';
        hCtx.fillRect(2, 5, 2, 3);
        hCtx.fillStyle = '#ffcca3';
        hCtx.fillRect(3, 5, 9, 9);
        hCtx.fillRect(12, 7, 2, 2);
        hCtx.fillStyle = '#ffffff';
        hCtx.fillRect(6, 6, 3, 2);
        hCtx.fillStyle = '#0055ff';
        hCtx.fillRect(7, 6, 2, 2);
        hCtx.fillStyle = '#000000';
        hCtx.fillRect(5, 10, 5, 3);
        hCtx.fillStyle = '#ffffff';
        hCtx.fillRect(5, 10, 5, 1);
      } else if (outfit === 'winter') {
        hCtx.fillStyle = '#1c4266';
        hCtx.fillRect(3, 2, 10, 4);
        hCtx.fillStyle = '#ffffff';
        hCtx.fillRect(7, 0, 3, 2);
        hCtx.fillStyle = '#e85050';
        hCtx.fillRect(2, 5, 12, 2);
        hCtx.fillStyle = '#ffcca3';
        hCtx.fillRect(3, 6, 9, 6);
        hCtx.fillStyle = '#ff8877';
        hCtx.fillRect(3, 8, 2, 2);
        hCtx.fillRect(10, 8, 2, 2);
        hCtx.fillStyle = '#ffffff';
        hCtx.fillRect(6, 7, 3, 2);
        hCtx.fillStyle = '#0088cc';
        hCtx.fillRect(7, 7, 2, 2);
        hCtx.fillStyle = '#c42828';
        hCtx.fillRect(2, 12, 12, 3);
      } else {
        hCtx.fillStyle = '#1a1a24';
        hCtx.fillRect(2, 1, 12, 13);
        hCtx.fillStyle = '#e0113a';
        hCtx.fillRect(2, 4, 12, 2);
        hCtx.fillRect(13, 3, 3, 4);
        hCtx.fillStyle = '#000000';
        hCtx.fillRect(4, 7, 8, 3);
        hCtx.fillStyle = '#ffffff';
        hCtx.fillRect(5, 7, 2, 2);
        hCtx.fillRect(9, 7, 2, 2);
        hCtx.fillStyle = '#ff3344';
        hCtx.fillRect(6, 7, 1, 1);
        hCtx.fillRect(10, 7, 1, 1);
      }

      TextureGenerator.addCrispCanvas(tm, `dave_head_${outfit}`, headCanvas);
      if (outfit === 'classic') {
        TextureGenerator.addCrispCanvas(tm, 'dave_head', headCanvas);
      }

      // 2. Full-Body Sprites (20x26)
      const frames: Array<'idle' | 'walk1' | 'walk2' | 'walk3' | 'walk4' | 'jump'> = [
        'idle',
        'walk1',
        'walk2',
        'walk3',
        'walk4',
        'jump',
      ];

      for (const frame of frames) {
        const canvas = document.createElement('canvas');
        canvas.width = 20;
        canvas.height = 26;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = false;

        const yBob = frame === 'walk2' || frame === 'walk4' ? 1 : 0;

        if (outfit === 'classic') {
          // Classic Dave
          ctx.fillStyle = '#ff1122';
          ctx.fillRect(5, 1 + yBob, 9, 4);
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(6, 1 + yBob, 7, 1);
          ctx.fillStyle = '#dd0011';
          ctx.fillRect(10, 4 + yBob, 7, 2);
          ctx.fillStyle = '#884422';
          ctx.fillRect(4, 4 + yBob, 2, 3);
          ctx.fillStyle = '#ffcca3';
          ctx.fillRect(5, 5 + yBob, 7, 5);
          ctx.fillRect(12, 6 + yBob, 3, 2);
          ctx.fillRect(4, 6 + yBob, 1, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, 5 + yBob, 3, 2);
          ctx.fillStyle = '#0044ff';
          ctx.fillRect(9, 5 + yBob, 2, 2);
          ctx.fillStyle = '#ff8866';
          ctx.fillRect(8, 8 + yBob, 3, 1);
          // White Tank Top
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(6, 10 + yBob, 6, 7);
          ctx.fillStyle = '#dddddd';
          ctx.fillRect(6, 14 + yBob, 6, 3);
          // Bare Arms
          ctx.fillStyle = '#ffcca3';
          if (frame === 'walk1') {
            ctx.fillRect(3, 11 + yBob, 3, 4);
            ctx.fillRect(12, 12 + yBob, 4, 3);
          } else if (frame === 'walk3') {
            ctx.fillRect(3, 12 + yBob, 4, 3);
            ctx.fillRect(12, 11 + yBob, 3, 4);
          } else if (frame === 'jump') {
            ctx.fillRect(2, 9, 4, 4);
            ctx.fillRect(13, 9, 4, 4);
          } else {
            ctx.fillRect(4, 11 + yBob, 2, 5);
            ctx.fillRect(12, 11 + yBob, 2, 5);
          }
          // Cyan/Blue Pants
          ctx.fillStyle = '#0088ee';
          ctx.fillRect(5, 17 + yBob, 8, 2);
          if (frame === 'walk1') {
            ctx.fillStyle = '#0066cc';
            ctx.fillRect(2, 19 + yBob, 4, 4);
            ctx.fillStyle = '#0099ff';
            ctx.fillRect(8, 18 + yBob, 5, 4);
            ctx.fillRect(11, 20 + yBob, 4, 3);
          } else if (frame === 'walk3') {
            ctx.fillStyle = '#0099ff';
            ctx.fillRect(3, 18 + yBob, 5, 4);
            ctx.fillRect(3, 20 + yBob, 4, 3);
            ctx.fillStyle = '#0066cc';
            ctx.fillRect(9, 19 + yBob, 4, 4);
          } else if (frame === 'jump') {
            ctx.fillStyle = '#0088ee';
            ctx.fillRect(4, 17, 5, 4);
            ctx.fillRect(10, 17, 5, 4);
          } else {
            ctx.fillStyle = '#0088ee';
            ctx.fillRect(5, 19 + yBob, 4, 4);
            ctx.fillRect(10, 19 + yBob, 4, 4);
          }
          // White Sneakers
          ctx.fillStyle = '#ffffff';
          if (frame === 'walk1') {
            ctx.fillRect(1, 22 + yBob, 5, 2);
            ctx.fillRect(11, 22 + yBob, 5, 2);
            ctx.fillStyle = '#333333';
            ctx.fillRect(1, 24 + yBob, 5, 1);
            ctx.fillRect(11, 24 + yBob, 5, 1);
          } else if (frame === 'walk3') {
            ctx.fillRect(2, 22 + yBob, 5, 2);
            ctx.fillRect(10, 22 + yBob, 5, 2);
            ctx.fillStyle = '#333333';
            ctx.fillRect(2, 24 + yBob, 5, 1);
            ctx.fillRect(10, 24 + yBob, 5, 1);
          } else if (frame === 'jump') {
            ctx.fillRect(4, 21, 5, 2);
            ctx.fillRect(11, 21, 5, 2);
            ctx.fillStyle = '#333333';
            ctx.fillRect(4, 23, 5, 1);
            ctx.fillRect(11, 23, 5, 1);
          } else {
            ctx.fillRect(4, 22 + yBob, 4, 2);
            ctx.fillRect(10, 22 + yBob, 4, 2);
            ctx.fillStyle = '#333333';
            ctx.fillRect(4, 24 + yBob, 4, 1);
            ctx.fillRect(10, 24 + yBob, 4, 1);
          }
        } else if (outfit === 'winter') {
          // Winter Explorer
          ctx.fillStyle = '#1c4266';
          ctx.fillRect(5, 2 + yBob, 8, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, 0 + yBob, 3, 2);
          ctx.fillStyle = '#e85050';
          ctx.fillRect(4, 5 + yBob, 10, 2);
          ctx.fillStyle = '#ffcca3';
          ctx.fillRect(5, 6 + yBob, 7, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, 6 + yBob, 3, 2);
          ctx.fillStyle = '#0088cc';
          ctx.fillRect(9, 6 + yBob, 2, 2);
          ctx.fillStyle = '#c42828';
          ctx.fillRect(4, 9 + yBob, 10, 3);
          ctx.fillStyle = '#224a73';
          ctx.fillRect(5, 11 + yBob, 8, 7);
          ctx.fillStyle = '#163352';
          ctx.fillRect(5, 15 + yBob, 8, 3);
          ctx.fillStyle = '#224a73';
          if (frame === 'walk1') {
            ctx.fillRect(3, 12 + yBob, 3, 5);
            ctx.fillRect(12, 13 + yBob, 4, 4);
            ctx.fillStyle = '#8c5932';
            ctx.fillRect(2, 15 + yBob, 2, 2);
            ctx.fillRect(14, 15 + yBob, 2, 2);
          } else {
            ctx.fillRect(4, 12 + yBob, 2, 5);
            ctx.fillRect(12, 12 + yBob, 2, 5);
            ctx.fillStyle = '#8c5932';
            ctx.fillRect(4, 16 + yBob, 2, 2);
            ctx.fillRect(12, 16 + yBob, 2, 2);
          }
          ctx.fillStyle = '#18293d';
          ctx.fillRect(5, 18 + yBob, 8, 4);
          ctx.fillStyle = '#6e4427';
          if (frame === 'walk1') {
            ctx.fillRect(1, 21 + yBob, 5, 4);
            ctx.fillRect(11, 21 + yBob, 5, 4);
          } else {
            ctx.fillRect(4, 21 + yBob, 4, 4);
            ctx.fillRect(10, 21 + yBob, 4, 4);
          }
        } else {
          // Stealth Ninja
          ctx.fillStyle = '#14141e';
          ctx.fillRect(5, 1 + yBob, 8, 9);
          ctx.fillStyle = '#e0113a';
          ctx.fillRect(4, 4 + yBob, 10, 2);
          ctx.fillRect(1, 3 + yBob, 3, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(8, 6 + yBob, 3, 2);
          ctx.fillStyle = '#ff2233';
          ctx.fillRect(9, 6 + yBob, 2, 2);
          ctx.fillStyle = '#1b1b26';
          ctx.fillRect(5, 10 + yBob, 8, 7);
          ctx.fillStyle = '#e0113a';
          ctx.fillRect(5, 14 + yBob, 8, 2);
          ctx.fillStyle = '#1b1b26';
          if (frame === 'walk1') {
            ctx.fillRect(3, 11 + yBob, 3, 5);
            ctx.fillRect(12, 12 + yBob, 4, 4);
            ctx.fillStyle = '#e0113a';
            ctx.fillRect(12, 13 + yBob, 2, 2);
          } else {
            ctx.fillRect(4, 11 + yBob, 2, 5);
            ctx.fillRect(12, 11 + yBob, 2, 5);
          }
          ctx.fillStyle = '#14141e';
          ctx.fillRect(5, 17 + yBob, 8, 4);
          ctx.fillStyle = '#0a0a10';
          if (frame === 'walk1') {
            ctx.fillRect(1, 22 + yBob, 5, 3);
            ctx.fillRect(11, 22 + yBob, 5, 3);
          } else {
            ctx.fillRect(4, 22 + yBob, 4, 3);
            ctx.fillRect(10, 22 + yBob, 4, 3);
          }
        }

        TextureGenerator.addCrispCanvas(tm, `dave_${outfit}_${frame}`, canvas);
        if (outfit === 'classic') {
          TextureGenerator.addCrispCanvas(tm, `dave_${frame}`, canvas);
        }
      }
    }
  }

  /**
   * Generates 10 distinct, beautiful, thematic backgrounds for all 10 levels.
   */
  private static createAllLevelBackgrounds(tm: Phaser.Textures.TextureManager): void {
    // Helper to create a 480x256 backdrop
    const createSky = (key: string, drawFn: (ctx: CanvasRenderingContext2D) => void): void => {
      const canvas = document.createElement('canvas');
      canvas.width = 480;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      drawFn(ctx);
      TextureGenerator.addCrispCanvas(tm, key, canvas);
    };

    // Level 1: Midnight Dungeon / Dark Gothic Castle
    createSky('bg_level_1', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#090814');
      g.addColorStop(0.5, '#121226');
      g.addColorStop(1, '#221122');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Soft torch ambient glow pools
      ctx.fillStyle = 'rgba(255, 100, 20, 0.08)';
      ctx.beginPath();
      ctx.arc(80, 160, 90, 0, Math.PI * 2);
      ctx.arc(380, 160, 90, 0, Math.PI * 2);
      ctx.fill();
    });

    // Level 2: The Steam Foundry / Emerald Industrial Glow
    createSky('bg_level_2', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#071714');
      g.addColorStop(0.6, '#0f2922');
      g.addColorStop(1, '#1b4034');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Industrial vapor haze
      ctx.fillStyle = 'rgba(0, 255, 136, 0.06)';
      ctx.fillRect(0, 100, 480, 156);
    });

    // Level 3: Cyber Violet Void / Futuristic Digital Grid
    createSky('bg_level_3', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#120421');
      g.addColorStop(0.6, '#280948');
      g.addColorStop(1, '#3d0a6c');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Subtle cyan grid lines
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 480; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      for (let y = 0; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(480, y);
        ctx.stroke();
      }
    });

    // Level 4: Sunset Ruins (The User's Artwork: Glowing Double Solar Halos)
    createSky('bg_level_4', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0.0, '#1c0824');
      g.addColorStop(0.3, '#5c1638');
      g.addColorStop(0.65, '#e64a19');
      g.addColorStop(0.85, '#ff9800');
      g.addColorStop(1.0, '#ffe082');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);

      const sunX = 240;
      const sunY = 110;
      // Solar aura
      const aura = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 130);
      aura.addColorStop(0, 'rgba(255, 240, 160, 0.45)');
      aura.addColorStop(0.5, 'rgba(255, 140, 40, 0.25)');
      aura.addColorStop(1, 'rgba(255, 80, 20, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 130, 0, Math.PI * 2);
      ctx.fill();

      // Outer Solar Ring
      ctx.strokeStyle = '#fff59d';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ffb300';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 78, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Solar Ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#ffe082';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Level 5: Subterranean Acid Cavern
    createSky('bg_level_5', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#041407');
      g.addColorStop(0.6, '#082b0e');
      g.addColorStop(1, '#1b4a1b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Toxic mist glow
      ctx.fillStyle = 'rgba(76, 255, 0, 0.1)';
      ctx.fillRect(0, 160, 480, 96);
    });

    // Level 6: Twilight Heights / Mountain Ascent
    createSky('bg_level_6', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#040b17');
      g.addColorStop(0.5, '#0b1d38');
      g.addColorStop(1, '#1b3b6b');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Crescent Moon
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(380, 50, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#040b17';
      ctx.beginPath();
      ctx.arc(374, 46, 16, 0, Math.PI * 2);
      ctx.fill();
    });

    // Level 7: The Blood-Crimson Labyrinth
    createSky('bg_level_7', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#1c0303');
      g.addColorStop(0.6, '#420a0a');
      g.addColorStop(1, '#661111');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Eerie crimson aura
      ctx.fillStyle = 'rgba(255, 20, 20, 0.12)';
      ctx.beginPath();
      ctx.arc(240, 120, 140, 0, Math.PI * 2);
      ctx.fill();
    });

    // Level 8: Cosmic Starfield / Inversion Galaxy
    createSky('bg_level_8', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#020008');
      g.addColorStop(0.5, '#0c0721');
      g.addColorStop(1, '#1d0c38');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Twinkling stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const sx = (i * 47) % 480;
        const sy = (i * 31) % 230;
        const sz = (i % 3 === 0) ? 2 : 1;
        ctx.fillRect(sx, sy, sz, sz);
      }
    });

    // Level 9: Blazing Skyway Sundown
    createSky('bg_level_9', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#26001b');
      g.addColorStop(0.4, '#6b0f1a');
      g.addColorStop(0.75, '#b91372');
      g.addColorStop(1, '#ff8a00');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
    });

    // Level 10: The Master Vault / Divine Obsidian Sanctum
    createSky('bg_level_10', (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#050308');
      g.addColorStop(0.4, '#170c26');
      g.addColorStop(0.8, '#3b1c4a');
      g.addColorStop(1, '#5c2d42');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 480, 256);
      // Sacred golden glow rays
      ctx.fillStyle = 'rgba(255, 215, 0, 0.12)';
      ctx.beginPath();
      ctx.arc(240, 70, 80, 0, Math.PI * 2);
      ctx.fill();
    });

    // Backward compatibility alias
    TextureGenerator.addCrispCanvas(tm, 'bg_sunset_sky', tm.get('bg_level_4').getSourceImage() as HTMLCanvasElement);

    // Ruined Skyline Silhouette (480x120)
    const ruinCanvas = document.createElement('canvas');
    ruinCanvas.width = 480;
    ruinCanvas.height = 120;
    const rCtx = ruinCanvas.getContext('2d')!;
    rCtx.fillStyle = '#140616';

    const drawRuinTower = (x: number, w: number, h: number): void => {
      rCtx.fillRect(x, 120 - h, w, h);
      rCtx.clearRect(x + 2, 120 - h, 3, 5);
      rCtx.clearRect(x + w - 5, 120 - h, 4, 8);
      rCtx.fillRect(x + Math.floor(w / 2), 120 - h - 14, 2, 14);
      rCtx.fillRect(x + Math.floor(w / 3), 120 - h - 8, 1, 8);
    };

    drawRuinTower(10, 45, 90);
    drawRuinTower(65, 30, 65);
    drawRuinTower(105, 55, 105);
    drawRuinTower(170, 35, 75);
    drawRuinTower(215, 25, 50);
    drawRuinTower(250, 40, 85);
    drawRuinTower(300, 50, 110);
    drawRuinTower(360, 35, 70);
    drawRuinTower(405, 60, 95);
    rCtx.fillRect(0, 105, 480, 15);
    rCtx.fillRect(40, 55, 90, 4);
    rCtx.fillRect(280, 45, 110, 4);

    TextureGenerator.addCrispCanvas(tm, 'bg_ruin_skyline', ruinCanvas);

    // Layer 2 Mid-ground: Recessed Cavern / Brick Wall (32x32 seamless tile for double-layer depth)
    const recCanvas = document.createElement('canvas');
    recCanvas.width = 32;
    recCanvas.height = 32;
    const rc = recCanvas.getContext('2d')!;
    rc.imageSmoothingEnabled = false;

    rc.fillStyle = '#08030a';
    rc.fillRect(0, 0, 32, 32);

    // Row 1 bricks (y=1..14)
    rc.fillStyle = '#170a1c';
    rc.fillRect(1, 1, 14, 14);
    rc.fillRect(17, 1, 14, 14);
    // Subtle top bevel highlight
    rc.fillStyle = '#26122c';
    rc.fillRect(1, 1, 14, 1);
    rc.fillRect(17, 1, 14, 1);
    // Subtle bottom shadow
    rc.fillStyle = '#0f0512';
    rc.fillRect(1, 14, 14, 1);
    rc.fillRect(17, 14, 14, 1);

    // Row 2 bricks (staggered, y=17..30)
    rc.fillStyle = '#1a0c1f';
    rc.fillRect(0, 17, 7, 14);
    rc.fillRect(9, 17, 14, 14);
    rc.fillRect(25, 17, 7, 14);
    // Top bevel highlight
    rc.fillStyle = '#26122c';
    rc.fillRect(0, 17, 7, 1);
    rc.fillRect(9, 17, 14, 1);
    rc.fillRect(25, 17, 7, 1);
    // Bottom shadow
    rc.fillStyle = '#0f0512';
    rc.fillRect(0, 30, 7, 1);
    rc.fillRect(9, 30, 14, 1);
    rc.fillRect(25, 30, 7, 1);

    TextureGenerator.addCrispCanvas(tm, 'bg_recessed_wall', recCanvas);
  }

  private static createTileTextures(tm: Phaser.Textures.TextureManager): void {
    // Red Brick Walls (High-definition 3D beveled bricks with crisp mortar seams)
    const redCanvas = document.createElement('canvas');
    redCanvas.width = 16;
    redCanvas.height = 16;
    const rCtx = redCanvas.getContext('2d')!;
    rCtx.imageSmoothingEnabled = false;

    // Crisp black mortar seams
    rCtx.fillStyle = '#0a0000';
    rCtx.fillRect(0, 0, 16, 16);

    // Top Row Bricks (y=1..6)
    // Left Brick (x=1..6)
    rCtx.fillStyle = '#b71c1c';
    rCtx.fillRect(1, 1, 6, 6);
    rCtx.fillStyle = '#ff6b6b';
    rCtx.fillRect(1, 1, 6, 1); // Top specular rim light
    rCtx.fillRect(1, 1, 1, 6); // Left specular rim light
    rCtx.fillStyle = '#e53935';
    rCtx.fillRect(2, 2, 4, 4); // Vibrant brick body
    rCtx.fillStyle = '#6e0000';
    rCtx.fillRect(1, 6, 6, 1); // Bottom shadow groove
    rCtx.fillRect(6, 1, 1, 6); // Right edge shadow

    // Right Brick (x=8..14)
    rCtx.fillStyle = '#b71c1c';
    rCtx.fillRect(8, 1, 7, 6);
    rCtx.fillStyle = '#ff6b6b';
    rCtx.fillRect(8, 1, 7, 1);
    rCtx.fillRect(8, 1, 1, 6);
    rCtx.fillStyle = '#e53935';
    rCtx.fillRect(9, 2, 5, 4);
    rCtx.fillStyle = '#6e0000';
    rCtx.fillRect(8, 6, 7, 1);
    rCtx.fillRect(14, 1, 1, 6);

    // Bottom Row Bricks (staggered, y=8..14)
    // Left half-brick (x=1..3)
    rCtx.fillStyle = '#b71c1c';
    rCtx.fillRect(1, 8, 3, 7);
    rCtx.fillStyle = '#ff6b6b';
    rCtx.fillRect(1, 8, 3, 1);
    rCtx.fillStyle = '#e53935';
    rCtx.fillRect(1, 9, 2, 5);
    rCtx.fillStyle = '#6e0000';
    rCtx.fillRect(1, 14, 3, 1);
    rCtx.fillRect(3, 8, 1, 7);

    // Middle full brick (x=5..11)
    rCtx.fillStyle = '#b71c1c';
    rCtx.fillRect(5, 8, 7, 7);
    rCtx.fillStyle = '#ff6b6b';
    rCtx.fillRect(5, 8, 7, 1);
    rCtx.fillRect(5, 8, 1, 7);
    rCtx.fillStyle = '#e53935';
    rCtx.fillRect(6, 9, 5, 5);
    rCtx.fillStyle = '#6e0000';
    rCtx.fillRect(5, 14, 7, 1);
    rCtx.fillRect(11, 8, 1, 7);

    // Right half-brick (x=13..14)
    rCtx.fillStyle = '#b71c1c';
    rCtx.fillRect(13, 8, 2, 7);
    rCtx.fillStyle = '#ff6b6b';
    rCtx.fillRect(13, 8, 2, 1);
    rCtx.fillStyle = '#e53935';
    rCtx.fillRect(13, 9, 2, 5);
    rCtx.fillStyle = '#6e0000';
    rCtx.fillRect(13, 14, 2, 1);

    TextureGenerator.addCrispCanvas(tm, 'tile_brick_red', redCanvas);
    TextureGenerator.addCrispCanvas(tm, 'tile_brick', redCanvas);

    // Blue Bricks
    const blueCanvas = document.createElement('canvas');
    blueCanvas.width = 16;
    blueCanvas.height = 16;
    const bCtx = blueCanvas.getContext('2d')!;
    bCtx.imageSmoothingEnabled = false;

    bCtx.fillStyle = '#000000';
    bCtx.fillRect(0, 0, 16, 16);
    bCtx.fillStyle = '#0044ee';
    bCtx.fillRect(1, 1, 6, 6);
    bCtx.fillRect(8, 1, 7, 6);
    bCtx.fillStyle = '#5599ff';
    bCtx.fillRect(1, 1, 6, 1);
    bCtx.fillRect(8, 1, 7, 1);

    bCtx.fillStyle = '#0044ee';
    bCtx.fillRect(1, 8, 3, 7);
    bCtx.fillRect(5, 8, 7, 7);
    bCtx.fillRect(13, 8, 2, 7);
    bCtx.fillStyle = '#5599ff';
    bCtx.fillRect(1, 8, 3, 1);
    bCtx.fillRect(5, 8, 7, 1);
    bCtx.fillRect(13, 8, 2, 1);
    TextureGenerator.addCrispCanvas(tm, 'tile_brick_blue', blueCanvas);

    // Metallic Industrial Pipes
    const pipeHCanvas = document.createElement('canvas');
    pipeHCanvas.width = 16;
    pipeHCanvas.height = 16;
    const phCtx = pipeHCanvas.getContext('2d')!;
    phCtx.imageSmoothingEnabled = false;

    phCtx.fillStyle = '#000000';
    phCtx.fillRect(0, 0, 16, 16);
    phCtx.fillStyle = '#115522';
    phCtx.fillRect(0, 2, 16, 12);
    phCtx.fillStyle = '#22aa44';
    phCtx.fillRect(0, 4, 16, 8);
    phCtx.fillStyle = '#88ffaa';
    phCtx.fillRect(0, 5, 16, 2);
    phCtx.fillStyle = '#ffffff';
    phCtx.fillRect(0, 5, 16, 1);
    phCtx.fillStyle = '#117733';
    phCtx.fillRect(0, 1, 3, 14);
    phCtx.fillRect(13, 1, 3, 14);

    TextureGenerator.addCrispCanvas(tm, 'tile_pipe', pipeHCanvas);
    TextureGenerator.addCrispCanvas(tm, 'tile_pipe_h', pipeHCanvas);

    const pipeVCanvas = document.createElement('canvas');
    pipeVCanvas.width = 16;
    pipeVCanvas.height = 16;
    const pvCtx = pipeVCanvas.getContext('2d')!;
    pvCtx.imageSmoothingEnabled = false;

    pvCtx.fillStyle = '#000000';
    pvCtx.fillRect(0, 0, 16, 16);
    pvCtx.fillStyle = '#115522';
    pvCtx.fillRect(2, 0, 12, 16);
    pvCtx.fillStyle = '#22aa44';
    pvCtx.fillRect(4, 0, 8, 16);
    pvCtx.fillStyle = '#88ffaa';
    pvCtx.fillRect(5, 0, 2, 16);
    pvCtx.fillStyle = '#ffffff';
    pvCtx.fillRect(5, 0, 1, 16);
    pvCtx.fillStyle = '#117733';
    pvCtx.fillRect(1, 0, 14, 3);
    pvCtx.fillRect(1, 13, 14, 3);

    TextureGenerator.addCrispCanvas(tm, 'tile_pipe_v', pipeVCanvas);

    // Silver Trim
    const trimCanvas = document.createElement('canvas');
    trimCanvas.width = 16;
    trimCanvas.height = 4;
    const sCtx = trimCanvas.getContext('2d')!;
    sCtx.imageSmoothingEnabled = false;

    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(0, 0, 16, 1);
    sCtx.fillStyle = '#d0d0d0';
    sCtx.fillRect(0, 1, 16, 1);
    sCtx.fillStyle = '#777777';
    sCtx.fillRect(0, 2, 16, 1);
    sCtx.fillStyle = '#111111';
    sCtx.fillRect(0, 3, 16, 1);
    sCtx.fillStyle = '#ffffff';
    sCtx.fillRect(3, 1, 2, 1);
    sCtx.fillRect(11, 1, 2, 1);

    TextureGenerator.addCrispCanvas(tm, 'silver_trim', trimCanvas);

    // Magenta Metallic Girder Platform (Classic Dangerous Dave style from Image 1)
    const girderCanvas = document.createElement('canvas');
    girderCanvas.width = 16;
    girderCanvas.height = 16;
    const gCtx = girderCanvas.getContext('2d')!;
    gCtx.imageSmoothingEnabled = false;

    // Dark base
    gCtx.fillStyle = '#000000';
    gCtx.fillRect(0, 0, 16, 16);

    // Main vibrant magenta body
    gCtx.fillStyle = '#cc00cc';
    gCtx.fillRect(0, 2, 16, 12);

    // Beveled highlight top edge & teeth
    gCtx.fillStyle = '#ffffff';
    gCtx.fillRect(0, 2, 16, 1);
    gCtx.fillStyle = '#ff66ff';
    gCtx.fillRect(0, 3, 16, 1);

    // Lower darker magenta shadow
    gCtx.fillStyle = '#880088';
    gCtx.fillRect(0, 13, 16, 1);
    gCtx.fillStyle = '#550055';
    gCtx.fillRect(0, 14, 16, 1);

    // Circular porthole / rivet in the center of the girder
    gCtx.fillStyle = '#440044';
    gCtx.fillRect(4, 5, 8, 6);
    gCtx.fillStyle = '#110011';
    gCtx.fillRect(5, 6, 6, 4);

    // Metallic rim highlight (bottom-right reflection)
    gCtx.fillStyle = '#ff88ff';
    gCtx.fillRect(5, 9, 6, 1);
    gCtx.fillRect(10, 6, 1, 4);
    // Top-left rim highlight
    gCtx.fillStyle = '#ffffff';
    gCtx.fillRect(6, 6, 2, 1);
    gCtx.fillRect(5, 6, 1, 2);

    // Girder side connector plates
    gCtx.fillStyle = '#aa00aa';
    gCtx.fillRect(0, 4, 2, 8);
    gCtx.fillRect(14, 4, 2, 8);

    TextureGenerator.addCrispCanvas(tm, 'tile_girder', girderCanvas);
  }

  private static createHazardTextures(tm: Phaser.Textures.TextureManager): void {
    // Realistic Animated Fire Hazard (4-frame fluid licking flame tongues)
    const makeFire = (frame: number): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Base glowing coal bed at bottom
      ctx.fillStyle = '#3a0500';
      ctx.fillRect(0, 15, 16, 1);
      ctx.fillStyle = '#7a0e00';
      ctx.fillRect(1, 14, 14, 1);
      ctx.fillStyle = '#ff2b00';
      ctx.fillRect(2, 13, 12, 1);

      // Frame-specific flame tongues parameters:
      // leftHeight, centerHeight, rightHeight, centerTipX, sparkX, sparkY
      const config = [
        { lH: 8, cH: 14, rH: 7, cX: 7, sX: 4, sY: 3 },
        { lH: 6, cH: 13, rH: 10, cX: 8, sX: 9, sY: 1 },
        { lH: 10, cH: 14, rH: 6, cX: 9, sX: 12, sY: 2 },
        { lH: 7, cH: 12, rH: 8, cX: 8, sX: 7, sY: 0 },
      ][frame];

      // Tier 1: Outer Vermilion/Crimson Silhouette
      ctx.fillStyle = '#d01400';
      // Center tongue
      ctx.beginPath();
      ctx.moveTo(config.cX - 4, 14);
      ctx.lineTo(config.cX, 15 - config.cH);
      ctx.lineTo(config.cX + 4, 14);
      ctx.fill();
      // Left tongue
      ctx.beginPath();
      ctx.moveTo(1, 14);
      ctx.lineTo(3, 15 - config.lH);
      ctx.lineTo(6, 14);
      ctx.fill();
      // Right tongue
      ctx.beginPath();
      ctx.moveTo(9, 14);
      ctx.lineTo(13, 15 - config.rH);
      ctx.lineTo(15, 14);
      ctx.fill();

      // Tier 2: Mid-Flame Radiant Orange
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.moveTo(config.cX - 3, 14);
      ctx.lineTo(config.cX, 15 - config.cH + 2);
      ctx.lineTo(config.cX + 3, 14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(2, 14);
      ctx.lineTo(3, 15 - config.lH + 2);
      ctx.lineTo(5, 14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(10, 14);
      ctx.lineTo(13, 15 - config.rH + 2);
      ctx.lineTo(14, 14);
      ctx.fill();

      // Tier 3: Inner Golden Solar Yellow
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(config.cX - 2, 14);
      ctx.lineTo(config.cX, 15 - config.cH + 4);
      ctx.lineTo(config.cX + 2, 14);
      ctx.fill();
      ctx.fillRect(config.cX - 2, 12, 4, 3);
      ctx.fillRect(2, 12, 3, 2);
      ctx.fillRect(11, 12, 3, 2);

      // Tier 4: White-Hot Incandescent Core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(config.cX - 1, 11, 2, 3);
      ctx.fillRect(config.cX, 10, 1, 2);
      ctx.fillRect(config.cX - 1, 13, 3, 2);

      // Tier 5: Floating Rising Sparks / Embers
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(config.sX, config.sY, 1, 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(config.sX, config.sY + 1, 1, 1);

      return canvas;
    };

    TextureGenerator.addCrispCanvas(tm, 'hazard_fire_1', makeFire(0));
    TextureGenerator.addCrispCanvas(tm, 'hazard_fire_2', makeFire(1));
    TextureGenerator.addCrispCanvas(tm, 'hazard_fire_3', makeFire(2));
    TextureGenerator.addCrispCanvas(tm, 'hazard_fire_4', makeFire(3));

    const makeAcid = (offset: number): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#006600';
      ctx.fillRect(0, 4, 16, 12);
      ctx.fillStyle = '#00aa00';
      ctx.fillRect(0, 5, 16, 10);
      ctx.fillStyle = '#22ff44';
      ctx.fillRect(0, 3 + offset, 16, 3);
      ctx.fillStyle = '#bbf7d0';
      ctx.fillRect(4 + offset * 2, 6, 2, 2);
      ctx.fillRect(11 - offset * 2, 8, 3, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5 + offset * 2, 6, 1, 1);

      return canvas;
    };

    TextureGenerator.addCrispCanvas(tm, 'hazard_acid_1', makeAcid(0));
    TextureGenerator.addCrispCanvas(tm, 'hazard_acid_2', makeAcid(1));

    const spikeCanvas = document.createElement('canvas');
    spikeCanvas.width = 16;
    spikeCanvas.height = 16;
    const sCtx = spikeCanvas.getContext('2d')!;
    sCtx.imageSmoothingEnabled = false;
    sCtx.fillStyle = '#777777';
    for (let i = 0; i < 4; i++) {
      sCtx.beginPath();
      sCtx.moveTo(i * 4, 16);
      sCtx.lineTo(i * 4 + 2, 2);
      sCtx.lineTo(i * 4 + 4, 16);
      sCtx.fill();
    }
    sCtx.fillStyle = '#cccccc';
    for (let i = 0; i < 4; i++) {
      sCtx.beginPath();
      sCtx.moveTo(i * 4 + 1, 16);
      sCtx.lineTo(i * 4 + 2, 3);
      sCtx.lineTo(i * 4 + 3, 16);
      sCtx.fill();
    }
    sCtx.fillStyle = '#ffffff';
    for (let i = 0; i < 4; i++) {
      sCtx.fillRect(i * 4 + 1, 8, 1, 6);
    }
    TextureGenerator.addCrispCanvas(tm, 'hazard_spikes', spikeCanvas);

    // Purple Wavy Weed / Tentacle Hazard (from Image 2)
    const makeWeed = (offset: number): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#0a000d';
      ctx.fillRect(0, 0, 16, 16);

      // Draw 3 wavy purple tendrils vertically
      const drawTendril = (baseX: number, shift: number) => {
        ctx.fillStyle = '#880088';
        for (let y = 0; y < 16; y++) {
          const wave = Math.round(Math.sin((y + shift + offset * 4) * 0.5) * 2);
          ctx.fillRect(baseX + wave, y, 3, 1);
        }
        ctx.fillStyle = '#ff00ff';
        for (let y = 0; y < 16; y++) {
          const wave = Math.round(Math.sin((y + shift + offset * 4) * 0.5) * 2);
          ctx.fillRect(baseX + wave + 1, y, 1, 1);
        }
      };

      drawTendril(2, 0);
      drawTendril(7, 3);
      drawTendril(12, 6);

      return canvas;
    };

    TextureGenerator.addCrispCanvas(tm, 'hazard_weed_1', makeWeed(0));
    TextureGenerator.addCrispCanvas(tm, 'hazard_weed_2', makeWeed(1));
    TextureGenerator.addCrispCanvas(tm, 'hazard_weed', makeWeed(0));
  }

  private static createItemTextures(tm: Phaser.Textures.TextureManager): void {
    // Gleaming Gold Trophy
    const trophyCanvas = document.createElement('canvas');
    trophyCanvas.width = 16;
    trophyCanvas.height = 16;
    const tCtx = trophyCanvas.getContext('2d')!;
    tCtx.imageSmoothingEnabled = false;

    // Outer shadow outline
    tCtx.fillStyle = '#8a6200';
    tCtx.fillRect(2, 0, 12, 8);
    tCtx.fillRect(4, 8, 8, 3);
    tCtx.fillRect(6, 11, 4, 3);
    tCtx.fillRect(3, 13, 10, 3);
    // Gold Cup Body
    tCtx.fillStyle = '#ffd700';
    tCtx.fillRect(3, 1, 10, 7);
    tCtx.fillRect(5, 8, 6, 3);
    tCtx.fillRect(7, 11, 2, 3);
    tCtx.fillRect(4, 14, 8, 2);
    // Handles
    tCtx.fillRect(1, 2, 2, 4);
    tCtx.fillRect(13, 2, 2, 4);
    // Specular shine streak
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(4, 2, 2, 5);
    tCtx.fillRect(7, 14, 2, 1);
    // Ruby inset gemstone on trophy
    tCtx.fillStyle = '#ff2222';
    tCtx.fillRect(7, 4, 2, 2);
    TextureGenerator.addCrispCanvas(tm, 'trophy', trophyCanvas);

    // Classic Dangerous Dave Pixel-Art Diamonds — matches reference image
    // Bold black outline, flat-top gem cut, bright top-left facet, deep jewel body
    const makeGem = (bodyColor: string, highlightColor: string, darkColor: string): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Helper to set individual pixels
      const px = (x: number, y: number, color: string) => {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      };

      const BLK = '#000000';
      const WHT = '#ffffff';
      const MID = bodyColor;        // main body
      const HI  = highlightColor;   // bright top-left facet
      const DRK = darkColor;        // dark bottom facet

      // Row 2 — flat top cut (4 px wide, centered at x=6..9)
      px(6,2,BLK); px(7,2,BLK); px(8,2,BLK); px(9,2,BLK);

      // Row 3 — one step wider, top flat fill
      px(5,3,BLK); px(6,3,HI); px(7,3,HI); px(8,3,HI); px(9,3,HI); px(10,3,BLK);

      // Row 4
      px(4,4,BLK); px(5,4,HI); px(6,4,WHT); px(7,4,WHT); px(8,4,HI); px(9,4,HI); px(10,4,HI); px(11,4,BLK);

      // Row 5
      px(3,5,BLK); px(4,5,HI); px(5,5,HI); px(6,5,HI); px(7,5,HI); px(8,5,MID); px(9,5,MID); px(10,5,MID); px(11,5,MID); px(12,5,BLK);

      // Row 6 — widest row (divider line between top highlight & body)
      px(2,6,BLK); px(3,6,HI); px(4,6,HI); px(5,6,HI); px(6,6,MID); px(7,6,MID); px(8,6,MID); px(9,6,MID); px(10,6,MID); px(11,6,MID); px(12,6,DRK); px(13,6,BLK);

      // Row 7 — body (lower half starts)
      px(2,7,BLK); px(3,7,MID); px(4,7,MID); px(5,7,MID); px(6,7,MID); px(7,7,MID); px(8,7,MID); px(9,7,MID); px(10,7,MID); px(11,7,DRK); px(12,7,DRK); px(13,7,BLK);

      // Row 8
      px(3,8,BLK); px(4,8,MID); px(5,8,MID); px(6,8,MID); px(7,8,MID); px(8,8,MID); px(9,8,MID); px(10,8,DRK); px(11,8,DRK); px(12,8,BLK);

      // Row 9
      px(4,9,BLK); px(5,9,MID); px(6,9,MID); px(7,9,MID); px(8,9,DRK); px(9,9,DRK); px(10,9,DRK); px(11,9,BLK);

      // Row 10
      px(5,10,BLK); px(6,10,MID); px(7,10,DRK); px(8,10,DRK); px(9,10,DRK); px(10,10,BLK);

      // Row 11 — point tip
      px(6,11,BLK); px(7,11,DRK); px(8,11,DRK); px(9,11,BLK);

      // Row 12 — narrowing to point
      px(7,12,BLK); px(8,12,BLK);

      return canvas;
    };

    // Ruby  — red body, bright pink-white highlight, dark crimson shadow
    TextureGenerator.addCrispCanvas(tm, 'gem_ruby',     makeGem('#e00020', '#ff6680', '#880010'));
    // Sapphire — cyan body, bright white-cyan highlight, dark teal shadow
    TextureGenerator.addCrispCanvas(tm, 'gem_sapphire', makeGem('#00ccee', '#aaffff', '#006688'));

    // Royal Crown with Gem Insets
    const crownCanvas = document.createElement('canvas');
    crownCanvas.width = 16;
    crownCanvas.height = 16;
    const cCtx = crownCanvas.getContext('2d')!;
    cCtx.imageSmoothingEnabled = false;
    cCtx.fillStyle = '#b8860b';
    cCtx.fillRect(1, 10, 14, 5);
    cCtx.fillStyle = '#ffd700';
    cCtx.fillRect(2, 11, 12, 4);
    cCtx.fillRect(2, 5, 3, 7);
    cCtx.fillRect(6, 3, 4, 9);
    cCtx.fillRect(11, 5, 3, 7);
    // Jewels on crown
    cCtx.fillStyle = '#e71d36';
    cCtx.fillRect(7, 12, 2, 2);
    cCtx.fillStyle = '#00d4ff';
    cCtx.fillRect(3, 12, 2, 2);
    cCtx.fillRect(11, 12, 2, 2);
    // Gold highlights
    cCtx.fillStyle = '#ffffff';
    cCtx.fillRect(7, 4, 2, 1);
    TextureGenerator.addCrispCanvas(tm, 'gem_crown', crownCanvas);

    // Glowing Purple Pearl (+1000 pts, from Image 2)
    const pearlCanvas = document.createElement('canvas');
    pearlCanvas.width = 16;
    pearlCanvas.height = 16;
    const pCtx = pearlCanvas.getContext('2d')!;
    pCtx.imageSmoothingEnabled = false;

    // Glowing outer halo
    pCtx.fillStyle = '#440055';
    pCtx.beginPath();
    pCtx.arc(8, 8, 7, 0, Math.PI * 2);
    pCtx.fill();

    // Vibrant magenta sphere
    pCtx.fillStyle = '#bb11bb';
    pCtx.beginPath();
    pCtx.arc(8, 8, 5.5, 0, Math.PI * 2);
    pCtx.fill();

    // Bright magenta/violet core
    pCtx.fillStyle = '#ff44ff';
    pCtx.beginPath();
    pCtx.arc(7.5, 7.5, 4, 0, Math.PI * 2);
    pCtx.fill();

    // Specular shine
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(6, 4, 2, 2);
    pCtx.fillRect(8, 5, 1, 1);

    TextureGenerator.addCrispCanvas(tm, 'gem_pearl', pearlCanvas);

    const jpCanvas = document.createElement('canvas');
    jpCanvas.width = 16;
    jpCanvas.height = 16;
    const jCtx = jpCanvas.getContext('2d')!;
    jCtx.imageSmoothingEnabled = false;
    jCtx.fillStyle = '#aaaaaa';
    jCtx.fillRect(3, 2, 4, 10);
    jCtx.fillRect(9, 2, 4, 10);
    jCtx.fillStyle = '#ff2222';
    jCtx.fillRect(4, 4, 2, 6);
    jCtx.fillRect(10, 4, 2, 6);
    jCtx.fillStyle = '#555555';
    jCtx.fillRect(3, 12, 4, 3);
    jCtx.fillRect(9, 12, 4, 3);
    TextureGenerator.addCrispCanvas(tm, 'item_jetpack', jpCanvas);

    const gunCanvas = document.createElement('canvas');
    gunCanvas.width = 16;
    gunCanvas.height = 16;
    const gCtx = gunCanvas.getContext('2d')!;
    gCtx.imageSmoothingEnabled = false;
    gCtx.fillStyle = '#888888';
    gCtx.fillRect(2, 6, 12, 3);
    gCtx.fillRect(3, 9, 3, 5);
    gCtx.fillStyle = '#ffff00';
    gCtx.fillRect(12, 6, 2, 3);
    TextureGenerator.addCrispCanvas(tm, 'item_gun', gunCanvas);
  }

  private static createInteractiveTextures(tm: Phaser.Textures.TextureManager): void {
    const closedCanvas = document.createElement('canvas');
    closedCanvas.width = 18;
    closedCanvas.height = 24;
    const cCtx = closedCanvas.getContext('2d')!;
    cCtx.imageSmoothingEnabled = false;

    cCtx.fillStyle = '#b86614';
    cCtx.fillRect(0, 0, 18, 24);
    cCtx.fillStyle = '#884400';
    cCtx.fillRect(2, 2, 14, 22);
    cCtx.fillStyle = '#b86614';
    cCtx.fillRect(4, 4, 10, 4);
    cCtx.fillRect(4, 10, 10, 4);
    cCtx.fillRect(4, 16, 10, 5);
    cCtx.fillStyle = '#ffd700';
    cCtx.fillRect(13, 11, 2, 2);
    TextureGenerator.addCrispCanvas(tm, 'door_closed', closedCanvas);

    const openCanvas = document.createElement('canvas');
    openCanvas.width = 18;
    openCanvas.height = 24;
    const oCtx = openCanvas.getContext('2d')!;
    oCtx.imageSmoothingEnabled = false;

    oCtx.fillStyle = '#b86614';
    oCtx.fillRect(0, 0, 18, 24);
    oCtx.fillStyle = '#000000';
    oCtx.fillRect(2, 2, 14, 22);
    oCtx.fillStyle = '#00ffff';
    oCtx.fillRect(6, 6, 6, 14);
    TextureGenerator.addCrispCanvas(tm, 'door_open', openCanvas);

    const activeCanvas = document.createElement('canvas');
    activeCanvas.width = 16;
    activeCanvas.height = 16;
    const aCtx = activeCanvas.getContext('2d')!;
    aCtx.imageSmoothingEnabled = false;

    aCtx.fillStyle = '#222244';
    aCtx.fillRect(0, 0, 16, 16);
    aCtx.fillStyle = '#00ffff';
    aCtx.fillRect(1, 1, 14, 14);
    aCtx.fillStyle = '#003366';
    aCtx.fillRect(3, 3, 10, 10);
    aCtx.fillStyle = '#ffffff';
    aCtx.fillRect(7, 4, 2, 3);
    aCtx.fillRect(6, 5, 4, 1);
    aCtx.fillRect(7, 9, 2, 3);
    aCtx.fillRect(6, 10, 4, 1);

    TextureGenerator.addCrispCanvas(tm, 'gravity_switch_active', activeCanvas);
    TextureGenerator.addCrispCanvas(tm, 'gravity_switch', activeCanvas);
  }

  private static createCombatTextures(tm: Phaser.Textures.TextureManager): void {
    // 1. Aesthetic Green Slime Goblin (4 animation frames + aggro state)
    const makeGreenSlime = (frame: number, isAggro: boolean = false): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      const yOff = frame === 0 ? 1 : (frame === 2 ? -1 : 0);

      // Shadow on floor
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(8, 15, 6, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Slime Body Base (dark green shadow)
      ctx.fillStyle = '#145a32';
      ctx.fillRect(2, 4 + yOff, 12, 9);
      ctx.fillRect(3, 3 + yOff, 10, 11);

      // Mid-tone Mutant Green
      ctx.fillStyle = isAggro ? '#1e8449' : '#27ae60';
      ctx.fillRect(3, 5 + yOff, 10, 7);
      ctx.fillRect(4, 4 + yOff, 8, 9);

      // Vibrant Green Inner Body
      ctx.fillStyle = isAggro ? '#2ecc71' : '#58d68d';
      ctx.fillRect(4, 6 + yOff, 8, 5);

      // Glossy Specular Highlights (slimy sheen)
      ctx.fillStyle = '#abebc6';
      ctx.fillRect(4, 4 + yOff, 3, 2);
      ctx.fillRect(5, 3 + yOff, 2, 1);
      ctx.fillRect(9, 4 + yOff, 2, 1);

      // Eyes
      if (isAggro) {
        // Piercing angry glowing red eyes
        ctx.fillStyle = '#ff1100';
        ctx.fillRect(3, 5 + yOff, 4, 3);
        ctx.fillRect(9, 5 + yOff, 4, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(4, 6 + yOff, 2, 2);
        ctx.fillRect(10, 6 + yOff, 2, 2);
        // Angry brow
        ctx.fillStyle = '#0e6251';
        ctx.fillRect(2, 4 + yOff, 5, 1);
        ctx.fillRect(9, 4 + yOff, 5, 1);
      } else {
        // Yellow/orange glowing eyes with black pupils
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(4, 5 + yOff, 3, 3);
        ctx.fillRect(9, 5 + yOff, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(frame % 2 === 0 ? 5 : 4, 6 + yOff, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(frame % 2 === 0 ? 4 : 5, 5 + yOff, 1, 1);
      }

      // Mouth & Sharp Fangs
      ctx.fillStyle = '#0b2e13';
      ctx.fillRect(5, 9 + yOff, 6, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(5, 9 + yOff, 1, 2);
      ctx.fillRect(10, 9 + yOff, 1, 2);

      // Feet / Claws (animated stride)
      ctx.fillStyle = '#196f3d';
      if (frame === 0) {
        ctx.fillRect(2, 12, 3, 3);
        ctx.fillRect(11, 12, 3, 3);
      } else if (frame === 1) {
        ctx.fillRect(1, 12, 4, 3);
        ctx.fillRect(11, 11, 3, 4);
      } else if (frame === 2) {
        ctx.fillRect(2, 11, 3, 4);
        ctx.fillRect(11, 12, 4, 3);
      } else {
        ctx.fillRect(3, 12, 3, 3);
        ctx.fillRect(10, 12, 3, 3);
      }

      return canvas;
    };

    TextureGenerator.addCrispCanvas(tm, 'monster_green_walk_1', makeGreenSlime(0, false));
    TextureGenerator.addCrispCanvas(tm, 'monster_green_walk_2', makeGreenSlime(1, false));
    TextureGenerator.addCrispCanvas(tm, 'monster_green_walk_3', makeGreenSlime(2, false));
    TextureGenerator.addCrispCanvas(tm, 'monster_green_walk_4', makeGreenSlime(3, false));
    TextureGenerator.addCrispCanvas(tm, 'monster_green_aggro', makeGreenSlime(1, true));

    // Backward compatibility aliases
    TextureGenerator.addCrispCanvas(tm, 'monster_1', makeGreenSlime(0, false));
    TextureGenerator.addCrispCanvas(tm, 'monster_2', makeGreenSlime(1, false));

    // 2. Red Arachnid Spider (4 skittering frames)
    const makeSpider = (frame: number, isHanging: boolean = false): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      const yBob = (frame % 2 === 0) ? 0 : 1;

      // Abdomen (bulbous segmented crimson chitin)
      ctx.fillStyle = '#641e16';
      ctx.fillRect(4, 3 + yBob, 8, 7);
      ctx.fillStyle = '#922b21';
      ctx.fillRect(5, 4 + yBob, 6, 6);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(5, 5 + yBob, 6, 4);

      // Yellow venom markings on dorsal abdomen
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(7, 4 + yBob, 2, 2);
      ctx.fillRect(6, 7 + yBob, 4, 1);

      // Cephalothorax (Head)
      ctx.fillStyle = '#17202a';
      ctx.fillRect(5, 9 + yBob, 6, 4);

      // Glowing Multi-Eye Cluster
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(5, 10 + yBob, 2, 1);
      ctx.fillRect(9, 10 + yBob, 2, 1);
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(7, 10 + yBob, 2, 1);

      // Chelicerae & Fangs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 13 + yBob, 1, 2);
      ctx.fillRect(9, 13 + yBob, 1, 2);
      // Toxic venom tip
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(6, 14 + yBob, 1, 1);
      ctx.fillRect(9, 14 + yBob, 1, 1);

      // 8 Jointed Animated Legs
      ctx.fillStyle = '#17202a';
      if (isHanging) {
        // Curled legs when hanging on silk thread
        ctx.fillRect(1, 2, 3, 2);
        ctx.fillRect(12, 2, 3, 2);
        ctx.fillRect(2, 5, 2, 3);
        ctx.fillRect(12, 5, 2, 3);
        ctx.fillRect(3, 8, 2, 4);
        ctx.fillRect(11, 8, 2, 4);
        ctx.fillRect(4, 12, 2, 3);
        ctx.fillRect(10, 12, 2, 3);
      } else {
        // Skittering legs
        if (frame === 0) {
          ctx.fillRect(1, 4, 3, 2); ctx.fillRect(0, 6, 2, 4);
          ctx.fillRect(12, 4, 3, 2); ctx.fillRect(14, 6, 2, 4);
          ctx.fillRect(2, 8, 3, 2); ctx.fillRect(1, 10, 2, 5);
          ctx.fillRect(11, 8, 3, 2); ctx.fillRect(13, 10, 2, 5);
        } else if (frame === 1) {
          ctx.fillRect(2, 3, 2, 3); ctx.fillRect(1, 6, 2, 5);
          ctx.fillRect(12, 3, 2, 3); ctx.fillRect(13, 6, 2, 5);
          ctx.fillRect(3, 7, 2, 3); ctx.fillRect(0, 10, 3, 5);
          ctx.fillRect(11, 7, 2, 3); ctx.fillRect(13, 10, 3, 5);
        } else if (frame === 2) {
          ctx.fillRect(1, 5, 3, 2); ctx.fillRect(0, 7, 2, 5);
          ctx.fillRect(12, 5, 3, 2); ctx.fillRect(14, 7, 2, 5);
          ctx.fillRect(2, 9, 3, 2); ctx.fillRect(1, 11, 2, 4);
          ctx.fillRect(11, 9, 3, 2); ctx.fillRect(13, 11, 2, 4);
        } else {
          ctx.fillRect(2, 4, 3, 2); ctx.fillRect(1, 6, 2, 4);
          ctx.fillRect(11, 4, 3, 2); ctx.fillRect(13, 6, 2, 4);
          ctx.fillRect(2, 8, 3, 2); ctx.fillRect(0, 10, 2, 6);
          ctx.fillRect(11, 8, 3, 2); ctx.fillRect(14, 10, 2, 6);
        }
      }

      return canvas;
    };

    TextureGenerator.addCrispCanvas(tm, 'spider_walk_1', makeSpider(0, false));
    TextureGenerator.addCrispCanvas(tm, 'spider_walk_2', makeSpider(1, false));
    TextureGenerator.addCrispCanvas(tm, 'spider_walk_3', makeSpider(2, false));
    TextureGenerator.addCrispCanvas(tm, 'spider_walk_4', makeSpider(3, false));
    TextureGenerator.addCrispCanvas(tm, 'spider_hanging', makeSpider(0, true));

    // 3. Flying Bat / Void Gargoyle (3 flap frames)
    const makeBat = (frame: number): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      // Dark furry bat body
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(6, 5, 4, 7);
      ctx.fillStyle = '#1a252f';
      ctx.fillRect(7, 6, 2, 5);

      // Glowing predatory red eyes
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(6, 6, 1, 1);
      ctx.fillRect(9, 6, 1, 1);

      // Fangs
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(7, 9, 1, 2);
      ctx.fillRect(8, 9, 1, 2);

      // Pointy ears
      ctx.fillStyle = '#34495e';
      ctx.fillRect(6, 3, 1, 2);
      ctx.fillRect(9, 3, 1, 2);

      // Wing animation
      ctx.fillStyle = '#4a235a';
      if (frame === 0) {
        // Wings Up
        ctx.fillRect(2, 2, 4, 3);
        ctx.fillRect(1, 4, 3, 3);
        ctx.fillRect(10, 2, 4, 3);
        ctx.fillRect(12, 4, 3, 3);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(3, 3, 2, 2);
        ctx.fillRect(11, 3, 2, 2);
      } else if (frame === 1) {
        // Wings Horizontal / Glide
        ctx.fillRect(0, 6, 6, 3);
        ctx.fillRect(10, 6, 6, 3);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(1, 7, 4, 1);
        ctx.fillRect(11, 7, 4, 1);
      } else {
        // Wings Down
        ctx.fillRect(1, 8, 5, 3);
        ctx.fillRect(2, 11, 4, 3);
        ctx.fillRect(10, 8, 5, 3);
        ctx.fillRect(10, 11, 4, 3);
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(2, 9, 3, 2);
        ctx.fillRect(11, 9, 3, 2);
      }

      return canvas;
    };

    TextureGenerator.addCrispCanvas(tm, 'bat_fly_1', makeBat(0));
    TextureGenerator.addCrispCanvas(tm, 'bat_fly_2', makeBat(1));
    TextureGenerator.addCrispCanvas(tm, 'bat_fly_3', makeBat(2));

    // 4. Combat / Death Particles
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 4;
    sCanvas.height = 4;
    const sCtx = sCanvas.getContext('2d')!;
    sCtx.imageSmoothingEnabled = false;
    sCtx.fillStyle = '#2ecc71';
    sCtx.fillRect(0, 0, 4, 4);
    sCtx.fillStyle = '#a8f0b0';
    sCtx.fillRect(1, 1, 2, 2);
    TextureGenerator.addCrispCanvas(tm, 'particle_slime', sCanvas);

    const cCanvas = document.createElement('canvas');
    cCanvas.width = 4;
    cCanvas.height = 4;
    const cCtx = cCanvas.getContext('2d')!;
    cCtx.imageSmoothingEnabled = false;
    cCtx.fillStyle = '#c0392b';
    cCtx.fillRect(0, 0, 4, 4);
    cCtx.fillStyle = '#f1c40f';
    cCtx.fillRect(1, 1, 2, 2);
    TextureGenerator.addCrispCanvas(tm, 'particle_chitin', cCanvas);

    // Bullets, Sparks, Embers
    const bCanvas = document.createElement('canvas');
    bCanvas.width = 6;
    bCanvas.height = 4;
    const bCtx = bCanvas.getContext('2d')!;
    bCtx.imageSmoothingEnabled = false;
    bCtx.fillStyle = '#ffff00';
    bCtx.fillRect(0, 0, 6, 4);
    bCtx.fillStyle = '#ffffff';
    bCtx.fillRect(2, 1, 3, 2);
    TextureGenerator.addCrispCanvas(tm, 'bullet', bCanvas);

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 4;
    pCanvas.height = 4;
    const pCtx = pCanvas.getContext('2d')!;
    pCtx.imageSmoothingEnabled = false;
    pCtx.fillStyle = '#ffff55';
    pCtx.fillRect(0, 0, 4, 4);
    TextureGenerator.addCrispCanvas(tm, 'particle_spark', pCanvas);

    const emberCanvas = document.createElement('canvas');
    emberCanvas.width = 3;
    emberCanvas.height = 3;
    const eCtx = emberCanvas.getContext('2d')!;
    eCtx.fillStyle = '#ffcc00';
    eCtx.fillRect(0, 0, 3, 3);
    TextureGenerator.addCrispCanvas(tm, 'particle_ember', emberCanvas);
  }

  private static registerAnimations(scene: Phaser.Scene): void {
    const anms = scene.anims;
    const outfits: OutfitType[] = ['classic', 'winter', 'ninja'];

    for (const outfit of outfits) {
      const walkKey = `dave_${outfit}_walk`;
      if (!anms.exists(walkKey)) {
        anms.create({
          key: walkKey,
          frames: [
            { key: `dave_${outfit}_walk1` },
            { key: `dave_${outfit}_walk2` },
            { key: `dave_${outfit}_walk3` },
            { key: `dave_${outfit}_walk4` },
          ],
          frameRate: 10,
          repeat: -1,
        });
      }
    }

    if (!anms.exists('dave_walk')) {
      anms.create({
        key: 'dave_walk',
        frames: [
          { key: 'dave_walk1' },
          { key: 'dave_walk2' },
          { key: 'dave_walk3' },
          { key: 'dave_walk4' },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }

    if (anms.exists('hazard_fire_anim')) {
      anms.remove('hazard_fire_anim');
    }
    anms.create({
      key: 'hazard_fire_anim',
      frames: [
        { key: 'hazard_fire_1' },
        { key: 'hazard_fire_2' },
        { key: 'hazard_fire_3' },
        { key: 'hazard_fire_4' },
      ],
      frameRate: 8,
      repeat: -1,
    });

    if (!anms.exists('hazard_acid_anim')) {
      anms.create({
        key: 'hazard_acid_anim',
        frames: [{ key: 'hazard_acid_1' }, { key: 'hazard_acid_2' }],
        frameRate: 4,
        repeat: -1,
      });
    }

    if (!anms.exists('hazard_weed_anim')) {
      anms.create({
        key: 'hazard_weed_anim',
        frames: [{ key: 'hazard_weed_1' }, { key: 'hazard_weed_2' }],
        frameRate: 4,
        repeat: -1,
      });
    }

    if (!anms.exists('monster_walk')) {
      anms.create({
        key: 'monster_walk',
        frames: [{ key: 'monster_1' }, { key: 'monster_2' }],
        frameRate: 5,
        repeat: -1,
      });
    }

    if (!anms.exists('monster_green_walk')) {
      anms.create({
        key: 'monster_green_walk',
        frames: [
          { key: 'monster_green_walk_1' },
          { key: 'monster_green_walk_2' },
          { key: 'monster_green_walk_3' },
          { key: 'monster_green_walk_4' },
        ],
        frameRate: 6,
        repeat: -1,
      });
    }

    if (!anms.exists('spider_skitter')) {
      anms.create({
        key: 'spider_skitter',
        frames: [
          { key: 'spider_walk_1' },
          { key: 'spider_walk_2' },
          { key: 'spider_walk_3' },
          { key: 'spider_walk_4' },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }

    if (!anms.exists('bat_fly')) {
      anms.create({
        key: 'bat_fly',
        frames: [
          { key: 'bat_fly_1' },
          { key: 'bat_fly_2' },
          { key: 'bat_fly_3' },
        ],
        frameRate: 8,
        repeat: -1,
      });
    }
  }
}
