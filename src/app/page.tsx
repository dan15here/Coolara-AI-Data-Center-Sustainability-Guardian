'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Activity, ShieldCheck, Zap, ChevronDown, Bot, FlaskConical, ScanSearch } from 'lucide-react'
import { useState } from 'react'
import { Hero } from '@/components/ui/animated-hero'
import AnimatedContent from '@/components/ui/animated-content'

const faqs = [
  {
    question: "What is Coolara?",
    answer: "Coolara is a sustainability decision-support prototype for data-centre operators. It brings synthetic telemetry, deterministic anomaly detection, qualitative AI context, and safety-gated what-if simulations into one operator workflow."
  },
  {
    question: "What can I simulate?",
    answer: "The simulator explores cooling setpoint, workload, and ambient-temperature assumptions. It calculates deterministic energy, water, cost, PUE, WUE, and thermal impacts, then rejects scenarios that cross the configured safety threshold."
  },
  {
    question: "Is this connected to a live data centre?",
    answer: "No. This MVP uses clearly labelled synthetic demo telemetry. It is built to demonstrate a responsible decision workflow, not to control equipment or make claims about a live facility."
  },
  {
    question: "How do you handle security and data privacy?",
    answer: "Supabase access and Gemini calls happen only on the server. Service-role and Gemini API credentials are kept in deployment environment variables and are never sent to the browser. Database tables use row-level security and have no public policies."
  },
  {
    question: "What role does AI play?",
    answer: "Gemini adds qualitative context to a deterministic finding or simulation. It does not generate measurements, savings, PUE/WUE values, safety approvals, or operating setpoints; those remain deterministic application outputs."
  }
]

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-[#2b363c] rounded-[12px] bg-[#171d21] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center p-[20px] text-left focus:outline-none"
      >
        <strong className="text-[16px] text-white font-medium">{question}</strong>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="text-teal-400" size={20} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-[20px] pb-[20px] text-[#91a0a3] leading-relaxed text-[15px]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main id="top" className="dark min-h-screen bg-[#101517] text-[#eef3f1] font-sans selection:bg-teal-500/30">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2b363c] bg-[#101517]/80 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-[24px] h-[72px] flex items-center justify-between relative">
          <div className="flex items-center gap-[12px]">
            <Image src="/logos/coolara-app-icon.svg" alt="Coolara Logo" width={32} height={32} />
            <strong className="text-[18px] font-bold tracking-wide">Coolara</strong>
          </div>
          <nav aria-label="Quick access" className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-[26px]">
            <Link href="#top" className="text-[13px] font-medium text-[#91a0a3] hover:text-teal-300 transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-[13px] font-medium text-[#91a0a3] hover:text-teal-300 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-[13px] font-medium text-[#91a0a3] hover:text-teal-300 transition-colors">
              How it works
            </Link>
          </nav>
          <Link 
            href="/dashboard"
            className="flex items-center gap-[8px] bg-[#171d21] border border-[#2b363c] hover:bg-[#20292d] text-white px-[16px] py-[8px] rounded-full text-[13px] font-medium transition-colors"
          >
            Open Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-[100px] pb-[20px] px-[24px] overflow-hidden">
        {/* Glowing background orbs */}
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[600px] h-[400px] bg-teal-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mx-auto text-center relative z-10">
          <Hero />

          {/* App Preview Image */}
          <AnimatedContent
            distance={42}
            duration={0.9}
            ease="power3.out"
            initialOpacity={0}
            scale={0.97}
            threshold={0.12}
            delay={0.12}
            className="mt-[60px] relative mx-auto max-w-[1000px] rounded-[16px] border border-[#2b363c] bg-[#171d21]/50 p-[8px] backdrop-blur-xl shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#101517] via-transparent to-transparent z-10 pointer-events-none rounded-[16px]"></div>
            <Image 
              src="/dashboard-preview-v2.png" 
              alt="Coolara Command Center Preview" 
              width={1000} 
              height={600} 
              className="rounded-[10px] w-full h-auto object-cover border border-[#2b363c]"
            />
          </AnimatedContent>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="scroll-mt-[96px] py-[100px] px-[24px] max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {[
            {
              icon: Activity,
              title: "Operational signals, made legible",
              description: "Follow synthetic power, water, cooling, and thermal telemetry alongside deterministic PUE, WUE, and temperature indicators."
            },
            {
              icon: ShieldCheck,
              title: "Decision-ready anomalies",
              description: "Compare actual conditions against expected baselines, see the severity, and add qualitative AI context without surrendering numerical control."
            },
            {
              icon: Zap,
              title: "Simulate before acting",
              description: "Explore operational trade-offs for cooling, workload, and ambient conditions. A deterministic safety gate rejects unsafe scenarios."
            }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-[32px] rounded-[16px] bg-[#171d21] border border-[#2b363c] hover:border-teal-500/50 transition-colors group"
            >
              <div className="w-[48px] h-[48px] rounded-[12px] bg-teal-500/10 text-teal-400 grid place-items-center mb-[20px] group-hover:scale-110 transition-transform">
                <feature.icon size={24} />
              </div>
              <h3 className="text-[20px] font-bold text-white mb-[12px]">{feature.title}</h3>
              <p className="text-[#91a0a3] leading-relaxed text-[15px]">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-[96px] py-[90px] px-[24px] max-w-[1440px] mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[640px] mx-auto mb-[56px]"
        >
          <p className="text-teal-400 text-[12px] uppercase tracking-[0.16em] font-bold mb-[12px]">Monitor → Detect → Explain → Simulate → Optimize</p>
          <h2 className="text-[36px] md:text-[44px] font-bold text-white mb-[14px]">How Coolara works</h2>
          <p className="text-[#91a0a3] text-[16px] leading-relaxed">Four deliberate steps from synthetic telemetry to a safer, decision-ready response.</p>
        </motion.div>

        <div className="relative">
          <div className="hidden md:block absolute h-px bg-[#2b363c] left-[12.5%] right-[12.5%] top-[70px]" aria-hidden="true" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-[40px] gap-x-[24px] relative">
          {[
            { number: '01', icon: Activity, title: 'Monitor signals', description: 'See synthetic energy, water, cooling, and thermal telemetry in one command centre.' },
            { number: '02', icon: ScanSearch, title: 'Detect deviations', description: 'Compare actual conditions against deterministic expected baselines and severity.' },
            { number: '03', icon: Bot, title: 'Explain context', description: 'Use Gemini for qualitative context while all measurements stay deterministic.' },
            { number: '04', icon: FlaskConical, title: 'Simulate safely', description: 'Test a response before acting; the thermal gate rejects unsafe scenarios.' },
          ].map((step, i) => (
            <motion.article
              key={step.number}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative px-[18px]"
            >
              <div className="relative mx-auto w-[112px] h-[112px] rounded-[28px] border border-[#344045] bg-[#192326] grid place-items-center shadow-[0_12px_32px_rgba(0,0,0,0.16)]">
                <step.icon size={39} strokeWidth={1.8} className="text-teal-300" />
                <span className="absolute -bottom-[15px] w-[32px] h-[32px] rounded-full bg-teal-500 text-[#042f2b] text-[12px] font-bold grid place-items-center border-4 border-[#101517]">{step.number}</span>
              </div>
              <h3 className="text-[19px] font-bold text-white mt-[34px] mb-[10px]">{step.title}</h3>
              <p className="max-w-[250px] mx-auto text-[#91a0a3] text-[15px] leading-relaxed">{step.description}</p>
            </motion.article>
          ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-[100px] px-[24px] max-w-[800px] mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-[40px]"
        >
          <h2 className="text-[36px] font-bold text-white mb-[16px]">Frequently Asked Questions</h2>
          <p className="text-[#91a0a3] text-[16px]">Everything you need to know about Coolara architecture.</p>
        </motion.div>
        
        <div className="flex flex-col gap-[12px]">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <FAQItem question={faq.question} answer={faq.answer} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2b363c] py-[40px] text-center text-[#64748b] text-[13px] relative z-10">
        <p>© 2026 Coolara. Engineered for sustainable data centers.</p>
      </footer>
    </main>
  )
}
