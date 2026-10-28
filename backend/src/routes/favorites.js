import express from 'express';
import { db } from '../db/database.js';
import { generateId } from '../utils/helpers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const rows = await db.getAll(
      `SELECT f.id, f.place_id, f.created_at,
              p.name, p.slug, p.category, p.image_url, p.rating, p.review_count,
              p.destination_name, p.address
       FROM favorites f
       JOIN places p ON f.place_id = p.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add favorite place
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const placeId = req.body.place_id || req.body.placeId;
    if (!placeId) {
      return res.status(400).json({ error: 'place_id is required' });
    }

    const id = generateId('fav');
    await db.query(
      `INSERT INTO favorites (id, user_id, place_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, place_id) DO NOTHING`,
      [id, req.user.id, placeId]
    );

    res.status(201).json({ success: true, message: 'Place added to favorites' });
  } catch (err) {
    next(err);
  }
});

// Remove favorite place
router.delete('/:placeId', authenticateToken, async (req, res, next) => {
  try {
    const { placeId } = req.params;

    await db.query(
      `DELETE FROM favorites
       WHERE user_id = $1 AND (place_id = $2 OR id = $2)`,
      [req.user.id, placeId]
    );

    res.json({ success: true, message: 'Place removed from favorites' });
  } catch (err) {
    next(err);
  }
});

export default router;
