import express from 'express';
import { db } from '../db/database.js';
import { generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all experiences
router.get('/', async (req, res, next) => {
  try {
    const { category, state, search } = req.query;

    let query = 'SELECT * FROM experiences WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (state && state !== 'all') {
      params.push(state);
      query += ` AND state = $${params.length}`;
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s);
      const idx = params.length - 2;
      query += ` AND (title ILIKE $${idx} OR location ILIKE $${idx + 1} OR description ILIKE $${idx + 2})`;
    }

    query += ' ORDER BY rating DESC';
    const rows = await db.getAll(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get single experience
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const exp = await db.getOne('SELECT * FROM experiences WHERE id = $1', [id]);
    if (!exp) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json(exp);
  } catch (err) {
    next(err);
  }
});

// Create experience (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), async (req, res, next) => {
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

    const id = generateId('exp');

    await db.query(
      `INSERT INTO experiences (
        id, title, location, state, category, duration, difficulty,
        price_estimate, rating, image_url, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
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
        description,
      ]
    );

    const created = await db.getOne('SELECT * FROM experiences WHERE id = $1', [id]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
