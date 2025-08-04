// client/src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux"; // Import Provider for Redux
import { PersistGate } from "redux-persist/integration/react"; // Import PersistGate for Redux Persist

import { store, persistor } from "@/store"; // Redux store and persistor
import { AuthProvider } from "@/context/AuthContext"; // Your new Auth Context
import { NotificationProvider } from "@/context/NotificationContext"; // Your new Notification Context

import "./index.css";
import App from "./App.jsx";

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
    {/* 1. Redux Provider: This makes your Redux store available to your entire app.
      PersistGate ensures your app doesn't render until the Redux state is rehydrated from storage. 
    */}
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {/* 2. BrowserRouter: This is the foundation for all your routing.
         */}
        <BrowserRouter>
          {/* 3. QueryClientProvider: This makes the React Query cache available, 
            allowing you to fetch, cache, and update server data easily. 
          */}
          <QueryClientProvider client={queryClient}>
            {/* 4. AuthProvider: This is our new context for handling user authentication. 
              It provides the user object, login/logout functions, and authentication state. 
            */}
            <AuthProvider>
              {/* 5. NotificationProvider: This context will be used to show global toast notifications. 
                It's a great place to handle success or error messages from API calls. 
              */}
              <NotificationProvider>
                <App />
              </NotificationProvider>
            </AuthProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </StrictMode>
);
