import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Heart, 
  Sparkles, 
  Landmark, 
  Flag, 
  ChevronRight, 
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';
import { statesList, unionTerritoriesList } from '../../data/states';

export const DestinationsSection = ({
  destinations = [],
  places = [],
  onSelectPlace,
  onSelectDestination,
  favorites = [],
  onToggleFavorite,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all-entities'); // 'all-entities' | 'states' | 'uts' | 'places'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  // Tag items with entityType
  const allStatesWithTag = statesList.map(s => ({ ...s, entityType: 'State' }));
  const allUTsWithTag = unionTerritoriesList.map(u => ({ ...u, entityType: 'Union Territory' }));
  const allEntities = [...allStatesWithTag, ...allUTsWithTag];

  // Filter entities by tab and search
  const displayedEntities = allEntities.filter((item) => {
    if (activeTab === 'states' && item.entityType !== 'State') return false;
    if (activeTab === 'uts' && item.entityType !== 'Union Territory') return false;
    
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.capital && item.capital.toLowerCase().includes(q)) ||
      (item.famousFestival && item.famousFestival.toLowerCase().includes(q)) ||
      (item.mostFamousPlace && item.mostFamousPlace.toLowerCase().includes(q)) ||
      (item.officialTagline && item.officialTagline.toLowerCase().includes(q))
    );
  });

  // Filter curated places
  let filteredPlaces = places.filter((p) => {
    const dest = destinations.find((d) => d.id === p.destination_id);
    const matchesState = selectedStateFilter === 'all' || (dest && dest.state === selectedStateFilter);
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dest && dest.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dest && dest.state.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesState && matchesCat && matchesSearch;
  });

  if (sortBy === 'alphabetical') {
    filteredPlaces.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'rating') {
    filteredPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Pan-India Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#263B2F] shadow-2xl bg-[#0B1B14] min-h-[380px] sm:min-h-[420px] flex items-center p-6 sm:p-12 lg:p-14">
        <img
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80"
          alt="Incredible India Heritage"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06110D] via-[#06110D]/90 to-transparent" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8B65C]/15 border border-[#E8B65C]/35 text-[#E8B65C] text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Pan-India Explore Portal • 28 States &amp; 9 Territories</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] tracking-tight leading-tight">
            Discover Every State &amp; Sovereign Territory of India.
          </h1>

          <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed max-w-xl font-light">
            Journey across sacred Himalayan heights, golden desert dunes, tranquil southern backwaters, and tropical coral atolls. Explore official state portals, heritage icons, and celebrated festivals.
          </p>

          {/* Search Bar */}
          <div className="bg-[#10251B] p-2 rounded-2xl border border-[#E8B65C]/40 shadow-2xl flex items-center gap-2 max-w-lg mt-2">
            <Search className="w-4 h-4 text-[#E8B65C] ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search by state, territory, city, or famous festival..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-[#F8F1E5] placeholder:text-[#B9B7AA]/60 text-sm focus:outline-none py-1.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#B9B7AA] hover:text-[#F8F1E5] px-2.5 py-1 rounded-lg bg-[#06110D] border border-[#263B2F]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STATES & UNION TERRITORIES: 3 CARDS PER ROW WITH FESTIVALS   */}
      {/* ============================================================ */}
      <section className="space-y-6">
        
        {/* Section Header & View Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#263B2F] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E8B65C] mb-1">
              <Landmark className="w-4 h-4" />
              <span>Sovereign India • Complete Atlas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5]">
              States &amp; Union Territories of India
            </h2>
            <p className="text-xs text-[#B9B7AA] mt-1 max-w-2xl font-light">
              Explore all 28 states and 9 union territories with their celebrated festivals, official tourism taglines, and iconic heritage destinations.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {[
              { id: 'all-entities', label: `All Territories (${allEntities.length})` },
              { id: 'states', label: `28 States (${statesList.length})` },
              { id: 'uts', label: `Union Territories (${unionTerritoriesList.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#E8B65C] to-[#F4D18A] text-[#06110D] font-bold shadow-md shadow-[#E8B65C]/20'
                    : 'bg-[#10251B] text-[#B9B7AA] border border-[#263B2F] hover:border-[#E8B65C] hover:text-[#F8F1E5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 CARDS IN ONE ROW GRID (lg:grid-cols-3 xl:grid-cols-3) */}
        {displayedEntities.length === 0 ? (
          <div className="text-center py-16 bg-[#10251B] rounded-3xl border border-[#263B2F]">
            <p className="text-[#B9B7AA] text-sm">No state or territory found matching "{searchQuery}".</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs text-[#E8B65C] font-semibold hover:underline"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6.5">
            {displayedEntities.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/state/${item.id}`)}
                className="group cursor-pointer rounded-2xl bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-[#E8B65C]/20 flex flex-col justify-between"
              >
                <div>
                  {/* Image Thumbnail with Overlay Tags */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#06110D]">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-transparent to-transparent opacity-90" />
                    
                    {/* Destinations Count Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#06110D]/90 backdrop-blur-md text-[10px] font-bold text-[#E8B65C] border border-[#263B2F]">
                      {item.destinationsCount}
                    </span>

                    {/* Entity Type Badge */}
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#10251B]/95 text-[#E8B65C] text-[10px] font-semibold border border-[#263B2F] backdrop-blur-md">
                      {item.entityType === 'State' ? '🏛️ State' : '🏝️ Union Territory'}
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3.5">
                    <div>
                      {/* Name */}
                      <h3 className="font-serif font-bold text-xl text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors leading-tight">
                        {item.name}
                      </h3>

                      {/* Official Tourism Tagline */}
                      <p className="text-xs font-medium text-[#E8B65C] italic line-clamp-1 mt-0.5" title={item.officialTagline}>
                        "{item.officialTagline}"
                      </p>
                    </div>

                    {/* FAMOUS FESTIVAL HIGHLIGHT (MANDATORY REQUIREMENT) */}
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#06110D] to-[#10251B] border border-[#E8B65C]/40 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#E8B65C]/15 flex items-center justify-center shrink-0 text-[#E8B65C]">
                        <Sparkles className="w-4 h-4 text-[#E8B65C]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B9B7AA] block leading-none">
                          Famous Festival
                        </span>
                        <span className="text-xs font-bold text-[#F4D18A] truncate block mt-0.5" title={item.famousFestival}>
                          {item.famousFestival || 'Traditional Celebrations'}
                        </span>
                      </div>
                    </div>

                    {/* Capital & Most Famous Place */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#06110D]/60 p-2.5 rounded-xl border border-[#263B2F]/60">
                      <div>
                        <span className="text-[10px] text-[#E8B65C] font-semibold uppercase block">Capital</span>
                        <span className="text-xs font-medium text-[#F8F1E5] truncate block mt-0.5">{item.capital}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#E8B65C] font-semibold uppercase block">Iconic Place</span>
                        <span className="text-xs font-medium text-[#F8F1E5] truncate block mt-0.5" title={item.mostFamousPlace}>{item.mostFamousPlace}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#B9B7AA] line-clamp-2 leading-relaxed font-light">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="px-5 py-3.5 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between text-xs font-semibold text-[#E8B65C] group-hover:text-[#F4D18A]">
                  <span>Explore {item.name} Portal</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 2. CURATED TRAILS & HERITAGE CIRCUITS ACROSS INDIA           */}
      {/* ============================================================ */}
      <section className="space-y-6 pt-6 border-t border-[#263B2F]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#F8F1E5] flex items-center gap-2">
              <span>📍</span> Curated Places &amp; Heritage Trails
            </h2>
            <p className="text-xs text-[#B9B7AA]">Filter attractions by state or category</p>
          </div>
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Trails' },
              { id: 'heritage', label: 'UNESCO & Forts' },
              { id: 'temple', label: 'Sacred Temples' },
              { id: 'nature', label: 'Himalayas & Backwaters' },
              { id: 'beach', label: 'Beaches & Shores' },
              { id: 'food_spot', label: 'Culinary Trails' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-[#E8B65C] text-[#06110D] font-bold shadow'
                    : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-[#B9B7AA] self-end">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#E8B65C]" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#10251B] border border-[#263B2F] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Top Rated</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Places & Highlights Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#B9B7AA]">
              Showing <strong className="text-[#E8B65C]">{filteredPlaces.length}</strong> curated places across India
            </p>
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="text-center py-12 bg-[#10251B] rounded-3xl border border-[#263B2F]">
              <p className="text-[#B9B7AA] text-sm">No places found matching your filter criteria.</p>
              <button
                onClick={() => {
                  setSelectedStateFilter('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-[#E8B65C] font-semibold hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlaces.map((place) => {
                const isFav = favorites.includes(place.id);
                const dest = destinations.find((d) => d.id === place.destination_id);

                return (
                  <div
                    key={place.id}
                    onClick={() => onSelectPlace(place)}
                    className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-56 w-full overflow-hidden">
                        <img
                          src={place.image_url}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3 bg-[#06110D]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#E8B65C] border border-[#263B2F]">
                          {place.category.replace('_', ' ')}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(place.id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition shadow"
                          title={isFav ? 'Remove from saved' : 'Save place'}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                          <span className="bg-[#06110D]/85 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium text-[#F8F1E5]">
                            <MapPin className="w-3.5 h-3.5 text-[#E8B65C]" />
                            {dest ? `${dest.name}, ${dest.state}` : 'India'}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-3">
                        <h3 className="font-serif font-bold text-xl text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors line-clamp-1">
                          {place.name}
                        </h3>
                        <p className="text-xs text-[#B9B7AA] line-clamp-2 leading-relaxed">
                          {place.description}
                        </p>

                        {/* Highlights Pill */}
                        {place.highlights && place.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {place.highlights.slice(0, 2).map((h, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-[#0B1B14] text-[#B9B7AA] border border-[#263B2F] px-2.5 py-0.5 rounded-md"
                              >
                                ✦ {h}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Practical Info Footer */}
                    <div className="px-6 py-3.5 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between text-xs">
                      <span className="text-[#B9B7AA] font-medium truncate max-w-[160px]">
                        {place.entry_fee || 'Free entry'}
                      </span>
                      <span className="text-[#E8B65C] font-semibold group-hover:translate-x-1 transition-transform">
                        Explore Details →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default DestinationsSection;
