import { ActiveTab } from "../types";
import {
  Sparkles,
  Compass,
  Lightbulb,
  Swords,
  BarChart3,
  FolderGit2,
} from "lucide-react";

interface MobileNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const items: { id: ActiveTab; label: string; icon: any }[] = [
    { id: "home", label: "Aperçu", icon: Compass },
    { id: "ai", label: "IA", icon: Sparkles },
    { id: "create", label: "Créer", icon: Lightbulb },
    { id: "creations", label: "Projets", icon: FolderGit2 },
    { id: "gamehub", label: "Jeux", icon: Swords },
    { id: "insights", label: "Stats", icon: BarChart3 },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#11131A]/95 backdrop-blur-lg border-t border-[#232632] px-1 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-xs transition-colors relative min-w-[48px] cursor-pointer ${
                isActive ? "text-[#FF5500]" : "text-[#8E95A5] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-[#FF5500]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
