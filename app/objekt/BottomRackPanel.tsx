'use client';

import { ChevronDown } from 'lucide-react';
import Knob from './Knob';
import { COLORS, MOD_MATRIX_ROWS, VOICE_MODES, type VoiceMode } from './constants';

type LFOTab = 'LFO 1' | 'LFO 2' | 'Curve' | 'Macro';
const LFO_TABS: LFOTab[] = ['LFO 1', 'LFO 2', 'Curve', 'Macro'];

interface BottomRackPanelProps {
  lfoTab: LFOTab;
  setLfoTab: (t: LFOTab) => void;
  params: Record<string, number | string>;
  onChange: (e: { target: { name: string; value: number | string } }) => void;
}

export default function BottomRackPanel({ lfoTab, setLfoTab, params, onChange }: BottomRackPanelProps) {
  const voiceMode = (params.voiceMode as VoiceMode) || 'Poly 8';
  const pitchRange = typeof params.pitchRange === 'number' ? params.pitchRange : 2;

  return (
    <div
      className="h-auto min-h-[170px] flex-shrink-0 p-4 flex gap-4 border-t border-[#111]"
      style={{ backgroundColor: COLORS.modDark }}
    >
      {/* Pitch + Mod wheels */}
      <div className="w-32 border-r border-[#444] pr-4 flex flex-col gap-2 shrink-0">
        <div className="flex justify-between text-[9px] font-bold" style={{ color: COLORS.modYellow }}>
          <div className="flex flex-col items-center">
            <div
              className="px-1.5 rounded-[2px] shadow-inner mb-1 flex items-center gap-1 text-[9px] cursor-pointer hover:brightness-110"
              style={{ backgroundColor: 'black', color: COLORS.modYellow }}
            >
              <ChevronDown size={10} /> Off
            </div>
            <span>Portamento</span>
          </div>
          <div className="flex flex-col items-center">
            <Knob value={0.5} size={18} color={COLORS.modYellow} />
            <span>Rate</span>
          </div>
        </div>
        <div className="flex justify-between text-[9px] font-bold" style={{ color: COLORS.modYellow }}>
          <div className="flex flex-col items-center w-full">
            <div
              className="px-3 rounded-[2px] shadow-inner mb-1 font-mono cursor-pointer hover:brightness-110 relative"
              style={{ backgroundColor: 'black', color: COLORS.modYellow }}
              onClick={() => {
                const next = pitchRange === 12 ? 2 : pitchRange + 2;
                onChange({ target: { name: 'pitchRange', value: next } });
              }}
              title="Pitch bend range (semitones)"
            >
              {pitchRange}
            </div>
            <span>Range</span>
          </div>
          <div className="flex flex-col items-center w-full relative">
            <select
              value={voiceMode}
              onChange={(e) => onChange({ target: { name: 'voiceMode', value: e.target.value } })}
              className="px-1.5 rounded-[2px] shadow-inner mb-1 text-[9px] font-bold cursor-pointer appearance-none text-center w-full"
              style={{ backgroundColor: 'black', color: COLORS.modYellow, border: 'none', outline: 'none' }}
              title="Voice mode: Poly, Mono, Legato, or Auto Legato (detects legato in chords)"
            >
              {VOICE_MODES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <span>Key Mode</span>
          </div>
        </div>
        {/* Pitch & Mod wheels */}
        <div className="flex-1 flex gap-4 justify-center items-end pb-1 mt-2">
          {['Pitch', 'Mod'].map((lbl, i) => (
            <div key={lbl} className="flex flex-col items-center gap-1">
              <div
                className="w-4 h-12 rounded-[2px] border border-[#444] relative"
                style={{ backgroundColor: 'black', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8)' }}
              >
                <div
                  className={`w-full h-2.5 rounded-sm border-t border-[#aaa] absolute ${i === 0 ? 'top-1/2 -translate-y-1/2' : 'bottom-0'}`}
                  style={{ backgroundColor: '#888' }}
                />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#888' }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modulation Matrix */}
      <div className="flex-1 border-r border-[#444] pr-4 flex flex-col px-1 justify-between min-w-0">
        {/* Header */}
        <div
          className="grid grid-cols-12 text-[9px] font-bold uppercase mb-1 border-b border-[#444] pb-1 tracking-widest"
          style={{ color: COLORS.modYellow }}
        >
          <span className="col-span-3 pl-1">Source</span>
          <span className="col-span-1 text-center">AMT</span>
          <span className="col-span-3 pl-1">Destination</span>
          <span className="col-span-1 text-center">AMT2</span>
          <span className="col-span-3 pl-1">Destination 2</span>
          <span className="col-span-1 text-center">Scale</span>
        </div>
        {/* Rows */}
        {MOD_MATRIX_ROWS.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-12 text-[10px] font-mono py-[4px] border-b items-center"
            style={{ color: COLORS.modText, borderColor: 'rgba(68,68,68,0.5)' }}
          >
            <span
              className="col-span-3 px-1.5 py-[1px] rounded-[2px] mx-1 border border-transparent hover:border-[#555] cursor-pointer truncate"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              {row.s}
            </span>
            <span className="col-span-1 text-center" style={{ color: COLORS.modYellow }}>{row.a1}</span>
            <span
              className="col-span-3 px-1.5 py-[1px] rounded-[2px] mx-1 border border-transparent hover:border-[#555] cursor-pointer truncate"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              {row.d1}
            </span>
            <span className="col-span-1 text-center text-white">
              {row.a2 !== 0 ? `↑ ${row.a2}` : '0'}
            </span>
            <span
              className="col-span-3 px-1.5 py-[1px] rounded-[2px] mx-1 border border-transparent hover:border-[#555] cursor-pointer text-[#777] truncate"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              {row.d2}
            </span>
            <span
              className="col-span-1 px-1.5 py-[1px] rounded-[2px] mx-1 border border-transparent hover:border-[#555] cursor-pointer flex justify-between items-center truncate"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              <span className="truncate">{row.sc}</span>
              <span
                className="border rounded-full w-3 h-3 flex items-center justify-center text-[7px] shrink-0"
                style={{ color: COLORS.modYellow, borderColor: COLORS.modYellow }}
              >
                x
              </span>
            </span>
          </div>
        ))}
        {/* Add Row button */}
        <button
          className="mt-1 text-[9px] font-bold uppercase tracking-widest text-left pl-1 hover:opacity-80 transition-opacity"
          style={{ color: '#666' }}
        >
          + Add Row
        </button>
      </div>

      {/* LFO / Curve / Macro */}
      <div className="w-[200px] flex flex-col gap-1 px-1 justify-between shrink-0" style={{ color: COLORS.modYellow }}>
        {/* Tabs */}
        <div className="flex gap-3 text-[9px] font-bold border-b border-[#444] pb-1 tracking-widest">
          {LFO_TABS.map((t) => (
            <span
              key={t}
              onClick={() => setLfoTab(t)}
              className={`cursor-pointer transition-colors hover:text-white ${
                lfoTab === t ? 'border-b-[2.5px] pb-[1px]' : 'text-[#666]'
              }`}
              style={lfoTab === t ? { borderColor: COLORS.modYellow } : {}}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Curve / LFO Display */}
        <div
          className="rounded-[3px] border h-[65px] mt-1 p-1 relative shadow-inner"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', borderColor: '#444' }}
        >
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full fill-none" strokeWidth={2} style={{ stroke: COLORS.modYellow }}>
            {lfoTab === 'LFO 1' && (
              <path d="M0,20 Q10,0 20,20 Q30,40 40,20 Q50,0 60,20 Q70,40 80,20 Q90,0 100,20" />
            )}
            {lfoTab === 'LFO 2' && (
              <path d="M0,20 L20,20 L20,5 L40,5 L40,35 L60,35 L60,5 L80,5 L80,35 L100,35" />
            )}
            {lfoTab === 'Curve' && (
              <path d="M0,0 Q20,30 100,38" />
            )}
            {lfoTab === 'Macro' && (
              <path d="M0,38 L25,30 L50,10 L75,25 L100,5" />
            )}
          </svg>
          <div
            className="absolute top-1 left-1 text-[8px] px-1.5 py-0.5 rounded-[2px] font-mono"
            style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: COLORS.modYellow }}
          >
            {lfoTab === 'Curve' ? '1.583Hz' : lfoTab === 'LFO 1' ? '2.00Hz' : lfoTab === 'LFO 2' ? '0.50Hz' : '--'}
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-bold mt-1">
          {[
            { label: 'Stepped', def: false },
            { label: 'Beat Sync', def: false },
            { label: 'Oneshot', def: true },
            { label: 'Key Sync', def: true },
            { label: 'Bipolar', def: false },
            { label: 'Global', def: false },
          ].map(({ label, def }) => (
            <label key={label} className="flex items-center gap-1.5 cursor-pointer uppercase tracking-widest" style={{ color: COLORS.modYellow }}>
              <input
                type="checkbox"
                defaultChecked={def}
                className="w-2.5 h-2.5"
                style={{ accentColor: COLORS.modYellow }}
              />
              {label}
            </label>
          ))}
        </div>

        {/* LFO Rate Knob */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>Rate</span>
          <Knob value={0.4} size={22} color={COLORS.modYellow} />
          <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>Depth</span>
          <Knob value={0.6} size={22} color={COLORS.modYellow} />
        </div>
      </div>
    </div>
  );
}
