import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import inviteRoutes from './invite.routes.js';
import documentRoutes from './document.routes.js';
import commentRoutes from './comment.routes.js';
import medicationRoutes, { doseRouter } from './medication.routes.js';
import visitRoutes from './visit.routes.js';
import shareRoutes from './share.routes.js';
import publicRoutes from './public.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
router.use('/invites', inviteRoutes);
router.use('/documents', documentRoutes);
router.use('/comments', commentRoutes);
router.use('/medications', medicationRoutes);
router.use('/doses', doseRouter);
router.use('/visits', visitRoutes);
router.use('/shares', shareRoutes);
router.use('/public', publicRoutes);
router.use('/notifications', notificationRoutes);

export default router;
