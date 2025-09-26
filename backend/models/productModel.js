const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    brandName: {
        type: String,
        required: [true, 'La marca es requerida'],
        trim: true,
        maxlength: [50, 'La marca no puede exceder 50 caracteres']
    },
    category: {
        type: String,
        required: [true, 'La categoría es requerida'],
        trim: true,
        lowercase: true
    },
    subcategory: {
        type: String,
        trim: true,
        lowercase: true
    },
    productImage: [{
        type: String,
        required: [true, 'Al menos una imagen es requerida']
    }],
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true,
        maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    sellingPrice: {
        type: Number,
        required: [true, 'El precio de venta es requerido'],
        min: [0, 'El precio de venta no puede ser negativo']
    },
    stock: {
        type: Number,
        default: 0,
        min: [0, 'El stock no puede ser negativo']
    },
    sku: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    weight: {
        type: Number,
        min: [0, 'El peso no puede ser negativo']
    },
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    features: [{
        name: String,
        value: String
    }]
}, {
    timestamps: true
});

// Índices para mejorar el rendimiento de las consultas
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ productName: 'text', description: 'text', tags: 'text' });
productSchema.index({ brandName: 1 });
productSchema.index({ price: 1 });

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;