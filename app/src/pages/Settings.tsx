import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  Leaf,
  MessageCircle,
  Trash2,
  Upload,
} from "lucide-react";
import Sheet from "@/components/Sheet";
import WarmButton from "@/components/Button";
import Toast from "@/components/Toast";
import {
  clearAllData,
  exportAllData,
  importAllData,
  useEntriesRange,
  type ExportPayload,
} from "@/db/hooks";
import { getTrainingDate } from "@/db/schema";

/**
 * 设置页 + 关于页（settings.md）
 * 数据主权：JSON 导出 / 导入（覆盖确认 Sheet）/ 清空（双确认 + 1.2s 长按，三重防护）。
 * 关于页含三维度说明与诚实声明原文。App.tsx 未注册 /settings/about 路由，
 * 故关于页以页内子视图实现（返回栏 56px + ← 返回），#honesty 锚点以滚动定位模拟。
 */

const SOFT_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** 诚实声明全文（settings.md §6.3，必须一字不差） */
const HONESTY_TEXT =
  "「本软件不承诺提升智力或预防痴呆；认知训练以运动、新技能与间隔学习为核心。本软件不替代医疗建议、诊断或治疗。若持续感到情绪低落，请联系信任的人或专业心理服务。」";

const HONESTY_ANCHOR_ID = "honesty";

interface PendingImport {
  json: string;
  days: number;
  from: string | null;
  to: string | null;
}

/** 列表行（高 64px，按下 paper-deep 150ms） */
function SettingRow({
  icon,
  title,
  caption,
  onClick,
  danger = false,
  trailing,
}: {
  icon: ReactNode;
  title: string;
  caption?: string;
  onClick: () => void;
  danger?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[64px] w-full touch-manipulation items-center gap-3 px-5 text-left transition-colors duration-150 active:bg-paper-deep"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[15px] leading-[24px] tracking-[0.01em] ${
            danger ? "text-rust-500" : "text-ink"
          }`}
        >
          {title}
        </span>
        {caption && (
          <span className="block text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
            {caption}
          </span>
        )}
      </span>
      {trailing ?? <ChevronRight size={16} strokeWidth={1.8} className="shrink-0 text-ink-3" />}
    </button>
  );
}

/** 长按 1.2s 确认的破坏性实心按钮（进度环描边 1200ms 线性，松开回弹 250ms） */
function HoldToConfirmButton({ onConfirm }: { onConfirm: () => void }) {
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const C = 2 * Math.PI * 9; // r=9 进度环周长

  const cancel = () => {
    if (done) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setHolding(false); // stroke-dashoffset 以 250ms 回弹
  };

  const start = () => {
    if (done) return;
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setDone(true); // ✓ 闪现 200ms 后执行清空
      setTimeout(onConfirm, 200);
    }, 1200);
  };

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <button
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      className="flex h-[52px] w-full touch-none select-none items-center justify-center gap-2 rounded-[14px] bg-rust-500 text-[15px] font-semibold text-card transition-transform duration-150 active:scale-[.97]"
      style={{ WebkitTouchCallout: "none" }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
        <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(252,250,245,.35)" strokeWidth="2" />
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="none"
          stroke="#FCFAF5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={holding && !done ? 0 : C}
          style={{
            transition:
              holding && !done
                ? "stroke-dashoffset 1200ms linear"
                : "stroke-dashoffset 250ms ease-out",
          }}
        />
      </svg>
      {done ? "✓" : "长按 1 秒，全部清空"}
    </button>
  );
}

export default function Settings() {
  const today = getTrainingDate();
  const allEntries = useEntriesRange("1970-01-01", today);
  const totalDays = allEntries.length;

  const [view, setView] = useState<"list" | "about">("list");
  const [honestyHighlight, setHonestyHighlight] = useState(false);

  const [toast, setToast] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const showToast = (message: string) => setToast({ open: true, message });

  const [exporting, setExporting] = useState(false);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importing, setImporting] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ———— 导出：全表 → JSON 文件下载（settings.md §3.1） ————
  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      const json = await exportAllData();
      const days = (JSON.parse(json) as ExportPayload).daily_entries?.length ?? 0;
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `心智日课-备份-${format(new Date(), "yyyyMMdd")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(`已导出 ${days} 天的记录 ✓`);
    } finally {
      setExporting(false);
    }
  }

  // ———— 导入：文件选择 → 校验 → 确认 Sheet → 覆盖导入（settings.md §3.2） ————
  async function handleFilePicked(file: File) {
    let payload: ExportPayload;
    try {
      const text = await file.text();
      payload = JSON.parse(text) as ExportPayload;
      if (payload.version !== 1 || !Array.isArray(payload.daily_entries)) {
        throw new Error("invalid");
      }
    } catch {
      showToast("这个文件不是有效的备份");
      return;
    }
    const dates = payload.daily_entries.map((e) => e.date).sort();
    setPendingImport({
      json: JSON.stringify(payload),
      days: payload.daily_entries.length,
      from: dates[0] ?? null,
      to: dates[dates.length - 1] ?? null,
    });
  }

  async function confirmImport() {
    if (!pendingImport || importing) return;
    setImporting(true);
    try {
      await importAllData(pendingImport.json);
      setPendingImport(null);
      showToast(`欢迎回来，${pendingImport.days} 天的记录已就位`);
    } catch {
      showToast("这个文件不是有效的备份");
    } finally {
      setImporting(false);
    }
  }

  // ———— 清空：双确认 Sheet + 长按 1.2s（settings.md §3.3，三重防护） ————
  async function confirmClear() {
    await clearAllData();
    setClearOpen(false);
    showToast("已清空。明天可以是新的第 1 天。");
  }

  // ———— 关于页打开（可选 #honesty 锚点滚动） ————
  function openAbout(anchor: boolean) {
    setView("about");
    setHonestyHighlight(anchor);
    if (anchor) {
      setTimeout(() => {
        document
          .getElementById(HONESTY_ANCHOR_ID)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 380);
    } else {
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      <AnimatePresence mode="wait" initial={false}>
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.28, ease: SOFT_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* ———— 顶栏（settings.md §2） ———— */}
            <motion.h1
              className="text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: SOFT_OUT } }}
            >
              设置
            </motion.h1>

            {/* ———— 数据分组（settings.md §3） ———— */}
            <h2 className="mt-6 px-1 text-[11px] font-medium leading-[16px] tracking-[0.08em] text-ink-3">
              数据 · 只属于你
            </h2>
            <div className="mt-2 divide-y divide-line/60 overflow-hidden rounded-[20px] bg-card shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]">
              <SettingRow
                icon={<Download size={24} strokeWidth={1.5} className="shrink-0 text-clay-500" />}
                title="导出数据"
                caption="保存为 JSON 文件，包含全部练习记录"
                onClick={handleExport}
                trailing={
                  exporting ? (
                    <span className="relative h-4 w-4 shrink-0">
                      <span className="absolute inset-0 rounded-full border-2 border-clay-200" />
                      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-clay-500" />
                    </span>
                  ) : undefined
                }
              />
              <SettingRow
                icon={<Upload size={24} strokeWidth={1.5} className="shrink-0 text-clay-500" />}
                title="导入数据"
                caption="从 JSON 备份恢复 · 将覆盖当前数据"
                onClick={() => fileRef.current?.click()}
              />
              <SettingRow
                icon={<Trash2 size={24} strokeWidth={1.5} className="shrink-0 text-rust-500" />}
                title="清空所有数据"
                caption="删除本机全部记录，不可恢复"
                danger
                onClick={() => setClearOpen(true)}
              />
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFilePicked(f);
                e.target.value = "";
              }}
            />

            {/* ———— 关于分组（settings.md §4） ———— */}
            <h2 className="mt-6 px-1 text-[11px] font-medium leading-[16px] tracking-[0.08em] text-ink-3">
              关于
            </h2>
            <div className="mt-2 divide-y divide-line/60 overflow-hidden rounded-[20px] bg-card shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]">
              <SettingRow
                icon={<Leaf size={24} strokeWidth={1.5} className="shrink-0 text-sage-600" />}
                title="关于心智日课"
                onClick={() => openAbout(false)}
              />
              <SettingRow
                icon={
                  <MessageCircle size={24} strokeWidth={1.5} className="shrink-0 text-sage-600" />
                }
                title="诚实声明"
                caption="我们不承诺什么"
                onClick={() => openAbout(true)}
              />
            </div>

            {/* ———— 底部信息（settings.md §5） ———— */}
            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1, transition: { duration: 0.4 } }}
              viewport={{ once: true, amount: 0.8 }}
            >
              <p className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                心智日课 v1.0 · 数据仅存储于此设备
              </p>
              <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                无账号 · 无云端 · 无追踪
              </p>
            </motion.div>
          </motion.div>
        ) : (
          /* ———— 关于页（settings.md §6，页内子视图） ———— */
          <motion.div
            key="about"
            className="-mx-5 px-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: SOFT_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* 返回栏 56px：← 44px + T2 关于 */}
            <div className="-mt-[calc(env(safe-area-inset-top)+16px)] flex h-[calc(56px+env(safe-area-inset-top))] items-center gap-1 pt-[env(safe-area-inset-top)]">
              <button
                aria-label="返回"
                onClick={() => setView("list")}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-ink-2 active:bg-line"
              >
                <ArrowLeft size={20} strokeWidth={1.8} />
              </button>
              <h1 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                关于
              </h1>
            </div>

            {/* 产品卡（§6.1） */}
            <div className="mt-4 flex flex-col items-center rounded-[20px] bg-clay-100 p-6">
              <motion.img
                src={`${import.meta.env.BASE_URL}app-icon.png`}
                alt="心智日课图标"
                className="h-[72px] w-[72px] rounded-[16px]"
                initial={{ scale: 0.8 }}
                animate={{
                  scale: 1,
                  transition: { type: "spring", stiffness: 400, damping: 16, delay: 0.1 },
                }}
              />
              <motion.h2
                className="mt-3 text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.2 } }}
              >
                心智日课
              </motion.h2>
              <motion.p
                className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.3 } }}
              >
                每天，照顾你的大脑、心智与灵魂
              </motion.p>
            </div>

            {/* 三个维度说明（§6.2） */}
            <div className="mt-4 flex flex-col gap-3">
              {(
                [
                  {
                    icon: `${import.meta.env.BASE_URL}seg-day.svg`,
                    title: "大脑 · 认知",
                    body: "运动、新技能、间隔学习",
                    caption: "真正的认知训练在屏幕之外，这里的练习只是提醒你去做",
                  },
                  {
                    icon: `${import.meta.env.BASE_URL}seg-morning.svg`,
                    title: "心智 · 情绪",
                    body: "正念、叹息、情绪命名",
                    caption: "被循证支持的自我调节工具",
                  },
                  {
                    icon: `${import.meta.env.BASE_URL}seg-evening.svg`,
                    title: "灵魂 · 意义",
                    body: "感恩、复盘、意图",
                    caption: "只记 ✓/✗，永远没有分数",
                  },
                ] as const
              ).map((d, i) => (
                <motion.div
                  key={d.title}
                  className="flex min-h-[88px] items-center gap-4 rounded-[20px] bg-card p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.35, delay: 0.15 + i * 0.1, ease: SOFT_OUT },
                  }}
                >
                  <img src={d.icon} alt="" className="h-10 w-10 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                      {d.title}　{d.body}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                      {d.caption}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 诚实声明区（§6.3，#honesty 锚点，一次性描边强调） */}
            <motion.div
              id={HONESTY_ANCHOR_ID}
              className="mt-4 rounded-[20px] bg-dusk-100 p-5"
              initial={false}
              animate={{
                boxShadow: honestyHighlight
                  ? "inset 0 0 0 1.5px #7A6A58"
                  : "inset 0 0 0 0px rgba(122,106,88,0)",
                transition: { duration: 0.5, delay: honestyHighlight ? 0.5 : 0 },
              }}
            >
              <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                诚实声明
              </h2>
              <p className="mt-2 text-[15px] leading-[26px] tracking-[0.01em] text-ink-2">
                {HONESTY_TEXT}
              </p>
            </motion.div>

            {/* 数据说明区（§6.4） */}
            <div className="mt-6">
              <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                你的数据在哪里
              </h2>
              <p className="mt-2 text-[15px] leading-[26px] tracking-[0.01em] text-ink-2">
                所有记录保存在这台设备的浏览器本地数据库（IndexedDB）中，不经过任何服务器。清除浏览器数据会删除记录——请定期导出备份。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ———— 导入确认 Sheet（settings.md §3.2） ———— */}
      <Sheet
        open={pendingImport !== null}
        onClose={() => !importing && setPendingImport(null)}
        title="导入备份？"
        footer={
          <div className="flex flex-col gap-1">
            <WarmButton className="w-full" loading={importing} onClick={confirmImport}>
              确认导入
            </WarmButton>
            <WarmButton
              variant="ghost"
              className="w-full"
              disabled={importing}
              onClick={() => setPendingImport(null)}
            >
              取消
            </WarmButton>
          </div>
        }
      >
        <p className="pb-2 pt-1 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
          {pendingImport &&
            `备份包含 ${pendingImport.days} 天的记录${
              pendingImport.from && pendingImport.to
                ? `（${pendingImport.from} 至 ${pendingImport.to}）`
                : ""
            }。导入会覆盖当前设备上的全部数据，此操作不可撤销。`}
        </p>
      </Sheet>

      {/* ———— 清空双重确认 Sheet（settings.md §3.3） ———— */}
      <Sheet
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title="确定要清空吗？"
        footer={
          <div className="flex flex-col">
            <WarmButton
              variant="ghost"
              className="w-full"
              onClick={() => {
                setClearOpen(false);
                void handleExport();
              }}
            >
              先导出备份
            </WarmButton>
            {/* Destructive 与相邻按钮间距 ≥16px（交互红线） */}
            <div className="my-4">
              <HoldToConfirmButton onConfirm={() => void confirmClear()} />
            </div>
            <WarmButton variant="ghost" className="w-full" onClick={() => setClearOpen(false)}>
              取消
            </WarmButton>
          </div>
        }
      >
        <p className="pb-2 pt-1 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
          这将删除全部 {totalDays} 天记录：练习、签到、好事、复盘。此操作不可恢复。建议先导出备份。
        </p>
      </Sheet>

      <Toast
        open={toast.open}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />
    </div>
  );
}
