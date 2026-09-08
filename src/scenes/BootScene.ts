import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  public create(): void {
    // Transition to PreloadScene to load assets and configure HD textures
    this.scene.start('PreloadScene');
  }
}
