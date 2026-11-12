import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SavedProvider } from './context/SavedContext';
import { Destination, Festival, TransportOption, Hotel } from './types';
import { api } from './lib/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DestinationCard, getCategoryIcon } from './components/DestinationCard';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { TransportComparisonView } from './components/TransportComparisonView';
import { TripPlannerView } from './components/TripPlannerView';
import { HotelComparisonView } from './components/HotelComparisonView';
import { RestaurantDiscoveryView } from './components/RestaurantDiscoveryView';
import { FestivalDiscoveryView } from './components/FestivalDiscoveryView';
import { PlaylistJourneyPlayer } from './components/PlaylistJourneyPlayer';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { SavedItemsView } from './components/SavedItemsView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { TripCreationWizardModal } from './components/TripCreationWizardModal';

import { 
  Compass, 
  Search, 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Train, 
  Flame, 
  Building2, 
  Luggage, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  HeartHandshake
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Beaches',
  'Mountains',
  'Heritage',
  'Nature',
  'Festivals',
  'Spiritual'
];

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('explore');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isTripWizardOpen, setIsTripWizardOpen] = useState<boolean>(false);
  const [wizardInitDest, setWizardInitDest] = useState<Destination | undefined>(undefined);
  const [wizardInitTransport, setWizardInitTransport] = useState<TransportOption | undefined>(undefined);
  const [wizardInitTravellers, setWizardInitTravellers] = useState<number>(2);
  const [newlyCreatedTrip, setNewlyCreatedTrip] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load Destinations
  const loadDestinations = async () => {
    try {
      const res = await api.getDestinations();
      setDestinations(res.destinations || []);
    } catch (err) {
      console.error('Failed to load destinations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  const handleOpenPlanTrip = (dest: Destination) => {
    setWizardInitDest(dest);
    setActiveTab('trips');
    setIsTripWizardOpen(true);
  };

  const handleCompareTransportFromDest = (dest: Destination) => {
    setWizardInitDest(dest);
    setActiveTab('transport');
  };

  const handleSelectTransportForTrip = (dest: Destination, transport: TransportOption, travellers: number) => {
    setWizardInitDest(dest);
    setWizardInitTransport(transport);
    setWizardInitTravellers(travellers);
    setIsTripWizardOpen(true);
  };

  const handlePlanTripToFestival = (festival: Festival) => {
    const matchedDest = destinations.find(d => d.id === festival.destinationId || d.state === festival.state);
    if (matchedDest) {
      setWizardInitDest(matchedDest);
    }
    setIsTripWizardOpen(true);
  };

  const handleSelectSearchResult = (result: any) => {
    if (result.type === 'destination') {
      const dest = destinations.find(d => d.id === result.id || d.slug === result.slug);
      if (dest) setSelectedDestination(dest);
    } else if (result.type === 'festival') {
      setActiveTab('festivals');
    } else if (result.destinationSlug) {
      const dest = destinations.find(d => d.slug === result.destinationSlug);
      if (dest) setSelectedDestination(dest);
    }
  };

  const filteredDestinations = destinations.filter(d => {
    if (selectedCategory === 'All') return true;
    return d.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  const trendingDestinations = destinations.filter(d => d.isTrending).slice(0, 3);
  const weekendDestinations = destinations.filter(d => d.isPopularWeekend).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Inter'] pb-20 md:pb-0">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'home') setActiveTab('explore');
          else setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        
        {/* EXPLORE / HOME VIEW */}
        {(activeTab === 'explore' || activeTab === 'home') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-12 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center space-x-2 bg-[#6df5e1]/15 text-[#6df5e1] border border-[#6df5e1]/30 px-3.5 py-1 rounded-full text-xs font-bold mb-4 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discover Incredible India</span>
                </div>

                <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl tracking-tight leading-tight text-white">
                  Where will India take you next?
                </h1>

                <p className="text-sm sm:text-base text-slate-300 mt-3 font-normal leading-relaxed">
                  Compare multi-modal trains, flights, and road routes. Plan live day-wise itineraries, explore authentic local cuisines, and celebrate cultural festivals.
                </p>

                {/* Hero Search Bar */}
                <div className="mt-6 flex items-center bg-white/95 backdrop-blur-md rounded-2xl p-2 max-w-xl shadow-lg border border-white/20">
                  <Search className="w-5 h-5 text-slate-400 ml-3 mr-2" />
                  <input
                    type="text"
                    onFocus={() => setIsSearchOpen(true)}
                    placeholder="Search Goa, Varanasi, Manali, Jaipur..."
                    className="w-full bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm font-semibold outline-none focus:ring-0"
                    readOnly
                  />
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter Chips Bar */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 no-scrollbar">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const IconComponent = getCategoryIcon(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#6df5e1] text-[#006b5f] shadow-sm scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>

            {/* Trending India Highlights */}
            {selectedCategory === 'All' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900 tracking-tight flex items-center">
                      <TrendingUp className="w-5 h-5 text-teal-600 mr-2" />
                      <span>Trending Destinations in India</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Most planned routes and traveler favorites this season</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {trendingDestinations.map(dest => (
                    <DestinationCard
                      key={dest.id}
                      destination={dest}
                      onSelect={(d) => setSelectedDestination(d)}
                      onQuickPlan={handleOpenPlanTrip}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Destination Discovery Grid */}
            <div className="space-y-4 pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl text-slate-900 tracking-tight">
                    {selectedCategory === 'All' ? 'All Handpicked Destinations' : `${selectedCategory} Destinations`}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing {filteredDestinations.length} verified experiences across India
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-100"></div>
                  ))}
                </div>
              ) : filteredDestinations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDestinations.map(dest => (
                    <DestinationCard
                      key={dest.id}
                      destination={dest}
                      onSelect={(d) => setSelectedDestination(d)}
                      onQuickPlan={handleOpenPlanTrip}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
                  <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">No destinations found in {selectedCategory}</p>
                </div>
              )}
            </div>

            {/* Quick Feature Spotlight Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              
              {/* Transport Comparison Feature Banner */}
              <div 
                onClick={() => setActiveTab('transport')}
                className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 cursor-pointer group hover:shadow-xl transition-all border border-teal-900/50 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-teal-500/20 text-teal-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <Train className="w-3.5 h-3.5" />
                    <span>Live Transit Comparison</span>
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl sm:text-2xl text-white group-hover:text-teal-300 transition-colors">
                    Compare Train, Flight, Bus & Car
                  </h3>
                  <p className="text-xs text-slate-300 mt-2">
                    Check IRCTC train availability, direct flights, AC buses, and car fuel/toll estimates side-by-side with lowest fare guarantees.
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-bold text-teal-300 group-hover:translate-x-1 transition-transform">
                  <span>Open Multi-Modal Comparison</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </div>

              {/* Cultural Festivals Feature Banner */}
              <div 
                onClick={() => setActiveTab('festivals')}
                className="bg-gradient-to-br from-amber-950 to-orange-950 text-white rounded-3xl p-6 sm:p-8 cursor-pointer group hover:shadow-xl transition-all border border-amber-900/50 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex items-center space-x-1.5 bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-1 rounded-full mb-3">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Cultural Celebrations</span>
                  </div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl sm:text-2xl text-white group-hover:text-orange-300 transition-colors">
                    Explore India's Sacred & Folk Festivals
                  </h3>
                  <p className="text-xs text-orange-200/80 mt-2">
                    Holi in Mathura, Pushkar Camel Fair, Durga Puja, Hornbill, and Rann Utsav with live ritual timelines and planning tips.
                  </p>
                </div>

                <div className="mt-6 flex items-center text-xs font-bold text-orange-300 group-hover:translate-x-1 transition-transform">
                  <span>Explore Festival Calendar</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TRANSPORT COMPARISON VIEW */}
        {activeTab === 'transport' && (
          <TransportComparisonView
            destinations={destinations}
            initialDestination={wizardInitDest || destinations[0]}
            onSelectOptionForTrip={handleSelectTransportForTrip}
          />
        )}

        {/* HOTELS & RESORTS VIEW */}
        {activeTab === 'hotels' && (
          <HotelComparisonView
            destinations={destinations}
            initialDestinationId={wizardInitDest?.id}
          />
        )}

        {/* RESTAURANTS & FOOD TRAILS VIEW */}
        {activeTab === 'restaurants' && (
          <RestaurantDiscoveryView
            destinations={destinations}
            initialDestinationId={wizardInitDest?.id}
          />
        )}

        {/* FESTIVALS VIEW */}
        {activeTab === 'festivals' && (
          <FestivalDiscoveryView
            destinations={destinations}
            onPlanTripToFestival={handlePlanTripToFestival}
          />
        )}

        {/* MY TRIPS PLANNER VIEW */}
        {activeTab === 'trips' && (
          <TripPlannerView
            destinations={destinations}
            initialTrip={newlyCreatedTrip}
            onOpenCreateTripModal={() => setIsTripWizardOpen(true)}
            onExploreDestinations={() => setActiveTab('explore')}
          />
        )}

        {/* JOURNEY PLAYLISTS VIEW */}
        {activeTab === 'playlists' && (
          <PlaylistJourneyPlayer />
        )}

        {/* SAVED ITEMS VIEW */}
        {activeTab === 'saved' && (
          <SavedItemsView
            onSelectDestination={(d) => setSelectedDestination(d)}
            onExplore={() => setActiveTab('explore')}
          />
        )}

        {/* ADMIN DASHBOARD VIEW */}
        {activeTab === 'admin' && (
          <AdminDashboard
            destinations={destinations}
            onRefreshDestinations={loadDestinations}
          />
        )}

      </main>

      {/* Destination Details Modal */}
      {selectedDestination && (
        <DestinationDetailModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          onPlanTrip={handleOpenPlanTrip}
          onCompareTransport={handleCompareTransportFromDest}
        />
      )}

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Auth Modal */}
      <AuthModal />

      {/* User Profile Preferences Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Smart Trip Creation Wizard Modal */}
      <TripCreationWizardModal
        isOpen={isTripWizardOpen}
        onClose={() => setIsTripWizardOpen(false)}
        destinations={destinations}
        initialDestination={wizardInitDest}
        initialTransport={wizardInitTransport}
        initialTravellers={wizardInitTravellers}
        onGenerationStarted={() => setActiveTab('trips')}
        onTripCreated={(trip) => {
          setNewlyCreatedTrip(trip);
          setActiveTab('trips');
        }}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Footer */}
      <footer className="hidden md:block bg-white border-t border-slate-200/80 py-10 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-teal-700 text-white flex items-center justify-center text-xs font-bold">
              TS
            </div>
            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-slate-900 text-sm">
              TRAVEL <span className="text-teal-600">SAATHI</span>
            </span>
            <span className="text-slate-400">| Complete India Travel & Itinerary Companion</span>
          </div>

          <div className="flex items-center space-x-6 font-medium">
            <button onClick={() => setActiveTab('explore')} className="hover:text-teal-700">Explore</button>
            <button onClick={() => setActiveTab('transport')} className="hover:text-teal-700">Transport</button>
            <button onClick={() => setActiveTab('hotels')} className="hover:text-teal-700">Hotels</button>
            <button onClick={() => setActiveTab('festivals')} className="hover:text-teal-700">Festivals</button>
            <button onClick={() => setActiveTab('trips')} className="hover:text-teal-700">My Trips</button>
          </div>

          <p className="text-slate-400">
            Crafted for incredible Indian journeys • 2026
          </p>
        </div>
      </footer>

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <SavedProvider>
        <MainAppContent />
      </SavedProvider>
    </AuthProvider>
  );
}

export default App;
