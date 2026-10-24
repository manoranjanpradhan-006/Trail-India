import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { FestivalDetailModal } from './components/FestivalDetailModal';
import { FoodDetailModal } from './components/FoodDetailModal';
import { SearchModal } from './components/SearchModal';
import { MapView } from './components/MapView';

// Pages
import { Home } from './pages/Home';
import { StatePage } from './pages/StatePage';

// Feature Sections
import { DestinationsSection } from './features/destinations/DestinationsSection';
import { ExperiencesSection } from './features/experiences/ExperiencesSection';
import { FoodCultureSection } from './features/food/FoodCultureSection';
import { FestivalsSection } from './features/festivals/FestivalsSection';
import { BlogSection } from './features/blog/BlogSection';
import { CommunitySection } from './features/community/CommunitySection';
import { TripPlannerSection } from './features/trips/TripPlannerSection';

import { api } from './services/api';

export const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Data states
  const [destinations, setDestinations] = useState([]);
  const [places, setPlaces] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [trips, setTrips] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState('');
  
  const [selectedPlaceModal, setSelectedPlaceModal] = useState(null);
  const [selectedDestModal, setSelectedDestModal] = useState(null);
  const [selectedFestivalModal, setSelectedFestivalModal] = useState(null);
  const [selectedFoodModal, setSelectedFoodModal] = useState(null);
  const [mapTargetPlace, setMapTargetPlace] = useState(null);

  useEffect(() => {
    loadData();
    checkAuthSession();
  }, []);

  const loadData = async () => {
    try {
      const [destsData, placesData, expsData, festsData, foodsData, blogsData, commData, tripsData, favsData] = await Promise.all([
        api.getDestinations().catch(() => []),
        api.getPlaces().catch(() => []),
        api.getExperiences().catch(() => []),
        api.getFestivals().catch(() => []),
        api.getFoods().catch(() => []),
        api.getBlogPosts().catch(() => []),
        api.getCommunityPosts().catch(() => []),
        api.getTrips().catch(() => []),
        api.getFavorites().catch(() => []),
      ]);

      setDestinations(destsData);
      setPlaces(placesData);
      setExperiences(expsData);
      setFestivals(festsData);
      setFoods(foodsData);
      setBlogPosts(blogsData);
      setCommunityPosts(commData);
      setTrips(tripsData);
      setFavorites(favsData.map((f) => f.place_id));
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
    } catch (e) {
      localStorage.removeItem('trail_india_token');
      setUser(null);
    }
  };

  const handleToggleFavorite = async (itemId) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isCurrentlyFav = favorites.includes(itemId);
    if (isCurrentlyFav) {
      await api.removeFavorite(itemId);
      setFavorites((prev) => prev.filter((id) => id !== itemId));
    } else {
      await api.addFavorite(itemId);
      setFavorites((prev) => [...prev, itemId]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('trail_india_token');
    setUser(null);
  };

  const handleViewOnMap = (target) => {
    setMapTargetPlace(target);
    navigate('/map');
  };

  const handleOpenSearchModal = (initialQ = '') => {
    setSearchModalQuery(typeof initialQ === 'string' ? initialQ : '');
    setIsSearchModalOpen(true);
  };

  const handleCreateCommunityPost = async (postData) => {
    const created = await api.createCommunityPost(postData);
    setCommunityPosts((prev) => [created, ...prev]);
    return created;
  };

  const favoritePlacesList = places.filter((p) => favorites.includes(p.id));
  const foodSpotsList = places.filter((p) => p.category === 'food_spot');

  return (
    <div className="min-h-screen bg-[#06110D] text-[#F8F1E5] flex flex-col justify-between selection:bg-[#E8B65C] selection:text-[#06110D] font-sans">
      
      {/* Royal Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        favoritesCount={favorites.length}
        onOpenSearch={handleOpenSearchModal}
      />

      {/* Main Routed Content Viewport */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 w-full flex-1">
        
        <Routes>
          {/* 1. HOME ROUTE */}
          <Route
            path="/"
            element={
              <Home
                destinations={destinations}
                experiences={experiences}
                festivals={festivals}
                stories={blogPosts}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectDestination={(dest) => setSelectedDestModal(dest)}
                onSelectExperience={(exp) => setSelectedPlaceModal(exp)}
                onSelectFestival={(fest) => setSelectedFestivalModal(fest)}
                onSelectPlace={(pl) => setSelectedPlaceModal(pl)}
                onOpenSearch={handleOpenSearchModal}
              />
            }
          />

          {/* 2. DEDICATED STATE ROUTE (e.g. /state/odisha, /state/rajasthan) */}
          <Route
            path="/state/:stateId"
            element={
              <StatePage
                onSelectPlace={(place) => setSelectedPlaceModal(place)}
                onSelectFestival={(fest) => setSelectedFestivalModal(fest)}
                onSelectFood={(fd) => setSelectedFoodModal(fd)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onOpenTripPlanner={(stateName) => navigate('/planner')}
              />
            }
          />

          {/* 3. EXPLORE / DESTINATIONS */}
          <Route
            path="/explore"
            element={
              <DestinationsSection
                destinations={destinations}
                places={places}
                onSelectPlace={(place) => setSelectedPlaceModal(place)}
                onSelectDestination={(dest) => setSelectedDestModal(dest)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/destinations"
            element={
              <DestinationsSection
                destinations={destinations}
                places={places}
                onSelectPlace={(place) => setSelectedPlaceModal(place)}
                onSelectDestination={(dest) => setSelectedDestModal(dest)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />

          {/* 4. EXPERIENCES */}
          <Route
            path="/experiences"
            element={
              <ExperiencesSection
                experiences={experiences}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectExperience={(exp) => setSelectedPlaceModal(exp)}
              />
            }
          />

          {/* 5. FESTIVALS */}
          <Route
            path="/festivals"
            element={
              <FestivalsSection 
                festivals={festivals} 
                onSelectFestival={(fest) => setSelectedFestivalModal(fest)}
              />
            }
          />

          {/* 6. FOOD & CULTURE */}
          <Route
            path="/food"
            element={
              <FoodCultureSection
                foods={foods}
                foodSpots={foodSpotsList}
                onSelectPlace={(place) => setSelectedPlaceModal(place)}
                onSelectFood={(fd) => setSelectedFoodModal(fd)}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />

          {/* 7. BLOG */}
          <Route
            path="/blog"
            element={
              <BlogSection
                posts={blogPosts}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onRefreshPosts={loadData}
              />
            }
          />

          {/* 8. COMMUNITY */}
          <Route
            path="/community"
            element={
              <CommunitySection
                communityPosts={communityPosts}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onCreatePost={handleCreateCommunityPost}
              />
            }
          />

          {/* 9. SOVEREIGN MAP */}
          <Route
            path="/map"
            element={
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5] flex items-center gap-2">
                      <span>✨</span> Golden Sovereign Map of India
                    </h2>
                    <p className="text-xs text-[#E8B65C]">
                      Featuring illuminated golden borders & curated trails across all 28 Indian states
                    </p>
                  </div>
                </div>
                <MapView
                  places={places}
                  selectedPlace={mapTargetPlace}
                  onSelectPlace={(place) => setSelectedPlaceModal(place)}
                />
              </div>
            }
          />

          {/* 10. TRIP PLANNER */}
          <Route
            path="/planner"
            element={
              <TripPlannerSection
                trips={trips}
                favorites={favoritePlacesList}
                allPlaces={places}
                user={user}
                onOpenAuth={() => setIsAuthModalOpen(true)}
                onRefreshTrips={loadData}
                onSelectPlace={(place) => setSelectedPlaceModal(place)}
              />
            }
          />

          {/* Fallback to Home */}
          <Route
            path="*"
            element={
              <Home
                destinations={destinations}
                experiences={experiences}
                festivals={festivals}
                stories={blogPosts}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectDestination={(dest) => setSelectedDestModal(dest)}
                onSelectExperience={(exp) => setSelectedPlaceModal(exp)}
                onSelectFestival={(fest) => setSelectedFestivalModal(fest)}
                onSelectPlace={(pl) => setSelectedPlaceModal(pl)}
                onOpenSearch={handleOpenSearchModal}
              />
            }
          />
        </Routes>

      </main>

      {/* ============================================================ */}
      {/* ROYAL DETAIL MODALS */}
      {/* ============================================================ */}

      {/* Universal Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        initialQuery={searchModalQuery}
        destinations={destinations}
        places={places}
        festivals={festivals}
        foods={foods}
        stories={blogPosts}
        onSelectDestination={(dest) => {
          setIsSearchModalOpen(false);
          if (dest.slug) {
            navigate(`/state/${dest.slug}`);
          } else {
            setSelectedDestModal(dest);
          }
        }}
        onSelectPlace={(pl) => {
          setIsSearchModalOpen(false);
          setSelectedPlaceModal(pl);
        }}
        onSelectFestival={(fest) => {
          setIsSearchModalOpen(false);
          setSelectedFestivalModal(fest);
        }}
        onSelectFood={(fd) => {
          setIsSearchModalOpen(false);
          setSelectedFoodModal(fd);
        }}
        onSelectStory={(st) => {
          setIsSearchModalOpen(false);
          navigate('/blog');
        }}
      />

      {/* Destination Detail Modal */}
      <DestinationDetailModal
        destination={selectedDestModal}
        places={places}
        onClose={() => setSelectedDestModal(null)}
        isFavorite={selectedDestModal ? favorites.includes(selectedDestModal.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onSelectPlace={(pl) => setSelectedPlaceModal(pl)}
        onViewOnMap={handleViewOnMap}
      />

      {/* Place / Attraction Detail Modal */}
      <PlaceDetailModal
        place={selectedPlaceModal}
        onClose={() => setSelectedPlaceModal(null)}
        user={user}
        isFavorite={selectedPlaceModal ? favorites.includes(selectedPlaceModal.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onViewOnMap={handleViewOnMap}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Festival Detail Modal */}
      <FestivalDetailModal
        festival={selectedFestivalModal}
        onClose={() => setSelectedFestivalModal(null)}
      />

      {/* Food Detail Modal */}
      <FoodDetailModal
        food={selectedFoodModal}
        onClose={() => setSelectedFoodModal(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(u) => {
          setUser(u);
          loadData();
        }}
      />

      {/* Royal Footer */}
      <Footer onNavigateTab={(t) => navigate(t === 'home' ? '/' : `/${t}`)} />
    </div>
  );
};

export default App;
