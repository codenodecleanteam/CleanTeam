import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "@/providers/AuthProvider";
import { Router } from "wouter";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Router>
      <App />
    </Router>
  </AuthProvider>,
);
