import Phaser from 'phaser';
import { GAME_CONFIG } from './data/config';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { OptionsScene } from './scenes/OptionsScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { TransitionScene } from './scenes/TransitionScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 256,
  parent: 'game-container',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  antialiasGL: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container',
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GAME_CONFIG.physics.gravityY },
      debug: false,
    },
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    OptionsScene,
    TitleScene,
    GameScene,
    TransitionScene,
    GameOverScene,
    VictoryScene,
  ],
};

new Phaser.Game(config);
