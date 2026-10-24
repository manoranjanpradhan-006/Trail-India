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
    { id: 'east', label: 'East & Odisha', center: [20.5, 85.5], zoom: 6.5 },
    { id: 'west', label: 'West India', center: [23.0, 72.5], zoom: 6 },
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
            color: '#F4D18A',
            weight: 8,
            opacity: 0.35,
            fillColor: '#E8B65C',
            fillOpacity: 0.05,
            lineCap: 'round',
            lineJoin: 'round',
          },
        });
        group.addLayer(glowLayer);

        // Radiant Golden Border
        const borderLayer = L.geoJSON(geojsonData, {
          style: {
            color: '#E8B65C',
            weight: 3,
            opacity: 0.95,
            fillColor: '#E8B65C',
            fillOpacity: 0.02,
            lineCap: 'round',
            lineJoin: 'round',
          },
        });
        group.addLayer(borderLayer);

        group.addTo(map);
      }

      // State boundaries
      const statesRes = await fetch('/india-states.geojson');
      if (statesRes.ok) {
        const statesData = await statesRes.json();
        const stateLayer = L.geoJSON(statesData, {
          style: {
            color: '#E8B65C',
            weight: 1,
            opacity: 0.3,
            dashArray: '3, 5',
            fillColor: '#E8B65C',
            fillOpacity: 0.02,
          },
          onEachFeature: (feature, layer) => {
            const stateName = feature.properties?.NAME_1 || feature.properties?.ST_NM || feature.properties?.name || 'Indian State';
            layer.bindTooltip(`
              <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; color: #E8B65C; font-size: 11px;">
                ✨ ${stateName}
              </div>
            `, { sticky: true });

            layer.on({
              mouseover: (e) => {
                const target = e.target;
                target.setStyle({
                  weight: 2,
                  color: '#F4D18A',
                  fillColor: '#E8B65C',
                  fillOpacity: 0.15,
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
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: radial-gradient(circle, rgba(232, 182, 92, 0.45) 0%, rgba(232, 182, 92, 0) 70%);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              background: linear-gradient(135deg, #F4D18A 0%, #E8B65C 100%);
              width: 34px;
              height: 34px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 14px rgba(232, 182, 92, 0.4), 0 2px 4px rgba(0,0,0,0.6);
              border: 1.5px solid #F8F1E5;
              cursor: pointer;
            ">
              <span style="transform: rotate(45deg); font-size: 14px;">${getEmoji(place.category)}</span>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 34],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="min-width: 220px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <img src="${place.image_url}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 10px; margin-bottom: 8px; border: 1px solid #263B2F;" />
          <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 3px 0; color: #06110D;">${place.name}</h4>
          <p style="font-size: 11px; color: #57534e; margin: 0 0 8px 0;">📍 ${place.address || place.destination_name || 'India'}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px solid #e7e5e4;">
            <span style="font-size: 10px; text-transform: uppercase; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
              ${place.category?.replace('_', ' ')}
            </span>
            <button id="view-place-${place.id}" style="
              background: linear-gradient(135deg, #E8B65C, #C4923C); 
              color: #06110D; 
              border: none; 
              padding: 4px 12px; 
              border-radius: 8px; 
              font-size: 11px; 
              font-weight: 700; 
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
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[600px] rounded-3xl overflow-hidden border border-[#263B2F] shadow-2xl">
      
      {/* Region & Category Controls */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-col gap-2.5 pointer-events-none">
        
        {/* Regions */}
        <div className="pointer-events-auto bg-[#10251B]/95 backdrop-blur-md border border-[#263B2F] p-1.5 rounded-2xl shadow-xl flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none self-start">
          <span className="text-[11px] font-bold text-[#E8B65C] px-3 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-[#E8B65C]" /> India Circuits:
          </span>
          {regions.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRegionJump(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeRegion === r.id
                  ? 'bg-gradient-to-r from-[#E8B65C] to-[#C4923C] text-[#06110D] font-bold shadow-md'
                  : 'bg-[#0B1B14] text-[#B9B7AA] hover:text-[#F8F1E5] hover:bg-[#153224]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="pointer-events-auto bg-[#10251B]/95 backdrop-blur-md border border-[#263B2F] p-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 overflow-x-auto max-w-full scrollbar-none self-start">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-[#E8B65C] text-[#06110D] font-bold shadow'
                  : 'bg-[#0B1B14] text-[#B9B7AA] hover:text-[#F8F1E5] hover:bg-[#153224]'
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
        <div className="pointer-events-auto bg-[#10251B]/95 backdrop-blur-md border border-[#E8B65C]/40 p-4 rounded-2xl shadow-2xl text-xs text-[#F8F1E5] space-y-2 max-w-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇮🇳</span>
              <div>
                <p className="font-serif font-bold text-[#F8F1E5] text-sm">Golden Sovereign Map of India</p>
                <p className="text-[10px] text-[#E8B65C]">Luminous Sovereign Borders & Heritage Trails</p>
              </div>
            </div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#E8B65C] shadow-[0_0_12px_#E8B65C] animate-pulse" />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#263B2F] text-[11px]">
            <span className="text-[#B9B7AA]">State Boundaries:</span>
            <button
              onClick={() => setShowStateBorders(!showStateBorders)}
              className="text-[#E8B65C] hover:text-[#F4D18A] font-semibold underline"
            >
              {showStateBorders ? 'Hide States' : 'Show States'}
            </button>
          </div>
        </div>
      </div>

      <div ref={mapContainerRef} className="w-full h-full bg-[#06110D]" />
    </div>
  );
};
