'use client';

import { COLORS } from './constants';

interface VSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  height?: number | string;
  type?: 'lcd' | 'mixer';
}

export default function VSlider({
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  name,
  height = 70,
  type = 'lcd',
}: VSliderProps) {
  const percent = (value - min) / (max - min);

  return (
    <div
      className="relative flex justify-center w-4 group shrink-0"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        name={name}
        value={value}
        onChange={onChange}
        className="absolute opacity-0 cursor-ns-resize -rotate-90 origin-center z-20"
        style={{
          width: typeof height === 'number' ? height : 70,
          height: '100%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
        }}
        aria-label={name}
      />
      {/* Track */}
      <div
        className={`absolute bottom-0 w-2.5 h-full rounded-full border shadow-inner pointer-events-none ${
          type === 'lcd'
            ? 'border-[#364528]'
            : 'bg-black/10 border-black/20'
        }`}
        style={type === 'lcd' ? { backgroundColor: `${COLORS.lcdDark}50` } : {}}
      >
        {type === 'lcd' && (
          <div
            className="absolute bottom-0 w-full rounded-full"
            style={{
              height: `${percent * 100}%`,
              backgroundColor: `${COLORS.lcdBright}50`,
            }}
          />
        )}
      </div>
      {/* Thumb */}
      <div
        className={`absolute w-3.5 h-[10px] rounded-[2px] shadow-[0_2px_3px_rgba(0,0,0,0.5)] border pointer-events-none z-10 -ml-[0.5px] ${
          type === 'lcd'
            ? 'border-[#b1e457]'
            : 'bg-[#777] border-[#444]'
        }`}
        style={{
          bottom: `calc(${percent * 100}% - 5px)`,
          backgroundColor: type === 'lcd' ? COLORS.lcdBright : undefined,
        }}
      >
        <div className="w-full h-[1px] bg-white/30 absolute top-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
