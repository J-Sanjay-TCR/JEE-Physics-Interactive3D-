import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, Mic, Volume2 } from 'lucide-react';

export type TutorFaceReaction =
  | 'idle'
  | 'happy'
  | 'listening'
  | 'thinking'
  | 'answering'
  | 'speaking'
  | 'surprised';

export interface AliveAiTutorAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  reaction?: TutorFaceReaction;
  isListening?: boolean;
  isThinking?: boolean;
  isAnswering?: boolean;
  isSpeaking?: boolean;
  isSurprised?: boolean;
  isHappy?: boolean;
  interactive?: boolean;
  showHalo?: boolean;
  showOrbitRing?: boolean;
  showStatusBadge?: boolean;
  statusText?: string;
  className?: string;
  onClick?: () => void;
}

export const AliveAiTutorAvatar: React.FC<AliveAiTutorAvatarProps> = ({
  size = 'md',
  reaction,
  isListening = false,
  isThinking = false,
  isAnswering = false,
  isSpeaking = false,
  isSurprised = false,
  isHappy,
  interactive = true,
  showHalo = true,
  showOrbitRing = true,
  showStatusBadge = false,
  statusText,
  className = '',
  onClick,
}) => {
  // Determine effective face emotion/reaction
  // Default to 'happy' so the tutor is warm, smiling and inviting!
  const effectiveReaction: TutorFaceReaction = reaction || (
    isSurprised ? 'surprised' :
    isSpeaking ? 'speaking' :
    isAnswering ? 'answering' :
    isThinking ? 'thinking' :
    isListening ? 'listening' :
    isHappy !== false ? 'happy' :
    'idle'
  );

  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [sphereTilt, setSphereTilt] = useState({ rotateX: 0, rotateY: 0, rotateZ: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [clickWink, setClickWink] = useState(false);
  const [speakingFrame, setSpeakingFrame] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastInteractionTimeRef = useRef<number>(Date.now());

  // Speaking mouth / waveform frame cycle
  useEffect(() => {
    if (effectiveReaction !== 'speaking' && effectiveReaction !== 'answering') return;
    const interval = setInterval(() => {
      setSpeakingFrame((prev) => (prev + 1) % 6);
    }, 130);
    return () => clearInterval(interval);
  }, [effectiveReaction]);

  // Natural organic blinking engine with friendly timing
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
      setIsBlinking(true);
      const duration = 140;

      setTimeout(() => {
        setIsBlinking(false);

        // 20% chance of an adorable rapid double-blink
        if (Math.random() < 0.2) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => {
              setIsBlinking(false);
            }, 100);
          }, 150);
        }
      }, duration);

      // Schedule next natural blink between 3.5s and 6.0s
      const nextDelay = 3500 + Math.random() * 2500;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3200);
    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
    };
  }, []);

  // Thinking micro-gaze animation (looking thoughtfully upward)
  useEffect(() => {
    if (effectiveReaction !== 'thinking') return;

    const interval = setInterval(() => {
      const wanderX = Math.sin(Date.now() / 700) * 1.4;
      const wanderY = -1.6 + Math.cos(Date.now() / 900) * 0.4;
      setEyeOffset({ x: wanderX, y: wanderY });
      setSphereTilt({
        rotateX: 3.0,
        rotateY: wanderX * 1.8,
        rotateZ: wanderX * 0.4,
      });
    }, 90);

    return () => clearInterval(interval);
  }, [effectiveReaction]);

  // Smooth, safe, strictly clamped pointer tracking (keeps eyes comfortably centered)
  const handlePointerMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || isHovered || effectiveReaction === 'thinking' || size === 'xs') return;
    lastInteractionTimeRef.current = Date.now();

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < 1 || dist > 500) return;

    // Small, safe offset so the eye NEVER looks displaced or wall-eyed
    const maxOffset = size === 'sm' ? 1.0 : size === 'md' ? 1.5 : size === 'lg' ? 2.0 : 2.5;
    const falloff = Math.min(dist / 300, 1);
    const offsetX = (dx / dist) * maxOffset * falloff;
    const offsetY = (dy / dist) * maxOffset * falloff;

    setEyeOffset({ x: offsetX, y: offsetY });
    setSphereTilt({
      rotateX: -offsetY * 1.2,
      rotateY: offsetX * 1.5,
      rotateZ: (dx / (window.innerWidth || 1000)) * 2,
    });
  }, [isHovered, effectiveReaction, size]);

  useEffect(() => {
    if (size === 'xs') return;
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [handlePointerMove, size]);

  const winkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (winkTimeoutRef.current) clearTimeout(winkTimeoutRef.current);
    };
  }, []);

  // Handle click wink interaction
  const handleClick = () => {
    if (onClick) onClick();
    setClickWink(true);
    if (winkTimeoutRef.current) clearTimeout(winkTimeoutRef.current);
    winkTimeoutRef.current = setTimeout(() => setClickWink(false), 380);
  };

  // Dimensions based on size preset (scaled perfectly to match original Nemo)
  const dimensionConfig = {
    xs: {
      sphere: 'w-6 h-6',
      visor: 'w-4.5 h-3.2 rounded-[8px]',
      eyeBox: 'w-1.6 h-1.6',
      halo: '-inset-1',
      ring: 'inset-[-3px]',
      star: 'w-1 h-1',
      mouthWidth: 'w-2',
      mouthHeight: 'h-1',
    },
    sm: {
      sphere: 'w-11 h-11 sm:w-12 sm:h-12',
      visor: 'w-8 h-5.5 sm:w-9 sm:h-6 rounded-[14px] sm:rounded-[16px]',
      eyeBox: 'w-2.8 h-2.8 sm:w-3.2 sm:h-3.2',
      halo: '-inset-1.5',
      ring: 'inset-[-4px]',
      star: 'w-1.5 h-1.5',
      mouthWidth: 'w-3.5',
      mouthHeight: 'h-1.5',
    },
    md: {
      sphere: 'w-13 h-13 sm:w-15 sm:h-15',
      visor: 'w-10 h-6.8 sm:w-11 sm:h-7.5 rounded-[18px]',
      eyeBox: 'w-3.6 h-3.6 sm:w-4 sm:h-4',
      halo: '-inset-2',
      ring: 'inset-[-5px]',
      star: 'w-2 h-2',
      mouthWidth: 'w-4',
      mouthHeight: 'h-2',
    },
    lg: {
      sphere: 'w-18 h-18 sm:w-20 sm:h-20',
      visor: 'w-13 h-9 sm:w-14 sm:h-10 rounded-[22px]',
      eyeBox: 'w-4.8 h-4.8 sm:w-5.2 sm:h-5.2',
      halo: '-inset-2.5',
      ring: 'inset-[-7px]',
      star: 'w-2.5 h-2.5',
      mouthWidth: 'w-5',
      mouthHeight: 'h-2.5',
    },
    xl: {
      sphere: 'w-24 h-24 sm:w-28 sm:h-28',
      visor: 'w-17 h-12 sm:w-19 sm:h-13.5 rounded-[26px]',
      eyeBox: 'w-6.5 h-6.5 sm:w-7 sm:h-7',
      halo: '-inset-3.5',
      ring: 'inset-[-9px]',
      star: 'w-3 h-3',
      mouthWidth: 'w-6',
      mouthHeight: 'h-3',
    },
  }[size];

  // Dynamic theme colors per state
  const isThinkingState = effectiveReaction === 'thinking';
  const isAnsweringState = effectiveReaction === 'answering' || effectiveReaction === 'speaking';
  const isListeningState = effectiveReaction === 'listening';
  const isSurprisedState = effectiveReaction === 'surprised';
  const isHappyState = effectiveReaction === 'happy' || isHovered;

  const sphereBorderColor = isThinkingState
    ? 'border-purple-400/80 ring-2 ring-purple-400/30'
    : isAnsweringState
    ? 'border-amber-300/90 ring-2 ring-amber-400/40'
    : isListeningState
    ? 'border-emerald-400/80 ring-2 ring-emerald-400/30'
    : 'border-cyan-400/90 ring-2 ring-cyan-400/35';

  const conicGradient = isThinkingState
    ? 'conic-gradient(from 180deg at 50% 50%, #c084fc 0deg, #6366f1 120deg, #ec4899 240deg, #c084fc 360deg)'
    : isAnsweringState
    ? 'conic-gradient(from 180deg at 50% 50%, #fbbf24 0deg, #00f0ff 120deg, #38bdf8 240deg, #fbbf24 360deg)'
    : isListeningState
    ? 'conic-gradient(from 180deg at 50% 50%, #34d399 0deg, #00f0ff 120deg, #10b981 240deg, #34d399 360deg)'
    : 'conic-gradient(from 180deg at 50% 50%, #00f0ff 0deg, #38bdf8 120deg, #818cf8 240deg, #00f0ff 360deg)';

  const rawId = useId();
  const instanceId = rawId.replace(/[:]/g, '');

  // Helper to render Nemo's signature round glimmering neon cyan light eyes with happy look
  const renderNemoRoundEye = (side: 'left' | 'right') => {
    if (isBlinking || (side === 'left' && clickWink)) {
      return (
        <div className="w-full h-full flex items-center justify-center anim-nemo-blink-spring">
          {/* Adorable happy upward-curved neon cyan light smile blink arc ( ◠ ) */}
          <div
            className="w-[88%] h-[44%] rounded-b-full border-b-[2.6px] border-cyan-200 anim-nemo-neon-blink"
            style={{
              filter: 'drop-shadow(0 0 3px #00f0ff)',
            }}
          />
        </div>
      );
    }

    if (isSurprisedState) {
      return (
        <div className="relative w-full h-full rounded-full flex items-center justify-center anim-nemo-cute-float">
          <div
            className="w-full h-full rounded-full border-2 border-cyan-300 relative overflow-hidden anim-nemo-neon-eye"
            style={{
              background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #38bdf8 45%, #00f0ff 70%, #0369a1 100%)',
              boxShadow: '0 0 7px #00f0ff, inset 0 0 5px #ffffff',
            }}
          >
            {/* Spinning Holographic Quantum Ring */}
            <div
              className="absolute inset-[8%] rounded-full border border-dashed border-cyan-200/60 anim-nemo-holo-ring pointer-events-none"
            />
            {/* Primary Diamond Star Catchlight */}
            <div className="absolute top-[16%] left-[20%] w-[26%] h-[26%] rounded-full bg-white shadow-[0_0_3px_#ffffff] anim-nemo-star-gleam pointer-events-none" />
            <div className="absolute bottom-[20%] right-[22%] w-[16%] h-[16%] rounded-full bg-cyan-100 shadow-[0_0_2px_#a5f3fc] anim-nemo-fleck-orbit pointer-events-none" />
          </div>
        </div>
      );
    }

    if (isThinkingState) {
      return (
        <div className="relative w-full h-full rounded-full flex items-center justify-center anim-nemo-cute-float">
          <div
            className="w-full h-full rounded-full border border-purple-300/80 relative overflow-hidden anim-nemo-neon-eye"
            style={{
              background: 'radial-gradient(circle at 45% 40%, #ffffff 0%, #e879f9 30%, #c084fc 60%, #7e22ce 88%, #4a044e 100%)',
              boxShadow: '0 0 7px #c084fc, inset 0 0 5px #ffffff',
            }}
          >
            {/* Holographic Quantum Particle Ring */}
            <div className="absolute inset-[10%] rounded-full border border-dashed border-purple-200/50 anim-nemo-holo-ring pointer-events-none" />
            <div className="absolute top-[16%] left-[20%] w-[26%] h-[26%] rounded-full bg-white shadow-[0_0_3px_#ffffff] anim-nemo-star-gleam pointer-events-none" />
            <div className="absolute bottom-[20%] right-[22%] w-[16%] h-[16%] rounded-full bg-purple-200 anim-nemo-fleck-orbit pointer-events-none" />
            <div className="absolute bottom-[10%] inset-x-[18%] h-[32%] rounded-b-full border-b-[1.6px] border-white/85 anim-nemo-smile-arc pointer-events-none" />
          </div>
        </div>
      );
    }

    // DEFAULT / HAPPY / ANSWERING: Nemo's signature round glimmering neon cyan light eye
    return (
      <div className="relative w-full h-full rounded-full flex items-center justify-center anim-nemo-cute-float">
        {/* The Round Luminous Neon Cyan Light Disc */}
        <div
          className="relative w-full h-full rounded-full border border-cyan-200/90 overflow-hidden anim-nemo-neon-eye"
          style={{
            background: isAnsweringState
              ? 'radial-gradient(circle at 45% 38%, #ffffff 0%, #fef08a 22%, #38bdf8 52%, #0284c7 80%, #034975 100%)'
              : 'radial-gradient(circle at 45% 38%, #ffffff 0%, #a5f3fc 22%, #00f0ff 52%, #0284c7 80%, #034975 100%)',
            boxShadow: isAnsweringState
              ? '0 0 7px #38bdf8, inset 0 0 5px #ffffff'
              : '0 0 7px #00f0ff, inset 0 0 5px #ffffff',
          }}
        >
          {/* Futuristic Holographic Orbit Ring */}
          <div
            className="absolute inset-[9%] rounded-full border border-dotted border-cyan-200/50 anim-nemo-holo-ring pointer-events-none"
          />

          {/* Cheerful Happy Bottom Light Reflection Smile Arc */}
          <div
            className="absolute bottom-[10%] inset-x-[15%] h-[36%] rounded-b-full border-b-[2px] border-white pointer-events-none anim-nemo-smile-arc"
            style={{
              boxShadow: '0 1px 3px rgba(255,255,255,0.9)',
            }}
          />

          {/* Primary Specular Twinkle Gleam (Top-Left Starlet) */}
          <div className="absolute top-[14%] left-[17%] w-[30%] h-[30%] rounded-full bg-white shadow-[0_0_3px_#ffffff] anim-nemo-star-gleam pointer-events-none" />

          {/* Secondary Specular Micro Starlet Fleck */}
          <div className="absolute bottom-[20%] right-[19%] w-[16%] h-[16%] rounded-full bg-cyan-100 shadow-[0_0_2px_#a5f3fc] anim-nemo-fleck-orbit pointer-events-none" />
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setEyeOffset({ x: 0, y: 0 });
        setSphereTilt({ rotateX: 0, rotateY: 0, rotateZ: 0 });
      }}
    >
      {/* Dynamic Ambient Glow Halo */}
      {showHalo && (
        <div
          className={`absolute ${dimensionConfig.halo} rounded-full blur-md pointer-events-none transition-all duration-300 ${
            isThinkingState
              ? 'bg-gradient-to-tr from-purple-500/40 via-indigo-500/30 to-pink-500/30'
              : isAnsweringState
              ? 'bg-gradient-to-tr from-amber-400/40 via-cyan-400/30 to-indigo-500/30'
              : isListeningState
              ? 'bg-gradient-to-tr from-emerald-500/40 via-cyan-400/30 to-teal-500/30'
              : 'bg-gradient-to-tr from-cyan-400/40 via-sky-400/30 to-blue-600/30'
          } ${isHovered ? 'blur-lg scale-110' : ''}`}
        />
      )}

      {/* Gyroscopic Quantum Orbit Ring */}
      {showOrbitRing && size !== 'xs' && (
        <div
          className={`absolute ${dimensionConfig.ring} rounded-full border pointer-events-none anim-ai-ring-spin ${
            isThinkingState ? 'border-purple-400/40' : isListeningState ? 'border-emerald-400/40' : 'border-cyan-400/40'
          }`}
          style={{
            borderWidth: size === 'sm' ? '1px' : '1.5px',
            borderStyle: 'dashed',
            boxShadow: isThinkingState ? '0 0 10px rgba(192,132,252,0.3)' : '0 0 10px rgba(34,211,238,0.3)',
          }}
        />
      )}

      {/* Orbiting Quantum Star Particle */}
      {showOrbitRing && size !== 'xs' && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`${dimensionConfig.star} rounded-full anim-ai-orbit-1 ${
              isThinkingState
                ? 'bg-purple-300 shadow-[0_0_10px_#c084fc]'
                : isAnsweringState
                ? 'bg-amber-300 shadow-[0_0_10px_#f59e0b]'
                : 'bg-cyan-300 shadow-[0_0_10px_#22d3ee]'
            }`}
          />
        </div>
      )}

      {/* 3D Glass Sphere Body Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={!interactive}
        aria-label="Nemo — AI Physics Tutor Companion"
        className={`${dimensionConfig.sphere} anim-ai-orb-float relative rounded-full p-[2px] flex items-center justify-center overflow-hidden transition-all duration-200 shadow-[0_8px_25px_rgba(0,240,255,0.35)] ${sphereBorderColor} ${
          interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
        }`}
        style={{
          background: conicGradient,
          perspective: '600px',
        }}
      >
        {/* Deep Obsidian 3D Glass Sphere Interior */}
        <div
          className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-transform duration-200"
          style={{
            background: isThinkingState
              ? 'radial-gradient(circle at 35% 28%, #271442 0%, #150b28 40%, #080415 75%, #030209 100%)'
              : 'radial-gradient(circle at 35% 28%, #1c355e 0%, #0d1b38 35%, #060b1c 70%, #02040b 100%)',
            boxShadow: isThinkingState
              ? 'inset -3px -4px 10px rgba(192,132,252,0.5), inset 3px 3px 8px rgba(129,140,248,0.5)'
              : 'inset -3px -4px 10px rgba(99,102,241,0.5), inset 3px 3px 8px rgba(34,211,238,0.5)',
            transform: `rotateX(${sphereTilt.rotateX}deg) rotateY(${sphereTilt.rotateY}deg) rotateZ(${sphereTilt.rotateZ}deg)`,
          }}
        >
          {/* Top-Left Glossy Glass Reflection Highlight */}
          <div
            className="absolute top-1 left-1.5 w-1/2 h-1/3 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.85) 0%, rgba(34,211,238,0.4) 45%, transparent 75%)',
              transform: 'rotate(-25deg)',
            }}
          />

          {/* Bottom Inner Iridescent Glow */}
          <div
            className="absolute bottom-0 inset-x-0 h-1/3 pointer-events-none"
            style={{
              background: isThinkingState
                ? 'radial-gradient(ellipse at 50% 100%, rgba(192,132,252,0.45) 0%, transparent 80%)'
                : 'radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.45) 0%, transparent 80%)',
            }}
          />

          {/* Visor Plate for Eyes (Sleek Dark OLED Digital Screen) */}
          <div
            className={`relative ${dimensionConfig.visor} bg-[#030612]/95 border shadow-[inset_0_0_10px_rgba(0,240,255,0.4)] flex flex-col items-center justify-center transition-all duration-150 overflow-hidden px-1 ${
              isThinkingState ? 'border-purple-500/50' : 'border-cyan-400/50'
            }`}
          >
            {/* Scanline texture inside visor */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.8) 2px, rgba(34,211,238,0.8) 3px)',
              }}
            />
            {/* Cute Rosy Blushing Cheeks (Warm, cute, friendly - NOT creepy!) */}
            <div
              className={`absolute bottom-0.5 left-1 sm:left-1.5 w-1.5 sm:w-2 h-0.8 sm:h-1 rounded-full bg-rose-400/60 blur-[0.8px] shadow-[0_0_6px_rgba(251,113,133,0.7)] transition-opacity duration-300 ${
                isHappyState || isAnsweringState ? 'opacity-95' : 'opacity-40'
              }`}
            />
            <div
              className={`absolute bottom-0.5 right-1 sm:right-1.5 w-1.5 sm:w-2 h-0.8 sm:h-1 rounded-full bg-rose-400/60 blur-[0.8px] shadow-[0_0_6px_rgba(251,113,133,0.7)] transition-opacity duration-300 ${
                isHappyState || isAnsweringState ? 'opacity-95' : 'opacity-40'
              }`}
            />

            {/* EYES CONTAINER WITH NEMO'S ROUND GLIMMERING EYES */}
            <div
              className="flex items-center justify-center gap-1.5 sm:gap-2.5 transition-transform duration-100 ease-out z-10"
              style={{
                transform: `translate3d(${eyeOffset.x}px, ${eyeOffset.y}px, 0)`,
              }}
            >
              {/* LEFT EYE */}
              <div className={`${dimensionConfig.eyeBox} rounded-full flex items-center justify-center overflow-visible`}>
                {renderNemoRoundEye('left')}
              </div>

              {/* RIGHT EYE */}
              <div className={`${dimensionConfig.eyeBox} rounded-full flex items-center justify-center overflow-visible`}>
                {renderNemoRoundEye('right')}
              </div>
            </div>

            {/* CUTE SMILING MOUTH IN VISOR (Always visible so the face is never cold/blank!) */}
            <div className="mt-0.5 flex items-center justify-center z-10">
              {isAnsweringState ? (
                /* Animated Cute Talking Smile Curve during answers/speech */
                <svg viewBox="0 0 20 10" className="w-3 sm:w-3.5 h-1 sm:h-1.5 overflow-visible drop-shadow-[0_0_4px_#22d3ee]">
                  <motion.path
                    animate={{
                      d: [
                        'M 3 2 C 6 8, 14 8, 17 2',
                        'M 3 3 C 6 10, 14 10, 17 3',
                        'M 3 2 C 6 8, 14 8, 17 2',
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 0.35, ease: 'easeInOut' }}
                    d="M 3 2 C 6 8, 14 8, 17 2"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : isThinkingState ? (
                /* Thoughtful Little Smile/Dot */
                <div className="w-1.5 h-1 rounded-full bg-purple-300 shadow-[0_0_4px_#c084fc]" />
              ) : isListeningState ? (
                /* Attentive Listening Audio Wavelet */
                <div className="flex items-center gap-0.5">
                  <div className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <div className="w-0.5 h-2 bg-emerald-300 rounded-full animate-pulse delay-75" />
                  <div className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-pulse delay-150" />
                </div>
              ) : isSurprisedState ? (
                /* Surprised 'o' Mouth */
                <div className="w-1.5 h-1.5 rounded-full border border-cyan-300 bg-cyan-900/50 shadow-[0_0_4px_#22d3ee]" />
              ) : (
                /* Cute Warm Upward Smile Curve ( ‿ ) */
                <svg viewBox="0 0 20 10" className="w-3 sm:w-3.5 h-1 sm:h-1.5 overflow-visible drop-shadow-[0_0_4px_#22d3ee]">
                  <path
                    d="M 3 2 C 6 8, 14 8, 17 2"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Side Micro Antennas / Audio Ear Nodes */}
          <div
            className={`absolute -left-0.5 top-1/2 -translate-y-1/2 w-1 h-2 rounded-l-full shadow-[0_0_6px_#22d3ee] ${
              isListeningState ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <div
            className={`absolute -right-0.5 top-1/2 -translate-y-1/2 w-1 h-2 rounded-r-full shadow-[0_0_6px_#22d3ee] ${
              isListeningState ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />

          {/* Bottom Thruster Vent */}
          <div className="absolute bottom-0.5 w-3 h-0.5 rounded-full bg-cyan-400/80 shadow-[0_0_6px_#22d3ee] z-10 flex items-center justify-center">
            <div className="w-1 h-0.5 bg-white rounded-full animate-pulse" />
          </div>
        </div>
      </button>

      {/* Status Pill Badge underneath or above */}
      {showStatusBadge && (
        <div className="mt-1.5 whitespace-nowrap bg-[#0a0e1c]/90 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-cyan-200 shadow-sm flex items-center gap-1">
          {isThinkingState ? (
            <>
              <BrainCircuit className="w-3 h-3 text-purple-400 animate-pulse" />
              <span>Thinking...</span>
            </>
          ) : isListeningState ? (
            <>
              <Mic className="w-3 h-3 text-emerald-400 animate-bounce" />
              <span>Listening...</span>
            </>
          ) : isAnsweringState ? (
            <>
              <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Explaining...</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span>{statusText || 'Nemo Online'}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
