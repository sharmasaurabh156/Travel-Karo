export type TravelCategory = 
  | 'Spiritual'
  | 'Heritage'
  | 'Nature'
  | 'Festivals'
  | 'Beaches'
  | 'Mountains'
  | 'Wildlife';

export interface UserProfile {
  ageGroup?: '18-25' | '26-35' | '36-50' | '50+';
  homeCity?: string;
  travelPreference?: 'budget' | 'comfort' | 'luxury' | 'adventure' | 'peaceful';
  budgetPreference?: 'low' | 'medium' | 'high';
  preferredTransport?: 'train' | 'flight' | 'bus' | 'car';
  foodPreference?: 'pure_veg' | 'vegetarian' | 'non_vegetarian' | 'vegan';
  bio?: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  profile: UserProfile;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  rainProbability: number;
  tempMin: number;
  tempMax: number;
  icon: string;
  forecast: { day: string; temp: number; condition: string }[];
  isLive?: boolean;
}

export interface Attraction {
  id: string;
  destinationId: string;
  name: string;
  category: string;
  description: string;
  openingHours?: string;
  entryFee?: number;
  recommendedTimeMinutes?: number;
  image: string;
  imageSourceUrl?: string;
  imageCredit?: string;
  lat: number;
  lng: number;
  bestTimeOfDay?: 'Morning' | 'Afternoon' | 'Evening' | 'Sunset' | 'Anytime';
  rating?: number;
}

export interface FoodExperience {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  imageSourceUrl?: string;
  imageCredit?: string;
  location: string;
  priceRange?: string;
  rating?: number;
  mustTryDishes?: string[];
}

export interface DestinationRoute {
  id: string;
  name: string;
  description: string;
  stops: string[];
}

export interface Destination {
  id: string;
  slug: string;
  name: string;
  state: string;
  category: TravelCategory;
  subcategory?: string;
  description: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  bestSeason: string;
  bestMonths: string[];
  durationDays: number;
  heroImage: string;
  gallery: string[];
  photoSourceUrl?: string;
  photoCredit?: string;
  foodExperiences?: FoodExperience[];
  routes?: DestinationRoute[];
  weather: WeatherData;
  lat: number;
  lng: number;
  highlights: string[];
  tags: string[];
  suitableFor: ('solo' | 'couples' | 'family' | 'groups' | 'students')[];
  festivalPeriod?: string;
  festivalDates?: Record<string, string>;
  isTrending?: boolean;
  isPopularWeekend?: boolean;
  isBudgetFriendly?: boolean;
}

export interface Festival {
  id: string;
  slug: string;
  name: string;
  destinationId?: string;
  destinationName: string;
  destinationSlug?: string;
  state: string;
  city: string;
  typicalMonth: string;
  dates: string;
  description: string;
  culturalSignificance: string;
  recommendedDuration: string;
  expectedCrowd: 'Moderate' | 'High' | 'Very High' | 'Mega';
  rituals: string[];
  nearbyAttractions: string[];
  travelTips: string[];
  heroImage: string;
  tags: string[];
  upcomingDateText: string;
}

export interface Hotel {
  id: string;
  destinationId: string;
  name: string;
  starRating: number;
  userRating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  image: string;
  gallery?: string[];
  amenities: string[];
  distanceKmFromCenter: number;
  hotelType: 'Budget' | 'Luxury' | 'Resort' | 'Heritage' | 'Boutique' | 'Homestay';
  address: string;
  provider: 'Booking.com' | 'MakeMyTrip' | 'Agoda' | 'Direct Saathi Partner';
  bookingUrl: string;
  isBestValue?: boolean;
  isCheapest?: boolean;
  isBestRated?: boolean;
}

export interface Restaurant {
  id: string;
  destinationId: string;
  name: string;
  cuisine: string[];
  priceRange: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹';
  rating: number;
  reviewCount: number;
  image: string;
  isVeg: boolean;
  isVegan: boolean;
  openingHours: string;
  address: string;
  lat: number;
  lng: number;
  mustTryDishes: string[];
  distanceKmFromCenter: number;
  orderUrl?: string;
}

export interface TransportOption {
  id: string;
  mode: 'train' | 'flight' | 'bus' | 'car';
  name: string;
  identifier: string;
  departure: string;
  arrival: string;
  durationHours: number;
  durationFormatted: string;
  totalCost: number;
  perPersonCost: number;
  availabilityStatus: 'Available' | 'Few Seats Left' | 'RAC / Available' | 'Live Available' | 'On Demand';
  providerName: string;
  stops: string;
  distanceKm: number;
  fuelEstimate?: number;
  tollEstimate?: number;
  carMileageKmPerLitre?: number;
  details: string;
  isCheapest?: boolean;
  isFastest?: boolean;
  isRecommended?: boolean;
}

export interface TransportScoreBreakdown {
  costScore: number;
  timeScore: number;
  convenienceScore: number;
  preferenceScore: number;
  totalScore: number;
}

export interface TransportComparisonResult {
  source: string;
  destination: string;
  destinationName: string;
  travellers: number;
  travelDate: string;
  distanceKm: number;
  options: TransportOption[];
  cheapestOption: TransportOption;
  fastestOption: TransportOption;
  recommendedOption: {
    option: TransportOption;
    reason: string;
    scoreBreakdown: TransportScoreBreakdown;
  };
}

export interface TripActivity {
  id: string;
  time: string;
  placeName: string;
  category: 'hotel' | 'attraction' | 'restaurant' | 'travel' | 'custom';
  durationMinutes: number;
  estimatedCost: number;
  distanceKm: number;
  notes: string;
  completed: boolean;
  completedAt?: string;
  lat?: number;
  lng?: number;
  attractionId?: string;
  restaurantId?: string;
}

export interface TripDay {
  id: string;
  dayNumber: number;
  date: string;
  title: string;
  activities: TripActivity[];
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  destinationId: string;
  destinationName: string;
  destinationSlug: string;
  destinationImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travellersCount: number;
  budget: number;
  travelGroup: {
    name: string;
    members: string[];
  };
  transportSelected?: TransportOption;
  hotelSelected?: Hotel;
  status: 'planning' | 'active' | 'completed' | 'archived';
  days: TripDay[];
  totalEstimatedCost: number;
  perPersonCost: number;
  createdAt: string;
  completedAt?: string;
  playlistId?: string;
}

export interface SavedItem {
  id: string;
  userId: string;
  itemType: 'destination' | 'hotel' | 'restaurant' | 'festival';
  itemId: string;
  itemData: any;
  savedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  language: string;
  genre: string;
  duration: string;
  externalUrl: string;
  audioPreviewUrl?: string;
}

export interface Playlist {
  id: string;
  title: string;
  category: TravelCategory | 'Road Trip' | 'Bollywood' | '90s Hindi';
  description: string;
  coverImage: string;
  songsCount: number;
  duration: string;
  songs: Song[];
  spotifyUrl: string;
  youtubeUrl: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDestinations: number;
  totalTrips: number;
  totalFestivals: number;
  totalHotels: number;
  totalRestaurants: number;
  mostVisitedDestination: string;
  popularCategories: { category: string; count: number }[];
  recentTrips: Trip[];
  searchTrends: { query: string; count: number }[];
}
