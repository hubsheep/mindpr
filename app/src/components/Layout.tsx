import { Outlet } from "react-router";
import Navbar from "./Navbar";

/**
 * AppShell（design.md §6）
 * - 全局背景 paper 色 + 3% 纸张纹理叠加
 * - 内容槽 max-width 480px 居中，渲染 <Outlet/>（嵌套路由模式）
 * - 底部为 TabBar 预留 84px + 安全区滚动余量（pb-tabbar）
 * - 页面级禁用横向滚动
 */

export default function Layout() {
  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-paper text-ink">
      {/* 全局纸张纹理（3% 透明度，近乎不可见的纸质触感） */}
      <div className="grain-overlay fixed inset-0 z-0" aria-hidden />
      {/* 内容滚动区：居中栏宽 480px */}
      <main className="relative z-10 mx-auto w-full max-w-[480px] pb-tabbar">
        <Outlet />
      </main>
      {/* 底部 TabBar */}
      <Navbar />
    </div>
  );
}
