'use client';

import { ChevronDown } from 'lucide-react';
import Knob from './Knob';
import VSlider from './VSlider';
import { COLORS, CENTER_TABS, type CenterTab } from './constants';

interface CenterPanelProps {
  params: Record<string, number | string>;
  onChange: (e: { target: { name: string; value: number | string } }) => void;
  centerTab: CenterTab;
  setCenterTab: (t: CenterTab) => void;
}

const TAB_LABELS: { label: string; value: CenterTab }[] = [
  { label: 'Modal', value: 'modal' },
  { label: 'Object 1', value: 'obj1' },
  { label: 'Object 2', value: 'obj2' },
];

export default function CenterPanel({ params, onChange, centerTab, setCenterTab }: CenterPanelProps) {
  const p = params as Record<string, number>;

  const getFreqKey = (i: number) => `${centerTab === 'modal' ? 'modal' : centerTab}Freq${i}`;
  const getGainKey = (i: number) => centerTab === 'modal' ? `modal${i}` : `${centerTab}_${i}`;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 relative z-0 border-r border-[#c0c0c0] min-w-0">

      {/* Top Controls Row */}
      <div className="flex justify-between items-end px-2 gap-2">
        <Knob label="Input Mix" name="inputMix" value={p.inputMix} onChange={onChange} size={32} />

        {/* Tabs */}
        <div className="flex flex-col items-center flex-1 mx-3 min-w-0">
          {/* Routing dots */}
          <div className="flex items-center justify-between w-full px-[12%] relative h-5 mb-1">
            <div className="w-full h-[1.5px] absolute top-1/2 left-0" style={{ backgroundColor: '#aaa' }} />
            {['ON', 'ON', 'ON'].map((label, i) => (
              <div key={i} className="relative flex flex-col items-center z-10">
                <span className="text-[7px] font-black text-[#666] absolute bottom-full mb-0.5">{label}</span>
                <div
                  className="w-3 h-3 rounded-full border-[1.5px]"
                  style={{ borderColor: '#666', backgroundColor: COLORS.chassis }}
                />
              </div>
            ))}
          </div>

          {/* Tab strip */}
          <div
            className="flex w-full p-[3px] rounded-t-lg border border-b-0 -mb-[6px] z-10"
            style={{ backgroundColor: '#c8c8c8', borderColor: '#a3a3a3', paddingBottom: 8 }}
          >
            {TAB_LABELS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setCenterTab(value)}
                className={`flex-1 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-[3px] transition-all border ${
                  centerTab === value
                    ? 'z-20 relative'
                    : 'hover:bg-[#eaeaea] shadow-inner border-transparent'
                }`}
                style={
                  centerTab === value
                    ? { backgroundColor: '#98a87d', color: '#2c3322', borderColor: '#74875a', boxShadow: '0 -2px 4px rgba(0,0,0,0.1)' }
                    : { backgroundColor: '#dfdfd9', color: '#777', borderColor: 'transparent' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-end shrink-0">
          <Knob label="TrigPos" name="trigPos" value={p.trigPos} onChange={onChange} size={36} />

          {/* Template Selector */}
          <div
            className="flex items-center gap-2 p-1.5 rounded-[4px] border h-12"
            style={{ backgroundColor: '#c8c8c8', borderColor: '#b0b0b0', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
          >
            <div
              className="px-2.5 py-1 rounded-[2px] text-[14px] font-mono font-bold shadow-inner"
              style={{ backgroundColor: 'black', color: COLORS.modYellow }}
            >
              0
            </div>
            <div className="flex flex-col text-center justify-center">
              <div
                className="px-2 py-0.5 rounded-[2px] text-[9px] font-bold border flex items-center gap-1 cursor-pointer"
                style={{ backgroundColor: 'black', color: COLORS.modYellow, borderColor: '#333' }}
              >
                <ChevronDown size={11} /> Select
              </div>
              <span className="text-[8px] font-bold uppercase text-[#666] mt-1">Template</span>
            </div>
          </div>

          <Knob label="Low Cut" name="lowCut" value={p.lowCut} onChange={onChange} size={32} />
        </div>
      </div>

      {/* LCD Screen */}
      <div
        className="rounded-xl border-[6px] shadow-[inset_0_10px_25px_rgba(0,0,0,0.45)] flex-1 p-3 flex relative z-0 overflow-hidden"
        style={{ backgroundColor: COLORS.lcdBg, borderColor: COLORS.lcdDark, minHeight: 220 }}
      >
        {/* Pixel grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '3px 3px',
          }}
        />

        {/* Left Labels */}
        <div
          className="flex flex-col justify-between w-10 text-[9px] font-black font-mono leading-none py-1 absolute left-3 top-2 bottom-3 z-10 select-none"
          style={{ color: COLORS.lcdDark }}
        >
          <span>ON</span>
          <span>KBD</span>
          <span>FREQ</span>
          <span className="leading-[1.1] tracking-tighter">POLA-<br />RITY</span>
          <span className="text-[11px]">GAIN</span>
        </div>

        {/* 8 Partial Strips */}
        <div className="flex-1 flex justify-between ml-14 mr-[80px] h-full relative z-10 pt-1">
          {Array.from({ length: 8 }).map((_, i) => {
            const freqKey = getFreqKey(i);
            const gainKey = getGainKey(i);
            return (
              <div key={i} className="flex flex-col items-center h-full w-[38px]">
                {/* ON dot */}
                <div
                  className="w-[10px] h-[10px] rounded-full border shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] mb-2 cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: COLORS.lcdBright, borderColor: COLORS.lcdDark }}
                />
                {/* KBD dot */}
                <div
                  className="w-[10px] h-[10px] rounded-full border shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] mb-2 cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: COLORS.lcdBright, borderColor: COLORS.lcdDark }}
                />
                {/* Freq input */}
                <input
                  type="number"
                  step="0.01"
                  className="text-[11px] font-mono w-[38px] text-center rounded-[2px] mb-2.5 outline-none shadow-inner border-0"
                  style={{ backgroundColor: COLORS.lcdDark, color: COLORS.lcdBright }}
                  value={typeof p[freqKey] === 'number' ? p[freqKey].toFixed(2) : '0.00'}
                  onChange={(e) =>
                    onChange({ target: { name: freqKey, value: parseFloat(e.target.value) || 0 } })
                  }
                  aria-label={`Partial ${i + 1} frequency`}
                />
                <div className="w-full h-[2px] mb-2.5" style={{ backgroundColor: `${COLORS.lcdDark}50` }} />
                {/* Gain Slider */}
                <div className="flex-1 w-full flex justify-center pb-1">
                  <VSlider
                    name={gainKey}
                    value={p[gainKey] ?? 0}
                    onChange={(e) => onChange({ target: { name: gainKey, value: parseFloat(e.target.value) } })}
                    height="100%"
                    type="lcd"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Ghost numbers */}
        <div
          className="absolute inset-0 flex justify-between px-[70px] pr-[95px] pointer-events-none opacity-[0.07] font-black text-[76px] items-center pb-6 select-none"
          style={{ color: COLORS.lcdDark }}
        >
          <span>1</span>
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span>8</span>
        </div>

        {/* Right Side Panel */}
        <div
          className="w-[70px] border-l pl-3 flex flex-col text-[9px] font-mono font-bold absolute right-3 top-2 bottom-3 z-10 select-none"
          style={{ borderColor: `${COLORS.lcdDark}50`, color: COLORS.lcdDark }}
        >
          <div className="text-right w-full mb-1.5 leading-none">
            257<br /><span className="text-[8px]">TUNING</span>
          </div>
          <div className="text-right w-full mb-2 leading-none">
            0<br /><span className="text-[8px]">KEY TRACK+</span>
          </div>
          <div className="text-right w-full mb-1 text-[8px] tracking-tighter">COUPLING</div>
          <div className="flex flex-col gap-[3px] items-end w-full mb-2 text-[8px]">
            {[
              { label: 'OFF', active: true },
              { label: 'ON', active: false },
              { label: 'X-OVER', active: true },
            ].map(({ label, active }) => (
              <span key={label} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full border"
                  style={{
                    backgroundColor: active ? COLORS.lcdBright : COLORS.lcdDark,
                    borderColor: COLORS.lcdDark,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
          <div
            className="mt-auto flex flex-col items-center border rounded p-1.5 w-full"
            style={{ borderColor: `${COLORS.lcdDark}50` }}
          >
            <div
              className="w-6 h-6 rounded-full border-[2px] flex items-center justify-center relative"
              style={{ borderColor: COLORS.lcdDark }}
            >
              <div
                className="absolute top-[2px] origin-bottom"
                style={{ width: 2, height: 10, backgroundColor: COLORS.lcdDark, transform: 'rotate(45deg)' }}
              />
            </div>
            <span className="mt-1 text-[8px]">FREQ</span>
          </div>
        </div>
      </div>

      {/* Physics Section */}
      <div className="flex justify-between divide-x divide-[#b0b0b0] mt-auto border-t border-[#b0b0b0] pt-3 pb-1">
        {/* Collision */}
        <div className="flex flex-col items-center gap-2 px-[2%] w-[18%] shrink-0">
          <span className="text-[10px] font-bold text-[#777] uppercase tracking-widest border-b border-[#c8c8c8] w-full text-center pb-1 mb-1">Collision</span>
          <div className="flex gap-2 justify-center w-full">
            <Knob label="Amount" name="collisionAmount" value={p.collisionAmount} onChange={onChange} size={28} />
            <Knob label="Bounce" name="collisionBounce" value={p.collisionBounce} onChange={onChange} size={28} />
          </div>
        </div>
        {/* Pitch Mod */}
        <div className="flex flex-col items-center gap-2 px-[2%] w-[18%] shrink-0">
          <span className="text-[10px] font-bold text-[#777] uppercase tracking-widest border-b border-[#c8c8c8] w-full text-center pb-1 mb-1">Pitch Mod</span>
          <div className="flex gap-2 justify-center w-full">
            <Knob label="Amount" name="pitchModAmount" value={p.pitchModAmount} onChange={onChange} size={28} />
            <Knob label="Filter" name="pitchModFilter" value={p.pitchModFilter} onChange={onChange} size={28} />
          </div>
        </div>
        {/* Dispersion */}
        <div className="flex flex-col items-center gap-2 px-[2%] w-[22%] shrink-0">
          <span className="text-[10px] font-bold text-[#777] uppercase tracking-widest border-b border-[#c8c8c8] w-full text-center pb-1 mb-1">Dispersion</span>
          <div className="flex gap-1.5 items-end justify-center w-full">
            <Knob label="Freq" name="dispersionFreq" value={p.dispersionFreq} onChange={onChange} size={28} />
            <Knob label="Mod" name="dispersionMod" value={p.dispersionMod} onChange={onChange} size={22} />
            <Knob label="Filter" name="dispersionFilter" value={p.dispersionFilter} onChange={onChange} size={22} />
          </div>
        </div>
        {/* Damping */}
        <div className="flex flex-col items-center gap-2 px-[2%] w-[25%] shrink-0">
          <span className="text-[10px] font-bold text-[#777] uppercase tracking-widest border-b border-[#c8c8c8] w-full text-center pb-1 mb-1">Damping</span>
          <div className="flex gap-1 justify-center w-full items-end">
            <div className="flex flex-col gap-1 items-center">
              <Knob label="Low" name="dampingLow" value={p.dampingLow} onChange={onChange} size={18} />
              <Knob label="Gain" name="dampingGain" value={p.dampingGain} onChange={onChange} size={24} />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <Knob label="Mid" name="dampingMid" value={p.dampingMid} onChange={onChange} size={18} />
              <Knob label="Slope" name="dampingSlope" value={p.dampingSlope} onChange={onChange} size={24} />
            </div>
            <Knob label="Hi" name="dampingHi" value={p.dampingHi} onChange={onChange} size={18} />
          </div>
        </div>
        {/* Decay */}
        <div className="flex flex-col items-center gap-2 pl-[2%] w-[17%] shrink-0">
          <span className="text-[10px] font-bold text-[#777] uppercase tracking-widest border-b border-[#c8c8c8] w-full text-center pb-1 mb-1">Decay</span>
          <div className="flex gap-2 items-end justify-center w-full">
            <Knob label="Time" name="decayTime" value={p.decayTime} onChange={onChange} size={34} />
            <Knob label="RelMute" name="decayRelMute" value={p.decayRelMute} onChange={onChange} size={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
