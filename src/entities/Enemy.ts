import Phaser from 'phaser';
import { Player } from './Player';

export type EnemyType = 'slime' | 'spider' | 'ceiling_spider' | 'bat';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public declare body: Phaser.Physics.Arcade.Body;
  public readonly enemyType: EnemyType;

  private patrolSpeed: number = 35;
  private patrolDirection: number = 1; // 1 = right, -1 = left
  private minX: number;
  private maxX: number;
  private initialX: number;
  private initialY: number;

  // Green Slime interactive AI state
  private isAggro: boolean = false;
  private nextHopTime: number = 0;
  private aggroCooldownTime: number = 0;

  // Ceiling Spider state
  private ceilingState: 'IDLE' | 'DROPPING' | 'PAUSING' | 'RETRACTING' = 'IDLE';
  private ceilingPauseTimer: number = 0;
  private webLineGraphics?: Phaser.GameObjects.Graphics;

  // Bat flight state
  private isSwooping: boolean = false;
  private swoopTimer: number = 0;

  // Optional target reference
  private targetPlayer?: Player;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    patrolDistance: number = 64,
    enemyType: EnemyType = 'slime'
  ) {
    let initialTexture = 'monster_green_walk_1';
    if (enemyType === 'spider') initialTexture = 'spider_walk_1';
    if (enemyType === 'ceiling_spider') initialTexture = 'spider_hanging';
    if (enemyType === 'bat') initialTexture = 'bat_fly_1';

    super(scene, x, y, initialTexture);
    this.enemyType = enemyType;
    this.initialX = x;
    this.initialY = y;

    this.minX = x - patrolDistance / 2;
    this.maxX = x + patrolDistance / 2;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCollideWorldBounds(true);

    this.setupTypeProperties();
  }

  public setPlayerTarget(player: Player): void {
    this.targetPlayer = player;
  }

  private getPlayer(): Player | null {
    if (this.targetPlayer && this.targetPlayer.active) {
      return this.targetPlayer;
    }
    const scenePlayer = (this.scene as any).player as Player | undefined;
    if (scenePlayer && scenePlayer.active) {
      return scenePlayer;
    }
    return null;
  }

  private setupTypeProperties(): void {
    const levelIndex = (this.scene as any).levelIndex ?? 0;

    switch (this.enemyType) {
      case 'slime': {
        // Fair, gentle speed in early levels (Levels 1 & 2)
        this.patrolSpeed = levelIndex < 2 ? 24 : 32;
        this.body.setAllowGravity(true);
        // Generous hitbox (12x10, offset 2,6) so Dave can cleanly jump over
        this.body.setSize(12, 10);
        this.body.setOffset(2, 6);
        if (this.scene.anims.exists('monster_green_walk')) {
          this.play('monster_green_walk');
        }
        this.updateVelocity();
        break;
      }
      case 'spider': {
        this.patrolSpeed = levelIndex < 3 ? 45 : 60;
        this.body.setAllowGravity(true);
        this.body.setSize(12, 9);
        this.body.setOffset(2, 5);
        if (this.scene.anims.exists('spider_skitter')) {
          this.play('spider_skitter');
        }
        this.updateVelocity();
        break;
      }
      case 'ceiling_spider': {
        this.body.setAllowGravity(false);
        this.body.setSize(12, 11);
        this.body.setOffset(2, 3);
        this.setTexture('spider_hanging');
        this.webLineGraphics = this.scene.add.graphics();
        this.webLineGraphics.setDepth(this.depth - 1);
        this.drawWebLine();
        break;
      }
      case 'bat': {
        this.patrolSpeed = 42;
        this.body.setAllowGravity(false);
        this.body.setSize(12, 9);
        this.body.setOffset(2, 4);
        if (this.scene.anims.exists('bat_fly')) {
          this.play('bat_fly');
        }
        this.updateVelocity();
        break;
      }
    }
  }

  public override update(time: number = 0, delta: number = 0): void {
    if (!this.active || !this.body) return;

    switch (this.enemyType) {
      case 'slime':
        this.updateSlimeAI(time);
        break;
      case 'spider':
        this.updateSpiderAI();
        break;
      case 'ceiling_spider':
        this.updateCeilingSpiderAI(delta);
        break;
      case 'bat':
        this.updateBatAI(time, delta);
        break;
    }
  }

  /**
   * Balanced Green Slime AI:
   * - Fair and predictable in early levels (no hopping, gentle pace).
   * - Dave can cleanly jump over without pixel collisions.
   * - Telegraphed alert state so player has ample time to react.
   */
  private updateSlimeAI(time: number): void {
    const player = this.getPlayer();
    const levelIndex = (this.scene as any).levelIndex ?? 0;
    const isEarlyLevel = levelIndex < 2;

    if (player && !player.isDead) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const distH = Math.abs(dx);
      const distV = Math.abs(dy);

      // Detection radius: 70px in early levels, 110px in later levels
      const alertRadius = isEarlyLevel ? 70 : 110;
      if (distH <= alertRadius && distV <= 45) {
        if (!this.isAggro) {
          this.isAggro = true;
          this.triggerAlertEffect();
        }
        this.aggroCooldownTime = time + 1600;

        // Turn to pursue Dave at gentle speed
        this.patrolDirection = dx > 0 ? 1 : -1;
        this.setFlipX(this.patrolDirection < 0);
        const chaseSpeed = isEarlyLevel ? 36 : 58;
        this.setVelocityX(this.patrolDirection * chaseSpeed);

        // In Levels 1 and 2, NEVER hop! Let Dave jump over easily!
        if (!isEarlyLevel && time > this.nextHopTime && (this.body.blocked.down || this.body.touching.down)) {
          this.setVelocityY(-130);
          this.nextHopTime = time + 1800;
        }
        return;
      }
    }

    // Return to calm patrol if Dave moves away
    if (this.isAggro && time > this.aggroCooldownTime) {
      this.isAggro = false;
      this.clearTint();
    }

    this.handlePatrolBounds();
    this.setVelocityX(this.patrolSpeed * this.patrolDirection);
  }

  /**
   * Alert visual popup when Green Slime notices Dave
   */
  private triggerAlertEffect(): void {
    this.setTint(0xff8888);
    this.scene.time.delayedCall(400, () => {
      if (this.active) {
        this.setTint(this.isAggro ? 0xffaaaa : 0xffffff);
      }
    });

    const alertMark = this.scene.add.text(this.x, this.y - 14, '!', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '12px',
      color: '#ff2200',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(this.depth + 1);

    this.scene.tweens.add({
      targets: alertMark,
      y: alertMark.y - 10,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
      onComplete: () => alertMark.destroy(),
    });
  }

  /**
   * Red Arachnid Spider AI:
   * Fast predator that sprints and pounces when Dave is detected.
   */
  private updateSpiderAI(): void {
    const player = this.getPlayer();

    if (player && !player.isDead) {
      const dx = player.x - this.x;
      const distH = Math.abs(dx);
      const distV = Math.abs(player.y - this.y);

      if (distH <= 140 && distV <= 45) {
        // Sprinting charge
        this.patrolDirection = dx > 0 ? 1 : -1;
        this.setFlipX(this.patrolDirection < 0);
        this.setVelocityX(this.patrolDirection * 105);
        return;
      }
    }

    this.handlePatrolBounds();
    this.setVelocityX(this.patrolSpeed * this.patrolDirection);
  }

  /**
   * Ceiling Web-Dropper Spider AI:
   * Lurks high above, drops like a lightning bolt on silk thread to ambush Dave.
   */
  private updateCeilingSpiderAI(delta: number): void {
    const player = this.getPlayer();
    this.drawWebLine();

    switch (this.ceilingState) {
      case 'IDLE': {
        this.setVelocity(0, 0);
        if (player && !player.isDead) {
          const distH = Math.abs(player.x - this.x);
          const isBelow = player.y > this.y && player.y < this.initialY + 120;
          if (distH <= 38 && isBelow) {
            this.ceilingState = 'DROPPING';
          }
        }
        break;
      }
      case 'DROPPING': {
        this.setVelocityY(165);
        const maxDrop = this.initialY + 80;
        const reachedPlayer = player ? this.y >= player.y - 8 : false;
        if (this.y >= maxDrop || reachedPlayer || this.body.blocked.down) {
          this.setVelocityY(0);
          this.ceilingState = 'PAUSING';
          this.ceilingPauseTimer = 1100;
        }
        break;
      }
      case 'PAUSING': {
        this.setVelocity(0, 0);
        this.ceilingPauseTimer -= delta;
        if (this.ceilingPauseTimer <= 0) {
          this.ceilingState = 'RETRACTING';
        }
        break;
      }
      case 'RETRACTING': {
        this.setVelocityY(-75);
        if (this.y <= this.initialY) {
          this.y = this.initialY;
          this.setVelocityY(0);
          this.ceilingState = 'IDLE';
        }
        break;
      }
    }
  }

  private drawWebLine(): void {
    if (!this.webLineGraphics || !this.active) return;
    this.webLineGraphics.clear();
    this.webLineGraphics.lineStyle(1.5, 0xffffff, 0.75);
    this.webLineGraphics.lineBetween(this.initialX, this.initialY - 8, this.x, this.y);
  }

  /**
   * Flying Bat AI:
   * Sinusoidal aerial drift with swooping dive towards Dave.
   */
  private updateBatAI(time: number, delta: number): void {
    this.handlePatrolBounds();

    const player = this.getPlayer();
    if (player && !player.isDead && !this.isSwooping) {
      const distH = Math.abs(player.x - this.x);
      const isBelow = player.y > this.y && player.y < this.initialY + 100;
      if (distH <= 65 && isBelow) {
        this.isSwooping = true;
        this.swoopTimer = 800;
      }
    }

    const sineY = Math.sin(time * 0.005) * 14;
    let targetY = this.initialY + sineY;

    if (this.isSwooping) {
      targetY += 28; // Swoop down
      this.swoopTimer -= delta;
      if (this.swoopTimer <= 0) {
        this.isSwooping = false;
      }
    }

    this.y = Phaser.Math.Linear(this.y, targetY, 0.12);
    this.setVelocityX(this.patrolSpeed * this.patrolDirection);
  }

  private handlePatrolBounds(): void {
    if (this.x <= this.minX) {
      this.patrolDirection = 1;
      this.setFlipX(false);
    } else if (this.x >= this.maxX) {
      this.patrolDirection = -1;
      this.setFlipX(true);
    }
  }

  private updateVelocity(): void {
    this.setVelocityX(this.patrolSpeed * this.patrolDirection);
  }

  public reverseDirection(): void {
    this.patrolDirection *= -1;
    this.setFlipX(this.patrolDirection < 0);
    this.updateVelocity();
  }

  public die(): void {
    // 1. Particle Splatters by Enemy Type
    const particleKey =
      this.enemyType === 'slime'
        ? 'particle_slime'
        : this.enemyType === 'spider' || this.enemyType === 'ceiling_spider'
        ? 'particle_chitin'
        : 'particle_spark';

    for (let i = 0; i < 8; i++) {
      const p = this.scene.physics.add.sprite(this.x, this.y, particleKey);
      const angle = (Math.PI * 2 * i) / 8 + Phaser.Math.FloatBetween(-0.2, 0.2);
      const speed = Phaser.Math.Between(50, 140);
      p.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed - 40);
      p.body.setAllowGravity(true);
      p.setScale(Phaser.Math.FloatBetween(1, 1.6));

      this.scene.tweens.add({
        targets: p,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(350, 600),
        onComplete: () => p.destroy(),
      });
    }

    // 2. Floating +300 Score Popup
    const scoreColor =
      this.enemyType === 'slime'
        ? '#55ff55'
        : this.enemyType === 'spider' || this.enemyType === 'ceiling_spider'
        ? '#ff5555'
        : '#00ffff';

    const scorePopup = this.scene.add.text(this.x, this.y - 6, '+300', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '11px',
      color: scoreColor,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(110);

    this.scene.tweens.add({
      targets: scorePopup,
      y: scorePopup.y - 22,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => scorePopup.destroy(),
    });

    // 3. Cleanup graphics
    this.webLineGraphics?.destroy();
    this.destroy();
  }

  public override destroy(fromScene?: boolean): void {
    this.webLineGraphics?.destroy();
    super.destroy(fromScene);
  }
}
