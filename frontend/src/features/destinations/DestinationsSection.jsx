import React, { useState } from 'react';
import { Search, MapPin, Heart, Sparkles, Filter, SlidersHorizontal } from 'lucide-react';

export const DestinationsSection = ({
  destinations,
  places,
  onSelectPlace,
  onSelectDestination,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const indianStates = [
    { id: 'all', label: 'All India' },
    { id: 'Rajasthan', label: 'Rajasthan' },
    { id: 'Odisha', label: 'Odisha' },
    { id: 'Kerala', label: 'Kerala' },
    { id: 'Himachal Pradesh', label: 'Himachal' },
    { id: 'Uttarakhand', label: 'Uttarakhand' },
    { id: 'Goa', label: 'Goa' },
    { id: 'Ladakh', label: 'Ladakh' },
    { id: 'Tamil Nadu', label: 'Tamil Nadu' },
  ];

  const categories = [
    { id: 'all', label: 'All Trails' },
    { id: 'heritage', label: 'UNESCO & Forts' },
    { id: 'temple', label: 'Sacred Temples' },
    { id: 'nature', label: 'Himalayas & Backwaters' },
    { id: 'beach', label: 'Beaches & Shores' },
    { id: 'food_spot', label: 'Culinary Trails' },
  ];

  let filteredPlaces = places.filter((p) => {
    const dest = destinations.find((d) => d.id === p.destination_id);
    const matchesState = selectedState === 'all' || (dest && dest.state === selectedState);
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
      <div className="relative rounded-3xl overflow-hidden border border-[#263B2F] shadow-2xl bg-[#0B1B14] min-h-[440px] flex items-center p-8 sm:p-14">
        <img
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80"
          alt="Incredible India Heritage"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06110D] via-[#06110D]/85 to-transparent" />
        
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8B65C]/10 border border-[#E8B65C]/30 text-[#E8B65C] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Discover India, One Trail at a Time • Pan-India Platform
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] tracking-tight leading-tight">
            From Himalayan Heights to Sacred Southern Shores.
          </h1>

          <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed max-w-xl">
            Explore golden desert forts in Rajasthan, sacred stone chariots in Konark, tranquil backwaters in Kerala, and living Buddhist gompas in Ladakh.
          </p>

          {/* Search Bar */}
          <div className="bg-[#10251B] p-2 rounded-2xl border border-[#E8B65C]/40 shadow-2xl flex items-center gap-2 max-w-lg">
            <Search className="w-5 h-5 text-[#E8B65C] ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search across India: forts, ghats, tea hills, beaches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-[#F8F1E5] placeholder:text-[#B9B7AA]/60 text-sm focus:outline-none py-1.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#B9B7AA] hover:text-[#F8F1E5] px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* State & Destination Selector Carousel */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#F8F1E5] flex items-center gap-2">
              <span>🇮🇳</span> Iconic Destinations Across India
            </h2>
            <p className="text-xs text-[#B9B7AA]">Select any state or heritage circuit</p>
          </div>
          <button
            onClick={() => setSelectedState('all')}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition ${
              selectedState === 'all'
                ? 'bg-[#E8B65C] text-[#06110D] font-bold'
                : 'text-[#B9B7AA] hover:text-[#F8F1E5]'
            }`}
          >
            Show All States
          </button>
        </div>

        {/* State Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2">
          {indianStates.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedState(st.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
                selectedState === st.id
                  ? 'bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] font-bold shadow-md'
                  : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Destination Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {destinations.map((dest) => {
            const isSelected = selectedState === dest.state;
            return (
              <button
                key={dest.id}
                onClick={() => onSelectDestination ? onSelectDestination(dest) : setSelectedState(isSelected ? 'all' : dest.state)}
                className={`group relative p-3.5 rounded-2xl text-left transition-all border overflow-hidden flex flex-col justify-end min-h-[135px] ${
                  isSelected
                    ? 'border-[#E8B65C] ring-2 ring-[#E8B65C]/40 shadow-lg'
                    : 'border-[#263B2F] bg-[#10251B] hover:border-[#E8B65C]/50'
                }`}
              >
                <img
                  src={dest.banner_image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06110D] via-[#06110D]/75 to-transparent" />
                <div className="relative z-10">
                  <span className="font-serif font-bold text-sm text-[#F8F1E5] block group-hover:text-[#E8B65C] transition-colors">
                    {dest.name}
                  </span>
                  <span className="text-[10px] text-[#E8B65C] font-semibold block truncate">
                    📍 {dest.state}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills & Sorting Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full sm:w-auto">
          {categories.map((cat) => (
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
          <div className="text-center py-16 bg-[#10251B] rounded-3xl border border-[#263B2F]">
            <p className="text-[#B9B7AA] text-sm">No places found matching your filter or search criteria.</p>
            <button
              onClick={() => {
                setSelectedState('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#E8B65C] font-semibold hover:underline"
            >
              Reset all filters
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
    </div>
  );
};
