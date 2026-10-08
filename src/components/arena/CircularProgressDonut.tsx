import React from 'react';
import { motion } from 'motion/react';

interface CircularProgressDonutProps {
  solved: number;
  attempted: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const CircularProgressDonut: React.FC<CircularProgressDonutProps> = ({
  solved,
  attempted,
  total,
  size = 150,
  strokeWidth = 13,
  className = '',
}) => {
  const incorrect = Math.max(0, attempted - solved);
  const accuracy = attempted > 0 ? Math.round((solved / attempted) * 100) : 0;

  // Geometry calculations
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;

  // Ratios for total questions
  const totalBase = Math.max(total, attempted, 1);
  const solvedRatio = solved / totalBase;
  const incorrectRatio = incorrect / totalBase;

  const solvedDash = solvedRatio * circumference;
  const incorrectDash = incorrectRatio * circumference;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 drop-shadow-[0_0_12px_rgba(0,240,255,0.15)]"
      >
        {/* Background Inactive Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Incorrect Attempts Segment (Amber Glow) */}
        {incorrect > 0 && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            strokeDasharray={`${incorrectDash + solvedDash} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${incorrectDash + solvedDash} ${circumference}` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            opacity={0.85}
          />
        )}

        {/* Solved Segment (Emerald Glow) */}
        {solved > 0 && (
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeDasharray={`${solvedDash} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${solvedDash} ${circumference}` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.5))',
            }}
          />
        )}
      </svg>

      {/* Center Metric Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <motion.span
          key={accuracy}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-2xl font-black font-mono tracking-tight text-white leading-none tabular-nums"
        >
          {accuracy}%
        </motion.span>
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400 mt-1">
          Accuracy
        </span>
        <span className="text-[10px] font-mono text-zinc-400 mt-0.5 tabular-nums">
          <strong className="text-emerald-400">{solved}</strong> / {attempted} Solved
        </span>
      </div>
    </div>
  );
};
