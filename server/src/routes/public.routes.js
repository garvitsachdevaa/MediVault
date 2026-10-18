import { Router } from 'express';
import { publicNoteLimiter } from '../middleware/rateLimits.js';
import {
  getPublicShare,
  getPublicShareDocUrl,
  addPublicNote,
} from '../controllers/publicShare.controller.js';

// No authentication — the token in the URL is the credential.
const router = Router();

router.get('/shares/:token', getPublicShare);
router.get('/shares/:token/documents/:docId/file-url', getPublicShareDocUrl);
router.post('/shares/:token/notes', publicNoteLimiter, addPublicNote);

export default router;
