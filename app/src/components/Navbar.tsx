import { NavLink } from "react-router";
import { motion } from "framer-motion";
import { Sun, BarChart3, NotebookPen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 底部 TabBar（design.md §6 AppShell）
 * 毛玻璃 rgba(252,250,245,.85) + backdrop-blur(20px)，顶部 1px line 分割线；
 * 4 个等宽项：24px 线性图标（stroke 1.5）+ Micro 标签；
 * 激活态 clay-500 + 图标上方 4px 圆点；未激活 ink-3；图标 scale .85→1 弹跳 200ms。
 */

const TABS = [
  { to: "/", label: "今日", icon: Sun, end: true },
  { to: "/dashboard", label: "仪表盘", icon: BarChart3, end: false },
  { to: "/review", label: "复盘", icon: NotebookPen, end: false },
  { to: "/settings", label: "设置", icon: Settings, end: false },
] as const;

export default function Navbar() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-[rgba(252,250,245,.85)] backdrop-blur-[20px]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-14 max-w-[480px] items-stretch">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="flex min-h-[44px] flex-1 items-center justify-center"
          >
            {({ isActive }) => (
              <span className="relative flex flex-col items-center gap-0.5">
                {/* 激活态：图标上方 4px 圆点 */}
                <span
                  className={cn(
                    "absolute -top-1.5 h-1 w-1 rounded-full bg-clay-500 transition-opacity duration-200",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
                <motion.span
                  animate={{ scale: isActive ? 1 : 0.85 }}
                  transition={{ type: "spring", stiffness: 600, damping: 20, duration: 0.2 }}
                  className="flex"
                >
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    className={isActive ? "text-clay-500" : "text-ink-3"}
                  />
                </motion.span>
                <span
                  className={cn(
                    "text-[11px] font-medium leading-[16px] tracking-[0.08em]",
                    isActive ? "text-clay-500" : "text-ink-3",
                  )}
                >
                  {label}
                </span>
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
