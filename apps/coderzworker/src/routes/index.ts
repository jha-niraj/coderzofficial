import { Router } from 'express';
import compilerRoutes from './compiler.routes';
import healthRoutes from './health.routes';

const router = Router();

// Health endpoints at root level (no /api/v1 prefix)
router.use('/', healthRoutes);

// Compiler / execution endpoints under /api/v1
router.use('/api/v1', compilerRoutes);

export default router;
