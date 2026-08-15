'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react'

type LandingDashboardLinkProps = {
  children: ReactNode
  className?: string
  href?: string
}

export default function LandingDashboardLink({
  children,
  className,
  href = '/dashboard',
}: LandingDashboardLinkProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    timeoutRef.current = window.setTimeout(() => {
      router.push(href)
    }, 460)
  }

  return (
    <>
      <Link href={href} onClick={handleClick} className={className} aria-busy={isLoading}>
        {children}
      </Link>

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            className="fixed inset-0 z-[100] grid place-items-center bg-[#07100f]/90 px-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-live="polite"
            aria-label="Opening Coolara Command Center"
            role="status"
          >
            <motion.div
              className="flex flex-col items-center gap-5"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            >
              <Image
                src="/logos/coolara-wordmark-c-icon.svg"
                alt="Coolara"
                width={270}
                height={72}
                priority
              />
              <div className="flex items-center gap-3 text-sm font-medium text-teal-100">
                <motion.span
                  className="h-4 w-4 rounded-full border-2 border-teal-300/35 border-t-teal-300"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
                />
                Opening Command Center
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
