import React, { useState } from 'react';
import {
  Play,
  Pause,
  ExternalLink,
  Plus,
  Bookmark,
  BookmarkCheck,
  Split,
  Trash2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DJTrack } from '../types/dj';

interface TrackCardProps {
  track: DJTrack;
  index?: number;
  isPlaying?: boolean;
  onPlayToggle?: (track: DJTrack) => void;
  onAddToSet?: (track: DJTrack) => void;
  onSaveToCrate?: (track: DJTrack) => void;
  isSavedInCrate?: boolean;
  onFindBridge?: (track: DJTrack) => void;
  onRemoveFromSet?: (trackId: string) => void;
  showIndex?: boolean;
  showBridgeAction?: boolean;
  compact?: boolean;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  index,
  isPlaying,
  onPlayToggle,
  onAddToSet,
  onSaveToCrate,
  isSavedInCrate,
  onFindBridge,
  onRemoveFromSet,
  showIndex = true,
  showBridgeAction = false,
  compact = false,
}) => {
  const [showDnaDetails, setShowDnaDetails] = useState(false);

  // Cor do tom Camelot baseada na letra (A = azul/verde/roxo para menores, B = âmbar/dourado para maiores)
  const isMinor = track.camelotKey.endsWith('A');
  const camelotBg = isMinor ? 'bg-cyan-950/60 border-cyan-800/60 text-cyan-300' : 'bg-amber-950/60 border-amber-800/60 text-amber-300';

  return (
    <div className="group relative rounded-lg border border-[#1b2233] bg-[#0e121b] p-3.5 sm:p-4 hover:border-[#2b354c] transition-all">
      {/* Linha Principal da Faixa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lado Esquerdo: Play + Dados da Faixa */}
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          {/* Índice / Posição */}
          {showIndex && typeof index === 'number' && (
            <span className="w-5 text-center font-mono text-xs text-slate-500 shrink-0">
              {String(index + 1).padStart(2, '0')}
            </span>
          )}

          {/* Capa do Álbum oficial do Deezer ou Botão Play com fallback */}
          {track.albumCoverUrl ? (
            <div className="relative h-10 w-10 shrink-0 rounded-md overflow-hidden border border-[#232c40] group/cover shadow-sm bg-[#121622]">
              <img
                src={track.albumCoverUrl}
                alt={`${track.artist} - ${track.title}`}
                className="h-full w-full object-cover transition-transform group-hover/cover:scale-105"
                loading="lazy"
              />
              <button
                onClick={() => onPlayToggle && onPlayToggle(track)}
                className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-500/90 text-slate-950 shadow-inner'
                    : 'bg-black/45 text-white opacity-0 group-hover/cover:opacity-100 backdrop-blur-[1px]'
                }`}
                title={isPlaying ? 'Pausar preview' : 'Tocar preview'}
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={() => onPlayToggle && onPlayToggle(track)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-[#151b27] border-[#222b3e] text-slate-300 hover:text-white hover:bg-[#1e2738]'
              }`}
              title={isPlaying ? 'Pausar preview' : 'Tocar preview de 30s'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>
          )}

          {/* Detalhes de Nome, Artista e Gravadora */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                {track.title}
              </h4>
              {track.recommendationKind === 'ponte_organica' || track.isOrganicBridge ? (
                <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded shrink-0 font-medium">
                  Ponte Orgânica
                </span>
              ) : track.recommendationKind === 'ponte_para_pista' ? (
                <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0 font-medium">
                  Ponte para Pista
                </span>
              ) : track.recommendationKind === 'faixa_afim' ? (
                <span className="font-mono text-[10px] text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.5 rounded shrink-0 font-medium">
                  Faixa Afim
                </span>
              ) : track.isExtendedMix ? (
                <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0 font-medium">
                  Extended Mix
                </span>
              ) : (
                <span className="font-mono text-[10px] text-slate-400 bg-slate-800/40 border border-slate-700/40 px-1.5 py-0.5 rounded shrink-0">
                  Original Mix
                </span>
              )}
            </div>

            {/* Metadados sem cápsulas artificiais (Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <span className="font-medium text-slate-300">{track.artist}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{track.label}</span>
              {track.duration && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-slate-500">{track.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Parâmetros DJ (Key, BPM, Energia) e Ações */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* Tom Camelot */}
          <div
            className={`flex items-center gap-1 rounded border px-2 py-1 font-mono text-xs font-bold ${camelotBg}`}
            title={`Tom Musical: ${track.musicalKey}`}
          >
            <span>{track.camelotKey}</span>
            <span className="text-[10px] font-normal opacity-80">({track.musicalKey})</span>
          </div>

          {/* BPM com Delta Determinístico */}
          <div className="flex items-center gap-1.5 rounded border border-[#222b3e] bg-[#121622] px-2 py-1 font-mono text-xs text-slate-300">
            <span className="font-semibold text-slate-200">{track.bpm.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">BPM</span>
            {track.bpmDelta !== undefined && (
              <span
                className={`text-[10px] font-mono px-1 rounded ${
                  Math.abs(track.bpmDelta) <= 3
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                }`}
                title={`Variação em relação à referência: ${track.bpmDelta > 0 ? `+${track.bpmDelta}` : track.bpmDelta} BPM`}
              >
                {track.bpmDelta > 0 ? `+${track.bpmDelta}` : track.bpmDelta}
              </span>
            )}
          </div>

          {/* Medidor de Energia VU (1-10) */}
          <div
            className="flex items-center gap-1 rounded border border-[#222b3e] bg-[#121622] px-2 py-1"
            title={`Nível de Energia: ${track.energyLevel}/10`}
          >
            <span className="text-[10px] uppercase font-mono text-slate-500 mr-1">Energy</span>
            <div className="flex items-end gap-0.5 h-3">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-0.5 rounded-xs transition-all ${
                    i < track.energyLevel
                      ? i >= 8
                        ? 'bg-amber-400 h-3'
                        : i >= 5
                        ? 'bg-emerald-400 h-2.5'
                        : 'bg-cyan-400 h-2'
                      : 'bg-slate-800 h-1'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] text-slate-400 ml-1">{track.energyLevel}</span>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center gap-1">
            {onAddToSet && (
              <button
                onClick={() => onAddToSet(track)}
                className="flex items-center gap-1 rounded bg-[#161c28] border border-[#263147] px-2.5 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30 transition-colors cursor-pointer"
                title="Adicionar esta faixa ao seu set do Rekordbox"
              >
                <Plus className="h-3 w-3" />
                <span>Add ao Set</span>
              </button>
            )}

            {onSaveToCrate && (
              <button
                onClick={() => onSaveToCrate(track)}
                className={`p-1.5 rounded border transition-colors cursor-pointer ${
                  isSavedInCrate
                    ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                    : 'border-[#222b3e] text-slate-400 hover:text-slate-200 hover:bg-[#161c28]'
                }`}
                title={isSavedInCrate ? 'Salvo na sua Crate' : 'Salvar na Crate'}
              >
                {isSavedInCrate ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
              </button>
            )}

            {showBridgeAction && onFindBridge && (
              <button
                onClick={() => onFindBridge(track)}
                className="p-1.5 rounded border border-[#222b3e] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                title="Buscar faixa ponte (Bridge Track) harmônica a partir desta"
              >
                <Split className="h-3.5 w-3.5" />
              </button>
            )}

            {onRemoveFromSet && (
              <button
                onClick={() => onRemoveFromSet(track.id)}
                className="p-1.5 rounded border border-[#222b3e] text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer"
                title="Remover do set"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Módulo de Gênero, Subgênero e Justificativa Sonora (DNA) */}
      <div className="mt-2.5 pt-2.5 border-t border-[#161c27] flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Identificação explícita de Gênero e Subgênero */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-200">{track.genre}</span>
            <span className="text-slate-600">/</span>
            <span className="font-medium text-amber-300/90">{track.subgenre}</span>
            {track.isUnderground && (
              <span className="text-[10px] text-emerald-400 font-mono">· [Rare / Underground]</span>
            )}
          </div>

          {/* Toggle de Detalhes do DNA Sonoro */}
          <button
            onClick={() => setShowDnaDetails(!showDnaDetails)}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Por que encaixa no subgênero?</span>
            {showDnaDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Caixa de Justificativa Sonora (Exibe por que se enquadra no subgênero) */}
        {showDnaDetails ? (
          <div className="mt-1 rounded bg-[#090c13] border border-[#1e2638] p-3 text-xs leading-relaxed text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1 text-[11px] uppercase tracking-wider">
              <Info className="h-3.5 w-3.5" />
              <span>DNA Sonoro & Justificativa Técnica de Subgênero:</span>
            </div>
            {track.compatibilityReason && (
              <div className="mt-2 pt-2 border-t border-[#182030] text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span><strong>Compatibilidade Confirmada:</strong> {track.compatibilityReason}</span>
              </div>
            )}
            {track.transitionNotes && (
              <div className="mt-2 pt-2 border-t border-[#182030] text-[11px] text-cyan-300/90">
                <span className="font-semibold">Dica de Mixagem:</span> {track.transitionNotes}
              </div>
            )}
          </div>
        ) : (
          <p className="line-clamp-1 text-xs text-slate-500 font-normal italic">
            "{track.subgenreReason}"
          </p>
        )}
      </div>

      {/* Links Oficiais Diretos para Beatport, Spotify, Bandcamp, Traxsource */}
      {!compact && (
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1.5">
          <span className="font-mono text-[10px] text-slate-600 uppercase">Streaming & Catálogo:</span>
          
          <a
            href={track.beatportSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>Beatport</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          <a
            href={track.spotifySearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <span>Spotify</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          {track.deezerLink ? (
            <a
              href={track.deezerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              title="Abrir no Deezer (versão Extended se disponível)"
            >
              <span>Deezer</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <a
              href={`https://www.deezer.com/search/${encodeURIComponent(track.artist + ' ' + track.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-purple-400 transition-colors"
            >
              <span>Deezer</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}

          <a
            href={track.bandcampSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors"
          >
            <span>Bandcamp</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>

          {track.traxsourceSearchUrl && (
            <a
              href={track.traxsourceSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <span>Traxsource</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
