import React, { useEffect, useState } from 'react';
import { VisualDemoType } from '../../types';
import { PLAYGROUNDS } from './playgrounds';

interface Props {
  type: VisualDemoType;
  conceptId: string;
  conceptTitle: string;
}

export const ConceptVisualDemo: React.FC<Props> = ({ conceptId, conceptTitle }) => {
  const play = PLAYGROUNDS[conceptId];
  const [choice, setChoice] = useState(0);

  useEffect(() => {
    setChoice(0);
  }, [conceptId]);

  if (!play) {
    return (
      <div className="rounded-3xl border border-rule bg-canvas p-6 text-lg dark:border-white/10 dark:bg-night">
        <p className="font-semibold">{conceptTitle}</p>
        <p className="mt-2 text-mute">Click through the lesson above. This idea does not have its own toy yet.</p>
      </div>
    );
  }

  const selected = play.choices[choice] ?? play.choices[0];

  return (
    <div className="rounded-3xl border border-rule bg-canvas p-5 dark:border-white/10 dark:bg-night sm:p-6">
      <p className="text-xl leading-relaxed">{play.ask}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {play.choices.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setChoice(index)}
            className={`flex-1 rounded-full px-4 py-3 text-left text-lg font-semibold sm:text-center ${
              index === choice
                ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
                : 'border border-rule bg-card text-ink hover:border-moss dark:border-white/10 dark:bg-nightcard dark:text-cream'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-card p-5 dark:bg-nightcard">
        <ol className="space-y-2 text-lg leading-relaxed">
          {selected.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
        <p className="mt-4 border-t border-rule pt-4 text-lg font-semibold leading-relaxed text-moss dark:border-white/10 dark:text-mossbright">
          {selected.so}
        </p>
      </div>
    </div>
  );
};
