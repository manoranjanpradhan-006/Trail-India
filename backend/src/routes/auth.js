import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../db/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Register new user
router.post('/register', (req, res, next) => {
  try {
    const { email, password, display_name, location, bio, is_local_contributor } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const db = getDatabase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = generateId('usr');
    const passwordHash = bcrypt.hashSync(password, 10);
    const role = email.toLowerCase().includes('admin') ? 'admin' : email.toLowerCase().includes('contributor') ? 'contributor' : 'traveler';
    const displayName = display_name || email.split('@')[0];

    db.prepare(`
      INSERT INTO users (id, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `).run(userId, email.toLowerCase().trim(), passwordHash, role);

    db.prepare(`
      INSERT INTO user_profiles (user_id, display_name, bio, location, is_local_contributor)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userId,
      displayName,
      bio || 'Exploring India, one trail at a time.',
      location || 'India',
      is_local_contributor ? 1 : 0
    );

    const user = {
      id: userId,
      email: email.toLowerCase().trim(),
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
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDatabase();
    const row = db.prepare(`
      SELECT u.id, u.email, u.password_hash, u.role,
             p.display_name, p.bio, p.avatar_url, p.location, p.is_local_contributor
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE LOWER(u.email) = LOWER(?)
    `).get(email.trim());

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
router.put('/me/profile', authenticateToken, (req, res, next) => {
  try {
    const { display_name, bio, location, avatar_url, travel_interests, is_local_contributor } = req.body;
    const db = getDatabase();

    db.prepare(`
      UPDATE user_profiles
      SET display_name = COALESCE(?, display_name),
          bio = COALESCE(?, bio),
          location = COALESCE(?, location),
          avatar_url = COALESCE(?, avatar_url),
          travel_interests = COALESCE(?, travel_interests),
          is_local_contributor = COALESCE(?, is_local_contributor),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      display_name ?? null,
      bio ?? null,
      location ?? null,
      avatar_url ?? null,
      travel_interests ? JSON.stringify(travel_interests) : null,
      is_local_contributor !== undefined ? (is_local_contributor ? 1 : 0) : null,
      req.user.id
    );

    const updated = db.prepare(`
      SELECT u.id, u.email, u.role,
             p.display_name, p.bio, p.avatar_url, p.location, p.is_local_contributor
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(req.user.id);

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

