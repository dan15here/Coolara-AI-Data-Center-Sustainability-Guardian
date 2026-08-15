'use client'

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import BlurText from "@/components/ui/blur-text";
import Image from "next/image";
import Link from "next/link";

function Hero({ isHeaderBrandVisible }: { isHeaderBrandVisible: boolean }) {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["decision-ready", "resource-aware", "safety-gated", "explainable"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex gap-6 py-14 lg:py-20 items-center justify-center flex-col">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-300">
              AI Data-Center Sustainability Guardian
            </p>
          </motion.div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-6xl lg:text-7xl max-w-5xl tracking-tighter text-center font-extrabold text-white">
              <div className="mx-auto mb-2 flex h-[58px] justify-center md:mb-3 md:h-[73px]">
                {!isHeaderBrandVisible && (
                  <motion.div
                    layoutId="coolara-brand"
                    className="w-[215px] translate-x-3 md:w-[270px] md:translate-x-4"
                    transition={{ type: 'spring', stiffness: 360, damping: 34, mass: 0.72 }}
                  >
                    <Image
                      src="/logos/coolara-wordmark-c-icon.svg"
                      alt="Coolara"
                      width={560}
                      height={150}
                      priority
                    />
                  </motion.div>
                )}
              </div>
              <BlurText
                text="makes every response"
                animateBy="words"
                delay={100}
                stepDuration={0.32}
                className="justify-center text-white"
              />
              <span className="relative flex min-h-[1.3em] w-full justify-center overflow-visible text-center leading-[1.15] md:pb-4 md:pt-1">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={titleNumber}
                    className="absolute inset-x-0 text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-300"
                    initial={{ opacity: 0, y: 80 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -80 }}
                    transition={{ type: "spring", stiffness: 80, damping: 18 }}
                  >
                    {titles[titleNumber]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>

            <div
              className="text-lg md:text-xl leading-relaxed tracking-tight text-[#91a0a3] max-w-2xl text-center mx-auto"
            >
              <BlurText
                text="See energy, water, cooling, and thermal signals in one place. Coolara detects deviations, explains their context, and lets operators simulate a safety-gated response before they act."
                animateBy="words"
                direction="bottom"
                delay={18}
                stepDuration={0.24}
                className="justify-center"
              />
            </div>
          </div>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34, ease: 'easeOut' }}
          >
            <Button size="lg" className="gap-2 bg-[#171d21] border border-[#2b363c] hover:bg-[#20292d] text-white rounded-full transition-colors" variant="outline" asChild>
              <Link href="/simulator">
                Run a what-if simulation <Play className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" className="gap-2 bg-teal-500 hover:bg-teal-400 text-[#042f2b] rounded-full font-bold shadow-[0_0_30px_rgba(20,184,166,0.3)]" asChild>
              <Link href="/dashboard">
                Explore Command Center <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
