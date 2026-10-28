import express from 'express';
import { db } from '../db/database.js';
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
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM destinations WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s, s);
      const idx = params.length - 3;
      query += ` AND (name ILIKE $${idx} OR description ILIKE $${idx + 1} OR state ILIKE $${idx + 2} OR district ILIKE $${idx + 3})`;
    }

    query += ' ORDER BY name ASC';
    const rows = await db.getAll(query, params);
    res.json(rows.map(formatDestination));
  } catch (err) {
    next(err);
  }
});

// Get destination by slug or id
router.get('/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const dest = await db.getOne('SELECT * FROM destinations WHERE slug = $1 OR id = $2', [slug, slug]);
    if (!dest) {
      return res.status(404).json({ error: 'Destination not found' });
    }

    // Related places and festivals
    const places = await db.getAll('SELECT * FROM places WHERE destination_id = $1', [dest.id]);
    const festivals = await db.getAll('SELECT * FROM festivals WHERE destination_id = $1', [dest.id]);

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
router.post('/', authenticateToken, requireRole(['admin', 'contributor']), async (req, res, next) => {
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

    const id = generateId('dest');
    const slug = generateSlug(name);

    await db.query(
      `INSERT INTO destinations (
        id, name, slug, state, district, tagline, description, overview, banner_image,
        best_time_to_visit, weather_info, how_to_reach, latitude, longitude, category,
        estimated_budget, highlights, place_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 0)`,
      [
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
        JSON.stringify(highlights),
      ]
    );

    const created = await db.getOne('SELECT * FROM destinations WHERE id = $1', [id]);
    res.status(201).json(formatDestination(created));
  } catch (err) {
    next(err);
  }
});

export default router;
