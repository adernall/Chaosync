# CHAOSYNC 🎮
### Cooperative Chaos Platformer — Full Setup Guide

---

## TABLE OF CONTENTS

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Quick Start](#quick-start)
4. [Detailed Setup Guide](#detailed-setup-guide)
5. [Asset Specifications](#asset-specifications)
6. [How to Add Your Own Assets](#how-to-add-your-own-assets)
7. [Networking Architecture](#networking-architecture)
8. [Adding New Levels](#adding-new-levels)
9. [Adding New Characters](#adding-new-characters)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## PROJECT STRUCTURE

```
chaosync/
├── package.json                  ← Root monorepo config
│
├── server/                       ← Node.js game server (Colyseus)
│   ├── package.json
│   └── src/
│       ├── index.js              ← Server entry point (Express + Colyseus)
│       ├── rooms/
│       │   └── GameRoom.js       ← Core room logic, state, all message handlers
│       └── game/
│           ├── PhysicsEngine.js  ← Server-authoritative physics (60fps)
│           └── levels.js         ← All level definitions (platforms, hazards, etc.)
│
└── client/                       ← Phaser 3 browser game
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.js               ← Phaser game config + scene registration
        └── game/
            ├── scenes/
            │   ├── BootScene.js       ← Generates ALL textures procedurally
            │   ├── PreloadScene.js    ← Loading screen + audio setup
            │   ├── MainMenuScene.js   ← Nickname + character select + room UI
            │   ├── LobbyScene.js      ← Room lobby + ready system
            │   ├── GameScene.js       ← Main gameplay rendering
            │   ├── UIScene.js         ← HUD overlay (runs parallel to GameScene)
            │   └── ResultsScene.js    ← Post-level stats screen
            ├── systems/
            │   ├── InputController.js   ← Keyboard/gamepad input
            │   ├── CameraController.js  ← Dynamic zoom camera
            │   └── ParticleSystem.js    ← All visual effects
            └── utils/
                ├── Characters.js       ← 10 character definitions
                ├── NetworkManager.js   ← Colyseus client singleton
                └── SoundManager.js     ← Procedural audio (Web Audio API)
```

---

## TECH STACK

| Layer      | Technology             | Why                                     |
|------------|------------------------|-----------------------------------------|
| Game Engine| Phaser 3.70            | 2D rendering, input, tweens             |
| Networking | Colyseus 0.15          | Real-time multiplayer rooms, state sync |
| Server     | Node.js + Express      | Room hosting, physics simulation        |
| Build Tool | Vite 5                 | Fast dev server, HMR                    |
| Physics    | Custom (server-side)   | Server-authoritative, no desyncs        |
| Audio      | Web Audio API          | Procedural synthesis, no files needed   |

---

## QUICK START

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

### 1. Install dependencies

```bash
# From the chaosync/ root directory:
npm install
npm install --workspace=server
npm install --workspace=client
```

### 2. Start development

```bash
# Start both server + client simultaneously:
npm run dev
```

This starts:
- **Server** → `http://localhost:2567` (WebSocket game server)
- **Client** → `http://localhost:3000` (browser game)

### 3. Open the game

Visit `http://localhost:3000` in your browser.

To test multiplayer locally, open **multiple browser tabs**.

---

## DETAILED SETUP GUIDE

### Step 1 — Clone / Download
Place the `chaosync/` folder wherever you want on your machine.

### Step 2 — Install Node.js
Download from [nodejs.org](https://nodejs.org) — use the LTS version (18+).

Verify:
```bash
node --version    # should show v18.x.x or higher
npm --version     # should show 9.x.x or higher
```

### Step 3 — Install All Dependencies

```bash
cd chaosync
npm install
npm install --workspace=server
npm install --workspace=client
```

### Step 4 — Start Development Servers

```bash
npm run dev
```

You'll see two outputs:
```
[server] 🎮 Chaosync server running on port 2567
[client] ➜  Local:   http://localhost:3000/
```

### Step 5 — Test Multiplayer

1. Open `http://localhost:3000` in Browser Tab 1
2. Enter a nickname → pick a character → click **CREATE ROOM**
3. Copy the 5-6 character room code shown
4. Open `http://localhost:3000` in Browser Tab 2
5. Enter a nickname → pick a character → paste the code → click **→**
6. Both players click **✓ READY** → game starts!

### Step 6 — Play on LAN (same WiFi)

1. Find your local IP:
   - Windows: `ipconfig` → look for IPv4 Address (e.g. `192.168.1.42`)
   - Mac/Linux: `ifconfig` or `ip a`

2. Edit `client/.env.local` (create it if it doesn't exist):
```
VITE_SERVER_URL=ws://192.168.1.42:2567
```

3. Restart the client: `npm run dev`

4. Friends on the same WiFi open: `http://192.168.1.42:3000`

---

## ASSET SPECIFICATIONS

> **All assets are optional.** The game works completely without them —
> everything is drawn procedurally in code. Assets only enhance the visuals.

---

### CHARACTERS

**Location:** `client/public/assets/characters/`

| File              | Size       | Format   | Description                                   |
|-------------------|-----------|----------|-----------------------------------------------|
| `char_0.png`      | 64×64 px  | PNG (transparent) | Red Cat cube — round face, cat ears outline |
| `char_1.png`      | 64×64 px  | PNG      | Blue Robot — rectangular eyes, antenna       |
| `char_2.png`      | 64×64 px  | PNG      | Yellow Blob — round dot eyes, wobbly edge    |
| `char_3.png`      | 64×64 px  | PNG      | Green Frog — half-circle eyes, wide mouth    |
| `char_4.png`      | 64×64 px  | PNG      | Pink Bunny — star-shaped eyes, tall ears     |
| `char_5.png`      | 64×64 px  | PNG      | Purple Sleepy — half-closed eyes, round      |
| `char_6.png`      | 64×64 px  | PNG      | Orange Fox — angled brow, fox snout          |
| `char_7.png`      | 64×64 px  | PNG      | White Ghost — round eyes, wavy bottom        |
| `char_8.png`      | 64×64 px  | PNG      | Cyan Slime — dot eyes, drip on bottom        |
| `char_9.png`      | 64×64 px  | PNG      | Black Ninja — narrow eyes, headband stripe   |
| `char_*_dead.png` | 64×64 px  | PNG      | Each character with X eyes, tilted 20°       |
| `char_shadow.png` | 64×16 px  | PNG      | Soft ellipse shadow (dark, transparent)       |

**Style guidelines:**
- Geometric, square/rounded-square bodies
- Bold black outlines (2-3px)
- Simple faces: 2 eyes + optional mouth only
- No accessories, no clothing, no complex details
- Each character has one solid body color + slightly darker outline
- Transparent background
- Pixel-clean edges (no anti-aliasing bleed at edges)

---

### ENVIRONMENT / PLATFORMS

**Location:** `client/public/assets/tilesets/`

| File                    | Size       | Format | Description                                    |
|-------------------------|-----------|--------|------------------------------------------------|
| `platform_static.png`   | 200×34 px | PNG    | Gray stone platform — neutral, matte texture  |
| `platform_moving.png`   | 200×34 px | PNG    | Yellow platform — arrows or chevrons on top   |
| `platform_conveyor.png` | 200×34 px | PNG    | Blue platform — conveyor belt arrows          |
| `platform_ice.png`      | 200×34 px | PNG    | White/pale blue — icy sparkle texture         |
| `platform_falling.png`  | 200×34 px | PNG    | Orange/brown — cracked/stressed surface       |
| `bg_tile.png`           | 64×64 px  | PNG    | Soft dot-grid background tile (very subtle)   |

**Style guidelines:**
- Top surface is distinct from sides
- Include a subtle top highlight (lighter strip)
- Soft drop shadow baked in (4px offset, 20% opacity)
- Rounded corners (6px radius)
- Conveyors: animated arrows pointing direction

---

### HAZARDS

**Location:** `client/public/assets/tilesets/`

| File          | Size        | Format | Description                                        |
|---------------|------------|--------|----------------------------------------------------|
| `spike.png`   | 20×28 px   | PNG    | One spike unit — red triangle, sharp tip up       |
| `laser_h.png` | 200×12 px  | PNG    | Horizontal laser beam — red glow, white core       |
| `laser_v.png` | 12×200 px  | PNG    | Vertical laser beam — red glow, white core         |
| `crusher.png` | 40×200 px  | PNG    | Moving crusher wall — dark metal, beveled edges    |

---

### UI ELEMENTS

**Location:** `client/public/assets/ui/`

| File                    | Size       | Format | Description                                      |
|-------------------------|-----------|--------|--------------------------------------------------|
| `btn_normal.png`        | 200×50 px | PNG    | White rounded button, soft gray border           |
| `btn_primary.png`       | 200×50 px | PNG    | Red-orange button, lighter top highlight         |
| `char_frame.png`        | 80×80 px  | PNG    | Character select slot — white, gray border       |
| `char_frame_selected.png`| 80×80 px | PNG    | Selected state — warm yellow glow border         |
| `badge_ready.png`       | 70×26 px  | PNG    | Green pill badge                                  |
| `badge_waiting.png`     | 70×26 px  | PNG    | Gray pill badge                                   |
| `host_crown.png`        | 40×22 px  | PNG    | Small gold crown icon                             |
| `switch_off.png`        | 60×28 px  | PNG    | Pressure plate (raised, orange/yellow)            |
| `switch_on.png`         | 60×28 px  | PNG    | Pressure plate (pressed, green glow)              |
| `door_closed.png`       | 60×80 px  | PNG    | Metal door, gray                                  |
| `door_open.png`         | 60×80 px  | PNG    | Door open — green glow, dark interior             |
| `checkpoint.png`        | 44×60 px  | PNG    | Flag on pole — blue flag                          |
| `checkpoint_active.png` | 44×60 px  | PNG    | Flag on pole — golden flag                        |
| `nametag_bg.png`        | 100×22 px | PNG    | Dark semi-transparent pill shape                  |
| `emote_bubble.png`      | 80×38 px  | PNG    | White speech bubble with small tail               |

---

### SOUNDS

**Location:** `client/public/sounds/`

> All sounds are currently synthesized procedurally. To use real audio:
> 1. Place files here
> 2. Uncomment the load lines in `PreloadScene.js`
> 3. Replace `Sound.jump()` calls with Phaser's sound system

| File            | Format    | Duration  | Description                                           |
|-----------------|----------|-----------|-------------------------------------------------------|
| `jump.mp3`      | MP3/OGG  | 0.15s     | Tiny cartoon boing/pop — high-pitched, bouncy        |
| `land.mp3`      | MP3/OGG  | 0.1s      | Soft chunky thud — dull impact, not sharp             |
| `death.mp3`     | MP3/OGG  | 0.4s      | Descending wobble — comical, not scary                |
| `success.mp3`   | MP3/OGG  | 0.5s      | 4-note ascending chime — bright, celebratory         |
| `switch.mp3`    | MP3/OGG  | 0.15s     | Mechanical click + light chime                        |
| `door.mp3`      | MP3/OGG  | 0.3s      | 3-note ascending tone — door unlocking               |
| `checkpoint.mp3`| MP3/OGG  | 0.25s     | 2-note chime — soft, confirmatory                    |
| `countdown.mp3` | MP3/OGG  | 0.1s      | Metronome tick — sharp, precise                      |
| `go.mp3`        | MP3/OGG  | 0.2s      | Bright two-note blast — energetic                    |
| `join.mp3`      | MP3/OGG  | 0.15s     | Ascending pop — welcoming                             |
| `click.mp3`     | MP3/OGG  | 0.05s     | UI button click — crisp, minimal                     |

---

### MUSIC

**Location:** `client/public/sounds/`

| File       | Format   | Duration | Description                                            |
|------------|---------|----------|--------------------------------------------------------|
| `bgm.mp3`  | MP3/OGG | Looping  | Playful chiptune/synth loop — upbeat, non-intrusive   |

**Music style guidelines:**
- BPM: 120-140
- Genre: minimal chiptune or toy percussion loop
- Low volume (designed to sit under player voices)
- Loops seamlessly
- No lyrics
- Avoid: dramatic orchestral, intense electronic, anything that competes with gameplay

---

### PARTICLES

All particles are generated procedurally (colored circles/squares).
No particle image files needed.
If you want custom particles, add PNGs to `client/public/assets/particles/`
and load them in `BootScene.generateParticleTextures()`.

---

## HOW TO ADD YOUR OWN ASSETS

### Characters

1. Design your character sprites at 64×64 px, PNG with transparency
2. Name them `char_0.png` through `char_9.png`
3. Also create dead versions: `char_0_dead.png` through `char_9_dead.png`
4. Place in `client/public/assets/characters/`
5. In `BootScene.js`, find `generateCharacterTextures()` and add:

```js
// Replace generated texture with loaded image
this.load.image(`char_${idx}`, `assets/characters/char_${idx}.png`);
```

Or add loading in `PreloadScene.js`:
```js
for (let i = 0; i < 10; i++) {
  this.load.image(`char_${i}`, `assets/characters/char_${i}.png`);
  this.load.image(`char_${i}_dead`, `assets/characters/char_${i}_dead.png`);
}
```

### Sounds

1. Place `.mp3` or `.ogg` files in `client/public/sounds/`
2. Open `PreloadScene.js`, uncomment:

```js
this.load.audio("jump", "sounds/jump.mp3");
// etc.
```

3. In `SoundManager.js`, replace synthesized methods with:

```js
jump() {
  this.scene.sound.play("jump", { volume: 0.5 });
}
```

---

## NETWORKING ARCHITECTURE

```
BROWSER CLIENT                    NODE SERVER
─────────────────                 ──────────────────────
InputController                   GameRoom
  └─ getInput()                     ├─ onMessage("input")
       └─ Network.send()                └─ PhysicsEngine.applyInput()
                                        └─ stored in player._input

                              setSimulationInterval (60fps)
                                └─ PhysicsEngine.stepPlayer()
                                    ├─ horizontal movement
                                    ├─ gravity + jump
                                    ├─ platform collision
                                    └─ player-on-player collision

Colyseus state sync ←─────────── Room.state (MapSchema)
  └─ onStateChange()                 ├─ players (position, alive, emote)
       └─ GameScene.syncPlayers()    ├─ platforms (position, type)
            └─ sprite lerp           ├─ switches (active state)
                                     ├─ hazards (rotation, on/off)
                                     └─ doors (open/closed)
```

**Key design decisions:**
- Server runs physics at 60fps — positions are server-authoritative
- Clients receive state via Colyseus delta sync (~20-30 updates/sec)
- Client lerps sprite positions toward server values for smoothness
- Jump input uses `jumpPressed` flag to prevent repeated firing
- Player death → server sets `isDead = true` → client plays death anim
- Respawn after 1.2s → server resets position → client plays spawn anim

---

## ADDING NEW LEVELS

Open `server/src/game/levels.js` and add to the `LEVELS` array:

```js
{
  id: "w8_l1",
  world: 8,
  name: "Your Level Name",
  description: "Short description for lobby display.",
  spawnPoint: { x: 80, y: 650 },
  bounds: { top: -300, bottom: 1000 },

  platforms: [
    // { id, x, y, width, height, type }
    // type: "static" | "moving" | "moving_y" | "conveyor" | "ice" | "falling"
    // moving/moving_y also need: speed, range, direction, startX/startY
    { id: 1, x: 0, y: 700, width: 400, height: 30, type: "static" },
  ],

  switches: [
    // { id, x, y, width, height, targetId, requiresCount, type, timedReset }
    // timedReset: 0 = permanent, >0 = ms until reset
    { id: 1, x: 200, y: 672, width: 60, height: 28, requiresCount: 1,
      type: "pressure", timedReset: 0 },
  ],

  hazards: [
    // { id, x, y, width, height, type, period, phase, rotationSpeed }
    // type: "spike" | "laser" | "laser_v" | "crusher"
    // period/phase: for pulsing (ms) — 0 = always on
    { id: 1, x: 300, y: 660, width: 100, height: 40, type: "spike" },
  ],

  doors: [
    // { id, x, y, width, height, isOpen, isExit, linkedSwitchId }
    // linkedSwitchId: -1 = no link (open from start)
    { id: 1, x: 1480, y: 610, width: 60, height: 80, isOpen: true,
      isExit: true, linkedSwitchId: -1 },
  ],
}
```

**Coordinate system:**
- `x=0, y=0` = top-left of level
- `y` increases downward
- Typical playfield: 1600 wide × 900 tall
- Players spawn at `spawnPoint`
- Fall below `bounds.bottom` = death

---

## ADDING NEW CHARACTERS

In `client/src/game/utils/Characters.js`:

```js
export const CHARACTERS = [
  // ...existing 10...
  {
    id: 10,
    name: "Red Dragon",
    color: 0xff2200,      // body fill color (hex)
    outline: 0x880000,    // border color (darker)
    eyeStyle: "angry",    // "round" | "dot" | "wide" | "sleepy" | "star" | "cat" | "angry"
    emoji: "🐉",
  },
];
```

Then in `BootScene.js`, the character will be auto-generated.
Or provide a custom sprite file (see above).

---

## DEPLOYMENT

### Deploy to a VPS (Recommended for public play)

```bash
# 1. Build client
npm run build --workspace=client
# Output goes to server/public/

# 2. On your server, install pm2
npm install -g pm2

# 3. Start server (serves both API and static files)
cd chaosync/server
NODE_ENV=production pm2 start src/index.js --name chaosync

# 4. Configure nginx to proxy:
#   / → localhost:2567 (static files)
#   /colyseus → localhost:2567 (websocket)
```

### Environment variables for production

Create `server/.env`:
```
PORT=2567
NODE_ENV=production
```

Create `client/.env.production`:
```
VITE_SERVER_URL=wss://yourdomain.com
```

---

## TROUBLESHOOTING

### "Room not found" when joining

- Server must be running on port 2567
- Check VITE_SERVER_URL points to the correct server
- Room codes are case-sensitive — use all caps

### Players desync / different positions

- Server is authoritative — if positions differ, client will snap
- Increase lerp speed in `GameScene.js` if too laggy
- Check server is running at stable 60fps

### No sound

- Browser requires user interaction before audio plays
- Click anywhere on the page first
- Check SoundManager.enabled is true

### Game too fast / too slow

- Physics constants are in `server/src/game/PhysicsEngine.js`
- Adjust `GRAVITY`, `MOVE_SPEED`, `JUMP_FORCE`

### Platform collision feels wrong

- Player anchor: `x` = horizontal center, `y` = feet position
- All collision uses AABB (axis-aligned bounding box)
- Player size: 32×32 px

### Black/empty screen on load

- Open browser DevTools → Console for errors
- Most common: server not running, or wrong port

---

## CONTROLS

| Key          | Action      |
|--------------|-------------|
| WASD / Arrows| Move + Jump |
| Space        | Jump        |
| E            | Emote wheel |
| 1-5          | Quick emote (while wheel open) |

---

## ARCHITECTURE NOTES

**Why server-authoritative physics?**
In a cooperative game where player-on-player collisions matter,
all clients need to agree on exact positions. The server runs the
authoritative simulation; clients receive state and lerp toward it.

**Why procedural graphics?**
Zero setup friction. Open the game and it works immediately.
When you add real art, just swap the texture keys — the game structure
doesn't change.

**Why Colyseus?**
Purpose-built for real-time multiplayer games. Handles room lifecycle,
delta state sync, and client reconnection automatically.

**Why Phaser 3?**
Battle-tested 2D game engine. Excellent tweening, camera, and input systems.
Renders via WebGL with canvas fallback.
