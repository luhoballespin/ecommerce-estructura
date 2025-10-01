import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaHeart,
  FaHistory,
  FaRegUserCircle
} from 'react-icons/fa';
import { GrSearch } from 'react-icons/gr';
import { toast } from 'react-toastify';
import { setUserDetails } from '../store/userSlice';
import Context from '../context';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import ROLE from '../common/role';

const ProfessionalHeader = () => {
  const user = useSelector(state => state?.user?.user);
  const dispatch = useDispatch();
  const context = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para el header
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Categorías principales
  const mainCategories = [
    { name: 'Electrónicos', icon: '📱', subcategories: ['Smartphones', 'Laptops', 'Tablets', 'Accesorios'] },
    { name: 'Ropa', icon: '👕', subcategories: ['Hombres', 'Mujeres', 'Niños', 'Accesorios'] },
    { name: 'Hogar', icon: '🏠', subcategories: ['Decoración', 'Electrodomésticos', 'Muebles', 'Jardín'] },
    { name: 'Deportes', icon: '⚽', subcategories: ['Fitness', 'Outdoor', 'Deportes de equipo', 'Accesorios'] },
    { name: 'Libros', icon: '📚', subcategories: ['Ficción', 'No ficción', 'Educativos', 'Revistas'] },
    { name: 'Juguetes', icon: '🧸', subcategories: ['Educativos', 'Electrónicos', 'Tradicionales', 'Juegos'] }
  ];

  // Efecto para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cargar items del carrito
  useEffect(() => {
    fetchCartItems();
  }, [context.cartProductCount]);

  // Limpiar carrito cuando el usuario cambie
  useEffect(() => {
    if (!user?._id) {
      setCartItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        if (context.setCartProductCount) {
          context.setCartProductCount(0);
        }
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
      console.log('Header - Cart API response:', responseData);
      console.log('Header - Response status:', response.status);
      if (responseData.success) {
        const items = responseData.data || [];
        console.log('Header - Cart items received:', items.length);
        setCartItems(items);
        // Actualizar contador del carrito basado en los items reales
        if (context.setCartProductCount) {
          context.setCartProductCount(items.length);
        }
      } else {
        setCartItems([]);
        if (context.setCartProductCount) {
          context.setCartProductCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setCartItems([]);
      if (context.setCartProductCount) {
        context.setCartProductCount(0);
      }
    }
  };

  // Cargar categorías desde la API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${SummaryApi.get_categoryProduct.url}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.data || mainCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories(mainCategories);
    }
  };

  const handleLogout = async () => {
    try {
      // Limpiar carrito local inmediatamente
      setCartItems([]);

      const response = await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include'
      });
      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        dispatch(setUserDetails(null));
        setIsUserMenuOpen(false);
        navigate('/');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error al cerrar sesión');
      // Limpiar estado local incluso si falla el logout del servidor
      dispatch(setUserDetails(null));
      setCartItems([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/product-category?category=${encodeURIComponent(categoryName)}`);
    setIsCategoriesOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Header Principal */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
        : 'bg-white shadow-md'
        }`}>
        <div className="container mx-auto px-4">
          {/* Primera fila - Logo, Búsqueda, Usuario */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>

              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Mi Tienda
                </span>
              </Link>
            </div>

            {/* Barra de búsqueda */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <GrSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <GrSearch className="h-4 w-4" />
                </button>
              </form>
            </div>

            {/* Acciones del usuario */}
            <div className="flex items-center space-x-4">
              {/* Búsqueda móvil */}
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900">
                <GrSearch size={20} />
              </button>

              {/* Carrito */}
              <div className="relative cart-dropdown">
                <button
                  onClick={() => {
                    if (user?._id) {
                      setIsCartOpen(!isCartOpen);
                      // Actualizar contador cuando se abra el carrito
                      if (!isCartOpen) {
                        context.fetchUserAddToCart();
                      }
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FaShoppingCart size={20} />
                  {user?._id && context?.cartProductCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {context?.cartProductCount}
                    </span>
                  )}
                </button>

                {/* Dropdown del carrito */}
                {isCartOpen && user?._id && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Carrito ({context.cartProductCount})
                        </h3>
                        <button
                          onClick={() => setIsCartOpen(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>

                      {cartItems.length === 0 ? (
                        <div className="text-center py-8">
                          <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-3" />
                          <p className="text-gray-600">Tu carrito está vacío</p>
                          <Link
                            to="/product-category"
                            className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-semibold"
                            onClick={() => setIsCartOpen(false)}
                          >
                            Continuar comprando
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {cartItems.slice(0, 3).map((item) => (
                              <div key={item._id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                                <img
                                  src={item.productId.productImage[0]}
                                  alt={item.productId.productName}
                                  className="w-12 h-12 object-cover rounded-lg border"
                                />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                                    {item.productId.productName}
                                  </h4>
                                  <p className="text-gray-600 text-sm">
                                    Cantidad: {item.quantity}
                                  </p>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {displayINRCurrency(item.productId.sellingPrice * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}

                            {cartItems.length > 3 && (
                              <p className="text-center text-gray-600 text-sm">
                                Y {cartItems.length - 3} productos más...
                              </p>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-semibold text-gray-900">Total:</span>
                              <span className="font-bold text-lg text-gray-900">
                                {displayINRCurrency(cartItems.reduce((total, item) => total + (item.quantity * item.productId.sellingPrice), 0))}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <Link
                                to="/cart"
                                className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => setIsCartOpen(false)}
                              >
                                Ver Carrito
                              </Link>
                              <Link
                                to="/checkout"
                                className="block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                onClick={() => setIsCartOpen(false)}
                              >
                                Checkout
                              </Link>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Usuario */}
              <div className="relative">
                {user?._id ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {user?.profilePic ? (
                      <img
                        src={user.profilePic}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                        <FaRegUserCircle className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium">{user.name}</span>
                    <FaChevronDown className="h-3 w-3" />
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                )}

                {/* Menú desplegable del usuario */}
                {isUserMenuOpen && user?._id && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <nav className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaUser className="mr-3 h-4 w-4" />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaHeart className="mr-3 h-4 w-4" />
                        Lista de Deseos
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FaHistory className="mr-3 h-4 w-4" />
                        Mis Pedidos
                      </Link>
                      {user?.role === ROLE.ADMIN && (
                        <Link
                          to="/admin-panel/all-products"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaCog className="mr-3 h-4 w-4" />
                          Panel de Administración
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FaSignOutAlt className="mr-3 h-4 w-4" />
                        Cerrar Sesión
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Segunda fila - Navegación por categorías */}
          <div className="hidden lg:flex items-center justify-center h-12 border-t border-gray-200">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                <span>📋</span>
                <span>Categorías</span>
                <FaChevronDown className={`h-3 w-3 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mainCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menú de categorías desplegable */}
        {isCategoriesOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {mainCategories.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className="flex items-center space-x-2 text-gray-900 font-medium hover:text-blue-600 transition-colors"
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                    <div className="space-y-2">
                      {category.subcategories.map((subcategory, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleCategoryClick(`${category.name} - ${subcategory}`)}
                          className="block text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          {subcategory}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-16 left-0 right-0 bg-white shadow-lg max-h-screen overflow-y-auto">
            <div className="px-4 py-6 space-y-6">
              {/* Búsqueda móvil */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <GrSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </form>

              {/* Categorías móviles */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Categorías</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mainCategories.map((category, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(category.name)}
                      className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span>{category.icon}</span>
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enlaces de usuario móvil */}
              {user?._id && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-medium text-gray-900">Mi Cuenta</h3>
                  <div className="space-y-2">
                    <Link to="/profile" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <FaUser className="h-5 w-5" />
                      <span>Mi Perfil</span>
                    </Link>
                    <Link to="/orders" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <FaHistory className="h-5 w-5" />
                      <span>Mis Pedidos</span>
                    </Link>
                    <Link to="/wishlist" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                      <FaHeart className="h-5 w-5" />
                      <span>Lista de Deseos</span>
                    </Link>
                    {user?.role === ROLE.ADMIN && (
                      <Link to="/admin-panel/all-products" className="flex items-center space-x-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg">
                        <FaCog className="h-5 w-5" />
                        <span>Panel de Administración</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Espaciador para el header fijo */}
      <div className="h-28 lg:h-32" />
    </>
  );
};

export default ProfessionalHeader;
