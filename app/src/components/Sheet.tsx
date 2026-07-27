import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 底部弹层 Sheet（design.md §7.4）
 * 顶部圆角 24px + 把手；遮罩 rgba(59,54,47,.32)；drag="y" 下拉收起；
 * 最大高 92dvh，内容内部滚动，底部操作区固定可见。
 * 打开 340ms soft-out，收起 260ms ease-in。
 */

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** 固定在 Sheet 底部的操作区（主按钮永远可见） */
  footer?: ReactNode;
}

export default function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            key="mask"
            className="fixed inset-0 z-40 bg-[rgba(59,54,47,.32)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={onClose}
          />
          {/* 弹层本体 */}
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[480px] flex-col rounded-t-[24px] bg-card shadow-[0_-8px_40px_rgba(59,54,47,.12)]"
            initial={{ y: "100%" }}
            animate={{
              y: 0,
              transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{ y: "100%", transition: { duration: 0.26, ease: "easeIn" } }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) onClose();
            }}
          >
            {/* 把手 36×4 */}
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <div className="h-1 w-9 rounded-full bg-line" />
            </div>
            {/* 头部：标题 + 关闭圆钮 */}
            {(title || true) && (
              <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-1">
                <h2 className="text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink">
                  {title}
                </h2>
                <button
                  aria-label="关闭"
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-ink-2 active:bg-line"
                >
                  <X size={20} strokeWidth={1.8} />
                </button>
              </div>
            )}
            {/* 内容区：内部滚动 */}
            <div className={cn("min-h-0 flex-1 overflow-y-auto px-5", !footer && "pb-[calc(env(safe-area-inset-bottom)+16px)]")}>
              {children}
            </div>
            {/* 底部操作区固定可见 */}
            {footer && (
              <div className="shrink-0 border-t border-line/60 px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
