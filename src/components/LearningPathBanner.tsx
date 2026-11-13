import React from 'react';
import { LearningPath, LearningPathId } from '../types';
import { Compass, MessageSquare, Code, Bot } from 'lucide-react';

interface Props {
  paths: LearningPath[];
  selectedPathId: LearningPathId;
  onSelectPath: (pathId: LearningPathId) => void;
}

const ICONS: Record<LearningPathId, React.ReactNode> = {
  all: <Compass className="h-6 w-6" />,
  chatbots: <MessageSquare className="h-6 w-6" />,
  'coding-assistants': <Code className="h-6 w-6" />,
  agents: <Bot className="h-6 w-6" />,
};

export const LearningPathBanner: React.FC<Props> = ({
  paths,
  selectedPathId,
  onSelectPath,
}) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {paths.map((path) => {
        const selected = path.id === selectedPathId;
        return (
          <button
            key={path.id}
            onClick={() => onSelectPath(path.id)}
            className={`flex h-full flex-col items-start gap-3 rounded-[28px] border p-5 text-left transition ${
              selected
                ? 'border-moss bg-moss text-cream shadow-card'
                : 'border-rule bg-card text-ink hover:-translate-y-0.5 hover:border-moss/40 dark:border-white/10 dark:bg-nightcard dark:text-cream'
            }`}
          >
            <span className={selected ? 'text-cream' : 'text-moss dark:text-mossbright'}>
              {ICONS[path.id]}
            </span>
            <span>
              <span className="font-display block text-2xl leading-tight">{path.title}</span>
              <span className={`mt-2 block text-base leading-snug ${selected ? 'text-cream/90' : 'text-mute'}`}>
                {path.description}
              </span>
            </span>
            <span className={`mt-auto text-sm font-semibold uppercase tracking-[0.14em] ${selected ? 'text-cream/80' : 'text-moss dark:text-mossbright'}`}>
              {path.conceptIds.length} lessons
            </span>
          </button>
        );
      })}
    </div>
  );
};
