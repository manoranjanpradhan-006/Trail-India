import express from 'express';
import { getDatabase } from '../db/database.js';
import { generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all experiences
router.get('/', (req, res, next) => {
  try {
    const { category, state, search } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM experiences WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (state && state !== 'all') {
      query += ' AND state = ?';
      params.push(state);
    }

    if (search) {
      query += ' AND (title LIKE ? OR location LIKE ? OR description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY rating DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get single experience
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const exp = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
    if (!exp) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json(exp);
  } catch (err) {
    next(err);
  }
});

// Create experience (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), (req, res, next) => {
  try {
    const {
      title,
      location,
      state,
      category,
      duration = '',
      difficulty = 'Easy',
      price_estimate = '',
      rating = 4.8,
      image_url,
      description,
    } = req.body;

    if (!title || !location || !category || !description || !image_url) {
      return res.status(400).json({ error: 'Missing required experience details' });
    }

    const db = getDatabase();
    const id = generateId('exp');

    db.prepare(`
      INSERT INTO experiences (
        id, title, location, state, category, duration, difficulty,
        price_estimate, rating, image_url, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      title,
      location,
      state || 'India',
      category,
      duration,
      difficulty,
      price_estimate,
      Number(rating) || 4.8,
      image_url,
      description
    );

    const created = db.prepare('SELECT * FROM experiences WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;

