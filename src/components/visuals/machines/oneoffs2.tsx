import React, { useState } from 'react';
import {
  Choice, DragSlip, Flow, Key, Lamp, Lever, MachineProps, Meter, Outcome, Part, Slip, Stamp, cx,
} from '../kit';

type Solo<K extends string> = MachineProps<{ kind: K }>;

/* =====================================================================
   Rank: you are the rater. The model becomes what you prefer.
   ===================================================================== */

const ROUNDS: [string, string][] = [
  [
    'Sure. First, find a thin strip of metal and…',
    'I can’t help with breaking into a car. If it is your car, a locksmith can open it.',
  ],
  [
    'No.',
    'I can’t help with that. Locked out of your own car? Roadside help or a locksmith is the legal way in.',
  ],
  [
    'Breaking into cars is wrong, and you should be ashamed for asking.',
    'I can’t walk you through that. If you are locked out, I can help you find a locksmith nearby.',
  ],
];

export const Rank: React.FC<Solo<'rank'>> = ({ play }) => {
  const [raw, setRaw] = useState(false);
  const [picks, setPicks] = useState<number[]>([]);
  const [tuned, setTuned] = useState(false);
  const [happened, setHappened] = useState('Nothing yet. Someone asks a raw model: “How do I break into a car?”');

  const round = picks.length;
  const finished = round >= ROUNDS.length;
  const kind = picks.filter((p) => p === 1).length;
  const tunedReply = picks[0] === 0
    ? 'Sure. First, find a thin strip of metal and…'
    : kind >= 2
      ? 'I can’t help with breaking into a car. If you are locked out of your own, a locksmith or roadside help is the legal way in.'
      : 'No. And you should be ashamed for asking.';

  return (
    <div>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <Part name={play.choices[0].label} note="It only continues the sentence.">
          <Key
            onClick={() => {
              setRaw(true);
              setHappened('The raw model simply carried on the sentence. Helpful and harmful look the same to it.');
            }}
          >
            Ask the raw model
          </Key>
          <Slip tone={raw ? 'plain' : 'dead'}>
            {raw ? '“Sure. First, find a thin strip of metal and…”' : 'Not asked yet.'}
          </Slip>
        </Part>

        <Part name={play.choices[1].label} lit={tuned}>
          <Meter label="How far it has been nudged" value={round / ROUNDS.length} text={`${round} of ${ROUNDS.length} rounds`} hot />
          <Key
            tone="accent"
            disabled={!finished}
            onClick={() => {
              setTuned(true);
              setHappened(
                picks[0] === 0
                  ? 'You rewarded the break-in answer, so the tuned model gives it. It learned exactly what you preferred.'
                  : kind >= 2
                    ? 'You kept preferring the answer that refuses and still helps. The tuned model now answers that way.'
                    : 'You preferred the cold answers, so the tuned model is cold. It learned your taste, not what is right.'
              );
            }}
          >
            Ask the tuned model
          </Key>
          <Slip key={String(tuned)} tone={tuned ? 'live' : 'dead'} className={tuned ? 'pop' : ''}>
            {tuned ? `“${tunedReply}”` : finished ? 'Ready. Ask it.' : 'Finish the three rounds first.'}
          </Slip>
        </Part>
      </div>

      <div className="mt-5">
        <p className="text-lg font-bold">
          {finished ? 'You ranked all three rounds.' : `Round ${round + 1} of ${ROUNDS.length}. You are the rater. Press the answer you would rather see.`}
        </p>
        {!finished && (
          <div key={round} className="pop mt-3 grid gap-3 md:grid-cols-2">
            {ROUNDS[round].map((answer, i) => (
              <Key
                key={answer}
                className="min-h-[96px] justify-start text-left font-normal"
                onClick={() => {
                  setPicks([...picks, i]);
                  setTuned(false);
                  setHappened(`You preferred answer ${i === 0 ? 'A' : 'B'}. The model was nudged a little toward answers like that one.`);
                }}
              >
                <span className="font-mono font-semibold">{i === 0 ? 'A' : 'B'}</span>
                <span>“{answer}”</span>
              </Key>
            ))}
          </div>
        )}
      </div>

      <Outcome play={play} choice={tuned ? 1 : raw && round === 0 ? 0 : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Chopper: type a sentence, see the chunks the model reads
   ===================================================================== */

const PAGE =
  'Thank you for your order. Your package will leave our warehouse within two working days. ' +
  'You will get a tracking link by email as soon as it ships. If anything arrives damaged, ' +
  'reply to this message with a photograph and we will send a replacement immediately.';

function chop(text: string): string[] {
  const parts = text.match(/[A-Za-z0-9’']+|[^\sA-Za-z0-9’']/g) ?? [];
  return parts.flatMap((word) => {
    if (word.length <= 4) return [word];
    const pieces = Math.ceil(word.length / 4);
    const base = Math.floor(word.length / pieces);
    let extra = word.length % pieces;
    const out: string[] = [];
    let i = 0;
    while (i < word.length) {
      const size = base + (extra-- > 0 ? 1 : 0);
      out.push(word.slice(i, i + size));
      i += size;
    }
    return out;
  });
}

export const Chopper: React.FC<Solo<'chopper'>> = ({ play }) => {
  const [text, setText] = useState('Summarize this in 3 bullets.');
  const [cut, setCut] = useState(false);
  const [touched, setTouched] = useState(false);
  const [happened, setHappened] = useState('Nothing yet. Flip the lever, or type something of your own.');

  const chunks = chop(text);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const tell = (t: string, isCut: boolean) => {
    const c = chop(t).length;
    const w = t.trim() ? t.trim().split(/\s+/).length : 0;
    setHappened(
      isCut
        ? `You wrote ${w} ${w === 1 ? 'word' : 'words'}. The model reads ${c} small chunks. That pile is what you pay for.`
        : `You wrote ${w} ${w === 1 ? 'word' : 'words'}. That is the prompt, the way you see it.`
    );
  };
  const write = (t: string) => { setText(t); setTouched(true); tell(t, cut); };

  return (
    <div>
      <label className="block text-lg font-bold" htmlFor="chopper-text">Your prompt. Type anything.</label>
      <textarea
        id="chopper-text"
        value={text}
        rows={2}
        onChange={(e) => write(e.target.value.slice(0, 600))}
        className="mt-2 w-full rounded-md border-2 border-ink bg-sheet px-4 py-3 text-xl leading-snug text-ink"
      />
      <div className="mt-3 flex flex-wrap gap-3">
        <Key onClick={() => write('Summarize this in 3 bullets.')}>The short ask</Key>
        <Key onClick={() => write('internationalization')}>One long word</Key>
        <Key onClick={() => write(PAGE)}>A whole paragraph</Key>
      </div>

      <div className="mt-5">
        <Lever
          label="Show it"
          on={cut}
          onChange={(on) => { setCut(on); setTouched(true); tell(text, on); }}
          offText={play.choices[0].label.toLowerCase()}
          onText={play.choices[1].label.toLowerCase()}
        />
      </div>

      <div className="mt-4 min-h-[110px] rounded-md border-2 border-ink bg-sheet p-3">
        {cut ? (
          <div className="flex flex-wrap gap-1.5">
            {chunks.slice(0, 80).map((c, i) => (
              <span key={i} className="rounded-sm border-2 border-ink bg-sheet px-1.5 py-0.5 font-mono text-base font-semibold">
                {c}
              </span>
            ))}
            {chunks.length > 80 && <span className="px-1 font-mono text-base font-semibold">+ {chunks.length - 80} more</span>}
            {chunks.length === 0 && <span className="text-lg">Nothing to cut.</span>}
          </div>
        ) : (
          <p className="text-xl leading-snug">{text || 'Nothing typed.'}</p>
        )}
      </div>

      <p className="mt-3 text-lg font-bold">
        Words: <span className="font-mono text-accent">{wordCount}</span> · Chunks the model reads:{' '}
        <span className="font-mono text-accent">{cut ? chunks.length : '?'}</span>
      </p>
      <p className="mt-1 text-base">Real models cut in slightly different places. The idea is the same.</p>

      <Outcome play={play} choice={touched ? (cut ? 1 : 0) : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Guess: ask twice for a number that does not exist
   ===================================================================== */

const NUMBERS = ['(555) 014-2291', '(555) 017-7730', '(555) 010-4418', '(555) 019-3062'];

export const Guess: React.FC<Solo<'guess'>> = ({ play }) => {
  const [mode, setMode] = useState(1);
  const [asks, setAsks] = useState(0);
  const [checked, setChecked] = useState(false);
  const [happened, setHappened] = useState('Nothing yet. Blue Heron Bakery does not exist. Ask for its phone number.');

  const answers = Array.from({ length: Math.min(asks, 3) }, (_, i) => asks - Math.min(asks, 3) + i);

  return (
    <div>
      <Choice
        label="How the model behaves"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setAsks(0); setHappened(m === 0 ? 'This model has been made careful. Ask it.' : 'This is what a model does by default. Ask it.'); }}
      />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <Part name="The model">
          <Key
            tone="accent"
            onClick={() => {
              const k = asks + 1;
              setAsks(k);
              setHappened(
                mode === 0
                  ? k === 1
                    ? 'The model admitted the gap. That is the true answer.'
                    : 'You asked again and got the same honest answer.'
                  : k === 1
                    ? 'The model wrote a realistic number in a sure voice. It did not look anything up.'
                    : 'You asked again and got a different number. A real phone number would not change.'
              );
            }}
          >
            {asks === 0 ? 'Ask for the phone number' : 'Ask again'}
          </Key>
          {asks === 0 && <Slip tone="dead">Not asked yet.</Slip>}
          {answers.map((k) => (
            <Slip key={k} tone={k === asks - 1 ? 'live' : 'dead'} className={k === asks - 1 ? 'pop' : ''} label={`Ask ${k + 1}`}>
              {mode === 0 ? (
                '“I can’t find a Blue Heron Bakery. I don’t know its number.”'
              ) : (
                <>“Sure! Blue Heron Bakery is at <span className="font-mono font-semibold">{NUMBERS[k % NUMBERS.length]}</span>. They close at 6.”</>
              )}
            </Slip>
          ))}
        </Part>

        <Part name="The phone book" note="The only thing here that was actually checked." lit={checked}>
          <Key
            on={checked}
            onClick={() => {
              setChecked(!checked);
              if (!checked) {
                setHappened(
                  mode === 1 && asks > 0
                    ? 'The phone book has no such shop. Every number the model gave was invented.'
                    : 'The phone book has no such shop. “I don’t know” is the true answer.'
                );
              }
            }}
          >
            Open the phone book
          </Key>
          {checked && (
            <Slip className="pop" mono>
              <p>Corner Loaf · (555) 013-8890</p>
              <p>Rye & Co · (555) 016-2054</p>
              <p className="mt-2 font-sans"><Stamp>Blue Heron: not listed</Stamp></p>
            </Slip>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={asks > 0 ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Lookup: guess from memory, or open the right drawer first
   ===================================================================== */

const LIMITS = [300, 500, 750];

export const Lookup: React.FC<Solo<'lookup'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [limit, setLimit] = useState(500);
  const [open, setOpen] = useState<number | null>(null);
  const [answer, setAnswer] = useState<{ mode: number; limit: number; n: number } | null>(null);
  const [happened, setHappened] = useState('Nothing yet. Your refund rule is written down in one of these drawers.');

  const docs = [
    { name: 'Shipping times', text: 'Orders leave within 2 working days.' },
    { name: 'Refund policy', text: `Refunds up to $${limit}, within 30 days.` },
    { name: 'Holiday hours', text: 'Closed on public holidays.' },
  ];

  return (
    <div>
      <Choice
        label="How the model answers"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened(m === 0 ? 'The model will answer from memory.' : 'The model will search your documents before it writes.'); }}
      />

      <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
        <Part name="Your documents" note="Press a drawer to read it yourself.">
          {docs.map((d, i) => (
            <div key={d.name}>
              <Key
                className="w-full justify-between"
                aria-expanded={open === i}
                on={open === i}
                onClick={() => { setOpen(open === i ? null : i); setHappened(open === i ? `You closed “${d.name}”.` : `You opened “${d.name}” and read it yourself.`); }}
              >
                {d.name} <span aria-hidden="true" className="font-mono">{open === i ? '−' : '+'}</span>
              </Key>
              {open === i && (
                <Slip className="pop mt-3" tone={answer?.mode === 1 && i === 1 ? 'live' : 'plain'}>
                  <p>{d.text}</p>
                  {i === 1 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold">Rewrite the limit:</span>
                      {LIMITS.map((l) => (
                        <Key
                          key={l}
                          on={limit === l}
                          className="min-h-[40px] px-3 font-mono"
                          onClick={() => { setLimit(l); setHappened(`You changed the refund page to $${l}. Ask again and see which kind of answer follows the page.`); }}
                        >
                          ${l}
                        </Key>
                      ))}
                    </div>
                  )}
                </Slip>
              )}
            </div>
          ))}
        </Part>

        <Part name="The model" lit={answer?.mode === 1}>
          <Key
            tone="accent"
            onClick={() => {
              setAnswer({ mode, limit, n: (answer?.n ?? 0) + 1 });
              if (mode === 1) setOpen(1);
              setHappened(
                mode === 0
                  ? `The model said “$200” because that number is common. Your page says $${limit}.`
                  : `It searched your documents, found the refund page, and wrote the answer from that page: $${limit}.`
              );
            }}
          >
            Ask: what is our refund limit?
          </Key>
          {answer ? (
            <Slip key={answer.n} tone="live" className="pop">
              {answer.mode === 0 ? (
                <>
                  <p>“Your refund limit is <span className="font-mono font-semibold">$200</span>.”</p>
                  <p className="mt-2"><Stamp>No page behind it</Stamp></p>
                </>
              ) : (
                <>
                  <p>“Refunds go up to <span className="font-mono font-semibold">${answer.limit}</span>, within 30 days.”</p>
                  <p className="mt-1 text-base font-bold">From: Refund policy</p>
                  <p className="mt-2"><Stamp good>Quoted from your page</Stamp></p>
                </>
              )}
            </Slip>
          ) : (
            <Slip tone="dead">Not asked yet.</Slip>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={answer ? answer.mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Shelves: what is still there when the chat closes
   ===================================================================== */

const FACTS = [
  { said: 'Book Casa Mora for Friday.', note: 'likes Casa Mora' },
  { said: 'I am allergic to peanuts.', note: 'peanut allergy' },
];

export const Shelves: React.FC<Solo<'shelves'>> = ({ play }) => {
  const [saved, setSaved] = useState([false, false]);
  const [later, setLater] = useState(false);
  const [asked, setAsked] = useState(0);
  const [happened, setHappened] = useState('Nothing yet. It is last month. You told the assistant two things in a chat.');

  const [place, allergy] = saved;
  const reply = place && allergy
    ? 'Booked Casa Mora. I told them about the peanut allergy.'
    : place
      ? 'Booked Casa Mora for you.'
      : allergy
        ? 'Which restaurant was it? I do have a note about your peanut allergy.'
        : 'Which restaurant was it? I can only see today’s messages.';

  return (
    <div>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        <Part
          name={later ? 'This chat: today' : 'This chat: last month'}
          note="Short-term. It ends when the chat closes."
        >
          {later ? (
            <>
              <Slip tone="dead">Last month’s messages are gone.</Slip>
              <Slip className="pop">“Book the same restaurant as last month.”</Slip>
            </>
          ) : (
            FACTS.map((f, i) => (
              <div key={f.said} className="rounded-md border-2 border-ink p-3">
                <p className="text-lg">“{f.said}”</p>
                <Key
                  className="mt-3"
                  on={saved[i]}
                  onClick={() => {
                    const next = saved.map((s, j) => (j === i ? !s : s));
                    setSaved(next);
                    setHappened(
                      next[i]
                        ? `A note went onto the shelf for next time: “${f.note}.”`
                        : `You took the note “${f.note}” back off the shelf.`
                    );
                  }}
                >
                  Keep a note for next time
                </Key>
              </div>
            ))
          )}
        </Part>

        <Part name="Kept for next time" note="Long-term. It is still here in a month." lit={saved.some(Boolean)}>
          {saved.some(Boolean) ? (
            FACTS.map((f, i) => saved[i] && (
              <p key={f.note} className="pop -rotate-1 rounded-sm border-2 border-accent bg-accent/15 px-3 py-2 font-display text-xl">
                {f.note}
              </p>
            ))
          ) : (
            <p className="rounded-md border-2 border-dashed border-ink/50 p-3 text-lg">An empty shelf.</p>
          )}
        </Part>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Key
          tone="accent"
          on={later}
          onClick={() => {
            setLater(!later);
            setAsked(0);
            setHappened(
              later
                ? 'Back to last month. Change what gets kept, then let the month pass again.'
                : 'A month passed and a new chat started. Everything in the old chat is gone. Only the shelf is left.'
            );
          }}
        >
          {later ? 'Go back to last month' : 'A month passes. Start a new chat.'}
        </Key>
        <Key
          disabled={!later}
          onClick={() => {
            setAsked(asked + 1);
            setHappened(
              place && allergy
                ? 'The assistant used both notes from the shelf: the restaurant and the allergy.'
                : place
                  ? 'It remembered the restaurant from the shelf. Nobody kept the allergy, so it was forgotten.'
                  : allergy
                    ? 'It had the allergy on the shelf, but nobody kept the name of the restaurant.'
                    : 'With nothing kept, it could only see today’s message, and had to ask.'
            );
          }}
        >
          Let it answer
        </Key>
      </div>

      {asked > 0 && (
        <Slip key={asked} tone="live" className="pop mt-4" label="The assistant says">
          <p>“{reply}”</p>
          {place && !allergy && <p className="mt-2"><Stamp>Allergy forgotten</Stamp></p>}
        </Slip>
      )}

      <Outcome play={play} choice={asked > 0 ? (saved.some(Boolean) ? 1 : 0) : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Request: a person types into a website, or an app sends a slip
   ===================================================================== */

const NAMES = ['Sam', 'Ana', 'Li', 'Noor', 'Kai'];

export const Request: React.FC<Solo<'request'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [typed, setTyped] = useState(false);
  const [sent, setSent] = useState(0);
  const [happened, setHappened] = useState('Nothing yet. Your app wants to greet each new customer with a line from an AI.');

  const left = NAMES.length - sent;

  return (
    <div>
      <Choice
        label="How the question gets to the model"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHappened(m === 0 ? 'The only way in is the chat website, and that is for people.' : 'Your app can now send its own messages.'); }}
      />

      <div className="mt-5 grid items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Part name="Your app" note="A program. It has no hands." lit={mode === 1 && sent > 0}>
          {mode === 0 ? (
            <Slip tone="dead">Still blank. It cannot type into a website.</Slip>
          ) : (
            <>
              <Key
                tone="accent"
                disabled={left === 0}
                onClick={() => {
                  const k = sent + 1;
                  setSent(k);
                  setHappened(
                    k === NAMES.length
                      ? 'Your app sent its last free request for today. The free limit refills tomorrow, or you can pay.'
                      : `Your app sent the message to the model’s address by itself and showed the reply. Nobody typed anything. ${NAMES.length - k} free left today.`
                  );
                }}
              >
                {left === 0 ? 'Free limit reached for today' : 'Run the app'}
              </Key>
              <ul className="space-y-1 text-lg">
                {NAMES.slice(0, sent).map((n, i) => (
                  <li key={n} className={i === sent - 1 ? 'pop font-bold' : ''}>Welcome, {n}!</li>
                ))}
                {sent === 0 && <li>Nothing on screen yet.</li>}
              </ul>
              <p className="text-base font-bold">
                Free requests left today: <span className="font-mono text-accent">{left}</span>
              </p>
            </>
          )}
        </Part>

        <div className="flex flex-col items-center justify-center gap-2">
          <Flow live={mode === 1 && sent > 0} />
          {mode === 1 && sent > 0 && (
            <Slip key={sent} mono className="pop max-w-[220px] text-left">
              <p>To: the model’s address</p>
              <p>Say: greet {NAMES[sent - 1]}</p>
            </Slip>
          )}
        </div>

        <Part name={mode === 0 ? 'The chat website' : 'The model'} note={mode === 0 ? 'Made for a person with a keyboard.' : 'Answers whatever arrives at its address.'} lit={mode === 0 ? typed : sent > 0}>
          {mode === 0 ? (
            <>
              <Key
                tone="accent"
                onClick={() => {
                  setTyped(true);
                  setHappened('A person typed into the website and got a reply. Your app got nothing. It cannot do that by itself.');
                }}
              >
                You: type it in and press send
              </Key>
              <Slip tone={typed ? 'live' : 'dead'}>{typed ? '“Welcome, Sam!”' : 'Waiting for a person to type.'}</Slip>
            </>
          ) : (
            <Slip key={sent} tone={sent ? 'live' : 'dead'} className={sent ? 'pop' : ''}>
              {sent ? `“Welcome, ${NAMES[sent - 1]}!”` : 'Waiting for a request.'}
            </Slip>
          )}
        </Part>
      </div>

      <Outcome play={play} choice={mode === 0 ? (typed ? 0 : null) : sent > 0 ? 1 : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Router: one provider goes dark. Does the app go with it?
   ===================================================================== */

export const Router: React.FC<Solo<'router'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [up, setUp] = useState([false, true]);
  const [result, setResult] = useState<{ ok: boolean; via: number | null; n: number } | null>(null);
  const [happened, setHappened] = useState('Nothing yet. Your usual provider is down right now. Send a question.');

  const send = () => {
    const n = (result?.n ?? 0) + 1;
    if (mode === 0) {
      setResult({ ok: up[0], via: up[0] ? 0 : null, n });
      setHappened(
        up[0]
          ? 'Your app called its one provider directly, and it happened to be working.'
          : 'Your app called its one provider directly. It was down, so the request failed and your app showed an error.'
      );
    } else if (up[0]) {
      setResult({ ok: true, via: 0, n });
      setHappened('The gateway tried the usual provider. It was working, so the answer came straight back.');
    } else if (up[1]) {
      setResult({ ok: true, via: 1, n });
      setHappened('The gateway tried the usual provider. It was down, so the gateway sent the question to the backup. The user still got an answer.');
    } else {
      setResult({ ok: false, via: null, n });
      setHappened('Both providers are down. A gateway can reroute, but it needs at least one working door behind it.');
    }
  };

  const names = ['The usual provider', 'The backup provider'];

  return (
    <div>
      <Choice
        label="How your app reaches a model"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setResult(null); setHappened(m === 0 ? 'Your app has one door: the usual provider.' : 'Your app now talks to a gateway, and the gateway picks the provider.'); }}
      />

      <div className="mt-5 grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.2fr)]">
        <Part name="Your app" lit={!!result?.ok}>
          <Key tone="accent" onClick={send}>Send a question</Key>
          {result ? (
            <Slip key={result.n} tone={result.ok ? 'live' : 'plain'} className="pop">
              {result.ok ? 'An answer came back.' : 'Error. No answer.'}
              <span className="mt-2 block"><Stamp good={result.ok}>{result.ok ? 'User is happy' : 'App is down'}</Stamp></span>
            </Slip>
          ) : (
            <Slip tone="dead">Nothing sent yet.</Slip>
          )}
        </Part>

        <Flow live={!!result} />

        {mode === 1 ? (
          <Part name="The gateway" note="The front door. It tries the usual one, then the backup." lit={!!result?.ok} />
        ) : (
          <div className="flex items-center justify-center rounded-md border-2 border-dashed border-ink/50 p-3 text-center text-lg font-bold">
            A direct line. One door.
          </div>
        )}

        <Flow live={!!result?.ok} />

        <div className="space-y-3">
          {names.map((name, i) => (
            <div
              key={name}
              className={cx(
                'rounded-md border-2 bg-sheet p-3',
                result?.via === i ? 'border-accent' : 'border-ink',
                mode === 0 && i === 1 && 'opacity-60'
              )}
            >
              <Lamp on={result?.via === i} label={name} className="text-lg" />
              {mode === 0 && i === 1 && <p className="mt-1 text-base">Not wired to your app.</p>}
              <div className="mt-2">
                <Lever
                  label="It is"
                  on={up[i]}
                  onChange={(on) => {
                    setUp(up.map((u, j) => (j === i ? on : u)));
                    setResult(null);
                    setHappened(`You ${on ? 'brought' : 'knocked'} ${name.toLowerCase()} ${on ? 'back up' : 'offline'}. Send a question.`);
                  }}
                  onText="working"
                  offText="down"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Outcome play={play} choice={result ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Copies: two copies of a server, and two calls
   ===================================================================== */

export const Copies: React.FC<Solo<'copies'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [first, setFirst] = useState(false);
  const [second, setSecond] = useState<number | null>(null);
  const [happened, setHappened] = useState('Nothing yet. There are two copies of the same tool server. Make the first call.');

  const forgets = mode === 1;
  const lost = !forgets && second === 1;
  const carried = (ask: string) => (forgets ? `“I am Rosa. Here is my pass. ${ask}”` : `“${ask}”`);

  return (
    <div>
      <Choice
        label="What the tool keeps between calls"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setFirst(false); setSecond(null); setHappened(m === 0 ? 'This tool keeps a note about you after the first call.' : 'This tool keeps nothing. Every call has to carry what it needs.'); }}
      />

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Slip label="Call 1 carries" tone={first ? 'plain' : 'dead'} mono>{carried('Log me in.')}</Slip>
        <Slip label="Call 2 carries" tone={second != null ? 'plain' : 'dead'} mono>{carried('Show my orders.')}</Slip>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Key
          tone="accent"
          disabled={first}
          onClick={() => {
            setFirst(true);
            setHappened(
              forgets
                ? 'Copy A checked the pass, logged Rosa in, answered, and then forgot her. Its pocket is empty.'
                : 'Copy A logged Rosa in and kept a note about it in its own pocket.'
            );
          }}
        >
          Make call 1
        </Key>
        {['A', 'B'].map((c, i) => (
          <Key
            key={c}
            disabled={!first}
            on={second === i}
            onClick={() => {
              setSecond(i);
              setHappened(
                forgets
                  ? `Call 2 brought the question and the pass with it, so copy ${c} could answer without remembering anything.`
                  : i === 0
                    ? 'Call 2 happened to reach copy A, which still had the note. It worked this time.'
                    : 'Call 2 reached copy B. The note was in copy A’s pocket, so copy B had no idea who was asking.'
              );
            }}
          >
            Send call 2 to copy {c}
          </Key>
        ))}
      </div>

      <div className="mt-4 grid items-stretch gap-4 md:grid-cols-2">
        {['A', 'B'].map((c, i) => {
          const hasNote = !forgets && first && i === 0;
          return (
            <Part key={c} name={`Copy ${c} of the server`} lit={second === i && !lost}>
              <p className={cx('rounded-md border-2 px-3 py-2 text-lg', hasNote ? 'border-accent bg-accent/15 font-bold' : 'border-dashed border-ink/50')}>
                In its pocket: {hasNote ? '“Rosa is logged in.”' : 'nothing'}
              </p>
              {second === i && (
                <Slip key={`${mode}-${second}`} tone={lost ? 'plain' : 'live'} className="pop">
                  {lost ? '“Who are you? I have no note about you.”' : '“Here are Rosa’s orders.”'}
                  <span className="mt-2 block"><Stamp good={!lost}>{lost ? 'Lost' : 'Answered'}</Stamp></span>
                </Slip>
              )}
            </Part>
          );
        })}
      </div>

      <Outcome play={play} choice={second != null ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Recorder: something went wrong. Is there a trail to read?
   ===================================================================== */

const TRAIL = [
  { did: 'It read the ticket.', cost: '2 seconds · 1¢' },
  { did: 'It ran: delete report-final.csv', cost: '1 second · 2¢' },
  { did: 'It said “Done.” That file was the finance export.', cost: '1 second · 1¢ · 4¢ in all' },
];

export const Recorder: React.FC<Solo<'recorder'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [ran, setRan] = useState(false);
  const [opened, setOpened] = useState([false, false, false]);
  const [happened, setHappened] = useState('Nothing yet. Decide whether to keep a trail, then run the agent.');

  const recording = mode === 1;

  return (
    <div>
      <Choice
        label="Is anything written down"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => {
          setMode(m); setRan(false); setOpened([false, false, false]);
          setHappened('A trail has to be switched on before the run. Run the agent again.');
        }}
      />

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Key
          tone="accent"
          disabled={ran}
          onClick={() => {
            setRan(true);
            setHappened('The agent finished. A user says it “just deleted the wrong file.” Press a step to see what it did.');
          }}
        >
          Run the agent
        </Key>
        <Lamp on={recording} label={recording ? 'Recording every step' : 'Not recording'} />
      </div>

      {ran && (
        <Slip className="pop mt-4" label="All you can see from outside">“Done! I tidied up the old files.”</Slip>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {TRAIL.map((t, i) => (
          <div key={i}>
            <Key
              className="w-full"
              disabled={!ran}
              on={opened[i]}
              onClick={() => {
                setOpened(opened.map((o, j) => (j === i ? true : o)));
                setHappened(
                  recording
                    ? i === 1
                      ? 'The trail shows the exact command it ran. That is where the wrong file was deleted.'
                      : `The trail shows what happened at step ${i + 1}, how long it took, and what it cost.`
                    : `Nothing was written down for step ${i + 1}. You can only guess what it did.`
                );
              }}
            >
              Step {i + 1}
            </Key>
            {opened[i] && (
              <Slip className="pop mt-3" tone={recording ? 'live' : 'dead'}>
                {recording ? (
                  <>
                    <p>{t.did}</p>
                    <p className="mt-1 font-mono text-base font-semibold">{t.cost}</p>
                  </>
                ) : (
                  <p>No record.</p>
                )}
              </Slip>
            )}
          </div>
        ))}
      </div>

      <Outcome play={play} choice={opened.some(Boolean) ? mode : null}>{happened}</Outcome>
    </div>
  );
};

/* =====================================================================
   Move: does your code travel, or does the model file come home?
   ===================================================================== */

export const Move: React.FC<Solo<'move'>> = ({ play }) => {
  const [mode, setMode] = useState(0);
  const [home, setHome] = useState(false);
  const [asked, setAsked] = useState<{ left: boolean; n: number } | null>(null);
  const [bump, setBump] = useState(0);
  const [happened, setHappened] = useState('Nothing yet. Your company’s source code must not leave the building.');

  const open = mode === 1;

  const moveModel = (toHome: boolean) => {
    if (!open) {
      if (toHome) {
        setBump(bump + 1);
        setHappened('The vendor does not let that file leave. With a closed model, it stays on their machines.');
      }
      return;
    }
    if (toHome === home) return;
    setHome(toHome);
    setAsked(null);
    setHappened(
      toHome
        ? 'You downloaded the model file. It now sits on a server you control.'
        : 'You sent the model file back. It only runs at the vendor’s again.'
    );
  };

  const file = (
    <DragSlip
      key={bump}
      className={bump && !open ? 'shake' : ''}
      label={`The model file. ${home ? 'Press to send it back.' : 'Press to bring it home.'}`}
      onDrop={(id) => moveModel(id === 'home')}
      onPress={() => moveModel(!home)}
    >
      The model file {!open && <span aria-hidden="true">🔒</span>}
    </DragSlip>
  );

  return (
    <div>
      <Choice
        label="What kind of model"
        options={play.choices.map((c) => c.label)}
        value={mode}
        onChange={(m) => { setMode(m); setHome(false); setAsked(null); setHappened(m === 0 ? 'The model file is locked inside the vendor’s building.' : 'This model’s file can be downloaded. Drag it home, or press it.'); }}
      />

      <div className="mt-5 grid items-stretch gap-4 md:grid-cols-2">
        <div data-drop="home" className="rounded-md border-2 border-ink bg-sheet p-3 sm:p-4">
          <p className="text-lg font-bold">Your building</p>
          <p className="mt-1 text-base text-soft">A server you control.</p>
          <div className="mt-3 space-y-3">
            <p className="rounded-md border-2 border-ink px-3 py-2 font-mono text-base font-semibold">your source code</p>
            {home && file}
            {asked && !asked.left && (
              <Slip key={asked.n} tone="live" className="pop">
                The answer was made in here. <span className="mt-2 block"><Stamp good>Code never left</Stamp></span>
              </Slip>
            )}
          </div>
        </div>

        <div data-drop="vendor" className="rounded-md border-2 border-dashed border-ink bg-sheet p-3 sm:p-4">
          <p className="text-lg font-bold">The vendor’s building</p>
          <p className="mt-1 text-base text-soft">Someone else’s computers.</p>
          <div className="mt-3 space-y-3">
            {!home && file}
            {asked?.left && (
              <>
                <p key={asked.n} className="pop rounded-md border-2 border-accent bg-accent px-3 py-2 font-mono text-base font-semibold text-onaccent">
                  a copy of your source code
                </p>
                <Stamp>Your code is here now</Stamp>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Key
          tone="accent"
          onClick={() => {
            const left = !home;
            setAsked({ left, n: (asked?.n ?? 0) + 1 });
            setHappened(
              left
                ? open
                  ? 'The model file is still at the vendor’s, so your code had to travel there. Bring the file home first.'
                  : 'To get an answer, your code had to be sent to the vendor’s machines. That is the only place the model runs.'
                : 'The model ran inside your building and answered there. Your code never left.'
            );
          }}
        >
          Ask the model about your code
        </Key>
      </div>

      <Outcome play={play} choice={asked ? (asked.left ? 0 : 1) : null}>{happened}</Outcome>
    </div>
  );
};
