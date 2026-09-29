import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { Toaster } from '@/components/ui/Toaster';

/** QueryClient de teste: sem novas tentativas. */
export const novoClienteDeTeste = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

/** Renderiza com o Toaster, como no app; o cliente pode vir com cache pronto. */
export function renderizar(ui: React.ReactElement, cliente = novoClienteDeTeste()) {
  return {
    cliente,
    ...render(
      <QueryClientProvider client={cliente}>
        <Toaster>{ui}</Toaster>
      </QueryClientProvider>,
    ),
  };
}
