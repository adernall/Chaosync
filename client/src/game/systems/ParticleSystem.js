/**
 * ParticleSystem — Manages all visual particle effects.
 */

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.active = [];
  }

  update(delta) {
    this.active = this.active.filter((p) => p.active);
  }

  burst(x, y, type = "death") {
    const scene = this.scene;

    switch (type) {
      case "death": {
        const colors = ["particle_red", "particle_white", "particle_yellow"];
        for (let i = 0; i < 10; i++) {
          const key = colors[i % colors.length];
          const p = scene.add.image(x, y, key).setDisplaySize(8, 8);
          const angle = (i / 10) * Math.PI * 2;
          const speed = Phaser.Math.Between(60, 160);
          scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * speed,
            y: y + Math.sin(angle) * speed - 40,
            alpha: { from: 1, to: 0 },
            scaleX: { from: 1, to: 0.2 },
            scaleY: { from: 1, to: 0.2 },
            duration: Phaser.Math.Between(400, 700),
            ease: "Power2",
            onComplete: () => p.destroy(),
          });
          this.active.push(p);
        }
        break;
      }

      case "respawn": {
        for (let i = 0; i < 6; i++) {
          const p = scene.add.image(x, y, "particle_green").setDisplaySize(8, 8);
          const angle = (i / 6) * Math.PI * 2;
          scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * 50,
            y: y + Math.sin(angle) * 50,
            alpha: { from: 1, to: 0 },
            duration: 350,
            ease: "Power2",
            onComplete: () => p.destroy(),
          });
          this.active.push(p);
        }
        break;
      }

      case "switch": {
        for (let i = 0; i < 8; i++) {
          const p = scene.add.image(x, y, "particle_star").setDisplaySize(10, 10);
          const angle = (i / 8) * Math.PI * 2;
          scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * 45,
            y: y + Math.sin(angle) * 45,
            alpha: { from: 1, to: 0 },
            angle: { from: 0, to: 180 },
            duration: 500,
            ease: "Power2",
            onComplete: () => p.destroy(),
          });
          this.active.push(p);
        }
        break;
      }

      case "door": {
        for (let i = 0; i < 12; i++) {
          const p = scene.add.image(x, y, "particle_green").setDisplaySize(6, 6);
          const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
          scene.tweens.add({
            targets: p,
            x: x + Math.cos(angle) * Phaser.Math.Between(30, 80),
            y: y + Math.sin(angle) * Phaser.Math.Between(20, 60) - 20,
            alpha: { from: 1, to: 0 },
            duration: Phaser.Math.Between(400, 700),
            ease: "Power2",
            onComplete: () => p.destroy(),
          });
          this.active.push(p);
        }
        break;
      }

      case "puff": {
        for (let i = 0; i < 6; i++) {
          const p = scene.add.image(x, y, "particle_dust").setDisplaySize(12, 12).setAlpha(0.7);
          scene.tweens.add({
            targets: p,
            x: x + Phaser.Math.Between(-40, 40),
            y: y - Phaser.Math.Between(20, 60),
            alpha: { from: 0.7, to: 0 },
            scaleX: { from: 1, to: 2 },
            scaleY: { from: 1, to: 2 },
            duration: Phaser.Math.Between(300, 600),
            ease: "Power1",
            onComplete: () => p.destroy(),
          });
          this.active.push(p);
        }
        break;
      }

      case "land": {
        for (let i = 0; i < 4; i++) {
          const p = scene.add.image(x + Phaser.Math.Between(-12, 12), y, "particle_dust")
            .setDisplaySize(8, 6).setAlpha(0.5);
          scene.tweens.add({
            targets: p,
            x: p.x + Phaser.Math.Between(-20, 20),
            y: p.y + 10,
            alpha: { from: 0.5, to: 0 },
            scaleX: { from: 1, to: 2.5 },
            scaleY: { from: 1, to: 0.2 },
            duration: 300,
            ease: "Power1",
            onComplete: () => p.destroy(),
          });
          this.active.push(p);
        }
        break;
      }
    }
  }

  confettiBurst(x, y) {
    const scene = this.scene;
    const confettiKeys = ["confetti_red", "confetti_yellow", "confetti_blue", "confetti_green"];

    for (let i = 0; i < 80; i++) {
      const key = confettiKeys[i % confettiKeys.length];
      const startX = x + Phaser.Math.Between(-300, 300);
      const p = scene.add.image(startX, -20, key)
        .setScrollFactor(0)
        .setDepth(150)
        .setAngle(Phaser.Math.Between(0, 360));

      scene.tweens.add({
        targets: p,
        x: startX + Phaser.Math.Between(-80, 80),
        y: 800,
        angle: p.angle + Phaser.Math.Between(-180, 180),
        alpha: { from: 1, to: 0.7 },
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 1000),
        ease: "Power1",
        onComplete: () => p.destroy(),
      });

      this.active.push(p);
    }
  }
}
