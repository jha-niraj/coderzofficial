import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload | string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Token is empty',
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    logger.error('JWT_SECRET environment variable is not configured');
    res.status(500).json({
      success: false,
      error: 'Authentication service misconfigured',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    const error = err as Error;
    logger.debug('JWT verification failed', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token has expired',
      });
      return;
    }

    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: 'Token verification failed',
    });
  }
}
