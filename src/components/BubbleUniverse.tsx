import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Concept } from '../types';
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
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  clusterName: string;
}

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
  const draggedNodeRef = useRef<Node | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const [hoveredConcept, setHoveredConcept] = useState<Concept | null>(null);

  const isDark = theme === 'dark';

  // Layout cluster anchors
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 760;

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

    const newNodes: Node[] = concepts.map((c, i) => {
      const existing = existingMap.get(c.id);
      const center = clusterCenters[c.cluster] || { x: width * 0.5, y: height * 0.5 };
      const cluster = CLUSTERS[c.cluster];

      const angle = (i % 5) * (Math.PI * 2 / 5) + (Math.random() * 0.2 - 0.1);
      const dist = 54 + (i % 3) * 30;
      const initialX = existing ? existing.x : center.x + Math.cos(angle) * dist;
      const initialY = existing ? existing.y : center.y + Math.sin(angle) * dist;

      const baseR = 52;

      return {
        concept: c,
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        radius: baseR,
        baseRadius: baseR,
        color: cluster ? cluster.color : '#0071e3',
        clusterName: cluster ? cluster.name : '',
      };
    });

    nodesRef.current = newNodes;
  }, [concepts]);

  // Main Canvas Render Loop (Apple Damped Spring Physics + Retina DPI)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.01;
      const width = container.clientWidth;
      const height = container.clientHeight || 760;

      // Retina scaling
      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;
      const hovered = hoveredNodeRef.current;

      // 1. Apple Velvety Damped Physics
      if (!reducedMotion) {
        for (let i = 0; i < nodes.length; i++) {
          const n1 = nodes[i];
          if (draggedNodeRef.current === n1) continue;

          // Subtle organic float
          n1.x += Math.sin(time + i * 1.6) * 0.14;
          n1.y += Math.cos(time + i * 1.3) * 0.14;

          // Boundary constraints with gentle elastic damp
          const padding = n1.radius + 16;
          if (n1.x < padding) n1.x += (padding - n1.x) * 0.1;
          if (n1.x > width - padding) n1.x -= (n1.x - (width - padding)) * 0.1;
          if (n1.y < padding) n1.y += (padding - n1.y) * 0.1;
          if (n1.y > height - padding) n1.y -= (n1.y - (height - padding)) * 0.1;

          // Soft repulsive spacing
          for (let j = i + 1; j < nodes.length; j++) {
            const n2 = nodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = n1.radius + n2.radius + 14;

            if (dist < minDist) {
              const force = (minDist - dist) / dist * 0.08;
              const fx = dx * force;
              const fy = dy * force;
              if (draggedNodeRef.current !== n1) { n1.x -= fx; n1.y -= fy; }
              if (draggedNodeRef.current !== n2) { n2.x += fx; n2.y += fy; }
            }
          }
        }
      }

      // 2. Draw Connectors (Apple Subtle Neural Strands)
      const nodeMap = new Map(nodes.map((n) => [n.concept.id, n]));

      for (const n of nodes) {
        const isDimmed = !activePathConceptIds.includes(n.concept.id);
        const isHovered = hovered === n;

        for (const targetId of n.concept.connectedConceptIds) {
          const target = nodeMap.get(targetId);
          if (!target) continue;

          const targetDimmed = !activePathConceptIds.includes(target.concept.id);
          const isLinkActive = (isHovered || hovered === target) && !isDimmed && !targetDimmed;

          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(target.x, target.y);

          if (isLinkActive) {
            ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
            ctx.lineWidth = 1.6;
            ctx.globalAlpha = isDark ? 0.8 : 0.6;
            ctx.setLineDash([]);
          } else {
            ctx.strokeStyle = isDark ? '#ffffff' : '#000000';
            ctx.lineWidth = isDimmed || targetDimmed ? 0.5 : 0.8;
            ctx.globalAlpha = isDimmed || targetDimmed ? 0.03 : (isDark ? 0.10 : 0.08);
            ctx.setLineDash([3, 4]);
          }

          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1.0;
        }
      }

      // 3. Draw Nodes (Apple Frosted Glass Squircle / Pebble)
      for (const n of nodes) {
        const isDimmed = !activePathConceptIds.includes(n.concept.id);
        const isHovered = hovered === n;
        const isSelected = selectedConcept?.id === n.concept.id;
        const isMastered = masteredIds.includes(n.concept.id);

        // Spring scale on hover
        const targetRadius = isHovered ? n.baseRadius + 4 : isSelected ? n.baseRadius + 2 : n.baseRadius;
        n.radius += (targetRadius - n.radius) * 0.25;

        ctx.save();
        ctx.globalAlpha = isDimmed ? (isDark ? 0.22 : 0.28) : 1.0;

        // Diffuse Apple drop shadow
        if (!isDimmed) {
          if (!isDark) {
            ctx.shadowColor = isHovered ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.06)';
            ctx.shadowBlur = isHovered ? 16 : 8;
            ctx.shadowOffsetY = isHovered ? 6 : 3;
          } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = isHovered ? 20 : 10;
            ctx.shadowOffsetY = 4;
          }
        }

        // Pebble body
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);

        if (isDark) {
          ctx.fillStyle = isDimmed ? '#1a1714' : isHovered ? '#2a251f' : '#221e1a';
        } else {
          ctx.fillStyle = isDimmed ? '#e7e0d4' : '#fffdf8';
        }
        ctx.fill();

        ctx.lineWidth = isHovered || isSelected ? 3.5 : 2.5;
        ctx.strokeStyle = isDimmed
          ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(28,25,21,0.12)')
          : n.color;
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDimmed
          ? (isDark ? '#8a8174' : '#8d8476')
          : (isDark ? '#f6f1e7' : '#1c1915');

        const lines = labelLines(n.concept.shortLabel);
        let size = 15;
        ctx.font = `600 ${size}px "Source Sans 3", sans-serif`;
        const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
        if (widest > n.radius * 1.65) {
          size = 13;
          ctx.font = `600 ${size}px "Source Sans 3", sans-serif`;
        }
        const lineHeight = size + 2;
        const startY = n.y - ((lines.length - 1) * lineHeight) / 2;
        lines.forEach((line, index) => {
          ctx.fillText(line, n.x, startY + index * lineHeight);
        });

        if (!isDimmed && isMastered) {
          ctx.beginPath();
          ctx.arc(n.x + n.radius * 0.72, n.y - n.radius * 0.72, 9, 0, Math.PI * 2);
          ctx.fillStyle = '#1b5e45';
          ctx.fill();
          ctx.fillStyle = '#fffdf8';
          ctx.font = 'bold 12px "Source Sans 3", sans-serif';
          ctx.fillText('✓', n.x + n.radius * 0.72, n.y - n.radius * 0.72 + 0.5);
        }

        ctx.restore();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion, activePathConceptIds, selectedConcept, masteredIds, challengeSolvedIds, isDark]);

  // Mouse Interaction handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y };

    if (isDraggingRef.current && draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    let found: Node | null = null;
    for (const n of nodesRef.current) {
      const dist = Math.hypot(n.x - x, n.y - y);
      if (dist <= n.radius + 3) {
        found = n;
        break;
      }
    }

    hoveredNodeRef.current = found;
    setHoveredConcept(found ? found.concept : null);
    canvas.style.cursor = found ? 'pointer' : 'default';
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const n of nodesRef.current) {
      const dist = Math.hypot(n.x - x, n.y - y);
      if (dist <= n.radius) {
        isDraggingRef.current = true;
        draggedNodeRef.current = n;
        break;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current && hoveredNodeRef.current) {
      onSelectConcept(hoveredNodeRef.current.concept);
    }
    isDraggingRef.current = false;
    draggedNodeRef.current = null;
  }, [onSelectConcept]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const n of nodesRef.current) {
      const dist = Math.hypot(n.x - x, n.y - y);
      if (dist <= n.radius + 3) {
        onSelectConcept(n.concept);
        break;
      }
    }
  }, [onSelectConcept]);

  const suggested = concepts.find(
    (c) => activePathConceptIds.includes(c.id) && !masteredIds.includes(c.id)
  ) || concepts.find((c) => activePathConceptIds.includes(c.id)) || concepts[0];
  const preview = hoveredConcept || suggested;
  const previewCluster = preview ? CLUSTERS[preview.cluster] : null;
  const previewMastered = preview ? masteredIds.includes(preview.id) : false;

  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div
          ref={containerRef}
          className="panel relative h-[680px] overflow-hidden lg:h-[760px]"
        >
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={handleCanvasClick}
            className="relative z-10 block h-full w-full touch-none"
          />
        </div>

        {preview && previewCluster && (
          <aside className="panel flex flex-col p-6">
            <p className="kicker">{hoveredConcept ? 'In view' : 'Suggested next'}</p>
            <div className="mt-4 flex items-center gap-2 text-base font-semibold text-mute">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: previewCluster.color }} />
              {previewCluster.name}
              {previewMastered && <span className="text-moss dark:text-mossbright">· Learned</span>}
            </div>
            <h2 className="font-display mt-3 text-4xl leading-tight">{preview.title}</h2>
            <p className="mt-4 flex-1 text-lg leading-relaxed text-mute">{preview.plainExplanation}</p>
            <p className="mt-4 text-lg italic">{preview.analogy.headline}</p>
            <button
              onClick={() => onSelectConcept(preview)}
              className="mt-6 rounded-full bg-moss px-5 py-3 text-lg font-semibold text-cream"
            >
              Open the lesson
            </button>
          </aside>
        )}
      </div>

      <p className="text-lg text-mute">
        Hover a circle to preview it. Click to open the lesson. Drag to rearrange.
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.values(CLUSTERS).map((cluster) => (
          <span
            key={cluster.id}
            className="inline-flex items-center gap-2 rounded-full border border-rule bg-card px-3 py-1.5 text-base text-mute dark:border-white/10 dark:bg-nightcard"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cluster.color }} />
            {cluster.name}
          </span>
        ))}
      </div>
    </div>
  );
};
