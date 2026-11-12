import React from 'react';
import { ArrowUpRight, Building2, Clock3, MapPin, Sparkles, Star, Ticket, Utensils } from 'lucide-react';
import { Attraction, DestinationRoute, FoodExperience, Hotel, Restaurant } from '../types';

export type DetailSection = 'attractions' | 'hotels' | 'food' | 'map';

export function getExperienceSection(title: string): DetailSection {
  const normalized = title.toLowerCase();
  if (/hotel|stay|accommodation|resort/.test(normalized)) return 'hotels';
  if (/food|dining|restaurant|cuisine|petha|bazaar|market|tasting|street food/.test(normalized)) return 'food';
  if (/route|drive|journey|transfer/.test(normalized)) return 'map';
  return 'attractions';
}

interface ExperienceCardProps {
  title: string;
  section: DetailSection;
  onExplore: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ title, section, onExplore }) => {
  const sectionLabel = {
    attractions: 'Explore attractions',
    hotels: 'Find stays',
    food: 'Explore food & dining',
    map: 'View route'
  }[section];

  return (
    <button
      type="button"
      onClick={onExplore}
      className="w-full rounded-xl border border-teal-100/70 bg-teal-50/50 p-3 text-left transition-colors hover:bg-teal-50"
    >
      <span className="flex items-start gap-2 text-xs font-semibold text-slate-800">
        <span className="mt-0.5 text-teal-600">•</span>
        <span>{title}</span>
      </span>
      <span className="ml-4 mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-teal-800">
        {sectionLabel}
        <ArrowUpRight className="h-3 w-3" />
      </span>
    </button>
  );
};

interface DetailCardLocationProps {
  name: string;
  state: string;
}

interface AttractionCardProps extends DetailCardLocationProps {
  attraction: Attraction;
  fallbackImage: string;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction, name, state, fallbackImage }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
    <img
      src={attraction.image || fallbackImage}
      alt={attraction.name}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
      }}
      className="aspect-[16/9] w-full bg-slate-100 object-cover"
      loading="lazy"
    />
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">{attraction.name}</h4>
        <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase text-teal-800">
          {attraction.category}
        </span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">{attraction.description}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-slate-500">
        <span className="flex items-start gap-1.5"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />{name}, {state}</span>
        <span className="flex items-start gap-1.5"><Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />{attraction.rating != null ? `${attraction.rating.toFixed(1)} rating` : 'Rating not available'}</span>
        <span className="flex items-start gap-1.5"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />{attraction.bestTimeOfDay || 'Best time not available'}</span>
        <span className="flex items-start gap-1.5"><Ticket className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />{attraction.entryFee === 0 ? 'Free entry' : attraction.entryFee != null ? `Entry ₹${attraction.entryFee}` : 'Entry fee not available'}</span>
      </div>
      {attraction.imageSourceUrl && attraction.imageCredit && (
        <a href={attraction.imageSourceUrl} target="_blank" rel="noreferrer" className="block truncate text-[10px] text-slate-400 underline underline-offset-2 hover:text-teal-700">
          Photo: {attraction.imageCredit}
        </a>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${attraction.name}, ${name}, ${state}`)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-700"
      >
        View Details <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  </article>
);

interface HotelCardProps {
  hotel: Hotel;
  fallbackImage: string;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, fallbackImage }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
    <img
      src={hotel.image || fallbackImage}
      alt={hotel.name}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
      }}
      className="aspect-[16/9] w-full bg-slate-100 object-cover"
      loading="lazy"
    />
    <div className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">{hotel.name}</h4>
          <p className="mt-1 text-xs text-slate-500">{hotel.hotelType} · {hotel.starRating}-star</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{hotel.userRating.toFixed(1)}
        </span>
      </div>
      <p className="flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />{hotel.address}</p>
      <p className="text-[11px] text-slate-500">{hotel.distanceKmFromCenter} km from destination center</p>
      <div className="flex flex-wrap gap-1.5">
        {hotel.amenities.map(amenity => <span key={amenity} className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{amenity}</span>)}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="font-['Plus_Jakarta_Sans'] text-lg font-extrabold text-slate-900">
          ₹{hotel.pricePerNight.toLocaleString('en-IN')}<span className="ml-1 text-[10px] font-normal text-slate-500">/ night</span>
        </p>
        <a href={hotel.bookingUrl} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-700">
          View Hotel
        </a>
      </div>
    </div>
  </article>
);

interface RestaurantCardProps {
  restaurant: Restaurant;
  fallbackImage: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, fallbackImage }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
    <img
      src={restaurant.image || fallbackImage}
      alt={restaurant.name}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
      }}
      className="aspect-[16/9] w-full bg-slate-100 object-cover"
      loading="lazy"
    />
    <div className="space-y-2.5 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">{restaurant.name}</h4>
        <span className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />{restaurant.rating.toFixed(1)}
        </span>
      </div>
      <p className="text-xs text-slate-500">{restaurant.cuisine.join(' · ')} · {restaurant.priceRange}</p>
      <p className="flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />{restaurant.address}</p>
      <p className="text-xs leading-relaxed text-slate-600"><Utensils className="mr-1 inline h-3.5 w-3.5 text-orange-600" />Must try: {restaurant.mustTryDishes.join(', ') || 'Not available'}</p>
      {restaurant.orderUrl && <a href={restaurant.orderUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-600">View restaurant <ArrowUpRight className="h-3.5 w-3.5" /></a>}
    </div>
  </article>
);

interface FoodExperienceCardProps {
  experience: FoodExperience;
  fallbackImage: string;
}

export const FoodExperienceCard: React.FC<FoodExperienceCardProps> = ({ experience, fallbackImage }) => (
  <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
    <img
      src={experience.image || fallbackImage}
      alt={experience.name}
      onError={(event) => {
        if (event.currentTarget.src !== fallbackImage) event.currentTarget.src = fallbackImage;
      }}
      className="aspect-[16/9] w-full bg-slate-100 object-cover"
      loading="lazy"
    />
    <div className="space-y-2.5 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">{experience.name}</h4>
        <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase text-orange-800">{experience.category}</span>
      </div>
      <p className="text-xs leading-relaxed text-slate-600">{experience.description}</p>
      <p className="flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" />{experience.location}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500">
        <span>{experience.rating != null ? `★ ${experience.rating.toFixed(1)}` : 'Rating not available'}</span>
        <span>{experience.priceRange || 'Price range not available'}</span>
      </div>
      {experience.mustTryDishes?.length ? <p className="text-xs text-slate-600">Must try: {experience.mustTryDishes.join(', ')}</p> : null}
      {experience.imageSourceUrl && experience.imageCredit && (
        <a href={experience.imageSourceUrl} target="_blank" rel="noreferrer" className="block truncate text-[10px] text-slate-400 underline underline-offset-2 hover:text-teal-700">
          Photo: {experience.imageCredit}
        </a>
      )}
    </div>
  </article>
);

interface DestinationRoutePanelProps {
  route?: DestinationRoute;
  attractions: Attraction[];
  destinationName: string;
  state: string;
}

function distanceBetween(first: Attraction, second: Attraction): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(second.lat - first.lat);
  const longitudeDelta = radians(second.lng - first.lng);
  const firstLatitude = radians(first.lat);
  const secondLatitude = radians(second.lat);
  const haversine = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

export const DestinationRoutePanel: React.FC<DestinationRoutePanelProps> = ({
  route,
  attractions,
  destinationName,
  state
}) => {
  const stops = route?.stops.length ? route.stops : attractions.map(attraction => attraction.name);
  const attractionsByName = new Map(attractions.map(attraction => [attraction.name.toLowerCase(), attraction]));
  const stopAttractions = stops.map(stop => attractionsByName.get(stop.toLowerCase()));
  const city = `${destinationName}, ${state}`;
  const origin = stops[0] ? `${stops[0]}, ${city}` : city;
  const destination = stops.length > 1 ? `${stops[stops.length - 1]}, ${city}` : origin;
  const waypoints = stops.slice(1, -1).map(stop => `${stop}, ${city}`).join('|');
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}`;

  if (!stops.length) {
    return <DetailEmptyState title="Route information unavailable" description={`No verified route stops are available for ${destinationName} yet.`} />;
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-slate-900">{route?.name || `${destinationName} attraction route`}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{route?.description || 'Stops follow the available destination attraction data.'}</p>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-teal-700">
          Live directions <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
      <ol className="mt-4 space-y-2">
        {stops.map((stop, index) => {
          const previous = stopAttractions[index - 1];
          const current = stopAttractions[index];
          const distance = previous && current ? distanceBetween(previous, current) : null;
          return (
            <li key={`${stop}-${index}`} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-[10px] font-extrabold text-teal-800">{index + 1}</span>
              <div className="min-w-0 flex-grow border-b border-slate-100 pb-2">
                <p className="text-xs font-semibold text-slate-800">{stop}</p>
                {index > 0 && <p className="mt-0.5 text-[10px] text-slate-500">{distance != null ? `About ${distance.toFixed(1)} km straight-line distance` : 'Road distance and travel time available in live directions'}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[10px] text-slate-400">Map markers use verified coordinates. Straight-line distances are approximate; use live directions for road distance and travel time.</p>
    </section>
  );
};

export const DetailEmptyState: React.FC<{ title: string; description: string; icon?: 'stay' | 'food' | 'attraction' | 'map' }> = ({ title, description, icon = 'stay' }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
    {icon === 'food' ? <Utensils className="mx-auto h-6 w-6 text-slate-400" /> : icon === 'attraction' ? <Sparkles className="mx-auto h-6 w-6 text-slate-400" /> : icon === 'map' ? <MapPin className="mx-auto h-6 w-6 text-slate-400" /> : <Building2 className="mx-auto h-6 w-6 text-slate-400" />}
    <h4 className="mt-3 font-['Plus_Jakarta_Sans'] text-sm font-bold text-slate-800">{title}</h4>
    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">{description}</p>
  </div>
);