/**
 * LobbyScene — Shows room code, player list, ready status, level selection.
 */

import Phaser from "phaser";
import { Network } from "../utils/NetworkManager.js";
import { Sound } from "../utils/SoundManager.js";
import { CHARACTERS } from "../utils/Characters.js";

const LEVEL_NAMES = [
  "First Steps", "Stack Attack", "The Switch",
  "Moving Day", "Spike Hop", "Conveyor Chaos",
  "Ice Ice Baby", "Falling Together",
  "Two Button Problem", "Timed Release",
  "Everything At Once",
  "Tower of Trust",
  "Beautiful Disaster",
];

export class LobbyScene extends Phaser.Scene {
  constructor() {
    super("LobbyScene");
    this.playerCards = new Map();
    this.prevPlayerCount = 0;
    this.localIsReady = false;
    this.selectedLevel = 0;
    this.stateListener = null;
  }

  create() {
    if (!Network.isConnected) {
      this.scene.start("MainMenuScene");
      return;
    }

    this.drawBackground();
    this.drawRoomCode();
    this.drawPlayerList();
    this.drawControls();
    this.drawLevelSelect();

    // State sync
    this.stateListener = (state) => this.onStateChange(state);
    Network.on("stateChange", this.stateListener);

    // Initial render
    if (Network.state) this.onStateChange(Network.state);
  }

  shutdown() {
    Network.off("stateChange", this.stateListener);
  }

  drawBackground() {
    this.add.tileSprite(0, 0, 1280, 720, "bg_tile").setOrigin(0, 0).setAlpha(0.5);
    const strip = this.add.graphics();
    strip.fillStyle(0xff6b6b, 1);
    strip.fillRect(0, 0, 1280, 6);
    strip.fillStyle(0x1a1a2e, 0.04);
    strip.fillRect(0, 6, 1280, 714);
  }

  drawRoomCode() {
    const state = Network.state;
    const roomId = Network.room?.id || "------";

    this.add.text(640, 48, "ROOM CODE", {
      fontFamily: "Nunito", fontSize: "12px", fontStyle: "700",
      color: "#9e9890", letterSpacing: 3,
    }).setOrigin(0.5);

    // Code box
    const codeBg = this.add.graphics();
    codeBg.fillStyle(0xffffff, 1);
    codeBg.fillRoundedRect(490, 60, 300, 70, 14);
    codeBg.lineStyle(2.5, 0xff6b6b, 1);
    codeBg.strokeRoundedRect(490, 60, 300, 70, 14);

    this.add.text(640, 95, roomId.toUpperCase(), {
      fontFamily: "Nunito", fontSize: "38px", fontStyle: "900",
      color: "#ff6b6b", letterSpacing: 8,
    }).setOrigin(0.5);

    this.add.text(640, 142, "Share this code with friends →", {
      fontFamily: "Nunito", fontSize: "13px", color: "#9e9890",
    }).setOrigin(0.5);
  }

  drawPlayerList() {
    this.add.text(140, 185, "PLAYERS", {
      fontFamily: "Nunito", fontSize: "12px", fontStyle: "700",
      color: "#9e9890", letterSpacing: 3,
    }).setOrigin(0.5);

    this.playerListContainer = this.add.container(0, 0);

    // 8 empty slots
    for (let i = 0; i < 8; i++) {
      const row = i % 4;
      const col = Math.floor(i / 4);
      const x = 40 + col * 270;
      const y = 205 + row * 82;

      const slotBg = this.add.graphics();
      slotBg.fillStyle(0xffffff, 0.5);
      slotBg.fillRoundedRect(x, y, 250, 70, 10);
      slotBg.lineStyle(1.5, 0xe8e2dc, 1);
      slotBg.strokeRoundedRect(x, y, 250, 70, 10);

      this.add.text(x + 125, y + 35, "Waiting...", {
        fontFamily: "Nunito", fontSize: "14px", color: "#c8c0b8",
      }).setOrigin(0.5);
    }
  }

  drawControls() {
    const cx = 640;
    const y = 560;

    // Ready button
    this.readyBtn = this.add.container(cx - 120, y);
    const readyBg = this.add.graphics();
    this.readyBgRef = readyBg;
    readyBg.fillStyle(0x2ecc71, 1);
    readyBg.fillRoundedRect(-110, -26, 220, 52, 12);
    this.readyBtnText = this.add.text(0, 0, "✓  READY", {
      fontFamily: "Nunito", fontSize: "17px", fontStyle: "900", color: "#ffffff",
    }).setOrigin(0.5);
    this.readyBtn.add([readyBg, this.readyBtnText]);
    this.readyBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -26, 220, 52), Phaser.Geom.Rectangle.Contains);
    this.readyBtn.on("pointerover", () => { this.tweens.add({ targets: this.readyBtn, scaleX: 1.05, scaleY: 1.05, duration: 80 }); });
    this.readyBtn.on("pointerout",  () => { this.tweens.add({ targets: this.readyBtn, scaleX: 1, scaleY: 1, duration: 80 }); });
    this.readyBtn.on("pointerdown", () => { this.toggleReady(); Sound.ready(); });

    // Start button (host only)
    this.startBtn = this.add.container(cx + 120, y);
    const startBg = this.add.graphics();
    startBg.fillStyle(0xff6b6b, 1);
    startBg.fillRoundedRect(-110, -26, 220, 52, 12);
    startBg.fillStyle(0xff8585, 0.4);
    startBg.fillRoundedRect(-106, -22, 212, 20, 8);
    const startText = this.add.text(0, 0, "▶  START GAME", {
      fontFamily: "Nunito", fontSize: "17px", fontStyle: "900", color: "#ffffff",
    }).setOrigin(0.5);
    this.startBtn.add([startBg, startText]);
    this.startBtn.setInteractive(new Phaser.Geom.Rectangle(-110, -26, 220, 52), Phaser.Geom.Rectangle.Contains);
    this.startBtn.on("pointerover", () => { this.tweens.add({ targets: this.startBtn, scaleX: 1.05, scaleY: 1.05, duration: 80 }); });
    this.startBtn.on("pointerout",  () => { this.tweens.add({ targets: this.startBtn, scaleX: 1, scaleY: 1, duration: 80 }); });
    this.startBtn.on("pointerdown", () => { Network.send("start_game"); Sound.click(); });
    this.startBtn.setVisible(false); // hidden until state update

    // Leave
    const leaveBtn = this.add.text(640, 630, "← Leave Room", {
      fontFamily: "Nunito", fontSize: "14px", color: "#b0a898",
    }).setOrigin(0.5).setInteractive({ cursor: "pointer" });
    leaveBtn.on("pointerover", () => leaveBtn.setColor("#ff6b6b"));
    leaveBtn.on("pointerout",  () => leaveBtn.setColor("#b0a898"));
    leaveBtn.on("pointerdown", () => {
      Network.leaveRoom();
      this.scene.start("MainMenuScene");
    });

    // Countdown overlay (hidden)
    this.countdownOverlay = this.add.container(0, 0).setVisible(false);
    const cdBg = this.add.graphics();
    cdBg.fillStyle(0x000000, 0.65);
    cdBg.fillRect(0, 0, 1280, 720);
    this.cdNumber = this.add.text(640, 320, "3", {
      fontFamily: "Nunito", fontSize: "160px", fontStyle: "900", color: "#ffffff",
    }).setOrigin(0.5);
    this.cdLabel = this.add.text(640, 460, "GET READY!", {
      fontFamily: "Nunito", fontSize: "28px", fontStyle: "700", color: "#ff6b6b",
    }).setOrigin(0.5);
    this.countdownOverlay.add([cdBg, this.cdNumber, this.cdLabel]);
  }

  drawLevelSelect() {
    const x = 790;

    this.add.text(x + 180, 185, "SELECT LEVEL", {
      fontFamily: "Nunito", fontSize: "12px", fontStyle: "700",
      color: "#9e9890", letterSpacing: 3,
    }).setOrigin(0.5);

    this.levelBtns = [];
    const worlds = [1, 2, 3, 4, 5, 6, 7];
    worlds.forEach((w, wi) => {
      const lx = x + (wi % 4) * 110 + 55;
      const ly = 215 + Math.floor(wi / 4) * 55;

      const bg = this.add.graphics();
      bg.fillStyle(wi === 0 ? 0xff6b6b : 0xffffff, 1);
      bg.fillRoundedRect(lx - 45, ly - 20, 90, 40, 8);
      bg.lineStyle(2, wi === 0 ? 0xff6b6b : 0xe0d8d0, 1);
      bg.strokeRoundedRect(lx - 45, ly - 20, 90, 40, 8);

      const label = this.add.text(lx, ly, `W${w}`, {
        fontFamily: "Nunito", fontSize: "15px", fontStyle: "700",
        color: wi === 0 ? "#ffffff" : "#9e9890",
      }).setOrigin(0.5);

      const zone = this.add.zone(lx, ly, 90, 40).setInteractive({ cursor: "pointer" });
      zone.on("pointerdown", () => {
        Network.send("select_level", { levelIndex: wi * 2 });
        Sound.click();
      });

      this.levelBtns.push({ bg, label, worldIndex: wi });
    });

    // Level name display
    this.levelNameText = this.add.text(x + 180, 310, "First Steps", {
      fontFamily: "Nunito", fontSize: "16px", fontStyle: "700", color: "#2c3e50",
    }).setOrigin(0.5);

    this.levelDescText = this.add.text(x + 180, 336, "Get everyone to the exit.", {
      fontFamily: "Nunito", fontSize: "12px", color: "#9e9890",
    }).setOrigin(0.5);
  }

  toggleReady() {
    this.localIsReady = !this.localIsReady;
    Network.send("set_ready", { ready: this.localIsReady });

    // Update button appearance
    this.readyBgRef.clear();
    if (this.localIsReady) {
      this.readyBgRef.fillStyle(0x2ecc71, 1);
      this.readyBgRef.fillRoundedRect(-110, -26, 220, 52, 12);
      this.readyBtnText.setText("✓  READY!");
    } else {
      this.readyBgRef.fillStyle(0xbdc3c7, 1);
      this.readyBgRef.fillRoundedRect(-110, -26, 220, 52, 12);
      this.readyBtnText.setText("○  NOT READY");
    }
  }

  onStateChange(state) {
    // ── Countdown overlay ─────────────────────────────────────────────────
    if (state.phase === "countdown") {
      this.countdownOverlay.setVisible(true);
      this.cdNumber.setText(String(state.countdown));
      Sound.countdown();

      this.tweens.add({
        targets: this.cdNumber,
        scaleX: { from: 1.4, to: 1 },
        scaleY: { from: 1.4, to: 1 },
        duration: 200,
        ease: "Back.easeOut",
      });
    } else if (state.phase === "playing") {
      this.countdownOverlay.setVisible(false);
      Sound.go();
      this.scene.start("GameScene");
    } else {
      this.countdownOverlay.setVisible(false);
    }

    // ── Player list ───────────────────────────────────────────────────────
    this.updatePlayerList(state);

    // ── Host controls ─────────────────────────────────────────────────────
    const myPlayer = state.players.get(Network.sessionId);
    const isHost = myPlayer?.isHost || false;
    this.startBtn.setVisible(isHost);
  }

  updatePlayerList(state) {
    // Clear dynamic cards
    this.playerCards.forEach((c) => c.destroy && c.destroy());
    this.playerCards.clear();

    const players = [...state.players.entries()];
    const newCount = players.length;

    if (newCount > this.prevPlayerCount) {
      Sound.join();
    }
    this.prevPlayerCount = newCount;

    players.forEach(([id, player], i) => {
      const row = i % 4;
      const col = Math.floor(i / 4);
      const x = 40 + col * 270;
      const y = 205 + row * 82;

      const container = this.add.container(0, 0);

      // Card
      const card = this.add.graphics();
      card.fillStyle(0xffffff, 1);
      card.fillRoundedRect(x, y, 250, 70, 10);
      card.lineStyle(2, player.isReady ? 0x2ecc71 : 0xe8e2dc, 1);
      card.strokeRoundedRect(x, y, 250, 70, 10);

      // Character icon
      const charSprite = this.add.image(x + 36, y + 35, `char_${player.characterId}`)
        .setDisplaySize(40, 40);

      // Idle bounce
      this.tweens.add({
        targets: charSprite,
        y: y + 35 - 3,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
        delay: i * 80,
      });

      // Nickname
      const nick = this.add.text(x + 65, y + 18, player.nickname, {
        fontFamily: "Nunito", fontSize: "15px", fontStyle: "700", color: "#2c3e50",
      });

      // Ready badge
      const badgeKey = player.isReady ? "badge_ready" : "badge_waiting";
      const badge = this.add.image(x + 185, y + 45, badgeKey).setDisplaySize(60, 22);
      const badgeText = this.add.text(x + 185, y + 45, player.isReady ? "READY" : "WAITING", {
        fontFamily: "Nunito", fontSize: "10px", fontStyle: "700",
        color: player.isReady ? "#ffffff" : "#7f8c8d",
      }).setOrigin(0.5);

      // Host crown
      if (player.isHost) {
        const crown = this.add.image(x + 36, y + 8, "host_crown").setDisplaySize(28, 16);
        container.add(crown);
      }

      container.add([card, charSprite, nick, badge, badgeText]);

      // Slide in animation
      this.tweens.add({
        targets: container,
        x: { from: -20, to: 0 },
        alpha: { from: 0, to: 1 },
        duration: 200,
        delay: i * 40,
        ease: "Back.easeOut",
      });

      this.playerCards.set(id, container);
    });
  }
}
