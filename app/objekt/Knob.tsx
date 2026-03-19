'use client';

import { useState } from 'react';
import { COLORS } from './constants';

interface KnobProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (e: { target: { name: string; value: number } }) => void;
  name?: string;
  size?: number;
  color?: string;
  labelPosition?: 'bottom' | 'top';
  bipolar?: boolean;
}

export default function Knob({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  name = '',
  size = 32,
  color = 'white',
  labelPosition = 'bottom',
  bipolar = false,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startVal, setStartVal] = useState(value);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartVal(value);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaY = startY - e.clientY;
    const range = max - min;
    const newVal = Math.max(min, Math.min(max, startVal + deltaY * 0.005 * range));
    if (onChange) {
      onChange({ target: { name, value: step ? Math.round(newVal / step) * step : newVal } });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleDoubleClick = () => {
    if (onChange) {
      onChange({ target: { name, value: bipolar ? (min + max) / 2 : (max - min) * 0.5 + min } });
    }
  };

  const percent = (value - min) / (max - min);
  const angle = -135 + percent * 270;
  const centerPercent = bipolar ? 0.5 : 0;
  const startAngle = -135 + centerPercent * 270;

  return (
    <div
      className={`flex items-center justify-center gap-[2px] min-w-[${size}px] shrink-0 ${
        labelPosition === 'top' ? 'flex-col-reverse' : 'flex-col'
      }`}
    >
      <div
        className="relative rounded-full cursor-ns-resize touch-none shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)] flex-shrink-0 select-none"
        style={{
          width: size,
          height: size,
          backgroundColor: COLORS.knobDark,
          border: `1px solid ${COLORS.knobOutline}`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value * 100) / 100}
        aria-label={label}
        tabIndex={0}
      >
        {/* Arc track */}
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
          style={{ width: size, height: size }}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1.5}
            strokeDasharray={`${2.4 * (size / 2 - 2)} ${2 * Math.PI * (size / 2 - 2)}`}
            strokeDashoffset={-0.5 * (size / 2 - 2)}
            strokeLinecap="round"
            transform={`rotate(-45 ${size / 2} ${size / 2})`}
          />
        </svg>
        {/* Indicator line */}
        <div
          className="absolute top-0 left-1/2 origin-bottom rounded-full pointer-events-none"
          style={{
            width: 2,
            height: '46%',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: `50% 100%`,
            backgroundColor: color,
            marginTop: 1,
          }}
        />
        {/* Inner cap */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: '18%',
            left: '18%',
            width: '64%',
            height: '64%',
            background: 'radial-gradient(circle at 35% 35%, #3a3a3a, #0f0f0f)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
          }}
        />
      </div>
      {label && (
        <span
          className="text-[8.5px] font-bold tracking-tighter leading-none text-center whitespace-nowrap select-none"
          style={{ color: labelPosition === 'top' ? '#999' : '#555' }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
