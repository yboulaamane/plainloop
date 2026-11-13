import React from 'react';
import { LearningPath, LearningPathId } from '../types';
import { Compass, MessageSquare, Code, Bot } from 'lucide-react';

interface Props {
  paths: LearningPath[];
  selectedPathId: LearningPathId;
  onSelectPath: (pathId: LearningPathId) => void;
}

const ICONS: Record<LearningPathId, React.ReactNode> = {
  all: <Compass className="h-6 w-6" aria-hidden="true" />,
  chatbots: <MessageSquare className="h-6 w-6" aria-hidden="true" />,
  'coding-assistants': <Code className="h-6 w-6" aria-hidden="true" />,
  agents: <Bot className="h-6 w-6" aria-hidden="true" />,
};

export const LearningPathBanner: React.FC<Props> = ({
  paths,
  selectedPathId,
  onSelectPath,
}) => {
  return (
    <section aria-label="Pick a path">
      <p className="text-xl font-bold">Pick where to start.</p>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {paths.map((path) => (
          <button
            key={path.id}
            type="button"
            aria-pressed={path.id === selectedPathId}
            onClick={() => onSelectPath(path.id)}
            className="key h-full flex-col items-start justify-start gap-2 p-4 text-left"
          >
            <span className="flex items-center gap-3">
              {ICONS[path.id]}
              <span className="font-display text-2xl leading-tight">{path.title}</span>
            </span>
            <span className="text-base font-normal leading-snug">{path.description}</span>
            <span className="mt-auto font-mono text-base font-semibold">{path.conceptIds.length} lessons</span>
          </button>
        ))}
      </div>
    </section>
  );
};
