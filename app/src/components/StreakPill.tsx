import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StreakPill 连续天数胶囊（design.md §7.5）
 * 高 32px 底 apricot-100：叶片图标 + Caption 600「连续 N 天」+ 右侧 2 枚 freeze 筹码
 * （可用=apricot-500 实心，已用=仅描边）。点击展开规则 Sheet（由使用方控制）。
 * 首次使用（无任何记录）：显示「第 1 天」，无 freeze 筹码。
 */

export interface StreakPillProps {
  /** 当前连续天数 */
  current: number;
  /** 剩余 freeze 数（0–2） */
  freezesLeft: number;
  /** 是否已有任何记录（false=首运，显示「第 1 天」） */
  hasAnyRecord: boolean;
  onClick?: () => void;
}

export default function StreakPill({ current, freezesLeft, hasAnyRecord, onClick }: StreakPillProps) {
  const shown = hasAnyRecord ? Math.max(current, 1) : 1;
  return (
    <button
      onClick={onClick}
      aria-label="连续天数规则"
      className="flex h-8 items-center gap-1.5 rounded-full bg-apricot-100 pl-2.5 pr-3 transition-transform duration-150 active:scale-[.97]"
    >
      <Leaf size={16} strokeWidth={1.8} className="text-clay-500" />
      <span className="tnum text-[13px] font-semibold leading-[18px] tracking-[0.02em] text-clay-600">
        {hasAnyRecord ? `连续 ${shown} 天` : "第 1 天"}
      </span>
      {hasAnyRecord && (
        <span className="ml-0.5 flex items-center gap-1">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              layout
              className={cn(
                "h-3 w-3 rounded-full",
                i < freezesLeft ? "bg-apricot-500" : "border border-apricot-500/60 bg-transparent",
              )}
            />
          ))}
        </span>
      )}
    </button>
  );
}
