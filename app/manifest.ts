import { MetadataRoute } from 'next';
export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '나의 경조사 장부',
    short_name: '경조사',
    description: '스마트한 디지털 경조사 관리 서비스',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B0E14',
    theme_color: '#6366F1',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
