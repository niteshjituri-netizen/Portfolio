/**
 * Nitesh Jituri Portfolio - Virtual Indian Bamboo Flute (Bansuri) Synthesizer
 * Built with Web Audio API (Native, Zero External Dependencies)
 */

class BansuriSynth {
  constructor() {
    this.audioCtx = null;
    this.activeVoices = new Map();
    this.isPlayingMelody = false;
    this.melodyTimeout = null;

    // Indian Swara Frequencies (Base Octave: Key of C)
    this.swaras = {
      'Sa': { freq: 261.63, note: 'C4', key: '1' },
      'Re': { freq: 293.66, note: 'D4', key: '2' },
      'Ga': { freq: 329.63, note: 'E4', key: '3' },
      'Ma': { freq: 349.23, note: 'F4', key: '4' },
      'Pa': { freq: 392.00, note: 'G4', key: '5' },
      'Dha': { freq: 440.00, note: 'A4', key: '6' },
      'Ni': { freq: 493.88, note: 'B4', key: '7' },
      'Sa^': { freq: 523.25, note: 'C5', key: '8' }
    };

    // Preset Melodies
    this.presets = {
      bhupali: [
        { swara: 'Sa', dur: 500 },
        { swara: 'Re', dur: 500 },
        { swara: 'Ga', dur: 600 },
        { swara: 'Pa', dur: 600 },
        { swara: 'Dha', dur: 600 },
        { swara: 'Sa^', dur: 900 },
        { swara: 'Dha', dur: 500 },
        { swara: 'Pa', dur: 500 },
        { swara: 'Ga', dur: 600 },
        { swara: 'Re', dur: 500 },
        { swara: 'Sa', dur: 1000 }
      ],
      folk: [
        { swara: 'Pa', dur: 400 },
        { swara: 'Pa', dur: 400 },
        { swara: 'Dha', dur: 400 },
        { swara: 'Pa', dur: 500 },
        { swara: 'Ga', dur: 500 },
        { swara: 'Re', dur: 400 },
        { swara: 'Ga', dur: 400 },
        { swara: 'Pa', dur: 700 },
        { swara: 'Ga', dur: 400 },
        { swara: 'Re', dur: 400 },
        { swara: 'Sa', dur: 900 }
      ]
    };
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Generates authentic Bansuri tone using multi-oscillator additive synthesis,
   * gentle vibrato LFO, and a soft-filtered breath layer.
   */
  startNote(swaraKey) {
    this.initAudio();
    const swaraData = this.swaras[swaraKey];
    if (!swaraData) return;

    // If already playing this swara, don't retrigger
    if (this.activeVoices.has(swaraKey)) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const baseFreq = swaraData.freq;

    // Master voice gain
    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(0.35, now + 0.08); // Gentle flute breath attack

    // 1. Primary Warm Sine/Triangle Oscillator
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, now);

    // 2. 2nd Harmonic (Octave)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 2, now);
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.setValueAtTime(0.12, now);

    // 3. 3rd Harmonic (Fifth)
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(baseFreq * 3, now);
    const osc3Gain = ctx.createGain();
    osc3Gain.gain.setValueAtTime(0.04, now);

    // Vibrato LFO (Natural bansuri pitch waver ~ 5.5 Hz)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(5.5, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(2.2, now); // subtle frequency modulation

    lfo.connect(lfoGain);
    lfoGain.connect(osc1.frequency);
    lfoGain.connect(osc2.frequency);

    // Lowpass filter for warm wooden bamboo resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(baseFreq * 5.5, now);
    filter.Q.setValueAtTime(1.5, now);

    // Connect nodes
    osc1.connect(voiceGain);
    osc2.connect(osc2Gain);
    osc2Gain.connect(voiceGain);
    osc3.connect(osc3Gain);
    osc3Gain.connect(voiceGain);

    voiceGain.connect(filter);
    filter.connect(ctx.destination);

    // Start oscillators
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    lfo.start(now);

    this.activeVoices.set(swaraKey, {
      oscillators: [osc1, osc2, osc3, lfo],
      voiceGain: voiceGain,
      filter: filter
    });

    this.updateVisualizer(true);
  }

  stopNote(swaraKey) {
    const voice = this.activeVoices.get(swaraKey);
    if (!voice || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;
    // Natural bamboo flute release
    voice.voiceGain.gain.cancelScheduledValues(now);
    voice.voiceGain.gain.setValueAtTime(voice.voiceGain.gain.value, now);
    voice.voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    setTimeout(() => {
      voice.oscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      voice.voiceGain.disconnect();
      voice.filter.disconnect();
    }, 280);

    this.activeVoices.delete(swaraKey);
    if (this.activeVoices.size === 0) {
      this.updateVisualizer(false);
    }
  }

  playNoteOnce(swaraKey, durationMs = 600) {
    this.startNote(swaraKey);
    setTimeout(() => {
      this.stopNote(swaraKey);
    }, durationMs);
  }

  async playMelody(presetName) {
    if (this.isPlayingMelody) {
      this.stopMelody();
      return;
    }

    const melody = this.presets[presetName];
    if (!melody) return;

    this.isPlayingMelody = true;
    const melodyBtn = document.getElementById(`btn-play-${presetName}`);
    if (melodyBtn) melodyBtn.textContent = '⏹ Stop Melody';

    for (let i = 0; i < melody.length; i++) {
      if (!this.isPlayingMelody) break;
      const step = melody[i];
      
      // Highlight UI key
      const keyEl = document.querySelector(`.flute-key[data-swara="${step.swara}"]`);
      if (keyEl) keyEl.classList.add('playing');

      this.playNoteOnce(step.swara, step.dur - 50);

      await new Promise(resolve => {
        this.melodyTimeout = setTimeout(resolve, step.dur);
      });

      if (keyEl) keyEl.classList.remove('playing');
    }

    this.stopMelody(presetName);
  }

  stopMelody(presetName) {
    this.isPlayingMelody = false;
    clearTimeout(this.melodyTimeout);
    document.querySelectorAll('.flute-key').forEach(k => k.classList.remove('playing'));
    
    document.querySelectorAll('.btn-melody').forEach(btn => {
      if (btn.id === 'btn-play-bhupali') btn.textContent = '▶ Raag Bhupali';
      if (btn.id === 'btn-play-folk') btn.textContent = '▶ Folk Melody';
    });
  }

  updateVisualizer(isActive) {
    const bars = document.querySelectorAll('.freq-bar');
    if (!bars || bars.length === 0) return;

    bars.forEach((bar, idx) => {
      if (isActive) {
        const height = Math.floor(Math.random() * 26) + 8;
        bar.style.height = `${height}px`;
      } else {
        bar.style.height = '8px';
      }
    });
  }
}

// Global Flute Synth Instance
window.bansuri = new BansuriSynth();

// Setup event listeners after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const keys = document.querySelectorAll('.flute-key');
  
  keys.forEach(key => {
    const swara = key.getAttribute('data-swara');
    
    // Mouse / Touch events for realistic hold & release
    key.addEventListener('mousedown', (e) => {
      e.preventDefault();
      window.bansuri.startNote(swara);
      key.classList.add('playing');
    });

    key.addEventListener('mouseup', () => {
      window.bansuri.stopNote(swara);
      key.classList.remove('playing');
    });

    key.addEventListener('mouseleave', () => {
      window.bansuri.stopNote(swara);
      key.classList.remove('playing');
    });

    // Touch support for mobile devices
    key.addEventListener('touchstart', (e) => {
      e.preventDefault();
      window.bansuri.startNote(swara);
      key.classList.add('playing');
    }, { passive: false });

    key.addEventListener('touchend', (e) => {
      e.preventDefault();
      window.bansuri.stopNote(swara);
      key.classList.remove('playing');
    });
  });

  // Keyboard shortcut listener (1 to 7)
  const keyMap = {
    '1': 'Sa', '2': 'Re', '3': 'Ga', '4': 'Ma',
    '5': 'Pa', '6': 'Dha', '7': 'Ni', '8': 'Sa^'
  };

  window.addEventListener('keydown', (e) => {
    // Only trigger if not typing in form inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

    const swara = keyMap[e.key];
    if (swara) {
      const keyEl = document.querySelector(`.flute-key[data-swara="${swara}"]`);
      if (keyEl && !keyEl.classList.contains('playing')) {
        keyEl.classList.add('playing');
        window.bansuri.startNote(swara);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    const swara = keyMap[e.key];
    if (swara) {
      const keyEl = document.querySelector(`.flute-key[data-swara="${swara}"]`);
      if (keyEl) {
        keyEl.classList.remove('playing');
        window.bansuri.stopNote(swara);
      }
    }
  });

  // Melody Buttons
  const btnBhupali = document.getElementById('btn-play-bhupali');
  if (btnBhupali) {
    btnBhupali.addEventListener('click', () => window.bansuri.playMelody('bhupali'));
  }

  const btnFolk = document.getElementById('btn-play-folk');
  if (btnFolk) {
    btnFolk.addEventListener('click', () => window.bansuri.playMelody('folk'));
  }
});
