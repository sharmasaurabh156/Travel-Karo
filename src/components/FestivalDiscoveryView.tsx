import React, { useState, useEffect } from 'react';
import { Festival, Destination } from '../types';
import { api } from '../lib/api';
import { useSaved } from '../context/SavedContext';
import { 
  Flame, 
  Calendar, 
  MapPin, 
  Heart, 
  Users, 
  Sparkles, 
  ArrowRight, 
  X,
  Clock,
  Ticket
} from 'lucide-react';

interface FestivalDiscoveryViewProps {
  destinations: Destination[];
  onPlanTripToFestival: (festival: Festival) => void;
}

export const FestivalDiscoveryView: React.FC<FestivalDiscoveryViewProps> = ({
  destinations,
  onPlanTripToFestival
}) => {
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isSaved, toggleSave } = useSaved();

  useEffect(() => {
    async function loadFestivals() {
      setIsLoading(true);
      try {
        const res = await api.getFestivals();
        setFestivals(res.festivals || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadFestivals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-amber-950 via-orange-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-1.5 bg-orange-500/20 text-orange-300 border border-orange-500/30 px-3.5 py-1 rounded-full text-xs font-bold mb-3">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Incredible India Cultural Calendar</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
            Vibrant Indian Festivals & Celebrations
          </h1>
          <p className="text-sm sm:text-base text-orange-200/80 mt-2">
            Experience the colors, spirituality, folk music, and sacred rituals across Rajasthan, Varanasi, Bengal, Kerala, and Ladakh.
          </p>
        </div>
      </div>

      {/* Grid of Festivals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {festivals.map((fest) => {
          const saved = isSaved('festival', fest.id);
          return (
            <div
              key={fest.id}
              onClick={() => setSelectedFestival(fest)}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Image */}
                <div className="relative h-52 w-full bg-slate-100 overflow-hidden">
                  <img 
                    src={fest.heroImage} 
                    alt={fest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />

                  {/* Month Pill */}
                  <div className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-orange-600" />
                    <span>{fest.typicalMonth}</span>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave('festival', fest.id, fest);
                    }}
                    className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-500 shadow-sm"
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                  </button>

                  {/* Crowd Level */}
                  <div className="absolute bottom-3 left-3.5 bg-black/60 backdrop-blur-md text-white font-medium text-[11px] px-2.5 py-0.5 rounded-full flex items-center">
                    <Users className="w-3 h-3 mr-1 text-orange-300" />
                    <span>Crowd: {fest.expectedCrowd}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 group-hover:text-orange-600 transition-colors">
                        {fest.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-orange-600 flex-shrink-0" />
                        {fest.city}, {fest.state}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {fest.culturalSignificance}
                  </p>

                  {/* Key Rituals */}
                  <div className="mt-3">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Key Highlights:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {fest.rituals.slice(0, 3).map((rit, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-orange-50 text-orange-800 px-2 py-0.5 rounded-md">
                          {rit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlanTripToFestival(fest);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Plan Trip to {fest.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && festivals.length === 0 && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center">
          <Flame className="mx-auto mb-3 h-8 w-8 text-orange-500" />
          <p className="font-bold text-slate-800">Festival information is unavailable right now.</p>
          <p className="mt-1 text-sm text-slate-500">Please try again in a little while.</p>
        </div>
      )}

      {isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-label="Loading festivals">
          {[1, 2, 3].map(index => (
            <div key={index} className="h-80 animate-pulse rounded-3xl border border-slate-100 bg-white" />
          ))}
        </div>
      )}

      {selectedFestival && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setSelectedFestival(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="festival-detail-title"
            className="my-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="relative h-56 flex-shrink-0 bg-slate-900 sm:h-72">
              <img
                src={selectedFestival.heroImage}
                alt={selectedFestival.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <button
                type="button"
                onClick={() => setSelectedFestival(null)}
                aria-label="Close festival details"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-5 right-5 text-white sm:left-7 sm:right-7">
                <p className="mb-1 flex items-center text-sm font-semibold text-orange-200">
                  <MapPin className="mr-1.5 h-4 w-4" />
                  {selectedFestival.city}, {selectedFestival.state}
                </p>
                <h2 id="festival-detail-title" className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold sm:text-3xl">
                  {selectedFestival.name}
                </h2>
              </div>
            </div>

            <div className="overflow-y-auto p-5 sm:p-7">
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
                <span className="flex items-center rounded-full bg-orange-50 px-3 py-1.5 text-orange-800">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  {selectedFestival.typicalMonth} · {selectedFestival.upcomingDateText}
                </span>
                <span className="flex items-center rounded-full bg-slate-100 px-3 py-1.5">
                  <Users className="mr-1.5 h-3.5 w-3.5 text-orange-600" />
                  {selectedFestival.expectedCrowd} crowd
                </span>
                <span className="flex items-center rounded-full bg-slate-100 px-3 py-1.5">
                  <Clock className="mr-1.5 h-3.5 w-3.5 text-orange-600" />
                  {selectedFestival.recommendedDuration}
                </span>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                {selectedFestival.culturalSignificance}
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 flex items-center font-bold text-slate-900">
                    <Sparkles className="mr-2 h-4 w-4 text-orange-600" />
                    Rituals & highlights
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {selectedFestival.rituals.map(ritual => (
                      <li key={ritual} className="flex items-start">
                        <span className="mr-2 text-orange-500">•</span>
                        {ritual}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center font-bold text-slate-900">
                    <MapPin className="mr-2 h-4 w-4 text-orange-600" />
                    Nearby attractions
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {selectedFestival.nearbyAttractions.map(attraction => (
                      <li key={attraction} className="flex items-start">
                        <span className="mr-2 text-orange-500">•</span>
                        {attraction}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {selectedFestival.travelTips.length > 0 && (
                <div className="mt-6 rounded-2xl bg-amber-50 p-4">
                  <h3 className="mb-2 flex items-center font-bold text-amber-950">
                    <Ticket className="mr-2 h-4 w-4" />
                    Travel tips
                  </h3>
                  <ul className="space-y-1.5 text-sm text-amber-900">
                    {selectedFestival.travelTips.map(tip => (
                      <li key={tip}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  onPlanTripToFestival(selectedFestival);
                  setSelectedFestival(null);
                }}
                className="mt-6 flex w-full items-center justify-center space-x-2 rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                <span>Plan a trip to {selectedFestival.name}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      )}

    </div>
  );
};
