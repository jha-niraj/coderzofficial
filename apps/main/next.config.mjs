/** @type {import('next').NextConfig} */
const nextConfig = {
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
    serverExternalPackages: ["@prisma/client", "prisma", "@react-pdf/renderer", "mammoth"],

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

        return config;
    },
    reactStrictMode: true,
};

export default nextConfig;
