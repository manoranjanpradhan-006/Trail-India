import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIA_MAP_PATHS } from '../data/indiaMapPaths';
import { statesData, getStateById } from '../data/states';
import { Sparkles, ArrowRight, Compass, MapPin } from 'lucide-react';

export const IndiaMap = ({ onSelectState, activeStateId = 'odisha' }) => {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState(null);
  const [pinnedState, setPinnedState] = useState('odisha');

  // Key states to display prominent text labels on the map
  const labeledStateKeys = [
    { key: 'jammu-and-kashmir', label: 'Jammu & Kashmir', dx: -20, dy: 0 },
    { key: 'himachal-pradesh', label: 'Himachal', dx: 15, dy: -5 },
    { key: 'punjab', label: 'Punjab', dx: -20, dy: 0 },
    { key: 'uttarakhand', label: 'Uttarakhand', dx: 15, dy: 0 },
    { key: 'haryana', label: 'Haryana', dx: -15, dy: 10 },
    { key: 'delhi', label: 'Delhi', dx: 12, dy: 0 },
    { key: 'rajasthan', label: 'Rajasthan', dx: 0, dy: 0 },
    { key: 'uttar-pradesh', label: 'Uttar Pradesh', dx: 0, dy: 0 },
    { key: 'bihar', label: 'Bihar', dx: 0, dy: 0 },
    { key: 'sikkim', label: 'Sikkim', dx: 0, dy: -8 },
    { key: 'arunachal-pradesh', label: 'Arunachal', dx: 0, dy: -5 },
    { key: 'assam', label: 'Assam', dx: 10, dy: 0 },
    { key: 'nagaland', label: 'Nagaland', dx: 15, dy: 0 },
    { key: 'meghalaya', label: 'Meghalaya', dx: -10, dy: 10 },
    { key: 'manipur', label: 'Manipur', dx: 15, dy: 0 },
    { key: 'mizoram', label: 'Mizoram', dx: 10, dy: 10 },
    { key: 'tripura', label: 'Tripura', dx: -10, dy: 10 },
    { key: 'jharkhand', label: 'Jharkhand', dx: 0, dy: 0 },
    { key: 'west-bengal', label: 'West Bengal', dx: 15, dy: 10 },
    { key: 'madhya-pradesh', label: 'Madhya Pradesh', dx: 0, dy: 0 },
    { key: 'gujarat', label: 'Gujarat', dx: 0, dy: 0 },
    { key: 'chhattisgarh', label: 'Chhattisgarh', dx: 0, dy: 0 },
    { key: 'odisha', label: 'Odisha', dx: 0, dy: 0, isHighlighted: true },
    { key: 'maharashtra', label: 'Maharashtra', dx: 0, dy: 0 },
    { key: 'telangana', label: 'Telangana', dx: 0, dy: 0 },
    { key: 'goa', label: 'Goa', dx: -18, dy: 0 },
    { key: 'karnataka', label: 'Karnataka', dx: 0, dy: 0 },
    { key: 'andhra-pradesh', label: 'Andhra Pradesh', dx: 10, dy: 0 },
    { key: 'kerala', label: 'Kerala', dx: -15, dy: 0 },
    { key: 'tamil-nadu', label: 'Tamil Nadu', dx: 0, dy: 0 },
  ];

  const handleStateClick = (stateKey) => {
    if (onSelectState) {
      onSelectState(stateKey);
    }
    navigate(`/state/${stateKey}`);
  };

  const currentActiveState = hoveredState || pinnedState || 'odisha';
  const activeStateData = statesData[currentActiveState] || getStateById(currentActiveState);
  const activeCentroid = INDIA_MAP_PATHS[currentActiveState]?.centroid || [600, 640];

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none">
      
      {/* Top Interactive Quick Pill Bar */}
      <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-[#263B2F]/60 text-xs">
        <div className="flex items-center gap-2 text-[#E8B65C]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B65C] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E8B65C]"></span>
          </span>
          <span className="font-serif tracking-wider uppercase text-[11px] font-semibold">
            Interactive Golden Sovereign Map
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {['odisha', 'rajasthan', 'kerala', 'himachal-pradesh', 'goa', 'ladakh'].map((stKey) => {
            const isSel = (hoveredState || pinnedState) === stKey;
            return (
              <button
                key={stKey}
                onClick={() => {
                  setPinnedState(stKey);
                  handleStateClick(stKey);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  isSel
                    ? 'bg-gradient-to-r from-[#E8B65C] to-[#F4D18A] text-[#06110D] font-bold shadow-md shadow-[#E8B65C]/20'
                    : 'bg-[#10251B] text-[#B9B7AA] border border-[#263B2F] hover:border-[#E8B65C] hover:text-[#F8F1E5]'
                }`}
              >
                {statesData[stKey]?.name || stKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main SVG Vector Map Canvas */}
      <div className="relative w-full aspect-[1000/1150] max-h-[720px] my-auto flex items-center justify-center">
        
        <svg
          viewBox="0 0 1000 1150"
          className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Golden Glow Filter */}
            <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feColorMatrix
                type="matrix"
                values="
                  1 0 0 0 0.91
                  0 1 0 0 0.71
                  0 0 1 0 0.36
                  0 0 0 0.8 0
                "
              />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Intense Pulsing Glow for Selected/Hovered State */}
            <filter id="intense-gold-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="8" result="blur1" />
              <feGaussianBlur stdDeviation="16" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Subtle Gradient Fills */}
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F4D18A" />
              <stop offset="50%" stopColor="#E8B65C" />
              <stop offset="100%" stopColor="#B38029" />
            </linearGradient>

            <radialGradient id="highlight-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E8B65C" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#E8B65C" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0B1B14" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Background Ambient Map Aura */}
          <circle cx="500" cy="550" r="420" fill="#E8B65C" opacity="0.02" filter="blur(60px)" />

          {/* Golden Compass Rose (Top-Right) */}
          <g transform="translate(850, 140)" className="opacity-75">
            <circle cx="0" cy="0" r="42" fill="none" stroke="#E8B65C" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
            <circle cx="0" cy="0" r="34" fill="none" stroke="#E8B65C" strokeWidth="1" opacity="0.7" />
            
            {/* 4 Cardinal points */}
            <path d="M 0 -38 L 4 -8 L 0 0 L -4 -8 Z" fill="#E8B65C" />
            <path d="M 0 38 L 4 8 L 0 0 L -4 8 Z" fill="#B38029" />
            <path d="M 38 0 L 8 4 L 0 0 L 8 -4 Z" fill="#B38029" />
            <path d="M -38 0 L -8 4 L 0 0 L -8 -4 Z" fill="#B38029" />
            
            {/* 4 Diagonal points */}
            <path d="M 24 -24 L 6 -2 L 0 0 L 2 -6 Z" fill="#F4D18A" opacity="0.6" />
            <path d="M -24 -24 L -6 -2 L 0 0 L -2 -6 Z" fill="#F4D18A" opacity="0.6" />
            <path d="M 24 24 L 6 2 L 0 0 L 2 6 Z" fill="#F4D18A" opacity="0.6" />
            <path d="M -24 24 L -6 2 L 0 0 L -2 6 Z" fill="#F4D18A" opacity="0.6" />

            {/* Central jewel */}
            <circle cx="0" cy="0" r="3.5" fill="#F4D18A" />
            
            {/* Labels */}
            <text x="0" y="-45" textAnchor="middle" fill="#E8B65C" fontSize="12" fontWeight="bold" fontFamily="'Cormorant Garamond', serif">N</text>
            <text x="0" y="55" textAnchor="middle" fill="#B9B7AA" fontSize="10" fontFamily="'Cormorant Garamond', serif">S</text>
            <text x="50" y="4" textAnchor="middle" fill="#B9B7AA" fontSize="10" fontFamily="'Cormorant Garamond', serif">E</text>
            <text x="-50" y="4" textAnchor="middle" fill="#B9B7AA" fontSize="10" fontFamily="'Cormorant Garamond', serif">W</text>
          </g>

          {/* State Paths Rendered */}
          <g id="india-states-layer">
            {Object.entries(INDIA_MAP_PATHS).map(([stateKey, stateObj]) => {
              const isHovered = hoveredState === stateKey;
              const isPinned = pinnedState === stateKey && !hoveredState;
              const isOdisha = stateKey === 'odisha';
              const isSpecial = isHovered || isPinned || (isOdisha && !hoveredState);

              return (
                <g key={stateKey} className="transition-all duration-300">
                  {/* Glowing Underlay when highlighted */}
                  {isSpecial && (
                    <path
                      d={stateObj.path}
                      fill="none"
                      stroke="#F4D18A"
                      strokeWidth={isHovered ? 4.5 : 3}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter="url(#intense-gold-glow)"
                      opacity={isHovered ? 0.95 : 0.65}
                    />
                  )}

                  {/* Primary State Boundary & Territory */}
                  <path
                    d={stateObj.path}
                    fill={
                      isHovered
                        ? 'rgba(232, 182, 92, 0.35)'
                        : isPinned
                        ? 'rgba(232, 182, 92, 0.22)'
                        : isOdisha
                        ? 'rgba(232, 182, 92, 0.18)'
                        : 'rgba(11, 27, 20, 0.85)'
                    }
                    stroke={isSpecial ? '#F4D18A' : '#E8B65C'}
                    strokeWidth={isHovered ? 2.5 : isSpecial ? 1.8 : 0.9}
                    strokeOpacity={isSpecial ? 1 : 0.55}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className="cursor-pointer transition-colors duration-200"
                    onMouseEnter={() => setHoveredState(stateKey)}
                    onMouseLeave={() => setHoveredState(null)}
                    onClick={() => handleStateClick(stateKey)}
                  />
                </g>
              );
            })}
          </g>

          {/* State Name Labels */}
          <g id="state-labels-layer" pointerEvents="none">
            {labeledStateKeys.map(({ key, label, dx = 0, dy = 0, isHighlighted }) => {
              const stateObj = INDIA_MAP_PATHS[key];
              if (!stateObj?.centroid) return null;
              const [cx, cy] = stateObj.centroid;
              const isHovered = hoveredState === key;
              const isSelected = isHovered || (pinnedState === key && !hoveredState) || (isHighlighted && !hoveredState);

              return (
                <g key={key} transform={`translate(${cx + dx}, ${cy + dy})`}>
                  {/* Tiny radiant centroid pip */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 4 : 2}
                    fill={isSelected ? '#F4D18A' : '#E8B65C'}
                    filter={isSelected ? 'url(#gold-glow)' : undefined}
                    opacity={isSelected ? 1 : 0.7}
                  />

                  {/* Text label with dark shadow for legibility */}
                  <text
                    x="0"
                    y={-7}
                    textAnchor="middle"
                    fill={isSelected ? '#F8F1E5' : '#D1AF66'}
                    fontSize={isSelected ? 13 : 10.5}
                    fontWeight={isSelected ? '700' : '500'}
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    letterSpacing="0.4px"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.95))"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Cursive "Incredible India" Signature Flourish (Bottom Right) */}
          <g transform="translate(680, 930)" pointerEvents="none" className="select-none">
            <text
              x="0"
              y="0"
              fill="#E8B65C"
              fontSize="38"
              fontFamily="'Great Vibes', cursive"
              opacity="0.85"
              filter="drop-shadow(0 2px 8px rgba(232, 182, 92, 0.4))"
            >
              Incredible India
            </text>
          </g>
        </svg>

        {/* Floating Interactive Tooltip / Card (Matches Reference Image) */}
        <AnimatePresence>
          {activeCentroid && (
            <motion.div
              key={currentActiveState}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: `${(activeCentroid[0] / 1000) * 100}%`,
                top: `${(activeCentroid[1] / 1150) * 100}%`,
                transform: 'translate(-50%, -125%)',
                zIndex: 30,
              }}
              className="pointer-events-auto"
            >
              <div
                onClick={() => handleStateClick(currentActiveState)}
                className="group cursor-pointer bg-[#0B1B14]/95 backdrop-blur-md border border-[#E8B65C] p-3.5 rounded-2xl shadow-2xl shadow-black/80 hover:border-[#F4D18A] transition-all min-w-[210px] max-w-[260px]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E8B65C] animate-pulse" />
                    <span className="font-serif font-bold text-base text-[#F8F1E5]">
                      {activeStateData?.name || currentActiveState}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E8B65C]/15 text-[#E8B65C] border border-[#E8B65C]/30">
                    Explore
                  </span>
                </div>

                <p className="text-[11px] text-[#B9B7AA] line-clamp-1 mb-2.5">
                  {activeStateData?.tagline || `Capital: ${activeStateData?.capital || 'Heritage State'}`}
                </p>

                <div className="flex items-center justify-between text-xs font-semibold text-[#06110D] bg-gradient-to-r from-[#E8B65C] to-[#F4D18A] px-3 py-1.5 rounded-xl group-hover:brightness-110 transition-all shadow-md shadow-[#E8B65C]/20">
                  <span>Explore {activeStateData?.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Little Downward Triangle Pointer */}
              <div className="w-3 h-3 bg-[#0B1B14] border-r border-b border-[#E8B65C] transform rotate-45 mx-auto -mt-1.5 shadow-md"></div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Bottom Hint */}
      <div className="text-center pt-2 text-[11px] text-[#B9B7AA] flex items-center gap-2">
        <MapPin className="w-3 h-3 text-[#E8B65C]" />
        <span>Click any state on the map or select a destination to view its complete heritage portal</span>
      </div>

    </div>
  );
};

export default IndiaMap;
