import React from 'react';
import { X, MapPin, Calendar, Clock, DollarSign, Heart, Compass, Sparkles, Utensils, CheckCircle2, Share2 } from 'lucide-react';

export const DestinationDetailModal = ({
  destination,
  places = [],
  onClose,
  isFavorite,
  onToggleFavorite,
  onSelectPlace,
  onViewOnMap,
}) => {
  if (!destination) return null;

  const destPlaces = places.filter(p => p.destination_id === destination.id);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Trail India | ${destination.name}`,
        text: destination.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Destination link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-[#F8F1E5]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Banner with Dark Gradient */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-t-3xl">
          <img
            src={destination.banner_image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-[#10251B]/40 to-transparent" />
          
          {/* Header Badges */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-[#E8B65C] text-[#06110D] font-sans">
                📍 {destination.state}
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] drop-shadow-md mt-2">
                {destination.name}
              </h2>
              <p className="text-sm font-serif italic text-[#F4D18A] mt-1">
                "{destination.tagline}"
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(destination.id)}
                className={`p-3 rounded-full flex items-center gap-2 text-xs font-bold transition ${
                  isFavorite 
                    ? 'bg-rose-600 text-white shadow-lg' 
                    : 'bg-[#06110D]/85 hover:bg-[#153224] text-[#F8F1E5] border border-[#263B2F]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-[#06110D]/85 hover:bg-[#153224] text-[#B9B7AA] hover:text-[#F8F1E5] border border-[#263B2F] transition"
                title="Share destination"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onViewOnMap(destination);
                }}
                className="bg-gradient-to-r from-[#E8B65C] to-[#C4923C] hover:from-[#F4D18A] hover:to-[#E8B65C] text-[#06110D] font-bold text-xs px-4 py-3 rounded-full flex items-center gap-1.5 transition shadow"
              >
                <MapPin className="w-4 h-4" />
                <span>View on Golden Map</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Key Facts Pill Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-[#0B1B14] border border-[#263B2F]">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#E8B65C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#B9B7AA]">Best Season to Visit</p>
                <p className="text-sm font-semibold text-[#F8F1E5]">{destination.best_time_to_visit || 'October to March'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-[#E8B65C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#B9B7AA]">Estimated Budget</p>
                <p className="text-sm font-semibold text-[#F8F1E5]">{destination.estimated_budget || '₹3,500 - ₹7,000 / day'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Compass className="w-5 h-5 text-[#E8B65C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#B9B7AA]">Climate & Weather</p>
                <p className="text-sm font-semibold text-[#F8F1E5] truncate">{destination.weather_info || 'Pleasant winter climate'}</p>
              </div>
            </div>
          </div>

          {/* Historical Overview */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-2xl text-[#E8B65C]">
              Historical Heritage & Overview
            </h3>
            <p className="text-sm sm:text-base text-[#B9B7AA] leading-relaxed whitespace-pre-line">
              {destination.overview || destination.description}
            </p>
          </div>

          {/* Key Highlights */}
          {destination.highlights && destination.highlights.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#E8B65C]">
                Crown Highlights & Wonders
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {destination.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0B1B14] border border-[#263B2F] text-xs font-medium text-[#F8F1E5]">
                    <CheckCircle2 className="w-4 h-4 text-[#E8B65C] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How to Reach & Logistics */}
          {destination.how_to_reach && (
            <div className="p-4 rounded-2xl bg-[#0B1B14] border border-[#263B2F] space-y-1.5 text-xs">
              <p className="font-bold text-[#E8B65C] uppercase tracking-wider text-[10px]">How to Reach:</p>
              <p className="text-[#B9B7AA] leading-relaxed">{destination.how_to_reach}</p>
            </div>
          )}

          {/* Featured Attractions in this Destination */}
          {destPlaces.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#263B2F]">
              <h3 className="font-serif font-bold text-xl text-[#F8F1E5]">
                Attractions in {destination.name} ({destPlaces.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {destPlaces.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectPlace(p)}
                    className="p-3.5 rounded-2xl bg-[#0B1B14] hover:bg-[#153224] border border-[#263B2F] hover:border-[#E8B65C]/50 cursor-pointer flex items-center gap-3.5 transition group"
                  >
                    <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="font-serif font-bold text-sm text-[#F8F1E5] group-hover:text-[#E8B65C] truncate">{p.name}</p>
                      <p className="text-[11px] text-[#B9B7AA] line-clamp-1">{p.description}</p>
                      <span className="text-[10px] text-[#E8B65C] font-semibold mt-1 inline-block">Explore attraction →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
