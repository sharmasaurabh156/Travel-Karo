import React, { useState, useEffect } from 'react';
import { Hotel, Destination } from '../types';
import { api } from '../lib/api';
import { useSaved } from '../context/SavedContext';
import { 
  Building2, 
  Star, 
  MapPin, 
  Heart, 
  Wifi, 
  Coffee, 
  Utensils, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink,
  Filter,
  Check
} from 'lucide-react';

interface HotelComparisonViewProps {
  destinations: Destination[];
  initialDestinationId?: string;
  onBookHotel?: (hotel: Hotel) => void;
}

export const HotelComparisonView: React.FC<HotelComparisonViewProps> = ({
  destinations,
  initialDestinationId,
  onBookHotel
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>(initialDestinationId || 'all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'rating'>('rating');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSaved, toggleSave } = useSaved();

  useEffect(() => {
    async function loadHotels() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedDestId !== 'all') params.destinationId = selectedDestId;
        if (selectedType !== 'all') params.hotelType = selectedType;
        const res = await api.getHotels(params);
        setHotels(res.hotels || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHotels();
  }, [selectedDestId, selectedType]);

  const sortedHotels = [...hotels].filter(h => h.starRating >= minRating).sort((a, b) => {
    if (sortBy === 'price-asc') return a.pricePerNight - b.pricePerNight;
    if (sortBy === 'price-desc') return b.pricePerNight - a.pricePerNight;
    return b.starRating - a.starRating;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Building2 className="w-3.5 h-3.5" />
          <span>Curated Stays & Resorts</span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-slate-900 tracking-tight">
          Hotels, Havelis & Boutique Resorts
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Verified accommodations across India with direct booking comparisons, heritage aesthetics, and verified amenities.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Destination
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Destinations (India)</option>
              {destinations.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Property Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="resort">Luxury Resort</option>
              <option value="heritage">Heritage Haveli / Palace</option>
              <option value="boutique">Boutique & Ashram</option>
              <option value="homestay">Homestay</option>
              <option value="hotel">Standard Hotel</option>
            </select>
          </div>

          {/* Star Rating Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Min Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={0}>Any Rating</option>
              <option value={4.0}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars (Top Rated)</option>
              <option value={4.8}>4.8+ Stars (Superb)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

        </div>
      </div>

      {/* Hotel Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : sortedHotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedHotels.map((hotel) => {
            const saved = isSaved('hotel', hotel.id);
            return (
              <div
                key={hotel.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                      {hotel.hotelType}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleSave('hotel', hotel.id, hotel)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 hover:text-red-500 shadow-sm"
                    >
                      <Heart className={`w-4 h-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600 flex-shrink-0" />
                          {hotel.location}
                        </p>
                      </div>

                      <div className="flex items-center bg-amber-50 border border-amber-200/70 px-2 py-0.5 rounded-lg text-amber-900 font-bold text-xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                        <span>{hotel.starRating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Amenities list */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Price & Booking CTA */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Per Night</p>
                      <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-lg text-slate-900">
                        ₹{hotel.pricePerNight.toLocaleString('en-IN')}
                        <span className="text-xs font-normal text-slate-500"> + taxes</span>
                      </p>
                    </div>

                    <button
                      onClick={() => onBookHotel ? onBookHotel(hotel) : window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.name + ' ' + hotel.location)}`, '_blank')}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Check Rates</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700">No hotels matching current filter criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try selecting a different property type or destination.</p>
        </div>
      )}

    </div>
  );
};
