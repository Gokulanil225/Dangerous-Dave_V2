import Phaser from 'phaser';
import { OutfitType } from '../systems/TextureGenerator';
import { SoundManager } from '../systems/SoundManager';
import { UI_THEME } from '../ui/UITheme';

export class OptionsScene extends Phaser.Scene {
  private currentOutfitIndex: number = 0;
  private readonly outfits: OutfitType[] = ['classic', 'winter', 'ninja'];
  private readonly outfitLabels: string[] = ['CLASSIC DAVE', 'WINTER EXPLORER', 'STEALTH NINJA'];
  private readonly outfitDescriptions: string[] = [
    'Original 1988 Sleeveless Muscle Top and Red Cap',
    'Heavy Winter Parka, Warm Beanie and Snow Boots',
    'Midnight Shinobi Cowl and Crimson Streamer Scarf',
  ];

  private davePreview!: Phaser.GameObjects.Sprite;
  private outfitTitleText!: Phaser.GameObjects.Text;
  private outfitDescText!: Phaser.GameObjects.Text;

  private selectedMenuIndex: number = 0;
  private menuItems: { label: string; action: () => void; valueText?: () => string }[] = [];
  private menuTexts: Phaser.GameObjects.Text[] = [];
  private pointerArrow!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'OptionsScene' });
  }

  public init(data?: { outfit?: OutfitType }): void {
    const activeOutfit = data?.outfit || (this.registry.get('outfit') as OutfitType) || 'classic';
    const foundIdx = this.outfits.indexOf(activeOutfit);
    this.currentOutfitIndex = foundIdx >= 0 ? foundIdx : 0;
  }

  public create(): void {
    const { width, height } = this.scale;

    // Atmospheric deep blood-crimson & obsidian gradient (matches title screen)
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x180307, 0x180307, 0x7a0c18, 0x7a0c18, 1, 1, 1, 1);
    sky.fillRect(0, 0, width, height * 0.72);
    sky.fillGradientStyle(0x7a0c18, 0x7a0c18, 0x1c0307, 0x1c0307, 1, 1, 1, 1);
    sky.fillRect(0, height * 0.72, width, height * 0.28);

    // Dramatic Crimson Atmospheric Backlight Aura
    const redAura = this.add.graphics();
    redAura.fillStyle(0xd91e36, 0.14);
    redAura.fillCircle(width * 0.5, height * 0.45, 130);
    redAura.fillStyle(0xff2a4b, 0.10);
    redAura.fillCircle(width * 0.5, height * 0.45, 75);

    const skyline = this.add.image(width / 2, height - 6, 'bg_ruin_skyline');
    skyline.setOrigin(0.5, 1).setAlpha(0.7).setTint(0x160206);

    // Subtle scanline overlay
    const scanlines = this.add.graphics();
    scanlines.lineStyle(1, 0x000000, 0.15);
    for (let y = 0; y < height; y += 2) {
      scanlines.beginPath();
      scanlines.moveTo(0, y);
      scanlines.lineTo(width, y);
      scanlines.strokePath();
    }

    // Header Title
    this.add.text(width / 2, 28, 'OPTIONS AND SETTINGS', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '14px',
      fontStyle: 'bold',
      color: UI_THEME.colors.goldTitle,
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Dave Character Preview (centered upper)
    const previewY = 72;
    const initialOutfit = this.outfits[this.currentOutfitIndex];
    const spriteKey = this.getSpriteKey(initialOutfit);

    this.davePreview = this.add.sprite(width / 2 - 80, previewY, spriteKey);
    this.davePreview.setScale(1.4);

    this.tweens.add({
      targets: this.davePreview,
      y: previewY - 3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Outfit Text Info
    this.outfitTitleText = this.add.text(
      width / 2 + 30,
      previewY - 10,
      this.outfitLabels[this.currentOutfitIndex],
      {
        fontFamily: UI_THEME.fonts.ui,
        fontSize: '9px',
        fontStyle: 'bold',
        color: UI_THEME.colors.textHeading,
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
      }
    ).setOrigin(0.5);

    this.outfitDescText = this.add.text(
      width / 2 + 30,
      previewY + 10,
      this.outfitDescriptions[this.currentOutfitIndex],
      {
        fontFamily: UI_THEME.fonts.ui,
        fontSize: '7px',
        color: UI_THEME.colors.textBody,
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
        align: 'center',
        wordWrap: { width: 170 },
      }
    ).setOrigin(0.5);

    // Setup interactive options menu list
    this.menuItems = [
      {
        label: 'OUTFIT',
        valueText: () => '< ' + this.outfitLabels[this.currentOutfitIndex] + ' >',
        action: () => this.cycleOutfit(1),
      },
      {
        label: 'AUDIO',
        valueText: () => (SoundManager.getInstance().getMuted() ? '[ MUTED ]' : '[ ENABLED ]'),
        action: () => {
          SoundManager.getInstance().toggleMute();
          SoundManager.getInstance().playChirp();
          this.refreshMenu();
        },
      },
      {
        label: 'DISPLAY',
        valueText: () => (this.scale.isFullscreen ? '[ FULLSCREEN ]' : '[ WINDOWED ]'),
        action: () => {
          this.scale.toggleFullscreen();
          SoundManager.getInstance().playChirp();
          this.time.delayedCall(120, () => this.refreshMenu());
        },
      },
      {
        label: 'BACK TO TITLE',
        valueText: () => '',
        action: () => this.returnToTitle(),
      },
    ];

    // Build text items
    const menuStartY = 126;
    const menuSpacing = 22;

    this.pointerArrow = this.add.text(width / 2 - 110, menuStartY, '►', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '9px',
      color: '#ff2a4b',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    this.menuTexts = [];
    this.menuItems.forEach((_item, index) => {
      const itemY = menuStartY + index * menuSpacing;
      const textObj = this.add.text(width / 2, itemY, '', {
        fontFamily: UI_THEME.fonts.ui,
        fontSize: '9px',
        color: index === this.selectedMenuIndex ? '#ff2a4b' : '#f1f5f9',
        shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      textObj.on('pointerover', () => {
        this.setSelectedIndex(index);
      });

      textObj.on('pointerdown', () => {
        this.triggerCurrentItem();
      });

      this.menuTexts.push(textObj);
    });

    this.refreshMenu();

    // Footer Help Prompt
    this.add.text(width / 2, height - 16, 'UP/DOWN SELECT · LEFT/RIGHT CHANGE · ENTER CONFIRM · ESC BACK', {
      fontFamily: UI_THEME.fonts.ui,
      fontSize: '7px',
      color: '#a87b84',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Keyboard handlers
    this.setupKeyboard();
  }

  private setSelectedIndex(index: number): void {
    if (this.selectedMenuIndex !== index) {
      SoundManager.getInstance().playChirp();
      this.selectedMenuIndex = index;
      this.refreshMenu();
    }
  }

  private refreshMenu(): void {
    const { width } = this.scale;
    const menuStartY = 126;
    const menuSpacing = 22;

    this.menuItems.forEach((item, index) => {
      const val = item.valueText ? item.valueText() : '';
      const displayStr = val ? (item.label + '  ' + val) : item.label;
      const textObj = this.menuTexts[index];
      textObj.setText(displayStr);

      const isSelected = index === this.selectedMenuIndex;
      textObj.setColor(isSelected ? '#ff2a4b' : '#f1f5f9');
    });

    // Reposition arrow
    const targetY = menuStartY + this.selectedMenuIndex * menuSpacing;
    const currentText = this.menuTexts[this.selectedMenuIndex];
    const textHalfWidth = currentText.width / 2;
    this.pointerArrow.setPosition(width / 2 - textHalfWidth - 12, targetY);
  }

  private triggerCurrentItem(): void {
    const item = this.menuItems[this.selectedMenuIndex];
    if (item) {
      item.action();
    }
  }

  private cycleOutfit(delta: number): void {
    SoundManager.getInstance().playChirp();
    this.currentOutfitIndex =
      (this.currentOutfitIndex + delta + this.outfits.length) % this.outfits.length;
    const outfit = this.outfits[this.currentOutfitIndex];
    this.registry.set('outfit', outfit);

    this.outfitTitleText.setText(this.outfitLabels[this.currentOutfitIndex]);
    this.outfitDescText.setText(this.outfitDescriptions[this.currentOutfitIndex]);

    const spriteKey = this.getSpriteKey(outfit);
    this.davePreview.setTexture(spriteKey, 0);

    this.refreshMenu();
  }

  private getSpriteKey(outfit: OutfitType): string {
    const hdKey = 'dave_hd_' + outfit;
    if (this.textures.exists(hdKey)) return hdKey;
    if (this.textures.exists('dave_' + outfit + '_stand')) return 'dave_' + outfit + '_stand';
    return 'dave_classic_stand';
  }

  private returnToTitle(): void {
    SoundManager.getInstance().playChirp();
    const outfit = this.outfits[this.currentOutfitIndex];
    this.scene.start('MainMenuScene', { outfit });
  }

  private setupKeyboard(): void {
    this.input.keyboard?.on('keydown-UP', () => {
      this.setSelectedIndex((this.selectedMenuIndex - 1 + this.menuItems.length) % this.menuItems.length);
    });
    this.input.keyboard?.on('keydown-W', () => {
      this.setSelectedIndex((this.selectedMenuIndex - 1 + this.menuItems.length) % this.menuItems.length);
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      this.setSelectedIndex((this.selectedMenuIndex + 1) % this.menuItems.length);
    });
    this.input.keyboard?.on('keydown-S', () => {
      this.setSelectedIndex((this.selectedMenuIndex + 1) % this.menuItems.length);
    });

    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.selectedMenuIndex === 0) {
        this.cycleOutfit(-1);
      }
    });
    this.input.keyboard?.on('keydown-A', () => {
      if (this.selectedMenuIndex === 0) {
        this.cycleOutfit(-1);
      }
    });

    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.selectedMenuIndex === 0) {
        this.cycleOutfit(1);
      }
    });
    this.input.keyboard?.on('keydown-D', () => {
      if (this.selectedMenuIndex === 0) {
        this.cycleOutfit(1);
      }
    });

    this.input.keyboard?.on('keydown-ENTER', () => {
      this.triggerCurrentItem();
    });
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.triggerCurrentItem();
    });

    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToTitle();
    });
  }
}
