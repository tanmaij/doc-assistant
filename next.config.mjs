/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fullySpecified = false;
    }

    config.module.rules.push({
      test: /node_modules\/langchain/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['onnxruntime-node'],
  },
  distDir: 'build',
};

export default nextConfig;