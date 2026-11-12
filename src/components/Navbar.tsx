import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSaved } from '../context/SavedContext';
import { 
  Compass, 
  Search, 
  Heart, 
  MapPin, 
  Calendar, 
  Luggage, 
  Music, 
  Flame, 
  Building2, 
  Utensils, 
  User, 
  LogOut, 
  Shield, 
  Menu, 
  X,
  Sparkles,
  Train
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  onTabChange, 
  onOpenSearch, 
  onOpenProfile 
}) => {
  const { user, logout, openAuthModal, loginAsDemo } = useAuth();
  const { savedItems } = useSaved();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore India', icon: Compass },
    { id: 'transport', label: 'Transport', icon: Train },
    { id: 'hotels', label: 'Hotels', icon: Building2 },
    { id: 'restaurants', label: 'Food & Dining', icon: Utensils },
    { id: 'festivals', label: 'Festivals', icon: Flame },
    { id: 'trips', label: 'My Trips', icon: Luggage },
    { id: 'playlists', label: 'Music', icon: Music },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center space-x-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl tracking-tight text-slate-900">
                TRAVEL <span className="text-teal-600">SAATHI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200">
                India
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide">
              Discover • Compare • Plan • Travel
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-amber-100 text-amber-900'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center space-x-2.5">
          {/* Quick Search Button */}
          <button
            id="global-search-trigger"
            onClick={onOpenSearch}
            className="flex items-center space-x-2 bg-slate-100/90 hover:bg-slate-200/80 text-slate-600 px-3.5 py-2 rounded-full text-xs font-medium transition-colors cursor-pointer border border-slate-200/60"
            title="Search destinations, attractions, festivals"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Search India...</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </button>

          {/* Saved Items Favorite Button */}
          <button
            id="saved-items-nav-btn"
            onClick={() => onTabChange('saved')}
            className={`relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors ${
              activeTab === 'saved' ? 'bg-teal-50 text-teal-700' : ''
            }`}
            title="Saved places & favorites"
          >
            <Heart className={`w-5 h-5 ${savedItems.length > 0 ? 'text-red-500 fill-red-500/20' : 'text-slate-600'}`} />
            {savedItems.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {savedItems.length}
              </span>
            )}
          </button>

          {/* User Profile / Login Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 pl-2.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
              >
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-teal-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                      Role: {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile & Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onTabChange('trips');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <Luggage className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Planned Trips</span>
                  </button>

                  {user.role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onTabChange('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center space-x-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => openAuthModal('login')}
                className="text-xs font-bold text-slate-700 hover:text-teal-700 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="text-xs font-bold text-white bg-slate-900 hover:bg-teal-700 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all active:scale-95"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onTabChange(link.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}

          {!user && (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <p className="text-xs font-semibold text-slate-400 px-2">Quick Demo Access</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    loginAsDemo('user');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2 bg-slate-100 hover:bg-teal-50 text-slate-800 rounded-xl text-xs font-bold text-center"
                >
                  Demo Traveller
                </button>
                <button
                  onClick={() => {
                    loginAsDemo('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold text-center"
                >
                  Demo Admin
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
