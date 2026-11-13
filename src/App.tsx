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
  // On a phone the list is easier to use than the map, so start there.
  const [activeView, setActiveView] = useState<'map' | 'list'>(() =>
    typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches ? 'list' : 'map'
  );
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
    if (window.confirm('Clear everything you marked as learned or checked?')) {
      setMasteredIds([]);
      setChallengeSolvedIds([]);
    }
  };

  return (
    <div id="top" className="flex min-h-screen flex-col text-ink">
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

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-8 sm:py-10">
        <section className="max-w-4xl">
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight sm:text-7xl">
            Learn AI without the jargon.
          </h1>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed sm:text-2xl sm:leading-relaxed">
            You heard a word like <strong>harness</strong>, <strong>swarm</strong>, or <strong>MCP</strong> and nobody explained it.
            Here are {CONCEPTS.length} of those words. Each one gets plain words, a picture, and a small machine you can poke until it makes sense.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              className="key key-accent px-5 text-lg"
              onClick={() => {
                const first = CONCEPTS.find((c) => c.id === 'harness');
                if (first) setSelectedConcept(first);
              }}
            >
              Start with “harness”
            </button>
            <button
              type="button"
              className="key px-5 text-lg"
              onClick={() => setActiveView(activeView === 'map' ? 'list' : 'map')}
            >
              {activeView === 'map' ? 'See every lesson as a list' : 'See the lessons as a map'}
            </button>
          </div>
          <div className="ticks mt-8" aria-hidden="true" />
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

      <footer className="mt-10 border-t-2 border-ink bg-sheet py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 text-lg sm:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-3xl leading-none">Plainloop</p>
            <p className="mt-2 font-semibold">AI in plain terms.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setIsFreeApiModalOpen(true)} className="key">
              <Gift className="h-5 w-5" aria-hidden="true" />
              Free APIs
            </button>
            {(masteredIds.length > 0 || challengeSolvedIds.length > 0) && (
              <button type="button" onClick={handleResetProgress} className="key">
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                Reset progress
              </button>
            )}
            <a
              href="https://yboulaamane.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="key"
            >
              yboulaamane.github.io
              <ExternalLink className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
