import Phaser from 'phaser';
import { UI_THEME } from './UITheme';
import { SoundManager } from '../systems/SoundManager';

export type ButtonVariant = 'primary' | 'secondary';

export interface UIButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  icon?: string;
  variant?: ButtonVariant;
  isIconOnly?: boolean;
  pulseGlow?: boolean;
  fontSize?: string;
  onClick: () => void;
}

export class UIButton extends Phaser.GameObjects.Container {
  private readonly configWidth: number;
  private readonly configHeight: number;
  private readonly variant: ButtonVariant;
  private readonly isIconOnly: boolean;
  private readonly onClickCallback: () => void;

  private bgGraphics: Phaser.GameObjects.Graphics;
  private glowGraphics?: Phaser.GameObjects.Graphics;
  private labelText: Phaser.GameObjects.Text;

  private pulseTween?: Phaser.Tweens.Tween;
  private isHovered: boolean = false;
  private isPressed: boolean = false;
  private isDisabled: boolean = false;

  constructor(scene: Phaser.Scene, config: UIButtonConfig) {
    super(scene, config.x, config.y);

    this.configWidth = config.width;
    this.configHeight = config.height;
    this.variant = config.variant ?? 'secondary';
    this.isIconOnly = config.isIconOnly ?? false;
    this.onClickCallback = config.onClick;

    // Optional outer glow for primary variant
    if (this.variant === 'primary' || config.pulseGlow) {
      this.glowGraphics = scene.add.graphics();
      this.add(this.glowGraphics);
    }

    // Main background rounded rectangle
    this.bgGraphics = scene.add.graphics();
    this.add(this.bgGraphics);

    // Text label or Icon
    const defaultFontSize = this.isIconOnly
      ? '13px'
      : this.variant === 'primary'
      ? '13px'
      : '10.5px';

    const fontSize = config.fontSize ?? defaultFontSize;
    const initialText = this.isIconOnly
      ? (config.icon ?? '')
      : `${config.icon ? config.icon + ' ' : ''}${config.text ?? ''}`;

    this.labelText = scene.add.text(0, 0, initialText, {
      fontFamily: UI_THEME.fonts.ui,
      fontSize,
      fontStyle: this.variant === 'primary' ? 'bold' : 'normal',
      color: this.variant === 'primary' ? UI_THEME.colors.primaryText : UI_THEME.colors.secondaryText,
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, fill: true },
      align: 'center',
    }).setOrigin(0.5);

    this.add(this.labelText);

    this.setSize(this.configWidth, this.configHeight);
    this.setInteractive({ useHandCursor: true });

    this.redrawBackground();
    this.setupInteractions();

    if (config.pulseGlow && this.variant === 'primary') {
      this.startPulseGlow();
    }

    scene.add.existing(this);
  }

  private redrawBackground(): void {
    const w = this.configWidth;
    const h = this.configHeight;
    const radius = this.isIconOnly
      ? UI_THEME.radii.buttonIcon
      : this.variant === 'primary'
      ? UI_THEME.radii.buttonPrimary
      : UI_THEME.radii.buttonSecondary;

    this.bgGraphics.clear();

    if (this.variant === 'primary') {
      const bgColor = this.isHovered
        ? UI_THEME.colors.primaryBgHover
        : UI_THEME.colors.primaryBg;
      const borderColor = this.isHovered
        ? UI_THEME.colors.primaryBorderHover
        : UI_THEME.colors.primaryBorder;

      // Fill
      this.bgGraphics.fillStyle(bgColor, 0.92);
      this.bgGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, radius);

      // Cyan accent rim
      this.bgGraphics.lineStyle(this.isHovered ? 2 : 1.5, borderColor, 0.95);
      this.bgGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);

      // Subtle top inner highlight
      this.bgGraphics.lineStyle(1, 0xffffff, this.isHovered ? 0.35 : 0.2);
      this.bgGraphics.beginPath();
      this.bgGraphics.moveTo(-w / 2 + radius, -h / 2 + 1);
      this.bgGraphics.lineTo(w / 2 - radius, -h / 2 + 1);
      this.bgGraphics.strokePath();

      if (this.glowGraphics) {
        this.glowGraphics.clear();
        this.glowGraphics.fillStyle(UI_THEME.colors.accent, this.isHovered ? 0.22 : 0.12);
        this.glowGraphics.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, radius + 2);
      }
    } else if (this.isIconOnly) {
      // Pixel-Art Styled Utility Button (Sharp corners, authentic retro border)
      const bgColor = this.isHovered
        ? UI_THEME.colors.secondaryBgHover
        : UI_THEME.colors.secondaryBg;
      const borderColor = this.isHovered
        ? UI_THEME.colors.accent
        : UI_THEME.colors.secondaryBorder;

      // Dark solid fill
      this.bgGraphics.fillStyle(bgColor, 0.95);
      this.bgGraphics.fillRect(-w / 2, -h / 2, w, h);

      // Pixel border
      this.bgGraphics.lineStyle(1, borderColor, this.isHovered ? 1.0 : 0.8);
      this.bgGraphics.strokeRect(-w / 2, -h / 2, w, h);

      // Pixel-art beveled inner top-left highlight & bottom-right shadow
      if (this.isHovered) {
        this.bgGraphics.lineStyle(1, 0x67e8f9, 0.7);
        this.bgGraphics.beginPath();
        this.bgGraphics.moveTo(-w / 2 + 1, h / 2 - 2);
        this.bgGraphics.lineTo(-w / 2 + 1, -h / 2 + 1);
        this.bgGraphics.lineTo(w / 2 - 2, -h / 2 + 1);
        this.bgGraphics.strokePath();
      }
    } else {
      // Secondary Variant (Neutral Dark Slate Panel Button)
      const bgColor = this.isHovered
        ? UI_THEME.colors.secondaryBgHover
        : UI_THEME.colors.secondaryBg;
      const borderColor = this.isHovered
        ? UI_THEME.colors.secondaryBorderHover
        : UI_THEME.colors.secondaryBorder;

      this.bgGraphics.fillStyle(bgColor, 0.92);
      this.bgGraphics.fillRoundedRect(-w / 2, -h / 2, w, h, radius);

      this.bgGraphics.lineStyle(this.isHovered ? 1.5 : 1, borderColor, this.isHovered ? 0.95 : 0.7);
      this.bgGraphics.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
    }
  }

  private setupInteractions(): void {
    this.on('pointerover', () => {
      if (this.isDisabled) return;
      this.isHovered = true;
      this.redrawBackground();

      this.labelText.setColor(
        this.variant === 'primary'
          ? UI_THEME.colors.primaryTextHover
          : UI_THEME.colors.secondaryTextHover
      );

      this.scene.tweens.add({
        targets: this,
        scaleX: UI_THEME.transitions.hoverScale,
        scaleY: UI_THEME.transitions.hoverScale,
        duration: UI_THEME.transitions.durationMs,
        ease: 'Sine.easeOut',
      });
    });

    this.on('pointerout', () => {
      if (this.isDisabled) return;
      this.isHovered = false;
      this.isPressed = false;
      this.redrawBackground();

      this.labelText.setColor(
        this.variant === 'primary'
          ? UI_THEME.colors.primaryText
          : UI_THEME.colors.secondaryText
      );

      this.scene.tweens.add({
        targets: this,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: UI_THEME.transitions.durationMs,
        ease: 'Sine.easeOut',
      });
    });

    this.on('pointerdown', () => {
      if (this.isDisabled) return;
      this.isPressed = true;
      SoundManager.getInstance().playChirp();

      this.scene.tweens.add({
        targets: this,
        scaleX: UI_THEME.transitions.pressScale,
        scaleY: UI_THEME.transitions.pressScale,
        duration: 80,
        ease: 'Sine.easeOut',
      });
    });

    this.on('pointerup', () => {
      if (this.isDisabled || !this.isPressed) return;
      this.isPressed = false;

      this.scene.tweens.add({
        targets: this,
        scaleX: this.isHovered ? UI_THEME.transitions.hoverScale : 1.0,
        scaleY: this.isHovered ? UI_THEME.transitions.hoverScale : 1.0,
        duration: 100,
        ease: 'Sine.easeOut',
        onComplete: () => {
          this.onClickCallback();
        },
      });
    });
  }

  public setText(text: string): void {
    this.labelText.setText(text);
  }

  public setIcon(icon: string): void {
    this.labelText.setText(icon);
  }

  public getLabel(): Phaser.GameObjects.Text {
    return this.labelText;
  }

  public startPulseGlow(): void {
    if (!this.glowGraphics) {
      this.glowGraphics = this.scene.add.graphics();
      this.addAt(this.glowGraphics, 0);
    }

    if (this.pulseTween) {
      this.pulseTween.stop();
    }

    this.pulseTween = this.scene.tweens.add({
      targets: this.glowGraphics,
      alpha: 0.35,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  public stopPulseGlow(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = undefined;
    }
    if (this.glowGraphics) {
      this.glowGraphics.setAlpha(0.12);
    }
  }

  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    this.setAlpha(disabled ? 0.45 : 1.0);
  }
}
