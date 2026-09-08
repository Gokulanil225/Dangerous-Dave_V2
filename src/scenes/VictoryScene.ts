import Phaser from 'phaser';
import { SoundManager } from '../systems/SoundManager';
import { OutfitType } from '../systems/TextureGenerator';

export interface VictoryData {
  readonly finalScore: number;
  readonly outfit?: OutfitType;
}

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  public create(data: VictoryData): void {
    const { width, height } = this.scale;
    const outfit = data.outfit ?? 'classic';

    SoundManager.getInstance().playWin();

    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, width, height);

    // Festive border
    bg.lineStyle(2, 0xffcc00, 1);
    bg.strokeRect(10, 10, width - 20, height - 20);

    this.add.text(width / 2, 50, 'CONGRATULATIONS!', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '22px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(width / 2, 85, 'YOU CONQUERED DANGEROUS DAVE 2.0!', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '11px',
      color: '#00ffff',
    }).setOrigin(0.5);

    // Dave holding trophy (HD outfit sprite)
    const hdTexture = `dave_hd_${outfit}`;
    if (this.textures.exists(hdTexture)) {
      const daveSprite = this.add.sprite(width / 2 - 25, 135, hdTexture);
      daveSprite.setScale(1.2);
      if (this.anims.exists(`dave_hd_${outfit}_idle`)) {
        daveSprite.play(`dave_hd_${outfit}_idle`);
      }
    } else {
      this.add.sprite(width / 2 - 20, 135, 'dave_idle').setScale(2.5);
    }
    this.add.sprite(width / 2 + 25, 135, 'trophy').setScale(2.0);

    const scoreStr = (data.finalScore || 0).toString().padStart(5, '0');
    this.add.text(width / 2, 185, `MASTER SCORE: ${scoreStr}`, {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '15px',
      color: '#ffffff',
      stroke: '#0055ff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    const restartPrompt = this.add.text(width / 2, height - 35, 'PRESS SPACE TO PLAY AGAIN', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '12px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartPrompt,
      alpha: 0.2,
      duration: 350,
      yoyo: true,
      repeat: -1,
    });

    const restart = (): void => {
      this.scene.start('MainMenuScene');
    };

    this.input.keyboard?.once('keydown-SPACE', restart);
    this.input.keyboard?.once('keydown-ENTER', restart);
    this.input.once('pointerdown', restart);
  }
}
