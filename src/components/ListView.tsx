import React, { useState, useMemo } from 'react';
import { Concept, ClusterId } from '../types';
import { CLUSTERS } from '../data/clustersData';
import { Search, ArrowRight, X } from 'lucide-react';

interface Props {
  concepts: Concept[];
  onSelectConcept: (concept: Concept) => void;
  masteredIds: string[];
  challengeSolvedIds: string[];
  activePathConceptIds: string[];
}

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
    const clusterOrder: ClusterId[] = [
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

    for (const cid of clusterOrder) {
      const items = filteredConcepts
        .filter((c) => c.cluster === cid)
        .sort((a, b) => a.order - b.order);
      if (items.length > 0) {
        groups.push({ clusterId: cid, items });
      }
    }

    return groups;
  }, [filteredConcepts]);

  return (
    <div className="w-full space-y-8">
      <div className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-mute" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons, like MCP, harness, or memory"
            className="w-full rounded-full border border-rule bg-canvas py-3 pl-12 pr-12 text-lg text-ink placeholder:text-mute focus:border-moss focus:outline-none dark:border-white/10 dark:bg-night dark:text-cream"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-mute hover:text-ink dark:hover:text-cream"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setPathOnly((v) => !v)}
          className={`rounded-full px-5 py-3 text-base font-semibold ${
            pathOnly
              ? 'bg-moss text-cream'
              : 'border border-rule text-ink dark:border-white/10 dark:text-cream'
          }`}
        >
          {pathOnly ? 'This path only' : 'All lessons'}
        </button>
      </div>
      {searching && (
        <p className="text-base text-mute">Searching every path, so a term like MCP still turns up.</p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCluster('all')}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-base font-semibold ${
            selectedCluster === 'all'
              ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
              : 'border border-rule bg-card text-mute dark:border-white/10 dark:bg-nightcard'
          }`}
        >
          Every island
        </button>
        {(Object.keys(CLUSTERS) as ClusterId[]).map((cid) => {
          const info = CLUSTERS[cid];
          const isSelected = selectedCluster === cid;
          return (
            <button
              key={cid}
              onClick={() => setSelectedCluster(isSelected ? 'all' : cid)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-base font-semibold ${
                isSelected
                  ? 'border-transparent bg-ink text-cream dark:bg-cream dark:text-ink'
                  : 'border-rule bg-card text-mute hover:text-ink dark:border-white/10 dark:bg-nightcard dark:hover:text-cream'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: info.color }} />
              {info.name}
            </button>
          );
        })}
      </div>

      {groupedConcepts.length === 0 ? (
        <div className="panel px-8 py-16 text-center">
          <p className="font-display text-3xl">No matching lessons</p>
          <p className="mt-2 text-lg text-mute">Try harness, MCP, or memory.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedConcepts.map(({ clusterId, items }) => {
            const cluster = CLUSTERS[clusterId];
            return (
              <section key={clusterId} className="space-y-4">
                <div className="flex flex-col gap-1 border-b border-rule pb-3 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="flex items-center gap-3 font-display text-3xl">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cluster.color }} />
                    {cluster.name}
                    <span className="text-lg text-mute">{items.length}</span>
                  </h2>
                  <p className="text-base text-mute">{cluster.tagline}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {items.map((concept) => {
                    const isMastered = masteredIds.includes(concept.id);
                    const isSolved = challengeSolvedIds.includes(concept.id);

                    return (
                      <button
                        key={concept.id}
                        onClick={() => onSelectConcept(concept)}
                        className="panel group flex h-full flex-col p-6 text-left transition hover:-translate-y-0.5 hover:border-moss/40"
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${cluster.badgeBg}`}>
                            {cluster.name}
                          </span>
                          {isMastered && (
                            <span className="rounded-full bg-moss/10 px-3 py-1 text-sm font-semibold text-moss dark:text-mossbright">
                              Learned
                            </span>
                          )}
                          {isSolved && (
                            <span className="rounded-full bg-clay/10 px-3 py-1 text-sm font-semibold text-clay">
                              Checked
                            </span>
                          )}
                        </div>
                        <h3 className="flex items-start justify-between gap-3 font-display text-3xl leading-tight group-hover:text-moss dark:group-hover:text-mossbright">
                          <span>{concept.title}</span>
                          <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-mute transition group-hover:translate-x-1" />
                        </h3>
                        <p className="mt-3 text-lg leading-relaxed text-mute">
                          {concept.plainExplanation}
                        </p>
                        <p className="mt-4 rounded-2xl bg-canvas px-4 py-3 text-base italic text-ink dark:bg-night dark:text-cream">
                          {concept.analogy.headline}
                        </p>
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
