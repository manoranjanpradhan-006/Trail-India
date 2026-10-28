import express from 'express';
import { db } from '../db/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

async function updatePlaceStats(placeId) {
  const stats = await db.getOne(
    `SELECT COUNT(*) as count, AVG(rating) as avg_rating
     FROM reviews
     WHERE place_id = $1`,
    [placeId]
  );

  const avg = stats && Number(stats.count) > 0 ? Math.round(Number(stats.avg_rating) * 10) / 10 : 4.8;
  const count = stats ? Number(stats.count) : 0;

  await db.query(
    `UPDATE places
     SET rating = $1, review_count = $2
     WHERE id = $3`,
    [avg, count, placeId]
  );
}

// Edit review
router.patch('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, visit_date } = req.body;

    const existing = await db.getOne('SELECT * FROM reviews WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this review' });
    }

    const numRating = rating !== undefined ? parseInt(rating, 10) : existing.rating;

    await db.query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           title = COALESCE($2, title),
           comment = COALESCE($3, comment),
           visit_date = COALESCE($4, visit_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [numRating, title ?? null, comment ?? null, visit_date ?? null, id]
    );

    await updatePlaceStats(existing.place_id);

    const updated = await db.getOne('SELECT * FROM reviews WHERE id = $1', [id]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete review
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT * FROM reviews WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    await updatePlaceStats(existing.place_id);

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Report review
router.post('/:id/report', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT * FROM reviews WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await db.query('UPDATE reviews SET is_reported = TRUE WHERE id = $1', [id]);
    res.json({ success: true, message: 'Review flagged for moderation' });
  } catch (err) {
    next(err);
  }
});

export default router;
