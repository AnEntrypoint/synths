'use client';

import { ChevronDown, Mic, MicOff, Radio, AlertTriangle } from 'lucide-react';
import Knob from './Knob';
import { COLORS } from './constants';
import type { MicState } from './useAudio';

interface ExciterPanelProps {
  params: Record<string, number | string>;
  onChange: (e: { target: { name: string; value: number | string } }) => void;
  micState: MicState;
  inputLevel: number;
  onRequestMic: () => void;
  onReleaseMic: () => void;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      className="text-[10px] font-black uppercase tracking-widest text-center mb-2 border-b pb-1"
      style={{ color: 'rgba(0,0,0,0.5)', borderColor: 'rgba(0,0,0,0.12)' }}
    >
      {title}
    </div>
  );
}

function RoutingLine({ reverse = false }: { reverse?: boolean }) {
  return (
    <div className="col-span-2 flex items-center justify-center pb-[18px]">
      <div className="w-full h-[1.5px] relative" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}>
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${reverse ? 'left-0' : 'right-0'}`}
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        />
      </div>
    </div>
  );
}

// VU meter bar — 12 segments, colour-coded green/amber/red
function VUMeter({ level, active }: { level: number; active: boolean }) {
  const SEGMENTS = 12;
  return (
    <div className="flex flex-col-reverse gap-[1.5px] items-center">
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const threshold = i / SEGMENTS;
        const lit = active && level > threshold;
        let color = '#22c55e'; // green
        if (i >= 9) color = '#ef4444'; // red
        else if (i >= 7) color = '#f59e0b'; // amber
        return (
          <div
            key={i}
            className="w-[5px] rounded-[1px] transition-all duration-75"
            style={{
              height: 4,
              backgroundColor: lit ? color : 'rgba(0,0,0,0.25)',
              boxShadow: lit ? `0 0 3px ${color}` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

export default function ExciterPanel({
  params,
  onChange,
  micState,
  inputLevel,
  onRequestMic,
  onReleaseMic,
}: ExciterPanelProps) {
  const p = params as Record<string, number>;

  const micIsActive = micState === 'active';
  const micIsBusy = micState === 'requesting';

  const micStatusColor =
    micState === 'active' ? '#22c55e'
    : micState === 'denied' ? '#ef4444'
    : micState === 'error' ? '#f59e0b'
    : 'rgba(0,0,0,0.35)';

  const micStatusLabel =
    micState === 'idle' ? 'Off'
    : micState === 'requesting' ? '...'
    : micState === 'active' ? 'Live'
    : micState === 'denied' ? 'Denied'
    : 'Error';

  return (
    <div
      className="w-[260px] shrink-0 border-r border-[#c0c0c0] p-3 flex flex-col gap-3 relative shadow-[2px_0_5px_rgba(0,0,0,0.05)] z-10"
      style={{ backgroundColor: COLORS.panelYellow }}
    >
      {/* ── Impact Section ─────────────────────────────── */}
      <div
        className="rounded-[4px] p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] border"
        style={{ backgroundColor: COLORS.panelYellowMid, borderColor: '#b88c29' }}
      >
        <SectionHeader title="Exciter · Impact" />
        <div className="grid grid-cols-4 gap-y-3 gap-x-1 items-end">
          <Knob label="Level" name="impactLevel" value={p.impactLevel} onChange={onChange} size={30} />
          <RoutingLine />
          <Knob label="Vel" name="impactVel" value={p.impactVel} onChange={onChange} size={30} />

          <Knob label="Freq" name="impactFreq" value={p.impactFreq} onChange={onChange} size={30} />
          <Knob label="Click" name="impactClick" value={p.impactClick} onChange={onChange} size={30} />
          <Knob label="Shape" name="impactShape" value={p.impactShape} onChange={onChange} size={30} />
          {/* Diffuse toggle - smears impact into scratchy plectrum-like texture */}
          <div className="flex flex-col items-center justify-center pb-2">
            <button
              onClick={() => onChange({ target: { name: 'diffuse', value: p.diffuse ? 0 : 1 } })}
              className="w-3.5 h-3.5 rounded-full border border-black/60 mb-1 cursor-pointer active:scale-95 transition-all"
              style={{
                backgroundColor: p.diffuse ? '#22c55e' : '#444',
                boxShadow: p.diffuse
                  ? '0 0 8px rgba(34,197,94,0.8), inset 0 1px 2px rgba(255,255,255,0.3)'
                  : 'inset 0 1px 3px rgba(0,0,0,0.5)',
              }}
              title="Diffuse: smears impact into scratchy texture (like plectrum on wound string)"
            />
            <span className="text-[7.5px] font-bold uppercase" style={{ color: p.diffuse ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)' }}>Diffuse</span>
          </div>

          <Knob label="Hardness" name="impactHardness" value={p.impactHardness} onChange={onChange} size={30} />
          <RoutingLine reverse />
          <Knob label="Time" name="impactTime" value={p.impactTime} onChange={onChange} size={30} />
        </div>
      </div>

      {/* ── Noise Section ────────────────────────────────── */}
      <div
        className="rounded-[4px] p-2 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] border"
        style={{ backgroundColor: COLORS.panelYellowMid, borderColor: '#b88c29' }}
      >
        <SectionHeader title="Exciter · Noise" />
        <div className="grid grid-cols-4 gap-y-3 gap-x-1 items-end">
          <Knob label="Level" name="noiseLevel" value={p.noiseLevel} onChange={onChange} size={30} />
          <RoutingLine />
          <Knob label="Rate" name="noiseRate" value={p.noiseRate} onChange={onChange} size={30} />

          <div
            className="col-span-4 rounded-[2px] border py-1 text-center text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer hover:brightness-95 my-1 shadow-inner"
            style={{ backgroundColor: 'rgba(0,0,0,0.18)', borderColor: 'rgba(0,0,0,0.18)', color: 'rgba(0,0,0,0.75)' }}
          >
            <ChevronDown size={13} /> LP Noise
          </div>

          <Knob label="Delay" name="noiseDelay" value={p.noiseDelay} onChange={onChange} size={26} />
          <Knob label="A" name="noiseA" value={p.noiseA} onChange={onChange} size={26} />
          <Knob label="D" name="noiseD" value={p.noiseD} onChange={onChange} size={26} />
          <Knob label="S" name="noiseS" value={p.noiseS} onChange={onChange} size={26} />
          <div className="col-start-4">
            <Knob label="R" name="noiseR" value={p.noiseR} onChange={onChange} size={26} />
          </div>
        </div>
      </div>

      {/* ── External / Microphone Input ───────────────────── */}
      <div
        className="rounded-[4px] border flex flex-col overflow-hidden"
        style={{ backgroundColor: COLORS.panelYellowMid, borderColor: '#b88c29', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' }}
      >
        {/* Header row */}
        <div
          className="flex items-center justify-between px-2.5 py-1.5 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.12)', backgroundColor: 'rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center gap-1.5">
            {/* Status LED */}
            <div
              className="w-2 h-2 rounded-full border border-black/40 transition-all duration-300"
              style={{
                backgroundColor: micStatusColor,
                boxShadow: micIsActive ? `0 0 6px ${micStatusColor}` : 'none',
              }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(0,0,0,0.6)' }}>
              Ext · Input
            </span>
            {/* State badge */}
            <span
              className="text-[8px] font-black uppercase tracking-wider px-1 py-0.5 rounded-[2px]"
              style={{
                backgroundColor: micIsActive ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.12)',
                color: micStatusColor,
              }}
            >
              {micStatusLabel}
            </span>
          </div>

          {/* Mic toggle button */}
          <button
            onClick={micIsActive ? onReleaseMic : onRequestMic}
            disabled={micIsBusy}
            className="flex items-center gap-1 px-2 py-1 rounded-[3px] border text-[9px] font-black uppercase tracking-wide transition-all active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: micIsActive ? '#dc2626' : '#1a1b1c',
              borderColor: micIsActive ? '#991b1b' : '#3a3a3a',
              color: micIsActive ? 'white' : COLORS.modYellow,
              boxShadow: micIsActive ? '0 0 8px rgba(220,38,38,0.4)' : '0 1px 3px rgba(0,0,0,0.5)',
            }}
            title={micIsActive ? 'Stop microphone input' : 'Enable microphone input'}
          >
            {micIsActive ? <MicOff size={10} /> : <Mic size={10} />}
            {micIsBusy ? 'Wait' : micIsActive ? 'Stop' : 'Enable'}
          </button>
        </div>

        {/* Denied / Error notice */}
        {(micState === 'denied' || micState === 'error') && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.1)', backgroundColor: 'rgba(220,38,38,0.12)' }}
          >
            <AlertTriangle size={10} className="shrink-0" style={{ color: '#ef4444' }} />
            <span className="text-[8.5px] font-bold leading-tight" style={{ color: 'rgba(0,0,0,0.65)' }}>
              {micState === 'denied' ? 'Microphone permission denied. Check browser settings.' : 'Could not access microphone.'}
            </span>
          </div>
        )}

        {/* VU + Controls */}
        <div className="flex gap-2 px-2.5 py-2.5 items-start">
          {/* VU meter column */}
          <div className="flex flex-col items-center gap-1 pt-0.5">
            <VUMeter level={inputLevel} active={micIsActive} />
            <span className="text-[7px] font-black uppercase tracking-wider" style={{ color: 'rgba(0,0,0,0.4)' }}>
              {micIsActive ? `${Math.round(inputLevel * 100)}%` : 'IN'}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />

          {/* Gain + Excite column */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex gap-3 items-end">
              <Knob
                label="Gain"
                name="extGain"
                value={p.extGain ?? 0.6}
                onChange={onChange}
                size={28}
              />
              <Knob
                label="Excite"
                name="extInputMix"
                value={p.extInputMix ?? 0}
                onChange={onChange}
                size={28}
              />
            </div>

            {/* Gate + HPF row */}
            <div className="flex gap-3 items-end">
              <Knob
                label="Gate"
                name="extGate"
                value={p.extGate ?? 0.3}
                onChange={onChange}
                size={24}
              />
              <Knob
                label="HPF"
                name="extHPF"
                value={p.extHPF ?? 0.1}
                onChange={onChange}
                size={24}
              />
            </div>

            {/* Signal flow diagram */}
            <div className="flex flex-col gap-0.5 mt-1">
              {/* Flow chips */}
              <div className="flex items-center gap-1 flex-wrap">
                {/* Source chip */}
                <div
                  className="px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-wide border flex items-center gap-0.5"
                  style={{
                    backgroundColor: micIsActive ? 'rgba(34,197,94,0.18)' : 'rgba(0,0,0,0.12)',
                    borderColor: micIsActive ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.15)',
                    color: micIsActive ? '#14532d' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  <Radio size={7} />
                  Mic
                </div>
                <span className="text-[8px]" style={{ color: 'rgba(0,0,0,0.3)' }}>→</span>
                {/* Env follower chip */}
                <div
                  className="px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-wide border"
                  style={{
                    backgroundColor: micIsActive ? 'rgba(220,166,40,0.18)' : 'rgba(0,0,0,0.12)',
                    borderColor: micIsActive ? 'rgba(220,166,40,0.4)' : 'rgba(0,0,0,0.15)',
                    color: micIsActive ? '#78350f' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  Env
                </div>
                <span className="text-[8px]" style={{ color: 'rgba(0,0,0,0.3)' }}>→</span>
                {/* Resonators chip */}
                <div
                  className="px-1.5 py-0.5 rounded-[2px] text-[7px] font-black uppercase tracking-wide border"
                  style={{
                    backgroundColor: micIsActive ? 'rgba(34,197,94,0.18)' : 'rgba(0,0,0,0.12)',
                    borderColor: micIsActive ? 'rgba(34,197,94,0.4)' : 'rgba(0,0,0,0.15)',
                    color: micIsActive ? '#14532d' : 'rgba(0,0,0,0.4)',
                  }}
                >
                  Res.
                </div>
              </div>
              {/* No pass-through label */}
              <div
                className="text-[7px] font-black uppercase tracking-wide"
                style={{ color: 'rgba(0,0,0,0.35)' }}
              >
                No direct output · Exciter only
              </div>
            </div>
          </div>
        </div>

        {/* Signal processing info bar */}
        {micIsActive && (
          <div
            className="px-2.5 py-1.5 border-t flex items-center justify-between"
            style={{ borderColor: 'rgba(0,0,0,0.1)' }}
          >
            <div className="flex gap-2">
              {[
                { label: 'EC', value: 'OFF', ok: true },
                { label: 'AGC', value: 'OFF', ok: true },
                { label: 'NS', value: 'OFF', ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center gap-0.5">
                  <span className="text-[7px] font-black uppercase" style={{ color: 'rgba(0,0,0,0.35)' }}>{label}</span>
                  <span
                    className="text-[7px] font-black uppercase px-1 rounded-[2px]"
                    style={{
                      backgroundColor: ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color: ok ? '#166534' : '#991b1b',
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-[7px] font-black uppercase tracking-wide" style={{ color: 'rgba(0,0,0,0.3)' }}>
              HPF ×2 · Pre+6dB
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
