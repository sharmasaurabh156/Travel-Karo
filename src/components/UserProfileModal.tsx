import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, MapPin, Compass, Train, Utensils, Save, Check, Shield } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(user?.profile || {
    homeCity: 'Bengaluru',
    travelPreference: 'comfort',
    budgetPreference: 'medium',
    preferredTransport: 'train',
    foodPreference: 'vegetarian'
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(profile);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Card Header */}
        <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-slate-900">
              {user.name}
            </h3>
            <p className="text-xs text-slate-500">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-700">
              Role: {user.role}
            </span>
          </div>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Default Origin / Home City
            </label>
            <select
              value={profile.homeCity}
              onChange={(e) => setProfile({ ...profile, homeCity: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
            >
              {['Bengaluru', 'New Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'].map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Budget Tier
              </label>
              <select
                value={profile.budgetPreference}
                onChange={(e) => setProfile({ ...profile, budgetPreference: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="budget">Backpacker / Budget</option>
                <option value="medium">Balanced / Medium</option>
                <option value="luxury">Luxury / Heritage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Travel Style
              </label>
              <select
                value={profile.travelPreference}
                onChange={(e) => setProfile({ ...profile, travelPreference: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="budget">Fast & Budget</option>
                <option value="comfort">Comfort & Leisure</option>
                <option value="adventure">Adventure & Trekking</option>
                <option value="luxury">Royal Experience</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Transit
              </label>
              <select
                value={profile.preferredTransport}
                onChange={(e) => setProfile({ ...profile, preferredTransport: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="train">Train (IRCTC)</option>
                <option value="flight">Flights</option>
                <option value="car">Road Trip / Car</option>
                <option value="bus">AC Sleeper Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Food Preference
              </label>
              <select
                value={profile.foodPreference}
                onChange={(e) => setProfile({ ...profile, foodPreference: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="vegetarian">Pure Vegetarian</option>
                <option value="non_vegetarian">Non-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="jain">Jain Friendly</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center space-x-1.5"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
