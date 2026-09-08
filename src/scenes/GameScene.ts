import Phaser from 'phaser';
import { Player, PlayerInput } from '../entities/Player';
import { GravitySwitch, ExitDoor, Pickup } from '../entities/Pickup';
import { Hazard } from '../entities/Hazard';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { LevelLoader, LoadedLevel } from '../systems/LevelLoader';
import { LEVELS } from '../data/levels';
import { HUD } from '../ui/HUD';
import { SoundManager } from '../systems/SoundManager';
import { OutfitType } from '../systems/TextureGenerator';

export interface GameSceneData {
  readonly levelIndex?: number;
  readonly score?: number;
  readonly lives?: number;
  readonly outfit?: OutfitType;
}

export class GameScene extends Phaser.Scene {
  private levelIndex: number = 0;
  private currentScore: number = 0;
  private currentLives: number = 3;
  private currentOutfit: OutfitType = 'classic';
  private player!: Player;
  private hud!: HUD;
  private loadedLevel!: LoadedLevel;
  private bulletsGroup!: Phaser.Physics.Arcade.Group;

  // Input keys
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private jumpKey!: Phaser.Input.Keyboard.Key;
  private shootKeyCtrl!: Phaser.Input.Keyboard.Key;
  private shootKeyX!: Phaser.Input.Keyboard.Key;
  private jetKeyShift!: Phaser.Input.Keyboard.Key;
  private jetKeyAlt!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyF!: Phaser.Input.Keyboard.Key;

  private isLevelTransitioning: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(data: GameSceneData): void {
    this.levelIndex = data.levelIndex ?? 0;
    this.currentScore = data.score ?? 0;
    this.currentLives = data.lives ?? 3;
    this.currentOutfit = data.outfit ?? 'classic';
    this.isLevelTransitioning = false;
  }

  public create(): void {
    const currentLevelDef = LEVELS[this.levelIndex];
    if (!currentLevelDef) {
      this.scene.start('VictoryScene', { finalScore: this.currentScore, outfit: this.currentOutfit });
      return;
    }

    // 1. Double-Layer Background System (Inspired by reference screenshot)
    // Layer 1: Far Horizon / Sky Backdrop
    const bgKey = currentLevelDef.backgroundKey || 'bg_level_1';
    this.add.image(240, 128, bgKey).setScrollFactor(0.08).setDepth(-30);

    // Industrial skyline silhouette on outdoor ruin and castle levels
    if ([0, 3, 5, 8, 9].includes(this.levelIndex)) {
      const skyline = this.add.image(240, 240, 'bg_ruin_skyline');
      skyline.setOrigin(0.5, 1).setScrollFactor(0.18).setDepth(-25).setAlpha(0.6);
    }

    // Layer 2: Mid-ground Recessed Interior Cavern Wall (Retro brick framing)
    const innerWall = this.add.tileSprite(240, 128, 480, 256, 'bg_recessed_wall');
    innerWall.setScrollFactor(0.22).setDepth(-18).setAlpha(0.76);

    // Ambient floating dust motes / glowing embers
    for (let i = 0; i < 8; i++) {
      const ember = this.add.sprite(
        Phaser.Math.Between(20, 460),
        Phaser.Math.Between(40, 220),
        'particle_ember'
      ).setAlpha(0.5).setDepth(-5);

      this.tweens.add({
        targets: ember,
        y: '-=30',
        x: '+=15',
        alpha: 0.1,
        duration: Phaser.Math.Between(2500, 4500),
        repeat: -1,
        yoyo: true,
      });
    }

    // 2. Setup Controls
    this.setupInput();

    // 3. Load Level Geometry & Entities
    const loader = new LevelLoader(this);
    this.loadedLevel = loader.loadFromDefinition(currentLevelDef, this.currentOutfit);
    this.player = this.loadedLevel.player;
    this.player.setInitialScore(this.currentScore);
    this.player.setInitialLives(this.currentLives);

    // Spawn ambient rising fire embers over all fire hazard tiles
    this.loadedLevel.hazards.children.each((child) => {
      const h = child as Hazard;
      if (h.hazardType === 'fire') {
        const ember = this.add.sprite(
          h.x + Phaser.Math.Between(-5, 5),
          h.y - Phaser.Math.Between(2, 6),
          'particle_ember'
        ).setAlpha(0.7).setScale(Phaser.Math.FloatBetween(0.8, 1.2)).setDepth(h.depth + 1);

        this.tweens.add({
          targets: ember,
          y: ember.y - Phaser.Math.Between(14, 24),
          x: ember.x + Phaser.Math.Between(-4, 4),
          alpha: 0,
          scale: 0.3,
          duration: Phaser.Math.Between(800, 1400),
          repeat: -1,
          delay: Phaser.Math.Between(0, 800),
        });
      }
      return true;
    });

    // Bullets Physics Group
    this.bulletsGroup = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.player.onShootBullet = (bullet: Bullet) => {
      this.bulletsGroup.add(bullet);
    };

    // 4. Initialize HUD with outfit life heads
    this.hud = new HUD(this, this.currentOutfit);
    this.syncHUD();
    this.hud.showBanner(currentLevelDef.name, 2500, '#00ffff');

    // Wire player state changes to HUD
    this.player.onGravityToggle = (isInverted: boolean) => {
      this.hud.onGravityChanged(isInverted);
    };

    this.player.onStateChange = () => {
      this.currentScore = this.player.score;
      this.currentLives = this.player.lives;
      this.syncHUD();
      if (this.player.hasTrophy && !this.loadedLevel.exitDoor.isOpen) {
        this.loadedLevel.exitDoor.open();
        this.hud.showBanner('🏆 GO THRU THE DOOR! 🏆', 4000, '#55ff55');
      }
    };

    this.player.onDeath = (remainingLives: number) => {
      this.currentLives = remainingLives;
      this.syncHUD();
      if (remainingLives <= 0) {
        this.time.delayedCall(1200, () => {
          this.scene.start('GameOverScene', {
            finalScore: this.player.score,
            levelIndex: this.levelIndex,
          });
        });
      } else {
        const msg = remainingLives === 1 ? 'DAVE LOST A LIFE! (1 LIFE LEFT)' : `DAVE LOST A LIFE! (${remainingLives} LIVES LEFT)`;
        this.hud.showBanner(msg, 1800, '#ff2222');
      }
    };

    // 5. Setup Physics Collisions
    this.setupCollisions();

    // 6. Camera setup
    this.cameras.main.setBounds(0, 0, 480, 256);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.physics.world.setBounds(0, 0, 480, 256);
  }

  private setupInput(): void {
    if (!this.input.keyboard) {
      throw new Error('Keyboard plugin missing');
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.shootKeyCtrl = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    this.shootKeyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.jetKeyShift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.jetKeyAlt = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ALT);

    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    this.input.keyboard.on('keydown-M', () => {
      const isMuted = SoundManager.getInstance().toggleMute();
      this.hud.showBanner(isMuted ? 'AUDIO MUTED' : 'AUDIO UNMUTED', 1000);
    });

    const toggleFS = (): void => {
      this.scale.toggleFullscreen();
    };
    this.keyF.on('down', toggleFS);

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'Enter') {
        toggleFS();
      }
    });
  }

  private setupCollisions(): void {
    const { platforms, hazards, pickups, gravitySwitches, enemies, exitDoor } = this.loadedLevel;

    // Dave vs Platforms (red bricks, blue bricks, pipes)
    this.physics.add.collider(this.player, platforms);

    // Enemies vs Platforms
    this.physics.add.collider(enemies, platforms, (enemyObj) => {
      const enemy = enemyObj as Enemy;
      if (enemy.body.blocked.left || enemy.body.blocked.right) {
        enemy.reverseDirection();
      }
    });

    // Dave vs Pickups (Trophy, Gems, Jetpack, Gun)
    this.physics.add.overlap(this.player, pickups, (_playerObj, pickupObj) => {
      const pickup = pickupObj as Pickup;
      pickup.onPlayerOverlap(this.player, this.time.now);
    });

    // Dave vs Gravity Switches
    this.physics.add.overlap(this.player, gravitySwitches, (_playerObj, switchObj) => {
      const gSwitch = switchObj as GravitySwitch;
      const prevInverted = this.player.isGravityInverted;
      gSwitch.onPlayerOverlap(this.player, this.time.now);
      if (prevInverted !== this.player.isGravityInverted) {
        this.hud.onGravityChanged(this.player.isGravityInverted);
        this.hud.showBanner(
          this.player.isGravityInverted ? 'ANTI-GRAVITY ACTIVATED!' : 'NORMAL GRAVITY RESTORED!',
          2000,
          this.player.isGravityInverted ? '#ff007f' : '#00d4ff'
        );
      }
    });

    // Dave vs Hazards (Fire, Acid, Spikes)
    this.physics.add.overlap(this.player, hazards, (_playerObj, _hazardObj) => {
      const h = _hazardObj as Hazard;
      this.handlePlayerHazardCollision(h);
    });

    // Dave vs Enemies (monsters kill on touch)
    this.physics.add.overlap(this.player, enemies, (_playerObj, _enemyObj) => {
      this.player.die();
    });

    // Bullets vs Platforms
    this.physics.add.collider(this.bulletsGroup, platforms, (bulletObj) => {
      const bullet = bulletObj as Bullet;
      bullet.hitWall();
    });

    // Bullets vs Enemies (One-shot kill, +300 points)
    this.physics.add.overlap(this.bulletsGroup, enemies, (bulletObj, enemyObj) => {
      const bullet = bulletObj as Bullet;
      const enemy = enemyObj as Enemy;
      bullet.hitEnemy();
      enemy.die();
      this.player.addScore(300);
      SoundManager.getInstance().playEnemyHit();
    });

    // Bullets vs Gravity Switches (Remote Triggering!)
    this.physics.add.overlap(this.bulletsGroup, gravitySwitches, (bulletObj, switchObj) => {
      const bullet = bulletObj as Bullet;
      const gSwitch = switchObj as GravitySwitch;
      bullet.hitWall();
      const prevInverted = this.player.isGravityInverted;
      gSwitch.onPlayerOverlap(this.player, this.time.now);
      if (prevInverted !== this.player.isGravityInverted) {
        this.hud.onGravityChanged(this.player.isGravityInverted);
        this.hud.showBanner(
          this.player.isGravityInverted ? 'SWITCH TRIGGERED REMOTELY!' : 'NORMAL GRAVITY RESTORED!',
          1500,
          this.player.isGravityInverted ? '#ff007f' : '#00d4ff'
        );
      }
    });

    // Dave vs Exit Door
    this.physics.add.overlap(this.player, exitDoor, (_playerObj, doorObj) => {
      const door = doorObj as ExitDoor;
      this.handleDoorOverlap(door);
    });
  }

  private handlePlayerHazardCollision(_hazard: Hazard): void {
    if (this.player.isDead || this.player.isInvulnerable) return;
    this.player.die();
  }

  private handleDoorOverlap(door: ExitDoor): void {
    if (this.isLevelTransitioning) return;

    if (door.isOpen) {
      this.isLevelTransitioning = true;
      SoundManager.getInstance().playWin();
      this.hud.showBanner('LEVEL CLEAR!', 1500, '#ffff00');

      this.time.delayedCall(700, () => {
        const nextIndex = this.levelIndex + 1;
        if (nextIndex < LEVELS.length) {
          // Launch the iconic corridor transition scene
          this.scene.start('TransitionScene', {
            nextLevelIndex: nextIndex,
            score: this.player.score,
            lives: this.player.lives,
            totalLevels: LEVELS.length,
            outfit: this.currentOutfit,
          });
        } else {
          // All 10 levels conquered!
          this.scene.start('VictoryScene', { finalScore: this.player.score, outfit: this.currentOutfit });
        }
      });
    } else {
      this.hud.showBanner('COLLECT THE TROPHY FIRST!', 1000, '#ffaa00');
    }
  }

  private syncHUD(): void {
    if (!this.player || !this.hud) return;
    this.hud.updateStats(
      this.player.score,
      this.levelIndex + 1,
      this.player.lives,
      this.player.fuel,
      this.player.ammo,
      this.player.isGravityInverted
    );
  }

  public override update(time: number, delta: number): void {
    if (!this.player || !this.cursors) return;

    const left = this.cursors.left.isDown || this.keyA.isDown;
    const right = this.cursors.right.isDown || this.keyD.isDown;
    const up = this.cursors.up.isDown || this.keyW.isDown;
    const down = this.cursors.down.isDown || this.keyS.isDown;
    const jumpPressed = this.cursors.up.isDown || this.jumpKey.isDown || this.keyW.isDown;
    const jumpJustDown =
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.jumpKey) ||
      Phaser.Input.Keyboard.JustDown(this.keyW);
    const jumpJustUp =
      Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
      Phaser.Input.Keyboard.JustUp(this.jumpKey) ||
      Phaser.Input.Keyboard.JustUp(this.keyW);

    const shootJustDown =
      Phaser.Input.Keyboard.JustDown(this.shootKeyCtrl) ||
      Phaser.Input.Keyboard.JustDown(this.shootKeyX);

    const jetpackPressed =
      (this.jetKeyShift.isDown || this.jetKeyAlt.isDown) && this.player.fuel > 0;

    const inputPayload: PlayerInput = {
      left,
      right,
      up,
      down,
      jumpPressed,
      jumpJustDown,
      jumpJustUp,
      shootJustDown,
      jetpackPressed,
    };

    this.player.update(time, delta, inputPayload);
  }
}
