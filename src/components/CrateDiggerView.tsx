import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  Disc3,
  Loader2,
  Tag,
  Radio,
  Search,
  Users,
  Building2,
  Flame,
  Check,
  Music,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Disc,
  AlertTriangle,
} from 'lucide-react';
import { CurationFilter, DeezerSearchResult, DJTrack, EventVibe, SeedDiscoveryResult } from '../types/dj';
import { digUndergroundCrate, discoverBySeedTrack, searchDeezerCatalog } from '../services/curationService';
import { TrackCard } from './TrackCard';

interface CrateDiggerViewProps {
  onAddToSet: (track: DJTrack) => void;
  onSaveToCrate: (track: DJTrack) => void;
  savedCrateIds: Set<string>;
  onPlayTrack: (track: DJTrack) => void;
  playingTrackId?: string;
}

const BOUTIQUE_LABELS = [
  'Afterlife',
  'Innervisions',
  'Pryda Recordings',
  'Lost & Found',
  'Up The Stuss',
  'Bedrock Records',
  'TAU',
  'Siamese',
  'Diynamic',
  'Upperground',
  'PIV Records',
  'Solid Grooves',
  'Gett Traum',
  'Mau5trap',
  'Odd One Out',
  'Permanent Vacation',
  'Life and Death',
  'Correspondant',
  'Toy Tonics',
  'Running Back',
  'Kompakt',
  'Watergate Records',
  'Sapiens',
  'Herzblut Recordings',
  'Ellum Audio',
  'Stil Vor Talent',
  'Get Physical',
  'Turbo Recordings',
  'Ed Banger Records',
];

export const CrateDiggerView: React.FC<CrateDiggerViewProps> = ({
  onAddToSet,
  onSaveToCrate,
  savedCrateIds,
  onPlayTrack,
  playingTrackId,
}) => {
  const [activeMode, setActiveMode] = useState<'seed' | 'filters'>('seed');

  // Estado do Seed Track Finder
  const [seedInput, setSeedInput] = useState('Stephan Bodzin - Boavista');
  const [seedResult, setSeedResult] = useState<SeedDiscoveryResult | null>(null);
  const [isSearchingSeed, setIsSearchingSeed] = useState(false);

  // Sugestões do Deezer em tempo real (menu suspenso com capas)
  const [deezerSuggestions, setDeezerSuggestions] = useState<DeezerSearchResult[]>([]);
  const [isSearchingDeezer, setIsSearchingDeezer] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Estado do Filtro Geral
  const [filter, setFilter] = useState<CurationFilter>({
    macroGenre: 'all',
    subgenreFocus: '',
    targetBpm: 124,
    bpmTolerance: 2,
    targetCamelotKey: '',
    targetEnergy: 7,
    selectedLabels: ['Afterlife', 'Innervisions', 'Pryda Recordings', 'Lost & Found'],
    customLabelSearch: '',
    onlyUnderground: true,
    eventVibe: 'club_prime_time',
    customPrompt: '',
  });

  const [filterTracks, setFilterTracks] = useState<DJTrack[]>([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);
  const [hasSearchedFilter, setHasSearchedFilter] = useState(false);
  const [selectedDeezerId, setSelectedDeezerId] = useState<string | number | undefined>(undefined);

  // Debounce para busca ao vivo na API do Deezer
  useEffect(() => {
    const trimmed = seedInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setDeezerSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingDeezer(true);
      try {
        const results = await searchDeezerCatalog(trimmed);
        setDeezerSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.warn('Erro na busca Deezer:', err);
      } finally {
        setIsSearchingDeezer(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [seedInput]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar por Música de Referência (Seed Track) com suporte ao ID Deezer
  const handleSearchSeed = async (trackQuery?: string, explicitDeezerId?: string | number) => {
    const query = trackQuery || seedInput;
    if (!query.trim()) return;

    const idToUse = explicitDeezerId !== undefined ? explicitDeezerId : selectedDeezerId;

    setShowDropdown(false);
    setIsSearchingSeed(true);
    try {
      const result = await discoverBySeedTrack(query, idToUse, filter.eventVibe);
      setSeedResult(result);
    } catch (err) {
      console.error('Erro na busca por semente:', err);
    } finally {
      setIsSearchingSeed(false);
    }
  };

  // Garimpar por Filtros
  const handleDigFilters = async () => {
    setIsLoadingFilter(true);
    setHasSearchedFilter(true);
    try {
      const results = await digUndergroundCrate(filter);
      setFilterTracks(results);
    } catch (err) {
      console.error('Erro no garimpo por filtros:', err);
    } finally {
      setIsLoadingFilter(false);
    }
  };

  // Alternar gravadora nas tags rápidas
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

  return (
    <div className="space-y-6">
      {/* Cabeçalho Principal com Seletor de Modo */}
      <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#182030]">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-400" />
              <span>Crate Digger — Curadoria Eletrônica de Alta Fidelidade</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Garimpo de faixas reais auditadas no Deezer (100% integradas para montar playlists). Especializado em House, Melodic Techno, Progressive House, Electro House e Minimal.
            </p>
          </div>

          {/* Abas de Modo */}
          <div className="flex items-center gap-1.5 rounded-lg bg-[#121622] p-1 border border-[#20293b]">
            <button
              onClick={() => setActiveMode('seed')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'seed'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Por Música de Referência (Deezer)</span>
            </button>

            <button
              onClick={() => setActiveMode('filters')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeMode === 'filters'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              <span>Filtros, BPM & Gravadoras</span>
            </button>
          </div>
        </div>

        {/* MODO 1: BUSCA POR MÚSICA DE REFERÊNCIA (SEED TRACK) COM AUTOCOMPLETE DO DEEZER */}
        {activeMode === 'seed' && (
          <div className="mt-4 space-y-4">
            <div ref={searchContainerRef} className="relative">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Digite o nome da música ou artista (busca ao vivo no catálogo do Deezer):
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={seedInput}
                    onChange={(e) => {
                      setSeedInput(e.target.value);
                      setSelectedDeezerId(undefined);
                      setShowDropdown(true);
                    }}
                    onFocus={() => {
                      if (deezerSuggestions.length > 0) setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setShowDropdown(false);
                        handleSearchSeed();
                      }
                    }}
                    placeholder="Ex: Stephan Bodzin, Glowal, Pryda, Mari Froes, Liniker..."
                    className="w-full rounded-lg border border-[#27344d] bg-[#121622] pl-3 pr-8 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <div className="absolute right-2.5 top-3 flex items-center gap-1 text-slate-500 pointer-events-none">
                    {isSearchingDeezer ? (
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleSearchSeed()}
                  disabled={isSearchingSeed}
                  className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isSearchingSeed ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Validando no Deezer...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Descobrir Faixas Semelhantes</span>
                    </>
                  )}
                </button>
              </div>

              {/* Menu Suspenso de Sugestões em Tempo Real com Capas do Deezer */}
              {showDropdown && deezerSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-lg border border-[#232d42] bg-[#0c101a] p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.8)] backdrop-blur-md">
                  <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-purple-400 flex items-center justify-between border-b border-[#1b2336] mb-1">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
                      Resultados Oficiais Deezer
                    </span>
                    <span className="text-slate-500">Clique para selecionar com ID Oficial</span>
                  </div>

                  <div className="space-y-1">
                    {deezerSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const fullName = `${item.artist} - ${item.title}`;
                          setSeedInput(fullName);
                          setSelectedDeezerId(item.id);
                          setShowDropdown(false);
                          handleSearchSeed(fullName, item.id);
                        }}
                        className="w-full flex items-center gap-3 rounded-md p-2 text-left hover:bg-[#161c2b] transition-colors group cursor-pointer"
                      >
                        {/* Capa do Álbum */}
                        <div className="h-10 w-10 shrink-0 rounded overflow-hidden border border-[#232c40] bg-[#141824]">
                          {item.cover ? (
                            <img
                              src={item.cover}
                              alt={item.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-600">
                              <Disc className="h-5 w-5" />
                            </div>
                          )}
                        </div>

                        {/* Metadados da Faixa */}
                        <div className="min-w-0 flex-1">
                          <h5 className="truncate text-xs font-semibold text-slate-100 group-hover:text-purple-300 transition-colors">
                            {item.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 truncate">
                            <span className="font-medium text-slate-300">{item.artist}</span>
                            {item.album && (
                              <>
                                <span aria-hidden="true" className="text-slate-600">·</span>
                                <span className="text-slate-500 truncate">{item.album}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Duração & Badge Deezer */}
                        <div className="text-right shrink-0 font-mono text-[10px] text-slate-400">
                          <div>
                            {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                          </div>
                          <span className="text-purple-400 font-semibold">Deezer</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Presets de Músicas de Referência para Teste Rápido */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span className="font-mono text-[10px] text-slate-500 uppercase mr-1">Exemplos reais verificados:</span>
              {[
                'Stephan Bodzin - Boavista',
                'Glowal - Trigger Your Sense',
                'Mind Against - Colossal',
                'Pryda - Elements',
                'Guy J - Lost & Found',
                'Chris Stussy - Breather',
              ].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setSeedInput(sample);
                    setShowDropdown(false);
                    handleSearchSeed(sample);
                  }}
                  className="rounded bg-[#141924] border border-[#222b3e] px-2 py-0.5 text-[11px] text-slate-300 hover:text-amber-300 hover:border-amber-500/40 transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MODO 2: BUSCA POR FILTROS AVANÇADOS & GRAVADORAS */}
        {activeMode === 'filters' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Gênero Beatport & Subgênero */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gênero Principal:
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'all', label: 'Todos os Gêneros' },
                      { id: 'Melodic Techno', label: 'Melodic House & Techno' },
                      { id: 'Progressive House', label: 'Progressive House' },
                      { id: 'Electro House', label: 'Electro House' },
                      { id: 'House', label: 'House (Deep & Club)' },
                      { id: 'Minimal / Deep Tech', label: 'Minimal / Deep Tech' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setFilter((prev) => ({ ...prev, macroGenre: g.id as any }))}
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subgênero / Timbre Específico:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Modular Melodic, Dark Electro, Hypnotic Progressive..."
                    value={filter.subgenreFocus}
                    onChange={(e) => setFilter((prev) => ({ ...prev, subgenreFocus: e.target.value }))}
                    className="w-full rounded border border-[#26324a] bg-[#121622] px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* BPM, Camelot e Energia */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    BPM Alvo: <span className="font-mono text-amber-400">{filter.targetBpm} BPM</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">±{filter.bpmTolerance} BPM</span>
                </div>
                <input
                  type="range"
                  min={118}
                  max={132}
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
                      className="w-full rounded border border-[#26324a] bg-[#121622] px-2 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
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
                      className="w-full cursor-pointer appearance-none rounded bg-[#1e273a] accent-amber-500 h-1.5 mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Busca Livre de Qualquer Gravadora */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Buscar por Gravadora (Campo Livre):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Afterlife, Lost & Found, Bedrock, Up The Stuss, Pryda..."
                  value={filter.customLabelSearch || ''}
                  onChange={(e) => setFilter((prev) => ({ ...prev, customLabelSearch: e.target.value }))}
                  className="w-full rounded border border-[#26324a] bg-[#121622] px-3 py-1.5 text-xs text-amber-300 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />

                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vibe do Evento:
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
              </div>
            </div>

            {/* Selos Boutique Rápidos */}
            <div className="pt-2">
              <span className="block text-xs font-semibold text-slate-400 mb-1.5">
                Gravadoras Selecionadas (Melodic Techno, Progressive, Electro House, Minimal & House):
              </span>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                {BOUTIQUE_LABELS.map((label) => {
                  const isSelected = filter.selectedLabels.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleLabel(label)}
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
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

            <div className="flex justify-end pt-2">
              <button
                onClick={handleDigFilters}
                disabled={isLoadingFilter}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-md cursor-pointer disabled:opacity-50"
              >
                {isLoadingFilter ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Garimpando...</span>
                  </>
                ) : (
                  <>
                    <Compass className="h-4 w-4" />
                    <span>Garimpar Faixas com Filtros</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ÁREA DE RESULTADOS */}

      {/* 1. SEÇÃO DE RESULTADOS DO SEED TRACK FINDER COM PAINEL LATERAL */}
      {activeMode === 'seed' && seedResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Coluna Principal: Faixas Semelhantes (70%) */}
          <div className="lg:col-span-8 space-y-3">
            {/* Cartão de Análise da Música de Referência com Capa Oficial do Deezer */}
            <div className="rounded-xl border border-purple-500/40 bg-[#0d121c] p-4 text-xs shadow-md">
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1b2538] gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="font-bold text-slate-100 uppercase tracking-wider font-mono">
                    DNA da Faixa de Referência (Deezer Verificado)
                  </span>
                  {seedResult.seedAnalysis.confidence && (
                    <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 px-1.5 py-0.5 rounded font-semibold">
                      {Math.round(seedResult.seedAnalysis.confidence * 100)}% Confiança
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                    {seedResult.seedAnalysis.camelotKey} ({seedResult.seedAnalysis.musicalKey})
                    {seedResult.seedAnalysis.keySource && (
                      <span className="text-[9px] font-normal text-slate-400 ml-1">
                        [{seedResult.seedAnalysis.keySource === 'deezer' ? 'Deezer' : 'Estimado'}]
                      </span>
                    )}
                  </span>
                  <span className="text-slate-400">
                    <strong className="text-slate-200">{seedResult.seedAnalysis.bpm} BPM</strong>{' '}
                    <span className="text-[10px] text-purple-300/80">
                      ({seedResult.seedAnalysis.bpmSource === 'deezer' ? 'Deezer Oficial' : 'Estimado'})
                    </span>
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-4">
                {/* Capa do Álbum da Referência */}
                {seedResult.seedAnalysis.albumCoverUrl && (
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-[#283248] shadow-md bg-[#121622]">
                    <img
                      src={seedResult.seedAnalysis.albumCoverUrl}
                      alt={seedResult.seedAnalysis.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <span>{seedResult.seedAnalysis.artist} — {seedResult.seedAnalysis.title}</span>
                    {seedResult.seedAnalysis.deezerLink && (
                      <a
                        href={seedResult.seedAnalysis.deezerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300"
                        title="Abrir no Deezer"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </h4>

                  <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
                    <span className="text-slate-300 font-semibold">{seedResult.seedAnalysis.genre}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-300/90 font-medium">{seedResult.seedAnalysis.subgenre}</span>
                  </div>

                  {/* Badges de Compatibilidade Rígida (Camelot & Tolerância ±3 BPM) */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {seedResult.seedAnalysis.classificationLabel ? (
                      <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        {seedResult.seedAnalysis.classificationLabel}
                      </span>
                    ) : seedResult.seedAnalysis.isAcousticOrOrganic ? (
                      <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        Música Brasileira / Acústico Orgânico
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
                        Música Eletrônica / Club
                      </span>
                    )}

                    {seedResult.seedAnalysis.targetBpmRange && (
                      <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                        Intervalo Alvo: {seedResult.seedAnalysis.targetBpmRange}
                      </span>
                    )}

                    {seedResult.seedAnalysis.compatibleKeys && seedResult.seedAnalysis.compatibleKeys.length > 0 && (
                      <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded font-medium">
                        Tons Aceitos: {seedResult.seedAnalysis.compatibleKeys.join(' · ')}
                      </span>
                    )}
                  </div>

                  {/* Instrumentos Detectados Fidedignos */}
                  {seedResult.seedAnalysis.instruments && seedResult.seedAnalysis.instruments.length > 0 && (
                    <div className="mt-2.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                        Instrumentação & Elementos Sonoros Reais:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {seedResult.seedAnalysis.instruments.map((inst, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-[#151c2c] border border-[#26324a] px-2 py-0.5 text-[11px] text-slate-200 font-medium"
                          >
                            {inst}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-2.5 text-slate-300 leading-relaxed font-normal bg-[#080b11] p-2.5 rounded border border-[#172030]">
                    <strong className="text-purple-400">Assinatura Sonora:</strong>{' '}
                    {seedResult.seedAnalysis.sonicSignature || seedResult.seedAnalysis.subgenreReason}
                  </p>

                  {/* Alerta de Metadados Estimados */}
                  {(seedResult.seedAnalysis.bpmSource === 'estimated' || seedResult.seedAnalysis.keySource === 'estimated') && (
                    <div className="mt-2.5 rounded-lg border border-amber-500/25 bg-amber-500/10 p-2 text-[11px] text-amber-200/90 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                      <span>
                        <strong>Metadados Estimados:</strong> O BPM ou tonalidade desta faixa foram inferidos com base na gravação oficial autorizada por indisponibilidade de tag direta no Deezer.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de Faixas Semelhantes Verificadas no Deezer */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Faixas Semelhantes no Deezer ({seedResult.tracks.length})
                </h3>
                <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  100% Encontradas no Deezer com Capas
                </span>
              </div>

              {seedResult.tracks.map((track, i) => (
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
          </div>

          {/* Coluna Lateral: Artistas Compatíveis e Gravadoras Recomendadas (30%) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Bloco 1: Artistas Compatíveis */}
            <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-4 text-xs">
              <h3 className="font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#182030]">
                <Users className="h-4 w-4 text-cyan-400" />
                <span>Artistas Compatíveis</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">
                Produtores da mesma vertente e assinatura sonora:
              </p>

              <div className="space-y-1.5">
                {seedResult.similarArtists.map((artist) => (
                  <button
                    key={artist}
                    onClick={() => {
                      setSeedInput(artist);
                      setShowDropdown(false);
                      handleSearchSeed(artist);
                    }}
                    className="w-full flex items-center justify-between rounded bg-[#121622] border border-[#1e273a] px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:text-amber-300 hover:border-amber-500/40 transition-colors group cursor-pointer"
                  >
                    <span>{artist}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            {/* Bloco 2: Gravadoras Recomendadas */}
            <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-4 text-xs">
              <h3 className="font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2 pb-2.5 border-b border-[#182030]">
                <Building2 className="h-4 w-4 text-amber-400" />
                <span>Gravadoras Afins</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-2 mb-3">
                Selos conceituados onde essa sonoridade é lançada:
              </p>

              <div className="space-y-1.5">
                {seedResult.recommendedLabels.map((lbl) => (
                  <button
                    key={lbl}
                    onClick={() => {
                      setActiveMode('filters');
                      setFilter((prev) => ({
                        ...prev,
                        customLabelSearch: lbl,
                      }));
                      handleDigFilters();
                    }}
                    className="w-full flex items-center justify-between rounded bg-[#121622] border border-[#1e273a] px-3 py-2 text-left text-xs font-semibold text-slate-200 hover:text-amber-300 hover:border-amber-500/40 transition-colors group cursor-pointer"
                  >
                    <span>{lbl}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-amber-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. SEÇÃO DE RESULTADOS POR FILTROS */}
      {activeMode === 'filters' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              Faixas Garimpadas {filterTracks.length > 0 && `(${filterTracks.length})`}
            </h3>
            {filterTracks.length > 0 && (
              <span className="text-xs text-purple-400 font-mono font-semibold">
                Auditadas e Disponíveis no Deezer
              </span>
            )}
          </div>

          {filterTracks.length > 0 ? (
            <div className="space-y-2.5">
              {filterTracks.map((track, i) => (
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
          ) : hasSearchedFilter ? (
            <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-8 text-center text-xs text-slate-400">
              Nenhuma faixa encontrada no Deezer com os critérios exatos. Experimente ajustar o BPM ou pesquisar por outro nome de gravadora.
            </div>
          ) : (
            <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-12 text-center">
              <Disc3 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">
                Selecione as gravadoras ou digite qualquer selo acima
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Clique em "Garimpar Faixas com Filtros" para pesquisar faixas reais no catálogo do Deezer.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Estado Inicial se nada foi pesquisado no modo Seed */}
      {activeMode === 'seed' && !seedResult && !isSearchingSeed && (
        <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-12 text-center">
          <Sparkles className="h-10 w-10 text-purple-400/50 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">
            Descubra faixas a partir de uma música favorita
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Digite o nome de qualquer música que você toque e ame no campo acima. Sugestões oficiais do Deezer com capas e durações surgirão enquanto você digita. Todas as faixas recomendadas existem comprovadamente no Deezer para você montar suas playlists.
          </p>
        </div>
      )}
    </div>
  );
};
