import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion, useDragControls } from "framer-motion";
import type { Variants } from "framer-motion";
import { X } from "lucide-react";
import { format } from "date-fns";
import CheckDraw from "@/components/CheckDraw";
import WarmButton from "@/components/Button";
import { addMoodCheckin, useDayCheckins } from "@/db/hooks";
import type { Quadrant } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * 情绪命名签到（checkin.md）
 * Sheet 样式全屏页：把手 + 下滑手势返回；三步流——
 * 1) 效价×唤醒象限网格选词  2) 整体状态 1–5 评分（默认 3）  3) 一句话自由命名（可空）
 * 每日可多次签到；提交调 addMoodCheckin 落库并点亮当日签到圆点，随后展示确认卡。
 */

const QUADRANTS: { key: Quadrant; label: string; positive: boolean; words: string[] }[] = [
  { key: "pleasant-high", label: "正向 · 高能量", positive: true, words: ["兴奋", "喜悦", "充满干劲", "感激", "振奋", "期待"] },
  { key: "pleasant-low", label: "正向 · 低能量", positive: true, words: ["平静", "满足", "放松", "安宁", "温柔", "踏实"] },
  { key: "unpleasant-high", label: "负向 · 高能量", positive: false, words: ["焦虑", "烦躁", "愤怒", "紧张", "心慌", "压迫感"] },
  { key: "unpleasant-low", label: "负向 · 低能量", positive: false, words: ["疲惫", "低落", "无聊", "孤独", "麻木", "无力"] },
];

const SCORE_LABELS = ["很糟", "不太好", "还好", "不错", "很好"];

/** 按当前时间预选象限（晨=正低、午后=正高、深夜=负低，checkin.md §2） */
function defaultQuadrant(): Quadrant {
  const h = new Date().getHours();
  if (h >= 22 || h < 5) return "unpleasant-low";
  if (h >= 12 && h < 18) return "pleasant-high";
  return "pleasant-low";
}

function periodOf(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "凌晨";
  if (h < 12) return "上午";
  if (h < 18) return "下午";
  return "晚上";
}

const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const chipVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function Checkin() {
  const navigate = useNavigate();
  const controls = useDragControls();
  const dayCheckins = useDayCheckins();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [quadrant, setQuadrant] = useState<Quadrant>(defaultQuadrant);
  const [word, setWord] = useState<string | null>(null);
  const [score, setScore] = useState(3);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [doneAt, setDoneAt] = useState<number | null>(null);
  const [kb, setKb] = useState(0);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const qMeta = QUADRANTS.find((q) => q.key === quadrant) ?? QUADRANTS[0];

  // 键盘弹出时底部按钮区随之上抬，「完成签到」永远可见（checkin.md §4 键盘红线）
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setKb(Math.max(0, window.innerHeight - vv.height - vv.offsetTop));
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  const goStep = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const submit = async () => {
    if (!word || submitting || doneAt) return;
    setSubmitting(true);
    try {
      await addMoodCheckin({
        word,
        valence: qMeta.positive ? "pleasant" : "unpleasant",
        arousal: quadrant.endsWith("high") ? "high" : "low",
        quadrant,
        score,
        note: note.trim() || undefined,
      });
      setDoneAt(Date.now());
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (step === 0) {
      if (word) goStep(1);
    } else if (step === 1) {
      goStep(2);
    } else {
      void submit();
    }
  };

  const doneDate = doneAt ? new Date(doneAt) : null;
  const quote = note.trim() || word || "";

  return (
    <motion.div
      className="fixed inset-0 z-40 mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col rounded-t-[24px] bg-paper"
      initial={{ y: "100%" }}
      animate={{ y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={(_, info) => {
        if (info.offset.y > 80 || info.velocity.y > 400) navigate("/");
      }}
    >
      {/* 把手 + 头部（此区域可下滑返回） */}
      <div
        className="shrink-0 touch-none select-none"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
        onPointerDown={(e) => controls.start(e)}
      >
        <div className="flex justify-center pb-1 pt-3">
          <div className="h-1 w-9 rounded-full bg-line" />
        </div>
        <div className="flex items-center justify-between px-5 pb-2 pt-1">
          <div>
            <h1 className="text-[22px] font-semibold leading-[30px] tracking-[0.02em] text-ink">
              此刻的我
            </h1>
            {!doneAt && dayCheckins.length > 0 && (
              <p className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
                今天第 {dayCheckins.length + 1} 次签到
              </p>
            )}
          </div>
          <button
            aria-label="关闭"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => navigate("/")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-ink-2 active:bg-line"
          >
            <X size={20} strokeWidth={1.8} />
          </button>
        </div>
        {/* 步骤指示：3 个圆点，当前 clay-500 */}
        <div className="flex gap-1.5 px-5 pb-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-200",
                doneAt || i <= step ? "bg-clay-500" : "bg-line",
              )}
            />
          ))}
        </div>
      </div>

      {/* 步骤内容区（内部滚动） */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={doneAt ? "done" : step}
            initial={{ opacity: 0, x: 24 * dir }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 * dir }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* —— 完成态确认卡 —— */}
            {doneAt && doneDate && (
              <motion.div
                className="mt-2 flex flex-col items-center gap-2 rounded-[20px] bg-sage-100 p-6 text-center"
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { duration: 0.35 } }}
              >
                <CheckDraw size={40} />
                <motion.p
                  className="mt-1 text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.35, duration: 0.3 } }}
                >
                  已签到
                </motion.p>
                <motion.p
                  className="font-quote text-[17px] leading-[28px] tracking-[0.04em] text-ink"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.3 } }}
                >
                  “{quote}”——{periodOf(doneDate)} {format(doneDate, "HH:mm")} 的你
                </motion.p>
                <motion.p
                  className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.3 } }}
                >
                  命名情绪本身，就是在照顾它。
                </motion.p>
              </motion.div>
            )}

            {/* —— 第一步：情绪词网格 —— */}
            {!doneAt && step === 0 && (
              <div>
                <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                  哪一个词最接近此刻的你？
                </h2>
                <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                  凭直觉选，没有对错
                </p>
                {/* 象限切换 chips（横排可滚动） */}
                <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
                  {QUADRANTS.map((q) => (
                    <button
                      key={q.key}
                      onClick={() => {
                        setQuadrant(q.key);
                        setWord(null);
                      }}
                      className={cn(
                        "h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-[13px] leading-[18px] tracking-[0.02em] transition-all duration-200",
                        quadrant === q.key
                          ? "border-clay-500 bg-clay-100 text-ink"
                          : "border-transparent bg-paper-deep text-ink-2",
                      )}
                      style={quadrant === q.key ? { borderWidth: 1.5 } : undefined}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
                {/* 情绪词网格 */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quadrant}
                    className="mt-3 grid grid-cols-2 gap-3"
                    variants={gridVariants}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                  >
                    {qMeta.words.map((w) => {
                      const selected = word === w;
                      return (
                        <motion.button
                          key={w}
                          variants={chipVariants}
                          onClick={() => setWord(w)}
                          className={cn(
                            "flex h-11 items-center justify-center rounded-xl border text-[15px] leading-[24px] tracking-[0.01em] transition-all duration-200",
                            selected
                              ? cn("scale-[1.03] border-clay-500 text-ink", qMeta.positive ? "bg-sage-100" : "bg-dusk-100")
                              : "border-line bg-card text-ink-2",
                          )}
                          style={selected ? { borderWidth: 1.5 } : undefined}
                        >
                          {w}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* —— 第二步：整体状态评分 —— */}
            {!doneAt && step === 1 && (
              <div>
                <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                  今天整体状态如何？
                </h2>
                <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                  这一分会出现在你的仪表盘趋势里
                </p>
                <div className="mt-12 flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map((n, i) => {
                    const selected = score === n;
                    return (
                      <div key={n} className="relative">
                        <AnimatePresence>
                          {selected && (
                            <motion.span
                              className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] leading-[18px] tracking-[0.02em] text-clay-600"
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                              exit={{ opacity: 0, transition: { duration: 0.15 } }}
                            >
                              {SCORE_LABELS[n - 1]}
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <motion.button
                          aria-label={`${n} 分，${SCORE_LABELS[n - 1]}`}
                          onClick={() => setScore(n)}
                          className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full text-[15px] font-semibold tnum transition-colors duration-200",
                            selected ? "bg-clay-500 text-card" : "bg-paper-deep text-ink-2",
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: selected ? [1, 1.2, 1.1] : 1 }}
                          transition={
                            selected
                              ? { duration: 0.25 }
                              : { delay: i * 0.06, type: "spring", stiffness: 400, damping: 17 }
                          }
                        >
                          {n}
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex justify-between text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                  <span>很糟</span>
                  <span>很好</span>
                </div>
              </div>
            )}

            {/* —— 第三步：一句话自由命名 —— */}
            {!doneAt && step === 2 && (
              <div>
                <h2 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                  用一句话，说出它
                </h2>
                <p className="mt-1 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                  比如：“我有点累，但其实心里是踏实的。”
                </p>
                {/* 回显已选：情绪词 chip + 评分小圆点 */}
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => goStep(0)}
                    className={cn(
                      "flex h-9 items-center rounded-xl border border-clay-500 px-4 text-[13px] leading-[18px] tracking-[0.02em] text-ink",
                      qMeta.positive ? "bg-sage-100" : "bg-dusk-100",
                    )}
                    style={{ borderWidth: 1.5 }}
                  >
                    {word}
                  </button>
                  <div className="flex items-center gap-1.5" aria-label={`评分 ${score} 分`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={cn("h-2 w-2 rounded-full", n <= score ? "bg-clay-500" : "bg-line")}
                      />
                    ))}
                  </div>
                </div>
                {/* 多行输入（serif，自动撑高） */}
                <div className="relative mt-4">
                  <textarea
                    ref={noteRef}
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                    }}
                    onFocus={() => {
                      window.setTimeout(
                        () => noteRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }),
                        300,
                      );
                    }}
                    rows={3}
                    placeholder="此刻的我，感觉……"
                    className="font-quote min-h-[88px] w-full resize-none rounded-xl border border-line bg-card px-4 py-3.5 text-[17px] leading-[28px] tracking-[0.04em] text-ink outline-none transition-all duration-200 placeholder:text-ink-3 focus:border-clay-500 focus:shadow-[0_0_0_4px_#F1E5D8]"
                  />
                  <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
                    {note.length} 字
                  </span>
                </div>
                {note.trim().length === 0 && (
                  <p className="mt-2 text-[13px] leading-[18px] tracking-[0.02em] text-ink-3">
                    不想写也没关系，直接完成
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 底部固定按钮区（随键盘上抬） */}
      <div
        className="shrink-0 border-t border-line/60 px-5 pt-3"
        style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 16px + ${kb}px)` }}
      >
        {doneAt ? (
          <WarmButton className="w-full" onClick={() => navigate("/")}>
            回到今天
          </WarmButton>
        ) : (
          <div className="flex gap-3">
            {step > 0 && (
              <WarmButton variant="ghost" onClick={() => goStep(step - 1)}>
                上一步
              </WarmButton>
            )}
            <WarmButton
              className="flex-1"
              disabled={step === 0 && !word}
              loading={submitting}
              onClick={next}
            >
              {step === 2 ? "完成签到" : "下一步"}
            </WarmButton>
          </div>
        )}
      </div>
    </motion.div>
  );
}
