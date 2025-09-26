// Configuración de ejemplo para una tienda de moda
export const FASHION_STORE_CONFIG = {
  business: {
    name: "StyleHub Fashion",
    description: "Moda y estilo para todos",
    logo: "/logo-fashion.svg",
    contact: {
      email: "info@stylehub.com",
      phone: "+1-800-STYLE-456",
      address: "456 Fashion Ave, New York, NY"
    }
  },
  categories: [
    { id: 1, label: "Mujer", value: "women", icon: "👗" },
    { id: 2, label: "Hombre", value: "men", icon: "👔" },
    { id: 3, label: "Niños", value: "kids", icon: "👶" },
    { id: 4, label: "Zapatos", value: "shoes", icon: "👟" },
    { id: 5, label: "Accesorios", value: "accessories", icon: "👜" },
    { id: 6, label: "Deportes", value: "sports", icon: "⚽" },
    { id: 7, label: "Ropa Interior", value: "underwear", icon: "🩲" },
    { id: 8, label: "Joyas", value: "jewelry", icon: "💍" }
  ],
  homePage: {
    featuredCategories: [
      { category: "women", title: "Nueva Colección Mujer", showHorizontal: true },
      { category: "men", title: "Tendencias Hombre", showHorizontal: true },
      { category: "shoes", title: "Zapatos Destacados", showVertical: true },
      { category: "accessories", title: "Accesorios de Moda", showVertical: true }
    ]
  }
};
