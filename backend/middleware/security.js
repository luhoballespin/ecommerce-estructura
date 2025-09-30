/**
 * Middleware de seguridad adicional
 * Protecciones contra ataques comunes y validaciones de seguridad
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

/**
 * Middleware para prevenir ataques de timing
 */
const preventTimingAttacks = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    // Normalizar el tiempo de respuesta para operaciones sensibles
    if (req.path.includes('/auth/') && duration < 100) {
      setTimeout(() => { }, 100 - duration);
    }
  });

  next();
};

/**
 * Middleware para sanitizar headers
 */
const sanitizeHeaders = (req, res, next) => {
  // Remover headers potencialmente peligrosos
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-proto'];

  // Limitar el tamaño de headers
  const maxHeaderSize = 8192; // 8KB
  const headerSize = JSON.stringify(req.headers).length;

  if (headerSize > maxHeaderSize) {
    return res.status(413).json({
      success: false,
      error: true,
      message: 'Headers demasiado grandes',
      code: 'HEADER_TOO_LARGE'
    });
  }

  next();
};

/**
 * Middleware para prevenir ataques de inyección
 */
const preventInjection = (req, res, next) => {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /<style[^>]*>.*?<\/style>/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /data:application\/javascript/gi
  ];

  const checkString = (str) => {
    if (typeof str !== 'string') return false;
    return suspiciousPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj, path = '') => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key], `${path}.${key}`)) return true;
      } else if (checkString(obj[key])) {
        console.warn(`Posible inyección detectada en ${path}.${key}:`, obj[key]);
        return true;
      }
    }
    return false;
  };

  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    return res.status(400).json({
      success: false,
      error: true,
      message: 'Contenido sospechoso detectado',
      code: 'SUSPICIOUS_CONTENT'
    });
  }

  next();
};

/**
 * Rate limiter para endpoints sensibles
 */
const sensitiveEndpointLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10, // máximo 10 requests por minuto
  message: {
    success: false,
    error: true,
    message: 'Demasiadas solicitudes a endpoint sensible',
    code: 'SENSITIVE_ENDPOINT_LIMIT'
  },
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: true,
      message: 'Demasiadas solicitudes a endpoint sensible',
      code: 'SENSITIVE_ENDPOINT_LIMIT',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000)
    });
  }
});

/**
 * Middleware para validar Content-Type
 */
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('Content-Type');

      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        return res.status(415).json({
          success: false,
          error: true,
          message: 'Content-Type no soportado',
          code: 'UNSUPPORTED_MEDIA_TYPE'
        });
      }
    }

    next();
  };
};

/**
 * Middleware para prevenir ataques de enumeración
 */
const preventEnumeration = (req, res, next) => {
  // Para endpoints de autenticación, usar el mismo tiempo de respuesta
  if (req.path.includes('/auth/')) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const minDuration = 200; // 200ms mínimo

      if (duration < minDuration) {
        setTimeout(() => { }, minDuration - duration);
      }
    });
  }

  next();
};

/**
 * Middleware para validar tamaño de payload
 */
const validatePayloadSize = (maxSize = 10 * 1024 * 1024) => { // 10MB por defecto
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        error: true,
        message: 'Payload demasiado grande',
        code: 'PAYLOAD_TOO_LARGE'
      });
    }

    next();
  };
};

/**
 * Configuración de Helmet para seguridad adicional
 */
const securityHeaders = helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "same-origin" },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: []
  }
});

module.exports = {
  preventTimingAttacks,
  sanitizeHeaders,
  preventInjection,
  sensitiveEndpointLimiter,
  validateContentType,
  preventEnumeration,
  validatePayloadSize,
  securityHeaders
};
