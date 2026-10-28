import express from 'express';
import { getDatabase } from '../db/database.js';
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
function updatePlaceStats(db, placeId) {
  const stats = db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avg_rating
    FROM reviews
    WHERE place_id = ?
  `).get(placeId);

  if (stats && stats.count > 0) {
    const avg = Math.round(stats.avg_rating * 10) / 10;
    db.prepare(`
      UPDATE places
      SET rating = ?, review_count = ?
      WHERE id = ?
    `).run(avg, stats.count, placeId);
  }
}

// Get places with filters
router.get('/', (req, res, next) => {
  try {
    const { category, destination_id, search, featured, limit = 50, offset = 0 } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM places WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (destination_id) {
      query += ' AND destination_id = ?';
      params.push(destination_id);
    }

    if (featured === 'true' || featured === '1') {
      query += ' AND is_featured = 1';
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR address LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY is_featured DESC, rating DESC, name ASC LIMIT ? OFFSET ?';
    params.push(Number(limit) || 50, Number(offset) || 0);

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatPlace));
  } catch (err) {
    next(err);
  }
});

// Get single place by id or slug
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const place = db.prepare('SELECT * FROM places WHERE id = ? OR slug = ?').get(id, id);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json(formatPlace(place));
  } catch (err) {
    next(err);
  }
});

// Get reviews for a place
router.get('/:id/reviews', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const place = db.prepare('SELECT id FROM places WHERE id = ? OR slug = ?').get(id, id);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const reviews = db.prepare(`
      SELECT r.*, COALESCE(p.display_name, r.author_name) as author_name, p.avatar_url
      FROM reviews r
      LEFT JOIN user_profiles p ON r.user_id = p.user_id
      WHERE r.place_id = ?
      ORDER BY r.created_at DESC
    `).all(place.id);

    res.json(reviews);
  } catch (err) {
    next(err);
  }
});

// Create or update review for a place
router.post('/:id/reviews', authenticateToken, (req, res, next) => {
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

    const db = getDatabase();
    const place = db.prepare('SELECT id FROM places WHERE id = ? OR slug = ?').get(id, id);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const authorName = req.user.profile?.display_name || req.user.email.split('@')[0];
    const reviewId = generateId('rev');

    db.prepare(`
      INSERT INTO reviews (id, place_id, user_id, author_name, rating, title, comment, visit_date, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, place_id) DO UPDATE SET
        rating = excluded.rating,
        title = excluded.title,
        comment = excluded.comment,
        visit_date = excluded.visit_date,
        updated_at = CURRENT_TIMESTAMP
    `).run(
      reviewId,
      place.id,
      req.user.id,
      authorName,
      numRating,
      title,
      comment,
      visit_date || 'Recent'
    );

    // Update aggregated rating
    updatePlaceStats(db, place.id);

    const savedReview = db.prepare(`
      SELECT * FROM reviews WHERE place_id = ? AND user_id = ?
    `).get(place.id, req.user.id);

    res.status(201).json(savedReview);
  } catch (err) {
    next(err);
  }
});

// Create place (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), (req, res, next) => {
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

    const db = getDatabase();
    const id = generateId('plc');
    const slug = generateSlug(name);

    db.prepare(`
      INSERT INTO places (
        id, destination_id, destination_name, name, slug, category, description,
        address, latitude, longitude, entry_fee, opening_hours, image_url,
        highlights, is_featured, rating, review_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.8, 0)
    `).run(
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
      is_featured ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM places WHERE id = ?').get(id);
    res.status(201).json(formatPlace(created));
  } catch (err) {
    next(err);
  }
});

export default router;

