import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./i18n";

import App from "./App";
import { theme } from "./theme";
import type { Config } from "./namespaces";

const TEMPLATE_TOKEN_PATTERN = /^\$\{.+\}$/;

// If you have __BUILD_INFO__ available globally, keep this:
window.__BUILD_INFO__ = Object.freeze(__BUILD_INFO__ as (typeof window)["__BUILD_INFO__"]);

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Unable to find root element");
}

async function bootstrap() {
  // Load runtime env config
  const response = await fetch("/env.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load /env.json (${response.status})`);
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (!contentType.includes("json")) {
    const bodyPreview = (await response.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 140);
    throw new Error(
      `Invalid /env.json response type '${contentType || "unknown"}'. ` +
        `Response preview: ${bodyPreview || "<empty>"}`,
    );
  }

  const env = (await response.json()) as Config.Env;
  if (
    typeof env.GAMES_API_URL === "string" &&
    TEMPLATE_TOKEN_PATTERN.test(env.GAMES_API_URL.trim())
  ) {
    // Prevent unresolved template tokens from being used as real service URLs.
    delete env.GAMES_API_URL;
  }

  window.__env__ = env;

  ReactDOM.createRoot(rootEl!).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>,
  );
}

void bootstrap();
