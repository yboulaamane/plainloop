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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-2 sm:p-6"
      onClick={onClose}
    >
      <div
        className="sheet relative my-2 flex w-full max-w-5xl flex-col sm:my-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-api-title"
      >
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-t-[4px] border-b-2 border-ink bg-sheet px-3 py-3 sm:px-8">
          <p className="flex items-center gap-2 text-lg font-bold">
            <Gift className="h-5 w-5" aria-hidden="true" /> Free APIs
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { onClose(); onOpenConcept(); }}
              className="key hidden sm:inline-flex"
            >
              Open the lesson
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={onClose} className="key key-round" aria-label="Close">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-8 px-3 py-7 sm:px-8 sm:py-10">
          <header className="max-w-3xl">
            <h2 id="free-api-title" className="font-display text-5xl leading-[1.05] tracking-tight">
              Free APIs to practice with
            </h2>
            <p className="mt-4 text-xl leading-relaxed">
              An API is how a program talks to a model. These places let you try one without a credit card.
              Each gives you a limited number of requests. Stay inside that limit and you are not billed.
            </p>
            <div className="ticks mt-6" aria-hidden="true" />
          </header>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {FREE_PROVIDERS.map((prov) => (
              <div key={prov.name} className="flex flex-col justify-between gap-5 rounded-md border-2 border-ink p-4 sm:p-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-3xl leading-tight">{prov.name}</h3>
                    <span className="tab tab-accent">No card</span>
                  </div>
                  <p className="mt-2 text-lg leading-snug">{prov.tagline}</p>
                  <dl className="mt-4 space-y-3 text-lg">
                    <div>
                      <dt className="font-bold">Models</dt>
                      <dd>{prov.models}</dd>
                    </div>
                    <div>
                      <dt className="font-bold">Free limit</dt>
                      <dd>{prov.freeLimit}</dd>
                    </div>
                    <div>
                      <dt className="font-bold">Good for</dt>
                      <dd>{prov.bestFor}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-lg font-bold">How to start</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-6 text-lg leading-relaxed">
                    {prov.steps.map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ol>
                </div>
                <a href={prov.url} target="_blank" rel="noopener noreferrer" className="key key-accent self-start">
                  Get a key
                  <ExternalLink className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>

          <div className="max-w-3xl border-l-[6px] border-accent pl-4 text-xl">
            <p className="flex items-center gap-2 font-bold">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              Keep the key private
            </p>
            <p className="mt-2 leading-relaxed">
              A key is a password. Keep it in a local <code className="rounded-sm border-2 border-ink/30 px-1.5">.env</code> file
              that is listed in <code className="rounded-sm border-2 border-ink/30 px-1.5">.gitignore</code>. If it ends up in a public
              place, strangers will use up your free limit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
