/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  // External images configuration (Unsplash, avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  
  // Security headers for production
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
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
  
  // Webpack config for Solana/Anchor compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Ignore optional dependencies that cause build issues
    // pino-pretty is an optional dev dependency of pino
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
    };
    
    // Ignore module resolution for optional dependencies
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pino-pretty$/,
      })
    );
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
    };
    
    return config;
  },
  
  // Compress responses
  compress: true,
  
  // Production optimizations
  swcMinify: true,
  
  // Ignore build errors from wallet adapters (they have some TS issues)
  typescript: {
    // ⚠️ Only use in development if you're sure about your code
    // ignoreBuildErrors: false,
  },
  eslint: {
    // ⚠️ Only use in development if you're sure about your code
    // ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
