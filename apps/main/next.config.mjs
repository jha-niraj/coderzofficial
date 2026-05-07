/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true
    },
    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader'
        });

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
                fs: false,
                path: false,
                stream: false,
            }
        }

        // Suppress import.meta warning from unpdf (third-party package limitation)
        config.ignoreWarnings = [
            ...(config.ignoreWarnings ?? []),
            { module: /unpdf/ },
        ];

        return config;
    },
    reactStrictMode: true
};

export default nextConfig;