/**
 * InputController — Keyboard and basic gamepad input.
 */

import Phaser from "phaser";

export class InputController {
  constructor(scene) {
    this.scene = scene;
    this.keys = scene.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      jump:  Phaser.Input.Keyboard.KeyCodes.SPACE,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
    });
  }

  getInput() {
    const k = this.keys;
    return {
      left:  k.left.isDown  || k.a.isDown,
      right: k.right.isDown || k.d.isDown,
      jump:  k.up.isDown || k.jump.isDown || k.w.isDown,
    };
  }
}
