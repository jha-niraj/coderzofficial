import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

// GET / — root health check
router.get('/', healthCheck);

// GET /health — explicit health endpoint
router.get('/health', healthCheck);

export default router;
