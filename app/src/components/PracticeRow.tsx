import { type ReactNode } from "react";
import { motion } from "framer-motion";
import CheckDraw from "./CheckDraw";

/**
 * PracticeRow 练习条目（design.md §7.3）
 * 高 72px 圆角 12px 底 paper；左：练习名 + Caption 说明；
 * 右：待做=「开始」小按钮（高 36px）/ 已做=sage ✓ + Caption。
 * 主按钮与整卡点击域不重叠：右侧 120px 为按钮热区。
 */

export interface PracticeRowProps {
  title: string;
  caption: string;
  /** 已完成 */
  done?: boolean;
  /** 已完成时右侧的说明文字（如「已完成」「平静 · 14:32」「已卸载 2 件」） */
  doneCaption?: string;
  /** 待做按钮文案（默认「开始」；签到过后为 Ghost「再签一次」） */
  actionLabel?: string;
  /** 已完成时仍允许的动作按钮（Ghost 风格，如「再签一次」） */
  doneActionLabel?: string;
  onAction?: () => void;
  /** 已填写内容的回显（如意图全文，serif clay-600，最多 2 行截断） */
  echo?: ReactNode;
}

export default function PracticeRow({
  title,
  caption,
  done,
  doneCaption,
  actionLabel = "开始",
  doneActionLabel,
  onAction,
  echo,
}: PracticeRowProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="flex min-h-[72px] items-center gap-3 rounded-[12px] bg-paper px-4 py-3"
    >
      {/* 左：名称 + 说明 / 回显 */}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
          {title}
        </p>
        {done && echo ? (
          <div className="font-quote line-clamp-2 text-[15px] leading-[24px] tracking-[0.02em] text-clay-600">
            {echo}
          </div>
        ) : (
          <p className="line-clamp-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
            {caption}
          </p>
        )}
      </div>

      {/* 右：状态控件（按钮热区 ≤120px，与整卡点击域不重叠） */}
      <div className="flex w-[120px] shrink-0 items-center justify-end gap-2">
        {done ? (
          <>
            <CheckDraw size={24} />
            <span className="text-[13px] leading-[18px] tracking-[0.02em] text-sage-600">
              {doneCaption ?? "已完成"}
            </span>
            {doneActionLabel && (
              <button
                onClick={onAction}
                className="min-h-[44px] rounded-full px-2 text-[13px] font-medium text-clay-500 active:bg-clay-100"
              >
                {doneActionLabel}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onAction}
            className="h-9 min-w-[64px] rounded-full bg-clay-100 px-4 text-[13px] font-semibold text-clay-600 transition-transform duration-150 active:scale-[.97] active:bg-clay-200"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
