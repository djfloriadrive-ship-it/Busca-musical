import React, { useState } from 'react';
import { SlidersHorizontal, Info, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { CAMELOT_TO_MUSICAL, getCompatibleCamelotKeys } from '../services/camelotEngine';

interface CamelotWheelModalProps {
  initialKey?: string;
  onSelectKey?: (key: string) => void;
}

export const CamelotWheelModal: React.FC<CamelotWheelModalProps> = ({
  initialKey = '8A',
  onSelectKey,
}) => {
  const [selectedKey, setSelectedKey] = useState<string>(initialKey);

  const compatibleList = getCompatibleCamelotKeys(selectedKey);

  // Anéis Camelot
  const minorKeys = ['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'];
  const majorKeys = ['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-amber-400" />
          <span>Matriz Harmônica Camelot Wheel & Regras de Transição de Pista</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          O padrão da indústria para mixagem harmônica contínua. Clique em qualquer tom para inspecionar os caminhos de mixagem segura, modulações emocionais e saltos de energia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo: Roda Interativa Visual */}
        <div className="lg:col-span-6 rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-500 block">Tom Selecionado</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-mono text-2xl font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 rounded">
                {selectedKey}
              </span>
              <span className="text-sm text-slate-300 font-medium">
                ({CAMELOT_TO_MUSICAL[selectedKey] || 'Tom Musical'})
              </span>
            </div>
          </div>

          {/* Grid Interativa Simétrica (Anel Maior B e Menor A) */}
          <div className="w-full max-w-sm space-y-3">
            {/* Linha dos Tons Menores (Anel A) */}
            <div>
              <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-wider block mb-1.5 font-bold">
                Anel Interno — Tons Menores (A):
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {minorKeys.map((k) => {
                  const isSelected = selectedKey === k;
                  const isCompatible = compatibleList.some((c) => c.key === k);
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setSelectedKey(k);
                        if (onSelectKey) onSelectKey(k);
                      }}
                      className={`h-11 rounded border font-mono text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                          : isCompatible
                          ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900/50'
                          : 'bg-[#121622] border-[#222b3e] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span>{k}</span>
                      <span className="text-[9px] font-normal opacity-70">
                        {CAMELOT_TO_MUSICAL[k]?.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Linha dos Tons Maiores (Anel B) */}
            <div className="pt-2">
              <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block mb-1.5 font-bold">
                Anel Externo — Tons Maiores (B):
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {majorKeys.map((k) => {
                  const isSelected = selectedKey === k;
                  const isCompatible = compatibleList.some((c) => c.key === k);
                  return (
                    <button
                      key={k}
                      onClick={() => {
                        setSelectedKey(k);
                        if (onSelectKey) onSelectKey(k);
                      }}
                      className={`h-11 rounded border font-mono text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105'
                          : isCompatible
                          ? 'bg-amber-950/60 border-amber-500/60 text-amber-300 hover:bg-amber-900/50'
                          : 'bg-[#121622] border-[#222b3e] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span>{k}</span>
                      <span className="text-[9px] font-normal opacity-70">
                        {CAMELOT_TO_MUSICAL[k]?.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#182030] text-[11px] text-slate-500 text-center font-mono">
            Destaque Ciano = Tons compatíveis para mixagem contínua sem choque acústico.
          </div>
        </div>

        {/* Lado Direito: Regras Detalhadas da Chave Ativa */}
        <div className="lg:col-span-6 rounded-xl border border-[#1b2233] bg-[#0c0f17] p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#182030]">
            <h3 className="text-sm font-bold text-slate-200 uppercase font-mono">
              Opções Harmônicas a partir de {selectedKey}
            </h3>
            <span className="text-xs font-mono text-amber-400">
              {compatibleList.length} Transições Recomendadas
            </span>
          </div>

          <div className="space-y-2">
            {compatibleList.map((comp) => (
              <div
                key={comp.key}
                onClick={() => {
                  setSelectedKey(comp.key);
                  if (onSelectKey) onSelectKey(comp.key);
                }}
                className="group rounded-lg border border-[#1d2536] bg-[#111520] p-3 hover:border-[#2f3d59] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-xs font-bold px-2 py-0.5 rounded border"
                      style={{
                        borderColor: `${comp.badgeColor}60`,
                        backgroundColor: `${comp.badgeColor}15`,
                        color: comp.badgeColor,
                      }}
                    >
                      {comp.key}
                    </span>
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-amber-300 transition-colors">
                      {comp.relation}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {comp.musical}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                  {comp.energyImpact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
