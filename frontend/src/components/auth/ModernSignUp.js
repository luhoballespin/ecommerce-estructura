import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaPhone,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaGoogle,
  FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { setUser } from '../../store/userSlice';
import './ModernSignUp.css';

const ModernSignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.user);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México'
    }
  });

  // Estados de UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Limpiar errores cuando cambien los campos
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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

    // Limpiar error de validación del campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    // Validar contraseña
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar teléfono (opcional pero si se proporciona debe ser válido)
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'El número de teléfono no es válido';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Registro exitoso! Bienvenido a Mi Tienda');
        dispatch(setUser(data.data));
        navigate('/');
      } else {
        toast.error(data.message || 'Error al registrarse');
        if (data.errors) {
          setValidationErrors(data.errors);
        }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirigir a Google OAuth para registro
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth/google`;
  };

  const passwordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStrengthText = (strength) => {
    switch (strength) {
      case 0:
      case 1: return 'Muy débil';
      case 2: return 'Débil';
      case 3: return 'Regular';
      case 4: return 'Fuerte';
      case 5: return 'Muy fuerte';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Únete a Mi Tienda</h1>
          <p className="text-gray-600">Crea tu cuenta y comienza a comprar</p>
        </div>

        {/* Formulario principal */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre completo */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${validationErrors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                    }`}
                  placeholder="Tu nombre completo"
                />
                {formData.name && !validationErrors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FaCheck className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaTimes className="h-4 w-4 mr-1" />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${validationErrors.email
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                    }`}
                  placeholder="tu@email.com"
                />
                {formData.email && !validationErrors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <FaCheck className="h-5 w-5 text-green-500" />
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaTimes className="h-4 w-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono (Opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${validationErrors.phone
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                    }`}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaTimes className="h-4 w-4 mr-1" />
                  {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${validationErrors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                    }`}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Indicador de fortaleza de contraseña */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength(formData.password))}`}
                        style={{ width: `${(passwordStrength(formData.password) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">
                      {getStrengthText(passwordStrength(formData.password))}
                    </span>
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaTimes className="h-4 w-4 mr-1" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${validationErrors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                    }`}
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaTimes className="h-4 w-4 mr-1" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FaMapMarkerAlt className="h-5 w-5 mr-2 text-blue-600" />
                Dirección (Opcional)
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                    Calle
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle y número"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ciudad"
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Estado"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="C.P."
                  />
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
              >
                <FaGoogle className="h-5 w-5 mr-2 text-red-500" />
                Registrarse con Google
              </button>
            </div>
          </form>

          {/* Enlaces */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Términos y condiciones */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Al registrarte, aceptas nuestros{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              Términos de Servicio
            </Link>{' '}
            y{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernSignUp;
