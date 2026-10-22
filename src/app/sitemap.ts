import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://koyomi.ink',
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
