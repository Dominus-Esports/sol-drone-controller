(function(){
  class AudioManager {
    constructor() {
      this.ctx = null;
      this.master = null;
    }
    Ensure() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.2;
        this.master.connect(this.ctx.destination);
      }
    }
    PlaySweep({ startFreq=2000, endFreq=200, duration=0.25 }) {
      this.Ensure();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      gain.gain.value = 0.25;
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain).connect(this.master);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }
    PlayImpact({ freq=110, duration=0.3 }) {
      this.Ensure();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.value = 0.3;
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain).connect(this.master);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }
    PlayPowerUp({ duration=0.7 }) {
      this.Ensure();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + duration);
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain).connect(this.master);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }
  }
  window.SOL_Audio = new AudioManager();
})();


