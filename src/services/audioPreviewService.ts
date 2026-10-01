/**
 * Serviço de Previews de Áudio e Integrações de Streaming
 * Busca previews reais de 30 segundos via iTunes / Apple Music Catalog API (livre de login)
 * e possui sintetizador Web Audio harmônico como fallback acústico de alta fidelidade.
 */

const previewCache = new Map<string, string>();

/**
 * Busca o link de áudio de preview oficial (30 segundos)
 */
export async function fetchAudioPreview(title: string, artist: string): Promise<string | null> {
  const cacheKey = `${artist.toLowerCase()} - ${title.toLowerCase()}`;
  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey) || null;
  }

  try {
    const cleanTitle = title.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
    const query = encodeURIComponent(`${artist} ${cleanTitle}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
      const url = data.results[0].previewUrl;
      previewCache.set(cacheKey, url);
      return url;
    }
  } catch (error) {
    console.warn('Erro ao consultar preview de áudio:', error);
  }

  return null;
}

/**
 * Gerador de áudio sintético harmônico via Web Audio API
 * Quando uma faixa for tão underground (vinil exclusivo/white label) que não exista na Apple,
 * este motor sintetiza uma prévia do groove no BPM exato e na frequência fundamental do tom Camelot.
 */
class SynthesizedDJPreviewEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Frequência fundamental aproximada para notas musicais
  private getFrequencyForCamelot(camelotKey: string): number {
    const freqs: Record<string, number> = {
      '1A': 207.65, // G# / Ab
      '2A': 155.56, // Eb / D#
      '3A': 233.08, // Bb / A#
      '4A': 174.61, // F
      '5A': 130.81, // C
      '6A': 196.00, // G
      '7A': 146.83, // D
      '8A': 220.00, // A
      '9A': 164.81, // E
      '10A': 246.94, // B
      '11A': 185.00, // F#
      '12A': 277.18, // C#
    };
    const key = camelotKey.replace('B', 'A');
    return freqs[key] || 220.0;
  }

  public playHarmonicGroove(bpm: number, camelotKey: string, onStop?: () => void) {
    this.stop();
    const ctx = this.getAudioContext();
    this.isPlaying = true;

    const rootFreq = this.getFrequencyForCamelot(camelotKey);
    const intervalSeconds = 60 / bpm;
    let beat = 0;

    const playBeat = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      // 1. Kick Drum analógico no tempo
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(130, now);
      kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
      kickGain.gain.setValueAtTime(0.5, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.3);

      // 2. Linha de Baixo Sub pulsante na nota fundamental
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sawtooth';
      // Filtro passa-baixa para timbre deep techno
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, now);

      bassOsc.frequency.setValueAtTime(rootFreq / 4, now);
      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + intervalSeconds * 0.9);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + intervalSeconds);

      // 3. Chimbal fechado nos contratempos
      if (beat % 2 === 1) {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const hhFilter = ctx.createBiquadFilter();
        hhFilter.type = 'highpass';
        hhFilter.frequency.value = 7500;
        const hhGain = ctx.createGain();
        hhGain.gain.setValueAtTime(0.1, now);
        hhGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(hhFilter);
        hhFilter.connect(hhGain);
        hhGain.connect(ctx.destination);
        noise.start(now);
      }

      beat = (beat + 1) % 16;
      this.timerId = window.setTimeout(playBeat, intervalSeconds * 1000);
    };

    playBeat();

    // Auto-stop após 25 segundos
    window.setTimeout(() => {
      if (this.isPlaying) {
        this.stop();
        if (onStop) onStop();
      }
    }, 25000);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const synthPreviewEngine = new SynthesizedDJPreviewEngine();
