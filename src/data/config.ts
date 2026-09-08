/**
 * Dangerous Dave v2 - Game Configuration
 * Centralized physics constants, gameplay tuning, and scoring.
 */

export interface PhysicsConfig {
  /** Default downward world gravity in pixels/sec^2 */
  readonly gravityY: number;
  /** Inverted upward world gravity in pixels/sec^2 */
  readonly invertedGravityY: number;
}

export interface PlayerPhysicsConfig {
  /** Horizontal acceleration rate in pixels/sec^2 */
  readonly moveAcceleration: number;
  /** Max horizontal running speed in pixels/sec */
  readonly maxVelocityX: number;
  /** Terminal fall / rise velocity in pixels/sec */
  readonly maxVelocityY: number;
  /** Horizontal drag/deceleration when no input is provided */
  readonly dragX: number;
  /** Initial jump velocity impulse (positive magnitude in pixels/sec) */
  readonly jumpVelocity: number;
  /** Inverted jump velocity impulse (downward launch in pixels/sec) */
  readonly invertedJumpVelocity: number;
  /** Minimum velocity sustained during a variable jump cut */
  readonly minJumpVelocity: number;
  /** Grace period after walking off a ledge (milliseconds) */
  readonly coyoteTimeMs: number;
  /** Pre-landing buffer window to register early jump taps (milliseconds) */
  readonly jumpBufferMs: number;
  /** Cooldown between gravity inversion toggles to prevent flickering (milliseconds) */
  readonly gravityToggleCooldownMs: number;
  /** Jetpack vertical thrust acceleration */
  readonly jetpackThrust: number;
  /** Max jetpack fuel capacity in units */
  readonly maxFuel: number;
  /** Fuel burn rate per second while active */
  readonly fuelBurnRate: number;
  /** Bullet speed in pixels/sec */
  readonly bulletSpeed: number;
  /** Starting Dave lives */
  readonly startingLives: number;
}

export interface ScoreConfig {
  readonly ruby: number;
  readonly sapphire: number;
  readonly crown: number;
  readonly pearl: number;
  readonly trophy: number;
  readonly monster: number;
}

export interface GameConfig {
  readonly physics: PhysicsConfig;
  readonly player: PlayerPhysicsConfig;
  readonly scores: ScoreConfig;
}

export const GAME_CONFIG: GameConfig = {
  physics: {
    gravityY: 980,
    invertedGravityY: -980,
  },
  player: {
    moveAcceleration: 600,
    maxVelocityX: 180,
    maxVelocityY: 600,
    dragX: 850,
    jumpVelocity: 390,
    invertedJumpVelocity: 390,
    minJumpVelocity: 120,
    coyoteTimeMs: 120,
    jumpBufferMs: 120,
    gravityToggleCooldownMs: 400,
    jetpackThrust: 450,
    maxFuel: 100,
    fuelBurnRate: 15,
    bulletSpeed: 400,
    startingLives: 3,
  },
  scores: {
    ruby: 100,
    sapphire: 150,
    crown: 500,
    pearl: 1000,
    trophy: 1000,
    monster: 300,
  },
} as const;
