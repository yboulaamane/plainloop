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
  const viewClass = (on: boolean) =>
    `flex items-center justify-center gap-2 rounded-full px-3 py-2 text-base font-semibold ${
      on
        ? 'bg-ink text-cream dark:bg-cream dark:text-ink'
        : 'text-mute hover:text-ink dark:hover:text-cream'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-rule/80 bg-canvas/90 backdrop-blur-xl dark:border-white/10 dark:bg-night/85">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-8">
        <div className="flex items-center gap-3">
          <a href="#top" className="mr-auto flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-cream dark:bg-cream dark:text-ink">
              <span className="font-display text-2xl leading-none">P</span>
            </span>
            <span>
              <span className="font-display block text-2xl leading-none tracking-tight text-ink dark:text-cream">
                Plainloop
              </span>
              <span className="mt-1 hidden text-base text-mute sm:block">
                A field guide to modern AI
              </span>
              <span className="mt-1 block text-base text-mute sm:hidden">
                {masteredCount} / {totalConcepts} learned
              </span>
            </span>
          </a>

          <p className="hidden shrink-0 text-base text-mute sm:block">
            <span className="font-display text-2xl text-ink dark:text-cream">{masteredCount}</span>
            <span> / {totalConcepts}</span>
            {solvedCount > 0 && <span className="hidden md:inline"> · {solvedCount} checked</span>}
          </p>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex rounded-full border border-rule bg-card p-1 dark:border-white/10 dark:bg-nightcard">
              <button onClick={() => onToggleView('map')} className={viewClass(activeView === 'map')}>
                <Map className="h-4 w-4" /> Map
              </button>
              <button onClick={() => onToggleView('list')} className={viewClass(activeView === 'list')}>
                <List className="h-4 w-4" /> Lessons
              </button>
            </div>
            <button
              onClick={onOpenFreeApis}
              className="flex items-center gap-2 rounded-full border border-rule bg-card px-4 py-2 text-base font-semibold text-ink hover:border-moss dark:border-white/10 dark:bg-nightcard dark:text-cream"
            >
              <Gift className="h-4 w-4 text-moss dark:text-mossbright" />
              Free APIs
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule bg-card text-ink dark:border-white/10 dark:bg-nightcard dark:text-cream"
            aria-label={isDark ? 'Switch to light appearance' : 'Switch to dark appearance'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={onToggleMotion}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rule bg-card text-mute dark:border-white/10 dark:bg-nightcard"
            aria-label={reducedMotion ? 'Resume motion' : 'Pause motion'}
            title={reducedMotion ? 'Resume motion' : 'Pause motion'}
          >
            {reducedMotion ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 sm:hidden">
          <button onClick={() => onToggleView('map')} className={viewClass(activeView === 'map')}>
            <Map className="h-4 w-4" /> Map
          </button>
          <button onClick={() => onToggleView('list')} className={viewClass(activeView === 'list')}>
            <List className="h-4 w-4" /> Lessons
          </button>
          <button
            onClick={onOpenFreeApis}
            className="flex items-center justify-center gap-2 rounded-full border border-rule bg-card px-3 py-2 text-base font-semibold text-ink dark:border-white/10 dark:bg-nightcard dark:text-cream"
          >
            <Gift className="h-4 w-4 text-moss" /> APIs
          </button>
        </div>
      </div>
    </header>
  );
};
