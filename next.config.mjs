/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'img.logo.dev' },
      { protocol: 'https', hostname: 'www.google.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.reddit.com",
              'frame-src https://www.reddit.com https://embed.reddit.com',
              "style-src 'self' 'unsafe-inline' https://embed.reddit.com",
              "img-src 'self' data: blob: https: http:",
              "connect-src 'self' https:",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
