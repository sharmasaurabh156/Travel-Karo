import React, { useState, useEffect } from 'react';
import { Attraction, Destination, Hotel, Restaurant, Festival } from '../types';
import { api } from '../lib/api';
import { useSaved } from '../context/SavedContext';
import { 
  X, 
  MapPin, 
  Star, 
  Heart, 
  Calendar, 
  Compass, 
  Building2, 
  Utensils, 
  CloudSun, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Flame,
  Train,
  ExternalLink
} from 'lucide-react';
import { InteractiveMapView } from './InteractiveMapView';
import {
  AttractionCard,
  DetailEmptyState,
  ExperienceCard,
  FoodExperienceCard,
  getExperienceSection,
  HotelCard,
  RestaurantCard,
  DestinationRoutePanel
} from './DestinationDetailCards';

type DestinationDetailTab = 'overview' | 'attractions' | 'hotels' | 'food' | 'map';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanTrip: (dest: Destination) => void;
  onCompareTransport: (dest: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
  onPlanTrip,
  onCompareTransport
}) => {
  const [details, setDetails] = useState<{
    destination: Destination;
    attractions: Attraction[];
    hotels: Hotel[];
    restaurants: Restaurant[];
    festivals: Festival[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState(false);
  const [activeTab, setActiveTab] = useState<DestinationDetailTab>('overview');
  const { isSaved, toggleSave } = useSaved();

  useEffect(() => {
    if (!destination) {
      setDetails(null);
      return;
    }

    let isCurrent = true;
    setDetails(null);
    setDetailsError(false);
    setActiveTab('overview');
    setIsLoading(true);
    api.getDestination(destination.slug || destination.id)
      .then(result => {
        if (isCurrent) setDetails(result);
      })
      .catch(error => {
        console.error(error);
        if (isCurrent) setDetailsError(true);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [destination]);

  if (!destination) return null;
  const saved = isSaved('destination', destination.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero Banner Header */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 flex-shrink-0">
          <img 
            src={destination.heroImage} 
            alt={destination.name}
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <span className="bg-[#6df5e1] text-[#006b5f] text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm">
              {destination.category}
            </span>

            <div className="flex items-center space-x-2">
              {destination.photoSourceUrl && (
                <a
                  href={destination.photoSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Browse ${destination.name} photos`}
                  title={`Browse ${destination.name} photos`}
                  className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-teal-700 shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => toggleSave('destination', destination.id, destination)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-500 shadow-md"
              >
                <Heart className={`w-5 h-5 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center justify-center shadow-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Destination Title & Stats inside Hero */}
          <div className="absolute bottom-4 left-4 right-4 text-white z-10">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-semibold text-teal-300 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {destination.state}, India
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-amber-300 flex items-center font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 mr-1" />
                {destination.rating} ({destination.reviewCount.toLocaleString()} reviews)
              </span>
            </div>

            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl sm:text-4xl tracking-tight text-white">
              {destination.name}
            </h1>
            {destination.photoCredit && destination.photoSourceUrl && (
              <a
                href={destination.photoSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-[10px] text-slate-200 hover:text-white"
              >
                Photo: {destination.photoCredit}
              </a>
            )}
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="relative z-20 flex flex-shrink-0 border-b border-slate-100 bg-slate-50/70 px-4 sm:px-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: Compass },
            { id: 'attractions', label: `Attractions (${details?.attractions.length || 0})`, icon: Sparkles },
            { id: 'hotels', label: `Hotels (${details?.hotels.length || 0})`, icon: Building2 },
            { id: 'food', label: `Food & Dining (${(details?.restaurants.length || 0) + (destination.foodExperiences?.length || 0)})`, icon: Utensils },
            { id: 'map', label: 'Map & Route', icon: MapPin },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DestinationDetailTab)}
                className={`flex items-center space-x-2 px-4 py-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-teal-600 text-teal-800 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="relative z-0 min-h-0 p-5 sm:p-6 overflow-y-auto flex-grow space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Estimated Budget</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                    ₹{destination.startingPrice.toLocaleString('en-IN')}
                    <span className="text-[10px] font-normal text-slate-500"> / person</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Recommended Duration</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {destination.durationDays} Days / {destination.durationDays - 1} Nights
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Best Season</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5">{destination.bestSeason}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Ideal For</p>
                  <p className="font-extrabold text-slate-900 text-sm mt-0.5 capitalize">
                    {destination.suitableFor.join(', ')}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-base text-slate-900 mb-2">
                  About {destination.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {destination.longDescription || destination.description}
                </p>
              </div>

              {/* Weather Forecast Preview */}
              {destination.weather?.forecast?.length > 0 && (
                <div>
                  <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                    <CloudSun className="w-4 h-4 mr-1.5 text-teal-600" />
                    <span>Weather Forecast ({destination.weather.temp}°C)</span>
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {destination.weather.forecast.map((f, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                        <p className="text-[11px] font-bold text-slate-700">{f.day}</p>
                        <p className="text-xs font-extrabold text-teal-700 mt-1">{f.temp}°C</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{f.condition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              <div>
                <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Key Experiences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {destination.highlights.map((hl, idx) => (
                    <ExperienceCard
                      key={`${destination.id}-experience-${idx}`}
                      title={hl}
                      section={getExperienceSection(hl)}
                      onExplore={() => setActiveTab(getExperienceSection(hl))}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attractions' && (
            <div>
              {isLoading ? (
                <p role="status" className="py-10 text-center text-xs text-slate-500">Loading attractions…</p>
              ) : detailsError ? (
                <DetailEmptyState title="Attractions could not be loaded" description="Check your connection and reopen this destination." icon="attraction" />
              ) : details?.attractions.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {details.attractions.map(attraction => (
                    <AttractionCard
                      key={attraction.id}
                      attraction={attraction}
                      name={destination.name}
                      state={destination.state}
                      fallbackImage={destination.heroImage}
                    />
                  ))}
                </div>
              ) : (
                <DetailEmptyState title="No verified attractions yet" description={`Attraction details are not available for ${destination.name} yet.`} icon="attraction" />
              )}
            </div>
          )}

          {activeTab === 'hotels' && (
            <div>
              {isLoading ? (
                <p role="status" className="py-10 text-center text-xs text-slate-500">Loading stays…</p>
              ) : detailsError ? (
                <DetailEmptyState title="Stays could not be loaded" description="Check your connection and reopen this destination." />
              ) : details?.hotels.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {details.hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} fallbackImage={destination.heroImage} />)}
                </div>
              ) : (
                <DetailEmptyState title="No verified stays listed" description={`Accommodation listings are not available for ${destination.name} yet.`} />
              )}
            </div>
          )}

          {activeTab === 'food' && (
            <div>
              {isLoading ? (
                <p role="status" className="py-10 text-center text-xs text-slate-500">Loading food & dining…</p>
              ) : detailsError ? (
                <DetailEmptyState title="Food & dining could not be loaded" description="Check your connection and reopen this destination." icon="food" />
              ) : details?.restaurants.length || destination.foodExperiences?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {destination.foodExperiences?.map(experience => (
                    <FoodExperienceCard key={experience.id} experience={experience} fallbackImage={destination.heroImage} />
                  ))}
                  {details?.restaurants.map(restaurant => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} fallbackImage={destination.heroImage} />
                  ))}
                </div>
              ) : (
                <DetailEmptyState title="No verified food listings yet" description={`Restaurant and regional food details are not available for ${destination.name} yet.`} icon="food" />
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <div className="h-80 w-full overflow-hidden rounded-2xl">
                <InteractiveMapView
                  destinationName={destination.name}
                  centerLat={destination.lat}
                  centerLng={destination.lng}
                  showRoute={false}
                  activities={details?.attractions.map(attraction => ({
                    id: attraction.id,
                    time: '',
                    placeName: attraction.name,
                    category: 'attraction' as const,
                    durationMinutes: attraction.recommendedTimeMinutes || 0,
                    estimatedCost: attraction.entryFee || 0,
                    distanceKm: 0,
                    notes: '',
                    completed: false,
                    lat: attraction.lat,
                    lng: attraction.lng
                  })) || []}
                />
              </div>
              {!isLoading && detailsError ? (
                <DetailEmptyState title="Route details could not be loaded" description="Check your connection and reopen this destination." icon="map" />
              ) : (
                <DestinationRoutePanel
                  route={destination.routes?.[0]}
                  attractions={details?.attractions || []}
                  destinationName={destination.name}
                  state={destination.state}
                />
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom CTA Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Starting Package</p>
            <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-xl text-slate-900">
              ₹{destination.startingPrice.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500"> / person</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onCompareTransport(destination);
                onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Train className="w-3.5 h-3.5 text-teal-600" />
              <span>Compare Transport</span>
            </button>

            <button
              onClick={() => {
                onPlanTrip(destination);
                onClose();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <span>Build Smart Itinerary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
