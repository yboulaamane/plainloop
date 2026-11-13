import React from 'react';
import { X, ExternalLink, Gift, ShieldCheck, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenConcept: () => void;
}

interface FreeProvider {
  name: string;
  tagline: string;
  models: string;
  freeLimit: string;
  creditCardRequired: boolean;
  bestFor: string;
  url: string;
  steps: string[];
}

const FREE_PROVIDERS: FreeProvider[] = [
  {
    name: 'Google AI Studio (Gemini)',
    tagline: 'The most generous official free tier from a frontier lab',
    models: 'Gemini 1.5 Flash & Gemini 1.5 Pro',
    freeLimit: '15 Requests Per Minute (RPM), 1M context, 1,500 req/day',
    creditCardRequired: false,
    bestFor: 'Multimodal apps, reading full PDFs, huge 1M contexts',
    url: 'https://aistudio.google.com/',
    steps: [
      'Sign in at aistudio.google.com with your Google account',
      'Click "Get API Key" in the left sidebar',
      'Click "Create API Key" (Takes 5 seconds, no credit card)'
    ]
  },
  {
    name: 'Groq Cloud',
    tagline: 'Record-setting inference speed (500+ tokens/sec) on LPUs',
    models: 'Llama 3.3 70B, Mixtral 8x7B, Gemma 2',
    freeLimit: 'Generous free developer quota with sub-second latency',
    creditCardRequired: false,
    bestFor: 'Real-time conversational agents, high-speed coding',
    url: 'https://console.groq.com/',
    steps: [
      'Sign up at console.groq.com with GitHub or Google',
      'Navigate to API Keys > "Create API Key"',
      'Use the OpenAI-compatible endpoint `https://api.groq.com/openai/v1`'
    ]
  },
  {
    name: 'OpenRouter (Free Catalog)',
    tagline: 'Unified gateway providing zero-cost open models',
    models: 'DeepSeek R1, Llama 3.3 70B, Mistral (`:free` models)',
    freeLimit: 'Free tier on all models tagged `:free` with zero balance',
    creditCardRequired: false,
    bestFor: 'Trying dozens of open-weights models with 1 API key',
    url: 'https://openrouter.ai/models?max_price=0',
    steps: [
      'Sign up at openrouter.ai using Google or GitHub',
      'Go to Keys and generate a key with $0 balance',
      'Select any model ending in `:free` (e.g. `deepseek/deepseek-r1:free`)'
    ]
  },
  {
    name: 'GitHub Models',
    tagline: 'Free developer sandbox hosted directly in GitHub',
    models: 'GPT-4o, Claude 3.5 Sonnet, Llama 3.3',
    freeLimit: 'Free prototyping tier (50-150 requests/day per account)',
    creditCardRequired: false,
    bestFor: 'Testing commercial models without paying upfront',
    url: 'https://github.com/marketplace/models',
    steps: [
      'Visit github.com/marketplace/models while logged in',
      'Pick a model (like GPT-4o) and click "Playground"',
      'Generate a free GitHub Personal Access Token to call it via code'
    ]
  },
  {
    name: 'Ollama (Local & Offline)',
    tagline: '100% free, private, offline AI running on your laptop',
    models: 'Llama 3, DeepSeek, Mistral, Qwen, Phi-3',
    freeLimit: 'Unlimited forever! Runs locally on your CPU/GPU',
    creditCardRequired: false,
    bestFor: 'Total data privacy, zero internet requirement, offline agents',
    url: 'https://ollama.com/',
    steps: [
      'Download Ollama from ollama.com for Mac, Windows, or Linux',
      'Open your terminal and type: `ollama run llama3`',
      'Access the local OpenAI-compatible API at `http://localhost:11434/v1`'
    ]
  },
  {
    name: 'Hugging Face Inference',
    tagline: 'Free access to thousands of open-source community checkpoints',
    models: 'Over 100,000 text, audio, and vision checkpoints',
    freeLimit: 'Free community rate-limited tier',
    creditCardRequired: false,
    bestFor: 'Niche domain models and custom fine-tunes',
    url: 'https://huggingface.co/docs/api-inference/',
    steps: [
      'Create a free account at huggingface.co',
      'Go to Settings > Access Tokens > "Create New Token"',
      'Call the serverless API directly using your token'
    ]
  }
];

export const FreeApiModal: React.FC<Props> = ({ isOpen, onClose, onOpenConcept }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/50 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="panel relative my-4 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-api-title"
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-rule bg-card/95 px-6 py-5 backdrop-blur dark:border-white/10 dark:bg-nightcard/95 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss/15 text-moss dark:text-mossbright">
              <Gift className="h-6 w-6" />
            </span>
            <div>
              <h2 id="free-api-title" className="font-display text-3xl leading-tight">
                Free APIs to practice with
              </h2>
              <p className="mt-1 text-lg text-mute">
                Places you can try models without a credit card.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onOpenConcept(); }}
              className="hidden items-center gap-2 rounded-full border border-rule px-4 py-2.5 text-base font-semibold sm:flex dark:border-white/10"
            >
              Open the lesson
              <Sparkles className="h-4 w-4 text-moss dark:text-mossbright" />
            </button>
            <button
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-rule text-mute dark:border-white/10"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          <div className="rounded-3xl bg-canvas p-5 text-lg leading-relaxed text-mute dark:bg-night">
            <strong className="block text-xl text-ink dark:text-cream">How a free tier works</strong>
            Labs give you a limited number of requests so you can learn. Stay inside that limit and you are not billed.
          </div>

          {/* Grid of Providers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FREE_PROVIDERS.map((prov) => (
              <div 
                key={prov.name} 
                className="flex flex-col justify-between gap-4 rounded-[24px] border border-rule bg-card p-6 dark:border-white/10 dark:bg-night"
              >
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-2xl">{prov.name}</h3>
                    <span className="rounded-full bg-moss/15 px-3 py-1 text-sm font-semibold text-moss dark:text-mossbright">
                      No card
                    </span>
                  </div>
                  <p className="mb-4 text-lg italic text-mute">{prov.tagline}</p>
                  <div className="mb-4 space-y-2 text-base">
                    <div className="rounded-2xl bg-canvas px-4 py-3 dark:bg-nightcard">
                      <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-mute">Models</span>
                      <span className="mt-1 block text-lg">{prov.models}</span>
                    </div>
                    <div className="rounded-2xl bg-canvas px-4 py-3 dark:bg-nightcard">
                      <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-mute">Free limit</span>
                      <span className="mt-1 block text-lg text-moss dark:text-mossbright">{prov.freeLimit}</span>
                    </div>
                  </div>
                  <p className="mb-1 text-base font-semibold">Quick setup</p>
                  <ol className="list-decimal space-y-1 pl-5 text-base leading-relaxed text-mute">
                    {prov.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4 dark:border-white/10">
                  <span className="text-base text-mute">
                    Best for <strong className="text-ink dark:text-cream">{prov.bestFor}</strong>
                  </span>
                  <a
                    href={prov.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-moss px-4 py-2.5 text-base font-semibold text-cream"
                  >
                    Get a key
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Security Rules */}
          <div className="space-y-2 rounded-3xl bg-canvas p-5 text-lg dark:bg-night">
            <span className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-moss dark:text-mossbright" />
              Keep the key private
            </span>
            <p className="leading-relaxed text-mute">
              Keep API keys in a local <code className="rounded-md bg-card px-1.5 py-0.5 dark:bg-nightcard">.env</code> file that is listed in <code className="rounded-md bg-card px-1.5 py-0.5 dark:bg-nightcard">.gitignore</code>. A public repository will burn the free quota.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
