# UI — /public/assets/ui/

All UI element PNGs go here.

## Buttons (200×50 px, PNG):

btn_normal.png       — White rounded rect, soft gray border (2px), radius 12
btn_hover.png        — Slightly warm tint (#F5F0EA), border darkens
btn_primary.png      — Coral/red-orange (#FF6B6B), lighter top highlight strip

## Character Select (80×80 px, PNG):

char_frame.png          — White card, light gray border (2px), radius 10
char_frame_selected.png — Warm cream fill (#FFF5E0), gold border (3px), radius 10

## Badges (PNG):

badge_ready.png    — 70×26 px — Green pill (#2ECC71)
badge_waiting.png  — 70×26 px — Gray pill (#BDC3C7)
host_crown.png     — 40×22 px — Gold crown silhouette

## Game objects (PNG):

switch_off.png  — 60×28 px — Orange pressure plate (raised, has 3D shadow)
switch_on.png   — 60×28 px — Green pressure plate (depressed, glowing)

door_closed.png — 60×80 px — Gray metal door, round doorknob right side
door_open.png   — 60×80 px — Green-glowing door frame, dark interior with green scanlines

checkpoint.png        — 44×60 px — Blue flag on thin pole
checkpoint_active.png — 44×60 px — Gold/orange flag on thin pole (waving)

## Misc (PNG):

nametag_bg.png  — 100×22 px — Dark (#000) rounded pill at 55% opacity, for text overlay
emote_bubble.png— 80×38 px  — White speech bubble, rounded, with small downward triangle tail

## Loading instructions:
Add to PreloadScene.js:
  this.load.image('btn_normal', 'assets/ui/btn_normal.png');
  // etc.
Then remove the corresponding generateTexture() calls in BootScene.js.
