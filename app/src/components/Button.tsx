import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * 按钮（design.md §7.1）
 * primary 52px 陶土 / secondary 灰绿淡底 / ghost 无底陶土字 /
 * destructive 温和警示淡底（仅设置页）/ icon 44px 圆钮
 */

export interface WarmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "icon";
  /** 等待态：左侧旋转描边圆 */
  loading?: boolean;
}

const variantClass: Record<NonNullable<WarmButtonProps["variant"]>, string> = {
  primary:
    "h-[52px] px-6 rounded-[14px] bg-clay-500 text-card text-[15px] font-semibold active:bg-clay-600 shadow-none",
  secondary:
    "h-[52px] px-6 rounded-[14px] bg-sage-100 text-sage-600 text-[15px] font-semibold active:bg-sage-100/70",
  ghost: "h-[44px] px-3 rounded-[14px] text-clay-500 text-[15px] font-medium active:bg-clay-100",
  destructive:
    "h-[52px] px-6 rounded-[14px] bg-rust-500/10 text-rust-500 text-[15px] font-semibold active:bg-rust-500/20",
  icon: "h-11 w-11 rounded-full bg-paper-deep text-ink-2 active:bg-line",
};

const WarmButton = forwardRef<HTMLButtonElement, WarmButtonProps>(
  ({ variant = "primary", loading, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // 按下 scale(.97) 150ms（design.md §4）；点击目标 ≥44px
          "inline-flex min-h-[44px] select-none items-center justify-center gap-2 transition-all duration-150 ease-[cubic-bezier(.4,0,.2,1)] active:scale-[.97] disabled:opacity-50",
          variantClass[variant],
          className,
        )}
        {...rest}
      >
        {loading && (
          <span className="relative h-4 w-4">
            <span className="absolute inset-0 rounded-full border-2 border-clay-200" />
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-clay-500" />
          </span>
        )}
        {children}
      </button>
    );
  },
);
WarmButton.displayName = "WarmButton";

export default WarmButton;
