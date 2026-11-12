import React from 'react';
import { useSaved } from '../context/SavedContext';
import { DestinationCard } from './DestinationCard';
import { Destination } from '../types';
import { Heart, Compass, Trash2, ArrowRight } from 'lucide-react';

interface SavedItemsViewProps {
  onSelectDestination: (dest: Destination) => void;
  onExplore: () => void;
}

export const SavedItemsView: React.FC<SavedItemsViewProps> = ({ onSelectDestination, onExplore }) => {
  const { savedItems, toggleSave } = useSaved();

  const destinationItems = savedItems.filter(i => i.itemType === 'destination');
  const hotelItems = savedItems.filter(i => i.itemType === 'hotel');
  const restaurantItems = savedItems.filter(i => i.itemType === 'restaurant');
  const festivalItems = savedItems.filter(i => i.itemType === 'festival');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-2">
          <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          <span>Your Saved Collection</span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl text-slate-900 tracking-tight">
          Saved Destinations, Stays & Spots
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {savedItems.length} items saved for your upcoming journeys across India.
        </p>
      </div>

      {savedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Click the heart icon on any destination, hotel, festival, or cafe to save it for quick trip planning.
          </p>
          <button
            onClick={onExplore}
            className="px-6 py-3 bg-slate-900 hover:bg-teal-700 text-white rounded-full text-xs font-bold transition-all shadow-sm inline-flex items-center space-x-2"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Destinations</span>
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Saved Destinations */}
          {destinationItems.length > 0 && (
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 mb-4 flex items-center">
                <span>Saved Destinations</span>
                <span className="ml-2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {destinationItems.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinationItems.map(item => (
                  <DestinationCard
                    key={item.id}
                    destination={item.itemData}
                    onSelect={onSelectDestination}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Saved Hotels */}
          {hotelItems.length > 0 && (
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 mb-4 flex items-center">
                <span>Saved Hotels & Stays</span>
                <span className="ml-2 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {hotelItems.length}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotelItems.map(item => (
                  <div key={item.id} className="bg-white rounded-3xl p-4 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <img src={item.itemData.image} alt={item.itemData.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                      <div className="overflow-hidden">
                        <h4 className="font-['Plus_Jakarta_Sans'] font-bold text-sm text-slate-900 truncate">{item.itemData.name}</h4>
                        <p className="text-xs text-slate-500">{item.itemData.location}</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">₹{item.itemData.pricePerNight.toLocaleString('en-IN')}/night</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSave('hotel', item.itemId, item.itemData)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 ml-2"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Restaurants & Festivals */}
          {(restaurantItems.length > 0 || festivalItems.length > 0) && (
            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 mb-4">
                Saved Spots & Festivals
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurantItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={item.itemData.image} alt={item.itemData.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{item.itemData.name}</h4>
                        <p className="text-[11px] text-slate-500">{item.itemData.location}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleSave('restaurant', item.itemId, item.itemData)} className="p-1 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {festivalItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src={item.itemData.heroImage} alt={item.itemData.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{item.itemData.name}</h4>
                        <p className="text-[11px] text-slate-500">{item.itemData.city}, {item.itemData.typicalMonth}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleSave('festival', item.itemId, item.itemData)} className="p-1 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
