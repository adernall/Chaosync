/**
 * PhysicsEngine — Server-authoritative physics at 60fps.
 *
 * Coordinate convention:
 *   player.x = horizontal center
 *   player.y = FEET (bottom edge of player)
 *   So the player rect spans:
 *     left   = x - W/2
 *     right  = x + W/2
 *     top    = y - H
 *     bottom = y
 */

const PW = 32;   // player width
const PH = 32;   // player height

const GRAVITY      = 1900;   // px/s²
const MAX_FALL     = 920;    // terminal velocity px/s
const MOVE_SPEED   = 230;    // target horizontal speed px/s
const ACCEL        = 1700;   // px/s²
const FRICTION     = 1500;   // px/s² (decel on no input)
const JUMP_FORCE   = -590;   // initial vy on jump (negative = up)
const JUMP_HOLD    = 1400;   // extra gravity when jump released early
const COYOTE_MS    = 110;    // coyote time window ms
const BUFFER_MS    = 110;    // jump buffer window ms
const CONVEYOR_MUL = 200;    // px/s per speed unit on conveyor
const ICE_FRICTION = 80;     // very low friction on ice

class PhysicsEngine {
  stepPlayer(player, dt, state) {
    const dtS = dt / 1000;
    const input = player._input || {};

    // ── Horizontal ──────────────────────────────────────────────────────────
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    // Check if player is on ice
    let onIce = false;
    state.platforms.forEach((plat) => {
      if (plat.type === "ice" && plat.active && !plat.broken && this.isStandingOn(player, plat)) {
        onIce = true;
      }
    });

    const friction = onIce ? ICE_FRICTION : FRICTION;

    if (dir !== 0) {
      player.vx  = this._toward(player.vx, dir * MOVE_SPEED, ACCEL * dtS);
      player.facingRight = dir > 0;
    } else {
      player.vx = this._toward(player.vx, 0, friction * dtS);
    }

    // ── Gravity ─────────────────────────────────────────────────────────────
    player.vy += GRAVITY * dtS;

    // Variable jump height: extra fall when button released
    if (!input.jump && player.vy < -100) {
      player.vy += JUMP_HOLD * dtS;
    }
    if (player.vy > MAX_FALL) player.vy = MAX_FALL;

    // ── Coyote + jump buffer ─────────────────────────────────────────────────
    if (!player._coyoteTimer) player._coyoteTimer = 0;
    if (!player._jumpBuffer)  player._jumpBuffer  = 0;

    if (player.isGrounded) {
      player._coyoteTimer = COYOTE_MS;
    } else {
      player._coyoteTimer -= dt;
    }

    if (input.jumpPressed) {
      player._jumpBuffer = BUFFER_MS;
    } else {
      player._jumpBuffer -= dt;
    }

    const canJump   = player._coyoteTimer > 0;
    const wantsJump = player._jumpBuffer  > 0;

    if (canJump && wantsJump) {
      player.vy           = JUMP_FORCE;
      player._coyoteTimer = 0;
      player._jumpBuffer  = 0;
      player.isGrounded   = false;
    }

    // ── Integrate position ───────────────────────────────────────────────────
    player.x += player.vx * dtS;
    player.y += player.vy * dtS;
    player.isGrounded = false;

    // ── Platform collision ───────────────────────────────────────────────────
    state.platforms.forEach((plat) => {
      if (!plat.active || plat.broken) return;
      this._resolvePlatformCollision(player, plat, dtS);
    });

    // ── Player-on-player collision (stacking) ────────────────────────────────
    state.players.forEach((other) => {
      if (other === player || other.isDead) return;
      this._resolvePlayerCollision(player, other);
    });

    // ── Conveyor belt push ───────────────────────────────────────────────────
    state.platforms.forEach((plat) => {
      if (plat.type !== "conveyor" || !plat.active) return;
      if (this.isStandingOn(player, plat)) {
        player.vx += plat.speed * CONVEYOR_MUL * dtS;
      }
    });

    // ── Moving platform carry ────────────────────────────────────────────────
    state.platforms.forEach((plat) => {
      if (!["moving","moving_y"].includes(plat.type) || !plat.active) return;
      if (this.isStandingOn(player, plat)) {
        const dv = plat.speed * plat.direction * (dtS);
        if (plat.type === "moving")   player.x += dv;
        if (plat.type === "moving_y") player.y += dv;
      }
    });
  }

  // ── AABB collision: player vs static-ish platform ─────────────────────────
  _resolvePlatformCollision(player, plat, dtS) {
    const pl = player.x - PW / 2;   // player left
    const pr = player.x + PW / 2;   // player right
    const pt = player.y - PH;       // player top
    const pb = player.y;            // player bottom (feet)

    const ql = plat.x;              // platform left
    const qr = plat.x + plat.width;
    const qt = plat.y;              // platform top
    const qb = plat.y + plat.height;

    // No overlap
    if (pl >= qr || pr <= ql || pt >= qb || pb <= qt) return;

    // Penetration depths
    const dLeft   = pr - ql;   // how far player right is past platform left
    const dRight  = qr - pl;   // how far player left is past platform right
    const dTop    = pb - qt;   // how far player feet are past platform top
    const dBottom = qb - pt;   // how far player head is past platform bottom

    const minD = Math.min(dLeft, dRight, dTop, dBottom);

    if (minD === dTop && player.vy >= -10) {
      // Land on top — most important case
      player.y         = qt;        // feet sit exactly on platform top
      player.vy        = 0;
      player.isGrounded= true;
    } else if (minD === dBottom && player.vy < 0) {
      // Hit ceiling
      player.y  = qb + PH;
      player.vy = 0;
    } else if (minD === dLeft && player.vx > 0) {
      // Hit left wall of platform
      player.x  = ql - PW / 2;
      player.vx = 0;
    } else if (minD === dRight && player.vx < 0) {
      // Hit right wall of platform
      player.x  = qr + PW / 2;
      player.vx = 0;
    }
  }

  // ── Player-on-player (allows stacking) ───────────────────────────────────
  _resolvePlayerCollision(a, b) {
    const al = a.x - PW / 2; const ar = a.x + PW / 2;
    const at = a.y - PH;     const ab = a.y;
    const bl = b.x - PW / 2; const br = b.x + PW / 2;
    const bt = b.y - PH;     const bb = b.y;

    if (al >= br || ar <= bl || at >= bb || ab <= bt) return;

    const dLeft   = ar - bl;
    const dRight  = br - al;
    const dTop    = ab - bt;   // a's feet past b's top
    const dBottom = bb - at;

    const minD = Math.min(dLeft, dRight, dTop, dBottom);

    if (minD === dTop && a.vy >= 0) {
      // a is landing on top of b
      a.y          = bt;         // a's feet at b's top
      a.vy         = 0;
      a.isGrounded = true;
      // Slight wobble transmitted to b
      b.vx += a.vx * 0.08;
    } else if (minD === dLeft) {
      // Horizontal push — split evenly
      a.x -= dLeft * 0.5;
      b.x += dLeft * 0.5;
      const avg = (a.vx + b.vx) * 0.5;
      a.vx = avg; b.vx = avg;
    } else if (minD === dRight) {
      a.x += dRight * 0.5;
      b.x -= dRight * 0.5;
      const avg = (a.vx + b.vx) * 0.5;
      a.vx = avg; b.vx = avg;
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** True if player's feet are resting on top of platform */
  isStandingOn(player, plat) {
    const feet = player.y;
    const pl   = player.x - PW / 2;
    const pr   = player.x + PW / 2;
    return (
      feet >= plat.y - 4 &&
      feet <= plat.y + 8 &&
      pr   >  plat.x &&
      pl   <  plat.x + plat.width &&
      player.isGrounded
    );
  }

  /**
   * AABB overlap with inward margin (positive margin = smaller hitbox).
   * player anchor: x=center, y=feet
   */
  playerOverlapsRect(player, rx, ry, rw, rh, margin) {
    const pl = player.x - PW / 2 + margin;
    const pr = player.x + PW / 2 - margin;
    const pt = player.y - PH      + margin;
    const pb = player.y           - margin;
    return !(pl >= rx + rw || pr <= rx || pt >= ry + rh || pb <= ry);
  }

  _toward(current, target, step) {
    const diff = target - current;
    if (Math.abs(diff) <= step) return target;
    return current + Math.sign(diff) * step;
  }
}

module.exports = { PhysicsEngine };
