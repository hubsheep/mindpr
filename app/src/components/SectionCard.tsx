import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CheckDraw from "./CheckDraw";

/**
 * SectionCard 三段卡片（design.md §7.2，全站卡片范式）
 * 三态：待开始（card 底）/ 当前时段（分段淡色 1.5px 内描边 + 顶部 3px 色条 +「现在」徽标）/ 已完成（分段淡色 40% 混合 + CheckBadge）。
 */

export type Segment = "morning" | "day" | "evening";
export type SectionState = "idle" | "current" | "done";

/** 分段身份色（design.md §2 时间分段色） */
export const SEGMENT_STYLE: Record<
  Segment,
  { tintBg: string; accent: string; bar: string; iconSrc: string; badgeBg: string }
> = {
  morning: {
    tintBg: "bg-apricot-100",
    accent: "text-clay-500",
    bar: "bg-clay-500",
    iconSrc: `${import.meta.env.BASE_URL}seg-morning.svg`,
    badgeBg: "bg-apricot-100 text-clay-600",
  },
  day: {
    tintBg: "bg-sage-100",
    accent: "text-sage-600",
    bar: "bg-sage-600",
    iconSrc: `${import.meta.env.BASE_URL}seg-day.svg`,
    badgeBg: "bg-sage-100 text-sage-600",
  },
  evening: {
    tintBg: "bg-dusk-100",
    accent: "text-dusk-500",
    bar: "bg-dusk-500",
    iconSrc: `${import.meta.env.BASE_URL}seg-evening.svg`,
    badgeBg: "bg-dusk-100 text-dusk-500",
  },
};

export interface SectionCardProps {
  segment: Segment;
  title: string;
  caption: string;
  state: SectionState;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  segment,
  title,
  caption,
  state,
  children,
  className,
}: SectionCardProps) {
  const seg = SEGMENT_STYLE[segment];
  return (
    <motion.section
      layout="position"
      className={cn(
        "relative overflow-hidden rounded-[20px] p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]",
        // 已完成：分段淡色 40% 混合底；其余：card 底
        state === "done" ? cn(seg.tintBg, "bg-opacity-40") : "bg-card",
        className,
      )}
    >
      {/* 当前时段：顶部 3px 分段色条（圆角内嵌）+ 1.5px 内描边（600ms 淡入） */}
      {state === "current" && (
        <>
          <motion.div
            className={cn("absolute inset-x-5 top-0 h-[3px] rounded-b-full", seg.bar)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
          />
          <motion.div
            className={cn(
              "pointer-events-none absolute inset-0 rounded-[20px] border-[1.5px]",
              segment === "morning" && "border-clay-500/45",
              segment === "day" && "border-sage-600/45",
              segment === "evening" && "border-dusk-500/45",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
          />
        </>
      )}

      {/* 顶部一行：图标 + 段名 + 状态徽标 */}
      <header className="flex items-center gap-3">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-full", seg.tintBg)}>
          <img src={seg.iconSrc} alt="" width={28} height={28} />
        </span>
        <h2 className="flex-1 text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink">
          {title}
        </h2>
        {state === "current" && (
          <motion.span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium leading-[16px] tracking-[0.08em]",
              seg.badgeBg,
            )}
            initial={{ scale: 0 }}
            animate={{ scale: 1, transition: { type: "spring", stiffness: 500, damping: 22, duration: 0.3 } }}
          >
            现在
          </motion.span>
        )}
        {state === "done" && <CheckDraw size={26} />}
      </header>

      {/* 时段说明 */}
      <p className="mt-1.5 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">{caption}</p>

      {/* 练习条目 */}
      <div className="mt-4 flex flex-col gap-2">{children}</div>
    </motion.section>
  );
}
