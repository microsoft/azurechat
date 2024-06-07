## QChat Style Guide

This style guide ensures consistency and readability across the QChat codebase. The project uses Prettier for automatic code formatting. Below are the specific configurations and guidelines to follow:

### General Formatting

- **Tab Width:** Use 2 spaces for indentation.
- **Tabs:** Do not use tabs for indentation.
- **Semicolons:** Do not use semicolons at the end of statements.
- **Quotes:** Use double quotes for strings.
- **JSX Quotes:** Use double quotes for JSX attributes.
- **Trailing Commas:** Include trailing commas where valid in ES5 (objects, arrays, etc.).
- **Bracket Spacing:** Include spaces between brackets in object literals.
- **Bracket Same Line:** Place `>` of multi-line JSX elements on a new line.
- **Arrow Function Parentheses:** Avoid parentheses when arrow functions have a single argument.
- **Quote Properties:** Use quotes around object properties only when necessary.
- **Print Width:** Wrap lines that exceed 120 characters.
- **Plugins:** Use `prettier-plugin-tailwindcss` for Tailwind CSS class sorting and formatting.

### Example Configuration

Below is the Prettier configuration used in the project:

```javascript
module.exports = {
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: false,
  jsxSingleQuote: false,
  trailingComma: "es5",
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: "avoid",
  plugins: ["prettier-plugin-tailwindcss"],
  quoteProps: "as-needed",
  printWidth: 120,
};
```

### Additional Guidelines

- **File Naming:** Use kebab-case for file names (e.g., `my-component.js`).
- **Component Naming:** Use PascalCase for React components (e.g., `MyComponent`).
- **Variable Naming:** Use camelCase for variable names (e.g., `myVariable`).
- **CSS Class Naming:** Follow the BEM (Block Element Modifier) convention if applicable.
- **Commenting:** Use `//` for single-line comments and `/* */` for multi-line comments. Ensure comments are meaningful and explain the purpose of the code.
- **File Organization:** Group related files together. For example, keep all components in a `components` directory, utilities in a `utils` directory, etc.
- **Imports:** Group imports logically, starting with external libraries, followed by internal modules. Use absolute imports where possible for better readability.

### Running Prettier

To format your code with Prettier, run the following command:

```bash
npx prettier --write .
```

### Enforcing the Style Guide

To ensure that all code adheres to this style guide, Prettier is integrated with Husky to enforce formatting on pre-commit hooks. This ensures that only properly formatted code is committed to the repository.

### Conclusion

Adhering to this style guide helps maintain a consistent codebase that is easier to read and maintain. Thank you for following these guidelines and contributing to the QChat project.
