import { CHAPTERS, CATEGORIES } from './physicsData';
import { ALL_CONCEPTS } from './allConcepts';
import { PhysicsConcept, Chapter, CategoryId } from '../types';

export interface PageSectionItem {
  id: string; // Unique DOM element ID for scrolling & observing
  title: string;
  subtitle?: string;
  category?: CategoryId | 'general';
  iconType:
    | 'hero'
    | 'flagship'
    | 'chapter'
    | 'pdf'
    | 'founder'
    | 'header'
    | 'viewport'
    | 'controls'
    | 'coaching'
    | 'graphs'
    | 'equations'
    | 'jee'
    | 'questions'
    | 'roadmap';
  badge?: string;
  tabKey?: 'controls' | 'coaching' | 'graphs' | 'equations' | 'jee' | 'questions';
  chapterId?: string;
  conceptId?: string;
}

/**
 * Dynamically computes all major sections on the Home Page.
 * Automatically synchronizes with CHAPTERS and ALL_CONCEPTS data.
 */
export function getHomePageSections(): PageSectionItem[] {
  const sections: PageSectionItem[] = [
    {
      id: 'home-hero-section',
      title: 'Overview & Mission',
      subtitle: 'JEE Advanced Interactive Physics Lab',
      iconType: 'hero',
    },
    {
      id: 'home-flagship-section',
      title: 'Flagship 3D Labs',
      subtitle: 'High-frequency interactive simulations',
      iconType: 'flagship',
      badge: 'Interactive',
    },
    {
      id: 'home-chapters-grid',
      title: 'Complete JEE Chapters',
      subtitle: 'All syllabus modules & topics',
      iconType: 'chapter',
      badge: `${CHAPTERS.length} Chapters`,
    },
  ];

  // Dynamically add all chapters as individual scroll targets
  for (const chapter of CHAPTERS) {
    const conceptCount = ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id).length;
    sections.push({
      id: `chapter-section-${chapter.id}`,
      title: chapter.name,
      subtitle: `${conceptCount} Interactive Labs`,
      category: chapter.category,
      iconType: 'chapter',
      chapterId: chapter.id,
      badge: `${conceptCount} Labs`,
    });
  }

  // PDF Section
  sections.push({
    id: 'home-pdf-section',
    title: 'Formula Sheets & PDFs',
    subtitle: 'Downloadable chapter compendiums',
    iconType: 'pdf',
    badge: 'PDF',
  });

  // Founder Section
  sections.push({
    id: 'home-founder-section',
    title: 'Founder & Mission',
    subtitle: 'Conceived & Engineered by Sanjay.J',
    iconType: 'founder',
  });

  return sections;
}

/**
 * Dynamically computes all functional sections in the 3D Lab Studio.
 * Synchronized with the active concept's chapter and tabs.
 */
export function getLabPageSections(concept: PhysicsConcept): PageSectionItem[] {
  return [
    {
      id: 'section-top',
      title: 'Lab Overview',
      subtitle: concept.title,
      iconType: 'header',
      badge: concept.badge || 'JEE Core',
    },
    {
      id: 'section-3d',
      title: '3D Simulation Viewport',
      subtitle: 'Real-time interactive physics viewport',
      iconType: 'viewport',
      badge: '360° View',
    },
    {
      id: 'section-controls',
      title: 'Parameters & Controls',
      subtitle: 'Adjust launch values & physics presets',
      iconType: 'controls',
      tabKey: 'controls',
    },
    {
      id: 'section-coaching',
      title: 'Coaching Notes & Derivations',
      subtitle: 'Step-by-step institute derivations',
      iconType: 'coaching',
      tabKey: 'coaching',
    },
    {
      id: 'section-graphs',
      title: 'Analytical Graphs',
      subtitle: 'Real-time parameter curves',
      iconType: 'graphs',
      tabKey: 'graphs',
    },
    {
      id: 'section-equations',
      title: 'Formula Explorer & Solvers',
      subtitle: 'Equations with dynamic calculators',
      iconType: 'equations',
      tabKey: 'equations',
    },
    {
      id: 'section-jee',
      title: 'JEE Traps & Shortcuts',
      subtitle: 'Main & Advanced exam insights',
      iconType: 'jee',
      tabKey: 'jee',
      badge: 'High Yield',
    },
    {
      id: 'section-questions',
      title: 'Exam Practice Arena',
      subtitle: 'Interactive problem solving',
      iconType: 'questions',
      tabKey: 'questions',
    },
    {
      id: 'section-chapter-roadmap',
      title: 'Chapter Roadmap & Sibling Labs',
      subtitle: `All topics in ${concept.topic || 'Chapter'}`,
      iconType: 'roadmap',
      chapterId: concept.chapterId,
    },
  ];
}

/**
 * Returns grouped syllabus chapters with their respective concepts.
 * Automatically incorporates any newly defined concepts (e.g. center-of-mass-ragdoll).
 */
export function getGroupedSyllabusData() {
  return CHAPTERS.map((chapter) => ({
    chapter,
    concepts: ALL_CONCEPTS.filter((c) => c.chapterId === chapter.id),
  })).filter((group) => group.concepts.length > 0);
}
