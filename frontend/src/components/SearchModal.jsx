import React, { useState, useEffect } from 'react';
import { Search, X, MapPin, Compass, Utensils, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

export const SearchModal = ({
  isOpen,
  onClose,
  initialQuery = '',
  destinations = [],
  places = [],
  festivals = [],
  foods = [],
  stories = [],
  onSelectDestination,
  onSelectPlace,
  onSelectFestival,
  onSelectFood,
  onSelectStory,
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery, isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingDestinations = q
    ? destinations.filter(d => d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q))
    : [];

  const matchingPlaces = q
    ? places.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.destination_name && p.destination_name.toLowerCase().includes(q)))
    : [];

  const matchingFestivals = q
    ? festivals.filter(f => f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.state.toLowerCase().includes(q))
    : [];

  const matchingFoods = q
    ? foods.filter(fd => fd.name.toLowerCase().includes(q) || fd.description.toLowerCase().includes(q) || fd.region.toLowerCase().includes(q))
    : [];

  const matchingStories = q
    ? stories.filter(st => st.title.toLowerCase().includes(q) || st.excerpt.toLowerCase().includes(q))
    : [];

  const totalResults = matchingDestinations.length + matchingPlaces.length + matchingFestivals.length + matchingFoods.length + matchingStories.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-start justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative text-[#F8F1E5] mt-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0B1B14] hover:bg-[#263B2F] text-[#B9B7AA] hover:text-[#F8F1E5] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Search Bar Input */}
        <div className="flex items-center gap-3 bg-[#06110D] border border-[#E8B65C]/40 rounded-2xl px-4 py-3.5 shadow-inner">
          <Search className="w-5 h-5 text-[#E8B65C] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across India: Konark, forts, backwaters, biryani, aarti..."
            className="w-full bg-transparent text-sm sm:text-base text-[#F8F1E5] placeholder:text-[#B9B7AA]/50 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#B9B7AA] hover:text-[#F8F1E5] px-2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        {!q && (
          <div className="pt-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E8B65C]">
              Popular Searches:
            </span>
            <div className="flex flex-wrap gap-2">
              {['Konark Sun Temple', 'Kerala Backwaters', 'Rajasthan Forts', 'Dalma & Chhena Poda', 'Rath Yatra', 'Hampi', 'Valley of Flowers'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0B1B14] hover:bg-[#153224] text-xs text-[#F8F1E5] border border-[#263B2F] transition"
                >
                  ✦ {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Area */}
        {q && (
          <div className="mt-6 max-h-[60vh] overflow-y-auto space-y-6 pr-2">
            
            {totalResults === 0 ? (
              <div className="text-center py-12 text-[#B9B7AA] space-y-2">
                <p className="text-base font-serif text-[#F8F1E5]">No results found for "{query}"</p>
                <p className="text-xs">Try searching for an Indian state like Odisha or Rajasthan, or dishes like Dalma.</p>
              </div>
            ) : (
              <>
                {/* Destinations */}
                {matchingDestinations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8B65C] flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" /> Destinations ({matchingDestinations.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingDestinations.map(d => (
                        <div
                          key={d.id}
                          onClick={() => {
                            onClose();
                            onSelectDestination(d);
                          }}
                          className="p-3 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] cursor-pointer flex items-center gap-3 transition"
                        >
                          <img src={d.banner_image} alt={d.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-sm text-[#F8F1E5] truncate">{d.name}</p>
                            <p className="text-[11px] text-[#B9B7AA] truncate">📍 {d.state}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Places */}
                {matchingPlaces.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8B65C] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Attractions & Monuments ({matchingPlaces.length})
                    </p>
                    <div className="space-y-2">
                      {matchingPlaces.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            onClose();
                            onSelectPlace(p);
                          }}
                          className="p-3 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] cursor-pointer flex items-center justify-between gap-3 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                            <div className="min-w-0">
                              <p className="font-serif font-bold text-sm text-[#F8F1E5] truncate">{p.name}</p>
                              <p className="text-[11px] text-[#B9B7AA] truncate">{p.destination_name || 'India'}</p>
                            </div>
                          </div>
                          <span className="text-xs text-[#E8B65C] shrink-0 font-semibold">View Details →</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Festivals */}
                {matchingFestivals.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8B65C] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Festivals ({matchingFestivals.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingFestivals.map(f => (
                        <div
                          key={f.id}
                          onClick={() => {
                            onClose();
                            onSelectFestival(f);
                          }}
                          className="p-3 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] cursor-pointer flex items-center gap-3 transition"
                        >
                          <img src={f.image_url} alt={f.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-sm text-[#F8F1E5] truncate">{f.name}</p>
                            <p className="text-[11px] text-[#B9B7AA] truncate">🗓️ {f.celebration_month}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Foods */}
                {matchingFoods.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8B65C] flex items-center gap-1">
                      <Utensils className="w-3.5 h-3.5" /> Regional Food ({matchingFoods.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matchingFoods.map(fd => (
                        <div
                          key={fd.id}
                          onClick={() => {
                            onClose();
                            onSelectFood(fd);
                          }}
                          className="p-3 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] cursor-pointer flex items-center gap-3 transition"
                        >
                          <img src={fd.image_url} alt={fd.name} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-sm text-[#F8F1E5] truncate">{fd.name}</p>
                            <p className="text-[11px] text-[#B9B7AA] truncate">{fd.region}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stories */}
                {matchingStories.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#E8B65C] flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Travel Stories ({matchingStories.length})
                    </p>
                    <div className="space-y-2">
                      {matchingStories.map(st => (
                        <div
                          key={st.id}
                          onClick={() => {
                            onClose();
                            onSelectStory(st);
                          }}
                          className="p-3 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] cursor-pointer flex items-center gap-3 transition"
                        >
                          <img src={st.cover_image} alt={st.title} className="w-12 h-12 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="font-serif font-bold text-sm text-[#F8F1E5] truncate">{st.title}</p>
                            <p className="text-[11px] text-[#B9B7AA] truncate">By {st.author_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
