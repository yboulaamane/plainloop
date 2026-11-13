import { ClusterId, ClusterInfo, LearningPath } from '../types';

export const CLUSTERS: Record<ClusterId, ClusterInfo> = {
  'start-here': {
    id: 'start-here',
    name: 'Start Here',
    tagline: 'The few words everything else is built on',
    color: '#0284c7', // Sky
    glowColor: 'rgba(2, 132, 199, 0.15)',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-300 dark:border-sky-800/50',
    iconName: 'Sparkles',
  },
  'agent-architecture': {
    id: 'agent-architecture',
    name: 'Agent Architecture',
    tagline: 'How an AI is set up to act, not just talk',
    color: '#7c3aed', // Violet
    glowColor: 'rgba(124, 58, 237, 0.15)',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800/50',
    iconName: 'Cpu',
  },
  'instructions-context': {
    id: 'instructions-context',
    name: 'Instructions & Context',
    tagline: 'What the AI is told, and what it is shown',
    color: '#2563eb', // Blue
    glowColor: 'rgba(37, 99, 235, 0.15)',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50',
    iconName: 'FileText',
  },
  'tools-connections': {
    id: 'tools-connections',
    name: 'Tools & Connections',
    tagline: 'How an AI reaches things outside itself',
    color: '#059669', // Emerald
    glowColor: 'rgba(5, 150, 105, 0.15)',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
    iconName: 'Wrench',
  },
  'knowledge-memory': {
    id: 'knowledge-memory',
    name: 'Knowledge & Memory',
    tagline: 'How it looks things up, and what it keeps',
    color: '#d97706', // Amber
    glowColor: 'rgba(217, 119, 6, 0.15)',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    iconName: 'Database',
  },
  'agent-teamwork': {
    id: 'agent-teamwork',
    name: 'Agent Teamwork',
    tagline: 'Several AIs sharing one job',
    color: '#db2777', // Pink
    glowColor: 'rgba(219, 39, 119, 0.15)',
    badgeBg: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800/50',
    iconName: 'Users',
  },
  'model-adaptation': {
    id: 'model-adaptation',
    name: 'Model Adaptation',
    tagline: 'Changing, teaching, or shrinking the AI itself',
    color: '#4f46e5', // Indigo
    glowColor: 'rgba(79, 70, 229, 0.15)',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50',
    iconName: 'Sliders',
  },
  'reliability-safety': {
    id: 'reliability-safety',
    name: 'Reliability & Safety',
    tagline: 'Keeping it truthful, safe, and checked',
    color: '#e11d48', // Rose
    glowColor: 'rgba(225, 29, 72, 0.15)',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50',
    iconName: 'ShieldCheck',
  },
  'deployment-efficiency': {
    id: 'deployment-efficiency',
    name: 'Deployment & Efficiency',
    tagline: 'Running it for real without wasting money',
    color: '#0d9488', // Teal
    glowColor: 'rgba(13, 148, 136, 0.15)',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800/50',
    iconName: 'Zap',
  },
};

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'all',
    title: 'Everything',
    description: 'Every word in the guide, from prompts to swarms.',
    icon: 'Compass',
    conceptIds: [
      'models', 'prompts-tokens', 'context-window', 'hallucinations',
      'harness', 'agentic-ai', 'loop-engineering', 'graph-engineering',
      'context-engineering', 'skills', 'prompt-optimization',
      'tool-use', 'function-calling', 'mcp', 'stateless-mcp',
      'rag-2', 'memory-layers', 'vector-dbs',
      'multi-agent-systems', 'swarms',
      'fine-tuning', 'synthetic-data', 'distillation',
      'eval-frameworks', 'guardrails', 'observability',
      'ai-gateways', 'cost-optimization', 'ai-apis',
      'temperature', 'system-prompt', 'reasoning-models', 'multimodal', 'parameters',
      'embeddings', 'inference', 'lora', 'quantization', 'rlhf', 'open-weights',
      'subagents', 'prompt-injection', 'computer-use', 'structured-output',
      'human-in-the-loop', 'prompt-caching', 'sandbox'
    ],
  },
  {
    id: 'chatbots',
    title: 'Chatbots',
    description: 'For people who talk to ChatGPT, Claude, or Gemini and want to know what is going on.',
    icon: 'MessageSquare',
    conceptIds: ['models', 'prompts-tokens', 'context-window', 'hallucinations', 'rag-2', 'memory-layers', 'guardrails', 'prompt-optimization', 'ai-apis', 'temperature', 'system-prompt', 'reasoning-models', 'multimodal', 'parameters'],
  },
  {
    id: 'coding-assistants',
    title: 'Coding Assistants',
    description: 'What tools like Cursor and Claude Code are doing when they write code for you.',
    icon: 'Code',
    conceptIds: ['context-engineering', 'skills', 'tool-use', 'function-calling', 'mcp', 'harness', 'ai-apis', 'observability', 'system-prompt', 'structured-output', 'computer-use', 'sandbox', 'prompt-caching'],
  },
  {
    id: 'agents',
    title: 'Agents',
    description: 'What it means when an AI keeps working by itself: loops, harnesses, swarms.',
    icon: 'Bot',
    conceptIds: ['agentic-ai', 'harness', 'loop-engineering', 'graph-engineering', 'mcp', 'stateless-mcp', 'multi-agent-systems', 'swarms', 'subagents', 'computer-use', 'human-in-the-loop', 'sandbox'],
  },
];
