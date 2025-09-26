import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUser } from '../../store/userSlice';
import './AuthSuccess.css';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (!token) {
      setError('No se recibió token de autenticación');
      setLoading(false);
      return;
    }

    // Guardar token en localStorage
    localStorage.setItem('token', token);

    // Obtener información del usuario
    fetchUserInfo(token, provider);
  }, [searchParams]);

  const fetchUserInfo = async (token, provider) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userInfo = data.data;

        // Actualizar Redux store
        dispatch(setUser({
          _id: userInfo._id,
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role,
          profilePic: userInfo.profilePic,
          provider: userInfo.provider || provider
        }));

        // Redirigir después de un breve delay
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError('Error al obtener información del usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-success-page">
        <div className="auth-success-container">
          <div className="success-card">
            <div className="loading-animation">
              <div className="spinner"></div>
            </div>
            <h2>¡Autenticación exitosa!</h2>
            <p>Estamos configurando tu sesión...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-success-page">
        <div className="auth-success-container">
          <div className="error-card">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h2>Error de autenticación</h2>
            <p>{error}</p>
            <button
              className="retry-button"
              onClick={() => navigate('/login')}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-success-page">
      <div className="auth-success-container">
        <div className="success-card">
          <div className="success-animation">
            <div className="checkmark">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h2>¡Bienvenido!</h2>
          <p>Tu autenticación fue exitosa. Serás redirigido en unos segundos...</p>
          <div className="redirect-indicator">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
