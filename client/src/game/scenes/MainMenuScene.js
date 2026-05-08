/**
 * MainMenuScene — Nickname input, character selection, create/join room.
 * All stored in localStorage for persistence.
 */

import Phaser from "phaser";
import { CHARACTERS } from "../utils/Characters.js";
import { Network } from "../utils/NetworkManager.js";
import { Sound } from "../utils/SoundManager.js";

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenuScene");
    this.selectedChar = 0;
    this.nickname = "";
    this.joinCodeInput = "";
    this.errorText = null;
    this.charFrames = [];
  }

  create() {
    // Load saved prefs
    this.nickname = localStorage.getItem("cs_nickname") || "Player";
    this.selectedChar = parseInt(localStorage.getItem("cs_char") || "0");

    this.drawBackground();
    this.drawTitle();
    this.drawNicknameInput();
    this.drawCharacterSelect();
    this.drawRoomButtons();
    this.setupKeyboard();
  }

  drawBackground() {
    // Soft tiled background
    this.add.tileSprite(0, 0, 1280, 720, "bg_tile").setOrigin(0, 0).setAlpha(0.6);

    // Top accent strip
    const strip = this.add.graphics();
    strip.fillStyle(0xff6b6b, 1);
    strip.fillRect(0, 0, 1280, 6);

    // Floating decorative cubes (background flair)
    const deco = [
      { x: 80,  y: 120, r: 0, s: 0.6, c: 0xff6b6b, a: 0.08 },
      { x: 1200,y: 200, r: 15, s: 0.8, c: 0x5dade2, a: 0.07 },
      { x: 150, y: 580, r: -10, s: 0.5, c: 0x58d68d, a: 0.07 },
      { x: 1100,y: 600, r: 8,  s: 0.7, c: 0xf9e547, a: 0.07 },
      { x: 640, y: 660, r: 5,  s: 0.4, c: 0xa855f7, a: 0.06 },
    ];
    deco.forEach(({ x, y, r, s, c, a }) => {
      const g = this.add.graphics();
      g.fillStyle(c, a);
      g.fillRoundedRect(x - 24 * s, y - 24 * s, 48 * s, 48 * s, 6 * s);
      g.setAngle(r);
    });
  }

  drawTitle() {
    // Shadow
    this.add.text(644, 72, "CHAOSYNC", {
      fontFamily: "Nunito",
      fontSize: "72px",
      fontStyle: "900",
      color: "#000000",
    }).setOrigin(0.5).setAlpha(0.08);

    // Title
    const title = this.add.text(640, 68, "CHAOSYNC", {
      fontFamily: "Nunito",
      fontSize: "72px",
      fontStyle: "900",
      color: "#ff6b6b",
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(640, 130, "cooperative chaos platformer", {
      fontFamily: "Nunito",
      fontSize: "18px",
      color: "#9e9890",
    }).setOrigin(0.5);

    // Pulse title
    this.tweens.add({
      targets: title,
      scaleX: 1.02, scaleY: 1.02,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  drawNicknameInput() {
    const cx = 320;

    this.add.text(cx, 185, "YOUR NAME", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "700",
      color: "#9e9890",
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Input box
    const inputBg = this.add.graphics();
    inputBg.fillStyle(0xffffff, 1);
    inputBg.fillRoundedRect(cx - 140, 200, 280, 52, 10);
    inputBg.lineStyle(2.5, 0xd4cfc8, 1);
    inputBg.strokeRoundedRect(cx - 140, 200, 280, 52, 10);

    this.nicknameDisplay = this.add.text(cx, 226, this.nickname + "▎", {
      fontFamily: "Nunito",
      fontSize: "22px",
      fontStyle: "700",
      color: "#2c3e50",
    }).setOrigin(0.5);

    // Cursor blink
    let showCursor = true;
    this.time.addEvent({
      delay: 500,
      repeat: -1,
      callback: () => {
        showCursor = !showCursor;
        this.nicknameDisplay.setText(this.nickname + (showCursor ? "▎" : " "));
      },
    });
  }

  drawCharacterSelect() {
    const cy = 370;

    this.add.text(640, 300, "CHOOSE CHARACTER", {
      fontFamily: "Nunito",
      fontSize: "13px",
      fontStyle: "700",
      color: "#9e9890",
      letterSpacing: 3,
    }).setOrigin(0.5);

    this.charFrames = [];
    const totalW = CHARACTERS.length * 90;
    const startX = 640 - totalW / 2 + 45;

    CHARACTERS.forEach((char, idx) => {
      const x = startX + idx * 90;
      const isSelected = idx === this.selectedChar;

      // Frame bg
      const frame = this.add.image(x, cy, isSelected ? "char_frame_selected" : "char_frame")
        .setDisplaySize(76, 76);

      // Character sprite
      const sprite = this.add.image(x, cy, `char_${idx}`)
        .setDisplaySize(isSelected ? 44 : 38, isSelected ? 44 : 38);

      // Name on hover / selected
      const nameLabel = this.add.text(x, cy + 44, char.name, {
        fontFamily: "Nunito",
        fontSize: "10px",
        color: isSelected ? "#ff6b6b" : "#b0a898",
      }).setOrigin(0.5).setAlpha(isSelected ? 1 : 0);

      // Idle bounce for selected
      if (isSelected) {
        this.tweens.add({ targets: sprite, y: cy - 4, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }

      // Hit area
      const zone = this.add.zone(x, cy, 80, 80).setInteractive({ cursor: "pointer" });
      zone.on("pointerover", () => {
        if (idx !== this.selectedChar) {
          this.tweens.add({ targets: sprite, scaleX: 1.1, scaleY: 1.1, duration: 80 });
          nameLabel.setAlpha(0.7);
        }
      });
      zone.on("pointerout", () => {
        if (idx !== this.selectedChar) {
          this.tweens.add({ targets: sprite, scaleX: 1, scaleY: 1, duration: 80 });
          nameLabel.setAlpha(0);
        }
      });
      zone.on("pointerdown", () => {
        this.selectCharacter(idx);
        Sound.click();
      });

      this.charFrames.push({ frame, sprite, nameLabel, zone });
    });
  }

  selectCharacter(idx) {
    const cy = 370;
    const totalW = CHARACTERS.length * 90;
    const startX = 640 - totalW / 2 + 45;

    // Reset old
    const old = this.charFrames[this.selectedChar];
    if (old) {
      old.frame.setTexture("char_frame");
      this.tweens.killTweensOf(old.sprite);
      old.sprite.setDisplaySize(38, 38).setY(cy);
      old.nameLabel.setAlpha(0).setColor("#b0a898");
    }

    this.selectedChar = idx;
    localStorage.setItem("cs_char", String(idx));

    // Highlight new
    const nw = this.charFrames[idx];
    nw.frame.setTexture("char_frame_selected");
    nw.sprite.setDisplaySize(44, 44);
    nw.nameLabel.setAlpha(1).setColor("#ff6b6b");

    this.tweens.add({
      targets: nw.sprite,
      y: cy - 4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Squash feedback
    this.tweens.add({
      targets: nw.sprite,
      scaleX: 1.3, scaleY: 0.8,
      duration: 80,
      yoyo: true,
      ease: "Back.easeOut",
    });
  }

  drawRoomButtons() {
    const cx = 640;
    const y = 490;

    // ── Create Room ────────────────────────────────────────────────────────

    const createBtn = this.add.container(cx - 160, y);
    const createBg = this.add.graphics();
    createBg.fillStyle(0xff6b6b, 1);
    createBg.fillRoundedRect(-120, -28, 240, 56, 12);
    createBg.fillStyle(0xff8585, 0.4);
    createBg.fillRoundedRect(-116, -24, 232, 22, 8);
    const createText = this.add.text(0, 0, "CREATE ROOM", {
      fontFamily: "Nunito", fontSize: "16px", fontStyle: "900", color: "#ffffff",
    }).setOrigin(0.5);
    createBtn.add([createBg, createText]);
    createBtn.setInteractive(new Phaser.Geom.Rectangle(-120, -28, 240, 56), Phaser.Geom.Rectangle.Contains);
    createBtn.on("pointerover", () => { this.tweens.add({ targets: createBtn, scaleX: 1.04, scaleY: 1.04, duration: 80 }); });
    createBtn.on("pointerout",  () => { this.tweens.add({ targets: createBtn, scaleX: 1, scaleY: 1, duration: 80 }); });
    createBtn.on("pointerdown", () => { Sound.click(); this.handleCreateRoom(); });

    // ── Join Room ──────────────────────────────────────────────────────────

    const joinBox = this.add.container(cx + 160, y);
    const joinBg = this.add.graphics();
    joinBg.fillStyle(0xffffff, 1);
    joinBg.fillRoundedRect(-120, -28, 240, 56, 12);
    joinBg.lineStyle(2.5, 0xd4cfc8, 1);
    joinBg.strokeRoundedRect(-120, -28, 240, 56, 12);

    this.joinCodeText = this.add.text(0, 0, "ENTER CODE...", {
      fontFamily: "Nunito", fontSize: "18px", fontStyle: "700", color: "#c0b8b0",
    }).setOrigin(0.5);

    const joinBtnBg = this.add.graphics();
    joinBtnBg.fillStyle(0x2c3e50, 1);
    joinBtnBg.fillRoundedRect(88, -28, 56, 56, 12);
    const joinArrow = this.add.text(115, 0, "→", {
      fontFamily: "Nunito", fontSize: "22px", color: "#ffffff",
    }).setOrigin(0.5);

    joinBox.add([joinBg, this.joinCodeText, joinBtnBg, joinArrow]);

    // Make left part of join box for typing
    const joinInputZone = this.add.zone(cx + 60, y, 200, 56).setInteractive({ cursor: "text" });
    joinInputZone.on("pointerdown", () => {
      this.typingMode = "join";
      this.updateJoinDisplay();
    });

    // Arrow button
    const joinArrowZone = this.add.zone(cx + 238, y, 56, 56).setInteractive({ cursor: "pointer" });
    joinArrowZone.on("pointerover", () => { this.tweens.add({ targets: [joinBtnBg, joinArrow], scaleX: 1.05, scaleY: 1.05, duration: 80 }); });
    joinArrowZone.on("pointerout",  () => { this.tweens.add({ targets: [joinBtnBg, joinArrow], scaleX: 1, scaleY: 1, duration: 80 }); });
    joinArrowZone.on("pointerdown", () => { Sound.click(); this.handleJoinRoom(); });

    // ── Error text ─────────────────────────────────────────────────────────
    this.errorText = this.add.text(cx, y + 55, "", {
      fontFamily: "Nunito", fontSize: "14px", color: "#ff4757",
    }).setOrigin(0.5);

    // ── Nickname area click ───────────────────────────────────────────────
    const nickZone = this.add.zone(320, 226, 280, 52).setInteractive({ cursor: "text" });
    nickZone.on("pointerdown", () => { this.typingMode = "nick"; });

    this.typingMode = "nick"; // default to nickname input

    // ── Controls hint ─────────────────────────────────────────────────────
    this.add.text(cx, 665, "WASD / Arrow Keys — Move & Jump    E — Emote", {
      fontFamily: "Nunito", fontSize: "13px", color: "#b0a898",
    }).setOrigin(0.5);
  }

  setupKeyboard() {
    this.input.keyboard.on("keydown", (ev) => {
      if (this.typingMode === "nick") {
        this.handleNickKey(ev);
      } else if (this.typingMode === "join") {
        this.handleJoinKey(ev);
      }

      if (ev.key === "Enter") {
        if (this.typingMode === "join" && this.joinCodeInput.length >= 1) {
          this.handleJoinRoom();
        } else if (this.typingMode === "nick") {
          this.typingMode = "join";
        }
      }
    });
  }

  handleNickKey(ev) {
    if (ev.key === "Backspace") {
      this.nickname = this.nickname.slice(0, -1);
    } else if (ev.key.length === 1 && this.nickname.length < 12) {
      this.nickname += ev.key;
    }
    localStorage.setItem("cs_nickname", this.nickname);
  }

  handleJoinKey(ev) {
    if (ev.key === "Backspace") {
      this.joinCodeInput = this.joinCodeInput.slice(0, -1);
    } else if (ev.key.length === 1 && this.joinCodeInput.length < 16) {
      this.joinCodeInput += ev.key.toUpperCase();
    }
    this.updateJoinDisplay();
  }

  updateJoinDisplay() {
    if (this.joinCodeText) {
      const display = this.joinCodeInput || "";
      this.joinCodeText.setText(display.length > 0 ? display + "▎" : "ENTER CODE...");
      this.joinCodeText.setColor(display.length > 0 ? "#2c3e50" : "#c0b8b0");
    }
  }

  async handleCreateRoom() {
    const nick = this.nickname.trim() || "Player";
    const result = await Network.createRoom({
      nickname: nick,
      characterId: this.selectedChar,
    });

    if (result.success) {
      this.scene.start("LobbyScene");
    } else {
      this.showError("Could not create room. Is the server running?");
    }
  }

  async handleJoinRoom() {
    const code = this.joinCodeInput.trim().toUpperCase();
    if (code.length < 1) {
      this.showError("Enter a valid room code.");
      return;
    }

    const nick = this.nickname.trim() || "Player";
    const result = await Network.joinRoom(code, {
      nickname: nick,
      characterId: this.selectedChar,
    });

    if (result.success) {
      this.scene.start("LobbyScene");
    } else {
      this.showError("Room not found. Check the code.");
    }
  }

  showError(msg) {
    if (this.errorText) {
      this.errorText.setText(msg);
      this.tweens.add({
        targets: this.errorText,
        alpha: { from: 0, to: 1 },
        duration: 200,
      });
      this.time.delayedCall(3000, () => {
        if (this.errorText) {
          this.tweens.add({ targets: this.errorText, alpha: 0, duration: 300 });
        }
      });
    }
  }
}