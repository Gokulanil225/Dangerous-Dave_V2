import Phaser from 'phaser';
import { Player } from './Player';
import { GAME_CONFIG } from '../data/config';
import { SoundManager } from '../systems/SoundManager';

/**
 * Base abstract class for all collectables and interactive props.
 */
export abstract class Pickup extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  public abstract readonly isReusable: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);

    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
  }

  public abstract onPlayerOverlap(player: Player, time: number): void;
}

/**
 * GravitySwitch - Inverts Dave's gravity when touched.
 */
export interface GravitySwitchOptions {
  readonly reusable?: boolean;
  readonly cooldownMs?: number;
  readonly targetInvertedState?: boolean;
}

export class GravitySwitch extends Pickup {
  public readonly isReusable: boolean;
  private readonly cooldownMs: number;
  private readonly targetInvertedState?: boolean;
  private nextAvailableTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string = 'gravity_switch_active',
    options?: GravitySwitchOptions
  ) {
    super(scene, x, y, texture);

    this.isReusable = options?.reusable ?? true;
    this.cooldownMs = options?.cooldownMs ?? GAME_CONFIG.player.gravityToggleCooldownMs;
    this.targetInvertedState = options?.targetInvertedState;

    this.setTint(0x00ffff);
  }

  public onPlayerOverlap(player: Player, time: number): void {
    if (time < this.nextAvailableTime) {
      return;
    }

    const toggled = player.toggleGravity(this.targetInvertedState, time);

    if (toggled) {
      this.nextAvailableTime = time + this.cooldownMs;
      SoundManager.getInstance().playGravityFlip();
      this.playTriggerEffect();

      if (!this.isReusable) {
        this.disableBody(true, true);
      }
    }
  }

  private playTriggerEffect(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 120,
      yoyo: true,
      ease: Phaser.Math.Easing.Sine.InOut,
    });

    this.setTint(0xff00ff);
    this.scene.time.delayedCall(this.cooldownMs * 0.75, () => {
      if (this.active) {
        this.setTint(0x00ffff);
      }
    });
  }
}

/**
 * Trophy - The iconic Dangerous Dave objective cup.
 */
export class Trophy extends Pickup {
  public readonly isReusable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'trophy');

    this.body.setSize(20, 20);
    this.body.setOffset(-2, -2);
    this.refreshBody();

    // Idle shine bob tween
    scene.tweens.add({
      targets: this,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: Phaser.Math.Easing.Sine.InOut,
    });
  }

  public onPlayerOverlap(player: Player, _time: number): void {
    player.collectTrophy();
    SoundManager.getInstance().playPickupTrophy();
    this.disableBody(true, true);
  }
}

/**
 * Gem - Score collectibles (Ruby, Sapphire, Crown).
 */
export type GemType = 'ruby' | 'sapphire' | 'crown' | 'pearl';

export class Gem extends Pickup {
  public readonly isReusable: boolean = false;
  public readonly gemType: GemType;

  constructor(scene: Phaser.Scene, x: number, y: number, gemType: GemType) {
    let texture = 'gem_ruby';
    if (gemType === 'sapphire') texture = 'gem_sapphire';
    if (gemType === 'crown') texture = 'gem_crown';
    if (gemType === 'pearl') texture = 'gem_pearl';

    super(scene, x, y, texture);
    this.gemType = gemType;
  }

  public onPlayerOverlap(player: Player, _time: number): void {
    let points = GAME_CONFIG.scores.ruby;
    if (this.gemType === 'sapphire') points = GAME_CONFIG.scores.sapphire;
    if (this.gemType === 'crown') points = GAME_CONFIG.scores.crown;
    if (this.gemType === 'pearl') points = GAME_CONFIG.scores.pearl;

    player.addScore(points);
    SoundManager.getInstance().playPickupGem();
    this.disableBody(true, true);
  }
}

/**
 * Jetpack - Equips Dave with jet propulsion fuel.
 */
export class JetpackPickup extends Pickup {
  public readonly isReusable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'item_jetpack');
  }

  public onPlayerOverlap(player: Player, _time: number): void {
    player.equipJetpack(GAME_CONFIG.player.maxFuel);
    SoundManager.getInstance().playPickupTrophy();
    this.disableBody(true, true);
  }
}

/**
 * Gun - Equips Dave with blaster pistol and bullets.
 */
export class GunPickup extends Pickup {
  public readonly isReusable: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'item_gun');
  }

  public onPlayerOverlap(player: Player, _time: number): void {
    player.equipGun(12);
    SoundManager.getInstance().playPickupTrophy();
    this.disableBody(true, true);
  }
}

/**
 * ExitDoor - Destination door that opens once the Trophy is acquired.
 */
export class ExitDoor extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  private _isOpen: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'door_closed');

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }

  public get isOpen(): boolean {
    return this._isOpen;
  }

  public open(): void {
    this._isOpen = true;
    this.setTexture('door_open');
  }
}
