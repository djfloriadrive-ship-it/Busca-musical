import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Inicializa a SDK do Gemini no servidor com a chave do ambiente
const ai = new GoogleGenAI();

// Endpoint 1: Curadoria Underground (Crate Digger)
app.post('/api/curate', async (req, res) => {
  try {
    const filter = req.body;
    const prompt = `Você é um curador musical de elite para DJs de clubs underground, festivais conceituais e sessões de vinil.
Sua especialidade são as vertentes de:
- Melodic Techno (ex: Innervisions, Afterlife b-sides, TAU, Siamese, Maeve, Diynamic)
- Indie Dance / Dark Disco (ex: Correspondant, Disco Halal, Permanent Vacation, Eskimo, Multinotes)
- House / Deep / Minimal Hypnotic (ex: Toy Tonics, Keinemusik, Running Back, Border Community)

OBJETIVO DA PESQUISA:
Encontrar 6 faixas REAIS, excelentes e exclusivas (under-the-radar / b-sides / artistas emergentes) que garantam frescor ao set do DJ.
PROIBIDO ABSOLUTAMENTE:
- NÃO traga hits comerciais ou saturados de rádio (ex: nada de CamelPhat - Cola, Fisher - Losing It, Peggy Gou, Dom Dolla).
- Foque em produções sofisticadas com identidade e requinte sonoro.

CRITÉRIOS SOLICITADOS:
- Vertente / Gênero Macro: ${filter.macroGenre || 'all'}
- Foco de Subgênero: ${filter.subgenreFocus || 'Sem restrição rígida, manter coerência'}
- BPM Alvo: ${filter.targetBpm || 123} (tolerância ±${filter.bpmTolerance || 2})
- Tom Camelot Alvo: ${filter.targetCamelotKey || 'Qualquer tom harmônico'}
- Nível de Energia Desejado: ${filter.targetEnergy || 7}/10
- Selos Independentes Preferenciais: ${filter.selectedLabels?.length ? filter.selectedLabels.join(', ') : 'Innervisions, Correspondant, Disco Halal, Permanent Vacation, Toy Tonics, TAU, Life and Death'}
- Tipo de Evento / Vibe: ${filter.eventVibe || 'club_prime_time'}
${filter.customPrompt ? `- Instrução Adicional do DJ: "${filter.customPrompt}"` : ''}

IMPORTANTE (SUBGÊNERO E DNA SONORO):
Para CADA música, você DEVE fornecer:
1. genre: O gênero macro (ex: "Melodic Techno", "Indie Dance", "House")
2. subgenre: O subgênero ultra-específico (ex: "Dark Italo-Arpeggiated Indie Dance", "Peak-Time Modular Melodic", "Deep Hypnotic Microhouse")
3. subgenreReason: A JUSTIFICATIVA SONORA detalhada (em português) explicando exatamente quais timbres de sintetizador, ritmo de bateria/baixo, ambiência acústica e arranjo justificam seu enquadramento naquele subgênero específico.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              tonality: { type: Type.STRING, description: 'Tom musical ou Camelot (ex: 8A ou Am)' },
              genre: { type: Type.STRING },
              subgenre: { type: Type.STRING },
              subgenreReason: { type: Type.STRING },
              label: { type: Type.STRING },
              energyLevel: { type: Type.NUMBER },
              releaseYear: { type: Type.NUMBER },
              duration: { type: Type.STRING },
              mixAdvice: { type: Type.STRING },
            },
            required: ['title', 'artist', 'bpm', 'tonality', 'genre', 'subgenre', 'subgenreReason', 'label', 'energyLevel'],
          },
        },
      },
    });

    const items = response.text ? JSON.parse(response.text) : [];
    res.json({ success: true, tracks: items });
  } catch (error) {
    console.warn('Erro temporário na API Gemini, acionando catálogo curado de contingência:', error);
    // Catálogo de contingência de gravadoras independentes para garantir resposta imediata
    const fallbackList = [
      {
        title: 'Tarantism (Club Mix)',
        artist: 'Glowal',
        bpm: 124,
        tonality: '8A',
        genre: 'Melodic Techno',
        subgenre: 'Hypnotic Deep Melodic',
        subgenreReason: 'Linha de baixo pulsante e cavernosa, atmosfera introspectiva com sintetizadores de fase lenta, sem drops espalhafatosos.',
        label: 'Innervisions',
        energyLevel: 7,
        releaseYear: 2023,
        duration: '06:44',
      },
      {
        title: 'Shadow Movement',
        artist: 'Curses',
        bpm: 120,
        tonality: '4A',
        genre: 'Indie Dance',
        subgenre: 'Dark Italo / Post-Punk Disco',
        subgenreReason: 'Sintetizador monofônico em arpejo contínuo, caixa com reverb anos 80 e guitarras rítmicas staccato com clima sombrio cinematográfico.',
        label: 'Correspondant',
        energyLevel: 6,
        releaseYear: 2023,
        duration: '06:18',
      },
      {
        title: 'Fernweh (B-Side Cut)',
        artist: 'Lauer',
        bpm: 122,
        tonality: '5A',
        genre: 'Indie Dance',
        subgenre: 'Neo-Italo Cosmic Dance',
        subgenreReason: 'Melodias luminosas em baixo sintetizado galopante, chimbaus orgânicos e timbres de Juno vintage sem elementos comerciais.',
        label: 'Permanent Vacation',
        energyLevel: 7,
        releaseYear: 2023,
        duration: '06:05',
      },
      {
        title: 'Late Night Groove',
        artist: 'Cody Currie',
        bpm: 122,
        tonality: '7A',
        genre: 'House',
        subgenre: 'Jazzy Deep & Minimal Funk',
        subgenreReason: 'Teclas de piano elétrico Rhodes, linha de baixo acústica sincopada com bateria crua e percussão gravada organicamente.',
        label: 'Toy Tonics',
        energyLevel: 6,
        releaseYear: 2023,
        duration: '05:45',
      },
      {
        title: 'Sirens of Titan',
        artist: 'Damon Jee',
        bpm: 122,
        tonality: '6A',
        genre: 'Indie Dance',
        subgenre: 'Dark Italo / Post-Punk EBM',
        subgenreReason: 'Guitarras elétricas com chorus gótico, caixa pesada 80s e sintetizador monofônico agressivo com timbre industrial controlado.',
        label: 'Correspondant',
        energyLevel: 8,
        releaseYear: 2024,
        duration: '06:12',
      },
      {
        title: 'Solar Eclipse (Dub Mix)',
        artist: 'KAS:ST & Mind Against',
        bpm: 125,
        tonality: '9A',
        genre: 'Melodic Techno',
        subgenre: 'Cinematic Melodic Peak',
        subgenreReason: 'Arpejos melancólicos com reverberação de cauda longa, transições com white noise sutil e sub-bass envolvente.',
        label: 'Afterlife',
        energyLevel: 8,
        releaseYear: 2024,
        duration: '07:42',
      },
    ];
    res.json({ success: true, tracks: fallbackList, fallback: true });
  }
});

// Endpoint 2: Faixa Ponte Harmônica (Set Bridge)
app.post('/api/bridge', async (req, res) => {
  try {
    const { fromTrack, toTrack, eventVibe } = req.body;
    const prompt = `Você é um diretor musical e mestre de mixagem harmônica para DJs profissionais.
O DJ precisa de uma FAIXA PONTE ("Bridge Track") perfeita para colocar entre duas músicas de um set que está montando no Rekordbox.

FAIXA A (Origem):
- Artista & Título: "${fromTrack.artist} - ${fromTrack.title}"
- BPM: ${fromTrack.bpm}
- Tom Camelot: ${fromTrack.camelotKey} (${fromTrack.musicalKey})
- Gênero / Subgênero: ${fromTrack.genre} / ${fromTrack.subgenre}
- Nível de Energia: ${fromTrack.energyLevel}/10
- Gravadora: ${fromTrack.label}

FAIXA B (Destino):
- Artista & Título: "${toTrack.artist} - ${toTrack.title}"
- BPM: ${toTrack.bpm}
- Tom Camelot: ${toTrack.camelotKey} (${toTrack.musicalKey})
- Gênero / Subgênero: ${toTrack.genre} / ${toTrack.subgenre}
- Nível de Energia: ${toTrack.energyLevel}/10
- Gravadora: ${toTrack.label}

CLIMA DO EVENTO: ${eventVibe}

REQUISITOS DA FAIXA PONTE:
1. Deve ter BPM intermediário entre ${fromTrack.bpm} e ${toTrack.bpm}.
2. Deve ter compatibilidade tonal Camelot com a Faixa A E facilitar a transição para a Faixa B (ex: quinta intermediária, relativo ou modulação suave).
3. Deve pertencer ao universo underground (House, Melodic Techno ou Indie Dance de selos independentes). NADA de músicas manjadíssimas.
4. Para CADA sugestão, indique claramente:
   - Gênero macro e Subgênero granular
   - subgenreReason: justificativa técnica sonora (timbres, baixo, ritmo)
   - transitionNotes: exatamente como o DJ deve conduzir a transição de A para a Ponte e da Ponte para B.

Gere 3 opções de faixas pontes de alta exclusividade.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              tonality: { type: Type.STRING },
              genre: { type: Type.STRING },
              subgenre: { type: Type.STRING },
              subgenreReason: { type: Type.STRING },
              label: { type: Type.STRING },
              energyLevel: { type: Type.NUMBER },
              releaseYear: { type: Type.NUMBER },
              duration: { type: Type.STRING },
              transitionNotes: { type: Type.STRING },
            },
            required: ['title', 'artist', 'bpm', 'tonality', 'genre', 'subgenre', 'subgenreReason', 'label', 'energyLevel', 'transitionNotes'],
          },
        },
      },
    });

    const items = response.text ? JSON.parse(response.text) : [];
    res.json({ success: true, tracks: items });
  } catch (error) {
    console.error('Erro ao gerar faixa ponte:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Endpoint 3: Sugestão de Próximas Faixas (Suggest Next)
app.post('/api/suggest-next', async (req, res) => {
  try {
    const { currentTrack, eventVibe, count = 4 } = req.body;
    const prompt = `Você é um curador para DJs de música eletrônica conceitual (House, Melodic Techno, Indie Dance).
O DJ acabou de tocar no Rekordbox a seguinte faixa:
- Artista & Título: "${currentTrack.artist} - ${currentTrack.title}"
- BPM: ${currentTrack.bpm}
- Tom Camelot: ${currentTrack.camelotKey} (${currentTrack.musicalKey})
- Gênero / Subgênero: ${currentTrack.genre} / ${currentTrack.subgenre}
- Nível de Energia: ${currentTrack.energyLevel}/10
- Gravadora: ${currentTrack.label}

VIBE DO EVENTO: ${eventVibe}

REQUISITOS:
Traga ${count} opções de faixas under-the-radar que sejam candidatas ideais para dar sequência ao set:
- Mantenha rigor harmônico da Camelot Wheel (mesmo tom, +1 quinta, -1 quinta, relativo maior/menor ou boost +2).
- Evite faixas óbvias ou mainstream saturado. Priorize selos independentes conceituados.
- Forneça para cada uma:
  * genre e subgenre granular
  * subgenreReason: justificativa técnica sonora dos timbres e ritmo
  * transitionNotes: por que funciona harmonicamente e como mixar a partir de "${currentTrack.title}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              bpm: { type: Type.NUMBER },
              tonality: { type: Type.STRING },
              genre: { type: Type.STRING },
              subgenre: { type: Type.STRING },
              subgenreReason: { type: Type.STRING },
              label: { type: Type.STRING },
              energyLevel: { type: Type.NUMBER },
              releaseYear: { type: Type.NUMBER },
              duration: { type: Type.STRING },
              transitionNotes: { type: Type.STRING },
            },
            required: ['title', 'artist', 'bpm', 'tonality', 'genre', 'subgenre', 'subgenreReason', 'label', 'energyLevel', 'transitionNotes'],
          },
        },
      },
    });

    const items = response.text ? JSON.parse(response.text) : [];
    res.json({ success: true, tracks: items });
  } catch (error) {
    console.error('Erro ao sugerir próximas faixas:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// Inicialização do Servidor com Vite middleware em dev
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Subterráneo Server listening on http://0.0.0.0:${port}`);
  });
}

startServer();
