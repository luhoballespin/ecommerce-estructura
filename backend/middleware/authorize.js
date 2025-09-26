/**
 * Middleware de autorización por roles
 * Verifica que el usuario tenga los permisos necesarios para acceder al recurso
 */

const ROLES = {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator',
    SELLER: 'seller'
};

const PERMISSIONS = {
    // Gestión de usuarios
    MANAGE_USERS: [ROLES.ADMIN],
    VIEW_USERS: [ROLES.ADMIN, ROLES.MODERATOR],
    
    // Gestión de productos
    MANAGE_PRODUCTS: [ROLES.ADMIN, ROLES.SELLER],
    VIEW_PRODUCTS: [ROLES.ADMIN, ROLES.USER, ROLES.MODERATOR, ROLES.SELLER],
    
    // Gestión de órdenes
    MANAGE_ORDERS: [ROLES.ADMIN, ROLES.MODERATOR],
    VIEW_ORDERS: [ROLES.ADMIN, ROLES.USER, ROLES.MODERATOR],
    
    // Gestión de categorías
    MANAGE_CATEGORIES: [ROLES.ADMIN],
    VIEW_CATEGORIES: [ROLES.ADMIN, ROLES.USER, ROLES.MODERATOR, ROLES.SELLER],
    
    // Analytics y reportes
    VIEW_ANALYTICS: [ROLES.ADMIN],
    
    // Gestión de contenido
    MANAGE_CONTENT: [ROLES.ADMIN, ROLES.MODERATOR]
};

/**
 * Middleware para verificar roles específicos
 * @param {Array} allowedRoles - Array de roles permitidos
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({
                message: "Usuario no autenticado",
                error: true,
                success: false,
                code: "NOT_AUTHENTICATED"
            });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                message: "Permisos insuficientes",
                error: true,
                success: false,
                code: "INSUFFICIENT_PERMISSIONS",
                requiredRoles: allowedRoles,
                userRole: req.userRole
            });
        }

        next();
    };
};

/**
 * Middleware para verificar permisos específicos
 * @param {string} permission - Permiso requerido
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({
                message: "Usuario no autenticado",
                error: true,
                success: false,
                code: "NOT_AUTHENTICATED"
            });
        }

        const allowedRoles = PERMISSIONS[permission];
        
        if (!allowedRoles || !allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                message: "Permisos insuficientes para esta acción",
                error: true,
                success: false,
                code: "INSUFFICIENT_PERMISSIONS",
                requiredPermission: permission,
                userRole: req.userRole
            });
        }

        next();
    };
};

/**
 * Middleware para verificar si el usuario es propietario del recurso o admin
 * @param {string} userIdParam - Nombre del parámetro que contiene el ID del usuario
 */
const requireOwnershipOrAdmin = (userIdParam = 'userId') => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(401).json({
                message: "Usuario no autenticado",
                error: true,
                success: false,
                code: "NOT_AUTHENTICATED"
            });
        }

        // Los admins pueden acceder a todo
        if (req.userRole === ROLES.ADMIN) {
            return next();
        }

        // Verificar si el usuario es propietario del recurso
        const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
        
        if (req.userId.toString() !== resourceUserId) {
            return res.status(403).json({
                message: "Solo puedes acceder a tus propios recursos",
                error: true,
                success: false,
                code: "ACCESS_DENIED"
            });
        }

        next();
    };
};

module.exports = {
    ROLES,
    PERMISSIONS,
    requireRole,
    requirePermission,
    requireOwnershipOrAdmin
};
