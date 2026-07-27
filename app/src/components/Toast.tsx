import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartHandshake } from "lucide-react";

/**
 * Toast 自我关怀提示（design.md §7.6）
 * 顶部滑入胶囊（居中 max-width 340px），底 dusk-100，3.5s 自动上滑消失。
 * 用于断签恢复、freeze 自动补位等非阻断提示。文案禁止惩罚性字眼。
 */

export interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  /** 停留时长 ms，默认 3500 */
  duration?: number;
}

export default function Toast({ open, message, onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+72px)] z-[60] mx-auto flex w-fit max-w-[340px] items-center gap-2 rounded-full bg-dusk-100 px-4 py-2.5 shadow-[0_8px_24px_rgba(59,54,47,.08)]"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ opacity: 0, y: -24, transition: { duration: 0.24, ease: "easeIn" } }}
        >
          <HeartHandshake size={17} strokeWidth={1.8} className="shrink-0 text-dusk-500" />
          <span className="text-[15px] leading-[24px] tracking-[0.01em] text-ink">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
