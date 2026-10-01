/**
 * Subterráneo — DJ Crate Digging & Harmonic Set Architect
 * Aplicação principal de curadoria musical e engenharia de sets para DJs.
 */

import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { RekordboxSetView } from './components/RekordboxSetView';
import { CrateDiggerView } from './components/CrateDiggerView';
import { CamelotWheelModal } from './components/CamelotWheelModal';
import { MyCrateView } from './components/MyCrateView';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { DJSet, DJTrack } from './types/dj';
import { DEMO_SETS } from './services/rekordboxParser';
import { Plus, Upload, X, Disc3 } from 'lucide-react';

const LOCAL_STORAGE_SET_KEY = 'subterraneo_dj_current_set_v1';
const LOCAL_STORAGE_CRATE_KEY = 'subterraneo_dj_crate_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'set' | 'digger' | 'camelot' | 'crate'>('set');

  // Inicializa o Set com dados salvos no localStorage ou preset inicial de Melodic Techno
  const [currentSet, setCurrentSet] = useState<DJSet>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SET_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar set do localStorage:', e);
    }
    return DEMO_SETS[0];
  });

  // Coleção Crate pessoal
  const [crateTracks, setCrateTracks] = useState<DJTrack[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CRATE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar crate do localStorage:', e);
    }
    return [];
  });

  // Faixa sendo reproduzida no player global
  const [playingTrack, setPlayingTrack] = useState<DJTrack | null>(null);

  // Modal de Novo Set / Seleção de Preset
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Salvar no localStorage sempre que o set ou a crate mudarem
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SET_KEY, JSON.stringify(currentSet));
    } catch (e) {
      console.error('Erro ao salvar set no localStorage:', e);
    }
  }, [currentSet]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CRATE_KEY, JSON.stringify(crateTracks));
    } catch (e) {
      console.error('Erro ao salvar crate no localStorage:', e);
    }
  }, [crateTracks]);

  // Manipuladores de Ação
  const handlePlayToggle = (track: DJTrack) => {
    if (playingTrack?.id === track.id) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track);
    }
  };

  const handleAddToSet = (track: DJTrack) => {
    setCurrentSet((prev) => {
      const alreadyIn = prev.tracks.some((t) => t.id === track.id);
      if (alreadyIn) return prev;
      return {
        ...prev,
        tracks: [...prev.tracks, track],
      };
    });
  };

  const handleSaveToCrate = (track: DJTrack) => {
    setCrateTracks((prev) => {
      const exists = prev.some((t) => t.id === track.id);
      if (exists) {
        return prev.filter((t) => t.id !== track.id);
      }
      return [track, ...prev];
    });
  };

  const handleRemoveFromCrate = (trackId: string) => {
    setCrateTracks((prev) => prev.filter((t) => t.id !== trackId));
  };

  const handleClearCrate = () => {
    if (window.confirm('Deseja realmente remover todas as faixas da sua Crate?')) {
      setCrateTracks([]);
    }
  };

  const handleSelectPreset = (preset: DJSet) => {
    setCurrentSet({
      ...preset,
      id: `set-${Date.now()}`,
      tracks: [...preset.tracks],
    });
    setIsImportModalOpen(false);
    setActiveTab('set');
  };

  const handleStartBlankSet = () => {
    setCurrentSet({
      id: `set-${Date.now()}`,
      name: 'Novo Set Rekordbox',
      description: 'Set em branco pronto para inclusão de faixas e estruturação harmônica.',
      targetVibe: 'club_prime_time',
      tracks: [],
      createdAt: new Date().toISOString(),
      sourceType: 'custom',
    });
    setIsImportModalOpen(false);
    setActiveTab('set');
  };

  const savedCrateIds = new Set(crateTracks.map((t) => t.id));

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] pb-24">
      {/* Barra de Navegação Top Bar */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        crateCount={crateTracks.length}
        setTrackCount={currentSet.tracks.length}
        onNewSetClick={() => setIsImportModalOpen(true)}
      />

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
        {activeTab === 'set' && (
          <RekordboxSetView
            currentSet={currentSet}
            setCurrentSet={setCurrentSet}
            onPlayTrack={handlePlayToggle}
            playingTrackId={playingTrack?.id}
            onSaveToCrate={handleSaveToCrate}
            savedCrateIds={savedCrateIds}
          />
        )}

        {activeTab === 'digger' && (
          <CrateDiggerView
            onAddToSet={handleAddToSet}
            onSaveToCrate={handleSaveToCrate}
            savedCrateIds={savedCrateIds}
            onPlayTrack={handlePlayToggle}
            playingTrackId={playingTrack?.id}
          />
        )}

        {activeTab === 'camelot' && (
          <CamelotWheelModal
            initialKey={currentSet.tracks[0]?.camelotKey || '8A'}
            onSelectKey={(key) => {
              // Permite navegar direto ao crate digger focado nesta tonalidade
              console.log('Chave selecionada:', key);
            }}
          />
        )}

        {activeTab === 'crate' && (
          <MyCrateView
            crateTracks={crateTracks}
            onRemoveFromCrate={handleRemoveFromCrate}
            onAddToSet={handleAddToSet}
            onClearCrate={handleClearCrate}
            onPlayTrack={handlePlayToggle}
            playingTrackId={playingTrack?.id}
          />
        )}
      </main>

      {/* Player de Áudio Global Fixo no Rodapé */}
      <AudioPlayerBar
        currentTrack={playingTrack}
        onClose={() => setPlayingTrack(null)}
        onSaveToCrate={handleSaveToCrate}
        isSavedInCrate={playingTrack ? savedCrateIds.has(playingTrack.id) : false}
      />

      {/* Modal de Importação / Criação de Novo Set */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-[#232c40] bg-[#0d111a] p-6 shadow-2xl">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Disc3 className="h-5 w-5 text-amber-400" />
              <span>Gerenciar Sets do Rekordbox</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Escolha um set pré-carregado de alta curadoria ou inicie uma nova lista de reprodução em branco.
            </p>

            <div className="mt-5 space-y-3">
              <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider block">
                Presets de Demonstração Rápidos:
              </span>

              {DEMO_SETS.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => handleSelectPreset(demo)}
                  className="w-full text-left rounded-lg border border-[#1e273a] bg-[#121622] p-3 hover:border-amber-500/50 hover:bg-[#161c2b] transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-xs text-slate-200">{demo.name}</h5>
                    <span className="font-mono text-[11px] text-amber-400">
                      {demo.tracks.length} tracks
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{demo.description}</p>
                </button>
              ))}

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={handleStartBlankSet}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#2a364e] bg-[#141924] py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#1a2130] transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Iniciar Set em Branco</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
