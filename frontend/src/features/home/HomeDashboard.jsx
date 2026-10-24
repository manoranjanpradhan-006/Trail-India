import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Heart, 
  Calendar, 
  Compass, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  ArrowRight,
  BookOpen,
  Utensils,
  Camera,
  Users
} from 'lucide-react';

export const HomeDashboard = ({
  destinations,
  experiences,
  festivals,
  stories,
  favorites,
  onToggleFavorite,
  onSelectDestination,
  onSelectExperience,
  onSelectFestival,
  onSelectStory,
  onNavigateTab,
  onOpenSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('destinations');
  const [festivalCarouselIndex, setFestivalCarouselIndex] = useState(0);

  const categories = [
    { id: 'destinations', label: 'Destinations', icon: '🛕' },
    { id: 'festivals', label: 'Festivals', icon: '🪔' },
    { id: 'food', label: 'Food', icon: '🍛' },
    { id: 'experiences', label: 'Experiences', icon: '🧭' },
    { id: 'blog', label: 'Blogs', icon: '📜' },
    { id: 'community', label: 'Community', icon: '👥' },
  ];

  const interestCategories = [
    { id: 'temple', label: 'Temples', icon: '🛕', desc: 'Sacred Kalinga & Dravidian shrines' },
    { id: 'nature', label: 'Trekking', icon: '🥾', desc: 'Himalayas & Western Ghats' },
    { id: 'beach', label: 'Beaches', icon: '🏖️', desc: 'Golden sands & turquoise lagoons' },
    { id: 'wildlife', label: 'Wildlife', icon: '🐅', desc: 'National parks & tiger reserves' },
    { id: 'food_spot', label: 'Food Trails', icon: '🍛', desc: 'Royal & street gastronomies' },
    { id: 'festivals', label: 'Festivals', icon: '🪔', desc: 'Living cultural calendars' },
    { id: 'heritage', label: 'Heritage', icon: '🏛️', desc: 'Forts, palaces & UNESCO sites' },
    { id: 'roadtrip', label: 'Road Trips', icon: '🚙', desc: 'Scenic ghat & coastal highways' },
    { id: 'village', label: 'Village Life', icon: '🏡', desc: 'Artisans & rural craft villages' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onOpenSearch(searchQuery);
    }
  };

  const currentFestival = festivals[festivalCarouselIndex] || festivals[0];

  const handleNextFestival = () => {
    setFestivalCarouselIndex((prev) => (prev + 1) % festivals.length);
  };

  const handlePrevFestival = () => {
    setFestivalCarouselIndex((prev) => (prev - 1 + festivals.length) % festivals.length);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* 2-Column Royal Magazine Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ============================================================ */}
        {/* LEFT COLUMN: HERO, POPULAR DESTINATIONS, EXPLORE BY INTEREST */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Section */}
          <div className="relative rounded-3xl overflow-hidden border border-[#263B2F] shadow-2xl bg-[#0B1B14] min-h-[520px] flex flex-col justify-between p-8 sm:p-12">
            
            {/* Cinematic Sunset Heritage Fort Background */}
            <img
              src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80"
              alt="Indian Fort at Sunset"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-[#06110D]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06110D] via-[#06110D]/80 to-transparent" />

            {/* Subtle Royal Arch Motif Overlay */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#E8B65C]/10 to-transparent pointer-events-none" />

            {/* Content Top */}
            <div className="relative z-10 space-y-3 max-w-2xl">
              <span className="text-[11px] font-bold tracking-[0.25em] text-[#E8B65C] uppercase block font-sans">
                EXPLORE • DISCOVER • SHARE
              </span>
              
              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-bold text-[#F8F1E5] tracking-tight leading-[1.1] drop-shadow-md">
                Trail India
              </h1>

              <p className="text-lg sm:text-xl font-serif text-[#F4D18A] font-medium leading-relaxed max-w-xl">
                Discover the stories, places and people that make India incredible.
              </p>
              
              <p className="text-xs sm:text-sm text-[#B9B7AA] leading-relaxed max-w-lg">
                From ancient kingdoms to hidden villages, your next unforgettable journey begins here.
              </p>
            </div>

            {/* Search Bar + Cursive Flourish */}
            <div className="relative z-10 pt-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Search Bar Capsule */}
                <form 
                  onSubmit={handleSearchSubmit}
                  className="w-full sm:max-w-lg bg-[#F8F1E5] text-[#06110D] rounded-full p-1.5 pl-5 flex items-center gap-3 shadow-2xl shadow-black/60 border border-[#E8B65C]/50"
                >
                  <Search className="w-5 h-5 text-[#8C827A] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search destinations, places, festivals..."
                    className="w-full bg-transparent text-sm text-[#06110D] placeholder:text-[#8C827A] focus:outline-none py-1.5 font-sans font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-xs px-6 py-2.5 rounded-full transition shadow-md shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Elegant Cursive Golden Flourish */}
                <div className="hidden md:block select-none transform rotate-[-4deg]">
                  <p className="font-cursive text-2xl lg:text-3xl text-[#E8B65C] leading-none drop-shadow-[0_2px_10px_rgba(232,182,92,0.3)]">
                    Incredible India
                  </p>
                  <p className="font-cursive text-xl lg:text-2xl text-[#F4D18A] pl-6 leading-none">
                    Endless Trails ✨
                  </p>
                </div>
              </div>

              {/* Quick-Access Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2">
                {categories.map((cat) => {
                  const isActive = activeCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategoryFilter(cat.id);
                        if (cat.id !== 'destinations') {
                          onNavigateTab(cat.id);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                        isActive
                          ? 'bg-[#10251B] text-[#E8B65C] border-[#E8B65C] shadow-[0_0_12px_rgba(232,182,92,0.2)]'
                          : 'bg-[#06110D]/70 text-[#B9B7AA] border-[#263B2F] hover:text-[#F8F1E5] hover:border-[#E8B65C]/50'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Ornate Indian Border Divider */}
          <div className="flex items-center gap-4 text-[#E8B65C]/40">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#263B2F]" />
            <span className="text-xs">✦ ❖ ✦</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#263B2F]" />
          </div>

          {/* Popular Destinations Section */}
          <div className="space-y-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
                  Popular Destinations
                </h2>
                <p className="text-xs text-[#B9B7AA] mt-1">
                  From the Himalayas to the coast, from temples to forests — find your next story.
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('destinations')}
                className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition"
              >
                <span>View All</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {/* 6 Destination Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {destinations.slice(0, 6).map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => onSelectDestination(dest)}
                  className="group relative h-64 rounded-2xl overflow-hidden border border-[#263B2F] bg-[#10251B] cursor-pointer card-hover-effect flex flex-col justify-end p-4 text-left select-none"
                >
                  <img
                    src={dest.banner_image}
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-[#06110D]/60 to-transparent" />
                  
                  <div className="relative z-10 space-y-1">
                    <h3 className="font-serif font-bold text-lg text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                      {dest.name}
                    </h3>
                    <p className="text-[11px] text-[#B9B7AA] line-clamp-1">
                      {dest.tagline}
                    </p>

                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1 bg-[#06110D]/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-[#E8B65C] border border-[#263B2F] font-semibold">
                        <MapPin className="w-3 h-3 text-[#E8B65C]" />
                        {dest.place_count || 100}+ places
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explore by Interest Section */}
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
                Explore by Interest
              </h2>
              <p className="text-xs text-[#B9B7AA] mt-1">
                Discover India your way.
              </p>
            </div>

            {/* 9 Category Square Tiles */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
              {interestCategories.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigateTab('destinations');
                  }}
                  className="p-3 rounded-2xl bg-[#10251B] hover:bg-[#153224] border border-[#263B2F] hover:border-[#E8B65C]/60 flex flex-col items-center justify-center text-center gap-2 transition-all duration-200 group"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-xs font-medium text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: PLAN YOUR JOURNEY, EXPERIENCES, FESTIVALS, BLOG */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Plan Your Journey Royal Widget */}
          <div className="relative bg-[#10251B] border border-[#263B2F] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 overflow-hidden">
            
            {/* Subtle Mandala Silhouette Watermark */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-radial from-[#E8B65C]/10 to-transparent pointer-events-none rounded-full" />

            <div className="text-center space-y-2 relative z-10">
              <span className="text-xl">🛕</span>
              <h3 className="font-serif font-bold text-2xl text-[#E8B65C]">
                Plan Your Journey
              </h3>
              <p className="text-xs text-[#B9B7AA] leading-relaxed max-w-xs mx-auto">
                Get personalised recommendations, save places, and create your own travel itinerary.
              </p>
            </div>

            {/* 4 Feature Action Tiles (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              
              <button
                onClick={() => onNavigateTab('destinations')}
                className="p-3.5 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] hover:border-[#E8B65C]/50 flex flex-col items-start text-left gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#E8B65C]/10 border border-[#E8B65C]/30 flex items-center justify-center text-[#E8B65C] group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">Explore Places</p>
                  <p className="text-[10px] text-[#B9B7AA]">Find hidden gems</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('planner')}
                className="p-3.5 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] hover:border-[#E8B65C]/50 flex flex-col items-start text-left gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#E8B65C]/10 border border-[#E8B65C]/30 flex items-center justify-center text-[#E8B65C] group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">Create Itinerary</p>
                  <p className="text-[10px] text-[#B9B7AA]">Plan your trip</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('planner')}
                className="p-3.5 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] hover:border-[#E8B65C]/50 flex flex-col items-start text-left gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#E8B65C]/10 border border-[#E8B65C]/30 flex items-center justify-center text-[#E8B65C] group-hover:scale-105 transition-transform">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">Save Favorites</p>
                  <p className="text-[10px] text-[#B9B7AA]">Keep bucket list</p>
                </div>
              </button>

              <button
                onClick={() => onNavigateTab('map')}
                className="p-3.5 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] hover:border-[#E8B65C]/50 flex flex-col items-start text-left gap-1.5 transition group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#E8B65C]/10 border border-[#E8B65C]/30 flex items-center justify-center text-[#E8B65C] group-hover:scale-105 transition-transform">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">Golden Map</p>
                  <p className="text-[10px] text-[#B9B7AA]">Interactive trails</p>
                </div>
              </button>

            </div>
          </div>

          {/* Featured Experiences */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">
                Featured Experiences
              </h3>
              <button
                onClick={() => onNavigateTab('experiences')}
                className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition"
              >
                <span>View All</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="space-y-3">
              {experiences.slice(0, 3).map((exp) => {
                const isFav = favorites.includes(exp.id);
                return (
                  <div
                    key={exp.id}
                    onClick={() => onSelectExperience(exp)}
                    className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer card-hover-effect"
                  >
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={exp.image_url}
                        alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-sm text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors truncate">
                        {exp.title}
                      </h4>
                      <p className="text-[11px] text-[#B9B7AA] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#E8B65C]" />
                        {exp.location}
                      </p>
                      <p className="text-[11px] text-[#E8B65C] font-semibold mt-1">
                        {exp.price_estimate} • <span className="text-[#B9B7AA] font-normal">{exp.duration}</span>
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(exp.id);
                      }}
                      className="p-2 text-[#B9B7AA] hover:text-rose-500 transition shrink-0"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Festivals Carousel Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">
                Upcoming Festivals
              </h3>
              <button
                onClick={() => onNavigateTab('festivals')}
                className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition"
              >
                <span>View All</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            {currentFestival && (
              <div 
                onClick={() => onSelectFestival(currentFestival)}
                className="group relative rounded-3xl overflow-hidden border border-[#263B2F] bg-[#10251B] h-64 cursor-pointer card-hover-effect flex flex-col justify-between p-6 select-none"
              >
                <img
                  src={currentFestival.image_url}
                  alt={currentFestival.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-[#06110D]/60 to-transparent" />

                {/* Top controls: Navigation arrows */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#06110D]/80 backdrop-blur-md px-3 py-1 rounded-full text-[#E8B65C] border border-[#263B2F]">
                    📍 {currentFestival.state}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevFestival();
                      }}
                      className="p-1.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextFestival();
                      }}
                      className="p-1.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="relative z-10 space-y-1.5">
                  <p className="text-xs text-[#E8B65C] font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentFestival.date_info || currentFestival.celebration_month}
                  </p>
                  <h4 className="font-serif font-bold text-xl text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                    {currentFestival.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#E8B65C] group-hover:underline flex items-center gap-1 pt-1">
                    Learn More →
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Top Travel Stories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">
                Top Travel Stories
              </h3>
              <button
                onClick={() => onNavigateTab('blog')}
                className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition"
              >
                <span>View All</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>

            <div className="space-y-3">
              {stories.slice(0, 3).map((st) => (
                <div
                  key={st.id}
                  onClick={() => onSelectStory(st)}
                  className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-2xl p-3 flex items-center gap-3.5 cursor-pointer card-hover-effect"
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img
                      src={st.cover_image}
                      alt={st.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold text-sm text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors line-clamp-2">
                      {st.title}
                    </h4>
                    <p className="text-[11px] text-[#B9B7AA] mt-1">
                      {st.published_date} • {st.read_time_minutes} min read
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
