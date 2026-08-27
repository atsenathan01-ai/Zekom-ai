import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Mic,
  Check,
  Copy,
  Layers,
  Users,
  Target,
  Palette,
  DollarSign,
  Milestone,
  ShieldCheck,
  Flame,
  AlertCircle,
  Download,
  FolderGit2,
  Lock,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProjectBlueprint, ActiveTab } from "../types";
import { recordActivity, saveBlueprint } from "../lib/storage";
import {
  generateProjectMarkdown,
  downloadProjectFile,
} from "../lib/exportUtils";
import PitchModal from "./PitchModal";

interface CreateProjectProps {
  onScoreUpdate: (points: number) => void;
  onNavigate?: (tab: ActiveTab) => void;
  preloadedIdea?: string;
}

const EXAMPLE_IDEAS = [
  "Une application qui transforme les retours clients en feuille de route produit.",
  "Un jeu où deux joueurs construisent une civilisation sans écran par signaux audio.",
  "Un réseau de location de matériel vidéo haute précision entre créateurs indépendants.",
  "Un compilateur d'ambiances de concentration avec synthétiseur binaural hors-ligne.",
];

export default function CreateProject({
  onScoreUpdate,
  onNavigate,
  preloadedIdea,
}: CreateProjectProps) {
  const [ideaInput, setIdeaInput] = useState(preloadedIdea || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [copiedBlueprint, setCopiedBlueprint] = useState(false);
  const [justSavedNotification, setJustSavedNotification] = useState(false);

  useEffect(() => {
    if (preloadedIdea && preloadedIdea.trim() && preloadedIdea !== ideaInput) {
      setIdeaInput(preloadedIdea);
      handleSubmit(preloadedIdea);
    }
  }, [preloadedIdea]);

  const handleSubmit = async (overrideIdea?: string) => {
    const query = (overrideIdea || ideaInput).trim();
    if (!query || loading) return;

    setLoading(true);
    setError(null);
    setJustSavedNotification(false);

    try {
      const res = await fetch("/api/ai/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: query }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur serveur ${res.status}`);
      }

      const data = await res.json();
      const newBlueprint: ProjectBlueprint = {
        id: "bp-" + Date.now(),
        projectName: data.projectName || "Projet ZEKROM",
        slogan: data.slogan || "L'exécution radicale.",
        concept: data.concept || query,
        problemSolved: data.problemSolved || "Friction opérationnelle.",
        solution: data.solution || "Système unifié et automatisé.",
        targetAudience: data.targetAudience || "Créateurs et bâtisseurs.",
        mainFeatures: data.mainFeatures || [
          "Espace collaboratif fluide",
          "Moteur d'automatisation",
          "Architecture modulaire",
          "Exportation multicanale",
          "Télémétrie en direct",
        ],
        uniqueSellingPoint:
          data.uniqueSellingPoint || "Cockpit unifié sans latence.",
        monetizationIdea: data.monetizationIdea || "Abonnement SaaS pro.",
        developmentRoadmap: data.developmentRoadmap || [
          {
            phase: "Phase 1 : Fondations",
            timeframe: "Semaines 1-4",
            description: "Moteur central & persistance.",
          },
          {
            phase: "Phase 2 : Réseau",
            timeframe: "Semaines 5-8",
            description: "Collaboration et intelligence.",
          },
          {
            phase: "Phase 3 : Échelle",
            timeframe: "Semaines 9-12",
            description: "Intégrations & expansion.",
          },
        ],
        mainChallenge: data.mainChallenge || "Adoption et mise à l'échelle.",
        pitch: data.pitch || "Notre solution change la donne.",
        visualDirection:
          data.visualDirection ||
          "Esthétique sombre minimaliste, accents orange #FF5500.",
        createdAt: Date.now(),
        originalIdea: query,
      };

      setBlueprint(newBlueprint);
      saveBlueprint(newBlueprint);
      setJustSavedNotification(true);
      recordActivity("idea", `Projet : ${newBlueprint.projectName}`, 40);
      onScoreUpdate(40);

      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err: any) {
      console.error("Erreur de création de projet:", err);
      setError(
        err.message ||
          "ZEKROM n'arrive pas à joindre son intelligence pour le moment. Vérifie ta connexion et réessaie."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBlueprint = async () => {
    if (!blueprint) return;
    try {
      const markdown = generateProjectMarkdown(blueprint);
      await navigator.clipboard.writeText(markdown);
      setCopiedBlueprint(true);
      setTimeout(() => setCopiedBlueprint(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = (format: "md" | "txt" = "md") => {
    if (!blueprint) return;
    downloadProjectFile(blueprint, format);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-8">
      {/* En-tête */}
      <div className="text-center sm:text-left border-b border-[#222530] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A1D27] border border-[#2B2F40] text-xs font-mono uppercase text-[#FF5500] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] animate-pulse" />
            Moteur de Conception & Architecture de Projet
          </div>
          <h1
            id="create-view-title"
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white"
          >
            CREATE
          </h1>
          <p
            id="create-view-subtitle"
            className="text-base text-[#9CA3AF] mt-1.5"
          >
            Transforme une simple idée en projet structuré complet.
          </p>
        </div>

        {onNavigate && (
          <button
            onClick={() => onNavigate("creations")}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#171922] hover:bg-[#202330] text-[#D1D5DB] hover:text-white border border-[#2B2F40] text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Voir Mes Créations</span>
          </button>
        )}
      </div>

      {/* Carte de Formulation */}
      <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#14161E] border border-[#252838] shadow-xl">
        <label
          htmlFor="create-idea-input"
          className="block text-xs font-mono uppercase tracking-wider text-[#9CA3AF] mb-2 font-medium"
        >
          Décrivez votre idée brute ou hypothèse de départ
        </label>

        <textarea
          id="create-idea-input"
          rows={3}
          value={ideaInput}
          onChange={(e) => setIdeaInput(e.target.value)}
          placeholder="ex. Une application qui transforme les retours clients en feuille de route produit..."
          className="w-full rounded-2xl bg-[#191C26] border border-[#2B3042] focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500] p-4 text-sm sm:text-base text-white placeholder-[#5A6275] resize-none outline-none transition-all"
        />

        {/* Suggestions d'inspiration rapide */}
        <div className="mt-3">
          <div className="text-[11px] font-mono uppercase text-[#6B7280] mb-2">
            Ou explorez un concept :
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_IDEAS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setIdeaInput(ex);
                  handleSubmit(ex);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#1B1E29] hover:bg-[#232736] border border-[#282C3D] hover:border-[#FF5500]/40 text-[#A0A6B8] hover:text-white transition-all text-left cursor-pointer"
              >
                &ldquo;{ex}&rdquo;
              </button>
            ))}
          </div>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Bouton Générer */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#222532]">
          <span className="text-xs text-[#6B7280]">
            Développe votre vision en 12 piliers stratégiques avec pitch oral et roadmap.
          </span>

          <button
            id="create-generate-btn"
            onClick={() => handleSubmit()}
            disabled={!ideaInput.trim() || loading}
            className={`px-7 py-3 rounded-xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
              ideaInput.trim() && !loading
                ? "bg-[#FF5500] hover:bg-[#FF6B2B] text-white shadow-lg shadow-[#FF5500]/20"
                : "bg-[#202330] text-[#555C70] cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Architecture en cours de construction...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Créer le projet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification de sauvegarde automatique */}
      <AnimatePresence>
        {justSavedNotification && blueprint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Projet <strong>« {blueprint.projectName} »</strong> sauvegardé automatiquement dans vos Créations.
              </span>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate("creations")}
                className="underline hover:text-white transition-colors cursor-pointer text-xs font-semibold shrink-0"
              >
                Ouvrir Mes Créations →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Affichage des 12 Piliers du Résultat */}
      <AnimatePresence>
        {blueprint && (
          <motion.div
            id="blueprint-results-section"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Ruban d'actions supérieur */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-[#14161E] border border-[#262A3B] shadow-xl">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-[#FF5500] font-semibold">
                  ARCHITECTURE DE PROJET // COMPLÈTE
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
                  {blueprint.projectName}
                </h2>
                <p className="text-sm text-[#FF5500] font-medium mt-0.5">
                  {blueprint.slogan}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="pitch-my-idea-btn"
                  onClick={() => setIsPitchOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-[#FF5500]/20 flex items-center gap-2 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Pitcher ce projet</span>
                </button>

                <button
                  onClick={handleCopyBlueprint}
                  className="px-4 py-2.5 rounded-xl bg-[#1B1E2B] hover:bg-[#242838] text-white text-xs font-medium border border-[#2D3244] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedBlueprint ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copier le projet</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownload("md")}
                  className="px-4 py-2.5 rounded-xl bg-[#1B1E2B] hover:bg-[#242838] text-white text-xs font-medium border border-[#2D3244] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter (.md)</span>
                </button>

                <button
                  id="generate-again-btn"
                  onClick={() => handleSubmit()}
                  disabled={loading}
                  className="p-2.5 rounded-xl bg-[#1B1E2B] hover:bg-[#242838] text-[#9CA3AF] hover:text-white border border-[#2D3244] transition-colors cursor-pointer"
                  title="Régénérer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Grille des 12 Piliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* 1. Concept */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#FF5500] text-xs font-mono uppercase tracking-wider mb-2.5">
                    <Target className="w-4 h-4" />
                    <span>1. Concept</span>
                  </div>
                  <p className="text-sm text-[#E5E7EB] font-medium leading-relaxed">
                    {blueprint.concept}
                  </p>
                </div>
              </div>

              {/* 2. Problème résolu */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>2. Problème résolu</span>
                  </div>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed">
                    {blueprint.problemSolved}
                  </p>
                </div>
              </div>

              {/* 3. Solution */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <Sparkles className="w-4 h-4" />
                    <span>3. Solution</span>
                  </div>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed">
                    {blueprint.solution || blueprint.concept}
                  </p>
                </div>
              </div>

              {/* 4. Public cible */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <Users className="w-4 h-4" />
                    <span>4. Public Cible</span>
                  </div>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed">
                    {blueprint.targetAudience}
                  </p>
                </div>
              </div>

              {/* 5. 5 Fonctionnalités clés */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <Layers className="w-4 h-4" />
                    <span>5. Fonctionnalités Clés (5 Piliers)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {blueprint.mainFeatures?.map((feat, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#191C26] border border-[#272B3C] text-xs text-white flex items-start gap-2"
                      >
                        <span className="font-mono text-[#FF5500] font-bold">
                          0{idx + 1}
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 6. Proposition de valeur (USP) */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#FF5500] text-xs font-mono uppercase tracking-wider mb-2.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>6. Proposition de Valeur (USP)</span>
                  </div>
                  <p className="text-sm text-[#E5E7EB] font-medium leading-relaxed">
                    {blueprint.uniqueSellingPoint}
                  </p>
                </div>
              </div>

              {/* 7. Modèle économique */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <DollarSign className="w-4 h-4" />
                    <span>7. Modèle Économique</span>
                  </div>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed">
                    {blueprint.monetizationIdea}
                  </p>
                </div>
              </div>

              {/* 8. Défi principal */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <Lock className="w-4 h-4" />
                    <span>8. Défi Principal</span>
                  </div>
                  <p className="text-sm text-[#D1D5DB] leading-relaxed">
                    {blueprint.mainChallenge}
                  </p>
                </div>
              </div>

              {/* 9. Feuille de route (Roadmap) */}
              <div className="p-5 rounded-2xl bg-[#14161E] border border-[#242838] flex flex-col justify-between md:col-span-2 lg:col-span-3">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-wider mb-2.5">
                    <Milestone className="w-4 h-4" />
                    <span>9. Feuille de Route de Développement</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    {blueprint.developmentRoadmap?.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#191C26] border border-[#272B3C] space-y-1"
                      >
                        <div className="text-[10px] font-mono text-[#38BDF8]">
                          {item.timeframe}
                        </div>
                        <div className="text-xs font-bold text-white">
                          {item.phase}
                        </div>
                        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10. Pitch de 30 secondes */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1E1614] to-[#14161E] border border-[#44281E] flex flex-col justify-between md:col-span-2 lg:col-span-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#FF5500] text-xs font-mono uppercase tracking-wider font-bold">
                      <Mic className="w-4 h-4" />
                      <span>10. Pitch de 30 Secondes</span>
                    </div>
                    <button
                      onClick={() => setIsPitchOpen(true)}
                      className="text-xs text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span>S&apos;entraîner au pitch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-white italic leading-relaxed">
                    « {blueprint.pitch} »
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Pitch 30s */}
      <PitchModal
        isOpen={isPitchOpen}
        onClose={() => setIsPitchOpen(false)}
        blueprint={blueprint}
        onScoreUpdate={onScoreUpdate}
      />
    </div>
  );
}
