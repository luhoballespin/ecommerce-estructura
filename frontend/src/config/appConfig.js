// Configuración de la aplicación - Adaptable para diferentes tipos de comercio
export const APP_CONFIG = {
  // Información básica de la empresa/comercio
  business: {
    name: "Mi Tienda Online",
    description: "Tu tienda online de confianza",
    logo: "/logo.svg", // Ruta del logo
    contact: {
      email: "contacto@mitienda.com",
      phone: "+1234567890",
      address: "Dirección de tu tienda"
    }
  },

  // Configuración de la API
  api: {
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:8080",
    timeout: 10000
  },

  // Configuración de categorías de productos (personalizable)
  categories: [
    { id: 1, label: "Electrónicos", value: "electronics", icon: "📱" },
    { id: 2, label: "Ropa", value: "clothing", icon: "👕" },
    { id: 3, label: "Hogar", value: "home", icon: "🏠" },
    { id: 4, label: "Deportes", value: "sports", icon: "⚽" },
    { id: 5, label: "Libros", value: "books", icon: "📚" },
    { id: 6, label: "Juguetes", value: "toys", icon: "🧸" },
    { id: 7, label: "Belleza", value: "beauty", icon: "💄" },
    { id: 8, label: "Automotriz", value: "automotive", icon: "🚗" }
  ],

  // Configuración de la página principal
  homePage: {
    featuredCategories: [
      { category: "electronics", title: "Electrónicos Destacados", showHorizontal: true },
      { category: "clothing", title: "Ropa Popular", showHorizontal: true },
      { category: "home", title: "Para el Hogar", showVertical: true },
      { category: "sports", title: "Deportes", showVertical: true }
    ],
    bannerImages: [
      "/banner/banner1.jpg",
      "/banner/banner2.jpg",
      "/banner/banner3.jpg"
    ]
  },

  // Configuración de roles de usuario
  userRoles: {
    ADMIN: "admin",
    USER: "user"
  },

  // Configuración de paginación
  pagination: {
    productsPerPage: 12,
    maxPagesToShow: 5
  },

  // Configuración de moneda
  currency: {
    symbol: "$",
    code: "ARS",
    position: "before" // "before" o "after"
  },

  // Configuración de tema profesional y minimalista
  theme: {
    colors: {
      primary: {
        50: "#f0f9ff",
        100: "#e0f2fe",
        200: "#bae6fd",
        300: "#7dd3fc",
        400: "#38bdf8",
        500: "#0ea5e9", // Color principal
        600: "#0284c7",
        700: "#0369a1",
        800: "#075985",
        900: "#0c4a6e"
      },
      neutral: {
        50: "#fafafa",
        100: "#f5f5f5",
        200: "#e5e5e5",
        300: "#d4d4d4",
        400: "#a3a3a3",
        500: "#737373",
        600: "#525252",
        700: "#404040",
        800: "#262626",
        900: "#171717"
      },
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6"
    },
    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      }
    },
    spacing: {
      section: '6rem',
      container: '1.5rem'
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    }
  }
};

// Función para obtener configuración específica
export const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], APP_CONFIG);
};

// Función para actualizar configuración
export const updateConfig = (path, value) => {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, APP_CONFIG);
  target[lastKey] = value;
};

export default APP_CONFIG;
