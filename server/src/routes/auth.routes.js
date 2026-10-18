import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter, uploadLimiter } from '../middleware/rateLimits.js';
import { uploadSingle } from '../middleware/upload.js';
import {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
} from '../validators/auth.validators.js';
import * as auth from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), auth.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), auth.login);
router.get('/me', requireAuth, auth.me);
router.patch('/me', requireAuth, validate({ body: updateMeSchema }), auth.updateMe);
router.patch('/me/password', requireAuth, validate({ body: changePasswordSchema }), auth.changePassword);
router.post('/me/photo', requireAuth, uploadLimiter, uploadSingle, auth.uploadMyPhoto);

export default router;
