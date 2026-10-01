import React, { useState } from 'react';
import {
  Compass,
  Sliders,
  Filter,
  Sparkles,
  Disc3,
  Loader2,
  Tag,
  Radio,
  Music2,
  Check,
} from 'lucide-react';
import { CurationFilter, DJTrack, EventVibe } from '../types/dj';
import { digUndergroundCrate } from '../services/curationService';
import { TrackCard } from './TrackCard';

interface CrateDiggerViewProps {
  onAddToSet: (track: DJTrack) => void;
  onSaveToCrate: (track: DJTrack) => void;
  savedCrateIds: Set<string>;
  onPlayTrack: (track: DJTrack) => void;
  playingTrackId?: string;
}

const BOUTIQUE_LABELS = [
  'Innervisions',
  'Correspondant',
  'Disco Halal',
  'Permanent Vacation',
  'Toy Tonics',
  'Life and Death',
  'TAU',
  'Siamese',
  'Keinemusik',
  'Maeve',
  'Diynamic',
  'Eskimo Recordings',
  'Border Community',
  'Running Back',
  'Phantasy Sound',
  'Multinotes',
];

export const CrateDiggerView: React.FC<CrateDiggerViewProps> = ({
  onAddToSet,
  onSaveToCrate,
  savedCrateIds,
  onPlayTrack,
  playingTrackId,
}) => {
  const [filter, setFilter] = useState<CurationFilter>({
    macroGenre: 'all',
    subgenreFocus: '',
    targetBpm: 123,
    bpmTolerance: 2,
    targetCamelotKey: '',
    targetEnergy: 7,
    selectedLabels: ['Innervisions', 'Correspondant', 'Permanent Vacation'],
    onlyUnderground: true,
    eventVibe: 'club_prime_time',
    customPrompt: '',
  });

  const [tracks, setTracks] = useState<DJTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Manipulador de alternância de gravadoras
  const toggleLabel = (label: string) => {
    setFilter((prev) => {
      const exists = prev.selectedLabels.includes(label);
      return {
        ...prev,
        selectedLabels: exists
          ? prev.selectedLabels.filter((l) => l !== label)
          : [...prev.selectedLabels, label],
      };
    });
  };

  // Disparar Garimpo no Catálogo Underground
  const handleDig = async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await digUndergroundCrate(filter);
      setTracks(results);
    } catch (error) {
      console.error('Falha no garimpo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Crate Digger */}
      <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-400" />
              <span>Underground Crate Digger — Curadoria Especializada</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Garimpo de faixas raras e exclusivas em House, Melodic Techno e Indie Dance com filtro rigoroso contra hits comerciais e saturados.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 text-xs font-mono font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Anti-Mainstream Curation Active
            </span>
          </div>
        </div>

        {/* Controles de Filtros Avançados */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#182030]">
          {/* Coluna 1: Vertente Macro & Subgênero */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Gênero Macro:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'Todos' },
                  { id: 'Melodic Techno', label: 'Melodic Techno' },
                  { id: 'Indie Dance', label: 'Indie Dance / Dark Disco' },
                  { id: 'House', label: 'House / Minimal' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFilter((prev) => ({ ...prev, macroGenre: g.id as CurationFilter['macroGenre'] }))}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      filter.macroGenre === g.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-[#141924] border border-[#222b3e] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subgênero / Timbre Específico:
              </label>
              <input
                type="text"
                placeholder="Ex: Dark Italo Arpeggiated, Hypnotic Deep, Modular"
                value={filter.subgenreFocus}
                onChange={(e) => setFilter((prev) => ({ ...prev, subgenreFocus: e.target.value }))}
                className="w-full rounded border border-[#26324a] bg-[#121622] px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Coluna 2: BPM, Camelot e Energia */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                BPM Alvo: <span className="font-mono text-amber-400">{filter.targetBpm} BPM</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">±{filter.bpmTolerance} BPM</span>
            </div>
            <input
              type="range"
              min={116}
              max={130}
              step={1}
              value={filter.targetBpm}
              onChange={(e) => setFilter((prev) => ({ ...prev, targetBpm: parseInt(e.target.value, 10) }))}
              className="w-full cursor-pointer appearance-none rounded bg-[#1e273a] accent-amber-500 h-1.5"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tom Camelot:
                </label>
                <select
                  value={filter.targetCamelotKey}
                  onChange={(e) => setFilter((prev) => ({ ...prev, targetCamelotKey: e.target.value }))}
                  className="w-full rounded border border-[#26324a] bg-[#121622] px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="">Qualquer Tom</option>
                  {[...Array(12)].map((_, i) => (
                    <React.Fragment key={i}>
                      <option value={`${i + 1}A`}>{`${i + 1}A (Menor)`}</option>
                      <option value={`${i + 1}B`}>{`${i + 1}B (Maior)`}</option>
                    </React.Fragment>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Energia: <span className="font-mono text-amber-400">{filter.targetEnergy}/10</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={filter.targetEnergy}
                  onChange={(e) => setFilter((prev) => ({ ...prev, targetEnergy: parseInt(e.target.value, 10) }))}
                  className="w-full cursor-pointer appearance-none rounded bg-[#1e273a] accent-amber-500 h-1.5 mt-2.5"
                />
              </div>
            </div>
          </div>

          {/* Coluna 3: Prompt Personalizado & Vibe */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Vibe da Apresentação:
              </label>
              <select
                value={filter.eventVibe}
                onChange={(e) => setFilter((prev) => ({ ...prev, eventVibe: e.target.value as EventVibe }))}
                className="w-full rounded border border-[#26324a] bg-[#121622] px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="club_prime_time">Club Prime Time</option>
                <option value="sunset_warmup">Sunset Session / Warm-up</option>
                <option value="hypnotic_journey">Hypnotic Journey (Transe)</option>
                <option value="peak_time_banger">Peak-Time Bangers</option>
                <option value="afterhours_deep">Afterhours Deep</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Diretriz Livre do DJ (Opcional):
              </label>
              <input
                type="text"
                placeholder="Ex: baixos sintetizados arpejados sombrios e bateria crua"
                value={filter.customPrompt}
                onChange={(e) => setFilter((prev) => ({ ...prev, customPrompt: e.target.value }))}
                className="w-full rounded border border-[#26324a] bg-[#121622] px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Selos Independentes Selecionáveis */}
        <div className="mt-4 pt-3 border-t border-[#182030]">
          <span className="block text-xs font-semibold text-slate-300 mb-2">
            Gravadoras Independentes Boutique (Filtro Exclusivo):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {BOUTIQUE_LABELS.map((label) => {
              const isSelected = filter.selectedLabels.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => toggleLabel(label)}
                  className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300'
                      : 'bg-[#141924] border border-[#222b3e] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-amber-400" />}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Garimpar */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={handleDig}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Garimpando Catálogos Independentes...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Garimpar Crate Underground</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Resultados do Garimpo */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Faixas Encontradas {tracks.length > 0 && `(${tracks.length})`}
          </h3>
          {tracks.length > 0 && (
            <span className="text-xs text-slate-500 font-mono">
              Com análise completa de subgênero e DNA sonoro
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">
              Consultando catálogos de vinil e gravadoras independentes...
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Filtrando faixas saturadas e gerando justificativa sonora técnica para cada recomendação.
            </p>
          </div>
        ) : tracks.length > 0 ? (
          <div className="space-y-2.5">
            {tracks.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                index={i}
                isPlaying={playingTrackId === track.id}
                onPlayToggle={onPlayTrack}
                onAddToSet={onAddToSet}
                onSaveToCrate={onSaveToCrate}
                isSavedInCrate={savedCrateIds.has(track.id)}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-8 text-center text-xs text-slate-400">
            Nenhuma faixa encontrada com os filtros exatos. Experimente aumentar a tolerância de BPM ou selecionar mais gravadoras.
          </div>
        ) : (
          <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-12 text-center">
            <Disc3 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">
              Pronto para garimpar
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Ajuste as preferências de vertente, BPM e gravadoras acima e clique em "Garimpar Crate Underground" para trazer tracks exclusivas com DNA sonoro detalhado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
