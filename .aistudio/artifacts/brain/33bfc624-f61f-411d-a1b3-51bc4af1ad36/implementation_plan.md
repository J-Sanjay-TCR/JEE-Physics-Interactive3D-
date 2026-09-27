# GitHub Repository Connection & Publishing Guide

Guide and interactive workflow to connect, commit, push, and publish the JEE 3D Physics Lab codebase directly to GitHub.

### User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed to keep this plan. This plan details the exact platform options in Google AI Studio, as well as an in-app GitHub & Deployment Hub modal that provides direct assistance, repository setup steps, and export readiness checks.

- **Confirmed Decision**: Connect and push directly to a GitHub repository using Google AI Studio's native GitHub Export tool and in-app assistance.
- **Integration Path**: Google AI Studio native GitHub Export bar + in-app GitHub & Publishing modal in the application header.

---

### 1. Overview & Core Concept

- **What It Does**: Explains the exact location and usage of the native GitHub Push and Publish buttons in the Google AI Studio interface, and adds an interactive "GitHub & Publishing" status modal accessible from the app header for instant guidance, repository preparation, and export verification.
- **Target Audience / Persona**: Developers, educators, and students looking to version control their changes, contribute to open-source, or deploy their customized physics laboratory.
- **Key Value**: Eliminates confusion around where the GitHub and Publish controls are located, providing step-by-step assistance directly in the workspace.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Locating Platform Controls**: User is shown where the top-right toolbar controls reside in Google AI Studio (Export to GitHub button and Share/Publish button).
  2. **In-App GitHub & Publishing Modal**: User can click a new "GitHub & Publish" button in the application Header to open a sleek Cyberpunk-themed modal showing:
     - Step-by-step instructions for connecting GitHub in AI Studio.
     - Clean `.gitignore` and repository health status.
     - Git push checklist (ensuring clean build, passing linter, no secrets).
     - Direct links to publish / share the live app.
- **Visual Identity & Theme**:
  - Seamlessly matches the Cyberpunk Synapse / Dark theme with neon cyan and emerald indicators.
  - Interactive status badges: `Build: Passing`, `Linter: 0 Errors`, `Repo: Ready to Push`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native AI Studio Push vs. CLI Git Push**
  - *Chosen Approach*: Direct the user to the native AI Studio GitHub Export button in the top toolbar, complemented by an in-app guidance modal.
  - *Why*: Google AI Studio provides a direct browser-based OAuth flow to create repositories or push commits to existing GitHub repositories without requiring manual SSH keys or CLI credential helpers in the container.
- **Decision 2: In-App Helper Modal**
  - *Chosen Approach*: Add a lightweight, interactive "Publish & GitHub" modal in the top header.
  - *Why*: Provides immediate in-context instructions without forcing the user to leave the app or guess which buttons to press.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│               Google AI Studio Workspace UI                 │
│  [Project Title]   [GitHub Export]   [Share / Publish]      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 JEE 3D Physics Lab Application              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Header: [Concepts] [Search] [Theme] [GitHub & Publish]│  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │ Opens                        │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │        GitHub & Publishing Assistant Modal            │  │
│  │  • Step 1: Click GitHub Export in AI Studio Bar       │  │
│  │  • Step 2: Authorize & Select / Create Repository     │  │
│  │  • Step 3: Push Commit to GitHub main branch          │  │
│  │  • Step 4: Share Public Applet Link                   │  │
│  │  • Repository Status: Ready (0 Errors, 31 Concepts)   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Component State**:
  - `isGithubModalOpen`: Boolean state controlled via Header and quick-actions menu.
  - Clean repository verification ensuring `.env` secrets are omitted from commits.
