import type { ReactNode } from 'react'

// Gemini reliably returns bold + bullets as asked, but not always with the exact "- " marker
// the prompt requests (e.g. it sometimes uses "* ") — recognize the common variants so real
// model output never silently renders as a stray-asterisk paragraph instead of a bullet.
const BULLET_PREFIXES = ['- ', '* ', '• ']

function stripBulletPrefix(line: string): string | null {
  for (const prefix of BULLET_PREFIXES) {
    if (line.startsWith(prefix)) return line.slice(prefix.length)
  }
  return null
}

function renderInline(line: string): ReactNode {
  const parts = line.split(/\*\*(.+?)\*\*/g)
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

/** Minimal renderer for the small Markdown subset the AI layer produces (bold + bullets). */
export function renderAiMarkdown(text: string): ReactNode {
  const lines = text.split('\n').filter((l) => l.trim().length > 0)
  return (
    <>
      {lines.map((line, i) => {
        const bulletContent = stripBulletPrefix(line.trim())
        if (bulletContent !== null) {
          return (
            <li className="mb-[16px] text-[13px]" key={i}>
              {renderInline(bulletContent)}
            </li>
          )
        }
        return (
          <p className="mb-[16px] text-[13px]" key={i}>
            {renderInline(line)}
          </p>
        )
      })}
    </>
  )
}
