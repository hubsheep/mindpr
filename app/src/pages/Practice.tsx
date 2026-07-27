import { memo, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import CheckDraw from "@/components/CheckDraw";
import Sheet from "@/components/Sheet";
import WarmButton from "@/components/Button";
import { markPractice } from "@/db/hooks";
import { getTrainingDate } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * 呼吸练习全屏页（practice.md）
 * /practice/mindfulness：10 分钟正念，4 阶段文字引导 + 呼吸圆（吸 4s / 呼 6s）+ 倒计时
 * /practice/sigh：1 分钟循环叹息（双吸 1.0+0.6s / 长呼 6.4s × 7 循环），3s 准备页
 * 计时基于 Date.now() 差值，切后台不漂移；息屏 >30s 回来弹「重新计时」Sheet（无惩罚措辞）。
 * 完成时调用 markPractice 回写当日记录。
 */

const MIND_STAGES = [
  { name: "安顿", until: 120, text: "坐直，放松肩膀。注意身体与椅子接触的地方。" },
  { name: "观呼吸", until: 420, text: "跟着圆的节奏呼吸。走神了也没关系，发现走神，就是正念。" },
  { name: "身体扫描", until: 540, text: "从头顶到脚趾，慢慢地，把注意力走过一遍身体。" },
  { name: "收摄", until: 600, text: "回到呼吸。准备好后，带着这份安静回到今天。" },
] as const;

const MIND_TOTAL_MS = 10 * 60 * 1000;
const SIGH_PREP_MS = 3000;
const SIGH_CYCLES = 7;
const SIGH_CYCLE_MS = 8000; // 第一次吸 1.0s + 短吸 0.6s + 长呼 6.4s
const SIGH_TOTAL_MS = SIGH_CYCLES * SIGH_CYCLE_MS;

const SIGH_SCALES = [1.22, 1.38, 1] as const;
const SIGH_DURS = [1.0, 0.6, 6.4] as const;
const SIGH_LABELS = ["吸气—", "再吸一口—", "缓缓呼出——"] as const;

function fmtMMSS(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// ————————————————————————————
// 呼吸圆（页面内实现：共享 BreathingOrb 仅支持 clay 双色相位，叹息需灰绿三相位）
// 双层：内核实心 + 外晕 28% 透明 blur 24px 大 40%；reduced-motion 退化为透明度脉冲
// ————————————————————————————

interface OrbProps {
  color: string;
  size: number;
  scale: number;
  duration: number;
  /** 阶段切换脉冲 key（0 = 无脉冲） */
  pulseKey: number;
  /** 结束态：收缩停住 */
  settled: boolean;
  reduced: boolean;
}

const Orb = memo(function Orb({
  color,
  size,
  scale,
  duration,
  pulseKey,
  settled,
  reduced,
}: OrbProps) {
  const target = settled ? 0.85 : scale;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* 阶段开始的柔和扩散脉冲（无音频的铃声替代，practice.md §3） */}
      <AnimatePresence>
        {pulseKey > 0 && !settled && (
          <motion.span
            key={pulseKey}
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ scale: 1.4, opacity: 0.35 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>
      <motion.div
        className="absolute inset-0"
        animate={
          reduced
            ? { scale: settled ? 0.85 : 1, opacity: settled || scale > 1.01 ? 1 : 0.6 }
            : { scale: target, opacity: 1 }
        }
        transition={{ duration: settled ? 0.6 : duration, ease: "easeInOut" }}
      >
        {/* 外晕：同色 28%，blur 24px，比内核大 40% */}
        <span
          className="absolute rounded-full blur-[24px]"
          style={{ inset: -size * 0.2, backgroundColor: color, opacity: 0.28 }}
        />
        {/* 内核 */}
        <span className="absolute inset-0 rounded-full" style={{ backgroundColor: color }} />
      </motion.div>
    </div>
  );
});

export default function Practice() {
  const { type } = useParams();
  const navigate = useNavigate();
  const reduced = useReducedMotion() ?? false;
  const isSigh = type === "sigh";
  const valid = type === "mindfulness" || isSigh;

  const [phase, setPhase] = useState<"prep" | "run" | "done">(isSigh ? "prep" : "run");
  const [prepElapsed, setPrepElapsed] = useState(0);
  const [runElapsed, setRunElapsed] = useState(0);
  const [runId, setRunId] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [driftOpen, setDriftOpen] = useState(false);
  const [checkVisible, setCheckVisible] = useState(false);
  const [landscape, setLandscape] = useState(false);

  const startRef = useRef(0);
  const markedRef = useRef(false);
  const blockFinishRef = useRef(false);
  const hiddenAtRef = useRef<number | null>(null);
  const leavingRef = useRef(false);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const totalMs = isSigh ? SIGH_TOTAL_MS : MIND_TOTAL_MS;

  // 非法类型回今日页
  useEffect(() => {
    if (!valid) navigate("/", { replace: true });
  }, [valid, navigate]);

  // 横屏检测（practice.md §5：横屏圆缩至 140px）
  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const update = () => setLandscape(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 拦截系统返回：压入哨兵历史项，popstate 时重新压入并弹确认 Sheet
  useEffect(() => {
    if (!valid) return;
    window.history.pushState(null, "", window.location.href);
    const onPop = () => {
      if (leavingRef.current) {
        navigate("/", { replace: true });
        return;
      }
      window.history.pushState(null, "", window.location.href);
      if (phaseRef.current !== "done") setConfirmOpen(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [valid, navigate]);

  // 叹息 3s 准备页（自动开始，不可跳过）
  useEffect(() => {
    if (!valid || !isSigh || phase !== "prep") return;
    const t0 = Date.now();
    const id = window.setInterval(() => {
      const e = Date.now() - t0;
      setPrepElapsed(e);
      if (e >= SIGH_PREP_MS) setPhase("run");
    }, 200);
    return () => window.clearInterval(id);
  }, [valid, isSigh, phase]);

  // 主计时：Date.now() 差值，切后台回来不漂移（practice.md §5）
  useEffect(() => {
    if (!valid || phase !== "run") return;
    startRef.current = Date.now();
    setRunElapsed(0);
    const id = window.setInterval(() => {
      setRunElapsed(Date.now() - startRef.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [valid, phase, runId]);

  // 完成回写（防重复）
  const finish = () => {
    setPhase("done");
    if (markedRef.current) return;
    markedRef.current = true;
    const date = getTrainingDate();
    if (isSigh) void markPractice(date, "sigh");
    else void markPractice(date, "mindfulness", 10);
  };

  useEffect(() => {
    if (phase === "run" && runElapsed >= totalMs && !blockFinishRef.current) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, runElapsed, totalMs]);

  // 结束态：圆停住 600ms 后绘出 ✓
  useEffect(() => {
    if (phase !== "done") return;
    const id = window.setTimeout(() => setCheckVisible(true), 600);
    return () => window.clearTimeout(id);
  }, [phase]);

  // 息屏 >30s 回来：弹「重新计时」Sheet
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      const h = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (h && phaseRef.current === "run" && Date.now() - h > 30000) {
        blockFinishRef.current = true;
        setDriftOpen(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const leave = () => {
    leavingRef.current = true;
    window.history.back(); // 弹出哨兵项，popstate 中 replace 到今日页
  };

  if (!valid) return null;

  // —— 派生状态 ——
  const sec = runElapsed / 1000;
  const stageIdxRaw = MIND_STAGES.findIndex((s) => sec < s.until);
  const stageIdx = stageIdxRaw === -1 ? MIND_STAGES.length - 1 : stageIdxRaw;
  const stage = MIND_STAGES[stageIdx];
  const inhaling = sec % 10 < 4;

  const within = runElapsed % SIGH_CYCLE_MS;
  const sighPhase = within < 1000 ? 0 : within < 1600 ? 1 : 2;
  const cycle = Math.min(SIGH_CYCLES, Math.floor(runElapsed / SIGH_CYCLE_MS) + 1);

  const orbColor = isSigh ? "#8FA08A" : "#AE7E5E";
  const orbSize = landscape ? 140 : 200;
  const orbScale = isSigh ? SIGH_SCALES[sighPhase] : inhaling ? 1.35 : 1;
  const orbDur = isSigh ? SIGH_DURS[sighPhase] : inhaling ? 4 : 6;
  const instruction = isSigh
    ? SIGH_LABELS[sighPhase]
    : inhaling
      ? "吸气…"
      : "呼气…";

  const running = phase === "run";

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex min-h-[100dvh] flex-col",
        isSigh ? "bg-[#F0EFE6]" : "bg-paper", // 叹息底：sage-100 40% 混合 paper
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.24 } }}
    >
      {/* 顶部条 56px：关闭钮 + 阶段指示 */}
      <div
        className="flex h-14 shrink-0 items-center justify-between gap-2 px-5"
        style={{ marginTop: "env(safe-area-inset-top)" }}
      >
        <button
          aria-label="关闭"
          onClick={() => (phase === "done" ? leave() : setConfirmOpen(true))}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-paper-deep text-ink-2 active:bg-line"
        >
          <X size={20} strokeWidth={1.8} />
        </button>
        {running && (
          <span className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
            {isSigh ? "1 分钟" : `阶段 ${stageIdx + 1}/${MIND_STAGES.length}`}
          </span>
        )}
        {!running && <span className="w-11" aria-hidden />}
      </div>

      {/* 中央区：视觉中心偏上 12% */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-[12vh]">
        {phase === "prep" ? (
          /* 叹息准备页 */
          <motion.div
            key="prep"
            className="flex flex-col items-center gap-4 px-8 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
          >
            <h1 className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
              循环叹息
            </h1>
            <p className="max-w-[300px] text-[16px] leading-[26px] tracking-[0.01em] text-ink-2">
              用鼻子吸气两次，用嘴长长地呼一次。这是身体自带的重置键。
            </p>
            <p className="text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
              {Math.max(1, Math.ceil((SIGH_PREP_MS - prepElapsed) / 1000))} 秒后开始
            </p>
          </motion.div>
        ) : (
          <>
            {/* 呼吸圆（入场 scale .6→1 600ms soft-out） */}
            <motion.div
              className="relative"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              }}
            >
              <Orb
                color={orbColor}
                size={orbSize}
                scale={running ? orbScale : 1}
                duration={orbDur}
                pulseKey={!isSigh && running ? stageIdx : 0}
                settled={phase === "done"}
                reduced={reduced}
              />
              {/* 结束态：圆心绘出 sage ✓ */}
              {checkVisible && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckDraw size={44} />
                </div>
              )}
            </motion.div>

            {/* 呼吸指令 Caption（200ms 交叉淡变） */}
            <div className="mt-8 h-[26px]">
              {running && (
                <AnimatePresence mode="wait">
                  <motion.p
                    key={instruction}
                    className={cn(
                      "text-center text-[16px] leading-[26px] text-ink-2",
                      isSigh && sighPhase === 2 ? "tracking-[0.12em]" : "tracking-[0.01em]",
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  >
                    {instruction}
                  </motion.p>
                </AnimatePresence>
              )}
            </div>

            {/* 阶段引导文字（正念） */}
            <div className="mt-2 min-h-[76px] max-w-[320px] px-5 text-center">
              {running && !isSigh && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stageIdx}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.3 } }}
                    exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
                  >
                    <p className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                      {stage.name}
                    </p>
                    <p className="mt-1 text-[16px] leading-[26px] tracking-[0.01em] text-ink-2">
                      {stage.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* 倒计时 Numeral / 循环计数 */}
            <div className="mt-4 h-[64px]">
              {running && !isSigh && (
                <motion.p
                  className="text-center text-[56px] font-extralight leading-[64px] text-ink tnum"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.3 } }}
                >
                  {fmtMMSS(MIND_TOTAL_MS - runElapsed)}
                </motion.p>
              )}
              {running && isSigh && (
                <p className="text-center text-[13px] leading-[18px] tracking-[0.02em] text-ink-3 tnum">
                  第 {cycle} / {SIGH_CYCLES} 次呼吸
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* 结束态：文案 + 主按钮 */}
      <div className="shrink-0 px-5 pb-[calc(env(safe-area-inset-bottom)+24px)]">
        <AnimatePresence>
          {phase === "done" && (
            <motion.div
              className="flex flex-col items-center gap-1 text-center"
              initial={{ opacity: 0, y: 16 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: isSigh ? 0.2 : 0.4, delay: isSigh ? 0.3 : 0.6 },
              }}
            >
              <p className="text-[17px] font-semibold leading-[24px] tracking-[0.01em] text-ink">
                {isSigh ? "重置完成" : "十分钟，完成了"}
              </p>
              <p className="mb-4 text-[13px] leading-[18px] tracking-[0.02em] text-ink-2">
                {isSigh ? "神经系统刚刚慢了下来。回到今天吧。" : "这是你今天的安静时刻"}
              </p>
              <WarmButton className="w-full" onClick={leave}>
                完成并返回
              </WarmButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 离开确认 Sheet */}
      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="离开练习？"
        footer={
          <div className="flex gap-3">
            <WarmButton variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
              继续练习
            </WarmButton>
            <WarmButton variant="destructive" className="flex-1" onClick={leave}>
              离开
            </WarmButton>
          </div>
        }
      >
        <p className="pb-2 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
          练习进行到一半，确定要离开吗？本次不计入完成。
        </p>
      </Sheet>

      {/* 息屏漂移 Sheet（无惩罚措辞） */}
      <Sheet
        open={driftOpen}
        onClose={() => {
          blockFinishRef.current = false;
          setDriftOpen(false);
        }}
        title="刚才离开了练习"
        footer={
          <div className="flex gap-3">
            <WarmButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                blockFinishRef.current = false;
                setDriftOpen(false);
                finish(); // 按已完成计：回写并进入结束态
              }}
            >
              按已完成计
            </WarmButton>
            <WarmButton
              className="flex-1"
              onClick={() => {
                blockFinishRef.current = false;
                setDriftOpen(false);
                setRunId((n) => n + 1); // 重新计时
              }}
            >
              重新开始
            </WarmButton>
          </div>
        }
      >
        <p className="pb-2 text-[15px] leading-[24px] tracking-[0.01em] text-ink-2">
          刚才离开了练习，要重新计时吗？
        </p>
      </Sheet>
    </motion.div>
  );
}
