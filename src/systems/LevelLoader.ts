import Phaser from 'phaser';
import { Player } from '../entities/Player';
import {
  GravitySwitch,
  GravitySwitchOptions,
  Trophy,
  Gem,
  JetpackPickup,
  GunPickup,
  ExitDoor,
} from '../entities/Pickup';
import { Hazard } from '../entities/Hazard';
import { Enemy } from '../entities/Enemy';
import { LevelDefinition } from '../data/levels';
import { OutfitType } from './TextureGenerator';

export interface LoadedLevel {
  readonly player: Player;
  readonly platforms: Phaser.Physics.Arcade.StaticGroup;
  readonly hazards: Phaser.Physics.Arcade.StaticGroup;
  readonly pickups: Phaser.Physics.Arcade.StaticGroup;
  readonly gravitySwitches: Phaser.Physics.Arcade.StaticGroup;
  readonly enemies: Phaser.Physics.Arcade.Group;
  readonly exitDoor: ExitDoor;
  readonly trophy: Trophy | null;
}

export class LevelLoader {
  private readonly scene: Phaser.Scene;
  private readonly tileSize: number = 16;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Builds platforms and spawns entities from an ASCII level definition.
   */
  public loadFromDefinition(levelDef: LevelDefinition, outfit: OutfitType = 'classic'): LoadedLevel {
    const platforms = this.scene.physics.add.staticGroup();
    const hazards = this.scene.physics.add.staticGroup();
    const pickups = this.scene.physics.add.staticGroup();
    const gravitySwitches = this.scene.physics.add.staticGroup();
    const enemies = this.scene.physics.add.group({ runChildUpdate: true });

    let player: Player | null = null;
    let exitDoor: ExitDoor | null = null;
    let trophy: Trophy | null = null;

    const map = levelDef.map;

    for (let row = 0; row < map.length; row++) {
      const line = map[row];
      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        const x = col * this.tileSize + this.tileSize / 2;
        const y = row * this.tileSize + this.tileSize / 2;

        switch (char) {
          case '#': {
            const brick = platforms.create(x, y, 'tile_brick');
            brick.refreshBody();
            break;
          }
          case 'R': {
            const red = platforms.create(x, y, 'tile_brick_red');
            red.refreshBody();
            break;
          }
          case 'P': {
            const isVertical =
              (row > 0 && map[row - 1][col] === 'P') ||
              (row < map.length - 1 && map[row + 1][col] === 'P');
            const pipeTexture = isVertical ? 'tile_pipe_v' : 'tile_pipe_h';
            const pipe = platforms.create(x, y, pipeTexture);
            pipe.refreshBody();
            break;
          }
          case 'B': {
            const girder = platforms.create(x, y, 'tile_girder');
            girder.refreshBody();
            break;
          }
          case 'F': {
            const fire = new Hazard(this.scene, x, y, 'fire');
            hazards.add(fire);
            break;
          }
          case 'A': {
            const acid = new Hazard(this.scene, x, y, 'acid');
            hazards.add(acid);
            break;
          }
          case 'S': {
            const spikes = new Hazard(this.scene, x, y, 'spikes');
            hazards.add(spikes);
            break;
          }
          case 'V': {
            const weed = new Hazard(this.scene, x, y, 'weed');
            hazards.add(weed);
            break;
          }
          case 'D': {
            // Align Dave's feet flush with the surface of the floor tile below him
            const floorTopY = (row + 1) * this.tileSize;
            const spawnY = floorTopY - 15;
            player = new Player(this.scene, x, spawnY, outfit);
            break;
          }
          case 'E': {
            exitDoor = new ExitDoor(this.scene, x, y - 4);
            break;
          }
          case 'T': {
            trophy = new Trophy(this.scene, x, y);
            pickups.add(trophy);
            break;
          }
          case '1': {
            const ruby = new Gem(this.scene, x, y, 'ruby');
            pickups.add(ruby);
            break;
          }
          case '2': {
            const sapphire = new Gem(this.scene, x, y, 'sapphire');
            pickups.add(sapphire);
            break;
          }
          case '3': {
            const crown = new Gem(this.scene, x, y, 'crown');
            pickups.add(crown);
            break;
          }
          case '4': {
            const pearl = new Gem(this.scene, x, y, 'pearl');
            pickups.add(pearl);
            break;
          }
          case 'G': {
            const gSwitch = new GravitySwitch(this.scene, x, y, 'gravity_switch_active');
            gravitySwitches.add(gSwitch);
            break;
          }
          case 'J': {
            const jp = new JetpackPickup(this.scene, x, y);
            pickups.add(jp);
            break;
          }
          case 'W': {
            const gun = new GunPickup(this.scene, x, y);
            pickups.add(gun);
            break;
          }
          case 'M': {
            const slime = new Enemy(this.scene, x, y, 64, 'slime');
            enemies.add(slime);
            break;
          }
          case 'X': {
            const spider = new Enemy(this.scene, x, y, 70, 'spider');
            enemies.add(spider);
            break;
          }
          case 'U': {
            const ceilSpider = new Enemy(this.scene, x, y, 0, 'ceiling_spider');
            enemies.add(ceilSpider);
            break;
          }
          case 'Y': {
            const bat = new Enemy(this.scene, x, y, 80, 'bat');
            enemies.add(bat);
            break;
          }
          default:
            break;
        }
      }
    }

    if (!player) {
      player = new Player(this.scene, 32, 200, outfit);
    }

    // Wire player reference to all enemies for interactive behavior
    enemies.children.each((child) => {
      const enemy = child as Enemy;
      enemy.setPlayerTarget(player!);
      return true;
    });

    if (!exitDoor) {
      exitDoor = new ExitDoor(this.scene, 400, 200);
    }

    return {
      player,
      platforms,
      hazards,
      pickups,
      gravitySwitches,
      enemies,
      exitDoor,
      trophy,
    };
  }

  public createGravitySwitch(
    x: number,
    y: number,
    options?: GravitySwitchOptions
  ): GravitySwitch {
    return new GravitySwitch(this.scene, x, y, 'gravity_switch_active', options);
  }
}
