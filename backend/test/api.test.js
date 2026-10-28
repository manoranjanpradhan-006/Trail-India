import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { runSeed } from '../src/db/seed.js';

let server;
let baseUrl;
let authToken = '';
let testUserId = '';

test.before(async () => {
  await runSeed();
  return new Promise((resolve) => {
    // Listen on ephemeral port (0) for testing
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  return new Promise((resolve) => {
    server.close(resolve);
  });
});

test('GET /api/v1/health should return ok status', async () => {
  const res = await fetch(`${baseUrl}/api/v1/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'Trail India REST API (Node.js & Express)');
});

test('POST /api/v1/auth/login with valid demo credentials', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'traveler@trailindia.org',
      password: 'password123',
    }),
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.token);
  assert.equal(data.user.email, 'traveler@trailindia.org');
  assert.equal(data.user.role, 'traveler');
  authToken = data.token;
  testUserId = data.user.id;
});

test('POST /api/v1/auth/login with invalid password returns 401', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'traveler@trailindia.org',
      password: 'wrongpassword',
    }),
  });

  assert.equal(res.status, 401);
  const data = await res.json();
  assert.ok(data.error);
});

test('POST /api/v1/auth/register creates a new user', async () => {
  const uniqueEmail = `test_${Date.now()}@trailindia.org`;
  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: uniqueEmail,
      password: 'securepassword123',
      display_name: 'Test Explorer',
      location: 'Odisha',
      bio: 'Testing Trail India backend',
      is_local_contributor: true,
    }),
  });

  assert.equal(res.status, 201);
  const data = await res.json();
  assert.ok(data.token);
  assert.equal(data.user.email, uniqueEmail);
  assert.equal(data.user.profile.display_name, 'Test Explorer');
  assert.equal(data.user.profile.is_local_contributor, true);
});

test('GET /api/v1/auth/me returns authenticated user', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert.equal(res.status, 200);
  const user = await res.json();
  assert.equal(user.id, testUserId);
  assert.equal(user.email, 'traveler@trailindia.org');
});

test('GET /api/v1/destinations returns seeded destinations', async () => {
  const res = await fetch(`${baseUrl}/api/v1/destinations`);
  assert.equal(res.status, 200);
  const destinations = await res.json();
  assert.ok(Array.isArray(destinations));
  assert.ok(destinations.length >= 7);
  assert.ok(Array.isArray(destinations[0].highlights));
});

test('GET /api/v1/destinations/:slug returns single destination with places', async () => {
  const res = await fetch(`${baseUrl}/api/v1/destinations/odisha`);
  assert.equal(res.status, 200);
  const dest = await res.json();
  assert.equal(dest.slug, 'odisha');
  assert.ok(Array.isArray(dest.places));
});

test('GET /api/v1/places returns places array with filters', async () => {
  const res = await fetch(`${baseUrl}/api/v1/places?category=heritage`);
  assert.equal(res.status, 200);
  const places = await res.json();
  assert.ok(Array.isArray(places));
  assert.ok(places.every((p) => p.category === 'heritage'));
});

test('GET /api/v1/places/:id returns place details', async () => {
  const res = await fetch(`${baseUrl}/api/v1/places/plc-konark`);
  assert.equal(res.status, 200);
  const place = await res.json();
  assert.equal(place.id, 'plc-konark');
  assert.ok(Array.isArray(place.highlights));
});

test('GET & POST /api/v1/places/:id/reviews', async () => {
  // Post review
  const postRes = await fetch(`${baseUrl}/api/v1/places/plc-konark/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      rating: 5,
      title: 'Majestic sunrise experience',
      comment: 'The stone carving detail on the chariot wheels took my breath away.',
      visit_date: 'October 2026',
    }),
  });

  assert.equal(postRes.status, 201);
  const saved = await postRes.json();
  assert.equal(saved.place_id, 'plc-konark');
  assert.equal(saved.rating, 5);

  // Get reviews
  const getRes = await fetch(`${baseUrl}/api/v1/places/plc-konark/reviews`);
  assert.equal(getRes.status, 200);
  const reviews = await getRes.json();
  assert.ok(Array.isArray(reviews));
  assert.ok(reviews.length >= 1);
});

test('GET /api/v1/experiences returns curated experiences', async () => {
  const res = await fetch(`${baseUrl}/api/v1/experiences`);
  assert.equal(res.status, 200);
  const experiences = await res.json();
  assert.ok(Array.isArray(experiences));
  assert.ok(experiences.length >= 5);
});

test('GET /api/v1/festivals returns festivals', async () => {
  const res = await fetch(`${baseUrl}/api/v1/festivals`);
  assert.equal(res.status, 200);
  const festivals = await res.json();
  assert.ok(Array.isArray(festivals));
  assert.ok(festivals.length >= 5);
});

test('GET /api/v1/food returns regional culinary dishes', async () => {
  const res = await fetch(`${baseUrl}/api/v1/food`);
  assert.equal(res.status, 200);
  const foods = await res.json();
  assert.ok(Array.isArray(foods));
  assert.ok(foods.length >= 5);
  assert.ok(Array.isArray(foods[0].key_ingredients));
});

test('GET & POST /api/v1/blog/posts', async () => {
  // Create post
  const createRes = await fetch(`${baseUrl}/api/v1/blog/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: 'Dawn at the Golden Beaches of Puri',
      category: 'Coastal Trails',
      content: 'Early mornings in Puri offer serene fishing boat silhouettes against the Bay of Bengal sunrise.',
      tags: ['Odisha', 'Beach', 'Spiritual'],
    }),
  });

  assert.equal(createRes.status, 201);
  const newPost = await createRes.json();
  assert.equal(newPost.title, 'Dawn at the Golden Beaches of Puri');
  assert.ok(Array.isArray(newPost.tags));

  // Fetch posts
  const getRes = await fetch(`${baseUrl}/api/v1/blog/posts`);
  assert.equal(getRes.status, 200);
  const posts = await getRes.json();
  assert.ok(posts.some((p) => p.id === newPost.id));
});

test('GET & POST /api/v1/community', async () => {
  const postRes = await fetch(`${baseUrl}/api/v1/community`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: 'Secret terrace in Konark',
      description: 'Found a lovely quiet tea spot right outside the western gate.',
      location: 'Konark, Odisha',
      category: 'Local Tip',
    }),
  });

  assert.equal(postRes.status, 201);
  const comm = await postRes.json();
  assert.equal(comm.title, 'Secret terrace in Konark');

  // Like post
  const likeRes = await fetch(`${baseUrl}/api/v1/community/${comm.id}/like`, {
    method: 'POST',
  });
  assert.equal(likeRes.status, 200);
  const likeData = await likeRes.json();
  assert.equal(likeData.likes, 2);
});

test('Favorites workflow (add, list, delete)', async () => {
  // Add favorite
  const addRes = await fetch(`${baseUrl}/api/v1/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ place_id: 'plc-chilika' }),
  });
  assert.equal(addRes.status, 201);

  // List favorites
  const listRes = await fetch(`${baseUrl}/api/v1/favorites`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.equal(listRes.status, 200);
  const favs = await listRes.json();
  assert.ok(favs.some((f) => f.place_id === 'plc-chilika'));

  // Delete favorite
  const delRes = await fetch(`${baseUrl}/api/v1/favorites/plc-chilika`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.equal(delRes.status, 200);
});

test('Trips workflow (create, list, update, delete)', async () => {
  // Create trip
  const createRes = await fetch(`${baseUrl}/api/v1/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      title: 'Weekend in Konark and Puri',
      description: 'Quick coastal temple getaway',
      start_date: '2026-12-01',
      end_date: '2026-12-03',
      budget_estimate: 8000,
      itinerary_data: [
        { day_number: 1, title: 'Konark Arrival', items: [] },
      ],
    }),
  });

  assert.equal(createRes.status, 201);
  const trip = await createRes.json();
  assert.equal(trip.title, 'Weekend in Konark and Puri');

  // List trips
  const listRes = await fetch(`${baseUrl}/api/v1/trips`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.equal(listRes.status, 200);
  const trips = await listRes.json();
  assert.ok(trips.some((t) => t.id === trip.id));

  // Delete trip
  const delRes = await fetch(`${baseUrl}/api/v1/trips/${trip.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${authToken}` },
  });
  assert.equal(delRes.status, 200);
});

