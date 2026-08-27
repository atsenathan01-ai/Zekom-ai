import { ProjectBlueprint, UserActivityStats, PitchData } from "../types";

const STATS_KEY = "zekrom_user_stats_v1";
const BLUEPRINTS_KEY = "zekrom_blueprints_v1";
const LAST_PITCH_KEY = "zekrom_last_pitch_v1";

const defaultStats: UserActivityStats = {
  ideasCreated: 0,
  aiConversations: 0,
  challengesCompleted: 0,
  creativeScore: 0,
  duelsCompleted: 0,
  speedRoundsCompleted: 0,
  secretDiscovered: false,
  history: [],
};

export function loadActivityStats(): UserActivityStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Échec du chargement des statistiques", e);
    return defaultStats;
  }
}

export function saveActivityStats(stats: UserActivityStats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error("Échec de la sauvegarde des statistiques", e);
  }
}

export function recordActivity(
  type: "idea" | "chat" | "sprint" | "speed" | "duel" | "secret" | "pitch",
  title: string,
  points: number
): UserActivityStats {
  const current = loadActivityStats();
  const updated: UserActivityStats = {
    ...current,
    creativeScore: current.creativeScore + points,
    ideasCreated: type === "idea" ? current.ideasCreated + 1 : current.ideasCreated,
    aiConversations: type === "chat" ? current.aiConversations + 1 : current.aiConversations,
    challengesCompleted:
      type === "sprint" || type === "speed" || type === "duel"
        ? current.challengesCompleted + 1
        : current.challengesCompleted,
    duelsCompleted: type === "duel" ? current.duelsCompleted + 1 : current.duelsCompleted,
    speedRoundsCompleted: type === "speed" ? current.speedRoundsCompleted + 1 : current.speedRoundsCompleted,
    secretDiscovered: type === "secret" ? true : current.secretDiscovered,
    history: [
      {
        type,
        title,
        points,
        timestamp: Date.now(),
      },
      ...current.history.slice(0, 49), // Conserve les 50 dernières entrées
    ],
  };
  saveActivityStats(updated);
  return updated;
}

export function loadSavedBlueprints(): ProjectBlueprint[] {
  try {
    const raw = localStorage.getItem(BLUEPRINTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBlueprint(blueprint: ProjectBlueprint) {
  try {
    const existing = loadSavedBlueprints();
    const updated = [blueprint, ...existing.filter((b) => b.id !== blueprint.id)].slice(0, 30);
    localStorage.setItem(BLUEPRINTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Échec de la sauvegarde du plan", e);
  }
}

export function deleteBlueprint(id: string): ProjectBlueprint[] {
  try {
    const existing = loadSavedBlueprints();
    const updated = existing.filter((b) => b.id !== id);
    localStorage.setItem(BLUEPRINTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Échec de la suppression du plan", e);
    return loadSavedBlueprints();
  }
}


export function saveLastPitch(pitch: PitchData) {
  try {
    localStorage.setItem(LAST_PITCH_KEY, JSON.stringify(pitch));
  } catch (e) {
    console.error("Échec de la sauvegarde du dernier pitch", e);
  }
}

export function loadLastPitch(): PitchData | null {
  try {
    const raw = localStorage.getItem(LAST_PITCH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getRankInfo(score: number) {
  if (score >= 1000)
    return {
      title: "Titan Visionnaire",
      tier: "Rang Élite",
      nextGoal: 2000,
      progress: 100,
      badgeColor: "#FF5500",
    };
  if (score >= 500)
    return {
      title: "Architecte Systèmes",
      tier: "Rang IV",
      nextGoal: 1000,
      progress: Math.min(100, ((score - 500) / 500) * 100),
      badgeColor: "#3B82F6",
    };
  if (score >= 250)
    return {
      title: "Stratège Produit",
      tier: "Rang III",
      nextGoal: 500,
      progress: Math.min(100, ((score - 250) / 250) * 100),
      badgeColor: "#10B981",
    };
  if (score >= 100)
    return {
      title: "Catalyseur de Concepts",
      tier: "Rang II",
      nextGoal: 250,
      progress: Math.min(100, ((score - 100) / 150) * 100),
      badgeColor: "#EAB308",
    };
  return {
    title: "Innovateur Émergent",
    tier: "Rang I",
    nextGoal: 100,
    progress: Math.min(100, (score / 100) * 100),
    badgeColor: "#FF5500",
  };
}
