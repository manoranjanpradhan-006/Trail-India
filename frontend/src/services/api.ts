import type { Destination, Place, Festival, Review, BlogPost, Favorite, Trip, User } from '../types';

const API_BASE = '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('trail_india_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; display_name: string; location?: string; bio?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Registration failed' }));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json() as Promise<{ token: string; user: User }>;
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Invalid login credentials' }));
      throw new Error(err.error || 'Invalid login credentials');
    }
    return res.json() as Promise<{ token: string; user: User }>;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json() as Promise<User>;
  },

  // Destinations
  async getDestinations(): Promise<Destination[]> {
    const res = await fetch(`${API_BASE}/destinations`);
    if (!res.ok) throw new Error('Failed to fetch destinations');
    return res.json();
  },

  async getDestination(slug: string): Promise<Destination> {
    const res = await fetch(`${API_BASE}/destinations/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch destination');
    return res.json();
  },

  // Places
  async getPlaces(params?: { category?: string; destination_id?: string; search?: string; featured?: boolean }): Promise<Place[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.destination_id) query.set('destination_id', params.destination_id);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');

    const res = await fetch(`${API_BASE}/places?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch places');
    return res.json();
  },

  async getPlace(id: string): Promise<Place> {
    const res = await fetch(`${API_BASE}/places/${id}`);
    if (!res.ok) throw new Error('Failed to fetch place');
    return res.json();
  },

  // Reviews
  async getPlaceReviews(placeId: string): Promise<Review[]> {
    const res = await fetch(`${API_BASE}/places/${placeId}/reviews`);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async createReview(placeId: string, data: { rating: number; title: string; comment: string; visit_date?: string }) {
    const res = await fetch(`${API_BASE}/places/${placeId}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to post review' }));
      throw new Error(err.error || 'Failed to post review');
    }
    return res.json();
  },

  async reportReview(reviewId: string) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Festivals
  async getFestivals(params?: { month?: string; destination_id?: string; search?: string }): Promise<Festival[]> {
    const query = new URLSearchParams();
    if (params?.month) query.set('month', params.month);
    if (params?.destination_id) query.set('destination_id', params.destination_id);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`${API_BASE}/festivals?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch festivals');
    return res.json();
  },

  // Blog
  async getBlogPosts(params?: { category?: string; search?: string; status?: string }): Promise<BlogPost[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${API_BASE}/blog/posts?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch blog posts');
    return res.json();
  },

  async getBlogPost(slug: string): Promise<BlogPost> {
    const res = await fetch(`${API_BASE}/blog/posts/${slug}`);
    if (!res.ok) throw new Error('Failed to fetch blog post');
    return res.json();
  },

  async createBlogPost(data: Partial<BlogPost>) {
    const res = await fetch(`${API_BASE}/blog/posts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to save blog post' }));
      throw new Error(err.error || 'Failed to save blog post');
    }
    return res.json();
  },

  async bookmarkPost(postId: string) {
    const res = await fetch(`${API_BASE}/blog/posts/${postId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Favorites
  async getFavorites(): Promise<Favorite[]> {
    const res = await fetch(`${API_BASE}/favorites`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch favorites');
    return res.json();
  },

  async addFavorite(placeId: string) {
    const res = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ place_id: placeId }),
    });
    if (!res.ok) throw new Error('Failed to add favorite');
    return res.json();
  },

  async removeFavorite(placeId: string) {
    const res = await fetch(`${API_BASE}/favorites/${placeId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove favorite');
    return res.json();
  },

  // Trips
  async getTrips(): Promise<Trip[]> {
    const res = await fetch(`${API_BASE}/trips`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },

  async createTrip(data: Partial<Trip>) {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save trip');
    return res.json();
  },

  async deleteTrip(tripId: string) {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete trip');
    return res.json();
  },

  // Admin
  async getPendingArticles(): Promise<BlogPost[]> {
    const res = await fetch(`${API_BASE}/admin/pending-articles`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch pending articles');
    return res.json();
  },

  async reviewArticle(postId: string, action: 'approve' | 'reject') {
    const res = await fetch(`${API_BASE}/admin/articles/${postId}/review`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }),
    });
    return res.json();
  },
};
