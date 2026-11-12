import React, { useState, useEffect } from 'react';
import { Trip, TripDay, TripActivity, Destination } from '../types';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Trash2, 
  Archive, 
  CheckCircle2, 
  Circle, 
  Clock, 
  IndianRupee, 
  Navigation, 
  Sparkles, 
  PartyPopper, 
  AlertTriangle, 
  Compass, 
  Utensils, 
  Building2, 
  Share2, 
  ArrowRight,
  Map as MapIcon,
  Check
} from 'lucide-react';
import { InteractiveMapView } from './InteractiveMapView';

interface TripPlannerViewProps {
  destinations: Destination[];
  initialTrip?: Trip | null;
  onOpenCreateTripModal?: () => void;
  onExploreDestinations?: () => void;
}

export const TripPlannerView: React.FC<TripPlannerViewProps> = ({ 
  destinations, 
  initialTrip,
  onOpenCreateTripModal,
  onExploreDestinations 
}) => {
  const { user, openAuthModal } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(initialTrip || null);
  const [activeDayNumber, setActiveDayNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [showMapViewModal, setShowMapViewModal] = useState(false);

  useEffect(() => {
    if (initialTrip) {
      setSelectedTrip(initialTrip);
      setActiveDayNumber(1);
    }
  }, [initialTrip]);

  // New Activity Form State
  const [newActivity, setNewActivity] = useState<{
    time: string;
    placeName: string;
    category: 'hotel' | 'attraction' | 'restaurant' | 'travel' | 'custom';
    durationMinutes: number;
    estimatedCost: number;
    notes: string;
  }>({
    time: '02:00 PM',
    placeName: '',
    category: 'attraction',
    durationMinutes: 90,
    estimatedCost: 300,
    notes: ''
  });

  const loadTrips = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getTrips();
      setTrips(res.trips || []);
      if (res.trips && res.trips.length > 0 && !selectedTrip) {
        setSelectedTrip(res.trips[0]);
      } else if (selectedTrip) {
        const updated = res.trips.find(t => t.id === selectedTrip.id);
        if (updated) setSelectedTrip(updated);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [user]);

  // Calculate Progress Stats
  const calculateTripProgress = (trip: Trip) => {
    let total = 0;
    let completed = 0;
    trip.days.forEach(day => {
      day.activities.forEach(act => {
        total++;
        if (act.completed) completed++;
      });
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const handleToggleActivity = async (tripId: string, activityId: string, currentCompleted: boolean) => {
    try {
      const res = await api.toggleActivity(tripId, activityId, !currentCompleted);
      
      // Update local state immediately
      setSelectedTrip(res.trip);
      setTrips(prev => prev.map(t => t.id === tripId ? res.trip : t));

      // If user reached 100% completion, trigger celebratory confetti!
      if (res.completedCount === res.totalCount && res.totalCount > 0) {
        triggerConfetti();
        setShowCompletionModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleDeleteTrip = async (id: string) => {
    try {
      await api.deleteTrip(id);
      setTrips(prev => prev.filter(t => t.id !== id));
      if (selectedTrip?.id === id) {
        const remaining = trips.filter(t => t.id !== id);
        setSelectedTrip(remaining[0] || null);
      }
      setShowDeleteConfirm(false);
      setIsDeleting(null);
    } catch (err) {
      console.error('Failed to delete trip:', err);
    }
  };

  const handleArchiveTrip = async (trip: Trip) => {
    try {
      const updated = await api.updateTrip(trip.id, { status: 'archived' });
      setSelectedTrip(updated.trip);
      setTrips(prev => prev.map(t => t.id === trip.id ? updated.trip : t));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip || !newActivity.placeName.trim()) return;

    const currentDays = [...selectedTrip.days];
    const targetDayIndex = currentDays.findIndex(d => d.dayNumber === activeDayNumber);
    if (targetDayIndex === -1) return;

    const newActItem: TripActivity = {
      id: `act-custom-${Date.now()}`,
      time: newActivity.time,
      placeName: newActivity.placeName,
      category: newActivity.category,
      durationMinutes: Number(newActivity.durationMinutes) || 60,
      estimatedCost: Number(newActivity.estimatedCost) || 0,
      distanceKm: 2.5,
      notes: newActivity.notes,
      completed: false
    };

    currentDays[targetDayIndex].activities.push(newActItem);

    try {
      const res = await api.updateTrip(selectedTrip.id, { days: currentDays });
      setSelectedTrip(res.trip);
      setTrips(prev => prev.map(t => t.id === selectedTrip.id ? res.trip : t));
      setShowAddActivityModal(false);
      setNewActivity({
        time: '02:00 PM',
        placeName: '',
        category: 'attraction',
        durationMinutes: 90,
        estimatedCost: 300,
        notes: ''
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">
          Plan & Track Your Indian Journeys
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
          Sign in to create customized day-by-day itineraries, compare group budgets, and tick off completed places live on your trip!
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="bg-slate-900 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          Sign In to Access Trips
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded-full w-48 mx-auto"></div>
          <div className="h-4 bg-slate-100 rounded-full w-72 mx-auto"></div>
          <div className="h-64 bg-slate-100 rounded-3xl max-w-4xl mx-auto"></div>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-100 shadow-sm">
          <Calendar className="w-10 h-10" />
        </div>
        <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">
          No Trips Planned Yet
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-2 mb-6">
          Select any trending destination or festival in India to automatically generate a day-wise itinerary with route map and music!
        </p>
        {onExploreDestinations && (
          <button
            onClick={onExploreDestinations}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center space-x-2 mx-auto"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Destinations to Plan</span>
          </button>
        )}
      </div>
    );
  }

  const activeDay = selectedTrip?.days.find(d => d.dayNumber === activeDayNumber) || selectedTrip?.days[0];
  const progress = selectedTrip ? calculateTripProgress(selectedTrip) : { total: 0, completed: 0, percentage: 0 };

  return (
    <div id="trip-planner-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Trip Selector Bar & Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {selectedTrip?.name}
            </h1>
            <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
              selectedTrip?.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
              selectedTrip?.status === 'archived' ? 'bg-slate-100 text-slate-700' :
              'bg-teal-100 text-teal-800'
            }`}>
              {selectedTrip?.status}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600" />
              {selectedTrip?.destinationName}
            </span>
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {selectedTrip?.startDate} to {selectedTrip?.endDate} ({selectedTrip?.durationDays} Days)
            </span>
            <span className="flex items-center">
              <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {selectedTrip?.travellersCount} People ({selectedTrip?.travelGroup.name})
            </span>
          </p>
        </div>

        {/* Trips Switcher dropdown & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {trips.length > 1 && (
            <select
              value={selectedTrip?.id}
              onChange={(e) => {
                const found = trips.find(t => t.id === e.target.value);
                if (found) {
                  setSelectedTrip(found);
                  setActiveDayNumber(1);
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => setShowMapViewModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors"
          >
            <MapIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Interactive Route Map</span>
          </button>

          {selectedTrip && selectedTrip.status !== 'archived' && (
            <button
              onClick={() => handleArchiveTrip(selectedTrip)}
              className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
              title="Archive Trip"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              if (selectedTrip) {
                setIsDeleting(selectedTrip.id);
                setShowDeleteConfirm(true);
              }
            }}
            className="p-2 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
            title="Delete Trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Live Tracking Card */}
      {selectedTrip && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-300" />
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-teal-200 uppercase tracking-wider">
                  Live Trip Progress
                </span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-white mt-1">
                {progress.percentage}% Completed
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {progress.completed} of {progress.total} activities and places visited
              </p>
            </div>

            {/* Progress Bar Visual */}
            <div className="w-full sm:w-72">
              <div className="w-full bg-slate-700/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                <div 
                  className="bg-[#6df5e1] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress.percentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-teal-200 mt-1 font-semibold">
                <span>Start</span>
                <span>{progress.completed}/{progress.total} done</span>
                <span>Finished 🎉</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day-by-Day Itinerary Layout */}
      {selectedTrip && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Day Tabs Sidebar */}
          <div className="lg:col-span-1 space-y-2.5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              Trip Timeline ({selectedTrip.durationDays} Days)
            </p>

            {selectedTrip.days.map((day) => {
              const dayCompletedCount = day.activities.filter(a => a.completed).length;
              const isDayActive = day.dayNumber === activeDayNumber;

              return (
                <button
                  key={day.id}
                  onClick={() => setActiveDayNumber(day.dayNumber)}
                  className={`w-full text-left p-4 rounded-2xl transition-all border ${
                    isDayActive
                      ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/10'
                      : 'bg-white/80 hover:bg-white border-slate-200/80 text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {day.date.slice(5)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">{day.title}</p>
                  
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{day.activities.length} Stops</span>
                    <span className={`font-bold ${dayCompletedCount === day.activities.length && day.activities.length > 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                      {dayCompletedCount}/{day.activities.length} Visited
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Cost Breakdown Widget */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mt-6">
              <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs text-slate-900 uppercase tracking-wider mb-2">
                Estimated Trip Budget
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Transport:</span>
                  <span className="font-bold text-slate-800">
                    ₹{(selectedTrip.transportSelected?.totalCost || 4800).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stay & Activities:</span>
                  <span className="font-bold text-slate-800">
                    ₹{(selectedTrip.totalEstimatedCost - (selectedTrip.transportSelected?.totalCost || 4800)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-teal-800">
                  <span>Total (per person):</span>
                  <span>₹{selectedTrip.perPersonCost.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Day Activities List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900">
                    Day {activeDay?.dayNumber}: {activeDay?.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click checkboxes as you complete each attraction and meal!
                  </p>
                </div>

                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Activity</span>
                </button>
              </div>

              {/* Activities Timeline */}
              {activeDay && activeDay.activities.length > 0 ? (
                <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:pointer-events-none">
                  {activeDay.activities.map((act) => {
                    return (
                      <div
                        key={act.id}
                        className={`relative flex items-start space-x-4 p-4 rounded-2xl border transition-all ${
                          act.completed
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {/* Checkbox Button */}
                        <button
                          onClick={() => handleToggleActivity(selectedTrip.id, act.id, act.completed)}
                          className={`z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 ${
                            act.completed
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-white border-2 border-slate-300 hover:border-teal-500 text-transparent'
                          }`}
                          title={act.completed ? 'Mark as pending' : 'Mark as visited'}
                        >
                          <Check className="w-5 h-5 stroke-[3]" />
                        </button>

                        {/* Content */}
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-['Plus_Jakarta_Sans'] font-bold text-base ${
                                act.completed ? 'text-slate-500 line-through' : 'text-slate-900'
                              }`}>
                                {act.placeName}
                              </h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                act.category === 'hotel' ? 'bg-blue-100 text-blue-800' :
                                act.category === 'restaurant' ? 'bg-orange-100 text-orange-800' :
                                act.category === 'attraction' ? 'bg-teal-100 text-teal-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {act.category}
                              </span>
                            </div>

                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                              {act.time}
                            </span>
                          </div>

                          {act.notes && (
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              {act.notes}
                            </p>
                          )}

                          <div className="flex items-center space-x-4 mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                            <span className="flex items-center font-medium">
                              <Clock className="w-3 h-3 mr-1 text-slate-400" />
                              {act.durationMinutes} mins
                            </span>
                            {act.estimatedCost > 0 && (
                              <span className="flex items-center font-medium">
                                <IndianRupee className="w-3 h-3 mr-0.5 text-slate-400" />
                                ₹{act.estimatedCost.toLocaleString('en-IN')}
                              </span>
                            )}
                            {act.completed && (
                              <span className="text-emerald-700 font-bold ml-auto flex items-center">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                Visited ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm font-semibold text-slate-600">No activities scheduled for this day</p>
                  <button
                    onClick={() => setShowAddActivityModal(true)}
                    className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 underline"
                  >
                    + Add your first activity
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900">
              Delete Trip Itinerary?
            </h3>
            <p className="text-xs text-slate-500 mt-2 mb-6">
              Are you sure? This will permanently delete this trip, group details, and all logged progress.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setIsDeleting(null);
                }}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => isDeleting && handleDeleteTrip(isDeleting)}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trip Completed 🎉 Modal */}
      {showCompletionModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <PartyPopper className="w-8 h-8" />
            </div>

            <h3 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900">
              Trip Completed! 🎉
            </h3>
            <p className="text-xs text-slate-600 mt-2 mb-6">
              Congratulations! You visited all planned attractions and dining destinations in <strong>{selectedTrip.destinationName}</strong>!
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-700 space-y-2 mb-6 text-left">
              <div className="flex justify-between">
                <span>Total Days:</span>
                <span className="font-bold">{selectedTrip.durationDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span>Activities Checked:</span>
                <span className="font-bold">{progress.total} Places</span>
              </div>
              <div className="flex justify-between">
                <span>Total Group Spend:</span>
                <span className="font-bold text-teal-800">₹{selectedTrip.totalEstimatedCost.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  handleArchiveTrip(selectedTrip);
                  setShowCompletionModal(false);
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                Archive to Travel Memories
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Keep Active
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Activity Modal */}
      {showAddActivityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 mb-1">
              Add Activity to Day {activeDayNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a landmark, beach shack, cafe, or custom stop to your itinerary.
            </p>

            <form onSubmit={handleAddActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Place / Activity Name
                </label>
                <input
                  type="text"
                  required
                  value={newActivity.placeName}
                  onChange={(e) => setNewActivity({ ...newActivity, placeName: e.target.value })}
                  placeholder="e.g., Chapora Fort Sunset, Thalassa Cafe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={newActivity.time}
                    onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                    placeholder="04:30 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newActivity.category}
                    onChange={(e) => setNewActivity({ ...newActivity, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-800 outline-none"
                  >
                    <option value="attraction">Attraction</option>
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="hotel">Hotel</option>
                    <option value="travel">Travel</option>
                    <option value="custom">Custom Leisure</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Notes & Highlights
                </label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  placeholder="Tips, ticket booking requirements, photography spots..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddActivityModal(false)}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Map Modal */}
      {showMapViewModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full h-[80vh] shadow-2xl border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-2">
                <MapIcon className="w-5 h-5 text-teal-600" />
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900">
                  {selectedTrip.destinationName} Itinerary Route Map
                </span>
              </div>
              <button
                onClick={() => setShowMapViewModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="flex-grow w-full h-full">
              <InteractiveMapView 
                destinationName={selectedTrip.destinationName}
                activities={activeDay?.activities || []}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
