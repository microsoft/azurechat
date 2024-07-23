# QChat Style Guide

This style guide ensures consistency and readability across the QChat codebase. The project uses Prettier for automatic code formatting. Below are the specific configurations and guidelines to follow:

## General Formatting

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

## Additional Guidelines

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

## Code Style Guide: React Patterns and Best Practices

### Skeleton of a Provider

When creating a context provider in React, follow this basic structure to ensure consistency and readability:

1. **Create Context**: Use `createContext` to initialize a new context.
2. **Define Hook**: Create a custom hook (e.g., `useExampleHook`) that manages the state and logic. This hook should:
   - Use `useReducer` or `useState` for state management.
   - Fetch data with `useEffect` if necessary.
   - Provide functions to manipulate the state (e.g., `setItem`, `clearError`).
3. **Provider Component**: Define a provider component (e.g., `ExampleProvider`) that uses the custom hook to get the state and functions, and passes them to `ExampleContext.Provider`.
4. **Consume Context**: Use the `useContext` hook to consume the context in child components.

Skeleton of a Context:

```tsx
import logger from "@/features/insights/app-insights";
import { ActionBase } from "@/lib/utils";
import {
  useReducer,
  useEffect,
  useContext,
  createContext,
  PropsWithChildren,
} from "react";

type ExampleProviderProps = {
  someData: Item[];
};

type State = {
  data: Item[];
  item?: Item;
  setItem: (item: Item) => void;
  error: string | null;
  clearError: () => void;
};

// internal hook to encapsulate the context's logic
const useExampleContextHook = (props?: ExampleProviderProps): State => {
  const initialState: State = {
    data: props?.someData || [],
    item: undefined,
    setItem: () => {},
    error: null,
    clearError: () => {},
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  // Fetch initial data if necessary
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/data", { method: "GET" });
      if (!response.ok)
        dispatch({ type: "SET_ERROR", payload: "Error fetching data" });
      const result = await response.json();
      dispatch({ type: "SET_DATA", payload: result });
    };

    fetchData().catch(logger.error);
  }, []);

  // Additional logic and effects
  // ...

  // Expose actions accessible by consumers
  const setItem = async (item: Item): Promise<void> => {
    try {
      const response = await fetch("/api/data", {
        method: "POST",
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("Error setting item");
      dispatch({ type: "SET_ITEM", payload: item });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: JSON.stringify(err) });
    }
  };
  const clearError = (): void => dispatch({ type: "SET_ERROR", payload: null });

  return { ...state, setItem, clearError };
};

type ExampleContextDefinition = ReturnType<typeof useExampleContextHook>;
const ExampleContext = createContext<ExampleContextDefinition | null>(null);

// public hook to interact with the context
export const useExampleContext = (): ExampleContextDefinition => {
  const contextValue = useContext(ExampleContext);
  if (contextValue === null)
    throw Error("ExampleContext has not been Provided!");
  return contextValue;
};

export default function ExampleProvider({
  children,
  someData,
}: PropsWithChildren<ExampleProviderProps>): JSX.Element {
  const value = useExampleContextHook({ someData });
  return (
    <ExampleContext.Provider value={value}>{children}</ExampleContext.Provider>
  );
}

type ACTION =
  | ActionBase<"SET_DATA", { payload: Item[] }>
  | ActionBase<"SET_ITEM", { payload: Item }>
  | ActionBase<"SET_ERROR", { payload: string | null }>;

// internal reducer to manage the context's state
function reducer(state: State, action: ACTION): State {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: action.payload };
    case "SET_ITEM":
      return { ...state, item: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
```

Usage of Provider & Context

```tsx
// Provider usage:
// layout.tsx:
export async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const someDataResult = await FetchSomeData();
  const data = someDataResult.status === "OK" ? someDataResult.response : [];

  return (
    <ExampleProvider someData={data}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </ExampleProvider>
  );
}
```

> **Note :** Since `Layout` is a RSC (React Server Component), a backend function `FetchSomeData` can be called directly.

```tsx
// Consumer usage:
// SomeComponent.tsx:
import { useExampleContext } from "~/example-context";

export const SomeComponent = (): JSX.Element => {
  const { data, item, setItem, error, clearError } = useExampleContext();

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      {item && <div>{item.name}</div>}
      {error && <div>{error}</div>}
      <Button onClick={() => setItem({ id: "1", name: "Item 1" })}>
        Set Item
      </Button>
      <Button onClick={clearError}>Clear Error</Button>
    </div>
  );
};
```

#### Fetching Data with useEffect

- Use `useEffect` for side effects such as data fetching.
- Place the fetch call inside `useEffect` to ensure it runs at the correct time in the component's lifecycle.
- Include a dependency array to control when the effect runs.

Example:

```jsx
useEffect(() => {
  fetch("api/data")
    .then((result) => {
      // Handle the result
    })
    .catch((error) => {
      // Handle the error
    });
}, []); // Empty array means this effect runs once after the initial render
```

#### When to Use useCallback

- Use `useCallback` to memoize callback functions. This is particularly useful when passing callbacks as props to child components that rely on reference equality to prevent unnecessary renders.
- It's beneficial in performance-sensitive components or those that re-render often.

Example:

```jsx
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]); // Dependencies array: `useCallback` will return the same function instance until `a` or `b` changes
```

### Interact with backend features

There are 2 ways of interacting with backend features, either via an api route or by calling a backend function directly. It's important to use the right way depending on the situation:

- **React Server Components** (aka. RSC): Directly call backend functions.
- **Client-Side Components** (with `"use client"` directive): Use API routes to interact with the backend, typically wrapped in a `useEffect`

> **Note :** Understanding and applying these patterns and practices can enhance code readability, maintainability, and performance.

### Enforcing the Style Guide

To ensure that all code adheres to this style guide, Prettier is integrated with Husky to enforce formatting on pre-commit hooks. This ensures that only properly formatted code is committed to the repository.

### Conclusion

Adhering to this style guide helps maintain a consistent codebase that is easier to read and maintain. Thank you for following these guidelines and contributing to the QChat project.
