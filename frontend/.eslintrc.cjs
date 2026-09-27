module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: ["react"],
  rules: {
    // Add any project-specific rules here
    "no-console": "warn",
    "react/react-in-jsx-scope": "off", // React 17+ no need to import React in every file
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};