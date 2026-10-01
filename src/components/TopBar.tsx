import React from 'react';
import { Disc3, Library, Compass, SlidersHorizontal, Plus } from 'lucide-react';

interface TopBarProps {
  activeTab: 'set' | 'digger' | 'camelot' | 'crate';
  setActiveTab: (tab: 'set' | 'digger' | 'camelot' | 'crate') => void;
  crateCount: number;
  setTrackCount: number;
  onNewSetClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  crateCount,
  setTrackCount,
  onNewSetClick,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1c2333] bg-[#090b10]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Disc3 className="h-4 w-4 animate-[spin_8s_linear_infinite]" />
          </div>
          <button
            onClick={() => setActiveTab('set')}
            className="text-left font-semibold tracking-tight text-white hover:text-amber-400 transition-colors"
          >
            <span className="text-base tracking-wider uppercase font-bold text-slate-100">Subterráneo</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('set')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'set'
                ? 'bg-[#151a26] text-amber-400 border border-[#2b354b]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111622]'
            }`}
          >
            <Library className="h-3.5 w-3.5" />
            <span>Rekordbox Set</span>
            {setTrackCount > 0 && (
              <span className="font-mono text-[10px] text-slate-400">({setTrackCount})</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('digger')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'digger'
                ? 'bg-[#151a26] text-amber-400 border border-[#2b354b]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111622]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Crate Digger</span>
          </button>

          <button
            onClick={() => setActiveTab('camelot')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'camelot'
                ? 'bg-[#151a26] text-amber-400 border border-[#2b354b]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111622]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Harmonia Camelot</span>
          </button>

          <button
            onClick={() => setActiveTab('crate')}
            className={`flex items-center gap-2 rounded px-3 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'crate'
                ? 'bg-[#151a26] text-amber-400 border border-[#2b354b]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#111622]'
            }`}
          >
            <span>Minha Crate</span>
            {crateCount > 0 && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] text-amber-300">
                {crateCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewSetClick}
            className="flex items-center gap-1.5 rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Importar / Novo Set</span>
            <span className="sm:hidden">Set</span>
          </button>
        </div>
      </div>
    </header>
  );
};
