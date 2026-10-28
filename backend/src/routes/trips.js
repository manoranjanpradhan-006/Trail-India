import express from 'express';
import { db } from '../db/database.js';
import { safeJsonParse, generateId } from '../utils/helpers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function formatTrip(trip) {
  if (!trip) return null;
  return {
    ...trip,
    itinerary_data: safeJsonParse(trip.itinerary_data, []),
    budget_estimate: Number(trip.budget_estimate) || 0,
  };
}

// Get user trips
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const rows = await db.getAll(
      `SELECT * FROM trips
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(rows.map(formatTrip));
  } catch (err) {
    next(err);
  }
});

// Get single trip
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const trip = await db.getOne('SELECT * FROM trips WHERE id = $1', [id]);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this trip' });
    }

    res.json(formatTrip(trip));
  } catch (err) {
    next(err);
  }
});

// Create new trip
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      start_date = '',
      end_date = '',
      budget_estimate = 15000,
      itinerary_data = [],
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Trip title is required' });
    }

    const id = generateId('trip');

    await db.query(
      `INSERT INTO trips (
        id, user_id, title, description, start_date, end_date,
        budget_estimate, itinerary_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        req.user.id,
        title,
        description,
        start_date,
        end_date,
        Number(budget_estimate) || 0,
        JSON.stringify(itinerary_data),
      ]
    );

    const created = await db.getOne('SELECT * FROM trips WHERE id = $1', [id]);
    res.status(201).json(formatTrip(created));
  } catch (err) {
    next(err);
  }
});

// Update trip
router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT * FROM trips WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this trip' });
    }

    const { title, description, start_date, end_date, budget_estimate, itinerary_data } = req.body;

    await db.query(
      `UPDATE trips
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_date = COALESCE($3, start_date),
           end_date = COALESCE($4, end_date),
           budget_estimate = COALESCE($5, budget_estimate),
           itinerary_data = COALESCE($6, itinerary_data),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [
        title ?? null,
        description ?? null,
        start_date ?? null,
        end_date ?? null,
        budget_estimate !== undefined ? Number(budget_estimate) : null,
        itinerary_data ? JSON.stringify(itinerary_data) : null,
        id,
      ]
    );

    const updated = await db.getOne('SELECT * FROM trips WHERE id = $1', [id]);
    res.json(formatTrip(updated));
  } catch (err) {
    next(err);
  }
});

// Delete trip
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT * FROM trips WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this trip' });
    }

    await db.query('DELETE FROM trips WHERE id = $1', [id]);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
