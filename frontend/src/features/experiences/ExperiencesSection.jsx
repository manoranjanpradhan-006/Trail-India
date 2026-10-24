import React, { useState } from 'react';
import { Compass, MapPin, Heart, Clock, Star, Sparkles, Filter } from 'lucide-react';

export const ExperiencesSection = ({
  experiences,
  favorites,
  onToggleFavorite,
  onSelectExperience,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Trekking', 'Heritage', 'Wildlife', 'Waterway', 'Adventure'];

  const filtered = selectedCategory === 'all'
    ? experiences
    : experiences.filter(e => e.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Editorial Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#263B2F] bg-gradient-to-r from-[#10251B] via-[#0B1B14] to-[#06110D] p-8 sm:p-12 shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B65C] bg-[#E8B65C]/10 border border-[#E8B65C]/30 px-3.5 py-1.5 rounded-full inline-block">
            🧭 Curated Expeditions Across India
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] leading-tight">
            Curated Experiences Beyond the Ordinary
          </h1>
          <p className="text-sm sm:text-base text-[#B9B7AA] leading-relaxed">
            From sleeping under desert constellations in Jaisalmer to drifting in luxury Kettuvallam houseboats through Alleppey and tracking prehistoric rhinos in Kaziranga.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-xs text-[#B9B7AA] font-semibold mr-2 uppercase tracking-wide flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-[#E8B65C]" /> Filter by Style:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap capitalize transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] font-bold shadow-md'
                : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
            }`}
          >
            {cat === 'all' ? 'All Experiences' : cat}
          </button>
        ))}
      </div>

      {/* Experiences Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((exp) => {
          const isFav = favorites.includes(exp.id);
          return (
            <div
              key={exp.id}
              onClick={() => onSelectExperience(exp)}
              className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={exp.image_url}
                    alt={exp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-[#06110D]/85 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-[#E8B65C] border border-[#263B2F]">
                    {exp.category}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(exp.id);
                    }}
                    className="absolute top-3 right-3 p-2.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition shadow"
                    title="Save to favorites"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="bg-[#06110D]/85 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium text-[#F8F1E5]">
                      <MapPin className="w-3.5 h-3.5 text-[#E8B65C]" />
                      {exp.location}
                    </span>
                    <span className="bg-[#06110D]/85 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold text-[#E8B65C]">
                      <Star className="w-3.5 h-3.5 fill-[#E8B65C] text-[#E8B65C]" />
                      {exp.rating}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-serif font-bold text-xl text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#B9B7AA] line-clamp-3 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#B9B7AA] block">Estimate from</span>
                  <span className="text-sm font-bold text-[#E8B65C]">{exp.price_estimate}</span>
                </div>
                <span className="text-xs font-semibold text-[#F8F1E5] group-hover:text-[#E8B65C] group-hover:translate-x-1 transition-transform">
                  Explore Expedition →
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
