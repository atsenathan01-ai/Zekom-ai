import { useRef } from "react";
import { motion } from "motion/react";
import { ActiveTab } from "../types";
import {
  Sparkles,
  Lightbulb,
  Mic,
  Swords,
  ArrowRight,
  Compass,
  CheckCircle2,
  ChevronDown,
  Trophy,
} from "lucide-react";

interface HomeHeroProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenPitch?: () => void;
  onOpenPresentation?: () => void;
  creativeScore?: number;
}

export default function HomeHero({
  onNavigate,
  onOpenPitch,
  onOpenPresentation,
  creativeScore = 0,
}: HomeHeroProps) {
  const stepsRef = useRef<HTMLDivElement>(null);

  const scrollToOverview = () => {
    if (stepsRef.current) {
      stepsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const featureCards = [
    {
      id: "ai",
      title: "AI",
      desc: "Une intelligence stratégique pour analyser, challenger et approfondir vos réflexions.",
      colorHex: "#3B82F6",
      borderClass: "hover:border-blue-500/40",
      accentBg: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      action: () => onNavigate("ai"),
      actionLabel: "Ouvrir l'IA",
    },
    {
      id: "create",
      title: "CREATE",
      desc: "Structurez votre intuition en un dossier complet d'architecture en 12 piliers stratégiques.",
      colorHex: "#FF5500",
      borderClass: "hover:border-[#FF5500]/50",
      accentBg: "bg-[#FF5500]/10 text-[#FF5500] border-[#FF5500]/20",
      action: () => onNavigate("create"),
      actionLabel: "Créer un projet",
    },
    {
      id: "pitch",
      title: "PITCH",
      desc: "Entraînez-vous avec un chronomètre de 30 secondes et une synthèse orale percutante.",
      colorHex: "#EF4444",
      borderClass: "hover:border-red-500/40",
      accentBg: "bg-red-500/10 text-red-400 border-red-500/20",
      action: () => {
        if (onOpenPitch) {
          onOpenPitch();
        } else {
          onNavigate("creations");
        }
      },
      actionLabel: "Lancer le pitch",
    },
    {
      id: "gamehub",
      title: "GAME HUB",
      desc: "Relevez des défis de conception sous contrainte de temps et testez vos réflexes d'idéation.",
      colorHex: "#10B981",
      borderClass: "hover:border-emerald-500/40",
      accentBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      action: () => onNavigate("gamehub"),
      actionLabel: "Explorer les jeux",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Imagine",
      desc: "Commence avec une idée.",
      accent: "#FF5500",
    },
    {
      number: "02",
      title: "Explore",
      desc: "Utilise ZEKROM AI pour aller plus loin.",
      accent: "#3B82F6",
    },
    {
      number: "03",
      title: "Construis",
      desc: "Transforme ton idée en projet.",
      accent: "#10B981",
    },
    {
      number: "04",
      title: "Présente",
      desc: "Donne-lui une vraie histoire.",
      accent: "#EF4444",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-14 pb-28 md:pb-20 space-y-20 sm:space-y-28">
      {/* 1. HERO PRINCIPAL */}
      <section className="relative pt-6 sm:pt-12 pb-6 text-center max-w-3xl mx-auto space-y-8">
        {/* Composition visuelle abstraite d'arrière-plan */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center overflow-hidden pointer-events-none">
          {/* Cercles & halos de lumière très douce */}
          <div className="w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-gradient-to-br from-[#FF5500]/5 via-transparent to-[#3B82F6]/5 blur-[100px]" />
          {/* Lignes fines géométriques abstraites */}
          <div className="absolute w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] rounded-full border border-white/[0.03] animate-pulse" />
          <div className="absolute w-[600px] sm:w-[900px] h-[600px] sm:h-[900px] rounded-full border border-white/[0.015]" />
        </div>

        {/* Badge supérieur subtil */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161822] border border-[#262A3C] text-[11px] font-mono text-[#9CA3AF] tracking-wider uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
          <span>Espace de Création & Conception</span>
          {creativeScore > 0 && (
            <span className="text-[#EAB308] border-l border-[#2E3347] pl-2 font-semibold">
              {creativeScore} PTS
            </span>
          )}
        </motion.div>

        {/* Titre & Sous-titre */}
        <div className="space-y-4">
          <motion.h1
            id="hero-main-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-[64px] font-black tracking-tight text-white leading-[1.12]"
          >
            Transforme une idée en quelque chose de{" "}
            <span className="text-white">réel</span>
            <span className="text-[#FF5500]">.</span>
          </motion.h1>

          <motion.p
            id="hero-main-description"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#9CA3AF] max-w-xl mx-auto font-normal leading-relaxed"
          >
            ZEKROM combine intelligence artificielle, créativité et
            expérimentation dans un seul espace.
          </motion.p>
        </div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 pt-2"
        >
          <button
            id="hero-cta-create"
            onClick={() => onNavigate("create")}
            className="px-7 py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] text-white font-semibold text-sm tracking-wide shadow-lg shadow-[#FF5500]/20 transition-all duration-200 flex items-center gap-2 group cursor-pointer"
          >
            <span>Commencer</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            id="hero-cta-discover"
            onClick={scrollToOverview}
            className="px-5 py-3 rounded-xl bg-[#171923] hover:bg-[#1F2230] text-[#E5E7EB] hover:text-white font-medium text-sm border border-[#272B3C] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Découvrir ZEKROM</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
          </button>

          {onOpenPresentation && (
            <button
              id="hero-cta-jury-mode"
              onClick={onOpenPresentation}
              className="px-4 py-3 rounded-xl bg-[#161824] hover:bg-[#202332] text-[#E5E7EB] hover:text-white border border-[#2A2E40] hover:border-[#FF5500]/50 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Lancer l'expérience interactive MODE JURY"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>MODE JURY</span>
            </button>
          )}
        </motion.div>
      </section>

      {/* 2. CARTES DES FONCTIONNALITÉS (AI, CREATE, PITCH, GAME HUB) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#202330] pb-3">
          <div className="text-xs font-mono uppercase tracking-widest text-[#8E95A8]">
            Fonctionnalités Principales
          </div>
          <div className="text-xs font-mono text-[#555C70]">4 MODULES</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {featureCards.map((card, idx) => (
            <motion.div
              key={card.id}
              id={`feature-card-${card.id}`}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              onClick={card.action}
              className={`p-6 rounded-2xl bg-[#141620] border border-[#232738] ${card.borderClass} transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5 shadow-sm`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider border ${card.accentBg}`}
                  >
                    {card.title}
                  </div>
                  <div className="text-[#555C70] group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                <p className="text-sm text-[#9CA3AF] leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#1C1F2B] flex items-center justify-between text-xs text-[#8E95A8] group-hover:text-white transition-colors">
                <span className="font-medium">{card.actionLabel}</span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: card.colorHex }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. SECTION "COMMENT ÇA MARCHE" (Une idée. Quatre étapes.) */}
      <section ref={stepsRef} className="space-y-6 pt-4">
        <div className="text-center max-w-md mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#FF5500]">
            <Compass className="w-3.5 h-3.5" />
            <span>Processus de Conception</span>
          </div>
          <h2
            id="how-it-works-title"
            className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight"
          >
            Une idée. Quatre étapes.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-5 rounded-2xl bg-[#141620] border border-[#232738] flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#6B7280]">
                  {step.number}
                </span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: step.accent }}
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[#9CA3AF] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. PREUVE DE PRODUIT (Pas seulement une IA.) */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#161822] to-[#12141A] border border-[#24283A] text-center max-w-3xl mx-auto space-y-4 shadow-xl"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E212E] border border-[#2E3347] text-xs font-mono text-[#38BDF8] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pas seulement une IA.</span>
        </div>

        <p className="text-base sm:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto">
          ZEKROM est conçu comme un espace de création : une idée peut être
          explorée, structurée, testée et présentée au même endroit.
        </p>

        <div className="pt-2 flex items-center justify-center gap-2">
          <button
            onClick={() => onNavigate("create")}
            className="text-xs text-[#FF5500] hover:text-[#FF7733] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Démarrer un projet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.section>
    </div>
  );
}
