import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { createRequestHandler } from "@remix-run/express";
import { installGlobals } from "@remix-run/node";
import compression from "compression";
import type { NestExpressApplication } from "@nestjs/platform-express";
import morgan from "morgan";
import express from "express";

async function bootstrap() {
  installGlobals();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();

  // Disable x-powered-by header for security
  expressApp.disable("x-powered-by");

  // Add compression
  expressApp.use(compression());

  // Add Morgan logging
  expressApp.use(morgan("tiny"));

  const viteDevServer =
    process.env.NODE_ENV === "production"
      ? undefined
      : await import("vite").then((vite) =>
          vite.createServer({
            server: { middlewareMode: true },
          }),
        );

  // Handle asset requests
  if (viteDevServer) {
    expressApp.use(viteDevServer.middlewares);
  } else {
    // Vite fingerprints its assets so we can cache forever
    expressApp.use(
      "/assets",
      expressApp.static("build/client/assets", {
        immutable: true,
        maxAge: "1y",
      }),
    );
  }

  // Cache everything else for an hour
  expressApp.use(express.static("build/client", { maxAge: "1h" }));

  const remixHandler = createRequestHandler({
    build: viteDevServer
      ? () => viteDevServer.ssrLoadModule("virtual:remix/server-build")
      : await import("./build/server/index.js"),
  });

  // Handle SSR requests
  expressApp.all("*", remixHandler);

  const port = process.env.FRONTEND_PORT;
  await app.listen(port);
  console.log(`NestJS server listening at http://localhost:${port}`);
}

bootstrap();
