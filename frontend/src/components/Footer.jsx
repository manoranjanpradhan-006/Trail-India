import React from 'react';

export const Footer = ({ onNavigateTab }) => {
  return (
    <footer className="mt-20 border-t border-[#263B2F] bg-[#06110D] text-[#B9B7AA] text-xs py-12 relative">
      
      {/* Subtle Golden Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8B65C]/40 to-transparent" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#263B2F]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10251B] border border-[#E8B65C]/40 flex items-center justify-center text-[#E8B65C]">
                🛕
              </div>
              <span className="text-xl font-bold font-serif text-[#F8F1E5]">Trail India</span>
              <span className="text-[9px] uppercase font-bold bg-[#10251B] text-[#E8B65C] px-2.5 py-0.5 rounded-full border border-[#263B2F] flex items-center gap-1">
                <span>🇮🇳</span> Whole India
              </span>
            </div>
            <p className="text-[#B9B7AA] text-xs max-w-md leading-relaxed">
              A community-driven luxury travel platform celebrating India's sovereign heritage, golden trails, sacred temples, and regional gastronomy.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-[#F8F1E5] font-medium text-xs">
            <button onClick={() => onNavigateTab && onNavigateTab('destinations')} className="hover:text-[#E8B65C] transition">Destinations</button>
            <button onClick={() => onNavigateTab && onNavigateTab('experiences')} className="hover:text-[#E8B65C] transition">Experiences</button>
            <button onClick={() => onNavigateTab && onNavigateTab('festivals')} className="hover:text-[#E8B65C] transition">Festivals</button>
            <button onClick={() => onNavigateTab && onNavigateTab('food')} className="hover:text-[#E8B65C] transition">Food & Culture</button>
            <button onClick={() => onNavigateTab && onNavigateTab('map')} className="hover:text-[#E8B65C] transition">Golden Map</button>
            <button onClick={() => onNavigateTab && onNavigateTab('blog')} className="hover:text-[#E8B65C] transition">Travel Stories</button>
            <button onClick={() => onNavigateTab && onNavigateTab('community')} className="hover:text-[#E8B65C] transition">Community</button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[#B9B7AA] text-[11px]">
          <p>© 2026 Trail India. Discover India. Experience Its Stories. Explore Beyond the Ordinary.</p>
          <p>
            Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-[#E8B65C]">OpenStreetMap</a> contributors & CARTO.
          </p>
        </div>
      </div>
    </footer>
  );
};
