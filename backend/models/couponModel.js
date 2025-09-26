const mongoose = require('mongoose');

/**
 * Modelo de Cupones/Descuentos
 * Sistema flexible para manejar diferentes tipos de descuentos
 */
const couponSchema = new mongoose.Schema({
    // Información básica del cupón
    code: {
        type: String,
        required: [true, 'El código del cupón es requerido'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [3, 'El código debe tener al menos 3 caracteres'],
        maxlength: [20, 'El código no puede exceder 20 caracteres']
    },

    name: {
        type: String,
        required: [true, 'El nombre del cupón es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },

    // Configuración del descuento
    discountType: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping', 'buy_x_get_y'],
        required: [true, 'El tipo de descuento es requerido']
    },

    discountValue: {
        type: Number,
        required: [true, 'El valor del descuento es requerido'],
        min: [0, 'El valor del descuento no puede ser negativo']
    },

    // Límites y restricciones
    minimumAmount: {
        type: Number,
        default: 0,
        min: [0, 'El monto mínimo no puede ser negativo']
    },

    maximumDiscount: {
        type: Number,
        min: [0, 'El descuento máximo no puede ser negativo']
    },

    // Restricciones de uso
    usageLimit: {
        type: Number,
        min: [1, 'El límite de uso debe ser al menos 1']
    },

    usageCount: {
        type: Number,
        default: 0,
        min: [0, 'El conteo de uso no puede ser negativo']
    },

    userUsageLimit: {
        type: Number,
        default: 1,
        min: [1, 'El límite de uso por usuario debe ser al menos 1']
    },

    // Restricciones por categoría
    applicableCategories: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Restricciones por producto
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],

    // Restricciones por usuario
    applicableUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],

    // Fechas de vigencia
    validFrom: {
        type: Date,
        required: [true, 'La fecha de inicio es requerida']
    },

    validUntil: {
        type: Date,
        required: [true, 'La fecha de fin es requerida']
    },

    // Estado del cupón
    isActive: {
        type: Boolean,
        default: true
    },

    // Configuración especial para "comprar X obtener Y"
    buyXGetY: {
        buyQuantity: {
            type: Number,
            min: [1, 'La cantidad a comprar debe ser al menos 1']
        },
        getQuantity: {
            type: Number,
            min: [1, 'La cantidad a obtener debe ser al menos 1']
        },
        getDiscountType: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        getDiscountValue: {
            type: Number,
            min: [0, 'El valor del descuento no puede ser negativo']
        }
    },

    // Metadatos adicionales
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'El creador del cupón es requerido']
    },

    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Configuración de notificaciones
    notifyUsers: {
        type: Boolean,
        default: false
    },

    notificationMessage: {
        type: String,
        trim: true,
        maxlength: [200, 'El mensaje de notificación no puede exceder 200 caracteres']
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
couponSchema.index({ applicableCategories: 1 });
couponSchema.index({ applicableProducts: 1 });
couponSchema.index({ applicableUsers: 1 });
couponSchema.index({ createdBy: 1 });

// Validación personalizada para fechas
couponSchema.pre('save', function(next) {
    if (this.validUntil <= this.validFrom) {
        return next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
    }
    next();
});

// Validación para descuentos de porcentaje
couponSchema.pre('save', function(next) {
    if (this.discountType === 'percentage' && this.discountValue > 100) {
        return next(new Error('El descuento porcentual no puede ser mayor a 100%'));
    }
    next();
});

// Método para verificar si el cupón es válido
couponSchema.methods.isValid = function() {
    const now = new Date();
    return this.isActive && 
           now >= this.validFrom && 
           now <= this.validUntil &&
           (this.usageLimit ? this.usageCount < this.usageLimit : true);
};

// Método para verificar si un usuario puede usar el cupón
couponSchema.methods.canBeUsedBy = function(userId) {
    // Verificar si el cupón es válido
    if (!this.isValid()) {
        return { valid: false, reason: 'Cupón no válido o expirado' };
    }

    // Verificar si el usuario está en la lista de usuarios aplicables
    if (this.applicableUsers.length > 0 && !this.applicableUsers.includes(userId)) {
        return { valid: false, reason: 'Cupón no aplicable para este usuario' };
    }

    return { valid: true };
};

// Método para verificar si el cupón aplica a un producto
couponSchema.methods.appliesToProduct = function(productId, category) {
    // Verificar productos específicos
    if (this.applicableProducts.length > 0) {
        return this.applicableProducts.some(id => id.toString() === productId.toString());
    }

    // Verificar categorías
    if (this.applicableCategories.length > 0) {
        return this.applicableCategories.includes(category.toLowerCase());
    }

    // Si no hay restricciones, aplica a todos los productos
    return true;
};

// Método para calcular el descuento
couponSchema.methods.calculateDiscount = function(orderAmount, items = []) {
    let discount = 0;

    switch (this.discountType) {
        case 'percentage':
            discount = (orderAmount * this.discountValue) / 100;
            break;
        case 'fixed':
            discount = this.discountValue;
            break;
        case 'free_shipping':
            // Este se maneja por separado en el cálculo de envío
            return { discount: 0, freeShipping: true };
        case 'buy_x_get_y':
            // Lógica compleja para comprar X obtener Y
            discount = this._calculateBuyXGetYDiscount(items);
            break;
    }

    // Aplicar descuento máximo si está definido
    if (this.maximumDiscount && discount > this.maximumDiscount) {
        discount = this.maximumDiscount;
    }

    // No permitir descuento mayor al monto de la orden
    if (discount > orderAmount) {
        discount = orderAmount;
    }

    return { discount, freeShipping: false };
};

// Método privado para calcular descuento "comprar X obtener Y"
couponSchema.methods._calculateBuyXGetYDiscount = function(items) {
    if (!this.buyXGetY) return 0;

    let totalDiscount = 0;
    const { buyQuantity, getQuantity, getDiscountType, getDiscountValue } = this.buyXGetY;

    items.forEach(item => {
        const applicableQuantity = Math.floor(item.quantity / buyQuantity);
        const discountableQuantity = applicableQuantity * getQuantity;
        
        if (discountableQuantity > 0) {
            let itemDiscount = 0;
            if (getDiscountType === 'percentage') {
                itemDiscount = (item.unitPrice * discountableQuantity * getDiscountValue) / 100;
            } else {
                itemDiscount = getDiscountValue * discountableQuantity;
            }
            totalDiscount += itemDiscount;
        }
    });

    return totalDiscount;
};

// Método para incrementar el contador de uso
couponSchema.methods.incrementUsage = function() {
    this.usageCount += 1;
    return this.save();
};

const couponModel = mongoose.model("coupon", couponSchema);

module.exports = couponModel;
