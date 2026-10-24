export interface User {
  id: string;
  email: string;
  role: 'traveler' | 'contributor' | 'admin';
  created_at: string;
  profile?: Profile;
}

export interface Profile {
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url?: string;
  location: string;
  travel_interests: string[];
  is_local_contributor: boolean;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string;
  district: string;
  tagline: string;
  description: string;
  overview: string;
  banner_image: string;
  best_time_to_visit: string;
  weather_info: string;
  how_to_reach: string;
  latitude: number;
  longitude: number;
  place_count?: number;
  places?: Place[];
  created_at: string;
}

export interface Place {
  id: string;
  destination_id: string;
  destination_name?: string;
  name: string;
  slug: string;
  category: 'attraction' | 'temple' | 'beach' | 'heritage' | 'nature' | 'food_spot' | 'hidden_gem' | 'craft_village';
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  entry_fee: string;
  opening_hours: string;
  image_url: string;
  highlights: string[];
  is_featured: boolean;
  rating?: number;
  review_count?: number;
}

export interface Festival {
  id: string;
  destination_id?: string;
  destination_name?: string;
  name: string;
  slug: string;
  description: string;
  celebration_month: string;
  typical_season: string;
  confirmed_date_info: string;
  location_summary: string;
  cultural_significance: string;
  visitor_tips: string;
  image_url: string;
}

export interface Review {
  id: string;
  place_id: string;
  place_name?: string;
  user_id: string;
  author_name: string;
  rating: number;
  title: string;
  comment: string;
  visit_date: string;
  is_reported?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BlogPost {
  id: string;
  author_id: string;
  author_name: string;
  destination_id?: string;
  destination_name?: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  content: string;
  category: string;
  tags: string[];
  status: 'draft' | 'pending_review' | 'published' | 'rejected';
  read_time_minutes: number;
  views_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  place_id: string;
  place?: Place;
  created_at: string;
}

export interface TripDayItem {
  place_id: string;
  place_name: string;
  category: string;
  time_slot: string;
  estimated_cost: number;
  notes: string;
}

export interface TripDay {
  day_number: number;
  title: string;
  items: TripDayItem[];
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  budget_estimate: number;
  itinerary_data: TripDay[];
  created_at: string;
}
