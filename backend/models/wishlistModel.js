const mongoose = require('mongoose');

/**
 * Modelo de Wishlist (Lista de Deseos)
 * Permite a los usuarios guardar productos favoritos
 */
const wishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'ID del usuario es requerido']
    },

    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: [true, 'ID del producto es requerido']
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [200, 'Las notas no pueden exceder 200 caracteres']
        }
    }],

    // Configuración de notificaciones
    notifications: {
        priceDrop: {
            type: Boolean,
            default: true
        },
        backInStock: {
            type: Boolean,
            default: true
        },
        newSimilar: {
            type: Boolean,
            default: false
        }
    },

    // Configuración de privacidad
    isPublic: {
        type: Boolean,
        default: false
    },

    // Metadatos
    name: {
        type: String,
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        default: 'Mi Lista de Deseos'
    },

    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    }
}, {
    timestamps: true
});

// Índices para optimizar consultas
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });
wishlistSchema.index({ user: 1, 'products.addedAt': -1 });

// Middleware para asegurar que no haya productos duplicados
wishlistSchema.pre('save', function(next) {
    const productIds = this.products.map(item => item.product.toString());
    const uniqueProductIds = [...new Set(productIds)];
    
    if (productIds.length !== uniqueProductIds.length) {
        // Remover duplicados manteniendo el primero
        const seen = new Set();
        this.products = this.products.filter(item => {
            if (seen.has(item.product.toString())) {
                return false;
            }
            seen.add(item.product.toString());
            return true;
        });
    }
    
    next();
});

// Método para agregar un producto a la wishlist
wishlistSchema.methods.addProduct = function(productId, notes = '') {
    // Verificar si el producto ya existe
    const existingProduct = this.products.find(
        item => item.product.toString() === productId.toString()
    );
    
    if (existingProduct) {
        return { success: false, message: 'El producto ya está en tu lista de deseos' };
    }
    
    this.products.push({
        product: productId,
        addedAt: new Date(),
        notes: notes
    });
    
    return { success: true, message: 'Producto agregado a la lista de deseos' };
};

// Método para remover un producto de la wishlist
wishlistSchema.methods.removeProduct = function(productId) {
    const initialLength = this.products.length;
    this.products = this.products.filter(
        item => item.product.toString() !== productId.toString()
    );
    
    if (this.products.length < initialLength) {
        return { success: true, message: 'Producto removido de la lista de deseos' };
    }
    
    return { success: false, message: 'Producto no encontrado en la lista de deseos' };
};

// Método para verificar si un producto está en la wishlist
wishlistSchema.methods.hasProduct = function(productId) {
    return this.products.some(
        item => item.product.toString() === productId.toString()
    );
};

// Método para obtener productos con información completa
wishlistSchema.methods.getProductsWithDetails = async function() {
    await this.populate({
        path: 'products.product',
        select: 'productName brandName productImage price sellingPrice stock isActive'
    });
    
    return this.products.filter(item => item.product && item.product.isActive);
};

// Método para limpiar productos que ya no existen o están inactivos
wishlistSchema.methods.cleanupInactiveProducts = async function() {
    await this.populate('products.product');
    
    this.products = this.products.filter(
        item => item.product && item.product.isActive
    );
    
    return this.save();
};

// Método para obtener estadísticas de la wishlist
wishlistSchema.methods.getStats = async function() {
    await this.populate('products.product');
    
    const activeProducts = this.products.filter(
        item => item.product && item.product.isActive
    );
    
    const totalValue = activeProducts.reduce((sum, item) => {
        return sum + (item.product.sellingPrice || item.product.price || 0);
    }, 0);
    
    const categories = [...new Set(
        activeProducts
            .filter(item => item.product && item.product.category)
            .map(item => item.product.category)
    )];
    
    return {
        totalProducts: this.products.length,
        activeProducts: activeProducts.length,
        totalValue: totalValue,
        categories: categories,
        lastAdded: this.products.length > 0 ? 
            Math.max(...this.products.map(item => item.addedAt)) : null
    };
};

// Método estático para encontrar wishlists por usuario
wishlistSchema.statics.findByUser = function(userId) {
    return this.findOne({ user: userId });
};

// Método estático para crear o actualizar wishlist
wishlistSchema.statics.createOrUpdate = async function(userId, productId, action = 'add', notes = '') {
    let wishlist = await this.findOne({ user: userId });
    
    if (!wishlist) {
        wishlist = new this({ user: userId });
    }
    
    if (action === 'add') {
        const result = wishlist.addProduct(productId, notes);
        if (result.success) {
            await wishlist.save();
        }
        return result;
    } else if (action === 'remove') {
        const result = wishlist.removeProduct(productId);
        if (result.success) {
            await wishlist.save();
        }
        return result;
    }
    
    return { success: false, message: 'Acción no válida' };
};

const wishlistModel = mongoose.model("wishlist", wishlistSchema);

module.exports = wishlistModel;
