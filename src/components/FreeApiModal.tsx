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

// Kept free of model names and exact limits on purpose: both change often.
// Each card says what the place is good for and where to check today's numbers.
const FREE_PROVIDERS: FreeProvider[] = [
  {
    name: 'Google AI Studio',
    tagline: 'Free API keys for Google\'s Gemini models',
    models: 'Google\'s current Gemini models, including fast and larger ones',
    freeLimit: 'A daily and per-minute limit. The current numbers are on Google\'s pricing page.',
    creditCardRequired: false,
    bestFor: 'Reading long documents, images, and PDFs',
    url: 'https://aistudio.google.com/',
    steps: [
      'Sign in at aistudio.google.com with a Google account',
      'Choose "Get API key"',
      'Create a key. No credit card is needed for the free tier'
    ]
  },
  {
    name: 'Groq',
    tagline: 'Very fast replies from open models, on Groq\'s own chips',
    models: 'A rotating list of open models, shown in the Groq console',
    freeLimit: 'A free developer tier with rate limits. The console shows yours.',
    creditCardRequired: false,
    bestFor: 'Chat apps where speed matters',
    url: 'https://console.groq.com/',
    steps: [
      'Sign up at console.groq.com',
      'Open API Keys and create a key',
      'Groq works with OpenAI-style code: point it at https://api.groq.com/openai/v1'
    ]
  },
  {
    name: 'OpenRouter',
    tagline: 'One key for models from many different companies',
    models: 'Hundreds of models. Some are marked :free',
    freeLimit: 'Models marked :free cost nothing, with daily request limits.',
    creditCardRequired: false,
    bestFor: 'Trying many models without signing up everywhere',
    url: 'https://openrouter.ai/models?max_price=0',
    steps: [
      'Sign up at openrouter.ai',
      'Go to Keys and create a key',
      'Pick a model whose name ends in :free'
    ]
  },
  {
    name: 'GitHub Models',
    tagline: 'Free model playground inside GitHub',
    models: 'A catalog of models from several companies, listed on the page',
    freeLimit: 'Free with daily and per-minute limits, set by model.',
    creditCardRequired: false,
    bestFor: 'Trying well-known models before paying for them',
    url: 'https://github.com/marketplace/models',
    steps: [
      'Open github.com/marketplace/models while signed in',
      'Pick a model and try it in the playground',
      'To call it from code, create a GitHub personal access token'
    ]
  },
  {
    name: 'Ollama',
    tagline: 'Free, private AI that runs on your own computer',
    models: 'Open models such as Llama, Mistral, Qwen, Gemma, and gpt-oss',
    freeLimit: 'No limit. It runs on your own machine, so speed depends on your computer.',
    creditCardRequired: false,
    bestFor: 'Privacy, and working offline',
    url: 'https://ollama.com/',
    steps: [
      'Download Ollama from ollama.com for Mac, Windows, or Linux',
      'Pick a model at ollama.com/library and run: ollama run followed by its name',
      'Your code can call it at http://localhost:11434'
    ]
  },
  {
    name: 'Hugging Face',
    tagline: 'The biggest library of open models, with free trial access',
    models: 'Thousands of open models for text, images, and audio',
    freeLimit: 'Small monthly free credits for trying hosted models.',
    creditCardRequired: false,
    bestFor: 'Unusual or specialist models',
    url: 'https://huggingface.co/',
    steps: [
      'Create a free account at huggingface.co',
      'Go to Settings > Access Tokens and create a token',
      'Open a model page and use its "Use this model" or inference options'
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
