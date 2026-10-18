import { storageService } from './storageService';

class SoundService {
  constructor() {
    this.audioCtx = null;
    this.enabled = storageService.get('sound_enabled', false); // Default OFF
    this.volume = storageService.get('sound_volume', 50); // Default 50%
  }

  getAudioContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  isEnabled() {
    return Boolean(this.enabled);
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    storageService.set('sound_enabled', this.enabled);
  }

  getVolume() {
    return typeof this.volume === 'number' ? this.volume : 50;
  }

  setVolume(vol) {
    const clamped = Math.max(0, Math.min(100, Number(vol) || 0));
    this.volume = clamped;
    storageService.set('sound_volume', clamped);
  }

  // Master Gain Node scaled by volume (0.0 to 1.0)
  getGainValue() {
    return (this.volume / 100) * 0.25; // Gentle headroom
  }

  play(type = 'click') {
    if (!this.enabled || this.volume <= 0) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const gainVal = this.getGainValue();

      switch (type) {
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

          gain.gain.setValueAtTime(gainVal, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'success': {
          // Ascending C5 -> E5 -> G5 chord
          const freqs = [523.25, 659.25, 783.99];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.07;
            const stopTime = startTime + 0.25;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(gainVal * 0.8, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(stopTime + 0.02);
          });
          break;
        }

        case 'levelUp': {
          // Triumphant fanfare arpeggio: C4 -> G4 -> C5 -> E5 -> G5
          const freqs = [261.63, 392.00, 523.25, 659.25, 783.99];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.09;
            const stopTime = startTime + 0.35;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(stopTime + 0.02);
          });
          break;
        }

        case 'badge': {
          // Magic sparkle high notes: G5 -> B5 -> D6
          const freqs = [783.99, 987.77, 1174.66];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.06;
            const stopTime = startTime + 0.2;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(gainVal * 0.6, startTime);
            gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(stopTime + 0.02);
          });
          break;
        }

        case 'entrance': {
          // Futuristic harmonic chime: C5 -> G5 -> C6
          const freqs = [523.25, 783.99, 1046.50];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const startTime = now + idx * 0.1;
            const stopTime = startTime + 0.45;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(gainVal * 0.7, startTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, stopTime);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(stopTime + 0.05);
          });
          break;
        }

        default:
          break;
      }
    } catch (e) {
      // Audio autoplay policy or hardware restriction
      console.debug('[SoundService] Audio playback skipped:', e);
    }
  }

  testSound() {
    if (!this.enabled) {
      return { success: false, message: 'Sound Effects masih dalam keadaan NONAKTIF (OFF). Aktifkan toggle terlebih dahulu.' };
    }
    if (this.volume <= 0) {
      return { success: false, message: 'Volume berada pada 0% (Senyap). Geser slider volume untuk mendengar suara.' };
    }
    this.play('success');
    return { success: true, message: 'Suara uji berhasil diputar!' };
  }
}

export const soundService = new SoundService();
