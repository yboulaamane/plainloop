import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Concept, ToolExample } from '../types';
import { CLUSTERS } from '../data/clustersData';
import { ConceptVisualDemo } from './visuals/ConceptVisualDemo';
import {
  X, Lightbulb, CheckCircle2, AlertTriangle, ArrowRight,
  BookOpen, Wrench, Check,
} from 'lucide-react';

interface Props {
  concept: Concept;
  allConcepts: Concept[];
  onClose: () => void;
  onSelectConcept: (concept: Concept) => void;
  isMastered: boolean;
  onToggleMastered: (id: string) => void;
  isChallengeSolved: boolean;
  onMarkChallengeSolved: (id: string) => void;
}

const TOOLS: { id: ToolExample['platform']; name: string }[] = [
  { id: 'claude', name: 'Claude' },
  { id: 'cursor', name: 'Cursor' },
  { id: 'chatgpt', name: 'ChatGPT' },
  { id: 'grok', name: 'Grok' },
  { id: 'opensource', name: 'Open source' },
];

export const ConceptModal: React.FC<Props> = ({
  concept,
  allConcepts,
  onClose,
  onSelectConcept,
  isMastered,
  onToggleMastered,
  isChallengeSolved,
  onMarkChallengeSolved,
}) => {
  const [activeTab, setActiveTab] = useState<'understand' | 'tools'>('understand');
  const [selectedTool, setSelectedTool] = useState<ToolExample['platform']>('claude');
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState<boolean>(false);
  const [isGoDeeperOpen, setIsGoDeeperOpen] = useState<boolean>(false);

  const cluster = CLUSTERS[concept.cluster];

  useEffect(() => {
    setActiveTab('understand');
    setSelectedQuizOption(null);
    setIsQuizSubmitted(false);
    setIsGoDeeperOpen(false);
  }, [concept.id]);

  const handleSelectOption = (index: number) => {
    setSelectedQuizOption(index);
    setIsQuizSubmitted(true);
    if (concept.quickChallenge.options[index].isCorrect) {
      onMarkChallengeSolved(concept.id);
      confetti({
        particleCount: 48,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#1b5e45', '#f6f1e7', '#9a4a2b'],
      });
    }
  };

  const connectedConcepts = allConcepts.filter((c) =>
    concept.connectedConceptIds.includes(c.id)
  );

  const activeToolExample = concept.toolExamples.find(
    (t) => t.platform === selectedTool
  ) || concept.toolExamples[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="panel relative my-4 flex w-full max-w-4xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-card/95 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-nightcard/95 sm:px-8">
          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${cluster.badgeBg}`}>
            {cluster.name}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleMastered(concept.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-base font-semibold ${
                isMastered
                  ? 'bg-moss text-cream'
                  : 'border border-rule text-ink hover:border-moss dark:border-white/10 dark:text-cream'
              }`}
            >
              <Check className="h-4 w-4" />
              {isMastered ? 'Learned' : 'Mark learned'}
            </button>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-mute hover:text-ink dark:border-white/10 dark:hover:text-cream"
              aria-label="Close lesson"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-8 overflow-y-auto px-6 py-7 sm:px-8 sm:py-9">
          <header>
            <h2 id="lesson-title" className="font-display text-4xl leading-tight sm:text-5xl">
              {concept.title}
            </h2>
            <p className="mt-3 text-lg text-mute">{cluster.tagline}</p>
          </header>

          <div className="grid grid-cols-1 gap-2 rounded-full border border-rule p-1 dark:border-white/10 sm:grid-cols-2">
            <button
              onClick={() => setActiveTab('understand')}
              className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-semibold ${
                activeTab === 'understand'
                  ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
                  : 'text-mute'
              }`}
            >
              <Lightbulb className="h-5 w-5" />
              The lesson
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center justify-center gap-2 rounded-full px-4 py-3 text-base font-semibold ${
                activeTab === 'tools'
                  ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
                  : 'text-mute'
              }`}
            >
              <Wrench className="h-5 w-5" />
              Find it in your tool
            </button>
          </div>

          {activeTab === 'understand' ? (
            <div className="space-y-6">
              <section className="rounded-3xl bg-canvas p-6 dark:bg-night">
                <p className="kicker">01 · Plain words</p>
                <p className="mt-3 text-xl leading-relaxed">{concept.plainExplanation}</p>
              </section>

              <section className="rounded-3xl border border-clay/20 bg-clay/5 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay">
                  02 · {concept.analogy.headline}
                </p>
                <p className="mt-3 text-xl leading-relaxed">
                  {concept.analogy.story}
                </p>
              </section>

              <section>
                <p className="kicker mb-3">03 · Try it</p>
                <ConceptVisualDemo type={concept.visualType} conceptId={concept.id} conceptTitle={concept.title} />
              </section>

              <section className="rounded-3xl bg-canvas p-6 dark:bg-night">
                <p className="kicker">04 · Where you will meet this</p>
                <p className="mt-3 text-xl font-semibold">{concept.practicalRelevance.whereEncountered}</p>
                <p className="mt-3 text-lg leading-relaxed text-mute">
                  {concept.practicalRelevance.realWorldExample}
                </p>
              </section>

              <section className="rounded-3xl border border-rule p-6 dark:border-white/10">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="kicker flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    05 · One check
                  </p>
                  {isChallengeSolved && (
                    <span className="rounded-full bg-moss/10 px-3 py-1 text-sm font-semibold text-moss dark:text-mossbright">
                      Checked
                    </span>
                  )}
                </div>
                <p className="text-lg italic text-mute">{concept.quickChallenge.scenario}</p>
                <p className="mt-2 text-xl font-semibold">{concept.quickChallenge.question}</p>
                <div className="mt-4 space-y-3">
                  {concept.quickChallenge.options.map((option, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    let optionStyle = 'border-rule bg-card hover:border-moss dark:border-white/10 dark:bg-nightcard';
                    if (isQuizSubmitted) {
                      if (option.isCorrect) {
                        optionStyle = 'border-moss bg-moss/10';
                      } else if (isSelected) {
                        optionStyle = 'border-clay bg-clay/10';
                      }
                    }
                    return (
                      <div key={idx}>
                        <button
                          onClick={() => handleSelectOption(idx)}
                          className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left text-lg ${optionStyle}`}
                        >
                          <span className="font-display text-xl text-moss dark:text-mossbright">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option.text}</span>
                        </button>
                        {isQuizSubmitted && isSelected && (
                          <p className={`mt-2 rounded-2xl px-4 py-3 text-base ${option.isCorrect ? 'bg-moss/10 text-moss dark:text-mossbright' : 'bg-clay/10 text-clay'}`}>
                            {option.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-rule dark:border-white/10">
                <button
                  onClick={() => setIsGoDeeperOpen(!isGoDeeperOpen)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left text-lg font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-mute" />
                    Go deeper
                  </span>
                  <span className="text-base font-medium text-mute">{isGoDeeperOpen ? 'Hide' : 'Show sources'}</span>
                </button>
                {isGoDeeperOpen && (
                  <div className="space-y-5 border-t border-rule px-6 py-5 text-lg dark:border-white/10">
                    <p className="leading-relaxed text-mute">{concept.goDeeper.technicalSummary}</p>
                    {concept.goDeeper.nuanceOrAmbiguity && (
                      <div className="rounded-2xl border border-clay/30 bg-clay/5 p-4">
                        <p className="flex items-center gap-2 font-semibold text-clay">
                          <AlertTriangle className="h-4 w-4" />
                          A nuance worth knowing
                        </p>
                        <p className="mt-2 text-base leading-relaxed">{concept.goDeeper.nuanceOrAmbiguity}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {concept.goDeeper.sources.map((src, i) => (
                        <div key={i} className="rounded-2xl bg-canvas px-4 py-3 dark:bg-night">
                          <p className="font-semibold">{src.title}</p>
                          {src.description && <p className="mt-1 text-base text-mute">{src.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-xl leading-relaxed text-mute">
                The same idea wears a different name in each tool. Pick yours.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`rounded-2xl px-3 py-4 text-base font-semibold ${
                      selectedTool === tool.id
                        ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
                        : 'border border-rule bg-card text-mute hover:text-ink dark:border-white/10 dark:bg-nightcard dark:hover:text-cream'
                    }`}
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
              <div className="rounded-3xl border border-rule p-6 dark:border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-3xl">{activeToolExample.platformName}</h3>
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold uppercase tracking-wide ${
                    activeToolExample.status === 'supported'
                      ? 'bg-moss/15 text-moss dark:text-mossbright'
                      : activeToolExample.status === 'partial'
                      ? 'bg-clay/15 text-clay'
                      : 'bg-canvas text-mute dark:bg-night'
                  }`}>
                    {activeToolExample.status}
                  </span>
                </div>
                <p className="mt-3 text-lg">
                  Look for <span className="font-semibold">{activeToolExample.featureName}</span>
                </p>
                <p className="mt-3 text-lg leading-relaxed text-mute">{activeToolExample.description}</p>
                <p className="mt-4 rounded-2xl bg-canvas px-4 py-3 text-base dark:bg-night">
                  <span className="block text-sm font-semibold uppercase tracking-[0.14em] text-mute">Where to find it</span>
                  <span className="mt-1 block font-medium">{activeToolExample.howToFind}</span>
                </p>
              </div>
            </div>
          )}

          {connectedConcepts.length > 0 && (
            <div className="border-t border-rule pt-6 dark:border-white/10">
              <p className="text-base font-semibold uppercase tracking-[0.14em] text-mute">Continue with</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {connectedConcepts.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelectConcept(item)}
                    className="inline-flex items-center gap-2 rounded-full border border-rule px-4 py-2 text-base font-semibold hover:border-moss dark:border-white/10"
                  >
                    {item.title}
                    <ArrowRight className="h-4 w-4 text-mute" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
