import React from 'react';
import { Map, List, Sun, Moon, Play, Pause, Gift } from 'lucide-react';

interface Props {
  activeView: 'map' | 'list';
  onToggleView: (view: 'map' | 'list') => void;
  reducedMotion: boolean;
  onToggleMotion: () => void;
  masteredCount: number;
  totalConcepts: number;
  solvedCount: number;
  onOpenFreeApis: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeView,
  onToggleView,
  reducedMotion,
  onToggleMotion,
  masteredCount,
  totalConcepts,
  solvedCount,
  onOpenFreeApis,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const views = (
    <>
      <button type="button" aria-pressed={activeView === 'map'} onClick={() => onToggleView('map')} className="key">
        <Map className="h-5 w-5" aria-hidden="true" /> Map
      </button>
      <button type="button" aria-pressed={activeView === 'list'} onClick={() => onToggleView('list')} className="key">
        <List className="h-5 w-5" aria-hidden="true" /> Lessons
      </button>
    </>
  );

  return (
    <header className="top-0 z-40 border-b-2 border-ink bg-bench md:sticky">
      <div className="mx-auto max-w-7xl px-4 pb-3 pt-3 sm:px-8">
        <div className="flex items-center gap-3">
          <a href="#top" className="mr-auto flex min-w-0 items-center gap-3 rounded-md">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink" aria-hidden="true">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-[5px] border-sheet">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </span>
            <span className="min-w-0">
              <span className="font-display block text-3xl leading-none tracking-tight">Plainloop</span>
              <span className="mt-1 block text-base font-semibold leading-tight">AI in plain terms.</span>
            </span>
          </a>

          <p className="hidden shrink-0 text-lg font-bold lg:block">
            <span className="font-mono text-accent">{masteredCount}</span> of {totalConcepts} learned
            {solvedCount > 0 && <span> · <span className="font-mono text-accent">{solvedCount}</span> checked</span>}
          </p>

          <div className="hidden items-center gap-3 md:flex">
            {views}
            <button type="button" onClick={onOpenFreeApis} className="key">
              <Gift className="h-5 w-5" aria-hidden="true" /> Free APIs
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            className="key key-round shrink-0"
            aria-label={isDark ? 'Switch to light paper' : 'Switch to dark paper'}
            title={isDark ? 'Light paper' : 'Dark paper'}
          >
            {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onToggleMotion}
            className="key key-round hidden shrink-0 sm:inline-flex"
            aria-label={reducedMotion ? 'Let the map drift' : 'Hold the map still'}
            title={reducedMotion ? 'Let the map drift' : 'Hold the map still'}
          >
            {reducedMotion ? <Play className="h-5 w-5" aria-hidden="true" /> : <Pause className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 md:hidden">
          {views}
          <button type="button" onClick={onOpenFreeApis} className="key">
            <Gift className="h-5 w-5" aria-hidden="true" /> APIs
          </button>
        </div>
        <p className="mt-3 text-base font-bold lg:hidden">
          <span className="font-mono text-accent">{masteredCount}</span> of {totalConcepts} learned
        </p>
      </div>
    </header>
  );
};
