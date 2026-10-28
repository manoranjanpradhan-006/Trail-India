import express from 'express';
import { db } from '../db/database.js';
import { safeJsonParse, generateSlug, generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

function formatPlace(place) {
  if (!place) return null;
  return {
    ...place,
    highlights: safeJsonParse(place.highlights, []),
    is_featured: Boolean(place.is_featured),
    rating: Number(place.rating) || 4.8,
    review_count: Number(place.review_count) || 0,
  };
}

// Update place average rating and review count
async function updatePlaceStats(placeId) {
  const stats = await db.getOne(
    `SELECT COUNT(*) as count, AVG(rating) as avg_rating
     FROM reviews
     WHERE place_id = $1`,
    [placeId]
  );

  if (stats && Number(stats.count) > 0) {
    const avg = Math.round(Number(stats.avg_rating) * 10) / 10;
    await db.query(
      `UPDATE places
       SET rating = $1, review_count = $2
       WHERE id = $3`,
      [avg, Number(stats.count), placeId]
    );
  }
}

// Get places with filters
router.get('/', async (req, res, next) => {
  try {
    const { category, destination_id, search, featured, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM places WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (destination_id) {
      params.push(destination_id);
      query += ` AND destination_id = $${params.length}`;
    }

    if (featured === 'true' || featured === '1') {
      query += ' AND is_featured = TRUE';
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s);
      const idx = params.length - 2;
      query += ` AND (name ILIKE $${idx} OR description ILIKE $${idx + 1} OR address ILIKE $${idx + 2})`;
    }

    params.push(Number(limit) || 50);
    const limitIdx = params.length;
    params.push(Number(offset) || 0);
    const offsetIdx = params.length;

    query += ` ORDER BY is_featured DESC, rating DESC, name ASC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

    const rows = await db.getAll(query, params);
    res.json(rows.map(formatPlace));
  } catch (err) {
    next(err);
  }
});

// Get single place by id or slug
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const place = await db.getOne('SELECT * FROM places WHERE id = $1 OR slug = $2', [id, id]);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json(formatPlace(place));
  } catch (err) {
    next(err);
  }
});

// Get reviews for a place
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const { id } = req.params;

    const place = await db.getOne('SELECT id FROM places WHERE id = $1 OR slug = $2', [id, id]);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const reviews = await db.getAll(
      `SELECT r.*, COALESCE(p.display_name, r.author_name) as author_name, p.avatar_url
       FROM reviews r
       LEFT JOIN user_profiles p ON r.user_id = p.user_id
       WHERE r.place_id = $1
       ORDER BY r.created_at DESC`,
      [place.id]
    );

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// Create or update review for a place
router.post('/:id/reviews', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, visit_date } = req.body;

    if (!rating || !title || !comment) {
      return res.status(400).json({ error: 'Rating, title, and comment are required' });
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const place = await db.getOne('SELECT id FROM places WHERE id = $1 OR slug = $2', [id, id]);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const authorName = req.user.profile?.display_name || req.user.email.split('@')[0];
    const reviewId = generateId('rev');

    await db.query(
      `INSERT INTO reviews (id, place_id, user_id, author_name, rating, title, comment, visit_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, place_id) DO UPDATE SET
         rating = EXCLUDED.rating,
         title = EXCLUDED.title,
         comment = EXCLUDED.comment,
         visit_date = EXCLUDED.visit_date,
         updated_at = CURRENT_TIMESTAMP`,
      [
        reviewId,
        place.id,
        req.user.id,
        authorName,
        numRating,
        title,
        comment,
        visit_date || 'Recent',
      ]
    );

    // Update aggregated rating
    await updatePlaceStats(place.id);

    const savedReview = await db.getOne(
      `SELECT * FROM reviews WHERE place_id = $1 AND user_id = $2`,
      [place.id, req.user.id]
    );

    res.status(201).json(savedReview);
  } catch (err) {
    next(err);
  }
});

// Create place (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), async (req, res, next) => {
  try {
    const {
      destination_id,
      destination_name = '',
      name,
      category,
      description,
      address = '',
      latitude = 0,
      longitude = 0,
      entry_fee = 'Free',
      opening_hours = 'Open Daily',
      image_url,
      highlights = [],
      is_featured = false,
    } = req.body;

    if (!name || !category || !description || !image_url) {
      return res.status(400).json({ error: 'Name, category, description, and image_url are required' });
    }

    const id = generateId('plc');
    const slug = generateSlug(name);

    await db.query(
      `INSERT INTO places (
        id, destination_id, destination_name, name, slug, category, description,
        address, latitude, longitude, entry_fee, opening_hours, image_url,
        highlights, is_featured, rating, review_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 4.8, 0)`,
      [
        id,
        destination_id || null,
        destination_name,
        name,
        slug,
        category,
        description,
        address,
        Number(latitude) || 0,
        Number(longitude) || 0,
        entry_fee,
        opening_hours,
        image_url,
        JSON.stringify(highlights),
        Boolean(is_featured),
      ]
    );

    const created = await db.getOne('SELECT * FROM places WHERE id = $1', [id]);
    res.status(201).json(formatPlace(created));
  } catch (err) {
    next(err);
  }
});

export default router;
