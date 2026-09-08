import Phaser from 'phaser';
import { OutfitType } from '../systems/TextureGenerator';

export class HUD {
  private readonly scene: Phaser.Scene;
  private outfit: OutfitType = 'classic';
  private scoreText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private davesLabel!: Phaser.GameObjects.Text;
  private daveHeadIcons: Phaser.GameObjects.Sprite[] = [];

  // Dynamic Gravity State Indicator
  private gravityBadgeBg!: Phaser.GameObjects.Graphics;
  private gravityArrowIcon!: Phaser.GameObjects.Text;
  private gravityLabelText!: Phaser.GameObjects.Text;
  private gravityContainer!: Phaser.GameObjects.Container;
  private isAntiGravity: boolean = false;

  private jetpackBar!: Phaser.GameObjects.Graphics;
  private jetpackLabel!: Phaser.GameObjects.Text;
  private gunText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private bannerTween?: Phaser.Tweens.Tween;
  private fullscreenText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, outfit: OutfitType = 'classic') {
    this.scene = scene;
    this.outfit = outfit;
    this.createUI();
  }

  public setOutfit(outfit: OutfitType): void {
    this.outfit = outfit;
  }

  private createUI(): void {
    const fontStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '10.5px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    };

    // 1. Sleek Modern Glassmorphic Top Bar
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x060814, 0.92);
    bg.fillRect(0, 0, 480, 22);
    bg.setScrollFactor(0);
    bg.setDepth(100);

    // Neon Cyber Trim Bar
    const neonTrim = this.scene.add.graphics();
    neonTrim.fillStyle(0x00d4ff, 0.9);
    neonTrim.fillRect(0, 21, 480, 2);
    neonTrim.setScrollFactor(0);
    neonTrim.setDepth(100);

    // 2. Score Text
    this.scoreText = this.scene.add.text(6, 4, 'SCORE: 00000', fontStyle);
    this.scoreText.setResolution(2.5).setScrollFactor(0).setDepth(101);

    // 3. Level Text (ends around x=156)
    this.levelText = this.scene.add.text(84, 4, 'LEVEL: 01/10', fontStyle);
    this.levelText.setResolution(2.5).setScrollFactor(0).setDepth(101);

    // 4. Dave Lives Section (DAVES starts at x=172, creating 16px clean gap after '10')
    this.davesLabel = this.scene.add.text(172, 4, 'DAVES:', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '10.5px',
      color: '#00ff66',
      stroke: '#000000',
      strokeThickness: 2.5,
    });
    this.davesLabel.setResolution(2.5).setScrollFactor(0).setDepth(101);

    // 5. Dynamic Gravity State UI Indicator (Arrow + Badge)
    this.createGravityIndicator();

    // 6. Gun Ammo Text
    this.gunText = this.scene.add.text(384, 4, '', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '10.5px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.gunText.setResolution(2.5).setScrollFactor(0).setDepth(101);

    // 7. Jetpack Gauge
    this.jetpackLabel = this.scene.add.text(418, 4, 'JET:', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '10px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.jetpackLabel.setResolution(2.5).setScrollFactor(0).setDepth(101).setVisible(false);

    this.jetpackBar = this.scene.add.graphics();
    this.jetpackBar.setScrollFactor(0).setDepth(101);

    // 8. Fullscreen Toggle Button
    this.fullscreenText = this.scene.add.text(476, 4, '[⛶]', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '10.5px',
      color: '#00ffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(1, 0).setResolution(2.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });

    this.fullscreenText.on('pointerdown', () => {
      this.scene.scale.toggleFullscreen();
    });

    // 9. Center Notification Banner
    this.bannerText = this.scene.add.text(240, 36, '', {
      fontFamily: 'monospace, "Courier New"',
      fontSize: '13px',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 4,
    });
    this.bannerText.setOrigin(0.5, 0).setResolution(2.5).setScrollFactor(0).setDepth(102);
  }

  private createGravityIndicator(): void {
    const badgeX = 338;
    const badgeY = 11;

    this.gravityContainer = this.scene.add.container(badgeX, badgeY);
    this.gravityContainer.setScrollFactor(0).setDepth(101);

    this.gravityBadgeBg = this.scene.add.graphics();
    this.drawGravityBadge(false);

    this.gravityArrowIcon = this.scene.add.text(-28, 0, '▼', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '9.5px',
      color: '#00d4ff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    // Crystal-clear typography without glyph-choking stroke
    this.gravityLabelText = this.scene.add.text(5, 0, 'GRAVITY: 1G', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '8.5px',
      fontStyle: 'bold',
      color: '#00d4ff',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
    }).setOrigin(0.5);

    this.gravityContainer.add([this.gravityBadgeBg, this.gravityArrowIcon, this.gravityLabelText]);
  }

  private drawGravityBadge(isAntiG: boolean): void {
    this.gravityBadgeBg.clear();
    const w = 80;
    const h = 16;

    // Dark pill container with neon outline
    const bgColor = isAntiG ? 0x22051a : 0x051422;
    const borderColor = isAntiG ? 0xff007f : 0x00d4ff;

    this.gravityBadgeBg.fillStyle(bgColor, 0.92);
    this.gravityBadgeBg.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    this.gravityBadgeBg.lineStyle(1.2, borderColor, 0.95);
    this.gravityBadgeBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
  }

  /**
   * Called when player toggles gravity state.
   * Flips the indicator, changes colors to magenta/blue, and triggers screen flash + particle burst.
   */
  public onGravityChanged(isAntiG: boolean): void {
    if (this.isAntiGravity === isAntiG) return;
    this.isAntiGravity = isAntiG;

    // 1. Redraw badge styling & update text
    this.drawGravityBadge(isAntiG);

    const activeColor = isAntiG ? '#ff007f' : '#00d4ff';
    const arrowSymbol = isAntiG ? '▲' : '▼';
    const labelText = isAntiG ? 'ANTI-GRAV' : 'GRAVITY: 1G';

    this.gravityArrowIcon.setText(arrowSymbol);
    this.gravityArrowIcon.setColor(activeColor);
    this.gravityLabelText.setText(labelText);
    this.gravityLabelText.setColor(activeColor);

    // 2. Smooth flip / punch animation on indicator
    this.scene.tweens.add({
      targets: this.gravityContainer,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
    });

    // 3. Screen Flash effect
    if (isAntiG) {
      // Vivid magenta flash for anti-gravity
      this.scene.cameras.main.flash(220, 255, 0, 150, true);
    } else {
      // Cyan flash for normal gravity
      this.scene.cameras.main.flash(180, 0, 210, 255, true);
    }

    // 4. UI Particle Burst radiating outward from indicator
    this.triggerParticleBurst(this.gravityContainer.x, this.gravityContainer.y, isAntiG ? 0xff007f : 0x00d4ff);
  }

  private triggerParticleBurst(originX: number, originY: number, tintColor: number): void {
    const particleCount = 18;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Phaser.Math.Between(40, 110);
      const spark = this.scene.add.sprite(originX, originY, 'particle_spark');
      spark.setScrollFactor(0).setDepth(110);
      spark.setTint(tintColor);
      spark.setScale(1.4);

      this.scene.tweens.add({
        targets: spark,
        x: originX + Math.cos(angle) * speed,
        y: originY + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(300, 480),
        ease: 'Cubic.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  public updateStats(
    score: number,
    level: number,
    lives: number,
    fuel: number,
    ammo: number,
    isGravityInverted?: boolean
  ): void {
    const formattedScore = score.toString().padStart(5, '0');
    this.scoreText.setText(`SCORE: ${formattedScore}`);

    const formattedLevel = level.toString().padStart(2, '0');
    this.levelText.setText(`LEVEL: ${formattedLevel}/10`);

    // Display all active Dave lives as head icons (3 lives = 3 Dave heads)
    for (const head of this.daveHeadIcons) {
      head.destroy();
    }
    this.daveHeadIcons = [];

    const startX = this.davesLabel.x + this.davesLabel.width + 6;
    const hdHeadKey = `dave_hd_head_${this.outfit}`;
    const isHDHead = this.scene.textures.exists(hdHeadKey);
    const headTexture = isHDHead ? hdHeadKey : `dave_head_${this.outfit}`;

    // Render Dave head icons larger and fitted (~19px height in 22px bar)
    for (let i = 0; i < lives; i++) {
      const head = this.scene.add.sprite(startX + i * 21, 11, headTexture);
      if (isHDHead) {
        // 32x32 HD sprite scaled to ~19px
        head.setScale(0.58);
      } else {
        // 16x16 retro sprite scaled to ~19px
        head.setScale(1.20);
      }
      head.setOrigin(0, 0.5);
      head.setScrollFactor(0);
      head.setDepth(101);
      this.daveHeadIcons.push(head);
    }

    // Sync Gravity State Indicator if provided
    if (isGravityInverted !== undefined && isGravityInverted !== this.isAntiGravity) {
      this.onGravityChanged(isGravityInverted);
    }

    // Weapon Ammo Counter
    if (ammo > 0) {
      this.gunText.setText(`GUN: ${ammo}`);
      this.gunText.setVisible(true);
    } else {
      this.gunText.setVisible(false);
    }

    // Jetpack Gauge
    this.jetpackBar.clear();
    if (fuel > 0) {
      this.jetpackLabel.setVisible(true);
      const barWidth = 26;
      const barHeight = 8;
      const x = 444;
      const y = 6;

      this.jetpackBar.fillStyle(0x222233, 1);
      this.jetpackBar.fillRect(x, y, barWidth, barHeight);

      const fillWidth = (fuel / 100) * barWidth;
      this.jetpackBar.fillStyle(fuel < 25 ? 0xff2200 : 0x00ffff, 1);
      this.jetpackBar.fillRect(x, y, fillWidth, barHeight);
    } else {
      this.jetpackLabel.setVisible(false);
    }
  }

  public showBanner(text: string, durationMs: number = 2000, color: string = '#ffff00'): void {
    if (this.bannerTween) {
      this.bannerTween.stop();
    }

    this.bannerText.setText(text);
    this.bannerText.setColor(color);
    this.bannerText.setAlpha(1);

    this.bannerTween = this.scene.tweens.add({
      targets: this.bannerText,
      alpha: 0,
      duration: 400,
      delay: durationMs,
      ease: 'Power2',
    });
  }
}
