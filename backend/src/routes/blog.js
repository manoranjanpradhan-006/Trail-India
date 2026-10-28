import express from 'express';
import { db } from '../db/database.js';
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
router.get('/posts', optionalAuth, async (req, res, next) => {
  try {
    const { category, search, status = 'published', tag, destination_id } = req.query;

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
        params.push(req.user.id);
        query += ` AND b.status = 'draft' AND b.author_id = $${params.length}`;
      } else {
        query += " AND b.status = 'draft'";
      }
    } else if (status !== 'all') {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    if (category && category !== 'all') {
      params.push(category);
      query += ` AND b.category = $${params.length}`;
    }

    if (destination_id) {
      params.push(destination_id);
      query += ` AND b.destination_id = $${params.length}`;
    }

    if (tag) {
      params.push(`%${tag}%`);
      query += ` AND b.tags ILIKE $${params.length}`;
    }

    if (search) {
      const s = `%${search}%`;
      params.push(s, s, s);
      const idx = params.length - 2;
      query += ` AND (b.title ILIKE $${idx} OR b.excerpt ILIKE $${idx + 1} OR b.content ILIKE $${idx + 2})`;
    }

    query += ' ORDER BY b.created_at DESC';
    const rows = await db.getAll(query, params);
    res.json(rows.map(formatBlogPost));
  } catch (err) {
    next(err);
  }
});

// Get single blog post by slug or id
router.get('/posts/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;

    const post = await db.getOne(
      `SELECT b.*, COALESCE(p.display_name, b.author_name) as author_name, p.avatar_url, p.bio as author_bio
       FROM blog_posts b
       LEFT JOIN user_profiles p ON b.author_id = p.user_id
       WHERE b.slug = $1 OR b.id = $2`,
      [slug, slug]
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await db.query('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = $1', [post.id]);
    post.views_count = (Number(post.views_count) || 0) + 1;

    res.json(formatBlogPost(post));
  } catch (err) {
    next(err);
  }
});

// Create blog post
router.post('/posts', authenticateToken, async (req, res, next) => {
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

    const id = generateId('story');
    let slug = generateSlug(title);

    // Ensure unique slug
    const existing = await db.getOne('SELECT id FROM blog_posts WHERE slug = $1', [slug]);
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const generatedExcerpt = excerpt || content.slice(0, 140) + '...';
    const readTime = Math.max(1, Math.ceil((content.length || 500) / 400));
    const authorName = req.user.profile?.display_name || req.user.email.split('@')[0];
    const publishedDate = 'Just now';

    await db.query(
      `INSERT INTO blog_posts (
        id, author_id, author_name, destination_id, title, slug, excerpt,
        cover_image, content, category, tags, status, read_time_minutes,
        views_count, published_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 1, $14)`,
      [
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
        publishedDate,
      ]
    );

    const created = await db.getOne('SELECT * FROM blog_posts WHERE id = $1', [id]);
    res.status(201).json(formatBlogPost(created));
  } catch (err) {
    next(err);
  }
});

// Edit blog post
router.patch('/posts/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const { title, category, excerpt, cover_image, content, tags, status } = req.body;

    await db.query(
      `UPDATE blog_posts
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           excerpt = COALESCE($3, excerpt),
           cover_image = COALESCE($4, cover_image),
           content = COALESCE($5, content),
           tags = COALESCE($6, tags),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [
        title ?? null,
        category ?? null,
        excerpt ?? null,
        cover_image ?? null,
        content ?? null,
        tags ? JSON.stringify(tags) : null,
        status ?? null,
        id,
      ]
    );

    const updated = await db.getOne('SELECT * FROM blog_posts WHERE id = $1', [id]);
    res.json(formatBlogPost(updated));
  } catch (err) {
    next(err);
  }
});

// Delete blog post
router.delete('/posts/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.getOne('SELECT * FROM blog_posts WHERE id = $1', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (existing.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await db.query('DELETE FROM blog_posts WHERE id = $1', [id]);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Bookmark a post
router.post('/posts/:id/bookmark', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const bookmarkId = generateId('bm');
    await db.query(
      `INSERT INTO blog_bookmarks (id, user_id, post_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, post_id) DO NOTHING`,
      [bookmarkId, req.user.id, id]
    );

    res.json({ success: true, message: 'Article bookmarked' });
  } catch (err) {
    next(err);
  }
});

export default router;
