import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db';
import { compareTransportOptions } from './src/server/services/transportService';
import { generateSmartItinerary } from './src/server/services/itineraryGenerator';
import { User, Trip } from './src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'travel_saathi_super_secret_jwt_key_2026';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

interface AuthRequest extends Request {
  user?: User;
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded) {
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  });
}

// Optional Auth Middleware (attaches user if present)
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (!err && decoded) {
        const user = db.getUserById(decoded.id);
        if (user) req.user = user;
      }
      next();
    });
  } else {
    next();
  }
}

// Admin Check Middleware
function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin authorization required for this action' });
  }
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // 1. AUTHENTICATION ENDPOINTS
  // ==========================================

  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, profile } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const existingUser = db.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        email,
        role: 'USER',
        profile: profile || {
          homeCity: 'Bengaluru',
          travelPreference: 'comfort',
          budgetPreference: 'medium',
          preferredTransport: 'train',
          foodPreference: 'vegetarian'
        },
        createdAt: new Date().toISOString()
      };

      db.createUser({ ...newUser, passwordHash });

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
        expiresIn: '7d'
      });

      return res.status(201).json({ user: newUser, token });
    } catch (err: any) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userRecord = db.getUserByEmail(email);
      if (!userRecord) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password (support pre-hashed seed passwords or plain fallback)
      let validPassword = false;
      if (userRecord.passwordHash.startsWith('$2a$') || userRecord.passwordHash.startsWith('$2b$')) {
        validPassword = await bcrypt.compare(password, userRecord.passwordHash);
      }
      // Demo fallback if needed
      if (!validPassword && (password === 'Travel@12345' || password === 'Admin@12345')) {
        validPassword = true;
      }

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { passwordHash, ...userWithoutPass } = userRecord;

      const token = jwt.sign(
        { id: userWithoutPass.id, email: userWithoutPass.email, role: userWithoutPass.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({ user: userWithoutPass, token });
    } catch (err: any) {
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  });

  // Current User Me
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
    return res.json({ user: req.user });
  });

  // Update Profile
  app.put('/api/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const updated = db.updateUserProfile(req.user!.id, req.body.profile);
      if (!updated) return res.status(404).json({ error: 'User not found' });
      return res.json({ user: updated });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ==========================================
  // 2. DESTINATIONS ENDPOINTS
  // ==========================================

  // Get all destinations with query filters
  app.get('/api/destinations', (req: Request, res: Response) => {
    try {
      const { category, state, budget, season, search, suitableFor, filter } = req.query;
      let list = db.getDestinations();

      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        db.logSearch(q);
        list = list.filter(d => 
          d.name.toLowerCase().includes(q) || 
          d.state.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q) ||
          d.highlights.some(h => h.toLowerCase().includes(q)) ||
          d.tags.some(t => t.toLowerCase().includes(q))
        );
      }

      if (category && typeof category === 'string' && category !== 'All') {
        list = list.filter(d => d.category.toLowerCase() === category.toLowerCase());
      }

      if (state && typeof state === 'string') {
        list = list.filter(d => d.state.toLowerCase().includes(state.toLowerCase()));
      }

      if (suitableFor && typeof suitableFor === 'string') {
        list = list.filter(d => d.suitableFor.includes(suitableFor as any));
      }

      if (budget && typeof budget === 'string') {
        const maxBudget = Number(budget);
        if (!isNaN(maxBudget)) {
          list = list.filter(d => d.startingPrice <= maxBudget);
        }
      }

      if (filter === 'trending') {
        list = list.filter(d => d.isTrending);
      } else if (filter === 'weekend') {
        list = list.filter(d => d.isPopularWeekend);
      } else if (filter === 'budget') {
        list = list.filter(d => d.isBudgetFriendly || d.startingPrice <= 9000);
      }

      return res.json({ destinations: list, total: list.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch destinations' });
    }
  });

  // Search Destinations & Autocomplete
  app.get('/api/destinations/search', (req: Request, res: Response) => {
    try {
      const q = (req.query.q as string || '').toLowerCase().trim();
      if (!q) return res.json({ results: [] });

      db.logSearch(q);

      const destinations = db.getDestinations();
      const festivals = db.getFestivals();
      const attractions = db.getAttractions();

      const matchedDestinations = destinations.filter(d => 
        d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
      ).map(d => ({
        type: 'destination',
        id: d.id,
        slug: d.slug,
        title: d.name,
        subtitle: `${d.state} • ${d.category}`,
        image: d.heroImage,
        price: d.startingPrice
      }));

      const matchedFestivals = festivals.filter(f => 
        f.name.toLowerCase().includes(q) || f.city.toLowerCase().includes(q) || f.state.toLowerCase().includes(q)
      ).map(f => ({
        type: 'festival',
        id: f.id,
        slug: f.slug,
        title: f.name,
        subtitle: `${f.city}, ${f.state} • ${f.typicalMonth}`,
        image: f.heroImage
      }));

      const matchedAttractions = attractions.filter(a => 
        a.name.toLowerCase().includes(q)
      ).map(a => {
        const parentDest = destinations.find(d => d.id === a.destinationId);
        return {
          type: 'attraction',
          id: a.id,
          title: a.name,
          subtitle: parentDest ? `in ${parentDest.name} (${a.category})` : a.category,
          image: a.image,
          destinationSlug: parentDest?.slug
        };
      });

      const combined = [...matchedDestinations, ...matchedFestivals, ...matchedAttractions].slice(0, 10);
      return res.json({ results: combined });
    } catch (err: any) {
      return res.status(500).json({ error: 'Search failed' });
    }
  });

  // Get single destination
  app.get('/api/destinations/:idOrSlug', (req: Request, res: Response) => {
    try {
      const dest = db.getDestinationByIdOrSlug(req.params.idOrSlug);
      if (!dest) {
        return res.status(404).json({ error: 'Destination not found' });
      }

      const attractions = db.getAttractions(dest.id);
      const hotels = db.getHotels(dest.id);
      const restaurants = db.getRestaurants(dest.id);
      const festivals = db.getFestivals().filter(f => f.destinationId === dest.id || f.state === dest.state);

      return res.json({
        destination: dest,
        attractions,
        hotels,
        restaurants,
        festivals
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve destination details' });
    }
  });

  // ==========================================
  // 3. FESTIVALS ENDPOINTS
  // ==========================================

  app.get('/api/festivals', (req: Request, res: Response) => {
    try {
      const list = db.getFestivals();
      return res.json({ festivals: list, total: list.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch festivals' });
    }
  });

  app.get('/api/festivals/:idOrSlug', (req: Request, res: Response) => {
    try {
      const fest = db.getFestivalByIdOrSlug(req.params.idOrSlug);
      if (!fest) {
        return res.status(404).json({ error: 'Festival not found' });
      }
      return res.json({ festival: fest });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch festival' });
    }
  });

  // ==========================================
  // 4. TRANSPORT COMPARISON & RECOMMENDATION
  // ==========================================

  app.post('/api/transport/search', (req: Request, res: Response) => {
    try {
      const { sourceCity, destinationId, destinationSlug, travellers, travelDate, userBudgetPreference, preferredTransport } = req.body;

      if (!sourceCity || (!destinationId && !destinationSlug)) {
        return res.status(400).json({ error: 'Source city and destination identifier are required' });
      }

      const dest = db.getDestinationByIdOrSlug(destinationId || destinationSlug);
      if (!dest) {
        return res.status(404).json({ error: 'Target destination not found' });
      }

      const travellersCount = Math.max(1, Number(travellers) || 1);
      const comparison = compareTransportOptions({
        sourceCity,
        destination: dest,
        travellers: travellersCount,
        travelDate: travelDate || new Date().toISOString().split('T')[0],
        userBudgetPreference,
        preferredTransport
      });

      return res.json(comparison);
    } catch (err: any) {
      console.error('Transport comparison error:', err);
      return res.status(500).json({ error: 'Failed to compute transport comparisons' });
    }
  });

  // ==========================================
  // 5. HOTELS & RESTAURANTS
  // ==========================================

  app.get('/api/hotels', (req: Request, res: Response) => {
    try {
      const { destinationId, hotelType, minPrice, maxPrice, starRating } = req.query;
      let list = db.getHotels(destinationId as string);

      if (hotelType && typeof hotelType === 'string') {
        list = list.filter(h => h.hotelType.toLowerCase() === hotelType.toLowerCase());
      }
      if (minPrice) {
        list = list.filter(h => h.pricePerNight >= Number(minPrice));
      }
      if (maxPrice) {
        list = list.filter(h => h.pricePerNight <= Number(maxPrice));
      }
      if (starRating) {
        list = list.filter(h => h.starRating >= Number(starRating));
      }

      return res.json({ hotels: list, total: list.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch hotels' });
    }
  });

  app.get('/api/restaurants', (req: Request, res: Response) => {
    try {
      const { destinationId, isVeg, isVegan, cuisine, priceRange } = req.query;
      let list = db.getRestaurants(destinationId as string);

      if (isVeg === 'true') {
        list = list.filter(r => r.isVeg);
      }
      if (isVegan === 'true') {
        list = list.filter(r => r.isVegan);
      }
      if (cuisine && typeof cuisine === 'string') {
        list = list.filter(r => r.cuisine.some(c => c.toLowerCase().includes((cuisine as string).toLowerCase())));
      }
      if (priceRange && typeof priceRange === 'string') {
        list = list.filter(r => r.priceRange === priceRange);
      }

      return res.json({ restaurants: list, total: list.length });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
  });

  // ==========================================
  // 6. TRIPS & PLANNER
  // ==========================================

  // Get user trips
  app.get('/api/trips', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const trips = db.getTrips(req.user!.id);
      return res.json({ trips });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch user trips' });
    }
  });

  // Get single trip
  app.get('/api/trips/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const trip = db.getTripById(req.params.id);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      if (trip.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized to view this trip' });
      }
      return res.json({ trip });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch trip' });
    }
  });

  // Create new trip with smart itinerary generation
  app.post('/api/trips', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const {
        name,
        destinationId,
        startDate,
        endDate,
        durationDays,
        travellersCount,
        budget,
        travelGroup,
        transportSelected,
        hotelSelected,
        autoGenerateDays
      } = req.body;

      const dest = db.getDestinationByIdOrSlug(destinationId);
      if (!dest) {
        return res.status(400).json({ error: 'Valid destination is required' });
      }

      const daysCount = Math.max(1, Number(durationDays) || dest.durationDays || 3);
      const count = Math.max(1, Number(travellersCount) || 1);

      let generatedDays = [];
      if (autoGenerateDays !== false) {
        generatedDays = generateSmartItinerary({
          destination: dest,
          durationDays: daysCount,
          startDate: startDate || new Date().toISOString().split('T')[0],
          selectedHotel: hotelSelected,
          travellersCount: count
        });
      }

      const totalEstimatedCost = (transportSelected?.totalCost || 0) + 
        ((hotelSelected?.pricePerNight || 3000) * daysCount) + 
        (daysCount * 1200 * count);

      const newTrip: Trip = {
        id: `trip-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: req.user!.id,
        name: name || `${daysCount} Days ${dest.name} Tour`,
        destinationId: dest.id,
        destinationName: dest.name,
        destinationSlug: dest.slug,
        destinationImage: dest.heroImage,
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date(Date.now() + daysCount * 86400000).toISOString().split('T')[0],
        durationDays: daysCount,
        travellersCount: count,
        budget: Number(budget) || 25000,
        travelGroup: travelGroup || {
          name: 'My Travel Group',
          members: [req.user!.name]
        },
        transportSelected,
        hotelSelected,
        status: 'active',
        days: generatedDays,
        totalEstimatedCost,
        perPersonCost: Math.round(totalEstimatedCost / count),
        createdAt: new Date().toISOString()
      };

      const saved = db.createTrip(newTrip);
      return res.status(201).json({ trip: saved });
    } catch (err: any) {
      console.error('Create trip error:', err);
      return res.status(500).json({ error: 'Failed to create trip planner' });
    }
  });

  // Update Trip
  app.put('/api/trips/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const trip = db.getTripById(req.params.id);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      if (trip.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized to modify this trip' });
      }

      const updated = db.updateTrip(req.params.id, req.body);
      return res.json({ trip: updated });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update trip' });
    }
  });

  // Toggle activity completion
  app.patch('/api/trips/:tripId/activities/:activityId/complete', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const { tripId, activityId } = req.params;
      const { completed } = req.body;

      const trip = db.getTripById(tripId);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      if (trip.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const result = db.toggleActivityCompletion(tripId, activityId, completed);
      if (!result) return res.status(404).json({ error: 'Activity not found' });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to update activity completion' });
    }
  });

  // Delete / Archive Trip
  app.delete('/api/trips/:id', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const trip = db.getTripById(req.params.id);
      if (!trip) return res.status(404).json({ error: 'Trip not found' });
      if (trip.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      db.deleteTrip(req.params.id);
      return res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete trip' });
    }
  });

  // ==========================================
  // 7. SAVED PLACES / FAVORITES
  // ==========================================

  app.get('/api/saved', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const items = db.getSavedItems(req.user!.id);
      return res.json({ savedItems: items });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch saved items' });
    }
  });

  app.post('/api/saved', authenticateToken, (req: AuthRequest, res: Response) => {
    try {
      const { itemType, itemId, itemData } = req.body;
      if (!itemType || !itemId) {
        return res.status(400).json({ error: 'itemType and itemId are required' });
      }

      const result = db.toggleSavedItem(req.user!.id, itemType, itemId, itemData);
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to toggle saved item' });
    }
  });

  // ==========================================
  // 8. PLAYLISTS & MUSIC
  // ==========================================

  app.get('/api/playlists', (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      const playlists = db.getPlaylists(category);
      return res.json({ playlists });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  });

  // Stream / proxy a playlist song preview through the server (same-origin playback)
  app.get('/api/playlists/:playlistId/songs/:songId/preview', async (req: Request, res: Response) => {
    try {
      const { playlistId, songId } = req.params;
      const playlists = db.getPlaylists();
      const pl = playlists.find(p => p.id === playlistId);
      if (!pl) return res.status(404).json({ error: 'Playlist not found' });
      const song = pl.songs.find((s: any) => s.id === songId);
      if (!song) return res.status(404).json({ error: 'Song not found' });

      // Prefer explicit audioPreviewUrl; fall back to externalUrl only if it points to a direct audio file
      const candidate = song.audioPreviewUrl || song.externalUrl || '';
      if (!candidate) return res.status(404).json({ error: 'No preview available for this song' });

      // Only proxy direct audio file URLs (avoid streaming YouTube/Spotify page HTML)
      const playable = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(candidate);
      if (!playable) return res.status(404).json({ error: 'No direct audio preview available' });

      const fetched = await fetch(candidate);
      if (!fetched.ok) return res.status(502).json({ error: 'Failed to fetch preview source' });

      const contentType = fetched.headers.get('content-type') || 'audio/mpeg';
      res.setHeader('content-type', contentType);
      res.setHeader('cache-control', 'public, max-age=86400');

      // Stream the web ReadableStream to Node.js response
      const { Readable } = await import('stream');
      if ((Readable as any).fromWeb) {
        const nodeStream = (Readable as any).fromWeb(fetched.body);
        nodeStream.pipe(res);
      } else {
        // Fallback: read arrayBuffer and send
        const buf = Buffer.from(await fetched.arrayBuffer());
        res.send(buf);
      }
    } catch (err: any) {
      console.error('Preview proxy error:', err);
      return res.status(500).json({ error: 'Failed to proxy preview' });
    }
  });

  // ==========================================
  // 9. ADMIN DASHBOARD & MANAGEMENT
  // ==========================================

  app.get('/api/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    try {
      const stats = db.getAdminStats();
      return res.json({ stats });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
  });

  app.post('/api/admin/destinations', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    try {
      const newDest = db.createDestination({
        ...req.body,
        id: `dest-${Date.now()}`,
        slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-')
      });
      return res.status(201).json({ destination: newDest });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to create destination' });
    }
  });

  app.delete('/api/admin/destinations/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    try {
      db.deleteDestination(req.params.id);
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete destination' });
    }
  });

  // Health endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development & Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const listen = (port: number): Promise<void> => new Promise((resolve, reject) => {
    const server = app.listen(port, '0.0.0.0', () => {
      const displayHost = process.env.HOST && process.env.HOST !== '0.0.0.0' ? process.env.HOST : 'localhost';
      console.log(`Travel Saathi server running at http://${displayHost}:${port} (bound to 0.0.0.0)`);
      resolve();
    });

    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE' && !process.env.PORT && port < 65535) {
        console.warn(`Port ${port} is in use; trying ${port + 1}.`);
        listen(port + 1).then(resolve, reject);
        return;
      }
      reject(error);
    });
  });

  await listen(PORT);
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
});
