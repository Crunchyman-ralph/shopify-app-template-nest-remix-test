import { defineConfig } from "vite";
import { vitePlugin as remix } from "@remix-run/dev";

const hmrConfig = {
  protocol: "ws",
  host: "localhost",
  port: 64999,
  clientPort: 64999,
};

export default defineConfig({
  plugins: [remix()],
  server: {
    hmr: hmrConfig,
  },
});
