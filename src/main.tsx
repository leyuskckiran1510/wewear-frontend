import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LoaderProvider } from "@/context/LoaderContext";
import "@/styles/main.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <LoaderProvider>
      <App />
    </LoaderProvider>
  </React.StrictMode>
);
