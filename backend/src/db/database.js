import { DatabaseSync } from 'node:sqlite';
import { config } from '../config/index.js';

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = new DatabaseSync(config.dbPath);
  initSchema(dbInstance);
  return dbInstance;
}

function safeAddColumn(db, table, column, definition) {
  try {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    const hasColumn = columns.some((col) => col.name === column);
    if (!hasColumn) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch (err) {
    console.error(`Migration error on ${table}.${column}:`, err.message);
  }
}

export function initSchema(db) {
  // Foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'traveler',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // User Profiles table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      display_name TEXT NOT NULL,
      bio TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      location TEXT DEFAULT '',
      travel_interests TEXT DEFAULT '[]',
      is_local_contributor INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Destinations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      state TEXT NOT NULL DEFAULT 'Odisha',
      district TEXT NOT NULL,
      tagline TEXT DEFAULT '',
      description TEXT NOT NULL,
      overview TEXT DEFAULT '',
      banner_image TEXT NOT NULL,
      best_time_to_visit TEXT DEFAULT '',
      weather_info TEXT DEFAULT '',
      how_to_reach TEXT DEFAULT '',
      latitude REAL DEFAULT 0.0,
      longitude REAL DEFAULT 0.0,
      category TEXT DEFAULT 'heritage',
      estimated_budget TEXT DEFAULT '',
      highlights TEXT DEFAULT '[]',
      place_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  safeAddColumn(db, 'destinations', 'category', "TEXT DEFAULT 'heritage'");
  safeAddColumn(db, 'destinations', 'estimated_budget', "TEXT DEFAULT ''");
  safeAddColumn(db, 'destinations', 'highlights', "TEXT DEFAULT '[]'");
  safeAddColumn(db, 'destinations', 'place_count', 'INTEGER DEFAULT 0');

  // Places table
  db.exec(`
    CREATE TABLE IF NOT EXISTS places (
      id TEXT PRIMARY KEY,
      destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
      destination_name TEXT DEFAULT '',
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      address TEXT DEFAULT '',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      entry_fee TEXT DEFAULT 'Free',
      opening_hours TEXT DEFAULT 'Open Daily',
      image_url TEXT NOT NULL,
      highlights TEXT DEFAULT '[]',
      is_featured INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.8,
      review_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  safeAddColumn(db, 'places', 'destination_name', "TEXT DEFAULT ''");
  safeAddColumn(db, 'places', 'rating', 'REAL DEFAULT 4.8');
  safeAddColumn(db, 'places', 'review_count', 'INTEGER DEFAULT 0');

  // Experiences table
  db.exec(`
    CREATE TABLE IF NOT EXISTS experiences (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      state TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT DEFAULT '',
      difficulty TEXT DEFAULT 'Easy',
      price_estimate TEXT DEFAULT '',
      rating REAL DEFAULT 4.8,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Festivals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS festivals (
      id TEXT PRIMARY KEY,
      destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      state TEXT DEFAULT '',
      location TEXT DEFAULT '',
      description TEXT NOT NULL,
      celebration_month TEXT NOT NULL,
      typical_season TEXT DEFAULT '',
      date_info TEXT DEFAULT '',
      cultural_significance TEXT DEFAULT '',
      visitor_tips TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  safeAddColumn(db, 'festivals', 'state', "TEXT DEFAULT ''");
  safeAddColumn(db, 'festivals', 'location', "TEXT DEFAULT ''");
  safeAddColumn(db, 'festivals', 'date_info', "TEXT DEFAULT ''");

  // Food / Regional Cuisines table
  db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      state TEXT NOT NULL,
      category TEXT NOT NULL,
      tagline TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      cultural_background TEXT DEFAULT '',
      key_ingredients TEXT DEFAULT '[]',
      where_to_try TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      visit_date TEXT DEFAULT '',
      is_reported INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, place_id)
    );
  `);

  safeAddColumn(db, 'reviews', 'author_name', "TEXT NOT NULL DEFAULT 'Explorer'");

  // Blog Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      author_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      author_name TEXT DEFAULT 'Contributor',
      destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'published',
      published_date TEXT DEFAULT '',
      read_time_minutes INTEGER DEFAULT 5,
      views_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  safeAddColumn(db, 'blog_posts', 'author_name', "TEXT DEFAULT 'Contributor'");
  safeAddColumn(db, 'blog_posts', 'published_date', "TEXT DEFAULT ''");

  // Community Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      author_name TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Hidden Gem',
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      best_time TEXT DEFAULT 'Year-round',
      photos TEXT DEFAULT '[]',
      likes INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Favorites table
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, place_id)
    );
  `);

  // Blog Bookmarks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, post_id)
    );
  `);

  // Trips / Itineraries table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trips (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      budget_estimate REAL DEFAULT 0.0,
      itinerary_data TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

