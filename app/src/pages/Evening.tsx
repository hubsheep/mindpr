import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronDown } from "lucide-react";
import { format, parseISO, subDays } from "date-fns";
import { useToday, useEntry, saveTodos, saveGratitudes } from "@/db/hooks";
import { getTrainingDate, type GratitudeItem } from "@/db/schema";
import WarmButton from "@/components/Button";
import CheckDraw from "@/components/CheckDraw";
import { cn } from "@/lib/utils";

/**
 * 晚间仪式（evening.md）
 * /evening?tab=todo|gratitude —— Sheet 样式全屏页（把手 + 关闭返回）。
 * Tab 一：明日三件事（固定 3 格前瞻卸载 + 昨日回填）；Tab 二：三件好事（serif 书写 + 可选原因）。
 * 零分数、零评级；草稿失焦即写 IndexedDB；跨午夜数据归属打开时的训练日。
 */

const SOFT_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

const TODO_PLACEHOLDERS = ["最重要的一件", "第二件", "如果有余力"];
const GRATITUDE_LABELS = ["第一件", "第二件", "第三件"];

type TabKey = "todo" | "gratitude";

/** 聚焦后滚动居中，保证键盘弹出后控件完整可见（evening.md §5） */
function focusScroll(e: React.FocusEvent<HTMLElement>) {
  const el = e.target;
  window.setTimeout(() => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 300);
}

/** 底部主按钮随 visualViewport 上抬（键盘弹出时永远可见） */
function useKeyboardOffset(): number {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () =>
      setOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);
  return offset;
}

export default function Evening() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 跨午夜：数据归属「打开时」的训练日（evening.md §5）
  const [openDate] = useState(() => getTrainingDate());
  const { entry, isPersisted } = useToday(openDate);
  const yesterday = useMemo(
    () => format(subDays(parseISO(openDate), 1), "yyyy-MM-dd"),
    [openDate],
  );
  const yEntry = useEntry(yesterday);

  const initialTab: TabKey =
    searchParams.get("tab") === "gratitude" ? "gratitude" : "todo";
  const [tab, setTab] = useState<TabKey>(initialTab);

  // —— 草稿（失焦即写 IndexedDB；读取已有记录仅初始化一次，避免覆盖输入中内容）——
  const [todos, setTodos] = useState<string[]>(["", "", ""]);
  const [grats, setGrats] = useState<GratitudeItem[]>([
    { text: "" },
    { text: "" },
    { text: "" },
  ]);
  const [reasonOpen, setReasonOpen] = useState<boolean[]>([false, false, false]);
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current || !isPersisted) return;
    loadedRef.current = true;
    setTodos([0, 1, 2].map((i) => entry.todoItems[i] ?? ""));
    setGrats(
      [0, 1, 2].map((i) => ({
        text: entry.gratitudes[i]?.text ?? "",
        reason: entry.gratitudes[i]?.reason ?? "",
      })),
    );
    setReasonOpen([0, 1, 2].map((i) => Boolean(entry.gratitudes[i]?.reason)));
  }, [isPersisted, entry]);

  // 昨日 to-do 回填（信息式标记，本地态，不计分不计率）
  const [yDone, setYDone] = useState<Record<number, boolean>>({});
  const [yOpen, setYOpen] = useState(false);

  const [nightOpen, setNightOpen] = useState(false);
  const kbOffset = useKeyboardOffset();

  const todoDone = entry.todoDone;
  const gratDone = entry.gratitudeDone;

  const switchTab = (t: TabKey) => {
    setTab(t);
    setSearchParams({ tab: t }, { replace: true });
  };

  // 底部主按钮文案（evening.md §1）
  const primaryLabel = !todoDone && !gratDone
    ? "完成今晚"
    : todoDone && gratDone
      ? "收好今晚 ✓"
      : "还有一件小事";

  const onPrimary = () => {
    if (primaryLabel === "还有一件小事") {
      switchTab(todoDone ? "gratitude" : "todo");
      return;
    }
    setNightOpen(true);
  };

  const saveTodoBlur = () => {
    void saveTodos(openDate, todos);
  };
  const saveGratBlur = () => {
    void saveGratitudes(openDate, grats);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-paper">
      {/* 把手（下滑返回手势热区） */}
      <motion.div
        className="flex shrink-0 cursor-grab justify-center pb-1 pt-[calc(env(safe-area-inset-top)+12px)]"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 70 || info.velocity.y > 400) navigate("/");
        }}
        style={{ touchAction: "none" }}
      >
        <div className="h-1 w-9 rounded-full bg-line" />
      </motion.div>

      {/* 头部：T1 + 关闭钮（独立 56px 行） */}
      <header className="flex h-14 shrink-0 items-center justify-between px-5">
        <h1 className="text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink">
          晚间仪式
        </h1>
        <button
          aria-label="关闭"
          onClick={() => navigate("/")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-ink-2 transition-colors duration-150 active:bg-line"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
      </header>

      {/* 分段控件：paper-deep 轨道 + 滑动选中胶囊 */}
      <div className="shrink-0 px-5 pb-3 pt-1">
        <div className="relative flex rounded-full bg-paper-deep p-1">
          {(["todo", "gratitude"] as const).map((k) => (
            <button
              key={k}
              onClick={() => switchTab(k)}
              className="relative z-10 flex h-11 flex-1 items-center justify-center"
            >
              {tab === k && (
                <motion.span
                  layoutId="evening-tab-pill"
                  className="absolute inset-0 rounded-full bg-card shadow-[0_1px_2px_rgba(59,54,47,.08),0_4px_12px_rgba(59,54,47,.06)]"
                  transition={{ duration: 0.25, ease: SOFT_OUT }}
                />
              )}
              <span
                className={cn(
                  "relative text-[15px] font-medium leading-[24px] tracking-[0.01em] transition-colors duration-200",
                  tab === k ? "text-clay-500" : "text-ink-3",
                )}
              >
                {k === "todo" ? "明日三件事" : "三件好事"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容区：内部滚动 */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          {tab === "todo" ? (
            <motion.div
              key="todo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                把明天交给纸面
              </h2>
              <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                写下明天最重要的三件事。写下来，今晚就不必再想它们。
              </p>

              {/* 昨日回看（可折叠，默认收起） */}
              {yEntry && yEntry.todoItems.length > 0 && (
                <div className="mt-4 rounded-2xl bg-paper-deep p-4">
                  <button
                    className="flex min-h-[44px] w-full items-center justify-between"
                    onClick={() => setYOpen((v) => !v)}
                  >
                    <span className="text-[13px] font-semibold leading-[18px] tracking-[0.02em] text-ink-2">
                      昨天写下的
                    </span>
                    <motion.span
                      animate={{ rotate: yOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-ink-3"
                    >
                      <ChevronDown size={18} strokeWidth={1.8} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {yOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: SOFT_OUT }}
                        className="overflow-hidden"
                      >
                        {yEntry.todoItems.map((item, i) => (
                          <li key={i} className="flex min-h-[44px] items-center gap-3">
                            <button
                              aria-label={yDone[i] ? "取消标记" : "标记已做到"}
                              onClick={() =>
                                setYDone((m) => ({ ...m, [i]: !m[i] }))
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center"
                            >
                              {yDone[i] ? (
                                <CheckDraw size={24} />
                              ) : (
                                <span className="h-6 w-6 rounded-full border-[1.5px] border-ink-3" />
                              )}
                            </button>
                            <span
                              className={cn(
                                "text-[15px] leading-[24px] tracking-[0.01em] transition-all duration-200",
                                yDone[i]
                                  ? "text-ink-3 line-through decoration-ink-3/60"
                                  : "text-ink",
                              )}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 固定 3 槽（stagger 入场） */}
              <div className="mt-4 space-y-3">
                {todos.map((val, i) => (
                  <motion.div
                    key={i}
                    className="flex h-14 items-center gap-3 rounded-[14px] bg-card px-4 shadow-[0_1px_2px_rgba(59,54,47,.04)]"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: 0.08 * i, duration: 0.35, ease: SOFT_OUT },
                    }}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-dusk-100 text-[13px] font-medium text-dusk-500 tnum">
                      {i + 1}
                    </span>
                    <input
                      value={val}
                      placeholder={TODO_PLACEHOLDERS[i]}
                      onChange={(e) =>
                        setTodos((arr) => arr.map((s, j) => (j === i ? e.target.value : s)))
                      }
                      onBlur={saveTodoBlur}
                      onFocus={focusScroll}
                      className="h-full min-w-0 flex-1 bg-transparent text-[15px] leading-[24px] tracking-[0.01em] text-ink outline-none placeholder:text-ink-3 rounded-lg focus-visible:ring-2 focus-visible:ring-dusk-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                    />
                  </motion.div>
                ))}
              </div>
              <p className="mt-3 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                三件就够。至少写一件，就算完成。
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="gratitude"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.25 } }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                今天值得感谢的三个瞬间
              </h2>
              <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                再小也算。「热水很舒服」就是一件好事。
              </p>

              <div className="mt-4 space-y-4">
                {grats.map((g, i) => (
                  <GratitudeCard
                    key={i}
                    index={i}
                    item={g}
                    reasonOpen={reasonOpen[i]}
                    onToggleReason={() =>
                      setReasonOpen((arr) => arr.map((v, j) => (j === i ? !v : v)))
                    }
                    onChange={(next) =>
                      setGrats((arr) => arr.map((it, j) => (j === i ? next : it)))
                    }
                    onBlur={saveGratBlur}
                  />
                ))}
              </div>
              <p className="mt-3 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                原因永远可选。至少写下一件，就是完成。
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 底部固定主按钮（随键盘上抬） */}
      <div
        className="shrink-0 border-t border-line/60 bg-paper px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3"
        style={{ marginBottom: kbOffset }}
      >
        <WarmButton className="w-full" onClick={onPrimary}>
          {primaryLabel}
        </WarmButton>
      </div>

      {/* 收夜卡（完成态浮层） */}
      <AnimatePresence>
        {nightOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(59,54,47,.32)] px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <motion.div
              className="w-full max-w-[320px] rounded-[24px] bg-dusk-100 p-6 text-center"
              initial={{ scale: 0.9, y: 16, opacity: 0 }}
              animate={{
                scale: 1,
                y: 0,
                opacity: 1,
                transition: { duration: 0.4, ease: SOFT_OUT },
              }}
              exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.2 } }}
            >
              <img
                src={`${import.meta.env.BASE_URL}seg-evening.svg`}
                alt=""
                width={48}
                height={48}
                className="mx-auto"
              />
              <h2 className="mt-3 text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                今晚到这里就好
              </h2>
              <p className="font-quote mt-3 text-[17px] leading-[28px] tracking-[0.04em] text-dusk-500">
                写在纸上的，不必带进梦里。
              </p>
              <WarmButton className="mt-5 w-full" onClick={() => navigate("/")}>
                回到今天
              </WarmButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** 三件好事卡（serif 书写区 + 可折叠原因附言） */
function GratitudeCard({
  index,
  item,
  reasonOpen,
  onToggleReason,
  onChange,
  onBlur,
}: {
  index: number;
  item: GratitudeItem;
  reasonOpen: boolean;
  onToggleReason: () => void;
  onChange: (next: GratitudeItem) => void;
  onBlur: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // 多行自动撑高
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 64)}px`;
  }, [item.text]);

  const handleBlur = () => {
    onBlur();
    if (item.text.trim()) setChecked(true);
  };

  return (
    <motion.section
      className="relative rounded-[20px] bg-card p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 * index, duration: 0.4, ease: SOFT_OUT },
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] leading-[18px] tracking-[0.02em] text-apricot-500">
          {GRATITUDE_LABELS[index]}
        </span>
        {/* 写完一张卡（失焦且有内容）淡入 sage ✓ */}
        <AnimatePresence>
          {checked && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, transition: { duration: 0.25 } }}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-sage-100"
            >
              <Check size={14} strokeWidth={2.4} className="text-sage-600" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <textarea
        ref={textRef}
        value={item.text}
        placeholder="今天发生的一件好事是……"
        rows={2}
        onChange={(e) => onChange({ ...item, text: e.target.value })}
        onBlur={handleBlur}
        onFocus={focusScroll}
        className="font-quote mt-2 w-full resize-none bg-transparent text-[17px] leading-[28px] tracking-[0.04em] text-ink outline-none placeholder:text-ink-3"
        style={{ minHeight: 64 }}
      />

      {/* 原因附言（可折叠） */}
      <AnimatePresence initial={false}>
        {reasonOpen ? (
          <motion.div
            key="reason"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: SOFT_OUT }}
            className="overflow-hidden"
          >
            <textarea
              value={item.reason ?? ""}
              placeholder="因为……"
              rows={2}
              onChange={(e) => onChange({ ...item, reason: e.target.value })}
              onBlur={handleBlur}
              onFocus={focusScroll}
              className="mt-1 w-full resize-none rounded-xl bg-paper px-3 py-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-2 outline-none placeholder:text-ink-3"
              style={{ minHeight: 44 }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {!reasonOpen && item.reason?.trim() ? (
        <button
          onClick={onToggleReason}
          className="mt-1 block min-h-[44px] w-full text-left text-[13px] leading-[18px] tracking-[0.02em] text-ink-3"
        >
          因为：{item.reason.trim()}
        </button>
      ) : !reasonOpen ? (
        <button
          onClick={onToggleReason}
          className="mt-1 flex min-h-[44px] items-center text-[13px] leading-[18px] tracking-[0.02em] text-clay-500"
        >
          + 为什么会发生？
        </button>
      ) : null}
    </motion.section>
  );
}
