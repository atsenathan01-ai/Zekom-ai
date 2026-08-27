import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Copy,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Mic,
  ArrowRight,
  Flame,
  AlertCircle,
  Download,
  FolderGit2,
  Clock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PitchData, ProjectBlueprint } from "../types";
import { recordActivity, loadSavedBlueprints } from "../lib/storage";
import { generatePitchMarkdown, downloadPitchFile } from "../lib/exportUtils";

interface PitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: ProjectBlueprint | null;
  onScoreUpdate: (points: number) => void;
}

export default function PitchModal({
  isOpen,
  onClose,
  blueprint,
  onScoreUpdate,
}: PitchModalProps) {
  const [pitchData, setPitchData] = useState<PitchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [customIdeaInput, setCustomIdeaInput] = useState("");
  const [selectedSavedBpId, setSelectedSavedBpId] = useState<string>("");
  const [savedList, setSavedList] = useState<ProjectBlueprint[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = loadSavedBlueprints();
      setSavedList(saved);
      if (blueprint) {
        setSelectedSavedBpId(blueprint.id);
        generatePitch(blueprint);
      } else if (saved.length > 0) {
        setSelectedSavedBpId(saved[0].id);
        generatePitch(saved[0]);
      }
    }
  }, [isOpen, blueprint]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.65 },
        });
      } catch {}
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const generatePitch = async (targetBp?: ProjectBlueprint, rawIdea?: string) => {
    setLoading(true);
    setError(null);
    setIsTimerRunning(false);
    setTimerSeconds(30);

    const ideaText = rawIdea || targetBp?.originalIdea || targetBp?.concept || customIdeaInput;

    try {
      const res = await fetch("/api/ai/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: ideaText,
          projectContext: targetBp || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Échec de la génération du script de pitch");
      }

      const data: PitchData = await res.json();
      setPitchData(data);
      recordActivity("pitch", `Pitch : ${data.projectName}`, 25);
      onScoreUpdate(25);

      try {
        confetti({
          particleCount: 60,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error("Erreur de génération du pitch:", err);
      setError(
        err.message ||
          "ZEKROM n'arrive pas à joindre son intelligence pour le moment. Vérifie ta connexion et réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPitch = async () => {
    if (!pitchData) return;
    try {
      const formatted = generatePitchMarkdown(pitchData);
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!pitchData) return;
    downloadPitchFile(pitchData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          id="pitch-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-[#14161E] border border-[#2B2F42] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* En-tête */}
          <div className="p-5 sm:p-6 border-b border-[#222532] bg-[#11131A] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 flex items-center justify-center">
                <Mic className="w-5 h-5 text-[#FF5500]" />
              </div>
              <div>
                <h2
                  id="pitch-modal-title"
                  className="text-lg sm:text-xl font-bold text-white tracking-tight"
                >
                  PITCH MY IDEA
                </h2>
                <p className="text-xs text-[#9CA3AF]">
                  Argumentaire oral de conviction en 30 secondes chrono
                </p>
              </div>
            </div>

            <button
              id="close-pitch-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1D202D] text-[#9CA3AF] hover:text-white border border-[#2A2E3E] transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Corps déroulant */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 text-sm text-[#D1D5DB]">
            {/* Sélection de projet ou idée personnalisée */}
            {savedList.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#181B26] border border-[#25293A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-mono uppercase text-[#8E95A8]">
                  Sélectionner une création :
                </div>
                <select
                  value={selectedSavedBpId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedSavedBpId(id);
                    const target = savedList.find((b) => b.id === id);
                    if (target) generatePitch(target);
                  }}
                  className="rounded-xl bg-[#13151D] border border-[#2C3145] text-xs text-white p-2.5 outline-none focus:border-[#FF5500]"
                >
                  {savedList.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.projectName} — {bp.concept.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading && (
              <div className="py-16 text-center space-y-3">
                <div className="w-9 h-9 rounded-full border-2 border-[#FF5500] border-t-transparent animate-spin mx-auto" />
                <div className="text-sm text-white font-medium">
                  Formulation de l&apos;argumentaire oral en cours...
                </div>
                <div className="text-xs text-[#6B7280]">
                  Structuration en 6 volets d&apos;impact et calibrage du tempo 30 secondes.
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                <span className="flex-1">{error}</span>
                <button
                  onClick={() => generatePitch(blueprint || undefined)}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/40 text-white font-medium cursor-pointer"
                >
                  Réessayer
                </button>
              </div>
            )}

            {pitchData && !loading && (
              <div className="space-y-6">
                {/* 6 Piliers d'Impact du Pitch */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. Accroche */}
                  <div className="p-3.5 rounded-xl bg-[#181B26] border border-[#262B3D] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-[#FF5500] font-semibold">
                      1. ACCROCHE (HOOK)
                    </div>
                    <p className="text-xs text-[#F3F4F6] font-medium leading-relaxed">
                      {pitchData.hook}
                    </p>
                  </div>

                  {/* 2. Problème */}
                  <div className="p-3.5 rounded-xl bg-[#181B26] border border-[#262B3D] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-red-400 font-semibold">
                      2. LE PROBLÈME
                    </div>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {pitchData.problem}
                    </p>
                  </div>

                  {/* 3. Solution */}
                  <div className="p-3.5 rounded-xl bg-[#181B26] border border-[#262B3D] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                      3. LA SOLUTION
                    </div>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {pitchData.solution}
                    </p>
                  </div>

                  {/* 4. Pourquoi maintenant */}
                  <div className="p-3.5 rounded-xl bg-[#181B26] border border-[#262B3D] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-blue-400 font-semibold">
                      4. POURQUOI MAINTENANT
                    </div>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {pitchData.whyNow || pitchData.whyItMatters}
                    </p>
                  </div>

                  {/* 5. Différenciation */}
                  <div className="p-3.5 rounded-xl bg-[#181B26] border border-[#262B3D] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-purple-400 font-semibold">
                      5. DIFFÉRENCIATION
                    </div>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {pitchData.differentiation || "Exécution 10x plus rapide sans friction."}
                    </p>
                  </div>

                  {/* 6. Conclusion */}
                  <div className="p-3.5 rounded-xl bg-[#181B26] border border-[#262B3D] space-y-1">
                    <div className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                      6. CONCLUSION & VISION
                    </div>
                    <p className="text-xs text-[#D1D5DB] leading-relaxed">
                      {pitchData.conclusion || "Rejoignez le mouvement dès aujourd'hui."}
                    </p>
                  </div>
                </div>

                {/* Grande Carte : SCRIPT ORAL 30 SECONDES */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1B1E29] to-[#141620] border border-[#30364C] shadow-xl space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-mono uppercase text-[#FF5500] tracking-wider font-bold flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      SCRIPT DE PITCH PARLÉ COMPLET (30 SECONDES)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyPitch}
                        className="px-3 py-1.5 rounded-lg bg-[#222738] hover:bg-[#2C3247] text-xs font-medium text-white border border-[#343B52] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier le pitch</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleDownload}
                        className="px-3 py-1.5 rounded-lg bg-[#222738] hover:bg-[#2C3247] text-xs font-medium text-white border border-[#343B52] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Exporter (.md)</span>
                      </button>
                    </div>
                  </div>

                  <blockquote className="text-base sm:text-lg text-white font-medium leading-relaxed italic border-l-3 border-[#FF5500] pl-4 py-1.5 bg-[#12141C]/50 rounded-r-xl">
                    « {pitchData.pitch} »
                  </blockquote>
                </div>

                {/* Chronomètre d'entraînement interactif */}
                <div className="p-5 rounded-2xl bg-[#161822] border border-[#272B3C] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl border ${
                        timerSeconds === 0
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : timerSeconds <= 5
                          ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                          : "bg-[#1C1F2C] text-white border-[#2E3347]"
                      }`}
                    >
                      {timerSeconds}s
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#FF5500]" />
                        <span>Entraînement Chrono 30s</span>
                      </div>
                      <div className="text-xs text-[#8E95A8]">
                        Lisez le script à voix haute pour valider le tempo et l&apos;impact.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {!isTimerRunning ? (
                      <button
                        onClick={() => {
                          if (timerSeconds === 0) setTimerSeconds(30);
                          setIsTimerRunning(true);
                        }}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#FF5500]/20 cursor-pointer"
                      >
                        <Play className="w-4 h-4" />
                        <span>{timerSeconds === 0 ? "Recommencer" : "Lancer le chrono"}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsTimerRunning(false)}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#242838] hover:bg-[#2C3144] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Pause</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsTimerRunning(false);
                        setTimerSeconds(30);
                      }}
                      className="p-2.5 rounded-xl bg-[#1E212E] hover:bg-[#282C3D] text-[#9CA3AF] hover:text-white border border-[#2D3144] transition-colors cursor-pointer"
                      title="Réinitialiser le chronomètre"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pied de modal */}
          <div className="p-4 sm:p-5 border-t border-[#202330] bg-[#11131A] flex items-center justify-between">
            <span className="text-xs font-mono text-[#6B7280]">
              ZEKROM PITCH COACH // V3 CONCOURS
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#1D202D] hover:bg-[#272B3C] text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
