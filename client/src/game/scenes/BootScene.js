/**
 * BootScene — Procedurally generates ALL game textures using Phaser Graphics API.
 * NO external image assets required. Everything drawn in code.
 */

import Phaser from "phaser";
import { CHARACTERS } from "../utils/Characters.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.generateAllTextures();
    this.scene.start("PreloadScene");
  }

  generateAllTextures() {
    this.generatePlatformTextures();
    this.generateHazardTextures();
    this.generateCharacterTextures();
    this.generateUITextures();
    this.generateParticleTextures();
    this.generateLevelObjectTextures();
  }

  // ── Platforms ─────────────────────────────────────────────────────────────

  generatePlatformTextures() {
    const types = [
      { key: "platform_static",   fill: 0xd4cfc8, stroke: 0x9e9890 },
      { key: "platform_moving",   fill: 0xf5d76e, stroke: 0xd4a017 },
      { key: "platform_conveyor", fill: 0x7ec8e3, stroke: 0x2980b9 },
      { key: "platform_ice",      fill: 0xdaf3ff, stroke: 0x74c7e8 },
      { key: "platform_falling",  fill: 0xe8a87c, stroke: 0xc06030 },
    ];

    types.forEach(({ key, fill, stroke }) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Shadow
      g.fillStyle(0x000000, 0.12);
      g.fillRoundedRect(4, 6, 200, 28, 6);
      // Body
      g.fillStyle(fill, 1);
      g.fillRoundedRect(0, 0, 200, 28, 6);
      // Top highlight
      g.fillStyle(0xffffff, 0.3);
      g.fillRoundedRect(4, 2, 192, 8, 4);
      // Stroke
      g.lineStyle(2, stroke, 1);
      g.strokeRoundedRect(0, 0, 200, 28, 6);

      // Conveyor arrows
      if (key === "platform_conveyor") {
        g.fillStyle(0x2980b9, 0.5);
        for (let i = 10; i < 200; i += 30) {
          g.fillTriangle(i, 8, i + 14, 14, i, 20);
        }
      }

      // Ice sparkle
      if (key === "platform_ice") {
        g.fillStyle(0xffffff, 0.8);
        for (let i = 0; i < 5; i++) {
          const sx = 20 + i * 35;
          g.fillRect(sx, 5, 2, 2);
          g.fillRect(sx + 5, 10, 2, 2);
        }
      }

      g.generateTexture(key, 200, 34);
      g.destroy();
    });
  }

  // ── Hazards ───────────────────────────────────────────────────────────────

  generateHazardTextures() {
    // Spikes (1 unit = 20px wide, 28px tall)
    const sg = this.make.graphics({ x: 0, y: 0, add: false });
    sg.fillStyle(0xff4757, 1);
    for (let i = 0; i < 5; i++) {
      const sx = i * 20;
      sg.fillTriangle(sx + 2, 28, sx + 10, 0, sx + 18, 28);
    }
    // No strokeTriangle in Phaser 3.90 — outline baked into fill shape above
    sg.generateTexture("spike_unit", 100, 28);
    sg.destroy();

    // Laser beam (horizontal)
    const lg = this.make.graphics({ x: 0, y: 0, add: false });
    lg.fillStyle(0xff0040, 0.15);
    lg.fillRect(0, 0, 200, 12);
    lg.fillStyle(0xff0040, 1);
    lg.fillRect(0, 4, 200, 4);
    lg.fillStyle(0xffffff, 0.8);
    lg.fillRect(0, 5, 200, 2);
    lg.generateTexture("laser_h", 200, 12);
    lg.destroy();

    // Laser vertical
    const lvg = this.make.graphics({ x: 0, y: 0, add: false });
    lvg.fillStyle(0xff0040, 0.15);
    lvg.fillRect(0, 0, 12, 200);
    lvg.fillStyle(0xff0040, 1);
    lvg.fillRect(4, 0, 4, 200);
    lvg.fillStyle(0xffffff, 0.8);
    lvg.fillRect(5, 0, 2, 200);
    lvg.generateTexture("laser_v", 12, 200);
    lvg.destroy();

    // Crusher wall
    const cg = this.make.graphics({ x: 0, y: 0, add: false });
    cg.fillStyle(0x555566, 1);
    cg.fillRoundedRect(0, 0, 40, 200, 4);
    cg.fillStyle(0x333344, 1);
    for (let i = 0; i < 10; i++) {
      cg.fillRect(4, i * 20 + 4, 32, 12);
    }
    cg.lineStyle(2, 0x222233, 1);
    cg.strokeRoundedRect(0, 0, 40, 200, 4);
    cg.generateTexture("crusher", 40, 200);
    cg.destroy();
  }

  // ── Characters ────────────────────────────────────────────────────────────

  generateCharacterTextures() {
    CHARACTERS.forEach((char, idx) => {
      this.generateCharSprite(`char_${idx}`, char.color, char.eyeStyle, char.outline);
      this.generateCharSprite(`char_${idx}_dead`, char.color, char.eyeStyle, char.outline, true);
    });

    // Generic shadow
    const sg = this.make.graphics({ x: 0, y: 0, add: false });
    sg.fillStyle(0x000000, 0.2);
    sg.fillEllipse(16, 4, 26, 8);
    sg.generateTexture("char_shadow", 32, 8);
    sg.destroy();
  }

  generateCharSprite(key, color, eyeStyle, outline, dead = false) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const W = 32, H = 32;

    if (dead) {
      // X eyes, tipped over, faded
      g.fillStyle(color, 0.5);
      g.fillRoundedRect(2, 2, W - 4, H - 4, 6);
      g.lineStyle(2, outline, 0.5);
      g.strokeRoundedRect(2, 2, W - 4, H - 4, 6);
      // X eyes using fillRect rotated approximation
      g.fillStyle(0x000000, 0.6);
      // Left X
      g.fillRect(9,  10, 6, 2); g.fillRect(9,  13, 6, 2);
      g.fillRect(9,  10, 2, 5); g.fillRect(13, 10, 2, 5);
      // Right X  
      g.fillRect(18, 10, 6, 2); g.fillRect(18, 13, 6, 2);
      g.fillRect(18, 10, 2, 5); g.fillRect(22, 10, 2, 5);
    } else {
      // Body
      g.fillStyle(color, 1);
      g.fillRoundedRect(2, 2, W - 4, H - 4, 6);

      // Top shine
      g.fillStyle(0xffffff, 0.25);
      g.fillRoundedRect(5, 4, W - 14, 8, 3);

      // Outline
      g.lineStyle(2.5, outline, 1);
      g.strokeRoundedRect(2, 2, W - 4, H - 4, 6);

      // Eyes based on style
      this.drawEyes(g, eyeStyle, W, H);

      // Bottom mouth - use fillRect instead of strokeLine
      g.fillStyle(outline, 0.4);
      g.fillRect(10, H - 9, W - 20, 2);
    }

    g.generateTexture(key, W, H);
    g.destroy();
  }

  drawEyes(g, style, W, H) {
    const eyeY = H / 2 - 2;
    g.fillStyle(0x000000, 0.85);

    switch (style) {
      case "round":
        g.fillCircle(10, eyeY, 3);
        g.fillCircle(22, eyeY, 3);
        g.fillStyle(0xffffff, 0.9);
        g.fillCircle(11, eyeY - 1, 1);
        g.fillCircle(23, eyeY - 1, 1);
        break;
      case "dot":
        g.fillCircle(10, eyeY, 2);
        g.fillCircle(22, eyeY, 2);
        break;
      case "wide":
        g.fillRect(7, eyeY - 2, 6, 4);
        g.fillRect(19, eyeY - 2, 6, 4);
        break;
      case "sleepy":
        // Use fillRect instead of strokeLine — works in all Phaser versions
        g.fillStyle(0x000000, 0.85);
        g.fillRect(8,  eyeY - 1, 6, 2);
        g.fillRect(19, eyeY - 1, 6, 2);
        break;
      case "star":
        g.fillStyle(0x000000, 0.85);
        g.fillCircle(10, eyeY, 3);
        g.fillCircle(22, eyeY, 3);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(10, eyeY, 1.5);
        g.fillCircle(22, eyeY, 1.5);
        break;
      case "cat":
        g.fillTriangle(7, eyeY + 2, 10, eyeY - 3, 13, eyeY + 2);
        g.fillTriangle(19, eyeY + 2, 22, eyeY - 3, 25, eyeY + 2);
        break;
      case "angry":
        g.fillCircle(10, eyeY, 3);
        g.fillCircle(22, eyeY, 3);
        // Angry brows as filled triangles instead of strokeLine
        g.fillStyle(0x000000, 0.85);
        g.fillTriangle(7, eyeY - 2, 13, eyeY - 4, 13, eyeY - 2);
        g.fillTriangle(19, eyeY - 4, 25, eyeY - 2, 19, eyeY - 2);
        break;
      default:
        g.fillCircle(10, eyeY, 3);
        g.fillCircle(22, eyeY, 3);
    }
  }

  // ── UI Textures ───────────────────────────────────────────────────────────

  generateUITextures() {
    // Button normal
    const bg = this.make.graphics({ x: 0, y: 0, add: false });
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(0, 0, 200, 50, 12);
    bg.lineStyle(2.5, 0xd4cfc8, 1);
    bg.strokeRoundedRect(0, 0, 200, 50, 12);
    bg.generateTexture("btn_normal", 200, 50);
    bg.destroy();

    // Button hover
    const bh = this.make.graphics({ x: 0, y: 0, add: false });
    bh.fillStyle(0xf5f0ea, 1);
    bh.fillRoundedRect(0, 0, 200, 50, 12);
    bh.lineStyle(2.5, 0xb0a898, 1);
    bh.strokeRoundedRect(0, 0, 200, 50, 12);
    bh.generateTexture("btn_hover", 200, 50);
    bh.destroy();

    // Button primary (colored)
    const bp = this.make.graphics({ x: 0, y: 0, add: false });
    bp.fillStyle(0xff6b6b, 1);
    bp.fillRoundedRect(0, 0, 200, 50, 12);
    bp.fillStyle(0xff8e8e, 1);
    bp.fillRoundedRect(4, 4, 192, 20, 8);
    bp.lineStyle(2, 0xd94040, 1);
    bp.strokeRoundedRect(0, 0, 200, 50, 12);
    bp.generateTexture("btn_primary", 200, 50);
    bp.destroy();

    // Card background
    const cg = this.make.graphics({ x: 0, y: 0, add: false });
    cg.fillStyle(0xffffff, 0.95);
    cg.fillRoundedRect(0, 0, 400, 500, 20);
    cg.lineStyle(2, 0xe8e2dc, 1);
    cg.strokeRoundedRect(0, 0, 400, 500, 20);
    cg.generateTexture("card_bg", 400, 500);
    cg.destroy();

    // Ready badge
    const rg = this.make.graphics({ x: 0, y: 0, add: false });
    rg.fillStyle(0x2ecc71, 1);
    rg.fillRoundedRect(0, 0, 70, 26, 6);
    rg.generateTexture("badge_ready", 70, 26);
    rg.destroy();

    // Waiting badge
    const wg = this.make.graphics({ x: 0, y: 0, add: false });
    wg.fillStyle(0xbdc3c7, 1);
    wg.fillRoundedRect(0, 0, 70, 26, 6);
    wg.generateTexture("badge_waiting", 70, 26);
    wg.destroy();

    // Host crown
    const hg = this.make.graphics({ x: 0, y: 0, add: false });
    hg.fillStyle(0xf39c12, 1);
    hg.fillTriangle(0, 16, 8, 0, 16, 16);
    hg.fillTriangle(12, 16, 20, 4, 28, 16);
    hg.fillTriangle(24, 16, 32, 0, 40, 16);
    hg.fillRect(0, 14, 40, 8);
    hg.generateTexture("host_crown", 40, 22);
    hg.destroy();

    // Character select frame
    const cf = this.make.graphics({ x: 0, y: 0, add: false });
    cf.fillStyle(0xffffff, 1);
    cf.fillRoundedRect(0, 0, 80, 80, 10);
    cf.lineStyle(3, 0xe0d8d0, 1);
    cf.strokeRoundedRect(0, 0, 80, 80, 10);
    cf.generateTexture("char_frame", 80, 80);
    cf.destroy();

    // Character select frame (selected)
    const cfs = this.make.graphics({ x: 0, y: 0, add: false });
    cfs.fillStyle(0xfff5e0, 1);
    cfs.fillRoundedRect(0, 0, 80, 80, 10);
    cfs.lineStyle(3.5, 0xf39c12, 1);
    cfs.strokeRoundedRect(0, 0, 80, 80, 10);
    cfs.generateTexture("char_frame_selected", 80, 80);
    cfs.destroy();

    // Room code box
    const rcg = this.make.graphics({ x: 0, y: 0, add: false });
    rcg.fillStyle(0xf5f0ea, 1);
    rcg.fillRoundedRect(0, 0, 260, 60, 10);
    rcg.lineStyle(2, 0xd4cfc8, 1);
    rcg.strokeRoundedRect(0, 0, 260, 60, 10);
    rcg.generateTexture("room_code_box", 260, 60);
    rcg.destroy();

    // Switch (pressure plate)
    const swg = this.make.graphics({ x: 0, y: 0, add: false });
    swg.fillStyle(0xf39c12, 1);
    swg.fillRoundedRect(0, 4, 60, 24, 4);
    swg.fillStyle(0xe67e22, 1);
    swg.fillRoundedRect(4, 8, 52, 16, 3);
    swg.lineStyle(2, 0xd35400, 1);
    swg.strokeRoundedRect(0, 4, 60, 24, 4);
    swg.generateTexture("switch_off", 60, 28);
    swg.destroy();

    const swon = this.make.graphics({ x: 0, y: 0, add: false });
    swon.fillStyle(0x2ecc71, 1);
    swon.fillRoundedRect(0, 8, 60, 20, 4);
    swon.fillStyle(0x27ae60, 1);
    swon.fillRoundedRect(4, 12, 52, 12, 3);
    swon.lineStyle(2, 0x1e8449, 1);
    swon.strokeRoundedRect(0, 8, 60, 20, 4);
    swon.generateTexture("switch_on", 60, 28);
    swon.destroy();

    // Door (closed)
    const dg = this.make.graphics({ x: 0, y: 0, add: false });
    dg.fillStyle(0x7f8c8d, 1);
    dg.fillRoundedRect(0, 0, 60, 80, 6);
    dg.fillStyle(0x95a5a6, 1);
    dg.fillRect(6, 6, 48, 68);
    dg.fillStyle(0xf39c12, 1);
    dg.fillCircle(48, 40, 4);
    dg.lineStyle(2, 0x2c3e50, 1);
    dg.strokeRoundedRect(0, 0, 60, 80, 6);
    dg.generateTexture("door_closed", 60, 80);
    dg.destroy();

    // Door (open / exit)
    const dog = this.make.graphics({ x: 0, y: 0, add: false });
    dog.fillStyle(0x2ecc71, 1);
    dog.fillRoundedRect(0, 0, 60, 80, 6);
    dog.fillStyle(0x1a1a2e, 0.9);
    dog.fillRect(6, 6, 48, 68);
    // Glowing lines
    dog.fillStyle(0x2ecc71, 0.4);
    for (let i = 0; i < 5; i++) dog.fillRect(10, 12 + i * 14, 40, 4);
    dog.lineStyle(2.5, 0x27ae60, 1);
    dog.strokeRoundedRect(0, 0, 60, 80, 6);
    dog.generateTexture("door_open", 60, 80);
    dog.destroy();

    // Checkpoint flag
    const fg = this.make.graphics({ x: 0, y: 0, add: false });
    fg.fillStyle(0x3498db, 1);
    fg.fillTriangle(6, 0, 40, 12, 6, 24);
    fg.fillStyle(0x7f8c8d, 1);
    fg.fillRect(2, 0, 4, 60);
    fg.generateTexture("checkpoint", 44, 60);
    fg.destroy();

    // Checkpoint (activated)
    const fga = this.make.graphics({ x: 0, y: 0, add: false });
    fga.fillStyle(0xf39c12, 1);
    fga.fillTriangle(6, 0, 40, 12, 6, 24);
    fga.fillStyle(0x7f8c8d, 1);
    fga.fillRect(2, 0, 4, 60);
    fga.generateTexture("checkpoint_active", 44, 60);
    fga.destroy();

    // Nametag bg
    const ng = this.make.graphics({ x: 0, y: 0, add: false });
    ng.fillStyle(0x000000, 0.55);
    ng.fillRoundedRect(0, 0, 100, 22, 6);
    ng.generateTexture("nametag_bg", 100, 22);
    ng.destroy();

    // Emote bubble
    const eg = this.make.graphics({ x: 0, y: 0, add: false });
    eg.fillStyle(0xffffff, 0.95);
    eg.fillRoundedRect(0, 0, 80, 28, 8);
    eg.fillStyle(0xffffff, 0.95);
    eg.fillTriangle(10, 28, 24, 28, 16, 38);
    eg.lineStyle(1.5, 0xd4cfc8, 1);
    eg.strokeRoundedRect(0, 0, 80, 28, 8);
    eg.generateTexture("emote_bubble", 80, 38);
    eg.destroy();

    // Confetti piece
    const confG = this.make.graphics({ x: 0, y: 0, add: false });
    confG.fillStyle(0xff6b6b, 1);
    confG.fillRect(0, 0, 8, 8);
    confG.generateTexture("confetti_red", 8, 8);
    confG.destroy();

    const confG2 = this.make.graphics({ x: 0, y: 0, add: false });
    confG2.fillStyle(0xf5d76e, 1);
    confG2.fillRect(0, 0, 6, 10);
    confG2.generateTexture("confetti_yellow", 6, 10);
    confG2.destroy();

    const confG3 = this.make.graphics({ x: 0, y: 0, add: false });
    confG3.fillStyle(0x7ec8e3, 1);
    confG3.fillCircle(5, 5, 5);
    confG3.generateTexture("confetti_blue", 10, 10);
    confG3.destroy();

    const confG4 = this.make.graphics({ x: 0, y: 0, add: false });
    confG4.fillStyle(0x2ecc71, 1);
    confG4.fillTriangle(0, 10, 5, 0, 10, 10);
    confG4.generateTexture("confetti_green", 10, 10);
    confG4.destroy();
  }

  // ── Particles ─────────────────────────────────────────────────────────────

  generateParticleTextures() {
    const pColors = [
      { key: "particle_white", color: 0xffffff },
      { key: "particle_red",   color: 0xff6b6b },
      { key: "particle_yellow",color: 0xf5d76e },
      { key: "particle_blue",  color: 0x7ec8e3 },
      { key: "particle_green", color: 0x2ecc71 },
      { key: "particle_dust",  color: 0xd4cfc8 },
    ];

    pColors.forEach(({ key, color }) => {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(color, 1);
      g.fillCircle(6, 6, 6);
      g.generateTexture(key, 12, 12);
      g.destroy();
    });

    // Star particle
    const sg = this.make.graphics({ x: 0, y: 0, add: false });
    // fillStar removed in Phaser 3.90 — draw star manually with triangles
    sg.fillStyle(0xf5d76e, 1);
    sg.fillTriangle(8, 0, 10, 6, 6, 6);   // top spike
    sg.fillTriangle(8,16, 10,10, 6,10);   // bottom spike
    sg.fillTriangle(0, 8,  6, 6,  6,10);  // left spike
    sg.fillTriangle(16,8, 10, 6, 10,10);  // right spike
    sg.fillRect(5, 5, 6, 6);              // center square
    sg.generateTexture("particle_star", 16, 16);
    sg.destroy();
  }

  // ── Level Objects ─────────────────────────────────────────────────────────

  generateLevelObjectTextures() {
    // Background tile (soft grid)
    const tg = this.make.graphics({ x: 0, y: 0, add: false });
    tg.fillStyle(0xf0ede8, 1);
    tg.fillRect(0, 0, 64, 64);
    // strokeRect removed — use strokeRoundedRect with radius 0
    tg.lineStyle(1, 0xe8e2dc, 0.5);
    tg.strokeRoundedRect(0, 0, 64, 64, 0);
    tg.generateTexture("bg_tile", 64, 64);
    tg.destroy();

    // Death flash overlay
    const dg = this.make.graphics({ x: 0, y: 0, add: false });
    dg.fillStyle(0xff4757, 0.3);
    dg.fillRect(0, 0, 1280, 720);
    dg.generateTexture("death_flash", 1280, 720);
    dg.destroy();

    // Level clear overlay
    const lg = this.make.graphics({ x: 0, y: 0, add: false });
    lg.fillStyle(0x2ecc71, 0.15);
    lg.fillRect(0, 0, 1280, 720);
    lg.generateTexture("clear_overlay", 1280, 720);
    lg.destroy();

    // Countdown overlay
    const cg = this.make.graphics({ x: 0, y: 0, add: false });
    cg.fillStyle(0x000000, 0.5);
    cg.fillRect(0, 0, 1280, 720);
    cg.generateTexture("countdown_overlay", 1280, 720);
    cg.destroy();

    // World label bg
    const wg = this.make.graphics({ x: 0, y: 0, add: false });
    wg.fillStyle(0x1a1a2e, 0.85);
    wg.fillRoundedRect(0, 0, 300, 60, 12);
    wg.generateTexture("world_label_bg", 300, 60);
    wg.destroy();
  }
}