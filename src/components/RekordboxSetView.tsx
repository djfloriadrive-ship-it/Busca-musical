import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Copy,
  Check,
  Sparkles,
  Flame,
  ArrowRight,
  Split,
  PlusCircle,
  FileCode,
  Music,
  AlertCircle,
  Disc3,
  Loader2,
} from 'lucide-react';
import { DJSet, DJTrack, EventVibe, TransitionAnalysis } from '../types/dj';
import { analyzeTransition } from '../services/camelotEngine';
import { DEMO_SETS, parseM3UPlaylist, parseRekordboxXML } from '../services/rekordboxParser';
import { findSetBridgeTrack, suggestNextTracks } from '../services/curationService';
import { TrackCard } from './TrackCard';

interface RekordboxSetViewProps {
  currentSet: DJSet;
  setCurrentSet: React.Dispatch<React.SetStateAction<DJSet>>;
  onPlayTrack: (track: DJTrack) => void;
  playingTrackId?: string;
  onSaveToCrate: (track: DJTrack) => void;
  savedCrateIds: Set<string>;
}

export const RekordboxSetView: React.FC<RekordboxSetViewProps> = ({
  currentSet,
  setCurrentSet,
  onPlayTrack,
  playingTrackId,
  onSaveToCrate,
  savedCrateIds,
}) => {
  const [copied, setCopied] = useState(false);
  const [isBridgingIndex, setIsBridgingIndex] = useState<number | null>(null);
  const [bridgeSuggestions, setBridgeSuggestions] = useState<DJTrack[]>([]);
  const [isGeneratingBridge, setIsGeneratingBridge] = useState(false);
  const [isSuggestingNext, setIsSuggestingNext] = useState(false);
  const [nextSuggestions, setNextSuggestions] = useState<DJTrack[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Manipulador de upload de arquivo Rekordbox (.xml ou .m3u)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        const lowerName = file.name.toLowerCase();
        if (lowerName.endsWith('.xml')) {
          const parsed = parseRekordboxXML(content, file.name);
          setCurrentSet(parsed);
        } else if (lowerName.endsWith('.m3u') || lowerName.endsWith('.m3u8')) {
          const parsed = parseM3UPlaylist(content, file.name);
          setCurrentSet(parsed);
        } else {
          setUploadError('Formato não suportado. Por favor, envie um arquivo .xml ou .m3u exportado do Rekordbox.');
        }
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Falha ao processar o arquivo.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Carregar preset de demonstração
  const loadPreset = (preset: DJSet) => {
    setCurrentSet({
      ...preset,
      id: `set-${Date.now()}`,
      tracks: [...preset.tracks],
    });
    setBridgeSuggestions([]);
    setIsBridgingIndex(null);
    setNextSuggestions([]);
  };

  // Alterar vibe do evento
  const handleVibeChange = (vibe: EventVibe) => {
    setCurrentSet((prev) => ({
      ...prev,
      targetVibe: vibe,
    }));
  };

  // Remover faixa do set
  const handleRemoveTrack = (trackId: string) => {
    setCurrentSet((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
    }));
  };

  // Inserir faixa ponte no índice exato
  const handleInsertBridgeTrack = (track: DJTrack, insertAtIndex: number) => {
    setCurrentSet((prev) => {
      const newTracks = [...prev.tracks];
      newTracks.splice(insertAtIndex + 1, 0, track);
      return {
        ...prev,
        tracks: newTracks,
      };
    });
    setBridgeSuggestions([]);
    setIsBridgingIndex(null);
  };

  // Adicionar faixa ao final do set
  const handleAddTrackToEnd = (track: DJTrack) => {
    setCurrentSet((prev) => ({
      ...prev,
      tracks: [...prev.tracks, track],
    }));
    setNextSuggestions((prev) => prev.filter((t) => t.id !== track.id));
  };

  // Abrir gerador de faixa ponte harmônica entre a faixa index e index+1
  const handleFindBridge = async (index: number) => {
    if (index >= currentSet.tracks.length - 1) return;
    setIsBridgingIndex(index);
    setIsGeneratingBridge(true);
    setBridgeSuggestions([]);

    const fromTrack = currentSet.tracks[index];
    const toTrack = currentSet.tracks[index + 1];

    const results = await findSetBridgeTrack(fromTrack, toTrack, currentSet.targetVibe);
    setBridgeSuggestions(results);
    setIsGeneratingBridge(false);
  };

  // Sugerir próximas faixas para continuar o set
  const handleSuggestNext = async () => {
    if (currentSet.tracks.length === 0) return;
    setIsSuggestingNext(true);
    const lastTrack = currentSet.tracks[currentSet.tracks.length - 1];
    const results = await suggestNextTracks(lastTrack, currentSet.targetVibe, 4);
    setNextSuggestions(results);
    setIsSuggestingNext(false);
  };

  // Exportar para arquivo M3U
  const handleExportM3U = () => {
    if (currentSet.tracks.length === 0) return;

    let m3uContent = '#EXTM3U\n';
    m3uContent += `#PLAYLIST:${currentSet.name}\n\n`;

    currentSet.tracks.forEach((track, i) => {
      const durSec = 360;
      m3uContent += `#EXTINF:${durSec},${track.artist} - ${track.title} [Key: ${track.camelotKey} | ${track.bpm} BPM | ${track.subgenre}]\n`;
      m3uContent += `${track.artist} - ${track.title}.mp3\n\n`;
    });

    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSet.name.toLowerCase().replace(/\s+/g, '_')}_complemented.m3u`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copiar tracklist com anotações de mixagem
  const handleCopyTracklist = () => {
    if (currentSet.tracks.length === 0) return;

    let text = `=== SUBTERRÁNEO DJ SET: ${currentSet.name} ===\n`;
    text += `Vibe: ${currentSet.targetVibe.replace(/_/g, ' ').toUpperCase()} | Total Faixas: ${currentSet.tracks.length}\n\n`;

    currentSet.tracks.forEach((track, i) => {
      text += `${String(i + 1).padStart(2, '0')}. ${track.artist} - ${track.title}\n`;
      text += `    [${track.camelotKey} (${track.musicalKey}) · ${track.bpm} BPM · Energy: ${track.energyLevel}/10]\n`;
      text += `    Subgênero: ${track.genre} / ${track.subgenre}\n`;
      text += `    DNA Sonoro: ${track.subgenreReason}\n`;
      text += `    Gravadora: ${track.label}\n\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Métricas do Set
  const trackCount = currentSet.tracks.length;
  const avgBpm =
    trackCount > 0
      ? (currentSet.tracks.reduce((acc, t) => acc + t.bpm, 0) / trackCount).toFixed(1)
      : '0.0';
  const minBpm = trackCount > 0 ? Math.min(...currentSet.tracks.map((t) => t.bpm)).toFixed(1) : '0';
  const maxBpm = trackCount > 0 ? Math.max(...currentSet.tracks.map((t) => t.bpm)).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Bloco de Upload & Seleção de Presets */}
      <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FileCode className="h-5 w-5 text-amber-400" />
              <span>Rekordbox Set Architect & Complementador</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Envie sua lista de reprodução exportada do Rekordbox (<code className="text-amber-400">.xml</code> ou <code className="text-amber-400">.m3u</code>) para mapear a progressão harmônica Camelot, curvas de energia e preencher lacunas de repertório.
            </p>
          </div>

          {/* Botões de Ação de Upload */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.m3u,.m3u8"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Importar Arquivo (.xml / .m3u)</span>
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 flex items-center gap-2 rounded bg-red-950/40 border border-red-800/50 p-2.5 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Presets Rápidos de Demonstração */}
        <div className="mt-4 pt-3 border-t border-[#182030] flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-mono text-[11px] text-slate-500 uppercase">Testar com Presets de Set:</span>
          {DEMO_SETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className="rounded bg-[#141924] border border-[#222b3e] px-2.5 py-1 text-xs text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resumo do Set Atual & Seleção de Vibe do Evento */}
      <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#182030]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">{currentSet.name}</h3>
              <span className="font-mono text-xs rounded bg-[#171e2c] border border-[#27344c] px-2 py-0.5 text-amber-400">
                {currentSet.tracks.length} Faixas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{currentSet.description}</p>
          </div>

          {/* Vibe do Evento */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-400">Vibe do Evento:</span>
            <select
              value={currentSet.targetVibe}
              onChange={(e) => handleVibeChange(e.target.value as EventVibe)}
              className="rounded border border-[#26324a] bg-[#121622] px-3 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
            >
              <option value="club_prime_time">Club Prime Time (Clímax Intenso)</option>
              <option value="sunset_warmup">Sunset Warm-up (Evolução Suave)</option>
              <option value="hypnotic_journey">Hypnotic Journey (Transe Contínuo)</option>
              <option value="peak_time_banger">Peak-Time Bangers (Pista Fervendo)</option>
              <option value="afterhours_deep">Afterhours Deep (Atmosférico & Íntimo)</option>
            </select>

            {/* Ações de Exportação */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={handleExportM3U}
                className="flex items-center gap-1.5 rounded border border-[#26324a] bg-[#141924] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1a2130] transition-colors cursor-pointer"
                title="Baixar playlist .M3U pronta para o Rekordbox"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>Exportar M3U</span>
              </button>

              <button
                onClick={handleCopyTracklist}
                className="flex items-center gap-1.5 rounded border border-[#26324a] bg-[#141924] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1a2130] transition-colors cursor-pointer"
                title="Copiar lista de faixas com DNA sonoro e Camelot"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Lista'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Rápidas de Diagnóstico */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="rounded-lg bg-[#111520] border border-[#1d2536] p-3">
            <span className="text-slate-500 font-mono text-[10px] uppercase block">BPM Médio</span>
            <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">{avgBpm} BPM</span>
            <span className="text-[11px] text-slate-400">Variação: {minBpm} a {maxBpm}</span>
          </div>

          <div className="rounded-lg bg-[#111520] border border-[#1d2536] p-3">
            <span className="text-slate-500 font-mono text-[10px] uppercase block">Duração Estimada</span>
            <span className="text-base font-bold font-mono text-slate-100 mt-0.5 block">
              ~{Math.round((trackCount * 6.5))} min
            </span>
            <span className="text-[11px] text-slate-400">~6.5 min por faixa</span>
          </div>

          <div className="rounded-lg bg-[#111520] border border-[#1d2536] p-3">
            <span className="text-slate-500 font-mono text-[10px] uppercase block">Tons Camelot Chave</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.from(new Set(currentSet.tracks.map((t) => t.camelotKey))).slice(0, 4).map((k) => (
                <span key={k} className="font-mono font-bold text-cyan-300 text-xs bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.2 rounded">
                  {k}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[#111520] border border-[#1d2536] p-3">
            <span className="text-slate-500 font-mono text-[10px] uppercase block">Fluxo de Energia</span>
            <div className="flex items-center gap-1.5 mt-1 text-amber-400 font-semibold">
              <Flame className="h-4 w-4" />
              <span>
                {trackCount > 1
                  ? currentSet.tracks[trackCount - 1].energyLevel >= currentSet.tracks[0].energyLevel
                    ? 'Progressão Crescente'
                    : 'Modulação Ondular'
                  : 'Aguardando Faixas'}
              </span>
            </div>
          </div>
        </div>

        {/* Gráfico Visual da Curva de Energia (SVG Interativo) */}
        {trackCount > 1 && (
          <div className="mt-5 rounded-lg bg-[#090b11] border border-[#182030] p-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[11px] uppercase text-slate-500">Curva de Energia do Set (1 a 10)</span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Energia Real
                </span>
              </div>
            </div>

            <div className="relative h-20 w-full">
              <svg className="h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${trackCount - 1} 10`}>
                {/* Linha da curva de energia */}
                <path
                  d={currentSet.tracks
                    .map((t, idx) => `${idx === 0 ? 'M' : 'L'} ${idx} ${10 - t.energyLevel}`)
                    .join(' ')}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Pontos nas faixas */}
                {currentSet.tracks.map((t, idx) => (
                  <circle
                    key={t.id}
                    cx={idx}
                    cy={10 - t.energyLevel}
                    r="0.4"
                    className="fill-amber-400 hover:fill-white cursor-pointer transition-colors"
                  >
                    <title>{`${idx + 1}. ${t.title} - Energia ${t.energyLevel}/10 (${t.camelotKey})`}</title>
                  </circle>
                ))}
              </svg>
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2">
              <span>Faixa 01: {currentSet.tracks[0]?.camelotKey}</span>
              <span>Faixa {trackCount}: {currentSet.tracks[trackCount - 1]?.camelotKey}</span>
            </div>
          </div>
        )}
      </div>

      {/* Lista Sequencial de Faixas e Diagnóstico entre cada Par */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Sequência do Set & Diagnóstico de Transição
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {trackCount} faixas mapeadas
          </span>
        </div>

        {currentSet.tracks.map((track, index) => {
          const nextTrack = currentSet.tracks[index + 1];
          const transition = nextTrack ? analyzeTransition(track, nextTrack) : null;
          const isBridgingThis = isBridgingIndex === index;

          return (
            <div key={track.id} className="space-y-2">
              {/* Card da Faixa */}
              <TrackCard
                track={track}
                index={index}
                isPlaying={playingTrackId === track.id}
                onPlayToggle={onPlayTrack}
                onSaveToCrate={onSaveToCrate}
                isSavedInCrate={savedCrateIds.has(track.id)}
                onRemoveFromSet={handleRemoveTrack}
                showBridgeAction={Boolean(nextTrack)}
                onFindBridge={() => handleFindBridge(index)}
              />

              {/* Indicador de Transição entre Faixa index e Faixa index + 1 */}
              {transition && (
                <div className="relative my-2 rounded-lg border border-[#192233] bg-[#090c14] p-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    {/* Status da Transição Harmônica */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: transition.harmonicColor }}
                      />
                      <span className="font-semibold text-slate-200">
                        {transition.headline}
                      </span>
                      <span className="font-mono text-slate-400">
                        ({transition.compatibilityScore}% harmônico)
                      </span>
                    </div>

                    {/* Detalhes de BPM e Energia */}
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                      <span>
                        BPM: {transition.bpmDelta >= 0 ? `+${transition.bpmDelta}` : transition.bpmDelta} ({transition.bpmPercentDelta}%)
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Energia: {transition.energyDelta >= 0 ? `+${transition.energyDelta}` : transition.energyDelta}
                      </span>

                      {/* Botão de Buscar Faixa Ponte */}
                      <button
                        onClick={() => handleFindBridge(index)}
                        className="ml-auto sm:ml-2 flex items-center gap-1 rounded bg-[#161c28] border border-cyan-800/50 px-2 py-1 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-950/60 transition-colors cursor-pointer"
                        title="Encontrar faixa ponte harmônica para intermediar este salto"
                      >
                        <Split className="h-3 w-3" />
                        <span>Preencher com Faixa Ponte</span>
                      </button>
                    </div>
                  </div>

                  {/* Orientação Técnica de Mixagem */}
                  <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                    {transition.technicalAdvice}
                  </p>

                  {/* Drawer de Sugestões de Faixa Ponte */}
                  {isBridgingThis && (
                    <div className="mt-3 rounded border border-cyan-800/40 bg-[#08101a] p-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#142338]">
                        <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-xs">
                          <Sparkles className="h-4 w-4" />
                          <span>Faixas Pontes Sugeridas (Harmonia & Conexão de Estilo)</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsBridgingIndex(null);
                            setBridgeSuggestions([]);
                          }}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          Fechar
                        </button>
                      </div>

                      {isGeneratingBridge ? (
                        <div className="flex items-center justify-center py-6 gap-2 text-cyan-400 text-xs">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Garimpando faixas pontes underground com tom e BPM ideais...</span>
                        </div>
                      ) : (
                        <div className="mt-3 space-y-2">
                          {bridgeSuggestions.map((bridgeTrack) => (
                            <div
                              key={bridgeTrack.id}
                              className="rounded border border-[#1b2b40] bg-[#0c1624] p-2.5 flex flex-col gap-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold text-slate-100 text-xs">
                                      {bridgeTrack.artist} - {bridgeTrack.title}
                                    </h5>
                                    <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/70 border border-cyan-800/50 px-1 rounded">
                                      {bridgeTrack.camelotKey}
                                    </span>
                                    <span className="font-mono text-[10px] text-slate-400">
                                      {bridgeTrack.bpm} BPM
                                    </span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 block mt-0.5">
                                    {bridgeTrack.label} · <strong className="text-amber-300/80">{bridgeTrack.subgenre}</strong>
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleInsertBridgeTrack(bridgeTrack, index)}
                                  className="flex items-center gap-1 rounded bg-cyan-500 px-2.5 py-1 text-[11px] font-bold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0 cursor-pointer"
                                >
                                  <PlusCircle className="h-3 w-3" />
                                  <span>Inserir Entre as Faixas</span>
                                </button>
                              </div>

                              <div className="text-[11px] text-slate-300 bg-[#070e17] p-2 rounded border border-[#172538]">
                                <span className="font-semibold text-cyan-400">DNA de Subgênero:</span> {bridgeTrack.subgenreReason}
                                {bridgeTrack.transitionNotes && (
                                  <span className="block mt-1 text-slate-400">
                                    <strong className="text-slate-300">Como mixar:</strong> {bridgeTrack.transitionNotes}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sugestões de Próximas Faixas para dar Continuidade ao Set */}
      <div className="mt-8 rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Expandir o Set — Próximas Faixas Recomendadas</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Descubra faixas exclusivas para dar continuidade à última música com base na vibe selecionada e no fluxo harmônico.
            </p>
          </div>

          <button
            onClick={handleSuggestNext}
            disabled={isSuggestingNext}
            className="flex items-center gap-2 rounded-lg bg-[#161c28] border border-[#2b374e] px-3.5 py-2 text-xs font-semibold text-amber-300 hover:bg-[#20293b] hover:border-amber-500/40 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isSuggestingNext ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Buscando no Catálogo Underground...</span>
              </>
            ) : (
              <>
                <Disc3 className="h-3.5 w-3.5 text-amber-400" />
                <span>Sugerir Próximas Faixas</span>
              </>
            )}
          </button>
        </div>

        {nextSuggestions.length > 0 && (
          <div className="mt-4 space-y-2.5">
            {nextSuggestions.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                showIndex={false}
                isPlaying={playingTrackId === track.id}
                onPlayToggle={onPlayTrack}
                onAddToSet={handleAddTrackToEnd}
                onSaveToCrate={onSaveToCrate}
                isSavedInCrate={savedCrateIds.has(track.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
