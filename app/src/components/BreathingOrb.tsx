import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 呼吸圆签名动效（design.md §5.1 BreathingOrb）
 * 双层圆：内核实心 clay-500，外圈 30% 透明晕染；
 * 吸气 scale 1→1.35（外圈透明度 .3→.5），呼气回落；
 * 阶段引导文字：旧下沉 8px 淡出 200ms，新上浮淡入 300ms。
 * 禁止粒子、光晕爆闪。prefers-reduced-motion 时退化为透明度脉冲。
 *
 * 练习页通过 phase 驱动；默认 standalone 时做 4s 吸 / 6s 呼循环。
 */

export interface BreathingOrbProps {
  /** 当前阶段文字（如「吸气…」「呼气…」） */
  label?: string;
  /** 是否处于吸气（true=放大）；未提供时自动循环 */
  inhaling?: boolean;
  /** 吸气时长（秒，默认 4；循环叹息双吸 1.6） */
  inhaleSec?: number;
  /** 呼气时长（秒，默认 6；叹息长呼 6.4） */
  exhaleSec?: number;
  size?: number;
  className?: string;
}

function BreathingOrbInner({
  label,
  inhaling,
  inhaleSec = 4,
  exhaleSec = 6,
  size = 180,
  className,
}: BreathingOrbProps) {
  const auto = inhaling === undefined;
  const coreTarget = auto
    ? { scale: [1, 1.35, 1], opacity: 1 }
    : { scale: inhaling ? 1.35 : 1, opacity: 1 };
  const coreTransition = auto
    ? {
        duration: inhaleSec + exhaleSec,
        times: [0, inhaleSec / (inhaleSec + exhaleSec), 1],
        repeat: Infinity,
        ease: "easeInOut" as const,
      }
    : { duration: inhaling ? inhaleSec : exhaleSec, ease: "easeInOut" as const };

  return (
    <div className={cn("flex flex-col items-center gap-8", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* 外圈晕染 */}
        <motion.div
          className="absolute inset-0 rounded-full bg-clay-500"
          style={{ opacity: 0.3, scale: 1.25 }}
          animate={
            auto
              ? { opacity: [0.3, 0.5, 0.3], scale: [1.25, 1.55, 1.25] }
              : { opacity: inhaling ? 0.5 : 0.3, scale: inhaling ? 1.55 : 1.25 }
          }
          transition={coreTransition}
        />
        {/* 内核 */}
        <motion.div
          className="absolute inset-0 rounded-full bg-clay-500"
          animate={coreTarget}
          transition={coreTransition}
        />
      </div>
      {/* 阶段引导文字 */}
      <div className="relative h-[26px] overflow-visible">
        <AnimatePresence mode="wait">
          <motion.p
            key={label ?? "default"}
            className="text-center text-[16px] leading-[26px] tracking-[0.01em] text-ink-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
          >
            {label}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** memo 隔离永动动画，避免父级重渲染重置（react-dev.md 动效隔离规则） */
const BreathingOrb = memo(BreathingOrbInner);
export default BreathingOrb;
