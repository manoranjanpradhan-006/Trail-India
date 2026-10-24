-- Trail India Initial Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'traveler',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    location VARCHAR(100) DEFAULT '',
    travel_interests TEXT DEFAULT '[]',
    is_local_contributor BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
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
);

CREATE TABLE IF NOT EXISTS places (
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
);

CREATE TABLE IF NOT EXISTS festivals (
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
);

CREATE TABLE IF NOT EXISTS reviews (
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
);

CREATE TABLE IF NOT EXISTS blog_posts (
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
);

CREATE TABLE IF NOT EXISTS favorites (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id VARCHAR(36) NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_place_fav UNIQUE (user_id, place_id)
);

CREATE TABLE IF NOT EXISTS blog_bookmarks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id VARCHAR(36) NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_post_bookmark UNIQUE (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS trips (
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
);

CREATE INDEX IF NOT EXISTS idx_places_destination ON places(destination_id);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_reviews_place ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_destination ON blog_posts(destination_id);
