const orderModel = require('../../models/orderModel');
const productModel = require('../../models/productModel');
const cartProductModel = require('../../models/cartProduct');
const couponModel = require('../../models/couponModel');
const { AppError, catchAsync } = require('../../middleware/errorHandler');
const { logger } = require('../../middleware/logger');

/**
 * Controlador para crear una nueva orden
 * Maneja validación de stock, cálculo de precios, y aplicación de cupones
 */
const createOrder = catchAsync(async (req, res) => {
    const { 
        shippingAddress, 
        billingAddress, 
        couponCode, 
        paymentMethod,
        shippingMethod = 'standard',
        notes = ''
    } = req.body;

    const userId = req.userId;

    // 1. Obtener productos del carrito del usuario
    const cartItems = await cartProductModel.find({ userId })
        .populate('productId');

    if (!cartItems || cartItems.length === 0) {
        throw new AppError('El carrito está vacío', 400, 'EMPTY_CART');
    }

    // 2. Validar que todos los productos existan y tengan stock suficiente
    const validatedItems = [];
    let subtotal = 0;

    for (const cartItem of cartItems) {
        const product = cartItem.productId;
        
        if (!product || !product.isActive) {
            throw new AppError(`El producto ${product?.productName || 'desconocido'} no está disponible`, 400, 'PRODUCT_UNAVAILABLE');
        }

        if (product.stock < cartItem.quantity) {
            throw new AppError(`Stock insuficiente para ${product.productName}. Disponible: ${product.stock}`, 400, 'INSUFFICIENT_STOCK');
        }

        const unitPrice = product.sellingPrice || product.price;
        const totalPrice = unitPrice * cartItem.quantity;

        validatedItems.push({
            product: product._id,
            productName: product.productName,
            productImage: product.productImage[0] || '',
            quantity: cartItem.quantity,
            unitPrice: unitPrice,
            totalPrice: totalPrice
        });

        subtotal += totalPrice;
    }

    // 3. Validar y aplicar cupón si se proporciona
    let discount = 0;
    let freeShipping = false;
    let coupon = null;

    if (couponCode) {
        coupon = await couponModel.findOne({ code: couponCode.toUpperCase() });
        
        if (!coupon) {
            throw new AppError('Código de cupón inválido', 400, 'INVALID_COUPON');
        }

        const couponValidation = coupon.canBeUsedBy(userId);
        if (!couponValidation.valid) {
            throw new AppError(couponValidation.reason, 400, 'COUPON_NOT_APPLICABLE');
        }

        // Verificar que todos los productos aplican al cupón
        const applicableItems = validatedItems.filter(item => {
            const product = cartItems.find(ci => ci.productId._id.toString() === item.product.toString())?.productId;
            return coupon.appliesToProduct(item.product, product?.category);
        });

        if (applicableItems.length === 0) {
            throw new AppError('El cupón no aplica a ningún producto en tu carrito', 400, 'COUPON_NOT_APPLICABLE');
        }

        // Calcular descuento
        const applicableSubtotal = applicableItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const discountResult = coupon.calculateDiscount(applicableSubtotal, applicableItems);
        discount = discountResult.discount;
        freeShipping = discountResult.freeShipping;
    }

    // 4. Calcular costos de envío
    let shippingCost = 0;
    if (!freeShipping) {
        // Lógica para calcular costo de envío basado en método y ubicación
        shippingCost = calculateShippingCost(shippingMethod, shippingAddress, subtotal);
    }

    // 5. Calcular impuestos (simplificado - en producción usar servicio de impuestos)
    const taxRate = 0.1; // 10% - esto debería ser dinámico basado en ubicación
    const tax = (subtotal - discount) * taxRate;

    // 6. Calcular total final
    const total = subtotal + tax + shippingCost - discount;

    // 7. Crear la orden
    const orderData = {
        customer: {
            userId: userId,
            email: req.user.email,
            name: req.user.name,
            phone: req.user.phone || ''
        },
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        items: validatedItems,
        pricing: {
            subtotal,
            tax,
            shipping: shippingCost,
            discount,
            total
        },
        payment: {
            method: paymentMethod,
            status: 'pending'
        },
        shipping: {
            method: shippingMethod,
            status: 'pending'
        },
        status: 'pending',
        coupon: coupon ? {
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        } : undefined,
        notes: {
            customer: notes
        }
    };

    const order = new orderModel(orderData);
    await order.save();

    // 8. Actualizar stock de productos
    for (const item of validatedItems) {
        await productModel.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
        );
    }

    // 9. Incrementar contador de uso del cupón si se aplicó
    if (coupon) {
        await coupon.incrementUsage();
    }

    // 10. Limpiar carrito del usuario
    await cartProductModel.deleteMany({ userId });

    // 11. Log de la actividad
    logger.userActivity(userId, 'order_created', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.pricing.total,
        itemCount: order.items.length
    });

    // 12. Enviar respuesta
    res.status(201).json({
        success: true,
        error: false,
        message: 'Orden creada exitosamente',
        data: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            total: order.pricing.total,
            status: order.status,
            paymentStatus: order.payment.status,
            items: order.items.length
        }
    });
});

/**
 * Función auxiliar para calcular costo de envío
 */
function calculateShippingCost(method, address, subtotal) {
    const baseShipping = {
        standard: 5.99,
        express: 12.99,
        overnight: 24.99,
        pickup: 0
    };

    let cost = baseShipping[method] || baseShipping.standard;

    // Envío gratis para órdenes sobre $50
    if (subtotal >= 50) {
        cost = method === 'pickup' ? 0 : cost * 0.5; // 50% de descuento
    }

    // Envío gratis para órdenes sobre $100
    if (subtotal >= 100) {
        cost = method === 'pickup' ? 0 : 0;
    }

    return cost;
}

module.exports = createOrder;
