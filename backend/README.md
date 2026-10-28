# Trail India - Node.js Express Backend

Production-ready REST API for Trail India built with **Node.js**, **Express**, and **PostgreSQL (Neon)**.

---

## Neon PostgreSQL Configuration

1. Create a free project at [Neon (neon.tech)](https://neon.tech).
2. In the Neon Console dashboard, copy the **Connection string** (Pooled or Direct, e.g.):
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Add it to `backend/.env` (or root `.env`):
   ```env
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Run the database seeder to create all PostgreSQL tables and populate initial curated data:
   ```bash
   npm run seed
   ```
   *(Note: The server also auto-creates all tables and seeds the database automatically on first startup).*

*(If `DATABASE_URL` is omitted, the backend automatically uses the local SQLite fallback for offline development).*

---

## Features

- **Authentication & Authorization**:
  - JWT token-based authentication (`Bearer <token>`).
  - Bcrypt password hashing (`bcryptjs`).
  - Role-based authorization (`traveler`, `contributor`, `admin`).
- **Destination & Place Discovery**:
  - Full CRUD & filtering for destinations, places, experiences, festivals, and regional cuisine (`food`).
  - Search, category filter, and location indexing.
- **Community & User Engagement**:
  - Place reviews with ratings (1-5 stars) and aggregate ratings.
  - Public travel blog articles with reading time estimates, categories, and tags.
  - Community hidden gems with photos and likes.
  - User favorites and article bookmarks.
  - Trip planner itineraries with day-by-day activities and budget tracking.
- **Database**:
  - High-performance SQLite via Node.js native `node:sqlite` (`DatabaseSync`).
  - Automated table migrations and idempotent data seeder with rich Indian travel datasets.

---

## Demo Accounts

Pre-seeded accounts for testing and exploration (Password for all: `password123`):

| Role | Email | Password |
|---|---|---|
| **Traveler** | `traveler@trailindia.org` | `password123` |
| **Contributor** | `contributor@trailindia.org` | `password123` |
| **Admin** | `admin@trailindia.org` | `password123` |

---

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:8080`.

### 4. Run Test Suite
```bash
npm test
```

---

## API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register a new traveler/contributor
- `POST /api/v1/auth/login` - Authenticate with email and password
- `GET /api/v1/auth/me` - Get current user profile (Bearer token required)
- `PUT /api/v1/auth/me/profile` - Update current user profile

### Destinations
- `GET /api/v1/destinations` - List destinations (filters: `category`, `search`)
- `GET /api/v1/destinations/:slug` - Get destination by slug or id, with related places
- `POST /api/v1/destinations` - Create destination (Contributor / Admin)

### Places & Reviews
- `GET /api/v1/places` - List places (filters: `category`, `destination_id`, `featured`, `search`)
- `GET /api/v1/places/:id` - Get place details
- `POST /api/v1/places` - Create place (Contributor / Admin)
- `GET /api/v1/places/:id/reviews` - List reviews for a place
- `POST /api/v1/places/:id/reviews` - Submit or update review (Protected)
- `PATCH /api/v1/reviews/:id` - Edit own review (Protected)
- `DELETE /api/v1/reviews/:id` - Delete own review (Protected)
- `POST /api/v1/reviews/:id/report` - Report review (Protected)

### Experiences, Festivals & Food
- `GET /api/v1/experiences` - Curated activities & treks (filters: `category`, `state`, `search`)
- `GET /api/v1/experiences/:id` - Experience details
- `GET /api/v1/festivals` - Cultural celebrations (filters: `month`, `state`, `search`)
- `GET /api/v1/festivals/:id` - Festival details
- `GET /api/v1/food` - Regional dishes and cuisine trails (filters: `category`, `state`)
- `GET /api/v1/food/:id` - Food item details

### Travel Blog
- `GET /api/v1/blog/posts` - List published articles (filters: `category`, `search`, `tag`, `status`)
- `GET /api/v1/blog/posts/:slug` - Read article (increments view counter)
- `POST /api/v1/blog/posts` - Publish or draft an article (Protected)
- `PATCH /api/v1/blog/posts/:id` - Update article (Author / Admin)
- `DELETE /api/v1/blog/posts/:id` - Delete article (Author / Admin)
- `POST /api/v1/blog/posts/:id/bookmark` - Bookmark article (Protected)

### Community
- `GET /api/v1/community` - Browse community tips & hidden gems
- `POST /api/v1/community` - Share new community gem
- `POST /api/v1/community/:id/like` - Like a community post

### Favorites & Trips
- `GET /api/v1/favorites` - Get authenticated user's favorite places
- `POST /api/v1/favorites` - Add place to favorites (`{ place_id }`)
- `DELETE /api/v1/favorites/:placeId` - Remove place from favorites
- `GET /api/v1/trips` - Get user's saved itineraries
- `GET /api/v1/trips/:id` - Get trip details
- `POST /api/v1/trips` - Create new trip itinerary
- `PUT /api/v1/trips/:id` - Update itinerary
- `DELETE /api/v1/trips/:id` - Delete itinerary

### System & Upload
- `GET /api/v1/health` - Health check status
- `POST /api/v1/upload` - Upload single photo to Cloudinary (`multipart/form-data` with field `file`, `image`, or `photo`, or base64/URL JSON)
- `POST /api/v1/upload/multiple` - Upload up to 5 photos simultaneously to Cloudinary (`multipart/form-data` with field `files`)

---

## Cloudinary Photo Upload Configuration

1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Go to your **Dashboard** -> **API Keys**.
3. Copy your **Cloud Name**, **API Key**, and **API Secret**.
4. Add them to `backend/.env` (or root `.env`):
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   *Alternatively, you can provide the single `CLOUDINARY_URL`:*
   ```env
   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
   ```
5. When users create blog posts or submit community hidden gems, they can directly click **"Choose Photo"** or **"Upload Cover"** to upload images straight to your Cloudinary cloud. Cloudinary automatically optimizes delivery format and image quality!

