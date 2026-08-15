'use client'

import { motion } from 'framer-motion'
import { Activity, Bot, FlaskConical, ScanSearch, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const workflowSteps = [
  { number: '01', icon: Activity, title: 'Monitor', description: 'See synthetic energy, water, cooling, and thermal telemetry in one command centre.' },
  { number: '02', icon: ScanSearch, title: 'Detect', description: 'Compare actual conditions against deterministic expected baselines and severity.' },
  { number: '03', icon: Bot, title: 'Explain', description: 'Use Gemini for qualitative context while all measurements stay deterministic.' },
  { number: '04', icon: FlaskConical, title: 'Simulate', description: 'Test a response before acting; the thermal gate rejects unsafe scenarios.' },
  { number: '05', icon: Sparkles, title: 'Optimize', description: 'Weigh safe trade-offs with deterministic results and a qualitative AI perspective.' },
]

/** A continuously looping 1 → 5 workflow signal for the landing page. */
export default function LandingWorkflow() {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % workflowSteps.length)
    }, 950)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="relative">
      <div className="absolute left-[10%] right-[10%] top-[70px] z-0 hidden h-px lg:grid lg:grid-cols-4" aria-hidden="true">
        {workflowSteps.slice(0, -1).map((step, index) => {
          const isActiveConnector = activeStep === index

          return (
            <motion.div
              key={step.number}
              className="relative h-px"
              animate={{
                backgroundColor: isActiveConnector ? 'rgba(45, 212, 191, 0.85)' : 'rgba(43, 54, 60, 1)',
                boxShadow: isActiveConnector ? '0 0 12px rgba(45, 212, 191, 0.72)' : '0 0 0 rgba(45, 212, 191, 0)',
              }}
              transition={{ duration: 0.18 }}
            >
              {isActiveConnector && (
                <motion.span
                  key={`pulse-${activeStep}`}
                  className="absolute -top-[3px] size-[7px] rounded-full bg-teal-200 shadow-[0_0_14px_rgba(94,234,212,1)]"
                  initial={{ left: '0%', opacity: 0, scale: 0.5 }}
                  animate={{ left: '100%', opacity: [0, 1, 1, 0], scale: [0.5, 1, 1, 0.5] }}
                  transition={{ duration: 0.76, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-x-[16px] gap-y-[40px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {workflowSteps.map((step, index) => {
          const isActive = activeStep === index
          const StepIcon = step.icon

          return (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="relative px-[18px]"
            >
              <motion.div
                className="relative mx-auto grid h-[112px] w-[112px] place-items-center rounded-[28px] border bg-[#192326]"
                animate={{
                  borderColor: isActive ? 'rgba(45, 212, 191, 0.9)' : 'rgba(52, 64, 69, 1)',
                  boxShadow: isActive
                    ? '0 0 0 4px rgba(45, 212, 191, 0.11), 0 12px 32px rgba(45, 212, 191, 0.24)'
                    : '0 12px 32px rgba(0, 0, 0, 0.16)',
                  scale: isActive ? 1.035 : 1,
                }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
                <StepIcon size={39} strokeWidth={1.8} className={isActive ? 'text-teal-200' : 'text-teal-300'} />
                <motion.span
                  className="absolute -bottom-[15px] grid h-[32px] w-[32px] place-items-center rounded-full border-4 border-[#101517] bg-teal-500 text-[12px] font-bold text-[#042f2b]"
                  animate={{ boxShadow: isActive ? '0 0 16px rgba(45, 212, 191, 0.9)' : '0 0 0 rgba(45, 212, 191, 0)' }}
                  transition={{ duration: 0.28 }}
                >
                  {step.number}
                </motion.span>
              </motion.div>
              <h3 className="mb-[10px] mt-[34px] text-[19px] font-bold text-white">{step.title}</h3>
              <p className="mx-auto max-w-[250px] text-[15px] leading-relaxed text-[#91a0a3]">{step.description}</p>
            </motion.article>
          )
        })}
      </div>
    </div>
  )
}
