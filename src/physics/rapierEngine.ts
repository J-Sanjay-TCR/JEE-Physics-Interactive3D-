import RAPIER from '@dimforge/rapier3d-compat';

let rapierInitialized = false;
let initPromise: Promise<void> | null = null;

export async function initRapier(): Promise<typeof RAPIER> {
  if (rapierInitialized) return RAPIER;
  if (!initPromise) {
    initPromise = RAPIER.init().then(() => {
      rapierInitialized = true;
    });
  }
  await initPromise;
  return RAPIER;
}

export function isRapierReady(): boolean {
  return rapierInitialized;
}
