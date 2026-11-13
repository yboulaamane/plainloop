import React, { useState } from 'react';
import {
  Choice, Flow, Key, Lamp, Lever, MachineProps, Meter, Outcome, Part, Pips, Slip, Stamp, cx,
} from '../kit';

type Solo<K extends string> = MachineProps<{ kind: K }>;

/* =====================================================================
   Flow chart: a bot that wanders, or a path somebody drew
   ===================================================================== */

export const FlowChart: React.FC<Solo<'flow'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [looked, setLooked] = useState(false);
  const [draft, setDraft] = useState<null | 'right' | 'wrong'>(null);
  const [sent, setSent] = useState<null | 'bot' | 'person'>(null);
  const [happened, setHappened] = useState(
    'Nothing yet. You are the bot. No path is drawn, so every step is open. Press any of them.'
  );

  const reset = (m: number) => {
    setMode(m);
    setLooked(false);
    setDraft(null);
    setSent(null);
    setHappened(
      m === 0
        ? 'No path is drawn. You are the bot, and every step is open. Press any of them.'
        : 'Someone drew the path. Only the next step on it is open.'
    );
  };

  const lookUp = () => {
    setHappened(looked ? 'The bot looked up the order again. Nothing stops it repeating a step.' : 'The bot looked up the order.');
    setLooked(true);
  };
  const write = () => {
    setDraft(looked ? 'right' : 'wrong');
    setHappened(
      looked
        ? mode === 1
          ? 'The bot drafted the email. The path says the next step is to stop and wait for a person.'
          : 'The bot drafted the email.'
        : 'The bot drafted the email before looking up the order, so the draft is about the wrong thing.'
    );
  };
  const send = (who: 'bot' | 'person') => {
    setSent(who);
    if (who === 'person') {
      setHappened('You read the draft and pressed send yourself. The bot could not have done that step alone.');
    } else if (!draft) {
      setHappened('The bot hit send because that seemed like the next step. There was no email written yet.');
    } else if (draft === 'wrong') {
      setHappened('The bot sent an email about the wrong order. Nobody checked it.');
    } else {
      setHappened('The bot researched, wrote, and hit send because that seemed like the next step. Nobody checked the email.');
    }
  };

  const drawn = mode === 1;
  const open = [
    !sent && (!drawn || !looked),
    !sent && (!drawn || (looked && !draft)),
    !sent && (!drawn || !!draft),
  ];

  return (
    <div>
      <Choice label="Who decides the next step" options={play.choices.map((c) => c.label)} value={mode} onChange={reset} />

      <div className="mt-5 grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Key className="min-h-[72px]" on={looked} disabled={!open[0]} onClick={lookUp}>
          {drawn && <span className="font-mono">1</span>} Look up the order
        </Key>
        {drawn ? <Flow live={looked} /> : <span className="hidden sm:block sm:w-6" />}
        <Key className="min-h-[72px]" on={!!draft} disabled={!open[1]} onClick={write}>
          {drawn && <span className="font-mono">2</span>} Draft the email
        </Key>
        {drawn ? <Flow live={!!draft} /> : <span className="hidden sm:block sm:w-6" />}
        {drawn ? (
          <div className={cx('rounded-md border-2 p-3', draft && !sent ? 'border-accent' : 'border-ink')}>
            <p className="text-lg font-bold leading-tight"><span className="font-mono">3</span> Stop. Wait for a person.</p>
            <Key tone="accent" className="mt-3 w-full" disabled={!open[2]} onClick={() => send('person')}>
              You: press send
            </Key>
          </div>
        ) : (
          <Key className="min-h-[72px]" on={!!sent} disabled={!open[2]} onClick={() => send('bot')}>
            Send the email
          </Key>
        )}
      </div>
      <p className="mt-2 text-base font-bold">
        {drawn ? 'The arrows are the only way through.' : 'No arrows. The bot picks whatever seems next.'}
      </p>

      <Slip className="mt-4" label="The email" tone={sent ? 'live' : draft ? 'plain' : 'dead'}>
        <p className="font-mono text-base">
          Order: {looked ? '#118, one blue lamp' : 'not looked up'}
        </p>
        <p className="mt-1">
          {draft === 'right' && '“Hi Maya, your blue lamp ships on Friday.”'}
          {draft === 'wrong' && '“Hi customer, your item will ship at some point.”'}
          {!draft && 'Not written yet.'}
        </p>
        {sent && (
          <p className="mt-2">
            <Stamp good={sent === 'person'}>{sent === 'person' ? 'Sent by a person' : 'Sent unchecked'}</Stamp>
          </p>
        )}
      </Slip>

      <Outcome play={play} choice={sent ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Screen: an old website with no other way in
   ===================================================================== */

const MOVES = [
  { say: 'It looks at a picture of the screen. It can see a Billing tab.', look: true },
  { say: 'It moves the pointer and clicks Billing.', page: 'billing' as const, point: 'billing' },
  { say: 'It looks at the new picture. Now there is an Export button.', look: true },
  { say: 'It clicks Export invoices.', exported: true, point: 'export' },
  { say: 'It looks once more to check. The file was downloaded.', look: true },
];

export const Screen: React.FC<Solo<'screen'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [page, setPage] = useState<'home' | 'billing'>('home');
  const [exported, setExported] = useState(false);
  const [step, setStep] = useState(0);
  const [advice, setAdvice] = useState(false);
  const [happened, setHappened] = useState('Nothing yet. The invoices are behind the Billing tab of this old website.');

  const driving = mode === 1;
  const move = step > 0 ? MOVES[step - 1] : null;
  const done = driving && step >= MOVES.length;

  const reset = (m: number) => {
    setMode(m); setPage('home'); setExported(false); setStep(0); setAdvice(false);
    setHappened(m === 0 ? 'The model can only talk. The website is yours to click.' : 'The model has the mouse now. Press the key for each move.');
  };

  const userClick = (what: 'home' | 'billing' | 'export') => {
    if (driving) {
      setHappened('The model is driving. Use the key below to let it make its next move.');
      return;
    }
    if (what === 'export') {
      setExported(true);
      setHappened('You clicked Export yourself. The model only told you how.');
    } else {
      setPage(what);
      setHappened(`You clicked ${what === 'home' ? 'Home' : 'Billing'} yourself.`);
    }
  };

  const next = () => {
    const m = MOVES[step];
    if (m.page) setPage(m.page);
    if (m.exported) setExported(true);
    setStep(step + 1);
    setHappened(m.say);
  };

  const pointer = (id: string) =>
    driving && move?.point === id ? (
      <span className="pop ml-2 rounded-sm bg-accent px-1.5 font-mono text-base font-semibold text-onaccent">◀ the model</span>
    ) : null;

  const tab = (id: 'home' | 'billing', label: string) => (
    <button
      type="button"
      onClick={() => userClick(id)}
      aria-current={page === id ? 'page' : undefined}
      className={cx(
        'rounded-t-md border-2 border-b-0 border-ink px-4 py-2 text-lg font-bold',
        page === id ? 'bg-ink text-sheet' : 'bg-sheet'
      )}
    >
      {label}{pointer(id)}
    </button>
  );

  return (
    <div>
      <Choice label="What the model may do" options={play.choices.map((c) => c.label)} value={mode} onChange={reset} />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className={cx('overflow-hidden rounded-md border-2 bg-sheet', driving && move?.look ? 'border-[4px] border-accent' : 'border-ink')}>
          <p className="border-b-2 border-ink px-3 py-1.5 font-mono text-base font-semibold">old-invoices.example</p>
          <div className="flex gap-2 border-b-2 border-ink px-3 pt-3">
            {tab('home', 'Home')}
            {tab('billing', 'Billing')}
          </div>
          <div className="min-h-[150px] p-4 text-lg">
            {page === 'home' ? (
              <p>Welcome back. Nothing to see on this page.</p>
            ) : (
              <>
                <p className="font-bold">Invoices: 14</p>
                <button
                  type="button"
                  onClick={() => userClick('export')}
                  className="mt-3 rounded-md border-2 border-ink bg-sheet px-4 py-2 text-lg font-bold underline"
                >
                  Export invoices
                </button>
                {pointer('export')}
                {exported && <p className="pop mt-3 font-mono text-base font-semibold">↓ invoices.csv downloaded</p>}
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {driving ? (
            <>
              <Key tone="accent" disabled={done} onClick={next}>{done ? 'It has the file' : step === 0 ? 'Let it look at the screen' : 'Its next move'}</Key>
              <Pips total={MOVES.length} done={step} />
              <Slip label="What the model is doing" tone={move ? 'live' : 'dead'}>
                {move ? move.say : 'Waiting to start.'}
              </Slip>
            </>
          ) : (
            <>
              <Key tone="accent" onClick={() => { setAdvice(true); setHappened('The model explained which menus a person would click. It never clicked them.'); }}>
                Ask the model to get the invoices
              </Key>
              <Slip label="The model says" tone={advice ? 'live' : 'dead'}>
                {advice ? '“Click the Billing tab, then press Export invoices.”' : 'Not asked yet.'}
              </Slip>
              <p className="text-base font-bold">The website on the left is live. You can click it yourself.</p>
            </>
          )}
          <Lamp on={exported} label={exported ? 'You have the invoices' : 'No invoices yet'} />
        </div>
      </div>

      <Outcome play={play} choice={driving ? (done ? 1 : null) : advice ? 0 : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Fence: the same bad command, on your laptop or in a throwaway copy
   ===================================================================== */

const LAPTOP = ['tax-2025.pdf', 'passwords.txt', 'family-photos', 'my-project'];

export const Fence: React.FC<Solo<'fence'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [ran, setRan] = useState(false);
  const [fresh, setFresh] = useState(0);
  const [happened, setHappened] = useState('Nothing yet. The agent is about to run tests it just wrote. Choose where.');

  const boxed = mode === 1;
  const files = (list: string[], dead: boolean) => (
    <ul className="space-y-1 font-mono text-base font-semibold">
      {list.map((f) => (
        <li key={f} className={dead ? 'line-through opacity-50' : ''}>{dead ? '✗' : '▪'} {f}</li>
      ))}
    </ul>
  );

  return (
    <div>
      <Choice
        label="Where the agent runs"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => {
          setMode(m); setRan(false);
          setHappened(m === 0 ? 'The agent is working right on your laptop.' : 'The agent got a copy of the project inside a throwaway computer.');
        }}
      />

      <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2">
        <Part name="Your laptop" note={boxed ? 'The agent cannot reach in here.' : 'The agent is working in here.'} lit={!boxed}>
          {files(LAPTOP, ran && !boxed)}
          {ran && <Stamp good={boxed}>{boxed ? 'Untouched' : 'All of it gone'}</Stamp>}
        </Part>

        {boxed ? (
          <div className="rounded-md border-[4px] border-double border-ink bg-sheet p-3 sm:p-4">
            <p className="flex items-center gap-2 text-lg font-bold leading-tight">
              <span className="lamp lamp-on" aria-hidden="true" /> The sandbox
            </p>
            <p className="mt-1 text-base text-soft">A fenced, throwaway computer. The agent is working in here.</p>
            <div key={fresh} className="pop mt-3 space-y-3">
              {files(['my-project (a copy)'], ran)}
              {ran && <Stamp>The copy is gone</Stamp>}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-md border-2 border-dashed border-ink/50 p-4 text-center text-lg font-bold">
            No sandbox. Nothing stands between the agent and your files.
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Key
          tone="accent"
          disabled={ran}
          onClick={() => {
            setRan(true);
            setHappened(
              boxed
                ? 'A clean-up step in the tests went wrong and deleted everything it could reach. That was only the copy. Your real files stayed outside.'
                : 'A clean-up step in the tests went wrong and deleted everything it could reach. On your laptop, that was everything.'
            );
          }}
        >
          Let the agent run its tests
        </Key>
        {boxed && (
          <Key
            disabled={!ran}
            onClick={() => {
              setRan(false); setFresh(fresh + 1);
              setHappened('You threw the broken sandbox away and got a fresh one with a new copy. Nothing was lost.');
            }}
          >
            Throw the sandbox away, get a fresh one
          </Key>
        )}
      </div>

      <Outcome play={play} choice={ran ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Cache: the same 20 pages at the start of every call
   ===================================================================== */

export const CacheCalls: React.FC<Solo<'cache'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [calls, setCalls] = useState<[number, number]>([0, 0]);
  const [happened, setHappened] = useState('Nothing yet. Every call starts with the same 20-page brief, then one new question.');

  const n = calls[mode];
  const fullPages = (m: number, k: number) => (k === 0 ? 0 : m === 0 ? k * 21 : 21 + (k - 1));
  const rows = Array.from({ length: Math.min(n, 4) }, (_, i) => n - Math.min(n, 4) + i + 1);

  return (
    <div>
      <Choice
        label="What happens to the brief"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened('You switched. Make a few calls and compare the two tallies.'); }}
      />

      <div className="mt-5">
        <Key
          tone="accent"
          onClick={() => {
            const k = n + 1;
            setCalls(mode === 0 ? [k, calls[1]] : [calls[0], k]);
            setHappened(
              mode === 0
                ? k === 1
                  ? 'Call 1 paid full price to read all 20 pages, plus the question.'
                  : `Call ${k} paid full price for the same 20 pages again.`
                : k === 1
                  ? 'The first call paid full price to read the 20 pages, and that work was kept.'
                  : `Call ${k} reused the saved work on the brief and paid full price only for the new question.`
            );
          }}
        >
          Make a call
        </Key>
      </div>

      <div className="mt-4 space-y-2" aria-hidden="true">
        {rows.length === 0 && <p className="rounded-md border-2 border-dashed border-ink/50 p-3 text-lg">No calls yet.</p>}
        {rows.map((k) => {
          const reused = mode === 1 && k > 1;
          return (
            <div key={`${mode}-${k}`} className={cx('flex items-stretch gap-1', k === n && 'pop')}>
              <span className="flex w-16 shrink-0 items-center font-mono text-base font-semibold">Call {k}</span>
              <span
                className={cx(
                  'flex min-h-[44px] flex-1 items-center rounded-sm border-2 border-ink px-2 text-base font-bold',
                  reused ? 'border-dashed bg-sheet' : 'bg-ink text-sheet'
                )}
              >
                {reused ? '20 pages, reused' : '20 pages, full price'}
              </span>
              <span className="flex w-14 shrink-0 items-center justify-center rounded-sm border-2 border-accent bg-accent px-1 text-base font-bold text-onaccent">
                new
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[0, 1].map((m) => (
          <Slip key={m} tone={m === mode ? 'live' : 'dead'} label={play.choices[m].label}>
            <p>
              <span className="font-mono font-semibold">{calls[m]}</span> {calls[m] === 1 ? 'call' : 'calls'} ·{' '}
              <span className="font-mono font-semibold text-accent">{fullPages(m, calls[m])}</span> pages at full price
            </p>
            {m === 1 && calls[1] > 1 && <p className="text-base">Plus a small fee for each reuse.</p>}
          </Slip>
        ))}
      </div>

      <Outcome play={play} choice={n >= 2 ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Train once, ask forever
   ===================================================================== */

const QUICK_ANSWERS = ['“Paris.”', '“Here is your summary.”', '“Try restarting the router.”', '“It ships on Friday.”'];

export const TrainOnce: React.FC<Solo<'trainonce'>> = ({ play }) => {
  const [trained, setTrained] = useState(false);
  const [asks, setAsks] = useState(0);
  const [happened, setHappened] = useState('Nothing yet. There is no finished model, so there is nothing to ask.');

  return (
    <div>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <Part name={play.choices[0].label} note="A lab does this. You usually do not." lit={trained}>
          <Key
            tone="accent"
            disabled={trained}
            onClick={() => {
              setTrained(true);
              setHappened('The lab spent weeks teaching the model. That happened once, it was enormous, and it set every number inside.');
            }}
          >
            {trained ? 'Trained. The numbers are set.' : 'Train the model'}
          </Key>
          <Meter label="Computers running for weeks" value={trained ? 1 : 0} text={trained ? 'done, once' : 'not started'} hot />
          <p className="text-base font-bold">Paid by: the lab</p>
        </Part>

        <Part name={play.choices[1].label} note="Using the finished model. This is the part you do." lit={asks > 0}>
          <Key
            tone="accent"
            disabled={!trained}
            onClick={() => {
              const k = asks + 1;
              setAsks(k);
              setHappened(`You asked a question and the finished model answered. That is ${k} ${k === 1 ? 'reply' : 'replies'} on your bill.`);
            }}
          >
            Ask a question
          </Key>
          <Slip key={asks} tone={asks ? 'live' : 'dead'} className={asks ? 'pop' : ''}>
            {asks ? QUICK_ANSWERS[(asks - 1) % QUICK_ANSWERS.length] : trained ? 'Ready. Ask it something.' : 'Nothing to ask yet.'}
          </Slip>
          <div className="flex flex-wrap gap-1" aria-hidden="true">
            {Array.from({ length: Math.min(asks, 30) }, (_, i) => (
              <span key={i} className="h-4 w-4 rounded-full bg-accent" />
            ))}
          </div>
          <p className="text-base font-bold">
            Paid by: you · Replies on your bill: <span className="font-mono text-accent">{asks}</span>
          </p>
        </Part>
      </div>

      <Outcome play={play} choice={asks > 0 ? 1 : trained ? 0 : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Sorter: send each question to the cheapest thing that can answer it
   ===================================================================== */

type Need = 'saved' | 'small' | 'big';
const QUEUE: { q: string; need: Need }[] = [
  { q: 'What is your return policy?', need: 'saved' },
  { q: 'Do you ship to Canada?', need: 'small' },
  { q: 'What is your return policy?', need: 'saved' },
  { q: 'My order came broken and I was charged twice. What are my options?', need: 'big' },
  { q: 'What is your return policy?', need: 'saved' },
  { q: 'What time do you close?', need: 'small' },
];
const BINS: { id: Need; name: string; cents: number }[] = [
  { id: 'saved', name: 'A saved answer', cents: 0 },
  { id: 'small', name: 'The small model', cents: 1 },
  { id: 'big', name: 'The big model', cents: 10 },
];

export const Sorter: React.FC<Solo<'sorter'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [at, setAt] = useState<[number, number]>([0, 0]);
  const [spent, setSpent] = useState<[number, number]>([0, 0]);
  const [happened, setHappened] = useState('Nothing yet. Six questions are waiting. These prices are pretend: free, 1¢, and 10¢.');

  const i = at[mode];
  const done = i >= QUEUE.length;
  const current = done ? null : QUEUE[i];
  const bump = (cents: number) => {
    setAt(mode === 0 ? [i + 1, at[1]] : [at[0], i + 1]);
    setSpent(mode === 0 ? [spent[0] + cents, spent[1]] : [spent[0], spent[1] + cents]);
  };

  const route = (bin: Need) => {
    if (!current) return;
    if (bin === 'saved') {
      if (current.need !== 'saved') {
        setHappened('There is no saved answer for that one. It still needs a model.');
        return;
      }
      bump(0);
      setHappened('That question has been answered hundreds of times, so the saved answer went out. Cost: nothing.');
    } else if (bin === 'small') {
      if (current.need === 'big') {
        bump(11);
        setHappened('The small model gave a weak answer, so the question had to go to the big model anyway. You paid for both.');
      } else {
        bump(1);
        setHappened(
          current.need === 'saved'
            ? 'It worked, but you paid a model for an answer you already had saved.'
            : 'An easy question went to the small model. A good answer for 1¢.'
        );
      }
    } else {
      bump(10);
      setHappened(
        current.need === 'big'
          ? 'A hard question went to the big model. This is where it earns its price.'
          : mode === 0
            ? 'The big model answered. Great answer, and 10¢ for a question that did not need it.'
            : 'A great answer, and ten times what that question needed.'
      );
    }
  };

  return (
    <div>
      <Choice
        label="How questions are handled"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened(m === 0 ? 'Every question goes to the big model.' : 'You decide where each question goes.'); }}
      />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Slip key={`${mode}-${i}`} className="pop" tone={current ? 'live' : 'dead'} label={current ? `Question ${i + 1} of ${QUEUE.length}` : 'All six answered'}>
            {current ? `“${current.q}”` : 'The queue is empty.'}
          </Slip>
          {mode === 0 ? (
            <Key tone="accent" disabled={done} onClick={() => route('big')}>Send it to the big model</Key>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {BINS.map((b) => (
                <Key key={b.id} disabled={done} className="flex-col" onClick={() => route(b.id)}>
                  <span>{b.name}</span>
                  <span className="font-mono">{b.cents === 0 ? 'free' : `${b.cents}¢`}</span>
                </Key>
              ))}
            </div>
          )}
          <Pips total={QUEUE.length} done={Math.min(i, QUEUE.length)} />
        </div>

        <div className="space-y-3">
          {[0, 1].map((m) => (
            <Meter
              key={m}
              label={play.choices[m].label}
              value={spent[m] / 60}
              text={`${spent[m]}¢`}
              hot={m === mode}
            />
          ))}
          <p className="text-base font-bold">The bar is full at 60¢: six questions, all sent to the big model.</p>
        </div>
      </div>

      <Outcome play={play} choice={done ? mode : null}>
        {done && mode === 1 ? `${happened} All six done for ${spent[1]}¢.` : happened}
      </Outcome>
    </div>
  );
};

/* =====================================================================
   Fine-tune: say the rule every time, or build the habit in
   ===================================================================== */

export const FineTune: React.FC<Solo<'finetune'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [rule, setRule] = useState(true);
  const [examples, setExamples] = useState(0);
  const [reply, setReply] = useState<{ greet: boolean; n: number } | null>(null);
  const [happened, setHappened] = useState('Nothing yet. The shop wants every reply to open with its greeting.');

  const set = examples >= 300;

  const ask = () => {
    const greet = mode === 0 ? rule : set;
    setReply({ greet, n: (reply?.n ?? 0) + 1 });
    setHappened(
      mode === 0
        ? greet
          ? 'You pasted the rule into this message, so the greeting showed up. It lasts for this one message only.'
          : 'The rule was left out this time, and the tone slipped. A prompt only lasts for that call.'
        : greet
          ? 'You asked without repeating the rule, and the greeting came anyway. The model itself has changed.'
          : 'You asked without the rule and got no greeting. The model has not seen enough examples for the habit to stick.'
    );
  };

  return (
    <div>
      <Choice
        label="How the greeting gets in"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setReply(null); setHappened(m === 0 ? 'The rule has to ride along with every message.' : 'Show the model replies that already sound right, then ask.'); }}
      />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <Part name={mode === 0 ? 'This message' : 'Teaching the model'} lit={mode === 1 && set}>
          {mode === 0 ? (
            <>
              <Lever
                label="Paste the greeting rule in"
                on={rule}
                onChange={(on) => { setRule(on); setHappened(on ? 'The rule is in this message.' : 'You forgot to paste the rule this time.'); }}
                onText="yes"
                offText="forgot"
              />
              <Slip tone={rule ? 'plain' : 'dead'}>
                {rule && <p className="font-mono text-base">Rule: open with “Ahoy from Pip’s Shop!”</p>}
                <p>“Where is my order?”</p>
              </Slip>
            </>
          ) : (
            <>
              <Key
                disabled={examples >= 500}
                onClick={() => {
                  const next = examples + 100;
                  setExamples(next);
                  setHappened(
                    `You showed the model ${next} replies that already sound right. ${
                      next >= 300 ? 'The habit has set.' : 'Not enough yet for the habit to stick.'
                    }`
                  );
                }}
              >
                Show it 100 good replies
              </Key>
              <Meter label="How strong the habit is" value={examples / 500} text={`${examples} examples`} limit={0.6} hot={set} />
              <p className="text-base font-bold">It sticks at the red line.</p>
            </>
          )}
        </Part>

        <Part name="The model's reply">
          <Key tone="accent" onClick={ask}>
            {mode === 0 ? 'Send the message' : 'Ask, without repeating the rule'}
          </Key>
          {reply ? (
            <Slip key={reply.n} tone="live" className="pop">
              <p>“{reply.greet && <span className="bg-accent px-1 text-onaccent">Ahoy from Pip’s Shop!</span>} Your order ships on Friday.”</p>
              <p className="mt-2"><Stamp good={reply.greet}>{reply.greet ? 'Greeting used' : 'No greeting'}</Stamp></p>
            </Slip>
          ) : (
            <Slip tone="dead">Nothing asked yet.</Slip>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={reply ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Distill: a big teacher, a small student
   ===================================================================== */

export const Distill: React.FC<Solo<'distill'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [taught, setTaught] = useState(0);
  const [served, setServed] = useState<[number, number]>([0, 0]);
  const [happened, setHappened] = useState('Nothing yet. The huge model is great, slow, and costly. The small one has learned nothing.');

  const sharp = taught === 0 ? 0.15 : Math.min(0.86, 0.3 + taught * 0.19);

  return (
    <div>
      <Choice
        label="Which model answers users"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened(m === 0 ? 'Every user gets the huge model.' : 'First the big model has to teach the small one.'); }}
      />

      <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2">
        <Part name="The huge model" note="The teacher." lit={mode === 0}>
          <Meter label="How sharp" value={0.95} text="great" />
          <Meter label="Wait for one answer" value={0.9} text="8 seconds" hot />
          <Meter label="Cost of one answer" value={0.9} text="10¢" hot />
          {mode === 0 ? (
            <Key
              tone="accent"
              onClick={() => {
                setServed([served[0] + 1, served[1]]);
                setHappened('The huge model gave a great answer. The wait and the bill stayed high too.');
              }}
            >
              Answer a user
            </Key>
          ) : (
            <Key
              disabled={taught >= 3}
              onClick={() => {
                const t = taught + 1;
                setTaught(t);
                setHappened(
                  t >= 3
                    ? 'The big model has answered 3,000 questions and the small one trained on all of them. It is nearly as sharp as its teacher. Not quite.'
                    : `The big model answered ${t},000 questions, and the small model trained on those answers. It got sharper.`
                );
              }}
            >
              Answer 1,000 questions for the student
            </Key>
          )}
          <p className="text-base font-bold">Users answered: <span className="font-mono text-accent">{served[0]}</span></p>
        </Part>

        <Part name="The small model" note="The student." lit={mode === 1 && taught > 0}>
          <Meter label="How sharp" value={sharp} text={taught === 0 ? 'untaught' : taught >= 3 ? 'nearly as good' : 'learning'} limit={0.95} />
          <Meter label="Wait for one answer" value={0.12} text="1 second" />
          <Meter label="Cost of one answer" value={0.1} text="1¢" />
          {mode === 1 && (
            <Key
              tone="accent"
              disabled={taught === 0}
              onClick={() => {
                setServed([served[0], served[1] + 1]);
                setHappened(
                  taught >= 3
                    ? 'The small model answered in about a second, for a fraction of the cost. It is a bit less sharp than its teacher.'
                    : 'The small model answered fast and cheap, but it has not studied enough yet. The answer was rough.'
                );
              }}
            >
              Answer a user
            </Key>
          )}
          <p className="text-base font-bold">Users answered: <span className="font-mono text-accent">{served[1]}</span></p>
        </Part>
      </div>

      <Outcome play={play} choice={mode === 0 ? (served[0] ? 0 : null) : served[1] ? 1 : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Synthetic data: wait for real examples, or have a model write them
   ===================================================================== */

const INVENTED = [
  '“Refund please. Order #7714 never came and I am furious.”',
  '“hi the kettle arrived cracked?? no order number sorry”',
  '“I was promised a refund TWICE. Fix this today.”',
];

export const Synth: React.FC<Solo<'synth'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [months, setMonths] = useState(0);
  const [real, setReal] = useState(12);
  const [made, setMade] = useState(0);
  const [checked, setChecked] = useState(false);
  const [happened, setHappened] = useState('Nothing yet. You need 1,000 tricky support emails. You have 12.');

  const total = real + made;

  return (
    <div>
      <Choice
        label="Where the examples come from"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened(m === 0 ? 'You wait for customers to write in.' : 'You ask a strong model to write practice emails.'); }}
      />

      <div className="mt-5 space-y-4">
        <Meter
          label="Examples you have"
          value={total / 1000}
          text={`${total.toLocaleString('en-US')} of 1,000`}
          hot={total >= 1000}
        />
        <p className="text-lg font-bold">
          From real people: <span className="font-mono text-accent">{real}</span> · Written by a model:{' '}
          <span className="font-mono text-accent">{made}</span> · Months waited: <span className="font-mono text-accent">{months}</span>
        </p>

        <div className="flex flex-wrap gap-3">
          {mode === 0 ? (
            <Key
              tone="accent"
              onClick={() => {
                const m = months + 1;
                const lucky = m % 3 === 0;
                setMonths(m);
                if (lucky) setReal(real + 1);
                setHappened(
                  lucky
                    ? `Another month passed, and one new tricky email came in. You have ${real + 1 + made}.`
                    : `A month passed. No tricky emails came in. You still have ${total}.`
                );
              }}
            >
              Wait a month
            </Key>
          ) : (
            <>
              <Key
                tone="accent"
                disabled={made >= 1000}
                onClick={() => {
                  setMade(made + 250);
                  setChecked(false);
                  setHappened(`A strong model wrote 250 realistic emails in a few minutes: refunds, angry tone, missing order numbers. You have ${total + 250} now.`);
                }}
              >
                Have a model write 250
              </Key>
              <Key
                disabled={made === 0 || checked}
                onClick={() => {
                  setChecked(true);
                  setHappened('You read a handful to make sure they look like real emails. Now the set is ready to practise on.');
                }}
              >
                Check a sample
              </Key>
            </>
          )}
        </div>

        {mode === 1 && made > 0 && (
          <Slip tone={checked ? 'live' : 'plain'} className="pop" label="A few of the invented ones">
            <ul className="space-y-1">
              {INVENTED.map((line) => <li key={line}>{line}</li>)}
            </ul>
            {checked && <p className="mt-2"><Stamp good>Checked by you</Stamp></p>}
          </Slip>
        )}
      </div>

      <Outcome play={play} choice={mode === 0 ? (months >= 2 ? 0 : null) : made > 0 ? 1 : null}>{happened}</Outcome>
    </div>
  );
};
