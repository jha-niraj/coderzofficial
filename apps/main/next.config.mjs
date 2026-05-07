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

        return config;
    },
    reactStrictMode: true
};

export default nextConfig;