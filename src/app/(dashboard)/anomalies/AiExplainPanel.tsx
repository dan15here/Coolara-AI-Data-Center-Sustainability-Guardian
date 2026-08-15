'use client'

import { Bot, CheckCircle2, Clock3, FlaskConical, Sparkles } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ErrorState, LoadingState, Pill } from '@/components/ui'
import type { ExplainFindingResponse } from '@/lib/ai/types'
import type { Finding } from '@/types'

/** Minimal renderer for the small Markdown subset the AI layer produces (bold + bullets). */
function renderInline(line: string): ReactNode {
  const parts = line.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  return (
    <>
      {lines.map((line, i) => {
        if (line.trim().startsWith('- ')) {
          return <li className="mb-[16px] text-[13px]" key={i}>{renderInline(line.trim().slice(2))}</li>
        }
        return <p className="mb-[16px] text-[13px]" key={i}>{renderInline(line)}</p>
      })}
    </>
  )
}

type Status = { status: 'idle' } | { status: 'loading' } | { status: 'error' } | { status: 'done'; result: ExplainFindingResponse }

export function AiExplainPanel({ finding }: Readonly<{ finding: Finding }>) {
  const [state, setState] = useState<Status>({ status: 'idle' })

  async function handleExplain() {
    setState({ status: 'loading' })
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding }),
      })
      if (!response.ok) throw new Error('Request failed')
      const result: ExplainFindingResponse = await response.json()
      setState({ status: 'done', result })
    } catch {
      setState({ status: 'error' })
    }
  }

  return (
    <section className="p-[22px] border border-surface-line bg-surface-panel rounded-lg mt-0">
      <div className="flex justify-between gap-[15px] items-center">
        <div className="w-[39px] h-[39px] grid place-items-center rounded-[9px] bg-status-teal/20 text-status-teal shrink-0">
          <Bot size={22} />
        </div>
        <div className="mr-auto">
          <p className="text-teal-700 dark:text-[#8fa29f] tracking-[1.25px] font-bold text-[10px] m-[0_0_8px] uppercase">COOLARA AI ANALYSIS</p>
          <h2 className="m-0 text-[18px]">Qualitative explanation</h2>
        </div>
        {state.status === 'done' && (
          <Pill tone="healthy">
            {state.result.cached ? <Clock3 size={14} /> : <CheckCircle2 size={14} />}{' '}
            {state.result.cached ? 'Cached · ' : ''}
            {state.result.source === 'gemini' ? (state.result.model ?? 'Gemini') : 'Rule-based fallback'}
          </Pill>
        )}
      </div>

      {state.status === 'idle' && (
        <div className="mt-[20px] p-[23px] bg-slate-50 dark:bg-[#121719] border border-dashed border-slate-300 dark:border-[#425157] flex flex-col sm:flex-row sm:items-start md:items-center gap-[13px] rounded-lg">
          <Sparkles className="text-status-teal shrink-0" size={22} />
          <div>
            <strong className="text-[13px]">Run analysis to ask Gemini for a qualitative explanation.</strong>
            <p className="text-content-muted m-[5px_0_0] text-[12px]">The model receives structured findings only; it cannot approve a safety outcome or create numerical claims.</p>
          </div>
          <button 
            className="border-0 rounded-[6px] bg-status-teal text-white dark:text-[#10201f] font-bold inline-flex items-center justify-center gap-[7px] px-[14px] py-[11px] hover:bg-teal-700 dark:hover:bg-[#5bd5c6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-bg sm:ml-[35px] md:ml-auto shrink-0" 
            type="button" 
            onClick={handleExplain}
          >
            <Sparkles size={15} /> Analyze findings
          </button>
        </div>
      )}

      {state.status === 'loading' && <LoadingState label="Generating explanation…" />}

      {state.status === 'error' && <ErrorState label="Could not generate an explanation." onRetry={handleExplain} />}

      {state.status === 'done' && (
        <div className="mt-[20px] p-[18px] bg-slate-50 dark:bg-[#121719] rounded-[7px] leading-[1.55] text-slate-700 dark:text-[#ccd5d4]">
          {renderMarkdown(state.result.explanation)}
          <small className="flex items-center gap-[5px] pt-[12px] border-t border-surface-line text-slate-500 dark:text-[#98aaa9] text-[11px]">
            <FlaskConical size={14} /> Qualitative AI explanation based only on structured, synthetic findings. Numerical
            values remain deterministic.
          </small>
        </div>
      )}
    </section>
  )
}
