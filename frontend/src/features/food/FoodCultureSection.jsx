import React, { useState } from 'react';
import { MapPin, Heart, Utensils, CheckCircle2 } from 'lucide-react';

export const FoodCultureSection = ({
  foods = [],
  foodSpots = [],
  onSelectPlace,
  onSelectFood,
  favorites = [],
  onToggleFavorite,
}) => {
  const [filterType, setFilterType] = useState('all');

  const filteredFoods = filterType === 'all'
    ? foods
    : foods.filter(f => f.category?.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#10251B] via-[#0B1B14] to-[#06110D] p-8 sm:p-12 rounded-3xl border border-[#263B2F] text-[#F8F1E5] shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B65C] bg-[#E8B65C]/10 border border-[#E8B65C]/30 px-3.5 py-1.5 rounded-full inline-block">
            🍛 Gastronomy & Sacred Kitchens of India
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] leading-tight">
            The Subcontinent on a Platter: Sacred, Royal & Regional
          </h1>
          <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed max-w-2xl">
            From the thousand-year-old earthen pots of Puri temple kitchens to the slow-simmered copper degs of Kashmir and coconut groves of Kerala.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {['all', 'Vegetarian', 'Non-Vegetarian', 'Dessert'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap capitalize transition ${
              filterType === t
                ? 'bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] font-bold shadow'
                : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
            }`}
          >
            {t === 'all' ? 'All Regional Cuisines' : t}
          </button>
        ))}
      </div>

      {/* Signature Heritage Dishes Showcase */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-[#F8F1E5]">Iconic Regional Masterpieces</h3>
          <p className="text-xs text-[#B9B7AA] mt-1">Authentic culinary expressions celebrating Indian states</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFoods.map((dish) => (
            <div
              key={dish.id}
              onClick={() => onSelectFood && onSelectFood(dish)}
              className="bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden flex flex-col justify-between card-hover-effect cursor-pointer"
            >
              <div className="relative h-60 w-full">
                <img
                  src={dish.image_url}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#06110D]/85 backdrop-blur-md text-[#E8B65C] border border-[#263B2F] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  📍 {dish.region}
                </div>
                <div className="absolute top-3 right-3 bg-[#06110D]/85 backdrop-blur-md text-[#F8F1E5] border border-[#263B2F] text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {dish.category}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xl font-serif font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">{dish.name}</h4>
                  <p className="text-xs text-[#E8B65C] font-serif italic mt-0.5">{dish.tagline}</p>
                </div>

                <p className="text-[#B9B7AA] text-xs leading-relaxed line-clamp-3">
                  {dish.description}
                </p>

                {dish.key_ingredients && (
                  <div className="pt-3 border-t border-[#263B2F]">
                    <span className="text-[10px] uppercase font-bold text-[#B9B7AA] tracking-wider">
                      Key Ingredients:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {dish.key_ingredients.slice(0, 4).map((ing, idx) => (
                        <span
                          key={idx}
                          className="bg-[#0B1B14] text-[#F8F1E5] border border-[#263B2F] px-2.5 py-1 rounded-lg text-[10px]"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Food Spots to Visit */}
      {foodSpots.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-[#263B2F]">
          <div>
            <h3 className="text-2xl font-serif font-bold text-[#F8F1E5]">Famous Food Destinations Across India</h3>
            <p className="text-xs text-[#B9B7AA] mt-1">Authentic dining spots from Puri to Jaipur and Alleppey</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodSpots.map((spot) => {
              const isFav = favorites.includes(spot.id);
              return (
                <div
                  key={spot.id}
                  onClick={() => onSelectPlace(spot)}
                  className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={spot.image_url}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(spot.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-white transition"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      <div className="absolute bottom-3 left-3 bg-[#06110D]/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-[#E8B65C] font-semibold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E8B65C]" />
                        {spot.destination_name || 'India'}
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <h4 className="font-serif font-bold text-lg text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                        {spot.name}
                      </h4>
                      <p className="text-xs text-[#B9B7AA] line-clamp-2 leading-relaxed">
                        {spot.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 py-3.5 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between text-xs">
                    <span className="text-[#B9B7AA] font-medium">{spot.entry_fee || 'Affordable'}</span>
                    <span className="text-[#E8B65C] font-semibold group-hover:translate-x-1 transition-transform">
                      View Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
