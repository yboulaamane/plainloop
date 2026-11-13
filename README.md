# Plainloop

AI in plain terms. A beginner's guide to AI jargon: large type, short lessons, and a small machine to poke in every one.

Suggested Vercel project name: `plainloop` → [plainloop.vercel.app](https://plainloop.vercel.app). Checked on 13 Nov 2026: that subdomain returned `DEPLOYMENT_NOT_FOUND`, so no live project is using it. If Vercel says the name is reserved, `lucidatlas`, `primerlane`, and `lumenprimer` had the same open signal.

It is for someone who just heard "harness," "swarm," or "MCP" and still does not know what the word means. They are not engineers.

## What a lesson is

1. **Plain words.** Two or three sentences, first thing on the page, in large type.
2. **Picture it.** One everyday comparison.
3. **Try it.** A small machine you can poke. Touching it changes what is on screen, and one plain sentence underneath says what just happened.
4. **Where you will meet this.**
5. **One check.** A single question.

There is also a "Find it in your tool" view per lesson, a map of every lesson, a searchable list, and progress kept in the browser's local storage.

## The look

One object: paper on a workbench. Ink, one accent colour for whatever is lit or chosen, big type, and keys that visibly go down when pressed. The colours and the shared parts (`.key`, `.sheet`, `.tab`, `.slip`, `.lamp`, `.lever`, `.ticks`) live in `src/index.css` and `tailwind.config.js`. Components never use `dark:` classes; the dark workbench is the same names with different values.

## The playgrounds

Every lesson has its own toy. They live in `src/components/visuals/`:

- `playgrounds.ts` holds the words: the "ask" and the lesson of each of its two choices.
- `toys.ts` says which machine acts those words out, and holds the setup for machines that several lessons share.
- `kit.tsx` holds the parts every machine is built from: keys, levers, lamps, slips, meters, and a slip you can drag.
- `machines/` holds the machines. `named.tsx` has the harness rig, the chat tape, the dial, the MCP plug, the hidden-sentence page, and the drag-to-hand-off desks. `generic.tsx` has machines shared by a few lessons (gate, form, picker, loop, grid, map). `oneoffs1.tsx` and `oneoffs2.tsx` have the one-of-a-kind toys.
- `ConceptVisualDemo.tsx` is the frame: the ask, the Reset key, and the machine.

Rules every toy keeps: click and keyboard both work, the chosen control looks selected, Reset returns to the start, the before and the after are both visible, and the sentence under the toy adds no new jargon.

---

## 🗺️ Scope of Concepts Included (All 22 from Image + Additions)

| Learning Island | Included Bubbles |
| :--- | :--- |
| **Start Here** | Foundation Models, Prompts & Tokens, Context Window, Hallucinations, Temperature, Reasoning Models, Multimodal, Parameters |
| **Agent Architecture** | Harness, Agentic AI, Loop Engineering, Graph Engineering, Human in the Loop, Sandbox |
| **Instructions & Context** | Context Engineering, Skills, Prompt Optimization, System Prompt |
| **Tools & Connections** | Tool Use, Function Calling, MCP, Stateless MCP, AI APIs, Computer Use, Structured Output |
| **Knowledge & Memory** | RAG 2.0, Memory Layers, Vector DBs, Embeddings |
| **Agent Teamwork** | Multi-Agent Systems, Swarms, Subagents |
| **Model Adaptation** | Fine-Tuning, Synthetic Data, Distillation, LoRA, Quantization, RLHF, Open-Weight Models |
| **Reliability & Safety** | Evaluation Frameworks, Guardrails, Observability, Prompt Injection |
| **Deployment & Efficiency** | AI Gateways, Cost Optimization, Inference, Prompt Caching |

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🚢 Deploy to GitHub & Vercel in 2 Minutes

1. **Push this repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Concept Playground"
   git branch -M main
   git remote add origin https://github.com/yboulaamane/plainloop.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your GitHub repository (`ai-concept-playground`).
   - Vercel automatically detects **Vite**.
   - Click **Deploy**!
   - Every subsequent Git push will automatically trigger instant preview and production deployments.

---

## ✏️ How to Edit or Add Concepts

All content lives in structured TypeScript files:
- `src/data/conceptsData.ts`: explanations, analogies, the check, tool notes, and the "Go deeper" drawer.
- `src/data/clustersData.ts`: the groups and the guided paths.
- `src/components/visuals/playgrounds.ts` and `toys.ts`: the words and the setup of each playground.
- `src/types.ts`: TypeScript definitions.

To add a lesson, add it to `conceptsData.ts`, give it an entry in `playgrounds.ts`, and point it at a machine in `toys.ts`. If an existing machine fits the idea (a dial, a gate, a form), only data is needed.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS, with the site's own tokens and parts in `src/index.css`
- **Icons**: Lucide Icons
- **Map**: an HTML5 canvas with a small spring-and-spacing simulation
- **Effects**: Canvas Confetti
