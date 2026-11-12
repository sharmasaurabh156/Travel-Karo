import React from 'react';
import { Destination } from '../types';
import { useSaved } from '../context/SavedContext';
import { 
  Compass, 
  MapPin, 
  Star, 
  Heart, 
  Calendar,
  Sparkles,
  Waves,
  Mountain,
  Landmark,
  Trees,
  Flame,
  PawPrint
} from 'lucide-react';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (dest: Destination) => void;
  onQuickPlan?: (dest: Destination) => void;
}

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Beaches': return Waves;
    case 'Mountains': return Mountain;
    case 'Heritage': return Landmark;
    case 'Nature': return Trees;
    case 'Festivals': return Flame;
    case 'Wildlife': return PawPrint;
    case 'Spiritual': return Sparkles;
    default: return Compass;
  }
};

export const DestinationCard: React.FC<DestinationCardProps> = ({ destination, onSelect, onQuickPlan }) => {
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved('destination', destination.id);
  const IconComponent = getCategoryIcon(destination.category);
  const currentYear = new Date().getFullYear().toString();
  const festivalDates = destination.festivalDates?.[currentYear] || destination.festivalPeriod;

  return (
    <div 
      id={`destination-card-${destination.id}`}
      onClick={() => onSelect(destination)}
      className="bg-white rounded-[2rem] shadow-[0_4px_24px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_36px_rgba(15,23,42,0.1)] border border-slate-100/80 overflow-hidden flex flex-col cursor-pointer group transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Hero Image Container */}
      <div className="h-52 w-full relative overflow-hidden bg-slate-100">
        <img 
          src={destination.heroImage} 
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Category Pill Badge */}
        <div className="absolute top-3.5 left-3.5 bg-[#6df5e1] text-[#006b5f] font-semibold text-xs px-3.5 py-1.5 rounded-full flex items-center shadow-sm backdrop-blur-sm">
          <IconComponent className="w-3.5 h-3.5 mr-1.5" />
          <span>{destination.category}</span>
        </div>

        {/* Favorite Save Button */}
        <button
          id={`save-btn-${destination.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleSave('destination', destination.id, destination);
          }}
          aria-label={saved ? 'Remove from favorites' : 'Save to favorites'}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-sm hover:bg-white active:scale-90 transition-transform text-slate-700 hover:text-red-500"
        >
          <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>

        {/* Duration Chip */}
        <div className="absolute bottom-3 left-3.5 bg-black/60 backdrop-blur-md text-white font-medium text-[11px] px-2.5 py-0.5 rounded-full flex items-center">
          <Calendar className="w-3 h-3 mr-1 text-teal-300" />
          <span>{destination.durationDays} Days Recommended</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl text-slate-900 tracking-tight leading-snug group-hover:text-teal-700 transition-colors">
                {destination.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600 flex-shrink-0" />
                <span>{destination.state}</span>
              </p>
            </div>
            
            {/* Rating Pill */}
            <div className="flex items-center bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/60">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
              <span className="text-xs font-bold text-slate-800">{destination.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
            {destination.description}
          </p>
          {destination.photoCredit && destination.photoSourceUrl && (
            <a
              href={destination.photoSourceUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="mt-2 inline-block text-[10px] text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-teal-700"
            >
              Photo: {destination.photoCredit}
            </a>
          )}
        </div>

        {/* Bottom Price & Season Section */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex justify-between items-end">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Starting from</p>
            <p className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-slate-900 leading-tight">
              ₹{destination.startingPrice.toLocaleString('en-IN')}
              <span className="text-xs text-slate-500 font-normal"> / person</span>
            </p>
          </div>
          
          <div className={`text-right ${destination.category === 'Festivals' ? 'space-y-1' : ''}`}>
            <p className="text-[11px] text-slate-400 font-medium">Best Season</p>
            <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full mt-0.5">
              {destination.bestSeason}
            </span>
            {destination.category === 'Festivals' && (
              <>
                <p className="text-[11px] text-slate-400 font-medium">Festival Period</p>
                <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full mt-0.5">
                  {destination.festivalPeriod}
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Festival Dates</p>
                <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full mt-0.5">
                  {festivalDates}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
