# Subterráneo — DJ Crate Digging & Harmonic Set Architect

Plataforma avançada de pesquisa musical e curadoria para DJs, desenhada para garimpar faixas *under-the-radar*, gemas de selos independentes em **House**, **Melodic Techno** e **Indie Dance**, além de complementar e aperfeiçoar sets exportados do **Rekordbox** com rigor harmônico (Camelot), progressão de energia e **análise aprofundada de subgênero com justificativa sonora de cada faixa**.

---

### Decisões Confirmadas & Respostas do Usuário

> [!IMPORTANT]
> Decisões alinhadas e refinadas com base no feedback:
> - **Entrada do Rekordbox**: Upload direto de arquivos exportados **Rekordbox XML** (`rekordbox.xml`) e listas de reprodução **M3U/M3U8**, com analisador nativo no navegador (BPM, tonalidade/Camelot, artista, gravadora, tempo, comentários e hot cues).
> - **Integração de Streaming**: Motor de descoberta com busca em catálogo em tempo real, **previews de áudio instantâneos** (sem necessidade de login ou barreiras de autenticação), e **links diretos oficiais de 1 clique** para Beatport, Spotify, Bandcamp, Traxsource e YouTube.
> - **Critério de Recomendação**: Equilíbrio refinado entre **progressão harmônica Camelot** (regras de mixagem harmônica 8A ↔ 8A, 9A, 7A, 8B, boost de energia), **curva de energia e dinâmica de pista**, e **exclusividade subterrânea** (foco em selos independentes e artistas fora do mainstream comercial).
> - **Identificação de Gênero & DNA de Subgênero (NOVO)**: Exibição permanente de gênero e subgênero granular para cada faixa (tanto importada quanto recomendada), acompanhada de **justificativa sonora técnica** explicando os elementos que a caracterizam (estilo de arpejo, tipo de baixo, bumbo/groove percussivo, texturas de sintetizador e atmosfera).

---

## 1. Visão Geral & Conceito Central

### O que a aplicação faz
Uma estação de trabalho de curadoria musical para DJs exigentes que querem fugir do repertório óbvio das paradas comerciais do Beatport Top 100 ou playlists algorítmicas de rádio. O sistema permite:
1. **Importar Sets do Rekordbox**: Carregar arquivos XML ou M3U do Rekordbox, mapeando a sequência do set, tempo (BPM), tom musical (notação clássica e Camelot Wheel), curva de energia e classificação de subgêneros.
2. **Classificação & Justificativa de Subgênero (DNA Sonoro)**: Cada faixa traz a identificação do gênero macro (ex.: *Melodic Techno*, *Indie Dance*, *House*) e do subgênero específico (ex.: *Dark Disco Arpeggiated*, *Driving Peak Melodic*, *Hypnotic Microhouse*, *Ethereal Vocal Melodic*), detalhando exatamente o motivo sonoro da classificação (groove de bateria, arpejos de sintetizador analógico, progressão harmônica melancólica, timbres de bassline).
3. **Diagnóstico do Set & Detecção de Gaps**: Mapear a transição entre cada faixa, destacando saltos bruscos de BPM, choques harmônicos, quebras repentinas de energia ou incompatibilidade de subgênero.
4. **Set Completer & Bridge Builder**: Recomendar faixas pontes (*transition tracks*), faixas de aquecimento (*warm-up*), faixas de transição de tom e *peak-time bangers* raros que se encaixem organicamente na linguagem da apresentação.
5. **Underground Crate Digger**: Motor de garimpo focado em selos cultuados e independentes (ex.: *Innervisions, Correspondant, Disco Halal, Permanent Vacation, Toy Tonics, Life and Death, TAU, Siamese, Keinemusik, Maeve, Diynamic, Eskimo, Border Community, Phantasy Sound*), priorizando lados-B, lançamentos recentes e produtores emergentes.
6. **Player de Áudio & Links de Streaming**: Player com waveform em tempo real, reprodução de trechos das músicas e links diretos para compra/streaming no Beatport, Spotify e Bandcamp.
7. **Exportação**: Baixar a playlist complementada de volta em formato M3U compatível com Rekordbox ou copiar o tracklist pronto com anotações de mixagem e notas de subgênero.

### Público-Alvo
DJs de pistas conceituais, clubs, festivais alternativos e sunsets focados em Melodic Techno, Indie Dance, Dark Disco, Hypnotic House e Deep Tech, que valorizam narrativa sonora contínua e exclusividade de repertório.

---

## 2. Experiência do Usuário & Design Visual

### Fluxos Principais do Usuário

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TOP BAR DE WORKSTATION                          │
│  [SUBTERRÁNEO / CRATE DIGGER]  ·  [Set Builder] [Crate Digger] [Camelot] │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌──────────────────────────────────┐   ┌─────────────────────────────────┐
│     PAINEL REKORDBOX & SET       │   │    CRATE DIGGING & DESCOBERTA   │
│ · Upload Drag & Drop (.xml, .m3u)│   │ · Busca por Vertente / Selo     │
│ · Preset de Sets para Teste      │   │ · Filtro Anti-Comercial (Rare)  │
│ · Timeline com Curva de Energia  │   │ · Geração via Gemini 3.8 Flash  │
│ · Matriz Camelot da Sequência    │   │ · Cartões com BPM, Key, Energy  │
│ · Tag de Subgênero + DNA Sonoro  │   │ · "Por que encaixa no subgênero"│
│ · Slot de Inserção entre Faixas  │   │ · Previews de áudio funcionais  │
└──────────────────────────────────┘   └─────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                  RECOMENDAÇÕES HARMÔNICAS & PONTES                     │
│ · 5 faixas sob medida com compatibilidade harmônica (8A, 9A, 7A, 8B)   │
│ · Gênero + Subgênero + Análise de timbres e justificativa técnica      │
│ · Explicação da transição harmônica e coerência estilística            │
│ · Botão "Adicionar ao Set" no ponto desejado                           │
│ · Player Global no rodapé com controle de reprodução e atalhos Beatport│
└────────────────────────────────────────────────────────────────────────┘
```

### Exibição do "DNA Sonoro & Justificativa de Subgênero"
Cada faixa apresentará um módulo de inspeção estilística:
- **Gênero Macro**: *Indie Dance / Dark Disco*
- **Subgênero Específico**: *Dark Italo-Arpeggiated Indie Dance*
- **Por que se encaixa neste subgênero (Justificativa Sonora)**:
  > *"Linha de baixo arpejada em semicolcheias com sintetizador analógico estilo Moog, bumbo reto 4x4 com caixa com reverberação gated anos 80, guitarras pós-punk gravadas em staccato e clima sombrio cinematográfico sem elementos vocais pop comerciais."*

### Identidade Visual & Atmosfera de Club / Studio
- **Estética**: *Industrial Studio Workstation* — visual sóbrio, dark, minimalista e hiper-funcional, inspirado em mixers de alta fidelidade (estilo Allen & Heath Xone / AlphaTheta) e interfaces de estúdio de masterização.
- **Paleta de Cores**:
  - Fundo principal: Grafite profundo e carvão (`#090A0F`, `#0F121C`) com superfícies em cinza-chumbo acetinado (`#151926`).
  - Destaques sutis: Âmbar quente estilo VU Meter (`#F59E0B`), Verde harmônico analógico (`#10B981`) para compatibilidade Camelot perfeita, e Azul ciano espacial (`#06B6D4`) para faixas de Melodic Techno.
  - Tipografia: *Cabinet Grotesk / Plus Jakarta Sans* para títulos e controles, e *JetBrains Mono / tabular-nums* para BPM, tons Camelot, durações e métricas de energia.
- **Zero-Pill & Tipografia Limpa**: Metadados de gravadora, BPM e ano exibidos como texto limpo separado por pontos tipográficos sutis (`·`), sem cápsulas coloridas genéricas.

---

## 3. Principais Decisões de Produto & Arquitetura de Dados

### 1. Suporte a Arquivos Rekordbox XML e M3U
- **Parser XML nativo**: O navegador processa o arquivo `rekordbox.xml` gerado pelo menu de exportação do Pioneer Rekordbox, extraindo tags `<TRACK>`, atributos como `Name`, `Artist`, `AverageBpm`, `Tonality` (converte para Camelot automaticamente: ex. "Fm" -> "4A"), `BitRate`, `Comments` e `PlayCount`.
- **Parser M3U/M3U8 nativo**: Lê playlists padrão com linhas `#EXTINF` e nomes de arquivo.
- **Conjuntos de Demonstração (Demo Sets)**: Inclui 3 sets pré-carregados de alto nível ("Warehouse Melodic Odyssey 124 BPM", "Indie Dance Sunset Session 120 BPM", "Deep Minimal Afterhours 122 BPM") com justificativas completas de subgênero prontas para teste.

### 2. Motor de Recomendações & Crate Digging com IA Especializada
- Utiliza **Gemini 3.8 Flash** com prompts estruturados de curadoria musical especializada em música eletrônica independente, incorporando:
  - Base de dados e conhecimento de selos boutique: *Innervisions, Life and Death, Correspondant, Disco Halal, Permanent Vacation, Toy Tonics, Keinemusik, Afterlife, Maeve, Diynamic, Eskimo, Border Community, Phantasy Sound, Multinotes, TAU, Siamese, Watergate, Kompakt*.
  - Filtro estrito anti-mainstream: instrução explícita para evitar faixas com mais de milhões de streams saturadas ou hits de festival comercial, priorizando tracks de catálogo de vinil, lançamentos club recentes e produtores que despontam no cenário underground.
  - Estrutura de dados enriquecida para cada música:
    ```typescript
    interface DJTrack {
      id: string;
      title: string;
      artist: string;
      bpm: number;
      camelotKey: string;
      musicalKey: string;
      genre: string; // Ex: "Melodic Techno"
      subgenre: string; // Ex: "Deep Ethereal / Hypnotic Techno"
      subgenreReason: string; // "Por que encaixa: Baixo sub pulsante contínuo, pads atmosféricos em escala menor, percussão minimalista e ausência de drops espalhafatosos."
      label: string;
      energyLevel: number; // 1 a 10
      releaseYear: number;
      previewUrl?: string;
      beatportSearchUrl: string;
      spotifySearchUrl: string;
      bandcampSearchUrl: string;
      transitionNotes?: string;
    }
    ```
  - Cálculo harmônico estrito da Camelot Wheel:
    - Compatível Direto: mesmo tom (ex: 8A ➔ 8A)
    - Transição Suave (Vizinho): +1 ou -1 no relógio (ex: 8A ➔ 9A ou 8A ➔ 7A)
    - Mudança de Clima: Maior para Menor no mesmo número (ex: 8A ➔ 8B)
    - Energy Boost: +2 no relógio ou modulação de semitom

### 3. Integração com Streaming, Previews de Áudio e Links Oficiais
- **Busca e Previews de Áudio**: Integração com API de busca do iTunes/Apple Music para tocar previews de áudio de 30 segundos com áudio real diretamente no app, com waveform animada.
- **Links Oficiais Diretos**:
  - Beatport: Link direto para a página de busca da faixa no Beatport (`https://www.beatport.com/search?q=...`)
  - Spotify: Link para abertura direta no app/web do Spotify (`https://open.spotify.com/search/...`)
  - Bandcamp: Link para busca de compras diretas apoiando artistas independentes (`https://bandcamp.com/search?q=...`)
  - Traxsource: Link para compra no catálogo de house & underground
  - YouTube Music: Link rápido para sets e versões estendidas

### 4. Gestão de Estado e Persistência Local
- Todo o set montado, histórico de garimpo e faixas salvas no *crate* são persistidos em `localStorage`, permitindo continuar a sessão a qualquer momento sem perder o progresso.

---

## 4. Arquitetura Técnica & Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                              App.tsx                                   │
│  State: activeTab, currentSet, crateCollection, playingTrack, audioRef  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│ RekordboxSetView │       │ CrateDiggerView  │        │ CamelotWheelView │
│ · XML/M3U Upload │       │ · Filtros Vibe   │        │ · Matriz interat.│
│ · Timeline Set   │       │ · Busca por Selo │        │ · Tabela tons    │
│ · Bridge Builder │       │ · Gerador Gemini │        │ · Regras transiç.│
│ · Subgenre DNA   │       │ · Subgenre DNA   │        │                  │
│ · Export M3U/TXT │       │ · Grid de Faixas │        │                  │
└────────┬─────────┘       └────────┬─────────┘        └──────────────────┘
         │                          │
         └──────────────────────────┴───────────────┐
                                                    ▼
                                   ┌──────────────────────────────────┐
                                   │      AudioPlayerBar & Modal      │
                                   │ · HTML5 Audio com play/pause/seek│
                                   │ · Links Beatport, Spotify, Bcamp │
                                   │ · Botão "Add to Set" / "Save"    │
                                   └──────────────────────────────────┘
```

### Arquivos Chave & Módulos:
1. `src/types/dj.ts`: Definições de dados para faixas (`DJTrack`), incluindo `genre`, `subgenre`, `subgenreReason`, tonalidade Camelot, análise de transição harmônica, metadados Rekordbox e parâmetros de eventos.
2. `src/services/rekordboxParser.ts`: Analisador de arquivos `.xml` de exportação do Rekordbox e arquivos `.m3u`, com conversor automático de tonalidades para notação Camelot (ex.: 1A a 12B) e inferência de subgênero preliminar.
3. `src/services/camelotEngine.ts`: Algoritmo matemático da Camelot Wheel para calcular compatibilidade (Score 0-100%, tipo de transição: Perfeita, Energia, Mudança de Modo, Choque).
4. `src/services/curationService.ts`: Serviço de garimpo e complementação de sets via Gemini 3.8 Flash, fornecendo sempre o gênero, subgênero e a justificativa sonora detalhada de cada recomendação.
5. `src/services/audioPreviewService.ts`: Motor de preview que consulta trechos de áudio e gera links diretos para Beatport, Spotify e Bandcamp.
6. `src/components/RekordboxSetView.tsx`: Painel de upload, diagnóstico de gaps, gráfico de energia, visualizador de subgênero & DNA sonoro e inserção de faixas complementares.
7. `src/components/CrateDiggerView.tsx`: Espaço de garimpo com busca personalizada por selo independente, raridade, BPM e cartões com justificativa de subgênero.
8. `src/components/CamelotWheelModal.tsx`: Visualizador harmônico interativo de apoio à mixagem.
9. `src/components/AudioPlayerBar.tsx`: Barra de áudio fixa com controles, tempo e atalhos rápidos de streaming.
