// src/test-utils.jsx
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a fresh client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
  });

// Custom render function with QueryClientProvider
export function renderWithProviders(ui, options = {}) {
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything + override the default render
export * from "@testing-library/react";
export { renderWithProviders as render };