// Configuración de ejemplo para una tienda de electrónicos
export const ELECTRONICS_STORE_CONFIG = {
  business: {
    name: "TechStore Pro",
    description: "La mejor tecnología al mejor precio",
    logo: "/logo-tech.svg",
    contact: {
      email: "ventas@techstore.com",
      phone: "+1-800-TECH-123",
      address: "123 Tech Street, Silicon Valley, CA"
    }
  },
  categories: [
    { id: 1, label: "Smartphones", value: "smartphones", icon: "📱" },
    { id: 2, label: "Laptops", value: "laptops", icon: "💻" },
    { id: 3, label: "Tablets", value: "tablets", icon: "📱" },
    { id: 4, label: "Audio", value: "audio", icon: "🎧" },
    { id: 5, label: "Gaming", value: "gaming", icon: "🎮" },
    { id: 6, label: "Cameras", value: "cameras", icon: "📷" },
    { id: 7, label: "Accessories", value: "accessories", icon: "🔌" },
    { id: 8, label: "Wearables", value: "wearables", icon: "⌚" }
  ],
  homePage: {
    featuredCategories: [
      { category: "smartphones", title: "Últimos Smartphones", showHorizontal: true },
      { category: "laptops", title: "Laptops Gaming", showHorizontal: true },
      { category: "audio", title: "Audio Premium", showVertical: true },
      { category: "gaming", title: "Gaming Setup", showVertical: true }
    ]
  }
};
