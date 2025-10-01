import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowLeft,
  FaHeart,
  FaShare,
  FaCheckCircle,
  FaTruck,
  FaShieldAlt,
  FaCreditCard
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import Context from '../context';
import displayINRCurrency from '../helpers/displayCurrency';

const ModernCart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  const context = useContext(Context);
  const navigate = useNavigate();
  const user = useSelector(state => state?.user?.user);

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Verificar si hay token O si hay usuario en Redux
    if (!token && !user?._id) {
      console.log('No hay token ni usuario en Redux, limpiando carrito');
      setData([]); // Limpiar carrito local
      toast.error('Debes iniciar sesión para ver tu carrito');
      navigate('/login');
      return;
    }

    // Si hay usuario en Redux pero no hay token, intentar cargar de todas formas
    if (!token && user?._id) {
      console.log('Usuario en Redux pero sin token, cargando carrito...');
    }

    console.log('Usuario autenticado, cargando carrito...');
    fetchData();
  }, [navigate, user]);

  // Limpiar carrito cuando el usuario cambie
  useEffect(() => {
    if (!user?._id) {
      console.log('Usuario no autenticado, limpiando carrito local');
      setData([]);
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponCode('');
    }
  }, [user]);

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Cart updated event received, refreshing cart data');
      fetchData();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Estados para animaciones
  const [removingItems, setRemovingItems] = useState(new Set());

  // Fetch de datos del carrito
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Si no hay token, mostrar carrito vacío
      if (!token) {
        console.log('No hay token, mostrando carrito vacío');
        setData([]);
        setLoading(false);
        return;
      }

      const response = await fetch(SummaryApi.addToCartProductView.url, {
        method: SummaryApi.addToCartProductView.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      console.log('Cart API response:', responseData);
      console.log('Response status:', response.status);
      console.log('Token used:', token ? 'Present' : 'Missing');

      if (responseData.success) {
        const cartData = responseData.data || [];
        console.log('Cart data received:', cartData);

        // Validar que los datos tengan la estructura correcta
        const validData = cartData.filter(item =>
          item &&
          item.productId &&
          item.productId.sellingPrice &&
          item.quantity
        );

        console.log('Valid cart data:', validData);
        setData(validData);
      } else {
        console.log('Cart API error:', responseData.message);
        if (responseData.message === 'Token de acceso requerido' || response.status === 401) {
          // Token inválido o expirado, limpiar y redirigir al login
          localStorage.removeItem('token');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
          navigate('/login');
          return;
        }
        toast.error('Error al cargar el carrito');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Error de conexión');
      setData([]);
    } finally {
      setLoading(false);
    }
  };


  // Incrementar cantidad
  const increaseQty = async (id, currentQty, maxStock = 100) => {
    if (currentQty >= maxStock) {
      toast.warning(`Stock máximo disponible: ${maxStock}`);
      return;
    }

    setUpdating(id);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(SummaryApi.updateCartProduct.url, {
        method: SummaryApi.updateCartProduct.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          _id: id,
          quantity: currentQty + 1
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        await fetchData();
        context.fetchUserAddToCart();
        toast.success('Cantidad actualizada');
      } else {
        toast.error(responseData.message || 'Error al actualizar cantidad');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUpdating(null);
    }
  };

  // Decrementar cantidad
  const decreaseQty = async (id, currentQty) => {
    if (currentQty <= 1) {
      await deleteCartProduct(id);
      return;
    }

    setUpdating(id);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(SummaryApi.updateCartProduct.url, {
        method: SummaryApi.updateCartProduct.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          _id: id,
          quantity: currentQty - 1
        })
      });

      const responseData = await response.json();

      if (responseData.success) {
        await fetchData();
        context.fetchUserAddToCart();
        toast.success('Cantidad actualizada');
      } else {
        toast.error(responseData.message || 'Error al actualizar cantidad');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setUpdating(null);
    }
  };

  // Eliminar producto del carrito
  const deleteCartProduct = async (id) => {
    setRemovingItems(prev => new Set([...prev, id]));

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(SummaryApi.deleteCartProduct.url, {
        method: SummaryApi.deleteCartProduct.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ _id: id })
      });

      const responseData = await response.json();

      if (responseData.success) {
        // Animación de salida antes de actualizar
        setTimeout(async () => {
          await fetchData();
          context.fetchUserAddToCart();
          setRemovingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          toast.success('Producto eliminado del carrito');
        }, 300);
      } else {
        toast.error(responseData.message || 'Error al eliminar producto');
        setRemovingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      toast.error('Error de conexión');
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Aplicar cupón (simulado por ahora)
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Ingresa un código de cupón');
      return;
    }

    setApplyingCoupon(true);

    // Simular aplicación de cupón
    setTimeout(() => {
      const validCoupons = {
        'WELCOME10': { discount: 10, type: 'percentage' },
        'SAVE20': { discount: 20, type: 'percentage' },
        'FIXED50': { discount: 50, type: 'fixed' }
      };

      const coupon = validCoupons[couponCode.toUpperCase()];

      if (coupon) {
        setAppliedCoupon(coupon);
        if (coupon.type === 'percentage') {
          setDiscount((subtotal * coupon.discount) / 100);
        } else {
          setDiscount(Math.min(coupon.discount, subtotal * 0.5)); // Máximo 50% del total
        }
        toast.success(`Cupón aplicado: ${coupon.discount}${coupon.type === 'percentage' ? '%' : ''} de descuento`);
      } else {
        toast.error('Código de cupón inválido');
      }
      setApplyingCoupon(false);
    }, 1000);
  };

  // Remover cupón
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.success('Cupón removido');
  };

  // Ir a checkout
  const proceedToCheckout = () => {
    if (data.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    navigate('/checkout');
  };

  // Agregar a wishlist (simulado)
  const addToWishlist = (product) => {
    toast.success(`${product.productId.productName} agregado a favoritos`);
  };

  // Compartir producto (simulado)
  const shareProduct = (product) => {
    if (navigator.share) {
      navigator.share({
        title: product.productId.productName,
        text: `Mira este producto: ${product.productId.productName}`,
        url: window.location.origin + `/product/${product.productId._id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/product/${product.productId._id}`);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  // Cálculos
  const subtotal = data.reduce((total, item) => {
    const itemPrice = parseFloat(item.productId?.sellingPrice || 0);
    const itemQty = parseInt(item.quantity || 0);
    const itemTotal = itemPrice * itemQty;
    console.log('Item calculation:', { itemPrice, itemQty, itemTotal, item: item.productId?.productName });
    return total + itemTotal;
  }, 0);

  const shipping = subtotal > 10000 ? 0 : 1500; // Envío gratis sobre $10.000 ARS
  const tax = subtotal * 0.08; // 8% de impuesto
  const total = subtotal + shipping + tax - discount;
  const totalQty = data.reduce((total, item) => total + parseInt(item.quantity || 0), 0);

  console.log('Cart calculations:', {
    dataLength: data.length,
    subtotal,
    shipping,
    tax,
    discount,
    total,
    totalQty,
    data: data.map(item => ({
      name: item.productId?.productName,
      price: item.productId?.sellingPrice,
      quantity: item.quantity,
      total: (item.productId?.sellingPrice || 0) * (item.quantity || 0)
    }))
  });

  // Debug info
  console.log('Cart component state:', {
    dataLength: data.length,
    loading,
    subtotal,
    totalQty,
    data: data
  });

  // Carrito vacío
  if (data.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <FaShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
              <p className="text-gray-600">Agrega algunos productos para comenzar tu compra</p>

              {/* Debug info */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Debug Info:</h3>
                <p className="text-sm text-yellow-700">Datos del carrito: {data.length} items</p>
                <p className="text-sm text-yellow-700">Estado de carga: {loading ? 'Cargando...' : 'Completado'}</p>
                <p className="text-sm text-yellow-700">Subtotal: {displayINRCurrency(subtotal)}</p>
                <p className="text-sm text-yellow-700">Total cantidad: {totalQty}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to="/product-category"
                className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <FaShoppingBag className="mr-2" />
                Continuar Comprando
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <FaArrowLeft className="mr-2" />
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del carrito */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
                <p className="text-gray-600">{totalQty} {totalQty === 1 ? 'producto' : 'productos'}</p>
              </div>
            </div>

            <Link
              to="/product-category"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              <FaPlus className="mr-1 h-4 w-4" />
              Agregar más productos
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border p-6 animate-pulse">
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              data.map((product) => (
                <div
                  key={product._id}
                  className={`bg-white rounded-xl shadow-sm border p-6 transition-all duration-300 ${removingItems.has(product._id)
                    ? 'opacity-0 scale-95 translate-x-4'
                    : 'opacity-100 scale-100 translate-x-0'
                    }`}
                >
                  <div className="flex space-x-4">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      <img
                        src={product.productId.productImage[0] || '/api/placeholder/100/100'}
                        alt={product.productId.productName}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {product.productId.productName}
                          </h3>
                          <p className="text-sm text-gray-600 capitalize mb-2">
                            {product.productId.category} • {product.productId.brandName}
                          </p>

                          {/* Precio */}
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg font-bold text-gray-900">
                              {displayINRCurrency(product.productId.sellingPrice)}
                            </span>
                            {product.productId.price > product.productId.sellingPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                {displayINRCurrency(product.productId.price)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => addToWishlist(product)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Agregar a favoritos"
                          >
                            <FaHeart className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => shareProduct(product)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Compartir"
                          >
                            <FaShare className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteCartProduct(product._id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Eliminar del carrito"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Controles de cantidad */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => decreaseQty(product._id, product.quantity)}
                            disabled={updating === product._id}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaMinus className="h-3 w-3" />
                          </button>

                          <span className="text-lg font-semibold min-w-[2rem] text-center">
                            {product.quantity}
                          </span>

                          <button
                            onClick={() => increaseQty(product._id, product.quantity, product.productId.stock)}
                            disabled={updating === product._id || product.quantity >= product.productId.stock}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaPlus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal del producto */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {displayINRCurrency(product.productId.sellingPrice * product.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

              {/* Cupón */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Cupón
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ingresa tu cupón"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={applyingCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remover
                    </button>
                  ) : (
                    <button
                      onClick={applyCoupon}
                      disabled={applyingCoupon}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {applyingCoupon ? 'Aplicando...' : 'Aplicar'}
                    </button>
                  )}
                </div>

                {appliedCoupon && (
                  <div className="mt-2 flex items-center text-green-600">
                    <FaCheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      Cupón aplicado: {appliedCoupon.discount}{appliedCoupon.type === 'percentage' ? '%' : ''} de descuento
                    </span>
                  </div>
                )}
              </div>

              {/* Desglose de precios */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalQty} {totalQty === 1 ? 'producto' : 'productos'})</span>
                  <span>{displayINRCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{shipping === 0 ? 'Gratis' : displayINRCurrency(shipping)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Impuestos</span>
                  <span>{displayINRCurrency(tax)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento</span>
                    <span>-{displayINRCurrency(discount)}</span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>{displayINRCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Botón de checkout */}
              <button
                onClick={proceedToCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <FaCreditCard className="h-5 w-5" />
                <span>Proceder al Pago</span>
              </button>

              {/* Beneficios */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <FaTruck className="h-4 w-4 mr-2 text-green-600" />
                  <span>Envío gratis en pedidos superiores a $10.000</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaShieldAlt className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Compra protegida y segura</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FaCheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernCart;
