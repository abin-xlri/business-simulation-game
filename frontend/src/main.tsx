import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

// Debug environment variables
console.log('Environment check:', {
  NODE_ENV: import.meta.env.NODE_ENV,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  MODE: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>Error: Root element not found</h1>
      <p>The application cannot start because the root element is missing.</p>
      <p>Please check the HTML structure.</p>
    </div>
  `;
} else {
  const Bootstrap = () => {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <>
              <Toaster position="top-center" />
              <App />
            </>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  };

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Bootstrap />
    </React.StrictMode>,
  )
} 