import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, display_name, location, bio, is_local_contributor } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.getOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = generateId('usr');
    const passwordHash = bcrypt.hashSync(password, 10);
    const role = cleanEmail.includes('admin') ? 'admin' : cleanEmail.includes('contributor') ? 'contributor' : 'traveler';
    const displayName = display_name || cleanEmail.split('@')[0];

    await db.query(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES ($1, $2, $3, $4)`,
      [userId, cleanEmail, passwordHash, role]
    );

    await db.query(
      `INSERT INTO user_profiles (user_id, display_name, bio, location, is_local_contributor)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        userId,
        displayName,
        bio || 'Exploring India, one trail at a time.',
        location || 'India',
        Boolean(is_local_contributor),
      ]
    );

    const user = {
      id: userId,
      email: cleanEmail,
      role,
      profile: {
        display_name: displayName,
        location: location || 'India',
        bio: bio || 'Exploring India, one trail at a time.',
        avatar_url: '',
        is_local_contributor: Boolean(is_local_contributor),
      },
    };

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const row = await db.getOne(
      `SELECT u.id, u.email, u.password_hash, u.role,
              p.display_name, p.bio, p.avatar_url, p.location, p.is_local_contributor
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE LOWER(u.email) = LOWER($1)`,
      [cleanEmail]
    );

    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, row.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = {
      id: row.id,
      email: row.email,
      role: row.role,
      profile: {
        display_name: row.display_name || row.email.split('@')[0],
        location: row.location || 'India',
        bio: row.bio || '',
        avatar_url: row.avatar_url || '',
        is_local_contributor: Boolean(row.is_local_contributor),
      },
    };

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Get current authenticated user
router.get('/me', authenticateToken, (req, res) => {
  res.json(req.user);
});

// Update current user profile
router.put('/me/profile', authenticateToken, async (req, res, next) => {
  try {
    const { display_name, bio, location, avatar_url, travel_interests, is_local_contributor } = req.body;

    await db.query(
      `UPDATE user_profiles
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           location = COALESCE($3, location),
           avatar_url = COALESCE($4, avatar_url),
           travel_interests = COALESCE($5, travel_interests),
           is_local_contributor = COALESCE($6, is_local_contributor),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $7`,
      [
        display_name ?? null,
        bio ?? null,
        location ?? null,
        avatar_url ?? null,
        travel_interests ? JSON.stringify(travel_interests) : null,
        is_local_contributor !== undefined ? Boolean(is_local_contributor) : null,
        req.user.id,
      ]
    );

    const updated = await db.getOne(
      `SELECT u.id, u.email, u.role,
              p.display_name, p.bio, p.avatar_url, p.location, p.is_local_contributor
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    res.json({
      id: updated.id,
      email: updated.email,
      role: updated.role,
      profile: {
        display_name: updated.display_name,
        location: updated.location,
        bio: updated.bio,
        avatar_url: updated.avatar_url,
        is_local_contributor: Boolean(updated.is_local_contributor),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
