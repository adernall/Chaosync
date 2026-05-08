/**
 * ResultsScene — Post-level results screen.
 * Shows: time, deaths, retries, funniest stats.
 */

import Phaser from "phaser";
import { Network } from "../utils/NetworkManager.js";
import { Sound } from "../utils/SoundManager.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super("ResultsScene");
  }

  init(data) {
    this.resultData = data || {};
  }

  create() {
    this.add.tileSprite(0, 0, 1280, 720, "bg_tile").setOrigin(0, 0).setAlpha(0.5);

    const strip = this.add.graphics();
    strip.fillStyle(0x2ecc71, 1);
    strip.fillRect(0, 0, 1280, 8);

    this.particles = new ParticleSystem(this);
    this.particles.confettiBurst(640, 0);

    Sound.levelClear();

    // ── Card ──────────────────────────────────────────────────────────────

    const card = this.add.graphics();
    card.fillStyle(0xffffff, 0.97);
    card.fillRoundedRect(340, 80, 600, 480, 24);
    card.lineStyle(3, 0xe8e2dc, 1);
    card.strokeRoundedRect(340, 80, 600, 480, 24);

    // ── Header ────────────────────────────────────────────────────────────

    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x2ecc71, 1);
    headerBg.fillRoundedRect(340, 80, 600, 80, 24);
    headerBg.fillRect(340, 128, 600, 32);

    this.add.text(640, 120, "LEVEL CLEARED!", {
      fontFamily: "Nunito", fontSize: "34px", fontStyle: "900", color: "#ffffff",
    }).setOrigin(0.5);

    // ── Stats ─────────────────────────────────────────────────────────────

    const state = Network.state;
    const time = this.resultData.time || 0;
    const deaths = state?.totalDeaths || this.resultData.deaths || 0;
    const retries = state?.retryCount || this.resultData.retries || 0;

    const secs = Math.floor(time / 1000);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    const timeStr = `${mins}:${String(s).padStart(2, "0")}`;

    const stats = [
      { label: "Time",         value: timeStr,          icon: "⏱️" },
      { label: "Team Deaths",  value: `${deaths}`,      icon: "💀" },
      { label: "Retries",      value: `${retries}`,     icon: "↺" },
    ];

    stats.forEach((stat, i) => {
      const y = 220 + i * 90;

      const rowBg = this.add.graphics();
      rowBg.fillStyle(i % 2 === 0 ? 0xf8f5f0 : 0xffffff, 1);
      rowBg.fillRoundedRect(360, y - 24, 560, 70, 10);

      this.add.text(390, y + 11, stat.icon, { fontSize: "24px" }).setOrigin(0, 0.5);
      this.add.text(430, y + 11, stat.label, {
        fontFamily: "Nunito", fontSize: "18px", fontStyle: "700", color: "#7f8c8d",
      }).setOrigin(0, 0.5);
      const valText = this.add.text(900, y + 11, stat.value, {
        fontFamily: "Nunito", fontSize: "24px", fontStyle: "900", color: "#2c3e50",
      }).setOrigin(1, 0.5);

      // Animate value in
      this.tweens.add({
        targets: valText,
        scaleX: { from: 1.3, to: 1 },
        scaleY: { from: 1.3, to: 1 },
        duration: 300,
        delay: 200 + i * 120,
        ease: "Back.easeOut",
      });
    });

    // Fun comment
    const comment = this.getFunComment(deaths, retries);
    this.add.text(640, 504, `"${comment}"`, {
      fontFamily: "Nunito", fontSize: "15px", fontStyle: "italic", color: "#9e9890",
    }).setOrigin(0.5);

    // ── Buttons ───────────────────────────────────────────────────────────

    const myPlayer = state?.players.get(Network.sessionId);
    const isHost = myPlayer?.isHost || false;

    if (isHost) {
      const nextBtn = this.add.container(530, 530);
      const nextBg = this.add.graphics();
      nextBg.fillStyle(0xff6b6b, 1);
      nextBg.fillRoundedRect(-100, -26, 200, 52, 12);
      nextBg.fillStyle(0xff8585, 0.4);
      nextBg.fillRoundedRect(-96, -22, 192, 20, 8);
      const nextText = this.add.text(0, 0, "NEXT LEVEL →", {
        fontFamily: "Nunito", fontSize: "16px", fontStyle: "900", color: "#ffffff",
      }).setOrigin(0.5);
      nextBtn.add([nextBg, nextText]);
      nextBtn.setInteractive(new Phaser.Geom.Rectangle(-100, -26, 200, 52), Phaser.Geom.Rectangle.Contains);
      nextBtn.on("pointerover", () => this.tweens.add({ targets: nextBtn, scaleX: 1.05, scaleY: 1.05, duration: 80 }));
      nextBtn.on("pointerout",  () => this.tweens.add({ targets: nextBtn, scaleX: 1, scaleY: 1, duration: 80 }));
      nextBtn.on("pointerdown", () => {
        Sound.click();
        Network.send("next_level");
        this.scene.start("LobbyScene");
      });

      const lobbyBtn = this.add.container(750, 530);
      const lobbyBg = this.add.graphics();
      lobbyBg.fillStyle(0xffffff, 1);
      lobbyBg.fillRoundedRect(-100, -26, 200, 52, 12);
      lobbyBg.lineStyle(2, 0xe0d8d0, 1);
      lobbyBg.strokeRoundedRect(-100, -26, 200, 52, 12);
      const lobbyText = this.add.text(0, 0, "LOBBY", {
        fontFamily: "Nunito", fontSize: "16px", fontStyle: "700", color: "#7f8c8d",
      }).setOrigin(0.5);
      lobbyBtn.add([lobbyBg, lobbyText]);
      lobbyBtn.setInteractive(new Phaser.Geom.Rectangle(-100, -26, 200, 52), Phaser.Geom.Rectangle.Contains);
      lobbyBtn.on("pointerdown", () => {
        Sound.click();
        this.scene.start("LobbyScene");
      });
    } else {
      this.add.text(640, 535, "Waiting for host to continue...", {
        fontFamily: "Nunito", fontSize: "15px", color: "#9e9890",
      }).setOrigin(0.5);
    }

    // Slide card in
    this.tweens.add({
      targets: [card, headerBg],
      y: { from: -200, to: 0 },
      duration: 500,
      ease: "Back.easeOut",
    });

    // Listen for next level start
    this.stateListener = (state) => {
      if (state.phase === "countdown" || state.phase === "playing") {
        Network.off("stateChange", this.stateListener);
        if (state.phase === "playing") {
          this.scene.start("GameScene");
        } else {
          this.scene.start("LobbyScene");
        }
      }
    };
    Network.on("stateChange", this.stateListener);
  }

  getFunComment(deaths, retries) {
    if (deaths === 0)  return "Flawless. Are you even human?";
    if (deaths <= 3)   return "Barely any chaos. Disappointing.";
    if (deaths <= 8)   return "Classic. Absolute chaos as expected.";
    if (deaths <= 20)  return "Spectacular disaster. We're proud.";
    if (deaths <= 40)  return "Is this a game or a funeral?";
    return "Historians will write about this.";
  }

  shutdown() {
    if (this.stateListener) Network.off("stateChange", this.stateListener);
  }
}
