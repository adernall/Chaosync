/**
 * UIScene — Runs in parallel with GameScene.
 * Displays: player icons, level progress, death counter, emote keys.
 */

import Phaser from "phaser";
import { Network } from "../utils/NetworkManager.js";
import { Sound } from "../utils/SoundManager.js";
import { CHARACTERS } from "../utils/Characters.js";

const EMOTE_OPTIONS = ["HELP", "WAIT", "GO", "SORRY", "LOL"];

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene", active: false });
    this.playerIcons = new Map();
    this.stateListener = null;
    this.emoteWheelVisible = false;
  }

  create() {
    // Player icon strip (top-left)
    this.playerIconStrip = this.add.container(0, 0);
    this.iconBg = this.add.graphics();
    this.iconBg.fillStyle(0x000000, 0.3);
    this.iconBg.fillRoundedRect(10, 10, 300, 54, 10);

    // Death counter
    this.deathIcon = this.add.text(16, 74, "💀", { fontSize: "18px" });
    this.deathCount = this.add.text(40, 74, "0 deaths", {
      fontFamily: "Nunito", fontSize: "14px", color: "#ffffff",
      stroke: "#000000", strokeThickness: 3,
    });

    // Retry counter
    this.retryText = this.add.text(16, 96, "↺ 0 retries", {
      fontFamily: "Nunito", fontSize: "12px", color: "#cccccc",
      stroke: "#000000", strokeThickness: 2,
    });

    // Level name (top-center)
    this.levelName = this.add.text(640, 20, "", {
      fontFamily: "Nunito", fontSize: "15px", fontStyle: "700",
      color: "#ffffff", stroke: "#000000", strokeThickness: 3,
    }).setOrigin(0.5);

    // Timer (top-right)
    this.timerText = this.add.text(1260, 20, "0:00", {
      fontFamily: "Nunito", fontSize: "16px", fontStyle: "700",
      color: "#ffffff", stroke: "#000000", strokeThickness: 3,
    }).setOrigin(1, 0);

    // Emote wheel (hidden by default)
    this.emoteContainer = this.add.container(120, 360).setVisible(false);
    this.drawEmoteWheel();

    // Controls hint
    this.controlsHint = this.add.text(1260, 700, "E — Emote  |  WASD/Arrows — Move", {
      fontFamily: "Nunito", fontSize: "11px", color: "#ffffff",
      stroke: "#000000", strokeThickness: 2, alpha: 0.7,
    }).setOrigin(1, 1);

    // Sound toggle
    const soundBtn = this.add.text(1260, 672, "🔊", { fontSize: "18px" })
      .setOrigin(1, 1)
      .setInteractive({ cursor: "pointer" });
    soundBtn.on("pointerdown", () => {
      const on = Sound.toggle();
      soundBtn.setText(on ? "🔊" : "🔇");
    });

    // Network listeners
    this.stateListener = (state) => this.onStateChange(state);
    Network.on("stateChange", this.stateListener);

    // Emote key — listen in this scene's own keyboard
    this.input.keyboard.on("keydown-E", () => this.toggleEmoteWheel());
    EMOTE_OPTIONS.forEach((emote, i) => {
      this.input.keyboard.on(`keydown-${i + 1}`, () => {
        if (this.emoteWheelVisible) {
          Network.send("emote", { emote });
          Sound.emote();
          this.toggleEmoteWheel();
        }
      });
    });

    this.startTime = Date.now();
  }

  shutdown() {
    Network.off("stateChange", this.stateListener);
  }

  drawEmoteWheel() {
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(-90, -120, 180, 240, 14);
    this.emoteContainer.add(bg);

    const title = this.add.text(0, -100, "EMOTE", {
      fontFamily: "Nunito", fontSize: "11px", fontStyle: "700",
      color: "#aaaaaa", letterSpacing: 2,
    }).setOrigin(0.5);
    this.emoteContainer.add(title);

    EMOTE_OPTIONS.forEach((emote, i) => {
      const y = -75 + i * 38;

      const btn = this.add.text(0, y, `[${i + 1}] ${emote}`, {
        fontFamily: "Nunito", fontSize: "14px", fontStyle: "700", color: "#ffffff",
      }).setOrigin(0.5).setInteractive({ cursor: "pointer" });

      btn.on("pointerover", () => btn.setColor("#f5d76e"));
      btn.on("pointerout",  () => btn.setColor("#ffffff"));
      btn.on("pointerdown", () => {
        Network.send("emote", { emote });
        Sound.emote();
        this.toggleEmoteWheel();
      });

      this.emoteContainer.add(btn);
    });
  }

  toggleEmoteWheel() {
    this.emoteWheelVisible = !this.emoteWheelVisible;
    this.emoteContainer.setVisible(this.emoteWheelVisible);
    if (this.emoteWheelVisible) {
      this.tweens.add({
        targets: this.emoteContainer,
        scaleX: { from: 0.8, to: 1 },
        scaleY: { from: 0.8, to: 1 },
        alpha: { from: 0, to: 1 },
        duration: 150,
        ease: "Back.easeOut",
      });
    }
  }

  onStateChange(state) {
    if (!state) return;

    // Update player icons
    this.updatePlayerIcons(state);

    // Death/retry counters
    this.deathCount.setText(`${state.totalDeaths} deaths`);
    this.retryText.setText(`↺ ${state.retryCount} retries`);

    // Timer
    if (state.phase === "playing") {
      const elapsed = state.levelTime;
      const secs = Math.floor(elapsed / 1000);
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      this.timerText.setText(`${mins}:${String(s).padStart(2, "0")}`);
    }
  }

  updatePlayerIcons(state) {
    this.playerIconStrip.removeAll(false);
    const players = [...state.players.values()];

    // Resize background
    this.iconBg.clear();
    const iconW = players.length * 44 + 12;
    this.iconBg.fillStyle(0x000000, 0.3);
    this.iconBg.fillRoundedRect(10, 10, iconW, 54, 10);

    players.forEach((player, i) => {
      const x = 22 + i * 44;
      const y = 37;

      // Dead overlay
      const iconBg = this.add.graphics();
      iconBg.fillStyle(player.isDead ? 0x333333 : 0x000000, player.isDead ? 0.8 : 0.2);
      iconBg.fillCircle(x, y, 18);

      const charIcon = this.add.image(x, y, `char_${player.characterId}`)
        .setDisplaySize(28, 28)
        .setAlpha(player.isDead ? 0.3 : 1);

      // Ready/alive indicator dot
      const dot = this.add.graphics();
      dot.fillStyle(player.isDead ? 0xff4757 : 0x2ecc71, 1);
      dot.fillCircle(x + 12, y + 12, 5);
      // strokeCircle removed in Phaser 3.90 — dot outline skipped, fill only

      this.playerIconStrip.add([iconBg, charIcon, dot]);
    });
  }

  update() {
    // Pulse emote wheel if open
    if (this.emoteWheelVisible) {
      this.emoteContainer.y = 360 + Math.sin(Date.now() / 500) * 2;
    }
  }
}