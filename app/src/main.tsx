import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "./index.css";
import App from "./App.tsx";

// 使用 HashRouter：GitHub Pages 等静态托管无需服务端路由配置
// PWA 添加到主屏幕后仍从 start_url 正常启动
createRoot(document.getElementById("root")!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
