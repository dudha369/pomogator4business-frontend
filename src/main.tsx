import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { TelegramRootProvider } from './providers/TelegramRootProvider';
import { LanguageProvider } from './providers/LanguageProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from '@/shared/ui/loading/ErrorBoundary';
import { queryClient } from '@/shared/api/queryClient';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TelegramRootProvider>
        <LanguageProvider>
          <ThemeProvider>
            <RouterProvider router={router} />
          </ThemeProvider>
        </LanguageProvider>
      </TelegramRootProvider>
    </QueryClientProvider>
  </ErrorBoundary>,
);
