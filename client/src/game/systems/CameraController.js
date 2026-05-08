/**
 * CameraController — Smooth dynamic camera that keeps all players visible.
 */

export class CameraController {
  constructor(scene) {
    this.scene = scene;
    this.cam = scene.cameras.main;
    this.cam.setBounds(-200, -200, 4000, 2000);
  }

  update(state, delta) {
    if (!state || state.phase !== "playing") return;

    const players = [...state.players.values()].filter((p) => !p.isDead);
    if (players.length === 0) return;

    // Find bounding box of all players
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    players.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const spreadX = Math.max(400, maxX - minX + 300);
    const spreadY = Math.max(300, maxY - minY + 250);

    const zoomX = 1280 / spreadX;
    const zoomY = 720 / spreadY;
    const targetZoom = Math.min(1.8, Math.max(0.5, Math.min(zoomX, zoomY)));

    // Smooth camera
    const lerpSpeed = 0.06;
    const cam = this.cam;

    const currentCenterX = cam.scrollX + cam.width / 2 / cam.zoom;
    const currentCenterY = cam.scrollY + cam.height / 2 / cam.zoom;

    const newCX = currentCenterX + (centerX - currentCenterX) * lerpSpeed;
    const newCY = currentCenterY + (centerY - currentCenterY) * lerpSpeed;
    const newZoom = cam.zoom + (targetZoom - cam.zoom) * 0.04;

    cam.setZoom(newZoom);
    cam.centerOn(newCX, newCY);
  }
}
