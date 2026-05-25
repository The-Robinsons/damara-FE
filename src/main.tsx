import { createRoot } from "react-dom/client";
import App from "./app/App";
import "./index.css";
import "./shared/styles/damara-theme.css";
import "./shared/styles/damara-toast.css";
import "./shared/styles/damara-motion.css";

createRoot(document.getElementById("root")!).render(<App />);
