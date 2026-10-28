import express from 'express';
import { db } from '../db/database.js';
import { generateSlug, generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get festivals
router.get('/', async (req, res, next) => {
  try {
    const { month, destination_id, state, search } = req.query;

    let query = 'SELECT * FROM festivals WHERE 1=1';
    const params = [];

    if (month && month !== 'all') {
      params.push(`%${month}%`);
      query += ` AND celebration_month ILIKE $${params.length}`;
    }

    if (destination_id) {
      params.push(destination_id);
      query += ` AND destination_id = $${params.length}`;
    }

    if (state) {
      params.push(`%${state}%`);
      query += ` AND state ILIKE $${params.length}`;
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s);
      const idx = params.length - 2;
      query += ` AND (name ILIKE $${idx} OR description ILIKE $${idx + 1} OR location ILIKE $${idx + 2})`;
    }

    query += ' ORDER BY celebration_month ASC, name ASC';
    const rows = await db.getAll(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get festival by slug or id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const festival = await db.getOne('SELECT * FROM festivals WHERE id = $1 OR slug = $2', [id, id]);
    if (!festival) {
      return res.status(404).json({ error: 'Festival not found' });
    }

    res.json(festival);
  } catch (err) {
    next(err);
  }
});

// Create festival (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), async (req, res, next) => {
  try {
    const {
      destination_id = null,
      name,
      state = '',
      location = '',
      description,
      celebration_month,
      typical_season = '',
      date_info = '',
      cultural_significance = '',
      visitor_tips = '',
      image_url,
    } = req.body;

    if (!name || !description || !celebration_month || !image_url) {
      return res.status(400).json({ error: 'Missing required festival details' });
    }

    const id = generateId('fest');
    const slug = generateSlug(name);

    await db.query(
      `INSERT INTO festivals (
        id, destination_id, name, slug, state, location, description,
        celebration_month, typical_season, date_info, cultural_significance,
        visitor_tips, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id,
        destination_id,
        name,
        slug,
        state,
        location,
        description,
        celebration_month,
        typical_season,
        date_info,
        cultural_significance,
        visitor_tips,
        image_url,
      ]
    );

    const created = await db.getOne('SELECT * FROM festivals WHERE id = $1', [id]);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
