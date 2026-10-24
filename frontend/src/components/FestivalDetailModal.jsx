import React from 'react';
import { X, Calendar, MapPin, Sparkles, Info, CheckCircle2 } from 'lucide-react';

export const FestivalDetailModal = ({ festival, onClose }) => {
  if (!festival) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#06110D]/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-[#10251B] border border-[#263B2F] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-[#F8F1E5]">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#06110D]/80 hover:bg-[#E8B65C] text-[#F8F1E5] hover:text-[#06110D] transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-t-3xl">
          <img
            src={festival.image_url}
            alt={festival.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10251B] via-[#10251B]/40 to-transparent" />

          <div className="absolute bottom-5 left-6 right-6 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#E8B65C] text-[#06110D]">
              📍 {festival.state}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#F8F1E5] drop-shadow-md">
              {festival.name}
            </h2>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#0B1B14] border border-[#263B2F] text-xs text-[#E8B65C]">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{festival.date_info || festival.celebration_month} ({festival.typical_season})</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#F8F1E5]">About the Celebration</h3>
            <p className="text-xs sm:text-sm text-[#B9B7AA] leading-relaxed">
              {festival.description}
            </p>
          </div>

          {festival.cultural_significance && (
            <div className="p-4 rounded-2xl bg-[#0B1B14] border border-[#263B2F] space-y-1.5 text-xs">
              <span className="font-bold text-[#E8B65C] uppercase tracking-wider text-[10px] block">
                ✦ Sacred & Cultural Significance:
              </span>
              <p className="text-[#B9B7AA] leading-relaxed">{festival.cultural_significance}</p>
            </div>
          )}

          {festival.visitor_tips && (
            <div className="p-4 rounded-2xl bg-[#0B1B14] border border-[#263B2F] flex items-start gap-2.5 text-xs text-[#B9B7AA]">
              <Info className="w-4 h-4 text-[#E8B65C] shrink-0 mt-0.5" />
              <p><strong className="text-[#F8F1E5]">Traveler Advice:</strong> {festival.visitor_tips}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
