'use client'

import { Bot, CheckCircle2, FlaskConical, Sparkles } from 'lucide-react'
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
          return <li key={i}>{renderInline(line.trim().slice(2))}</li>
        }
        return <p key={i}>{renderInline(line)}</p>
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
    <section className="ai-panel">
      <div className="ai-heading">
        <div className="ai-icon">
          <Bot size={22} />
        </div>
        <div>
          <p className="eyebrow">COOLARA AI ANALYSIS</p>
          <h2>Qualitative explanation</h2>
        </div>
        {state.status === 'done' && (
          <Pill tone="healthy">
            <CheckCircle2 size={14} /> {state.result.source === 'gemini' ? (state.result.model ?? 'Gemini') : 'Rule-based fallback'}
          </Pill>
        )}
      </div>

      {state.status === 'idle' && (
        <div className="ai-idle">
          <Sparkles size={22} />
          <div>
            <strong>Run analysis to ask Gemini for a qualitative explanation.</strong>
            <p>The model receives structured findings only; it cannot approve a safety outcome or create numerical claims.</p>
          </div>
          <button className="button" type="button" onClick={handleExplain}>
            <Sparkles size={15} /> Analyze findings
          </button>
        </div>
      )}

      {state.status === 'loading' && <LoadingState label="Generating explanation…" />}

      {state.status === 'error' && <ErrorState label="Could not generate an explanation." onRetry={handleExplain} />}

      {state.status === 'done' && (
        <div className="ai-result">
          {renderMarkdown(state.result.explanation)}
          <small>
            <FlaskConical size={14} /> Qualitative AI explanation based only on structured, synthetic findings. Numerical
            values remain deterministic.
          </small>
        </div>
      )}
    </section>
  )
}
