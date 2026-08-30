import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../../context/ThemeContext';

export const CursorEffect: React.FC = () => {
  const { isDark, isCyberpunk } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDeviceSupported, setIsDeviceSupported] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on devices that use a fine pointer (mouse/trackpad), ignoring mobile/touch devices.
    if (window.matchMedia('(pointer: fine)').matches) {
      setIsDeviceSupported(true);
    }

    const updateMousePosition = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if the cursor is hovering over a clickable/interactive element
      const target = e.target as Element | null;
      if (!target || !(target instanceof Element)) {
        setIsHovering(false);
        return;
      }

      let isClickable = false;
      try {
        const computedCursor = window.getComputedStyle(target).cursor;
        isClickable =
          computedCursor === 'pointer' ||
          computedCursor === 'text' ||
          target.tagName.toLowerCase() === 'button' ||
          target.tagName.toLowerCase() === 'a' ||
          target.tagName.toLowerCase() === 'input' ||
          target.tagName.toLowerCase() === 'textarea' ||
          target.closest('button') !== null ||
          target.closest('a') !== null;
      } catch {
        isClickable = false;
      }

      setIsHovering(isClickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // If the device is not a PC / fine pointer device, or if not dark theme, we can disable or tone down
  if (!isDeviceSupported) return null;

  // Adapt colors based on theme
  const getThemeColors = () => {
    if (isCyberpunk) {
      return {
        spotlight: 'bg-cyan-500/10',
        ring: 'border-cyan-400/50',
        ringBgHover: 'rgba(34, 211, 238, 0.15)',
        shadow: 'shadow-[0_0_12px_rgba(34,211,238,0.4)]'
      };
    }
    if (isDark) {
      return {
        spotlight: 'bg-indigo-500/10',
        ring: 'border-indigo-400/50',
        ringBgHover: 'rgba(99, 102, 241, 0.15)',
        shadow: 'shadow-[0_0_10px_rgba(99,102,241,0.3)]'
      };
    }
    // Light mode
    return {
      spotlight: 'bg-cyan-500/5',
      ring: 'border-cyan-500/30',
      ringBgHover: 'rgba(6, 182, 212, 0.1)',
      shadow: 'shadow-none'
    };
  };

  const colors = getThemeColors();

  return (
    <>
      {/* Ambient Large Spotlight Glow */}
      <motion.div
        className={`pointer-events-none fixed top-0 left-0 w-[500px] h-[500px] rounded-full blur-[80px] z-[9997] mix-blend-screen hidden lg:block ${colors.spotlight}`}
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.3 }}
      />

      {/* Interactive Trailing Cursor Ring */}
      <motion.div
        className={`pointer-events-none fixed top-0 left-0 rounded-full z-[9999] flex items-center justify-center mix-blend-screen hidden md:flex border ${colors.ring} ${colors.shadow}`}
        animate={{
          x: mousePosition.x - (isHovering ? 20 : 12),
          y: mousePosition.y - (isHovering ? 20 : 12),
          width: isHovering ? 40 : 24,
          height: isHovering ? 40 : 24,
          backgroundColor: isHovering ? colors.ringBgHover : 'transparent',
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 1.2 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25, mass: 0.5 }}
      />
    </>
  );
};
