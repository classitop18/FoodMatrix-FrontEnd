import React from "react";
import { ArrowRight } from "lucide-react";

type TabItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

interface NavigationMenuProps {
  items: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  items,
  activeTab,
  onChange,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-white/50">
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all duration-300 group
                ${
                  isActive
                    ? "bg-[#3d326d] text-white shadow-lg shadow-[#3d326d]/20"
                    : "text-gray-500 hover:bg-[#F3F0FD] hover:text-[#3d326d]"
                }
              `}
            >
              <Icon
                size={20}
                className={`transition-colors duration-300 ${
                  isActive
                    ? "text-[#7dab4f]"
                    : "group-hover:text-[#7661d3]"
                }`}
              />

              {item.label}

              {isActive && (
                <ArrowRight size={16} className="ml-auto opacity-70" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationMenu;
