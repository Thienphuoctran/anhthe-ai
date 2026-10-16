/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      "onnxruntime-node$": false,
    };

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    if (config.optimization && Array.isArray(config.optimization.minimizer)) {
      config.optimization.minimizer.forEach((minimizer) => {
        if (minimizer && minimizer.options) {
          minimizer.options.exclude = /\.mjs$/;
        }
      });
    }

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /onnxruntime-web/ },
    ];

    return config;
  },
};

export default nextConfig;
