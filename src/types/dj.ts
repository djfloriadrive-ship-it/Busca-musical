/**
 * Tipagens completas para faixas de DJ, análise harmônica Camelot,
 * metadados do Rekordbox e justificativas de subgênero.
 */

export type CamelotMode = 'A' | 'B'; // A = Menor (Minor), B = Maior (Major)

export interface DJTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  camelotKey: string; // Ex: "8A", "11B"
  musicalKey: string; // Ex: "A minor", "F# minor", "G major"
  genre: string; // Ex: "Melodic Techno", "Indie Dance", "House"
  subgenre: string; // Ex: "Dark Italo-Arpeggiated Indie Dance", "Peak-Time Melodic"
  subgenreReason: string; // Justificativa detalhada dos elementos sonoros (baixo, sintetizador, ritmo, ambiência)
  label: string; // Gravadora (ex: "Innervisions", "Correspondant", "Disco Halal", "TAU", "Permanent Vacation")
  energyLevel: number; // 1 a 10 (VU meter de intensidade)
  releaseYear: number;
  duration?: string; // Ex: "06:45"
  previewUrl?: string; // URL de preview de áudio (30s)
  beatportSearchUrl: string;
  spotifySearchUrl: string;
  bandcampSearchUrl: string;
  traxsourceSearchUrl?: string;
  ytMusicSearchUrl?: string;
  comments?: string;
  hotCues?: number;
  isUnderground?: boolean;
  source: 'rekordbox' | 'curation' | 'crate' | 'manual';
  transitionNotes?: string;
}

export type CamelotTransitionType =
  | 'exact' // 8A -> 8A (harmonia idêntica)
  | 'dominant_fifth' // 8A -> 9A (elevação harmônica)
  | 'subdominant_fourth' // 8A -> 7A (aprofundamento / calma)
  | 'relative_mode' // 8A -> 8B (mudança de clima maior/menor)
  | 'energy_boost_2' // 8A -> 10A (salto energético de 2 quintas)
  | 'semitone_boost' // +1 semitom (+7 quintas)
  | 'diagonal_shift' // 8A -> 9B (transição diagonal)
  | 'acceptable' // Diferença moderada
  | 'clash'; // Choque tonal evidente

export interface TransitionAnalysis {
  fromTrack: DJTrack;
  toTrack: DJTrack;
  bpmDelta: number; // Ex: +2.0
  bpmPercentDelta: number; // Ex: +1.6%
  bpmStatus: 'perfect' | 'safe' | 'stretch' | 'risky';
  camelotType: CamelotTransitionType;
  compatibilityScore: number; // 0 - 100%
  headline: string; // Resumo curto (ex: "Transição Harmônica Perfeita")
  technicalAdvice: string; // Orientação para o DJ (ex: "Mixe nas frequências médias sem conflito de notas")
  harmonicColor: string; // Cor para indicador visual
  energyDelta: number; // -9 a +9
  energyStatus: 'smooth_rise' | 'peak_climax' | 'chill_drop' | 'steady' | 'abrupt_drop';
  subgenreCoherence: string; // Análise de coerência entre os subgêneros das duas faixas
}

export type EventVibe =
  | 'sunset_warmup'
  | 'hypnotic_journey'
  | 'peak_time_banger'
  | 'afterhours_deep'
  | 'club_prime_time';

export interface DJSet {
  id: string;
  name: string;
  description: string;
  targetVibe: EventVibe;
  tracks: DJTrack[];
  createdAt: string;
  fileName?: string;
  sourceType: 'xml' | 'm3u' | 'preset' | 'custom';
}

export interface CurationFilter {
  macroGenre: 'all' | 'Melodic Techno' | 'Indie Dance' | 'House' | 'Dark Disco' | 'Afro House' | 'Minimal / Deep Tech';
  subgenreFocus: string;
  targetBpm: number;
  bpmTolerance: number;
  targetCamelotKey?: string;
  targetEnergy: number; // 1 a 10
  selectedLabels: string[];
  onlyUnderground: boolean;
  eventVibe: EventVibe;
  customPrompt?: string;
}
