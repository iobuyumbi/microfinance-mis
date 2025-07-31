import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import slices
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import groupReducer from "./slices/groupSlice";
import loanReducer from "./slices/loanSlice";
import transactionReducer from "./slices/transactionSlice";
import savingsReducer from "./slices/savingsSlice";
import meetingReducer from "./slices/meetingSlice";
import notificationReducer from "./slices/notificationSlice";
import settingsReducer from "./slices/settingsSlice";
import uiReducer from "./slices/uiSlice";

// Persist configuration for auth
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "token", "isAuthenticated"],
};

// Persist configuration for settings
const settingsPersistConfig = {
  key: "settings",
  storage,
  whitelist: ["theme", "language", "currency"],
};

// Create persisted reducers
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedSettingsReducer = persistReducer(
  settingsPersistConfig,
  settingsReducer
);

// Configure store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducer,
    group: groupReducer,
    loan: loanReducer,
    transaction: transactionReducer,
    savings: savingsReducer,
    meeting: meetingReducer,
    notification: notificationReducer,
    settings: persistedSettingsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// Create persistor
export const persistor = persistStore(store);

// Export types for TypeScript (if using .ts extension)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
