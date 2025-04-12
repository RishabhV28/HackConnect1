import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import AuthWrapper from "@/hooks/use-auth";

createRoot(document.getElementById("root")!).render(
  <AuthWrapper>
    <App />
  </AuthWrapper>
);
