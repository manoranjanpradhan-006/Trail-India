import express from 'express';
import { getDatabase } from '../db/database.js';
import { safeJsonParse, generateSlug, generateId } from '../utils/helpers.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

function formatBlogPost(post) {
  if (!post) return null;
  return {
    ...post,
    tags: safeJsonParse(post.tags, ['India', 'Heritage']),
    read_time_minutes: Number(post.read_time_minutes) || 5,
    views_count: Number(post.views_count) || 0,
  };
}

// Get blog posts
router.get('/posts', optionalAuth, (req, res, next) => {
  try {
    const { category, search, status = 'published', tag, destination_id } = req.query;
    const db = getDatabase();

    let query = `
      SELECT b.*, COALESCE(p.display_name, b.author_name) as author_name, p.avatar_url
      FROM blog_posts b
      LEFT JOIN user_profiles p ON b.author_id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    // Filter by status: if asking for drafts, only return own drafts unless admin
    if (status === 'draft') {
      if (!req.user) {
        return res.json([]);
      }
      if (req.user.role !== 'admin') {
        query += ' AND b.status = "draft" AND b.author_id = ?';
        params.push(req.user.id);
      } else {
        query += ' AND b.status = "draft"';
      }
    } else if (status !== 'all') {
      query += ' AND b.status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND b.category = ?';
      params.push(category);
    }

    if (destination_id) {
      query += ' AND b.destination_id = ?';
      params.push(destination_id);
    }

    if (tag) {
      query += ' AND b.tags LIKE ?';
      params.push(`%${tag}%`);
    }

    if (search) {
      query += ' AND (b.title LIKE ? OR b.excerpt LIKE ? OR b.content LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY b.created_at DESC';
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatBlogPost));
  } catch (err) {
    next(err);
  }
});

// Get single blog post by slug or id
router.get('/posts/:slug', (req, res, next) => {
  try {
    const { slug } = req.params;
    const db = getDatabase();

    const post = db.prepare(`
      SELECT b.*, COALESCE(p.display_name, b.author_name) as author_name, p.avatar_url, p.bio as author_bio
      FROM blog_posts b
      LEFT JOIN user_profiles p ON b.author_id = p.user_id
      WHERE b.slug = ? OR b.id = ?
    `).get(slug, slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    db.prepare('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?').run(post.id);
    post.views_count = (Number(post.views_count) || 0) + 1;

    res.json(formatBlogPost(post));
  } catch (err) {
    next(err);
  }
});

// Create blog post
router.post('/posts', authenticateToken, (req, res, next) => {
  try {
    const {
      title,
      category = 'Travel Chronicles',
      excerpt,
      cover_image = 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      content,
      tags = ['India', 'Heritage'],
      status = 'published',
      destination_id = null,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const db = getDatabase();
    const id = generateId('story');
    let slug = generateSlug(title);

    // Ensure unique slug
    const existing = db.prepare('SELECT id FROM blog_posts WHERE slug = ?').get(slug);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const generatedExcerpt = excerpt || content.slice(0, 140) + '...';
    const readTime = Math.max(1, Math.ceil((content.length || 500) / 400));
    const authorName = req.user.profile?.display_name || req.user.email.split('@')[0];
    const publishedDate = 'Just now';

    db.prepare(`
      INSERT INTO blog_posts (
        id, author_id, author_name, destination_id, title, slug, excerpt,
        cover_image, content, category, tags, status, read_time_minutes,
        views_count, published_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      id,
      req.user.id,
      authorName,
      destination_id,
      title,
      slug,
      generatedExcerpt,
      cover_image,
      content,
      category,
      JSON.stringify(tags),
      status,
      readTime,
      publishedDate
    );

    const created = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    res.status(201).json(formatBlogPost(created));
  } catch (err) {
    next(err);
  }
});

// Edit blog post
router.patch('/posts/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const { title, category, excerpt, cover_image, content, tags, status } = req.body;

    db.prepare(`
      UPDATE blog_posts
      SET title = COALESCE(?, title),
          category = COALESCE(?, category),
          excerpt = COALESCE(?, excerpt),
          cover_image = COALESCE(?, cover_image),
          content = COALESCE(?, content),
          tags = COALESCE(?, tags),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title ?? null,
      category ?? null,
      excerpt ?? null,
      cover_image ?? null,
      content ?? null,
      tags ? JSON.stringify(tags) : null,
      status ?? null,
      id
    );

    const updated = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    res.json(formatBlogPost(updated));
  } catch (err) {
    next(err);
  }
});

// Delete blog post
router.delete('/posts/:id', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const existing = db.prepare('SELECT * FROM blog_posts WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Bookmark a post
router.post('/posts/:id/bookmark', authenticateToken, (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const bookmarkId = generateId('bm');
    db.prepare(`
      INSERT OR IGNORE INTO blog_bookmarks (id, user_id, post_id)
      VALUES (?, ?, ?)
    `).run(bookmarkId, req.user.id, id);

    res.json({ success: true, message: 'Article bookmarked' });
  } catch (err) {
    next(err);
  }
});

export default router;

