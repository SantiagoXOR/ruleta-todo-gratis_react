import { Router } from 'express';
import { uniqueCodeController } from '../controllers/uniqueCodeController';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();

// Rutas públicas (con rate limiting)
router.get(
  '/codes/:code/validate',
  rateLimitMiddleware,
  uniqueCodeController.validateCode
);

// Rutas protegidas
router.post(
  '/codes/generate',
  authMiddleware,
  uniqueCodeController.generateCode
);

router.post(
  '/codes/:code/use',
  authMiddleware,
  uniqueCodeController.useCode
);

router.get(
  '/codes/:code',
  authMiddleware,
  uniqueCodeController.getCodeDetails
);

router.get(
  '/codes',
  authMiddleware,
  uniqueCodeController.listCodes
);

export default router;
