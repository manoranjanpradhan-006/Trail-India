import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { MapView } from './components/MapView';
import { DestinationsSection } from './features/destinations/DestinationsSection';
import { FoodCultureSection } from './features/food/FoodCultureSection';
import { FestivalsSection } from './features/festivals/FestivalsSection';
import { BlogSection } from './features/blog/BlogSection';
import { TripPlannerSection } from './features/trips/TripPlannerSection';
import { Destination, Place, Festival, BlogPost, Trip, User } from './types';
import { api } from './services/api';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('destinations');
  
  // Data states
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPlaceModal, setSelectedPlaceModal] = useState<Place | null>(null);
  const [mapTargetPlace, setMapTargetPlace] = useState<Place | null>(null);

  // Admin moderation
  const [pendingArticles, setPendingArticles] = useState<BlogPost[]>([]);

  useEffect(() => {
    loadInitialData();
    checkAuthSession();
  }, []);

  const loadInitialData = async () => {
    try {
      const [destsData, placesData, festsData, blogsData] = await Promise.all([
        api.getDestinations().catch(() => []),
        api.getPlaces().catch(() => []),
        api.getFestivals().catch(() => []),
        api.getBlogPosts().catch(() => []),
      ]);
      setDestinations(destsData);
      setPlaces(placesData);
      setFestivals(festsData);
      setBlogPosts(blogsData);
    } catch (e) {
      console.error('Data loading error:', e);
    }
  };

  const checkAuthSession = async () => {
    const token = localStorage.getItem('trail_india_token');
    if (!token) return;

    try {
      const currentUser = await api.getMe();
      setUser(currentUser);
      loadUserPrivateData();
    } catch (e) {
      localStorage.removeItem('trail_india_token');
      setUser(null);
    }
  };

  const loadUserPrivateData = async () => {
    try {
      const [favsData, tripsData] = await Promise.all([
        api.getFavorites().catch(() => []),
        api.getTrips().catch(() => []),
      ]);
      setFavorites(favsData.map((f) => f.place_id));
      setTrips(tripsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleFavorite = async (placeId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlyFav = favorites.includes(placeId);
    if (isCurrentlyFav) {
      try {
        await api.removeFavorite(placeId);
        setFavorites((prev) => prev.filter((id) => id !== placeId));
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await api.addFavorite(placeId);
        setFavorites((prev) => [...prev, placeId]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('trail_india_token');
    setUser(null);
    setFavorites([]);
    setTrips([]);
    if (activeTab === 'admin') {
      setActiveTab('destinations');
    }
  };

  const handleViewOnMap = (place: Place) => {
    setMapTargetPlace(place);
    setActiveTab('map');
  };

  const favoritePlacesList = places.filter((p) => favorites.includes(p.id));
  const foodSpotsList = places.filter((p) => p.category === 'food_spot');

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-600 selection:text-white">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        favoritesCount={favorites.length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        
        {activeTab === 'destinations' && (
          <DestinationsSection
            destinations={destinations}
            places={places}
            onSelectPlace={(place) => setSelectedPlaceModal(place)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onViewDestination={() => {}}
          />
        )}

        {activeTab === 'food' && (
          <FoodCultureSection
            foodSpots={foodSpotsList}
            onSelectPlace={(place) => setSelectedPlaceModal(place)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'festivals' && (
          <FestivalsSection festivals={festivals} />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-serif font-bold text-white">Interactive Odisha Trail Map</h2>
                <p className="text-xs text-stone-400">Click any colored marker to view entry hours, tickets, and place details</p>
              </div>
            </div>
            <MapView
              places={places}
              selectedPlace={mapTargetPlace}
              onSelectPlace={(place) => setSelectedPlaceModal(place)}
            />
          </div>
        )}

        {activeTab === 'blog' && (
          <BlogSection
            posts={blogPosts}
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onRefreshPosts={loadInitialData}
          />
        )}

        {activeTab === 'planner' && (
          <TripPlannerSection
            trips={trips}
            favorites={favoritePlacesList}
            allPlaces={places}
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onRefreshTrips={loadUserPrivateData}
            onSelectPlace={(place) => setSelectedPlaceModal(place)}
          />
        )}

        {/* Admin Moderation Panel */}
        {activeTab === 'admin' && user?.role === 'admin' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  🛡️ Editorial Moderation
                </span>
                <h2 className="text-3xl font-serif font-bold text-white mt-2">Administrator Portal</h2>
                <p className="text-xs text-stone-400">Review pending contributor articles and community reports.</p>
              </div>
            </div>

            <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
              <h3 className="font-serif font-bold text-xl text-white">All Active Articles ({blogPosts.length})</h3>
              <div className="space-y-3">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-stone-800/40 border border-stone-800 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{post.title}</p>
                      <p className="text-xs text-stone-400">By {post.author_name} • {post.category}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold uppercase">
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          loadUserPrivateData();
        }}
      />

      <PlaceDetailModal
        place={selectedPlaceModal}
        onClose={() => setSelectedPlaceModal(null)}
        user={user}
        isFavorite={selectedPlaceModal ? favorites.includes(selectedPlaceModal.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onViewOnMap={handleViewOnMap}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
