/**
 * SoundManager — Procedural audio synthesis via Web Audio API.
 * All sounds generated in code. No audio files required.
 *
 * Drop-in replacement: if you have real .mp3/.ogg files,
 * use Phaser's built-in sound system instead and remove this file.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.6;
    this._init();
  }

  _init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio not available:", e);
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // ── Core synth helper ─────────────────────────────────────────────────────

  _playTone({ freq = 440, type = "sine", duration = 0.1, gain = 0.5,
               attack = 0.005, decay = 0.05, sustain = 0.3, release = 0.1,
               freqEnd = null, delay = 0 } = {}) {
    if (!this.enabled || !this.ctx) return;
    this._resume();

    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.connect(env);
    env.connect(this.masterGain);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (freqEnd !== null) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
    }

    // ADSR envelope
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + attack);
    env.gain.linearRampToValueAtTime(gain * sustain, t + attack + decay);
    env.gain.setValueAtTime(gain * sustain, t + duration - release);
    env.gain.linearRampToValueAtTime(0, t + duration);

    osc.start(t);
    osc.stop(t + duration);
  }

  // ── Game sounds ───────────────────────────────────────────────────────────

  jump() {
    this._playTone({ freq: 320, freqEnd: 520, type: "triangle",
                     duration: 0.12, gain: 0.4, attack: 0.005, decay: 0.03, sustain: 0.6, release: 0.06 });
  }

  land() {
    this._playTone({ freq: 180, freqEnd: 80, type: "square",
                     duration: 0.08, gain: 0.35, attack: 0.002, decay: 0.05, sustain: 0.1, release: 0.03 });
  }

  death() {
    // Descending pitfall sound
    this._playTone({ freq: 400, freqEnd: 80,  type: "sawtooth", duration: 0.35, gain: 0.5,
                     attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.15 });
    this._playTone({ freq: 300, freqEnd: 60,  type: "square",   duration: 0.3,  gain: 0.3,
                     attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.1, delay: 0.05 });
  }

  switchOn() {
    this._playTone({ freq: 660, freqEnd: 880, type: "square",
                     duration: 0.08, gain: 0.35, attack: 0.003, decay: 0.03, sustain: 0.5, release: 0.04 });
    this._playTone({ freq: 880, type: "triangle",
                     duration: 0.1, gain: 0.25, attack: 0.005, decay: 0.03, sustain: 0.4, release: 0.05, delay: 0.06 });
  }

  doorOpen() {
    [0, 0.08, 0.16].forEach((delay, i) => {
      this._playTone({ freq: 330 * (1 + i * 0.5), type: "triangle",
                       duration: 0.15, gain: 0.3, attack: 0.01, decay: 0.05, sustain: 0.5, release: 0.08, delay });
    });
  }

  checkpoint() {
    [0, 0.1].forEach((delay, i) => {
      this._playTone({ freq: 550 + i * 220, type: "triangle",
                       duration: 0.2, gain: 0.4, attack: 0.01, decay: 0.05, sustain: 0.6, release: 0.1, delay });
    });
  }

  levelClear() {
    const melody = [523, 659, 784, 1047];
    melody.forEach((freq, i) => {
      this._playTone({ freq, type: "triangle",
                       duration: 0.25, gain: 0.5, attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.1,
                       delay: i * 0.12 });
    });
  }

  countdown() {
    this._playTone({ freq: 440, type: "square",
                     duration: 0.08, gain: 0.45, attack: 0.003, decay: 0.04, sustain: 0.4, release: 0.04 });
  }

  go() {
    [0, 0.06].forEach((delay, i) => {
      this._playTone({ freq: 660 + i * 200, type: "triangle",
                       duration: 0.2, gain: 0.5, attack: 0.005, decay: 0.04, sustain: 0.6, release: 0.1, delay });
    });
  }

  join() {
    this._playTone({ freq: 480, freqEnd: 600, type: "triangle",
                     duration: 0.15, gain: 0.35, attack: 0.01, decay: 0.04, sustain: 0.5, release: 0.08 });
  }

  click() {
    this._playTone({ freq: 800, freqEnd: 600, type: "square",
                     duration: 0.05, gain: 0.3, attack: 0.002, decay: 0.02, sustain: 0.2, release: 0.02 });
  }

  ready() {
    this._playTone({ freq: 600, freqEnd: 800, type: "triangle",
                     duration: 0.1, gain: 0.4, attack: 0.005, decay: 0.03, sustain: 0.5, release: 0.05 });
  }

  emote() {
    this._playTone({ freq: 550, type: "sine",
                     duration: 0.08, gain: 0.3, attack: 0.003, decay: 0.04, sustain: 0.3, release: 0.04 });
  }

  laser() {
    this._playTone({ freq: 1200, freqEnd: 800, type: "sawtooth",
                     duration: 0.06, gain: 0.2, attack: 0.002, decay: 0.03, sustain: 0.2, release: 0.03 });
  }

  setVolume(v) {
    this.volume = v;
    if (this.masterGain) this.masterGain.gain.value = v;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
    }
    return this.enabled;
  }
}

// Singleton
export const Sound = new SoundManager();
