'use client'

import { useRef, useState } from 'react'

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
 * A simple accessible slider with a `defaultValue` + `onChange` pair so a parent can drive
 * Reset/preset buttons, plus keyboard and pointer interactions.
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
    }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e)
    e.currentTarget.setPointerCapture(e.pointerId)
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

  const nudgeValue = (direction: -1 | 1) => {
    const amount = isStepped ? stepSize : (maxValue - startingValue) / 100 || 1
    commitValue(value + direction * amount)
  }

  return (
    <>
      <div className="flex w-full touch-none items-center gap-[10px] select-none">
        <button
          type="button"
          aria-label={`Decrease ${ariaLabel ?? 'value'}`}
          onClick={() => nudgeValue(-1)}
          className="shrink-0 rounded-full p-1 text-content-muted transition-colors hover:bg-surface-subtle hover:text-status-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal [&>svg]:h-[18px] [&>svg]:w-[18px]"
        >
          {leftIcon}
        </button>

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
          onKeyDown={handleKeyDown}
        >
          <div className="relative flex h-[8px] flex-1">
            <div className="relative h-full flex-1 overflow-hidden rounded-full bg-[var(--color-gauge-track)]">
              <div className="bg-status-teal absolute h-full rounded-full" style={{ width: `${getRangePercentage()}%` }} />
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface-panel bg-status-teal shadow-[0_0_0_2px_rgba(45,212,191,0.32),0_0_14px_rgba(45,212,191,0.55)]"
              style={{ left: `clamp(9px, ${getRangePercentage()}%, calc(100% - 9px))` }}
            />
          </div>
        </div>

        <button
          type="button"
          aria-label={`Increase ${ariaLabel ?? 'value'}`}
          onClick={() => nudgeValue(1)}
          className="shrink-0 rounded-full p-1 text-content-muted transition-colors hover:bg-surface-subtle hover:text-status-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-teal [&>svg]:h-[18px] [&>svg]:w-[18px]"
        >
          {rightIcon}
        </button>
      </div>
      {showValue && <p className="text-content-muted text-[12px] font-medium tracking-[0.05em]">{Math.round(value)}</p>}
    </>
  )
}
