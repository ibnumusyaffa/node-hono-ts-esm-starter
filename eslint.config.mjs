// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier"
import eslintPluginUnicorn from "eslint-plugin-unicorn"
import vitest from "@vitest/eslint-plugin";
import sonarjs from "eslint-plugin-sonarjs";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended, //point A
  sonarjs.configs.recommended,
  {
    plugins: {
      unicorn: eslintPluginUnicorn,
      vitest
    },
    rules: {
      ...eslintPluginUnicorn.configs.recommended.rules, //point B
      ...vitest.configs.recommended.rules,
      "unicorn/prevent-abbreviations": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "unicorn/filename-case": "off",
    },
  },
  eslintConfigPrettier
)
