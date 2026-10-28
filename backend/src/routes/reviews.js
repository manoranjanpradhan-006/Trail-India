import express from 'express';
import { getDatabase } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function updatePlaceStats(db, placeId) {
  const stats = db.prepare(`
    SELECT COUNT(*) as count, AVG(rating) as avg_rating
    FROM reviews
    WHERE place_id = ?
  `).get(placeId);

  const avg = stats && stats.count > 0 ? Math.round(stats.avg_rating * 10) / 10 : 4.8;
  const count = stats ? stats.count : 0;

  db.prepare(`
    UPDATE places
    SET rating = ?, review_count = ?
    WHERE id = ?
  `).run(avg, count, placeId);
}

// Edit review
router.patch('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, visit_date } = req.body;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this review' });
    }

    const numRating = rating !== undefined ? parseInt(rating, 10) : existing.rating;

    db.prepare(`
      UPDATE reviews
      SET rating = COALESCE(?, rating),
          title = COALESCE(?, title),
          comment = COALESCE(?, comment),
          visit_date = COALESCE(?, visit_date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(numRating, title ?? null, comment ?? null, visit_date ?? null, id);

    updatePlaceStats(db, existing.place_id);

    const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete review
router.delete('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    updatePlaceStats(db, existing.place_id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Report review
router.post('/:id/report', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    db.prepare('UPDATE reviews SET is_reported = 1 WHERE id = ?').run(id);
    res.json({ success: true, message: 'Review flagged for moderation' });
  } catch (err) {
    next(err);
  }
});

export default router;

