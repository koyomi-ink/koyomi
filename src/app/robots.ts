import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/app/', '/portal/', '/onboarding/', '/auth/', '/api/'],
    },

    sitemap: 'https://koyomi.ink/sitemap.xml',
  };
}
