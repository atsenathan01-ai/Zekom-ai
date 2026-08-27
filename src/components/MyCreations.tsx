import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectBlueprint, ActiveTab } from "../types";
import {
  loadSavedBlueprints,
  deleteBlueprint,
} from "../lib/storage";
import {
  generateProjectMarkdown,
  downloadProjectFile,
} from "../lib/exportUtils";
import {
  FolderGit2,
  Plus,
  Copy,
  Check,
  Download,
  Trash2,
  Mic,
  ExternalLink,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Target,
  Flame,
  ChevronRight,
  X,
} from "lucide-react";

interface MyCreationsProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenPitch: (blueprint: ProjectBlueprint) => void;
}

export default function MyCreations({
  onNavigate,
  onOpenPitch,
}: MyCreationsProps) {
  const [blueprints, setBlueprints] = useState<ProjectBlueprint[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] =
    useState<ProjectBlueprint | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const refreshList = () => {
    setBlueprints(loadSavedBlueprints());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleCopy = async (bp: ProjectBlueprint, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      const markdown = generateProjectMarkdown(bp);
      await navigator.clipboard.writeText(markdown);
      setCopiedId(bp.id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = (
    bp: ProjectBlueprint,
    format: "md" | "txt" = "md",
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    downloadProjectFile(bp, format);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = deleteBlueprint(id);
    setBlueprints(updated);
    setDeleteConfirmId(null);
    if (selectedBlueprint?.id === id) {
      setSelectedBlueprint(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 space-y-8">
      {/* En-tête de section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#202433] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181B26] border border-[#272B3E] text-xs font-mono text-[#FF5500] uppercase tracking-wider mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>ESPACE DE STOCKAGE LOCAL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mes Créations
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-1">
            Tous les projets et architectures générés avec ZEKROM sont conservés ici.
          </p>
        </div>

        <button
          id="new-creation-btn"
          onClick={() => onNavigate("create")}
          className="px-5 py-3 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-lg shadow-[#FF5500]/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle création</span>
        </button>
      </div>

      {/* Liste des projets */}
      {blueprints.length === 0 ? (
        /* État Vide */
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 px-6 rounded-3xl bg-[#14161E] border border-[#232738] space-y-5 max-w-xl mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1A1D29] border border-[#2C3145] text-[#FF5500] flex items-center justify-center mx-auto shadow-inner">
            <Layers className="w-8 h-8 opacity-80" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">
              Tu n&apos;as encore rien créé.
            </h3>
            <p className="text-sm text-[#8E95A8] max-w-md mx-auto leading-relaxed">
              Commence avec une idée. Le moteur CREATE la transformera en un plan complet prêt pour l&apos;exécution.
            </p>
          </div>
          <button
            id="empty-state-create-btn"
            onClick={() => onNavigate("create")}
            className="px-7 py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-sm font-semibold tracking-wide shadow-lg shadow-[#FF5500]/25 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Créer mon premier projet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {blueprints.map((bp) => {
            const formattedDate = new Date(bp.createdAt || Date.now()).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });

            return (
              <motion.div
                key={bp.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative p-6 rounded-2xl bg-[#14161E] hover:bg-[#171A24] border border-[#232738] hover:border-[#383E56] transition-all flex flex-col justify-between space-y-5 shadow-lg"
              >
                <div className="space-y-3">
                  {/* Date & Actions rapides */}
                  <div className="flex items-center justify-between text-xs text-[#8E95A8]">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                      <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="Copier en Markdown"
                        onClick={(e) => handleCopy(bp, e)}
                        className="p-1.5 rounded-lg hover:bg-[#202434] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === bp.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        title="Télécharger .md"
                        onClick={(e) => handleDownload(bp, "md", e)}
                        className="p-1.5 rounded-lg hover:bg-[#202434] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === bp.id ? (
                        <button
                          title="Confirmer la suppression"
                          onClick={(e) => handleDelete(bp.id, e)}
                          className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] font-semibold border border-red-500/30 cursor-pointer"
                        >
                          Confirmer ?
                        </button>
                      ) : (
                        <button
                          title="Supprimer ce projet"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(bp.id);
                            setTimeout(() => setDeleteConfirmId(null), 4000);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-[#6B7280] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Titre & Slogan */}
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#FF5500] transition-colors leading-snug">
                      {bp.projectName}
                    </h3>
                    <p className="text-xs text-[#FF5500] font-medium mt-0.5 line-clamp-1">
                      {bp.slogan || "Architecture conçue sur ZEKROM V3"}
                    </p>
                  </div>

                  {/* Concept Résumé */}
                  <p className="text-xs text-[#9CA3AF] line-clamp-3 leading-relaxed">
                    {bp.concept}
                  </p>

                  {/* Public Cible */}
                  <div className="pt-1">
                    <span className="inline-block px-2.5 py-1 rounded-md bg-[#1B1E2B] border border-[#272B3E] text-[11px] font-mono text-[#CBD5E1] line-clamp-1">
                      🎯 {bp.targetAudience}
                    </span>
                  </div>
                </div>

                {/* Boutons d'action du bas */}
                <div className="pt-4 border-t border-[#1F2332] grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedBlueprint(bp)}
                    className="w-full py-2 px-3 rounded-xl bg-[#1B1E2B] hover:bg-[#232738] text-white text-xs font-medium border border-[#272B3E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Ouvrir</span>
                  </button>

                  <button
                    onClick={() => onOpenPitch(bp)}
                    className="w-full py-2 px-3 rounded-xl bg-[#FF5500]/10 hover:bg-[#FF5500]/20 text-[#FF5500] hover:text-white text-xs font-medium border border-[#FF5500]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Pitcher</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal d'inspection détaillée du projet sélectionné */}
      <AnimatePresence>
        {selectedBlueprint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#08090D]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedBlueprint(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] bg-[#14161E] border border-[#2B2F42] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
            >
              {/* Header Modal */}
              <div className="p-6 sm:p-8 border-b border-[#232739] flex items-start justify-between gap-4 bg-[#11131A]">
                <div>
                  <div className="text-xs font-mono uppercase text-[#FF5500] tracking-wider mb-1">
                    ARCHITECTURE DE PROJET // V3
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    {selectedBlueprint.projectName}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#FF5500] mt-1 font-medium">
                    {selectedBlueprint.slogan}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedBlueprint)}
                    className="px-3 py-1.5 rounded-xl bg-[#1D202D] hover:bg-[#272B3D] text-white text-xs font-medium border border-[#2D3247] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedId === selectedBlueprint.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload(selectedBlueprint, "md")}
                    className="px-3 py-1.5 rounded-xl bg-[#1D202D] hover:bg-[#272B3D] text-white text-xs font-medium border border-[#2D3247] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exporter .md</span>
                  </button>

                  <button
                    onClick={() => setSelectedBlueprint(null)}
                    className="p-2 rounded-xl bg-[#1D202D] hover:bg-[#272B3D] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Contenu Déroulant des 12 Piliers */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[#D1D5DB] leading-relaxed">
                {/* Concept & Problème / Solution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#181B26] border border-[#252838]">
                    <div className="text-[11px] font-mono text-[#3B82F6] uppercase font-semibold mb-1">
                      1. CONCEPT FONDAMENTAL
                    </div>
                    <p className="text-white font-medium">
                      {selectedBlueprint.concept}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#181B26] border border-[#252838]">
                    <div className="text-[11px] font-mono text-[#EF4444] uppercase font-semibold mb-1">
                      2. PROBLÈME RÉSOLU
                    </div>
                    <p className="text-white">
                      {selectedBlueprint.problemSolved}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#181B26] border border-[#252838]">
                    <div className="text-[11px] font-mono text-[#10B981] uppercase font-semibold mb-1">
                      3. SOLUTION APPORTÉE
                    </div>
                    <p className="text-white">
                      {selectedBlueprint.solution || selectedBlueprint.concept}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#181B26] border border-[#252838]">
                    <div className="text-[11px] font-mono text-[#A855F7] uppercase font-semibold mb-1">
                      4. PUBLIC CIBLE
                    </div>
                    <p className="text-white">
                      {selectedBlueprint.targetAudience}
                    </p>
                  </div>
                </div>

                {/* 5 Fonctionnalités */}
                <div className="p-5 rounded-2xl bg-[#181B26] border border-[#252838] space-y-3">
                  <div className="text-[11px] font-mono text-[#FF5500] uppercase font-semibold">
                    5. FONCTIONNALITÉS CLÉS (5 PILIERS)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedBlueprint.mainFeatures?.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="p-3 rounded-xl bg-[#1F2332] border border-[#2A2E42] text-xs text-white flex items-start gap-2.5"
                      >
                        <span className="font-mono text-[#FF5500] font-bold">
                          0{fIdx + 1}
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposition de valeur & Modèle économique */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#181B26] border border-[#252838]">
                    <div className="text-[11px] font-mono text-[#EAB308] uppercase font-semibold mb-1">
                      6. PROPOSITION DE VALEUR (USP)
                    </div>
                    <p className="text-white">
                      {selectedBlueprint.uniqueSellingPoint}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#181B26] border border-[#252838]">
                    <div className="text-[11px] font-mono text-[#06B6D4] uppercase font-semibold mb-1">
                      7. MODÈLE ÉCONOMIQUE
                    </div>
                    <p className="text-white">
                      {selectedBlueprint.monetizationIdea}
                    </p>
                  </div>
                </div>

                {/* Roadmap */}
                <div className="p-5 rounded-2xl bg-[#181B26] border border-[#252838] space-y-3">
                  <div className="text-[11px] font-mono text-[#38BDF8] uppercase font-semibold">
                    8. FEUILLE DE ROUTE (ROADMAP)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedBlueprint.developmentRoadmap?.map((step, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3.5 rounded-xl bg-[#1F2332] border border-[#2A2E42] space-y-1.5"
                      >
                        <div className="text-[10px] font-mono text-[#38BDF8]">
                          {step.timeframe}
                        </div>
                        <div className="text-xs font-bold text-white">
                          {step.phase}
                        </div>
                        <p className="text-[11px] text-[#9CA3AF]">
                          {step.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Défi & Pitch 30s */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C1618] to-[#181B26] border border-[#44281E] space-y-3">
                  <div className="text-[11px] font-mono text-[#FF5500] uppercase font-bold">
                    9. DÉFI MAJEUR & PITCH ORAL (30 SECONDES)
                  </div>
                  {selectedBlueprint.mainChallenge && (
                    <div className="text-xs text-[#D1D5DB] pb-2 border-b border-[#2C2123]">
                      <strong className="text-red-400">Défi :</strong>{" "}
                      {selectedBlueprint.mainChallenge}
                    </div>
                  )}
                  {selectedBlueprint.pitch && (
                    <p className="text-sm font-medium text-white italic leading-relaxed">
                      « {selectedBlueprint.pitch} »
                    </p>
                  )}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-5 sm:p-6 border-t border-[#232739] bg-[#11131A] flex items-center justify-between">
                <button
                  onClick={() => {
                    const bp = selectedBlueprint;
                    setSelectedBlueprint(null);
                    onOpenPitch(bp);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6B2B] text-white text-xs font-semibold tracking-wide flex items-center gap-2 shadow-lg shadow-[#FF5500]/20 cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>Ouvrir dans le Coach Pitch</span>
                </button>

                <button
                  onClick={() => setSelectedBlueprint(null)}
                  className="px-5 py-2.5 rounded-xl bg-[#1A1D28] hover:bg-[#242838] text-[#9CA3AF] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
