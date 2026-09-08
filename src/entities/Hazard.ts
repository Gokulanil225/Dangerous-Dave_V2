import Phaser from 'phaser';

export type HazardType = 'fire' | 'acid' | 'spikes' | 'weed';

export class Hazard extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  public readonly hazardType: HazardType;

  constructor(scene: Phaser.Scene, x: number, y: number, hazardType: HazardType) {
    let texture = 'hazard_fire_1';
    if (hazardType === 'acid') texture = 'hazard_acid_1';
    if (hazardType === 'spikes') texture = 'hazard_spikes';
    if (hazardType === 'weed') texture = 'hazard_weed_1';

    super(scene, x, y, texture);
    this.hazardType = hazardType;

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // Static body

    // Fine-tune collision box for forgiving retro gameplay
    if (hazardType === 'weed') {
      this.body.setSize(12, 14);
      this.body.setOffset(2, 1);
    } else if (hazardType === 'fire') {
      this.body.setSize(12, 10);
      this.body.setOffset(2, 6);
    } else {
      this.body.setSize(14, 12);
      this.body.setOffset(1, 4);
    }

    if (hazardType === 'fire') {
      this.play('hazard_fire_anim');
    } else if (hazardType === 'acid') {
      this.play('hazard_acid_anim');
    } else if (hazardType === 'weed') {
      if (this.scene.anims.exists('hazard_weed_anim')) {
        this.play('hazard_weed_anim');
      }
    }
  }
}
