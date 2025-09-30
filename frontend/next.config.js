/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para React (no Next.js, pero útil para futuras migraciones)
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_CLOUD_NAME_CLOUDINARY: process.env.REACT_APP_CLOUD_NAME_CLOUDINARY,
    REACT_APP_STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
  },
  // Configuración de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
