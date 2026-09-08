import Phaser from 'phaser';
import { OutfitType } from '../systems/TextureGenerator';

export class TitleScene extends Phaser.Scene {
  private currentOutfitIndex: number = 0;
  private readonly outfits: OutfitType[] = ['classic', 'winter', 'ninja'];
  private readonly outfitLabels: string[] = ['CLASSIC DAVE', 'WINTER EXPLORER', 'STEALTH NINJA'];
  private readonly outfitDescriptions: string[] = [
    'The Iconic 1988 Sleeveless Outfit',
    'Heavy Parka, Warm Beanie & Snow Boots',
    'Midnight Shinobi Suit & Crimson Scarf',
  ];
  private davePreview!: Phaser.GameObjects.Sprite;
  private outfitText!: Phaser.GameObjects.Text;
  private outfitDescText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'TitleScene' });
  }

  public create(): void {
    const { width, height } = this.scale;

    // 1. Glowing Sunset Sky Backdrop (Inspired by User's Art)
    this.add.image(width / 2, height / 2, 'bg_sunset_sky').setAlpha(0.9);

    // Ruined skyline silhouette in the lower half
    const skyline = this.add.image(width / 2, height - 16, 'bg_ruin_skyline');
    skyline.setOrigin(0.5, 1).setAlpha(0.7);

    // Translucent dark vignette for maximum text contrast
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.45);
    overlay.fillRect(0, 0, width, height);

    // Glowing retro gold border
    overlay.lineStyle(2, 0xffa000, 0.9);
    overlay.strokeRect(8, 8, width - 16, height - 16);

    // 2. High-Clarity Iconic Title
    this.add.text(width / 2, 30, 'DANGEROUS DAVE', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '25px',
      color: '#ffea00',
      stroke: '#770000',
      strokeThickness: 5,
    }).setOrigin(0.5).setResolution(2.5);

    this.add.text(width / 2, 51, 'REMASTERED 2.0 • 10 HANDCRAFTED LEVELS', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '9px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(2.5);

    // 3. Wardrobe / Outfit Selector Panel
    const outfitY = 88;

    const prevBtn = this.add.text(width / 2 - 110, outfitY, '◄', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '18px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2.5).setInteractive({ useHandCursor: true });

    this.outfitText = this.add.text(width / 2, outfitY, this.outfitLabels[0], {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '11px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2.5);

    const nextBtn = this.add.text(width / 2 + 110, outfitY, '►', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '18px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2.5).setInteractive({ useHandCursor: true });

    this.outfitDescText = this.add.text(width / 2, 105, this.outfitDescriptions[0], {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '8px',
      color: '#ffddaa',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setResolution(2.5);

    // Dave animated character preview
    this.davePreview = this.add.sprite(width / 2, 136, 'dave_classic_idle').setScale(2.3);
    this.davePreview.play('dave_classic_walk');

    // Golden Trophy preview
    const trophy = this.add.sprite(width / 2 + 65, 136, 'trophy').setScale(2);
    this.tweens.add({
      targets: trophy,
      y: '+=3',
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    const updateOutfit = (delta: number): void => {
      this.currentOutfitIndex =
        (this.currentOutfitIndex + delta + this.outfits.length) % this.outfits.length;
      const outfit = this.outfits[this.currentOutfitIndex];
      this.outfitText.setText(this.outfitLabels[this.currentOutfitIndex]);
      this.outfitDescText.setText(this.outfitDescriptions[this.currentOutfitIndex]);
      this.davePreview.play(`dave_${outfit}_walk`);
    };

    prevBtn.on('pointerdown', () => updateOutfit(-1));
    nextBtn.on('pointerdown', () => updateOutfit(1));

    this.input.keyboard?.on('keydown-LEFT', () => updateOutfit(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => updateOutfit(1));
    this.input.keyboard?.on('keydown-C', () => updateOutfit(1));
    this.input.keyboard?.on('keydown-O', () => updateOutfit(1));

    // 4. Clean, High-Contrast Instructions Panel
    const boxX = width / 2 - 135;
    const boxY = 162;
    const boxW = 270;
    const boxH = 54;

    const boxBg = this.add.graphics();
    boxBg.fillStyle(0x0a0514, 0.85);
    boxBg.fillRect(boxX, boxY, boxW, boxH);
    boxBg.lineStyle(1, 0xff9900, 0.9);
    boxBg.strokeRect(boxX, boxY, boxW, boxH);

    const controls = [
      '• ARROWS / WASD : Move      • SPACE : Jump (Hold high)',
      '• CTRL / X      : Blaster   • SHIFT : Jetpack',
      '• C / ◄ ►       : Outfit    • F     : Fullscreen',
    ];

    this.add.text(width / 2, boxY + boxH / 2, controls.join('\n'), {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '8px',
      color: '#ffffff',
      lineSpacing: 3,
      align: 'center',
    }).setOrigin(0.5).setResolution(2.5);

    // 5. Pulsing "PRESS SPACE TO START" Prompt
    const startPrompt = this.add.text(width / 2, height - 20, '► PRESS SPACE TO START ◄', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '13px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setResolution(2.5);

    this.tweens.add({
      targets: startPrompt,
      alpha: 0.25,
      duration: 380,
      yoyo: true,
      repeat: -1,
    });

    const startGame = (): void => {
      const chosenOutfit = this.outfits[this.currentOutfitIndex];
      this.scene.start('GameScene', {
        levelIndex: 0,
        score: 0,
        lives: 3,
        outfit: chosenOutfit,
      });
    };

    this.input.keyboard?.once('keydown-SPACE', startGame);
    this.input.keyboard?.once('keydown-ENTER', startGame);
    this.input.once('pointerdown', startGame);

    this.input.keyboard?.on('keydown-F', () => {
      this.scale.toggleFullscreen();
    });
  }
}
