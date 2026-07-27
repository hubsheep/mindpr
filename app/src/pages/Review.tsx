import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { format, parseISO, addDays, getISOWeek } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  useWeeklyReview,
  useWeeklyReviews,
  useWho5ForWeek,
  useWho5,
  useEntriesRange,
  useMoodCheckins,
  useStreak,
  saveWho5,
  saveWeeklyReview,
} from "@/db/hooks";
import {
  getTrainingDate,
  getWeekId,
  type DailyEntry,
  type MoodCheckin,
  type ReviewPlan,
  type Who5Record,
} from "@/db/schema";
import { isDayLit } from "@/db/streak";
import WarmButton from "@/components/Button";
import CheckDraw from "@/components/CheckDraw";
import Toast from "@/components/Toast";
import { cn } from "@/lib/utils";

/**
 * 周日复盘（review.md）
 * 四态机：A 周日激活（完整三段流程）/ B 已完成（只读回顾）/ C 平日等待 / D 历史回看（?week=weekId）。
 * 三段：小胜利清单（自动汇总）→ 本周曲线回顾 + WHO-5 → 下周 if-then 计划。
 * 灵魂类内容只记 ✓/✗，永不显示分数、评级、排名。
 */

const SOFT_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

/** WHO-5 题干（review.md §3.3 原文） */
const WHO5_QUESTIONS = [
  "我感到愉快，心情好",
  "我感到平静和放松",
  "我感到精力充沛",
  "我醒来时感到神清气爽",
  "我的日常生活充满了我感兴趣的事情",
];
const SCALE_LABEL = "0 从未 · 1 偶尔 · 2 少于一半 · 3 多于一半 · 4 大部分时间 · 5 一直";
const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function weekRangeLabel(weekId: string): string {
  const start = parseISO(weekId);
  return `${format(start, "M月d日")} – ${format(addDays(start, 6), "M月d日")}`;
}

interface WinData {
  wins: string[];
  /** 本周好事原文回显（1–2 条，截断 40 字） */
  quotes: string[];
}

/** 小胜利清单：由真实完成记录自动汇总（无模拟数据） */
function buildWins(
  entries: DailyEntry[],
  checkins: MoodCheckin[],
  streakCurrent: number,
): WinData {
  const wins: string[] = [];
  const mindfulness = entries.filter((e) => e.mindfulnessDone).length;
  if (mindfulness > 0) wins.push(`正念练习 × ${mindfulness}`);
  const sigh = entries.filter((e) => e.sighDone).length;
  if (sigh > 0) wins.push(`循环叹息 × ${sigh}`);
  if (checkins.length > 0) wins.push(`情绪签到 × ${checkins.length}`);
  const todoDays = entries.filter((e) => e.todoDone).length;
  if (todoDays > 0) wins.push(`写下 ${todoDays} 天的明日计划`);
  const gratAll = entries.flatMap((e) => e.gratitudes.map((g) => g.text));
  if (gratAll.length > 0) wins.push(`记录 ${gratAll.length} 件好事`);
  if (streakCurrent > 0) wins.push(`连续点亮 ${streakCurrent} 天`);
  const quotes = gratAll
    .slice(-2)
    .map((t) => (t.length > 40 ? `${t.slice(0, 40)}…` : t));
  return { wins, quotes };
}

/** 小胜利清单行的 ✓：逐个描边（间隔 90ms） */
function WinCheck({ delay }: { delay: number }) {
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" className="shrink-0">
      <motion.circle
        cx="10"
        cy="10"
        r={r}
        stroke="#8FA08A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ delay, duration: 0.25, ease: "easeOut" }}
      />
      <motion.path
        d="M6 10.2 L9 13 L14.5 7"
        stroke="#8FA08A"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.22, duration: 0.18, ease: "easeOut" }}
      />
    </svg>
  );
}

/** 顶部横幅（状态 A/B/C/D 共用） */
function Banner() {
  return (
    <motion.img
      src={`${import.meta.env.BASE_URL}review-banner.svg`}
      alt=""
      className="mt-4 aspect-[16/5] w-full rounded-[20px] object-cover"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 0.9, scale: 1, transition: { duration: 0.6, ease: SOFT_OUT } }}
    />
  );
}

/** 段卡入场：入视口 20% 触发上浮淡入 */
function SectionMotion({
  index,
  className,
  children,
}: {
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{
        opacity: 1,
        y: 0,
        transition: { delay: 0.15 * index, duration: 0.45, ease: SOFT_OUT },
      }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.section>
  );
}

/** 第一段：小胜利清单（自动汇总，只读） */
function WinsCard({ data }: { data: WinData }) {
  return (
    <SectionMotion
      index={0}
      className="rounded-[20px] bg-sage-100/60 p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]"
    >
      <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
        这一周，你做到的小事
      </h2>
      <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
        由你的完成记录自动生成
      </p>
      {data.wins.length === 0 ? (
        <p className="mt-4 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
          这一周很安静。安静的一周，也是一周。
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {data.wins.map((w, i) => (
            <motion.li
              key={w}
              className="flex items-center gap-2.5"
              initial={{ opacity: 0, x: -12 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { delay: 0.3 + 0.09 * i, duration: 0.35, ease: SOFT_OUT },
              }}
            >
              <WinCheck delay={0.3 + 0.09 * i} />
              <span className="text-[15px] leading-[24px] tracking-[0.01em] text-ink tnum">
                {w}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
      {data.quotes.map((q, i) => (
        <p
          key={i}
          className="font-quote mt-3 text-[17px] leading-[28px] tracking-[0.04em] text-dusk-500"
        >
          “{q}”
        </p>
      ))}
    </SectionMotion>
  );
}

/** 迷你情绪折线图（近 7 天签到评分，断点留空） */
function MoodMiniChart({
  weekStart,
  checkins,
}: {
  weekStart: Date;
  checkins: MoodCheckin[];
}) {
  const data = useMemo(
    () =>
      DAY_LABELS.map((label, i) => {
        const d = format(addDays(weekStart, i), "yyyy-MM-dd");
        const dayItems = checkins.filter((c) => c.date === d);
        return {
          label,
          score: dayItems.length
            ? dayItems.reduce((a, c) => a + c.score, 0) / dayItems.length
            : null,
        };
      }),
    [weekStart, checkins],
  );

  if (checkins.length === 0) {
    return (
      <div className="mt-4 flex flex-col items-center py-2">
        <img src={`${import.meta.env.BASE_URL}empty-chart.svg`} alt="" className="w-full max-w-[280px]" />
        <p className="mt-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
          完成几天练习后，这里会长出曲线
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4" style={{ height: 140 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid
            vertical={false}
            stroke="rgba(227,220,208,.5)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#A79E90" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis domain={[0, 5]} hide />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#AE7E5E"
            strokeWidth={2.5}
            dot={false}
            connectNulls={false}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** WHO-5 量表（可填写 / 只读回显） */
function Who5Block({
  record,
  scores,
  onSelect,
}: {
  /** 已有记录 → 只读回显 */
  record?: Who5Record;
  scores: (number | null)[];
  onSelect: (q: number, v: number) => void;
}) {
  const readonly = record !== undefined;
  return (
    <div>
      <p className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
        以下 5 句话，请按过去两周的感受打分。结果会进入你的周趋势。
      </p>
      {readonly && (
        <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-sage-600">
          本周已填写
        </p>
      )}
      <div className="mt-3 space-y-4">
        {WHO5_QUESTIONS.map((q, qi) => {
          const value = readonly ? record.scores[qi] : scores[qi];
          return (
            <motion.div
              key={qi}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.07 * qi, duration: 0.35, ease: SOFT_OUT },
              }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <p className="text-[15px] leading-[24px] tracking-[0.01em] text-ink">
                {q}
              </p>
              <div className="mt-2 flex justify-between">
                {[0, 1, 2, 3, 4, 5].map((v) => {
                  const selected = value === v;
                  return (
                    <motion.button
                      key={v}
                      type="button"
                      disabled={readonly}
                      onClick={() => onSelect(qi, v)}
                      aria-label={`${q}：${v} 分`}
                      animate={{ scale: selected ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18 }}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] text-[13px] tnum transition-colors duration-200",
                        selected
                          ? "border-sage-600 bg-sage-600 text-card"
                          : "border-line bg-card text-ink-3",
                        !readonly && !selected && "active:border-sage-500",
                      )}
                    >
                      {v}
                    </motion.button>
                  );
                })}
              </div>
              {qi === 0 && (
                <p className="mt-2 text-[11px] font-medium leading-[16px] tracking-[0.08em] text-ink-3">
                  {SCALE_LABEL}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/** if-then 输入聚焦滚动居中（键盘弹出后控件可见） */
function focusScroll(e: React.FocusEvent<HTMLElement>) {
  const el = e.target;
  window.setTimeout(() => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 300);
}

const PLAN_PLACEHOLDERS = [
  { if: "如果周一早上很匆忙", then: "那么我就前一晚把衣服放好" },
  { if: "如果周三感到疲惫", then: "那么我就先做一次循环叹息" },
  { if: "如果周末想偷懒", then: "那么我就只写一件好事" },
];

/** 第三段：下周 if-then 计划（可填写 / 只读 serif 卡） */
function PlansBlock({
  readonly,
  saved,
  plans,
  slots,
  onChange,
  onAddSlot,
}: {
  readonly: boolean;
  saved: ReviewPlan[];
  plans: ReviewPlan[];
  slots: number;
  onChange: (i: number, part: "if" | "then", v: string) => void;
  onAddSlot: () => void;
}) {
  if (readonly) {
    return (
      <div className="mt-4 space-y-3">
        {saved.length === 0 ? (
          <p className="text-[15px] leading-[24px] tracking-[0.01em] text-ink-3">
            这一周没有留下约定。
          </p>
        ) : (
          saved.map((p, i) => (
            <motion.div
              key={i}
              className="rounded-[14px] bg-paper p-4"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.1 * i, duration: 0.35, ease: SOFT_OUT },
              }}
              viewport={{ once: true, amount: 0.4 }}
            >
              <p className="font-quote text-[17px] leading-[28px] tracking-[0.04em] text-ink">
                如果{p.if}，那么我就{p.then}。
              </p>
            </motion.div>
          ))
        )}
      </div>
    );
  }
  return (
    <div className="mt-4 space-y-3">
      {plans.slice(0, slots).map((p, i) => (
        <motion.div
          key={i}
          className="rounded-[14px] bg-paper p-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.1 * i, duration: 0.25, ease: SOFT_OUT },
          }}
        >
          <label className="block text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
            如果
          </label>
          <input
            value={p.if}
            placeholder={PLAN_PLACEHOLDERS[i].if}
            onChange={(e) => onChange(i, "if", e.target.value)}
            onFocus={focusScroll}
            className="mt-1 h-11 w-full rounded-xl bg-card px-3 text-[15px] leading-[24px] tracking-[0.01em] text-ink outline-none transition-shadow placeholder:text-ink-3 focus:ring-2 focus:ring-clay-500"
          />
          <label className="mt-2 block text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
            那么我就
          </label>
          <input
            value={p.then}
            placeholder={PLAN_PLACEHOLDERS[i].then}
            onChange={(e) => onChange(i, "then", e.target.value)}
            onFocus={focusScroll}
            className="mt-1 h-11 w-full rounded-xl bg-card px-3 text-[15px] leading-[24px] tracking-[0.01em] text-ink outline-none placeholder:text-ink-3 focus:ring-2 focus:ring-clay-500"
          />
        </motion.div>
      ))}
      {slots < 3 && (
        <button
          onClick={onAddSlot}
          className="flex min-h-[44px] items-center text-[15px] font-medium leading-[24px] tracking-[0.01em] text-clay-500"
        >
          + 再写一个约定
        </button>
      )}
    </div>
  );
}

/** 历史复盘列表（状态 B/C 常驻，最多近 12 周） */
function HistoryList({
  reviews,
  litByWeek,
  who5ByWeek,
  onOpen,
}: {
  reviews: { weekId: string }[];
  litByWeek: Map<string, number>;
  who5ByWeek: Map<string, number>;
  onOpen: (weekId: string) => void;
}) {
  if (reviews.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
        过去的周
      </h2>
      <ul className="mt-2">
        {reviews.map((r, i) => {
          const lit = litByWeek.get(r.weekId) ?? 0;
          const total = who5ByWeek.get(r.weekId);
          return (
            <motion.li
              key={r.weekId}
              initial={{ opacity: 0, x: -8 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { delay: 0.06 * i, duration: 0.3, ease: SOFT_OUT },
              }}
            >
              <button
                onClick={() => onOpen(r.weekId)}
                className="flex min-h-[64px] w-full items-center justify-between border-b border-line px-1 text-left transition-colors duration-150 active:bg-paper-deep"
              >
                <span>
                  <span className="block text-[13px] font-semibold leading-[18px] tracking-[0.02em] text-ink">
                    {weekRangeLabel(r.weekId)}
                  </span>
                  <span className="mt-0.5 block text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
                    点亮 {lit} 天{total !== undefined ? ` · WHO-5 ${total} 分` : ""}
                  </span>
                </span>
                <ChevronRight size={16} strokeWidth={1.8} className="shrink-0 text-ink-3" />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

// ————————————————————————————
// 页面主体：四态机
// ————————————————————————————

export default function Review() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const weekParam = searchParams.get("week");

  const now = new Date();
  const todayStr = getTrainingDate(now);
  const currentWeekId = getWeekId(now);
  const isSunday = now.getDay() === 0;

  const activeWeekId = weekParam ?? currentWeekId;
  const weekStart = useMemo(() => parseISO(activeWeekId), [activeWeekId]);
  const weekEndStr = format(addDays(weekStart, 6), "yyyy-MM-dd");

  const currentReview = useWeeklyReview(currentWeekId);
  const activeReview = useWeeklyReview(activeWeekId);
  const allReviews = useWeeklyReviews();
  const activeWho5 = useWho5ForWeek(activeWeekId);
  const currentWho5 = useWho5ForWeek(currentWeekId);
  const allWho5 = useWho5();
  const weekEntries = useEntriesRange(activeWeekId, weekEndStr);
  const allCheckins = useMoodCheckins();
  const { state: streak } = useStreak(todayStr);

  // 历史列表（近 12 周已完成的复盘，排除当前查看周）
  const history = useMemo(
    () =>
      allReviews
        .filter((r) => r.completed && r.weekId !== activeWeekId)
        .sort((a, b) => b.weekId.localeCompare(a.weekId))
        .slice(0, 12),
    [allReviews, activeWeekId],
  );
  const historyFrom = history.length ? history[history.length - 1].weekId : todayStr;
  const historyEntries = useEntriesRange(historyFrom, todayStr);
  const litByWeek = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of historyEntries) {
      if (!isDayLit(e)) continue;
      const wid = getWeekId(e.date);
      m.set(wid, (m.get(wid) ?? 0) + 1);
    }
    return m;
  }, [historyEntries]);
  const who5ByWeek = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of allWho5) m.set(r.weekId, r.total);
    return m;
  }, [allWho5]);

  // 本周签到（迷你曲线）
  const weekCheckins = useMemo(
    () => allCheckins.filter((c) => c.date >= activeWeekId && c.date <= weekEndStr),
    [allCheckins, activeWeekId, weekEndStr],
  );

  // 小胜利：状态 A 实时汇总；B/D 展示存档 + 原文回显实时计算
  const liveWins = useMemo(
    () => buildWins(weekEntries, weekCheckins, streak.current),
    [weekEntries, weekCheckins, streak.current],
  );

  // —— 状态机 ——
  const mode: "A" | "B" | "C" | "D" = weekParam
    ? "D"
    : currentReview?.completed
      ? "B"
      : isSunday
        ? "A"
        : "C";
  const readonly = mode === "B" || mode === "D";

  // —— 表单态（仅状态 A 使用）——
  const [whoScores, setWhoScores] = useState<(number | null)[]>([
    null, null, null, null, null,
  ]);
  const [plans, setPlans] = useState<ReviewPlan[]>([
    { if: "", then: "" },
    { if: "", then: "" },
    { if: "", then: "" },
  ]);
  const [slots, setSlots] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [doneOpen, setDoneOpen] = useState(false);
  const [careToast, setCareToast] = useState(false);

  const whoMissing = currentWho5
    ? 0
    : whoScores.filter((s) => s === null).length;
  const validPlans = plans.filter((p) => p.if.trim() && p.then.trim());
  const canSubmit = whoMissing === 0 && validPlans.length >= 1;

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      let total: number | null = null;
      if (!currentWho5) {
        const scores = whoScores.map((s) => s ?? 0);
        await saveWho5(scores, currentWeekId);
        total = scores.reduce((a, b) => a + b, 0);
      }
      await saveWeeklyReview(currentWeekId, liveWins.wins, validPlans, true);
      setDoneOpen(true);
      // ≤13：一次性温柔关怀（非阻断、非诊断、可关闭）
      if (total !== null && total <= 13) setCareToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  const displayWins: WinData = readonly
    ? { wins: activeReview?.wins ?? [], quotes: liveWins.quotes }
    : liveWins;

  // —— 状态 C：平日等待 ——
  if (mode === "C") {
    const daysToSunday = (7 - now.getDay()) % 7;
    return (
      <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 className="text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink">
          周日复盘
        </h1>
        <Banner />
        <motion.div
          className="mt-4 rounded-[20px] bg-card p-5 text-center shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.2, duration: 0.4, ease: SOFT_OUT },
          }}
        >
          <img src={`${import.meta.env.BASE_URL}seg-evening.svg`} alt="" width={40} height={40} className="mx-auto" />
          <h2 className="mt-3 text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
            周日见
          </h2>
          <p className="mt-2 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
            复盘在每周日解锁。今天，先把日子过好。
          </p>
          <p className="mt-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
            还有 {daysToSunday} 天
          </p>
        </motion.div>
        <HistoryList
          reviews={history}
          litByWeek={litByWeek}
          who5ByWeek={who5ByWeek}
          onOpen={(wid) => navigate(`/review?week=${wid}`)}
        />
      </div>
    );
  }

  // —— 状态 A / B / D ——
  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      {mode === "D" && (
        <button
          onClick={() => navigate("/review")}
          className="flex min-h-[44px] items-center gap-1 text-[15px] font-medium leading-[24px] tracking-[0.01em] text-clay-500"
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
          返回复盘
        </button>
      )}
      <header className="flex items-center gap-3">
        <h1 className="flex-1 text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink">
          本周复盘
        </h1>
        {readonly && activeReview?.completed && (
          <span className="flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-[11px] font-medium leading-[16px] tracking-[0.08em] text-sage-600">
            <Check size={12} strokeWidth={2.4} />
            已完成
          </span>
        )}
      </header>
      <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
        {weekRangeLabel(activeWeekId)} · 第 {getISOWeek(weekStart)} 周
      </p>
      <Banner />

      <div className="mt-8 space-y-8">
        {/* 第一段：小胜利清单 */}
        <WinsCard data={displayWins} />

        {/* 第二段：本周曲线回顾 + WHO-5 */}
        <SectionMotion
          index={1}
          className="rounded-[20px] bg-card p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]"
        >
          <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
            回看这一周的心情曲线
          </h2>
          <MoodMiniChart weekStart={weekStart} checkins={weekCheckins} />
          <p className="mt-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
            这是曲线，不是评语。
          </p>
          <div className="my-5 h-px bg-line" />
          <Who5Block
            record={activeWho5}
            scores={whoScores}
            onSelect={(q, v) =>
              setWhoScores((arr) => arr.map((s, i) => (i === q ? v : s)))
            }
          />
        </SectionMotion>

        {/* 第三段：下周 if-then 计划 */}
        <SectionMotion
          index={2}
          className="rounded-[20px] bg-card p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]"
        >
          <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
            给下周的三个约定
          </h2>
          <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
            用「如果……那么我就……」的句式。写 1 个也很好。
          </p>
          <PlansBlock
            readonly={readonly}
            saved={activeReview?.plans ?? []}
            plans={plans}
            slots={slots}
            onChange={(i, part, v) =>
              setPlans((arr) => arr.map((p, j) => (j === i ? { ...p, [part]: v } : p)))
            }
            onAddSlot={() => setSlots((n) => Math.min(3, n + 1))}
          />
        </SectionMotion>
      </div>

      {/* 提交区 / 已完成标注 */}
      {mode === "A" ? (
        <div className="mt-6">
          {!canSubmit && (
            <p className="mb-2 text-center text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
              {whoMissing > 0
                ? `还有 ${whoMissing} 道题没有评分`
                : "写下一个约定就好"}
            </p>
          )}
          <WarmButton
            className={cn(
              "w-full transition-colors duration-300",
              !canSubmit && "bg-ink-3/30 text-card",
            )}
            disabled={!canSubmit}
            loading={submitting}
            onClick={onSubmit}
          >
            收好这一周
          </WarmButton>
        </div>
      ) : (
        activeReview?.completed && (
          <p className="mt-6 text-center text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
            复盘已完成 · {format(activeReview.updatedAt, "M月d日")}
          </p>
        )
      )}

      {/* 历史复盘列表（状态 B 常驻） */}
      {mode === "B" && (
        <HistoryList
          reviews={history}
          litByWeek={litByWeek}
          who5ByWeek={who5ByWeek}
          onOpen={(wid) => navigate(`/review?week=${wid}`)}
        />
      )}

      {/* 提交完成仪式屏（全屏过渡页） */}
      <AnimatePresence>
        {doneOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-paper px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <div className="w-full max-w-[320px] text-center">
              <motion.img
                src={`${import.meta.env.BASE_URL}review-banner.svg`}
                alt=""
                className="aspect-[16/5] w-full rounded-[20px] object-cover"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.9, y: 0, transition: { duration: 0.4, ease: SOFT_OUT } }}
              />
              <motion.div
                className="mt-5 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.15 } }}
              >
                <CheckDraw size={56} />
              </motion.div>
              <motion.h2
                className="mt-4 text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.5, duration: 0.4, ease: SOFT_OUT },
                }}
              >
                这一周，收好了
              </motion.h2>
              <motion.p
                className="font-quote mt-3 text-[17px] leading-[28px] tracking-[0.04em] text-dusk-500"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.62, duration: 0.4, ease: SOFT_OUT },
                }}
              >
                感谢这一周的自己。下周见。
              </motion.p>
              <motion.div
                className="mt-6 space-y-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.9, duration: 0.4, ease: SOFT_OUT },
                }}
              >
                <WarmButton className="w-full" onClick={() => navigate("/")}>
                  回到今天
                </WarmButton>
                <WarmButton
                  variant="ghost"
                  className="w-full"
                  onClick={() => setDoneOpen(false)}
                >
                  看看本周复盘
                </WarmButton>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WHO-5 ≤13 一次性温柔关怀（非阻断、可关闭） */}
      <Toast
        open={careToast}
        message="这两周似乎有些吃力。请对自己格外温柔一些，必要时，也值得和信任的人或专业人士聊聊。"
        onClose={() => setCareToast(false)}
        duration={6000}
      />
    </div>
  );
}
