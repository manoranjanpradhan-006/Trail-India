// Flat list and lookup helpers for all curated Indian places & attractions
import { statesData } from './states';
import { initialPlaces } from './initialData';

// Aggregate all places from statesData plus initialPlaces
export const allCuratedPlaces = [
  ...initialPlaces,
  ...Object.values(statesData).flatMap(st => 
    st.topPlaces.map(p => ({
      ...p,
      state: st.name,
      stateId: st.id
    }))
  )
];

// Helper to filter by state
export const getPlacesByState = (stateId) => {
  const norm = stateId?.toLowerCase();
  return allCuratedPlaces.filter(p => 
    p.stateId === norm || 
    p.state?.toLowerCase() === norm ||
    p.location?.toLowerCase().includes(norm)
  );
};

// Helper to get place by ID
export const getPlaceById = (id) => {
  return allCuratedPlaces.find(p => p.id === id) || null;
};

export default allCuratedPlaces;
