/**
 * Configuración avanzada de CORS
 * Manejo seguro de Cross-Origin Resource Sharing
 */

const cors = require('cors');

/**
 * Configuración de CORS para desarrollo
 */
const developmentCorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001"
    ];

    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS en desarrollo'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400 // 24 horas
};

/**
 * Configuración de CORS para producción
 */
const productionCorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      process.env.PRODUCTION_DOMAIN
    ].filter(Boolean);

    // En producción, ser más estricto con origins
    if (!origin) {
      return callback(new Error('Origin requerido en producción'), false);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origin: ${origin}`);
      callback(new Error('No permitido por CORS en producción'), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400, // 24 horas
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Configuración dinámica de CORS basada en el entorno
 */
const getCorsOptions = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isDevelopment) {
    return developmentCorsOptions;
  } else if (isProduction) {
    return productionCorsOptions;
  } else {
    // Entorno de testing o staging
    return {
      ...developmentCorsOptions,
      origin: function (origin, callback) {
        const allowedOrigins = [
          "http://localhost:3000",
          "http://127.0.0.1:3000",
          process.env.FRONTEND_URL
        ].filter(Boolean);

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por CORS en staging'), false);
        }
      }
    };
  }
};

/**
 * Middleware de CORS personalizado
 */
const customCors = (req, res, next) => {
  const corsOptions = getCorsOptions();

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', corsOptions.credentials);
    res.header('Access-Control-Max-Age', corsOptions.maxAge);

    if (corsOptions.exposedHeaders) {
      res.header('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
    }

    return res.status(204).end();
  }

  next();
};

/**
 * Configuración de CORS para WebSocket (si se usa)
 */
const websocketCorsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ].filter(Boolean);

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS para WebSocket'), false);
    }
  },
  credentials: true
};

module.exports = {
  getCorsOptions,
  customCors,
  websocketCorsOptions,
  cors: cors(getCorsOptions())
};
