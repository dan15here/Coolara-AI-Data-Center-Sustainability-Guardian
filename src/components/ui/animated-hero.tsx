'use client'

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["efficient", "sustainable", "reliable", "secure", "intelligent"],
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
        <div className="flex gap-8 py-20 lg:py-32 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-2 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border border-teal-500/20 rounded-full" asChild>
              <Link href="#features">
                Next-Gen Data Center Operations <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-extrabold text-white">
              <span className="text-white">This data center is</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                {/* spacer so the h1 keeps its height */}
                <span className="invisible">placeholder</span>
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

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-[#91a0a3] max-w-2xl text-center mx-auto">
              Managing a data center today is complex. Coolara prevents incidents with AI-powered anomaly detection and deterministic rules. Avoid further complications by ditching outdated, tedious methods.
            </p>
          </div>
          <div className="flex flex-row gap-4 mt-4">
            <Button size="lg" className="gap-2 bg-[#171d21] border border-[#2b363c] hover:bg-[#20292d] text-white rounded-full transition-colors" variant="outline" asChild>
              <Link href="/simulator">
                Simulate Scenario <Play className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" className="gap-2 bg-teal-500 hover:bg-teal-400 text-[#042f2b] rounded-full font-bold shadow-[0_0_30px_rgba(20,184,166,0.3)]" asChild>
              <Link href="/dashboard">
                Open Dashboard <MoveRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
