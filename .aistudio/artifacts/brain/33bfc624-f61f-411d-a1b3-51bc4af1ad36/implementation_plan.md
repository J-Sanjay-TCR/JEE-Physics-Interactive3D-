# Comprehensive JEE Main, JEE Advanced & CBSE Class 11-12 Physics Syllabus Expansion

Expand the laboratory curriculum to encompass the complete official physics syllabi defined by NTA (JEE Main), IIT JEE (Advanced), and CBSE Academics (Class 11 and Class 12), organized into dedicated tabbed views with complete topic breakdowns, 3D interactive apparatuses, exhaustive formula banks, and premier coaching module notes, backed by rigorous pipeline and logical error prevention gates.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions and quality guardrails were confirmed via user feedback and official NTA/CBSE syllabus standards:

- **Confirmed Scope**: Complete NTA JEE Main, JEE Advanced, and CBSE Class 11 & Class 12 physics syllabi (all 10 Class 11 units and 9 Class 12 units).
- **Confirmed Structure**: Dedicated segmented/tabbed navigation providing distinct views for **CBSE Class 12 Board Focus**, **JEE Main Core Curriculum**, and **JEE Advanced Deep Topics**, while maintaining universal cross-linking to 3D apparatuses.
- **Pipeline Integrity & Zero-Error Quality Gate**:
  1. *Type Safety & Linting*: Every new data schema and UI component must strictly pass TypeScript compiler verification (`tsc --noEmit`) with 0 errors.
  2. *Build & Server Verification*: Full production bundling (`npm run build`) and HTTP health probes (`/health`, `/`) must succeed before task completion.
  3. *Mathematical & Logical Invariant Guards*: All formulas, parameter domains, and differential step calculations must include division-by-zero guards, physical boundary clamping ($m > 0$, $\lambda > 0$, $\mu \ge 0$), and non-NaN sanity checks.
- **Backward Compatibility & Regression Protection**: All existing 3D simulations, RK4 numerical solvers, Nemo AI tutor vision bindings, and audio player hooks remain completely preserved.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the application into a complete, exhaustive JEE Main, JEE Advanced, and CBSE Class 11/12 Physics visual academy. Students can toggle between curriculum scopes (CBSE Class 12 Boards vs. JEE Main vs. JEE Advanced), inspect every lesson with 100% topic coverage (e.g., in Ray Optics: mirrors, lenses, prism refraction, optical instruments, lensmaker formula, chromatic aberration), explore dedicated 3D interactive WebGL apparatuses, review formula sheets, and practice exam numericals.
- **Target Audience / Persona**: Aspirants preparing for JEE Main, JEE Advanced, and CBSE Class 12 Board examinations who need intuitive 3D spatial intuition alongside rigorous mathematical derivations and coaching shortcuts.
- **Key Value**: Closes the gap between shallow summaries and real coaching institute depth by providing interactive 3D laboratory models, full multi-topic breakdowns per chapter, and verified exam data cited directly from official NTA and CBSE syllabus standards.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Syllabus Directory & Navigation**:
   - Students tap the **Syllabus & Curriculum Hub** from the top header or sidebar.
   - A multi-tab segmented control toggles between **JEE Main & Advanced (Class 11 & 12)** and **CBSE Class 12 Boards**.
   - Each curriculum view displays chapters categorized by official units (Mechanics, Thermal Physics, Electrodynamics, Optics, Modern Physics, Semiconductor Electronics, Experimental Physics).
2. **Chapter Deep-Dive Explorer**:
   - Selecting a chapter displays an exhaustive topic checklist (all 8–12 topics per chapter, e.g. *Electrostatics*: Coulomb's Law, Electric Field Lines, Gauss Law & Applications, Electric Dipole in External Field, Electrostatic Potential, Equipotential Surfaces, Capacitance & Dielectrics, Energy Density & Van de Graaff concepts).
   - Each topic provides:
     - 📐 **Interactive 3D Simulation**: Real-time WebGL apparatus with parameter sliders and vector visualization.
     - 📜 **Formula Bank & LaTeX Cheat Sheet**: Verified formulas with dimensional consistency checks.
     - 🎯 **Coaching Module Notes**: High-yield special cases, JEE Advanced trap alerts, and speed-solving shortcuts.
     - ✍️ **Derivations & Step-by-Step Proofs**: Mathematical calculus proofs formatted in clean KaTeX.
3. **Interactive Simulation Stage**:
   - The two-zone layout (60% interactive 3D stage on the left/top, 40% control and coaching deck on the right/bottom) dynamically loads apparatuses for all newly covered topics.

### Visual Identity & Theme
- **Aesthetic Direction**: High-contrast, clean scientific laboratory theme (aligned with `frontend-design` and education simulations guidelines). Dark obsidian and crisp light modes without ungrounded visual noise or fake status tickers.
- **Color Palette & Discipline**:
  - Dominant Canvas: Deep obsidian `#070709` / `#0B0D16` (Dark) & Crisp clean slate `#F8FAFC` (Light).
  - Structural Panels: Hairline bordered cards with `border-white/[0.08]` and subtle glass reflections.
  - Semantic Curriculum Accents:
    - CBSE Class 12: Vivid Emerald (`#10B981`)
    - JEE Main: High-contrast Cyan (`#06B6D4` / `#00F0FF`)
    - JEE Advanced: Electric Indigo/Violet (`#8B5CF6`)
- **Zero-Pill Discipline**: Metadata (Class, Weightage, Topic count) rendered as clean unboxed text with typographic separators (`·` or `/`). Tabs are functional interactive buttons with clean segmented highlights.
- **Typography**: Display titles set in `Plus Jakarta Sans`, mathematical prose in italicized LaTeX serif and tabular figures (`tabular-nums font-mono`).

---

## 3. Key Product Decisions & Logical Error Prevention

- **Decision 1: Syllabus Organization & Tabbed Views**:
  - *Chosen Approach*: Separate tabbed views for CBSE Class 12 and JEE (Class 11 & 12), with curriculum filter pills and search indices.
  - *Why*: CBSE Board students need NCERT-aligned derivations and board-style structured answers, whereas JEE aspirants require multi-concept problem synthesis, calculus traps, and coaching shortcuts.
- **Decision 2: Mathematical Logical Invariants & Error Prevention**:
  - *Chosen Approach*: Every formula evaluator and parameter slider will enforce mathematical boundary conditions (e.g. angle clamping in Snell's law to prevent total internal reflection domain errors in refraction mode, non-zero denominator protection in lens formulas $\frac{1}{v} - \frac{1}{u} = \frac{1}{f}$, and positive mass/charge constraints).
  - *Why*: Eliminates `NaN` or `Infinity` propagation into Three.js object positions and WebGL buffer attributes.
- **Decision 3: Non-Destructive Modular Data Model**:
  - *Chosen Approach*: Expand `jeeSyllabusDirectory.ts`, `allConcepts.ts`, `physicsData.ts`, and `coachingModules.ts` into a structured, relational curriculum graph where every chapter has a full array of subtopics, formula lists, and linked 3D apparatus models.
  - *Why*: Guarantees zero regression for existing topics while systematically adding all missing chapters (Semiconductors & Logic Gates, Electromagnetic Waves, Wave Optics, Properties of Matter, Rotational Inertia, Dual Nature).
- **Decision 4: 3D Simulation Engine Scalability**:
  - *Chosen Approach*: Extend `SimulationRenderer.ts` with dedicated modular rendering functions for new topics (e.g., PN Junction Band & Depletion Region, Wave Optics Double Slit Fringe Interference, Heat Engine Carnot & Stirling PV Diagrams) with fallback safety geometries.
  - *Why*: Keeps rendering high-performance (60 FPS) and lightweight without heavy external asset dependencies.

---

## 4. Technical Architecture & Phased Execution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               USER INTERFACE                                │
│  ┌───────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐  │
│  │ Top Navigation Header │  │ Sidebar Navigation  │  │ Mobile Nav Bottom │  │
│  └───────────┬───────────┘  └──────────┬──────────┘  └─────────┬─────────┘  │
└──────────────┼─────────────────────────┼───────────────────────┼────────────┘
               ▼                         ▼                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     CURRICULUM & SYLLABUS DIRECTORY MODAL                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  Tabs: [ JEE Main (Class 11 & 12) ]  [ JEE Advanced ]  [ CBSE 12 ]    │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Unit Accordions: Mechanics | Thermal | Electrodynamics | Optics ...   │  │
│  │  └─ Chapter Card: All Subtopics (1-10) · Formulas · Derivations · 3D  │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATA LAYER & CURRICULUM REGISTRY                        │
│  ┌─────────────────────────┐  ┌───────────────────────┐  ┌───────────────┐  │
│  │  jeeSyllabusDirectory   │  │    allConcepts.ts     │  │coachingModules│  │
│  │  (Class 11/12 Chapters) │  │  (3D Parameter Specs) │  │(Allen/Reso TRP│  │
│  └───────────┬─────────────┘  └───────────┬───────────┘  └───────┬───────┘  │
└──────────────┼────────────────────────────┼──────────────────────┼──────────┘
               ▼                            ▼                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       3D RENDERING & SIMULATION ENGINE                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  ThreePhysicsCanvas + SimulationRenderer (Three.js WebGL + Bloom)     │  │
│  │  Apparatuses: Kinematics, Optics, E&M, Thermodynamics, Modern Physics │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Phased Implementation Milestones
1. **Milestone 1 (Curriculum Registry Expansion)**:
   - Expand `jeeSyllabusDirectory.ts` and `physicsData.ts` with all chapters and comprehensive subtopic listings across CBSE Class 12, JEE Main, and JEE Advanced.
   - Tag each chapter with curriculum standards and NCERT unit mappings.
2. **Milestone 2 (Syllabus Modal Tabbed UI & Navigation)**:
   - Enhance `JeeSyllabusDirectoryModal.tsx` with dedicated tabbed views (`CBSE Class 12`, `JEE Main (Class 11 & 12)`, `JEE Advanced`).
   - Add topic count badges, search filter, and subtopic exploration panels.
3. **Milestone 3 (Formula Banks & Coaching Module Notes)**:
   - Populate `coachingModules.ts` and `jeeFormulaSheetData.ts` with complete formula banks, past-year question patterns, and trap alerts for all newly expanded topics.
4. **Milestone 4 (3D Apparatuses & Math Invariant Protection)**:
   - Add new simulation apparatus modes in `SimulationRenderer.ts` and ensure all numerical models have zero-division guards.
5. **Milestone 5 (Pipeline & Build Verification)**:
   - Run `lint_applet` (`tsc --noEmit`), `compile_applet`, and production bundle test (`npm run build`) to ensure 100% error-free pipeline.
