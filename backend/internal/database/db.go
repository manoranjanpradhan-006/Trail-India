package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "modernc.org/sqlite"
)

var DB *sql.DB
var DriverName string

// InitDB initializes database connection with PostgreSQL or SQLite fallback
func InitDB() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_URL")
	var err error

	if connStr != "" {
		log.Println("[Database] Connecting to PostgreSQL...")
		DB, err = sql.Open("pgx", connStr)
		if err == nil {
			err = DB.Ping()
			if err == nil {
				DriverName = "postgres"
				log.Println("[Database] Successfully connected to PostgreSQL")
				if err := createTables(); err != nil {
					return nil, err
				}
				SeedDataIfEmpty()
				return DB, nil
			}
			log.Printf("[Database] PostgreSQL ping failed: %v. Falling back to embedded SQLite.\n", err)
		} else {
			log.Printf("[Database] PostgreSQL connection error: %v. Falling back to embedded SQLite.\n", err)
		}
	}

	log.Println("[Database] Using pure embedded SQLite (trail_india.db)...")
	DriverName = "sqlite"
	DB, err = sql.Open("sqlite", "trail_india.db?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)")
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite database: %w", err)
	}

	if err := DB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping sqlite database: %w", err)
	}

	log.Println("[Database] Successfully initialized SQLite database")
	if err := createTables(); err != nil {
		return nil, err
	}

	SeedDataIfEmpty()
	return DB, nil
}

func createTables() error {
	var queries []string

	if DriverName == "postgres" {
		queries = []string{
			`CREATE TABLE IF NOT EXISTS users (
				id VARCHAR(36) PRIMARY KEY,
				email VARCHAR(255) UNIQUE NOT NULL,
				password_hash VARCHAR(255) NOT NULL,
				role VARCHAR(50) NOT NULL DEFAULT 'traveler',
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS user_profiles (
				user_id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
				display_name VARCHAR(100) NOT NULL,
				bio TEXT DEFAULT '',
				avatar_url TEXT DEFAULT '',
				location VARCHAR(100) DEFAULT '',
				travel_interests TEXT DEFAULT '[]',
				is_local_contributor BOOLEAN DEFAULT FALSE,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS destinations (
				id VARCHAR(36) PRIMARY KEY,
				name VARCHAR(150) NOT NULL,
				slug VARCHAR(150) UNIQUE NOT NULL,
				state VARCHAR(100) NOT NULL DEFAULT 'Odisha',
				district VARCHAR(100) NOT NULL,
				tagline VARCHAR(255) DEFAULT '',
				description TEXT NOT NULL,
				overview TEXT DEFAULT '',
				banner_image TEXT NOT NULL,
				best_time_to_visit VARCHAR(150) DEFAULT '',
				weather_info TEXT DEFAULT '',
				how_to_reach TEXT DEFAULT '',
				latitude DOUBLE PRECISION DEFAULT 0.0,
				longitude DOUBLE PRECISION DEFAULT 0.0,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS places (
				id VARCHAR(36) PRIMARY KEY,
				destination_id VARCHAR(36) REFERENCES destinations(id) ON DELETE CASCADE,
				name VARCHAR(150) NOT NULL,
				slug VARCHAR(150) UNIQUE NOT NULL,
				category VARCHAR(50) NOT NULL,
				description TEXT NOT NULL,
				address TEXT DEFAULT '',
				latitude DOUBLE PRECISION NOT NULL,
				longitude DOUBLE PRECISION NOT NULL,
				entry_fee VARCHAR(100) DEFAULT 'Free',
				opening_hours VARCHAR(150) DEFAULT 'Open Daily',
				image_url TEXT NOT NULL,
				highlights TEXT DEFAULT '[]',
				is_featured BOOLEAN DEFAULT FALSE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS festivals (
				id VARCHAR(36) PRIMARY KEY,
				destination_id VARCHAR(36) REFERENCES destinations(id) ON DELETE SET NULL,
				name VARCHAR(150) NOT NULL,
				slug VARCHAR(150) UNIQUE NOT NULL,
				description TEXT NOT NULL,
				celebration_month VARCHAR(50) NOT NULL,
				typical_season VARCHAR(100) DEFAULT '',
				confirmed_date_info VARCHAR(150) DEFAULT '',
				location_summary VARCHAR(150) DEFAULT '',
				cultural_significance TEXT DEFAULT '',
				visitor_tips TEXT DEFAULT '',
				image_url TEXT NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS reviews (
				id VARCHAR(36) PRIMARY KEY,
				place_id VARCHAR(36) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
				user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
				title VARCHAR(150) NOT NULL,
				comment TEXT NOT NULL,
				visit_date VARCHAR(50) DEFAULT '',
				is_reported BOOLEAN DEFAULT FALSE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT unique_user_place_review UNIQUE (user_id, place_id)
			);`,
			`CREATE TABLE IF NOT EXISTS blog_posts (
				id VARCHAR(36) PRIMARY KEY,
				author_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				destination_id VARCHAR(36) REFERENCES destinations(id) ON DELETE SET NULL,
				title VARCHAR(200) NOT NULL,
				slug VARCHAR(200) UNIQUE NOT NULL,
				excerpt TEXT NOT NULL,
				cover_image TEXT NOT NULL,
				content TEXT NOT NULL,
				category VARCHAR(100) NOT NULL,
				tags TEXT DEFAULT '[]',
				status VARCHAR(50) NOT NULL DEFAULT 'published',
				read_time_minutes INTEGER DEFAULT 5,
				views_count INTEGER DEFAULT 0,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS favorites (
				id VARCHAR(36) PRIMARY KEY,
				user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				place_id VARCHAR(36) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT unique_user_place_fav UNIQUE (user_id, place_id)
			);`,
			`CREATE TABLE IF NOT EXISTS blog_bookmarks (
				id VARCHAR(36) PRIMARY KEY,
				user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				post_id VARCHAR(36) NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				CONSTRAINT unique_user_post_bookmark UNIQUE (user_id, post_id)
			);`,
			`CREATE TABLE IF NOT EXISTS trips (
				id VARCHAR(36) PRIMARY KEY,
				user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				title VARCHAR(150) NOT NULL,
				description TEXT DEFAULT '',
				start_date VARCHAR(50) DEFAULT '',
				end_date VARCHAR(50) DEFAULT '',
				budget_estimate NUMERIC(10,2) DEFAULT 0.0,
				itinerary_data TEXT DEFAULT '[]',
				created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
			);`,
		}
	} else {
		queries = []string{
			`CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				email TEXT UNIQUE NOT NULL,
				password_hash TEXT NOT NULL,
				role TEXT NOT NULL DEFAULT 'traveler',
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS user_profiles (
				user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
				display_name TEXT NOT NULL,
				bio TEXT DEFAULT '',
				avatar_url TEXT DEFAULT '',
				location TEXT DEFAULT '',
				travel_interests TEXT DEFAULT '[]',
				is_local_contributor INTEGER DEFAULT 0,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS destinations (
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
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS places (
				id TEXT PRIMARY KEY,
				destination_id TEXT REFERENCES destinations(id) ON DELETE CASCADE,
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
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS festivals (
				id TEXT PRIMARY KEY,
				destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
				name TEXT NOT NULL,
				slug TEXT UNIQUE NOT NULL,
				description TEXT NOT NULL,
				celebration_month TEXT NOT NULL,
				typical_season TEXT DEFAULT '',
				confirmed_date_info TEXT DEFAULT '',
				location_summary TEXT DEFAULT '',
				cultural_significance TEXT DEFAULT '',
				visitor_tips TEXT DEFAULT '',
				image_url TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS reviews (
				id TEXT PRIMARY KEY,
				place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				rating INTEGER NOT NULL,
				title TEXT NOT NULL,
				comment TEXT NOT NULL,
				visit_date TEXT DEFAULT '',
				is_reported INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				UNIQUE (user_id, place_id)
			);`,
			`CREATE TABLE IF NOT EXISTS blog_posts (
				id TEXT PRIMARY KEY,
				author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				destination_id TEXT REFERENCES destinations(id) ON DELETE SET NULL,
				title TEXT NOT NULL,
				slug TEXT UNIQUE NOT NULL,
				excerpt TEXT NOT NULL,
				cover_image TEXT NOT NULL,
				content TEXT NOT NULL,
				category TEXT NOT NULL,
				tags TEXT DEFAULT '[]',
				status TEXT NOT NULL DEFAULT 'published',
				read_time_minutes INTEGER DEFAULT 5,
				views_count INTEGER DEFAULT 0,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);`,
			`CREATE TABLE IF NOT EXISTS favorites (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				UNIQUE (user_id, place_id)
			);`,
			`CREATE TABLE IF NOT EXISTS blog_bookmarks (
				id TEXT PRIMARY KEY,
				user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
				post_id TEXT NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				UNIQUE (user_id, post_id)
			);`,
			`CREATE TABLE IF NOT EXISTS trips (
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
			);`,
		}
	}

	for _, q := range queries {
		if _, err := DB.Exec(q); err != nil {
			return fmt.Errorf("error executing query (%s): %w", strings.TrimSpace(q[:40]), err)
		}
	}

	log.Println("[Database] Tables verified/created successfully.")
	return nil
}
