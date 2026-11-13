# Plainloop

AI in plain terms. **Live at [plainloop.vercel.app](https://plainloop.vercel.app/)**

A beginner's guide to AI jargon: 47 terms like harness, swarm, and MCP. Each lesson has plain words, an everyday comparison, a small interactive demo, where you will meet it, and one check.

## Run it

```bash
npm install
npm run dev
```

`npm run build` makes the production build.

## Where things live

- `src/data/conceptsData.ts`: the lessons.
- `src/data/clustersData.ts`: the groups and learning paths.
- `src/components/visuals/playgrounds.ts`: the words of each demo.
- `src/components/visuals/toys.ts`: which demo each lesson uses.
- `src/components/visuals/machines/`: the demos themselves.
- `src/index.css`: colours and the shared parts (keys, sheets, tabs).

Built with React, TypeScript, Vite, and Tailwind CSS.
