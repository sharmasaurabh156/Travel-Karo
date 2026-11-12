import fs from 'fs';
import path from 'path';
import { Collection, MongoClient } from 'mongodb';
import { 
  User, 
  Destination, 
  Festival, 
  Attraction, 
  Hotel, 
  Restaurant, 
  Playlist, 
  Trip, 
  SavedItem, 
  AdminStats,
  TripDay,
  TripActivity
} from '../types';
import { 
  SEED_USERS, 
  SEED_DESTINATIONS, 
  SEED_FESTIVALS, 
  SEED_ATTRACTIONS, 
  SEED_HOTELS, 
  SEED_RESTAURANTS, 
  SEED_PLAYLISTS 
} from './seedData';

interface DatabaseSchema {
  users: (User & { passwordHash: string })[];
  destinations: Destination[];
  festivals: Festival[];
  attractions: Attraction[];
  hotels: Hotel[];
  restaurants: Restaurant[];
  playlists: Playlist[];
  trips: Trip[];
  savedItems: SavedItem[];
  searchLogs: { query: string; timestamp: string }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'travel_saathi.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbInstance: DatabaseSchema | null = null;
let mongoClient: MongoClient | null = null;
let stateCollection: Collection<DatabaseSchema> | null = null;
let persistenceQueue: Promise<void> = Promise.resolve();

function mergeSeedRestaurants(data: DatabaseSchema) {
  const existingRestaurantIds = new Set(data.restaurants.map(restaurant => restaurant.id));
  data.restaurants.push(...SEED_RESTAURANTS.filter(restaurant => !existingRestaurantIds.has(restaurant.id)));
}

function loadDatabase(): DatabaseSchema {
  if (dbInstance) return dbInstance;

  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      dbInstance = JSON.parse(content);
      const existingDestinationIds = new Set(dbInstance!.destinations.map(destination => destination.id));
      const missingDestinations = SEED_DESTINATIONS.filter(destination => !existingDestinationIds.has(destination.id));
      if (missingDestinations.length > 0) {
        dbInstance!.destinations.push(...missingDestinations);
      }
      const existingFestivalIds = new Set(dbInstance!.festivals.map(festival => festival.id));
      const missingFestivals = SEED_FESTIVALS.filter(festival => !existingFestivalIds.has(festival.id));
      if (missingFestivals.length > 0) {
        dbInstance!.festivals.push(...missingFestivals);
      }
      const existingAttractionIds = new Set(dbInstance!.attractions.map(attraction => attraction.id));
      dbInstance!.attractions.push(...SEED_ATTRACTIONS.filter(attraction => !existingAttractionIds.has(attraction.id)));
      mergeSeedRestaurants(dbInstance!);
      for (const destination of dbInstance!.destinations) {
        const seededDestination = SEED_DESTINATIONS.find(seed => seed.id === destination.id);
        if (destination.foodExperiences === undefined && seededDestination?.foodExperiences) {
          destination.foodExperiences = seededDestination.foodExperiences;
        }
        if (destination.routes === undefined && seededDestination?.routes) {
          destination.routes = seededDestination.routes;
        }
      }
      return dbInstance!;
    } catch (err) {
      console.error('Error reading DB file, reinitializing with seed data:', err);
    }
  }

  // Initial seed
  dbInstance = {
    users: [...SEED_USERS],
    destinations: [...SEED_DESTINATIONS],
    festivals: [...SEED_FESTIVALS],
    attractions: [...SEED_ATTRACTIONS],
    hotels: [...SEED_HOTELS],
    restaurants: [...SEED_RESTAURANTS],
    playlists: [...SEED_PLAYLISTS],
    trips: [
      {
        id: 'trip-sample-1',
        userId: 'user-demo-1',
        name: '3 Days Vibrant Goa Escape',
        destinationId: 'dest-goa',
        destinationName: 'Goa',
        destinationSlug: 'goa',
        destinationImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
        startDate: '2026-11-15',
        endDate: '2026-11-18',
        durationDays: 3,
        travellersCount: 4,
        budget: 40000,
        travelGroup: {
          name: 'College Friends',
          members: ['Aarav Sharma', 'Rohan Verma', 'Pooja Nair', 'Kabir Sen']
        },
        status: 'active',
        totalEstimatedCost: 38400,
        perPersonCost: 9600,
        createdAt: '2026-02-12T12:00:00.000Z',
        days: [
          {
            id: 'day-1',
            dayNumber: 1,
            date: '2026-11-15',
            title: 'Arrival & North Goa Beaches',
            activities: [
              {
                id: 'act-1-1',
                time: '11:00 AM',
                placeName: 'Hotel Check-in & Freshen Up',
                category: 'hotel',
                durationMinutes: 60,
                estimatedCost: 0,
                distanceKm: 0,
                notes: 'Drop bags, change into beachwear',
                completed: true,
                completedAt: '2026-11-15T11:30:00.000Z'
              },
              {
                id: 'act-1-2',
                time: '01:00 PM',
                placeName: 'Lunch at Vinayak Family Restaurant',
                category: 'restaurant',
                durationMinutes: 75,
                estimatedCost: 800,
                distanceKm: 4.0,
                notes: 'Taste authentic Goan fish thali and sol kadhi',
                completed: true,
                completedAt: '2026-11-15T14:15:00.000Z'
              },
              {
                id: 'act-1-3',
                time: '03:30 PM',
                placeName: 'Baga & Calangute Beach Watersports',
                category: 'attraction',
                durationMinutes: 180,
                estimatedCost: 2400,
                distanceKm: 5.2,
                notes: 'Parasailing and jet ski with friends',
                completed: true,
                completedAt: '2026-11-15T18:30:00.000Z'
              },
              {
                id: 'act-1-4',
                time: '07:30 PM',
                placeName: 'Sunset Dinner at Fisherman\'s Wharf',
                category: 'restaurant',
                durationMinutes: 120,
                estimatedCost: 3200,
                distanceKm: 2.5,
                notes: 'Live acoustic music and seaside cocktails',
                completed: false
              }
            ]
          },
          {
            id: 'day-2',
            dayNumber: 2,
            date: '2026-11-16',
            title: 'Heritage Forts & Sunset Cruise',
            activities: [
              {
                id: 'act-2-1',
                time: '09:30 AM',
                placeName: 'Fort Aguada & Ancient Lighthouse',
                category: 'attraction',
                durationMinutes: 120,
                estimatedCost: 200,
                distanceKm: 6.0,
                notes: 'Panoramic Arabian Sea cliff views',
                completed: false
              },
              {
                id: 'act-2-2',
                time: '01:00 PM',
                placeName: 'Lunch at Gunpowder Assagao',
                category: 'restaurant',
                durationMinutes: 90,
                estimatedCost: 1800,
                distanceKm: 7.5,
                notes: 'Kerala coastal delicacies under tree canopies',
                completed: false
              },
              {
                id: 'act-2-3',
                time: '04:00 PM',
                placeName: 'Basilica of Bom Jesus in Old Goa',
                category: 'attraction',
                durationMinutes: 90,
                estimatedCost: 0,
                distanceKm: 12.0,
                notes: 'UNESCO Heritage Portuguese architecture',
                completed: false
              }
            ]
          },
          {
            id: 'day-3',
            dayNumber: 3,
            date: '2026-11-17',
            title: 'Dudhsagar Waterfall Jeep Safari & Departure',
            activities: [
              {
                id: 'act-3-1',
                time: '07:00 AM',
                placeName: 'Dudhsagar Waterfall Jungle Safari',
                category: 'attraction',
                durationMinutes: 240,
                estimatedCost: 4000,
                distanceKm: 42.0,
                notes: '4x4 jeep safari crossing jungle streams',
                completed: false
              },
              {
                id: 'act-3-2',
                time: '03:00 PM',
                placeName: 'Souvenir Shopping & Spices',
                category: 'custom',
                durationMinutes: 90,
                estimatedCost: 1500,
                distanceKm: 5.0,
                notes: 'Cashews, feni, spices and Goan handicraft',
                completed: false
              }
            ]
          }
        ]
      }
    ],
    savedItems: [
      {
        id: 'saved-1',
        userId: 'user-demo-1',
        itemType: 'destination',
        itemId: 'dest-varanasi',
        itemData: SEED_DESTINATIONS[1],
        savedAt: '2026-02-14T09:00:00.000Z'
      },
      {
        id: 'saved-2',
        userId: 'user-demo-1',
        itemType: 'festival',
        itemId: 'fest-pushkar-camel-fair',
        itemData: SEED_FESTIVALS[0],
        savedAt: '2026-02-15T10:00:00.000Z'
      }
    ],
    searchLogs: [
      { query: 'Goa', timestamp: '2026-02-20T10:00:00.000Z' },
      { query: 'Manali', timestamp: '2026-02-20T11:00:00.000Z' },
      { query: 'Varanasi', timestamp: '2026-02-21T08:00:00.000Z' },
      { query: 'Spiritual', timestamp: '2026-02-21T12:00:00.000Z' },
      { query: 'Pushkar', timestamp: '2026-02-22T14:00:00.000Z' }
    ]
  };

  return dbInstance!;
}

function saveDatabase() {
  if (!dbInstance || !stateCollection) return;
  const snapshot = JSON.parse(JSON.stringify(dbInstance)) as DatabaseSchema;
  persistenceQueue = persistenceQueue
    .then(async () => {
      await stateCollection!.replaceOne({ _id: 'travel-saathi-state' } as any, snapshot as any, { upsert: true });
    })
    .catch(err => {
      console.error('Error saving database state to MongoDB:', err);
    });
}

export async function initializeDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const databaseName = process.env.MONGODB_DB || 'travel_saathi';
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  stateCollection = mongoClient.db(databaseName).collection<DatabaseSchema>('app_state');

  const storedState = await stateCollection.findOne({ _id: 'travel-saathi-state' } as any);
  if (storedState) {
    const { _id, ...state } = storedState as DatabaseSchema & { _id: string };
    dbInstance = state;
    const existingDestinationIds = new Set(dbInstance.destinations.map(destination => destination.id));
    const existingFestivalIds = new Set(dbInstance.festivals.map(festival => festival.id));
    dbInstance.destinations.push(...SEED_DESTINATIONS.filter(destination => !existingDestinationIds.has(destination.id)));
    dbInstance.festivals.push(...SEED_FESTIVALS.filter(festival => !existingFestivalIds.has(festival.id)));
    mergeSeedRestaurants(dbInstance);
    saveDatabase();
    return;
  }

  dbInstance = loadDatabase();
  await stateCollection.insertOne({ _id: 'travel-saathi-state', ...dbInstance } as any);
}

export const db = {
  // Users
  getUsers: () => loadDatabase().users,
  getUserById: (id: string) => loadDatabase().users.find(u => u.id === id),
  getUserByEmail: (email: string) => loadDatabase().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  createUser: (user: User & { passwordHash: string }) => {
    const data = loadDatabase();
    data.users.push(user);
    saveDatabase();
    return user;
  },
  updateUserProfile: (userId: string, profile: Partial<User['profile']>) => {
    const data = loadDatabase();
    const user = data.users.find(u => u.id === userId);
    if (user) {
      user.profile = { ...user.profile, ...profile };
      saveDatabase();
      return user;
    }
    return null;
  },

  // Destinations
  getDestinations: () => loadDatabase().destinations,
  getDestinationByIdOrSlug: (idOrSlug: string) => {
    const list = loadDatabase().destinations;
    return list.find(d => d.id === idOrSlug || d.slug === idOrSlug);
  },
  createDestination: (dest: Destination) => {
    const data = loadDatabase();
    data.destinations.push(dest);
    saveDatabase();
    return dest;
  },
  updateDestination: (id: string, updates: Partial<Destination>) => {
    const data = loadDatabase();
    const index = data.destinations.findIndex(d => d.id === id);
    if (index !== -1) {
      data.destinations[index] = { ...data.destinations[index], ...updates };
      saveDatabase();
      return data.destinations[index];
    }
    return null;
  },
  deleteDestination: (id: string) => {
    const data = loadDatabase();
    const initialLen = data.destinations.length;
    data.destinations = data.destinations.filter(d => d.id !== id);
    saveDatabase();
    return data.destinations.length < initialLen;
  },

  // Festivals
  getFestivals: () => loadDatabase().festivals,
  getFestivalByIdOrSlug: (idOrSlug: string) => {
    const list = loadDatabase().festivals;
    return list.find(f => f.id === idOrSlug || f.slug === idOrSlug);
  },
  createFestival: (fest: Festival) => {
    const data = loadDatabase();
    data.festivals.push(fest);
    saveDatabase();
    return fest;
  },
  updateFestival: (id: string, updates: Partial<Festival>) => {
    const data = loadDatabase();
    const index = data.festivals.findIndex(f => f.id === id);
    if (index !== -1) {
      data.festivals[index] = { ...data.festivals[index], ...updates };
      saveDatabase();
      return data.festivals[index];
    }
    return null;
  },
  deleteFestival: (id: string) => {
    const data = loadDatabase();
    data.festivals = data.festivals.filter(f => f.id !== id);
    saveDatabase();
    return true;
  },

  // Attractions
  getAttractions: (destId?: string) => {
    const list = loadDatabase().attractions;
    if (destId) return list.filter(a => a.destinationId === destId);
    return list;
  },
  createAttraction: (attr: Attraction) => {
    const data = loadDatabase();
    data.attractions.push(attr);
    saveDatabase();
    return attr;
  },
  deleteAttraction: (id: string) => {
    const data = loadDatabase();
    data.attractions = data.attractions.filter(a => a.id !== id);
    saveDatabase();
    return true;
  },

  // Hotels
  getHotels: (destId?: string) => {
    const list = loadDatabase().hotels;
    if (destId) return list.filter(h => h.destinationId === destId);
    return list;
  },
  createHotel: (hotel: Hotel) => {
    const data = loadDatabase();
    data.hotels.push(hotel);
    saveDatabase();
    return hotel;
  },
  deleteHotel: (id: string) => {
    const data = loadDatabase();
    data.hotels = data.hotels.filter(h => h.id !== id);
    saveDatabase();
    return true;
  },

  // Restaurants
  getRestaurants: (destId?: string) => {
    const list = loadDatabase().restaurants;
    if (destId) return list.filter(r => r.destinationId === destId);
    return list;
  },
  createRestaurant: (rest: Restaurant) => {
    const data = loadDatabase();
    data.restaurants.push(rest);
    saveDatabase();
    return rest;
  },
  deleteRestaurant: (id: string) => {
    const data = loadDatabase();
    data.restaurants = data.restaurants.filter(r => r.id !== id);
    saveDatabase();
    return true;
  },

  // Playlists
  getPlaylists: (category?: string) => {
    const list = loadDatabase().playlists;
    if (category) {
      return list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return list;
  },

  // Trips
  getTrips: (userId?: string) => {
    const list = loadDatabase().trips;
    if (userId) return list.filter(t => t.userId === userId);
    return list;
  },
  getTripById: (id: string) => loadDatabase().trips.find(t => t.id === id),
  createTrip: (trip: Trip) => {
    const data = loadDatabase();
    data.trips.unshift(trip);
    saveDatabase();
    return trip;
  },
  updateTrip: (id: string, updates: Partial<Trip>) => {
    const data = loadDatabase();
    const index = data.trips.findIndex(t => t.id === id);
    if (index !== -1) {
      data.trips[index] = { ...data.trips[index], ...updates };
      saveDatabase();
      return data.trips[index];
    }
    return null;
  },
  deleteTrip: (id: string) => {
    const data = loadDatabase();
    data.trips = data.trips.filter(t => t.id !== id);
    saveDatabase();
    return true;
  },
  toggleActivityCompletion: (tripId: string, activityId: string, completed?: boolean) => {
    const data = loadDatabase();
    const trip = data.trips.find(t => t.id === tripId);
    if (!trip) return null;

    let targetActivity: TripActivity | null = null;
    let allCompleted = true;
    let totalCount = 0;
    let completedCount = 0;

    for (const day of trip.days) {
      for (const act of day.activities) {
        totalCount++;
        if (act.id === activityId) {
          act.completed = completed !== undefined ? completed : !act.completed;
          act.completedAt = act.completed ? new Date().toISOString() : undefined;
          targetActivity = act;
        }
        if (act.completed) {
          completedCount++;
        } else {
          allCompleted = false;
        }
      }
    }

    if (totalCount > 0 && completedCount === totalCount) {
      trip.status = 'completed';
      trip.completedAt = new Date().toISOString();
    } else if (trip.status === 'completed' && completedCount < totalCount) {
      trip.status = 'active';
      trip.completedAt = undefined;
    }

    saveDatabase();
    return { trip, activity: targetActivity, completedCount, totalCount };
  },

  // Saved Items
  getSavedItems: (userId: string) => {
    return loadDatabase().savedItems.filter(s => s.userId === userId);
  },
  toggleSavedItem: (userId: string, itemType: SavedItem['itemType'], itemId: string, itemData: any) => {
    const data = loadDatabase();
    const existingIndex = data.savedItems.findIndex(
      s => s.userId === userId && s.itemType === itemType && s.itemId === itemId
    );
    if (existingIndex !== -1) {
      data.savedItems.splice(existingIndex, 1);
      saveDatabase();
      return { saved: false };
    } else {
      const newItem: SavedItem = {
        id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId,
        itemType,
        itemId,
        itemData,
        savedAt: new Date().toISOString()
      };
      data.savedItems.push(newItem);
      saveDatabase();
      return { saved: true, item: newItem };
    }
  },

  // Search & Logs
  logSearch: (query: string) => {
    if (!query || query.trim().length === 0) return;
    const data = loadDatabase();
    data.searchLogs.unshift({ query: query.trim(), timestamp: new Date().toISOString() });
    if (data.searchLogs.length > 500) {
      data.searchLogs = data.searchLogs.slice(0, 500);
    }
    saveDatabase();
  },

  // Admin Stats
  getAdminStats: (): AdminStats => {
    const data = loadDatabase();
    const categoryCounts: Record<string, number> = {};
    for (const d of data.destinations) {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    }

    const searchCountMap: Record<string, number> = {};
    for (const log of data.searchLogs) {
      const q = log.query.toLowerCase();
      searchCountMap[q] = (searchCountMap[q] || 0) + 1;
    }

    const searchTrends = Object.entries(searchCountMap)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalUsers: data.users.length,
      totalDestinations: data.destinations.length,
      totalTrips: data.trips.length,
      totalFestivals: data.festivals.length,
      totalHotels: data.hotels.length,
      totalRestaurants: data.restaurants.length,
      mostVisitedDestination: 'Goa',
      popularCategories: Object.entries(categoryCounts).map(([category, count]) => ({ category, count })),
      recentTrips: data.trips.slice(0, 5),
      searchTrends
    };
  }
};
