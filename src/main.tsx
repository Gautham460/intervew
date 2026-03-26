import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ClerkProvider } from "@clerk/clerk-react";

import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { ToasterProvider } from "./provider/toast-provider.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0", // Placeholder DSN for demonstration
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/intervew/"
      signInUrl="/intervew/signin"
      signUpUrl="/intervew/signup"
      signInFallbackRedirectUrl="/intervew/generate"
      signUpFallbackRedirectUrl="/intervew/generate"
    >
      <App />
      <ToasterProvider />
    </ClerkProvider>
  </StrictMode>
);
