import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
            };
        }

        // Disable webpack cache
        config.cache = false;

        return config;
    },
    // Environment variables configuration
    env: {
        NEXT_PUBLIC_RINGS: process.env.NEXT_PUBLIC_RINGS,
        NEXT_PUBLIC_QUADRANTS: process.env.NEXT_PUBLIC_QUADRANTS,
    },
};

export default nextConfig;