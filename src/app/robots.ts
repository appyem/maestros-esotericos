import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/servicios',
        '/maestros',
        '/como-funciona',
        '/preguntas-frecuentes',
        '/privacidad',
        '/terminos',
        '/contacto',
      ],
      disallow: [
        '/client/',
        '/master/',
        '/admin/',
        '/superadmin/',
        '/login',
        '/register',
        '/api/',
      ],
    },
    sitemap: 'https://maestros-esotericos.com/sitemap.xml', // Reemplazar con dominio real
  };
}
