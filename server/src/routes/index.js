import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import inviteRoutes from './invite.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/invites', inviteRoutes);
// More feature routes (documents, ...) are mounted in later steps.

export default router;

