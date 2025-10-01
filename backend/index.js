const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const session = require("express-session");
require("dotenv").config();

const connectDB = require("./config/db");
const router = require("./routes");
const authRoutes = require("./routes/authRoutes");
const passport = require("./config/passport");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { requestLogger } = require("./middleware/logger");
const { generalLimiter } = require("./middleware/rateLimiter");
const { cors: customCors } = require("./middleware/cors");
const {
    securityHeaders,
    sanitizeHeaders,
    preventInjection,
    validatePayloadSize
} = require("./middleware/security");

const app = express();

// Configuración de seguridad mejorada
app.use(securityHeaders);

// Middlewares de seguridad adicionales
app.use(sanitizeHeaders);
app.use(preventInjection);
app.use(validatePayloadSize());

// Compresión de respuestas
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// CORS configuration mejorada
app.use(customCors);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Configuración de sesiones para Passport
app.use(session({
    secret: process.env.SESSION_SECRET || 'ecommerce-session-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Logging de requests
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use("/api/auth", authRoutes); // Rutas de autenticación
app.use("/api", router);

// Manejo de rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

// Inicializar servidor
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, process.env.HOST || '0.0.0.0', () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health`);

            // Log de configuración para debugging
            if (process.env.NODE_ENV === 'development') {
                console.log('🔧 Configuración de desarrollo activada');
                console.log(`📡 CORS permitido para: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            }
        });

        // Manejo graceful de cierre del servidor
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM recibido, cerrando servidor gracefully...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT recibido, cerrando servidor gracefully...');
            server.close(() => {
                console.log('✅ Servidor cerrado correctamente');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Verificar variables de entorno críticas antes de iniciar
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'TOKEN_SECRET_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('❌ Variables de entorno faltantes:', missingEnvVars.join(', '));
    process.exit(1);
}

startServer();
