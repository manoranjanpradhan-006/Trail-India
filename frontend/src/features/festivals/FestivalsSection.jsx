import React, { useState } from 'react';
import { Calendar, Info, Sparkles, MapPin, Search } from 'lucide-react';

export const FestivalsSection = ({ festivals, onSelectFestival }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const months = ['all', 'June', 'August', 'October', 'November', 'December'];

  const filteredFestivals = festivals.filter((f) => {
    const matchesMonth = selectedMonth === 'all' || f.celebration_month?.toLowerCase().includes(selectedMonth.toLowerCase());
    const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.state?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#10251B] via-[#0B1B14] to-[#06110D] p-8 sm:p-12 rounded-3xl border border-[#263B2F] text-[#F8F1E5] shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#E8B65C] bg-[#E8B65C]/10 border border-[#E8B65C]/30 px-3.5 py-1.5 rounded-full inline-block">
            🪔 Fairs & Sacred Celebrations of India
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#F8F1E5] leading-tight">
            The Living Cultural Calendar of the Subcontinent
          </h1>
          <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed max-w-2xl">
            From the grand wooden chariots of Ratha Yatra in Puri to the floodlit classical Odissi rhythms of the Konark Dance Festival and the one million flickering diyas of Dev Deepawali in Kashi.
          </p>
        </div>
      </div>

      {/* Month Filter & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full sm:w-auto">
          <span className="text-xs text-[#B9B7AA] font-semibold mr-1 uppercase tracking-wide">
            Filter:
          </span>
          {months.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap capitalize transition ${
                selectedMonth === m
                  ? 'bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] font-bold shadow-md'
                  : 'bg-[#10251B] hover:bg-[#153224] text-[#B9B7AA] border border-[#263B2F]'
              }`}
            >
              {m === 'all' ? 'All Seasons' : m}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search festival or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 bg-[#10251B] border border-[#263B2F] rounded-2xl px-4 py-2.5 text-xs text-[#F8F1E5] focus:outline-none focus:border-[#E8B65C]"
        />
      </div>

      {/* Festival Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredFestivals.map((fest) => (
          <div
            key={fest.id}
            onClick={() => onSelectFestival && onSelectFestival(fest)}
            className="group bg-[#10251B] border border-[#263B2F] hover:border-[#E8B65C]/50 rounded-3xl overflow-hidden card-hover-effect flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Image & Date Badge */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={fest.image_url}
                  alt={fest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-[#06110D]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#263B2F] text-xs font-bold text-[#E8B65C] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#E8B65C]" />
                  {fest.celebration_month}
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-[#06110D]/85 backdrop-blur-md p-3 rounded-2xl border border-[#263B2F] text-xs text-[#F8F1E5]">
                  <span className="text-[#E8B65C] font-bold block mb-0.5">Location:</span>
                  {fest.location_summary || fest.location || fest.state || 'India'}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-serif font-bold text-[#F8F1E5] group-hover:text-[#E8B65C] transition-colors">
                  {fest.name}
                </h3>
                
                <p className="text-[#B9B7AA] text-xs sm:text-sm leading-relaxed">
                  {fest.description}
                </p>

                {fest.cultural_significance && (
                  <div className="p-3.5 rounded-2xl bg-[#0B1B14] border border-[#263B2F] text-xs space-y-1">
                    <span className="font-bold text-[#E8B65C] uppercase tracking-wider text-[10px] block">
                      Cultural Significance:
                    </span>
                    <p className="text-[#B9B7AA] leading-relaxed">{fest.cultural_significance}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Visitor Tips Footer */}
            <div className="px-6 py-4 bg-[#0B1B14] border-t border-[#263B2F] flex items-center justify-between text-xs text-[#B9B7AA]">
              <div className="flex items-center gap-2 truncate pr-2">
                <Info className="w-4 h-4 text-[#E8B65C] shrink-0" />
                <span className="truncate">{fest.visitor_tips || 'Wear comfortable traditional attire'}</span>
              </div>
              <span className="text-[#E8B65C] font-semibold shrink-0 group-hover:translate-x-1 transition-transform">
                Read Details →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
