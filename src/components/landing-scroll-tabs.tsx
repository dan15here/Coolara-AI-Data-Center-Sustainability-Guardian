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

    let frameId = 0

    const updateActiveTab = () => {
      const marker = window.scrollY + window.innerHeight * 0.32
      let nextId: (typeof tabs)[number]['id'] = 'top'

      for (const section of sections) {
        if (section.offsetTop <= marker) {
          nextId = section.id as (typeof tabs)[number]['id']
        }
      }

      setActiveId((currentId) => (currentId === nextId ? currentId : nextId))
    }

    const scheduleUpdate = () => {
      if (frameId) return
      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateActiveTab()
      })
    }

    updateActiveTab()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
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
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
