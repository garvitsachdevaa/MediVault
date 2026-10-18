import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { deleteComment } from '../controllers/comment.controller.js';

const router = Router();

router.delete('/:id', requireAuth, deleteComment);

export default router;
