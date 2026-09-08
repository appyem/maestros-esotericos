import type { MetadataRoute } from 'next';

const BASE_URL = 'https://maestros-esotericos.com'; // Reemplazar con dominio real

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    '',
    '/servicios',
    '/maestros',
    '/como-funciona',
    '/preguntas-frecuentes',
    '/privacidad',
    '/terminos',
    '/contacto',
  ];

  return publicRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
