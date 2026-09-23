/**
 * Utility for capturing the live 3D WebGL physics canvas into a clean base64 image URL
 * for multimodal Gemini vision inspection in the AI Physics Tutor.
 */
export function captureLive3dScreen(): string | null {
  try {
    const canvas = (document.getElementById('three-physics-webgl-canvas') ||
      document.querySelector('canvas')) as HTMLCanvasElement | null;
    if (!canvas) return null;
    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (err) {
    console.warn('[Canvas Capture] Could not capture canvas buffer:', err);
    return null;
  }
}
