/**
 * Middleware centralizado para manejo de errores
 * Captura, registra y responde errores de manera consistente
 */

const logger = require('./logger');

/**
 * Clase personalizada para errores de la aplicación
 */
class AppError extends Error {
    constructor(message, statusCode, code = null, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.code = code;
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Maneja errores de validación de Mongoose
 */
const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
    }));

    return new AppError(
        'Datos de entrada inválidos',
        400,
        'VALIDATION_ERROR'
    );
};

/**
 * Maneja errores de duplicación de Mongoose
 */
const handleDuplicateFieldsError = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    
    return new AppError(
        `El campo '${field}' con valor '${value}' ya existe`,
        409,
        'DUPLICATE_FIELD'
    );
};

/**
 * Maneja errores de cast de MongoDB
 */
const handleCastError = (error) => {
    return new AppError(
        `ID inválido: ${error.value}`,
        400,
        'INVALID_ID'
    );
};

/**
 * Maneja errores de JWT
 */
const handleJWTError = () => {
    return new AppError(
        'Token inválido. Por favor inicia sesión nuevamente',
        401,
        'INVALID_TOKEN'
    );
};

/**
 * Maneja tokens JWT expirados
 */
const handleJWTExpiredError = () => {
    return new AppError(
        'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
        401,
        'TOKEN_EXPIRED'
    );
};

/**
 * Envía respuesta de error en desarrollo
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: true,
        message: err.message,
        code: err.code,
        stack: err.stack,
        details: err.details || null
    });
};

/**
 * Envía respuesta de error en producción
 */
const sendErrorProd = (err, res) => {
    // Errores operacionales: enviar mensaje al cliente
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            error: true,
            message: err.message,
            code: err.code
        });
    } else {
        // Errores de programación: no enviar detalles al cliente
        logger.error('ERROR 💥', err);

        res.status(500).json({
            success: false,
            error: true,
            message: 'Algo salió mal',
            code: 'INTERNAL_ERROR'
        });
    }
};

/**
 * Middleware principal de manejo de errores
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else {
        let error = { ...err };
        error.message = err.message;

        // Manejar diferentes tipos de errores de MongoDB
        if (error.name === 'CastError') error = handleCastError(error);
        if (error.code === 11000) error = handleDuplicateFieldsError(error);
        if (error.name === 'ValidationError') error = handleValidationError(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
};

/**
 * Middleware para manejar rutas no encontradas
 */
const notFound = (req, res, next) => {
    const error = new AppError(
        `Ruta no encontrada: ${req.originalUrl}`,
        404,
        'ROUTE_NOT_FOUND'
    );
    next(error);
};

/**
 * Middleware para capturar errores asíncronos
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

/**
 * Middleware para manejar errores de límite de tamaño de archivo
 */
const handleMulterError = (err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(
            'El archivo es demasiado grande. Tamaño máximo permitido: 5MB',
            400,
            'FILE_TOO_LARGE'
        ));
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new AppError(
            'Demasiados archivos. Máximo permitido: 5 archivos',
            400,
            'TOO_MANY_FILES'
        ));
    }
    
    next(err);
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    catchAsync,
    handleMulterError
};
