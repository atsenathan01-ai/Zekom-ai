import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ActiveTab, ProjectBlueprint } from "./types";
import { loadActivityStats } from "./lib/storage";
import LandingIntro from "./components/LandingIntro";
import Navbar from "./components/Navbar";
import MobileNav from "./components/MobileNav";
import HomeHero from "./components/HomeHero";
import ZekromAI from "./components/ZekromAI";
import CreateProject from "./components/CreateProject";
import MyCreations from "./components/MyCreations";
import GameHub from "./components/GameHub";
import InsightsDashboard from "./components/InsightsDashboard";
import SecretMode from "./components/SecretMode";
import PresentationMode from "./components/PresentationMode";
import PitchModal from "./components/PitchModal";

const INTRO_STORAGE_KEY = "zekrom_v4_intro_seen";

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    // Vérifie si l'introduction a déjà été vue dans localStorage
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem(INTRO_STORAGE_KEY);
      return seen !== "true";
    }
    return true;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const [isSecretOpen, setIsSecretOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [creativeScore, setCreativeScore] = useState<number>(0);
  const [preloadedIdeaForCreate, setPreloadedIdeaForCreate] = useState<string>("");
  const [pitchTargetBlueprint, setPitchTargetBlueprint] = useState<ProjectBlueprint | null>(null);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);

  // Synchronisation des points d'activité
  useEffect(() => {
    const stats = loadActivityStats();
    setCreativeScore(stats.creativeScore);
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, "true");
    } catch {}
  };

  const handleScoreUpdate = (_pointsAdded: number) => {
    const updated = loadActivityStats();
    setCreativeScore(updated.creativeScore);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
    scrollToTop();
  };

  const handleSendIdeaToCreate = (idea: string) => {
    setPreloadedIdeaForCreate(idea);
    setActiveTab("create");
    scrollToTop();
  };

  const handleOpenPitch = (bp?: ProjectBlueprint | null) => {
    setPitchTargetBlueprint(bp || null);
    setIsPitchModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0F1015] text-[#F3F4F6] flex flex-col font-sans selection:bg-[#FF5500]/25 selection:text-[#FF8844] relative">
      {/* Introduction V4 très courte (< 2s) avec persistance localStorage */}
      <AnimatePresence>
        {showIntro && <LandingIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Barre de navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleNavigate}
        onOpenSecretMode={() => setIsSecretOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        creativeScore={creativeScore}
      />

      {/* Corps principal */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-2">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div
              key="tab-home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <HomeHero
                onNavigate={handleNavigate}
                onOpenPitch={() => handleOpenPitch(null)}
                onOpenPresentation={() => setIsPresentationOpen(true)}
                creativeScore={creativeScore}
              />
            </motion.div>
          )}

          {activeTab === "ai" && (
            <motion.div
              key="tab-ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ZekromAI onScoreUpdate={handleScoreUpdate} />
            </motion.div>
          )}

          {activeTab === "create" && (
            <motion.div
              key="tab-create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <CreateProject
                onScoreUpdate={handleScoreUpdate}
                onNavigate={handleNavigate}
                preloadedIdea={preloadedIdeaForCreate}
              />
            </motion.div>
          )}

          {activeTab === "creations" && (
            <motion.div
              key="tab-creations"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <MyCreations
                onNavigate={handleNavigate}
                onOpenPitch={handleOpenPitch}
              />
            </motion.div>
          )}

          {activeTab === "gamehub" && (
            <motion.div
              key="tab-gamehub"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <GameHub
                creativeScore={creativeScore}
                onScoreUpdate={handleScoreUpdate}
              />
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="tab-insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <InsightsDashboard
                onNavigate={handleNavigate}
                onOpenPitchFromBlueprint={handleOpenPitch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modal Secret Mode */}
      <SecretMode
        isOpen={isSecretOpen}
        onClose={() => setIsSecretOpen(false)}
        onScoreUpdate={handleScoreUpdate}
        onSendToCreate={handleSendIdeaToCreate}
      />

      {/* Modal Mode Présentation Jury */}
      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onNavigateToTab={handleNavigate}
        onScoreUpdate={handleScoreUpdate}
      />

      {/* Modal Pitch Chronométré 30s */}
      <PitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        blueprint={pitchTargetBlueprint}
        onScoreUpdate={handleScoreUpdate}
      />

      {/* Barre de navigation mobile */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleNavigate}
      />

      {/* 6. PIED DE PAGE MINIMAL */}
      <footer className="border-t border-[#1C1F2B] bg-[#0C0D11] py-8 px-4 sm:px-6 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="font-extrabold text-white text-sm tracking-tight">
              ZEKROM<span className="text-[#FF5500]">.</span>
            </span>
            <span className="hidden sm:inline text-[#374151]">•</span>
            <span className="text-xs text-[#8E95A8] font-normal">
              &ldquo;Think beyond the obvious.&rdquo;
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#8E95A8]">
            <button
              onClick={() => handleNavigate("ai")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              AI
            </button>
            <button
              onClick={() => handleNavigate("create")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              CREATE
            </button>
            <button
              onClick={() => handleOpenPitch(null)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              PITCH
            </button>
            <button
              onClick={() => handleNavigate("gamehub")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              GAME HUB
            </button>
            <button
              onClick={() => setIsSecretOpen(true)}
              className="text-[#9CA3AF] hover:text-[#FF5500] transition-colors cursor-pointer font-mono text-[11px]"
            >
              SECRET MODE
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
