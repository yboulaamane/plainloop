import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Concept, ToolExample } from '../types';
import { CLUSTERS } from '../data/clustersData';
import { ConceptVisualDemo } from './visuals/ConceptVisualDemo';
import { X, AlertTriangle, ArrowRight, Check } from 'lucide-react';

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

const STATUS_WORDS: Record<ToolExample['status'], string> = {
  supported: 'It has this',
  partial: 'It partly has this',
  'not-applicable': 'Not really a thing here',
};

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSelectOption = (index: number) => {
    setSelectedQuizOption(index);
    setIsQuizSubmitted(true);
    if (concept.quickChallenge.options[index].isCorrect) {
      onMarkChallengeSolved(concept.id);
      confetti({
        particleCount: 48,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#08783f', '#15181a', '#f7f8f4'],
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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="sheet relative my-2 flex w-full max-w-5xl flex-col sm:my-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-title"
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-[4px] border-b-2 border-ink bg-sheet px-3 py-3 sm:px-8">
          <p className="text-lg font-bold leading-tight">{cluster.name}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-pressed={isMastered}
              onClick={() => onToggleMastered(concept.id)}
              className="key"
            >
              <Check className="h-5 w-5" aria-hidden="true" />
              {isMastered ? 'Learned' : 'Mark learned'}
            </button>
            <button type="button" onClick={onClose} className="key key-round" aria-label="Close lesson">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-10 px-3 py-7 sm:px-8 sm:py-10">
          <header>
            <h2 id="lesson-title" className="font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              {concept.title}
            </h2>
            <div className="ticks mt-5" aria-hidden="true" />
          </header>

          <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Parts of this lesson">
            <button
              type="button"
              aria-pressed={activeTab === 'understand'}
              onClick={() => setActiveTab('understand')}
              className="key text-lg"
            >
              The lesson
            </button>
            <button
              type="button"
              aria-pressed={activeTab === 'tools'}
              onClick={() => setActiveTab('tools')}
              className="key text-lg"
            >
              Find it in your tool
            </button>
          </div>

          {activeTab === 'understand' ? (
            <div className="space-y-10">
              <section className="max-w-3xl">
                <p className="tab">In plain words</p>
                <p className="mt-4 text-xl leading-relaxed sm:text-2xl sm:leading-relaxed" data-plain-words>
                  {concept.plainExplanation}
                </p>
              </section>

              <section className="max-w-3xl border-l-[6px] border-accent pl-4 sm:pl-6">
                <p className="tab">Picture it</p>
                <p className="mt-3 font-display text-2xl leading-snug sm:text-3xl">{concept.analogy.headline}</p>
                <p className="mt-3 text-xl leading-relaxed">{concept.analogy.story}</p>
              </section>

              <ConceptVisualDemo type={concept.visualType} conceptId={concept.id} conceptTitle={concept.title} />

              <section className="max-w-3xl">
                <p className="tab">Where you will meet this</p>
                <p className="mt-4 text-xl font-bold leading-snug">{concept.practicalRelevance.whereEncountered}</p>
                <p className="mt-3 text-xl leading-relaxed">{concept.practicalRelevance.realWorldExample}</p>
              </section>

              <section className="rounded-md border-2 border-ink p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="tab">One check</p>
                  {isChallengeSolved && (
                    <span className="tab tab-accent">
                      <Check className="mr-1 h-4 w-4" aria-hidden="true" /> Checked
                    </span>
                  )}
                </div>
                <p className="mt-4 text-xl leading-relaxed">{concept.quickChallenge.scenario}</p>
                <p className="mt-2 font-display text-2xl leading-snug">{concept.quickChallenge.question}</p>
                <div className="mt-5 space-y-4">
                  {concept.quickChallenge.options.map((option, idx) => {
                    const isSelected = selectedQuizOption === idx;
                    const showRight = isQuizSubmitted && option.isCorrect;
                    const showWrong = isQuizSubmitted && isSelected && !option.isCorrect;
                    return (
                      <div key={idx}>
                        <button
                          type="button"
                          onClick={() => handleSelectOption(idx)}
                          className={`key w-full justify-start text-left text-lg font-semibold ${
                            showRight ? 'border-accent bg-accent/15' : ''
                          } ${showWrong ? 'border-dashed' : ''}`}
                        >
                          <span className="font-mono text-xl" aria-hidden="true">
                            {showRight ? '✓' : showWrong ? '✗' : String.fromCharCode(65 + idx)}
                          </span>
                          <span className={showWrong ? 'line-through' : ''}>{option.text}</span>
                        </button>
                        {isQuizSubmitted && isSelected && (
                          <p className={`pop mt-3 border-l-[6px] pl-4 text-lg leading-relaxed ${option.isCorrect ? 'border-accent' : 'border-ink'}`}>
                            <strong>{option.isCorrect ? 'Yes. ' : 'Not this one. '}</strong>
                            {option.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-md border-2 border-ink">
                <button
                  type="button"
                  aria-expanded={isGoDeeperOpen}
                  onClick={() => setIsGoDeeperOpen(!isGoDeeperOpen)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-xl font-bold sm:px-6"
                >
                  <span>Go deeper, with the technical words</span>
                  <span className="font-mono text-2xl" aria-hidden="true">{isGoDeeperOpen ? '−' : '+'}</span>
                </button>
                {isGoDeeperOpen && (
                  <div className="space-y-5 border-t-2 border-ink px-4 py-5 text-lg sm:px-6">
                    <p className="leading-relaxed">{concept.goDeeper.technicalSummary}</p>
                    {concept.goDeeper.nuanceOrAmbiguity && (
                      <div className="border-l-[6px] border-accent pl-4">
                        <p className="flex items-center gap-2 font-bold">
                          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                          One thing people mix up
                        </p>
                        <p className="mt-2 leading-relaxed">{concept.goDeeper.nuanceOrAmbiguity}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-bold">Where this comes from</p>
                      <ul className="mt-2 space-y-2">
                        {concept.goDeeper.sources.map((src, i) => (
                          <li key={i} className="rounded-md border-2 border-ink/30 px-4 py-3">
                            <p className="font-bold">{src.title}</p>
                            {src.description && <p className="mt-1">{src.description}</p>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="max-w-3xl text-xl leading-relaxed">
                The same idea wears a different name in each tool. Pick yours.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    aria-pressed={selectedTool === tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className="key"
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
              <div className="rounded-md border-2 border-ink p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-3xl">{activeToolExample.platformName}</h3>
                  <span className={`tab ${activeToolExample.status === 'supported' ? 'tab-accent' : ''}`}>
                    {STATUS_WORDS[activeToolExample.status]}
                  </span>
                </div>
                <p className="mt-4 text-xl">
                  Look for <strong>{activeToolExample.featureName}</strong>
                </p>
                <p className="mt-3 text-xl leading-relaxed">{activeToolExample.description}</p>
                <div className="mt-5 border-l-[6px] border-accent pl-4 text-lg">
                  <p className="font-bold">Where to find it</p>
                  <p className="mt-1">{activeToolExample.howToFind}</p>
                </div>
              </div>
            </div>
          )}

          {connectedConcepts.length > 0 && (
            <div className="border-t-2 border-ink pt-6">
              <p className="text-xl font-bold">Continue with</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {connectedConcepts.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectConcept(item)}
                    className="key"
                  >
                    {item.title}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
