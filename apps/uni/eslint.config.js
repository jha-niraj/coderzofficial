import { nextJsConfig } from "@repo/eslint-config/next-js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
    ...nextJsConfig,
    {
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/.open-next/**",
            "**/.wrangler/**",
            "**/dist/**",
            "**/build/**",
            "**/*.min.js",
            "**/public/**",
        ],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }],
            "turbo/no-undeclared-env-vars": ["warn", { cwd: path.join(__dirname, "../..") }],
        },
    },
];
