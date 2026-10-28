import express from 'express';
import { db } from '../db/database.js';
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
router.get('/', async (req, res, next) => {
  try {
    const { category, state, search } = req.query;

    let query = 'SELECT * FROM foods WHERE 1=1';
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
      params.push(s, s, s, s);
      const idx = params.length - 3;
      query += ` AND (name ILIKE $${idx} OR region ILIKE $${idx + 1} OR description ILIKE $${idx + 2} OR tagline ILIKE $${idx + 3})`;
    }

    query += ' ORDER BY name ASC';
    const rows = await db.getAll(query, params);
    res.json(rows.map(formatFood));
  } catch (err) {
    next(err);
  }
});

// Get single food item
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await db.getOne('SELECT * FROM foods WHERE id = $1', [id]);
    if (!item) {
      return res.status(404).json({ error: 'Food item not found' });
    }

    res.json(formatFood(item));
  } catch (err) {
    next(err);
  }
});

// Create food item (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), async (req, res, next) => {
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

    const id = generateId('food');

    await db.query(
      `INSERT INTO foods (
        id, name, region, state, category, tagline, image_url, description,
        cultural_background, key_ingredients, where_to_try
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
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
        where_to_try,
      ]
    );

    const created = await db.getOne('SELECT * FROM foods WHERE id = $1', [id]);
    res.status(201).json(formatFood(created));
  } catch (err) {
    next(err);
  }
});

export default router;
