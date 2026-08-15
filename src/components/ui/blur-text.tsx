'use client'

import { motion, type TargetAndTransition } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

type AnimationValues = Record<string, string | number>

type BlurTextProps = {
  text: string
  className?: string
  animateBy?: 'words' | 'letters'
  direction?: 'top' | 'bottom'
  delay?: number
  stepDuration?: number
  threshold?: number
  rootMargin?: string
  animationFrom?: AnimationValues
  animationTo?: AnimationValues[]
  onAnimationComplete?: () => void
}

function buildKeyframes(from: AnimationValues, steps: AnimationValues[]): TargetAndTransition {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))])
  const keyframes: Record<string, Array<string | number | undefined>> = {}

  keys.forEach((key) => {
    keyframes[key] = [from[key], ...steps.map((step) => step[key])]
  })

  return keyframes as TargetAndTransition
}

/** Animates a sentence into view word-by-word or letter-by-letter with a soft blur. */
export default function BlurText({
  text,
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  onAnimationComplete,
  stepDuration = 0.35,
}: Readonly<BlurTextProps>) {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('')
  const [inView, setInView] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(node)
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  const defaultFrom = useMemo<AnimationValues>(
    () => ({ filter: 'blur(10px)', opacity: 0, y: direction === 'top' ? -28 : 28 }),
    [direction],
  )
  const defaultTo = useMemo<AnimationValues[]>(
    () => [
      { filter: 'blur(4px)', opacity: 0.55, y: direction === 'top' ? 4 : -4 },
      { filter: 'blur(0px)', opacity: 1, y: 0 },
    ],
    [direction],
  )

  const fromSnapshot = animationFrom ?? defaultFrom
  const toSnapshots = animationTo ?? defaultTo
  const totalDuration = stepDuration * toSnapshots.length
  const times = Array.from({ length: toSnapshots.length + 1 }, (_, index) => index / toSnapshots.length)

  return (
    <motion.span ref={ref} className={className} style={{ display: 'flex', flexWrap: 'wrap' }}>
      {elements.map((segment, index) => (
        <motion.span
          key={`${segment}-${index}`}
          className="inline-block will-change-[transform,filter,opacity]"
          initial={fromSnapshot as TargetAndTransition}
          animate={inView ? buildKeyframes(fromSnapshot, toSnapshots) : fromSnapshot}
          transition={{ duration: totalDuration, times, delay: (index * delay) / 1000, ease: 'easeOut' }}
          onAnimationComplete={index === elements.length - 1 ? onAnimationComplete : undefined}
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </motion.span>
  )
}
