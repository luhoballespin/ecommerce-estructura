import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthError.css';

const AuthError = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const error = searchParams.get('error') || 'unknown_error';
  const message = searchParams.get('message') || 'Ocurrió un error durante la autenticación';

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'google_auth_failed':
        return 'La autenticación con Google falló. Por favor, intenta de nuevo.';
      case 'server_error':
        return 'Error del servidor. Por favor, intenta más tarde.';
      case 'access_denied':
        return 'Acceso denegado. Debes autorizar la aplicación para continuar.';
      case 'invalid_request':
        return 'Solicitud inválida. Por favor, intenta de nuevo.';
      case 'temporarily_unavailable':
        return 'El servicio está temporalmente no disponible. Intenta más tarde.';
      default:
        return message;
    }
  };

  const handleRetry = () => {
    navigate('/login');
  };

  const handleContactSupport = () => {
    // Aquí podrías abrir un modal de contacto o redirigir a una página de soporte
    window.open('mailto:support@mitienda.com?subject=Error de autenticación', '_blank');
  };

  return (
    <div className="auth-error-page">
      <div className="auth-error-container">
        <div className="error-card">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" />
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          <h2>Error de autenticación</h2>
          <p className="error-message">{getErrorMessage(error)}</p>

          <div className="error-details">
            <div className="error-code">
              <span className="label">Código de error:</span>
              <span className="value">{error}</span>
            </div>
            {message && (
              <div className="error-description">
                <span className="label">Detalles:</span>
                <span className="value">{message}</span>
              </div>
            )}
          </div>

          <div className="error-actions">
            <button
              className="retry-button primary"
              onClick={handleRetry}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Intentar de nuevo
            </button>

            <button
              className="contact-button secondary"
              onClick={handleContactSupport}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Contactar soporte
            </button>
          </div>

          <div className="help-section">
            <h3>¿Necesitas ayuda?</h3>
            <ul>
              <li>Asegúrate de tener conexión a internet</li>
              <li>Verifica que tu navegador permita cookies</li>
              <li>Intenta cerrar y abrir tu navegador</li>
              <li>Si el problema persiste, contacta a soporte</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
