# Subterráneo — Plano Mestre de Implementação (Diretrizes Manus)

Este plano operacionaliza a **Instrução Mestre para o Studio IA — Subterráneo DJ Crate Digging**, garantindo que a aplicação seja uma ferramenta de máxima precisão técnica para DJs, tratando com autenticidade a música eletrônica de pista e a música brasileira / acústica / MPB, com filtros determinísticos no backend e validação estrita no Deezer.

---

### Decisões e Diretrizes Centrais

> [!IMPORTANT]
> 1. **Fluxo Deezer ID**: A busca por faixa de referência envia o `deezerId` oficial para `/api/deezer-track/:id` e `/api/seed-discovery`, eliminando ambiguidades de texto livre.
> 2. **Classificação Fidedigna de Gênero & Assinatura Sonora**:
>    - Categorias formais: `organic_brazilian`, `acoustic_mpb`, `indie_folk`, `bossa_soul`, `electronic_club`, `melodic_techno`, `progressive_house`, `house`, `minimal_deep_tech`, `electro_house`, `indie_dance`, `unknown`.
>    - Para MPB/Acústica (*Mari Froes, Liniker, Luedji Luna, etc.*): descreve somente instrumentos reais (violão de nylon/aço, pandeiro, ganzá, congas, voz, baixo elétrico/acústico). **Proibição absoluta de inventar Moog, 4x4 ou techno**.
>    - Fontes explícitas: `bpmSource` e `keySource` (`'deezer' | 'external' | 'estimated' | 'unknown'`).
> 3. **Tipos de Recomendação**:
>    - `faixa_afim`: mesma linhagem estilística/gênero.
>    - `ponte_organica`: faixa com percussão orgânica e clima acústico afim.
>    - `ponte_para_pista`: transição harmônica suave para set eletrônico (Organic House, Downtempo, Indie Dance percussivo).
> 4. **Filtros Determinísticos no Backend**:
>    - **BPM Rígido**: `Math.abs(recommendedBpm - referenceBpm) <= 3`. Se estimado/desconhecido, badge explicativo na interface.
>    - **Camelot Determinístico**: apenas `N A/B`, `(N-1) A/B`, `(N+1) A/B` com wrap-around (1 <-> 12) e relativo `N A <-> N B`. Backend filtra determinísticamente, sem delegar a regra à IA.
> 5. **Auditoria Deezer Obrigatória**: Toda faixa recomendada deve possuir ID, link e capa confirmados pela API do Deezer. Recomendações sem validação são descartadas.

---

## 1. Atualização dos Tipos TypeScript (`src/types/dj.ts`)

- Adicionar tipos e uniões solicitados:
  ```ts
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
  ```
- Expandir `SeedDiscoveryResult.seedAnalysis` com:
  `classification`, `classificationLabel`, `confidence`, `instruments`, `sonicSignature`, `bpmSource`, `keySource`, `compatibleKeys`, `targetBpmRange`.
- Expandir `DJTrack` com:
  `recommendationKind`, `bpmDelta`, `bpmVerified`, `harmonicCompatibility`, `compatibilityReason`.

---

## 2. Ajustes e Regras Determinísticas no Backend (`server.ts`)

### A. Rota `GET /api/deezer-track/:id`
- Retornar objeto padronizado:
  `{ id, title, artist, album, bpm, duration, releaseDate, cover, coverBig, preview, link }`.
- Indicar se BPM veio do Deezer (`bpmSource: 'deezer'`) ou se é estimado/desconhecido.

### B. Funções Determinísticas de Camelot e BPM
- `getCompatibleCamelotKeys(key: string): string[]`:
  Gera a lista exata com wrap-around (1 anterior = 12, 12 seguinte = 1) e relativo (A/B).
- `areCamelotCompatible(keyA: string, keyB: string): boolean`:
  Validação booleana pura no backend.
- `isBpmCompatible(refBpm: number, targetBpm: number): { compatible: boolean; delta: number }`:
  Aplica `Math.abs(delta) <= 3`.

### C. Endpoint `/api/seed-discovery`
- Receber `{ seedInput, deezerId }`.
- Se `deezerId` for fornecido, consulta dados reais do Deezer antes de formular o prompt ou classificar.
- Classificar nas categorias de `ReferenceClassification` com detecção de instrumentos e assinatura sonora real.
- Executar curadoria e aplicar a **trava de validação e filtros determinísticos de BPM e Camelot** no backend.
- Descartar faixas sem Deezer confirmado.
- Se houver menos de 5 faixas, buscar por artistas compatíveis confirmados e aplicar novamente os filtros.

---

## 3. Ajustes no Frontend (`CrateDiggerView.tsx` & `TrackCard.tsx`)

### A. Seleção por Deezer ID no Autocomplete
- Ao clicar em um resultado do menu suspenso do Deezer, passar o `deezerId` diretamente para a requisição de descoberta.

### B. Card de Análise da Referência (DNA)
- Exibir badge com a classificação real (`classificationLabel`) e nível de confiança (`confidence`).
- Exibir fonte do BPM e Tom (`deezer`, `external`, `estimated`).
- Exibir intervalo alvo: `Intervalo alvo: [BPM - 3]–[BPM + 3] BPM`.
- Exibir tons compatíveis determinísticos (`8A · 7A · 9A · 8B`).
- Exibir lista de instrumentos detectados e assinatura sonora.
- Exibir aviso explícito quando metadados forem estimados.

### C. Lista de Faixas Recomendadas
- Badges claros para `faixa_afim`, `ponte_organica` e `ponte_para_pista`.
- Exibir BPM e `bpmDelta` (ex: `112 BPM (+2)`).
- Exibir indicador `Compatibilidade confirmada` ou `BPM estimado`.
- Capa e link direto para o Deezer em todas as faixas.

---

## 4. Roteiro de Testes e Validação (Testes A a E)

1. **Teste A — Música Brasileira / Acústica**:
   - Testar com *"Mari Froes — Figa de Guiné"*.
   - Verificar classificação como `acoustic_mpb` / `organic_brazilian`.
   - Validar instrumentos acústicos reais (violão, ganzá, percussão) sem Moog ou techno.
   - Validar recomendações com badges de `faixa_afim` e `ponte_organica`.
2. **Teste B — Música Eletrônica**:
   - Testar com *"Stephan Bodzin — Boavista"*.
   - Verificar classificação como `melodic_techno` / `electronic_club`.
   - Validar BPM ±3 e Camelot compatível.
3. **Teste C — Camelot Determinístico**:
   - Testar unitariamente: 8A -> 8A, 7A, 9A, 8B (permitidos); 8A -> 10A, 3B (proibidos).
4. **Teste D — BPM Determinístico**:
   - Testar: 124 -> 121 (permitido), 124 -> 127 (permitido), 124 -> 128 (proibido), 124 -> 120 (proibido).
5. **Teste E — Regressão da Aplicação**:
   - `npm run lint` e `npm run build` 100% limpos.
   - Verificar integridade do player, Crate e importação/exportação.
