import { Router } from 'express';

const router = Router();

// Used by the keep-alive ping (Step 5) to stop the free server from sleeping.
router.get('/', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

export default router;
