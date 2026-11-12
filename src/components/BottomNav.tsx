import React from 'react';
import { Home, Compass, Luggage, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenProfile }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'trips', label: 'Trips', icon: Luggage },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.08)] border-t border-slate-100 rounded-t-3xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id === 'profile') {
                onOpenProfile();
              } else {
                onTabChange(tab.id);
              }
            }}
            className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-full transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-[#6df5e1] text-[#006b5f] font-bold shadow-sm'
                : 'text-slate-500 hover:text-teal-700 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[11px] mt-0.5 tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
