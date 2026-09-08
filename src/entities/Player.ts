import Phaser from 'phaser';
import { GAME_CONFIG } from '../data/config';
import { SoundManager } from '../systems/SoundManager';
import { Bullet } from './Bullet';
import { OutfitType } from '../systems/TextureGenerator';

export interface PlayerInput {
  readonly left: boolean;
  readonly right: boolean;
  readonly up: boolean;
  readonly down: boolean;
  readonly jumpPressed: boolean;
  readonly jumpJustDown: boolean;
  readonly jumpJustUp: boolean;
  readonly shootJustDown: boolean;
  readonly jetpackPressed: boolean;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;

  /** Player Outfit */
  public outfit: OutfitType = 'classic';

  /**
   * Anti-Gravity state flag:
   * When true, Dave walks on the ceiling and jumps downward.
   */
  public isGravityInverted: boolean = false;

  /** Gameplay stats */
  private _score: number = 0;
  private _lives: number = GAME_CONFIG.player.startingLives; // Strict starting lives
  private _hasTrophy: boolean = false;
  private _fuel: number = 0;
  private _ammo: number = 0;
  private _isDead: boolean = false;
  private _isInvulnerable: boolean = false;

  /** Spawn coordinates for respawn */
  public spawnX: number;
  public spawnY: number;

  /** Callbacks */
  public onShootBullet?: (bullet: Bullet) => void;
  public onStateChange?: () => void;
  public onTrophyCollected?: () => void;
  public onDeath?: (remainingLives: number) => void;
  public onGravityToggle?: (isInverted: boolean) => void;

  /** Timestamp tracking the last time Dave was on a solid surface */
  private lastGroundedTime: number = 0;

  /** Timestamp tracking when jump was tapped (for jump buffering) */
  private lastJumpPressTime: number = 0;

  /** Timestamp tracking the last gravity toggle to prevent oscillation */
  private lastGravityToggleTime: number = 0;

  /** Tracks whether the player is executing a jump arc */
  private isJumping: boolean = false;

  /** Tracks whether using HD 64x64 sprite sheet */
  private isHDSprite: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, outfit: OutfitType = 'classic') {
    const hdKey = `dave_hd_${outfit}`;
    const hasHD = scene.textures.exists(hdKey) || scene.textures.exists('dave_hd');
    const initialTexture = scene.textures.exists(hdKey)
      ? hdKey
      : (scene.textures.exists('dave_hd') ? 'dave_hd' : `dave_${outfit}_idle`);

    super(scene, x, y, initialTexture);

    this.outfit = outfit;
    this.spawnX = x;
    this.spawnY = y;
    this.isHDSprite = hasHD;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.initPhysics();
  }

  private initPhysics(): void {
    this.setCollideWorldBounds(true);

    if (this.isHDSprite) {
      // Modern HD-2D: 64x64 texture scaled to 32x32 world units for crisp density
      this.setScale(0.5);
      // Soles are at y=62, cap top at y=12 (height=50).
      // body.bottom = sprite.y + 0.5 * (12 - 32 + 50) = sprite.y + 15.
      this.body.setSize(24, 50);
      this.body.setOffset(20, 12);
    } else {
      this.body.setSize(12, 22);
      this.body.setOffset(4, 2);
    }

    this.body.setMaxVelocity(
      GAME_CONFIG.player.maxVelocityX,
      GAME_CONFIG.player.maxVelocityY
    );
    this.body.setDragX(GAME_CONFIG.player.dragX);

    this.applyGravitySettings();
  }

  public setOutfit(outfit: OutfitType): void {
    this.outfit = outfit;
    const hdKey = `dave_hd_${outfit}`;
    if (this.isHDSprite && this.scene.textures.exists(hdKey)) {
      this.setTexture(hdKey);
    } else if (!this.isHDSprite) {
      this.setTexture(`dave_${outfit}_idle`);
    }
  }

  // --- Getters ---
  public get score(): number {
    return this._score;
  }
  public get lives(): number {
    return this._lives;
  }
  public get hasTrophy(): boolean {
    return this._hasTrophy;
  }
  public get fuel(): number {
    return this._fuel;
  }
  public get ammo(): number {
    return this._ammo;
  }
  public get isDead(): boolean {
    return this._isDead;
  }
  public get isInvulnerable(): boolean {
    return this._isInvulnerable;
  }

  // --- State Modifiers ---
  public setInitialLives(lives: number): void {
    this._lives = lives;
  }

  public setInitialScore(score: number): void {
    this._score = score;
  }

  public addScore(points: number): void {
    this._score += points;
    this.onStateChange?.();
  }

  public collectTrophy(): void {
    this._hasTrophy = true;
    this.addScore(GAME_CONFIG.scores.trophy);
    this.onTrophyCollected?.();
    this.onStateChange?.();
  }

  public equipJetpack(amount: number = GAME_CONFIG.player.maxFuel): void {
    this._fuel = Math.min(amount, GAME_CONFIG.player.maxFuel);
    this.onStateChange?.();
  }

  public equipGun(bullets: number = 12): void {
    this._ammo += bullets;
    this.onStateChange?.();
  }

  /**
   * Toggles or sets anti-gravity mode.
   * When triggered:
   * 1. Inverts player's gravity (setGravityY).
   * 2. Flips player sprite vertically (setFlipY).
   * 3. Inverts jump velocity to launch downward.
   * 4. Updates ground detection to check blocked.up.
   */
  public toggleGravity(force?: boolean, currentTime: number = this.scene.time.now): boolean {
    if (this._isDead) return false;
    if (currentTime - this.lastGravityToggleTime < GAME_CONFIG.player.gravityToggleCooldownMs) {
      return false;
    }

    const nextState = force !== undefined ? force : !this.isGravityInverted;
    if (nextState === this.isGravityInverted) {
      return false;
    }

    this.isGravityInverted = nextState;
    this.lastGravityToggleTime = currentTime;

    // Flip sprite vertically
    this.setFlipY(this.isGravityInverted);

    // Dynamic vertical body offset for anti-gravity
    if (this.isHDSprite) {
      // When inverted, shoes are at y = 2 in flipped texture
      this.body.setOffset(20, this.isGravityInverted ? 2 : 12);
    }

    // Invert player's gravity
    this.applyGravitySettings();

    // Reset grounded timestamp so coyote time doesn't falsely persist across inversion
    this.lastGroundedTime = 0;

    // Notify listeners (HUD screen flash, particle burst, sound)
    this.onGravityToggle?.(this.isGravityInverted);
    this.onStateChange?.();

    return true;
  }

  private applyGravitySettings(): void {
    const targetGravityY = this.isGravityInverted
      ? GAME_CONFIG.physics.invertedGravityY
      : GAME_CONFIG.physics.gravityY;

    const worldGravityY = this.scene.physics.world.gravity.y;
    this.body.setGravityY(targetGravityY - worldGravityY);
  }

  /**
   * Ground detection logic:
   * When gravity is inverted, ground is ceiling (blocked.up || touching.up).
   * When normal, ground is floor (blocked.down || touching.down).
   */
  public isGrounded(): boolean {
    if (this.isGravityInverted) {
      return this.body.blocked.up || this.body.touching.up;
    }
    return this.body.blocked.down || this.body.touching.down;
  }

  public override update(time: number, delta: number, input: PlayerInput): void {
    if (this._isDead) return;

    const grounded = this.isGrounded();

    if (grounded) {
      this.lastGroundedTime = time;
      this.isJumping = false;
    }

    // Jetpack priority controller
    if (input.jetpackPressed && this._fuel > 0) {
      this.handleJetpackFlight(delta);
    } else {
      this.handleJump(time, input, grounded);
    }

    this.handleHorizontalMovement(input, grounded);
    this.handleShooting(input);
  }

  private handleHorizontalMovement(input: PlayerInput, grounded: boolean): void {
    // 1. Determine direction and horizontal acceleration
    if (input.left) {
      this.setAccelerationX(-GAME_CONFIG.player.moveAcceleration);
      this.setFlipX(true);
    } else if (input.right) {
      this.setAccelerationX(GAME_CONFIG.player.moveAcceleration);
      this.setFlipX(false);
    } else {
      this.setAccelerationX(0);
      // Clean velocity deadzone to eliminate subpixel drift when idle
      if (Math.abs(this.body.velocity.x) < 8) {
        this.body.setVelocityX(0);
      }
    }

    // 2. Smooth Animation Controller (HD-2D or Retro fallback)
    const isMovingHoriz = input.left || input.right || Math.abs(this.body.velocity.x) > 10;

    const hdIdle = `dave_hd_${this.outfit}_idle`;
    const hdRun = `dave_hd_${this.outfit}_run`;
    const hdJump = `dave_hd_${this.outfit}_jump`;
    const hdFall = `dave_hd_${this.outfit}_fall`;

    const hasHDAnim = this.scene.anims.exists(hdIdle) || this.scene.anims.exists('dave_hd_idle');
    const targetIdle = this.scene.anims.exists(hdIdle) ? hdIdle : 'dave_hd_idle';
    const targetRun = this.scene.anims.exists(hdRun) ? hdRun : 'dave_hd_run';
    const targetJump = this.scene.anims.exists(hdJump) ? hdJump : 'dave_hd_jump';
    const targetFall = this.scene.anims.exists(hdFall) ? hdFall : 'dave_hd_fall';

    // Stable grounded state: Dave remains visually grounded if resting on floor or within brief collision buffer
    const animGrounded = grounded || (
      !this.isJumping &&
      !input.jetpackPressed &&
      (this.scene.time.now - this.lastGroundedTime < 100) &&
      Math.abs(this.body.velocity.y) < 60
    );

    if (this.isHDSprite && hasHDAnim) {
      if (animGrounded) {
        if (isMovingHoriz) {
          if (this.anims.currentAnim?.key !== targetRun) {
            this.play(targetRun);
          }
        } else {
          if (this.anims.currentAnim?.key !== targetIdle) {
            this.play(targetIdle);
          }
        }
      } else {
        // Airborne: Jump vs Fall detection
        const vy = this.body.velocity.y;
        const isRising = this.isGravityInverted ? vy > 30 : vy < -30;
        const targetAnim = isRising ? targetJump : targetFall;

        if (this.anims.currentAnim?.key !== targetAnim) {
          this.play(targetAnim);
        }
      }
    } else {
      // Retro outfit animation fallback
      const walkAnim = `dave_${this.outfit}_walk`;
      const idleTex = `dave_${this.outfit}_idle`;
      const jumpTex = `dave_${this.outfit}_jump`;

      if (grounded) {
        if (isMovingHoriz) {
          if (!this.anims.isPlaying || this.anims.currentAnim?.key !== walkAnim) {
            this.play(walkAnim);
          }
        } else {
          this.stop();
          this.setTexture(idleTex);
        }
      } else {
        this.stop();
        this.setTexture(jumpTex);
      }
    }
  }

  private handleJetpackFlight(delta: number): void {
    const dt = delta / 1000;
    this._fuel = Math.max(0, this._fuel - GAME_CONFIG.player.fuelBurnRate * dt);
    this.onStateChange?.();

    const thrust = GAME_CONFIG.player.jetpackThrust;
    this.body.setVelocityY(this.isGravityInverted ? thrust : -thrust);

    SoundManager.getInstance().playJetpack();

    if (Math.random() < 0.4) {
      const pY = this.isGravityInverted ? this.y - 8 : this.y + 10;
      const smoke = this.scene.add.sprite(this.x, pY, 'particle_spark');
      this.scene.tweens.add({
        targets: smoke,
        alpha: 0,
        y: this.isGravityInverted ? pY - 10 : pY + 10,
        duration: 200,
        onComplete: () => smoke.destroy(),
      });
    }
  }

  private handleJump(time: number, input: PlayerInput, _grounded: boolean): void {
    if (input.jumpJustDown) {
      this.lastJumpPressTime = time;
    }

    const hasBufferedJump = time - this.lastJumpPressTime <= GAME_CONFIG.player.jumpBufferMs;
    const withinCoyoteTime = time - this.lastGroundedTime <= GAME_CONFIG.player.coyoteTimeMs;

    if (hasBufferedJump && withinCoyoteTime && !this.isJumping) {
      this.executeJump();
      this.lastJumpPressTime = 0;
      this.lastGroundedTime = 0;
    }

    if (input.jumpJustUp && this.isJumping) {
      this.cutJumpHeight();
    }
  }

  private executeJump(): void {
    this.isJumping = true;
    SoundManager.getInstance().playJump(this.isGravityInverted);

    if (this.isGravityInverted) {
      // Invert jump velocity to launch downward toward the floor
      this.body.setVelocityY(GAME_CONFIG.player.invertedJumpVelocity);
    } else {
      // Normal jump launches upward toward the ceiling
      this.body.setVelocityY(-GAME_CONFIG.player.jumpVelocity);
    }
  }

  private cutJumpHeight(): void {
    const minVel = GAME_CONFIG.player.minJumpVelocity;

    if (this.isGravityInverted) {
      if (this.body.velocity.y > minVel) {
        this.body.setVelocityY(minVel);
      }
    } else {
      if (this.body.velocity.y < -minVel) {
        this.body.setVelocityY(-minVel);
      }
    }
  }

  private handleShooting(input: PlayerInput): void {
    if (input.shootJustDown && this._ammo > 0) {
      this._ammo--;
      this.onStateChange?.();

      SoundManager.getInstance().playShoot();
      const dir = this.flipX ? 'left' : 'right';
      const bulletX = dir === 'right' ? this.x + 12 : this.x - 12;
      const bullet = new Bullet(this.scene, bulletX, this.y, dir);

      this.onShootBullet?.(bullet);
    }
  }

  public die(): void {
    if (this._isDead || this._isInvulnerable) return;

    this._isDead = true;
    this._lives--;
    this.onStateChange?.();

    SoundManager.getInstance().playDie();

    this.setVisible(false);
    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(false);

    for (let i = 0; i < 8; i++) {
      const spark = this.scene.add.sprite(this.x, this.y, 'particle_spark');
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 70 + Math.random() * 50;

      this.scene.tweens.add({
        targets: spark,
        x: this.x + Math.cos(angle) * speed * 0.4,
        y: this.y + Math.sin(angle) * speed * 0.4,
        alpha: 0,
        scale: 2,
        duration: 350,
        onComplete: () => spark.destroy(),
      });
    }

    this.onDeath?.(this._lives);

    if (this._lives > 0) {
      this.scene.time.delayedCall(1200, () => {
        this.respawn();
      });
    }
  }

  public respawn(): void {
    this._isDead = false;
    this._isInvulnerable = true;
    this.isGravityInverted = false;

    this.setPosition(this.spawnX, this.spawnY);
    this.setVisible(true);
    this.setFlipY(false);

    if (this.isHDSprite) {
      this.body.setOffset(20, 12);
    }

    this.body.setVelocity(0, 0);
    this.body.setAllowGravity(true);
    this.applyGravitySettings();

    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 8,
      onComplete: () => {
        this.setAlpha(1);
        this._isInvulnerable = false;
      },
    });
  }
}
