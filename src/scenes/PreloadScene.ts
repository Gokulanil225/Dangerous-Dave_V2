import Phaser from 'phaser';
import { TextureGenerator } from '../systems/TextureGenerator';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public preload(): void {
    // 1. High-Resolution 64x64 Sprite Sheets for all 3 Outfits
    const outfits = ['classic', 'winter', 'ninja'];
    for (const outfit of outfits) {
      this.load.spritesheet(`dave_hd_${outfit}`, `assets/sprites/dave_hd_${outfit}.png`, {
        frameWidth: 64,
        frameHeight: 64,
      });

      // Matching HD Head Icons for HUD lives
      this.load.image(`dave_hd_head_${outfit}`, `assets/sprites/dave_hd_head_${outfit}.png`);
    }

    // Legacy fallback alias
    this.load.spritesheet('dave_hd', 'assets/sprites/dave_hd_64x64.png', {
      frameWidth: 64,
      frameHeight: 64,
    });
  }

  public create(): void {
    // 2. Procedural texture generation for levels, hazards, items, UI
    TextureGenerator.generateAll(this);

    // 3. Configure Smooth HD Animations for all outfits
    this.createHDAnimations();

    // 4. Transition to the modernized HD-2D Start Screen
    this.scene.start('MainMenuScene');
  }

  private createHDAnimations(): void {
    const anms = this.anims;
    const outfits = ['classic', 'winter', 'ninja'];

    for (const outfit of outfits) {
      const keyPrefix = `dave_hd_${outfit}`;

      if (this.textures.exists(keyPrefix)) {
        if (!anms.exists(`${keyPrefix}_idle`)) {
          anms.create({
            key: `${keyPrefix}_idle`,
            frames: [{ key: keyPrefix, frame: 0 }],
            frameRate: 1,
          });
        }

        if (!anms.exists(`${keyPrefix}_run`)) {
          anms.create({
            key: `${keyPrefix}_run`,
            frames: anms.generateFrameNumbers(keyPrefix, { start: 4, end: 9 }),
            frameRate: 12,
            repeat: -1,
          });
        }

        if (!anms.exists(`${keyPrefix}_jump`)) {
          anms.create({
            key: `${keyPrefix}_jump`,
            frames: [{ key: keyPrefix, frame: 10 }],
            frameRate: 1,
          });
        }

        if (!anms.exists(`${keyPrefix}_fall`)) {
          anms.create({
            key: `${keyPrefix}_fall`,
            frames: [{ key: keyPrefix, frame: 11 }],
            frameRate: 1,
          });
        }
      }
    }

    // Default aliases pointing to classic HD
    if (this.textures.exists('dave_hd_classic')) {
      if (!anms.exists('dave_hd_idle')) {
        anms.create({
          key: 'dave_hd_idle',
          frames: [{ key: 'dave_hd_classic', frame: 0 }],
          frameRate: 1,
        });
      }
      if (!anms.exists('dave_hd_run')) {
        anms.create({
          key: 'dave_hd_run',
          frames: anms.generateFrameNumbers('dave_hd_classic', { start: 4, end: 9 }),
          frameRate: 12,
          repeat: -1,
        });
      }
      if (!anms.exists('dave_hd_jump')) {
        anms.create({
          key: 'dave_hd_jump',
          frames: [{ key: 'dave_hd_classic', frame: 10 }],
          frameRate: 1,
        });
      }
      if (!anms.exists('dave_hd_fall')) {
        anms.create({
          key: 'dave_hd_fall',
          frames: [{ key: 'dave_hd_classic', frame: 11 }],
          frameRate: 1,
        });
      }
    }
  }
}
