# Sounds — /public/sounds/

Audio files go here. All sounds are currently synthesized procedurally —
these files are OPTIONAL replacements.

## Sound Effects (MP3 + OGG both recommended for browser compatibility):

jump.mp3 / jump.ogg
  → 0.10–0.15s duration
  → Tiny bouncy "boing" — light, cartoony
  → High-pitched pop with quick decay
  → NO reverb, NO bass

land.mp3 / land.ogg
  → 0.08–0.12s duration
  → Soft dull thud — like a rubber block hitting wood
  → Short, punchy, not sharp

death.mp3 / death.ogg
  → 0.3–0.5s duration
  → Descending "waaah" or cartoon fall sound
  → Comical, not sad or scary
  → Pitch drops quickly

success.mp3 / success.ogg
  → 0.4–0.6s duration
  → 4-note ascending chime — bright, celebratory
  → Like a treasure chest opening in a cartoon game

switch.mp3 / switch.ogg
  → 0.10–0.15s duration
  → Mechanical click + brief bright tone
  → Like flipping a heavy switch + confirmation ping

door.mp3 / door.ogg
  → 0.25–0.35s duration
  → 3-note ascending tone — clearly "something opened"
  → Light and airy

checkpoint.mp3 / checkpoint.ogg
  → 0.2–0.3s duration
  → 2-note soft chime — gentle confirmation
  → Flag flap + light bell

countdown.mp3 / countdown.ogg
  → 0.08–0.1s duration
  → Sharp metronome tick — precise, clean
  → Used for 3...2...1... beats

go.mp3 / go.ogg
  → 0.15–0.25s duration
  → Two-tone energetic blast — "GO!"
  → Bright, upbeat, signals start

join.mp3 / join.ogg
  → 0.10–0.15s duration
  → Ascending pop — welcoming notification
  → Light, positive

click.mp3 / click.ogg
  → 0.04–0.06s duration
  → Crisp UI button click
  → Very short, clean, no tail

laser.mp3 / laser.ogg
  → 0.06s
  → Electronic buzz/hum — laser activating
  → Clean, sci-fi but toy-ish

## Music:

bgm.mp3 / bgm.ogg
  → Looping (loop point marked or crossfade loop)
  → Duration: 60–120s loop recommended
  → BPM: 120–140
  → Genre: minimal chiptune / toy percussion / playful synth
  → NO lyrics, NO dramatic drops
  → Designed to sit quietly under player conversation
  → Should feel: arcade, upbeat, playful, light

## Loading in PreloadScene.js (uncomment these):

  this.load.audio('jump',       'sounds/jump.mp3');
  this.load.audio('land',       'sounds/land.mp3');
  this.load.audio('death',      'sounds/death.mp3');
  this.load.audio('success',    'sounds/success.mp3');
  this.load.audio('switch_snd', 'sounds/switch.mp3');
  this.load.audio('door_snd',   'sounds/door.mp3');
  this.load.audio('checkpoint_snd', 'sounds/checkpoint.mp3');
  this.load.audio('countdown',  'sounds/countdown.mp3');
  this.load.audio('go',         'sounds/go.mp3');
  this.load.audio('join',       'sounds/join.mp3');
  this.load.audio('click',      'sounds/click.mp3');
  this.load.audio('bgm',        'sounds/bgm.mp3');

Then in SoundManager.js, replace synthesized methods with:
  jump() { this.scene.sound.play('jump', { volume: 0.5 }); }
  // etc.
