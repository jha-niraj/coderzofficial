import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  executeSync,
  executeAsync,
  getExecution,
  getLanguages,
} from '../controllers/compiler.controller.js';

const router = Router();

// POST /api/v1/execute — synchronous execution, waits for result
router.post('/execute', authMiddleware, executeSync);

// POST /api/v1/run — async execution, returns jobId immediately
router.post('/run', authMiddleware, executeAsync);

// GET /api/v1/execution/:id — poll for async result
router.get('/execution/:id', authMiddleware, getExecution);

// GET /api/v1/languages — list supported languages (no auth required)
router.get('/languages', getLanguages);

export default router;
