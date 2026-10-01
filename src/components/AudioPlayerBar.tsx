import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  Disc,
  X,
  Radio,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DJTrack } from '../types/dj';
import { fetchAudioPreview, synthPreviewEngine } from '../services/audioPreviewService';

interface AudioPlayerBarProps {
  currentTrack: DJTrack | null;
  onClose: () => void;
  onSaveToCrate?: (track: DJTrack) => void;
  isSavedInCrate?: boolean;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSourceType, setAudioSourceType] = useState<'official' | 'synth' | 'loading'>('loading');
  const [showDeezerWidget, setShowDeezerWidget] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Inicializa e carrega preview sempre que a faixa mudar
  useEffect(() => {
    if (!currentTrack) {
      setIsPlaying(false);
      synthPreviewEngine.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    let isMounted = true;
    setAudioSourceType('loading');
    setCurrentTime(0);

    const playAudioUrl = (url: string) => {
      if (!isMounted || !audioRef.current) return;
      audioRef.current.src = url;
      audioRef.current.currentTime = 0;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current
        .play()
        .then(() => {
          if (isMounted) {
            setIsPlaying(true);
            setAudioSourceType('official');
          }
        })
        .catch(() => {
          setIsPlaying(false);
          setAudioSourceType('official');
        });
    };

    // 1. Se a faixa já possui previewUrl (do Deezer), toca diretamente
    if (currentTrack.previewUrl) {
      playAudioUrl(currentTrack.previewUrl);
    } else {
      // 2. Busca preview alternativo do iTunes / Apple
      fetchAudioPreview(currentTrack.title, currentTrack.artist).then((url) => {
        if (!isMounted) return;
        if (url) {
          playAudioUrl(url);
        } else {
          // 3. Fallback: Sintetizador harmônico analógico
          setAudioSourceType('synth');
          synthPreviewEngine.playHarmonicGroove(currentTrack.bpm, currentTrack.camelotKey, () => {
            if (isMounted) setIsPlaying(false);
          });
          setIsPlaying(true);
        }
      });
    }

    return () => {
      isMounted = false;
      synthPreviewEngine.stop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentTrack]);

  // Controles de Play/Pause
  const togglePlay = () => {
    if (!currentTrack) return;

    if (isPlaying) {
      if (audioSourceType === 'synth') {
        synthPreviewEngine.stop();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (audioSourceType === 'synth') {
        synthPreviewEngine.playHarmonicGroove(currentTrack.bpm, currentTrack.camelotKey, () => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      } else if (audioRef.current && audioRef.current.src) {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 30);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current && audioSourceType === 'official') {
      audioRef.current.currentTime = val;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(false);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#1e2638] bg-[#0b0e15]/95 backdrop-blur-lg px-4 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)]">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Widget Oficial do Deezer Incorporado (Permite prévias mais longas, waveform e player nativo) */}
      {showDeezerWidget && currentTrack.deezerId && (
        <div className="mx-auto max-w-7xl pb-2">
          <div className="flex items-center justify-between pb-1 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5 text-purple-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              Widget Oficial do Deezer — Prévia Completa com Waveform & Navegação
            </span>
            <button
              onClick={() => setShowDeezerWidget(false)}
              className="text-slate-500 hover:text-slate-300 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Minimizar Widget</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <iframe
            title={`Deezer Player - ${currentTrack.title}`}
            src={`https://widget.deezer.com/widget/dark/track/${currentTrack.deezerId}`}
            width="100%"
            height="94"
            frameBorder="0"
            allow="encrypted-media; clipboard-write"
            className="rounded-lg border border-[#232c40] bg-[#121622] shadow-md"
          />
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Info da Faixa Ativa */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Capa oficial do Álbum ou Ícone de Vinil */}
          {currentTrack.albumCoverUrl ? (
            <div className="relative h-11 w-11 shrink-0 rounded-md overflow-hidden border border-[#232c40] bg-[#161c27] shadow-sm">
              <img
                src={currentTrack.albumCoverUrl}
                alt={currentTrack.title}
                className={`h-full w-full object-cover ${isPlaying ? 'brightness-105' : 'brightness-90'}`}
              />
              {isPlaying && (
                <span className="absolute bottom-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
          ) : (
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#161c27] border border-[#232c40] text-amber-400">
              <Disc className={`h-5 w-5 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
              {audioSourceType === 'synth' && (
                <span
                  className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-bold text-slate-950"
                  title="Groove harmônico analógico sintetizado"
                >
                  <Radio className="h-2 w-2" />
                </span>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-semibold text-slate-100">{currentTrack.title}</h4>
              {currentTrack.isExtendedMix ? (
                <span className="font-mono text-[9px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 rounded shrink-0">
                  Extended
                </span>
              ) : (
                <span className="font-mono text-[9px] text-slate-400 bg-slate-800/40 border border-slate-700/40 px-1 py-0.2 rounded shrink-0">
                  Original
                </span>
              )}
              <span className="font-mono text-xs font-bold text-amber-400 border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.2 rounded">
                {currentTrack.camelotKey}
              </span>
              <span className="font-mono text-xs text-slate-400">
                {currentTrack.bpm.toFixed(1)} BPM
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span className="truncate text-slate-300 font-medium">{currentTrack.artist}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">{currentTrack.label}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-300/80 font-medium truncate">{currentTrack.subgenre}</span>
            </div>
          </div>
        </div>

        {/* Controles de Reprodução e Scrubber Rápido */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-md w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
              title={isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
            </button>

            <span className="text-[10px] font-mono text-slate-400">
              {audioSourceType === 'synth'
                ? 'Sintetizador Harmônico (BPM & Tom Exatos)'
                : `${Math.floor(currentTime)}s / ${Math.floor(duration)}s (Áudio Direto)`}
            </span>

            {/* Botão de Alternar Widget do Deezer */}
            {currentTrack.deezerId && (
              <button
                onClick={() => setShowDeezerWidget(!showDeezerWidget)}
                className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-mono transition-colors cursor-pointer ${
                  showDeezerWidget
                    ? 'border-purple-500/50 bg-purple-500/20 text-purple-300'
                    : 'border-[#29354d] bg-[#141a27] text-slate-400 hover:text-purple-300'
                }`}
                title="Exibir ou ocultar o player oficial do Deezer"
              >
                <span>{showDeezerWidget ? 'Ocultar Widget' : 'Widget Deezer'}</span>
                {showDeezerWidget ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
              </button>
            )}
          </div>

          {audioSourceType === 'official' && (
            <div className="w-full flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={duration || 30}
                value={currentTime}
                onChange={handleSeek}
                className="h-1 w-full cursor-pointer appearance-none rounded bg-[#232c40] accent-amber-500"
              />
            </div>
          )}
        </div>

        {/* Volume & Links Oficiais */}
        <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end">
          {/* Volume */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="h-1 w-16 cursor-pointer appearance-none rounded bg-[#232c40] accent-amber-500"
            />
          </div>

          {/* Links Rápidos */}
          <div className="flex items-center gap-1.5 text-xs">
            {currentTrack.deezerLink ? (
              <a
                href={currentTrack.deezerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#171d2b] border border-purple-500/30 px-2 py-1 text-[11px] text-purple-300 hover:bg-purple-500/15 transition-colors flex items-center gap-1 font-semibold"
                title="Abrir no Deezer"
              >
                <span>Deezer</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ) : (
              <a
                href={`https://www.deezer.com/search/${encodeURIComponent(currentTrack.artist + ' ' + currentTrack.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-[#171d2b] border border-[#273248] px-2 py-1 text-[11px] text-purple-400 hover:bg-purple-500/10 transition-colors flex items-center gap-1"
              >
                <span>Deezer</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}

            <a
              href={currentTrack.beatportSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-[#171d2b] border border-[#273248] px-2 py-1 text-[11px] text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-colors flex items-center gap-1"
            >
              <span>Beatport</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>

            <a
              href={currentTrack.spotifySearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-[#171d2b] border border-[#273248] px-2 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-colors flex items-center gap-1"
            >
              <span>Spotify</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-slate-500 hover:text-slate-300 hover:bg-[#161c28] transition-colors"
            title="Fechar player"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
