import express from 'express';
import { getDatabase } from '../db/database.js';
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
router.get('/', authenticateToken, (req, res, next) => {
  try {
    const db = getDatabase();
    const rows = db.prepare(`
      SELECT * FROM trips
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json(rows.map(formatTrip));
  } catch (err) {
    next(err);
  }
});

// Get single trip
router.get('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
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
router.post('/', authenticateToken, (req, res, next) => {
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

    const db = getDatabase();
    const id = generateId('trip');

    db.prepare(`
      INSERT INTO trips (
        id, user_id, title, description, start_date, end_date,
        budget_estimate, itinerary_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      req.user.id,
      title,
      description,
      start_date,
      end_date,
      Number(budget_estimate) || 0,
      JSON.stringify(itinerary_data)
    );

    const created = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    res.status(201).json(formatTrip(created));
  } catch (err) {
    next(err);
  }
});

// Update trip
router.put('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this trip' });
    }

    const { title, description, start_date, end_date, budget_estimate, itinerary_data } = req.body;

    db.prepare(`
      UPDATE trips
      SET title = COALESCE(?, title),
          description = COALESCE(?, description),
          start_date = COALESCE(?, start_date),
          end_date = COALESCE(?, end_date),
          budget_estimate = COALESCE(?, budget_estimate),
          itinerary_data = COALESCE(?, itinerary_data),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ?? null,
      description ?? null,
      start_date ?? null,
      end_date ?? null,
      budget_estimate !== undefined ? Number(budget_estimate) : null,
      itinerary_data ? JSON.stringify(itinerary_data) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    res.json(formatTrip(updated));
  } catch (err) {
    next(err);
  }
});

// Delete trip
router.delete('/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM trips WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this trip' });
    }

    db.prepare('DELETE FROM trips WHERE id = ?').run(id);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;

