import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaTag, FaFire, FaGift, FaPercent } from 'react-icons/fa';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import AddToCartButton from './AddToCartButton';

const SimpleHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Productos destacados de ejemplo mientras no hay datos reales
  const sampleProducts = [
    {
      _id: 'sample1',
      productName: 'iPhone 15 Pro Max',
      description: 'El smartphone más avanzado con cámara profesional y rendimiento excepcional',
      sellingPrice: 129999,
      price: 149999,
      productImage: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop'],
      stock: 50,
      category: 'Electrónicos'
    },
    {
      _id: 'sample2',
      productName: 'MacBook Air M2',
      description: 'Laptop ultradelgada con chip M2 para máximo rendimiento y duración de batería',
      sellingPrice: 89999,
      price: 99999,
      productImage: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop'],
      stock: 25,
      category: 'Electrónicos'
    },
    {
      _id: 'sample3',
      productName: 'Samsung Galaxy S24 Ultra',
      description: 'Smartphone premium con S Pen y cámara de 200MP para fotografía profesional',
      sellingPrice: 109999,
      price: 119999,
      productImage: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop'],
      stock: 30,
      category: 'Electrónicos'
    },
    {
      _id: 'sample4',
      productName: 'AirPods Pro 2da Gen',
      description: 'Auriculares inalámbricos con cancelación activa de ruido y audio espacial',
      sellingPrice: 24999,
      price: 27999,
      productImage: ['https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop'],
      stock: 100,
      category: 'Electrónicos'
    },
    {
      _id: 'sample5',
      productName: 'Nike Air Max 270',
      description: 'Zapatillas deportivas cómodas con tecnología Air Max para máximo confort',
      sellingPrice: 15999,
      price: 18999,
      productImage: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop'],
      stock: 75,
      category: 'Ropa'
    },
    {
      _id: 'sample6',
      productName: 'PlayStation 5',
      description: 'Consola de videojuegos de nueva generación con gráficos 4K y ray tracing',
      sellingPrice: 79999,
      price: 89999,
      productImage: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop'],
      stock: 15,
      category: 'Gaming'
    },
    {
      _id: 'sample7',
      productName: 'Apple Watch Series 9',
      description: 'Smartwatch con GPS, monitoreo de salud y resistencia al agua',
      sellingPrice: 39999,
      price: 44999,
      productImage: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400&h=400&fit=crop'],
      stock: 40,
      category: 'Electrónicos'
    },
    {
      _id: 'sample8',
      productName: 'Samsung 55" QLED TV',
      description: 'Smart TV 4K con tecnología QLED y HDR para una experiencia cinematográfica',
      sellingPrice: 69999,
      price: 79999,
      productImage: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop'],
      stock: 20,
      category: 'Electrónicos'
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${SummaryApi.allProduct.url}?limit=8`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setFeaturedProducts(data.data.slice(0, 8));
        console.log('Productos reales cargados:', data.data.length);
      } else {
        // Si no hay productos reales, usar productos de ejemplo
        console.log('No hay productos reales, usando productos de ejemplo');
        setFeaturedProducts(sampleProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // En caso de error, usar productos de ejemplo
      console.log('Error al cargar productos, usando productos de ejemplo');
      setFeaturedProducts(sampleProducts);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Descubre Productos{' '}
                <span className="text-yellow-400">Increíbles</span>
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Encuentra los mejores productos con ofertas exclusivas y envío gratis.
                Tu tienda online de confianza con miles de productos de calidad.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/product-category"
                  className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-gray-900 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                >
                  Explorar Productos →
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
                  🔥 Buscar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-bold mb-2">Electrónicos</h3>
                <p className="text-blue-100">1,234 productos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">👕</div>
                <h3 className="text-xl font-bold mb-2">Ropa</h3>
                <p className="text-blue-100">856 productos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-bold mb-2">Hogar</h3>
                <p className="text-blue-100">642 productos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-4">⚽</div>
                <h3 className="text-xl font-bold mb-2">Deportes</h3>
                <p className="text-blue-100">423 productos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">En pedidos superiores a $50</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Compra Segura</h3>
              <p className="text-gray-600">Protegemos tu información</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎧</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">Estamos aquí para ayudarte</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Calidad Premium</h3>
              <p className="text-gray-600">Productos seleccionados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
              <FaFire className="mr-3 text-orange-400" />
              Ofertas Especiales
              <FaFire className="ml-3 text-orange-400" />
            </h2>
            <p className="text-xl text-blue-100">
              Aprovecha estas increíbles promociones por tiempo limitado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Promoción 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <FaPercent className="text-red-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Descuento del 20%</h3>
                  <p className="text-gray-600 text-sm">En todos los electrónicos</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Aprovecha nuestro descuento especial en la categoría de electrónicos.
                ¡No te pierdas esta oportunidad!
              </p>
              <Link
                to="/product-category?category=Electrónicos"
                className="inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Ver Ofertas
              </Link>
            </div>

            {/* Promoción 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <FaGift className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Envío Gratis</h3>
                  <p className="text-gray-600 text-sm">En compras superiores a $10.000</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                ¡Envío gratis en todas tus compras! No hay mínimo de compra,
                solo agrega productos y disfruta.
              </p>
              <Link
                to="/product-category"
                className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Comprar Ahora
              </Link>
            </div>

            {/* Promoción 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <FaTag className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">2x1 en Accesorios</h3>
                  <p className="text-gray-600 text-sm">Lleva 2 y paga 1</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Promoción especial en accesorios y complementos.
                ¡Lleva el doble por el mismo precio!
              </p>
              <Link
                to="/product-category?category=Accesorios"
                className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Ver Promoción
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <FaStar className="mr-3 text-yellow-500" />
              Productos Destacados
              <FaStar className="ml-3 text-yellow-500" />
            </h2>
            <p className="text-xl text-gray-600">
              Los productos más populares y mejor valorados por nuestros clientes
            </p>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos disponibles</h3>
              <p className="text-gray-600 mb-6">Pronto tendremos productos increíbles para ti</p>
              <Link
                to="/product-category"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <span>Explorar productos</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => {
                if (!product || !product._id) return null;

                return (
                  <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.productImage?.[0] || '/api/placeholder/300/300'}
                        alt={product.productName || 'Producto'}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/300';
                        }}
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                          <FaTag className="text-xs" />
                          <span>Destacado</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className="text-sm" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-2">(4.8)</span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.productName || 'Producto sin nombre'}
                      </h3>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description || 'Descripción no disponible'}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-gray-900">
                            {displayINRCurrency(product.sellingPrice || 0)}
                          </div>
                          {product.price > product.sellingPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {displayINRCurrency(product.price)}
                            </div>
                          )}
                        </div>

                        <AddToCartButton
                          productId={product._id}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          variant="primary"
                          showIcon={true}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SimpleHome;
