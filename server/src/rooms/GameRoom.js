const { Room } = require("colyseus");
const { Schema, MapSchema, defineTypes } = require("@colyseus/schema");
const { LEVELS } = require("../game/levels");
const { PhysicsEngine } = require("../game/PhysicsEngine");

// ─── SCHEMAS ─────────────────────────────────────────────────────────────────

class PlayerState extends Schema {}
defineTypes(PlayerState, {
  x: "number", y: "number", vx: "number", vy: "number",
  isGrounded: "boolean", isDead: "boolean",
  nickname: "string", characterId: "number",
  isReady: "boolean", isHost: "boolean",
  emote: "string", emoteTimer: "number", deathCount: "number",
  facingRight: "boolean", checkpointX: "number", checkpointY: "number",
});

class PlatformState extends Schema {}
defineTypes(PlatformState, {
  id: "number", x: "number", y: "number", width: "number", height: "number",
  type: "string", active: "boolean",
  speed: "number", range: "number", direction: "number",
  axis: "string", startX: "number", startY: "number", broken: "boolean",
});

class SwitchState extends Schema {}
defineTypes(SwitchState, {
  id: "number", x: "number", y: "number", width: "number", height: "number",
  active: "boolean", requiresCount: "number", currentCount: "number",
  type: "string", timedReset: "number", resetTimer: "number",
});

class HazardState extends Schema {}
defineTypes(HazardState, {
  id: "number", x: "number", y: "number", width: "number", height: "number",
  type: "string", active: "boolean",
  angle: "number", rotationSpeed: "number",
  phase: "number", period: "number", isOn: "boolean",
});

class DoorState extends Schema {}
defineTypes(DoorState, {
  id: "number", x: "number", y: "number", width: "number", height: "number",
  isOpen: "boolean", isExit: "boolean", linkedSwitchId: "number",
});

class RoomState extends Schema {}
defineTypes(RoomState, {
  players:   { map: PlayerState },
  platforms: { map: PlatformState },
  switches:  { map: SwitchState },
  hazards:   { map: HazardState },
  doors:     { map: DoorState },
  phase: "string", countdown: "number", currentLevelIndex: "number",
  levelTime: "number", totalDeaths: "number", retryCount: "number",
  levelCleared: "boolean", allPlayersDead: "boolean",
  playerCount: "number", hostId: "string",
});

// ─── FACTORY HELPERS ──────────────────────────────────────────────────────────

function makePlayer(opts = {}) {
  const p = new PlayerState();
  p.x = 100; p.y = 300; p.vx = 0; p.vy = 0;
  p.isGrounded = false; p.isDead = false;
  p.nickname = String(opts.nickname || "Player").slice(0, 12);
  p.characterId = Math.min(9, Math.max(0, opts.characterId || 0));
  p.isReady = false; p.isHost = false;
  p.emote = ""; p.emoteTimer = 0; p.deathCount = 0;
  p.facingRight = true; p.checkpointX = 100; p.checkpointY = 300;
  // Runtime-only (not synced schema fields):
  p._input = { left: false, right: false, jump: false, jumpPressed: false };
  p._coyoteTimer = 0; p._jumpBuffer = 0;
  return p;
}

function makePlatform(d) {
  const p = new PlatformState();
  p.id = d.id; p.x = d.x; p.y = d.y;
  p.width = d.width; p.height = d.height;
  p.type = d.type || "static"; p.active = true;
  p.speed = d.speed || 0; p.range = d.range || 0;
  p.direction = d.direction || 1; p.axis = d.axis || "x";
  p.startX = d.x; p.startY = d.y; p.broken = false;
  p._offset = 0; p._breakTimer = 0;
  return p;
}

function makeSwitch(d) {
  const s = new SwitchState();
  s.id = d.id; s.x = d.x; s.y = d.y;
  s.width = d.width || 60; s.height = d.height || 28;
  s.active = false; s.requiresCount = d.requiresCount || 1;
  s.currentCount = 0; s.type = d.type || "pressure";
  s.timedReset = d.timedReset || 0; s.resetTimer = 0;
  return s;
}

function makeHazard(d) {
  const h = new HazardState();
  h.id = d.id; h.x = d.x; h.y = d.y;
  h.width = d.width || 20; h.height = d.height || 20;
  h.type = d.type || "spike"; h.active = true;
  h.angle = 0; h.rotationSpeed = d.rotationSpeed || 0;
  h.phase = d.phase || 0; h.period = d.period || 0;
  h.isOn = true;
  return h;
}

function makeDoor(d) {
  const dr = new DoorState();
  dr.id = d.id; dr.x = d.x; dr.y = d.y;
  dr.width = d.width || 60; dr.height = d.height || 80;
  dr.isOpen = d.isOpen || false; dr.isExit = d.isExit || false;
  dr.linkedSwitchId = (d.linkedSwitchId !== undefined) ? d.linkedSwitchId : -1;
  return dr;
}

// ─── GAME ROOM ────────────────────────────────────────────────────────────────

class GameRoom extends Room {
  onCreate() {
    const state = new RoomState();
    state.players   = new MapSchema();
    state.platforms = new MapSchema();
    state.switches  = new MapSchema();
    state.hazards   = new MapSchema();
    state.doors     = new MapSchema();
    state.phase = "lobby"; state.countdown = 0;
    state.currentLevelIndex = 0; state.levelTime = 0;
    state.totalDeaths = 0; state.retryCount = 0;
    state.levelCleared = false; state.allPlayersDead = false;
    state.playerCount = 0; state.hostId = "";
    this.setState(state);

    this.maxClients     = 8;
    this.physics        = new PhysicsEngine();
    this.countdownTimer = null;
    this.levelStartTime = 0;
    this._retryPending  = false;

    this.setSimulationInterval((dt) => this.update(dt), 1000 / 60);

    this.onMessage("set_nickname", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (p) p.nickname = String(data.nickname || "Player").slice(0, 12);
    });

    this.onMessage("set_character", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (p) p.characterId = Math.min(9, Math.max(0, data.characterId || 0));
    });

    this.onMessage("set_ready", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (p) { p.isReady = !!data.ready; this.checkAllReady(); }
    });

    this.onMessage("input", (client, data) => {
      if (this.state.phase !== "playing") return;
      const p = this.state.players.get(client.sessionId);
      if (!p || p.isDead) return;
      p._input = {
        left: !!data.left, right: !!data.right,
        jump: !!data.jump, jumpPressed: !!data.jumpPressed,
      };
    });

    this.onMessage("emote", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (!p) return;
      if (["HELP","WAIT","GO","SORRY","LOL"].includes(data.emote)) {
        p.emote = data.emote; p.emoteTimer = 2500;
      }
    });

    this.onMessage("start_game", (client) => {
      const p = this.state.players.get(client.sessionId);
      if (p && p.isHost && this.state.phase === "lobby") this.startCountdown();
    });

    this.onMessage("select_level", (client, data) => {
      const p = this.state.players.get(client.sessionId);
      if (p && p.isHost && this.state.phase === "lobby") {
        this.state.currentLevelIndex = Math.min(LEVELS.length - 1, Math.max(0, data.levelIndex || 0));
      }
    });

    this.onMessage("next_level", (client) => {
      const p = this.state.players.get(client.sessionId);
      if (p && p.isHost && this.state.levelCleared) this.loadNextLevel();
    });

    console.log(`Room created: ${this.roomId}`);
  }

  onJoin(client, options) {
    const isFirst = this.state.players.size === 0;
    const player  = makePlayer(options);
    player.isHost = isFirst;
    if (isFirst) this.state.hostId = client.sessionId;
    const idx = this.state.players.size;
    player.x = 100 + idx * 34; player.y = 300;
    player.checkpointX = player.x; player.checkpointY = player.y;
    this.state.players.set(client.sessionId, player);
    this.state.playerCount = this.state.players.size;
    console.log(`${player.nickname} joined ${this.roomId}`);
  }

  onLeave(client) {
    const player = this.state.players.get(client.sessionId);
    if (player?.isHost) {
      let assigned = false;
      this.state.players.forEach((p, id) => {
        if (!assigned && id !== client.sessionId) {
          p.isHost = true; this.state.hostId = id; assigned = true;
        }
      });
    }
    this.state.players.delete(client.sessionId);
    this.state.playerCount = this.state.players.size;
    if (this.state.players.size === 0) this.disconnect();
  }

  onDispose() {
    if (this.countdownTimer) clearTimeout(this.countdownTimer);
  }

  // ── Flow ───────────────────────────────────────────────────────────────────

  checkAllReady() {
    if (this.state.phase !== "lobby" || !this.state.players.size) return;
    let all = true;
    this.state.players.forEach((p) => { if (!p.isReady) all = false; });
    if (all) this.startCountdown();
  }

  startCountdown() {
    this.state.phase = "countdown"; this.state.countdown = 3;
    const tick = () => {
      this.state.countdown--;
      if (this.state.countdown <= 0) this.startLevel();
      else this.countdownTimer = setTimeout(tick, 1000);
    };
    this.countdownTimer = setTimeout(tick, 1000);
  }

  startLevel() {
    const level = LEVELS[this.state.currentLevelIndex];
    if (!level) return;
    this.state.phase = "playing"; this.state.levelCleared = false;
    this.state.allPlayersDead = false; this._retryPending = false;
    this.levelStartTime = Date.now(); this.state.levelTime = 0;

    this.state.platforms.clear(); this.state.switches.clear();
    this.state.hazards.clear();   this.state.doors.clear();

    (level.platforms || []).forEach((d) => this.state.platforms.set(String(d.id), makePlatform(d)));
    (level.switches  || []).forEach((d) => this.state.switches .set(String(d.id), makeSwitch(d)));
    (level.hazards   || []).forEach((d) => this.state.hazards  .set(String(d.id), makeHazard(d)));
    (level.doors     || []).forEach((d) => this.state.doors    .set(String(d.id), makeDoor(d)));

    const spawn = level.spawnPoint || { x: 100, y: 300 };
    let i = 0;
    this.state.players.forEach((player) => {
      player.x = spawn.x + i * 34; player.y = spawn.y;
      player.vx = 0; player.vy = 0;
      player.isDead = false; player.isGrounded = false;
      player.checkpointX = player.x; player.checkpointY = player.y;
      player._input = { left:false, right:false, jump:false, jumpPressed:false };
      player._coyoteTimer = 0; player._jumpBuffer = 0;
      i++;
    });
  }

  retryLevel() {
    this._retryPending = false;
    this.state.retryCount++;
    this.startLevel();
  }

  loadNextLevel() {
    const next = this.state.currentLevelIndex + 1;
    if (next >= LEVELS.length) {
      this.state.phase = "lobby"; this.state.currentLevelIndex = 0;
    } else {
      this.state.currentLevelIndex = next; this.startCountdown();
    }
  }

  // ── Simulation 60fps ───────────────────────────────────────────────────────

  update(dt) {
    // Emote timers always run
    this.state.players.forEach((p) => {
      if (p.emoteTimer > 0) { p.emoteTimer -= dt; if (p.emoteTimer <= 0) p.emote = ""; }
    });

    if (this.state.phase !== "playing") return;

    this.state.levelTime += dt;
    const level = LEVELS[this.state.currentLevelIndex];
    if (!level) return;
    const bounds = level.bounds || { top: -400, bottom: 1100 };

    // Tick platforms
    this.state.platforms.forEach((plat) => {
      if (plat.type === "moving" || plat.type === "moving_y") {
        const isY = plat.type === "moving_y";
        plat._offset = (plat._offset || 0) + plat.speed * plat.direction * (dt / 1000);
        if (Math.abs(plat._offset) >= plat.range) plat.direction *= -1;
        if (isY) plat.y = plat.startY + plat._offset;
        else     plat.x = plat.startX + plat._offset;
      }
      if (plat.broken) {
        plat._breakTimer = (plat._breakTimer || 0) + dt;
        if (plat._breakTimer >= 3500) { plat.broken = false; plat.active = true; plat._breakTimer = 0; }
      }
    });

    // Tick hazards
    this.state.hazards.forEach((h) => {
      if (h.rotationSpeed) h.angle = (h.angle + h.rotationSpeed * (dt / 1000)) % 360;
      if (h.period > 0) {
        const t = (this.state.levelTime + h.phase) % h.period;
        h.isOn = t < h.period * 0.5;
      }
    });

    // Tick timed switches
    this.state.switches.forEach((sw) => {
      if (sw.active && sw.timedReset > 0) {
        sw.resetTimer += dt;
        if (sw.resetTimer >= sw.timedReset) {
          sw.active = false; sw.currentCount = 0; sw.resetTimer = 0;
          this.state.doors.forEach((d) => { if (d.linkedSwitchId === sw.id) d.isOpen = false; });
        }
      }
    });

    // Step players
    let totalCount = 0, deadCount = 0, inExitCount = 0;

    this.state.players.forEach((player) => {
      totalCount++;
      if (player.isDead) { deadCount++; return; }

      this.physics.stepPlayer(player, dt, this.state);

      // Hazard check
      let killed = false;
      this.state.hazards.forEach((h) => {
        if (!h.active || !h.isOn) return;
        if (this.physics.playerOverlapsRect(player, h.x, h.y, h.width, h.height, 6)) killed = true;
      });

      // Bounds check
      if (player.y > bounds.bottom || player.y < bounds.top) killed = true;

      if (killed) { this.killPlayer(player); deadCount++; return; }

      // Switch activation
      this.state.switches.forEach((sw) => {
        if (!player.isGrounded) return;
        if (this.physics.playerOverlapsRect(player, sw.x, sw.y, sw.width, sw.height, 0) && !sw.active) {
          sw.currentCount++;
          if (sw.currentCount >= sw.requiresCount) {
            sw.active = true; sw.resetTimer = 0;
            this.state.doors.forEach((d) => { if (d.linkedSwitchId === sw.id) d.isOpen = true; });
          }
        }
      });

      // Falling platforms
      this.state.platforms.forEach((plat) => {
        if (plat.type !== "falling" || !plat.active || plat.broken) return;
        if (this.physics.isStandingOn(player, plat)) {
          plat._breakTimer = (plat._breakTimer || 0) + dt;
          if (plat._breakTimer >= 700) { plat.broken = true; plat.active = false; plat._breakTimer = 0; }
        }
      });

      // Exit check
      this.state.doors.forEach((d) => {
        if (d.isExit && d.isOpen && this.physics.playerOverlapsRect(player, d.x, d.y, d.width, d.height, 0))
          inExitCount++;
      });
    });

    // Win
    const aliveCount = totalCount - deadCount;
    if (!this.state.levelCleared && aliveCount > 0 && inExitCount >= aliveCount) {
      this.state.levelCleared = true;
      this.state.levelTime    = Date.now() - this.levelStartTime;
      this.broadcast("level_clear", {
        time: this.state.levelTime, deaths: this.state.totalDeaths, retries: this.state.retryCount,
      });
    }

    // All dead → retry
    if (!this._retryPending && !this.state.levelCleared && totalCount > 0 && deadCount === totalCount) {
      this._retryPending = true; this.state.allPlayersDead = true;
      setTimeout(() => this.retryLevel(), 900);
    }
  }

  killPlayer(player) {
    if (player.isDead) return;
    player.isDead = true; player.vx = 0; player.vy = 0;
    player.deathCount++; this.state.totalDeaths++;
    const cx = player.checkpointX, cy = player.checkpointY;
    setTimeout(() => {
      if (this.state.phase !== "playing") return;
      player.x = cx; player.y = cy - 60;
      player.vx = 0; player.vy = 0; player.isDead = false;
    }, 1400);
  }
}

module.exports = { GameRoom };
