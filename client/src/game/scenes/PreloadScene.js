/**
 * PreloadScene — Generates procedural audio via Web Audio API.
 * All sounds are synthesized in code — no audio files needed.
 * If you provide real audio files, place them in /public/sounds/ and
 * swap the load.audio() calls below.
 */

import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    // Loading bar (simple)
    const bar = this.add.graphics();
    bar.fillStyle(0xff6b6b, 1);
    bar.fillRect(340, 350, 0, 12);

    const total = 5;
    let done = 0;
    const step = () => {
      done++;
      bar.clear();
      bar.fillStyle(0xd4cfc8, 1);
      bar.fillRoundedRect(340, 350, 600, 12, 6);
      bar.fillStyle(0xff6b6b, 1);
      bar.fillRoundedRect(340, 350, (done / total) * 600, 12, 6);
    };

    // We generate audio via AudioContext, not files.
    // Phaser's sound system is bypassed — we use our own SoundManager.
    // (See SoundManager.js)

    // If you have real audio files, uncomment and place in /public/sounds/:
    // this.load.audio("jump",     "sounds/jump.mp3");
    // this.load.audio("land",     "sounds/land.mp3");
    // this.load.audio("death",    "sounds/death.mp3");
    // this.load.audio("success",  "sounds/success.mp3");
    // this.load.audio("switch_on","sounds/switch.mp3");
    // this.load.audio("bgm",      "sounds/bgm.mp3");

    // Simulate load steps for progress bar
    for (let i = 1; i <= total; i++) {
      setTimeout(step, i * 80);
    }
  }

  create() {
    setTimeout(() => {
      this.scene.start("MainMenuScene");
    }, 500);
  }
}
