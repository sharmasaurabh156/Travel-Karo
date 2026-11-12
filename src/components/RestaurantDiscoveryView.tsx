import React, { useState, useEffect } from 'react';
import { Restaurant, Destination } from '../types';
import { api } from '../lib/api';
import { useSaved } from '../context/SavedContext';
import { 
  Utensils, 
  Leaf, 
  MapPin, 
  Star, 
  Heart, 
  IndianRupee, 
  ExternalLink,
  Sparkles,
  Flame
} from 'lucide-react';

interface RestaurantDiscoveryViewProps {
  destinations: Destination[];
  initialDestinationId?: string;
}

export const RestaurantDiscoveryView: React.FC<RestaurantDiscoveryViewProps> = ({
  destinations,
  initialDestinationId
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>(initialDestinationId || 'all');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isSaved, toggleSave } = useSaved();

  useEffect(() => {
    async function loadRestaurants() {
      setIsLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedDestId !== 'all') params.destinationId = selectedDestId;
        if (isVegOnly) params.isVeg = 'true';
        const res = await api.getRestaurants(params);
        setRestaurants(res.restaurants || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurants();
  }, [selectedDestId, isVegOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 bg-orange-50 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Utensils className="w-3.5 h-3.5" />
          <span>Culinary Trails of India</span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-slate-900 tracking-tight">
          Iconic Cafes, Street Foods & Royal Kitchens
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          From legendary 100-year-old sweet shops in Varanasi to sunset beach shacks in Goa and Malabar spice kitchens.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Destination Picker */}
        <div className="w-full sm:w-72">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Select City / Region
          </label>
          <select
            value={selectedDestId}
            onChange={(e) => setSelectedDestId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Destinations (Across India)</option>
            {destinations.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
            ))}
          </select>
        </div>

        {/* Veg Toggle */}
        <div className="flex items-center space-x-3 self-end sm:self-center">
          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              isVegOnly
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Pure Veg Only</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-3xl h-72 animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : restaurants.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => {
            const saved = isSaved('restaurant', rest.id);
            return (
              <div
                key={rest.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img 
                      src={rest.image} 
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />

                    {/* Veg badge */}
                    {rest.isVeg && (
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm">
                        <Leaf className="w-3 h-3 mr-1" />
                        <span>Pure Veg</span>
                      </div>
                    )}

                    {/* Save Heart */}
                    <button
                      onClick={() => toggleSave('restaurant', rest.id, rest)}
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
                          {rest.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center mt-0.5">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600 flex-shrink-0" />
                          {rest.location}
                        </p>
                      </div>

                      <div className="flex items-center bg-slate-100 px-2 py-0.5 rounded-lg text-slate-800 font-bold text-xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                        <span>{rest.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Cuisine Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rest.cuisine.map((c, idx) => (
                        <span key={idx} className="text-[10px] font-semibold bg-orange-50 text-orange-800 px-2 py-0.5 rounded-md">
                          {c}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        {rest.priceRange}
                      </span>
                    </div>

                    {/* Must Try Dishes */}
                    <div className="mt-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center">
                        <Flame className="w-3 h-3 text-orange-500 mr-1" />
                        <span>Must Try:</span>
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rest.mustTryDishes.map((dish, idx) => (
                          <span key={idx} className="text-[10px] text-slate-600 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                            {dish}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Approx. <strong className="text-slate-800">{rest.priceRange === '₹' ? '₹200 - ₹500' : rest.priceRange === '₹₹' ? '₹600 - ₹1,200' : '₹1,500+'}</strong>
                    </span>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rest.name + ' ' + rest.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <Utensils className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700">No restaurants matching filter</p>
        </div>
      )}

    </div>
  );
};
