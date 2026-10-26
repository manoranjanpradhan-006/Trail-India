import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { INDIA_MAP_PATHS } from '../data/indiaMapPaths';
import { statesData, getStateById } from '../data/states';
import { Sparkles, ArrowRight } from 'lucide-react';

export const IndiaMap = ({ onSelectState, activeStateId = null }) => {
  const navigate = useNavigate();
  const [hoveredState, setHoveredState] = useState(null);
  const [pinnedState, setPinnedState] = useState(activeStateId || null);

  // Prominent labels across India with their adjusted coordinates
  const labeledStateKeys = [
    { key: 'ladakh', label: 'Ladakh', dx: 0, dy: 0 },
    { key: 'jammu-and-kashmir', label: 'J&K', dx: -10, dy: 0 },
    { key: 'himachal-pradesh', label: 'Himachal', dx: 12, dy: -4 },
    { key: 'punjab', label: 'Punjab', dx: -16, dy: 0 },
    { key: 'uttarakhand', label: 'Uttarakhand', dx: 14, dy: 0 },
    { key: 'haryana', label: 'Haryana', dx: -12, dy: 8 },
    { key: 'delhi', label: 'Delhi', dx: 12, dy: 0 },
    { key: 'rajasthan', label: 'Rajasthan', dx: 0, dy: 0 },
    { key: 'uttar-pradesh', label: 'Uttar Pradesh', dx: 0, dy: 0 },
    { key: 'bihar', label: 'Bihar', dx: 0, dy: 0 },
    { key: 'sikkim', label: 'Sikkim', dx: 0, dy: -6 },
    { key: 'arunachal-pradesh', label: 'Arunachal', dx: 0, dy: 0 },
    { key: 'assam', label: 'Assam', dx: 0, dy: 0 },
    { key: 'nagaland', label: 'Nagaland', dx: 16, dy: 0 },
    { key: 'meghalaya', label: 'Meghalaya', dx: 0, dy: 8 },
    { key: 'manipur', label: 'Manipur', dx: 16, dy: 0 },
    { key: 'mizoram', label: 'Mizoram', dx: 12, dy: 8 },
    { key: 'tripura', label: 'Tripura', dx: -14, dy: 8 },
    { key: 'jharkhand', label: 'Jharkhand', dx: 0, dy: 0 },
    { key: 'west-bengal', label: 'West Bengal', dx: 12, dy: 6 },
    { key: 'madhya-pradesh', label: 'Madhya Pradesh', dx: 0, dy: 0 },
    { key: 'gujarat', label: 'Gujarat', dx: 0, dy: 0 },
    { key: 'chhattisgarh', label: 'Chhattisgarh', dx: 0, dy: 0 },
    { key: 'odisha', label: 'Odisha', dx: 0, dy: 0 },
    { key: 'maharashtra', label: 'Maharashtra', dx: 0, dy: 0 },
    { key: 'telangana', label: 'Telangana', dx: 0, dy: 0 },
    { key: 'goa', label: 'Goa', dx: -16, dy: 0 },
    { key: 'karnataka', label: 'Karnataka', dx: 0, dy: 0 },
    { key: 'andhra-pradesh', label: 'Andhra Pradesh', dx: 12, dy: 0 },
    { key: 'kerala', label: 'Kerala', dx: -14, dy: 0 },
    { key: 'tamil-nadu', label: 'Tamil Nadu', dx: 0, dy: 0 },
  ];

  const handleStateClick = (stateKey) => {
    if (onSelectState) {
      onSelectState(stateKey);
    }
    navigate(`/state/${stateKey}`);
  };

  const activeKey = hoveredState || pinnedState;
  const activeStateData = activeKey ? (statesData[activeKey] || getStateById(activeKey)) : null;
  const activeCentroid = activeKey ? INDIA_MAP_PATHS[activeKey]?.centroid : null;

  return (
    <div className="relative w-full flex items-center justify-center select-none">
      
      {/* Main Vector Canvas with Survey of India Neatline Border */}
      <div className="relative w-full max-w-[460px] aspect-[1000/1150] max-h-[520px] flex items-center justify-center">
        
        <svg
          viewBox="0 0 1000 1150"
          className="w-full h-full filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Golden Glow Filter */}
            <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
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

            {/* Glowing Stroke for Hovered State */}
            <filter id="intense-gold-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ========================================================= */}
          {/* 1. SURVEY OF INDIA AUTHENTIC NEATLINE MAP BORDER (IMAGE)  */}
          {/* ========================================================= */}
          <g id="survey-of-india-border" pointerEvents="none">
            {/* Outer neatline rectangle */}
            <rect
              x="16"
              y="16"
              width="968"
              height="1118"
              fill="none"
              stroke="#E8B65C"
              strokeWidth="2.4"
              opacity="0.95"
            />
            {/* Secondary thin neatline */}
            <rect
              x="22"
              y="22"
              width="956"
              height="1106"
              fill="none"
              stroke="#E8B65C"
              strokeWidth="0.8"
              opacity="0.45"
            />
            {/* Inner neatline */}
            <rect
              x="28"
              y="28"
              width="944"
              height="1094"
              fill="none"
              stroke="#E8B65C"
              strokeWidth="1.2"
              opacity="0.8"
            />

            {/* 4 Corner Rosettes / Coordinate Corner Accents */}
            <g transform="translate(16, 16)">
              <rect x="0" y="0" width="12" height="12" fill="#E8B65C" opacity="0.8" />
              <circle cx="6" cy="6" r="2" fill="#06110D" />
            </g>
            <g transform="translate(972, 16)">
              <rect x="0" y="0" width="12" height="12" fill="#E8B65C" opacity="0.8" />
              <circle cx="6" cy="6" r="2" fill="#06110D" />
            </g>
            <g transform="translate(16, 1122)">
              <rect x="0" y="0" width="12" height="12" fill="#E8B65C" opacity="0.8" />
              <circle cx="6" cy="6" r="2" fill="#06110D" />
            </g>
            <g transform="translate(972, 1122)">
              <rect x="0" y="0" width="12" height="12" fill="#E8B65C" opacity="0.8" />
              <circle cx="6" cy="6" r="2" fill="#06110D" />
            </g>

            {/* Latitude and Longitude Degree Marks around the frame */}
            {/* Top & Bottom Longitude Marks (68°E to 96°E) */}
            {[
              { x: 100, label: '68°' },
              { x: 215, label: '72°' },
              { x: 330, label: '76°' },
              { x: 445, label: '80°' },
              { x: 560, label: '84°' },
              { x: 675, label: '88°' },
              { x: 790, label: '92°' },
              { x: 905, label: '96°E' },
            ].map(({ x, label }) => (
              <g key={`lng-${x}`}>
                <line x1={x} y1="16" x2={x} y2="28" stroke="#E8B65C" strokeWidth="1" opacity="0.7" />
                <line x1={x} y1="1122" x2={x} y2="1134" stroke="#E8B65C" strokeWidth="1" opacity="0.7" />
                <text x={x} y="13" textAnchor="middle" fill="#E8B65C" fontSize="9" fontFamily="'Plus Jakarta Sans', sans-serif" opacity="0.75">{label}</text>
                <text x={x} y="1144" textAnchor="middle" fill="#E8B65C" fontSize="9" fontFamily="'Plus Jakarta Sans', sans-serif" opacity="0.75">{label}</text>
              </g>
            ))}

            {/* Left & Right Latitude Marks (36°N to 8°N) */}
            {[
              { y: 80, label: '36°N' },
              { y: 210, label: '32°' },
              { y: 340, label: '28°' },
              { y: 470, label: '24°' },
              { y: 600, label: '20°' },
              { y: 730, label: '16°' },
              { y: 860, label: '12°' },
              { y: 990, label: '8°N' },
            ].map(({ y, label }) => (
              <g key={`lat-${y}`}>
                <line x1="16" y1={y} x2="28" y2={y} stroke="#E8B65C" strokeWidth="1" opacity="0.7" />
                <line x1="972" y1={y} x2="984" y2={y} stroke="#E8B65C" strokeWidth="1" opacity="0.7" />
                <text x="12" y={y + 3} textAnchor="end" fill="#E8B65C" fontSize="9" fontFamily="'Plus Jakarta Sans', sans-serif" opacity="0.75">{label}</text>
                <text x="988" y={y + 3} textAnchor="start" fill="#E8B65C" fontSize="9" fontFamily="'Plus Jakarta Sans', sans-serif" opacity="0.75">{label}</text>
              </g>
            ))}

            {/* Subtle Survey Coordinate Grid lines across ocean & background */}
            <g opacity="0.04" stroke="#E8B65C" strokeWidth="0.6" strokeDasharray="3 4">
              <line x1="28" y1="210" x2="972" y2="210" />
              <line x1="28" y1="340" x2="972" y2="340" />
              <line x1="28" y1="470" x2="972" y2="470" />
              <line x1="28" y1="600" x2="972" y2="600" />
              <line x1="28" y1="730" x2="972" y2="730" />
              <line x1="28" y1="860" x2="972" y2="860" />
              <line x1="330" y1="28" x2="330" y2="1122" />
              <line x1="560" y1="28" x2="560" y2="1122" />
              <line x1="790" y1="28" x2="790" y2="1122" />
            </g>

            {/* Authentic Survey of India Title Cartouche (Top Right - Matches Reference Image) */}
            <g transform="translate(685, 45)" opacity="0.9">
              {/* Box frame */}
              <rect x="0" y="0" width="270" height="85" fill="#06110D" fillOpacity="0.85" stroke="#E8B65C" strokeWidth="1" rx="6" />
              <rect x="3" y="3" width="264" height="79" fill="none" stroke="#E8B65C" strokeWidth="0.5" strokeDasharray="3 2" rx="4" opacity="0.6" />
              
              {/* Emblem icon */}
              <circle cx="135" cy="18" r="8" fill="none" stroke="#E8B65C" strokeWidth="1" />
              <path d="M 135 12 L 135 24 M 129 18 L 141 18" stroke="#E8B65C" strokeWidth="0.8" />
              
              {/* Official Heading */}
              <text x="135" y="42" textAnchor="middle" fill="#F8F1E5" fontSize="13" fontWeight="bold" fontFamily="'Cinzel', 'Playfair Display', serif" letterSpacing="1.5px">
                POLITICAL MAP OF INDIA
              </text>
              <text x="135" y="56" textAnchor="middle" fill="#E8B65C" fontSize="8" fontFamily="'Plus Jakarta Sans', sans-serif" letterSpacing="0.8px" fontWeight="600">
                SOVEREIGN TERRITORIAL BOUNDARIES
              </text>
              <text x="135" y="69" textAnchor="middle" fill="#B9B7AA" fontSize="7.5" fontFamily="'Plus Jakarta Sans', sans-serif">
                Survey of India Standards • All 28 States &amp; UTs
              </text>
            </g>

            {/* Nautical Watermark Labels in Surrounding Seas */}
            <text x="140" y="750" fill="#E8B65C" fontSize="13" letterSpacing="4px" fontFamily="'Cinzel', serif" opacity="0.22" fontWeight="600">
              ARABIAN SEA
            </text>
            <text x="710" y="750" fill="#E8B65C" fontSize="13" letterSpacing="4px" fontFamily="'Cinzel', serif" opacity="0.22" fontWeight="600">
              BAY OF BENGAL
            </text>
            <text x="430" y="1080" fill="#E8B65C" fontSize="12" letterSpacing="5px" fontFamily="'Cinzel', serif" opacity="0.22" fontWeight="600">
              INDIAN OCEAN
            </text>
          </g>

          {/* ========================================================= */}
          {/* 2. ALL STATES & UNION TERRITORIES (OFFICIAL SURVEY PATHS) */}
          {/* ========================================================= */}
          <g id="india-states-layer">
            {Object.entries(INDIA_MAP_PATHS).map(([stateKey, stateObj]) => {
              const isHovered = hoveredState === stateKey;
              const isPinned = pinnedState === stateKey && !hoveredState;
              const isSpecial = isHovered || isPinned;

              return (
                <g key={stateKey} className="transition-all duration-200">
                  {/* Glowing Underlay when state is hovered/selected */}
                  {isSpecial && (
                    <path
                      d={stateObj.path}
                      fill="none"
                      stroke="#F4D18A"
                      strokeWidth={isHovered ? 4 : 2.5}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      filter="url(#intense-gold-glow)"
                      opacity={isHovered ? 0.95 : 0.6}
                    />
                  )}

                  {/* Primary State Boundary & Territory */}
                  <path
                    d={stateObj.path}
                    fill={
                      isHovered
                        ? 'rgba(232, 182, 92, 0.4)'
                        : isPinned
                        ? 'rgba(232, 182, 92, 0.25)'
                        : 'rgba(11, 27, 20, 0.88)'
                    }
                    stroke={isSpecial ? '#F4D18A' : '#E8B65C'}
                    strokeWidth={isHovered ? 2.4 : 1.1}
                    strokeOpacity={isSpecial ? 1 : 0.65}
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

          {/* ========================================================= */}
          {/* 3. PROMINENT STATE & UT LABELS LAYER                      */}
          {/* ========================================================= */}
          <g id="state-labels-layer" pointerEvents="none">
            {labeledStateKeys.map(({ key, label, dx = 0, dy = 0 }) => {
              const stateObj = INDIA_MAP_PATHS[key];
              if (!stateObj?.centroid) return null;
              const [cx, cy] = stateObj.centroid;
              const isHovered = hoveredState === key;
              const isSelected = isHovered || (pinnedState === key && !hoveredState);

              return (
                <g key={key} transform={`translate(${cx + dx}, ${cy + dy})`}>
                  {/* Pip marker */}
                  <circle
                    cx="0"
                    cy="0"
                    r={isSelected ? 3.5 : 2}
                    fill={isSelected ? '#F4D18A' : '#E8B65C'}
                    filter={isSelected ? 'url(#gold-glow)' : undefined}
                    opacity={isSelected ? 1 : 0.7}
                  />

                  {/* Label text */}
                  <text
                    x="0"
                    y={-6}
                    textAnchor="middle"
                    fill={isSelected ? '#F8F1E5' : '#D1AF66'}
                    fontSize={isSelected ? 12 : 9.5}
                    fontWeight={isSelected ? '700' : '500'}
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                    letterSpacing="0.3px"
                    filter="drop-shadow(0 2px 3px rgba(0,0,0,0.95))"
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ========================================================= */}
        {/* 4. HOVER TOOLTIP (APPEARS ONLY ON HOVER OR SELECTION)     */}
        {/* ========================================================= */}
        <AnimatePresence>
          {activeCentroid && activeStateData && hoveredState && (
            <motion.div
              key={activeKey}
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
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
                onClick={() => handleStateClick(activeKey)}
                className="group cursor-pointer bg-[#0B1B14]/95 backdrop-blur-md border border-[#E8B65C] p-3 rounded-xl shadow-2xl shadow-black/80 hover:border-[#F4D18A] transition-all min-w-[190px] max-w-[240px]"
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span className="font-serif font-bold text-sm text-[#F8F1E5]">
                    {activeStateData.name || activeKey}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#E8B65C]/15 text-[#E8B65C] border border-[#E8B65C]/30">
                    Explore
                  </span>
                </div>

                {activeStateData.famousFestival && (
                  <p className="text-[10px] text-[#E8B65C] truncate mb-1 flex items-center gap-1 font-medium">
                    <span>🪔</span>
                    <span>{activeStateData.famousFestival}</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] font-semibold text-[#06110D] bg-gradient-to-r from-[#E8B65C] to-[#F4D18A] px-2.5 py-1 rounded-lg group-hover:brightness-110 transition-all shadow-md shadow-[#E8B65C]/20 mt-1">
                  <span>Explore State</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>

              {/* Triangle pointer */}
              <div className="w-2.5 h-2.5 bg-[#0B1B14] border-r border-b border-[#E8B65C] transform rotate-45 mx-auto -mt-1 shadow-md"></div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};

export default IndiaMap;
