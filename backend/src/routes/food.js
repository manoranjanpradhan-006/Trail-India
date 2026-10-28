import express from 'express';
import { getDatabase } from '../db/database.js';
import { safeJsonParse, generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

function formatFood(item) {
  if (!item) return null;
  return {
    ...item,
    key_ingredients: safeJsonParse(item.key_ingredients, []),
  };
}

// Get all food items
router.get('/', (req, res, next) => {
  try {
    const { category, state, search } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM foods WHERE 1=1';
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
      query += ' AND (name LIKE ? OR region LIKE ? OR description LIKE ? OR tagline LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY name ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatFood));
  } catch (err) {
    next(err);
  }
});

// Get single food item
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const item = db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json(formatFood(item));
  } catch (err) {
    next(err);
  }
});

// Create food item (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), (req, res, next) => {
  try {
    const {
      name,
      region = 'India',
      state = 'Odisha',
      category = 'Vegetarian',
      tagline = '',
      image_url,
      description,
      cultural_background = '',
      key_ingredients = [],
      where_to_try = '',
    } = req.body;

    if (!name || !description || !image_url) {
      return res.status(400).json({ error: 'Missing required food fields' });
    }

    const db = getDatabase();
    const id = generateId('food');

    db.prepare(`
      INSERT INTO foods (
        id, name, region, state, category, tagline, image_url, description,
        cultural_background, key_ingredients, where_to_try
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name,
      region,
      state,
      category,
      tagline,
      image_url,
      description,
      cultural_background,
      JSON.stringify(key_ingredients),
      where_to_try
    );

    const created = db.prepare('SELECT * FROM foods WHERE id = ?').get(id);
    res.status(201).json(formatFood(created));
  } catch (err) {
    next(err);
  }
});

export default router;

