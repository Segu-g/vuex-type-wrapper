import path from "path";
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
]

module.exports = defineConfig([
    // commonjs 
    {
        input: path.resolve(__dirname, "src/vuex-type-wrapper.ts"),
        output: {
            file: path.resolve(__dirname, pkg.main),
            format: "cjs",
            sourcemap: true,
            exports: "auto",
        },
        external,
        plugins: [
            typescript({
                tsconfig: path.resolve(__dirname, "tsconfig.json"),
                compilerOptions: {
                    declaration: true,
                    declarationDir: "./",
                    rootDir: path.resolve(__dirname, "src")
                }
            }),
        ],
    },
    // es module
    {
        input: path.resolve(__dirname, "src/vuex-type-wrapper.ts"),
        output: {
            file: path.resolve(__dirname, pkg.module),
            format: "module",
            sourcemap: true,
            exports: "auto",
        },
        external,
        plugins: [
            typescript({
                tsconfig: path.resolve(__dirname, "tsconfig.json"),
                compilerOptions: {
                    module: "esnext",
                    declaration: true,
                    declarationDir: "./",
                    rootDir: path.resolve(__dirname, "src")
                }
            })
        ]
    },
]);