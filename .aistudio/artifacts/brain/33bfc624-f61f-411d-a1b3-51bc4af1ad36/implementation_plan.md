# Initial Loading Page Gate & Single-Source 3D Playback Controls

Guarantees the initial physics laboratory loading screen completely blocks app entry until initialization finishes, and removes all legacy/duplicate Play/Pause, Reset, and AR View options from parameter controls and top toolbars so only the new dedicated 3D viewport bottom dock is displayed to the user.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following requirements:
> - **Initial Loading Page**: Completely block app entry until the loading screen finishes (gate app UI so user only sees the calibration sequence before entering).
> - **Playback & AR Options**: Keep only the new 3D viewport bottom dock as the single source for Play/Pause, Reset, and AR View, removing all pre-existing duplicate instances.

- **Confirmed Decision 1**: Gate main app render tree in `src/App.tsx` behind `!isInitialLoading`.
- **Confirmed Decision 2**: Remove the legacy Play/Pause, Reset, and AR View buttons from `ParameterControls.tsx` and the top toolbar of `ThreePhysicsCanvas.tsx`.

---

### 1. Overview & Core Concept

- **What It Does**:
  1. **Strict Initial Loading Gate**: Prevents any premature UI flash or background app interaction by rendering solely the `GlobalPhysicsLoader` until the calibration sequence reaches 100% and signals completion.
  2. **Deduplication of Controls**: Eliminates duplicate Play/Pause, Reset, and AR buttons across the app (in `ParameterControls.tsx` header and `ThreePhysicsCanvas.tsx` top-right toolbar), ensuring the newly created dedicated 3D viewport bottom dock is the sole, intuitive place to control simulation playback and AR mode.
- **Target Audience / Persona**: JEE physics students and instructors exploring interactive 3D simulations without cluttered or redundant controls.
- **Key Value**: A polished cinematic startup experience followed by a clean, conflict-free interface where each tool has a single, obvious location.

---

### 2. User Experience & Visual Design

- **App Startup Flow**:
  1. On page load, the user sees exclusively the full-screen **Quantum Physics Laboratory Loading Screen** with holographic particle accelerators, live frequency sweeps, and initialization progress bar.
  2. Upon reaching 100%, the loader fades out with a smooth motion transition into the full 3D interactive laboratory.
- **3D Stage Controls**:
  - The dedicated bottom dock inside the 3D viewport remains the exclusive control center:
    - `[▶ Play / ⏸ Pause]` (Amber/Cyan active state)
    - `[↺ Reset]` (Clock t = 0s)
    - `[🥽 AR View]` (Camera live feed overlay)
    - `[0.5x | 1x | 2x]` (Speed multipliers)
    - `[⛶ Center Camera]`
  - Parameter controls panel is streamlined to focus purely on physical variable sliders (e.g. angle, velocity, mass, friction) and real-time readouts, eliminating redundant button clutter.
  - The top toolbar of the 3D canvas is clean and uncluttered, showing only viewport display toggles (Vectors, Path, Grid, Axes, Focus Mode, Theme, Fullscreen).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Screen Conditional Render for Initial Load**
  - *Chosen Approach*: In `src/App.tsx`, if `isInitialLoading` is true, render exclusively `<GlobalPhysicsLoader />`. The main app layout (`Header`, 3D viewport, parameter panels) only mounts after completion.
  - *Why*: Guarantees zero flash of uncalibrated 3D content and ensures 3D assets and shaders load cleanly before user interaction begins.
- **Decision 2: Remove Legacy Controls from ParameterControls**
  - *Chosen Approach*: Remove the entire top button row (`onTogglePlay`, `onReset`, `onToggleAR`) from `ParameterControls.tsx`. Keep the speed controls and live physical indicators if needed, or unify speed in the canvas dock.
  - *Why*: Directly satisfies the user's requirement: "Remove the pre-existing AR mode options, reset option, and pause and play option such that the newly created options only should be displayed to the user."

---

### 4. Technical Architecture & File Changes

```
Startup:
  isInitialLoading === true  ──>  <GlobalPhysicsLoader onComplete={handleLoaderComplete} />
                                             │ (100% complete)
                                             ▼
  isInitialLoading === false ──>  <AppLayout>
                                    ├── <Header />
                                    ├── <ThreePhysicsCanvas>
                                    │     ├── [Top-Center Live FPS Bar]
                                    │     └── [New Dedicated Bottom Dock: Play/Pause, Reset, AR]
                                    └── <ParameterControls> (Pure physics sliders & readouts)
```

- **Files Targeted**:
  1. `src/App.tsx`: Conditionally gate app contents so only `GlobalPhysicsLoader` renders during initial load.
  2. `src/components/ui/ParameterControls.tsx`: Remove the legacy Play/Pause, Reset, and AR view buttons from the header.
  3. `src/components/canvas/ThreePhysicsCanvas.tsx`: Remove the legacy AR View button from the top-right toolbar, preserving the new bottom dock.
