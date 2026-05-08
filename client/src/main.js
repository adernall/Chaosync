import Phaser from "phaser";
import { BootScene } from "./game/scenes/BootScene.js";
import { PreloadScene } from "./game/scenes/PreloadScene.js";
import { MainMenuScene } from "./game/scenes/MainMenuScene.js";
import { LobbyScene } from "./game/scenes/LobbyScene.js";
import { GameScene } from "./game/scenes/GameScene.js";
import { UIScene } from "./game/scenes/UIScene.js";
import { ResultsScene } from "./game/scenes/ResultsScene.js";

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: "game-container",
  backgroundColor: "#f0ede8",
  physics: {
    default: "arcade",
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, PreloadScene, MainMenuScene, LobbyScene, GameScene, UIScene, ResultsScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: false,
    pixelArt: false,
  },
};

const game = new Phaser.Game(config);
window.game = game;
