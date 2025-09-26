const Joi = require('joi');

/**
 * Middleware de validación de datos de entrada
 * Usa Joi para validar y sanitizar datos del request
 */

/**
 * Validaciones para usuarios
 */
const userValidations = {
    signup: Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'El nombre debe tener al menos 2 caracteres',
                'string.max': 'El nombre no puede exceder 50 caracteres',
                'any.required': 'El nombre es requerido'
            }),
        email: Joi.string()
            .email()
            .lowercase()
            .trim()
            .required()
            .messages({
                'string.email': 'Email inválido',
                'any.required': 'El email es requerido'
            }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
            .required()
            .messages({
                'string.min': 'La contraseña debe tener al menos 8 caracteres',
                'string.pattern.base': 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
                'any.required': 'La contraseña es requerida'
            }),
        phone: Joi.string()
            .pattern(/^[\+]?[1-9][\d]{0,15}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Número de teléfono inválido'
            })
    }),

    signin: Joi.object({
        email: Joi.string()
            .email()
            .lowercase()
            .trim()
            .required()
            .messages({
                'string.email': 'Email inválido',
                'any.required': 'El email es requerido'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'La contraseña es requerida'
            })
    }),

    update: Joi.object({
        name: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .optional(),
        phone: Joi.string()
            .pattern(/^[\+]?[1-9][\d]{0,15}$/)
            .optional(),
        address: Joi.object({
            street: Joi.string().trim().optional(),
            city: Joi.string().trim().optional(),
            state: Joi.string().trim().optional(),
            zipCode: Joi.string().trim().optional(),
            country: Joi.string().trim().optional()
        }).optional(),
        preferences: Joi.object({
            currency: Joi.string().length(3).optional(),
            language: Joi.string().length(2).optional(),
            notifications: Joi.object({
                email: Joi.boolean().optional(),
                sms: Joi.boolean().optional()
            }).optional()
        }).optional()
    })
};

/**
 * Validaciones para productos
 */
const productValidations = {
    create: Joi.object({
        productName: Joi.string()
            .trim()
            .min(3)
            .max(100)
            .required()
            .messages({
                'string.min': 'El nombre del producto debe tener al menos 3 caracteres',
                'string.max': 'El nombre del producto no puede exceder 100 caracteres',
                'any.required': 'El nombre del producto es requerido'
            }),
        brandName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.min': 'La marca debe tener al menos 2 caracteres',
                'string.max': 'La marca no puede exceder 50 caracteres',
                'any.required': 'La marca es requerida'
            }),
        category: Joi.string()
            .trim()
            .lowercase()
            .required()
            .messages({
                'any.required': 'La categoría es requerida'
            }),
        subcategory: Joi.string()
            .trim()
            .lowercase()
            .optional(),
        productImage: Joi.array()
            .items(Joi.string().uri())
            .min(1)
            .required()
            .messages({
                'array.min': 'Al menos una imagen es requerida',
                'any.required': 'Las imágenes del producto son requeridas'
            }),
        description: Joi.string()
            .trim()
            .min(10)
            .max(1000)
            .required()
            .messages({
                'string.min': 'La descripción debe tener al menos 10 caracteres',
                'string.max': 'La descripción no puede exceder 1000 caracteres',
                'any.required': 'La descripción es requerida'
            }),
        price: Joi.number()
            .positive()
            .precision(2)
            .required()
            .messages({
                'number.positive': 'El precio debe ser positivo',
                'any.required': 'El precio es requerido'
            }),
        sellingPrice: Joi.number()
            .positive()
            .precision(2)
            .required()
            .messages({
                'number.positive': 'El precio de venta debe ser positivo',
                'any.required': 'El precio de venta es requerido'
            }),
        stock: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .messages({
                'number.min': 'El stock no puede ser negativo'
            }),
        sku: Joi.string()
            .trim()
            .optional(),
        tags: Joi.array()
            .items(Joi.string().trim().lowercase())
            .optional(),
        weight: Joi.number()
            .positive()
            .optional(),
        dimensions: Joi.object({
            length: Joi.number().positive().optional(),
            width: Joi.number().positive().optional(),
            height: Joi.number().positive().optional()
        }).optional(),
        features: Joi.array()
            .items(Joi.object({
                name: Joi.string().trim().required(),
                value: Joi.string().trim().required()
            }))
            .optional()
    }),

    update: Joi.object({
        productName: Joi.string().trim().min(3).max(100).optional(),
        brandName: Joi.string().trim().min(2).max(50).optional(),
        category: Joi.string().trim().lowercase().optional(),
        subcategory: Joi.string().trim().lowercase().optional(),
        productImage: Joi.array().items(Joi.string().uri()).min(1).optional(),
        description: Joi.string().trim().min(10).max(1000).optional(),
        price: Joi.number().positive().precision(2).optional(),
        sellingPrice: Joi.number().positive().precision(2).optional(),
        stock: Joi.number().integer().min(0).optional(),
        sku: Joi.string().trim().optional(),
        tags: Joi.array().items(Joi.string().trim().lowercase()).optional(),
        weight: Joi.number().positive().optional(),
        dimensions: Joi.object({
            length: Joi.number().positive().optional(),
            width: Joi.number().positive().optional(),
            height: Joi.number().positive().optional()
        }).optional(),
        features: Joi.array()
            .items(Joi.object({
                name: Joi.string().trim().required(),
                value: Joi.string().trim().required()
            }))
            .optional(),
        isActive: Joi.boolean().optional()
    })
};

/**
 * Validaciones para carrito
 */
const cartValidations = {
    addItem: Joi.object({
        productId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required()
            .messages({
                'string.pattern.base': 'ID de producto inválido',
                'any.required': 'El ID del producto es requerido'
            }),
        quantity: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .required()
            .messages({
                'number.min': 'La cantidad debe ser al menos 1',
                'number.max': 'La cantidad no puede exceder 100',
                'any.required': 'La cantidad es requerida'
            })
    }),

    updateItem: Joi.object({
        productId: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .required(),
        quantity: Joi.number()
            .integer()
            .min(0)
            .max(100)
            .required()
            .messages({
                'number.min': 'La cantidad no puede ser negativa',
                'number.max': 'La cantidad no puede exceder 100'
            })
    })
};

/**
 * Middleware de validación genérico
 * @param {Object} schema - Esquema de validación Joi
 * @param {string} property - Propiedad del request a validar ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                message: "Datos de entrada inválidos",
                error: true,
                success: false,
                code: "VALIDATION_ERROR",
                details: errorDetails
            });
        }

        // Reemplazar los datos originales con los datos validados y sanitizados
        req[property] = value;
        next();
    };
};

/**
 * Middleware para validar ObjectId de MongoDB
 */
const validateObjectId = (paramName = 'id') => {
    return (req, res, next) => {
        const id = req.params[paramName];
        
        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
            return res.status(400).json({
                message: `ID inválido: ${paramName}`,
                error: true,
                success: false,
                code: "INVALID_ID"
            });
        }

        next();
    };
};

module.exports = {
    validate,
    validateObjectId,
    userValidations,
    productValidations,
    cartValidations
};
