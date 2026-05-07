import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
];

const missingEnvVars = requiredEnvVars.filter(key => {
  const value = import.meta.env[key];
  return !value || value.startsWith('your-') || value.includes('your-');
});

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required env: ${missingEnvVars.join(', ')}`);
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
