import express from 'express';
import { getDatabase } from '../db/database.js';
import { safeJsonParse, generateSlug, generateId } from '../utils/helpers.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

function formatDestination(dest) {
  if (!dest) return null;
  return {
    ...dest,
    highlights: safeJsonParse(dest.highlights, []),
  };
}

// Get all destinations
router.get('/', (req, res, next) => {
  try {
    const { category, search } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR state LIKE ? OR district LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY name ASC';
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatDestination));
  } catch (err) {
    next(err);
  }
});

// Get destination by slug or id
router.get('/:slug', (req, res, next) => {
  try {
    const { slug } = req.params;
    const db = getDatabase();

    const dest = db.prepare('SELECT * FROM destinations WHERE slug = ? OR id = ?').get(slug, slug);
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Related places
    const places = db.prepare('SELECT * FROM places WHERE destination_id = ?').all(dest.id);
    const festivals = db.prepare('SELECT * FROM festivals WHERE destination_id = ?').all(dest.id);

    res.json({
      ...formatDestination(dest),
      places: places.map((p) => ({ ...p, highlights: safeJsonParse(p.highlights, []) })),
      festivals,
    });
  } catch (err) {
    next(err);
  }
});

// Create new destination (admin / contributor)
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), (req, res, next) => {
  try {
    const {
      name,
      state = 'Odisha',
      district = '',
      tagline = '',
      description = '',
      overview = '',
      banner_image = '',
      best_time_to_visit = '',
      weather_info = '',
      how_to_reach = '',
      latitude = 0,
      longitude = 0,
      category = 'heritage',
      estimated_budget = '',
      highlights = [],
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const db = getDatabase();
    const id = generateId('dest');
    const slug = generateSlug(name);

    db.prepare(`
      INSERT INTO destinations (
        id, name, slug, state, district, tagline, description, overview, banner_image,
        best_time_to_visit, weather_info, how_to_reach, latitude, longitude, category,
        estimated_budget, highlights, place_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      id,
      name,
      slug,
      state,
      district,
      tagline,
      description,
      overview,
      banner_image,
      best_time_to_visit,
      weather_info,
      how_to_reach,
      Number(latitude) || 0,
      Number(longitude) || 0,
      category,
      estimated_budget,
      JSON.stringify(highlights)
    );

    const created = db.prepare('SELECT * FROM destinations WHERE id = ?').get(id);
    res.status(201).json(formatDestination(created));
  } catch (err) {
    next(err);
  }
});

export default router;

