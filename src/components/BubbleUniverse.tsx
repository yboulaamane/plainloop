import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Concept, ClusterId } from '../types';
import { CLUSTERS } from '../data/clustersData';

interface Props {
  concepts: Concept[];
  selectedConcept: Concept | null;
  onSelectConcept: (concept: Concept) => void;
  activePathConceptIds: string[];
  reducedMotion: boolean;
  masteredIds: string[];
  challengeSolvedIds: string[];
  theme: 'dark' | 'light';
}

interface Node {
  concept: Concept;
  x: number;
  y: number;
  radius: number;
  baseRadius: number;
}

// The same paper, ink, and accent as the rest of the site (see index.css).
const PAPER = {
  light: { sheet: '#fbf7ec', ink: '#1b1814', edge: '#1b1814', accent: '#c93a18', onaccent: '#fffaf0' },
  dark: { sheet: '#221e19', ink: '#f4eddc', edge: '#7a7060', accent: '#ff784a', onaccent: '#14120f' },
};

function labelLines(label: string): string[] {
  const words = label.split(' ');
  if (words.length <= 1) return [label];
  if (words.length === 2) return words;
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

export const BubbleUniverse: React.FC<Props> = ({
  concepts,
  selectedConcept,
  onSelectConcept,
  activePathConceptIds,
  reducedMotion,
  masteredIds,
  challengeSolvedIds,
  theme,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const hoveredNodeRef = useRef<Node | null>(null);
  const pressRef = useRef<{ node: Node; x: number; y: number; dragged: boolean } | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<Concept | null>(null);
  const [spotlight, setSpotlight] = useState<ClusterId | null>(null);

  const colors = PAPER[theme];

  // Lay the tokens out in loose groups, one group per island.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 760;
    const baseR = width < 560 ? 40 : 52;

    const clusterCenters: Record<string, { x: number; y: number }> = {
      'start-here': { x: width * 0.22, y: height * 0.28 },
      'agent-architecture': { x: width * 0.50, y: height * 0.38 },
      'instructions-context': { x: width * 0.30, y: height * 0.60 },
      'tools-connections': { x: width * 0.72, y: height * 0.34 },
      'knowledge-memory': { x: width * 0.24, y: height * 0.82 },
      'agent-teamwork': { x: width * 0.52, y: height * 0.74 },
      'model-adaptation': { x: width * 0.82, y: height * 0.64 },
      'reliability-safety': { x: width * 0.44, y: height * 0.16 },
      'deployment-efficiency': { x: width * 0.78, y: height * 0.86 },
    };

    const existingMap = new Map(nodesRef.current.map((n) => [n.concept.id, n]));

    nodesRef.current = concepts.map((c, i) => {
      const existing = existingMap.get(c.id);
      const center = clusterCenters[c.cluster] || { x: width * 0.5, y: height * 0.5 };
      const angle = (i % 5) * (Math.PI * 2 / 5) + (Math.random() * 0.2 - 0.1);
      const dist = 54 + (i % 3) * 30;
      return {
        concept: c,
        x: existing ? existing.x : center.x + Math.cos(angle) * dist,
        y: existing ? existing.y : center.y + Math.sin(angle) * dist,
        radius: baseR,
        baseRadius: baseR,
      };
    });
  }, [concepts]);

  // Draw loop.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    // Let the tokens settle even when drifting is off, so they never start in a heap.
    let settle = 240;

    const render = () => {
      time += 0.01;
      const width = container.clientWidth;
      const height = container.clientHeight || 760;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const hovered = hoveredNodeRef.current;
      const held = pressRef.current?.dragged ? pressRef.current.node : null;

      if (!reducedMotion || settle > 0 || held) {
        if (settle > 0) settle -= 1;
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];

          if (n1 !== held) {
            if (!reducedMotion) {
              n1.x += Math.sin(time + i * 1.6) * 0.14;
              n1.y += Math.cos(time + i * 1.3) * 0.14;
            }
            const padding = n1.radius + 12;
            if (n1.x < padding) n1.x += (padding - n1.x) * 0.1;
            if (n1.x > width - padding) n1.x -= (n1.x - (width - padding)) * 0.1;
            if (n1.y < padding) n1.y += (padding - n1.y) * 0.1;
            if (n1.y > height - padding) n1.y -= (n1.y - (height - padding)) * 0.1;
          }

          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = n1.radius + n2.radius + 12;
            if (dist < minDist) {
              const force = ((minDist - dist) / dist) * 0.08;
              if (n1 !== held) { n1.x -= dx * force; n1.y -= dy * force; }
              if (n2 !== held) { n2.x += dx * force; n2.y += dy * force; }
            }
          }
        }
      }

      const inPath = (n: Node) => activePathConceptIds.includes(n.concept.id);
      const lit = (n: Node) => (spotlight ? n.concept.cluster === spotlight : inPath(n));

      // Threads between related ideas: pencil by default, accent when you point at one end.
      const nodeMap = new Map(nodes.map((n) => [n.concept.id, n]));
      for (const n of nodes) {
        for (const targetId of n.concept.connectedConceptIds) {
          const target = nodeMap.get(targetId);
          if (!target) continue;
          const active = (hovered === n || hovered === target) && lit(n) && lit(target);
          const faint = !lit(n) || !lit(target);
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = active ? colors.accent : colors.ink;
          ctx.lineWidth = active ? 3 : 1;
          ctx.globalAlpha = active ? 1 : faint ? 0.05 : 0.2;
          ctx.setLineDash(active ? [] : [3, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
        }
      }

      // Tokens: paper discs with a thick underside, like the keys on the rest of the site.
      for (const n of nodes) {
        const dim = !lit(n);
        const isHovered = hovered === n;
        const isSelected = selectedConcept?.id === n.concept.id;
        const isMastered = masteredIds.includes(n.concept.id);
        const down = isSelected || n === pressRef.current?.node;

        const targetRadius = isHovered ? n.baseRadius + 3 : n.baseRadius;
        n.radius += (targetRadius - n.radius) * 0.25;

        const depth = dim ? 0 : down ? 1 : 5;
        const faceY = n.y - depth;

        ctx.save();
        ctx.globalAlpha = dim ? 0.38 : 1;

        if (depth > 0) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
          ctx.fillStyle = colors.edge;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(n.x, faceY, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? colors.ink : colors.sheet;
        ctx.fill();
        ctx.lineWidth = isHovered ? 4 : 2.5;
        ctx.strokeStyle = isHovered && !dim ? colors.accent : colors.ink;
        if (dim) ctx.setLineDash([4, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isSelected ? colors.sheet : colors.ink;

        const lines = labelLines(n.concept.shortLabel);
        let size = n.baseRadius < 46 ? 14 : 16;
        ctx.font = `700 ${size}px "Source Sans 3", sans-serif`;
        const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
        if (widest > n.radius * 1.7) {
          size -= 2;
          ctx.font = `700 ${size}px "Source Sans 3", sans-serif`;
        }
        const lineHeight = size + 2;
        const startY = faceY - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, index) => {
          ctx.fillText(line, n.x, startY + index * lineHeight);
        });

        if (isMastered) {
          const bx = n.x + n.radius * 0.7;
          const by = faceY - n.radius * 0.7;
          ctx.beginPath();
          ctx.arc(bx, by, 11, 0, Math.PI * 2);
          ctx.fillStyle = colors.accent;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = colors.ink;
          ctx.stroke();
          ctx.fillStyle = colors.onaccent;
          ctx.font = 'bold 13px "Source Sans 3", sans-serif';
          ctx.fillText('✓', bx, by + 0.5);
        }

        ctx.restore();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [reducedMotion, activePathConceptIds, selectedConcept, masteredIds, challengeSolvedIds, colors, spotlight]);

  const nodeAt = (x: number, y: number) =>
    nodesRef.current.find((n) => Math.hypot(n.x - x, n.y - y) <= n.radius + 3) ?? null;

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = point(e);
    const press = pressRef.current;
    if (press) {
      if (!press.dragged && Math.hypot(x - press.x, y - press.y) > 6) press.dragged = true;
      if (press.dragged) {
        press.node.x = x;
        press.node.y = y;
      }
      return;
    }
    const found = nodeAt(x, y);
    hoveredNodeRef.current = found;
    setHoveredConcept(found ? found.concept : null);
    e.currentTarget.style.cursor = found ? 'pointer' : 'default';
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = point(e);
    const node = nodeAt(x, y);
    if (!node) return;
    pressRef.current = { node, x, y, dragged: false };
    if (e.pointerType === 'mouse') e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback(() => {
    const press = pressRef.current;
    pressRef.current = null;
    // A press without a drag opens the lesson. A drag only moves the token.
    if (press && !press.dragged) onSelectConcept(press.node.concept);
  }, [onSelectConcept]);

  const suggested = concepts.find(
    (c) => activePathConceptIds.includes(c.id) && !masteredIds.includes(c.id)
  ) || concepts.find((c) => activePathConceptIds.includes(c.id)) || concepts[0];
  const preview = hoveredConcept || suggested;
  const previewCluster = preview ? CLUSTERS[preview.cluster] : null;
  const previewMastered = preview ? masteredIds.includes(preview.id) : false;

  return (
    <div className="space-y-5">
      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div
          ref={containerRef}
          className="sheet grid-paper relative h-[1280px] overflow-hidden sm:h-[720px] lg:h-[760px]"
        >
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { pressRef.current = null; }}
            onPointerLeave={() => { hoveredNodeRef.current = null; setHoveredConcept(null); }}
            className="relative z-10 block h-full w-full touch-pan-y"
            aria-label="A map of every lesson. The Lessons view has the same lessons as a list."
          />
        </div>

        {preview && previewCluster && (
          <aside className="sheet flex flex-col p-5 sm:p-6">
            <p className="tab self-start">{hoveredConcept ? 'You are pointing at' : 'A good next one'}</p>
            <p className="mt-4 text-lg font-bold">
              {previewCluster.name}
              {previewMastered && <span className="text-accent"> · learned</span>}
            </p>
            <h2 className="font-display mt-1 text-4xl leading-tight">{preview.title}</h2>
            <p className="mt-4 flex-1 text-lg leading-relaxed">{preview.plainExplanation}</p>
            <button
              type="button"
              onClick={() => onSelectConcept(preview)}
              className="key key-accent mt-6 w-full text-lg"
            >
              Open the lesson
            </button>
          </aside>
        )}
      </div>

      <p className="text-lg">
        Press a circle to open its lesson. Drag one to move it. Press a group below to light it up.
      </p>
      <div className="flex flex-wrap gap-3">
        {Object.values(CLUSTERS).map((cluster) => (
          <button
            key={cluster.id}
            type="button"
            aria-pressed={spotlight === cluster.id}
            onClick={() => setSpotlight(spotlight === cluster.id ? null : cluster.id)}
            className="key"
          >
            {cluster.name}
          </button>
        ))}
      </div>
    </div>
  );
};
