/**
 * Middleware de rate limiting
 * Protege la API contra ataques de fuerza bruta y abuso
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter general para todas las rutas
 */
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP por ventana de tiempo (aumentado para desarrollo)
    message: {
        success: false,
        error: true,
        message: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos',
        code: 'TOO_MANY_REQUESTS'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: true,
            message: 'Demasiadas solicitudes desde esta IP, intenta nuevamente en 15 minutos',
            code: 'TOO_MANY_REQUESTS',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter estricto para autenticación
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP por ventana de tiempo
    message: {
        success: false,
        error: true,
        message: 'Demasiados intentos de inicio de sesión, intenta nuevamente en 15 minutos',
        code: 'TOO_MANY_LOGIN_ATTEMPTS'
    },
    skipSuccessfulRequests: true, // No contar requests exitosos
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: true,
            message: 'Demasiados intentos de inicio de sesión, intenta nuevamente en 15 minutos',
            code: 'TOO_MANY_LOGIN_ATTEMPTS',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter para registro de usuarios
 */
const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 registros por IP por hora
    message: {
        success: false,
        error: true,
        message: 'Demasiados intentos de registro, intenta nuevamente en 1 hora',
        code: 'TOO_MANY_SIGNUP_ATTEMPTS'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: true,
            message: 'Demasiados intentos de registro, intenta nuevamente en 1 hora',
            code: 'TOO_MANY_SIGNUP_ATTEMPTS',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter para recuperación de contraseña
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 intentos por IP por hora
    message: {
        success: false,
        error: true,
        message: 'Demasiados intentos de recuperación de contraseña, intenta nuevamente en 1 hora',
        code: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: true,
            message: 'Demasiados intentos de recuperación de contraseña, intenta nuevamente en 1 hora',
            code: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter para subida de archivos
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20, // máximo 20 uploads por IP por hora
    message: {
        success: false,
        error: true,
        message: 'Demasiadas subidas de archivos, intenta nuevamente en 1 hora',
        code: 'TOO_MANY_UPLOADS'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: true,
            message: 'Demasiadas subidas de archivos, intenta nuevamente en 1 hora',
            code: 'TOO_MANY_UPLOADS',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});

/**
 * Rate limiter para API calls desde frontend
 */
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // máximo 60 requests por IP por minuto
    message: {
        success: false,
        error: true,
        message: 'Demasiadas solicitudes a la API, intenta nuevamente en 1 minuto',
        code: 'API_RATE_LIMIT_EXCEEDED'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: true,
            message: 'Demasiadas solicitudes a la API, intenta nuevamente en 1 minuto',
            code: 'API_RATE_LIMIT_EXCEEDED',
            retryAfter: Math.round(req.rateLimit.resetTime / 1000)
        });
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    signupLimiter,
    passwordResetLimiter,
    uploadLimiter,
    apiLimiter
};
