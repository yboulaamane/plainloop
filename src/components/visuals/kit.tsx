import React, { useRef, useState } from 'react';
import type { Playground } from './playgrounds';

/*
  The parts every playground is built from.
  A toy is a machine: keys you press, a lever you flip, lamps that light,
  slips of paper it prints. Nothing here knows about any one lesson.
*/

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(' ');

/* ---------- Key: a button with thickness ---------- */

type KeyProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Pass true/false for a key that stays down. Leave out for a plain push key. */
  on?: boolean;
  tone?: 'paper' | 'accent';
};

export const Key: React.FC<KeyProps> = ({ on, tone = 'paper', className, children, ...rest }) => (
  <button
    type="button"
    aria-pressed={on}
    className={cx('key', tone === 'accent' && 'key-accent', className)}
    {...rest}
  >
    {children}
  </button>
);

/* ---------- Choice: pick one of a few. Arrow keys move, like a radio. ---------- */

interface ChoiceProps {
  label: string;
  options: string[];
  value: number;
  onChange: (index: number) => void;
  className?: string;
}

export const Choice: React.FC<ChoiceProps> = ({ label, options, value, onChange, className }) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step =
      e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 :
      e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('grid gap-3', options.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3', className)}
    >
      {options.map((option, index) => {
        const checked = index === value;
        return (
          <button
            key={option}
            ref={(el) => { refs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (value < 0 && index === 0) ? 0 : -1}
            onClick={() => onChange(index)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className="key justify-start text-left sm:justify-center sm:text-center"
          >
            <span
              aria-hidden="true"
              className={cx(
                'h-3 w-3 shrink-0 rounded-full border-2',
                checked ? 'border-accent bg-accent' : 'border-ink bg-transparent'
              )}
            />
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ---------- Lever: on or off ---------- */

interface LeverProps {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
  offText?: string;
  onText?: string;
  disabled?: boolean;
}

export const Lever: React.FC<LeverProps> = ({ label, on, onChange, offText = 'off', onText = 'on', disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    disabled={disabled}
    onClick={() => onChange(!on)}
    className={cx('lever', disabled && 'cursor-not-allowed opacity-50')}
  >
    <span className="lever-track" aria-hidden="true">
      <span className="lever-knob" />
    </span>
    <span>
      {label}: <span className={on ? 'text-accent' : ''}>{on ? onText : offText}</span>
    </span>
  </button>
);

/* ---------- Lamp ---------- */

export const Lamp: React.FC<{ on: boolean; label?: string; className?: string }> = ({ on, label, className }) => (
  <span className={cx('inline-flex items-center gap-2 text-base font-bold', className)}>
    <span className={cx('lamp', on && 'lamp-on')} aria-hidden="true" />
    {label && <span>{label}</span>}
  </span>
);

/* ---------- Slip: something a machine printed ---------- */

interface SlipProps {
  label?: React.ReactNode;
  tone?: 'plain' | 'live' | 'dead';
  mono?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const Slip: React.FC<SlipProps> = ({ label, tone = 'plain', mono, className, children }) => (
  <div className={cx('slip', tone === 'live' && 'slip-live', tone === 'dead' && 'slip-dead', className)}>
    {label && <p className="mb-1 text-base font-bold">{label}</p>}
    <div className={cx('min-w-0 break-words', mono && 'font-mono text-base')}>{children}</div>
  </div>
);

/* ---------- Meter: a bar with an optional limit line ---------- */

interface MeterProps {
  label: string;
  /** 0 to 1. Values above 1 are drawn as full. */
  value: number;
  text?: string;
  /** 0 to 1. Draws a line the bar should stay under. */
  limit?: number;
  limitText?: string;
  hot?: boolean;
}

export const Meter: React.FC<MeterProps> = ({ label, value, text, limit, limitText, hot }) => (
  <div>
    <div className="flex items-baseline justify-between gap-3 text-base font-bold">
      <span>{label}</span>
      {text && <span className="font-mono">{text}</span>}
    </div>
    <div className="relative mt-1 h-6 rounded-sm border-2 border-ink bg-sheet">
      <div
        className={cx('h-full', hot ? 'bg-accent' : 'bg-ink')}
        style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, transition: 'width 220ms ease-out' }}
      />
      {limit != null && (
        <div
          className="absolute -bottom-2 -top-2 w-[3px] bg-accent"
          style={{ left: `calc(${limit * 100}% - 1px)` }}
          aria-hidden="true"
        />
      )}
    </div>
    {limitText && <p className="mt-2 text-base">{limitText}</p>}
  </div>
);

/* ---------- Stamp: a verdict pressed onto the paper ---------- */

export const Stamp: React.FC<{ good?: boolean; children: React.ReactNode; className?: string }> = ({ good, children, className }) => (
  <span
    className={cx(
      'pop inline-block -rotate-2 rounded-sm border-2 px-2 py-0.5 font-mono text-base font-semibold uppercase',
      good ? 'border-accent bg-accent text-onaccent' : 'border-ink text-ink',
      className
    )}
  >
    {children}
  </span>
);

/* ---------- Part: a named box in a machine ---------- */

export const Part: React.FC<{ name: string; note?: string; lit?: boolean; className?: string; children?: React.ReactNode }> = ({
  name, note, lit, className, children,
}) => (
  <div className={cx('rounded-md border-2 bg-sheet p-3 sm:p-4', lit ? 'border-accent' : 'border-ink', className)}>
    <p className="flex flex-wrap items-center gap-x-2 text-lg font-bold leading-tight">
      {lit != null && <span className={cx('lamp', lit && 'lamp-on')} aria-hidden="true" />}
      {name}
    </p>
    {note && <p className="mt-1 text-base leading-snug text-soft">{note}</p>}
    {children && <div className="mt-3 space-y-3">{children}</div>}
  </div>
);

/* ---------- Outcome: the one sentence under every toy ---------- */

interface OutcomeProps {
  play: Playground;
  /** Which of the lesson's two choices this state shows. null hides the point. */
  choice?: number | null;
  children: React.ReactNode;
}

export const Outcome: React.FC<OutcomeProps> = ({ play, choice = null, children }) => {
  const point = choice != null ? play.choices[choice]?.so : null;
  return (
    <div className="mt-6 border-t-2 border-ink pt-4" aria-live="polite">
      <p className="tab">What just happened</p>
      <p className="mt-2 text-xl leading-snug" data-happened>{children}</p>
      {point && (
        <p key={point} className="pop mt-4 border-l-[6px] border-accent pl-4 font-display text-2xl leading-snug">
          {point}
        </p>
      )}
    </div>
  );
};

/* ---------- DragSlip: a slip you can drag onto a drop spot, or press ---------- */

interface DragSlipProps {
  /** Called with the `data-drop` id of whatever the slip was let go over. */
  onDrop: (dropId: string) => void;
  /** Called on a plain click, or Enter / Space. */
  onPress?: () => void;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export const DragSlip: React.FC<DragSlipProps> = ({ onDrop, onPress, label, className, children }) => {
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  const end = (e: React.PointerEvent, drop: boolean) => {
    const s = start.current;
    start.current = null;
    setOffset(null);
    document.body.style.userSelect = '';
    if (!s || !s.moved) return;
    justDragged.current = true;
    if (!drop) return;
    const hit = document
      .elementsFromPoint(e.clientX, e.clientY)
      .find((el) => el instanceof HTMLElement && el.dataset.drop);
    if (hit instanceof HTMLElement && hit.dataset.drop) onDrop(hit.dataset.drop);
  };

  return (
    <button
      type="button"
      aria-label={label}
      className={cx('drag-slip', className)}
      style={
        offset
          ? { transform: `translate(${offset.x}px, ${offset.y}px) rotate(-2deg)`, position: 'relative', zIndex: 30 }
          : undefined
      }
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        justDragged.current = false;
        start.current = { x: e.clientX, y: e.clientY, moved: false };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s) return;
        const x = e.clientX - s.x;
        const y = e.clientY - s.y;
        if (!s.moved && Math.hypot(x, y) < 6) return;
        if (!s.moved) {
          // Dragging a slip should never paint a text selection across the page.
          document.body.style.userSelect = 'none';
          window.getSelection()?.removeAllRanges();
        }
        s.moved = true;
        setOffset({ x, y });
      }}
      onPointerUp={(e) => end(e, true)}
      onPointerCancel={(e) => end(e, false)}
      onClick={() => {
        if (justDragged.current) {
          justDragged.current = false;
          return;
        }
        onPress?.();
      }}
    >
      <span aria-hidden="true" className="mr-2 font-mono">⠿</span>
      {children}
    </button>
  );
};

/* ---------- Small helpers ---------- */

/** Dotted row of step pips: where you are in a short sequence. */
export const Pips: React.FC<{ total: number; done: number; label?: string }> = ({ total, done, label }) => (
  <div className="flex items-center gap-2" aria-label={label ?? `Step ${done} of ${total}`}>
    {Array.from({ length: total }, (_, i) => (
      <span
        key={i}
        aria-hidden="true"
        className={cx('h-3 w-6 rounded-sm border-2 border-ink', i < done ? 'bg-accent' : 'bg-sheet')}
      />
    ))}
    <span className="ml-1 font-mono text-base font-semibold">{done} / {total}</span>
  </div>
);

/** An arrow that turns to point down on narrow screens. */
export const Flow: React.FC<{ live?: boolean; className?: string }> = ({ live, className }) => (
  <span
    aria-hidden="true"
    className={cx('flex items-center justify-center font-mono text-2xl font-semibold leading-none', live ? 'text-accent' : 'text-ink', className)}
  >
    <span className="sm:hidden">↓</span>
    <span className="hidden sm:inline">→</span>
  </span>
);

/** What every machine is handed: the lesson's words, and its own setup. */
export interface MachineProps<T> {
  play: Playground;
  toy: T;
}
