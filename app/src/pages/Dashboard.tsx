import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { format, parseISO, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StreakPill from "@/components/StreakPill";
import Sheet from "@/components/Sheet";
import WarmButton from "@/components/Button";
import {
  useEntriesRange,
  useEntry,
  useMoodCheckins,
  useStreak,
  useToday,
  useWho5,
} from "@/db/hooks";
import { getTrainingDate, getWeekId, type DailyEntry } from "@/db/schema";
import { entryDots } from "@/db/streak";

/**
 * 仪表盘（dashboard.md）
 * 第一屏回答「今天的你，比昨天多做到了什么？」：
 * 对比卡（四分支文案）+ Streak 总览 + 周模块柱状图 + 7 日情绪折线 + 8 周 WHO-5 折线。
 * 图表无数据时显示空态插画，严禁模拟数据（design.md §11）。
 */

const SOFT_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

const CARD_CLASS =
  "rounded-[20px] bg-card p-5 shadow-[0_1px_2px_rgba(59,54,47,.04),0_8px_24px_rgba(59,54,47,.05)]";

const WEEKDAY_CHARS = ["日", "一", "二", "三", "四", "五", "六"];

// 6 个练习模块（与 6 圆点同序：意图/正念/叹息/签到/to-do/好事）
const MODULES: { label: string; get: (e: DailyEntry) => boolean }[] = [
  { label: "意图", get: (e) => e.intentionDone },
  { label: "正念", get: (e) => e.mindfulnessDone },
  { label: "叹息", get: (e) => e.sighDone },
  { label: "签到", get: (e) => e.checkinDone },
  { label: "to-do", get: (e) => e.todoDone },
  { label: "好事", get: (e) => e.gratitudeDone },
];

/** 数字滚动 CountUp 400ms（design.md §5.4） */
function CountUp({
  value,
  delay = 0,
  className,
}: {
  value: number;
  delay?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | undefined;
    const timer = setTimeout(() => {
      const step = (t: number) => {
        if (start === undefined) start = t;
        const p = Math.min((t - start) / 400, 1);
        setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delay * 1000);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [value, delay]);
  return <span className={className}>{display}</span>;
}

/** 图表空态：empty-chart.svg + Caption（design.md §7.7 / §11） */
function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="flex h-[180px] flex-col items-center justify-center gap-3">
      <img src="/empty-chart.svg" alt="" className="h-[96px] w-[192px]" />
      <p className="text-center text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
        {text}
      </p>
    </div>
  );
}

const axisTick = { fontSize: 11, fill: "#A79E90" } as const;

interface TipPayloadItem {
  payload?: Record<string, unknown>;
}

/** 白底 12px 圆角浮卡 Tooltip（design.md §7.7，不用默认黑框） */
function tooltipShell(children: ReactNode) {
  return (
    <div className="rounded-[12px] bg-card px-3 py-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink shadow-[0_8px_24px_rgba(59,54,47,.10)]">
      {children}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const today = getTrainingDate();
  const yesterday = format(subDays(parseISO(today), 1), "yyyy-MM-dd");
  const thisMonday = getWeekId(today);
  const prevMonday = format(subDays(parseISO(thisMonday), 7), "yyyy-MM-dd");
  const prevSunday = format(subDays(parseISO(thisMonday), 1), "yyyy-MM-dd");

  const { entry: todayEntry } = useToday(today);
  const yesterdayEntry = useEntry(yesterday);
  const { state: streak, freezesLeft } = useStreak(today);
  const twoWeekEntries = useEntriesRange(prevMonday, today);
  const checkins = useMoodCheckins();
  const who5All = useWho5();

  const [rulesOpen, setRulesOpen] = useState(false);

  // ———— 对比卡数据 ————
  const todayDots = entryDots(todayEntry);
  const yesterdayDots = entryDots(yesterdayEntry ?? null);
  const todayCount = todayDots.filter(Boolean).length;
  const yesterdayCount = yesterdayDots.filter(Boolean).length;

  // 结论句四分支（dashboard.md §3）
  const conclusion = useMemo(() => {
    if (todayCount === 0) return "今天还没开始。从最小的一件做起？";
    if (todayCount > yesterdayCount)
      return `今天已完成 ${todayCount} 项，比昨天多 ${todayCount - yesterdayCount} 项。`;
    if (todayCount === yesterdayCount) return `和昨天一样稳——${todayCount} 项已完成。`;
    return `今天做了 ${todayCount} 项。节奏慢一点，也算数。`;
  }, [todayCount, yesterdayCount]);

  // ———— 柱状图：本周 vs 前周各模块完成天数 ————
  const barData = useMemo(() => {
    const inRange = (e: DailyEntry, from: string, to: string) =>
      e.date >= from && e.date <= to;
    return MODULES.map((m) => ({
      name: m.label,
      thisWeek: twoWeekEntries.filter((e) => inRange(e, thisMonday, today) && m.get(e)).length,
      lastWeek: twoWeekEntries.filter((e) => inRange(e, prevMonday, prevSunday) && m.get(e)).length,
    }));
  }, [twoWeekEntries, thisMonday, today, prevMonday, prevSunday]);
  const barAllZero = barData.every((d) => d.thisWeek === 0 && d.lastWeek === 0);

  // ———— 折线图 1：近 7 天每日最后一次签到评分（connectNulls=false，严禁插值） ————
  const moodData = useMemo(() => {
    const latestByDate = new Map<string, (typeof checkins)[number]>();
    for (const c of checkins) {
      // checkins 为时间倒序，首次遇到即为当日最后一次
      if (!latestByDate.has(c.date)) latestByDate.set(c.date, c);
    }
    const days: {
      date: string;
      day: string;
      score: number | null;
      note?: string;
    }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(parseISO(today), i);
      const dateStr = format(d, "yyyy-MM-dd");
      const c = latestByDate.get(dateStr);
      days.push({
        date: dateStr,
        day: WEEKDAY_CHARS[d.getDay()],
        score: c ? c.score : null,
        note: c?.note,
      });
    }
    return days;
  }, [checkins, today]);
  const moodHasData = moodData.some((d) => d.score !== null);

  // ———— 折线图 2：近 8 周 WHO-5（每周取最新一条） ————
  const who5Data = useMemo(() => {
    const latestByWeek = new Map<string, number>();
    for (const r of who5All) latestByWeek.set(r.weekId, r.total);
    const weeks: { weekId: string; label: string; total: number | null }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekId = format(subDays(parseISO(thisMonday), i * 7), "yyyy-MM-dd");
      weeks.push({
        weekId,
        label: i === 0 ? "本周" : i === 1 ? "上周" : `${i}周前`,
        total: latestByWeek.get(weekId) ?? null,
      });
    }
    return weeks;
  }, [who5All, thisMonday]);
  const who5Count = who5Data.filter((d) => d.total !== null).length;

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      {/* ———— 顶栏：T1 + StreakPill（dashboard.md §2） ———— */}
      <header className="flex items-center justify-between gap-3">
        <motion.h1
          className="text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: SOFT_OUT } }}
        >
          仪表盘
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1, ease: SOFT_OUT } }}
        >
          <StreakPill
            current={streak.current}
            freezesLeft={freezesLeft}
            hasAnyRecord={streak.hasAnyRecord}
            onClick={() => setRulesOpen(true)}
          />
        </motion.div>
      </header>

      {/* ———— 对比卡：今天 vs 昨天（第一屏核心，dashboard.md §3） ———— */}
      <motion.section
        className="mt-5 rounded-[20px] bg-clay-100/60 p-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } }}
      >
        <p className="text-[13px] font-semibold leading-[18px] tracking-[0.02em] text-clay-600">
          今天 vs 昨天
        </p>
        <div className="mt-2 flex items-start gap-2">
          <h2 className="flex-1 text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-clay-600">
            {conclusion.split("").map((ch, i) => (
              <motion.span
                key={`${conclusion}-${i}`}
                className="inline-block"
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.3, delay: 0.2 + i * 0.06, ease: SOFT_OUT },
                }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </h2>
          {todayCount > yesterdayCount && todayCount > 0 && (
            <motion.span
              className="tnum mt-1 shrink-0 rounded-full bg-apricot-500 px-2 py-0.5 text-[13px] font-semibold leading-[18px] text-card"
              initial={{ scale: 0 }}
              animate={{
                scale: 1,
                transition: { type: "spring", stiffness: 500, damping: 15, delay: 0.9 },
              }}
            >
              +{todayCount - yesterdayCount}
            </motion.span>
          )}
        </div>
        {/* 明细两行：今天 N/6 + 昨天 M/6，各 6 圆点依次填充 */}
        <div className="mt-4 flex flex-col gap-2">
          {(
            [
              { label: "今天", count: todayCount, dots: todayDots, fill: "bg-clay-500" },
              { label: "昨天", count: yesterdayCount, dots: yesterdayDots, fill: "bg-ink-3" },
            ] as const
          ).map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="tnum text-[13px] leading-[18px] tracking-[0.02em] text-ink-2">
                {row.label} {row.count}/6
              </span>
              <span className="flex items-center gap-1.5">
                {row.dots.map((done, i) => (
                  <motion.span
                    key={i}
                    className={`h-2 w-2 rounded-full ${done ? row.fill : "bg-line"}`}
                    initial={{ scale: 0 }}
                    animate={{
                      scale: 1,
                      transition: { duration: 0.2, delay: 0.5 + i * 0.08, ease: SOFT_OUT },
                    }}
                  />
                ))}
              </span>
            </div>
          ))}
        </div>
        {todayCount === 0 && (
          <WarmButton
            variant="ghost"
            className="mt-3 w-full"
            onClick={() => navigate("/")}
          >
            去做今天的练习
          </WarmButton>
        )}
      </motion.section>

      {/* ———— Streak 总览卡（dashboard.md §4） ———— */}
      <motion.section
        className={`mt-4 ${CARD_CLASS}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex items-stretch">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-2">累计点亮</span>
            <span className="flex items-baseline gap-1">
              <CountUp
                value={streak.totalDays}
                className="tnum text-[28px] font-semibold leading-[36px] text-clay-500"
              />
              <span className="text-[13px] leading-[18px] text-ink-3">天</span>
            </span>
          </div>
          <div className="w-px bg-line" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-2">当前连续</span>
            <span className="flex items-baseline gap-1">
              <CountUp
                value={streak.current}
                delay={0.12}
                className="tnum text-[28px] font-semibold leading-[36px] text-sage-600"
              />
              <span className="text-[13px] leading-[18px] text-ink-3">天</span>
            </span>
          </div>
          <div className="w-px bg-line" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-2">本周补位</span>
            <span className="flex h-9 items-center gap-1.5">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  className={`h-3 w-3 rounded-full ${
                    i < freezesLeft ? "bg-apricot-500" : "border border-apricot-500/60"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: { duration: 0.25, delay: 0.24 + i * 0.12, ease: SOFT_OUT },
                  }}
                />
              ))}
            </span>
            <span className="tnum -mt-1 text-[13px] leading-[18px] text-ink-3">
              剩余 {freezesLeft}
            </span>
          </div>
        </div>
        <p className="mt-3 border-t border-line/60 pt-3 text-center text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
          断签不清零，休息不失去。
        </p>
      </motion.section>

      {/* ———— 柱状图卡：本周各模块完成量（dashboard.md §5） ———— */}
      <motion.section
        className={`mt-4 ${CARD_CLASS}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
          这一周，各模块的完成次数
        </h2>
        <p className="mt-0.5 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
          周一至今 · 与前周对比
        </p>
        {barAllZero ? (
          <ChartEmpty text="完成几天练习后，这里会长出柱子" />
        ) : (
          <>
            <div className="mt-3 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="#E3DCD0"
                    strokeOpacity={0.5}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="name"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 7]}
                    allowDecimals={false}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(227,220,208,.25)" }}
                    content={({ active, payload }: { active?: boolean; payload?: readonly TipPayloadItem[] }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as { name: string; thisWeek: number; lastWeek: number };
                      return tooltipShell(
                        <span>
                          {d.name} · 本周 {d.thisWeek} 次 / 前周 {d.lastWeek} 次
                        </span>,
                      );
                    }}
                  />
                  <Bar
                    dataKey="thisWeek"
                    fill="#AE7E5E"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={18}
                    animationDuration={500}
                  />
                  <Bar
                    dataKey="lastWeek"
                    fill="#E3CBB8"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={18}
                    animationDuration={500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* 图例两行 Micro */}
            <div className="mt-2 flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[11px] font-medium leading-[16px] tracking-[0.08em] text-ink-3">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-clay-500" />
                本周
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium leading-[16px] tracking-[0.08em] text-ink-3">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-clay-200" />
                前周
              </span>
            </div>
          </>
        )}
      </motion.section>

      {/* ———— 折线图卡 1：每日情绪评分趋势（dashboard.md §6） ———— */}
      <motion.section
        className={`mt-4 ${CARD_CLASS}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
          情绪趋势
        </h2>
        <p className="mt-0.5 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
          每日签到评分 · 近 7 天
        </p>
        {!moodHasData ? (
          <ChartEmpty text="完成几天练习后，这里会长出曲线" />
        ) : (
          <div className="mt-3 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid
                  vertical={false}
                  stroke="#E3DCD0"
                  strokeOpacity={0.5}
                  strokeDasharray="4 4"
                />
                <XAxis
                  dataKey="day"
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  domain={[1, 5]}
                  allowDecimals={false}
                  tickCount={5}
                  tick={axisTick}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }: { active?: boolean; payload?: readonly TipPayloadItem[] }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { date: string; score: number | null; note?: string };
                    if (d.score === null) return null;
                    const note = d.note
                      ? ` · “${d.note.length > 20 ? `${d.note.slice(0, 20)}…` : d.note}”`
                      : "";
                    return tooltipShell(
                      <span>
                        {format(parseISO(d.date), "M月d日")} · {d.score} 分{note}
                      </span>,
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#AE7E5E"
                  strokeWidth={2.5}
                  fill="#AE7E5E"
                  fillOpacity={0.08}
                  connectNulls={false}
                  animationDuration={900}
                  dot={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: { date: string; score: number | null };
                    key?: string;
                  }) => {
                    const { cx, cy, payload } = props;
                    if (!payload || payload.date !== today || payload.score === null || cx === undefined || cy === undefined)
                      return <g key={props.key ?? "empty"} />;
                    // 今天的数据点：6px 实心 clay-600（其余点不显示）
                    return (
                      <circle
                        key={props.key ?? "today"}
                        cx={cx}
                        cy={cy}
                        r={3}
                        fill="#96684C"
                      />
                    );
                  }}
                  activeDot={{ r: 4, fill: "#AE7E5E", stroke: "none" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.section>

      {/* ———— 折线图卡 2：WHO-5 周趋势（dashboard.md §7） ———— */}
      <motion.section
        className={`mt-4 ${CARD_CLASS}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
          幸福指数（WHO-5）
        </h2>
        <p className="mt-0.5 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
          每周一次 · 近 8 周 · 满分 25
        </p>
        {who5Count < 2 ? (
          <ChartEmpty text="完成两次周复盘后，这里会出现趋势线" />
        ) : (
          <>
            <div className="mt-3 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={who5Data} margin={{ top: 14, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid
                    vertical={false}
                    stroke="#E3DCD0"
                    strokeOpacity={0.5}
                    strokeDasharray="4 4"
                  />
                  <XAxis
                    dataKey="label"
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 25]}
                    tickCount={6}
                    tick={axisTick}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }: { active?: boolean; payload?: readonly TipPayloadItem[] }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as { label: string; total: number | null };
                      if (d.total === null) return null;
                      return tooltipShell(
                        <span>
                          {d.label} · {d.total} 分
                        </span>,
                      );
                    }}
                  />
                  {/* 13 分关注线：apricot-500 60% 虚线，中性标注 */}
                  <ReferenceLine
                    y={13}
                    stroke="#C9A876"
                    strokeOpacity={0.6}
                    strokeDasharray="6 4"
                    label={{
                      value: "13 分 · 关注线",
                      position: "insideTopRight",
                      fill: "#C9A876",
                      fontSize: 11,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#75876F"
                    strokeWidth={2.5}
                    fill="#75876F"
                    fillOpacity={0.08}
                    connectNulls={false}
                    animationDuration={900}
                    dot={(props: {
                      cx?: number;
                      cy?: number;
                      payload?: { weekId: string; total: number | null };
                      key?: string;
                    }) => {
                      const { cx, cy, payload } = props;
                      if (!payload || payload.weekId !== thisMonday || payload.total === null || cx === undefined || cy === undefined)
                        return <g key={props.key ?? "empty"} />;
                      return (
                        <circle
                          key={props.key ?? "thisweek"}
                          cx={cx}
                          cy={cy}
                          r={3}
                          fill="#75876F"
                        />
                      );
                    }}
                    activeDot={{ r: 4, fill: "#75876F", stroke: "none" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
              低于 13 分的日子，请对自己格外温柔一些
            </p>
          </>
        )}
      </motion.section>

      {/* ———— 底部一句（dashboard.md §8） ———— */}
      <motion.p
        className="mt-8 text-center text-[13px] leading-[18px] tracking-[0.02em] text-ink-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 0.5 } }}
        viewport={{ once: true, amount: 0.8 }}
      >
        数据是镜子，不是成绩单。看见就好。
      </motion.p>

      {/* ———— Streak 规则 Sheet（与今日页同一行为） ———— */}
      <Sheet
        open={rulesOpen}
        onClose={() => setRulesOpen(false)}
        title="连续天数是这样计算的"
        footer={
          <WarmButton variant="secondary" className="w-full" onClick={() => setRulesOpen(false)}>
            知道了
          </WarmButton>
        }
      >
        <ul className="flex flex-col gap-4 pb-2 pt-1">
          <li className="text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
            每天完成三段回路（每段至少一项），即点亮一天。
          </li>
          <li className="text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
            每周自动获得 2 枚补位筹码，断签时自动补上，不清零。
          </li>
          <li className="text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
            累计天数永远保留，休息不会失去它。
          </li>
        </ul>
      </Sheet>
    </div>
  );
}
