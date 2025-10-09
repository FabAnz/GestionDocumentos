import rateLimit from 'express-rate-limit';

// Rate limiter específico para login - Previene ataques de fuerza bruta
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos por ventana de tiempo
    message: 'Demasiados intentos de login desde esta IP. Por favor intenta nuevamente en 15 minutos.',
    standardHeaders: true, // Retorna información de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilita headers `X-RateLimit-*`
    skipSuccessfulRequests: false, // Cuenta todos los intentos, incluso exitosos
    skipFailedRequests: false, // Cuenta también los intentos fallidos
    handler: (req, res) => {
        res.status(429).json({
            message: 'Demasiados intentos de login. Por favor intenta nuevamente en 15 minutos.',
            retryAfter: '15 minutos'
        });
    }
});

// Rate limiter para API general
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests cada 15 minutos (más razonable)
    message: 'Demasiadas peticiones desde esta IP.',
    standardHeaders: true,
    legacyHeaders: false,
});

