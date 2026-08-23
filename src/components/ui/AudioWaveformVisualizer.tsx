import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Zap } from 'lucide-react';

interface AudioWaveformVisualizerProps {
  isPlaying: boolean;
  isStreaming?: boolean;
  voiceName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onTogglePlay?: () => void;
  className?: string;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isPlaying,
  isStreaming = false,
  voiceName = 'Ursa',
  size = 'md',
  showLabel = true,
  onTogglePlay,
  className = '',
}) => {
  // 7 frequency bars with individual heights and animation delays
  const bars = [
    { minHeight: 4, maxHeight: 22, duration: 0.45, delay: 0.05 },
    { minHeight: 6, maxHeight: 28, duration: 0.35, delay: 0.15 },
    { minHeight: 8, maxHeight: 34, duration: 0.55, delay: 0.25 },
    { minHeight: 10, maxHeight: 38, duration: 0.4, delay: 0.1 },
    { minHeight: 8, maxHeight: 32, duration: 0.5, delay: 0.3 },
    { minHeight: 6, maxHeight: 26, duration: 0.38, delay: 0.18 },
    { minHeight: 4, maxHeight: 18, duration: 0.48, delay: 0.08 },
  ];

  const barWidth = size === 'sm' ? 'w-1' : size === 'lg' ? 'w-1.5' : 'w-1';
  const containerHeight = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-9' : 'h-7';

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
        isPlaying || isStreaming
          ? 'bg-gradient-to-r from-cyan-950/60 via-indigo-950/50 to-purple-950/60 border-cyan-500/50 shadow-md shadow-cyan-500/20'
          : 'bg-[#0E101A] border-white/[0.08] text-zinc-400'
      } ${className}`}
    >
      {/* Speaker / Sparkle Status Icon */}
      <div className="relative flex items-center justify-center">
        {isPlaying ? (
          <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4 text-zinc-500" />
        )}
        {isPlaying && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        )}
      </div>

      {/* Animated CSS Audio Waveform Bars */}
      <div className={`flex items-center gap-1 ${containerHeight} px-1`}>
        {bars.map((bar, idx) => (
          <motion.div
            key={idx}
            className={`${barWidth} rounded-full ${
              isPlaying
                ? 'bg-gradient-to-t from-cyan-500 via-teal-400 to-indigo-400 shadow-xs shadow-cyan-400/40'
                : 'bg-zinc-700/60'
            }`}
            animate={
              isPlaying
                ? {
                    height: [
                      `${bar.minHeight}px`,
                      `${bar.maxHeight}px`,
                      `${bar.minHeight + 4}px`,
                      `${bar.maxHeight * 0.8}px`,
                      `${bar.minHeight}px`,
                    ],
                  }
                : {
                    height: `${bar.minHeight}px`,
                  }
            }
            transition={
              isPlaying
                ? {
                    duration: bar.duration,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: bar.delay,
                  }
                : {
                    duration: 0.25,
                  }
            }
          />
        ))}
      </div>

      {/* Synchronized Status Label */}
      {showLabel && (
        <div className="flex flex-col text-left pl-1 border-l border-white/[0.1] leading-tight">
          <span
            className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
              isPlaying
                ? 'text-cyan-300'
                : isStreaming
                ? 'text-amber-300'
                : 'text-zinc-400'
            }`}
          >
            {isPlaying ? (
              <>
                <Zap className="w-2.5 h-2.5 text-cyan-400 animate-spin" />
                <span>Voice Active</span>
              </>
            ) : isStreaming ? (
              <>
                <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                <span>Streaming Audio</span>
              </>
            ) : (
              <span>Voice Ready</span>
            )}
          </span>
          <span className="text-[9px] text-zinc-400 font-mono">
            {voiceName} &bull; {isPlaying ? 'Speaking...' : 'Standby'}
          </span>
        </div>
      )}
    </div>
  );
};
