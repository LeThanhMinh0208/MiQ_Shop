import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App.jsx';

// Sentry is a no-op when VITE_SENTRY_DSN is not defined in .env.local.
// Set it to your project DSN to enable frontend error monitoring.
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    // Capture 10% of transactions in production to control volume.
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    // Never send auth cookies or tokens to Sentry.
    beforeSend(event) {
      if (event.request?.cookies) event.request.cookies = '[REDACTED]';
      if (event.request?.headers?.Authorization) {
        event.request.headers.Authorization = '[REDACTED]';
      }
      return event;
    },
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
  // Forward React Query errors to Sentry
  queryCache: undefined,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Sentry.ErrorBoundary fallback={<p style={{ padding: '2rem', color: 'red' }}>Đã xảy ra lỗi. Vui lòng tải lại trang.</p>}>
        <App />
      </Sentry.ErrorBoundary>
    </QueryClientProvider>
  </StrictMode>
);
