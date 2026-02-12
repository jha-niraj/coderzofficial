import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...nextJsConfig,
    {
        ignores: [
            "**/node_modules/**",
            "**/.next/**",
            "**/dist/**",
            "**/build/**",
            "**/*.min.js",
            "**/public/**",
        ],
    },
    {
        rules: {
            // Temporarily allow these warnings for existing code
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", { 
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_" 
            }],
            "turbo/no-undeclared-env-vars": "warn",
        },
    },
];
