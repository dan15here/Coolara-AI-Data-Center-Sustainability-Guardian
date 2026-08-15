'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, type ReactNode } from 'react'

type AnimatedContentProps = {
  children: ReactNode
  container?: string | HTMLElement | null
  distance?: number
  direction?: 'vertical' | 'horizontal'
  reverse?: boolean
  duration?: number
  ease?: string
  initialOpacity?: number
  animateOpacity?: boolean
  scale?: number
  threshold?: number
  delay?: number
  onComplete?: () => void
  className?: string
}

/** Reveals content once on scroll with a GSAP-powered translation, scale, and opacity transition. */
export default function AnimatedContent({
  children,
  container,
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  threshold = 0.1,
  delay = 0,
  onComplete,
  className = '',
}: Readonly<AnimatedContentProps>) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    gsap.registerPlugin(ScrollTrigger)

    const scrollerTarget: HTMLElement | null =
      typeof container === 'string'
        ? document.querySelector<HTMLElement>(container)
        : container ?? document.getElementById('snap-main-container')

    const offset = reverse ? -distance : distance
    const translate = direction === 'horizontal' ? { x: offset } : { y: offset }
    const resetTranslate = direction === 'horizontal' ? { x: 0 } : { y: 0 }
    const startPercent = (1 - threshold) * 100

    gsap.set(element, {
      ...translate,
      scale,
      opacity: animateOpacity ? initialOpacity : 1,
      visibility: 'visible',
    })

    const timeline = gsap.timeline({ paused: true, delay, onComplete })
    timeline.to(element, {
      ...resetTranslate,
      scale: 1,
      opacity: 1,
      duration,
      ease,
    })

    const trigger = ScrollTrigger.create({
      trigger: element,
      scroller: scrollerTarget ?? undefined,
      start: `top ${startPercent}%`,
      once: true,
      onEnter: () => timeline.play(),
    })

    return () => {
      trigger.kill()
      timeline.kill()
    }
  }, [animateOpacity, container, delay, direction, distance, duration, ease, initialOpacity, onComplete, reverse, scale, threshold])

  return (
    <div ref={ref} className={className} style={{ visibility: 'hidden' }}>
      {children}
    </div>
  )
}
