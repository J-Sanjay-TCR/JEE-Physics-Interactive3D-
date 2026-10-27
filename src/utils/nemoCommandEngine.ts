import { PhysicsConcept } from '../types';
import { getConceptDerivation, ConceptDerivationData } from '../data/conceptDerivations';

export type NemoActionType =
  | 'navigate_tab'
  | 'navigate_derivation'
  | 'navigate_section'
  | 'navigate_view'
  | 'open_modal'
  | 'switch_concept'
  | 'control_simulation'
  | 'set_parameter'
  | 'reason_app_feature';

export type LabTabKey = 'controls' | 'coaching' | 'graphs' | 'equations' | 'jee' | 'questions';

export type ModalType =
  | 'formula_hub'
  | 'pdf_modal'
  | 'syllabus_directory'
  | 'analytics'
  | 'shortcuts'
  | 'tutorial';

export type SimControlAction =
  | 'play'
  | 'pause'
  | 'toggle_play'
  | 'reset'
  | 'speed_up'
  | 'slow_down'
  | 'toggle_vectors'
  | 'toggle_grid'
  | 'toggle_trajectory'
  | 'toggle_focus';

export interface ExecutedNemoAction {
  id: string;
  type: NemoActionType;
  title: string;
  description: string;
  target?: string;
  badge?: string;
  timestamp: number;
}

export interface NemoCommandResult {
  isCommand: boolean;
  actionType?: NemoActionType;
  targetTab?: LabTabKey;
  targetSectionId?: string;
  targetModal?: ModalType;
  targetView?: 'home' | 'lab' | 'arena';
  targetConcept?: PhysicsConcept;
  controlAction?: SimControlAction;
  paramChange?: { key: string; value: number };
  actionLabel: string;
  spokenConfirmation: string;
  reasoningText: string;
  confidence: number;
  derivationData?: ConceptDerivationData;
}

export interface NemoCommandContext {
  currentConcept: PhysicsConcept;
  currentParams: Record<string, number>;
  allConcepts: PhysicsConcept[];
  currentView: 'home' | 'lab' | 'arena';
  activeTab?: string;
  isPlaying?: boolean;
  showVectors?: boolean;
  showGrid?: boolean;
  showTrajectory?: boolean;
  isFocusMode?: boolean;
  speed?: number;
  userName?: string;
}

/**
 * Normalizes input speech or text for resilient intent matching.
 */
function cleanQuery(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches all concepts for the best match against a user's voice/text query.
 */
export function findMatchingConcept(query: string, allConcepts: PhysicsConcept[]): PhysicsConcept | null {
  const cleaned = cleanQuery(query);

  // Exact or near-exact ID / title / topic match
  for (const concept of allConcepts) {
    const titleClean = cleanQuery(concept.title);
    const idClean = concept.id.replace(/-/g, ' ');
    const topicClean = concept.topic ? cleanQuery(concept.topic) : '';
    if (cleaned.includes(titleClean) || (titleClean.length > 5 && cleaned.includes(titleClean.slice(0, 15)))) {
      return concept;
    }
    if (cleaned.includes(idClean) || idClean.includes(cleaned)) {
      return concept;
    }
    if (topicClean && (cleaned.includes(topicClean) || topicClean.includes(cleaned))) {
      return concept;
    }
  }

  // Key phrase mappings
  const phraseMap: Record<string, string> = {
    'wave optics': 'wave-optics-polarization',
    'ray optics': 'ray-optics-lens-prism',
    'optics': 'ray-optics-lens-prism',
    'projectile': 'projectile-motion',
    'trajectory': 'projectile-motion',
    'cannon': 'projectile-motion',
    'inclined': 'inclined-plane-friction',
    'friction': 'inclined-plane-friction',
    'ramp': 'inclined-plane-friction',
    'shm': 'shm-spring-pendulum',
    'harmonic': 'shm-spring-pendulum',
    'spring': 'shm-spring-pendulum',
    'pendulum': 'shm-spring-pendulum',
    'electric field': 'electric-field-charges',
    'dipole': 'electric-field-charges',
    'charges': 'electric-field-charges',
    'electrostatic': 'electric-field-charges',
    'lcr': 'lcr-circuit',
    'ac circuit': 'lcr-circuit',
    'resonance': 'lcr-circuit',
    'phasor': 'lcr-circuit',
    'ydse': 'youngs-double-slit',
    'double slit': 'youngs-double-slit',
    'interference': 'youngs-double-slit',
    'fringe': 'youngs-double-slit',
    'vernier': 'vernier-caliper',
    'caliper': 'vernier-caliper',
    'screw gauge': 'screw-gauge',
    'micrometer': 'screw-gauge',
    'bohr': 'bohr-atom-spectrum',
    'hydrogen atom': 'bohr-atom-spectrum',
    'spectral': 'bohr-atom-spectrum',
    'vector': 'vector-operations',
    'cross product': 'vector-operations',
    'dot product': 'vector-operations',
    'kepler': 'gravitational-orbit',
    'orbit': 'gravitational-orbit',
    'gravity': 'gravitational-orbit',
    'lorentz': 'lorentz-force-cyclotron',
    'cyclotron': 'lorentz-force-cyclotron',
    'helical': 'lorentz-force-cyclotron',
    'lens': 'ray-optics-lens-prism',
    'prism': 'ray-optics-lens-prism',
    'refraction': 'ray-optics-lens-prism',
    'circular motion': 'circular-motion',
    'banking': 'circular-motion',
    'centripetal': 'circular-motion',
    'rolling': 'pure-rolling-motion',
    'moment of inertia': 'pure-rolling-motion',
    'faraday': 'electromagnetic-induction',
    'induction': 'electromagnetic-induction',
    'lenz': 'electromagnetic-induction',
    'photoelectric': 'photoelectric-effect',
    'stopping potential': 'photoelectric-effect',
    'work function': 'photoelectric-effect',
    'carnot': 'thermo-pv-cycle',
    'thermo': 'thermo-pv-cycle',
    'heat engine': 'thermo-pv-cycle',
    'doppler': 'doppler-effect',
    'biot savart': 'biot-savart-ampere',
    'ampere': 'biot-savart-ampere',
    'gauss': 'gauss-law-flux',
    'flux': 'gauss-law-flux',
    'bernoulli': 'bernoulli-fluid-flow',
    'torricelli': 'bernoulli-fluid-flow',
    'polarization': 'wave-optics-polarization',
    'brewster': 'wave-optics-polarization',
    'standing wave': 'standing-waves-acoustics',
    'organ pipe': 'standing-waves-acoustics',
    'radioactivity': 'radioactivity-nuclear-decay',
    'nuclear': 'radioactivity-nuclear-decay',
    'stefan': 'heat-transfer-radiation',
    'blackbody': 'heat-transfer-radiation',
    'collision': 'work-energy-collisions',
    'atwood': 'newton-laws-pulley',
    'pulley': 'newton-laws-pulley',
    'river boat': 'relative-motion-kinematics',
    'rain man': 'relative-motion-kinematics',
    'stokes': 'elasticity-viscosity-stokes',
    'viscosity': 'elasticity-viscosity-stokes',
    'center of mass': 'center-of-mass-ragdoll',
  };

  for (const [key, conceptId] of Object.entries(phraseMap)) {
    if (cleaned.includes(key)) {
      const found = allConcepts.find((c) => c.id === conceptId);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Intelligent Nemo Voice & Text Command Detector & Reasoner.
 * Resolves natural language user queries to app navigation, control, or reasoning actions.
 */
export function detectNemoCommand(
  rawQuery: string,
  context: NemoCommandContext
): NemoCommandResult {
  const query = cleanQuery(rawQuery);
  const userGreeting = context.userName ? `${context.userName}` : 'there';

  // ==========================================
  // 1. DERIVATIONS (Highest Priority Request)
  // ==========================================
  const isDerivationIntent =
    /\b(?:derive|derivation|derivations|proof|prove|step by step calculus|mathematical breakdown|lens maker derivation|fringe width derivation|equations tab)\b/i.test(
      rawQuery
    );

  if (isDerivationIntent) {
    // Check if the user asked to derive a specific concept
    const matchedConcept = findMatchingConcept(rawQuery, context.allConcepts);
    const targetConcept = matchedConcept || context.currentConcept;
    const derivationData = getConceptDerivation(targetConcept.id);

    return {
      isCommand: true,
      actionType: 'navigate_derivation',
      targetTab: 'equations',
      targetSectionId: 'section-equations',
      targetConcept: matchedConcept || undefined,
      derivationData,
      actionLabel: `Calculus Derivation: ${targetConcept.title}`,
      spokenConfirmation: `Navigating to derivations for ${targetConcept.title}! Here is the complete step-by-step calculus proof starting from ${derivationData.coreLaw}.`,
      reasoningText: `### 📐 Navigated to Calculus Derivations: ${targetConcept.title}\n\nI have activated the step-by-step derivation for **${targetConcept.title}**! You can view each integration step below, and I have synchronized the laboratory's Equations & Derivations panel.\n\n**Governing Law:** ${derivationData.coreLaw}\n\n${derivationData.steps.map((s) => `**Step ${s.stepNumber} (${s.title}):**\n$$${s.latex}$$\n*${s.explanation}*`).join('\n\n')}\n\n**Final Result Formulation:**\n$$${derivationData.finalResultLatex}$$\n\n> **Pro-Tip for JEE:** ${derivationData.jeeInsight}`,
      confidence: 0.98,
    };
  }

  // ==========================================
  // 2. SIMULATION CONTROLS (Play, Pause, Reset, Vectors, etc.)
  // ==========================================
  if (/\b(?:play|start simulation|resume simulation|run simulation|unpause)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'play',
      actionLabel: 'Simulation: Started Playback',
      spokenConfirmation: `Starting the 3D physics simulation run for ${context.currentConcept.title}! Watching physical state update in real-time.`,
      reasoningText: `### ▶️ Simulation Playback Started\n\nI've initiated the live physics simulation for **${context.currentConcept.title}**. The apparatus is computing trajectories, dynamic force vectors, and Cartesian states at 60 FPS.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:pause|stop simulation|freeze simulation|halt simulation)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'pause',
      actionLabel: 'Simulation: Paused',
      spokenConfirmation: `Simulation paused! You can inspect instantaneous vectors and coordinates right now.`,
      reasoningText: `### ⏸️ Simulation Paused\n\nI've frozen the 3D simulation at its current instantaneous state. You can orbit around the 3D canvas, observe vector orientations, and examine parameter values.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:reset|restart simulation|start over|clear trajectory)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'reset',
      actionLabel: 'Simulation: Reset to t = 0',
      spokenConfirmation: `Resetting simulation to initial state at time t = 0.`,
      reasoningText: `### 🔄 Simulation Reset\n\nApparatus parameters and trajectory paths have been reset to time $t = 0$. Ready for your next experimental test run!`,
      confidence: 0.95,
    };
  }

  if (/\b(?:vector|vectors|show vectors|hide vectors|toggle vectors)\b/i.test(rawQuery) && /\b(?:toggle|show|hide|turn on|turn off|enable|disable)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'toggle_vectors',
      actionLabel: '3D Vector Field Visualization Toggled',
      spokenConfirmation: `Toggled 3D force and velocity vectors in the viewport.`,
      reasoningText: `### ↗️ Vector Visualization Toggled\n\nDynamic force, velocity, and field vectors have been toggled on the 3D canvas so you can visualize instantaneous directions.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:grid|spatial grid|toggle grid|show grid|hide grid)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'toggle_grid',
      actionLabel: '3D Spatial Grid Toggled',
      spokenConfirmation: `Toggled the 3D spatial coordinate grid.`,
      reasoningText: `### 🔲 Spatial Grid Toggled\n\nThe 3D spatial coordinate grid has been toggled in the viewport to aid dimensional estimation.`,
      confidence: 0.92,
    };
  }

  if (/\b(?:trajectory|path|trail|toggle trajectory|show trajectory|hide trajectory)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'toggle_trajectory',
      actionLabel: 'Kinematic Trajectory Path Toggled',
      spokenConfirmation: `Toggled kinematic trajectory tracing.`,
      reasoningText: `### ➰ Trajectory Tracing Toggled\n\nThe kinematic trajectory path ribbon has been toggled to trace particle history across space.`,
      confidence: 0.92,
    };
  }

  if (/\b(?:focus mode|full screen|fullscreen|immersive mode|exit focus)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'toggle_focus',
      actionLabel: 'Full-Screen 3D Focus Mode Toggled',
      spokenConfirmation: `Toggling full-screen 3D focus mode for maximum apparatus presence.`,
      reasoningText: `### 🔲 Focus Mode Toggled\n\nSwitched the 3D canvas into dedicated high-presence Focus Mode with floating HUD controls!`,
      confidence: 0.94,
    };
  }

  if (/\b(?:faster|speed up|increase speed|double speed)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'speed_up',
      actionLabel: 'Simulation Speed Increased',
      spokenConfirmation: `Increasing simulation playback speed.`,
      reasoningText: `### ⚡ Simulation Speed Increased\n\nPlayback time step scaled up for faster visual observation of cycles and orbits.`,
      confidence: 0.9,
    };
  }

  if (/\b(?:slower|slow down|decrease speed|half speed)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'control_simulation',
      controlAction: 'slow_down',
      actionLabel: 'Simulation Speed Decreased',
      spokenConfirmation: `Slowing down simulation playback for precise micro-inspection.`,
      reasoningText: `### ⏳ Simulation Speed Decreased\n\nPlayback slowed down into smooth slow-motion mode to observe boundary collisions and subtle phase transitions.`,
      confidence: 0.9,
    };
  }

  // ==========================================
  // 3. LAB FUNCTIONAL PANELS & TABS NAVIGATION
  // ==========================================
  if (/\b(?:controls|parameter|parameters|sliders|presets|adjust mass|change angle|hud controls|tweak parameters)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_tab',
      targetTab: 'controls',
      targetSectionId: 'section-controls',
      actionLabel: 'Navigated to Parameters & HUD Controls',
      spokenConfirmation: `Navigating to Parameters & Controls HUD! You can adjust mass, velocities, angles, and physical presets.`,
      reasoningText: `### 🎛️ Parameters & Controls HUD Active\n\nI have switched your active view to the **Parameters & Controls** panel (and scrolled to the section).\n\n- You can tweak live physical constants using the high-precision sliders.\n- Rapidly test institute special cases using the one-click presets.\n- Watch values update the 3D simulation canvas instantaneously.`,
      confidence: 0.94,
    };
  }

  if (/\b(?:coaching|coaching module|coaching notes|theory notes|pedagogy|teacher notes|revision notes)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_tab',
      targetTab: 'coaching',
      targetSectionId: 'section-coaching',
      actionLabel: 'Navigated to Coaching Module Notes',
      spokenConfirmation: `Opening the Coaching Module! Showing conceptual memory maps, derivations, and JEE shortcuts.`,
      reasoningText: `### 🎓 Coaching Module Panel Active\n\nI have navigated to the **Coaching Module** for **${context.currentConcept.title}**.\n\n- In-depth classroom pedagogy curated from premier JEE preparation material.\n- Core conceptual breakdown with common misconceptions addressed.\n- Direct connection to active 3D parameter configurations.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:graph|graphs|analytical graphs|plot|plots|curves|phase space|live graph)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_tab',
      targetTab: 'graphs',
      targetSectionId: 'section-graphs',
      actionLabel: 'Navigated to Analytical Graphs Panel',
      spokenConfirmation: `Navigating to Analytical Graphs! Watching parameter curves, trajectories, and phase relationships plot in real time.`,
      reasoningText: `### 📈 Analytical Graphs Panel Active\n\nI have navigated to the **Real-Time Graphs** panel.\n\n- Live plotting of dynamic quantities (Position $x(t)$, Velocity $v(t)$, Potential & Kinetic Energy $E(t)$).\n- Interactive crosshair inspectors and high-resolution Cartesian grids.`,
      confidence: 0.94,
    };
  }

  if (/\b(?:equations|equation|formulas|formula explorer|symbolic|calculators|rate of change)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_tab',
      targetTab: 'equations',
      targetSectionId: 'section-equations',
      actionLabel: 'Navigated to Equation & Formula Explorer',
      spokenConfirmation: `Opening Equations & Formula Explorer! Interactive mathematical formulations and real-time numerical calculators are loaded.`,
      reasoningText: `### 🧮 Equations & Formula Explorer Active\n\nI have navigated to the **Equations** panel for **${context.currentConcept.title}**.\n\n- Full symbolic KaTeX mathematical models.\n- Live dynamic calculators showing numerical values computed from current apparatus parameters.`,
      confidence: 0.94,
    };
  }

  if (/\b(?:jee strategy|traps|exam traps|jee traps|shortcuts|pitfalls|negative marking|marks distribution|jee insights)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_tab',
      targetTab: 'jee',
      targetSectionId: 'section-jee',
      actionLabel: 'Navigated to JEE Main & Advanced Strategy',
      spokenConfirmation: `Opening JEE Strategy & Traps! Reviewing negative marking pitfalls and 30-second shortcut tricks.`,
      reasoningText: `### 🏆 JEE Strategy & Exam Traps Panel Active\n\nI have navigated to the **JEE Main & Advanced Strategy** panel for **${context.currentConcept.title}**.\n\n- **High-Yield Shortcuts:** 30-second tricks to bypass lengthy algebraic integration.\n- **Common Exam Traps:** Subtle framing errors that trip up aspirants.\n- **Weightage Frequency:** Historic presence in JEE Main and JEE Advanced shifts.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:practice|questions|exam practice|practice arena|pyq|past papers|solve problems|question bank)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_tab',
      targetTab: 'questions',
      targetSectionId: 'section-questions',
      actionLabel: 'Navigated to Practice Questions Arena',
      spokenConfirmation: `Taking you to the Exam Practice Arena! Test your understanding against authentic JEE questions with instant feedback.`,
      reasoningText: `### 📝 Exam Practice Arena Active\n\nI have navigated to the **Practice Questions Arena**.\n\n- Master authentic JEE past year problems and conceptual challenges.\n- Access step-by-step calculus derivations, hints, and exam trap alerts for every question.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:3d canvas|3d apparatus|viewport|inspect apparatus|simulation stage|look at apparatus)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_section',
      targetSectionId: 'section-3d',
      actionLabel: 'Scrolled to 3D Simulation Viewport',
      spokenConfirmation: `Scrolling up to the 3D Simulation Viewport! Feel free to click and drag to orbit 360 degrees.`,
      reasoningText: `### 🔭 3D Simulation Viewport Centered\n\nI have focused your viewport on the primary **3D Physics Canvas**.\n\n- Left-click & drag: Orbit around apparatus.\n- Right-click & drag: Pan camera.\n- Scroll wheel: Zoom in/out.\n- Tap **Inspect Screen** anytime to have me examine the visual scene!`,
      confidence: 0.94,
    };
  }

  if (/\b(?:roadmap|sibling labs|other labs in this chapter|chapter labs|chapter topics)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_section',
      targetSectionId: 'section-chapter-roadmap',
      actionLabel: 'Scrolled to Chapter Roadmap & Sibling Labs',
      spokenConfirmation: `Scrolling down to the Chapter Roadmap to explore sibling 3D physics labs!`,
      reasoningText: `### 🗺️ Chapter Roadmap Focused\n\nI have navigated to the **Chapter Roadmap & Sibling Labs** section at the bottom of the lab studio. You can seamlessly switch between all 3D simulations in this unit.`,
      confidence: 0.93,
    };
  }

  // ==========================================
  // 4. GLOBAL MODALS & DIRECTORIES
  // ==========================================
  if (/\b(?:formula hub|formula directory|law directory|all formulas|formula bank|laws of physics)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'open_modal',
      targetModal: 'formula_hub',
      actionLabel: 'Opened Global Formula & Law Hub Directory',
      spokenConfirmation: `Opening the Global Formula and Law Hub Directory! Browsing complete physics laws and definitions.`,
      reasoningText: `### 📖 Global Formula & Law Hub Directory Opened\n\nI have opened the **Formula & Law Hub** modal.\n\n- Comprehensive directory covering Mechanics, Electromagnetism, Optics, Thermodynamics, and Modern Physics.\n- Filterable by JEE & CBSE relevance with instant KaTeX math equations.`,
      confidence: 0.96,
    };
  }

  if (/\b(?:pdf|formula sheet|formula sheets|download formula|download pdf|cheat sheet|revision sheet|export pdf)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'open_modal',
      targetModal: 'pdf_modal',
      actionLabel: 'Opened Downloadable PDF Formula Sheets Modal',
      spokenConfirmation: `Opening the Downloadable PDF Formula Sheets modal! You can export publication-grade chapter revision sheets.`,
      reasoningText: `### 📥 PDF Formula Sheets Modal Opened\n\nI have opened the **Downloadable Chapter Formula PDFs** modal.\n\n- High-resolution, vector-crisp cheat sheets for all 23 chapters.\n- Includes derivations, boundary conditions, and exam trap alerts ready for offline study!`,
      confidence: 0.96,
    };
  }

  if (/\b(?:syllabus|syllabus directory|cbse syllabus|jee syllabus|cbse 12 syllabus|all chapters|228 subtopics|subtopics directory)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'open_modal',
      targetModal: 'syllabus_directory',
      actionLabel: 'Opened Complete JEE & CBSE Syllabus Directory',
      spokenConfirmation: `Opening the Complete JEE and CBSE Syllabus Directory! Exploring all 23 chapters and 228 subtopics with board derivations.`,
      reasoningText: `### 📚 Complete JEE & CBSE Syllabus Directory Opened\n\nI have opened the **Syllabus Directory** modal.\n\n- All **23 chapters** and **228 official subtopics**.\n- Dedicated tabs for **CBSE Class 12 Boards** (with 70-mark theory distribution) and **JEE Main & Advanced**.\n- Direct links to launch the corresponding 3D interactive laboratories for any subtopic!`,
      confidence: 0.97,
    };
  }

  if (/\b(?:weightage|analytics|chapter weightage|marks distribution|question frequency|jee weightage)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'open_modal',
      targetModal: 'analytics',
      actionLabel: 'Opened JEE Weightage & Analytics Modal',
      spokenConfirmation: `Opening JEE Weightage Analytics! Analyzing historic chapter frequencies and scoring trends.`,
      reasoningText: `### 📊 JEE Weightage & Analytics Modal Opened\n\nI have opened the **JEE Weightage Analytics** modal.\n\n- Interactive charts showing question counts across recent JEE Main and Advanced exam shifts.\n- High-yield chapters identified to maximize your percentile efficiency.`,
      confidence: 0.95,
    };
  }

  if (/\b(?:shortcuts|keyboard shortcuts|hotkeys|keys cheat sheet)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'open_modal',
      targetModal: 'shortcuts',
      actionLabel: 'Opened Keyboard Shortcuts Cheat Sheet',
      spokenConfirmation: `Opening Keyboard Shortcuts cheat sheet! Quick keys to navigate the lab effortlessly.`,
      reasoningText: `### ⌨️ Keyboard Shortcuts Opened\n\nUse hotkeys like \`Space\` (play/pause), \`R\` (reset), \`V\` (toggle vectors), \`F\` (focus mode), and \`/\` (open search) for instant control.`,
      confidence: 0.94,
    };
  }

  if (/\b(?:tutorial|tour|walkthrough|guide me|how to use|lab tutorial)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'open_modal',
      targetModal: 'tutorial',
      actionLabel: 'Launched Interactive Lab Tutorial',
      spokenConfirmation: `Launching the Interactive 3D Lab Walkthrough & Tutorial!`,
      reasoningText: `### 🌟 Interactive Tutorial Launched\n\nEnjoy the interactive walkthrough! It demonstrates how to orbit in 3D, customize simulation parameters, use derivations, and ask me voice doubts anytime.`,
      confidence: 0.94,
    };
  }

  // ==========================================
  // 5. VIEW SWITCHING (Home, Lab, Arena)
  // ==========================================
  if (/\b(?:go home|home page|back to home|homepage|main menu|dashboard)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'navigate_view',
      targetView: 'home',
      actionLabel: 'Navigated to Home Dashboard',
      spokenConfirmation: `Navigating back to the Home Dashboard! Browse all chapters, 3D simulations, and syllabus views.`,
      reasoningText: `### 🏠 Home Dashboard Active\n\nI have navigated to the **Home Page**.\n\n- Filter chapters by **All**, **CBSE Class 12**, **JEE Main**, or **JEE Advanced**.\n- Access flagship simulations, downloadable PDF sheets, and curriculum overviews.`,
      confidence: 0.96,
    };
  }

  if (/\b(?:go to lab|back to lab|open simulation|enter studio|physics lab)\b/i.test(rawQuery) && context.currentView !== 'lab') {
    return {
      isCommand: true,
      actionType: 'navigate_view',
      targetView: 'lab',
      actionLabel: 'Navigated to 3D Physics Lab Studio',
      spokenConfirmation: `Taking you into the 3D Physics Lab Studio for ${context.currentConcept.title}!`,
      reasoningText: `### 🔬 3D Physics Lab Studio Active\n\nSwitched into the interactive studio for **${context.currentConcept.title}** with full 3D simulation and analytical controls.`,
      confidence: 0.95,
    };
  }

  // ==========================================
  // 6. TOPIC / CONCEPT SWITCHING
  // ==========================================
  const matchedConcept = findMatchingConcept(rawQuery, context.allConcepts);
  if (matchedConcept && matchedConcept.id !== context.currentConcept.id) {
    const isNavigationPhasing = /\b(?:go to|open|switch to|navigate to|launch|show me|take me to|explore|load)\b/i.test(
      rawQuery
    );

    if (isNavigationPhasing || rawQuery.length < 40) {
      return {
        isCommand: true,
        actionType: 'switch_concept',
        targetConcept: matchedConcept,
        targetView: 'lab',
        actionLabel: `Switched Lab to: ${matchedConcept.title}`,
        spokenConfirmation: `Switching 3D Lab to ${matchedConcept.title}! Initializing apparatus and simulation parameters.`,
        reasoningText: `### 🚀 Switched to ${matchedConcept.title}\n\nI have loaded **${matchedConcept.title}** (${matchedConcept.topic || 'Physics'}) into the 3D laboratory!\n\n- **Category:** ${matchedConcept.category.toUpperCase()}\n- **Key Formula:** $${matchedConcept.formulas[0]?.latex || ''}$\n- **3D Apparatus:** ${matchedConcept.simulationType} loaded.\n\nAsk me anytime to derive equations, adjust sliders, or run test simulations!`,
        confidence: 0.93,
      };
    }
  }

  // ==========================================
  // 7. APP ARCHITECTURE & GENERAL REASONING
  // ==========================================
  if (/\b(?:who made|who built|creator|founder|sanjay|architect|about this app|app features)\b/i.test(rawQuery)) {
    return {
      isCommand: true,
      actionType: 'reason_app_feature',
      actionLabel: 'App Architecture & Mission Overview',
      spokenConfirmation: `The JEE 3D Physics Lab was conceived and engineered by Sanjay.J to help aspirants visualize complex physics and conquer JEE Advanced!`,
      reasoningText: `### 🏛️ About the JEE 3D Physics Lab\n\n- **Founder & Master Architect**: Engineered from first principles by **Sanjay.J** specifically for students targeting top percentile ranks in **JEE Main & Advanced**.\n- **Core Motto**: *"Visualizing Physics, Mastering JEE"*\n- **Scope**: Covers the complete **JEE Main, JEE Advanced, and CBSE Class 11 & Class 12** physics syllabus across 23 chapters and 228 subtopics with real-time 3D WebGL apparatus, KaTeX math, step-by-step calculus derivations, and live neural voice AI mentoring!`,
      confidence: 0.95,
    };
  }

  // Not a discrete app command — standard conceptual physics query
  return {
    isCommand: false,
    actionLabel: 'Physics Doubt / Query',
    spokenConfirmation: '',
    reasoningText: '',
    confidence: 0,
  };
}
