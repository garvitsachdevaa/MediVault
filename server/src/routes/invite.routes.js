import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as ctrl from '../controllers/invite.controller.js';

const router = Router();

// '/pending' must be declared before '/:token' so it isn't treated as a token.
router.get('/pending', requireAuth, ctrl.getPendingInvites);
router.get('/:token', ctrl.getInvite); // public
router.post('/:token/accept', requireAuth, ctrl.acceptInvite);

export default router;
