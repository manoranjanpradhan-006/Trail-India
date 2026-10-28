import express from 'express';
import { getDatabase } from '../db/database.js';
import { safeJsonParse, generateId } from '../utils/helpers.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';

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
router.get('/', (req, res, next) => {
  try {
    const { category, search } = req.query;
    const db = getDatabase();

    let query = 'SELECT * FROM community_posts WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR location LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatCommunityPost));
  } catch (err) {
    next(err);
  }
});

// Create community post
router.post('/', optionalAuth, (req, res, next) => {
  try {
    const { author_name, location, category = 'Hidden Gem', title, description, best_time = 'Year-round', photos = [] } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const db = getDatabase();
    const id = generateId('comm');
    const author = author_name || (req.user ? req.user.profile?.display_name : 'Passionate Explorer');
    const photoList = Array.isArray(photos) && photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1629853683515-5c1cf7ca2687?auto=format&fit=crop&w=800&q=80'];

    db.prepare(`
      INSERT INTO community_posts (
        id, user_id, author_name, location, category, title, description,
        best_time, photos, likes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      id,
      req.user?.id || null,
      author,
      location || 'India',
      category,
      title,
      description,
      best_time,
      JSON.stringify(photoList)
    );

    const created = db.prepare('SELECT * FROM community_posts WHERE id = ?').get(id);
    res.status(201).json(formatCommunityPost(created));
  } catch (err) {
    next(err);
  }
});

// Like community post
router.post('/:id/like', (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT id, likes FROM community_posts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    db.prepare('UPDATE community_posts SET likes = likes + 1 WHERE id = ?').run(id);
    res.json({ success: true, likes: existing.likes + 1 });
  } catch (err) {
    next(err);
  }
});

export default router;

