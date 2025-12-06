import { NoiseType } from '../types';

class AudioService {
  private audioContext: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private currentType: NoiseType = NoiseType.PLANE;
  private fadeInterval: number | null = null;

  private createNoiseBuffer(context: AudioContext): AudioBuffer {
    const bufferSize = context.sampleRate * 4; // 4 seconds buffer
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Pink Noise approximation
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // compensate for gain
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private configureNodesForType(type: NoiseType, context: AudioContext) {
    if (!this.filterNode) {
        this.filterNode = context.createBiquadFilter();
    }

    // Default connection
    // Noise -> Filter -> Gain -> Dest

    switch (type) {
      case NoiseType.PLANE:
        // Brown/Low Rumble
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(400, context.currentTime);
        this.filterNode.Q.setValueAtTime(1, context.currentTime);
        break;
      
      case NoiseType.RAIN:
        // White-ish noise with high cut
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(800, context.currentTime);
        this.filterNode.Q.setValueAtTime(0, context.currentTime);
        break;

      case NoiseType.WIND:
        // Bandpass moving slightly could be better, but static bandpass is okay for Lo-Fi
        this.filterNode.type = 'bandpass';
        this.filterNode.frequency.setValueAtTime(500, context.currentTime);
        this.filterNode.Q.setValueAtTime(0.5, context.currentTime);
        break;

      case NoiseType.OCEAN:
        // Lowpass, very low frequency
        this.filterNode.type = 'lowpass';
        this.filterNode.frequency.setValueAtTime(300, context.currentTime);
        this.filterNode.Q.setValueAtTime(1, context.currentTime);
        break;
    }
  }

  public async start(type: NoiseType = NoiseType.PLANE) {
    this.currentType = type;

    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // If already playing, just update filters smoothy
    if (this.isPlaying && this.noiseNode && this.filterNode) {
       this.configureNodesForType(type, this.audioContext);
       return;
    }

    const buffer = this.createNoiseBuffer(this.audioContext);
    
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.filterNode = this.audioContext.createBiquadFilter();
    this.configureNodesForType(type, this.audioContext);

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0.001; // Start silent

    // Connect
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.noiseNode.start();
    this.isPlaying = true;
    
    // Fade in
    this.gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 2);
  }

  public stop() {
    if (!this.isPlaying || !this.noiseNode || !this.gainNode || !this.audioContext) return;

    this.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.audioContext.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.0001, this.audioContext.currentTime + 1.5);

    setTimeout(() => {
      this.noiseNode?.stop();
      this.noiseNode?.disconnect();
      this.isPlaying = false;
      this.noiseNode = null;
    }, 1500);
  }

  public switchNoise(type: NoiseType) {
    if (this.isPlaying) {
      this.start(type);
    }
  }
}

export const audioService = new AudioService();
