import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * 完成打勾签名动效（design.md §5.2 CheckDraw）
 * SVG 圆描边 300ms → ✓ 描边 200ms，sage-500。
 * 卡片扫色与弹性脉冲由使用方（PracticeRow/SectionCard）配合实现。
 */

export interface CheckDrawProps {
  size?: number;
  className?: string;
  /** 完成回调（用于链接触发卡片脉冲） */
  onComplete?: () => void;
}

export default function CheckDraw({ size = 28, className, onComplete }: CheckDrawProps) {
  const r = 11;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={cn("shrink-0", className)}
      aria-label="已完成"
    >
      <motion.circle
        cx="14"
        cy="14"
        r={r}
        stroke="#8FA08A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.path
        d="M8.5 14.5 L12.5 18.5 L20 10.5"
        stroke="#8FA08A"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3, duration: 0.2, ease: "easeOut" }}
        onAnimationComplete={onComplete}
      />
    </svg>
  );
}
