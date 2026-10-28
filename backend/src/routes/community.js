import express from 'express';
import { db } from '../db/database.js';
import { safeJsonParse, generateId } from '../utils/helpers.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function formatCommunityPost(post) {
  if (!post) return null;
  return {
    ...post,
    photos: safeJsonParse(post.photos, ['https://images.unsplash.com/photo-1629853683515-5c1cf7ca2687?auto=format&fit=crop&w=800&q=80']),
    likes: Number(post.likes) || 0,
  };
}

// Get all community posts
router.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = 'SELECT * FROM community_posts WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s);
      const idx = params.length - 2;
      query += ` AND (title ILIKE $${idx} OR description ILIKE $${idx + 1} OR location ILIKE $${idx + 2})`;
    }

    query += ' ORDER BY created_at DESC';
    const rows = await db.getAll(query, params);
    res.json(rows.map(formatCommunityPost));
  } catch (err) {
    next(err);
  }
});

// Create community post
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { author_name, location, category = 'Hidden Gem', title, description, best_time = 'Year-round', photos = [] } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const id = generateId('comm');
    const author = author_name || (req.user ? req.user.profile?.display_name : 'Passionate Explorer');
    const photoList = Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1629853683515-5c1cf7ca2687?auto=format&fit=crop&w=800&q=80'];

    await db.query(
      `INSERT INTO community_posts (
        id, user_id, author_name, location, category, title, description,
        best_time, photos, likes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)`,
      [
        id,
        req.user?.id || null,
        author,
        location || 'India',
        category,
        title,
        description,
        best_time,
        JSON.stringify(photoList),
      ]
    );

    const created = await db.getOne('SELECT * FROM community_posts WHERE id = $1', [id]);
    res.status(201).json(formatCommunityPost(created));
  } catch (err) {
    next(err);
  }
});

// Like community post
router.post('/:id/like', async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT id, likes FROM community_posts WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    await db.query('UPDATE community_posts SET likes = likes + 1 WHERE id = $1', [id]);
    res.json({ success: true, likes: Number(existing.likes) + 1 });
  } catch (err) {
    next(err);
  }
});

export default router;
