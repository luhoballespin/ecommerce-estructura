/**
 * Sistema de logging centralizado
 * Registra eventos, errores y actividad de la aplicación
 */

const fs = require('fs');
const path = require('path');

// Crear directorio de logs si no existe
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Formato de timestamp para logs
 */
const getTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Formato de mensaje de log
 */
const formatMessage = (level, message, meta = {}) => {
    const timestamp = getTimestamp();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}`;
};

/**
 * Escribe mensaje a archivo de log
 */
const writeToFile = (filename, message) => {
    const logFile = path.join(logDir, filename);
    fs.appendFileSync(logFile, message + '\n');
};

/**
 * Logger principal
 */
const logger = {
    /**
     * Log de información general
     */
    info: (message, meta = {}) => {
        const logMessage = formatMessage('info', message, meta);
        console.log(logMessage);
        writeToFile('app.log', logMessage);
    },

    /**
     * Log de advertencias
     */
    warn: (message, meta = {}) => {
        const logMessage = formatMessage('warn', message, meta);
        console.warn(logMessage);
        writeToFile('app.log', logMessage);
        writeToFile('warnings.log', logMessage);
    },

    /**
     * Log de errores
     */
    error: (message, meta = {}) => {
        const logMessage = formatMessage('error', message, meta);
        console.error(logMessage);
        writeToFile('app.log', logMessage);
        writeToFile('errors.log', logMessage);
    },

    /**
     * Log de debug (solo en desarrollo)
     */
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            const logMessage = formatMessage('debug', message, meta);
            console.debug(logMessage);
            writeToFile('debug.log', logMessage);
        }
    },

    /**
     * Log de actividad de usuarios
     */
    userActivity: (userId, action, details = {}) => {
        const message = `User ${userId} performed ${action}`;
        const meta = {
            userId,
            action,
            ...details,
            timestamp: getTimestamp()
        };
        
        const logMessage = formatMessage('user_activity', message, meta);
        writeToFile('user-activity.log', logMessage);
    },

    /**
     * Log de transacciones
     */
    transaction: (type, details = {}) => {
        const message = `Transaction: ${type}`;
        const meta = {
            type,
            ...details,
            timestamp: getTimestamp()
        };
        
        const logMessage = formatMessage('transaction', message, meta);
        writeToFile('transactions.log', logMessage);
    },

    /**
     * Log de seguridad
     */
    security: (event, details = {}) => {
        const message = `Security Event: ${event}`;
        const meta = {
            event,
            ...details,
            timestamp: getTimestamp()
        };
        
        const logMessage = formatMessage('security', message, meta);
        console.warn(logMessage);
        writeToFile('security.log', logMessage);
    },

    /**
     * Log de performance
     */
    performance: (operation, duration, details = {}) => {
        const message = `Performance: ${operation} took ${duration}ms`;
        const meta = {
            operation,
            duration,
            ...details,
            timestamp: getTimestamp()
        };
        
        const logMessage = formatMessage('performance', message, meta);
        writeToFile('performance.log', logMessage);
    }
};

/**
 * Middleware para logging de requests HTTP
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            userId: req.userId || 'anonymous'
        };

        if (res.statusCode >= 400) {
            logger.error(`HTTP ${res.statusCode}`, logData);
        } else {
            logger.info(`HTTP ${res.statusCode}`, logData);
        }

        logger.performance(`${req.method} ${req.originalUrl}`, duration, logData);
    });

    next();
};

/**
 * Función para limpiar logs antiguos (ejecutar periódicamente)
 */
const cleanupLogs = (daysToKeep = 30) => {
    const files = ['app.log', 'errors.log', 'warnings.log', 'debug.log', 'user-activity.log', 'transactions.log', 'security.log', 'performance.log'];
    
    files.forEach(filename => {
        const filePath = path.join(logDir, filename);
        
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const daysDiff = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysDiff > daysToKeep) {
                fs.unlinkSync(filePath);
                logger.info(`Deleted old log file: ${filename}`);
            }
        }
    });
};

module.exports = {
    logger,
    requestLogger,
    cleanupLogs
};
