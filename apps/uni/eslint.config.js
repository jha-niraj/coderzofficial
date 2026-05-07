import { nextJsConfig } from "@repo/eslint-config/next-js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
    ...nextJsConfig,
    {
        rules: {
            "turbo/no-undeclared-env-vars": ["warn", { cwd: path.join(__dirname, "../..") }],
        },
    },
];
