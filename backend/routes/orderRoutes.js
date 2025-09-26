const express = require('express');
const router = express.Router();

// Middleware de autenticación y autorización
const authToken = require('../middleware/authToken');
const { requireRole, requirePermission } = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Controladores de órdenes
const createOrder = require('../controller/order/createOrder');
const { getOrders, getOrderById, getOrderStats } = require('../controller/order/getOrders');
const { 
    updateOrderStatus, 
    cancelOrder, 
    updateShippingInfo, 
    processRefund, 
    addOrderNote 
} = require('../controller/order/updateOrder');

// Validaciones Joi para órdenes
const orderValidations = require('../middleware/validation').orderValidations || {};

// ==================== RUTAS PÚBLICAS ====================

// Health check para órdenes
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'Order Service',
        timestamp: new Date().toISOString()
    });
});

// ==================== RUTAS AUTENTICADAS ====================

// Crear nueva orden
router.post('/',
    authLimiter,
    authToken,
    requirePermission('VIEW_ORDERS'), // Usuario debe poder crear órdenes
    createOrder
);

// Obtener órdenes del usuario (con filtros y paginación)
router.get('/',
    authToken,
    getOrders
);

// Obtener una orden específica
router.get('/:orderId',
    authToken,
    validateObjectId('orderId'),
    getOrderById
);

// Cancelar orden (solo el propietario)
router.patch('/:orderId/cancel',
    authToken,
    validateObjectId('orderId'),
    cancelOrder
);

// Agregar nota a una orden
router.post('/:orderId/notes',
    authToken,
    validateObjectId('orderId'),
    addOrderNote
);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// Obtener estadísticas de órdenes (solo admin/moderator)
router.get('/admin/stats',
    authToken,
    requireRole(['admin', 'moderator']),
    getOrderStats
);

// Actualizar estado de una orden (solo admin/moderator)
router.patch('/:orderId/status',
    authToken,
    requireRole(['admin', 'moderator']),
    validateObjectId('orderId'),
    updateOrderStatus
);

// Actualizar información de envío (solo admin/moderator)
router.patch('/:orderId/shipping',
    authToken,
    requireRole(['admin', 'moderator']),
    validateObjectId('orderId'),
    updateShippingInfo
);

// Procesar reembolso (solo admin)
router.post('/:orderId/refund',
    authToken,
    requireRole(['admin']),
    validateObjectId('orderId'),
    processRefund
);

// ==================== RUTAS DE DESARROLLO/TESTING ====================

// Ruta para obtener todas las órdenes (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    router.get('/admin/all',
        authToken,
        requireRole(['admin']),
        async (req, res, next) => {
            try {
                const { limit = 50, skip = 0 } = req.query;
                
                const orders = await require('../models/orderModel')
                    .find({})
                    .populate('customer.userId', 'name email')
                    .populate('items.product', 'productName productImage')
                    .sort({ createdAt: -1 })
                    .limit(parseInt(limit))
                    .skip(parseInt(skip));

                res.status(200).json({
                    success: true,
                    error: false,
                    message: 'Todas las órdenes obtenidas',
                    data: orders
                });
            } catch (error) {
                next(error);
            }
        }
    );
}

module.exports = router;
