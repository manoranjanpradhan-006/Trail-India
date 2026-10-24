import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass } from 'lucide-react';

export const MapView = ({ places, onSelectPlace, selectedPlace }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const stateBoundaryLayerRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeRegion, setActiveRegion] = useState('all');
  const [showStateBorders, setShowStateBorders] = useState(true);

  const categories = [
    { id: 'all', label: 'All India Trails', emoji: '🇮🇳' },
    { id: 'heritage', label: 'UNESCO & Forts', emoji: '🏛️' },
    { id: 'temple', label: 'Sacred Temples', emoji: '🛕' },
    { id: 'nature', label: 'Himalayas & Backwaters', emoji: '🌿' },
    { id: 'beach', label: 'Coastlines & Sands', emoji: '🏖️' },
    { id: 'food_spot', label: 'Regional Cuisine', emoji: '🍛' },
  ];

  const regions = [
    { id: 'all', label: 'Whole India', center: [22.8, 80.5], zoom: 5 },
    { id: 'north', label: 'North India', center: [29.5, 77.0], zoom: 6 },
    { id: 'south', label: 'South India', center: [12.5, 77.5], zoom: 6.5 },
    { id: 'east', label: 'East & Central', center: [21.5, 86.0], zoom: 6.5 },
    { id: 'west', label: 'West India', center: [20.0, 72.5], zoom: 6 },
    { id: 'northeast', label: 'Northeast India', center: [26.0, 92.5], zoom: 6.5 },
  ];

  const filteredPlaces = places.filter((p) => {
    return activeCategory === 'all' || p.category === activeCategory;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [22.8, 80.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &copy; OpenStreetMap | Trail India',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
      loadGoldenIndiaBorders(map);
    }
  }, []);

  const loadGoldenIndiaBorders = async (map) => {
    try {
      const res = await fetch('/india-boundary.geojson');
      if (res.ok) {
        const geojsonData = await res.json();
        const group = L.layerGroup();

        // Outer Golden Glow Halo
        const glowLayer = L.geoJSON(geojsonData, {
          style: {
            color: '#fbbf24',
            weight: 9,
            opacity: 0.4,
            fillColor: '#d97706',
            fillOpacity: 0.05,
            lineCap: 'round',
            lineJoin: 'round',
          },
        });
        group.addLayer(glowLayer);

        // Radiant Golden Border
        const borderLayer = L.geoJSON(geojsonData, {
          style: {
            color: '#f59e0b',
            weight: 3.5,
            opacity: 1,
            fillColor: '#f59e0b',
            fillOpacity: 0.03,
            lineCap: 'round',
            lineJoin: 'round',
          },
        });
        group.addLayer(borderLayer);

        // Inner Golden Dash Line
        const innerLayer = L.geoJSON(geojsonData, {
          style: {
            color: '#fef08a',
            weight: 1.2,
            opacity: 0.85,
            dashArray: '8, 8',
            fillOpacity: 0,
          },
        });
        group.addLayer(innerLayer);

        group.addTo(map);
      }

      // State boundaries
      const statesRes = await fetch('/india-states.geojson');
      if (statesRes.ok) {
        const statesData = await statesRes.json();
        const stateLayer = L.geoJSON(statesData, {
          style: {
            color: '#f59e0b',
            weight: 1,
            opacity: 0.35,
            dashArray: '3, 5',
            fillColor: '#f59e0b',
            fillOpacity: 0.02,
          },
          onEachFeature: (feature, layer) => {
            const stateName = feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.name || 'Indian State';
            layer.bindTooltip(`
              <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; color: #f59e0b; font-size: 11px;">
                ✨ ${stateName}
              </div>
            `, { sticky: true });

            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  weight: 2,
                  color: '#fbbf24',
                  fillColor: '#f59e0b',
                  fillOpacity: 0.18,
                  opacity: 0.8,
                });
              },
              mouseout: () => {
                stateLayer.resetStyle(layer);
              },
            });
          },
        });
        stateLayer.addTo(map);
        stateBoundaryLayerRef.current = stateLayer;
      }
    } catch (e) {
      console.error('GeoJSON load error:', e);
    }
  };

  useEffect(() => {
    if (stateBoundaryLayerRef.current && mapInstanceRef.current) {
      if (showStateBorders) {
        stateBoundaryLayerRef.current.addTo(mapInstanceRef.current);
      } else {
        stateBoundaryLayerRef.current.remove();
      }
    }
  }, [showStateBorders]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredPlaces.forEach((place) => {
      if (!place.latitude || !place.longitude) return;

      const getEmoji = (cat) => {
        switch (cat) {
          case 'temple': return '🛕';
          case 'nature': return '🌿';
          case 'heritage': return '🏛️';
          case 'beach': return '🏖️';
          case 'food_spot': return '🍛';
          default: return '📍';
        }
      };

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(245, 158, 11, 0) 70%);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
              width: 36px;
              height: 36px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(245, 158, 11, 0.55), 0 2px 4px rgba(0,0,0,0.5);
              border: 2px solid #fffbeb;
              cursor: pointer;
            ">
              <span style="transform: rotate(45deg); font-size: 15px;">${getEmoji(place.category)}</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="min-width: 230px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <img src="${place.image_url}" style="width: 100%; height: 115px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; border: 1px solid #44403c;" />
          <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 3px 0; color: #1c1917;">${place.name}</h4>
          <p style="font-size: 11px; color: #78716c; margin: 0 0 8px 0;">📍 ${place.address || place.destination_name || 'India'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px solid #e7e5e4;">
            <span style="font-size: 10px; text-transform: uppercase; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
              ${place.category.replace('_', ' ')}
            </span>
            <button id="view-place-${place.id}" style="
              background: linear-gradient(135deg, #d97706, #b45309); 
              color: white; 
              border: none; 
              padding: 4px 12px; 
              border-radius: 8px; 
              font-size: 11px; 
              font-weight: 600; 
              cursor: pointer;
            ">Explore Trail →</button>
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

  useEffect(() => {
    if (selectedPlace && mapInstanceRef.current && selectedPlace.latitude && selectedPlace.longitude) {
      mapInstanceRef.current.flyTo([selectedPlace.latitude, selectedPlace.longitude], 12, { duration: 1.5 });
      const marker = markersRef.current[selectedPlace.id];
      if (marker) marker.openPopup();
    }
  }, [selectedPlace]);

  const handleRegionJump = (region) => {
    setActiveRegion(region.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(region.center, region.zoom, { duration: 1.4 });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[600px] rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl shadow-amber-950/20">
      
      {/* Region & Category Controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-2.5 pointer-events-none">
        
        {/* Regions */}
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-amber-500/30 p-1.5 rounded-2xl shadow-xl flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none self-start">
          <span className="text-[11px] font-bold text-amber-400 px-3 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-amber-400" /> India Regions:
          </span>
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRegionJump(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeRegion === r.id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md'
                  : 'bg-stone-800/70 text-stone-300 hover:text-white hover:bg-stone-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 p-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none self-start">
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

      {/* Floating Golden Legend */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none hidden sm:block">
        <div className="pointer-events-auto bg-stone-900/95 backdrop-blur-md border border-amber-500/50 p-4 rounded-2xl shadow-2xl text-xs text-stone-200 space-y-2 max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <div>
                <p className="font-serif font-bold text-white text-sm">Incredible India Golden Map</p>
                <p className="text-[10px] text-amber-400">Radiant Luminous Sovereign Borders</p>
              </div>
            </div>
            <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_12px_#f59e0b] animate-pulse" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-[11px]">
            <span className="text-stone-400">State Boundaries:</span>
            <button
              onClick={() => setShowStateBorders(!showStateBorders)}
              className="text-amber-400 hover:text-amber-300 font-semibold underline"
            >
              {showStateBorders ? 'Hide States' : 'Show States'}
            </button>
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full bg-[#161616]" />
    </div>
  );
};
