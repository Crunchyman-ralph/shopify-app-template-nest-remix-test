import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import express from "express";
import morgan from "morgan";

installGlobals();

const viteDevServer =
  process.env.NODE_ENV === "production"
    ? undefined
    : await import("vite").then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        }),
      );

const remixHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
    : await import("./build/server/index.js"),
});

const app = express();

app.use(compression());

// Disable x-powered-by header for security
app.disable("x-powered-by");

// Handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
  // Vite fingerprints its assets so we can cache forever
  app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" }),
  );
}

// Cache everything else for an hour
app.use(express.static("build/client", { maxAge: "1h" }));

app.use(morgan("tiny"));

// Handle SSR requests
app.all("*", remixHandler);

// Use FRONTEND_PORT set by Shopify CLI
const port = process.env.FRONTEND_PORT;
app.listen(port, () =>
  console.log(`Express server listening at http://localhost:${port}`),
);
