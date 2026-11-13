import React, { useEffect, useState } from 'react';
import { VisualDemoType } from '../../types';
import { PLAYGROUNDS } from './playgrounds';
import { TOYS, ToySpec } from './toys';
import { Key, MachineProps } from './kit';
import { ChatTape, Dial, Handoff, Harness, HiddenPage, Plug } from './machines/named';
import { Attach, Form, Gate, Grid, Loop, MapToy, Matrix, Picker } from './machines/generic';
import {
  CacheCalls, Distill, Fence, FineTune, FlowChart, Screen, Sorter, Synth, TrainOnce,
} from './machines/oneoffs1';
import {
  Chopper, Copies, Guess, Lookup, Move, Rank, Recorder, Request, Router, Shelves,
} from './machines/oneoffs2';

interface Props {
  type: VisualDemoType;
  conceptId: string;
  conceptTitle: string;
}

/** Every kind of toy, and the machine that plays it. */
const MACHINES: { [K in ToySpec['kind']]: React.FC<MachineProps<Extract<ToySpec, { kind: K }>>> } = {
  harness: Harness,
  tape: ChatTape,
  dial: Dial,
  plug: Plug,
  page: HiddenPage,
  handoff: Handoff,
  gate: Gate,
  form: Form,
  attach: Attach,
  picker: Picker,
  loop: Loop,
  grid: Grid,
  map: MapToy,
  matrix: Matrix,
  flow: FlowChart,
  screen: Screen,
  fence: Fence,
  cache: CacheCalls,
  trainonce: TrainOnce,
  sorter: Sorter,
  finetune: FineTune,
  distill: Distill,
  synth: Synth,
  rank: Rank,
  chopper: Chopper,
  guess: Guess,
  lookup: Lookup,
  shelves: Shelves,
  request: Request,
  router: Router,
  copies: Copies,
  recorder: Recorder,
  move: Move,
};

export const ConceptVisualDemo: React.FC<Props> = ({ conceptId, conceptTitle }) => {
  const play = PLAYGROUNDS[conceptId];
  const toy = TOYS[conceptId];
  // Reset builds the machine again from nothing, so it always returns to the start.
  const [run, setRun] = useState(0);

  useEffect(() => {
    setRun(0);
  }, [conceptId]);

  if (!play || !toy) {
    return (
      <div className="sheet p-6 text-lg">
        <p className="font-bold">{conceptTitle}</p>
        <p className="mt-2">This idea does not have its own toy yet.</p>
      </div>
    );
  }

  const Machine = MACHINES[toy.kind] as React.FC<MachineProps<ToySpec>>;

  return (
    <section
      className="grid-paper overflow-hidden rounded-md border-[3px] border-ink bg-bench shadow-sheet"
      aria-label={`Try it: ${conceptTitle}`}
      data-toy={toy.kind}
    >
      <div className="ticks" aria-hidden="true" />
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="tab tab-accent text-lg">Try it</p>
          <Key onClick={() => setRun(run + 1)} aria-label="Reset the toy to the start">
            <span aria-hidden="true" className="font-mono">↺</span> Reset
          </Key>
        </div>
        <p className="mt-4 font-display text-2xl leading-snug sm:text-3xl">{play.ask}</p>
        <div className="mt-5">
          <Machine key={`${conceptId}-${run}`} play={play} toy={toy} />
        </div>
      </div>
    </section>
  );
};
