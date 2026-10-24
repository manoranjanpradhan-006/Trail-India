import { 
  initialDestinations, 
  initialPlaces, 
  initialExperiences, 
  initialFestivals, 
  initialFoods, 
  initialStories, 
  initialCommunity 
} from '../data/initialData';

const API_BASE = '/api/v1';

function getAuthHeaders() {
  const token = localStorage.getItem('trail_india_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data) {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback Mock Auth
    const dummyUser = {
      id: 'usr_' + Date.now(),
      email: data.email,
      role: 'traveler',
      profile: {
        display_name: data.display_name || data.email.split('@')[0],
        location: data.location || 'India',
        bio: data.bio || 'Exploring India, one trail at a time.',
        is_local_contributor: true,
      },
    };
    const token = 'mock_jwt_' + Date.now();
    localStorage.setItem('trail_india_token', token);
    localStorage.setItem('trail_india_user', JSON.stringify(dummyUser));
    return { token, user: dummyUser };
  },

  async login(data) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Fallback Mock Demo login
    const role = data.email.includes('admin') ? 'admin' : data.email.includes('contributor') ? 'contributor' : 'traveler';
    const dummyUser = {
      id: 'usr_demo_' + role,
      email: data.email,
      role: role,
      profile: {
        display_name: role === 'admin' ? 'Royal Administrator' : role === 'contributor' ? 'Heritage Contributor' : 'Explorer traveler',
        location: 'New Delhi, India',
        bio: 'Passionate discoverer of sacred ghats, desert fortresses, and regional cuisines.',
        is_local_contributor: role !== 'traveler',
      },
    };
    const token = 'mock_jwt_token_' + role;
    localStorage.setItem('trail_india_token', token);
    localStorage.setItem('trail_india_user', JSON.stringify(dummyUser));
    return { token, user: dummyUser };
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const savedUser = localStorage.getItem('trail_india_user');
    if (savedUser) return JSON.parse(savedUser);
    throw new Error('Not authenticated');
  },

  // Destinations
  async getDestinations() {
    try {
      const res = await fetch(`${API_BASE}/destinations`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialDestinations;
  },

  async getDestination(slug) {
    try {
      const res = await fetch(`${API_BASE}/destinations/${slug}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialDestinations.find(d => d.slug === slug || d.id === slug) || initialDestinations[0];
  },

  // Places
  async getPlaces(params) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.destination_id) query.set('destination_id', params.destination_id);
      if (params?.search) query.set('search', params.search);
      if (params?.featured) query.set('featured', 'true');

      const res = await fetch(`${API_BASE}/places?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch (_) {}

    let list = [...initialPlaces];
    if (params?.category && params.category !== 'all') {
      list = list.filter(p => p.category === params.category);
    }
    if (params?.destination_id) {
      list = list.filter(p => p.destination_id === params.destination_id);
    }
    if (params?.search) {
      const s = params.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
    }
    return list;
  },

  async getPlace(id) {
    try {
      const res = await fetch(`${API_BASE}/places/${id}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialPlaces.find(p => p.id === id || p.slug === id) || initialPlaces[0];
  },

  // Experiences
  async getExperiences() {
    try {
      const res = await fetch(`${API_BASE}/experiences`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialExperiences;
  },

  // Reviews
  async getPlaceReviews(placeId) {
    try {
      const res = await fetch(`${API_BASE}/places/${placeId}/reviews`);
      if (res.ok) return await res.json();
    } catch (_) {}
    
    // Default verified reviews
    return [
      {
        id: 'rev-1',
        place_id: placeId,
        author_name: 'Dr. Debabrata Mishra',
        rating: 5,
        title: 'An architectural and cosmic wonder of Kalinga',
        comment: 'The precision of the 24 sundial chariot wheels is staggering. Arrive before 7:30 AM to admire the golden sunrise striking the eastern face.',
        visit_date: 'January 2026',
      },
      {
        id: 'rev-2',
        place_id: placeId,
        author_name: 'Roxanne & Marc (Explorers)',
        rating: 5,
        title: 'Unmatched spiritual grandeur and atmosphere',
        comment: 'The sheer scale and ancient stone carvings left us speechless. The evening illumination makes the entire structure look like it belongs to the gods.',
        visit_date: 'November 2025',
      },
    ];
  },

  async createReview(placeId, data) {
    try {
      const res = await fetch(`${API_BASE}/places/${placeId}/reviews`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { success: true, message: 'Review recorded' };
  },

  // Festivals
  async getFestivals(params) {
    try {
      const query = new URLSearchParams();
      if (params?.month) query.set('month', params.month);
      if (params?.destination_id) query.set('destination_id', params.destination_id);
      if (params?.search) query.set('search', params.search);

      const res = await fetch(`${API_BASE}/festivals?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialFestivals;
  },

  // Food
  async getFoods() {
    try {
      const res = await fetch(`${API_BASE}/food`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialFoods;
  },

  // Blog / Stories
  async getBlogPosts(params) {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.status) query.set('status', params.status);

      const res = await fetch(`${API_BASE}/blog/posts?${query.toString()}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const localPosts = JSON.parse(localStorage.getItem('trail_india_stories') || '[]');
    return [...localPosts, ...initialStories];
  },

  async createBlogPost(data) {
    try {
      const res = await fetch(`${API_BASE}/blog/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const newPost = {
      id: 'story-' + Date.now(),
      title: data.title,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: data.category || 'Travel Chronicles',
      excerpt: data.excerpt || data.content?.slice(0, 140) + '...',
      cover_image: data.cover_image || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      author_name: 'You (Contributor)',
      published_date: 'Just now',
      read_time_minutes: Math.ceil((data.content?.length || 500) / 400),
      views_count: 1,
      content: data.content,
      tags: data.tags || ['India', 'Heritage'],
      status: data.status || 'published',
    };

    const existing = JSON.parse(localStorage.getItem('trail_india_stories') || '[]');
    localStorage.setItem('trail_india_stories', JSON.stringify([newPost, ...existing]));
    return newPost;
  },

  async bookmarkPost(postId) {
    const bookmarks = JSON.parse(localStorage.getItem('trail_india_bookmarks') || '[]');
    if (!bookmarks.includes(postId)) {
      bookmarks.push(postId);
      localStorage.setItem('trail_india_bookmarks', JSON.stringify(bookmarks));
    }
    return { success: true };
  },

  // Community
  async getCommunityPosts() {
    try {
      const res = await fetch(`${API_BASE}/community`);
      if (res.ok) return await res.json();
    } catch (_) {}

    const localComm = JSON.parse(localStorage.getItem('trail_india_community') || '[]');
    return [...localComm, ...initialCommunity];
  },

  async createCommunityPost(data) {
    try {
      const res = await fetch(`${API_BASE}/community`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const newPost = {
      id: 'comm-' + Date.now(),
      author_name: data.author_name || 'Passionate Explorer',
      location: data.location || 'India',
      category: data.category || 'Hidden Gem',
      title: data.title,
      description: data.description,
      best_time: data.best_time || 'Year-round',
      photos: data.photos && data.photos.length > 0 ? data.photos : ['https://images.unsplash.com/photo-1629853683515-5c1cf7ca2687?auto=format&fit=crop&w=800&q=80'],
      likes: 1,
      created_at: 'Just now',
    };

    const existing = JSON.parse(localStorage.getItem('trail_india_community') || '[]');
    localStorage.setItem('trail_india_community', JSON.stringify([newPost, ...existing]));
    return newPost;
  },

  // Favorites
  async getFavorites() {
    try {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const localFavs = JSON.parse(localStorage.getItem('trail_india_favs') || '["plc-konark", "plc-puri-jagannath", "plc-jaipur-amber"]');
    return localFavs.map(id => ({ id: 'fav_' + id, place_id: id }));
  },

  async addFavorite(placeId) {
    const localFavs = JSON.parse(localStorage.getItem('trail_india_favs') || '[]');
    if (!localFavs.includes(placeId)) {
      localFavs.push(placeId);
      localStorage.setItem('trail_india_favs', JSON.stringify(localFavs));
    }
    return { success: true };
  },

  async removeFavorite(placeId) {
    let localFavs = JSON.parse(localStorage.getItem('trail_india_favs') || '[]');
    localFavs = localFavs.filter(id => id !== placeId);
    localStorage.setItem('trail_india_favs', JSON.stringify(localFavs));
    return { success: true };
  },

  // Trips / Itineraries
  async getTrips() {
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const localTrips = JSON.parse(localStorage.getItem('trail_india_trips') || '[]');
    if (localTrips.length === 0) {
      return [
        {
          id: 'trip-odisha-heritage',
          title: 'Odisha Heritage & Golden Triangle Odyssey',
          description: 'A 5-day spiritual & cultural journey through Bhubaneswar, Konark Sun Temple, Puri, and Chilika Lagoon.',
          start_date: '2026-11-20',
          end_date: '2026-11-25',
          budget_estimate: 18000,
          itinerary_data: [
            {
              day_number: 1,
              title: 'Temple City of Bhubaneswar & Ashokan Dhauli',
              items: [
                {
                  place_id: 'plc-dhauli',
                  place_name: 'Dhauli Shanti Stupa & Kalinga Edicts',
                  category: 'heritage',
                  time_slot: '09:00 AM',
                  estimated_cost: 300,
                  notes: 'Meditate near the Daya river valley and view ancient Ashokan rock inscriptions',
                },
                {
                  place_id: 'food-dalma',
                  place_name: 'Traditional Odia Dalma & Kanika Feast',
                  category: 'food_spot',
                  time_slot: '01:30 PM',
                  estimated_cost: 450,
                  notes: 'Taste Lord Jagannath temple recipe Dalma with sal leaf baked chhena poda',
                },
              ],
            },
            {
              day_number: 2,
              title: 'Konark Sun Chariot & Golden Sand Dunes',
              items: [
                {
                  place_id: 'plc-konark',
                  place_name: 'Konark Sun Temple',
                  category: 'heritage',
                  time_slot: '07:30 AM',
                  estimated_cost: 600,
                  notes: 'Study the 24 astronomical stone sundials during early golden morning rays',
                },
              ],
            },
            {
              day_number: 3,
              title: 'Sacred Puri & Irrawaddy Dolphin Boat Safari',
              items: [
                {
                  place_id: 'plc-puri-jagannath',
                  place_name: 'Shree Jagannath Temple & Anand Bazar',
                  category: 'temple',
                  time_slot: '06:00 AM',
                  estimated_cost: 400,
                  notes: 'Receive the morning Mahaprasad and witness the temple flag changing ritual (Patitapabana)',
                },
                {
                  place_id: 'plc-chilika',
                  place_name: 'Chilika Lake & Bird Sanctuary',
                  category: 'nature',
                  time_slot: '02:00 PM',
                  estimated_cost: 1200,
                  notes: 'Sail to Satapada to observe wild Irrawaddy dolphins and winter flamingo flocks',
                },
              ],
            },
          ],
        },
      ];
    }
    return localTrips;
  },

  async createTrip(data) {
    try {
      const res = await fetch(`${API_BASE}/trips`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (_) {}

    const newTrip = {
      id: 'trip_' + Date.now(),
      title: data.title,
      description: data.description,
      start_date: data.start_date,
      end_date: data.end_date,
      budget_estimate: data.budget_estimate || 15000,
      itinerary_data: data.itinerary_data || [],
      created_at: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('trail_india_trips') || '[]');
    localStorage.setItem('trail_india_trips', JSON.stringify([newTrip, ...existing]));
    return newTrip;
  },

  async deleteTrip(tripId) {
    let existing = JSON.parse(localStorage.getItem('trail_india_trips') || '[]');
    existing = existing.filter(t => t.id !== tripId);
    localStorage.setItem('trail_india_trips', JSON.stringify(existing));
    return { success: true };
  },
};
