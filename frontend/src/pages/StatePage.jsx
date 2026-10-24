import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStateById, getAllStates } from '../data/states';
import { INDIA_MAP_PATHS } from '../data/indiaMapPaths';
import {
  MapPin,
  Calendar,
  Sparkles,
  Compass,
  Play,
  Heart,
  ChevronRight,
  Landmark,
  Languages,
  Clock,
  ArrowRight,
  Utensils,
  BookOpen,
  Info,
  CheckCircle,
  Share2,
  X
} from 'lucide-react';

export const StatePage = ({
  onSelectPlace,
  onSelectFestival,
  onSelectFood,
  favorites = [],
  onToggleFavorite,
  onOpenTripPlanner,
}) => {
  const { stateId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [showAllPlaces, setShowAllPlaces] = useState(false);
  const [showAllFestivals, setShowAllFestivals] = useState(false);

  // Retrieve current state data
  const stateData = getStateById(stateId || 'odisha');
  const allStatesList = getAllStates();

  // Scroll to top on state change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('overview');
    setShowAllPlaces(false);
    setShowAllFestivals(false);
  }, [stateId]);

  // Dynamic SVG bounding box calculation for the state silhouette map
  const stateSvgPath = INDIA_MAP_PATHS[stateData.id]?.path || '';
  const getSilhouetteViewBox = (pathStr) => {
    if (!pathStr) return '0 0 1000 1150';
    const matches = [...pathStr.matchAll(/([0-9.]+)\s+([0-9.]+)/g)];
    if (matches.length === 0) return '0 0 1000 1150';
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const m of matches) {
      const x = parseFloat(m[1]), y = parseFloat(m[2]);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const pad = 15;
    return `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🏛️' },
    { id: 'places', label: 'Top Places', icon: '📍' },
    { id: 'festivals', label: 'Festivals', icon: '✨' },
    { id: 'food', label: 'Food & Cuisine', icon: '🍛' },
    { id: 'experiences', label: 'Experiences', icon: '🎨' },
    { id: 'guides', label: 'Travel Guide', icon: '🧭' },
    { id: 'blogs', label: 'Travel Blog', icon: '📖' },
  ];

  const displayedPlaces = showAllPlaces ? stateData.topPlaces : stateData.topPlaces.slice(0, 4);
  const displayedFestivals = showAllFestivals ? stateData.upcomingFestivals : stateData.upcomingFestivals.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#06110D] text-[#F8F1E5] pb-24 selection:bg-[#E8B65C] selection:text-[#06110D]">
      
      {/* 1. HERO BANNER WITH LUXURY OVERLAY & QUICK FACTS CARD */}
      <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden border-b border-[#263B2F]">
        
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={stateData.heroImage}
            alt={stateData.name}
            className="w-full h-full object-cover object-center filter brightness-60 scale-105 transform duration-1000 transition-all"
          />
          {/* Royal Dark Gradient & Ambient Gold Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-[#06110D]/75 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#06110D]/95 via-[#06110D]/70 to-[#06110D]/40"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E8B65C]/10 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12 w-full">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-medium text-[#B9B7AA] mb-6">
            <Link to="/" className="hover:text-[#E8B65C] transition-colors flex items-center gap-1">
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#E8B65C]" />
            <span className="text-[#E8B65C] font-semibold">{stateData.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: State Title, Tagline & CTAs */}
            <div className="lg:col-span-7 space-y-5 animate-in fade-in slide-in-from-left duration-700">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#10251B]/80 border border-[#263B2F] text-xs font-bold text-[#E8B65C] tracking-widest uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Incredible India • State Heritage</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-[#F8F1E5] tracking-tight leading-none drop-shadow-lg">
                {stateData.name}
              </h1>

              <p className="text-lg sm:text-xl font-serif text-[#E8B65C] font-medium tracking-wide">
                {stateData.tagline}
              </p>

              <p className="text-sm sm:text-base text-[#F8F1E5]/90 max-w-2xl leading-relaxed font-sans font-light">
                {stateData.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => onOpenTripPlanner ? onOpenTripPlanner(stateData.name) : navigate('/planner')}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E8B65C] via-[#F4D18A] to-[#E8B65C] text-[#06110D] font-bold text-sm shadow-xl shadow-[#E8B65C]/25 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-[#06110D]" />
                  <span>Plan Your Trip</span>
                </button>

                <button
                  onClick={() => setIsVideoModalOpen(true)}
                  className="px-6 py-3.5 rounded-full bg-[#10251B]/80 hover:bg-[#10251B] border border-[#E8B65C]/60 text-[#F8F1E5] font-semibold text-sm hover:border-[#F4D18A] active:scale-95 transition-all flex items-center gap-2 backdrop-blur-sm"
                >
                  <Play className="w-4 h-4 text-[#E8B65C] fill-[#E8B65C]" />
                  <span>Watch Video</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    alert(`Link to ${stateData.name} copied to clipboard!`);
                  }}
                  className="p-3.5 rounded-full bg-[#10251B]/80 hover:bg-[#10251B] border border-[#263B2F] text-[#B9B7AA] hover:text-[#E8B65C] transition-all"
                  title="Share state portal"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Right Column: Floating Quick Facts Card with Golden State Silhouette */}
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative bg-[#10251B]/85 backdrop-blur-xl border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/80 transition-all overflow-hidden"
              >
                {/* Golden Silhouette of the State in Top-Right Corner */}
                <div className="absolute top-4 right-4 w-28 h-28 sm:w-32 sm:h-32 pointer-events-none opacity-85">
                  <svg
                    viewBox={getSilhouetteViewBox(stateSvgPath)}
                    className="w-full h-full filter drop-shadow-[0_0_12px_rgba(232,182,92,0.4)]"
                  >
                    <path
                      d={stateSvgPath}
                      fill="url(#state-gold-grad)"
                      stroke="#F4D18A"
                      strokeWidth="2.5"
                    />
                    <defs>
                      <linearGradient id="state-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F4D18A" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#E8B65C" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="relative z-10 space-y-5">
                  <div className="border-b border-[#263B2F] pb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#E8B65C]">
                      State Dossier
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#F8F1E5]">
                      Key Highlights & Travel Facts
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Fact 1: Capital */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#06110D] border border-[#263B2F] flex items-center justify-center shrink-0 text-[#E8B65C]">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#B9B7AA] font-medium">Capital</p>
                        <p className="text-sm font-serif font-bold text-[#F8F1E5]">{stateData.capital}</p>
                      </div>
                    </div>

                    {/* Fact 2: Famous For */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#06110D] border border-[#263B2F] flex items-center justify-center shrink-0 text-[#E8B65C]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#B9B7AA] font-medium">Famous For</p>
                        <p className="text-sm font-semibold text-[#F8F1E5]">{stateData.famousFor}</p>
                      </div>
                    </div>

                    {/* Fact 3: Best Time */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#06110D] border border-[#263B2F] flex items-center justify-center shrink-0 text-[#E8B65C]">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#B9B7AA] font-medium">Best Time</p>
                        <p className="text-sm font-semibold text-[#E8B65C]">{stateData.bestTime}</p>
                      </div>
                    </div>

                    {/* Fact 4: Language */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-[#06110D] border border-[#263B2F] flex items-center justify-center shrink-0 text-[#E8B65C]">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-[#B9B7AA] font-medium">Language</p>
                        <p className="text-sm font-semibold text-[#F8F1E5]">{stateData.language}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stat pills footer */}
                  <div className="pt-3 border-t border-[#263B2F] grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-[#06110D]/60 border border-[#263B2F]">
                      <p className="text-base font-bold text-[#E8B65C]">{stateData.topPlaces.length}+</p>
                      <p className="text-[10px] text-[#B9B7AA]">Top Places</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#06110D]/60 border border-[#263B2F]">
                      <p className="text-base font-bold text-[#E8B65C]">{stateData.upcomingFestivals.length}</p>
                      <p className="text-[10px] text-[#B9B7AA]">Festivals</p>
                    </div>
                    <div className="p-2 rounded-xl bg-[#06110D]/60 border border-[#263B2F]">
                      <p className="text-base font-bold text-[#E8B65C]">{stateData.culinaryDelights.length}</p>
                      <p className="text-[10px] text-[#B9B7AA]">Cuisines</p>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>

          </div>

        </div>

      </section>

      {/* 2. SUBNAV TAB BAR (STICKY ROYAL NAVIGATION) */}
      <div className="sticky top-16 z-30 bg-[#06110D]/95 backdrop-blur-md border-b border-[#263B2F] shadow-lg">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#E8B65C] to-[#F4D18A] text-[#06110D] shadow-md shadow-[#E8B65C]/20 font-bold'
                      : 'text-[#B9B7AA] hover:text-[#F8F1E5] hover:bg-[#10251B]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MAIN TAB CONTENT CONTAINER */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-16">
        
        {/* TAB 1: OVERVIEW */}
        {(activeTab === 'overview' || activeTab === 'all') && (
          <div className="space-y-16">
            
            {/* Overview Narrative Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-[#10251B]/60 border border-[#263B2F] relative overflow-hidden">
              <div className="max-w-3xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8B65C]">
                  Civilizational Canvas
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F8F1E5]">
                  Discover the Soul of {stateData.name}
                </h2>
                <p className="text-base text-[#F8F1E5]/90 leading-relaxed font-light">
                  {stateData.overview}
                </p>
              </div>
            </div>

            {/* TOP PLACES SECTION (Matches Reference Image) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
                    Top Places in {stateData.name}
                  </h2>
                  <p className="text-xs text-[#B9B7AA]">
                    Ancient marvels, sacred shores, and unmissable sanctuaries
                  </p>
                </div>
                <button
                  onClick={() => setShowAllPlaces(!showAllPlaces)}
                  className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition-colors"
                >
                  <span>{showAllPlaces ? 'Show Less' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Places Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedPlaces.map((place) => {
                  const isFav = favorites.includes(place.id);
                  return (
                    <div
                      key={place.id}
                      onClick={() => onSelectPlace && onSelectPlace(place)}
                      className="group cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-[#E8B65C]/10 flex flex-col"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#06110D]">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-transparent to-transparent opacity-80"></div>
                        
                        {/* Rating pill */}
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-[#06110D]/80 backdrop-blur-md border border-[#263B2F] flex items-center gap-1 text-[11px] font-bold text-[#E8B65C]">
                          <span>★</span>
                          <span>{place.rating}</span>
                        </div>

                        {/* Favorite button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite && onToggleFavorite(place.id);
                          }}
                          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all ${
                            isFav
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                              : 'bg-[#06110D]/70 text-[#B9B7AA] border-[#263B2F] hover:text-[#E8B65C]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-400' : ''}`} />
                        </button>

                        <div className="absolute bottom-2.5 left-3 text-[11px] font-medium text-[#B9B7AA] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#E8B65C]" />
                          <span>{place.shortLocation || place.location}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-lg text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors line-clamp-1">
                            {place.name}
                          </h3>
                          <p className="text-xs text-[#B9B7AA] line-clamp-2 mt-1.5 leading-relaxed font-light">
                            {place.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#263B2F]/60 flex items-center justify-between text-[11px]">
                          <span className="text-[#B9B7AA]">Entry: {place.entryFee.split(',')[0]}</span>
                          <span className="font-semibold text-[#E8B65C] group-hover:underline flex items-center gap-1">
                            Details <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* UPCOMING FESTIVALS SECTION (Matches Reference Image) */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
                    Upcoming Festivals in {stateData.name}
                  </h2>
                  <p className="text-xs text-[#B9B7AA]">
                    Witness centuries-old traditions, sacred rituals, and royal celebrations
                  </p>
                </div>
                <button
                  onClick={() => setShowAllFestivals(!showAllFestivals)}
                  className="text-xs font-semibold text-[#E8B65C] hover:text-[#F4D18A] flex items-center gap-1 group transition-colors"
                >
                  <span>{showAllFestivals ? 'Show Less' : 'View All'}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>

              {/* Festivals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {displayedFestivals.map((fest) => (
                  <div
                    key={fest.id}
                    onClick={() => onSelectFestival && onSelectFestival(fest)}
                    className="group cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-[#E8B65C]/10 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#06110D]">
                      <img
                        src={fest.image}
                        alt={fest.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-transparent to-transparent opacity-80"></div>
                      
                      {/* Date Badge */}
                      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-[#E8B65C] text-[#06110D] font-bold text-[11px] shadow-md flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{fest.date}</span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                          {fest.name}
                        </h3>
                        <p className="text-xs text-[#B9B7AA] line-clamp-2 mt-1.5 leading-relaxed font-light">
                          {fest.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#263B2F]/60 flex items-center justify-between text-[11px]">
                        <span className="text-[#B9B7AA] line-clamp-1">{fest.location}</span>
                        <span className="font-semibold text-[#E8B65C] shrink-0">Explore →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: ALL PLACES */}
        {activeTab === 'places' && (
          <div className="space-y-6">
            <div className="border-b border-[#263B2F] pb-4">
              <h2 className="text-3xl font-serif font-bold text-[#F8F1E5]">
                Destinations & Sacred Monuments of {stateData.name}
              </h2>
              <p className="text-sm text-[#B9B7AA]">
                Full heritage index featuring architectural gems, wildlife sanctuaries, and serene retreats.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stateData.topPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace && onSelectPlace(place)}
                  className="cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden transition-all duration-300 hover:-translate-y-1 p-5 space-y-4 shadow-xl"
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#06110D]/80 backdrop-blur-md text-[11px] font-bold text-[#E8B65C]">
                      ★ {place.rating} ({place.reviewsCount} reviews)
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">{place.name}</h3>
                    <p className="text-xs text-[#E8B65C] flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {place.location}
                    </p>
                    <p className="text-xs text-[#B9B7AA] mt-2 line-clamp-3 leading-relaxed">
                      {place.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[#263B2F]/60 text-xs">
                    <p className="text-[#F8F1E5]/80"><strong className="text-[#E8B65C]">Timings:</strong> {place.timings}</p>
                    <p className="text-[#F8F1E5]/80"><strong className="text-[#E8B65C]">Entry:</strong> {place.entryFee}</p>
                  </div>

                  <button className="w-full py-2.5 rounded-xl bg-[#06110D] border border-[#263B2F] hover:border-[#E8B65C] text-xs font-semibold text-[#E8B65C] transition-all">
                    View Full Attraction Profile →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FESTIVALS */}
        {activeTab === 'festivals' && (
          <div className="space-y-6">
            <div className="border-b border-[#263B2F] pb-4">
              <h2 className="text-3xl font-serif font-bold text-[#F8F1E5]">
                Sacred & Cultural Celebrations of {stateData.name}
              </h2>
              <p className="text-sm text-[#B9B7AA]">
                Plan your voyage around magnificent chariot processions, musical nights, and folk festivals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stateData.upcomingFestivals.map((fest) => (
                <div
                  key={fest.id}
                  onClick={() => onSelectFestival && onSelectFestival(fest)}
                  className="cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden p-6 transition-all shadow-xl flex flex-col sm:flex-row gap-5"
                >
                  <div className="sm:w-44 aspect-[4/3] rounded-xl overflow-hidden shrink-0 bg-[#06110D]">
                    <img src={fest.image} alt={fest.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8B65C]/20 text-[#E8B65C] border border-[#E8B65C]/30 text-[11px] font-bold">
                        {fest.date}
                      </div>
                      <h3 className="font-serif font-bold text-xl text-[#F8F1E5] mt-1">{fest.name}</h3>
                      <p className="text-xs text-[#B9B7AA] line-clamp-2 mt-1">{fest.description}</p>
                    </div>

                    <div className="pt-2 border-t border-[#263B2F]/60 text-xs text-[#E8B65C]">
                      Location: {fest.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FOOD & CUISINE */}
        {activeTab === 'food' && (
          <div className="space-y-6">
            <div className="border-b border-[#263B2F] pb-4">
              <h2 className="text-3xl font-serif font-bold text-[#F8F1E5]">
                Culinary Heritage & Royal Recipes of {stateData.name}
              </h2>
              <p className="text-sm text-[#B9B7AA]">
                From fragrant temple mahaprasads to coastal seafood and GI-tagged confectionery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stateData.culinaryDelights.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => onSelectFood && onSelectFood(dish)}
                  className="cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden p-5 space-y-4 shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-[#06110D]">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-[#E8B65C]">{dish.type}</span>
                      <span className="text-[#B9B7AA] text-[11px]">{dish.origin}</span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">{dish.name}</h3>
                    <p className="text-xs text-[#B9B7AA] mt-2 line-clamp-3 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#06110D] border border-[#263B2F] text-xs">
                    <p className="text-[#E8B65C] font-semibold">Where to Taste:</p>
                    <p className="text-[#B9B7AA] text-[11px] mt-0.5">{dish.mustTryPlace}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EXPERIENCES & ARTISANS */}
        {activeTab === 'experiences' && (
          <div className="space-y-6">
            <div className="border-b border-[#263B2F] pb-4">
              <h2 className="text-3xl font-serif font-bold text-[#F8F1E5]">
                Cultural Traditions, Handlooms & Fine Crafts
              </h2>
              <p className="text-sm text-[#B9B7AA]">
                Centuries of living master craftsmanship passed down through artisan guilds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stateData.culturalExperiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#06110D] border border-[#263B2F] flex items-center justify-center text-[#E8B65C]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">{exp.title}</h3>
                      <p className="text-xs text-[#E8B65C] font-medium">{exp.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#B9B7AA] leading-relaxed font-light">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TRAVEL GUIDES & ITINERARIES */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="border-b border-[#263B2F] pb-4">
              <h2 className="text-3xl font-serif font-bold text-[#F8F1E5]">
                Curated Road Trails & Signature Itineraries
              </h2>
              <p className="text-sm text-[#B9B7AA]">
                Expertly structured journeys optimizing travel time, heritage sites, and authentic meals.
              </p>
            </div>

            <div className="space-y-6">
              {stateData.travelGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-7 rounded-3xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#263B2F] pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-2xl text-[#F8F1E5]">{guide.title}</h3>
                      <p className="text-xs text-[#E8B65C] mt-1 font-semibold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" /> Route: {guide.route}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-xs px-3 py-1 rounded-full bg-[#E8B65C]/15 text-[#E8B65C] border border-[#E8B65C]/30 font-bold">
                        {guide.duration}
                      </span>
                      <p className="text-xs text-[#B9B7AA] mt-1">{guide.budget}</p>
                    </div>
                  </div>

                  <p className="text-sm text-[#F8F1E5]/90 leading-relaxed font-light">
                    <strong className="text-[#E8B65C]">Key Highlights:</strong> {guide.highlights}
                  </p>

                  <div className="flex justify-end">
                    <button
                      onClick={() => onOpenTripPlanner ? onOpenTripPlanner(stateData.name) : navigate('/planner')}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#E8B65C] to-[#F4D18A] text-[#06110D] font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1.5"
                    >
                      <span>Adopt This Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BLOG & STORIES */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="border-b border-[#263B2F] pb-4">
              <h2 className="text-3xl font-serif font-bold text-[#F8F1E5]">
                Stories & Field Chronicles from {stateData.name}
              </h2>
              <p className="text-sm text-[#B9B7AA]">
                Personal narratives, historical deep-dives, and traveler perspectives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stateData.travelBlogs.map((blog, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#B9B7AA]">
                      <span>{blog.date}</span>
                      <span className="text-[#E8B65C] font-semibold">{blog.readTime}</span>
                    </div>
                    <h3 className="font-serif font-bold text-xl text-[#F8F1E5] hover:text-[#E8B65C] transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-[#B9B7AA] leading-relaxed line-clamp-3 font-light">
                      {blog.snippet}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#263B2F]/60 text-xs text-[#B9B7AA]">
                    By <strong className="text-[#F8F1E5]">{blog.author}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. OTHER INDIAN STATES EXPLORER BAR */}
        <section className="pt-10 border-t border-[#263B2F] space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#E8B65C]">
                Explore All 28 States
              </span>
              <h3 className="text-2xl font-serif font-bold text-[#F8F1E5]">
                Continue Your Journey Through India
              </h3>
            </div>
            <Link
              to="/"
              className="text-xs font-semibold text-[#E8B65C] hover:underline flex items-center gap-1"
            >
              <span>Back to Interactive Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {allStatesList.map((st) => {
              const isCurrent = st.id === stateData.id;
              return (
                <button
                  key={st.id}
                  onClick={() => navigate(`/state/${st.id}`)}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    isCurrent
                      ? 'bg-gradient-to-br from-[#E8B65C]/25 to-[#10251B] border-[#E8B65C] shadow-lg shadow-[#E8B65C]/10'
                      : 'bg-[#10251B]/80 hover:bg-[#10251B] border-[#263B2F] hover:border-[#E8B65C]/50'
                  }`}
                >
                  <p className="text-xs font-serif font-bold text-[#F8F1E5] truncate">{st.name}</p>
                  <p className="text-[10px] text-[#E8B65C] truncate">{st.capital}</p>
                  <p className="text-[9px] text-[#B9B7AA] truncate mt-1">{(st.famousFor || st.officialTagline || 'Heritage').split(',')[0]}</p>
                </button>
              );
            })}
          </div>
        </section>

      </main>

      {/* VIDEO POPUP MODAL */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setIsVideoModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-[#06110D] border border-[#E8B65C] rounded-3xl overflow-hidden shadow-2xl p-4 space-y-4"
            >
              <div className="flex items-center justify-between px-2">
                <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">
                  Experience {stateData.name} — Cinematic Heritage Film
                </h3>
                <button
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-2 rounded-full hover:bg-[#10251B] text-[#B9B7AA] hover:text-[#F8F1E5]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${stateData.videoUrl.split('v=')[1] || 'kY3jXvY94hY'}?autoplay=1`}
                  title={`${stateData.name} Travel Film`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StatePage;
