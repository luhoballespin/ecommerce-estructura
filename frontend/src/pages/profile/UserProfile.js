import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setUserDetails } from '../../store/userSlice';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaShoppingBag,
  FaHeart,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaShieldAlt,
  FaCreditCard,
  FaTruck,
  FaStar,
  FaGift
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import SummaryApi from '../../common';
import displayINRCurrency from '../../helpers/displayCurrency';

const UserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduxUser = useSelector(state => state?.user?.user);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    favoriteCategories: [],
    recentOrders: []
  });

  // Verificar autenticación y cargar datos del usuario
  useEffect(() => {
    const token = localStorage.getItem('token');

    // Verificar si hay token O si hay usuario en Redux
    if (!token && !reduxUser?._id) {
      console.log('No hay token ni usuario en Redux para acceder al perfil');
      toast.error('Debes iniciar sesión para acceder a tu perfil');
      navigate('/login');
      return;
    }

    // Si hay usuario en Redux pero no hay token, intentar restaurar el token
    if (!token && reduxUser?._id) {
      console.log('Usuario en Redux pero sin token, intentando restaurar...');
      // En este caso, asumimos que el usuario está autenticado pero el token se perdió
      // Intentamos cargar los datos de todas formas
    }

    console.log('Usuario autenticado, cargando perfil...');
    fetchUserData();
  }, [navigate, reduxUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Si no hay token pero hay usuario en Redux, usar datos de Redux
      if (!token && reduxUser?._id) {
        console.log('Usando datos de usuario de Redux');
        setUser(reduxUser);
        setFormData({
          name: reduxUser.name || '',
          email: reduxUser.email || '',
          phone: reduxUser.phone || '',
          address: reduxUser.address || {}
        });
        await fetchUserStats();
        setLoading(false);
        return;
      }

      const response = await fetch(SummaryApi.current_user.url, {
        method: SummaryApi.current_user.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || {}
        });

        // Cargar estadísticas del usuario
        await fetchUserStats();
      } else {
        if (data.message === 'Token de acceso requerido' || response.status === 401) {
          // Token inválido o expirado, limpiar y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
          navigate('/login');
          return;
        }
        toast.error('Error al cargar datos del usuario');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Simular datos de estadísticas
      setStats({
        totalOrders: 12,
        totalSpent: 1250.75,
        favoriteCategories: ['Electrónicos', 'Ropa', 'Hogar'],
        recentOrders: [
          {
            id: 'ORD-001',
            date: '2024-09-20',
            total: 89.99,
            status: 'Entregado',
            items: 2
          },
          {
            id: 'ORD-002',
            date: '2024-09-15',
            total: 156.50,
            status: 'En tránsito',
            items: 3
          },
          {
            id: 'ORD-003',
            date: '2024-09-10',
            total: 45.99,
            status: 'Entregado',
            items: 1
          }
        ]
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      // Si no hay token, actualizar solo localmente
      if (!token) {
        console.log('No hay token, actualizando perfil localmente');
        // Crear el objeto de usuario actualizado
        const updatedUser = {
          ...reduxUser,
          ...formData
        };

        // Actualizar el estado local del componente
        setUser(updatedUser);

        // Actualizar el estado de Redux para que persista
        dispatch(setUserDetails(updatedUser));

        setEditing(false);
        toast.success('Perfil actualizado localmente. Los cambios se sincronizarán cuando inicies sesión nuevamente.');
        return;
      }

      const response = await fetch(SummaryApi.updateUser.url, {
        method: SummaryApi.updateUser.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
        setEditing(false);
        toast.success('Perfil actualizado exitosamente');
      } else {
        if (data.message === 'Token de acceso requerido' || response.status === 401) {
          // Token inválido o expirado, limpiar y redirigir al login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sesión expirada. Por favor, inicia sesión nuevamente');
          navigate('/login');
          return;
        }
        toast.error(data.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error de conexión');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || {}
    });
    setEditing(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(SummaryApi.logout_user.url, {
        method: SummaryApi.logout_user.method,
        credentials: 'include'
      });

      toast.success('Sesión cerrada exitosamente');
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudieron cargar los datos del usuario</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600">Gestiona tu información y preferencias</p>
            </div>

            <div className="flex space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <FaSave className="h-4 w-4" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <FaTimes className="h-4 w-4" />
                    <span>Cancelar</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FaEdit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Información del perfil */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información personal */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaUser className="h-5 w-5 mr-2 text-blue-600" />
                Información Personal
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.phone || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <p className="text-gray-900 py-2 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 mr-2 text-green-600" />
                Dirección
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calle
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.address?.street || 'No especificada'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.address?.city || 'No especificada'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.address?.state || 'No especificado'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{user.address?.zipCode || 'No especificado'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pedidos recientes */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaHistory className="h-5 w-5 mr-2 text-purple-600" />
                Pedidos Recientes
              </h2>

              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString('es-MX')} • {order.items} productos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{displayINRCurrency(order.total)}</p>
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${order.status === 'Entregado'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'En tránsito'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Ver todos los pedidos
                </button>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1 space-y-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Estadísticas</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaShoppingBag className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-600">Pedidos Totales</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.totalOrders}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaCreditCard className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-600">Total Gastado</span>
                  </div>
                  <span className="font-bold text-gray-900">{displayINRCurrency(stats.totalSpent)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaHeart className="h-5 w-5 text-red-600 mr-3" />
                    <span className="text-gray-600">Favoritos</span>
                  </div>
                  <span className="font-bold text-gray-900">{stats.favoriteCategories.length}</span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones Rápidas</h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaHistory className="h-5 w-5 text-blue-600" />
                  <span>Historial de Pedidos</span>
                </button>

                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaHeart className="h-5 w-5 text-red-600" />
                  <span>Lista de Deseos</span>
                </button>

                <button
                  onClick={() => navigate('/notifications')}
                  className="w-full flex items-center justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaBell className="h-5 w-5 text-yellow-600" />
                  <span>Notificaciones</span>
                </button>

                <button
                  onClick={() => navigate('/settings')}
                  className="w-full flex items-center justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaCog className="h-5 w-5 text-gray-600" />
                  <span>Configuración</span>
                </button>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Seguridad</h3>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/change-password')}
                  className="w-full flex items-center justify-start space-x-3 p-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <FaShieldAlt className="h-5 w-5 text-green-600" />
                  <span>Cambiar Contraseña</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-start space-x-3 p-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
