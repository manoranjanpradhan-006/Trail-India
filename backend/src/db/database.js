import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';
import { config } from '../config/index.js';

const { Pool } = pg;

let pool = null;
let sqliteDb = null;
let isPostgres = false;

export function isUsingPostgres() {
  return Boolean(config.databaseUrl && (config.databaseUrl.startsWith('postgres://') || config.databaseUrl.startsWith('postgresql://')));
}

export async function getDatabase() {
  if (pool || sqliteDb) {
    return db;
  }

  if (isUsingPostgres()) {
    isPostgres = true;
    console.log('[Database] Connecting to Neon PostgreSQL...');
    pool = new Pool({
      connectionString: config.databaseUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Test connection
    const client = await pool.connect();
    console.log('[Database] Connected to Neon PostgreSQL successfully.');
    client.release();

    await initPostgresSchema(pool);
  } else {
    isPostgres = false;
    console.log(`[Database] DATABASE_URL not set. Using local SQLite at ${config.dbPath}`);
    sqliteDb = new DatabaseSync(config.dbPath);
    initSqliteSchema(sqliteDb);
  }

  return db;
}

export const db = {
  isPostgres() {
    return isPostgres;
  },

  async query(text, params = []) {
    if (isPostgres) {
      return await pool.query(text, params);
    } else {
      // Map $1, $2, ... to ? for SQLite and replace ILIKE with LIKE
      let sqliteSql = text.replace(/\$\d+/g, '?').replace(/\bILIKE\b/gi, 'LIKE');
      // Normalize booleans in params
      const normalizedParams = params.map((p) => (typeof p === 'boolean' ? (p ? 1 : 0) : p));
      
      const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteSql);
      if (isSelect) {
        const rows = sqliteDb.prepare(sqliteSql).all(...normalizedParams);
        return { rows, rowCount: rows.length };
      } else {
        const result = sqliteDb.prepare(sqliteSql).run(...normalizedParams);
        return { rows: [], rowCount: result?.changes || 0 };
      }
    }
  },

  async getOne(text, params = []) {
    const res = await this.query(text, params);
    return res.rows[0] || null;
  },

  async getAll(text, params = []) {
    const res = await this.query(text, params);
    return res.rows || [];
  },

  async execute(text, params = []) {
    return await this.query(text, params);
  },
};

async function initPostgresSchema(poolClient) {
  console.log('[Database] Initializing PostgreSQL schema for Neon...');
  
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'traveler',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      display_name VARCHAR(255) NOT NULL,
      bio TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      location VARCHAR(255) DEFAULT '',
      travel_interests TEXT DEFAULT '[]',
      is_local_contributor BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      state VARCHAR(255) NOT NULL DEFAULT 'Odisha',
      district VARCHAR(255) NOT NULL,
      tagline VARCHAR(255) DEFAULT '',
      description TEXT NOT NULL,
      overview TEXT DEFAULT '',
      banner_image TEXT NOT NULL,
      best_time_to_visit VARCHAR(255) DEFAULT '',
      weather_info VARCHAR(255) DEFAULT '',
      how_to_reach TEXT DEFAULT '',
      latitude DOUBLE PRECISION DEFAULT 0.0,
      longitude DOUBLE PRECISION DEFAULT 0.0,
      category VARCHAR(100) DEFAULT 'heritage',
      estimated_budget VARCHAR(100) DEFAULT '',
      highlights TEXT DEFAULT '[]',
      place_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS places (
      id VARCHAR(255) PRIMARY KEY,
      destination_id VARCHAR(255) REFERENCES destinations(id) ON DELETE CASCADE,
      destination_name VARCHAR(255) DEFAULT '',
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      address TEXT DEFAULT '',
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      entry_fee VARCHAR(255) DEFAULT 'Free',
      opening_hours VARCHAR(255) DEFAULT 'Open Daily',
      image_url TEXT NOT NULL,
      highlights TEXT DEFAULT '[]',
      is_featured BOOLEAN DEFAULT FALSE,
      rating DOUBLE PRECISION DEFAULT 4.8,
      review_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      duration VARCHAR(100) DEFAULT '',
      difficulty VARCHAR(100) DEFAULT 'Easy',
      price_estimate VARCHAR(100) DEFAULT '',
      rating DOUBLE PRECISION DEFAULT 4.8,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS festivals (
      id VARCHAR(255) PRIMARY KEY,
      destination_id VARCHAR(255) REFERENCES destinations(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      state VARCHAR(255) DEFAULT '',
      location VARCHAR(255) DEFAULT '',
      description TEXT NOT NULL,
      celebration_month VARCHAR(255) NOT NULL,
      typical_season VARCHAR(100) DEFAULT '',
      date_info VARCHAR(255) DEFAULT '',
      cultural_significance TEXT DEFAULT '',
      visitor_tips TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS foods (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      region VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      tagline VARCHAR(255) DEFAULT '',
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      cultural_background TEXT DEFAULT '',
      key_ingredients TEXT DEFAULT '[]',
      where_to_try TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(255) PRIMARY KEY,
      place_id VARCHAR(255) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      author_name VARCHAR(255) NOT NULL,
      rating INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      comment TEXT NOT NULL,
      visit_date VARCHAR(100) DEFAULT '',
      is_reported BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, place_id)
    );

    CREATE TABLE IF NOT EXISTS blog_posts (
      id VARCHAR(255) PRIMARY KEY,
      author_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
      author_name VARCHAR(255) DEFAULT 'Contributor',
      destination_id VARCHAR(255) REFERENCES destinations(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      excerpt TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      content TEXT NOT NULL,
      category VARCHAR(100) NOT NULL,
      tags TEXT DEFAULT '[]',
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      published_date VARCHAR(100) DEFAULT '',
      read_time_minutes INTEGER DEFAULT 5,
      views_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS community_posts (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
      author_name VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'Hidden Gem',
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      best_time VARCHAR(100) DEFAULT 'Year-round',
      photos TEXT DEFAULT '[]',
      likes INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      place_id VARCHAR(255) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, place_id)
    );

    CREATE TABLE IF NOT EXISTS blog_bookmarks (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id VARCHAR(255) NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, post_id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      start_date VARCHAR(100) DEFAULT '',
      end_date VARCHAR(100) DEFAULT '',
      budget_estimate DOUBLE PRECISION DEFAULT 0.0,
      itinerary_data TEXT DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await poolClient.query(schema);
  console.log('[Database] PostgreSQL schema initialized successfully.');
}

function initSqliteSchema(sqlite) {
  sqlite.exec('PRAGMA foreign_keys = ON;');
  
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'traveler',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, place_id)
    );

    CREATE TABLE IF NOT EXISTS blog_bookmarks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, post_id)
    );

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
