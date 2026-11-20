import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'apexcare_hospital_super_secret_jwt_key_2026';

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const users = await db.getCollection('users');
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid session or user not found.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is inactive or suspended.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// Role-based authorization guard
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Admin has superuser access to all routes
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of roles: [${roles.join(', ')}]`
    });
  };
}
