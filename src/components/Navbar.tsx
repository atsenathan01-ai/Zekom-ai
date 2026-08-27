import { ActiveTab } from "../types";
import {
  Sparkles,
  Compass,
  Lightbulb,
  Swords,
  BarChart3,
  Flame,
  FolderGit2,
  Trophy,
} from "lucide-react";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSecretMode: () => void;
  onOpenPresentation?: () => void;
  creativeScore: number;
}

export default function Navbar({
  activeTab,
  onTabChange,
  onOpenSecretMode,
  onOpenPresentation,
  creativeScore,
}: NavbarProps) {
  const navItems: { id: ActiveTab; label: string; icon: any; color: string }[] = [
    { id: "home", label: "Aperçu", icon: Compass, color: "#9CA3AF" },
    { id: "ai", label: "AI", icon: Sparkles, color: "#3B82F6" },
    { id: "create", label: "CREATE", icon: Lightbulb, color: "#FF5500" },
    { id: "creations", label: "Mes Créations", icon: FolderGit2, color: "#10B981" },
    { id: "gamehub", label: "Game Hub", icon: Swords, color: "#EF4444" },
    { id: "insights", label: "Insights", icon: BarChart3, color: "#EAB308" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#202330] bg-[#101116]/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Marque */}
        <div className="flex items-center gap-6 lg:gap-8">
          <button
            id="nav-brand-logo"
            onClick={() => onTabChange("home")}
            className="group flex items-center gap-2.5 text-left focus:outline-none cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#181A22] border border-[#272B3A] flex items-center justify-center font-black text-white text-sm group-hover:border-[#FF5500]/60 transition-colors shadow-sm">
              <span className="text-[#FF5500]">Z</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-[#FF5500] transition-colors">
                ZEKROM
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-mono tracking-widest text-[#6B7280]">
                V4
              </span>
            </div>
          </button>

          {/* Navigation Bureau */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onTabChange(item.id)}
                  className={`relative px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 focus:outline-none cursor-pointer ${
                    isActive
                      ? "text-white bg-[#191B24] border border-[#2B2F40] shadow-sm"
                      : "text-[#8E95A8] hover:text-white hover:bg-[#151720] border border-transparent"
                  }`}
                >
                  <Icon
                    className="w-3.5 h-3.5 transition-colors"
                    style={{ color: isActive ? "#FF5500" : item.color }}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Score & Actions secondaires */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bouton Mode Jury */}
          {onOpenPresentation && (
            <button
              id="presentation-mode-trigger-btn"
              onClick={onOpenPresentation}
              className="px-3 py-1.5 rounded-xl bg-[#181A24] hover:bg-[#202332] text-[#D1D5DB] hover:text-white border border-[#272B3C] hover:border-[#FF5500]/50 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Lancer l'expérience interactive MODE JURY"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FF5500]" />
              <span className="hidden sm:inline">MODE JURY</span>
            </button>
          )}

          {/* Badge Score Créatif */}
          <button
            id="nav-score-indicator"
            onClick={() => onTabChange("insights")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#151720] border border-[#242838] text-xs text-[#D1D5DB] hover:border-[#FF5500]/50 transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="font-semibold">{creativeScore}</span>
            <span className="hidden sm:inline text-[#6B7280]">PTS</span>
          </button>

          {/* Déclencheur secret discret "•••" */}
          <button
            id="secret-mode-trigger-btn"
            onClick={onOpenSecretMode}
            title="Secret Mode // Protocole Confidentiel"
            className="px-2.5 h-7.5 rounded-xl flex items-center justify-center text-[#8E95A8] hover:text-[#FF5500] bg-[#151720] hover:bg-[#1A1D28] border border-[#242838] hover:border-[#FF5500]/40 transition-all cursor-pointer"
            aria-label="Ouvrir le Mode Secret"
          >
            <span className="font-mono text-xs tracking-wider">•••</span>
          </button>
        </div>
      </div>
    </header>
  );
}
