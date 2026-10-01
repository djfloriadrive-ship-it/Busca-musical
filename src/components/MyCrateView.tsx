import React, { useState } from 'react';
import { Bookmark, Download, Trash2, Plus, Disc3 } from 'lucide-react';
import { DJTrack } from '../types/dj';
import { TrackCard } from './TrackCard';

interface MyCrateViewProps {
  crateTracks: DJTrack[];
  onRemoveFromCrate: (trackId: string) => void;
  onAddToSet: (track: DJTrack) => void;
  onClearCrate: () => void;
  onPlayTrack: (track: DJTrack) => void;
  playingTrackId?: string;
}

export const MyCrateView: React.FC<MyCrateViewProps> = ({
  crateTracks,
  onRemoveFromCrate,
  onAddToSet,
  onClearCrate,
  onPlayTrack,
  playingTrackId,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const genres = ['all', ...Array.from(new Set(crateTracks.map((t) => t.genre)))];

  const filteredTracks =
    selectedGenre === 'all'
      ? crateTracks
      : crateTracks.filter((t) => t.genre === selectedGenre);

  const handleExportCrateM3U = () => {
    if (crateTracks.length === 0) return;

    let m3uContent = '#EXTM3U\n#PLAYLIST:Subterraneo_My_Crate\n\n';
    crateTracks.forEach((track) => {
      m3uContent += `#EXTINF:360,${track.artist} - ${track.title} [Key: ${track.camelotKey} | ${track.bpm} BPM | ${track.subgenre}]\n`;
      m3uContent += `${track.artist} - ${track.title}.mp3\n\n`;
    });

    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subterraneo_my_crate_${Date.now()}.m3u`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-amber-400" />
              <span>Minha Crate de Garimpo ({crateTracks.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Coleção pessoal de faixas exclusivas e gemas independentes salvas durante a pesquisa para incorporar aos seus sets do Rekordbox.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {crateTracks.length > 0 && (
              <>
                <button
                  onClick={handleExportCrateM3U}
                  className="flex items-center gap-1.5 rounded border border-[#26324a] bg-[#141924] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#1b2230] transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-amber-400" />
                  <span>Exportar Crate M3U</span>
                </button>

                <button
                  onClick={onClearCrate}
                  className="flex items-center gap-1.5 rounded border border-[#26324a] bg-[#141924] px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Limpar todas as faixas da crate"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpar</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filtros por Gênero */}
        {genres.length > 1 && (
          <div className="mt-4 pt-3 border-t border-[#182030] flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 font-mono uppercase mr-1">Filtrar:</span>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-[#141924] border border-[#222b3e] text-slate-400 hover:text-slate-200'
                }`}
              >
                {g === 'all' ? 'Todos os Gêneros' : g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de Faixas na Crate */}
      {filteredTracks.length > 0 ? (
        <div className="space-y-2.5">
          {filteredTracks.map((track, i) => (
            <TrackCard
              key={track.id}
              track={track}
              index={i}
              isPlaying={playingTrackId === track.id}
              onPlayToggle={onPlayTrack}
              onAddToSet={onAddToSet}
              onSaveToCrate={() => onRemoveFromCrate(track.id)}
              isSavedInCrate={true}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-12 text-center">
          <Disc3 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">
            Sua Crate está vazia
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Vá até a aba <strong className="text-amber-400">Crate Digger</strong> para garimpar novas tracks ou complemente seu set na aba <strong className="text-amber-400">Rekordbox Set</strong> e salve suas faixas favoritas com o ícone de marcador.
          </p>
        </div>
      )}
    </div>
  );
};
