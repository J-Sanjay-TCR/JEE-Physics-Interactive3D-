/**
 * Screen & Projector Detection Engine
 * Continuously evaluates viewport width, height, aspect ratio, and hardware display profile.
 * Automatically adapts the 3D physics laboratory, layout columns, canvas height, and camera FOV
 * to projector types (4:3 XGA, 16:10 WUXGA, 16:9 FHD/4K, 21:9 Ultrawide, Tablets, and Mobiles).
 */

export type ScreenProfileType =
  | 'projector-4-3'
  | 'projector-16-10'
  | 'widescreen-16-9'
  | 'ultrawide'
  | 'tablet-portrait'
  | 'mobile-portrait'
  | 'mobile-landscape';

export interface ScreenMetrics {
  width: number;
  height: number;
  aspect: number;
  profile: ScreenProfileType;
  profileLabel: string;
  badgeText: string;
  isProjector43: boolean;
  isProjector1610: boolean;
  isAnyProjector: boolean;
  isWidescreen: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isCompactHeight: boolean;
}

export function detectScreenMetrics(
  w = typeof window !== 'undefined' ? window.innerWidth : 1280,
  h = typeof window !== 'undefined' ? Math.max(1, window.innerHeight) : 720
): ScreenMetrics {
  const aspect = Number((w / Math.max(1, h)).toFixed(3));
  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;
  const isCompactHeight = h < 680;

  let profile: ScreenProfileType;
  let profileLabel: string;
  let badgeText: string;

  if (aspect >= 1.15 && aspect <= 1.48) {
    profile = 'projector-4-3';
    profileLabel = '4:3 Projector (XGA / 1024×768)';
    badgeText = 'Auto: 4:3';
  } else if (aspect > 1.48 && aspect <= 1.68) {
    profile = 'projector-16-10';
    profileLabel = '16:10 Projector / Display (1280×800 / WUXGA)';
    badgeText = 'Auto: 16:10';
  } else if (aspect > 1.68 && aspect <= 2.05) {
    profile = 'widescreen-16-9';
    profileLabel = '16:9 Widescreen (1080p / 1440p / 4K)';
    badgeText = 'Auto: 16:9';
  } else if (aspect > 2.05) {
    profile = 'ultrawide';
    profileLabel = '21:9 Ultrawide Cinema';
    badgeText = 'Auto: 21:9';
  } else if (h < 500 && w >= 500) {
    profile = 'mobile-landscape';
    profileLabel = 'Landscape Mobile';
    badgeText = 'Auto: Handheld';
  } else if (w < 600) {
    profile = 'mobile-portrait';
    profileLabel = 'Mobile Portrait';
    badgeText = 'Auto: Mobile';
  } else {
    profile = 'tablet-portrait';
    profileLabel = 'Tablet Portrait';
    badgeText = 'Auto: Tablet';
  }

  const isProjector43 = profile === 'projector-4-3';
  const isProjector1610 = profile === 'projector-16-10';
  const isAnyProjector = isProjector43 || isProjector1610;
  const isWidescreen = profile === 'widescreen-16-9' || profile === 'ultrawide';

  return {
    width: w,
    height: h,
    aspect,
    profile,
    profileLabel,
    badgeText,
    isProjector43,
    isProjector1610,
    isAnyProjector,
    isWidescreen,
    isMobile,
    isTablet,
    isCompactHeight,
  };
}

/**
 * Calculates adaptive camera vertical Field of View (FOV) in degrees
 * Ensures wide trajectories (projectile motion, celestial orbits, SHM springs)
 * are NEVER truncated or cut off horizontally on 4:3 projector screens or vertical displays.
 */
export function calculateAdaptiveFov(aspectRatio: number, baseFov = 45): number {
  const BASE_ASPECT = 16 / 9; // 1.7777...
  if (aspectRatio >= BASE_ASPECT) {
    return baseFov;
  }
  // Preserve horizontal FOV: 2 * atan( tan(baseFov/2) * (16/9) / currentAspect )
  const hHalfTan = Math.tan((baseFov * Math.PI) / 360) * BASE_ASPECT;
  const vFovRad = 2 * Math.atan(hHalfTan / Math.max(0.4, aspectRatio));
  const vFovDeg = (vFovRad * 180) / Math.PI;
  // Clamp between baseFov and 75° to prevent extreme fisheye
  return Math.min(75, Math.max(baseFov, vFovDeg));
}
