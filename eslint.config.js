import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import js from "@eslint/js";

export default tseslint.config(
  js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["src/**/*.astro"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".astro"],
      },
    },
  },
);
