'use client';

import { Dices } from 'lucide-react';
import Knob from './Knob';
import VSlider from './VSlider';
import { COLORS, FX_TABS, type FXTab, type CenterTab } from './constants';

interface MixerFXPanelProps {
  params: Record<string, number | string>;
  onChange: (e: { target: { name: string; value: number | string } }) => void;
  activeFXTab: FXTab;
  setActiveFXTab: (t: FXTab) => void;
  centerTab: CenterTab;
  setCenterTab: (t: CenterTab) => void;
  onRandomize: () => void;
}

const MIX_CHANNELS = [
  { lbl: 'Exciter', val: 'mixExciter', color: COLORS.modYellow, pan: 'panExciter', hasWidth: false },
  { lbl: 'Modal', val: 'mixModal', color: '#a3e635', pan: 'panModal', hasWidth: false },
  { lbl: 'Obj 1', val: 'mixObj1', color: '#a3e635', pan: 'panObj1', hasWidth: true },
  { lbl: 'Obj 2', val: 'mixObj2', color: '#a3e635', pan: 'panObj2', hasWidth: true },
];

const DIST_TYPE_LIST = ['Ring', 'S/H', 'Sine', 'Tube', 'Scream', 'Dist'];

// Thin styled knob row used in FX panels
function FXKnobRow({ items }: { items: { label: string; name: string; value: number; onChange: (e: { target: { name: string; value: number | string } }) => void; size?: number; bipolar?: boolean }[] }) {
  return (
    <div className="flex items-end justify-center gap-4 flex-wrap px-2">
      {items.map((item) => (
        <Knob key={item.name} label={item.label} name={item.name} value={item.value} onChange={item.onChange} size={item.size ?? 28} bipolar={item.bipolar} />
      ))}
    </div>
  );
}

export default function MixerFXPanel({
  params,
  onChange,
  activeFXTab,
  setActiveFXTab,
  centerTab,
  setCenterTab,
  onRandomize,
}: MixerFXPanelProps) {
  const p = params as Record<string, number>;
  const currentDistIndex = DIST_TYPE_LIST.indexOf(params.distType as string);
  const distPercent = currentDistIndex >= 0 ? currentDistIndex / (DIST_TYPE_LIST.length - 1) : 0.5;

  const fxOn: Record<FXTab, boolean> = {
    DIST: (p.distAmount ?? 0) > 0.02,
    COMP: (p.compRatio ?? 0) > 0.1,
    DLY: (p.dlyMix ?? 0) > 0.01,
    REV: (p.revMix ?? 0) > 0.01,
    EQ: p.eqLow !== 0.5 || p.eqMid !== 0.5 || p.eqHigh !== 0.5,
  };

  return (
    <div className="w-[240px] shrink-0 p-3 flex flex-col gap-3 relative z-10">

      {/* ── Mixer ──────────────────────────────────────────── */}
      <div
        className="rounded-[4px] p-2 border flex flex-col relative"
        style={{ backgroundColor: '#c8c8c8', borderColor: '#a3a3a3', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
      >
        {/* Output header */}
        <div className="flex justify-end gap-2 items-center mb-2 mt-1 mr-1 border-b border-[#a3a3a3] pb-2">
          <div className="flex flex-col gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full border border-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS.lcdDark }} />
            <div className="w-2.5 h-2.5 rounded-full border border-[#222] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS.lcdDark }} />
          </div>
          <Knob size={24} color="#444" label="Output" labelPosition="top" value={p.masterVolume ?? 0.8} name="masterVolume" onChange={onChange} />
        </div>

        {/* Channels */}
        <div className="flex justify-between px-2 mb-1">
          {MIX_CHANNELS.map((ch) => (
            <div key={ch.val} className="flex flex-col items-center">
              <div className="w-2 h-2 rounded-full mb-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.3)]" style={{ backgroundColor: ch.color }} />
              <span className="text-[8.5px] font-bold text-[#666] uppercase leading-tight text-center mb-2 h-6">
                {ch.lbl.split(' ')[0]}<br />{ch.lbl.split(' ')[1] || ''}
              </span>
              <VSlider
                name={ch.val}
                value={p[ch.val]}
                onChange={(e) => onChange({ target: { name: ch.val, value: parseFloat(e.target.value) } })}
                height={80}
                type="mixer"
              />
              <div className="mt-3">
                <Knob name={ch.pan} value={p[ch.pan]} onChange={onChange} size={18} bipolar />
              </div>
              {ch.hasWidth && (
                <div className="mt-1.5">
                  <Knob value={p.widthObj ?? 0.5} name="widthObj" onChange={onChange} size={18} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end pr-[18px] gap-[16px] text-[8px] font-bold text-[#888] uppercase mt-1 mb-1">
          <span>Pan</span>
          <span>Width</span>
        </div>
      </div>

      {/* ── Randomize / Target ─────────────────────────────── */}
      <div
        className="rounded-[4px] p-2 flex flex-col gap-2 border"
        style={{ backgroundColor: COLORS.modDark, borderColor: '#222', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
      >
        <div className="flex gap-1.5">
          <button
            onClick={onRandomize}
            className="flex-1 text-black text-[10px] font-black tracking-widest py-1.5 rounded-[2px] shadow-sm border flex justify-center items-center gap-1 transition-colors hover:brightness-110 active:brightness-90"
            style={{ backgroundColor: COLORS.modYellow, borderColor: '#a87f1d' }}
          >
            <Dices size={11} /> Randomize
          </button>
          <button className="w-8 text-[#ccc] text-[10px] font-bold rounded-[2px] shadow-inner border border-[#333] hover:bg-[#666] transition-colors" style={{ backgroundColor: '#555' }}>X</button>
          <button className="w-8 text-[#ccc] text-[10px] font-bold rounded-[2px] shadow-inner border border-[#333] hover:bg-[#666] transition-colors" style={{ backgroundColor: '#555' }}>OK</button>
        </div>
        <div className="flex justify-between px-3 text-[9px] font-bold uppercase mt-0.5" style={{ color: '#aaa' }}>
          {(['modal', 'obj1', 'obj2'] as CenterTab[]).map((t) => (
            <label key={t} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                readOnly
                checked={centerTab === t}
                onChange={() => setCenterTab(t)}
                className="w-2.5 h-2.5"
                style={{ accentColor: COLORS.modYellow }}
              />
              {t === 'modal' ? 'Modal' : t === 'obj1' ? 'Obj 1' : 'Obj 2'}
            </label>
          ))}
        </div>
      </div>

      {/* ── FX Panel ─────────────────────────────────────────── */}
      <div
        className="rounded-[4px] flex-1 p-2 border flex flex-col relative"
        style={{ backgroundColor: COLORS.panelYellow, borderColor: COLORS.panelYellowDark, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
      >
        {/* Tab row */}
        <div className="flex text-[10px] font-black tracking-tighter justify-between mb-0.5 px-1" style={{ color: 'rgba(0,0,0,0.5)' }}>
          {FX_TABS.map((t) => (
            <span
              key={t}
              onClick={() => setActiveFXTab(t)}
              className={`cursor-pointer select-none hover:text-black transition-colors ${activeFXTab === t ? 'text-black' : ''}`}
            >
              {t}
            </span>
          ))}
        </div>

        {/* On/Off indicators */}
        <div className="flex text-[8.5px] font-bold justify-between mb-2 px-1">
          {FX_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveFXTab(t)}
              className="transition-colors"
              style={{ color: fxOn[t] ? '#dc2626' : 'rgba(0,0,0,0.28)' }}
            >
              {fxOn[t] ? 'ON' : 'OFF'}
            </button>
          ))}
        </div>

        <div
          className="text-center text-[11px] font-black uppercase mb-3 border-b pb-1 mx-2"
          style={{ color: 'rgba(0,0,0,0.65)', borderColor: 'rgba(0,0,0,0.1)' }}
        >
          {activeFXTab === 'DIST' ? 'Distortion'
            : activeFXTab === 'COMP' ? 'Compressor'
            : activeFXTab === 'DLY' ? 'Delay'
            : activeFXTab === 'REV' ? 'Reverb'
            : 'Equalizer'}
        </div>

        {/* DIST */}
        {activeFXTab === 'DIST' && (
          <div className="flex-1 flex items-center justify-between px-2">
            <div className="flex gap-1.5 relative h-[90px]">
              <div
                className="w-[6px] rounded-full h-full relative border"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)', borderColor: 'rgba(0,0,0,0.2)' }}
              >
                <div
                  className="absolute w-[10px] h-[10px] rounded-full left-1/2 -translate-x-1/2 shadow-sm border border-[#222]"
                  style={{ bottom: `calc(${distPercent * 100}% - 5px)`, backgroundColor: '#444' }}
                />
              </div>
              <div className="flex flex-col justify-between text-[8px] font-bold h-full py-[1px] leading-none" style={{ color: 'rgba(0,0,0,0.55)' }}>
                {DIST_TYPE_LIST.map((t) => (
                  <span
                    key={t}
                    className={`cursor-pointer hover:text-black transition-colors ${params.distType === t ? 'text-black font-black' : ''}`}
                    onClick={() => onChange({ target: { name: 'distType', value: t } })}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col justify-between items-center h-full pb-1 gap-3">
              <Knob label="Drive" name="distDrive" value={p.distDrive} onChange={onChange} size={32} />
              <div className="flex gap-3">
                <Knob label="Tone" name="distTone" value={p.distTone ?? 0.5} onChange={onChange} size={24} />
                <Knob label="Amt" name="distAmount" value={p.distAmount} onChange={onChange} size={24} />
              </div>
            </div>
          </div>
        )}

        {/* COMP */}
        {activeFXTab === 'COMP' && (
          <div className="flex-1 flex flex-col gap-3 px-2 justify-center">
            <FXKnobRow items={[
              { label: 'Thresh', name: 'compThresh', value: p.compThresh ?? 0.45, onChange },
              { label: 'Ratio', name: 'compRatio', value: p.compRatio ?? 0.25, onChange },
            ]} />
            <FXKnobRow items={[
              { label: 'Attack', name: 'compAttack', value: p.compAttack ?? 0.15, onChange },
              { label: 'Release', name: 'compRelease', value: p.compRelease ?? 0.5, onChange },
            ]} />
            {/* GR meter stub */}
            <div className="flex items-center gap-1.5 px-1">
              <span className="text-[7.5px] font-black uppercase" style={{ color: 'rgba(0,0,0,0.4)' }}>GR</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <div className="h-full rounded-full transition-all duration-200" style={{ width: `${(p.compRatio ?? 0) * 60}%`, backgroundColor: COLORS.modYellow }} />
              </div>
            </div>
          </div>
        )}

        {/* DELAY */}
        {activeFXTab === 'DLY' && (
          <div className="flex-1 flex flex-col gap-3 px-2 justify-center">
            <FXKnobRow items={[
              { label: 'Time', name: 'dlyTime', value: p.dlyTime ?? 0.25, onChange },
              { label: 'Fdbk', name: 'dlyFeedback', value: p.dlyFeedback ?? 0.3, onChange },
            ]} />
            <FXKnobRow items={[
              { label: 'Mix', name: 'dlyMix', value: p.dlyMix ?? 0, onChange },
            ]} />
            {/* Sync/ping-pong toggles */}
            <div className="flex justify-center gap-2 mt-1">
              {['Sync', 'Ping', 'Free'].map((lbl) => (
                <div
                  key={lbl}
                  className="px-2 py-0.5 rounded-[2px] text-[7.5px] font-black uppercase border cursor-pointer hover:brightness-95 transition-all"
                  style={{ backgroundColor: lbl === 'Free' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.6)' }}
                >
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVERB */}
        {activeFXTab === 'REV' && (
          <div className="flex-1 flex flex-col gap-3 px-2 justify-center">
            <FXKnobRow items={[
              { label: 'Size', name: 'revSize', value: p.revSize ?? 0.5, onChange },
              { label: 'Decay', name: 'revDecay', value: p.revDecay ?? 0.5, onChange },
            ]} />
            <FXKnobRow items={[
              { label: 'Mix', name: 'revMix', value: p.revMix ?? 0, onChange },
            ]} />
            {/* Room type chips */}
            <div className="flex justify-center gap-1.5 mt-1">
              {['Hall', 'Room', 'Plate', 'Spring'].map((lbl) => (
                <div
                  key={lbl}
                  className="px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase border cursor-pointer hover:brightness-95 transition-all"
                  style={{ backgroundColor: 'rgba(0,0,0,0.08)', borderColor: 'rgba(0,0,0,0.15)', color: 'rgba(0,0,0,0.6)' }}
                >
                  {lbl}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EQ */}
        {activeFXTab === 'EQ' && (
          <div className="flex-1 flex flex-col gap-3 px-2 justify-center">
            <FXKnobRow items={[
              { label: 'Low', name: 'eqLow', value: p.eqLow ?? 0.5, onChange, size: 28, bipolar: true },
              { label: 'Mid', name: 'eqMid', value: p.eqMid ?? 0.5, onChange, size: 28, bipolar: true },
              { label: 'High', name: 'eqHigh', value: p.eqHigh ?? 0.5, onChange, size: 28, bipolar: true },
            ]} />
            {/* EQ curve SVG mini-viz */}
            <div className="mx-1 h-8 rounded-[2px] overflow-hidden border" style={{ backgroundColor: 'rgba(0,0,0,0.12)', borderColor: 'rgba(0,0,0,0.15)' }}>
              <svg viewBox="0 0 100 32" className="w-full h-full" preserveAspectRatio="none">
                <line x1="0" y1="16" x2="100" y2="16" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
                <polyline
                  points={[
                    `0,${16 - ((p.eqLow ?? 0.5) - 0.5) * 28}`,
                    `25,${16 - ((p.eqLow ?? 0.5) - 0.5) * 28}`,
                    `50,${16 - ((p.eqMid ?? 0.5) - 0.5) * 28}`,
                    `75,${16 - ((p.eqHigh ?? 0.5) - 0.5) * 28}`,
                    `100,${16 - ((p.eqHigh ?? 0.5) - 0.5) * 28}`,
                  ].join(' ')}
                  fill="none"
                  stroke={COLORS.modYellow}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
