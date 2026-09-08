/**
 * Dangerous Dave 2.0 - 10 Handcrafted Levels with Thematic Backgrounds, Branching Paths & Monsters.
 * Grid size: 30 cols x 16 rows.
 *
 * Legend:
 * # : Solid Red Brick Wall
 * P : Metallic Industrial Pipe (Horizontal / Vertical Walkways)
 * B : Magenta Metallic Girder Platform (Catwalks & Bridges)
 * F : Fire Hazard
 * A : Toxic Acid Hazard
 * S : Spikes Hazard
 * V : Wavy Purple Weed Hazard (Classic Tendrils)
 * D : Dave Spawn
 * E : Exit Door
 * T : Golden Trophy
 * 1 : Ruby Gem (+100)
 * 2 : Sapphire Gem (+150)
 * 3 : Crown (+500)
 * 4 : Glowing Purple Pearl (+1000)
 * G : Gravity Switch (Inverts Gravity)
 * J : Jetpack Pickup
 * W : Weapon / Gun Pickup
 * M : Interactive Green Slime Goblin (Proximity alert, aggressive hop & stalk)
 * X : Red Arachnid Spider (Fast skittering ground predator)
 * U : Ceiling Web-Dropper Spider (Ambush dropper on silk thread)
 * Y : Flying Bat / Void Gargoyle (Sinusoidal flier with dive swoop)
 * . : Empty Space
 */

export interface LevelDefinition {
  readonly id: number;
  readonly name: string;
  readonly subtitle: string;
  readonly backgroundKey: string;
  readonly map: string[];
}

export const LEVELS: LevelDefinition[] = [
  // Level 1: THE RED BRICK LAIR (2 Green Slimes)
  {
    id: 1,
    name: 'THE RED BRICK LAIR',
    subtitle: 'Choose your path: High girder catwalks or the lower monster gauntlet!',
    backgroundKey: 'bg_level_1',
    map: [
      '##############################',
      '#............................#',
      '#...4........................#',
      '#..###....BBBBB...........T..#',
      '#.......................######',
      '#.........1.....2............#',
      '#..W....BBBBB.#####..........#',
      '#..###.......................#',
      '#...................BBBB.....#',
      '#.......M....................#',
      '#....#######.................#',
      '#............................#',
      '#............3............E..#',
      '#..D.........1..........######',
      '########FFF#####FFF###########',
      '##############################',
    ],
  },

  // Level 2: THE PIPEWORKS & GIRDERS (Green Slime + Red Spider)
  {
    id: 2,
    name: 'THE PIPEWORKS & GIRDERS',
    subtitle: 'Climb the pipe ladders to girder bridges, or brave the weed pit below.',
    backgroundKey: 'bg_level_2',
    map: [
      '##############################',
      '#............................#',
      '#..4..........X......T.......#',
      '#..###....BBBBBB...#####.....#',
      '#....P...................P...#',
      '#....P..2........BBBB....P...#',
      '#....P.####..............P...#',
      '#....P.......M...........P...#',
      '#....PPPPPP#####.........P...#',
      '#...W....................P.E.#',
      '#..####.........2.......######',
      '#...........BBBBB............#',
      '#............................#',
      '#..D.......1..........3......#',
      '########FFFF####VVV###########',
      '##############################',
    ],
  },

  // Level 3: ANTI-GRAVITY CHAMBER (Flying Bat + Green Slime + Red Spider)
  {
    id: 3,
    name: 'ANTI-GRAVITY CHAMBER',
    subtitle: 'Acid and weeds flood the floor! Walk the ceiling or hop girder stones.',
    backgroundKey: 'bg_level_3',
    map: [
      '##############################',
      '#....G....................G..#',
      '#.......S......4......S......#',
      '#...........#######..........#',
      '#...2.........T..........E...#',
      '#..####.....#####..Y....######',
      '#...................X........#',
      '#......BBBBB.....BBBBB.......#',
      '#............................#',
      '#...........M................#',
      '#....W....#####.......3......#',
      '#..####.............#####....#',
      '#............................#',
      '#..D.G....................G..#',
      '######AAAAAAVVVVVAAAAAA#######',
      '##############################',
    ],
  },

  // Level 4: THE SUNSET COLUMNS (Ceiling Spider + Red Spider + Green Slime)
  {
    id: 4,
    name: 'THE SUNSET COLUMNS',
    subtitle: 'Multi-chamber brick pillars and girder catwalks over hazard chasms.',
    backgroundKey: 'bg_level_4',
    map: [
      '##############################',
      '#....#...U....#........#.....#',
      '#....#...4....#....T...#.....#',
      '#....#.BBBBB..#..BBBB..#..E..#',
      '#....#........#........#.#####',
      '#..B.#........#........#.....#',
      '#....#..BBBB..#........#.....#',
      '#....#........#...X....#.....#',
      '#....#........#.BBBBB..#..B..#',
      '#....#..M2....#........#.....#',
      '#.####.#####..#.#####..#.#####',
      '#....#........#...3....#.....#',
      '#....#..W.....#........#.....#',
      '#..D.........................#',
      '######VVVVV#####FFFFFF###AAAA#',
      '##############################',
    ],
  },

  // Level 5: THE GIRDER GAUNTLET (2 Red Spiders + Green Slime)
  {
    id: 5,
    name: 'THE GIRDER GAUNTLET',
    subtitle: 'High girder catwalks cross deep pits of fire and creeping weeds.',
    backgroundKey: 'bg_level_5',
    map: [
      '##############################',
      '#............................#',
      '#............T..........4....#',
      '#...2......BBBBB......#####..#',
      '#..###..............M........#',
      '#......BBBBB......BBBBB...E..#',
      '#.......................######',
      '#..W.........X...............#',
      '#..###.....#####...BBBBB.....#',
      '#......X.....................#',
      '#....PPPPPP..................#',
      '#.........P.......3..........#',
      '#.........P.....#####........#',
      '#..D...G..P...............1..#',
      '########VVVV####FFFF####AAAA##',
      '##############################',
    ],
  },

  // Level 6: JETPACK ASCENT (2 Flying Bats + Red Spider)
  {
    id: 6,
    name: 'JETPACK ASCENT',
    subtitle: 'Pilot the jetpack through pipe shafts or master precision girder hops.',
    backgroundKey: 'bg_level_6',
    map: [
      '##############################',
      '#...................4........#',
      '#...E.............#####...T..#',
      '#..####...Y.............######',
      '#.........BBBBBB.............#',
      '#.............Y..............#',
      '#....PPPPPPPPPP......2.......#',
      '#.............P....#####.....#',
      '#...J.........P.....X........#',
      '#..####.......P...BBBBB......#',
      '#.......S.....P..............#',
      '#......###....P.......3......#',
      '#.............P.....#####....#',
      '#..D..........P..............#',
      '########SSSS####VVVV####AAAA##',
      '##############################',
    ],
  },

  // Level 7: THE WEED MAZE & PEARL VAULT (2 Red Spiders + Ceiling Spider + Green Slime)
  {
    id: 7,
    name: 'THE WEED MAZE & PEARL VAULT',
    subtitle: 'Winding brick labyrinth: brave the weed trench for 1000pt pearls!',
    backgroundKey: 'bg_level_7',
    map: [
      '##############################',
      '#..U.........................#',
      '#....................T....E..#',
      '#..W......1.....2..#####.#####',
      '#.####..#####.#####..........#',
      '#...................BBBB.....#',
      '#...#####.#####...X..........#',
      '#.#...........#..............#',
      '#.#..#####....#.#####........#',
      '#.#......#....#..............#',
      '#.#.##...#.##.#.......3......#',
      '#.#......#....#...X.#####....#',
      '#........#..4.#..4.......4...#',
      '#..D.M...#....#..............#',
      '########VVV###VVV###VVV#######',
      '##############################',
    ],
  },

  // Level 8: THE DUAL-GRAVITY LABYRINTH (Flying Bat + Red Spider + Green Slime)
  {
    id: 8,
    name: 'THE DUAL-GRAVITY LABYRINTH',
    subtitle: 'Invert between ceiling and floor to evade deadly traps and monsters.',
    backgroundKey: 'bg_level_8',
    map: [
      '##############################',
      '#...G.....................G..#',
      '#..........F.......F.........#',
      '#...T.....................E..#',
      '#.#####...BBBBB.BBBBB...######',
      '#..............Y.............#',
      '#...1...................4....#',
      '#..###........X........#####.#',
      '#......BBBBB.#####.BBBBB.....#',
      '#............................#',
      '#...W...............3........#',
      '#..####...G....M..#####......#',
      '#.......#####................#',
      '#..D......................G..#',
      '######VVVVV#####AAAAA#########',
      '##############################',
    ],
  },

  // Level 9: THE SKYWAY PIPES & GIRDERS (2 Flying Bats + Red Spider)
  {
    id: 9,
    name: 'THE SKYWAY PIPES & GIRDERS',
    subtitle: 'High-altitude industrial conduits, girder spans, and jetpack skyways.',
    backgroundKey: 'bg_level_9',
    map: [
      '##############################',
      '#............................#',
      '#..E.................T.......#',
      '#..###....BBBB....#######....#',
      '#...4Y...P....P..............#',
      '#........P....PPPPPP..2......#',
      '#..###...P.........P.####....#',
      '#........PPPP......P...Y.....#',
      '#...J.......P......PPPP......#',
      '#..###......P.........P......#',
      '#........X..P.........P...4..#',
      '#......#####P.........P..###.#',
      '#...W.......P.........P......#',
      '#..D........1.........P..3...#',
      '#######FFFF#####AAAAA###VVVV##',
      '##############################',
    ],
  },

  // Level 10: THE MASTER VAULT (All 4 Monster Types!)
  {
    id: 10,
    name: 'THE MASTER VAULT',
    subtitle: 'The ultimate trial: combine Anti-Gravity, Jetpack, and Gun to triumph!',
    backgroundKey: 'bg_level_10',
    map: [
      '##############################',
      '#....G...................UG..#',
      '#............4...............#',
      '#..E......................T..#',
      '#.####...BBBBBBBBBB.....######',
      '#............Y...............#',
      '#...........X................#',
      '#.........#####.......3......#',
      '#...J...............#####....#',
      '#..###...PPPPPPPP............#',
      '#..W....M.......P...2........#',
      '#...............P..####......#',
      '#.#.....BBBB....P............#',
      '#..D...4........PPPPPP.4..G..#',
      '#######AAAAFFFFFFFFFAAAAAAA###',
      '##############################',
    ],
  },
];
