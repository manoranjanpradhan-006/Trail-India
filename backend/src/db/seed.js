import { getDatabase } from './database.js';
import {
  seedUsers,
  seedDestinations,
  seedPlaces,
  seedExperiences,
  seedFestivals,
  seedFoods,
  seedStories,
  seedCommunity,
  seedReviews,
  seedTrips,
} from './seedData.js';

export function runSeed(force = false) {
  const db = getDatabase();
  console.log('--- Running Trail India Database Seeder ---');

  // Check if seeding is needed
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0 && !force) {
    console.log('Database already contains data. Checking for missing tables/records...');
  }

  // 1. Seed Users & Profiles
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password_hash, role)
    VALUES (?, ?, ?, ?)
  `);

  const insertProfile = db.prepare(`
    INSERT OR REPLACE INTO user_profiles (user_id, display_name, bio, avatar_url, location, travel_interests, is_local_contributor)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of seedUsers) {
    insertUser.run(u.id, u.email, u.password_hash, u.role);
    insertProfile.run(
      u.id,
      u.profile.display_name,
      u.profile.bio,
      u.profile.avatar_url,
      u.profile.location,
      u.profile.travel_interests,
      u.profile.is_local_contributor
    );
  }
  console.log(`✓ Seeded ${seedUsers.length} users and user profiles`);

  // 2. Seed Destinations
  const insertDest = db.prepare(`
    INSERT OR REPLACE INTO destinations (
      id, name, slug, state, district, tagline, description, overview, banner_image,
      best_time_to_visit, weather_info, how_to_reach, latitude, longitude, category,
      estimated_budget, highlights, place_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const d of seedDestinations) {
    insertDest.run(
      d.id,
      d.name,
      d.slug,
      d.state,
      d.district,
      d.tagline,
      d.description,
      d.overview,
      d.banner_image,
      d.best_time_to_visit,
      d.weather_info,
      d.how_to_reach,
      d.latitude,
      d.longitude,
      d.category,
      d.estimated_budget,
      d.highlights,
      d.place_count
    );
  }
  console.log(`✓ Seeded ${seedDestinations.length} destinations`);

  // 3. Seed Places
  const insertPlace = db.prepare(`
    INSERT OR REPLACE INTO places (
      id, destination_id, destination_name, name, slug, category, description,
      address, latitude, longitude, entry_fee, opening_hours, image_url,
      highlights, is_featured, rating, review_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of seedPlaces) {
    insertPlace.run(
      p.id,
      p.destination_id,
      p.destination_name,
      p.name,
      p.slug,
      p.category,
      p.description,
      p.address,
      p.latitude,
      p.longitude,
      p.entry_fee,
      p.opening_hours,
      p.image_url,
      p.highlights,
      p.is_featured,
      p.rating,
      p.review_count
    );
  }
  console.log(`✓ Seeded ${seedPlaces.length} places`);

  // 4. Seed Experiences
  const insertExp = db.prepare(`
    INSERT OR REPLACE INTO experiences (
      id, title, location, state, category, duration, difficulty, price_estimate,
      rating, image_url, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const exp of seedExperiences) {
    insertExp.run(
      exp.id,
      exp.title,
      exp.location,
      exp.state,
      exp.category,
      exp.duration,
      exp.difficulty,
      exp.price_estimate,
      exp.rating,
      exp.image_url,
      exp.description
    );
  }
  console.log(`✓ Seeded ${seedExperiences.length} experiences`);

  // 5. Seed Festivals
  const insertFest = db.prepare(`
    INSERT OR REPLACE INTO festivals (
      id, destination_id, name, slug, state, location, description, celebration_month,
      typical_season, date_info, cultural_significance, visitor_tips, image_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const f of seedFestivals) {
    insertFest.run(
      f.id,
      f.destination_id,
      f.name,
      f.slug,
      f.state,
      f.location,
      f.description,
      f.celebration_month,
      f.typical_season,
      f.date_info,
      f.cultural_significance,
      f.visitor_tips,
      f.image_url
    );
  }
  console.log(`✓ Seeded ${seedFestivals.length} festivals`);

  // 6. Seed Food
  const insertFood = db.prepare(`
    INSERT OR REPLACE INTO foods (
      id, name, region, state, category, tagline, image_url, description,
      cultural_background, key_ingredients, where_to_try
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const fd of seedFoods) {
    insertFood.run(
      fd.id,
      fd.name,
      fd.region,
      fd.state,
      fd.category,
      fd.tagline,
      fd.image_url,
      fd.description,
      fd.cultural_background,
      fd.key_ingredients,
      fd.where_to_try
    );
  }
  console.log(`✓ Seeded ${seedFoods.length} foods`);

  // 7. Seed Stories / Blog Posts
  const insertStory = db.prepare(`
    INSERT OR REPLACE INTO blog_posts (
      id, author_id, author_name, destination_id, title, slug, excerpt,
      cover_image, content, category, tags, status, read_time_minutes,
      views_count, published_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of seedStories) {
    insertStory.run(
      s.id,
      s.author_id,
      s.author_name,
      s.destination_id,
      s.title,
      s.slug,
      s.excerpt,
      s.cover_image,
      s.content,
      s.category,
      s.tags,
      s.status,
      s.read_time_minutes,
      s.views_count,
      s.published_date
    );
  }
  console.log(`✓ Seeded ${seedStories.length} blog stories`);

  // 8. Seed Community
  const insertComm = db.prepare(`
    INSERT OR REPLACE INTO community_posts (
      id, user_id, author_name, location, category, title, description,
      best_time, photos, likes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of seedCommunity) {
    insertComm.run(
      c.id,
      c.user_id,
      c.author_name,
      c.location,
      c.category,
      c.title,
      c.description,
      c.best_time,
      c.photos,
      c.likes
    );
  }
  console.log(`✓ Seeded ${seedCommunity.length} community posts`);

  // 9. Seed Reviews
  const insertRev = db.prepare(`
    INSERT OR REPLACE INTO reviews (
      id, place_id, user_id, author_name, rating, title, comment, visit_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const r of seedReviews) {
    insertRev.run(
      r.id,
      r.place_id,
      r.user_id,
      r.author_name,
      r.rating,
      r.title,
      r.comment,
      r.visit_date
    );
  }
  console.log(`✓ Seeded ${seedReviews.length} reviews`);

  // 10. Seed Trips
  const insertTrip = db.prepare(`
    INSERT OR REPLACE INTO trips (
      id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of seedTrips) {
    insertTrip.run(
      t.id,
      t.user_id,
      t.title,
      t.description,
      t.start_date,
      t.end_date,
      t.budget_estimate,
      t.itinerary_data
    );
  }
  console.log(`✓ Seeded ${seedTrips.length} trips`);

  console.log('--- Database seeding completed successfully ---');
}

// If run directly
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed(true);
}

