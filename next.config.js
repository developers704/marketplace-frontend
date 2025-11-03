/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',

  // experimental: {
  //   // Required:
  //   appDir: true,
  // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '2pl.app.boundlesstechnologies.net',
      },
      // Removed invalid hostname entry that contained 'undefined'
      {
        protocol: 'http',
        hostname: '192.168.100.194',
        port: '5000',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'backend.vallianimarketplace.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },
  ...(process.env.NODE_ENV === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
  async redirects() {
    return [
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
    ];
  },
};
