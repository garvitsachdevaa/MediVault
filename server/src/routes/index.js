import { Router } from 'express';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/health', healthRoutes);
// Feature routes (auth, profiles, documents, ...) are mounted in later steps.

export default router;
