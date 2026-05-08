# Tilesets — /public/assets/tilesets/

Platform and environment art goes here.

## Platform tiles (200×34 px, PNG):

platform_static.png
  → Neutral gray stone/concrete slab
  → Matte surface, subtle top highlight, soft shadow baked below
  → Rounded corners (6px)

platform_moving.png
  → Yellow/amber — signal color means "this moves"
  → Yellow-orange chevron arrows or dashes on face
  → Same shape/size as static

platform_conveyor.png
  → Blue — conveyor belt
  → Belt texture: repeating arrows pointing right on top surface
  → Blue tones, slightly industrial

platform_ice.png
  → White/pale blue — icy and slick
  → Frosty sparkle specks on surface
  → Slightly glossy appearance

platform_falling.png
  → Orange/brown — stressed, cracked
  → Cracked or stressed texture suggesting it will break
  → Darker cracks emanating from center

## Background:

bg_tile.png — 64×64 px
  → Very soft, barely visible dot grid or subtle cross-hatch
  → Near-white (F0EDE8) base with even softer marks
  → Must tile seamlessly
  → Should almost disappear behind gameplay

## Hazards:

spike.png — 20×28 px (one spike unit, tiled horizontally)
  → Sharp red triangle pointing upward
  → Black stroke outline
  → Slightly metallic/shiny tip

laser_h.png — 200×12 px (tiled horizontally)
  → Red glow laser beam, horizontal
  → White core line, red glow halation around it
  → Transparent edges fade to nothing

laser_v.png — 12×200 px (tiled vertically)
  → Same as laser_h but rotated 90°
