import express from 'express';
import { getDatabase } from '../db/database.js';
import { generateSlug, generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get festivals
router.get('/', (req, res, next) => {
  try {
    const { month, destination_id, state, search } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM festivals WHERE 1=1';
    const params = [];

    if (month && month !== 'all') {
      query += ' AND celebration_month LIKE ?';
      params.push(`%${month}%`);
    }

    if (destination_id) {
      query += ' AND destination_id = ?';
      params.push(destination_id);
    }

    if (state) {
      query += ' AND state LIKE ?';
      params.push(`%${state}%`);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR location LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY celebration_month ASC, name ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get festival by slug or id
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const festival = db.prepare('SELECT * FROM festivals WHERE id = ? OR slug = ?').get(id, id);
    if (!festival) {
      return res.status(404).json({ error: 'Festival not found' });
    }

    res.json(festival);
  } catch (err) {
    next(err);
  }
});

// Create festival (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), (req, res, next) => {
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

    const db = getDatabase();
    const id = generateId('fest');
    const slug = generateSlug(name);

    db.prepare(`
      INSERT INTO festivals (
        id, destination_id, name, slug, state, location, description,
        celebration_month, typical_season, date_info, cultural_significance,
        visitor_tips, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
      image_url
    );

    const created = db.prepare('SELECT * FROM festivals WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;

