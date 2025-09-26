const mongoose = require('mongoose');

/**
 * Modelo de Reviews/Reseñas
 * Sistema completo de calificaciones y comentarios de productos
 */
const reviewSchema = new mongoose.Schema({
    // Información del usuario que hace la review
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: [true, 'ID del usuario es requerido']
    },

    // Información del producto
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: [true, 'ID del producto es requerido']
    },

    // Información de la orden (opcional, para verificar compra)
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order'
    },

    // Calificación general (1-5 estrellas)
    rating: {
        type: Number,
        required: [true, 'La calificación es requerida'],
        min: [1, 'La calificación mínima es 1'],
        max: [5, 'La calificación máxima es 5']
    },

    // Calificaciones específicas
    detailedRatings: {
        quality: {
            type: Number,
            min: [1, 'La calificación de calidad mínima es 1'],
            max: [5, 'La calificación de calidad máxima es 5']
        },
        value: {
            type: Number,
            min: [1, 'La calificación de valor mínima es 1'],
            max: [5, 'La calificación de valor máxima es 5']
        },
        delivery: {
            type: Number,
            min: [1, 'La calificación de entrega mínima es 1'],
            max: [5, 'La calificación de entrega máxima es 5']
        },
        customerService: {
            type: Number,
            min: [1, 'La calificación de servicio al cliente mínima es 1'],
            max: [5, 'La calificación de servicio al cliente máxima es 5']
        }
    },

    // Título de la review
    title: {
        type: String,
        required: [true, 'El título de la reseña es requerido'],
        trim: true,
        minlength: [5, 'El título debe tener al menos 5 caracteres'],
        maxlength: [100, 'El título no puede exceder 100 caracteres']
    },

    // Contenido de la review
    content: {
        type: String,
        required: [true, 'El contenido de la reseña es requerido'],
        trim: true,
        minlength: [10, 'El contenido debe tener al menos 10 caracteres'],
        maxlength: [2000, 'El contenido no puede exceder 2000 caracteres']
    },

    // Imágenes de la review
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            trim: true
        }
    }],

    // Información de verificación de compra
    verifiedPurchase: {
        type: Boolean,
        default: false
    },

    // Estado de la review
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'hidden'],
        default: 'pending'
    },

    // Información de moderación
    moderation: {
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        moderatedAt: {
            type: Date
        },
        moderationNotes: {
            type: String,
            trim: true,
            maxlength: [500, 'Las notas de moderación no pueden exceder 500 caracteres']
        }
    },

    // Interacciones de la review
    helpful: {
        yes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }],
        no: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    },

    // Respuesta del vendedor/administrador
    response: {
        content: {
            type: String,
            trim: true,
            maxlength: [1000, 'La respuesta no puede exceder 1000 caracteres']
        },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        respondedAt: {
            type: Date
        }
    },

    // Información adicional
    pros: [{
        type: String,
        trim: true,
        maxlength: [100, 'Cada pro no puede exceder 100 caracteres']
    }],

    cons: [{
        type: String,
        trim: true,
        maxlength: [100, 'Cada contra no puede exceder 100 caracteres']
    }],

    // Tags para categorizar la review
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    // Configuración de notificaciones
    notifications: {
        response: {
            type: Boolean,
            default: true
        },
        helpful: {
            type: Boolean,
            default: true
        }
    },

    // Información de reportes
    reports: [{
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'fake', 'offensive', 'irrelevant', 'other']
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'La descripción del reporte no puede exceder 500 caracteres']
        },
        reportedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'resolved'],
            default: 'pending'
        }
    }]
}, {
    timestamps: true
});

// Índices para optimizar consultas
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, status: 1 });
reviewSchema.index({ verifiedPurchase: 1, status: 1 });
reviewSchema.index({ 'helpful.yes': 1 });
reviewSchema.index({ 'helpful.no': 1 });

// Índice compuesto para evitar reviews duplicadas del mismo usuario al mismo producto
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Middleware para calcular rating promedio si hay calificaciones detalladas
reviewSchema.pre('save', function(next) {
    if (this.detailedRatings && Object.keys(this.detailedRatings).length > 0) {
        const ratings = Object.values(this.detailedRatings).filter(r => r != null);
        if (ratings.length > 0) {
            this.rating = Math.round(
                ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            );
        }
    }
    next();
});

// Método para marcar review como útil
reviewSchema.methods.markHelpful = function(userId, isHelpful) {
    const yesIndex = this.helpful.yes.indexOf(userId);
    const noIndex = this.helpful.no.indexOf(userId);
    
    // Remover de ambas listas primero
    if (yesIndex > -1) this.helpful.yes.splice(yesIndex, 1);
    if (noIndex > -1) this.helpful.no.splice(noIndex, 1);
    
    // Agregar a la lista correspondiente
    if (isHelpful) {
        this.helpful.yes.push(userId);
    } else {
        this.helpful.no.push(userId);
    }
    
    return this.save();
};

// Método para obtener el conteo de útil
reviewSchema.methods.getHelpfulCount = function() {
    return {
        yes: this.helpful.yes.length,
        no: this.helpful.no.length,
        total: this.helpful.yes.length + this.helpful.no.length,
        percentage: this.helpful.yes.length + this.helpful.no.length > 0 ?
            Math.round((this.helpful.yes.length / (this.helpful.yes.length + this.helpful.no.length)) * 100) : 0
    };
};

// Método para verificar si un usuario ya marcó la review como útil
reviewSchema.methods.hasUserMarkedHelpful = function(userId) {
    return {
        helpful: this.helpful.yes.includes(userId),
        notHelpful: this.helpful.no.includes(userId)
    };
};

// Método para reportar una review
reviewSchema.methods.reportReview = function(reportedBy, reason, description) {
    this.reports.push({
        reportedBy,
        reason,
        description,
        reportedAt: new Date()
    });
    
    return this.save();
};

// Método para responder a una review
reviewSchema.methods.addResponse = function(content, respondedBy) {
    this.response = {
        content,
        respondedBy,
        respondedAt: new Date()
    };
    
    return this.save();
};

// Método estático para obtener estadísticas de reviews de un producto
reviewSchema.statics.getProductStats = async function(productId) {
    const stats = await this.aggregate([
        { $match: { product: mongoose.Types.ObjectId(productId), status: 'approved' } },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$rating' },
                ratingDistribution: {
                    $push: '$rating'
                },
                verifiedPurchases: {
                    $sum: { $cond: ['$verifiedPurchase', 1, 0] }
                }
            }
        }
    ]);
    
    if (stats.length === 0) {
        return {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            verifiedPurchases: 0
        };
    }
    
    const result = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    result.ratingDistribution.forEach(rating => {
        distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    return {
        totalReviews: result.totalReviews,
        averageRating: Math.round(result.averageRating * 10) / 10,
        ratingDistribution: distribution,
        verifiedPurchases: result.verifiedPurchases
    };
};

// Método estático para obtener reviews de un usuario
reviewSchema.statics.getUserReviews = function(userId, options = {}) {
    const query = { user: userId };
    
    if (options.status) {
        query.status = options.status;
    }
    
    return this.find(query)
        .populate('product', 'productName productImage brandName')
        .sort({ createdAt: -1 })
        .limit(options.limit || 10)
        .skip(options.skip || 0);
};

const reviewModel = mongoose.model("review", reviewSchema);

module.exports = reviewModel;
