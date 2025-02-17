import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { Principal } from "@dfinity/principal";

// For simplicity sake we're using the default anonymous user id as the main user
const CURRENT_USER_ID = Principal.fromText("2vxsx-fae");
export default CURRENT_USER_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);