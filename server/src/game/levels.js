/**
 * LEVELS — All level data.
 * Each level defines: platforms, switches, hazards, doors, spawnPoint, bounds.
 *
 * Coordinate system:
 *   x=0,y=0 = top-left of level
 *   y increases downward
 *   Typical playfield: 1600 × 900
 */

const LEVELS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 1 — BASICS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w1_l1",
    world: 1,
    name: "First Steps",
    description: "Get everyone to the exit. Simple as that.",
    spawnPoint: { x: 100, y: 650 },
    bounds: { top: -300, bottom: 1000 },
    exitText: "Just walk!",

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 300,  height: 30, type: "static" },
      { id: 2,  x: 350,  y: 700, width: 200,  height: 30, type: "static" },
      { id: 3,  x: 620,  y: 700, width: 200,  height: 30, type: "static" },
      { id: 4,  x: 900,  y: 700, width: 200,  height: 30, type: "static" },
      { id: 5,  x: 1180, y: 700, width: 300,  height: 30, type: "static" },
      // Floor connection
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [],
    hazards: [],

    doors: [
      { id: 1, x: 1450, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  {
    id: "w1_l2",
    world: 1,
    name: "Stack Attack",
    description: "One platform is too high. You'll need a friend.",
    spawnPoint: { x: 100, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 300,  height: 30, type: "static" },
      { id: 2,  x: 350,  y: 700, width: 200,  height: 30, type: "static" },
      { id: 3,  x: 620,  y: 500, width: 200,  height: 30, type: "static" }, // high ledge
      { id: 4,  x: 900,  y: 500, width: 200,  height: 30, type: "static" },
      { id: 5,  x: 1180, y: 500, width: 300,  height: 30, type: "static" },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [],
    hazards: [],

    doors: [
      { id: 1, x: 1440, y: 410, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  {
    id: "w1_l3",
    world: 1,
    name: "The Switch",
    description: "Someone hold the switch, others get through.",
    spawnPoint: { x: 80, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 250,  height: 30, type: "static" },
      { id: 2,  x: 350,  y: 700, width: 600,  height: 30, type: "static" },
      { id: 3,  x: 1050, y: 700, width: 430,  height: 30, type: "static" },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [
      { id: 1, x: 400, y: 672, width: 60, height: 28, targetId: 1, requiresCount: 1, type: "pressure", timedReset: 0 },
    ],

    hazards: [],

    doors: [
      { id: 1, x: 285, y: 620, width: 60, height: 80, isOpen: false, isExit: false, linkedSwitchId: 1 }, // gate in middle
      { id: 2, x: 1440, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 2 — TIMING
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w2_l1",
    world: 2,
    name: "Moving Day",
    description: "Platforms don't wait for you.",
    spawnPoint: { x: 80, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 200,  height: 30, type: "static" },
      { id: 2,  x: 300,  y: 650, width: 120,  height: 20, type: "moving", speed: 120, range: 200, direction: 1, axis: "x", startX: 300, startY: 650 },
      { id: 3,  x: 700,  y: 600, width: 120,  height: 20, type: "moving", speed: 90,  range: 150, direction: -1, axis: "x", startX: 700, startY: 600 },
      { id: 4,  x: 1050, y: 650, width: 120,  height: 20, type: "moving", speed: 140, range: 180, direction: 1, axis: "x", startX: 1050, startY: 650 },
      { id: 5,  x: 1380, y: 700, width: 200,  height: 30, type: "static" },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [],
    hazards: [],

    doors: [
      { id: 1, x: 1480, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  {
    id: "w2_l2",
    world: 2,
    name: "Spike Hop",
    description: "Time your jumps. Don't blame us for the spikes.",
    spawnPoint: { x: 80, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 200,  height: 30, type: "static" },
      { id: 2,  x: 250,  y: 700, width: 80,   height: 20, type: "static" },
      { id: 3,  x: 430,  y: 700, width: 80,   height: 20, type: "static" },
      { id: 4,  x: 610,  y: 700, width: 80,   height: 20, type: "static" },
      { id: 5,  x: 790,  y: 700, width: 80,   height: 20, type: "static" },
      { id: 6,  x: 970,  y: 700, width: 80,   height: 20, type: "static" },
      { id: 7,  x: 1150, y: 700, width: 80,   height: 20, type: "static" },
      { id: 8,  x: 1350, y: 700, width: 230,  height: 30, type: "static" },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [],

    hazards: [
      { id: 1, x: 340,  y: 660, width: 80,  height: 40, type: "spike", active: true },
      { id: 2, x: 520,  y: 660, width: 80,  height: 40, type: "spike", active: true },
      { id: 3, x: 700,  y: 660, width: 80,  height: 40, type: "spike", active: true },
      { id: 4, x: 880,  y: 660, width: 80,  height: 40, type: "spike", active: true },
      { id: 5, x: 1060, y: 660, width: 80,  height: 40, type: "spike", active: true },
      { id: 6, x: 1240, y: 660, width: 80,  height: 40, type: "spike", active: true },
    ],

    doors: [
      { id: 1, x: 1480, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  {
    id: "w2_l3",
    world: 2,
    name: "Conveyor Chaos",
    description: "Try walking. Then try not walking. Then cry.",
    spawnPoint: { x: 80, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 200, height: 30, type: "static" },
      { id: 2,  x: 200,  y: 700, width: 300, height: 30, type: "conveyor", speed: 2 },   // pushes right
      { id: 3,  x: 500,  y: 700, width: 200, height: 30, type: "static" },
      { id: 4,  x: 700,  y: 700, width: 300, height: 30, type: "conveyor", speed: -2 }, // pushes left
      { id: 5,  x: 1000, y: 700, width: 200, height: 30, type: "static" },
      { id: 6,  x: 1200, y: 700, width: 300, height: 30, type: "conveyor", speed: 2 },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [],

    hazards: [
      { id: 1, x: 690, y: 660, width: 20, height: 40, type: "spike", active: true },
      { id: 2, x: 990, y: 660, width: 20, height: 40, type: "spike", active: true },
    ],

    doors: [
      { id: 1, x: 1490, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 3 — MOMENTUM
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w3_l1",
    world: 3,
    name: "Ice Ice Baby",
    description: "Friction is a privilege, not a right.",
    spawnPoint: { x: 80, y: 450 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 500, width: 300, height: 30, type: "static" },
      { id: 2,  x: 300,  y: 500, width: 400, height: 30, type: "ice" },
      { id: 3,  x: 700,  y: 500, width: 100, height: 30, type: "static" },
      { id: 4,  x: 800,  y: 500, width: 400, height: 30, type: "ice" },
      { id: 5,  x: 1200, y: 500, width: 100, height: 30, type: "static" },
      { id: 6,  x: 1300, y: 500, width: 300, height: 30, type: "ice" },
      // Lower floor with spikes below ice
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [],

    hazards: [
      { id: 1, x: 300,  y: 461, width: 400, height: 20, type: "spike", active: true },
      { id: 2, x: 800,  y: 461, width: 400, height: 20, type: "spike", active: true },
      { id: 3, x: 1300, y: 461, width: 300, height: 20, type: "spike", active: true },
    ],

    doors: [
      { id: 1, x: 1530, y: 410, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  {
    id: "w3_l2",
    world: 3,
    name: "Falling Together",
    description: "Don't stand still. Or do. Watch what happens.",
    spawnPoint: { x: 80, y: 450 },
    bounds: { top: -300, bottom: 1200 },

    platforms: [
      { id: 1,  x: 0,    y: 500, width: 200, height: 30, type: "static" },
      { id: 2,  x: 250,  y: 500, width: 150, height: 20, type: "falling" },
      { id: 3,  x: 450,  y: 500, width: 150, height: 20, type: "falling" },
      { id: 4,  x: 650,  y: 500, width: 150, height: 20, type: "falling" },
      { id: 5,  x: 850,  y: 500, width: 150, height: 20, type: "falling" },
      { id: 6,  x: 1050, y: 500, width: 150, height: 20, type: "falling" },
      { id: 7,  x: 1250, y: 500, width: 150, height: 20, type: "falling" },
      { id: 8,  x: 1450, y: 500, width: 150, height: 30, type: "static" },
      { id: 10, x: 0,    y: 900, width: 1600, height: 40, type: "static" },
    ],

    switches: [],
    hazards: [
      { id: 1, x: 0, y: 861, width: 1600, height: 20, type: "spike", active: true },
    ],

    doors: [
      { id: 1, x: 1500, y: 410, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 4 — SYNCHRONIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w4_l1",
    world: 4,
    name: "Two Button Problem",
    description: "Two switches. Both must be held. Simultaneously.",
    spawnPoint: { x: 80, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 1600, height: 30, type: "static" },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [
      { id: 1, x: 200,  y: 672, width: 60, height: 28, targetId: 1, requiresCount: 1, type: "pressure", timedReset: 0 },
      { id: 2, x: 900,  y: 672, width: 60, height: 28, targetId: 2, requiresCount: 1, type: "pressure", timedReset: 0 },
    ],

    hazards: [],

    doors: [
      { id: 1, x: 540,  y: 610, width: 60, height: 80, isOpen: false, isExit: false, linkedSwitchId: 1 },
      { id: 2, x: 1200, y: 610, width: 60, height: 80, isOpen: false, isExit: false, linkedSwitchId: 2 },
      { id: 3, x: 1480, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  {
    id: "w4_l2",
    world: 4,
    name: "Timed Release",
    description: "Switches reset after 3 seconds. Coordinate your crossing.",
    spawnPoint: { x: 80, y: 650 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 700, width: 300, height: 30, type: "static" },
      { id: 2,  x: 700,  y: 700, width: 400, height: 30, type: "static" },
      { id: 3,  x: 1400, y: 700, width: 200, height: 30, type: "static" },
      { id: 10, x: 0,    y: 880, width: 1600, height: 40, type: "static" },
    ],

    switches: [
      { id: 1, x: 200, y: 672, width: 60, height: 28, targetId: 1, requiresCount: 1, type: "pressure", timedReset: 3000 },
    ],

    hazards: [
      { id: 1, x: 300, y: 660, width: 400, height: 40, type: "spike", active: true },
    ],

    doors: [
      { id: 1, x: 596, y: 610, width: 60, height: 80, isOpen: false, isExit: false, linkedSwitchId: 1 },
      { id: 2, x: 1480, y: 610, width: 60, height: 80, isOpen: true, isExit: true, linkedSwitchId: -1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 5 — CHAOS
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w5_l1",
    world: 5,
    name: "Everything At Once",
    description: "Moving platforms. Spikes. Lasers. Switches. Have fun.",
    spawnPoint: { x: 80, y: 750 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 800, width: 200, height: 30, type: "static" },
      { id: 2,  x: 280,  y: 750, width: 120, height: 20, type: "moving", speed: 100, range: 180, direction: 1, axis: "x", startX: 280, startY: 750 },
      { id: 3,  x: 650,  y: 700, width: 120, height: 20, type: "moving", speed: 80,  range: 120, direction: 1, axis: "y", startX: 650, startY: 700 },
      { id: 4,  x: 950,  y: 750, width: 120, height: 20, type: "conveyor", speed: -2 },
      { id: 5,  x: 1150, y: 750, width: 200, height: 20, type: "falling" },
      { id: 6,  x: 1400, y: 800, width: 200, height: 30, type: "static" },
      { id: 10, x: 0,    y: 900, width: 1600, height: 40, type: "static" },
    ],

    switches: [
      { id: 1, x: 1430, y: 772, width: 60, height: 28, targetId: 1, requiresCount: 2, type: "pressure", timedReset: 5000 },
    ],

    hazards: [
      { id: 1, x: 490,  y: 711, width: 160, height: 16, type: "laser", period: 2000, phase: 0 },
      { id: 2, x: 840,  y: 711, width: 16,  height: 80, type: "laser", period: 3000, phase: 1000 },
    ],

    doors: [
      { id: 1, x: 1490, y: 700, width: 60, height: 80, isOpen: false, isExit: true, linkedSwitchId: 1 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 6 — PRECISION COORDINATION
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w6_l1",
    world: 6,
    name: "Tower of Trust",
    description: "Someone stands. Someone climbs. Nobody breathes.",
    spawnPoint: { x: 80, y: 750 },
    bounds: { top: -300, bottom: 1000 },

    platforms: [
      { id: 1,  x: 0,    y: 800, width: 200, height: 30, type: "static" },
      { id: 2,  x: 300,  y: 800, width: 100, height: 20, type: "static" }, // stepping stone, hard jump
      { id: 3,  x: 600,  y: 600, width: 200, height: 30, type: "static" }, // high ledge
      { id: 4,  x: 900,  y: 800, width: 500, height: 30, type: "static" },
      { id: 5,  x: 1450, y: 800, width: 150, height: 30, type: "static" },
      { id: 10, x: 0,    y: 900, width: 1600, height: 40, type: "static" },
    ],

    switches: [
      { id: 1, x: 950,  y: 772, width: 60, height: 28, targetId: 1, requiresCount: 1, type: "pressure", timedReset: 0 },
      { id: 2, x: 1100, y: 772, width: 60, height: 28, targetId: 2, requiresCount: 1, type: "pressure", timedReset: 0 },
    ],

    hazards: [
      { id: 1, x: 200,  y: 760, width: 100, height: 40, type: "spike", active: true },
      { id: 2, x: 400,  y: 760, width: 200, height: 40, type: "spike", active: true },
      { id: 3, x: 800,  y: 560, width: 100, height: 40, type: "spike", active: true },
    ],

    doors: [
      { id: 1, x: 700,  y: 510, width: 60, height: 80, isOpen: false, isExit: false, linkedSwitchId: 1 },
      { id: 2, x: 1450, y: 710, width: 60, height: 80, isOpen: false, isExit: true, linkedSwitchId: 2 },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WORLD 7 — INSANITY
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: "w7_l1",
    world: 7,
    name: "Beautiful Disaster",
    description: "All mechanics. Maximum chaos. Good luck.",
    spawnPoint: { x: 80, y: 750 },
    bounds: { top: -300, bottom: 1100 },

    platforms: [
      // Left base
      { id: 1,  x: 0,    y: 800, width: 200, height: 30, type: "static" },
      // Moving gauntlet
      { id: 2,  x: 280,  y: 760, width: 100, height: 20, type: "moving", speed: 130, range: 200, direction: 1, axis: "x", startX: 280, startY: 760 },
      { id: 3,  x: 600,  y: 720, width: 100, height: 20, type: "moving", speed: 100, range: 120, direction: 1, axis: "y", startX: 600, startY: 720 },
      // Ice slide
      { id: 4,  x: 780,  y: 650, width: 250, height: 20, type: "ice" },
      // Safe ground mid
      { id: 5,  x: 1050, y: 800, width: 150, height: 30, type: "static" },
      // Falling bridge
      { id: 6,  x: 1250, y: 800, width: 80,  height: 20, type: "falling" },
      { id: 7,  x: 1370, y: 800, width: 80,  height: 20, type: "falling" },
      { id: 8,  x: 1490, y: 800, width: 110, height: 30, type: "static" },
      // Conveyor approach
      { id: 9,  x: 1200, y: 600, width: 300, height: 20, type: "conveyor", speed: -3 },
      // Final high platform
      { id: 10, x: 1100, y: 400, width: 500, height: 30, type: "static" },
      // Floor
      { id: 20, x: 0,    y: 950, width: 1600, height: 40, type: "static" },
    ],

    switches: [
      { id: 1, x: 1060, y: 772, width: 60, height: 28, targetId: 1, requiresCount: 1, type: "pressure", timedReset: 0 },
      { id: 2, x: 1200, y: 372, width: 60, height: 28, targetId: 2, requiresCount: 2, type: "pressure", timedReset: 4000 },
    ],

    hazards: [
      { id: 1, x: 200,  y: 760, width: 80,  height: 40, type: "spike" },
      { id: 2, x: 750,  y: 611, width: 30,  height: 40, type: "spike" },
      { id: 3, x: 1030, y: 761, width: 20,  height: 40, type: "spike" },
      // Pulsing lasers on final stretch
      { id: 4, x: 1100, y: 360, width: 200, height: 16, type: "laser", period: 2500, phase: 0 },
      { id: 5, x: 1400, y: 360, width: 16,  height: 80, type: "laser", period: 1800, phase: 900 },
    ],

    doors: [
      { id: 1, x: 1060, y: 710, width: 60, height: 80, isOpen: false, isExit: false, linkedSwitchId: 1 },
      { id: 2, x: 1490, y: 310, width: 60, height: 80, isOpen: false, isExit: true, linkedSwitchId: 2 },
    ],
  },
];

module.exports = { LEVELS };
