/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['chromadb'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/**',
      },
    ],
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize packages that don't work with webpack
      config.externals.push({
        'puppeteer': 'commonjs puppeteer',
        'chromadb': 'commonjs chromadb',
      });
    }

    // Ignore external URLs
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Ignore https imports
    config.externals.push(({ request }, callback) => {
      if (/^https?:/.test(request)) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    });

    return config;
  },
};

module.exports = nextConfig;
