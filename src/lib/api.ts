import { 
  AuthResponse, 
  Destination, 
  Festival, 
  Hotel, 
  Restaurant, 
  TransportComparisonResult, 
  Trip, 
  SavedItem, 
  Playlist, 
  AdminStats,
  User
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('travel_saathi_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async register(data: { name: string; email: string; password: string; profile?: any }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create account');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Session expired');
    return res.json();
  },

  async updateProfile(profile: any): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ profile })
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Destinations
  async getDestinations(params?: Record<string, string>): Promise<{ destinations: Destination[]; total: number }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/destinations?${query}`);
    if (!res.ok) throw new Error('Failed to load destinations');
    return res.json();
  },

  async getDestination(idOrSlug: string): Promise<{
    destination: Destination;
    attractions: any[];
    hotels: Hotel[];
    restaurants: Restaurant[];
    festivals: Festival[];
  }> {
    const res = await fetch(`${API_BASE}/destinations/${idOrSlug}`);
    if (!res.ok) throw new Error('Failed to load destination details');
    return res.json();
  },

  async searchGlobal(q: string): Promise<{ results: any[] }> {
    const res = await fetch(`${API_BASE}/destinations/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Festivals
  async getFestivals(): Promise<{ festivals: Festival[]; total: number }> {
    const res = await fetch(`${API_BASE}/festivals`);
    if (!res.ok) throw new Error('Failed to load festivals');
    return res.json();
  },

  async getFestival(idOrSlug: string): Promise<{ festival: Festival }> {
    const res = await fetch(`${API_BASE}/festivals/${idOrSlug}`);
    if (!res.ok) throw new Error('Failed to load festival details');
    return res.json();
  },

  // Transport Comparison
  async compareTransport(body: {
    sourceCity: string;
    destinationId?: string;
    destinationSlug?: string;
    travellers: number;
    travelDate: string;
    userBudgetPreference?: string;
    preferredTransport?: string;
  }): Promise<TransportComparisonResult> {
    const res = await fetch(`${API_BASE}/transport/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to compare transport options');
    }
    return res.json();
  },

  // Hotels
  async getHotels(params?: Record<string, string>): Promise<{ hotels: Hotel[]; total: number }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/hotels?${query}`);
    if (!res.ok) throw new Error('Failed to load hotels');
    return res.json();
  },

  // Restaurants
  async getRestaurants(params?: Record<string, string>): Promise<{ restaurants: Restaurant[]; total: number }> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/restaurants?${query}`);
    if (!res.ok) throw new Error('Failed to load restaurants');
    return res.json();
  },

  // Trips
  async getTrips(): Promise<{ trips: Trip[] }> {
    const res = await fetch(`${API_BASE}/trips`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },

  async getTrip(id: string): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch trip');
    return res.json();
  },

  async createTrip(tripData: any): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(tripData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create trip');
    }
    return res.json();
  },

  async updateTrip(id: string, updates: Partial<Trip>): Promise<{ trip: Trip }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update trip');
    return res.json();
  },

  async toggleActivity(tripId: string, activityId: string, completed?: boolean): Promise<{ trip: Trip; activity: any; completedCount: number; totalCount: number }> {
    const res = await fetch(`${API_BASE}/trips/${tripId}/activities/${activityId}/complete`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ completed })
    });
    if (!res.ok) throw new Error('Failed to update activity');
    return res.json();
  },

  async deleteTrip(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete trip');
    return res.json();
  },

  // Saved Items
  async getSavedItems(): Promise<{ savedItems: SavedItem[] }> {
    const res = await fetch(`${API_BASE}/saved`, {
      headers: getAuthHeader()
    });
    if (!res.ok) return { savedItems: [] };
    return res.json();
  },

  async toggleSavedItem(itemType: SavedItem['itemType'], itemId: string, itemData: any): Promise<{ saved: boolean; item?: SavedItem }> {
    const res = await fetch(`${API_BASE}/saved`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ itemType, itemId, itemData })
    });
    if (!res.ok) throw new Error('Failed to toggle saved item');
    return res.json();
  },

  // Playlists
  async getPlaylists(category?: string): Promise<{ playlists: Playlist[] }> {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`${API_BASE}/playlists${query}`);
    if (!res.ok) throw new Error('Failed to fetch playlists');
    return res.json();
  },

  // Admin
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Admin authorization required');
    return res.json();
  },

  async createAdminDestination(dest: Partial<Destination>): Promise<{ destination: Destination }> {
    const res = await fetch(`${API_BASE}/admin/destinations`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(dest)
    });
    if (!res.ok) throw new Error('Failed to create destination');
    return res.json();
  },

  async deleteAdminDestination(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/destinations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete destination');
    return res.json();
  }
};
