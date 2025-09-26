import React from 'react';
import { APP_CONFIG } from '../config/appConfig';

const Footer = () => {
  const { business } = APP_CONFIG;

  return (
    <footer className='bg-neutral-900 text-white'>
      <div className='container-custom'>
        {/* Contenido principal del footer */}
        <div className='py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {/* Información de la empresa */}
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div className='w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center'>
                <span className='text-white font-bold text-lg'>{business.name.charAt(0)}</span>
              </div>
              <span className='text-xl font-bold'>{business.name}</span>
            </div>
            <p className='text-neutral-300 text-sm leading-relaxed'>{business.description}</p>
            <div className='flex space-x-4'>
              <a href="#" className='text-neutral-400 hover:text-primary-400 transition-colors'>
                <span className='sr-only'>Facebook</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'/>
                </svg>
              </a>
              <a href="#" className='text-neutral-400 hover:text-primary-400 transition-colors'>
                <span className='sr-only'>Instagram</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.928-.875-1.418-2.026-1.418-3.323s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244z'/>
                </svg>
              </a>
              <a href="#" className='text-neutral-400 hover:text-primary-400 transition-colors'>
                <span className='sr-only'>Twitter</span>
                <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z'/>
                </svg>
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Enlaces Rápidos</h3>
            <ul className='space-y-2'>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Sobre Nosotros</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Productos</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Ofertas</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Blog</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Carreras</a></li>
            </ul>
          </div>

          {/* Soporte */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Soporte</h3>
            <ul className='space-y-2'>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Centro de Ayuda</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Envíos</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Devoluciones</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Términos de Servicio</a></li>
              <li><a href="#" className='text-neutral-300 hover:text-white transition-colors text-sm'>Privacidad</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>Contacto</h3>
            <div className='space-y-3'>
              <div className='flex items-center space-x-3'>
                <div className='w-5 h-5 text-primary-400'>
                  <svg fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z'/>
                    <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z'/>
                  </svg>
                </div>
                <span className='text-neutral-300 text-sm'>{business.contact.email}</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-5 h-5 text-primary-400'>
                  <svg fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z'/>
                  </svg>
                </div>
                <span className='text-neutral-300 text-sm'>{business.contact.phone}</span>
              </div>
              <div className='flex items-center space-x-3'>
                <div className='w-5 h-5 text-primary-400'>
                  <svg fill='currentColor' viewBox='0 0 20 20'>
                    <path fillRule='evenodd' d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z' clipRule='evenodd'/>
                  </svg>
                </div>
                <span className='text-neutral-300 text-sm'>{business.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className='border-t border-neutral-800'></div>

        {/* Copyright */}
        <div className='py-6 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0'>
          <p className='text-neutral-400 text-sm'>
            © {new Date().getFullYear()} {business.name}. Todos los derechos reservados.
          </p>
          <div className='flex items-center space-x-4'>
            <span className='text-neutral-400 text-sm'>Hecho con ❤️ para nuestros clientes</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;