import React, { useState } from 'react';
import type {
  AttachSpec, FormSpec, GateSpec, GridSpec, LoopSpec, MapSpec, MatrixSpec, PickerSpec,
} from '../toys';
import {
  Choice, DragSlip, Flow, Key, Lever, MachineProps, Meter, Outcome, Part, Slip, Stamp, cx,
} from '../kit';

/* =====================================================================
   Gate: send something along the track and see whether it is stopped
   ===================================================================== */

type GateWhere = 'through' | 'blocked' | 'held' | 'denied';

export const Gate: React.FC<MachineProps<GateSpec>> = ({ play, toy }) => {
  const [mode, setMode] = useState(0);
  const [sent, setSent] = useState<{ item: number; where: GateWhere; gated: boolean } | null>(null);
  const [happened, setHappened] = useState('Nothing yet. Pick something to send.');

  const item = sent ? toy.items[sent.item] : null;
  const atGate = sent && sent.where !== 'through';

  const send = (i: number) => {
    const it = toy.items[i];
    if (mode === 0) {
      setSent({ item: i, where: 'through', gated: false });
      setHappened(it.open);
    } else if (it.gate === 'pass') {
      setSent({ item: i, where: 'through', gated: true });
      setHappened(it.passed ?? it.open);
    } else if (it.gate === 'block') {
      setSent({ item: i, where: 'blocked', gated: true });
      setHappened(it.blocked ?? '');
    } else {
      setSent({ item: i, where: 'held', gated: true });
      setHappened(it.held ?? '');
    }
  };

  return (
    <div>
      <Choice
        label="Is there a gate"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => {
          setMode(m);
          setSent(null);
          setHappened(m === 0 ? 'You took the gate away. Send something.' : 'You put a gate on the track. Send something.');
        }}
      />

      <div className="mt-5 grid items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Part name={toy.from}>
          {toy.items.map((it, i) => (
            <Key
              key={it.key}
              className="w-full justify-start text-left"
              on={sent?.item === i}
              onClick={() => send(i)}
            >
              {it.key}
            </Key>
          ))}
        </Part>

        <Flow live={!!sent} />

        {mode === 0 ? (
          <div className="flex min-h-[120px] items-center justify-center rounded-md border-2 border-dashed border-ink/50 p-3 text-center text-lg font-bold">
            No gate. The track is open.
          </div>
        ) : (
          <Part name={toy.gate} note="Everything stops here first." lit={!!atGate}>
            {atGate && item && (
              <Slip key={`${sent.item}-${sent.where}`} tone="live" className="pop">
                <p>{item.slip}</p>
                {sent.where === 'blocked' && <p className="mt-2"><Stamp good>Blocked</Stamp></p>}
                {sent.where === 'denied' && <p className="mt-2"><Stamp good>Denied</Stamp></p>}
                {sent.where === 'held' && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Key
                      onClick={() => {
                        setSent({ ...sent, where: 'through' });
                        setHappened(item.allowed ?? '');
                      }}
                    >
                      Allow
                    </Key>
                    <Key
                      tone="accent"
                      onClick={() => {
                        setSent({ ...sent, where: 'denied' });
                        setHappened(item.denied ?? '');
                      }}
                    >
                      Deny
                    </Key>
                  </div>
                )}
              </Slip>
            )}
            {!atGate && <p className="text-base">Waiting for the next thing to check.</p>}
          </Part>
        )}

        <Flow live={sent?.where === 'through'} />

        <Part name={toy.to} lit={sent?.where === 'through'}>
          {sent?.where === 'through' && item ? (
            <Slip key={`${sent.item}-${mode}`} tone="live" className="pop">
              <p className="font-bold">{item.slip}</p>
              <p className="mt-2">{item.arrive}</p>
              <p className="mt-2">
                <Stamp good={!item.harm}>{item.harm ? 'Harm done' : 'No harm'}</Stamp>
              </p>
            </Slip>
          ) : (
            <p className="text-base">{sent ? 'Nothing arrived.' : 'Nothing has arrived yet.'}</p>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={sent && sent.where !== 'held' ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Form: a sentence for a person, or blanks a program can read
   ===================================================================== */

export const Form: React.FC<MachineProps<FormSpec>> = ({ play, toy }) => {
  const [mode, setMode] = useState(0);
  const [asked, setAsked] = useState<number | null>(null);
  const [handed, setHanded] = useState(false);
  const [rows, setRows] = useState<{ ok: boolean; values: string[] }[]>([]);
  const [happened, setHappened] = useState('Nothing yet. Ask for something.');

  const current = asked != null ? toy.cases[asked] : null;
  const ok = mode === 1;

  const ask = (i: number) => {
    setAsked(i);
    setHanded(false);
    setHappened(
      mode === 0
        ? 'The model replied with a friendly sentence. Now hand it over.'
        : 'The model replied by filling in the blanks. Now hand it over.'
    );
  };

  const hand = () => {
    if (!current) return;
    setHanded(true);
    setRows([...rows, { ok, values: current.values }]);
    setHappened(ok ? toy.okHappened : toy.failHappened);
  };

  return (
    <div>
      <Choice
        label="The shape of the reply"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => {
          setMode(m);
          setAsked(null);
          setHanded(false);
          setHappened(m === 0 ? 'The model will answer in a sentence. Ask for something.' : 'The model must fill in a form now. Ask for something.');
        }}
      />

      <div className="mt-4 flex flex-wrap gap-3">
        {toy.cases.map((c, i) => (
          <Key key={c.key} on={asked === i} onClick={() => ask(i)}>{c.key}</Key>
        ))}
      </div>

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <Part name="The model's reply">
          {!current ? (
            <Slip tone="dead">Nothing asked yet.</Slip>
          ) : mode === 0 ? (
            <Slip key={`s-${asked}`} tone="live" className="pop">“{current.sentence}”</Slip>
          ) : (
            <div key={`f-${asked}`} className="pop space-y-2">
              {toy.fields.map((field, i) => (
                <div key={field} className="flex items-stretch overflow-hidden rounded-md border-2 border-ink">
                  <span className="flex w-24 shrink-0 items-center bg-ink px-3 text-base font-bold text-sheet">{field}</span>
                  <span className="min-w-0 flex-1 break-words bg-sheet px-3 py-2 font-mono text-base font-semibold">
                    {current.values[i]}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Key tone="accent" disabled={!current || handed} onClick={hand}>{toy.handKey}</Key>
        </Part>

        <Part name={toy.reader} note={`It only understands: ${toy.fields.join(', ')}.`} lit={handed && ok}>
          {toy.table ? (
            <table className="w-full border-collapse text-left text-base">
              <thead>
                <tr>
                  {toy.fields.map((f) => (
                    <th key={f} className="border-2 border-ink bg-ink px-3 py-1.5 font-bold text-sheet">{f}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr><td colSpan={toy.fields.length} className="border-2 border-ink px-3 py-2">No rows yet.</td></tr>
                )}
                {rows.map((row, i) => (
                  <tr key={i} className={i === rows.length - 1 ? 'pop' : ''}>
                    {row.ok ? (
                      row.values.map((v, j) => (
                        <td key={j} className="border-2 border-ink px-3 py-1.5 font-mono font-semibold">{v}</td>
                      ))
                    ) : (
                      <td colSpan={toy.fields.length} className="border-2 border-ink bg-accent px-3 py-1.5 font-bold text-onaccent">
                        ✗ {toy.fail}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : !handed || !current ? (
            <Slip tone="dead">Waiting for something it can read.</Slip>
          ) : ok ? (
            <Slip key={`ok-${asked}`} tone="live" className="pop">
              <p>{current.result}</p>
              <p className="mt-2"><Stamp good>It ran</Stamp></p>
            </Slip>
          ) : (
            <Slip key={`no-${asked}`} className="pop">
              <p>{toy.fail}</p>
              <p className="mt-2"><Stamp>Nothing ran</Stamp></p>
            </Slip>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={handed ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Attach: put one thing in front of the model, then ask
   ===================================================================== */

const Screenshot: React.FC<{ spotted: boolean }> = ({ spotted }) => (
  <div className="relative mx-auto w-[168px] rounded-xl border-2 border-ink bg-sheet px-3 pb-4 pt-3 text-left text-ink" aria-label="A phone screen where the Buy button overlaps the title">
    <span className="mx-auto mb-2 block h-1.5 w-10 rounded-full bg-ink" aria-hidden="true" />
    <p className="font-display text-xl leading-tight">Summer sale starts today</p>
    <span className="relative -mt-3 ml-12 inline-block rounded-md border-2 border-ink bg-ink px-4 py-1 text-base font-bold text-sheet">
      Buy
    </span>
    {spotted && (
      <span className="pop absolute left-[44px] top-[52px] h-[52px] w-[96px] rounded-full border-4 border-accent" aria-hidden="true" />
    )}
  </div>
);

export const Attach: React.FC<MachineProps<AttachSpec>> = ({ play, toy }) => {
  const [on, setOn] = useState(false);
  const [log, setLog] = useState<{ q: number; on: boolean }[]>([]);
  const [happened, setHappened] = useState(
    `Nothing yet. Ask as things are, or drag “${toy.thing}” across first. Pressing it works too.`
  );

  const latest = log[log.length - 1];
  const earlier = log.length > 1 ? log[log.length - 2] : null;
  const showEarlier = earlier && latest && earlier.q === latest.q && earlier.on !== latest.on;

  const move = (next: boolean) => {
    if (next === on) return;
    setOn(next);
    setHappened(next ? toy.attached : toy.detached);
  };

  const ask = (q: number) => {
    setLog([...log, { q, on }]);
    setHappened(on ? toy.asks[q].happenedWith : toy.asks[q].happenedWithout);
  };

  const thing = (
    <div className="space-y-3">
      <DragSlip
        label={`${toy.thing}. Press to ${on ? 'take it back' : 'hand it over'}.`}
        onDrop={(id) => move(id === 'target')}
        onPress={() => move(!on)}
      >
        {toy.thing}
      </DragSlip>
      {toy.look === 'picture' ? (
        <Screenshot spotted={!!latest?.on && on} />
      ) : (
        <ul
          className={cx(
            'rounded-md border-2 border-ink bg-sheet px-3 py-2 text-base leading-snug',
            toy.look === 'file' && 'font-mono',
            toy.look === 'note' && '-rotate-1 font-display text-lg',
          )}
        >
          {toy.body.map((line) => <li key={line}>{line}</li>)}
        </ul>
      )}
    </div>
  );

  const reply = (entry: { q: number; on: boolean }) => {
    const text = entry.on ? toy.asks[entry.q].with : toy.asks[entry.q].without;
    return toy.mono ? <pre className="whitespace-pre-wrap font-mono text-base font-semibold">{text}</pre> : <p>“{text}”</p>;
  };

  return (
    <div>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <div data-drop="tray" className="well min-h-[150px]">
          <p className="mb-3 text-lg font-bold">{toy.tray}</p>
          {!on ? thing : <p className="text-base">Empty. You handed it over.</p>}
        </div>

        <Part name="The model" note="The same model the whole time. Nothing inside it changes." lit={on}>
          <div
            data-drop="target"
            className={cx('rounded-md border-2 p-3', on ? 'border-accent bg-accent/10' : 'border-dashed border-ink/50')}
          >
            <p className="mb-3 text-base font-bold">{toy.target}</p>
            {on ? thing : <p className="text-base">Nothing here.</p>}
          </div>
        </Part>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {toy.asks.map((a, i) => (
          <Key key={a.q} tone="accent" className="justify-start text-left" onClick={() => ask(i)}>
            {toy.asks.length > 1 || a.q.startsWith('Shopper') ? a.q : `Ask: ${a.q}`}
          </Key>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {latest ? (
          <Slip
            key={log.length}
            tone="live"
            className="pop"
            label={`Now, ${latest.on ? 'with' : 'without'} “${toy.thing}”`}
          >
            {reply(latest)}
          </Slip>
        ) : (
          <Slip tone="dead" label="The model's reply">Nothing asked yet.</Slip>
        )}
        {showEarlier && earlier && (
          <Slip tone="dead" label={`Before, ${earlier.on ? 'with' : 'without'} it`}>{reply(earlier)}</Slip>
        )}
      </div>

      <Outcome play={play} choice={latest ? (latest.on ? 1 : 0) : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Picker: choose what goes in, then see what comes out
   ===================================================================== */

export const Picker: React.FC<MachineProps<PickerSpec>> = ({ play, toy }) => {
  const preset = (m: number) =>
    toy.items.map((it) => (toy.modes[m].preset === 'all' ? true : toy.modes[m].preset === 'good' ? it.good : false));

  const [mode, setMode] = useState(0);
  const [picked, setPicked] = useState<boolean[]>(() => preset(0));
  const [result, setResult] = useState<{ text: string; lines: { text: string; ok: boolean }[]; good: boolean; mode: number; n: number } | null>(null);
  const [happened, setHappened] = useState(`Nothing yet. ${toy.modes[0].note}`);

  const locked = toy.modes[mode].locked;

  const go = () => {
    const junk = toy.items.some((it, i) => picked[i] && !it.good);
    const missing = toy.items.filter((it, i) => it.good && !picked[i]);
    const none = !picked.some(Boolean);
    const kind = none ? 'empty' : junk ? 'junk' : missing.length ? 'missing' : 'perfect';
    const left = missing.map((m) => m.label.toLowerCase()).join(', ');
    const lines = none
      ? []
      : toy.items
          .filter((it) => it.out)
          .map((it) => {
            const i = toy.items.indexOf(it);
            return picked[i]
              ? { text: it.out as string, ok: true }
              : { text: `Nothing here. Nobody said: ${it.label.toLowerCase()}.`, ok: false };
          });
    setResult({
      text: toy[kind].text.replace('{x}', left),
      lines,
      good: kind === 'perfect',
      mode,
      n: (result?.n ?? 0) + 1,
    });
    setHappened(toy[kind].happened);
  };

  return (
    <div>
      <Choice
        label="How it is set up"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => {
          setMode(m);
          setPicked(preset(m));
          setResult(null);
          setHappened(toy.modes[m].note);
        }}
      />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <Part name={toy.pool} note={toy.modes[mode].note}>
          <div className="grid gap-3">
            {toy.items.map((it, i) => (
              <Key
                key={it.label}
                on={picked[i]}
                aria-disabled={locked}
                className={cx('justify-start text-left', locked && 'cursor-not-allowed')}
                onClick={() => {
                  if (locked) {
                    setHappened('These are fixed in this setup. Switch to the other one to choose for yourself.');
                    return;
                  }
                  setPicked(picked.map((p, j) => (j === i ? !p : p)));
                  setHappened(`You ${picked[i] ? 'took out' : 'put in'}: ${it.label.toLowerCase()}.`);
                }}
              >
                <span aria-hidden="true" className="font-mono">{picked[i] ? '☑' : '☐'}</span>
                {it.label}
              </Key>
            ))}
          </div>
        </Part>

        <Part name={toy.out} lit={!!result?.good}>
          <Key tone="accent" onClick={go}>{toy.goKey}</Key>
          {result ? (
            <Slip key={result.n} tone={result.good ? 'live' : 'plain'} className="pop">
              {result.lines.length > 0 && (
                <ul className="mb-2 space-y-1 font-mono text-base">
                  {result.lines.map((l) => (
                    <li key={l.text} className={l.ok ? 'font-semibold' : 'bg-accent px-1 text-onaccent'}>{l.text}</li>
                  ))}
                </ul>
              )}
              {result.text && <p>{result.text}</p>}
              <p className="mt-2"><Stamp good={result.good}>{result.good ? 'Useful' : 'Not good enough'}</Stamp></p>
            </Slip>
          ) : (
            <Slip tone="dead">Nothing written yet.</Slip>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={result ? result.mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Loop: step round a three-stop track, with or without a rule to stop
   ===================================================================== */

export const Loop: React.FC<MachineProps<LoopSpec>> = ({ play, toy }) => {
  const [mode, setMode] = useState(0);
  const [n, setN] = useState(0);
  const [limit, setLimit] = useState<number | null>(null);

  const run = toy.runs[mode];
  const cap = run.limits ? (limit ?? run.limits[Math.min(1, run.limits.length - 1)]) : null;
  const len = run.script?.length ?? run.cycle?.length ?? 1;
  const stepAt = (k: number) => (run.script ? run.script[k] : (run.cycle ?? [])[k % len]);
  const laps = run.cycle ? Math.floor(n / len) : 0;
  const done = run.script ? n >= len : cap != null && laps >= cap;
  const now = n > 0 ? stepAt(n - 1) : null;
  const nagging = !!run.cycle && cap == null && laps >= 3;
  const cents = toy.cents ? laps * toy.cents : null;

  const recent = Array.from({ length: Math.min(n, 4) }, (_, i) => {
    const k = n - Math.min(n, 4) + i;
    return { k, text: stepAt(k).text };
  });

  let happened = 'Nothing yet. Press the key to take one step.';
  if (done) happened = run.end;
  else if (nagging && n % len === 0) happened = run.nag ?? '';
  else if (now) happened = now.text;

  return (
    <div>
      <Choice
        label="Which kind"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setN(0); setLimit(null); }}
      />

      {run.limits && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-lg font-bold">Rule: stop after this many failed tries</span>
          {run.limits.map((l) => (
            <Key key={l} on={cap === l} className="min-w-[52px] font-mono" onClick={() => { setLimit(l); setN(0); }}>
              {l}
            </Key>
          ))}
        </div>
      )}

      <div className="mt-5 rounded-md border-2 border-ink bg-sheet p-3 sm:p-4">
        <div className="grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
          {toy.stops.map((name, i) => {
            const active = !done && now?.at === i;
            return (
              <React.Fragment key={name}>
                {i > 0 && <Flow live={active} />}
                <div
                  className={cx(
                    'flex min-h-[64px] items-center gap-2 rounded-md border-2 px-3 py-2 text-lg font-bold leading-tight',
                    active ? 'border-accent bg-accent text-onaccent' : 'border-ink'
                  )}
                >
                  <span className="font-mono">{i + 1}</span>
                  {name}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <p className="mt-2 text-center font-mono text-base font-semibold" aria-hidden="true">
          ↺ then back to 1
        </p>
      </div>

      <div className="mt-4 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <Slip label="What it has done" tone={n ? 'live' : 'dead'}>
          {n === 0 ? (
            <p>Nothing yet.</p>
          ) : (
            <ol className="space-y-1">
              {recent.map((r) => (
                <li key={r.k} className={r.k === n - 1 ? 'pop font-bold' : ''}>
                  <span className="font-mono">{r.k + 1}.</span> {r.text}
                </li>
              ))}
              {done && <li className="pop font-bold">■ Stopped.</li>}
            </ol>
          )}
        </Slip>
        <div className="space-y-2 text-lg font-bold">
          {run.cycle && <p>Failed tries: <span className="font-mono text-accent">{laps}</span></p>}
          {run.script && <p>Steps taken: <span className="font-mono text-accent">{n}</span></p>}
          {cents != null && (
            <p>Bill so far: <span className="font-mono text-accent">${(cents / 100).toFixed(2)}</span></p>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Key tone="accent" disabled={done} onClick={() => setN(n + 1)}>
          {done ? 'It has stopped' : toy.key}
        </Key>
      </div>

      <Outcome play={play} choice={done || nagging ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Grid: one square per test. Run them and count.
   ===================================================================== */

function failing(size: number, fails: number, seed: number): Set<number> {
  const order = Array.from({ length: size }, (_, i) => i);
  let s = seed * 9301 + 49297;
  for (let i = size - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return new Set(order.slice(0, fails));
}

export const Grid: React.FC<MachineProps<GridSpec>> = ({ play, toy }) => {
  const [mode, setMode] = useState(0);
  const [ran, setRan] = useState<string[]>([]);
  const [happened, setHappened] = useState('Nothing yet. Every square is a case nobody has checked.');
  const [lastMode, setLastMode] = useState<number | null>(null);

  const all = toy.modes.flatMap((m, mi) => m.runs.map((r, ri) => ({ id: `${mi}-${ri}`, mi, run: r })));
  const shown = all.filter((r) => ran.includes(r.id));

  return (
    <div>
      <Choice
        label="How you check"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened('You switched. Run it and compare with what is already on the bench.'); }}
      />

      <p className="mt-4 text-lg leading-snug">{toy.modes[mode].note}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        {toy.modes[mode].runs.map((r, ri) => (
          <Key
            key={r.key}
            tone="accent"
            onClick={() => {
              const id = `${mode}-${ri}`;
              setRan([...ran.filter((x) => x !== id), id]);
              setHappened(r.happened);
              setLastMode(mode);
            }}
          >
            {r.key}
          </Key>
        ))}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {shown.length === 0 && (
          <Slip tone="dead" label={`${toy.size} cases`}>
            <Squares size={toy.size} tested={0} fails={new Set()} />
            <p className="mt-2">None checked.</p>
          </Slip>
        )}
        {shown.map(({ id, run }) => {
          const fails = failing(run.cells, run.cells - run.pass, run.seed);
          const newest = ran[ran.length - 1] === id;
          return (
            <Slip key={id} tone={newest ? 'live' : 'plain'} className={newest ? 'pop' : ''} label={run.title}>
              <Squares size={toy.size} tested={run.cells} fails={fails} />
              <p className="mt-2 font-bold">
                <span className="font-mono text-accent">{run.pass}</span> of {run.cells} {toy.goodWord}
                {run.cells < toy.size && `. ${toy.size - run.cells} never checked.`}
              </p>
            </Slip>
          );
        })}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-base font-bold">
        <span><span className="mr-1 inline-block h-4 w-4 rounded-sm bg-ink align-middle" /> {toy.goodWord}</span>
        <span><span className="mr-1 inline-block h-4 w-4 rounded-sm bg-accent align-middle" /> {toy.badWord}</span>
        <span><span className="mr-1 inline-block h-4 w-4 rounded-sm border-2 border-dashed border-ink/50 align-middle" /> never checked</span>
      </p>

      <Outcome play={play} choice={lastMode}>{happened}</Outcome>
    </div>
  );
};

const Squares: React.FC<{ size: number; tested: number; fails: Set<number> }> = ({ size, tested, fails }) => (
  <div className="grid w-fit grid-cols-10 gap-1" aria-hidden="true">
    {Array.from({ length: size }, (_, i) => (
      <span
        key={i}
        className={cx(
          'h-[18px] w-[18px] rounded-sm',
          i >= tested ? 'border-2 border-dashed border-ink/40' : fails.has(i) ? 'bg-accent' : 'bg-ink'
        )}
      />
    ))}
  </div>
);

/* =====================================================================
   Map: notes placed by meaning. Compare by letters, or by where they sit.
   ===================================================================== */

const STOP_WORDS = new Set(['the', 'is', 'a', 'in', 'my', 'of']);
const words = (s: string) => s.toLowerCase().split(/[^a-z]+/).filter((w) => w && !STOP_WORDS.has(w));
const ASPECT = 1.6;

export const MapToy: React.FC<MachineProps<MapSpec>> = ({ play, toy }) => {
  const ownNotes = !toy.probes;
  const probes = toy.probes ?? toy.notes;
  const [mode, setMode] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const probe = picked != null ? probes[picked] : null;

  const rows = toy.notes.map((note, i) => {
    const self = ownNotes && picked === i;
    const shared = probe && !self ? words(note.text).filter((w) => words(probe.text).includes(w)) : [];
    const far = probe ? Math.hypot((note.x - probe.x) * ASPECT, note.y - probe.y) : 1;
    const hit = !!probe && !self && (mode === 0 ? shared.length > 0 : far <= toy.reach);
    return { note, i, self, shared, far, hit };
  });
  const hits = rows.filter((r) => r.hit);

  let happened = `Nothing yet. ${toy.pick}.`;
  if (probe) {
    if (mode === 0) {
      happened = hits.length === 0
        ? `Matching letters, “${probe.text}” shares no words with any ${ownNotes ? 'other ' : ''}note, so nothing came up.`
        : `Matching letters, only ${hits.length === 1 ? 'one note shares' : `${hits.length} notes share`} a word with “${probe.text}”. The rest were skipped.`;
    } else {
      happened = `By meaning, ${hits.length} ${hits.length === 1 ? 'note sits' : 'notes sit'} close to “${probe.text}” on the map, even though the words are different.`;
    }
  }

  return (
    <div>
      <Choice
        label="How notes are compared"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={setMode}
      />

      {!ownNotes && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-lg font-bold">{toy.pick}</span>
          {probes.map((p, i) => (
            <Key key={p.text} on={picked === i} onClick={() => setPicked(i)}>“{p.text}”</Key>
          ))}
        </div>
      )}

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <div>
          <div className="grid-paper relative w-full overflow-hidden rounded-md border-2 border-ink bg-sheet" style={{ aspectRatio: `${ASPECT}` }}>
            {probe && mode === 1 && (
              <span
                className="pop absolute rounded-full border-[3px] border-accent bg-accent/15"
                style={{
                  width: `${((toy.reach * 2) / ASPECT) * 100}%`,
                  height: `${toy.reach * 2 * 100}%`,
                  left: `${(probe.x - toy.reach / ASPECT) * 100}%`,
                  top: `${(probe.y - toy.reach) * 100}%`,
                }}
                aria-hidden="true"
              />
            )}
            {rows.map((r) => (
              <span
                key={r.note.text}
                aria-hidden="true"
                className={cx(
                  'absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-base font-semibold',
                  r.self || r.hit ? 'border-accent bg-accent text-onaccent' : 'border-ink bg-sheet'
                )}
                style={{ left: `${r.note.x * 100}%`, top: `${r.note.y * 100}%` }}
              >
                {r.i + 1}
              </span>
            ))}
            {probe && !ownNotes && (
              <span
                aria-hidden="true"
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-ink bg-accent"
                style={{ left: `${probe.x * 100}%`, top: `${probe.y * 100}%` }}
              />
            )}
          </div>
          <p className="mt-2 text-base leading-snug">
            {mode === 0
              ? 'Letters do not know where a note sits on this map.'
              : 'Each note is a pair of numbers, and the numbers are its place on this map. A real one uses hundreds of numbers per note.'}
          </p>
        </div>

        <ol className="space-y-2">
          {ownNotes && <li className="text-lg font-bold">{toy.pick}</li>}
          {rows.map((r) => {
            const verdict = !probe
              ? ''
              : r.self
                ? 'the one you picked'
                : mode === 0
                  ? r.shared.length ? `shares the word “${r.shared[0]}”` : 'no words in common'
                  : r.far <= toy.reach ? 'close by' : 'far away';
            const body = (
              <>
                <span className="font-mono">{r.i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{r.note.text}</span>
                  <span className="block text-base font-semibold">
                    {mode === 1 && <span className="font-mono">[{r.note.x.toFixed(2)}, {r.note.y.toFixed(2)}] </span>}
                    {verdict}
                  </span>
                </span>
              </>
            );
            const tone = r.self || r.hit ? 'border-accent bg-accent/15' : 'border-ink bg-sheet';
            return (
              <li key={r.note.text}>
                {ownNotes ? (
                  <button
                    type="button"
                    aria-pressed={picked === r.i}
                    onClick={() => setPicked(r.i)}
                    className={cx('flex w-full items-start gap-3 rounded-md border-2 px-3 py-2 text-left text-lg leading-tight', tone)}
                  >
                    {body}
                  </button>
                ) : (
                  <div className={cx('flex items-start gap-3 rounded-md border-2 px-3 py-2 text-lg leading-tight', tone)}>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <Outcome play={play} choice={probe ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Matrix: a few questions, a switch or two, and what each pairing gives
   ===================================================================== */

export const Matrix: React.FC<MachineProps<MatrixSpec>> = ({ play, toy }) => {
  const [sw, setSw] = useState<boolean[]>(() => toy.switches.map(() => false));
  const [log, setLog] = useState<{ a: number; on: boolean }[]>([]);
  const [happened, setHappened] = useState('Nothing yet. Ask a question, then flip a switch and ask it again.');

  const latest = log[log.length - 1];
  const earlier = log.length > 1 ? log[log.length - 2] : null;
  const showEarlier = earlier && latest && earlier.a === latest.a && earlier.on !== latest.on;

  const side = (e: { a: number; on: boolean }) => (e.on ? toy.asks[e.a].on : toy.asks[e.a].off);

  const result = (e: { a: number; on: boolean }, live: boolean) => {
    const ask = toy.asks[e.a];
    const s = side(e);
    return (
      <Slip
        key={live ? log.length : 'before'}
        tone={live ? 'live' : 'dead'}
        className={live ? 'pop' : ''}
        label={`${live ? 'Now' : 'Before'}, with ${toy.switches[ask.needs].toLowerCase()} ${e.on ? 'on' : 'off'}`}
      >
        {e.on && (
          <div className="mb-3 rounded-md border-2 border-dashed border-ink/60 px-3 py-2">
            <p className="text-base font-bold">{ask.on.slipName}</p>
            <ul className="font-mono text-base">
              {ask.on.slip.map((l) => <li key={l}>{l}</li>)}
            </ul>
          </div>
        )}
        <p>“{s.reply}”</p>
        <p className="mt-2"><Stamp good={s.good}>{s.good ? 'Holds up' : toy.flagBad}</Stamp></p>
        {s.meters && toy.meterNames && (
          <div className="mt-3 space-y-2">
            {s.meters.map((m, i) => (
              <Meter key={i} label={toy.meterNames?.[i] ?? ''} value={m.value} text={m.text} hot={m.value > 0.6} />
            ))}
          </div>
        )}
      </Slip>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-x-8 gap-y-3">
        {toy.switches.map((name, i) => (
          <Lever
            key={name}
            label={name}
            on={sw[i]}
            onChange={(on) => {
              setSw(sw.map((v, j) => (j === i ? on : v)));
              setHappened(`You switched ${name.toLowerCase()} ${on ? 'on' : 'off'}. Ask again and compare.`);
            }}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {toy.asks.map((a, i) => (
          <Key
            key={a.q}
            tone="accent"
            className="justify-start text-left"
            onClick={() => {
              const e = { a: i, on: sw[a.needs] };
              setLog([...log, e]);
              setHappened(side(e).happened);
            }}
          >
            Ask: {a.q}
          </Key>
        ))}
      </div>

      <div className="mt-4 grid items-start gap-3 md:grid-cols-2">
        {latest ? result(latest, true) : <Slip tone="dead" label="The reply">Nothing asked yet.</Slip>}
        {showEarlier && earlier && result(earlier, false)}
      </div>

      <Outcome play={play} choice={latest ? (toy.point === 'ask' ? latest.a : latest.on ? 1 : 0) : null}>
        {happened}
      </Outcome>
    </div>
  );
};
