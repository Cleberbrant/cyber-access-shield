import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["node_modules", "dist"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            reportsDirectory: "coverage",
            include: ["src/utils/**/*.ts", "src/lib/**/*.ts"],
            exclude: [
                "src/**/*.test.ts",
                "src/**/*.spec.ts",
                "src/**/__tests__/**",
                "src/integrations/**",
            ],
        },
    },
});
