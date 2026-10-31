/**
 * GHOST MOVE GO - Audio Synthesizer Engine
 * High-fidelity Web Audio API sound generator for authentic stone placements,
 * stone captures, traditional Korean gongs, and victory chimes.
 * Works seamlessly in any browser without external audio assets.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Read preference if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ghost_move_go_muted');
      if (saved) {
        this.isMuted = saved === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ghost_move_go_muted', String(muted));
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Authentic stone placement clack on a solid kaya wood goban:
   * 1. Fast high-frequency transient (stone impact)
   * 2. Resonant low-frequency wood body thud (goban chamber echo)
   */
  public playStoneClack() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Transient click (slate/clamshell impact)
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1450 + (Math.random() * 80 - 40), t);
    clickOsc.frequency.exponentialRampToValueAtTime(320, t + 0.04);

    clickGain.gain.setValueAtTime(0.45, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(t);
    clickOsc.stop(t + 0.05);

    // Resonant wooden board body thud
    const woodOsc = this.ctx.createOscillator();
    const woodGain = this.ctx.createGain();
    woodOsc.type = 'sine';
    woodOsc.frequency.setValueAtTime(210 + (Math.random() * 20 - 10), t);
    woodOsc.frequency.exponentialRampToValueAtTime(95, t + 0.12);

    woodGain.gain.setValueAtTime(0.6, t);
    woodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    woodOsc.connect(woodGain);
    woodGain.connect(this.ctx.destination);
    woodOsc.start(t);
    woodOsc.stop(t + 0.14);
  }

  /**
   * Capturing stones sound - multiple light stone gathering clicks
   */
  public playCapture() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const delay = i * 0.045;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 180 + Math.random() * 60, t + delay);
      osc.frequency.exponentialRampToValueAtTime(240, t + delay + 0.08);

      gain.gain.setValueAtTime(0.3, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    }
  }

  /**
   * Traditional Korean Gong / Jing match commencement sound
   */
  public playGong() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [174, 348, 522, 696];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      
      const amp = 0.28 / (idx + 1);
      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t);
      osc.stop(t + 1.6);
    });
  }

  /**
   * Victory harmonic chime
   */
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const delay = i * 0.12;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.35, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(t + delay);
      osc.stop(t + delay + 0.6);
    });
  }

  /**
   * Ghost whisper hint sound
   */
  public playGhostHint() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const sounds = new SoundController();
