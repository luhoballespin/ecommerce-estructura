const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

/**
 * Middleware de autenticación JWT robusto
 * Verifica tokens, valida usuarios y maneja errores de seguridad
 */
async function authToken(req, res, next) {
    try {
        // Obtener token de cookies o headers
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                message: "Token de acceso requerido",
                error: true,
                success: false,
                code: "NO_TOKEN"
            });
        }

        // Verificar y decodificar token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        } catch (jwtError) {
            return res.status(401).json({
                message: "Token inválido o expirado",
                error: true,
                success: false,
                code: "INVALID_TOKEN"
            });
        }

        // Verificar que el usuario existe y está activo
        const user = await userModel.findById(decoded._id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                message: "Usuario no encontrado",
                error: true,
                success: false,
                code: "USER_NOT_FOUND"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Cuenta desactivada",
                error: true,
                success: false,
                code: "ACCOUNT_DISABLED"
            });
        }

        // Agregar información del usuario al request
        req.userId = user._id;
        req.user = user;
        req.userRole = user.role;

        next();

    } catch (error) {
        console.error('Error en middleware de autenticación:', error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: true,
            success: false,
            code: "INTERNAL_ERROR"
        });
    }
}

module.exports = authToken;