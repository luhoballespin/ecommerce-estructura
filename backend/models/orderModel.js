const mongoose = require('mongoose');

/**
 * Modelo de Orden - Sistema completo de gestión de pedidos
 * Incluye estados, pagos, envíos y tracking
 */
const orderSchema = new mongoose.Schema({
    // Información del cliente
    customer: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: [true, 'ID del cliente es requerido']
        },
        email: {
            type: String,
            required: [true, 'Email del cliente es requerido'],
            lowercase: true,
            trim: true
        },
        name: {
            type: String,
            required: [true, 'Nombre del cliente es requerido'],
            trim: true
        },
        phone: {
            type: String,
            trim: true
        }
    },

    // Información de facturación
    billingAddress: {
        street: {
            type: String,
            required: [true, 'Dirección de facturación es requerida'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'Ciudad de facturación es requerida'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'Estado/Provincia de facturación es requerido'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'Código postal de facturación es requerido'],
            trim: true
        },
        country: {
            type: String,
            required: [true, 'País de facturación es requerido'],
            trim: true
        }
    },

    // Información de envío
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Dirección de envío es requerida'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'Ciudad de envío es requerida'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'Estado/Provincia de envío es requerido'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'Código postal de envío es requerido'],
            trim: true
        },
        country: {
            type: String,
            required: [true, 'País de envío es requerido'],
            trim: true
        },
        instructions: {
            type: String,
            trim: true,
            maxlength: [500, 'Las instrucciones de envío no pueden exceder 500 caracteres']
        }
    },

    // Productos de la orden
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: [true, 'ID del producto es requerido']
        },
        productName: {
            type: String,
            required: [true, 'Nombre del producto es requerido']
        },
        productImage: {
            type: String,
            required: [true, 'Imagen del producto es requerida']
        },
        quantity: {
            type: Number,
            required: [true, 'Cantidad es requerida'],
            min: [1, 'La cantidad debe ser al menos 1']
        },
        unitPrice: {
            type: Number,
            required: [true, 'Precio unitario es requerido'],
            min: [0, 'El precio unitario no puede ser negativo']
        },
        totalPrice: {
            type: Number,
            required: [true, 'Precio total es requerido'],
            min: [0, 'El precio total no puede ser negativo']
        }
    }],

    // Cálculos financieros
    pricing: {
        subtotal: {
            type: Number,
            required: [true, 'Subtotal es requerido'],
            min: [0, 'El subtotal no puede ser negativo']
        },
        tax: {
            type: Number,
            default: 0,
            min: [0, 'El impuesto no puede ser negativo']
        },
        shipping: {
            type: Number,
            default: 0,
            min: [0, 'El costo de envío no puede ser negativo']
        },
        discount: {
            type: Number,
            default: 0,
            min: [0, 'El descuento no puede ser negativo']
        },
        total: {
            type: Number,
            required: [true, 'Total es requerido'],
            min: [0, 'El total no puede ser negativo']
        }
    },

    // Información de pago
    payment: {
        method: {
            type: String,
            enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery', 'bank_transfer'],
            required: [true, 'Método de pago es requerido']
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
            default: 'pending'
        },
        transactionId: {
            type: String,
            trim: true
        },
        paymentIntentId: {
            type: String,
            trim: true
        },
        paidAt: {
            type: Date
        },
        refundedAt: {
            type: Date
        },
        refundAmount: {
            type: Number,
            default: 0,
            min: [0, 'El monto del reembolso no puede ser negativo']
        }
    },

    // Información de envío
    shipping: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight', 'pickup'],
            default: 'standard'
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'],
            default: 'pending'
        },
        trackingNumber: {
            type: String,
            trim: true
        },
        carrier: {
            type: String,
            trim: true
        },
        estimatedDelivery: {
            type: Date
        },
        shippedAt: {
            type: Date
        },
        deliveredAt: {
            type: Date
        }
    },

    // Estado general de la orden
    status: {
        type: String,
        enum: [
            'pending',      // Orden creada, esperando pago
            'confirmed',    // Pago confirmado
            'processing',   // Preparando pedido
            'shipped',      // Enviado
            'delivered',    // Entregado
            'cancelled',    // Cancelado
            'refunded'      // Reembolsado
        ],
        default: 'pending'
    },

    // Código único de la orden
    orderNumber: {
        type: String,
        unique: true,
        required: [true, 'Número de orden es requerido']
    },

    // Notas y comentarios
    notes: {
        customer: {
            type: String,
            trim: true,
            maxlength: [500, 'Las notas del cliente no pueden exceder 500 caracteres']
        },
        admin: {
            type: String,
            trim: true,
            maxlength: [500, 'Las notas del administrador no pueden exceder 500 caracteres']
        }
    },

    // Timestamps de eventos importantes
    events: [{
        status: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            trim: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    }],

    // Información de cupones/descuentos
    coupon: {
        code: {
            type: String,
            trim: true
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        discountValue: {
            type: Number,
            min: [0, 'El valor del descuento no puede ser negativo']
        }
    },

    // Configuración de notificaciones
    notifications: {
        email: {
            type: Boolean,
            default: true
        },
        sms: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customer.userId': 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'shipping.status': 1 });
orderSchema.index({ createdAt: -1 });

// Middleware para generar número de orden único
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const count = await this.constructor.countDocuments();
        this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Middleware para registrar eventos de estado
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.events.push({
            status: this.status,
            timestamp: new Date(),
            note: `Estado cambiado a: ${this.status}`
        });
    }
    next();
});

// Método virtual para calcular días desde la creación
orderSchema.virtual('daysSinceCreated').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Método para verificar si la orden puede ser cancelada
orderSchema.methods.canBeCancelled = function() {
    return ['pending', 'confirmed', 'processing'].includes(this.status);
};

// Método para verificar si la orden puede ser reembolsada
orderSchema.methods.canBeRefunded = function() {
    return this.payment.status === 'completed' && this.status !== 'refunded';
};

// Método para obtener el estado actual con timestamp
orderSchema.methods.getCurrentStatus = function() {
    const latestEvent = this.events[this.events.length - 1];
    return {
        status: this.status,
        timestamp: latestEvent ? latestEvent.timestamp : this.createdAt,
        note: latestEvent ? latestEvent.note : null
    };
};

const orderModel = mongoose.model("order", orderSchema);

module.exports = orderModel;
