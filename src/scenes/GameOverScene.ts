import Phaser from 'phaser';

export interface GameOverData {
  readonly finalScore: number;
  readonly levelIndex: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  public create(data: GameOverData): void {
    const { width, height } = this.scale;

    // Red tint flash background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000);
    bg.fillRect(0, 0, width, height);

    this.add.text(width / 2, 80, 'GAME OVER', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '28px',
      color: '#ff2222',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const scoreStr = (data.finalScore || 0).toString().padStart(5, '0');
    this.add.text(width / 2, 130, `FINAL SCORE: ${scoreStr}`, {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, 160, `FAILED ON LEVEL ${((data.levelIndex || 0) + 1)}`, {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '12px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    const restartPrompt = this.add.text(width / 2, height - 50, 'PRESS SPACE TO TRY AGAIN', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '13px',
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
      this.scene.start('GameScene', { levelIndex: 0, score: 0, lives: 3 });
    };

    this.input.keyboard?.once('keydown-SPACE', restart);
    this.input.keyboard?.once('keydown-ENTER', restart);
    this.input.once('pointerdown', restart);
  }
}
