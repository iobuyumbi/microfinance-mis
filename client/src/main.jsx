// client/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { store, persistor } from "@/store";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext"; // Import the SocketProvider

import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner"; // Import the Toaster component

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data remains fresh for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Do not refetch on window focus by default (can be overridden)
      refetchOnWindowFocus: false,
      // Retry failed queries up to 3 times
      retry: 3,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Redux and Redux Persist setup */}
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* React Router for navigation */}
        <BrowserRouter>
          {/* React Query for data fetching */}
          <QueryClientProvider client={queryClient}>
            {/* The core authentication context for user data */}
            <AuthProvider>
              {/* The socket context for all real-time communication */}
              <SocketProvider>
                <App />
                {/* Sonner Toaster component for displaying notifications */}
                <Toaster />
              </SocketProvider>
            </AuthProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
