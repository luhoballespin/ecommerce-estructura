// Configuración del backend - Adaptable para diferentes tipos de comercio
const APP_CONFIG = {
  // Configuración de la base de datos
  database: {
    url: process.env.MONGODB_URI || "mongodb://localhost:27017/ecommerce",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Configuración del servidor
  server: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || "localhost"
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "7d"
  },

  // Configuración de CORS
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  },

  // Configuración de archivos
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    uploadPath: './uploads/'
  },

  // Configuración de categorías por defecto
  defaultCategories: [
    { value: "electronics", label: "Electrónicos" },
    { value: "clothing", label: "Ropa" },
    { value: "home", label: "Hogar" },
    { value: "sports", label: "Deportes" },
    { value: "books", label: "Libros" },
    { value: "toys", label: "Juguetes" },
    { value: "beauty", label: "Belleza" },
    { value: "automotive", label: "Automotriz" }
  ],

  // Configuración de roles
  roles: {
    ADMIN: "admin",
    USER: "user"
  }
};

module.exports = APP_CONFIG;
