import { Routes, Route } from "react-router";
import Layout from "@/components/Layout";
import Today from "@/pages/Today";
import Practice from "@/pages/Practice";
import Checkin from "@/pages/Checkin";
import Evening from "@/pages/Evening";
import Dashboard from "@/pages/Dashboard";
import Review from "@/pages/Review";
import Settings from "@/pages/Settings";

/**
 * 路由（design.md §8）
 * 嵌套路由模式：Layout 渲染 <Outlet/>，页面代理不要改动此结构。
 * /practice/:type 为全屏练习页，不含 TabBar（呼吸需要无干扰全屏）。
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="checkin" element={<Checkin />} />
        <Route path="evening" element={<Evening />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="review" element={<Review />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/practice/:type" element={<Practice />} />
    </Routes>
  );
}
