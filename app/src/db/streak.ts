import { format, addDays, parseISO } from "date-fns";
import {
  db,
  getTrainingDate,
  getWeekId,
  type DailyEntry,
  type StreakState,
} from "./schema";

/**
 * streak / freeze 引擎
 * —— 纯函数判定 + kv 持久化。
 *
 * 规则（today.md §2 / design.md §9）：
 * 1. 每天完成三段回路（晨/日/晚每段至少一项）即点亮一天；
 * 2. 每周自动获得 2 枚补位筹码（freeze），断签时自动补上，不清零；
 * 3. 累计天数（totalDays）永远保留，休息不会失去它；
 * 4. freeze 自动补位无打扰，仅在次日 Toast 轻声告知；
 * 5. 断签无 freeze 时 current 归零 + pendingRecovery（慈悲卡），绝不惩罚。
 */

export const STREAK_KV_KEY = "streak";
/** 每周 freeze 数量 */
export const WEEKLY_FREEZES = 2;

/** 默认状态（首运） */
export function defaultStreakState(): StreakState {
  return {
    current: 0,
    totalDays: 0,
    lastLitDate: null,
    freezesUsedThisWeek: 0,
    freezeWeekId: null,
    pendingRecovery: false,
    pendingFreezeToast: 0,
    hasAnyRecord: false,
  };
}

// ————————————————————————————
// 纯函数：点亮判定
// ————————————————————————————

/** 三段各自是否完成（每段至少一项） */
export function entrySegments(entry: DailyEntry): {
  morning: boolean;
  day: boolean;
  evening: boolean;
} {
  return {
    morning: entry.intentionDone || entry.mindfulnessDone,
    day: entry.sighDone || entry.checkinDone,
    evening: entry.todoDone || entry.gratitudeDone,
  };
}

/** 当日核心回路是否点亮：三段各至少完成 1 项（6 项全满不是条件） */
export function isDayLit(entry: DailyEntry | undefined | null): boolean {
  if (!entry) return false;
  const s = entrySegments(entry);
  return s.morning && s.day && s.evening;
}

/** 6 圆点进度：[意图, 正念, 叹息, 签到, to-do, 好事] */
export function entryDots(entry: DailyEntry | undefined | null): boolean[] {
  if (!entry) return [false, false, false, false, false, false];
  return [
    entry.intentionDone,
    entry.mindfulnessDone,
    entry.sighDone,
    entry.checkinDone,
    entry.todoDone,
    entry.gratitudeDone,
  ];
}

/** 两日期字符串之间逐日枚举（含 start 不含 end），'yyyy-MM-dd' */
export function* daysBetween(start: string, end: string): Generator<string> {
  let d = parseISO(start);
  const last = parseISO(end);
  while (d < last) {
    yield format(d, "yyyy-MM-dd");
    d = addDays(d, 1);
  }
}

// ————————————————————————————
// 纯函数：状态推进（不碰数据库，便于测试）
// ————————————————————————————

export interface ReconcileResult {
  state: StreakState;
  /** 本次推进中新消耗 freeze 的天数 */
  freezesConsumed: number;
  /** 是否发生了无 freeze 的断签 */
  broke: boolean;
}

/**
 * 给定逐日点亮表，把 state 从 lastLitDate 推进到 yesterday（不含今天）。
 * @param litMap 日期 → 是否点亮（缺省视为未点亮）
 */
export function reconcileStreak(
  input: StreakState,
  litMap: Record<string, boolean>,
  today: string,
): ReconcileResult {
  const state: StreakState = { ...input };
  let freezesConsumed = 0;
  let broke = false;

  // 每周一重置 freeze 计数
  const thisWeek = getWeekId(today);
  if (state.freezeWeekId !== thisWeek) {
    state.freezeWeekId = thisWeek;
    state.freezesUsedThisWeek = 0;
  }

  if (state.lastLitDate === null) return { state, freezesConsumed, broke };

  const from = format(addDays(parseISO(state.lastLitDate), 1), "yyyy-MM-dd");
  for (const date of daysBetween(from, today)) {
    // 跨周时重置 freeze
    const wk = getWeekId(date);
    if (state.freezeWeekId !== wk) {
      state.freezeWeekId = wk;
      state.freezesUsedThisWeek = 0;
    }

    if (litMap[date]) {
      // 这一天点亮了
      state.current += 1;
      state.totalDays += 1;
      state.lastLitDate = date;
    } else if (state.freezesUsedThisWeek < WEEKLY_FREEZES) {
      // 自动补位：不清零，次日 Toast 轻声告知
      state.freezesUsedThisWeek += 1;
      state.current += 1; // freeze 维持连续天数
      state.lastLitDate = date; // 占位，继续向后推进
      freezesConsumed += 1;
      state.pendingFreezeToast += 1;
    } else {
      // 断签且无 freeze：current 归零，累计保留，进入慈悲恢复态
      state.current = 0;
      state.lastLitDate = null;
      state.pendingRecovery = true;
      broke = true;
      break; // 之后的点亮日由后续推进重新累计
    }
  }
  return { state, freezesConsumed, broke };
}

// ————————————————————————————
// 持久化
// ————————————————————————————

/** 读取 streak 状态（无记录返回默认） */
export async function loadStreakState(): Promise<StreakState> {
  const rec = await db.kv.get(STREAK_KV_KEY);
  return (rec?.value as StreakState | undefined) ?? defaultStreakState();
}

export async function saveStreakState(state: StreakState): Promise<void> {
  await db.kv.put({ key: STREAK_KV_KEY, value: state });
}

export interface SyncResult {
  state: StreakState;
  /** 本次调用中「今天」刚被点亮（触发庆祝动效） */
  justLitToday: boolean;
}

/**
 * 引擎入口：每次进入今日页 / 完成任意练习后调用。
 * 1. 用 daily_entries 把状态推进到昨天（补位/断签结算）；
 * 2. 检查今天是否点亮，点亮则入账并返回 justLitToday=true。
 */
export async function syncStreak(today: string = getTrainingDate()): Promise<SyncResult> {
  const state = await loadStreakState();

  // 推进到昨天为止
  const entries = await db.daily_entries.toArray();
  if (entries.length > 0) state.hasAnyRecord = true;
  const litMap: Record<string, boolean> = {};
  for (const e of entries) litMap[e.date] = isDayLit(e);

  let result = reconcileStreak(state, litMap, today);

  // 断签归零后，昨天的循环里漏掉的点亮日需要重新推进一次（恢复累计）
  if (result.state.lastLitDate === null && result.state.pendingRecovery) {
    // 找最近一次点亮日作为新锚点
    const litDates = entries
      .filter((e) => isDayLit(e) && e.date < today)
      .map((e) => e.date)
      .sort();
    if (litDates.length > 0) {
      const anchor = litDates[litDates.length - 1];
      result = reconcileStreak(
        { ...result.state, lastLitDate: anchor, current: 1, totalDays: result.state.totalDays },
        litMap,
        today,
      );
    }
  }

  // 今天是否点亮
  let justLitToday = false;
  const todayEntry = entries.find((e) => e.date === today);
  if (isDayLit(todayEntry) && result.state.lastLitDate !== today) {
    result.state.current += 1;
    result.state.totalDays += 1;
    result.state.lastLitDate = today;
    result.state.pendingRecovery = false; // 完成任意回路即收起慈悲卡
    justLitToday = true;
  }

  await saveStreakState(result.state);
  return { state: result.state, justLitToday };
}

/** 消费「freeze 补位」Toast：读取次数并清零（返回 0 表示无需提示） */
export async function consumeFreezeToast(): Promise<number> {
  const state = await loadStreakState();
  const n = state.pendingFreezeToast;
  if (n > 0) {
    state.pendingFreezeToast = 0;
    await saveStreakState(state);
  }
  return n;
}

/** 慈悲卡展示完毕后调用：标记已迎接（24h 内不再重复） */
export async function dismissRecovery(): Promise<void> {
  const state = await loadStreakState();
  if (state.pendingRecovery) {
    state.pendingRecovery = false;
    await saveStreakState(state);
  }
}

/** kv 通用读写（设置页等使用） */
export async function kvGet<T>(key: string): Promise<T | undefined> {
  const rec = await db.kv.get(key);
  return rec?.value as T | undefined;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}
