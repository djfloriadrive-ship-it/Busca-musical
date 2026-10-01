/**
 * Tipagens completas para faixas de DJ, análise harmônica Camelot,
 * metadados do Rekordbox, Deezer Widget & ID, classificação e pontes harmônicas.
 */

export type CamelotMode = 'A' | 'B'; // A = Menor (Minor), B = Maior (Major)

export type ReferenceClassification =
  | 'organic_brazilian'
  | 'acoustic_mpb'
  | 'indie_folk'
  | 'bossa_soul'
  | 'electronic_club'
  | 'melodic_techno'
  | 'progressive_house'
  | 'house'
  | 'minimal_deep_tech'
  | 'electro_house'
  | 'indie_dance'
  | 'unknown';

export type RecommendationKind =
  | 'faixa_afim'
  | 'ponte_organica'
  | 'ponte_para_pista';

export type MetadataSource = 'deezer' | 'external' | 'estimated' | 'unknown';

export interface DJTrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  camelotKey: string; // Ex: "8A", "11B"
  musicalKey: string; // Ex: "A minor", "F# minor", "G major"
  genre: string; // Ex: "Melodic House & Techno", "Progressive House", "House", "Minimal / Deep Tech", "Música Brasileira / MPB"
  subgenre: string; // Ex: "Driving Modular Melodic", "Nova MPB / Acústico Orgânico"
  subgenreReason: string; // Justificativa detalhada dos elementos sonoros (baixo, sintetizador, violão, ritmo, ambiência)
  label: string; // Gravadora
  energyLevel: number; // 1 a 10 (VU meter de intensidade)
  releaseYear: number;
  duration?: string; // Ex: "06:45"
  previewUrl?: string; // URL direta de preview de áudio (30s MP3 do Deezer/Apple)
  albumCoverUrl?: string; // Capa do álbum oficial do Deezer
  deezerId?: string | number; // ID oficial no Deezer para o widget embutido
  deezerLink?: string; // Link direto oficial para a faixa no Deezer
  isExtendedMix?: boolean; // True se for a versão Extended Mix / Club Mix
  matchedTitle?: string; // Título oficial cadastrado no Deezer
  isOrganicBridge?: boolean; // True se for uma ponte harmônica orgânica entre MPB e set eletrônico
  recommendationKind?: RecommendationKind; // faixa_afim, ponte_organica ou ponte_para_pista
  bpmDelta?: number; // Diferença em relação à referência (ex: +2, -1)
  bpmVerified?: boolean; // True se o BPM foi verificado via Deezer ou fonte autorizada
  harmonicCompatibility?: boolean; // True se respeita estritamente a roda Camelot
  compatibilityReason?: string; // Explicação técnica da compatibilidade (ex: "Mesmo tom 10A (+2 BPM)")
  beatportSearchUrl: string;
  spotifySearchUrl: string;
  bandcampSearchUrl: string;
  traxsourceSearchUrl?: string;
  ytMusicSearchUrl?: string;
  comments?: string;
  hotCues?: number;
  isUnderground?: boolean;
  source: 'rekordbox' | 'curation' | 'crate' | 'manual' | 'seed';
  transitionNotes?: string;
}

export interface DeezerSearchResult {
  id: number | string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  cover_medium?: string;
  preview: string;
  link: string;
  duration: number;
  bpm?: number;
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
  macroGenre: 'all' | 'Melodic Techno' | 'Progressive House' | 'Electro House' | 'House' | 'Minimal / Deep Tech';
  subgenreFocus: string;
  targetBpm: number;
  bpmTolerance: number;
  targetCamelotKey?: string;
  targetEnergy: number; // 1 a 10
  selectedLabels: string[];
  customLabelSearch?: string;
  onlyUnderground: boolean;
  eventVibe: EventVibe;
  customPrompt?: string;
}

export interface SeedDiscoveryResult {
  seedAnalysis: {
    title: string;
    artist: string;
    bpm: number;
    camelotKey: string;
    musicalKey: string;
    genre: string;
    subgenre: string;
    subgenreReason: string;
    classification?: ReferenceClassification;
    classificationLabel?: string;
    confidence?: number;
    instruments?: string[];
    sonicSignature?: string;
    bpmSource?: MetadataSource;
    keySource?: MetadataSource;
    isAcousticOrOrganic?: boolean;
    compatibleKeys?: string[];
    targetBpmRange?: string;
    albumCoverUrl?: string;
    deezerId?: string | number;
    deezerLink?: string;
    previewUrl?: string;
  };
  tracks: DJTrack[];
  similarArtists: string[];
  recommendedLabels: string[];
}
