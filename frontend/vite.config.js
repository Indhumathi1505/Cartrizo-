import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: {
    global: "window", // keeps sockjs-client happy
  },
  server: {
    host: "0.0.0.0",  // allow external access to EC2 public IP
    port: 5173,        // dev server port
    proxy: {
      "/api": "http://localhost:8080"  // forward all /api requests to Spring Boot
    }
  }
});
