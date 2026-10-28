import { getDatabase, db } from './database.js';
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

export async function runSeed(force = false) {
  await getDatabase();
  console.log('--- Running Trail India Database Seeder ---');

  const userRow = await db.getOne('SELECT COUNT(*) as count FROM users');
  const userCount = Number(userRow?.count || 0);

  if (userCount > 0 && !force) {
    console.log('Database already contains records. Syncing seed data...');
  }

  // 1. Users & Profiles
  for (const u of seedUsers) {
    await db.query(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash,
         role = EXCLUDED.role`,
      [u.id, u.email, u.password_hash, u.role]
    );

    await db.query(
      `INSERT INTO user_profiles (user_id, display_name, bio, avatar_url, location, travel_interests, is_local_contributor)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         bio = EXCLUDED.bio,
         avatar_url = EXCLUDED.avatar_url,
         location = EXCLUDED.location,
         travel_interests = EXCLUDED.travel_interests,
         is_local_contributor = EXCLUDED.is_local_contributor`,
      [
        u.id,
        u.profile.display_name,
        u.profile.bio,
        u.profile.avatar_url,
        u.profile.location,
        u.profile.travel_interests,
        Boolean(u.profile.is_local_contributor),
      ]
    );
  }
  console.log(`✓ Seeded ${seedUsers.length} users and user profiles`);

  // 2. Destinations
  for (const d of seedDestinations) {
    await db.query(
      `INSERT INTO destinations (
         id, name, slug, state, district, tagline, description, overview, banner_image,
         best_time_to_visit, weather_info, how_to_reach, latitude, longitude, category,
         estimated_budget, highlights, place_count
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         state = EXCLUDED.state,
         district = EXCLUDED.district,
         tagline = EXCLUDED.tagline,
         description = EXCLUDED.description,
         overview = EXCLUDED.overview,
         banner_image = EXCLUDED.banner_image,
         best_time_to_visit = EXCLUDED.best_time_to_visit,
         weather_info = EXCLUDED.weather_info,
         how_to_reach = EXCLUDED.how_to_reach,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         category = EXCLUDED.category,
         estimated_budget = EXCLUDED.estimated_budget,
         highlights = EXCLUDED.highlights,
         place_count = EXCLUDED.place_count`,
      [
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
        d.place_count,
      ]
    );
  }
  console.log(`✓ Seeded ${seedDestinations.length} destinations`);

  // 3. Places
  for (const p of seedPlaces) {
    await db.query(
      `INSERT INTO places (
         id, destination_id, destination_name, name, slug, category, description,
         address, latitude, longitude, entry_fee, opening_hours, image_url,
         highlights, is_featured, rating, review_count
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         destination_id = EXCLUDED.destination_id,
         destination_name = EXCLUDED.destination_name,
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         category = EXCLUDED.category,
         description = EXCLUDED.description,
         address = EXCLUDED.address,
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         entry_fee = EXCLUDED.entry_fee,
         opening_hours = EXCLUDED.opening_hours,
         image_url = EXCLUDED.image_url,
         highlights = EXCLUDED.highlights,
         is_featured = EXCLUDED.is_featured,
         rating = EXCLUDED.rating,
         review_count = EXCLUDED.review_count`,
      [
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
        Boolean(p.is_featured),
        p.rating,
        p.review_count,
      ]
    );
  }
  console.log(`✓ Seeded ${seedPlaces.length} places`);

  // 4. Experiences
  for (const exp of seedExperiences) {
    await db.query(
      `INSERT INTO experiences (
         id, title, location, state, category, duration, difficulty, price_estimate,
         rating, image_url, description
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         location = EXCLUDED.location,
         state = EXCLUDED.state,
         category = EXCLUDED.category,
         duration = EXCLUDED.duration,
         difficulty = EXCLUDED.difficulty,
         price_estimate = EXCLUDED.price_estimate,
         rating = EXCLUDED.rating,
         image_url = EXCLUDED.image_url,
         description = EXCLUDED.description`,
      [
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
        exp.description,
      ]
    );
  }
  console.log(`✓ Seeded ${seedExperiences.length} experiences`);

  // 5. Festivals
  for (const f of seedFestivals) {
    await db.query(
      `INSERT INTO festivals (
         id, destination_id, name, slug, state, location, description, celebration_month,
         typical_season, date_info, cultural_significance, visitor_tips, image_url
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO UPDATE SET
         destination_id = EXCLUDED.destination_id,
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         state = EXCLUDED.state,
         location = EXCLUDED.location,
         description = EXCLUDED.description,
         celebration_month = EXCLUDED.celebration_month,
         typical_season = EXCLUDED.typical_season,
         date_info = EXCLUDED.date_info,
         cultural_significance = EXCLUDED.cultural_significance,
         visitor_tips = EXCLUDED.visitor_tips,
         image_url = EXCLUDED.image_url`,
      [
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
        f.image_url,
      ]
    );
  }
  console.log(`✓ Seeded ${seedFestivals.length} festivals`);

  // 6. Food
  for (const fd of seedFoods) {
    await db.query(
      `INSERT INTO foods (
         id, name, region, state, category, tagline, image_url, description,
         cultural_background, key_ingredients, where_to_try
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         region = EXCLUDED.region,
         state = EXCLUDED.state,
         category = EXCLUDED.category,
         tagline = EXCLUDED.tagline,
         image_url = EXCLUDED.image_url,
         description = EXCLUDED.description,
         cultural_background = EXCLUDED.cultural_background,
         key_ingredients = EXCLUDED.key_ingredients,
         where_to_try = EXCLUDED.where_to_try`,
      [
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
        fd.where_to_try,
      ]
    );
  }
  console.log(`✓ Seeded ${seedFoods.length} foods`);

  // 7. Stories / Blog Posts
  for (const s of seedStories) {
    await db.query(
      `INSERT INTO blog_posts (
         id, author_id, author_name, destination_id, title, slug, excerpt,
         cover_image, content, category, tags, status, read_time_minutes,
         views_count, published_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       ON CONFLICT (id) DO UPDATE SET
         author_id = EXCLUDED.author_id,
         author_name = EXCLUDED.author_name,
         destination_id = EXCLUDED.destination_id,
         title = EXCLUDED.title,
         slug = EXCLUDED.slug,
         excerpt = EXCLUDED.excerpt,
         cover_image = EXCLUDED.cover_image,
         content = EXCLUDED.content,
         category = EXCLUDED.category,
         tags = EXCLUDED.tags,
         status = EXCLUDED.status,
         read_time_minutes = EXCLUDED.read_time_minutes,
         views_count = EXCLUDED.views_count,
         published_date = EXCLUDED.published_date`,
      [
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
        s.published_date,
      ]
    );
  }
  console.log(`✓ Seeded ${seedStories.length} blog stories`);

  // 8. Community Posts
  for (const c of seedCommunity) {
    await db.query(
      `INSERT INTO community_posts (
         id, user_id, author_name, location, category, title, description,
         best_time, photos, likes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         author_name = EXCLUDED.author_name,
         location = EXCLUDED.location,
         category = EXCLUDED.category,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         best_time = EXCLUDED.best_time,
         photos = EXCLUDED.photos,
         likes = EXCLUDED.likes`,
      [
        c.id,
        c.user_id,
        c.author_name,
        c.location,
        c.category,
        c.title,
        c.description,
        c.best_time,
        c.photos,
        c.likes,
      ]
    );
  }
  console.log(`✓ Seeded ${seedCommunity.length} community posts`);

  // 9. Reviews
  for (const r of seedReviews) {
    await db.query(
      `INSERT INTO reviews (
         id, place_id, user_id, author_name, rating, title, comment, visit_date
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, place_id) DO UPDATE SET
         rating = EXCLUDED.rating,
         title = EXCLUDED.title,
         comment = EXCLUDED.comment,
         visit_date = EXCLUDED.visit_date`,
      [
        r.id,
        r.place_id,
        r.user_id,
        r.author_name,
        r.rating,
        r.title,
        r.comment,
        r.visit_date,
      ]
    );
  }
  console.log(`✓ Seeded ${seedReviews.length} reviews`);

  // 10. Trips
  for (const t of seedTrips) {
    await db.query(
      `INSERT INTO trips (
         id, user_id, title, description, start_date, end_date, budget_estimate, itinerary_data
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         user_id = EXCLUDED.user_id,
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         start_date = EXCLUDED.start_date,
         end_date = EXCLUDED.end_date,
         budget_estimate = EXCLUDED.budget_estimate,
         itinerary_data = EXCLUDED.itinerary_data`,
      [
        t.id,
        t.user_id,
        t.title,
        t.description,
        t.start_date,
        t.end_date,
        t.budget_estimate,
        t.itinerary_data,
      ]
    );
  }
  console.log(`✓ Seeded ${seedTrips.length} trips`);

  console.log('--- Database seeding completed successfully ---');
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed(true).then(() => process.exit(0)).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}
