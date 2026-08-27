import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Swords,
  Timer,
  Zap,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Send,
  Trophy,
  Brain,
  Layers,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CreativeDuel, SprintChallenge } from "../types";
import { recordActivity, getRankInfo } from "../lib/storage";

interface GameHubProps {
  creativeScore: number;
  onScoreUpdate: (points: number) => void;
}

// Banque de défis créatifs en français
const SPRINT_BANK: SprintChallenge[] = [
  {
    id: "sprint-1",
    category: "PHYSIQUE & PRODUIT",
    prompt: "Concevez un véhicule de transport individuel à haute vitesse pour une ville en apesanteur.",
    constraint: "Ne doit utiliser ni carburant, ni aimants, ni ailes.",
    rewardScore: 35,
  },
  {
    id: "sprint-2",
    category: "IDENTITÉ NUMÉRIQUE",
    prompt: "Inventez un réseau social où personne ne peut publier de texte, de photo ou d'audio.",
    constraint: "Doit permettre une véritable connexion émotionnelle.",
    rewardScore: 35,
  },
  {
    id: "sprint-3",
    category: "COMMERCE DU FUTUR",
    prompt: "Créez une place de marché où la monnaie d'échange est mesurée en unités d'attention humaine vérifiée.",
    constraint: "Doit empêcher toute manipulation algorithmique.",
    rewardScore: 40,
  },
  {
    id: "sprint-4",
    category: "INFORMATIQUE SPATIALE",
    prompt: "Structurez une interface de système d'exploitation pour des personnes utilisant uniquement le toucher et l'odorat.",
    constraint: "Doit être intuitive pour un débutant complet en moins de 10 secondes.",
    rewardScore: 45,
  },
];

// Banque de duels créatifs en français
const DUEL_BANK: CreativeDuel[] = [
  {
    id: "duel-1",
    theme: "FUTUR DU TRANSPORT",
    optionA: {
      title: "Tubes sous vide souterrains",
      premise: "Capsules silencieuses ultra-rapides reliant des continents entiers sous terre.",
      vibe: "Lourde infrastructure, 100% fiable, insensible aux aléas météo.",
    },
    optionB: {
      title: "Essaims de planeurs autonomes",
      premise: "Planeurs thermiques solaires ultra-légers exploitant les courants atmosphériques.",
      vibe: "Décentralisé, empreinte au sol nulle, routage dynamique.",
    },
    critiqueA: "Investissement initial colossal, mais offre une disponibilité garantie à 99,99% et un débit massif.",
    critiqueB: "Empreinte écologique minime et grande résilience, mais soumis aux turbulences atmosphériques.",
  },
  {
    id: "duel-2",
    theme: "CONNAISSANCE SYNTHÉTIQUE",
    optionA: {
      title: "Téléchargement synaptique direct",
      premise: "Assimilation instantanée de bibliothèques techniques directement dans la mémoire synaptique.",
      vibe: "Efficacité maximale, courbe d'apprentissage nulle, intégrité centralisée.",
    },
    optionB: {
      title: "Simulation sandbox hyper-intuitive",
      premise: "Simulations holographiques vivantes s'adaptant en temps réel aux erreurs de l'apprenant.",
      vibe: "Préserve l'essai-erreur humain, favorise la sérendipité et la ténacité.",
    },
    critiqueA: "Débloque des compétences immédiates, mais risque d'uniformiser la résolution de problèmes.",
    critiqueB: "Développe une intuition neurologique profonde et une créativité capable de résister aux chocs.",
  },
  {
    id: "duel-3",
    theme: "STRATÉGIE DE FONDATION",
    optionA: {
      title: "Le Monolithe Secret",
      premise: "Développer en secret total pendant 2 ans jusqu'à la sortie d'une version 1.0 irréprochable.",
      vibe: "Effet de surprise maximal, propriété intellectuelle protégée, zéro distraction publique.",
    },
    optionB: {
      title: "Le Culte Open Source",
      premise: "Diffuser publiquement chaque ligne de code, maquette de design et chiffre de revenus dès le premier jour.",
      vibe: "Distribution organique imparable, confiance radicale, communauté engagée.",
    },
    critiqueA: "Protège des copieurs rapides, mais risque d'aboutir à un produit dont personne ne veut réellement.",
    critiqueB: "Élimine les coûts de marketing et valide la demande instantanément, mais exige une vitesse d'exécution absolue.",
  },
];

const SPEED_PROMPTS = [
  "Listez 3 cas d'usage inattendus pour une IA capable de sentir les odeurs :",
  "Trouvez 3 fonctionnalités pour un moteur de recherche qui ne renvoie volontairement que des réponses fausses mais inspirantes :",
  "Nommez 3 concepts de startups capables de remplacer intégralement les universités physiques :",
  "Inventez 3 produits de luxe indispensables pour des pionniers vivant sur Mars :",
];

export default function GameHub({ creativeScore, onScoreUpdate }: GameHubProps) {
  const [activeGame, setActiveGame] = useState<"sprint" | "speed" | "duel">("sprint");

  // 1. État Sprint d'Idées
  const [sprintIndex, setSprintIndex] = useState(0);
  const [sprintInput, setSprintInput] = useState("");
  const [sprintSubmitted, setSprintSubmitted] = useState(false);

  // 2. État Défi 30s
  const [speedPromptIndex, setSpeedPromptIndex] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(30);
  const [speedIsRunning, setSpeedIsRunning] = useState(false);
  const [speedAnswers, setSpeedAnswers] = useState(["", "", ""]);
  const [speedCompleted, setSpeedCompleted] = useState(false);

  // 3. État Duel Créatif
  const [duelIndex, setDuelIndex] = useState(0);
  const [selectedDuelOption, setSelectedDuelOption] = useState<"A" | "B" | null>(null);

  // Tick Chronomètre 30s
  useEffect(() => {
    let timer: any = null;
    if (speedIsRunning && speedTimer > 0) {
      timer = setInterval(() => {
        setSpeedTimer((t) => t - 1);
      }, 1000);
    } else if (speedTimer === 0 && speedIsRunning) {
      setSpeedIsRunning(false);
      handleFinishSpeedChallenge();
    }
    return () => clearInterval(timer);
  }, [speedIsRunning, speedTimer]);

  const currentSprint = SPRINT_BANK[sprintIndex % SPRINT_BANK.length];
  const currentDuel = DUEL_BANK[duelIndex % DUEL_BANK.length];
  const currentSpeedPrompt = SPEED_PROMPTS[speedPromptIndex % SPEED_PROMPTS.length];
  const rank = getRankInfo(creativeScore);

  // 1. Validation Sprint
  const handleSprintSubmit = () => {
    if (!sprintInput.trim() || sprintSubmitted) return;
    setSprintSubmitted(true);
    recordActivity("sprint", `Sprint : ${currentSprint.category}`, currentSprint.rewardScore);
    onScoreUpdate(currentSprint.rewardScore);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleNextSprint = () => {
    setSprintIndex((prev) => prev + 1);
    setSprintInput("");
    setSprintSubmitted(false);
  };

  // 2. Défi 30s
  const handleStartSpeed = () => {
    setSpeedTimer(30);
    setSpeedAnswers(["", "", ""]);
    setSpeedCompleted(false);
    setSpeedIsRunning(true);
  };

  const handleFinishSpeedChallenge = () => {
    const validCount = speedAnswers.filter((a) => a.trim().length > 0).length;
    const earned = validCount * 15;
    if (earned > 0) {
      recordActivity("speed", `Défi 30s : ${validCount}/3 réponses`, earned);
      onScoreUpdate(earned);
    }
    setSpeedCompleted(true);
    setSpeedIsRunning(false);

    try {
      confetti({
        particleCount: validCount * 25,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const handleNextSpeedPrompt = () => {
    setSpeedPromptIndex((prev) => prev + 1);
    setSpeedTimer(30);
    setSpeedAnswers(["", "", ""]);
    setSpeedCompleted(false);
    setSpeedIsRunning(false);
  };

  // 3. Duel Créatif
  const handleSelectDuelOption = (option: "A" | "B") => {
    if (selectedDuelOption) return;
    setSelectedDuelOption(option);
    recordActivity("duel", `Duel : ${currentDuel.theme} (${option})`, 25);
    onScoreUpdate(25);

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  const handleNextDuel = () => {
    setDuelIndex((prev) => prev + 1);
    setSelectedDuelOption(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-8">
      {/* En-tête du Game Hub */}
      <div className="border-b border-[#222530] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#201818] border border-[#3C2424] text-xs font-mono uppercase text-[#EF4444] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
            Gymnase de Pensée Latérale
          </div>
          <h1 id="gamehub-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            GAME HUB
          </h1>
          <p id="gamehub-subtitle" className="text-base text-[#9CA3AF] mt-1">
            Entraînez vos réflexes de conception sous contrainte.
          </p>
        </div>

        {/* Badge de Rang */}
        <div className="p-3 rounded-2xl bg-[#161822] border border-[#262A3B] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#202330] flex items-center justify-center text-[#FF5500]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#8E95A8]">Rang Actuel</div>
            <div className="text-sm font-bold text-white">{rank.title}</div>
          </div>
        </div>
      </div>

      {/* Onglets de sélection du jeu */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#151720] border border-[#242838] max-w-md">
        <button
          id="tab-game-sprint"
          onClick={() => setActiveGame("sprint")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeGame === "sprint"
              ? "bg-[#1E212E] text-white shadow-sm border border-[#2F3446]"
              : "text-[#8E95A8] hover:text-white"
          }`}
        >
          <Brain className="w-4 h-4 text-[#FF5500]" />
          <span>Sprint d&apos;Idées</span>
        </button>

        <button
          id="tab-game-speed"
          onClick={() => setActiveGame("speed")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeGame === "speed"
              ? "bg-[#1E212E] text-white shadow-sm border border-[#2F3446]"
              : "text-[#8E95A8] hover:text-white"
          }`}
        >
          <Timer className="w-4 h-4 text-[#EF4444]" />
          <span>Défi 30s</span>
        </button>

        <button
          id="tab-game-duel"
          onClick={() => setActiveGame("duel")}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeGame === "duel"
              ? "bg-[#1E212E] text-white shadow-sm border border-[#2F3446]"
              : "text-[#8E95A8] hover:text-white"
          }`}
        >
          <Swords className="w-4 h-4 text-[#3B82F6]" />
          <span>Duel Créatif</span>
        </button>
      </div>

      {/* JEU 1 : SPRINT D'IDÉES */}
      {activeGame === "sprint" && (
        <motion.div
          key="game-sprint"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-[#151822] border border-[#262A3B] space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#FF5500] font-semibold">
                <Brain className="w-4 h-4" />
                <span>{currentSprint.category}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201D17] border border-[#3A3322] text-xs font-mono text-[#EAB308]">
                <Flame className="w-3.5 h-3.5" />
                <span>+{currentSprint.rewardScore} PTS</span>
              </div>
            </div>

            {/* Prompt et Contrainte */}
            <div className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {currentSprint.prompt}
              </h2>
              <div className="p-4 rounded-xl bg-[#1C1F2B] border border-[#2A2F42] flex items-start gap-3">
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5">
                  CONTRAINTE
                </span>
                <p className="text-sm text-[#D1D5DB] font-medium">
                  {currentSprint.constraint}
                </p>
              </div>
            </div>

            {/* Saisie de la Solution */}
            {!sprintSubmitted ? (
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-mono uppercase text-[#8E95A8]">
                  Votre architecture de solution :
                </label>
                <textarea
                  rows={3}
                  value={sprintInput}
                  onChange={(e) => setSprintInput(e.target.value)}
                  placeholder="Décrivez votre mécanique ou votre prototype sous cette contrainte..."
                  className="w-full rounded-2xl bg-[#181B26] border border-[#292F42] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] p-4 text-sm text-white placeholder-[#555C70] outline-none resize-none"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSprintSubmit}
                    disabled={!sprintInput.trim()}
                    className={`px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      sprintInput.trim()
                        ? "bg-[#FF5500] hover:bg-[#FF6B2B] text-white shadow-lg shadow-[#FF5500]/20"
                        : "bg-[#1E212E] text-[#555C70] cursor-not-allowed"
                    }`}
                  >
                    <span>Valider la solution (+{currentSprint.rewardScore} PTS)</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-4"
              >
                <div className="flex items-center gap-2 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Sprint validé avec succès ! +{currentSprint.rewardScore} Points créatifs ajoutés.</span>
                </div>
                <p className="text-xs text-emerald-200/90 italic bg-[#151720]/60 p-3 rounded-xl border border-emerald-500/20">
                  « {sprintInput} »
                </p>
                <button
                  onClick={handleNextSprint}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Défi suivant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* JEU 2 : DÉFI 30 SECONDES */}
      {activeGame === "speed" && (
        <motion.div
          key="game-speed"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#151822] border border-[#262A3B] space-y-6 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#EF4444] font-semibold">
              <Timer className="w-4 h-4" />
              <span>DÉFI RAPIDITÉ // 30 SECONDES</span>
            </div>

            <div
              className={`px-4 py-1.5 rounded-xl font-mono font-bold text-base flex items-center gap-2 w-fit border ${
                speedIsRunning && speedTimer <= 5
                  ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                  : "bg-[#1C1F2B] text-white border-[#2A2F42]"
              }`}
            >
              <span>{speedTimer}s</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {currentSpeedPrompt}
          </h2>

          {!speedIsRunning && !speedCompleted ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
                Vous avez 30 secondes pour formuler 3 réponses distinctes. Chaque réponse valide rapporte 15 points.
              </p>
              <button
                onClick={handleStartSpeed}
                className="px-8 py-3.5 rounded-xl bg-[#EF4444] hover:bg-[#F85151] text-white text-sm font-semibold tracking-wide shadow-lg shadow-red-500/20 transition-all cursor-pointer"
              >
                Démarrer le chronomètre
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#1E212E] border border-[#2A2F42] flex items-center justify-center font-mono text-xs text-[#8E95A8] font-bold">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    disabled={!speedIsRunning}
                    value={speedAnswers[idx]}
                    onChange={(e) => {
                      const updated = [...speedAnswers];
                      updated[idx] = e.target.value;
                      setSpeedAnswers(updated);
                    }}
                    placeholder={`Idée ${idx + 1}...`}
                    className="flex-1 rounded-xl bg-[#181B26] border border-[#292F42] focus:border-red-500 focus:ring-1 focus:ring-red-500 px-4 py-2.5 text-sm text-white placeholder-[#555C70] outline-none disabled:opacity-50"
                  />
                </div>
              ))}

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">
                  {speedCompleted ? "Tour terminé !" : "Tapez vite et validez."}
                </span>

                {speedIsRunning && (
                  <button
                    onClick={handleFinishSpeedChallenge}
                    className="px-6 py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#F85151] text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Valider le tour
                  </button>
                )}

                {speedCompleted && (
                  <button
                    onClick={handleNextSpeedPrompt}
                    className="px-5 py-2.5 rounded-xl bg-[#1E212E] hover:bg-[#282C3D] text-white text-xs font-medium border border-[#2D3244] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Défi suivant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* JEU 3 : DUEL CRÉATIF */}
      {activeGame === "duel" && (
        <motion.div
          key="game-duel"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-[#151822] border border-[#262A3B] space-y-6 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase text-[#3B82F6] font-semibold">
              <Swords className="w-4 h-4" />
              <span>DUEL CRÉATIF : {currentDuel.theme}</span>
            </div>
            <div className="text-xs font-mono text-[#8E95A8]">+25 PTS</div>
          </div>

          <div className="text-sm text-[#9CA3AF]">
            Deux architectures opposées. Choisissez la direction stratégique la plus convaincante et débloquez l&apos;analyse critique.
          </div>

          {/* 2 Options en compétition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A */}
            <div
              onClick={() => handleSelectDuelOption("A")}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedDuelOption === "A"
                  ? "bg-[#1E2436] border-[#3B82F6] shadow-lg shadow-blue-500/10"
                  : selectedDuelOption === "B"
                  ? "bg-[#161821] border-[#222532] opacity-50"
                  : "bg-[#161822] border-[#262A3C] hover:border-[#3B82F6]/60 hover:bg-[#1A1D2B]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#3B82F6] uppercase">
                    OPTION A
                  </span>
                  {selectedDuelOption === "A" && (
                    <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {currentDuel.optionA.title}
                </h3>
                <p className="text-xs text-[#D1D5DB] leading-relaxed mb-3">
                  {currentDuel.optionA.premise}
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#8E95A8] italic border-t border-[#232736] pt-2">
                Ambiance : {currentDuel.optionA.vibe}
              </div>
            </div>

            {/* Option B */}
            <div
              onClick={() => handleSelectDuelOption("B")}
              className={`p-6 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedDuelOption === "B"
                  ? "bg-[#1E2436] border-[#3B82F6] shadow-lg shadow-blue-500/10"
                  : selectedDuelOption === "A"
                  ? "bg-[#161821] border-[#222532] opacity-50"
                  : "bg-[#161822] border-[#262A3C] hover:border-[#3B82F6]/60 hover:bg-[#1A1D2B]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-[#3B82F6] uppercase">
                    OPTION B
                  </span>
                  {selectedDuelOption === "B" && (
                    <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {currentDuel.optionB.title}
                </h3>
                <p className="text-xs text-[#D1D5DB] leading-relaxed mb-3">
                  {currentDuel.optionB.premise}
                </p>
              </div>
              <div className="text-[11px] font-mono text-[#8E95A8] italic border-t border-[#232736] pt-2">
                Ambiance : {currentDuel.optionB.vibe}
              </div>
            </div>
          </div>

          {/* Révélation de l'analyse critique */}
          {selectedDuelOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#1B1E2B] border border-[#2B3145] space-y-3"
            >
              <div className="text-xs font-mono uppercase text-[#3B82F6] font-semibold">
                ANALYSE STRATÉGIQUE
              </div>
              <p className="text-xs text-[#E5E7EB] leading-relaxed">
                {selectedDuelOption === "A" ? currentDuel.critiqueA : currentDuel.critiqueB}
              </p>
              <div className="pt-2">
                <button
                  onClick={handleNextDuel}
                  className="px-5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#4E91FD] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Duel suivant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
