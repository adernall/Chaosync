/**
 * GameScene — Main gameplay scene.
 * Client-side prediction + server reconciliation.
 * Renders all game objects from server state.
 */

import Phaser from "phaser";
import { Network } from "../utils/NetworkManager.js";
import { Sound } from "../utils/SoundManager.js";
import { CHARACTERS } from "../utils/Characters.js";
import { InputController } from "../systems/InputController.js";
import { CameraController } from "../systems/CameraController.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";

const PLAYER_W = 32;
const PLAYER_H = 32;

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");

    // Rendering maps
    this.playerSprites = new Map();
    this.platformSprites = new Map();
    this.switchSprites = new Map();
    this.hazardSprites = new Map();
    this.doorSprites = new Map();

    // Previous state tracking
    this.prevPhase = null;
    this.prevPlayerStates = new Map();
    this.prevSwitchStates = new Map();

    // Local prediction
    this.localInput = { left: false, right: false, jump: false, jumpPressed: false };
    this.localPlayer = null; // predicted local player position

    this.stateListener = null;
    this.clearListener = null;
  }

  create() {
    if (!Network.isConnected) {
      this.scene.start("MainMenuScene");
      return;
    }

    // Background
    this.bg = this.add.tileSprite(0, 0, 4000, 2000, "bg_tile").setOrigin(0, 0).setAlpha(0.55);

    // Layer groups (draw order)
    this.platformLayer = this.add.container(0, 0);
    this.switchLayer   = this.add.container(0, 0);
    this.hazardLayer   = this.add.container(0, 0);
    this.doorLayer     = this.add.container(0, 0);
    this.playerLayer   = this.add.container(0, 0);
    this.uiLayer       = this.add.container(0, 0);

    // Systems
    this.inputCtrl   = new InputController(this);
    this.cameraCtrl  = new CameraController(this);
    this.particles   = new ParticleSystem(this);

    // UI overlay (runs in parallel scene)
    this.scene.launch("UIScene");

    // Network listeners
    this.stateListener = (state) => this.onStateChange(state);
    Network.on("stateChange", this.stateListener);

    this.clearListener = (data) => this.onLevelClear(data);
    Network.on("levelClear", this.clearListener);

    // Initial state render
    if (Network.state) this.onStateChange(Network.state);

    // Death flash overlay
    this.deathFlash = this.add.image(640, 360, "death_flash").setAlpha(0).setDepth(100).setScrollFactor(0);
    this.clearOverlay = this.add.image(640, 360, "clear_overlay").setAlpha(0).setDepth(100).setScrollFactor(0);

    // Countdown overlay
    this.countdownText = this.add.text(640, 300, "", {
      fontFamily: "Nunito", fontSize: "140px", fontStyle: "900",
      color: "#ffffff", stroke: "#1a1a2e", strokeThickness: 8,
    }).setOrigin(0.5).setAlpha(0).setScrollFactor(0).setDepth(200);
  }

  shutdown() {
    Network.off("stateChange", this.stateListener);
    Network.off("levelClear", this.clearListener);
    this.scene.stop("UIScene");
  }

  // ── Main update (60fps client) ─────────────────────────────────────────────

  update(time, delta) {
    if (!Network.state || Network.state.phase !== "playing") return;

    // Read input
    const input = this.inputCtrl.getInput();

    // Detect jump-just-pressed
    const jumpJustPressed = input.jump && !this.prevJump;
    this.prevJump = input.jump;

    // Send to server
    Network.send("input", {
      left: input.left,
      right: input.right,
      jump: input.jump,
      jumpPressed: jumpJustPressed,
    });

    // Client-side prediction for local player
    this.predictLocalPlayer(input, delta);

    // Camera follows all players
    this.cameraCtrl.update(Network.state, delta);

    // Update sprite positions from server state
    this.syncSpritesFromState(Network.state);

    // Tick particles
    this.particles.update(delta);
  }

  // ── Client prediction ──────────────────────────────────────────────────────

  predictLocalPlayer(input, delta) {
    // Snap to server position — server is authoritative.
    // Local sprite is smoothed toward server pos each frame.
    const state = Network.state;
    if (!state) return;

    const myState = state.players.get(Network.sessionId);
    if (!myState) return;

    const sprite = this.playerSprites.get(Network.sessionId);
    if (!sprite) return;

    // Lerp toward server state for smoothness
    const lerp = 0.25;
    sprite.body_img.x += (myState.x - sprite.body_img.x) * lerp;
    sprite.body_img.y += ((myState.y - PLAYER_H / 2) - sprite.body_img.y) * lerp;
  }

  // ── State sync ─────────────────────────────────────────────────────────────

  onStateChange(state) {
    this.syncPlayers(state);
    this.syncPlatforms(state);
    this.syncSwitches(state);
    this.syncHazards(state);
    this.syncDoors(state);

    // Phase transitions
    if (state.phase !== this.prevPhase) {
      if (state.phase === "results") {
        this.scene.start("ResultsScene");
      }
    }
    this.prevPhase = state.phase;
  }

  // ── Players ────────────────────────────────────────────────────────────────

  syncPlayers(state) {
    const currentIds = new Set();

    state.players.forEach((player, id) => {
      currentIds.add(id);
      const isLocal = id === Network.sessionId;

      if (!this.playerSprites.has(id)) {
        this.createPlayerSprite(id, player, isLocal);
      }

      const sprite = this.playerSprites.get(id);
      if (!sprite) return;

      const targetX = player.x;
      const targetY = player.y - PLAYER_H;

      // Smooth non-local players
      if (!isLocal) {
        sprite.body_img.x += (targetX - sprite.body_img.x) * 0.3;
        sprite.body_img.y += (targetY - sprite.body_img.y) * 0.3;
      }

      // Dead state
      if (player.isDead !== sprite._wasDead) {
        sprite._wasDead = player.isDead;
        if (player.isDead) {
          sprite.body_img.setTexture(`char_${player.characterId}_dead`);
          sprite.body_img.setAngle(Phaser.Math.Between(-20, 20));
          sprite.body_img.setAlpha(0.6);
          this.particles.burst(targetX, targetY, "death");
          this.flashDeathOverlay();
          Sound.death();
        } else {
          sprite.body_img.setTexture(`char_${player.characterId}`);
          sprite.body_img.setAngle(0);
          sprite.body_img.setAlpha(1);
          this.particles.burst(targetX, targetY, "respawn");
        }
      }

      // Shadow
      sprite.shadow.x = sprite.body_img.x;
      sprite.shadow.y = sprite.body_img.y + PLAYER_H + 2;

      // Flip based on direction
      sprite.body_img.setFlipX(!player.facingRight);

      // Name tag
      sprite.nameTag.x = sprite.body_img.x;
      sprite.nameTag.y = sprite.body_img.y - 26;
      sprite.nameTagBg.x = sprite.nameTag.x;
      sprite.nameTagBg.y = sprite.nameTag.y;

      // Emote
      if (player.emote && player.emote !== sprite._prevEmote) {
        sprite._prevEmote = player.emote;
        sprite.emoteBubble.setVisible(true);
        sprite.emoteText.setText(player.emote);
        Sound.emote();
      } else if (!player.emote) {
        sprite._prevEmote = "";
        sprite.emoteBubble.setVisible(false);
        sprite.emoteText.setText("");
      }
      sprite.emoteBubble.x = sprite.body_img.x;
      sprite.emoteBubble.y = sprite.body_img.y - 56;
      sprite.emoteText.x = sprite.emoteBubble.x;
      sprite.emoteText.y = sprite.emoteBubble.y - 4;
    });

    // Remove sprites for departed players
    this.playerSprites.forEach((sprite, id) => {
      if (!currentIds.has(id)) {
        this.particles.burst(sprite.body_img.x, sprite.body_img.y, "puff");
        Object.values(sprite).forEach((obj) => obj?.destroy && obj.destroy());
        this.playerSprites.delete(id);
      }
    });
  }

  createPlayerSprite(id, player, isLocal) {
    const x = player.x;
    const y = player.y - PLAYER_H;

    // Shadow
    const shadow = this.add.image(x, y + PLAYER_H + 2, "char_shadow")
      .setAlpha(0.5).setDisplaySize(28, 8);
    this.playerLayer.add(shadow);

    // Body
    const body_img = this.add.image(x, y, `char_${player.characterId}`)
      .setDisplaySize(PLAYER_W, PLAYER_H)
      .setOrigin(0.5, 0);
    this.playerLayer.add(body_img);

    // Highlight ring for local player
    if (isLocal) {
      const ring = this.add.graphics();
      // Draw ring as thin annulus (filled circle minus inner circle)
      ring.fillStyle(0xffffff, 0.4);
      ring.fillCircle(0, 0, 20);
      ring.fillStyle(0x000000, 0);  // punch out center via blend won't work — use alpha on container
      ring.setAlpha(0.35);
      ring.x = x;
      ring.y = y + PLAYER_H / 2;
      this.playerLayer.add(ring);
      this._localRing = ring;
    }

    // Name tag background
    const nameTagBg = this.add.image(x, y - 26, "nametag_bg")
      .setDisplaySize(Math.min(100, player.nickname.length * 8 + 16), 20)
      .setAlpha(0.85);
    this.uiLayer.add(nameTagBg);

    // Name tag text
    const nameTag = this.add.text(x, y - 26, player.nickname, {
      fontFamily: "Nunito", fontSize: "11px", fontStyle: "700", color: "#ffffff",
    }).setOrigin(0.5);
    this.uiLayer.add(nameTag);

    // Emote bubble
    const emoteImg = this.add.image(x, y - 56, "emote_bubble").setVisible(false);
    this.uiLayer.add(emoteImg);

    const emoteText = this.add.text(x, y - 60, "", {
      fontFamily: "Nunito", fontSize: "11px", fontStyle: "700", color: "#2c3e50",
    }).setOrigin(0.5).setVisible(true);
    this.uiLayer.add(emoteText);

    const sprite = {
      body_img, shadow, nameTag, nameTagBg,
      emoteBubble: emoteImg, emoteText,
      _wasDead: false, _prevEmote: "",
    };
    this.playerSprites.set(id, sprite);

    // Spawn animation
    this.tweens.add({
      targets: body_img,
      scaleY: { from: 0.1, to: 1 },
      scaleX: { from: 1.5, to: 1 },
      duration: 250,
      ease: "Back.easeOut",
    });
  }

  // ── Platforms ──────────────────────────────────────────────────────────────

  syncPlatforms(state) {
    state.platforms.forEach((platform, id) => {
      if (!this.platformSprites.has(id)) {
        this.createPlatformSprite(id, platform);
      }
      const s = this.platformSprites.get(id);
      if (!s) return;

      s.x = platform.x;
      s.y = platform.y;

      if (platform.broken) {
        s.setAlpha(0.3);
      } else {
        s.setAlpha(1);
      }
    });
  }

  createPlatformSprite(id, platform) {
    const textureKey = `platform_${platform.type}` in this.textures.list
      ? `platform_${platform.type}` : "platform_static";

    const tiledW = Math.ceil(platform.width / 200);
    const g = this.add.graphics();

    // Draw platform at correct size
    const drawType = ["moving", "moving_y"].includes(platform.type) ? "moving" : platform.type;
    const key = `platform_${drawType}`;
    const validKey = this.textures.exists(key) ? key : "platform_static";

    // Use tileSprite for long platforms
    const ts = this.add.tileSprite(
      platform.x, platform.y,
      platform.width, platform.height,
      validKey
    ).setOrigin(0, 0);

    this.platformLayer.add(ts);
    this.platformSprites.set(id, ts);
  }

  // ── Switches ───────────────────────────────────────────────────────────────

  syncSwitches(state) {
    state.switches.forEach((sw, id) => {
      if (!this.switchSprites.has(id)) {
        this.createSwitchSprite(id, sw);
      }
      const s = this.switchSprites.get(id);
      if (!s) return;

      const wasActive = this.prevSwitchStates.get(id);
      if (sw.active !== wasActive) {
        s.body.setTexture(sw.active ? "switch_on" : "switch_off");
        if (sw.active) {
          this.particles.burst(sw.x + 30, sw.y, "switch");
          Sound.switchOn();
        }
        this.prevSwitchStates.set(id, sw.active);
      }
    });
  }

  createSwitchSprite(id, sw) {
    const body = this.add.image(sw.x + 30, sw.y + 14, "switch_off")
      .setDisplaySize(60, 28);
    this.switchLayer.add(body);

    const label = this.add.text(sw.x + 30, sw.y - 10, `×${sw.requiresCount}`, {
      fontFamily: "Nunito", fontSize: "11px", color: "#9e9890",
    }).setOrigin(0.5);
    this.switchLayer.add(label);

    this.switchSprites.set(id, { body, label });
    this.prevSwitchStates.set(id, false);
  }

  // ── Hazards ────────────────────────────────────────────────────────────────

  syncHazards(state) {
    state.hazards.forEach((hazard, id) => {
      if (!this.hazardSprites.has(id)) {
        this.createHazardSprite(id, hazard);
      }
      const s = this.hazardSprites.get(id);
      if (!s) return;

      if (hazard.type === "laser") {
        s.setAlpha(hazard.isOn ? 1 : 0.08);
        if (hazard.isOn !== s._wasOn) {
          s._wasOn = hazard.isOn;
          if (hazard.isOn) Sound.laser();
        }
      }

      if (hazard.rotationSpeed !== 0) {
        s.setAngle(hazard.angle);
      }
    });
  }

  createHazardSprite(id, hazard) {
    let sprite;

    switch (hazard.type) {
      case "spike": {
        // Tile spikes across width
        const g = this.add.graphics();
        g.fillStyle(0xff4757, 1);
        const count = Math.max(1, Math.floor(hazard.width / 20));
        for (let i = 0; i < count; i++) {
          const sx = hazard.x + i * 20;
          g.fillTriangle(sx + 2, hazard.y + hazard.height, sx + 10, hazard.y, sx + 18, hazard.y + hazard.height);
        }
          // strokeTriangle removed in Phaser 3.90 — spikes look fine fill-only
        this.hazardLayer.add(g);
        sprite = g;
        break;
      }

      case "laser": {
        // Detect orientation from dimensions: wide = horizontal, tall = vertical
        const isVert = hazard.height > hazard.width;
        let ts;
        if (isVert) {
          ts = this.add.tileSprite(hazard.x, hazard.y, 12, hazard.height, "laser_v").setOrigin(0, 0);
        } else {
          ts = this.add.tileSprite(hazard.x, hazard.y, hazard.width, 12, "laser_h").setOrigin(0, 0);
        }
        ts._wasOn = true;
        this.hazardLayer.add(ts);
        sprite = ts;
        break;
      }

      default: {
        const g = this.add.graphics();
        g.fillStyle(0xff4757, 1);
        g.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
        this.hazardLayer.add(g);
        sprite = g;
      }
    }

    this.hazardSprites.set(id, sprite);
  }

  // ── Doors ──────────────────────────────────────────────────────────────────

  syncDoors(state) {
    state.doors.forEach((door, id) => {
      if (!this.doorSprites.has(id)) {
        this.createDoorSprite(id, door);
      }
      const s = this.doorSprites.get(id);
      if (!s) return;

      const wasOpen = s._isOpen;
      if (door.isOpen !== wasOpen) {
        s._isOpen = door.isOpen;
        s.img.setTexture(door.isOpen ? "door_open" : "door_closed");
        if (door.isOpen) {
          this.particles.burst(door.x + door.width / 2, door.y, "door");
          Sound.doorOpen();
        }
      }
    });
  }

  createDoorSprite(id, door) {
    const img = this.add.image(door.x + door.width / 2, door.y + door.height / 2,
      door.isOpen ? "door_open" : "door_closed")
      .setDisplaySize(door.width, door.height);
    this.doorLayer.add(img);

    if (door.isExit) {
      const label = this.add.text(door.x + door.width / 2, door.y - 16, "EXIT", {
        fontFamily: "Nunito", fontSize: "11px", fontStyle: "700", color: "#27ae60",
      }).setOrigin(0.5);
      this.doorLayer.add(label);
    }

    this.doorSprites.set(id, { img, _isOpen: door.isOpen });
  }

  // ── Events ─────────────────────────────────────────────────────────────────

  onLevelClear(data) {
    Sound.levelClear();

    this.tweens.add({
      targets: this.clearOverlay,
      alpha: { from: 0, to: 0.6 },
      duration: 300,
      yoyo: true,
      hold: 800,
    });

    this.particles.confettiBurst(640, 360);

    this.time.delayedCall(2500, () => {
      this.scene.start("ResultsScene", data);
    });
  }

  flashDeathOverlay() {
    this.tweens.add({
      targets: this.deathFlash,
      alpha: { from: 0.4, to: 0 },
      duration: 400,
      ease: "Power2",
    });
  }

  // ── Cleanup on scene exit ──────────────────────────────────────────────────

  clearSprites() {
    [this.playerSprites, this.platformSprites, this.switchSprites,
     this.hazardSprites, this.doorSprites].forEach((map) => {
      map.forEach((s) => {
        if (s?.destroy) s.destroy();
        if (typeof s === "object") Object.values(s).forEach((v) => v?.destroy?.());
      });
      map.clear();
    });
  }
}