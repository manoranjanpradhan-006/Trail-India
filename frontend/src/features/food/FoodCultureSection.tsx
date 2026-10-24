import React from 'react';
import { Place } from '../../types';
import { Utensils, Sparkles, MapPin, Star, Heart } from 'lucide-react';

interface FoodCultureProps {
  foodSpots: Place[];
  onSelectPlace: (place: Place) => void;
  favorites: string[];
  onToggleFavorite: (placeId: string) => void;
}

export const FoodCultureSection: React.FC<FoodCultureProps> = ({
  foodSpots,
  onSelectPlace,
  favorites,
  onToggleFavorite,
}) => {
  const heritageDishes = [
    {
      name: 'Chhena Poda (Nayagarh)',
      tagline: 'The caramelized roasted cheese delight of Odisha',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      description: 'Invented in Nayagarh in the 1940s, fresh cottage cheese is hand-kneaded with coarse sugar, fragrant green cardamom, and desi ghee, then slow-baked inside sal leaves till a crusty burnt caramel crown forms.',
      giStatus: 'GI Candidate / Iconic Odia Dessert',
      keyIngredients: ['Fresh Cow Chhena', 'Ghee', 'Cardamom', 'Sal Leaves'],
    },
    {
      name: 'Dalma & Mahaprasad',
      tagline: 'The nutritious temple-style lentil stew',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      description: 'Lentils simmered with raw papaya, pumpkin, brinjal, and colocasia, tempered with the sacred "panch phoron" (five spice blend) and ghee, garnished with freshly roasted cumin and chili powder.',
      giStatus: 'Lord Jagannath Temple Tradition (Chhappan Bhog)',
      keyIngredients: ['Toor Dal', 'Raw Papaya', 'Pumpkin', 'Panch Phoron', 'Pure Ghee'],
    },
    {
      name: 'Pakhala Bhata',
      tagline: 'Fermented cooling elixir celebrated on World Pakhala Day',
      image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
      description: 'Cooked rice fermented overnight in water with curd, roasted cumin, curry leaves, and ginger. Served alongside crispy fried fish, badi chura, fried leafy greens (saga bhaja), and lemon wedges.',
      giStatus: 'Universal Odia Comfort Food (Celebrated March 20th)',
      keyIngredients: ['Fermented Rice', 'Curd', 'Curry Leaves', 'Badi Chura', 'Fried Saag'],
    },
    {
      name: 'Baripada Mudhi Mansa',
      tagline: 'Royal puffed rice with fiery mutton gravy of Mayurbhanj',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      description: 'A signature dish where crunchy, hand-roasted Baripada mudhi (puffed rice) is served in a bowl of fiery slow-simmered mutton curry. A morning breakfast staple in northern Odisha!',
      giStatus: 'Mayurbhanj Heritage Specialty',
      keyIngredients: ['Baripada Mudhi', 'Goat Mutton', 'Mustard Oil', 'Whole Spices'],
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/70 to-orange-950/60 p-8 sm:p-12 rounded-3xl border border-stone-800 text-stone-100 shadow-xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
            🍛 Gastronomic Odyssey
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
            Flavors of Utkala: Subtle, Sacred & Soulful
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Odia culinary philosophy celebrates natural produce, gentle mustard seeds, wholesome lentils, and sacred woodfire baking. Explore iconic dishes and curated dining spots.
          </p>
        </div>
      </div>

      {/* Signature Heritage Dishes Showcase */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-white">Iconic Regional Dishes</h3>
          <p className="text-xs text-stone-400 mt-1">Culinary masterpieces unique to Odisha's soil and temples</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {heritageDishes.map((dish, i) => (
            <div
              key={i}
              className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between card-hover-effect"
            >
              <div className="relative h-56 w-full">
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  {dish.giStatus}
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xl font-serif font-bold text-white">{dish.name}</h4>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">{dish.tagline}</p>
                </div>

                <p className="text-stone-300 text-xs leading-relaxed">
                  {dish.description}
                </p>

                <div className="pt-2 border-t border-stone-800">
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    Key Ingredients:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dish.keyIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="bg-stone-800 text-stone-200 px-2.5 py-1 rounded-lg text-[11px]"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Curated Food Spots to Visit */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-white">Curated Culinary Spots</h3>
          <p className="text-xs text-stone-400 mt-1">Verified kitchens and sweet stalls across Puri, Bhubaneswar, and Mayurbhanj</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foodSpots.map((spot) => {
            const isFav = favorites.includes(spot.id);
            return (
              <div
                key={spot.id}
                onClick={() => onSelectPlace(spot)}
                className="group bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden card-hover-effect cursor-pointer flex flex-col justify-between"
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
                      className="absolute top-3 right-3 p-2 rounded-full bg-stone-950/70 hover:bg-rose-600 text-white transition"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-500" />
                      {spot.destination_name || 'Odisha'}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h4 className="font-serif font-bold text-lg text-white group-hover:text-amber-400 transition-colors">
                      {spot.name}
                    </h4>
                    <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                      {spot.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3.5 bg-stone-950/40 border-t border-stone-800/80 flex items-center justify-between text-xs">
                  <span className="text-stone-300 font-medium">{spot.entry_fee || 'Affordable'}</span>
                  <span className="text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                    View Details →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
