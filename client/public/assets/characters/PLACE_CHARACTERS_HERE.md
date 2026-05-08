# Characters — /public/assets/characters/

Drop your character PNG files here.

## Files expected:
char_0.png  — Red Cat      (64×64 px, PNG transparent)
char_1.png  — Blue Robot   (64×64 px, PNG transparent)
char_2.png  — Yellow Blob  (64×64 px, PNG transparent)
char_3.png  — Green Frog   (64×64 px, PNG transparent)
char_4.png  — Pink Bunny   (64×64 px, PNG transparent)
char_5.png  — Sleepy Cube  (64×64 px, PNG transparent)
char_6.png  — Orange Fox   (64×64 px, PNG transparent)
char_7.png  — White Ghost  (64×64 px, PNG transparent)
char_8.png  — Cyan Slime   (64×64 px, PNG transparent)
char_9.png  — Black Ninja  (64×64 px, PNG transparent)

char_0_dead.png ... char_9_dead.png  — Same but with X eyes, tilted

char_shadow.png  — 64×16 px, soft dark ellipse, transparent background

## Style:
- Square/rounded-square bodies
- Bold black outline (2-3px stroke)
- Two eyes + optional simple mouth only
- No accessories, no text, no gradients
- Each has one solid body color
- Transparent PNG background

## Loading:
After placing files, open BootScene.js and replace the
generateCharacterTextures() call with Phaser load calls in PreloadScene.js:

  this.load.image('char_0', 'assets/characters/char_0.png');
  this.load.image('char_0_dead', 'assets/characters/char_0_dead.png');
  // ... etc for all 10
