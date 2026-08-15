'use client'

import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'

const MAX_OVERFLOW = 50

type ElasticSliderProps = {
  defaultValue?: number
  startingValue?: number
  maxValue?: number
  className?: string
  isStepped?: boolean
  stepSize?: number
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  /** Shows the rounded numeric value under the track. Off by default so callers can supply their own formatted display. */
  showValue?: boolean
  ariaLabel?: string
  /** Fires on every drag/keyboard step, not just on release — lets a parent mirror the value live. */
  onChange?: (value: number) => void
}

/**
 * Ported from React Bits' ElasticSlider (reactbits.dev), recolored to the app's theme tokens
 * and adapted to be usable as a real form control: a `defaultValue` + `onChange` pair (so a
 * parent can drive Reset/preset buttons), plus keyboard and ARIA slider semantics that the
 * original — pointer-only — version didn't have.
 */
export default function ElasticSlider({
  defaultValue = 50,
  startingValue = 0,
  maxValue = 100,
  className = '',
  isStepped = false,
  stepSize = 1,
  leftIcon = <>-</>,
  rightIcon = <>+</>,
  showValue = false,
  ariaLabel,
  onChange,
}: Readonly<ElasticSliderProps>) {
  return (
    <div className={`flex w-full flex-col items-center gap-2 ${className}`}>
      <Slider
        defaultValue={defaultValue}
        startingValue={startingValue}
        maxValue={maxValue}
        isStepped={isStepped}
        stepSize={stepSize}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        showValue={showValue}
        ariaLabel={ariaLabel}
        onChange={onChange}
      />
    </div>
  )
}

type SliderProps = {
  defaultValue: number
  startingValue: number
  maxValue: number
  isStepped: boolean
  stepSize: number
  leftIcon: React.ReactNode
  rightIcon: React.ReactNode
  showValue: boolean
  ariaLabel?: string
  onChange?: (value: number) => void
}

function Slider({ defaultValue, startingValue, maxValue, isStepped, stepSize, leftIcon, rightIcon, showValue, ariaLabel, onChange }: Readonly<SliderProps>) {
  const [value, setValue] = useState(defaultValue)
  // Resync from an external defaultValue change (Reset/preset buttons) via the render-time
  // "adjusting state when a prop changes" pattern, avoiding an effect-driven extra render.
  const [trackedDefault, setTrackedDefault] = useState(defaultValue)
  if (trackedDefault !== defaultValue) {
    setTrackedDefault(defaultValue)
    setValue(defaultValue)
  }
  const sliderRef = useRef<HTMLDivElement>(null)
  const [region, setRegion] = useState<'left' | 'middle' | 'right'>('middle')
  const clientX = useMotionValue(0)
  const overflow = useMotionValue(0)
  const scale = useMotionValue(1)

  useMotionValueEvent(clientX, 'change', (latest) => {
    if (sliderRef.current) {
      const { left, right } = sliderRef.current.getBoundingClientRect()
      let newValue: number

      if (latest < left) {
        setRegion('left')
        newValue = left - latest
      } else if (latest > right) {
        setRegion('right')
        newValue = latest - right
      } else {
        setRegion('middle')
        newValue = 0
      }

      overflow.jump(decay(newValue, MAX_OVERFLOW))
    }
  })

  function commitValue(rawValue: number) {
    let nextValue = rawValue
    if (isStepped) nextValue = Math.round(nextValue / stepSize) * stepSize
    nextValue = Math.min(Math.max(nextValue, startingValue), maxValue)
    setValue(nextValue)
    onChange?.(nextValue)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0 && sliderRef.current) {
      const { left, width } = sliderRef.current.getBoundingClientRect()
      commitValue(startingValue + ((e.clientX - left) / width) * (maxValue - startingValue))
      clientX.jump(e.clientX)
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerUp = () => {
    animate(overflow, 0, { type: 'spring', bounce: 0.5 })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = isStepped ? stepSize : (maxValue - startingValue) / 100 || 1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      commitValue(value + step)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      commitValue(value - step)
    } else if (e.key === 'Home') {
      e.preventDefault()
      commitValue(startingValue)
    } else if (e.key === 'End') {
      e.preventDefault()
      commitValue(maxValue)
    }
  }

  const getRangePercentage = () => {
    const totalRange = maxValue - startingValue
    if (totalRange === 0) return 0
    return ((value - startingValue) / totalRange) * 100
  }

  return (
    <>
      <motion.div
        onHoverStart={() => animate(scale, 1.2)}
        onHoverEnd={() => animate(scale, 1)}
        onTouchStart={() => animate(scale, 1.2)}
        onTouchEnd={() => animate(scale, 1)}
        style={{ scale, opacity: useTransform(scale, [1, 1.2], [0.7, 1]) }}
        className="flex w-full touch-none items-center gap-[10px] select-none"
      >
        <motion.div
          animate={{ scale: region === 'left' ? [1, 1.4, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: useTransform(() => (region === 'left' ? -overflow.get() / scale.get() : 0)) }}
          className="text-content-muted shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]"
        >
          {leftIcon}
        </motion.div>

        <div
          ref={sliderRef}
          role="slider"
          tabIndex={0}
          aria-label={ariaLabel}
          aria-valuemin={startingValue}
          aria-valuemax={maxValue}
          aria-valuenow={Math.round(value)}
          className="relative flex w-full flex-1 touch-none items-center rounded-full py-[14px] cursor-grab select-none active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={handlePointerUp}
          onKeyDown={handleKeyDown}
        >
          <motion.div
            style={{
              scaleX: useTransform(() => {
                if (!sliderRef.current) return 1
                const { width } = sliderRef.current.getBoundingClientRect()
                return 1 + overflow.get() / width
              }),
              scaleY: useTransform(overflow, [0, MAX_OVERFLOW], [1, 0.8]),
              transformOrigin: useTransform(() => {
                if (!sliderRef.current) return 'left'
                const { left, width } = sliderRef.current.getBoundingClientRect()
                return clientX.get() < left + width / 2 ? 'right' : 'left'
              }),
              height: useTransform(scale, [1, 1.2], [8, 14]),
              marginTop: useTransform(scale, [1, 1.2], [0, -3]),
              marginBottom: useTransform(scale, [1, 1.2], [0, -3]),
            }}
            className="flex flex-1"
          >
            <div className="relative h-full flex-1 overflow-hidden rounded-full bg-[var(--color-gauge-track)]">
              <div className="bg-status-teal absolute h-full rounded-full" style={{ width: `${getRangePercentage()}%` }} />
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ scale: region === 'right' ? [1, 1.4, 1] : 1, transition: { duration: 0.25 } }}
          style={{ x: useTransform(() => (region === 'right' ? overflow.get() / scale.get() : 0)) }}
          className="text-content-muted shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px]"
        >
          {rightIcon}
        </motion.div>
      </motion.div>
      {showValue && <p className="text-content-muted text-[12px] font-medium tracking-[0.05em]">{Math.round(value)}</p>}
    </>
  )
}

function decay(value: number, max: number) {
  if (max === 0) return 0
  const entry = value / max
  const sigmoid = 2 * (1 / (1 + Math.exp(-entry)) - 0.5)
  return sigmoid * max
}
