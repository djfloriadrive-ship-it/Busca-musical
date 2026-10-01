/**
 * Motor de Cálculo Harmônico Camelot Wheel e Análise de Transições
 * Implementa as regras clássicas de mixagem harmônica profissional para DJs.
 */

import { CamelotTransitionType, DJTrack, TransitionAnalysis } from '../types/dj';

// Mapeamento bidirecional entre Notação Musical Padrão e Camelot Wheel
export const MUSICAL_TO_CAMELOT: Record<string, string> = {
  // Tons Menores (Camelot 'A')
  'Abm': '1A', 'G#m': '1A', 'G# MINOR': '1A', 'AB MINOR': '1A', 'G#MIN': '1A',
  'Ebm': '2A', 'D#m': '2A', 'EB MINOR': '2A', 'D# MINOR': '2A', 'EBMIN': '2A',
  'Bbm': '3A', 'A#m': '3A', 'BB MINOR': '3A', 'A# MINOR': '3A', 'BBMIN': '3A',
  'Fm': '4A', 'F MINOR': '4A', 'FMIN': '4A',
  'Cm': '5A', 'C MINOR': '5A', 'CMIN': '5A',
  'Gm': '6A', 'G MINOR': '6A', 'GMIN': '6A',
  'Dm': '7A', 'D MINOR': '7A', 'DMIN': '7A',
  'Am': '8A', 'A MINOR': '8A', 'AMIN': '8A',
  'Em': '9A', 'E MINOR': '9A', 'EMIN': '9A',
  'Bm': '10A', 'B MINOR': '10A', 'BMIN': '10A',
  'F#m': '11A', 'Gbm': '11A', 'F# MINOR': '11A', 'GB MINOR': '11A', 'F#MIN': '11A',
  'C#m': '12A', 'Dbm': '12A', 'C# MINOR': '12A', 'DB MINOR': '12A', 'C#MIN': '12A',

  // Tons Maiores (Camelot 'B')
  'B': '1B', 'B MAJOR': '1B', 'BMAJ': '1B',
  'F#': '2B', 'Gb': '2B', 'F# MAJOR': '2B', 'GB MAJOR': '2B', 'F#MAJ': '2B',
  'Db': '3B', 'C#': '3B', 'DB MAJOR': '3B', 'C# MAJOR': '3B', 'DBMAJ': '3B',
  'Ab': '4B', 'G#': '4B', 'AB MAJOR': '4B', 'G# MAJOR': '4B', 'ABMAJ': '4B',
  'Eb': '5B', 'D#': '5B', 'EB MAJOR': '5B', 'D# MAJOR': '5B', 'EBMAJ': '5B',
  'Bb': '6B', 'A#': '6B', 'BB MAJOR': '6B', 'A# MAJOR': '6B', 'BBMAJ': '6B',
  'F': '7B', 'F MAJOR': '7B', 'FMAJ': '7B',
  'C': '8B', 'C MAJOR': '8B', 'CMAJ': '8B',
  'G': '9B', 'G MAJOR': '9B', 'GMAJ': '9B',
  'D': '10B', 'D MAJOR': '10B', 'DMAJ': '10B',
  'A': '11B', 'A MAJOR': '11B', 'AMAJ': '11B',
  'E': '12B', 'E MAJOR': '12B', 'EMAJ': '12B',
};

export const CAMELOT_TO_MUSICAL: Record<string, string> = {
  '1A': 'Ab minor',
  '2A': 'Eb minor',
  '3A': 'Bb minor',
  '4A': 'F minor',
  '5A': 'C minor',
  '6A': 'G minor',
  '7A': 'D minor',
  '8A': 'A minor',
  '9A': 'E minor',
  '10A': 'B minor',
  '11A': 'F# minor',
  '12A': 'C# minor',
  '1B': 'B major',
  '2B': 'F# major',
  '3B': 'Db major',
  '4B': 'Ab major',
  '5B': 'Eb major',
  '6B': 'Bb major',
  '7B': 'F major',
  '8B': 'C major',
  '9B': 'G major',
  '10B': 'D major',
  '11B': 'A major',
  '12B': 'E major',
};

/**
 * Normaliza qualquer notação de tom recebida do Rekordbox ou texto para o formato Camelot (ex: "8A")
 */
export function normalizeToCamelot(rawKey: string | undefined): { camelotKey: string; musicalKey: string } {
  if (!rawKey) {
    return { camelotKey: '8A', musicalKey: 'A minor' };
  }

  const clean = rawKey.trim();
  const upper = clean.toUpperCase();

  // Verifica se já é formato Camelot (ex: "8A", "11B", "08A")
  const camelotMatch = upper.match(/^0?([1-9]|1[0-2])([AB])$/);
  if (camelotMatch) {
    const norm = `${parseInt(camelotMatch[1], 10)}${camelotMatch[2]}`;
    return {
      camelotKey: norm,
      musicalKey: CAMELOT_TO_MUSICAL[norm] || clean,
    };
  }

  // Tenta encontrar pelo dicionário musical
  if (MUSICAL_TO_CAMELOT[clean]) {
    const cKey = MUSICAL_TO_CAMELOT[clean];
    return { camelotKey: cKey, musicalKey: CAMELOT_TO_MUSICAL[cKey] || clean };
  }
  if (MUSICAL_TO_CAMELOT[upper]) {
    const cKey = MUSICAL_TO_CAMELOT[upper];
    return { camelotKey: cKey, musicalKey: CAMELOT_TO_MUSICAL[cKey] || clean };
  }

  // Fallback padrão se não reconhecido
  return { camelotKey: '8A', musicalKey: clean || 'A minor' };
}

/**
 * Extrai número (1-12) e letra (A ou B) da chave Camelot
 */
export function parseCamelot(key: string): { num: number; letter: 'A' | 'B' } {
  const match = key.match(/^([1-9]|1[0-2])([AB])$/i);
  if (!match) return { num: 8, letter: 'A' };
  return {
    num: parseInt(match[1], 10),
    letter: match[2].toUpperCase() as 'A' | 'B',
  };
}

/**
 * Retorna as chaves harmônicas mais compatíveis para uma dada chave
 */
export function getCompatibleCamelotKeys(key: string): Array<{
  key: string;
  musical: string;
  relation: string;
  energyImpact: string;
  badgeColor: string;
}> {
  const { num, letter } = parseCamelot(key);
  const otherLetter = letter === 'A' ? 'B' : 'A';

  // 1. Mesmo tom
  const exact = `${num}${letter}`;
  // 2. Quinta acima (+1 no relógio) - elevação suave
  const plusOne = `${(num % 12) + 1}${letter}`;
  // 3. Quarta abaixo (-1 no relógio) - aprofundamento/calma
  const minusOne = `${num === 1 ? 12 : num - 1}${letter}`;
  // 4. Relativo Maior/Menor (mesmo número, outra letra) - mudança de clima emotivo
  const relative = `${num}${otherLetter}`;
  // 5. Energy Boost (+2 quintas no relógio)
  const plusTwo = `${((num + 1) % 12) + 1}${letter}`;
  // 6. Transição Diagonal (+1 quinta + mudança de modo)
  const diagonal = `${(num % 12) + 1}${otherLetter}`;

  return [
    {
      key: exact,
      musical: CAMELOT_TO_MUSICAL[exact] || '',
      relation: 'Mesmo Tom (Perfeita)',
      energyImpact: 'Continuidade tonal absoluta, blend suave e prolongado.',
      badgeColor: '#10b981', // Emerald
    },
    {
      key: plusOne,
      musical: CAMELOT_TO_MUSICAL[plusOne] || '',
      relation: 'Quinta Acima (+1 Hora)',
      energyImpact: 'Elevação harmônica sutil, adiciona frescor e brilho melódico.',
      badgeColor: '#06b6d4', // Cyan
    },
    {
      key: minusOne,
      musical: CAMELOT_TO_MUSICAL[minusOne] || '',
      relation: 'Quarta Abaixo (-1 Hora)',
      energyImpact: 'Aprofundamento hipnótico, ideal para assentar a pista ou criar suspense.',
      badgeColor: '#3b82f6', // Blue
    },
    {
      key: relative,
      musical: CAMELOT_TO_MUSICAL[relative] || '',
      relation: 'Relativo Maior/Menor (Modo)',
      energyImpact: 'Mudança drástica de clima emocional sem choque acústico.',
      badgeColor: '#a855f7', // Purple
    },
    {
      key: plusTwo,
      musical: CAMELOT_TO_MUSICAL[plusTwo] || '',
      relation: 'Salto de Energia (+2 Horas)',
      energyImpact: 'Injeção de intensidade e impacto imediato para o clímax da pista.',
      badgeColor: '#f59e0b', // Amber
    },
    {
      key: diagonal,
      musical: CAMELOT_TO_MUSICAL[diagonal] || '',
      relation: 'Transição Diagonal (+1 & Modo)',
      energyImpact: 'Combina elevação de tensão com alternância de luz e sombra.',
      badgeColor: '#ec4899', // Pink
    },
  ];
}

/**
 * Analisa a transição detalhada entre duas faixas consecutivas de um set
 */
export function analyzeTransition(fromTrack: DJTrack, toTrack: DJTrack): TransitionAnalysis {
  const from = parseCamelot(fromTrack.camelotKey);
  const to = parseCamelot(toTrack.camelotKey);

  // Análise de BPM
  const bpmDelta = Number((toTrack.bpm - fromTrack.bpm).toFixed(1));
  const bpmPercentDelta = Number(((bpmDelta / fromTrack.bpm) * 100).toFixed(1));

  let bpmStatus: 'perfect' | 'safe' | 'stretch' | 'risky' = 'perfect';
  if (Math.abs(bpmPercentDelta) === 0) {
    bpmStatus = 'perfect';
  } else if (Math.abs(bpmPercentDelta) <= 3.0) {
    bpmStatus = 'safe';
  } else if (Math.abs(bpmPercentDelta) <= 6.0) {
    bpmStatus = 'stretch';
  } else {
    bpmStatus = 'risky';
  }

  // Análise de Camelot
  const sameMode = from.letter === to.letter;
  const numDiff = Math.abs(from.num - to.num);
  const clockDist = Math.min(numDiff, 12 - numDiff);

  let camelotType: CamelotTransitionType = 'acceptable';
  let compatibilityScore = 70;
  let headline = 'Transição Aceitável';
  let technicalAdvice = 'Ajuste o pitch e faça a transição nos momentos sem sobreposição densa de melodias.';
  let harmonicColor = '#94a3b8'; // Slate

  // 1. Mesmo tom (8A -> 8A)
  if (sameMode && clockDist === 0) {
    camelotType = 'exact';
    compatibilityScore = 100;
    headline = 'Harmonia Idêntica (Bloqueio Perfeito)';
    technicalAdvice = 'Excelente para longos blends de equalização (EQ) e sobreposição de baixos sem conflito de notas.';
    harmonicColor = '#10b981'; // Emerald
  }
  // 2. Quinta acima (+1 no relógio: 8A -> 9A)
  else if (sameMode && (to.num === (from.num % 12) + 1)) {
    camelotType = 'dominant_fifth';
    compatibilityScore = 95;
    headline = 'Quinta Acima (+1 Hora): Elevação Harmônica';
    technicalAdvice = 'Eleva a tensão melódica de forma muito natural. Deixe os acordes da nova faixa subirem no breakdown.';
    harmonicColor = '#06b6d4'; // Cyan
  }
  // 3. Quarta abaixo (-1 no relógio: 8A -> 7A)
  else if (sameMode && (from.num === (to.num % 12) + 1)) {
    camelotType = 'subdominant_fourth';
    compatibilityScore = 95;
    headline = 'Quarta Abaixo (-1 Hora): Aprofundamento Hipnótico';
    technicalAdvice = 'Aprofunda a vibração da pista. Perfeito para relaxar a tensão ou preparar um novo ciclo hipnótico.';
    harmonicColor = '#3b82f6'; // Blue
  }
  // 4. Mudança de modo relativo (8A -> 8B ou 8B -> 8A)
  else if (!sameMode && clockDist === 0) {
    camelotType = 'relative_mode';
    compatibilityScore = 90;
    headline = 'Relativo Maior/Menor: Mudança Emocional';
    technicalAdvice = 'Altera drasticamente a atmosfera (sombria para esperançosa ou vice-versa) mantendo a mesma escala musical.';
    harmonicColor = '#a855f7'; // Purple
  }
  // 5. Energy Boost (+2 quintas no relógio: 8A -> 10A)
  else if (sameMode && (to.num === ((from.num + 1) % 12) + 1)) {
    camelotType = 'energy_boost_2';
    compatibilityScore = 85;
    headline = 'Salto de Energia (+2 Horas): Impacto de Pista';
    technicalAdvice = 'Excelente injeção de energia! Recomendado fazer a troca rápida no primeiro compasso do drop.';
    harmonicColor = '#f59e0b'; // Amber
  }
  // 6. Transição Diagonal (+1 quinta e mudança de modo: 8A -> 9B)
  else if (!sameMode && clockDist === 1) {
    camelotType = 'diagonal_shift';
    compatibilityScore = 78;
    headline = 'Transição Diagonal: Tensão & Cor Alternada';
    technicalAdvice = 'Mistura interessante de mudança modal com leve ganho de tom. Introduza com filtros passa-alta.';
    harmonicColor = '#ec4899'; // Pink
  }
  // 7. Choque Harmônico
  else if (clockDist >= 3) {
    camelotType = 'clash';
    compatibilityScore = Math.max(15, 60 - clockDist * 10);
    headline = 'Choque Tonal Avisado (Distância Harmônica)';
    technicalAdvice = 'Notas melódicas vão colidir se sobrepostas. Mixe no beat percussivo seco, usando reverb wash out ou delay antes da entrada.';
    harmonicColor = '#ef4444'; // Red
  }

  // Análise de Energia
  const energyDelta = toTrack.energyLevel - fromTrack.energyLevel;
  let energyStatus: TransitionAnalysis['energyStatus'] = 'steady';
  if (energyDelta >= 2) energyStatus = 'peak_climax';
  else if (energyDelta === 1) energyStatus = 'smooth_rise';
  else if (energyDelta === 0) energyStatus = 'steady';
  else if (energyDelta === -1) energyStatus = 'chill_drop';
  else energyStatus = 'abrupt_drop';

  // Coerência estilística de subgênero
  let subgenreCoherence = `${fromTrack.subgenre} ➔ ${toTrack.subgenre}`;
  if (fromTrack.genre === toTrack.genre) {
    subgenreCoherence += ' (Mesmo universo rítmico)';
  } else {
    subgenreCoherence += ' (Ponte estilística entre vertentes)';
  }

  return {
    fromTrack,
    toTrack,
    bpmDelta,
    bpmPercentDelta,
    bpmStatus,
    camelotType,
    compatibilityScore,
    headline,
    technicalAdvice,
    harmonicColor,
    energyDelta,
    energyStatus,
    subgenreCoherence,
  };
}
