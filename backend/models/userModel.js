const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [50, 'El nombre no puede exceder 50 caracteres']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El email es requerido'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    password: {
        type: String,
        required: function () { return !this.googleId; }, // Solo requerido si no es login de Google
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres']
    },
    profilePic: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'moderator', 'seller'],
        default: 'user'
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Número de teléfono inválido']
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Permite múltiples documentos sin googleId
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'facebook'],
        default: 'local'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    preferences: {
        currency: {
            type: String,
            default: 'USD'
        },
        language: {
            type: String,
            default: 'es'
        },
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
    }
}, {
    timestamps: true
});

// Índices para mejorar el rendimiento
userSchema.index({ email: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ provider: 1 });

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;