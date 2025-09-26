const orderModel = require('../../models/orderModel');
const { AppError, catchAsync } = require('../../middleware/errorHandler');
const { logger } = require('../../middleware/logger');

/**
 * Controlador para obtener órdenes del usuario
 * Soporta filtros, paginación y ordenamiento
 */
const getOrders = catchAsync(async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    
    // Parámetros de consulta
    const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        shippingStatus,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate,
        search
    } = req.query;

    // Construir filtros
    const filters = {};

    // Si es usuario normal, solo puede ver sus propias órdenes
    // Si es admin/moderator, puede ver todas las órdenes
    if (userRole === 'user') {
        filters['customer.userId'] = userId;
    }

    // Filtros opcionales
    if (status) {
        filters.status = { $in: status.split(',') };
    }

    if (paymentStatus) {
        filters['payment.status'] = { $in: paymentStatus.split(',') };
    }

    if (shippingStatus) {
        filters['shipping.status'] = { $in: shippingStatus.split(',') };
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
        filters.createdAt = {};
        if (startDate) {
            filters.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
            filters.createdAt.$lte = new Date(endDate);
        }
    }

    // Filtro de búsqueda (por número de orden o nombre de producto)
    if (search) {
        filters.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'items.productName': { $regex: search, $options: 'i' } }
        ];
    }

    // Configurar paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Ejecutar consulta con paginación
    const orders = await orderModel
        .find(filters)
        .populate('customer.userId', 'name email')
        .populate('items.product', 'productName productImage brandName category')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

    // Contar total de documentos para paginación
    const totalOrders = await orderModel.countDocuments(filters);

    // Calcular estadísticas adicionales
    const stats = await orderModel.aggregate([
        { $match: userRole === 'user' ? { 'customer.userId': userId } : {} },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalValue: { $sum: '$pricing.total' },
                averageOrderValue: { $avg: '$pricing.total' },
                statusCounts: {
                    $push: '$status'
                }
            }
        }
    ]);

    // Procesar estadísticas
    let orderStats = {
        totalOrders: 0,
        totalValue: 0,
        averageOrderValue: 0,
        statusBreakdown: {}
    };

    if (stats.length > 0) {
        const stat = stats[0];
        orderStats.totalOrders = stat.totalOrders;
        orderStats.totalValue = stat.totalValue;
        orderStats.averageOrderValue = Math.round(stat.averageOrderValue * 100) / 100;
        
        // Contar estados
        stat.statusCounts.forEach(status => {
            orderStats.statusBreakdown[status] = (orderStats.statusBreakdown[status] || 0) + 1;
        });
    }

    // Log de la consulta
    logger.userActivity(userId, 'orders_viewed', {
        filters: Object.keys(filters),
        totalResults: totalOrders
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Órdenes obtenidas exitosamente',
        data: {
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalOrders / parseInt(limit)),
                totalOrders,
                hasNextPage: skip + parseInt(limit) < totalOrders,
                hasPrevPage: parseInt(page) > 1
            },
            stats: orderStats
        }
    });
});

/**
 * Controlador para obtener una orden específica
 */
const getOrderById = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    // Construir filtros de acceso
    const filters = { _id: orderId };
    
    // Si es usuario normal, solo puede ver sus propias órdenes
    if (userRole === 'user') {
        filters['customer.userId'] = userId;
    }

    const order = await orderModel
        .findOne(filters)
        .populate('customer.userId', 'name email phone')
        .populate('items.product', 'productName productImage brandName category description')
        .populate('events.updatedBy', 'name email');

    if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Log de la consulta
    logger.userActivity(userId, 'order_viewed', {
        orderId: order._id,
        orderNumber: order.orderNumber
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Orden obtenida exitosamente',
        data: order
    });
});

/**
 * Controlador para obtener estadísticas de órdenes (solo admin)
 */
const getOrderStats = catchAsync(async (req, res) => {
    const userRole = req.userRole;
    
    if (!['admin', 'moderator'].includes(userRole)) {
        throw new AppError('No tienes permisos para ver estas estadísticas', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const {
        period = '30d', // 7d, 30d, 90d, 1y
        groupBy = 'day' // day, week, month
    } = req.query;

    // Calcular fechas basadas en el período
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
        case '7d':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(endDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(endDate.getDate() - 90);
            break;
        case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
        default:
            startDate.setDate(endDate.getDate() - 30);
    }

    // Estadísticas generales
    const generalStats = await orderModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.total' },
                averageOrderValue: { $avg: '$pricing.total' },
                totalItems: { $sum: { $size: '$items' } }
            }
        }
    ]);

    // Estadísticas por estado
    const statusStats = await orderModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$pricing.total' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Estadísticas por método de pago
    const paymentStats = await orderModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$payment.method',
                count: { $sum: 1 },
                totalValue: { $sum: '$pricing.total' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Estadísticas por método de envío
    const shippingStats = await orderModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: '$shipping.method',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    // Estadísticas temporales (para gráficos)
    const timeStats = await orderModel.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                    day: groupBy === 'day' ? { $dayOfMonth: '$createdAt' } : null,
                    week: groupBy === 'week' ? { $week: '$createdAt' } : null
                },
                orders: { $sum: 1 },
                revenue: { $sum: '$pricing.total' }
            }
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
    ]);

    res.status(200).json({
        success: true,
        error: false,
        message: 'Estadísticas de órdenes obtenidas exitosamente',
        data: {
            period: {
                startDate,
                endDate,
                duration: period
            },
            general: generalStats[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                averageOrderValue: 0,
                totalItems: 0
            },
            byStatus: statusStats,
            byPaymentMethod: paymentStats,
            byShippingMethod: shippingStats,
            timeline: timeStats
        }
    });
});

module.exports = {
    getOrders,
    getOrderById,
    getOrderStats
};
