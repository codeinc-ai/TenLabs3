"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import dynamic from "next/dynamic";

const Silk = dynamic(() => import("@/components/Silk"), { ssr: false });

function LogoIcon({ size = 120, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M10 5L30 20L10 35V5Z" fill="currentColor" />
      <path d="M35 10H38V30H35V10Z" fill="currentColor" />
    </svg>
  );
}

export function IntroVideo() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState<"reveal" | "focus" | "centering" | "doorOpen" | "complete">("reveal");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && pathname && pathname !== "/") {
      setShowIntro(false);
    }
  }, [mounted, pathname]);

  const closeIntro = useCallback(() => {
    setShowIntro(false);
  }, []);

  /* ---- Faster step sequencer ---- */
  useEffect(() => {
    if (!showIntro) return;

    if (step === "reveal") {
      const t = setTimeout(() => setStep("focus"), 1400);
      return () => clearTimeout(t);
    }
    if (step === "focus") {
      const t = setTimeout(() => setStep("centering"), 600);
      return () => clearTimeout(t);
    }
    if (step === "centering") {
      const t = setTimeout(() => {
        setStep("doorOpen");
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance("Ten Labs");
          u.rate = 0.9;
          u.pitch = 0.8;
          u.volume = 0.8;
          window.speechSynthesis.speak(u);
        }
      }, 700);
      return () => clearTimeout(t);
    }
    if (step === "doorOpen") {
      const t = setTimeout(() => {
        setStep("complete");
        closeIntro();
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [step, showIntro, closeIntro]);

  if (!showIntro || !mounted || typeof document === "undefined") return null;

  const isDoorOpen = step === "doorOpen";

  const content = (
    <div
      className="fixed inset-0 z-[99999] overflow-hidden text-white"
      style={{ isolation: "isolate", pointerEvents: isDoorOpen ? "none" : "auto" }}
    >
      {/* Silk background — fades out when doors open so website shows through */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{ opacity: isDoorOpen ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-black" />
        <Suspense fallback={null}>
          <Silk speed={1.0} scale={1} color="#1f1d20" noiseIntensity={1.5} rotation={0} />
        </Suspense>
      </motion.div>

      {/* Skip button */}
      {!isDoorOpen && (
        <button
          onClick={closeIntro}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[60] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors"
        >
          Skip
        </button>
      )}

      {/* Animation layers */}
      <LayoutGroup>
        <AnimatePresence mode="wait">
          {step !== "complete" && step !== "doorOpen" && (
            <motion.div
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
              exit={{ opacity: 0 }}
            >
              {/* Phase 1 & 2: Full logo → text fades out */}
              {(step === "reveal" || step === "focus") && (
                <div className="flex items-center justify-center w-full px-4">
                  <motion.div
                    layoutId="logo-container"
                    className="flex flex-col items-center gap-3 sm:flex-row sm:gap-0 sm:space-x-3"
                  >
                    <motion.div
                      layoutId="logo-icon"
                      className="text-white"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <LogoIcon size={60} className="sm:hidden" />
                      <LogoIcon size={120} className="hidden sm:block" />
                    </motion.div>

                    <AnimatePresence>
                      {step === "reveal" && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          transition={{ duration: 0.4 }}
                          className="flex flex-col items-center gap-2 sm:flex-row sm:gap-0 sm:space-x-3 whitespace-nowrap"
                        >
                          <motion.h1
                            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white sm:ml-4 md:ml-6"
                            style={{ fontFamily: "Plus Jakarta Sans, Inter, sans-serif" }}
                            initial={{ opacity: 0, y: 10, x: 0 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
                          >
                            TENLABS
                          </motion.h1>

                          <motion.div
                            className="flex items-center space-x-0.5 sm:space-x-1 h-6 sm:h-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {[1, 2, 3, 4, 3, 2, 1].map((bar, index) => (
                              <motion.div
                                key={index}
                                animate={{ height: [8, 24 + bar * 6, 8] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1,
                                  delay: index * 0.1,
                                  ease: "easeInOut",
                                }}
                                className="w-1 sm:w-1.5 md:w-2 bg-white rounded-full"
                              />
                            ))}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}

              {/* Phase 3: Icon centers itself */}
              {step === "centering" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    layoutId="logo-icon"
                    className="text-white"
                    transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                  >
                    <LogoIcon size={60} className="sm:hidden" />
                    <LogoIcon size={120} className="hidden sm:block" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: Door panels — separate from AnimatePresence so they render on top
            Background is transparent here so the actual website shows through the gap */}
        {step === "doorOpen" && (
          <div className="absolute inset-0 z-50 flex pointer-events-none">
            {/* Left door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "-100%" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="w-1/2 h-full bg-black border-r border-gray-800 relative flex items-center justify-end"
            >
              <div className="overflow-hidden w-[15px] sm:w-[20px] h-[30px] sm:h-[40px] relative">
                <div className="absolute right-0 top-0 w-[30px] sm:w-[40px] h-[30px] sm:h-[40px] text-white">
                  <LogoIcon size={30} className="sm:hidden" />
                  <LogoIcon size={40} className="hidden sm:block" />
                </div>
              </div>
            </motion.div>

            {/* Right door */}
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="w-1/2 h-full bg-black border-l border-gray-800 relative flex items-center justify-start"
            >
              <div className="overflow-hidden w-[15px] sm:w-[20px] h-[30px] sm:h-[40px] relative">
                <div className="absolute left-0 top-0 w-[30px] sm:w-[40px] h-[30px] sm:h-[40px] text-white">
                  <LogoIcon size={30} className="sm:hidden" />
                  <LogoIcon size={40} className="hidden sm:block" />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </LayoutGroup>
    </div>
  );

  return createPortal(content, document.body);
}
