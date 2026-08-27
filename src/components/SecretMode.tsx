import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Terminal as TerminalIcon,
  ArrowRight,
  Unlock,
  Flame,
  Zap,
  BookOpen,
  Send,
  Skull,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";
import { SecretExperimentResponse, ActiveTab } from "../types";
import { recordActivity } from "../lib/storage";

interface SecretModeProps {
  isOpen: boolean;
  onClose: () => void;
  onScoreUpdate: (points: number) => void;
  onSendToCreate?: (idea: string) => void;
}

const RADICAL_IDEAS_BANK = [
  {
    title: "Le Réseau Sans Écran",
    tagline: "Connexion humaine via fréquences sonores et vibrations haptiques.",
    premise:
      "Un réseau social sans flux infini ni images : uniquement des impulsions audio spatiales synchronisées quand deux personnes pensent au même sujet.",
  },
  {
    title: "L'Entreprise Éphémère de 24h",
    tagline: "Une entité commerciale créée à 08h00 et dissoute à minuit.",
    premise:
      "Des collectifs d'ingénieurs et designers se rassemblent pour lancer un produit payant en 12 heures, encaissent les bénéfices puis dissolvent automatiquement l'entité.",
  },
  {
    title: "Le Compilateur de Silence",
    tagline: "Un algorithme qui détruit 90% du code inutile.",
    premise:
      "Un outil de vibe coding qui analyse l'architecture d'un projet et supprime tout superflu pour ne laisser que le moteur brut et une interface sans concession.",
  },
  {
    title: "La Bourse de la Confiance Radicale",
    tagline: "Investir sur la réputation brute d'un créateur avant son premier produit.",
    premise:
      "Une plateforme où les créateurs s'engagent sur leur vitesse d'exécution plutôt que sur des business plans théoriques.",
  },
];

const MANIFESTO_PARAGRAPHS = [
  {
    title: "01. L'Exécution Bat la Spéculation",
    content:
      "Une idée dans une tête ne vaut rien. Une maquette cliquable en 30 minutes vaut une entreprise. ZEKROM transforme l'intuition brute en architecture tangible avant que le doute ne s'installe.",
  },
  {
    title: "02. Le Vibe Coding comme Artisanat",
    content:
      "Le code n'est plus une barrière de syntaxe, c'est un flux de pensée. Nous sculptons des logiciels à la vitesse de la conversation sans sacrifier la précision de l'architecture.",
  },
  {
    title: "03. Refuser la Banalité",
    content:
      "L'intelligence artificielle ne doit pas uniformiser le monde en produisant du contenu générique. Elle doit devenir le levier de concepts singuliers, inattendus et radicaux.",
  },
  {
    title: "04. Think Beyond the Obvious",
    content:
      "Si tout le monde construit la même chose de la même façon, construisez l'inverse. Une idée peut devenir une expérience mémorable.",
  },
];

export default function SecretMode({
  isOpen,
  onClose,
  onScoreUpdate,
  onSendToCreate,
}: SecretModeProps) {
  const [subTab, setSubTab] = useState<"radical" | "manifesto" | "terminal" | "experiment">("radical");
  const [radicalIndex, setRadicalIndex] = useState(0);

  // Experiment state
  const [answerInput, setAnswerInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [experimentResult, setExperimentResult] = useState<SecretExperimentResponse | null>(null);

  // Terminal state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "ZEKROM KERNEL v3.0 [CONCOURS EDITION]",
    "Type 'help' pour afficher les commandes disponibles.",
  ]);
  const [terminalInput, setTerminalInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      recordActivity("secret", "Accès Secret Débloqué", 50);
      onScoreUpdate(50);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isOpen]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const newLogs = [...terminalLogs, `> ${terminalInput}`];

    switch (cmd) {
      case "help":
        newLogs.push(
          "COMMANDES DISPONIBLES :",
          "  manifesto  - Affiche le manifeste ZEKROM",
          "  ideas      - Affiche une idée radicale",
          "  experiment - Lance la question sans filtre",
          "  clear      - Efface l'écran",
          "  exit       - Quitter le mode secret"
        );
        break;
      case "manifesto":
        newLogs.push(
          "--- MANIFESTE ZEKROM ---",
          "1. L'exécution bat la spéculation.",
          "2. Le vibe coding est un artisanat moderne.",
          "3. Refusez le générique, embrassez l'audace.",
          "4. Une idée peut devenir une expérience."
        );
        break;
      case "ideas":
        const randomIdea =
          RADICAL_IDEAS_BANK[Math.floor(Math.random() * RADICAL_IDEAS_BANK.length)];
        newLogs.push(
          `IDÉE : [${randomIdea.title}]`,
          `Slogan : ${randomIdea.tagline}`,
          `Concept : ${randomIdea.premise}`
        );
        break;
      case "clear":
        setTerminalLogs(["Console réinitialisée. Tapez 'help'."]);
        setTerminalInput("");
        return;
      case "exit":
        onClose();
        return;
      default:
        newLogs.push(`Commande inconnue : '${cmd}'. Tapez 'help'.`);
    }

    setTerminalLogs(newLogs);
    setTerminalInput("");
  };

  const handleNextRadicalIdea = () => {
    setRadicalIndex((prev) => (prev + 1) % RADICAL_IDEAS_BANK.length);
  };

  const handleSendIdeaToCreate = (idea: string) => {
    if (onSendToCreate) {
      onSendToCreate(idea);
      onClose();
    }
  };

  const handleSubmitAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = answerInput.trim();
    if (!clean || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/secret-experiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: clean }),
      });

      if (!res.ok) {
        throw new Error("Synthèse expérimentale momentanément indisponible");
      }

      const data: SecretExperimentResponse = await res.json();
      setExperimentResult(data);
      recordActivity("secret", `Expérience : ${clean.slice(0, 25)}...`, 50);
      onScoreUpdate(50);
    } catch (err: any) {
      console.error("Erreur expérience secrète:", err);
      setError(
        err.message ||
          "ZEKROM n'arrive pas à joindre son intelligence. Vérifiez la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentRadical = RADICAL_IDEAS_BANK[radicalIndex];

  return (
    <AnimatePresence>
      <motion.div
        id="secret-mode-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl overflow-y-auto"
      >
        <div className="relative w-full max-w-4xl bg-[#11131A] border border-[#2B2F42] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
          {/* Barre supérieure */}
          <div className="p-5 sm:p-6 border-b border-[#202330] bg-[#141620] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
                <Unlock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    SECRET MODE
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] text-[10px] font-mono uppercase font-bold">
                    Confidentiel
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Idées radicales, manifeste et console expérimentale ZEKROM
                </p>
              </div>
            </div>

            <button
              id="close-secret-mode-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1D202D] text-[#9CA3AF] hover:text-white border border-[#2A2E3E] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Onglets Secrets */}
          <div className="px-6 pt-4 border-b border-[#1E212E] bg-[#12141C] flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSubTab("radical")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === "radical"
                  ? "bg-[#171922] text-white border-t border-x border-[#2B2F42]"
                  : "text-[#8E95A8] hover:text-white"
              }`}
            >
              <Skull className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Idées Radicales</span>
            </button>

            <button
              onClick={() => setSubTab("manifesto")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === "manifesto"
                  ? "bg-[#171922] text-white border-t border-x border-[#2B2F42]"
                  : "text-[#8E95A8] hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Manifeste ZEKROM</span>
            </button>

            <button
              onClick={() => setSubTab("terminal")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === "terminal"
                  ? "bg-[#171922] text-white border-t border-x border-[#2B2F42]"
                  : "text-[#8E95A8] hover:text-white"
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Mode Terminal</span>
            </button>

            <button
              onClick={() => setSubTab("experiment")}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === "experiment"
                  ? "bg-[#171922] text-white border-t border-x border-[#2B2F42]"
                  : "text-[#8E95A8] hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Question Fondamentale</span>
            </button>
          </div>

          {/* Corps de l'onglet actif */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#D1D5DB]">
            {/* 1. IDÉES RADICALES */}
            {subTab === "radical" && (
              <motion.div
                key="tab-radical"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-3xl bg-[#171922] border border-[#2B2F42] space-y-4 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-mono uppercase text-[#FF5500] font-bold">
                      CONCEPT ANTI-CONSENSUS // {radicalIndex + 1}/{RADICAL_IDEAS_BANK.length}
                    </div>
                    <button
                      onClick={handleNextRadicalIdea}
                      className="text-xs text-[#9CA3AF] hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Idée suivante</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {currentRadical.title}
                    </h3>
                    <p className="text-xs text-[#FF5500] font-medium mt-0.5">
                      {currentRadical.tagline}
                    </p>
                  </div>

                  <p className="text-sm text-[#D1D5DB] leading-relaxed bg-[#13151D] p-4 rounded-2xl border border-[#222636]">
                    {currentRadical.premise}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-[#6B7280]">
                      Envoyez ce concept directement dans le moteur CREATE pour l&apos;architecturer.
                    </span>

                    <button
                      onClick={() =>
                        handleSendIdeaToCreate(
                          `${currentRadical.title} : ${currentRadical.premise}`
                        )
                      }
                      className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-[#FF5500]/20 cursor-pointer"
                    >
                      <span>Développer dans CREATE</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. MANIFESTE ZEKROM */}
            {subTab === "manifesto" && (
              <motion.div
                key="tab-manifesto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="border-b border-[#222636] pb-3">
                  <h3 className="text-xl font-bold text-white">
                    LE MANIFESTE DU BÂTISSEUR
                  </h3>
                  <p className="text-xs text-[#8E95A8]">
                    Principes cardinaux pour le vibe coding et la création radicale.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {MANIFESTO_PARAGRAPHS.map((para, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-[#171922] border border-[#272B3C] space-y-2"
                    >
                      <div className="text-xs font-mono font-bold text-[#38BDF8]">
                        {para.title}
                      </div>
                      <p className="text-xs text-[#D1D5DB] leading-relaxed">
                        {para.content}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 3. MODE TERMINAL */}
            {subTab === "terminal" && (
              <motion.div
                key="tab-terminal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-4 sm:p-6 rounded-2xl bg-[#0B0C10] border border-[#222532] font-mono text-xs text-[#10B981] space-y-2 min-h-[260px] max-h-[360px] overflow-y-auto">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                <form onSubmit={handleTerminalSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Tapez 'help', 'manifesto', 'ideas' ou 'clear'..."
                    className="flex-1 rounded-xl bg-[#161822] border border-[#282C3D] px-4 py-2.5 text-xs font-mono text-white placeholder-[#555C70] outline-none focus:border-[#10B981]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-black text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Exécuter
                  </button>
                </form>
              </motion.div>
            )}

            {/* 4. QUESTION SANS FILTRE */}
            {subTab === "experiment" && (
              <motion.div
                key="tab-experiment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {!experimentResult ? (
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <div className="p-5 rounded-2xl bg-[#171922] border border-[#272B3C] space-y-2">
                      <h3 className="text-xl font-bold text-white">
                        Que construiriez-vous si l&apos;échec n&apos;existait pas ?
                      </h3>
                      <p className="text-xs text-[#8E95A8]">
                        Sans investisseurs prudents, sans jugement, sans contraintes de temps.
                      </p>
                    </div>

                    <textarea
                      rows={4}
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Décrivez votre création la plus ambitieuse sans filtre..."
                      className="w-full rounded-2xl bg-[#151720] border border-[#272B3C] p-4 text-sm text-white placeholder-[#555C70] outline-none focus:border-[#FF5500]"
                    />

                    {error && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!answerInput.trim() || loading}
                        className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-xs font-semibold transition-all cursor-pointer"
                      >
                        {loading ? "Synthèse..." : "Soumettre la vision"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-5 rounded-2xl bg-[#171922] border border-[#272B3C] space-y-4">
                    <h3 className="text-xl font-bold text-white">
                      {experimentResult.title}
                    </h3>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {experimentResult.synthesis}
                    </p>
                    <div className="p-3 rounded-xl bg-[#13151D] border border-[#242838] text-xs text-[#FF5500]">
                      <strong>Premier pas :</strong> {experimentResult.catalystAction}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Pied */}
          <div className="p-4 sm:p-5 border-t border-[#202330] bg-[#11131A] flex items-center justify-between text-xs text-[#6B7280]">
            <span>ZEKROM SECRET ENGINE // V3 CONCOURS</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1D202D] hover:bg-[#272B3D] text-white text-xs font-medium cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
