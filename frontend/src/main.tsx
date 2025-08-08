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
            <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', backgroundColor: '#f0f0f0' }}>
              <h3>Environment Variables (Debug)</h3>
              <p><strong>NODE_ENV:</strong> {import.meta.env.NODE_ENV}</p>
              <p><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL}</p>
              <p><strong>VITE_SOCKET_URL:</strong> {import.meta.env.VITE_SOCKET_URL}</p>
              <p><strong>MODE:</strong> {import.meta.env.MODE}</p>
              <p><strong>BASE_URL:</strong> {import.meta.env.BASE_URL}</p>
            </div>
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