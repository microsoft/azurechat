module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:tailwindcss/recommended",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  plugins: ["@typescript-eslint", "react-hooks", "tailwindcss"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.eslint.json"],
    tsconfigRootDir: __dirname,
  },
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: false }],
    semi: ["error", "never"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        args: "all",
        argsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "no-magic-numbers": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "tailwindcss/no-custom-classname": [
      "warn",
      {
        callees: ["classnames", "clsx", "ctl", "cva", "tv"], // Ensure cva is included
        config: "src/tailwind.config.js", // Adjusted to match your project structure
        cssFiles: ["src/app/**/*.css"], // Focus on your CSS files, adjust the pattern as needed
        cssFilesRefreshRate: 5000, // Default, adjust based on performance needs
        skipClassAttribute: false, // Keep this false to lint class attributes
        whitelist: [
          "destructive",
          "success",
          "text-foreground",
          "bg-background",
          "text-muted-foreground",
          "border-accent",
          "text-darkAltButton",
          "text-siteTitle",
          "bg-backgroundShade",
          "border-darkAltButton",
          "text-primary",
          "bg-altBackground",
          "loader",
        ],
      },
    ],
    "@typescript-eslint/no-parameter-properties": 0,
    "@typescript-eslint/no-floating-promises": ["error"],
    "@typescript-eslint/array-type": [0, "generic"],
    "@typescript-eslint/no-use-before-define": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/ban-ts-comment": 0,
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    "require-await": "warn",
    "@typescript-eslint/promise-function-async": [
      "warn",
      {
        allowedPromiseNames: ["Thenable"],
        checkArrowFunctions: true,
        checkFunctionDeclarations: true,
        checkFunctionExpressions: true,
        checkMethodDeclarations: true,
      },
    ],
    "no-console": "warn",
  },
}
