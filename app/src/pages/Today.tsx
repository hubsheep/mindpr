import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useToday, useStreak, useDayCheckins, saveIntention } from "@/db/hooks";
import { getTrainingDate } from "@/db/schema";
import { entrySegments, entryDots, consumeFreezeToast, dismissRecovery, kvGet, kvSet } from "@/db/streak";
import StreakPill from "@/components/StreakPill";
import SectionCard, { type Segment, type SectionState } from "@/components/SectionCard";
import PracticeRow from "@/components/PracticeRow";
import Sheet from "@/components/Sheet";
import Toast from "@/components/Toast";
import WarmButton from "@/components/Button";
import { cn } from "@/lib/utils";

/** 当前时段：晨 05:00–11:59 / 日 12:00–17:59 / 晚 18:00–04:59 */
function currentSegment(now: Date = new Date()): Segment {
  const h = now.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 18) return "day";
  return "evening";
}

const GREETING: Record<Segment, string> = {
  morning: "早上好",
  day: "下午好",
  evening: "晚上好",
};

/** 每日一句：30 句平静句子池（today.md §9，本地常量，按日期轮换） */
const DAILY_QUOTES = [
  "慢慢来，比较快。",
  "你不需要成为别人，只需要回到自己。",
  "呼吸是最短的回家路。",
  "今天只要照顾好今天。",
  "休息也是训练的一部分。",
  "念头来了，看见它，就够了。",
  "不必完美，只要在场。",
  "心里的事，写下来就轻了一半。",
  "一刻的安静，也是收获。",
  "把注意力放在能做的事上。",
  "感恩不是任务，是回头看一眼。",
  "混乱的时候，先回到呼吸。",
  "你已经比想象中更稳了。",
  "一天三段，照顾自己三次。",
  "温柔地对待自己，也需要练习。",
  "今天的你，只需要今天的力气。",
  "小事做完，心就定了。",
  "方向比速度重要。",
  "允许一切如其所是。",
  "静下来，答案会自己浮上来。",
  "先安顿身体，再安顿事情。",
  "每一个当下，都可以重新开始。",
  "不急，一件事一件事来。",
  "被照顾好的心，才有余裕照顾别人。",
  "睡前原谅一切，醒来不问过往。",
  "专注是一种温柔的坚定。",
  "你走的每一步都算数。",
  "心里的空地，留给重要的东西。",
  "安静不是空白，是丰盈。",
  "今天也要好好地，被自己善待。",
];

/** 意图示例（可点击自动填入） */
const INTENTION_EXAMPLES = [
  { if: "通勤时感到烦躁", then: "听一段安静的音乐" },
  { if: "晚上想熬夜", then: "先把灯调暗" },
];

const SOFT_OUT = [0.22, 1, 0.36, 1] as [number, number, number, number];

export default function Today() {
  const navigate = useNavigate();
  const date = getTrainingDate();
  const { entry } = useToday(date);
  const { state: streak, justLitToday, freezesLeft } = useStreak(date);
  const checkins = useDayCheckins(date);

  const segment = currentSegment();
  const segments = entrySegments(entry);
  const dots = entryDots(entry);

  // —— 弹层与提示状态 ——
  const [rulesOpen, setRulesOpen] = useState(false);
  const [intentionOpen, setIntentionOpen] = useState(false);
  const [freezeToast, setFreezeToast] = useState(false);
  const [recoveryVisible, setRecoveryVisible] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  // 慈悲卡：pendingRecovery 且 24h 内未完成任意一项时展示
  useEffect(() => {
    if (!streak.pendingRecovery) {
      setRecoveryVisible(false);
      return;
    }
    const anyDone = dots.some(Boolean);
    if (anyDone) {
      void dismissRecovery();
      setRecoveryVisible(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const shownAt = (await kvGet<number>("recoveryShownAt")) ?? 0;
      const now = Date.now();
      if (now - shownAt > 24 * 3600 * 1000) {
        await kvSet("recoveryShownAt", now);
        if (!cancelled) setRecoveryVisible(true);
      } else if (shownAt === 0) {
        await kvSet("recoveryShownAt", now);
        if (!cancelled) setRecoveryVisible(true);
      } else {
        if (!cancelled) setRecoveryVisible(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak.pendingRecovery, dots.join("")]);

  // freeze 自动补位：次日 Toast 轻声告知
  useEffect(() => {
    void consumeFreezeToast().then((n) => {
      if (n > 0) setFreezeToast(true);
    });
  }, []);

  // 点亮庆祝：只庆祝一次
  useEffect(() => {
    if (justLitToday) setCelebrated(true);
  }, [justLitToday]);

  // 日期与问候语
  const dateCaption = format(parseISO(date), "M月d日 EEEE", { locale: zhCN });
  const greeting = GREETING[segment];

  // 每日一句（按训练日轮换）
  const quote = useMemo(() => {
    const dayNum = Math.floor(parseISO(date).getTime() / 86400000);
    return DAILY_QUOTES[((dayNum % DAILY_QUOTES.length) + DAILY_QUOTES.length) % DAILY_QUOTES.length];
  }, [date]);

  // 最近一次签到摘要（「平静 · 14:32」）
  const lastCheckin = checkins[0];
  const checkinSummary = lastCheckin
    ? `${lastCheckin.word} · ${format(lastCheckin.createdAt, "HH:mm")}`
    : undefined;

  // 好事随机回显一条（serif 截断）
  const gratitudeEcho = useMemo(() => {
    if (entry.gratitudes.length === 0) return undefined;
    const idx = Math.floor(parseISO(date).getTime() / 1000) % entry.gratitudes.length;
    return `“${entry.gratitudes[idx].text}”`;
  }, [entry.gratitudes, date]);

  const intentionEcho =
    entry.intentionDone && entry.intentionIf && entry.intentionThen
      ? `如果${entry.intentionIf}，那么我就${entry.intentionThen}`
      : undefined;

  const firstRun = !streak.hasAnyRecord;

  function cardState(seg: Segment): SectionState {
    const done = segments[seg];
    if (seg === segment) return done ? "done" : "current";
    return done ? "done" : "idle";
  }

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
      {/* ———— 顶栏：日期 + 问候 · StreakPill ———— */}
      <header className="flex items-start justify-between gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: SOFT_OUT } }}
        >
          <p className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">{dateCaption}</p>
          <h1 className="mt-1 text-[28px] font-bold leading-[36px] tracking-[0.02em] text-ink">
            {greeting}
          </h1>
        </motion.div>
        <motion.div
          className="relative mt-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.12, ease: SOFT_OUT } }}
        >
          <StreakPill
            current={streak.current}
            freezesLeft={freezesLeft}
            hasAnyRecord={streak.hasAnyRecord}
            onClick={() => setRulesOpen(true)}
          />
          {/* 点亮庆祝：6 瓣陶土小花绽放（design.md §5.5） */}
          <AnimatePresence>
            {celebrated && (
              <motion.svg
                width="44"
                height="44"
                viewBox="0 0 44 44"
                className="absolute -bottom-12 left-1/2 -translate-x-1/2"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0, transition: { duration: 0.5, ease: SOFT_OUT } }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
              >
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <ellipse
                    key={deg}
                    cx="22"
                    cy="12"
                    rx="4.5"
                    ry="9"
                    fill="#AE7E5E"
                    transform={`rotate(${deg} 22 22)`}
                  />
                ))}
                <circle cx="22" cy="22" r="4" fill="#C9A876" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      {/* ———— 点亮提示 / 慈悲卡 / 欢迎卡 ———— */}
      <AnimatePresence>
        {celebrated && (
          <motion.p
            className="mt-3 text-[13px] leading-[18px] tracking-[0.02em] text-clay-600"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            今天的回路已点亮，明天见。
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {recoveryVisible && (
          <motion.div
            className="mt-4 rounded-[20px] bg-dusk-100 p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.4, ease: SOFT_OUT } }}
            exit={{ opacity: 0, height: 0, marginTop: 0, transition: { duration: 0.3 } }}
          >
            <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
              欢迎回来
            </h2>
            <p className="mt-1 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
              休息也是训练的一部分。这次我原谅你——累计的{" "}
              <span className="tnum font-semibold text-dusk-500">{streak.totalDays}</span>{" "}
              天一直都在，我们轻轻继续。
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {firstRun && (
          <motion.div
            className="mt-4 rounded-[20px] bg-clay-100 p-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: SOFT_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
              从今天开始
            </h2>
            <p className="mt-1 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
              每天三个小段，照顾你的大脑、心智与灵魂。先做第一件事就好。
            </p>
            <WarmButton className="mt-4 w-full" onClick={() => setIntentionOpen(true)}>
              填写今日意图
            </WarmButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ———— 当日回路进度：6 圆点 ———— */}
      <motion.div
        className="mt-6 flex h-7 items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.2 } }}
      >
        <span className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">今日回路</span>
        <div className="flex items-center gap-2.5">
          {dots.map((done, i) => (
            <motion.span
              key={i}
              className={cn(
                "h-2 w-2 rounded-full",
                done
                  ? i < 2
                    ? "bg-clay-500"
                    : i < 4
                      ? "bg-sage-600"
                      : "bg-dusk-500"
                  : "border border-line bg-transparent",
              )}
              animate={done ? { scale: [0, 1.4, 1] } : { scale: 1 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            />
          ))}
        </div>
      </motion.div>

      {/* ———— 三段卡片流（stagger 90ms 入场） ———— */}
      <motion.div
        className="mt-4 flex flex-col gap-4"
        initial="hidden"
        whileInView="show"
        viewport={{ amount: 0.2, once: true }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.09 } },
        }}
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } },
          }}
        >
          <SectionCard
            segment="morning"
            title="晨间 · 意图与正念"
            caption="用十分钟，为今天定一个方向"
            state={cardState("morning")}
          >
            <PracticeRow
              title="今日意图"
              caption="如果____，那么我就____"
              done={entry.intentionDone}
              echo={intentionEcho}
              actionLabel="填写"
              onAction={() => setIntentionOpen(true)}
            />
            <PracticeRow
              title="正念练习"
              caption="10 分钟 · 文字引导 · 无音频"
              done={entry.mindfulnessDone}
              onAction={() => navigate("/practice/mindfulness")}
            />
          </SectionCard>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } },
          }}
        >
          <SectionCard
            segment="day"
            title="日间 · 重置与觉察"
            caption="下午混乱时，先回到呼吸"
            state={cardState("day")}
          >
            <PracticeRow
              title="循环叹息"
              caption="1 分钟 · 快速重置 · 两次吸气一次长呼"
              done={entry.sighDone}
              onAction={() => navigate("/practice/sigh")}
            />
            <PracticeRow
              title="情绪签到"
              caption="此刻的我，是什么颜色"
              done={entry.checkinDone}
              doneCaption={checkinSummary ?? "已完成"}
              doneActionLabel="再签一次"
              actionLabel="签到"
              onAction={() => navigate("/checkin")}
            />
          </SectionCard>
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, y: 24 },
            show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: SOFT_OUT } },
          }}
        >
          <SectionCard
            segment="evening"
            title="晚间 · 卸载与感恩"
            caption="把明天交给纸面，把今天交给感谢"
            state={cardState("evening")}
          >
            <PracticeRow
              title="明日三件事"
              caption="前瞻卸载 · 写下来，今晚不再想"
              done={entry.todoDone}
              doneCaption={`已卸载 ${entry.todoItems.length} 件`}
              actionLabel="写下"
              onAction={() => navigate("/evening?tab=todo")}
            />
            <PracticeRow
              title="三件好事"
              caption="今天值得感谢的三个瞬间"
              done={entry.gratitudeDone}
              echo={gratitudeEcho}
              actionLabel="记录"
              onAction={() => navigate("/evening?tab=gratitude")}
            />
          </SectionCard>
        </motion.div>
      </motion.div>

      {/* ———— 底部每日一句（serif，入视口 80% 淡入 600ms） ———— */}
      <motion.p
        className="font-quote mt-10 pb-4 text-center text-[17px] leading-[28px] tracking-[0.04em] text-ink-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 0.6 } }}
        viewport={{ amount: 0.8, once: true }}
      >
        {quote}
      </motion.p>

      {/* ———— freeze 补位 Toast ———— */}
      <Toast
        open={freezeToast}
        message="昨天的空缺已被自动补位"
        onClose={() => setFreezeToast(false)}
      />

      {/* ———— Streak 规则 Sheet ———— */}
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

      {/* ———— 意图输入 Sheet ———— */}
      <IntentionSheet
        open={intentionOpen}
        onClose={() => setIntentionOpen(false)}
        date={date}
        initialIf={entry.intentionIf ?? ""}
        initialThen={entry.intentionThen ?? ""}
      />
    </div>
  );
}

// ————————————————————————————
// 意图输入 Sheet（today.md §4.1）
// ————————————————————————————

function IntentionSheet({
  open,
  onClose,
  date,
  initialIf,
  initialThen,
}: {
  open: boolean;
  onClose: () => void;
  date: string;
  initialIf: string;
  initialThen: string;
}) {
  const [ifPart, setIfPart] = useState(initialIf);
  const [thenPart, setThenPart] = useState(initialThen);
  const [saving, setSaving] = useState(false);

  // 每次打开时同步已保存内容
  useEffect(() => {
    if (open) {
      setIfPart(initialIf);
      setThenPart(initialThen);
      setSaving(false);
    }
  }, [open, initialIf, initialThen]);

  const valid = ifPart.trim().length > 0 && thenPart.trim().length > 0;

  async function submit() {
    if (!valid || saving) return;
    setSaving(true);
    await saveIntention(date, ifPart, thenPart);
    // 按钮文字变 ✓「已记住」150ms 后收起
    setTimeout(onClose, 400);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="写下今天的 if-then 意图"
      footer={
        <WarmButton className="w-full" disabled={!valid} loading={saving} onClick={submit}>
          {saving ? "✓ 已记住" : "记住这个意图"}
        </WarmButton>
      }
    >
      <p className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
        把最想守护的一件事，写成一个具体情境
      </p>

      <motion.div
        className="mt-5 flex flex-col gap-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {[
          {
            prefix: "如果",
            value: ifPart,
            set: setIfPart,
            placeholder: "到了下午想刷手机时",
          },
          {
            prefix: "那么我就",
            value: thenPart,
            set: setThenPart,
            placeholder: "先做三次深呼吸，再决定",
          },
        ].map((f) => (
          <motion.label
            key={f.prefix}
            className="flex h-[52px] items-center gap-2 rounded-[12px] border border-line bg-card px-4 focus-within:border-clay-500 focus-within:shadow-[0_0_0_4px_#F1E5D8]"
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: SOFT_OUT } },
            }}
          >
            <span className="shrink-0 text-[15px] font-semibold leading-[24px] text-clay-600">
              {f.prefix}
            </span>
            <input
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              onFocus={(e) =>
                setTimeout(() => e.target.scrollIntoView({ block: "center", behavior: "smooth" }), 300)
              }
              placeholder={f.placeholder}
              className="min-w-0 flex-1 bg-transparent text-[15px] leading-[24px] tracking-[0.01em] text-ink outline-none placeholder:text-ink-3"
            />
          </motion.label>
        ))}
      </motion.div>

      {/* 示例区：点击自动填入 */}
      <div className="mb-2 mt-5 flex flex-col gap-2">
        {INTENTION_EXAMPLES.map((ex) => (
          <button
            key={ex.if}
            onClick={() => {
              setIfPart(ex.if);
              setThenPart(ex.then);
            }}
            className="rounded-[12px] bg-paper-deep px-4 py-3 text-left text-[13px] leading-[18px] tracking-[0.02em] text-ink-2 active:bg-line"
          >
            如果{ex.if}，那么我就{ex.then}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
