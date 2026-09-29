import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Toaster } from '@/components/ui/Toaster';

/** Renderiza com um QueryClient novo (sem novas tentativas) e o Toaster, como no app. */
export function renderizar(ui: React.ReactElement) {
  const cliente = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return {
    cliente,
    ...render(
      <QueryClientProvider client={cliente}>
        <Toaster>{ui}</Toaster>
      </QueryClientProvider>,
    ),
  };
}
