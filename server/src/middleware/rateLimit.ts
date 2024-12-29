import rateLimit from 'express-rate-limit';

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por ventana por IP
  message: {
    success: false,
    error: 'Demasiadas solicitudes, por favor intente más tarde',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
