import Phaser from 'phaser';
import { OutfitType } from '../systems/TextureGenerator';
import { SoundManager } from '../systems/SoundManager';
import { UI_THEME } from '../ui/UITheme';

interface MenuItem {
  label: string;
  action: () => void;
}

export class MainMenuScene extends Phaser.Scene {
  private currentOutfit: OutfitType = 'classic';
  private selectedMenuIndex: number = 0;
  private menuItems: MenuItem[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private selectorArrow!: Phaser.GameObjects.Text;
  private daveSprite!: Phaser.GameObjects.Sprite;
  private controlsModal?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  public init(data?: { outfit?: OutfitType }): void {
    const activeOutfit = data?.outfit || (this.registry.get('outfit') as OutfitType) || 'classic';
    this.currentOutfit = activeOutfit;
    this.registry.set('outfit', activeOutfit);
    this.selectedMenuIndex = 0;
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Atmospheric Flat-Shaded Background
    this.createAtmosphericBackground(width, height);

    // 2. Scanline Overlay
    this.createScanlines(width, height);

    // 3. Hero Logo (Centered, Top Third)
    this.createHeroLogo(width);

    // 4. Character Pose (Right side ledge)
    this.createCharacterPose(width, height);

    // 5. Clean Vertical Text Menu (Centered)
    this.createMenuList(width);

    // 6. Minimal HUD Corners
    this.createMinimalHUD(width, height);

    // 7. Setup Keyboard Navigation
    this.setupKeyboard();
  }

  /**
   * 1. Atmospheric Crimson/Red Sky Gradient, Glowing Aura & Silhouette (Omega Strike style)
   */
  private createAtmosphericBackground(width: number, height: number): void {
    // 1. Deep Blood-Crimson & Obsidian Sky Gradient (replaces old blue sky & removes accidental solar circles)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x180307, 0x180307, 0x7a0c18, 0x7a0c18, 1, 1, 1, 1);
    sky.fillRect(0, 0, width, height * 0.72);
    sky.fillGradientStyle(0x7a0c18, 0x7a0c18, 0x1c0307, 0x1c0307, 1, 1, 1, 1);
    sky.fillRect(0, height * 0.72, width, height * 0.28);

    // 2. Dramatic Crimson Atmospheric Backlight Aura (Omega Strike reference)
    const redAura = this.add.graphics();
    redAura.fillStyle(0xd91e36, 0.16);
    redAura.fillCircle(width * 0.44, height * 0.45, 140);
    redAura.fillStyle(0xff2a4b, 0.12);
    redAura.fillCircle(width * 0.44, height * 0.45, 85);
    redAura.fillStyle(0xff5370, 0.08);
    redAura.fillCircle(width * 0.44, height * 0.45, 45);

    this.tweens.add({
      targets: redAura,
      alpha: 0.75,
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 3. City / ruins silhouette at horizon tinted deep dark burgundy-black
    const skyline = this.add.image(width / 2, height - 4, 'bg_ruin_skyline');
    skyline.setOrigin(0.5, 1).setAlpha(0.75).setTint(0x160206);

    // 4. Floating Fiery Crimson & Gold Ember Particles
    const particleTex = this.textures.exists('particle_ember')
      ? 'particle_ember'
      : (this.textures.exists('particle_spark') ? 'particle_spark' : 'bullet');

    try {
      const emitter = this.add.particles(0, 0, particleTex, {
        x: { min: 20, max: width - 20 },
        y: { min: height + 10, max: height + 20 },
        speedX: { min: -6, max: 8 },
        speedY: { min: -14, max: -26 },
        lifespan: { min: 3800, max: 6800 },
        scale: { start: 0.8, end: 0.2 },
        alpha: { start: 0.25, end: 0 },
        frequency: 260,
        tint: [0xff2a4b, 0xff4757, 0xff6b81, 0xffa502],
        blendMode: 'ADD',
      });
      emitter.setDepth(1);
    } catch {
      // Fallback if particle engine encounters issue
    }
  }

  /**
   * 2. CRT Scanline Texture
   */
  private createScanlines(width: number, height: number): void {
    const scanlines = this.add.graphics();
    scanlines.setDepth(40);
    scanlines.lineStyle(1, 0x000000, 0.14);
    for (let y = 0; y < height; y += 2) {
      scanlines.beginPath();
      scanlines.moveTo(0, y);
      scanlines.lineTo(width, y);
      scanlines.strokePath();
    }
  }

  /**
   * 3. Hero Logo: Bold Lettering with Metallic Chrome-to-Crimson Gradient & Crisp Drop Shadow
   */
  private createHeroLogo(width: number): void {
    const logoY = 46;

    // Drop shadow offset down-right (+2, +2)
    this.add.text(width / 2 + 2, logoY + 2, 'DANGEROUS DAVE', {
      fontFamily: UI_THEME.fonts.display,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#080002',
      align: 'center',
    }).setOrigin(0.5).setDepth(10);

    // Main Logo with crisp outline and vertical gradient tint
    const mainLogo = this.add.text(width / 2, logoY, 'DANGEROUS DAVE', {
      fontFamily: UI_THEME.fonts.display,
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#140004',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5).setDepth(11);

    // Metallic silver-white at top fading into dramatic crimson/ruby red at bottom
    mainLogo.setTint(0xffffff, 0xffffff, 0xff4d6d, 0xd91e36);

    // Crisp subtitle in warm rose-white
    this.add.text(width / 2, logoY + 22, '— EPISODE I: REMASTERED —', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '7.5px',
      color: '#fecdd3',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5).setDepth(11);
  }

  /**
   * 4. Character Pose on a Small Pixel Ledge (Right Side)
   */
  private createCharacterPose(width: number, height: number): void {
    const ledgeX = width - 88;
    const ledgeY = height - 76;
    const ledgeW = 68;
    const ledgeH = 7;

    // Small pixel ledge
    const ledge = this.add.graphics();
    ledge.setDepth(6);
    // Dark obsidian stone surface
    ledge.fillStyle(0x180307, 0.95);
    ledge.fillRect(ledgeX - ledgeW / 2, ledgeY, ledgeW, ledgeH);
    // Glowing crimson top rim highlight
    ledge.lineStyle(1, 0xff2a4b, 0.85);
    ledge.beginPath();
    ledge.moveTo(ledgeX - ledgeW / 2, ledgeY);
    ledge.lineTo(ledgeX + ledgeW / 2, ledgeY);
    ledge.strokePath();
    // Bottom dark drop shadow
    ledge.lineStyle(1, 0x080002, 1);
    ledge.beginPath();
    ledge.moveTo(ledgeX - ledgeW / 2, ledgeY + ledgeH);
    ledge.lineTo(ledgeX + ledgeW / 2, ledgeY + ledgeH);
    ledge.strokePath();

    // Dave Sprite standing on ledge
    const spriteKey = this.getDaveSpriteKey(this.currentOutfit);
    this.daveSprite = this.add.sprite(ledgeX - 10, ledgeY - 18, spriteKey);
    this.daveSprite.setScale(1.25);
    this.daveSprite.setDepth(10);

    // Subtle idle breathing animation
    this.tweens.add({
      targets: this.daveSprite,
      y: ledgeY - 20,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Golden Trophy beside Dave on the ledge
    const trophy = this.add.sprite(ledgeX + 18, ledgeY - 10, 'trophy');
    trophy.setScale(1.2);
    trophy.setDepth(10);

    this.tweens.add({
      targets: trophy,
      y: ledgeY - 12,
      duration: 750,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * 5. Clean Vertical Text Menu (No boxes, no borders)
   */
  private createMenuList(width: number): void {
    this.menuItems = [
      {
        label: 'START GAME',
        action: () => this.startGame(),
      },
      {
        label: 'OPTIONS',
        action: () => this.openOptions(),
      },
      {
        label: 'HOW TO PLAY',
        action: () => this.showHowToPlay(),
      },
    ];

    const menuStartY = 112;
    const menuSpacing = 24;

    this.selectorArrow = this.add.text(0, menuStartY, '►', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '10px',
      color: '#ff2a4b',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5).setDepth(20);

    // Arrow bob animation
    this.tweens.add({
      targets: this.selectorArrow,
      x: '-=2',
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.menuTexts = [];
    this.menuItems.forEach((item, index) => {
      const itemY = menuStartY + index * menuSpacing;

      const textObj = this.add.text(width / 2, itemY, item.label, {
        fontFamily: UI_THEME.fonts.ui,
        fontSize: '10px',
        color: index === this.selectedMenuIndex ? '#ff2a4b' : '#f1f5f9',
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
      }).setOrigin(0.5).setDepth(20).setInteractive({ useHandCursor: true });

      textObj.on('pointerover', () => {
        if (this.controlsModal) return;
        this.selectMenuItem(index);
      });

      textObj.on('pointerdown', () => {
        if (this.controlsModal) return;
        this.confirmCurrentItem();
      });

      this.menuTexts.push(textObj);
    });

    this.updateMenuVisuals();
  }

  private selectMenuItem(index: number): void {
    if (this.selectedMenuIndex !== index) {
      SoundManager.getInstance().playChirp();
      this.selectedMenuIndex = index;
      this.updateMenuVisuals();
    }
  }

  private updateMenuVisuals(): void {
    const { width } = this.scale;
    const menuStartY = 112;
    const menuSpacing = 24;

    this.menuTexts.forEach((textObj, index) => {
      const isSelected = index === this.selectedMenuIndex;
      textObj.setColor(isSelected ? '#ff2a4b' : '#f1f5f9');
    });

    const activeText = this.menuTexts[this.selectedMenuIndex];
    if (activeText) {
      const targetY = menuStartY + this.selectedMenuIndex * menuSpacing;
      const textHalfWidth = activeText.width / 2;
      this.selectorArrow.setPosition(width / 2 - textHalfWidth - 14, targetY);
      this.selectorArrow.setVisible(true);
    }
  }

  private confirmCurrentItem(): void {
    const item = this.menuItems[this.selectedMenuIndex];
    if (item) {
      SoundManager.getInstance().playChirp();
      item.action();
    }
  }

  /**
   * 6. Minimal HUD Corners
   */
  private createMinimalHUD(width: number, height: number): void {
    // Bottom-Left: Control Hint
    this.add.text(16, height - 14, '↑↓ SELECT · ENTER CONFIRM', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '7px',
      color: '#a87b84',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0, 0.5).setDepth(15);

    // Bottom-Right: Version & Best Score
    this.add.text(width - 16, height - 14, 'v2.0 · BEST: 00000', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '7px',
      color: '#a87b84',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(1, 0.5).setDepth(15);
  }

  /**
   * 7. Keyboard Navigation
   */
  private setupKeyboard(): void {
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.controlsModal) return;
      this.selectMenuItem((this.selectedMenuIndex - 1 + this.menuItems.length) % this.menuItems.length);
    });
    this.input.keyboard?.on('keydown-W', () => {
      if (this.controlsModal) return;
      this.selectMenuItem((this.selectedMenuIndex - 1 + this.menuItems.length) % this.menuItems.length);
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.controlsModal) return;
      this.selectMenuItem((this.selectedMenuIndex + 1) % this.menuItems.length);
    });
    this.input.keyboard?.on('keydown-S', () => {
      if (this.controlsModal) return;
      this.selectMenuItem((this.selectedMenuIndex + 1) % this.menuItems.length);
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.controlsModal) {
        this.dismissModal();
        return;
      }
      this.confirmCurrentItem();
    });
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.controlsModal) {
        this.dismissModal();
        return;
      }
      this.confirmCurrentItem();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      if (this.controlsModal) {
        this.dismissModal();
      }
    });

    this.input.keyboard?.on('keydown-F', () => {
      this.scale.toggleFullscreen();
    });
    this.input.keyboard?.on('keydown-M', () => {
      SoundManager.getInstance().toggleMute();
    });
  }

  private startGame(): void {
    SoundManager.getInstance().playWin();
    this.cameras.main.fade(280, 0, 0, 0, false, (_camera: unknown, progress: number) => {
      if (progress === 1) {
        this.scene.start('GameScene', {
          levelIndex: 0,
          score: 0,
          lives: 3,
          outfit: this.currentOutfit,
        });
      }
    });
  }

  private openOptions(): void {
    this.scene.start('OptionsScene', { outfit: this.currentOutfit });
  }

  private showHowToPlay(): void {
    if (this.controlsModal) return;

    const { width, height } = this.scale;
    this.controlsModal = this.add.container(width / 2, height / 2);
    this.controlsModal.setDepth(60);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x140206, 0.94);
    backdrop.fillRoundedRect(-140, -75, 280, 150, 4);
    backdrop.lineStyle(1, 0xff2a4b, 0.9);
    backdrop.strokeRoundedRect(-140, -75, 280, 150, 4);

    const title = this.add.text(0, -56, 'MISSION BRIEFING & CONTROLS', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: UI_THEME.colors.goldTitle,
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    const lines = [
      '• ARROWS / WASD : Move & Jump',
      '• CTRL / X      : Blaster Fire',
      '• SHIFT         : Jetpack Thrusters',
      '• OBJECTIVE     : Grab the Trophy & reach the Door',
      '• HAZARDS       : Avoid Spikes, Acid & Monsters',
    ];

    const bodyText = this.add.text(0, -3, lines.join('\n'), {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '7.5px',
      color: '#fecdd3',
      lineSpacing: 4,
      align: 'left',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    const dismissPrompt = this.add.text(0, 56, 'PRESS ENTER OR ESC TO CLOSE', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '7px',
      color: '#ff4d6d',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    this.controlsModal.add([backdrop, title, bodyText, dismissPrompt]);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(-140, -75, 280, 150), Phaser.Geom.Rectangle.Contains);
    backdrop.on('pointerdown', () => this.dismissModal());
  }

  private dismissModal(): void {
    if (this.controlsModal) {
      SoundManager.getInstance().playChirp();
      this.controlsModal.destroy();
      this.controlsModal = undefined;
    }
  }

  private getDaveSpriteKey(outfit: OutfitType): string {
    const hdKey = 'dave_hd_' + outfit;
    if (this.textures.exists(hdKey)) return hdKey;
    if (this.textures.exists('dave_' + outfit + '_stand')) return 'dave_' + outfit + '_stand';
    return 'dave_classic_stand';
  }
}
