import express from 'express';
import { getDatabase } from '../db/database.js';
import { generateId } from '../utils/helpers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's favorites
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT f.id, f.place_id, f.created_at,
             p.name, p.slug, p.category, p.image_url, p.rating, p.review_count,
             p.destination_name, p.address
      FROM favorites f
      JOIN places p ON f.place_id = p.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(req.user.id);

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Add favorite place
router.post('/', authenticateToken, (req, res, next) => {
  try {
    const placeId = req.body.place_id || req.body.placeId;
    if (!placeId) {
      return res.status(400).json({ error: 'place_id is required' });
    }

    const db = getDatabase();
    const id = generateId('fav');

    db.prepare(`
      INSERT OR IGNORE INTO favorites (id, user_id, place_id)
      VALUES (?, ?, ?)
    `).run(id, req.user.id, placeId);

    res.status(201).json({ success: true, message: 'Place added to favorites' });
  } catch (err) {
    next(err);
  }
});

// Remove favorite place
router.delete('/:placeId', authenticateToken, (req, res, next) => {
  try {
    const { placeId } = req.params;
    const db = getDatabase();

    db.prepare(`
      DELETE FROM favorites
      WHERE user_id = ? AND (place_id = ? OR id = ?)
    `).run(req.user.id, placeId, placeId);

    res.json({ success: true, message: 'Place removed from favorites' });
  } catch (err) {
    next(err);
  }
});

export default router;

