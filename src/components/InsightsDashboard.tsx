import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  BarChart3,
  Flame,
  Lightbulb,
  Sparkles,
  Swords,
  Trophy,
  History,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  FolderGit2,
  PieChart,
} from "lucide-react";
import { ProjectBlueprint, UserActivityStats, ActiveTab } from "../types";
import {
  loadActivityStats,
  loadSavedBlueprints,
  getRankInfo,
  saveActivityStats,
} from "../lib/storage";

interface InsightsDashboardProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenPitchFromBlueprint?: (bp: ProjectBlueprint) => void;
}

export default function InsightsDashboard({
  onNavigate,
}: InsightsDashboardProps) {
  const [stats, setStats] = useState<UserActivityStats>(loadActivityStats());
  const [savedBlueprints, setSavedBlueprints] = useState<ProjectBlueprint[]>(
    loadSavedBlueprints()
  );

  useEffect(() => {
    setStats(loadActivityStats());
    setSavedBlueprints(loadSavedBlueprints());
  }, []);

  const rank = getRankInfo(stats.creativeScore);

  const resetAllStats = () => {
    if (
      confirm(
        "Voulez-vous réinitialiser votre activité locale et vos points créatifs ?"
      )
    ) {
      const resetState: UserActivityStats = {
        ideasCreated: 0,
        aiConversations: 0,
        challengesCompleted: 0,
        creativeScore: 0,
        duelsCompleted: 0,
        speedRoundsCompleted: 0,
        secretDiscovered: false,
        history: [],
      };
      saveActivityStats(resetState);
      setStats(resetState);
      localStorage.removeItem("zekrom_blueprints_v1");
      setSavedBlueprints([]);
    }
  };

  const metrics = [
    {
      id: "ideas",
      label: "Idées Créées",
      value: stats.ideasCreated,
      icon: Lightbulb,
      color: "#FF5500",
      bg: "bg-[#FF5500]/10 border-[#FF5500]/20",
    },
    {
      id: "ai",
      label: "Conversations IA",
      value: stats.aiConversations,
      icon: Sparkles,
      color: "#3B82F6",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      id: "challenges",
      label: "Défis Relevés",
      value: stats.challengesCompleted,
      icon: Swords,
      color: "#EF4444",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      id: "score",
      label: "Score Créatif",
      value: stats.creativeScore,
      icon: Flame,
      color: "#EAB308",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  // Distribution calculations
  const totalActions =
    stats.ideasCreated +
    stats.aiConversations +
    stats.challengesCompleted +
    stats.duelsCompleted +
    stats.speedRoundsCompleted || 1;

  const distribution = [
    {
      name: "Création de projets",
      count: stats.ideasCreated,
      pct: Math.round((stats.ideasCreated / totalActions) * 100),
      color: "bg-[#FF5500]",
    },
    {
      name: "Conversations ZEKROM AI",
      count: stats.aiConversations,
      pct: Math.round((stats.aiConversations / totalActions) * 100),
      color: "bg-[#3B82F6]",
    },
    {
      name: "Sprints d'idées",
      count: stats.challengesCompleted,
      pct: Math.round((stats.challengesCompleted / totalActions) * 100),
      color: "bg-[#10B981]",
    },
    {
      name: "Duels d'idées",
      count: stats.duelsCompleted,
      pct: Math.round((stats.duelsCompleted / totalActions) * 100),
      color: "bg-[#8B5CF6]",
    },
    {
      name: "Défis 30s chrono",
      count: stats.speedRoundsCompleted,
      pct: Math.round((stats.speedRoundsCompleted / totalActions) * 100),
      color: "bg-[#EF4444]",
    },
  ];

  const formatHistoryTimestamp = (ts?: number) => {
    if (!ts) return "Récent";
    const diffMin = Math.floor((Date.now() - ts) / 60000);
    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return new Date(ts).toLocaleDateString("fr-FR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-16 space-y-8">
      {/* En-tête */}
      <div className="border-b border-[#202330] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#201D17] border border-[#3A3322] text-xs font-mono uppercase text-[#EAB308] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
            Télémétrie Locale & Performance
          </div>
          <h1
            id="insights-title"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            INSIGHTS
          </h1>
          <p id="insights-subtitle" className="text-base text-[#9CA3AF] mt-1">
            Visualisez votre activité, votre rang créatif et vos projets.
          </p>
        </div>

        <button
          onClick={resetAllStats}
          className="text-xs text-[#6B7280] hover:text-[#D1D5DB] transition-colors flex items-center gap-1.5 p-2.5 rounded-xl bg-[#161821] border border-[#262A3B] w-fit cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser les données de session</span>
        </button>
      </div>

      {/* Grille des 4 Métriques Clés */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.id}
              id={`insight-metric-${m.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-5 rounded-2xl bg-[#161822] border border-[#262A3C] shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-mono uppercase text-[#8E95A8]">
                  {m.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border ${m.bg}`}
                >
                  <Icon className="w-4 h-4" style={{ color: m.color }} />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">
                  {m.value}
                </div>
                <div className="text-[11px] text-[#555C70] mt-0.5">
                  Total cumulé
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Carte du Rang et Progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#161822] to-[#12141A] border border-[#262A3B] space-y-4 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg"
              style={{
                backgroundColor: `${rank.badgeColor}15`,
                borderColor: `${rank.badgeColor}40`,
                color: rank.badgeColor,
              }}
            >
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5500]">
                  {rank.tier}
                </span>
                {stats.secretDiscovered && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono uppercase">
                    Secret Débloqué
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white">{rank.title}</h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-[#8E95A8]">Score Total</div>
            <div className="text-2xl font-bold text-white">
              {stats.creativeScore}{" "}
              <span className="text-xs font-normal text-[#6B7280]">
                / {rank.nextGoal} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Barre de Progression */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs text-[#8E95A8] font-mono">
            <span>Progression du palier</span>
            <span>{Math.round(rank.progress)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#1F2230] overflow-hidden p-0.5 border border-[#2A2E3D]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF5500] to-[#EAB308] transition-all duration-500"
              style={{ width: `${Math.max(5, rank.progress)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Répartition des Activités */}
      <div className="p-6 rounded-3xl bg-[#151720] border border-[#252838] space-y-4">
        <div className="flex items-center justify-between border-b border-[#222532] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white font-semibold">
            <PieChart className="w-4 h-4 text-[#38BDF8]" />
            <span>Répartition de l&apos;Activité Créative</span>
          </div>
          <span className="text-xs font-mono text-[#6B7280]">
            {totalActions > 1 ? `${totalActions} actions` : "En attente"}
          </span>
        </div>

        <div className="space-y-3">
          {distribution.map((d, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs text-[#D1D5DB]">
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${d.color}`} />
                  <span>{d.name}</span>
                </span>
                <span className="font-mono text-[#8E95A8]">
                  {d.count} ({d.pct}%)
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1B1E29] overflow-hidden">
                <div
                  className={`h-full ${d.color} transition-all duration-500`}
                  style={{ width: `${Math.max(d.count > 0 ? 4 : 0, d.pct)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille 2 Colonnes : Créations & Journal d'Activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plans Sauvegardés */}
        <div className="p-6 rounded-3xl bg-[#151720] border border-[#252838] space-y-4">
          <div className="flex items-center justify-between border-b border-[#222532] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white font-semibold">
              <FolderGit2 className="w-4 h-4 text-[#FF5500]" />
              <span>Projets & Créations Récentes</span>
            </div>
            <button
              onClick={() => onNavigate("creations")}
              className="text-xs text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Tout voir ({savedBlueprints.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {savedBlueprints.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="text-xs text-[#6B7280]">
                Aucun projet enregistré pour le moment.
              </div>
              <button
                onClick={() => onNavigate("create")}
                className="text-xs text-[#FF5500] hover:underline cursor-pointer"
              >
                Créer votre premier projet →
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {savedBlueprints.slice(0, 5).map((bp) => (
                <div
                  key={bp.id}
                  className="p-3.5 rounded-2xl bg-[#191C26] border border-[#292D3E] hover:border-[#FF5500]/40 transition-all flex items-center justify-between gap-3"
                >
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">
                      {bp.projectName}
                    </div>
                    <div className="text-xs text-[#8E95A8] truncate mt-0.5">
                      {bp.concept}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate("creations")}
                    className="p-2 rounded-xl bg-[#202434] hover:bg-[#FF5500] hover:text-white text-[#9CA3AF] transition-colors shrink-0 cursor-pointer"
                    title="Voir dans Mes Créations"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flux d'Activité Récente */}
        <div className="p-6 rounded-3xl bg-[#151720] border border-[#252838] space-y-4">
          <div className="flex items-center justify-between border-b border-[#222532] pb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-white font-semibold">
              <History className="w-4 h-4 text-[#3B82F6]" />
              <span>Historique d&apos;Activité</span>
            </div>
            <span className="text-xs font-mono text-[#6B7280]">TEMPS RÉEL</span>
          </div>

          {stats.history.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              Aucune activité enregistrée dans cette session.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {stats.history.slice(0, 8).map((h, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-[#181B26] border border-[#262A3B] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] shrink-0" />
                    <span className="text-[#D1D5DB] truncate font-medium">
                      {h.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[10px] text-[#6B7280]">
                      {formatHistoryTimestamp(h.timestamp)}
                    </span>
                    <span className="font-mono text-[11px] text-[#EAB308] font-bold">
                      +{h.points} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
