/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },

    // Expose to the browser (needed for auth redirects and client-side auth calls)
    env: {
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },

    // These packages must NOT be bundled into the Cloudflare Worker bundle.
    // @prisma/client — migrated to Drizzle; remaining imports are type-only (erased at compile time)
    // @react-pdf/renderer — uses canvas rendering, not compatible with Workers bundling
    // mammoth — uses Node.js fs/Buffer for DOCX parsing; already on server actions only
    serverExternalPackages: ["@prisma/client", "prisma", "@react-pdf/renderer", "mammoth", "sass"],

    webpack: (config, { isServer }) => {
        config.module.rules.push({
            test: /\.md$/,
            use: "raw-loader",
        });

        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
                fs: false,
                path: false,
                stream: false,
            };
        }

        // Suppress import.meta warning from unpdf (third-party package limitation)
        config.ignoreWarnings = [
            ...(config.ignoreWarnings ?? []),
            { module: /unpdf/ },
        ];

        // Hard-exclude sass from the server bundle — no .scss files in this app,
        // but @excalidraw/excalidraw resolves sass as an optional peer dep which
        // inflates the Cloudflare Worker by ~4 MB.
        if (isServer) {
            config.externals = [
                ...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)),
                ({ request }, callback) => {
                    if (request === 'sass' || request?.startsWith('sass/')) {
                        return callback(null, `commonjs ${request}`);
                    }
                    callback();
                },
            ];
        }

        return config;
    },
    reactStrictMode: true,
};

export default nextConfig;
