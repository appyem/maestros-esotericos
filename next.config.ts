import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ==========================================
  // SEGURIDAD - HEADERS
  // ==========================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Protección contra clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Protección contra MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control de referencia
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy (CSP) - Protección contra XSS
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: blob:;
              font-src 'self' data:;
              connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
              frame-ancestors 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          // Permissions Policy - Control de APIs del navegador
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // ==========================================
  // SEGURIDAD - IMÁGENES
  // ==========================================
  images: {
    // Solo permitir imágenes de dominios específicos (añadir más según necesidad)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.firebaseio.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
    ],
    // Formato de imagen optimizado
    formats: ['image/avif', 'image/webp'],
  },

  // ==========================================
  // SEGURIDAD - COMPILACIÓN
  // ==========================================
  // Ocultar indicador de powered-by
  poweredByHeader: false,

  // ==========================================
  // RENDIMIENTO
  // ==========================================
  // Compresión de respuestas
  compress: true,

  // ==========================================
  // DESARROLLO
  // ==========================================
  // React Strict Mode (ayuda a detectar problemas)
  reactStrictMode: true,
};

export default nextConfig;
