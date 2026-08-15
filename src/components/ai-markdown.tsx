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
  const nodes: ReactNode[] = []
  let bullets: { content: string; key: number }[] = []

  const flushBullets = () => {
    if (bullets.length === 0) return

    nodes.push(
      <ul className="mb-[16px] ml-[18px] list-disc space-y-[16px] pl-[18px] marker:text-teal-200" key={`bullets-${bullets[0].key}`}>
        {bullets.map((bullet) => (
          <li className="text-[13px]" key={bullet.key}>
            {renderInline(bullet.content)}
          </li>
        ))}
      </ul>,
    )
    bullets = []
  }

  lines.forEach((line, i) => {
    const bulletContent = stripBulletPrefix(line.trim())
    if (bulletContent !== null) {
      bullets.push({ content: bulletContent, key: i })
      return
    }

    flushBullets()
    nodes.push(
      <p className="mb-[16px] text-[13px]" key={i}>
        {renderInline(line)}
      </p>,
    )
  })
  flushBullets()

  return (
    <>
      {nodes}
    </>
  )
}
