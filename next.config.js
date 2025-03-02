/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the new App Router
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['localhost:3000']
    },
    // Enable optimized builds
    optimizePackageImports: ['react-icons']
  }
}

module.exports = nextConfig
