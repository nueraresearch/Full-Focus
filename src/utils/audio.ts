/**
 * Web Audio API synthesizer for focus tones, completion chimes, and ambient soundscapes.
 * Completely self-contained and instant.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play gentle focus start chime
export function playStartChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(523.25, now); // C5
  osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(659.25, now);
  osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.6);
  osc2.stop(now + 0.6);
}

// Play task completion celebration chime
export function playCompletionChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + idx * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.55);
  });
}

// Play deadline alert chime
export function playAlertChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(880, now + 0.1);
  osc.frequency.setValueAtTime(440, now + 0.2);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.45);
}

// Subtle mechanical timer tick
export function playTickSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

// Ambient Sound Synthesizer Node
let currentAmbientNodes: { stop: () => void } | null = null;

export function stopAmbientSound() {
  if (currentAmbientNodes) {
    try {
      currentAmbientNodes.stop();
    } catch {
      // ignore
    }
    currentAmbientNodes = null;
  }
}

export type AmbientSoundType = 'none' | 'binaural_40hz' | 'white_noise' | 'deep_space' | 'rain';

export function playAmbientSound(type: AmbientSoundType, volume = 0.2) {
  stopAmbientSound();
  if (type === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(Math.min(volume, 0.4), ctx.currentTime);
  masterGain.connect(ctx.destination);

  if (type === 'binaural_40hz') {
    // 40Hz Gamma Focus Binaural Beat (Left: 200Hz, Right: 240Hz)
    const merger = ctx.createChannelMerger(2);
    
    const oscL = ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(200, ctx.currentTime);
    oscL.connect(merger, 0, 0);

    const oscR = ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(240, ctx.currentTime);
    oscR.connect(merger, 0, 1);

    merger.connect(masterGain);
    oscL.start();
    oscR.start();

    currentAmbientNodes = {
      stop: () => {
        oscL.stop();
        oscR.stop();
        masterGain.disconnect();
      }
    };
  } else if (type === 'deep_space') {
    // Warm low frequency atmospheric drone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(110, ctx.currentTime); // A2

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);

    osc1.start();
    osc2.start();

    currentAmbientNodes = {
      stop: () => {
        osc1.stop();
        osc2.stop();
        masterGain.disconnect();
      }
    };
  } else if (type === 'white_noise' || type === 'rain') {
    // Synthesize noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(0.7, ctx.currentTime);
    } else {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, ctx.currentTime);
    }

    whiteNoise.connect(filter);
    filter.connect(masterGain);
    whiteNoise.start();

    currentAmbientNodes = {
      stop: () => {
        whiteNoise.stop();
        masterGain.disconnect();
      }
    };
  }
}
