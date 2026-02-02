import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactNativePlugin from "eslint-plugin-react-native";

export default [
  {
    ignores: [
      "node_modules/",
      ".expo/",
      "dist/",
      "build/",
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["src/**/*.{ts,tsx}"],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },

    plugins: {
      react: reactPlugin,
      "react-native": reactNativePlugin,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      /* -----------------------------
         React
      ----------------------------- */
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",

      /* -----------------------------
         React Native (RELAXED)
      ----------------------------- */
      "react-native/no-inline-styles": "off",
      "react-native/no-color-literals": "off",
      "react-native/sort-styles": "off",

      /* -----------------------------
         TypeScript (Practical)
      ----------------------------- */
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "warn",
        { "ts-ignore": "allow-with-description" },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
