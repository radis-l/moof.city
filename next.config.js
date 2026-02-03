/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-require-imports */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // Performance optimizations
  compress: true, // Enable gzip compression
  
  // Production optimizations
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'], // Modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Mobile-first sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Server external packages (moved from experimental)
  serverExternalPackages: ['better-sqlite3'],

  // Experimental features for better performance
  experimental: {
    // Enable React 18 concurrent features
    esmExternals: true,
    
    // Optimize server React rendering
    optimizeServerReact: true,
    
    // Optimize font loading
    optimizePackageImports: [
      '@/components/ui',
      '@/components/layout',
      'lottie-react'
    ],
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      // Cache static assets
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Exclude SQLite from client bundle and production server
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        'better-sqlite3': false,
      }
    }

    // Exclude SQLite from server build in production (Vercel)
    if (isServer && process.env.NODE_ENV === 'production') {
      config.externals = config.externals || []
      config.externals.push('better-sqlite3')
    }

    // Add performance hints
    config.performance = {
      maxAssetSize: 350000, // 350KB (target size)
      maxEntrypointSize: 350000, // 350KB
      hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
    }

    // Optimize chunks
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            lottie: {
              name: 'lottie',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](lottie-react)[\\/]/,
              priority: 30,
            },
            analytics: {
              name: 'analytics',
              chunks: 'all',
              test: /[\\/]src[\\/]lib[\\/](analytics)[\\/]/,
              priority: 25,
            }
          }
        }
      }
    }

    return config
  },
}

module.exports = withBundleAnalyzer(nextConfig)