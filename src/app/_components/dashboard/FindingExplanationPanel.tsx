'use client';

import { useState, type ReactNode } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { Finding } from '@/types';
import type { ExplainFindingResponse } from '@/lib/ai/types';

/** Minimal renderer for the small Markdown subset the AI layer produces (bold + bullets). */
function renderInline(line: string): ReactNode {
  const parts = line.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n').filter((l) => l.trim().length > 0);
  return (
    <div className="flex flex-col gap-1">
      {lines.map((line, i) => {
        if (line.trim().startsWith('- ')) {
          return (
            <li key={i} className="ml-4 list-disc">
              {renderInline(line.trim().slice(2))}
            </li>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

export function FindingExplanationPanel({ finding }: { finding: Finding }) {
  const [state, setState] = useState<
    { status: 'idle' } | { status: 'loading' } | { status: 'error' } | { status: 'done'; result: ExplainFindingResponse }
  >({ status: 'idle' });

  async function handleExplain() {
    setState({ status: 'loading' });
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding }),
      });
      if (!response.ok) throw new Error('Request failed');
      const result: ExplainFindingResponse = await response.json();
      setState({ status: 'done', result });
    } catch {
      setState({ status: 'error' });
    }
  }

  if (state.status === 'idle') {
    return (
      <button
        type="button"
        onClick={handleExplain}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Explain
      </button>
    );
  }

  if (state.status === 'loading') {
    return (
      <p className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Generating explanation...
      </p>
    );
  }

  if (state.status === 'error') {
    return <p className="text-xs text-red-600 dark:text-red-400">Could not generate an explanation.</p>;
  }

  const { result } = state;
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
      <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">
        {result.source === 'gemini' ? `AI explanation (${result.model ?? 'Gemini'})` : 'Rule-based explanation — AI unavailable'}
      </p>
      {renderMarkdown(result.explanation)}
    </div>
  );
}
