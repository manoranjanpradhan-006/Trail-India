import React from 'react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-amber-500/20 bg-stone-950 text-stone-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-stone-800/80">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛕</span>
              <span className="text-xl font-bold font-serif text-white">Trail India</span>
              <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <span>🇮🇳</span> Whole India
              </span>
            </div>
            <p className="text-stone-400 max-w-md">
              A community-driven travel discovery platform celebrating India's sovereign heritage, golden trails, sacred temples, and regional gastronomy.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-stone-300 font-medium">
            <a href="#destinations" className="hover:text-amber-400 transition">Destinations</a>
            <a href="#cuisine" className="hover:text-amber-400 transition">Cuisine & Culture</a>
            <a href="#festivals" className="hover:text-amber-400 transition">Festival Calendar</a>
            <a href="#map" className="hover:text-amber-400 transition">Golden India Map</a>
            <a href="#blog" className="hover:text-amber-400 transition">Travel Chronicles</a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
          <p>© 2026 Trail India. Open-source travel exploration project.</p>
          <p>
            Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-stone-400">OpenStreetMap</a> contributors & CARTO.
          </p>
        </div>
      </div>
    </footer>
  );
};
