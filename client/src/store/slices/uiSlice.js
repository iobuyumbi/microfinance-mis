import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebar: {
    isOpen: false,
    isCollapsed: false,
  },
  modals: {
    userForm: false,
    loanForm: false,
    groupForm: false,
    deleteConfirmation: false,
  },
  loading: {
    global: false,
    auth: false,
    data: false,
  },
  notifications: {
    unreadCount: 0,
    isOpen: false,
  },
  theme: "light",
  language: "en",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    collapseSidebar: (state) => {
      state.sidebar.isCollapsed = !state.sidebar.isCollapsed;
    },
    setSidebarOpen: (state, action) => {
      state.sidebar.isOpen = action.payload;
    },
    openModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = true;
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      state.modals[modalName] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },
    setLoading: (state, action) => {
      const { type, value } = action.payload;
      state.loading[type] = value;
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setNotificationCount: (state, action) => {
      state.notifications.unreadCount = action.payload;
    },
    toggleNotifications: (state) => {
      state.notifications.isOpen = !state.notifications.isOpen;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  collapseSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  closeAllModals,
  setLoading,
  setGlobalLoading,
  setNotificationCount,
  toggleNotifications,
  setTheme,
  setLanguage,
} = uiSlice.actions;

export default uiSlice.reducer;
