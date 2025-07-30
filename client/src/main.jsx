// client/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter for routing
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import QueryClient and QueryClientProvider for data fetching
// If you implement a global Socket.IO context, you'd import it here:
// import { SocketProvider } from './contexts/SocketContext';
// import socketService from './lib/socket'; // You don't usually connect the socket here directly

import "./index.css"; // Your global CSS
import App from "./App.jsx"; // Your main application component

// Create a client for React Query
// This client manages the cache and state for your queries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configure default options for queries here
      // For example, data remains fresh for 5 minutes by default
      staleTime: 1000 * 60 * 5, // 5 minutes
      // Do not refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Retry failed queries up to 3 times
      retry: 3,
    },
    mutations: {
      // Configure default options for mutations here if needed
      // e.g., onError, onSuccess callbacks
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* BrowserRouter provides routing capabilities to all components within it */}
    <BrowserRouter>
      {/* QueryClientProvider makes the queryClient instance available to all components using @tanstack/react-query hooks */}
      <QueryClientProvider client={queryClient}>
        {/*
          If you decide to create a React Context for your `socketService`,
          you would wrap your App component with it here, e.g.:
          <SocketProvider value={socketService}>
            <App />
          </SocketProvider>
          Otherwise, you will import `socketService` directly into components
          that need to interact with the real-time functionality.
        */}
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
