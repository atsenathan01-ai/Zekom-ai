export type ActiveTab =
  | "home"
  | "create"
  | "creations"
  | "ai"
  | "gamehub"
  | "insights";

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "assistant";
  content: string;
  timestamp: number;
}

export interface ProjectBlueprint {
  id: string;
  projectName: string;
  slogan: string;
  concept: string;
  problemSolved: string;
  solution: string;
  targetAudience: string;
  mainFeatures: string[];
  uniqueSellingPoint: string;
  monetizationIdea: string;
  developmentRoadmap: Array<{
    phase: string;
    timeframe: string;
    description: string;
  }>;
  mainChallenge: string;
  pitch: string;
  visualDirection?: string;
  createdAt: number;
  originalIdea: string;
}

export interface PitchData {
  projectName: string;
  hook: string;
  problem: string;
  solution: string;
  whyNow: string;
  differentiation: string;
  conclusion: string;
  pitch: string;
  whyItMatters?: string;
}

export interface SprintChallenge {
  id: string;
  category: string;
  prompt: string;
  constraint: string;
  rewardScore: number;
}

export interface CreativeDuel {
  id: string;
  theme: string;
  optionA: {
    title: string;
    premise: string;
    vibe: string;
  };
  optionB: {
    title: string;
    premise: string;
    vibe: string;
  };
  critiqueA: string;
  critiqueB: string;
}

export interface UserActivityStats {
  ideasCreated: number;
  aiConversations: number;
  challengesCompleted: number;
  creativeScore: number;
  duelsCompleted: number;
  speedRoundsCompleted: number;
  secretDiscovered: boolean;
  history: Array<{
    type: "idea" | "chat" | "sprint" | "speed" | "duel" | "secret" | "pitch";
    title: string;
    points: number;
    timestamp: number;
  }>;
}

export interface SecretExperimentResponse {
  title: string;
  synthesis: string;
  unspokenTruth: string;
  catalystAction: string;
}

