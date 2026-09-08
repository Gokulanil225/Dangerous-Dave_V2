import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/config';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: 'left' | 'right') {
    super(scene, x, y, 'bullet');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    const speed = GAME_CONFIG.player.bulletSpeed;
    this.setVelocityX(direction === 'right' ? speed : -speed);

    // Bullet automatically destroys after 1.5 seconds if it hasn't hit anything
    scene.time.delayedCall(1500, () => {
      if (this.active) {
        this.destroy();
      }
    });
  }

  public hitWall(): void {
    this.spark();
    this.destroy();
  }

  public hitEnemy(): void {
    this.spark();
    this.destroy();
  }

  private spark(): void {
    // Spawn brief spark particle
    const spark = this.scene.add.sprite(this.x, this.y, 'particle_spark');
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 100,
      onComplete: () => spark.destroy(),
    });
  }
}
