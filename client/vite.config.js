import path from "path";
import { defineConfig, loadEnv } from "vite"; // Import loadEnv
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Change to a function to access 'mode'
  // Load environment variables based on the current mode (development, production, etc.)
  // The third parameter '' ensures all VITE_ prefixed variables are loaded,
  // regardless of other prefixes (e.g., if you had a different prefix for some vars).
  const env = loadEnv(mode, process.cwd(), "");

  // Extract the target URL from the loaded environment variables
  // We'll use this for the proxy target
  const API_TARGET_URL = env.VITE_API_BASE_URL.replace("/api", ""); // Remove /api for the target

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // ADD THIS SERVER CONFIGURATION
    server: {
      proxy: {
        "/api": {
          target: API_TARGET_URL, // Use the dynamically loaded URL
          changeOrigin: true, // Needed for virtual hosted sites
          // rewrite: (path) => path.replace(/^\/api/, ''), // Optional: if your backend routes don't start with /api
          secure: false, // Set to true if your backend uses HTTPS
          ws: true,
        },
        "/socket.io": {
          // Separate proxy for socket.io is good practice
          target: API_TARGET_URL, // Use the dynamically loaded URL
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});
