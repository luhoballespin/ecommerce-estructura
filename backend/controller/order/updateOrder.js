const orderModel = require('../../models/orderModel');
const { AppError, catchAsync } = require('../../middleware/errorHandler');
const { logger } = require('../../middleware/logger');

/**
 * Controlador para actualizar el estado de una orden
 * Solo admin/moderator puede cambiar estados
 */
const updateOrderStatus = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { status, note } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Verificar permisos
    if (!['admin', 'moderator'].includes(userRole)) {
        throw new AppError('No tienes permisos para actualizar órdenes', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    // Estados válidos
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(status)) {
        throw new AppError('Estado de orden inválido', 400, 'INVALID_STATUS');
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Validar transiciones de estado
    const currentStatus = order.status;
    const validTransitions = {
        'pending': ['confirmed', 'cancelled'],
        'confirmed': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': ['refunded'],
        'cancelled': [],
        'refunded': []
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
        throw new AppError(`No se puede cambiar de ${currentStatus} a ${status}`, 400, 'INVALID_STATUS_TRANSITION');
    }

    // Actualizar estado
    order.status = status;
    
    // Agregar nota administrativa si se proporciona
    if (note) {
        order.notes.admin = note;
    }

    // Actualizar timestamps específicos según el estado
    const now = new Date();
    switch (status) {
        case 'confirmed':
            order.payment.status = 'completed';
            order.payment.paidAt = now;
            break;
        case 'shipped':
            order.shipping.status = 'shipped';
            order.shipping.shippedAt = now;
            // Generar número de seguimiento si no existe
            if (!order.shipping.trackingNumber) {
                order.shipping.trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            }
            break;
        case 'delivered':
            order.shipping.status = 'delivered';
            order.shipping.deliveredAt = now;
            break;
        case 'cancelled':
            order.payment.status = 'cancelled';
            break;
        case 'refunded':
            order.payment.status = 'refunded';
            order.payment.refundedAt = now;
            order.payment.refundAmount = order.pricing.total;
            break;
    }

    await order.save();

    // Log de la actividad
    logger.userActivity(userId, 'order_status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        previousStatus: currentStatus,
        newStatus: status,
        note: note || null
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Estado de orden actualizado exitosamente',
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status,
            previousStatus: currentStatus,
            updatedAt: order.updatedAt
        }
    });
});

/**
 * Controlador para cancelar una orden (usuario)
 */
const cancelOrder = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.userId;

    const order = await orderModel.findOne({
        _id: orderId,
        'customer.userId': userId
    });

    if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Verificar si la orden puede ser cancelada
    if (!order.canBeCancelled()) {
        throw new AppError('Esta orden no puede ser cancelada', 400, 'ORDER_CANNOT_BE_CANCELLED');
    }

    // Actualizar estado
    order.status = 'cancelled';
    order.payment.status = 'cancelled';
    
    if (reason) {
        order.notes.customer = `Cancelada por el cliente: ${reason}`;
    }

    await order.save();

    // Log de la actividad
    logger.userActivity(userId, 'order_cancelled', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        reason: reason || 'No especificada'
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Orden cancelada exitosamente',
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            status: order.status
        }
    });
});

/**
 * Controlador para actualizar información de envío
 */
const updateShippingInfo = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { 
        trackingNumber, 
        carrier, 
        estimatedDelivery,
        note 
    } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Verificar permisos
    if (!['admin', 'moderator'].includes(userRole)) {
        throw new AppError('No tienes permisos para actualizar información de envío', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Actualizar información de envío
    if (trackingNumber) {
        order.shipping.trackingNumber = trackingNumber;
    }
    
    if (carrier) {
        order.shipping.carrier = carrier;
    }
    
    if (estimatedDelivery) {
        order.shipping.estimatedDelivery = new Date(estimatedDelivery);
    }

    // Agregar nota si se proporciona
    if (note) {
        order.notes.admin = note;
    }

    await order.save();

    // Log de la actividad
    logger.userActivity(userId, 'shipping_info_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        trackingNumber,
        carrier
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Información de envío actualizada exitosamente',
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            shipping: order.shipping
        }
    });
});

/**
 * Controlador para procesar reembolso
 */
const processRefund = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { 
        amount, 
        reason,
        method = 'original_payment'
    } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Verificar permisos
    if (!['admin', 'moderator'].includes(userRole)) {
        throw new AppError('No tienes permisos para procesar reembolsos', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Verificar si la orden puede ser reembolsada
    if (!order.canBeRefunded()) {
        throw new AppError('Esta orden no puede ser reembolsada', 400, 'ORDER_CANNOT_BE_REFUNDED');
    }

    // Calcular monto del reembolso
    const refundAmount = amount || order.pricing.total;

    if (refundAmount > order.pricing.total) {
        throw new AppError('El monto del reembolso no puede ser mayor al total de la orden', 400, 'INVALID_REFUND_AMOUNT');
    }

    // Actualizar estado de pago y orden
    order.payment.status = 'refunded';
    order.payment.refundedAt = new Date();
    order.payment.refundAmount = refundAmount;
    order.status = 'refunded';

    // Agregar nota del reembolso
    if (reason) {
        order.notes.admin = `Reembolso procesado: ${reason}. Monto: $${refundAmount}`;
    }

    await order.save();

    // Log de la actividad
    logger.userActivity(userId, 'refund_processed', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        refundAmount,
        reason: reason || 'No especificada',
        method
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Reembolso procesado exitosamente',
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            refundAmount,
            refundDate: order.payment.refundedAt,
            status: order.status
        }
    });
});

/**
 * Controlador para agregar nota a una orden
 */
const addOrderNote = catchAsync(async (req, res) => {
    const { orderId } = req.params;
    const { note, type = 'admin' } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const order = await orderModel.findById(orderId);

    if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    // Verificar permisos para notas administrativas
    if (type === 'admin' && !['admin', 'moderator'].includes(userRole)) {
        throw new AppError('No tienes permisos para agregar notas administrativas', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    // Verificar permisos para notas del cliente
    if (type === 'customer' && order.customer.userId.toString() !== userId.toString()) {
        throw new AppError('No tienes permisos para agregar notas a esta orden', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    // Agregar nota
    if (type === 'admin') {
        order.notes.admin = note;
    } else {
        order.notes.customer = note;
    }

    await order.save();

    // Log de la actividad
    logger.userActivity(userId, 'order_note_added', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        noteType: type
    });

    res.status(200).json({
        success: true,
        error: false,
        message: 'Nota agregada exitosamente',
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            noteType: type,
            updatedAt: order.updatedAt
        }
    });
});

module.exports = {
    updateOrderStatus,
    cancelOrder,
    updateShippingInfo,
    processRefund,
    addOrderNote
};
