/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },

    env: {
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },

    serverExternalPackages: ["@prisma/client", "prisma", "sass"],

    reactStrictMode: true,
};

export default nextConfig;
