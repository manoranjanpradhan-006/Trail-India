import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Place } from '../types';
import { Filter, Layers, Navigation, Info } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
  selectedPlace?: Place | null;
}

export const MapView: React.FC<MapViewProps> = ({ places, onSelectPlace, selectedPlace }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Highlights', emoji: '🌟' },
    { id: 'temple', label: 'Temples', emoji: '🛕' },
    { id: 'nature', label: 'Nature & Birds', emoji: '🌿' },
    { id: 'heritage', label: 'Heritage', emoji: '🏛️' },
    { id: 'beach', label: 'Beaches', emoji: '🏖️' },
    { id: 'food_spot', label: 'Cuisine', emoji: '🍛' },
    { id: 'craft_village', label: 'Craft Villages', emoji: '🎨' },
    { id: 'hidden_gem', label: 'Hidden Gems', emoji: '💎' },
  ];

  const filteredPlaces = activeCategory === 'all'
    ? places
    : places.filter((p) => p.category === activeCategory);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Odisha center coordinates [20.3, 85.8]
      const map = L.map(mapContainerRef.current, {
        center: [20.25, 85.7],
        zoom: 8,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Trail India',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map instance or cleanup on unmount
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredPlaces.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      const getEmoji = (cat: string) => {
        switch (cat) {
          case 'temple': return '🛕';
          case 'nature': return '🌿';
          case 'heritage': return '🏛️';
          case 'beach': return '🏖️';
          case 'food_spot': return '🍛';
          case 'craft_village': return '🎨';
          case 'hidden_gem': return '💎';
          default: return '📍';
        }
      };

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background: linear-gradient(135deg, #d97706, #ea580c);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            border: 2px solid #ffffff;
            cursor: pointer;
          ">
            <span style="transform: rotate(45deg); font-size: 16px;">${getEmoji(place.category)}</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

      // Popup content
      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <img src="${place.image_url}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #1c1917;">${place.name}</h4>
          <p style="font-size: 11px; color: #78716c; margin: 0 0 8px 0;">${place.address || place.destination_name || 'Odisha'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; text-transform: uppercase; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${place.category.replace('_', ' ')}
            </span>
            <button id="view-place-${place.id}" style="
              background: #d97706; 
              color: white; 
              border: none; 
              padding: 4px 10px; 
              border-radius: 6px; 
              font-size: 11px; 
              font-weight: 600; 
              cursor: pointer;
            ">Details →</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`view-place-${place.id}`);
        if (btn) {
          btn.onclick = () => onSelectPlace(place);
        }
      });

      markersRef.current[place.id] = marker;
    });
  }, [filteredPlaces, onSelectPlace]);

  // Center on selected place if provided
  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current && selectedPlace.latitude && selectedPlace.longitude) {
      mapInstanceRef.current.flyTo([selectedPlace.latitude, selectedPlace.longitude], 13, {
        duration: 1.5,
      });
      const marker = markersRef.current[selectedPlace.id];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedPlace]);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[550px] rounded-3xl overflow-hidden border border-stone-800 shadow-2xl">
      
      {/* Category Filter Overlay */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-700/80 p-2 rounded-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-stone-800/80 text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Floating Info Pill */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none hidden sm:block">
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-3.5 rounded-2xl shadow-xl text-xs text-stone-300 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
            🗺️
          </div>
          <div>
            <p className="font-semibold text-white">Interactive Odisha Trail Map</p>
            <p className="text-[11px] text-stone-400">Click any marker to view entry hours, fees, and travel guidance</p>
          </div>
        </div>
      </div>

      {/* Map DOM Element */}
      <div ref={mapContainerRef} className="w-full h-full bg-stone-950" />
    </div>
  );
};
