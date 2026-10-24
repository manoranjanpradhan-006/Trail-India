import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';

export const FestivalsSection = ({ festivals }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');

  const months = ['all', 'June', 'August', 'October', 'November', 'December'];

  const filteredFestivals = selectedMonth === 'all'
    ? festivals
    : festivals.filter((f) => f.celebration_month.toLowerCase().includes(selectedMonth.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950/60 p-8 sm:p-12 rounded-3xl border border-stone-800 text-stone-100 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full inline-block">
            🪔 Fairs & Sacred Celebrations of India
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white leading-tight">
            The Living Cultural Calendar of the Subcontinent
          </h2>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            From the grand chariots of Ratha Yatra to the million flickering diyas of Dev Deepawali in Varanasi and the desert rhythms of Pushkar and Kutch.
          </p>
        </div>
      </div>

      {/* Month Filter */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-xs text-stone-400 font-semibold mr-2 uppercase tracking-wide">
          Filter by Season / Month:
        </span>
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap capitalize transition ${
              selectedMonth === m
                ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md'
                : 'bg-stone-800/60 hover:bg-stone-800 text-stone-300 border border-stone-700/60'
            }`}
          >
            {m === 'all' ? 'All Seasons' : m}
          </button>
        ))}
      </div>

      {/* Festival Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredFestivals.map((fest) => (
          <div
            key={fest.id}
            className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden card-hover-effect flex flex-col justify-between"
          >
            <div>
              {/* Image & Date Badge */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={fest.image_url}
                  alt={fest.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-stone-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-700 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {fest.celebration_month}
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-stone-950/80 backdrop-blur-md p-3 rounded-2xl border border-stone-800/80 text-xs text-stone-200">
                  <span className="text-amber-400 font-bold block mb-0.5">Location:</span>
                  {fest.location_summary || fest.destination_name || 'India'}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <h3 className="text-2xl font-serif font-bold text-white">{fest.name}</h3>
                
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  {fest.description}
                </p>

                {fest.cultural_significance && (
                  <div className="p-3.5 rounded-2xl bg-stone-800/40 border border-stone-800/80 text-xs space-y-1">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] block">
                      Cultural Significance:
                    </span>
                    <p className="text-stone-300 leading-relaxed">{fest.cultural_significance}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Visitor Tips Footer */}
            {fest.visitor_tips && (
              <div className="px-6 py-4 bg-stone-950/50 border-t border-stone-800 flex items-start gap-2.5 text-xs text-stone-400">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="leading-snug"><strong className="text-stone-200">Traveler Tip:</strong> {fest.visitor_tips}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
