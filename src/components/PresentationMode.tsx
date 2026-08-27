import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Lightbulb,
  Mic,
  Swords,
  Lock,
  ArrowRight,
  Play,
  Pause,
  Copy,
  Check,
  Trophy,
  BarChart3,
  FolderGit2,
  HelpCircle,
  Clock,
  Send,
  RotateCcw,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProjectBlueprint, PitchData } from "../types";
import { recordActivity } from "../lib/storage";

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
  onScoreUpdate?: (points: number) => void;
}

const TOTAL_STEPS = 8;
const AUTO_PLAY_INTERVAL_MS = 7500;

export default function PresentationMode({
  isOpen,
  onClose,
  onNavigateToTab,
  onScoreUpdate,
}: PresentationModeProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState<number>(0);

  // Étape 1 : intro animée
  const [introSubStage, setIntroSubStage] = useState<number>(0);

  // Étape 4 : Démonstration CREATE en direct avec vraie IA
  const [demoIdea, setDemoIdea] = useState<string>(
    "Une application qui aide les élèves à apprendre en jouant."
  );
  const [isGeneratingDemo, setIsGeneratingDemo] = useState<boolean>(false);
  const [demoBlueprint, setDemoBlueprint] = useState<ProjectBlueprint | null>(
    null
  );
  const [demoError, setDemoError] = useState<string | null>(null);

  // Étape 5 : Pitch en direct avec vraie IA
  const [isGeneratingPitch, setIsGeneratingPitch] = useState<boolean>(false);
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [pitchCopied, setPitchCopied] = useState<boolean>(false);
  const [pitchTimer, setPitchTimer] = useState<number>(30);
  const [isPitchTimerActive, setIsPitchTimerActive] = useState<boolean>(false);

  const autoPlayTimerRef = useRef<any>(null);
  const autoPlayProgressRef = useRef<any>(null);

  // Réinitialisation à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIntroSubStage(0);
      setIsAutoPlay(false);
      setAutoPlayProgress(0);
    }
  }, [isOpen]);

  // Étape 1 : Séquençage narratif du texte d'intro
  useEffect(() => {
    if (isOpen && currentStep === 0) {
      setIntroSubStage(1);
      const t1 = setTimeout(() => setIntroSubStage(2), 1200);
      const t2 = setTimeout(() => setIntroSubStage(3), 2600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isOpen, currentStep]);

  // Gestion du chronomètre de pitch (30s)
  useEffect(() => {
    let interval: any = null;
    if (isPitchTimerActive && pitchTimer > 0) {
      interval = setInterval(() => {
        setPitchTimer((prev) => prev - 1);
      }, 1000);
    } else if (pitchTimer === 0 && isPitchTimerActive) {
      setIsPitchTimerActive(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isPitchTimerActive, pitchTimer]);

  // Mode lecture automatique avec barre de progression
  useEffect(() => {
    if (!isOpen || !isAutoPlay) {
      clearInterval(autoPlayTimerRef.current);
      clearInterval(autoPlayProgressRef.current);
      setAutoPlayProgress(0);
      return;
    }

    // Pause la lecture auto pendant les requêtes IA
    if (isGeneratingDemo || isGeneratingPitch) {
      return;
    }

    const intervalTime = 100;
    const totalTicks = AUTO_PLAY_INTERVAL_MS / intervalTime;
    let ticks = 0;

    autoPlayProgressRef.current = setInterval(() => {
      ticks += 1;
      setAutoPlayProgress((ticks / totalTicks) * 100);
      if (ticks >= totalTicks) {
        ticks = 0;
        setCurrentStep((prev) => {
          if (prev < TOTAL_STEPS - 1) return prev + 1;
          setIsAutoPlay(false);
          return prev;
        });
      }
    }, intervalTime);

    return () => {
      clearInterval(autoPlayProgressRef.current);
      clearInterval(autoPlayTimerRef.current);
    };
  }, [isOpen, isAutoPlay, currentStep, isGeneratingDemo, isGeneratingPitch]);

  // Raccourcis clavier (Flèches, Espace, Echap)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Ignore si on est dans un champ de saisie
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    setAutoPlayProgress(0);
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setAutoPlayProgress(0);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const jumpToStep = (index: number) => {
    setAutoPlayProgress(0);
    setCurrentStep(index);
  };

  // Étape 4 : Démonstration CREATE avec la vraie API Gemini
  const handleRunDemoCreate = async () => {
    if (!demoIdea.trim() || isGeneratingDemo) return;
    setIsGeneratingDemo(true);
    setDemoError(null);

    try {
      const res = await fetch("/api/ai/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: demoIdea.trim() }),
      });

      if (!res.ok) {
        throw new Error("Échec de la génération en direct");
      }

      const data = await res.json();
      const bp: ProjectBlueprint = {
        id: "demo-jury-" + Date.now(),
        projectName: data.projectName || "Ludolearn",
        slogan: data.slogan || "L'apprentissage ludique sans friction.",
        concept: data.concept || demoIdea,
        problemSolved:
          data.problemSolved ||
          "La passivité et la démotivation des élèves face aux cours magistraux.",
        solution:
          data.solution ||
          "Une plateforme adaptative alliant mécanique de jeu et programmes scolaires.",
        targetAudience:
          data.targetAudience ||
          "Élèves du primaire et secondaire, enseignants et parents d'élèves.",
        mainFeatures: data.mainFeatures || [
          "Quêtes d'apprentissage scénarisées par matière",
          "Moteur d'adaptation dynamique du niveau de difficulté",
          "Tableau de bord de suivi de progression pour enseignants",
          "Mode multijoueur coopératif pour résolution en classe",
          "Système de récompenses et badges de compétences",
        ],
        uniqueSellingPoint:
          data.uniqueSellingPoint ||
          "Transforme chaque notion théorique en défi coopératif mémorable.",
        monetizationIdea:
          data.monetizationIdea || "Licence établissement scolaire & pass famille.",
        developmentRoadmap: data.developmentRoadmap || [],
        mainChallenge:
          data.mainChallenge ||
          "Maintenir l'équilibre parfait entre pédagogie rigoureuse et plaisir de jeu.",
        pitch: data.pitch || "",
        visualDirection: data.visualDirection || "",
        createdAt: Date.now(),
        originalIdea: demoIdea,
      };

      setDemoBlueprint(bp);
      recordActivity("idea", `Démo Jury : ${bp.projectName}`, 25);
      onScoreUpdate?.(25);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      setDemoError(
        err?.message || "Une erreur est survenue lors de la démonstration."
      );
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  // Étape 5 : Pitch IA avec la vraie API Gemini
  const handleRunDemoPitch = async () => {
    if (isGeneratingPitch) return;
    setIsGeneratingPitch(true);
    setPitchTimer(30);
    setIsPitchTimerActive(false);

    const context = demoBlueprint || {
      projectName: "Ludolearn",
      concept: demoIdea,
      targetAudience: "Élèves, professeurs et familles",
      uniqueSellingPoint:
        "L'apprentissage interactif par le jeu coopératif.",
    };

    try {
      const res = await fetch("/api/ai/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: demoIdea,
          projectContext: context,
        }),
      });

      if (!res.ok) throw new Error("Échec de la synthèse orale");

      const data: PitchData = await res.json();
      setPitchData(data);
      recordActivity("pitch", `Pitch Démo : ${data.projectName}`, 25);
      onScoreUpdate?.(25);

      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.65 },
        });
      } catch {}
    } catch {
      // Fallback local percutant
      setPitchData({
        projectName: demoBlueprint?.projectName || "Ludolearn",
        hook: "Et si apprendre devenait aussi captivant que jouer au jeu vidéo préféré de vos enfants ?",
        problem:
          "Les élèves décrochent face à des méthodes abstraites, tandis que les enseignants manquent d'outils interactifs engageants.",
        solution:
          "Ludolearn transforme les programmes scolaires en quêtes coopératives interactives adaptées au rythme de chaque apprenant.",
        whyNow:
          "La digitalisation des classes réclame des outils qui stimulent la curiosité plutôt que la simple mémorisation passive.",
        differentiation:
          "Contrairement aux quiz isolés, Ludolearn crée un véritable écosystème de jeu collaboratif et pédagogique en temps réel.",
        conclusion:
          "Avec Ludolearn, l'école ne subit plus le numérique : elle s'en empare pour réenchanter le plaisir d'apprendre.",
        pitch:
          "Aujourd'hui, des millions d'élèves perdent confiance à cause de cours magistraux déconnectés de leur univers. Avec Ludolearn, nous transformons chaque leçon en aventure coopérative. Les élèves progressent en jouant, les professeurs mesurent l'acquisition des compétences en temps réel. Le marché de l'EdTech attendait un outil qui réconcilie plaisir et rigueur pédagogique : nous l'avons bâti. Prêts à réinventer l'apprentissage avec nous ?",
      });
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleCopyPitch = () => {
    if (!pitchData) return;
    const text = `PROJET : ${pitchData.projectName}\n\nACCROCHE :\n${pitchData.hook}\n\nPROBLÈME :\n${pitchData.problem}\n\nSOLUTION :\n${pitchData.solution}\n\nPOURQUOI MAINTENANT :\n${pitchData.whyNow}\n\nDIFFÉRENCIATION :\n${pitchData.differentiation}\n\nCONCLUSION :\n${pitchData.conclusion}\n\nPITCH ORAL (30 SECONDES) :\n${pitchData.pitch}`;
    navigator.clipboard.writeText(text);
    setPitchCopied(true);
    setTimeout(() => setPitchCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        id="jury-mode-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-[#0A0B0E] text-white flex flex-col justify-between overflow-y-auto select-none font-sans"
      >
        {/* Lueur d'ambiance discrète */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-[#FF5500]/5 rounded-full blur-[160px]" />
        </div>

        {/* ======================================================== */}
        {/* 1. BARRE SUPÉRIEURE : Brand + Stepper + Contrôles       */}
        {/* ======================================================== */}
        <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3 border-b border-[#181B26]">
          {/* Marque & Badge Jury */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#141620] border border-[#262A3C] flex items-center justify-center font-black text-sm text-[#FF5500]">
              Z
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">
                  ZEKROM
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FF5500]/10 border border-[#FF5500]/30 text-[10px] font-mono text-[#FF5500] uppercase font-bold tracking-wider">
                  MODE JURY
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#8E95A8]">
                Expérience Narrative & Produit
              </div>
            </div>
          </div>

          {/* Stepper numéroté 01 / 08 avec pastilles cliquables */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="text-xs font-mono font-bold text-[#E5E7EB] mr-2">
              0{currentStep + 1} / 0{TOTAL_STEPS}
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              {Array.from({ length: TOTAL_STEPS }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToStep(idx)}
                  title={`Aller à l'étape ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentStep
                      ? "w-7 bg-[#FF5500]"
                      : idx < currentStep
                      ? "w-2.5 bg-white/40 hover:bg-white/70"
                      : "w-2.5 bg-white/10 hover:bg-white/30"
                  }`}
                  aria-label={`Étape ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Boutons d'actions : Lecture auto & Quitter */}
          <div className="flex items-center gap-2">
            <button
              id="jury-toggle-autoplay"
              onClick={() => setIsAutoPlay((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                isAutoPlay
                  ? "bg-[#FF5500]/15 border-[#FF5500]/50 text-[#FF5500]"
                  : "bg-[#141620] border-[#242838] text-[#9CA3AF] hover:text-white hover:border-[#374151]"
              }`}
              title={isAutoPlay ? "Mettre en pause" : "Activer la lecture automatique"}
            >
              {isAutoPlay ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Lecture auto</span>
                </>
              )}
            </button>

            <button
              id="jury-exit-btn"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#141620] hover:bg-[#1C1F2B] text-[#9CA3AF] hover:text-white border border-[#242838] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="hidden sm:inline">Quitter</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Barre fine de progression pour la lecture auto */}
        {isAutoPlay && (
          <div className="w-full bg-[#181B26] h-0.5">
            <div
              className="bg-[#FF5500] h-0.5 transition-all duration-100 ease-linear"
              style={{ width: `${autoPlayProgress}%` }}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. CORPS PRINCIPAL DE L'EXPÉRIENCE NARRATIVE             */}
        {/* ======================================================== */}
        <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 1 — INTRODUCTION                                */}
            {/* ---------------------------------------------------- */}
            {currentStep === 0 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-center space-y-8 max-w-2xl mx-auto py-8"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#9CA3AF] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                  <span>Présentation Officielle</span>
                </div>

                <div className="space-y-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white"
                  >
                    Bienvenue dans ZEKROM<span className="text-[#FF5500]">.</span>
                  </motion.h1>

                  {introSubStage >= 2 && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45 }}
                      className="text-xl sm:text-2xl text-[#9CA3AF] font-light"
                    >
                      Une idée peut rester une idée.
                    </motion.p>
                  )}

                  {introSubStage >= 3 && (
                    <motion.p
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45 }}
                      className="text-2xl sm:text-3xl text-white font-medium tracking-tight"
                    >
                      Ou devenir quelque chose de{" "}
                      <span className="text-white underline decoration-[#FF5500] decoration-2 underline-offset-4">
                        réel
                      </span>
                      .
                    </motion.p>
                  )}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="pt-4"
                >
                  <button
                    id="step1-discover-btn"
                    onClick={() => jumpToStep(1)}
                    className="px-8 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] text-white font-semibold text-sm tracking-wide shadow-lg shadow-[#FF5500]/25 transition-all flex items-center gap-2 mx-auto cursor-pointer group"
                  >
                    <span>Découvrir</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 2 — LE PROBLÈME                                */}
            {/* ---------------------------------------------------- */}
            {currentStep === 1 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-center space-y-8 max-w-3xl mx-auto py-8"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#EF4444] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  <span>Constat Fondamental</span>
                </div>

                <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                  Les idées ne manquent pas<span className="text-[#FF5500]">.</span>
                </h1>

                <p className="text-lg sm:text-2xl text-[#9CA3AF] font-light leading-relaxed max-w-2xl mx-auto">
                  Ce qui manque souvent, c&apos;est un espace capable de transformer
                  une idée simple en projet concret.
                </p>

                {/* Comparatif visuel élégant */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-4 text-left">
                  <div className="p-5 rounded-2xl bg-[#141620]/70 border border-[#232738] space-y-2">
                    <div className="text-xs font-mono text-[#EF4444] uppercase font-bold tracking-wider">
                      Avant ZEKROM
                    </div>
                    <p className="text-sm text-[#8E95A8] leading-relaxed">
                      Notes éparses, hésitations, perte d&apos;élan et absence de
                      structure pour passer de l&apos;intuition à l&apos;action.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#2F344A] space-y-2">
                    <div className="text-xs font-mono text-[#10B981] uppercase font-bold tracking-wider">
                      Avec ZEKROM
                    </div>
                    <p className="text-sm text-[#E5E7EB] leading-relaxed">
                      Un continuum immédiat : challenger, concevoir en 12
                      piliers, pitcher et expérimenter sans rupture.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => jumpToStep(2)}
                    className="px-6 py-3 rounded-xl bg-[#161824] hover:bg-[#1F2232] text-white border border-[#2B2F42] text-xs font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Voir la solution</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF5500]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 3 — LA SOLUTION                                */}
            {/* ---------------------------------------------------- */}
            {currentStep === 2 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 max-w-4xl mx-auto py-4"
              >
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#3B82F6] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>L&apos;Espace Unifié</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
                    Voici ZEKROM<span className="text-[#FF5500]">.</span>
                  </h1>

                  <p className="text-base sm:text-xl text-[#9CA3AF] font-normal leading-relaxed">
                    Un espace intelligent où l&apos;on peut imaginer, explorer,
                    structurer et présenter une idée.
                  </p>
                </div>

                {/* 4 Modules principaux */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] hover:border-blue-500/40 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        AI
                      </span>
                      <Sparkles className="w-4 h-4 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-white text-base">Imaginer</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Intelligence stratégique pour analyser, questionner et
                      déconstruire les évidences.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] hover:border-[#FF5500]/50 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20">
                        CREATE
                      </span>
                      <Lightbulb className="w-4 h-4 text-[#FF5500]" />
                    </div>
                    <h3 className="font-bold text-white text-base">Structurer</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Architecture produit en 12 piliers : USP, cibles, modèle
                      économique et roadmap.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] hover:border-red-500/40 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                        PITCH
                      </span>
                      <Mic className="w-4 h-4 text-red-400" />
                    </div>
                    <h3 className="font-bold text-white text-base">Présenter</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Script oral percutant de 30 secondes et entraînement
                      chronométré en direct.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] hover:border-emerald-500/40 transition-colors space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        GAME HUB
                      </span>
                      <Swords className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white text-base">Expérimenter</h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Sprints d&apos;idéation, duels créatifs et défis sous
                      contraintes de temps.
                    </p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <button
                    onClick={() => jumpToStep(3)}
                    className="px-7 py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] text-white font-semibold text-xs tracking-wide shadow-lg shadow-[#FF5500]/20 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Lancer la démonstration en direct</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 4 — DÉMONSTRATION (INTERACTIVE + REAL GEMINI)   */}
            {/* ---------------------------------------------------- */}
            {currentStep === 3 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6 max-w-4xl mx-auto py-2"
              >
                <div className="text-center space-y-2 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#FF5500] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Démonstration Temps Réel</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Essayons<span className="text-[#FF5500]">.</span>
                  </h1>

                  <p className="text-xs sm:text-sm text-[#9CA3AF]">
                    Observez le moteur CREATE transformer une intuition en un
                    plan d&apos;architecture produit complet via Gemini.
                  </p>
                </div>

                {/* Zone de saisie / Idée exemple */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141620] border border-[#262A3C] space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-[#8E95A8]">
                    <span>IDÉE DE DÉPART</span>
                    <span className="text-[#10B981]">100% IA EN DIRECT</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <input
                      type="text"
                      value={demoIdea}
                      onChange={(e) => setDemoIdea(e.target.value)}
                      placeholder="Ex: Une application qui aide les élèves à apprendre en jouant..."
                      className="flex-1 bg-[#0E1017] border border-[#262A3C] focus:border-[#FF5500] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#555C70] focus:outline-none transition-colors"
                    />

                    <button
                      id="run-demo-create-btn"
                      onClick={handleRunDemoCreate}
                      disabled={isGeneratingDemo || !demoIdea.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF5500]/20"
                    >
                      {isGeneratingDemo ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Structuration IA...</span>
                        </>
                      ) : (
                        <>
                          <span>Transformer cette idée</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Suggestions rapides pour le jury */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#8E95A8]">
                    <span>Exemples :</span>
                    <button
                      onClick={() => {
                        setDemoIdea(
                          "Une application qui aide les élèves à apprendre en jouant."
                        );
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#1B1E2B] hover:bg-[#25293A] text-[#D1D5DB] transition-colors cursor-pointer"
                    >
                      Apprentissage par le jeu
                    </button>
                    <button
                      onClick={() => {
                        setDemoIdea(
                          "Un réseau d'entraide locale pour prêter du matériel d'artisanat."
                        );
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#1B1E2B] hover:bg-[#25293A] text-[#D1D5DB] transition-colors cursor-pointer"
                    >
                      Entraide matériel artisanat
                    </button>
                  </div>
                </div>

                {demoError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                    {demoError}
                  </div>
                )}

                {/* Affichage progressif du Blueprint généré */}
                {demoBlueprint && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-5 rounded-2xl bg-[#12141D] border border-[#282C3E] space-y-4"
                  >
                    {/* Nom & Concept */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#1E2232] pb-3">
                      <div>
                        <div className="text-[11px] font-mono text-[#FF5500] uppercase font-bold tracking-wider">
                          NOM DU PROJET
                        </div>
                        <h3 className="text-2xl font-black text-white">
                          {demoBlueprint.projectName}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-[#9CA3AF] italic">
                        &ldquo;{demoBlueprint.slogan}&rdquo;
                      </p>
                    </div>

                    {/* Concept & Proposition de valeur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#161824] border border-[#242838] space-y-1">
                        <div className="text-[10px] font-mono text-[#38BDF8] uppercase font-bold">
                          CONCEPT
                        </div>
                        <p className="text-[#D1D5DB] leading-relaxed">
                          {demoBlueprint.concept}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161824] border border-[#242838] space-y-1">
                        <div className="text-[10px] font-mono text-[#10B981] uppercase font-bold">
                          PROPOSITION DE VALEUR (USP)
                        </div>
                        <p className="text-[#D1D5DB] leading-relaxed">
                          {demoBlueprint.uniqueSellingPoint}
                        </p>
                      </div>
                    </div>

                    {/* Fonctionnalités & Public cible */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="sm:col-span-2 p-3 rounded-xl bg-[#161824] border border-[#242838] space-y-1.5">
                        <div className="text-[10px] font-mono text-[#FF5500] uppercase font-bold">
                          FONCTIONNALITÉS CLÉS (5 PILIERS)
                        </div>
                        <div className="space-y-1">
                          {demoBlueprint.mainFeatures.slice(0, 5).map((f, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-[#E5E7EB]"
                            >
                              <span className="w-1 h-1 rounded-full bg-[#FF5500] shrink-0" />
                              <span className="text-[11px]">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#161824] border border-[#242838] space-y-1">
                        <div className="text-[10px] font-mono text-[#EAB308] uppercase font-bold">
                          PUBLIC CIBLE
                        </div>
                        <p className="text-[#D1D5DB] leading-relaxed text-[11px]">
                          {demoBlueprint.targetAudience}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => jumpToStep(4)}
                        className="px-5 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Passer au Pitch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 5 — LE PITCH (INTERACTIVE + REAL GEMINI)        */}
            {/* ---------------------------------------------------- */}
            {currentStep === 4 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6 max-w-4xl mx-auto py-2"
              >
                <div className="text-center space-y-2 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#EC4899] uppercase tracking-wider">
                    <Mic className="w-3.5 h-3.5" />
                    <span>Storytelling & Conviction</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Une idée ne suffit pas<span className="text-[#FF5500]">.</span>
                  </h1>

                  <p className="text-lg sm:text-xl text-[#9CA3AF] font-light">
                    Il faut savoir la raconter.
                  </p>
                </div>

                {/* Déclencheur du Pitch */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141620] border border-[#262A3C] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-[#8E95A8] uppercase">
                      PROJET CIBLÉ
                    </div>
                    <div className="text-sm font-bold text-white">
                      {demoBlueprint?.projectName || "Projet Démo ZEKROM"}
                    </div>
                  </div>

                  <button
                    id="run-demo-pitch-btn"
                    onClick={handleRunDemoPitch}
                    disabled={isGeneratingPitch}
                    className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-[#FF5500]/20"
                  >
                    {isGeneratingPitch ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Génération du pitch oral...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        <span>Générer le pitch</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Affichage du Pitch généré */}
                {pitchData && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-5 rounded-2xl bg-[#12141D] border border-[#282C3E] space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#1E2232] pb-3">
                      <div>
                        <div className="text-[10px] font-mono text-[#EC4899] uppercase font-bold">
                          SYNTHÈSE ORALE 30 SECONDES
                        </div>
                        <h4 className="text-lg font-bold text-white">
                          {pitchData.projectName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Entraîneur chrono */}
                        <button
                          onClick={() => {
                            if (isPitchTimerActive) {
                              setIsPitchTimerActive(false);
                            } else {
                              setPitchTimer(30);
                              setIsPitchTimerActive(true);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                            isPitchTimerActive
                              ? "bg-red-500/20 border-red-500/40 text-red-400"
                              : "bg-[#181A26] border-[#2B2F40] text-[#D1D5DB] hover:text-white"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{pitchTimer}s</span>
                        </button>

                        {/* Bouton Copier */}
                        <button
                          id="copy-jury-pitch-btn"
                          onClick={handleCopyPitch}
                          className="px-3 py-1.5 rounded-xl bg-[#181A26] hover:bg-[#202332] text-[#D1D5DB] hover:text-white border border-[#2B2F40] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          {pitchCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#10B981]" />
                              <span className="text-[#10B981]">Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
                              <span>Copier le pitch</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Script parlé en grand */}
                    <div className="p-4 rounded-xl bg-[#161824] border border-[#242838] space-y-1.5">
                      <div className="text-[10px] font-mono text-[#FF5500] uppercase font-bold">
                        SCRIPT PARLÉ CONTINU
                      </div>
                      <p className="text-xs sm:text-sm text-[#F3F4F6] leading-relaxed italic">
                        &ldquo;{pitchData.pitch}&rdquo;
                      </p>
                    </div>

                    {/* Piliers du pitch */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-[#141620] border border-[#202330]">
                        <span className="text-[10px] font-mono text-[#38BDF8] block">
                          ACCROCHE
                        </span>
                        <p className="text-[#D1D5DB] text-[11px]">{pitchData.hook}</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#141620] border border-[#202330]">
                        <span className="text-[10px] font-mono text-[#EF4444] block">
                          PROBLÈME
                        </span>
                        <p className="text-[#D1D5DB] text-[11px]">
                          {pitchData.problem}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#141620] border border-[#202330]">
                        <span className="text-[10px] font-mono text-[#10B981] block">
                          SOLUTION
                        </span>
                        <p className="text-[#D1D5DB] text-[11px]">
                          {pitchData.solution}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 6 — L'EXPLORATION                              */}
            {/* ---------------------------------------------------- */}
            {currentStep === 5 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 max-w-4xl mx-auto py-4"
              >
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#EAB308] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>L&apos;Écosystème ZEKROM</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    Mais ZEKROM ne s&apos;arrête pas là
                    <span className="text-[#FF5500]">.</span>
                  </h1>

                  <p className="text-sm sm:text-base text-[#9CA3AF]">
                    Un environnement holistique conçu pour stimuler la créativité
                    et pérenniser chaque vision.
                  </p>
                </div>

                {/* 4 Piliers d'exploration */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                      <Swords className="w-4 h-4" />
                      <span>GAME HUB</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      &ldquo;Expérimenter.&rdquo;
                    </h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Sprints d&apos;idées, duels de conception et défis sous
                      contrainte pour développer vos réflexes d&apos;innovation.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                      <BarChart3 className="w-4 h-4" />
                      <span>INSIGHTS</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      &ldquo;Comprendre son activité.&rdquo;
                    </h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Tableau de bord de suivi, matrice d&apos;équilibre créatif
                      et accumulation de points de persévérance.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] space-y-2">
                    <div className="flex items-center gap-2 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
                      <FolderGit2 className="w-4 h-4" />
                      <span>MES CRÉATIONS</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      &ldquo;Conserver ses idées.&rdquo;
                    </h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Persistance locale durable, consultation immédiate et
                      exportation multiformat (.md, .json).
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#141620] border border-[#232738] space-y-2">
                    <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase tracking-wider">
                      <Lock className="w-4 h-4" />
                      <span>SECRET MODE</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      &ldquo;Découvrir.&rdquo;
                    </h3>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      Sas confidentiel de réflexion philosophique pour débloquer
                      les ambitions sans filtre d&apos;auto-censure.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 7 — SECRET                                     */}
            {/* ---------------------------------------------------- */}
            {currentStep === 6 && (
              <motion.div
                key="step-7"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-center space-y-8 max-w-2xl mx-auto py-12"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#9CA3AF] uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-[#FF5500]" />
                  <span>Protocole Invisible</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                    Et si vous regardiez un peu plus loin ?
                  </h1>

                  <p className="text-base sm:text-lg text-[#8E95A8] font-light leading-relaxed max-w-lg mx-auto">
                    Certaines fonctionnalités ne se dévoilent qu&apos;aux esprits
                    curieux. L&apos;application cache un espace d&apos;introspection
                    stratégique confidentiel.
                  </p>
                </div>

                {/* Indice énigmatique */}
                <div className="p-4 rounded-2xl bg-[#12141C] border border-[#202332] max-w-sm mx-auto text-xs font-mono text-[#6B7280]">
                  <span>Indice : observez les détails discrets de la barre de navigation.</span>
                </div>
              </motion.div>
            )}

            {/* ---------------------------------------------------- */}
            {/* ÉTAPE 8 — CONCLUSION                                 */}
            {/* ---------------------------------------------------- */}
            {currentStep === 7 && (
              <motion.div
                key="step-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="text-center space-y-8 max-w-2xl mx-auto py-6 sm:py-10"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141620] border border-[#262A3C] text-xs font-mono text-[#FF5500] uppercase tracking-wider">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Conclusion Officielle</span>
                </div>

                {/* Grand Titre ZEKROM */}
                <div className="space-y-3">
                  <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-white">
                    ZEKROM<span className="text-[#FF5500]">.</span>
                  </h1>

                  <p className="text-xl sm:text-2xl text-[#9CA3AF] font-light italic">
                    &ldquo;Think beyond the obvious.&rdquo;
                  </p>
                </div>

                {/* Triptyque */}
                <div className="py-2 space-y-1 text-base sm:text-xl text-[#E5E7EB] font-medium leading-relaxed">
                  <p>Une idée.</p>
                  <p className="text-[#FF5500]">Une intelligence.</p>
                  <p>Un espace pour créer.</p>
                </div>

                {/* Bouton Principal de retour */}
                <div className="pt-4">
                  <button
                    id="jury-final-explore-btn"
                    onClick={onClose}
                    className="px-9 py-4 rounded-2xl bg-[#FF5500] hover:bg-[#FF651A] text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-[#FF5500]/25 transition-all flex items-center gap-2.5 mx-auto cursor-pointer group"
                  >
                    <span>Explorer ZEKROM</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ======================================================== */}
        {/* 3. BARRE INFÉRIEURE : Navigation Précédent / Suivant     */}
        {/* ======================================================== */}
        <footer className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-t border-[#181B26] gap-3">
          <button
            id="jury-prev-btn"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
              currentStep === 0
                ? "opacity-30 border-transparent text-[#555] cursor-not-allowed"
                : "bg-[#141620] hover:bg-[#1C1F2B] text-[#D1D5DB] hover:text-white border-[#242838]"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Précédent</span>
          </button>

          {/* Indication clavier discrète */}
          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-[#6B7280]">
            <span>Naviguer avec les flèches ← → du clavier</span>
          </div>

          <button
            id="jury-next-btn"
            onClick={handleNext}
            className="px-5 sm:px-6 py-2 rounded-xl bg-[#FF5500] hover:bg-[#FF651A] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-[#FF5500]/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>{currentStep === TOTAL_STEPS - 1 ? "Terminer" : "Suivant"}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
}
