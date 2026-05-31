// High-fidelity programmatic Web Audio synthesizer for Astro-Chimes
// 100% Client-side. Zero assets download. Zero network overhead. Pure craft!

export const playAstroAudio = (type: 'bell' | 'swoosh' | 'success' | 'cashout') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (ctx.state === 'suspended') {
      // In some browsers, AudioContext is suspended until user interaction
      ctx.resume();
    }

    if (type === 'bell') {
      // Pentatonic cosmic bell harmony in C Major (C5-G5-C6)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const gain2 = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.15); // Celestial lift

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now); // G5 (resonant perfect fifth)

      // Slow elegant decay values
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      gain2.gain.setValueAtTime(0.04, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      // Lowpass filter for a cozy hand-felt woolen warm resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      osc1.connect(gain1);
      osc2.connect(gain2);

      gain1.connect(filter);
      gain2.connect(filter);
      filter.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 1.25);
      osc2.stop(now + 1.25);
    } else if (type === 'swoosh') {
      // Gentle cosmic wind sweeping
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.28);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'success') {
      // Arpeggiator cascade of ascending light
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C-E-G-C-E-G
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + index * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.02, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.6);
      });
    } else if (type === 'cashout') {
      // Retro cash gold-coin sound cascade (Ding-Ding-Ding!)
      const sequence = [987.77, 1318.51, 1567.98, 1975.53]; // B5 - E6 - G6 - B6 Ascending Sparkles
      sequence.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + index * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.05, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    }
  } catch (err) {
    // Fail silently when browser rules prevent autoplayer blocks
    console.debug("Astral synthesizer is cooling down:", err);
  }
};
