import React, { useState, useEffect } from 'react';
import { CONCEPTS } from './data/conceptsData';
import { LEARNING_PATHS } from './data/clustersData';
import { Concept, LearningPathId } from './types';
import { Navbar } from './components/Navbar';
import { LearningPathBanner } from './components/LearningPathBanner';
import { BubbleUniverse } from './components/BubbleUniverse';
import { ListView } from './components/ListView';
import { ConceptModal } from './components/ConceptModal';
import { FreeApiModal } from './components/FreeApiModal';
import { RefreshCw, Gift, ExternalLink } from 'lucide-react';

export function App() {
  const [activeView, setActiveView] = useState<'map' | 'list'>('map');
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<LearningPathId>('chatbots');
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isFreeApiModalOpen, setIsFreeApiModalOpen] = useState<boolean>(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('agentatlas_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('agentatlas_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('agentatlas_mastered');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [challengeSolvedIds, setChallengeSolvedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('agentatlas_solved');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('agentatlas_mastered', JSON.stringify(masteredIds));
    } catch {
      // ignore
    }
  }, [masteredIds]);

  useEffect(() => {
    try {
      localStorage.setItem('agentatlas_solved', JSON.stringify(challengeSolvedIds));
    } catch {
      // ignore
    }
  }, [challengeSolvedIds]);

  const currentPath = LEARNING_PATHS.find((p) => p.id === selectedPathId) || LEARNING_PATHS[0];
  const activePathConceptIds = currentPath.conceptIds;

  const handleToggleMastered = (id: string) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMarkChallengeSolved = (id: string) => {
    setChallengeSolvedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all learned concepts and quiz progress?')) {
      setMasteredIds([]);
      setChallengeSolvedIds([]);
    }
  };

  return (
    <div id="top" className="flex min-h-screen flex-col text-ink dark:text-cream">
      <Navbar
        activeView={activeView}
        onToggleView={setActiveView}
        reducedMotion={reducedMotion}
        onToggleMotion={() => setReducedMotion(!reducedMotion)}
        masteredCount={masteredIds.length}
        totalConcepts={CONCEPTS.length}
        solvedCount={challengeSolvedIds.length}
        onOpenFreeApis={() => setIsFreeApiModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-5 py-6 sm:px-8 sm:py-8">
        <section className="max-w-3xl">
          <p className="kicker">Interactive field guide</p>
          <h1 className="font-display mt-2 text-5xl leading-[1.02] tracking-tight text-ink dark:text-cream sm:text-6xl">
            Learn AI without the jargon.
          </h1>
          <p className="mt-4 text-xl leading-relaxed text-mute">
            {CONCEPTS.length} ideas, from prompts to agent swarms. Each lesson is plain words, an analogy, a hands-on demo, where you will meet it, and one check.
          </p>
        </section>

        <LearningPathBanner
          paths={LEARNING_PATHS}
          selectedPathId={selectedPathId}
          onSelectPath={setSelectedPathId}
        />

        {activeView === 'map' ? (
          <BubbleUniverse
            concepts={CONCEPTS}
            selectedConcept={selectedConcept}
            onSelectConcept={setSelectedConcept}
            activePathConceptIds={activePathConceptIds}
            reducedMotion={reducedMotion}
            masteredIds={masteredIds}
            challengeSolvedIds={challengeSolvedIds}
            theme={theme}
          />
        ) : (
          <ListView
            concepts={CONCEPTS}
            onSelectConcept={setSelectedConcept}
            masteredIds={masteredIds}
            challengeSolvedIds={challengeSolvedIds}
            activePathConceptIds={activePathConceptIds}
          />
        )}
      </main>

      {selectedConcept && (
        <ConceptModal
          concept={selectedConcept}
          allConcepts={CONCEPTS}
          onClose={() => setSelectedConcept(null)}
          onSelectConcept={setSelectedConcept}
          isMastered={masteredIds.includes(selectedConcept.id)}
          onToggleMastered={handleToggleMastered}
          isChallengeSolved={challengeSolvedIds.includes(selectedConcept.id)}
          onMarkChallengeSolved={handleMarkChallengeSolved}
        />
      )}

      <FreeApiModal
        isOpen={isFreeApiModalOpen}
        onClose={() => setIsFreeApiModalOpen(false)}
        onOpenConcept={() => {
          const c = CONCEPTS.find((item) => item.id === 'ai-apis');
          if (c) setSelectedConcept(c);
        }}
      />

      <footer className="mt-8 border-t border-rule bg-card/70 py-8 dark:border-white/10 dark:bg-nightcard/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 text-base text-mute sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl text-ink dark:text-cream">Plainloop</p>
            <p className="mt-1 max-w-xl">
              Harnesses, MCP, memory, swarms, and the rest of the 2026 map, written so you can learn them in one sitting.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsFreeApiModalOpen(true)}
              className="inline-flex items-center gap-2 font-semibold text-ink hover:text-moss dark:text-cream dark:hover:text-mossbright"
            >
              <Gift className="h-4 w-4" />
              Free APIs
            </button>
            {(masteredIds.length > 0 || challengeSolvedIds.length > 0) && (
              <button
                onClick={handleResetProgress}
                className="inline-flex items-center gap-2 hover:text-clay"
              >
                <RefreshCw className="h-4 w-4" />
                Reset progress
              </button>
            )}
            <a
              href="https://yboulaamane.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-ink hover:text-moss dark:text-cream dark:hover:text-mossbright"
            >
              yboulaamane.github.io
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
