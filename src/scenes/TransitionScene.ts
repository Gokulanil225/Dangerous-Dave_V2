import Phaser from 'phaser';
import { OutfitType } from '../systems/TextureGenerator';

export interface TransitionData {
  readonly nextLevelIndex: number;
  readonly score: number;
  readonly lives: number;
  readonly totalLevels: number;
  readonly outfit?: OutfitType;
}

/**
 * Inter-level Corridor Transition Scene.
 * Faithfully replicates the iconic Dangerous Dave hallway animation from the user screenshot:
 * - Blue brick ceiling & floor
 * - Closed wooden door on the left
 * - Dave walking across to the right in his chosen outfit
 * - "GOOD WORK! ONLY X MORE TO GO!" retro banner (e.g. ONLY 9 MORE TO GO!)
 * - Silver reflective horizon line
 */
export class TransitionScene extends Phaser.Scene {
  private dataPayload!: TransitionData;
  private dave!: Phaser.GameObjects.Sprite;
  private hasTransitioned: boolean = false;

  constructor() {
    super({ key: 'TransitionScene' });
  }

  public init(data: TransitionData): void {
    this.dataPayload = data;
    this.hasTransitioned = false;
  }

  public create(): void {
    const { width, height } = this.scale;
    const outfit = this.dataPayload.outfit ?? 'classic';

    // 1. Black Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, width, height);

    // 2. Banner Text: "GOOD WORK! ONLY X MORE TO GO!" (e.g. ONLY 9 MORE TO GO!)
    const remaining = Math.max(1, this.dataPayload.totalLevels - this.dataPayload.nextLevelIndex);
    const bannerStr = `GOOD WORK! ONLY ${remaining} MORE TO GO!`;

    this.add.text(width / 2, 48, bannerStr, {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setResolution(2);

    // 3. Hallway Geometry (Blue brick ceiling & floor)
    const corridorTopY = 72;
    const corridorBottomY = 160;

    // Blue brick ceiling (2 rows)
    this.add.tileSprite(width / 2, corridorTopY, width, 16, 'tile_brick_blue');
    this.add.tileSprite(width / 2, corridorTopY + 16, width, 16, 'tile_brick_blue');

    // Blue brick floor (2 rows)
    this.add.tileSprite(width / 2, corridorBottomY, width, 16, 'tile_brick_blue');
    this.add.tileSprite(width / 2, corridorBottomY + 16, width, 16, 'tile_brick_blue');

    // Silver horizon line below corridor
    this.add.tileSprite(width / 2, height - 36, width, 4, 'silver_trim');

    // 4. Wooden Exit Door on the Left
    this.add.sprite(28, corridorBottomY - 12, 'door_closed');

    // 5. Dave Character walking from Left to Right in his chosen outfit
    const daveY = corridorBottomY - 16;
    const hdTexture = `dave_hd_${outfit}`;
    const hdRun = `dave_hd_${outfit}_run`;

    if (this.textures.exists(hdTexture) && this.anims.exists(hdRun)) {
      this.dave = this.add.sprite(38, daveY, hdTexture);
      this.dave.setScale(0.55);
      this.dave.play(hdRun);
    } else {
      this.dave = this.add.sprite(38, corridorBottomY - 13, `dave_${outfit}_idle`);
      this.dave.play(`dave_${outfit}_walk`);
    }

    // Dave walks smoothly across the screen
    this.tweens.add({
      targets: this.dave,
      x: width + 30,
      duration: 3600,
      ease: 'Linear',
      onComplete: () => {
        this.startNextLevel();
      },
    });

    // 6. Retro Instruction Note
    this.add.text(width / 2, height - 18, 'PRESS SPACE TO SKIP  •  PRESS F FOR FULLSCREEN', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '10px',
      color: '#aaaaaa',
    }).setOrigin(0.5).setResolution(2);

    // Skip on Space, Enter, or Click
    const skip = (): void => {
      this.startNextLevel();
    };
    this.input.keyboard?.once('keydown-SPACE', skip);
    this.input.keyboard?.once('keydown-ENTER', skip);
    this.input.once('pointerdown', skip);

    this.input.keyboard?.on('keydown-F', () => {
      this.scale.toggleFullscreen();
    });
  }

  private startNextLevel(): void {
    if (this.hasTransitioned) return;
    this.hasTransitioned = true;

    this.scene.start('GameScene', {
      levelIndex: this.dataPayload.nextLevelIndex,
      score: this.dataPayload.score,
      lives: this.dataPayload.lives,
      outfit: this.dataPayload.outfit ?? 'classic',
    });
  }
}
