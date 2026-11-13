import React, { useState, useMemo } from 'react';
import { Concept, ClusterId } from '../types';
import { CLUSTERS } from '../data/clustersData';
import { Search, ArrowRight, X, Check } from 'lucide-react';

interface Props {
  concepts: Concept[];
  onSelectConcept: (concept: Concept) => void;
  masteredIds: string[];
  challengeSolvedIds: string[];
  activePathConceptIds: string[];
}

const CLUSTER_ORDER: ClusterId[] = [
  'start-here',
  'agent-architecture',
  'instructions-context',
  'tools-connections',
  'knowledge-memory',
  'agent-teamwork',
  'model-adaptation',
  'reliability-safety',
  'deployment-efficiency',
];

export const ListView: React.FC<Props> = ({
  concepts,
  onSelectConcept,
  masteredIds,
  challengeSolvedIds,
  activePathConceptIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<ClusterId | 'all'>('all');
  const [pathOnly, setPathOnly] = useState(true);

  const searching = searchQuery.trim().length > 0;

  const filteredConcepts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return concepts.filter((c) => {
      const matchesSearch = !query ||
        c.title.toLowerCase().includes(query) ||
        c.shortLabel.toLowerCase().includes(query) ||
        c.plainExplanation.toLowerCase().includes(query) ||
        c.tags.some((t) => t.toLowerCase().includes(query));

      const matchesCluster = selectedCluster === 'all' || c.cluster === selectedCluster;
      const matchesPath = searching || !pathOnly || activePathConceptIds.includes(c.id);
      return matchesSearch && matchesCluster && matchesPath;
    });
  }, [concepts, searchQuery, selectedCluster, pathOnly, searching, activePathConceptIds]);

  const groupedConcepts = useMemo(() => {
    const groups: { clusterId: ClusterId; items: Concept[] }[] = [];
    for (const cid of CLUSTER_ORDER) {
      const items = filteredConcepts
        .filter((c) => c.cluster === cid)
        .sort((a, b) => a.order - b.order);
      if (items.length > 0) groups.push({ clusterId: cid, items });
    }
    return groups;
  }, [filteredConcepts]);

  return (
    <div className="w-full space-y-8">
      <div className="sheet flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a word you heard, like MCP"
            aria-label="Search the lessons"
            className="w-full rounded-lg border-2 border-ink bg-sheet py-3 pl-12 pr-12 text-xl text-ink placeholder:text-soft"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <button type="button" aria-pressed={pathOnly} onClick={() => setPathOnly((v) => !v)} className="key">
          Only my path
        </button>
      </div>
      {searching && (
        <p className="text-lg">Searching every lesson, not only your path, so a word like MCP still turns up.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          aria-pressed={selectedCluster === 'all'}
          onClick={() => setSelectedCluster('all')}
          className="key"
        >
          Every group
        </button>
        {CLUSTER_ORDER.map((cid) => {
          const isSelected = selectedCluster === cid;
          return (
            <button
              key={cid}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedCluster(isSelected ? 'all' : cid)}
              className="key"
            >
              {CLUSTERS[cid].name}
            </button>
          );
        })}
      </div>

      {groupedConcepts.length === 0 ? (
        <div className="sheet px-6 py-14 text-center">
          <p className="font-display text-4xl">No lesson matches that.</p>
          <p className="mt-3 text-xl">Try harness, MCP, or memory.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {groupedConcepts.map(({ clusterId, items }) => {
            const cluster = CLUSTERS[clusterId];
            return (
              <section key={clusterId} className="space-y-5">
                <div className="border-b-2 border-ink pb-3">
                  <h2 className="font-display text-4xl leading-tight">
                    {cluster.name} <span className="font-mono text-2xl text-accent">{items.length}</span>
                  </h2>
                  <p className="mt-1 text-xl">{cluster.tagline}.</p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {items.map((concept) => {
                    const isMastered = masteredIds.includes(concept.id);
                    const isSolved = challengeSolvedIds.includes(concept.id);

                    return (
                      <button
                        key={concept.id}
                        type="button"
                        onClick={() => onSelectConcept(concept)}
                        className="key group h-full flex-col items-stretch justify-start gap-0 p-5 text-left font-normal"
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-display text-3xl font-semibold leading-tight">{concept.title}</span>
                          <ArrowRight className="mt-2 h-6 w-6 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                        <span className="mt-3 block text-lg leading-relaxed">{concept.plainExplanation}</span>
                        {(isMastered || isSolved) && (
                          <span className="mt-4 flex flex-wrap gap-2">
                            {isMastered && (
                              <span className="tab tab-accent"><Check className="mr-1 h-4 w-4" aria-hidden="true" /> Learned</span>
                            )}
                            {isSolved && <span className="tab">Checked</span>}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
