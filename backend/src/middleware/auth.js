import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { getDatabase } from '../db/database.js';

export function generateToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const db = getDatabase();
    const user = db.prepare(`
      SELECT u.id, u.email, u.role, p.display_name, p.location, p.bio, p.avatar_url, p.is_local_contributor
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        display_name: user.display_name,
        location: user.location,
        bio: user.bio,
        avatar_url: user.avatar_url,
        is_local_contributor: Boolean(user.is_local_contributor),
      },
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', message: err.message });
  }
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const db = getDatabase();
    const user = db.prepare(`
      SELECT u.id, u.email, u.role, p.display_name, p.location, p.bio, p.avatar_url, p.is_local_contributor
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `).get(decoded.id);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          display_name: user.display_name,
          location: user.location,
          bio: user.bio,
          avatar_url: user.avatar_url,
          is_local_contributor: Boolean(user.is_local_contributor),
        },
      };
    } else {
      req.user = null;
    }
  } catch (_) {
    req.user = null;
  }

  next();
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient privileges' });
    }
    next();
  };
}

