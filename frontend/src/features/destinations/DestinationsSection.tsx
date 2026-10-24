import React, { useState } from 'react';
import { Destination, Place } from '../../types';
import { Search, Compass, MapPin, Star, Heart, Clock, DollarSign, Sparkles } from 'lucide-react';

interface DestinationsSectionProps {
  destinations: Destination[];
  places: Place[];
  onSelectPlace: (place: Place) => void;
  favorites: string[];
  onToggleFavorite: (placeId: string) => void;
  onViewDestination: (dest: Destination) => void;
}

export const DestinationsSection: React.FC<DestinationsSectionProps> = ({
  destinations,
  places,
  onSelectPlace,
  favorites,
  onToggleFavorite,
  onViewDestination,
}) => {
  const [selectedDestinationId, setSelectedDestinationId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Trails' },
    { id: 'temple', label: 'Ancient Temples' },
    { id: 'nature', label: 'Nature & Wildlife' },
    { id: 'heritage', label: 'UNESCO Heritage' },
    { id: 'beach', label: 'Coast & Beaches' },
    { id: 'craft_village', label: 'Craft Villages' },
    { id: 'hidden_gem', label: 'Hidden Gems' },
  ];

  const filteredPlaces = places.filter((p) => {
    const matchesDest = selectedDestinationId === 'all' || p.destination_id === selectedDestinationId;
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDest && matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Welcome Section */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-900 min-h-[420px] flex items-center">
        <img
          src="https://images.unsplash.com/photo-1628085446059-e93cb101ee63?auto=format&fit=crop&w=1600&q=80"
          alt="Odisha Trails"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/80 to-transparent" />
        
        <div className="relative z-10 max-w-2xl p-8 sm:p-14 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Discover Odisha: India's Best Kept Secret
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
            Ancient Stones, Whispering Pines & Sacred Shores.
          </h1>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            From the celestial sundials of Konark and the blue flag sands of Puri to the tranquil dolphin lagoons of Chilika and the coffee estates of Daringbadi.
          </p>

          {/* Quick Search Bar */}
          <div className="bg-stone-900/90 backdrop-blur-md p-2 rounded-2xl border border-stone-700/80 shadow-2xl flex items-center gap-2 max-w-lg">
            <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search temples, falls, beaches, or crafts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-stone-100 placeholder:text-stone-500 text-sm focus:outline-none py-1.5"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-400 hover:text-white px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Featured Destinations Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Popular Destinations</h2>
            <p className="text-xs text-stone-400">Select a region to view local attractions and guides</p>
          </div>
          <button
            onClick={() => setSelectedDestinationId('all')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition ${
              selectedDestinationId === 'all'
                ? 'bg-amber-600 text-white'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Show All Regions
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {destinations.map((dest) => {
            const isSelected = selectedDestinationId === dest.id;
            return (
              <button
                key={dest.id}
                onClick={() => setSelectedDestinationId(isSelected ? 'all' : dest.id)}
                className={`group relative p-3 rounded-2xl text-left transition-all border overflow-hidden flex flex-col justify-end min-h-[110px] ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/50 shadow-lg'
                    : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                }`}
              >
                <img
                  src={dest.banner_image}
                  alt={dest.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent" />
                <div className="relative z-10">
                  <span className="font-serif font-bold text-sm text-white block group-hover:text-amber-400 transition-colors">
                    {dest.name}
                  </span>
                  <span className="text-[10px] text-stone-400 block truncate">
                    {dest.district}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-stone-800/60 hover:bg-stone-800 text-stone-300 border border-stone-700/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Places & Highlights Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-stone-400">
            Showing <strong className="text-amber-400">{filteredPlaces.length}</strong> curated places
          </p>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-center py-16 bg-stone-900 rounded-3xl border border-stone-800">
            <p className="text-stone-400 text-sm">No places found matching your filter or search criteria.</p>
            <button
              onClick={() => {
                setSelectedDestinationId('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-amber-400 font-semibold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => {
              const isFav = favorites.includes(place.id);
              return (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className="group bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Image Banner */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <img
                        src={place.image_url}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-amber-400 border border-stone-700">
                        {place.category.replace('_', ' ')}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(place.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/70 hover:bg-stone-800 text-stone-300 hover:text-rose-500 transition shadow"
                        title={isFav ? 'Remove from saved' : 'Save place'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                        <span className="bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-500" />
                          {place.destination_name || 'Odisha'}
                        </span>
                        {place.rating !== undefined && place.rating > 0 && (
                          <span className="bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-amber-400">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-3">
                      <h3 className="font-serif font-bold text-xl text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                        {place.name}
                      </h3>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>

                      {/* Highlights Pill */}
                      {place.highlights && place.highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {place.highlights.slice(0, 2).map((h, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-stone-800 text-stone-300 px-2.5 py-0.5 rounded-md"
                            >
                              ✦ {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Practical Info Footer */}
                  <div className="px-6 py-3.5 bg-stone-950/40 border-t border-stone-800/80 flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-medium truncate max-w-[160px]">
                      {place.entry_fee || 'Free'}
                    </span>
                    <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
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
