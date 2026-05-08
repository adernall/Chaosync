/**
 * CHARACTERS — 10 playable character definitions.
 * All cosmetic only. Same hitbox (32x32) for all.
 */

export const CHARACTERS = [
  { id: 0, name: "Red Cat",      color: 0xff6b6b, outline: 0xc0392b, eyeStyle: "cat",    emoji: "🔴" },
  { id: 1, name: "Blue Robot",   color: 0x5dade2, outline: 0x1a5276, eyeStyle: "wide",   emoji: "🔵" },
  { id: 2, name: "Yellow Blob",  color: 0xf9e547, outline: 0xd4ac0d, eyeStyle: "dot",    emoji: "🟡" },
  { id: 3, name: "Green Frog",   color: 0x58d68d, outline: 0x1e8449, eyeStyle: "round",  emoji: "🟢" },
  { id: 4, name: "Pink Bunny",   color: 0xff85c2, outline: 0xc0436d, eyeStyle: "star",   emoji: "🩷" },
  { id: 5, name: "Sleepy Cube",  color: 0xa855f7, outline: 0x6d28d9, eyeStyle: "sleepy", emoji: "🟣" },
  { id: 6, name: "Orange Fox",   color: 0xff9f43, outline: 0xd35400, eyeStyle: "angry",  emoji: "🟠" },
  { id: 7, name: "Ghost",        color: 0xecf0f1, outline: 0x95a5a6, eyeStyle: "round",  emoji: "⬜" },
  { id: 8, name: "Cyan Slime",   color: 0x48dbfb, outline: 0x0abde3, eyeStyle: "dot",    emoji: "🩵" },
  { id: 9, name: "Ninja",        color: 0x2c3e50, outline: 0x1a252f, eyeStyle: "wide",   emoji: "⬛" },
];

export const CHARACTER_COLORS = CHARACTERS.map((c) => c.color);
