import React, { useState, useEffect } from 'react';
import { AdminStats, Destination } from '../types';
import { api } from '../lib/api';
import { 
  Shield, 
  Users, 
  Luggage, 
  MapPin, 
  Search, 
  Plus, 
  Trash2, 
  IndianRupee, 
  Check, 
  BarChart3, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface AdminDashboardProps {
  destinations: Destination[];
  onRefreshDestinations: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ destinations, onRefreshDestinations }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDestModal, setShowAddDestModal] = useState(false);
  const [newDest, setNewDest] = useState<Partial<Destination>>({
    name: '',
    state: '',
    category: 'Nature',
    description: '',
    heroImage: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    startingPrice: 12000,
    durationDays: 4,
    bestSeason: 'Oct - Mar',
    rating: 4.8,
    reviewCount: 450,
    highlights: ['Scenic viewpoints', 'Local culinary tour', 'Heritage walks'],
    tags: ['Scenic', 'Trending'],
    suitableFor: ['couples', 'family']
  });

  const loadStats = async () => {
    try {
      const res = await api.getAdminStats();
      setStats(res.stats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest.name || !newDest.state) return;
    try {
      await api.createAdminDestination(newDest);
      setShowAddDestModal(false);
      onRefreshDestinations();
      loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    if (!confirm('Are you sure you want to remove this destination from Travel Saathi?')) return;
    try {
      await api.deleteAdminDestination(id);
      onRefreshDestinations();
      loadStats();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Admin Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Administrator Control Hub</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl">
            Travel Saathi Intelligence & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time tracking of traveler search trends, group budgets, and destination catalog management.
          </p>
        </div>

        <button
          onClick={() => setShowAddDestModal(true)}
          className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Destination</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">{stats.totalUsers}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Active platform accounts</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Trips</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Luggage className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">{stats.totalTrips}</p>
            <p className="text-[11px] text-teal-600 font-semibold mt-1">Live day-by-day itineraries</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destinations</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">{stats.totalDestinations}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Across 18 Indian states</p>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Planned Value</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">₹{(stats.totalTrips * 32400).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">Estimated group travel spend</p>
          </div>

        </div>
      )}

      {/* Top Search Trends & Insights */}
      {stats && stats.popularSearches && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs mb-8">
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-teal-600" />
            <span>Top Searched Terms & Travel Interests</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.popularSearches.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800">
                <span className="capitalize">{item.term}</span>
                <span className="bg-teal-100 text-teal-800 text-[10px] px-2 py-0.5 rounded-full">
                  {item.count} searches
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Destinations Management Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-4">
          Manage Destination Inventory ({destinations.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Starting Price</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {destinations.map((dest) => (
                <tr key={dest.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 flex items-center space-x-3">
                    <img src={dest.heroImage} alt={dest.name} className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-slate-900">{dest.name}</p>
                      <p className="text-[11px] text-slate-400">{dest.durationDays} Days</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold">{dest.state}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800">
                      {dest.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold">₹{dest.startingPrice.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">★ {dest.rating}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDeleteDestination(dest.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Destination Modal */}
      {showAddDestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-4">
              Add New India Destination
            </h3>
            <form onSubmit={handleCreateDestination} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination Name</label>
                <input
                  type="text"
                  required
                  value={newDest.name}
                  onChange={(e) => setNewDest({ ...newDest, name: e.target.value })}
                  placeholder="e.g., Coorg (Kodagu)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newDest.state}
                    onChange={(e) => setNewDest({ ...newDest, state: e.target.value })}
                    placeholder="e.g., Karnataka"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={newDest.category}
                    onChange={(e) => setNewDest({ ...newDest, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="Beaches">Beaches</option>
                    <option value="Mountains">Mountains</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Nature">Nature</option>
                    <option value="Wildlife">Wildlife</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  value={newDest.description}
                  onChange={(e) => setNewDest({ ...newDest, description: e.target.value })}
                  placeholder="Overview of this travel destination..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Starting Price (₹)</label>
                  <input
                    type="number"
                    value={newDest.startingPrice}
                    onChange={(e) => setNewDest({ ...newDest, startingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={newDest.durationDays}
                    onChange={(e) => setNewDest({ ...newDest, durationDays: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddDestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm"
                >
                  Save Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
