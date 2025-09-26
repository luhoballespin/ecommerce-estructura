const express = require('express');
const router = express.Router();

// Middleware de autenticación y autorización
const authToken = require('../middleware/authToken');
const { requireRole, requirePermission } = require('../middleware/authorize');
const { validate, validateObjectId } = require('../middleware/validation');
const { authLimiter, signupLimiter } = require('../middleware/rateLimiter');

// Controladores existentes
const userSignUpController = require("../controller/user/userSignUp");
const userSignInController = require('../controller/user/userSignIn');
const userDetailsController = require('../controller/user/userDetails');
const userLogout = require('../controller/user/userLogout');
const allUsers = require('../controller/user/allUsers');
const updateUser = require('../controller/user/updateUser');
const UploadProductController = require('../controller/product/uploadProduct');
const getProductController = require('../controller/product/getProduct');
const updateProductController = require('../controller/product/updateProduct');
const getCategoryProduct = require('../controller/product/getCategoryProductOne');
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct');
const getProductDetails = require('../controller/product/getProductDetails');
const addToCartController = require('../controller/user/addToCartController');
const countAddToCartProduct = require('../controller/user/countAddToCartProduct');
const addToCartViewProduct = require('../controller/user/addToCartViewProduct');
const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct');
const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct');
const clearCartController = require('../controller/user/clearCartController');
const searchProduct = require('../controller/product/searchProduct');
const filterProductController = require('../controller/product/filterProduct');

// Importar rutas modulares
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const emailRoutes = require('./emailRoutes');

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro de usuario
router.post("/signup",
    signupLimiter,
    userSignUpController
);

// Inicio de sesión
router.post("/signin",
    authLimiter,
    userSignInController
);

// Cerrar sesión
router.get("/userLogout", authToken, userLogout);

// ==================== RUTAS DE USUARIO ====================

// Obtener detalles del usuario actual
router.get("/user-details", authToken, userDetailsController);

// Actualizar perfil de usuario
router.post("/update-user", authToken, updateUser);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// Obtener todos los usuarios (solo admin/moderator)
router.get("/all-user",
    authToken,
    requireRole(['admin', 'moderator']),
    allUsers
);

// ==================== RUTAS DE PRODUCTOS ====================

// Obtener productos (público)
router.get("/get-product", getProductController);

// Obtener categorías de productos (público)
router.get("/get-categoryProduct", getCategoryProduct);

// Obtener productos por categoría (público)
router.post("/category-product", getCategoryWiseProduct);

// Obtener detalles de producto (público)
router.post("/product-details", getProductDetails);

// Buscar productos (público)
router.get("/search", searchProduct);

// Filtrar productos (público)
router.post("/filter-product", filterProductController);

// Subir producto (solo admin/seller)
router.post("/upload-product",
    authToken,
    requirePermission('MANAGE_PRODUCTS'),
    UploadProductController
);

// Actualizar producto (solo admin/seller)
router.post("/update-product",
    authToken,
    requirePermission('MANAGE_PRODUCTS'),
    updateProductController
);

// ==================== RUTAS DE CARRITO ====================

// Agregar producto al carrito
router.post("/addtocart", authToken, addToCartController);

// Obtener cantidad de productos en carrito
router.get("/countAddToCartProduct", authToken, countAddToCartProduct);

// Ver productos del carrito
router.get("/view-card-product", authToken, addToCartViewProduct);

// Actualizar producto en carrito
router.post("/update-cart-product", authToken, updateAddToCartProduct);

// Eliminar producto del carrito
router.post("/delete-cart-product", authToken, deleteAddToCartProduct);

// Limpiar carrito completo
router.delete("/clear-cart", authToken, clearCartController);

// ==================== RUTAS MODULARES ====================

// Rutas de órdenes
router.use('/orders', orderRoutes);

// Rutas de pagos
router.use('/payments', paymentRoutes);

// Rutas de email
router.use('/email', emailRoutes);

// ==================== RUTAS DE DESARROLLO ====================

// Health check general
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        service: 'Main API',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

module.exports = router;