'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const tabs = [
  { id: 'top', label: 'Home' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
] as const

/** Landing-page quick access that follows the section currently in view. */
export default function LandingScrollTabs() {
  const [activeId, setActiveId] = useState<(typeof tabs)[number]['id']>('top')

  useEffect(() => {
    const sections = tabs
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (mostVisible?.target.id) {
          setActiveId(mostVisible.target.id as (typeof tabs)[number]['id'])
        }
      },
      { rootMargin: '-18% 0px -60% 0px', threshold: [0.1, 0.35, 0.65] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <nav aria-label="Quick access" className="hidden md:flex items-center gap-1 rounded-full border border-[#2b363c] bg-[#171d21]/80 p-1 shadow-sm">
      {tabs.map((tab) => {
        const isActive = activeId === tab.id

        return (
          <Link
            key={tab.id}
            href={`#${tab.id}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => setActiveId(tab.id)}
            className={`relative px-3 py-1.5 text-[13px] font-medium transition-colors ${
              isActive ? 'text-[#042f2b]' : 'text-[#91a0a3] hover:text-teal-300'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="landing-active-tab"
                className="absolute inset-0 rounded-full bg-teal-400 shadow-[0_0_16px_rgba(45,212,191,0.28)]"
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
