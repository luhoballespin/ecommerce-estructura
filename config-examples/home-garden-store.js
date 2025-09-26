// Configuración de ejemplo para una tienda de hogar y jardín
export const HOME_GARDEN_STORE_CONFIG = {
  business: {
    name: "Home & Garden Plus",
    description: "Todo para tu hogar y jardín",
    logo: "/logo-home.svg",
    contact: {
      email: "ventas@homegarden.com",
      phone: "+1-800-HOME-789",
      address: "789 Garden Way, Green City, CA"
    }
  },
  categories: [
    { id: 1, label: "Muebles", value: "furniture", icon: "🪑" },
    { id: 2, label: "Decoración", value: "decor", icon: "🖼️" },
    { id: 3, label: "Jardín", value: "garden", icon: "🌱" },
    { id: 4, label: "Cocina", value: "kitchen", icon: "🍳" },
    { id: 5, label: "Baño", value: "bathroom", icon: "🛁" },
    { id: 6, label: "Iluminación", value: "lighting", icon: "💡" },
    { id: 7, label: "Limpieza", value: "cleaning", icon: "🧽" },
    { id: 8, label: "Herramientas", value: "tools", icon: "🔧" }
  ],
  homePage: {
    featuredCategories: [
      { category: "furniture", title: "Muebles Destacados", showHorizontal: true },
      { category: "garden", title: "Jardín y Exterior", showHorizontal: true },
      { category: "decor", title: "Decoración del Hogar", showVertical: true },
      { category: "kitchen", title: "Cocina y Comedor", showVertical: true }
    ]
  }
};
