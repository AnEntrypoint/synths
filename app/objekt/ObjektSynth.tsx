'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, Power, PlaySquare } from 'lucide-react';
import Knob from './Knob';
import ExciterPanel from './ExciterPanel';
import CenterPanel from './CenterPanel';
import MixerFXPanel from './MixerFXPanel';
import BottomRackPanel from './BottomRackPanel';
import PianoKeyboard from './PianoKeyboard';
import { COLORS, PRESETS, DEFAULT_PARAMS, type CenterTab, type FXTab } from './constants';
import { useAudio, type AudioParams } from './useAudio';

const SYNTH_WIDTH = 1100;

type LFOTab = 'LFO 1' | 'LFO 2' | 'Curve' | 'Macro';

export default function ObjektSynth() {
  // Use consistent initial values for SSR/client hydration
  const [uiScale, setUiScale] = useState(1);
  const [vw, setVw] = useState(SYNTH_WIDTH); // Always start with SYNTH_WIDTH for consistent hydration
  const [mounted, setMounted] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeFXTab, setActiveFXTab] = useState<FXTab>('DIST');
  const [centerTab, setCenterTab] = useState<CenterTab>('modal');
  const [lfoTab, setLfoTab] = useState<LFOTab>('Curve');
  const [currentPreset, setCurrentPreset] = useState('Glass Wave');
  const [activeNoteFreq, setActiveNoteFreq] = useState<number | null>(null);
  const [params, setParams] = useState<Record<string, number | string>>(DEFAULT_PARAMS);

  const {
    engineStarted,
    micState,
    inputLevel,
    initAudio,
    triggerNote,
    applyTuning,
    requestMic,
    releaseMic,
    currentPitchRef,
  } = useAudio();

  // Mark mounted to enable client-only rendering for scale calculations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute scale from the real rendered content height so nothing overflows.
  // We temporarily render at scale=1, measure scrollHeight, then scale to fit.
  useEffect(() => {
    if (!mounted) return;
    
    const compute = () => {
      const el = contentRef.current;
      if (!el) return;
      // Reset to natural size to get true dimensions
      el.style.transform = 'scale(1)';
      const naturalH = el.scrollHeight;
      const naturalW = SYNTH_WIDTH;
      const scaleW = window.innerWidth  / naturalW;
      const scaleH = window.innerHeight / naturalH;
      const scale = Math.min(scaleW, scaleH, 1);
      setUiScale(scale);
      setVw(window.innerWidth);
    };
    // Run after paint so children have laid out
    const raf = requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
    };
  }, [mounted]);

  // Sync DSP on param changes
  useEffect(() => {
    if (engineStarted) {
      applyTuning(currentPitchRef.current, params as AudioParams);
    }
  }, [params, engineStarted, applyTuning, currentPitchRef]);

  const handleChange = useCallback((e: { target: { name: string; value: number | string } }) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: typeof value === 'string' ? (parseFloat(value) || value) : value,
    }));
  }, []);

  const loadPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setCurrentPreset(name);
    setParams((prev) => ({ ...prev, ...PRESETS[name] }));
  };

  const handleRandomize = () => {
    const updates: Record<string, number> = {};
    for (let i = 0; i < 8; i++) {
      const prefix = centerTab === 'modal' ? 'modal' : centerTab;
      updates[`${prefix}Freq${i}`] = parseFloat((Math.random() * 4 + 0.5).toFixed(2));
      updates[centerTab === 'modal' ? `modal${i}` : `${prefix}_${i}`] = parseFloat(Math.random().toFixed(2));
    }
    setParams((prev) => ({ ...prev, ...updates }));
  };

  const handleNoteOn = useCallback((freq: number) => {
    setActiveNoteFreq(freq);
    const audioParams = params as AudioParams;
    if (!engineStarted) {
      initAudio(audioParams).then(() => {
        triggerNote(freq, audioParams);
      });
    } else {
      triggerNote(freq, audioParams);
    }
  }, [engineStarted, initAudio, triggerNote, params]);

  const handleNoteOff = useCallback(() => {
    setActiveNoteFreq(null);
  }, []);

  const handleRequestMic = useCallback(async () => {
    const audioParams = params as AudioParams;
    if (!engineStarted) {
      await initAudio(audioParams);
    }
    await requestMic(audioParams);
  }, [engineStarted, initAudio, requestMic, params]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ backgroundColor: '#0a0a0a', touchAction: 'none' }}
    >
      {/* Single scaler div — origin top-left, nudged to center via left offset */}
      <div
        ref={contentRef}
        className="flex flex-col items-center absolute"
        style={{
          width: `${SYNTH_WIDTH}px`,
          transformOrigin: 'top left',
          transform: `scale(${uiScale})`,
          left: `${Math.max(0, (vw - SYNTH_WIDTH * uiScale) / 2)}px`,
          top: `0px`,
        }}
      >
          {/* MAIN CHASSIS */}
          <div
            className="w-full rounded-xl flex flex-col shrink-0"
            style={{
              backgroundColor: COLORS.chassis,
              boxShadow: '0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(0,0,0,0.8)',
            }}
          >
            {/* TOP HEADER */}
            <div
              className="h-[60px] border-b flex items-center justify-between px-5 relative z-20 shrink-0"
              style={{ borderColor: '#a3a3a3', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
            >
              <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                      <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="#444" />
                      <polygon points="50,5 95,25 50,50" fill="#666" />
                      <polygon points="95,25 95,75 50,50" fill="#555" />
                      <polygon points="95,75 50,95 50,50" fill="#333" />
                      <polygon points="50,95 5,75 50,50" fill="#222" />
                      <polygon points="5,75 5,25 50,50" fill="#555" />
                      <polygon points="5,25 50,5 50,50" fill="#777" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[26px] font-black text-[#555] tracking-tighter leading-none">Objekt</span>
                    <div className="flex flex-col mt-1">
                      <span className="text-[7px] font-black text-[#888] uppercase tracking-[0.2em] leading-tight">Modeling</span>
                      <span className="text-[7px] font-black text-[#888] uppercase tracking-[0.2em] leading-tight">Synthesizer</span>
                    </div>
                  </div>
                </div>

                {/* EQ strip */}
                <div className="flex items-center gap-2 pl-5 ml-1 border-l border-[#c0c0c0] h-full py-1">
                  <span className="text-[9px] font-black text-[#777] rotate-[-90deg] uppercase -ml-3 mr-1 tracking-widest">EQ</span>
                  <Knob label="Freq" value={0.5} size={22} labelPosition="top" />
                  <Knob label="Reso" value={0.3} size={22} labelPosition="top" />
                  <Knob label="Gain" value={0.6} size={22} labelPosition="top" />
                  <div className="w-8 h-[1.5px] bg-[#888] relative ml-1 opacity-60">
                    <div className="absolute right-0 -top-[3px] w-2 h-2 rounded-full border-[1.5px] border-[#888]" style={{ backgroundColor: COLORS.chassis }} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Preset selector */}
                <div
                  className="relative px-3 py-1.5 rounded-[3px] text-xs font-bold border flex items-center justify-between w-[220px] cursor-pointer hover:brightness-110 transition-all z-50"
                  style={{ backgroundColor: 'black', color: COLORS.modYellow, borderColor: '#333', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)' }}
                >
                  <select
                    value={currentPreset}
                    onChange={loadPreset}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"
                  >
                    {Object.keys(PRESETS).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none truncate z-0">{currentPreset}</span>
                  <div
                    className="w-4 h-4 flex items-center justify-center rounded pointer-events-none shrink-0 z-0"
                    style={{ backgroundColor: '#333' }}
                  >
                    <ChevronDown size={11} className="text-[#888]" />
                  </div>
                </div>

                {/* View toggles */}
                <div className="flex gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-[#222] shadow-inner flex items-center justify-center cursor-pointer hover:bg-[#444] transition-colors"
                    style={{ backgroundColor: '#333' }}
                    title="Grid view"
                  >
                    <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: COLORS.chassis }} />
                  </div>
                  <div
                    className="w-6 h-6 rounded border border-[#222] shadow-inner flex flex-col justify-center gap-0.5 px-[5px] cursor-pointer hover:bg-[#444] transition-colors"
                    style={{ backgroundColor: '#333' }}
                    title="List view"
                  >
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-full h-[1.5px]" style={{ backgroundColor: COLORS.chassis }} />
                    ))}
                  </div>
                </div>

                {/* Tuner */}
                <div
                  className="flex items-center gap-1 p-1 rounded border shadow-inner ml-2"
                  style={{ backgroundColor: '#b0b0b0', borderColor: '#999' }}
                >
                  <div className="text-[7.5px] font-black uppercase text-[#555] px-0.5 transform -rotate-90 leading-none">Tuner</div>
                  {['Analyze', '--', 'Fix'].map((lbl) => (
                    <div
                      key={lbl}
                      className="px-2.5 py-1 rounded-[2px] text-[9px] font-bold shadow-inner cursor-pointer hover:brightness-110 transition-all"
                      style={{ backgroundColor: 'black', color: COLORS.modYellow }}
                    >
                      {lbl}
                    </div>
                  ))}
                </div>

                {/* Power + Master Volume */}
                <div className="border-l border-[#c0c0c0] pl-4 ml-1 flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full mb-1 transition-all duration-500 ${engineStarted ? 'shadow-[0_0_6px_#22c55e]' : 'shadow-none'}`}
                      style={{ backgroundColor: engineStarted ? '#22c55e' : '#7f1d1d' }}
                    />
                    <button
                      onClick={() => {
                        if (!engineStarted) initAudio(params as AudioParams);
                      }}
                      className={`w-10 h-6 rounded-[2px] border transition-all duration-200 active:scale-95 ${
                        engineStarted ? 'border-[#444]' : 'border-white active:bg-[#ccc]'
                      }`}
                      style={{ backgroundColor: engineStarted ? '#555' : COLORS.chassis, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                      title={engineStarted ? 'Engine running' : 'Click to start engine'}
                      aria-label="Power button"
                    >
                      <Power size={13} className={`mx-auto ${engineStarted ? 'text-green-400' : 'text-[#666]'}`} />
                    </button>
                  </div>
                  <div className="flex flex-col items-center">
                    <Knob
                      value={typeof params.masterVolume === 'number' ? params.masterVolume : 0.8}
                      name="masterVolume"
                      onChange={handleChange}
                      size={30}
                    />
                    <span className="text-[7.5px] font-bold text-[#666] mt-1">Volume</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className="w-7 h-7 flex items-center justify-center rounded border border-[#c0c0c0] cursor-pointer hover:bg-[#d0d0d0] transition-colors"
                      style={{ backgroundColor: COLORS.chassis }}
                      title="Play / Trigger"
                    >
                      <PlaySquare size={14} className="text-[#666]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION */}
            <div className="flex flex-1 border-b-4 border-[#2c2e30]">
              <ExciterPanel
                params={params}
                onChange={handleChange}
                micState={micState}
                inputLevel={inputLevel}
                onRequestMic={handleRequestMic}
                onReleaseMic={releaseMic}
              />
              <CenterPanel
                params={params}
                onChange={handleChange}
                centerTab={centerTab}
                setCenterTab={setCenterTab}
              />
              <MixerFXPanel
                params={params}
                onChange={handleChange}
                activeFXTab={activeFXTab}
                setActiveFXTab={setActiveFXTab}
                centerTab={centerTab}
                setCenterTab={setCenterTab}
                onRandomize={handleRandomize}
              />
            </div>

            {/* BOTTOM RACK */}
            <BottomRackPanel lfoTab={lfoTab} setLfoTab={setLfoTab} params={params} onChange={handleChange} />
          </div>

          {/* PIANO KEYBOARD */}
          <PianoKeyboard
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            activeFreq={activeNoteFreq}
          />

          {/* Engine hint */}
          {!engineStarted && (
            <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#444] text-center select-none shrink-0">
              Press a key or click the keyboard to start the audio engine
            </div>
          )}
      </div>
    </div>
  );
}
