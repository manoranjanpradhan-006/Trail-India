import React from 'react';
import { MapPin, Heart } from 'lucide-react';

export const FoodCultureSection = ({
  foodSpots,
  onSelectPlace,
  favorites,
  onToggleFavorite,
}) => {
  const heritageDishes = [
    {
      name: 'Rajasthani Dal Baati Churma',
      region: 'Rajasthan (North India)',
      tagline: 'The royal dessert & five-lentil banquet of Rajput warriors',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      description: 'Hand-shaped crisp whole wheat dumplings baked over slow embers, dipped in molten cow ghee, served with panchmel dal, spicy garlic chutney, and sweetened powdered wheat churma.',
      giStatus: 'Iconic Royal Cuisine of Marwar & Mewar',
      keyIngredients: ['Whole Wheat Baatis', 'Panchmel Dal', 'Pure Desi Ghee', 'Dry Fruit Churma'],
    },
    {
      name: 'Kerala Appam & Malabar Stew',
      region: 'Kerala (South India)',
      tagline: 'Lacy fermented rice crepes with coconut milk infusion',
      image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
      description: 'Soft, fluffy pillowy-centered crepes with crispy lacy borders made from fermented rice batter and toddy/coconut water, paired with mild aromatic coconut milk stew simmered with cinnamon and cloves.',
      giStatus: 'Traditional Syrian Christian & Malabar Heritage',
      keyIngredients: ['Fermented Rice Batter', 'Fresh Coconut Milk', 'Cardamom & Cloves', 'Curry Leaves'],
    },
    {
      name: 'Odisha Chhena Poda & Dalma',
      region: 'Odisha (East India)',
      tagline: 'Caramelized roasted cottage cheese & temple lentil pot',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
      description: 'Fresh cow chhena kneaded with sugar, cardamom, and ghee, then baked in sal leaves till a caramelized burnt crown forms. Accompanied by Dalma, the sacred Jagannath Temple lentil stew.',
      giStatus: 'Lord Jagannath Chhappan Bhog & Nayagarh Origin',
      keyIngredients: ['Fresh Chhena', 'Ghee', 'Sal Leaves', 'Toor Dal & Raw Papaya'],
    },
    {
      name: 'Kashmiri Rogan Josh & Wazwan',
      region: 'Kashmir (North India)',
      tagline: 'The aromatic crown of 36-course royal Himalayan feasts',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      description: 'Slow-cooked tender lamb infused with Kashmiri dried red chilies (Mawal cockscomb flower for signature crimson hue), whole fennel seeds, and dry ginger powder without onions or garlic in traditional Pandit style.',
      giStatus: 'UNESCO Creative City of Gastronomy Tradition',
      keyIngredients: ['Kashmiri Mawal & Mirch', 'Fennel (Saunf)', 'Dry Ginger', 'Mustard Oil'],
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-amber-950/70 to-orange-950/60 p-8 sm:p-12 rounded-3xl border border-stone-800 text-stone-100 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
            🍛 Flavors of Incredible India
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
            The Subcontinent on a Platter: Sacred, Royal & Regional
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            From the slow-cooked copper cauldrons of Kashmir to the temple kitchens of Odisha and the coconut groves of Kerala, explore authentic culinary traditions across India.
          </p>
        </div>
      </div>

      {/* Signature Heritage Dishes Showcase */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-serif font-bold text-white">Iconic Regional Masterpieces</h3>
          <p className="text-xs text-stone-400 mt-1">Authentic culinary expressions celebrating Indian states</p>
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
                  {dish.region}
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
          <h3 className="text-2xl font-serif font-bold text-white">Curated Culinary Spots Across India</h3>
          <p className="text-xs text-stone-400 mt-1">Authentic dining spots from Jaipur to Alleppey and Puri</p>
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
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {spot.destination_name || 'India'}
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
