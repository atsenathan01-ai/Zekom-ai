import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";

interface LandingIntroProps {
  onComplete: () => void;
}

export default function LandingIntro({ onComplete }: LandingIntroProps) {
  const [showTagline, setShowTagline] = useState<boolean>(false);

  useEffect(() => {
    // Étape 1 : Slogan après 600ms
    const t1 = setTimeout(() => {
      setShowTagline(true);
    }, 600);

    // Étape 2 : Transition fluide et fermeture à 1.9s (durée < 2 secondes)
    const t2 = setTimeout(() => {
      onComplete();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <motion.div
      id="landing-intro-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0C0D11] text-white select-none px-6"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(8px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Halo d'ambiance ultra-subtil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[500px] md:h-[500px] bg-[#FF5500]/6 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Titre ZEKROM */}
        <motion.h1
          id="intro-brand-title"
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white flex items-center justify-center"
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          ZEKROM<span className="text-[#FF5500]">.</span>
        </motion.h1>

        {/* Slogan */}
        <AnimatePresence>
          {showTagline && (
            <motion.p
              id="intro-brand-tagline"
              className="mt-3 sm:mt-4 text-base sm:text-xl text-[#9CA3AF] font-normal tracking-tight"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              &ldquo;Think beyond the obvious.&rdquo;
            </motion.p>
          )}
        </AnimatePresence>

        {/* Bouton pour passer immédiatement */}
        <motion.button
          id="skip-intro-btn"
          onClick={onComplete}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-10 inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#D1D5DB] transition-colors py-1.5 px-3 rounded-full border border-[#1F222E] hover:border-[#374151] cursor-pointer"
        >
          <span>Passer</span>
          <ArrowRight className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
}
